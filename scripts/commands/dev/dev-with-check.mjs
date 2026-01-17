#!/usr/bin/env node

/**
 * dev:all 包装脚本
 * 在启动所有应用之前检查端口占用情况
 * 集成错误监听和自动上报功能
 */
import { logger } from '../../utils/logger.mjs';

import { getRootDir } from '../../utils/path-helper.mjs';
import { runTurbo } from '../../utils/turbo-helper.mjs';
import { interceptCommand } from '../skills/command-interceptor.mjs';
import { checkAndKillPorts } from './port-manager.mjs';
import { DevErrorListener } from '../skills/dev-error-listener.mjs';
import { reportError } from '../skills/dev-error-reporter.mjs';
import { initDatabase } from '../skills/database/init.mjs';
import { getMonitorServer } from '../skills/dev-error-monitor-server.mjs';
import { ensureSnapshotDir, getSnapshotDir, initSnapshotManager } from '../../utils/heap-snapshot-manager.mjs';
import { startMonitoring, stopMonitoring } from '../../utils/memory-monitor.mjs';

const rootDir = getRootDir();

// 初始化堆快照目录
try {
  ensureSnapshotDir();
} catch (error) {
  logger.warn('⚠️  堆快照目录初始化失败，OOM 诊断功能可能不可用:', error.message);
}

// 配置 Node.js 内存诊断参数
// 注意：很多诊断参数（如 --heap-dump-on-out-of-memory、--trace-gc）不能通过 NODE_OPTIONS 传递
// 只能在启动时直接作为 node 参数传递
// 对于通过 turbo 启动的子进程，我们只能传递 --max-old-space-size（这是唯一允许的内存相关参数）
const snapshotDir = getSnapshotDir();
// 只传递允许在 NODE_OPTIONS 中使用的参数（仅内存限制）
const nodeOptions = '--max-old-space-size=4096';

/**
 * 检查端口占用情况并自动停止Node.js进程
 */
function checkPorts() {
  try {
    const result = checkAndKillPorts(true); // 自动停止
    
    if (result.hasOccupied && result.killedCount === 0) {
      // 有占用但无法自动停止（可能是系统进程）
      logger.warn('\n⚠️  部分端口被占用且无法自动停止，请手动处理\n');
      // 不退出，让用户决定是否继续
    } else if (result.killedCount > 0) {
      logger.info(`\n✅ 已清理 ${result.killedCount} 个占用端口的Node.js进程，可以继续启动\n`);
    }
  } catch (error) {
    logger.error('端口检查失败:', error);
    // 不退出，让启动继续
  }
}

/**
 * 检查并构建共享包（如果需要）
 */
async function ensureSharedPackagesBuilt() {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const { spawn } = await import('child_process');
  
  // 需要构建的包列表（按依赖顺序）
  const packagesToBuild = [
    '@btc/vite-plugin',
    '@btc/shared-core',
    '@btc/shared-components',
    '@btc/shared-router'
  ];
  
  const packagesToCheck = [
    { name: '@btc/vite-plugin', dist: join(rootDir, 'packages', 'vite-plugin', 'dist', 'index.mjs') },
    { name: '@btc/shared-core', dist: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs') },
    { name: '@btc/shared-components', dist: join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs') },
    { name: '@btc/shared-router', dist: join(rootDir, 'packages', 'shared-router', 'dist', 'index.mjs') }
  ];
  
  // 检查哪些包需要构建
  const packagesNeedingBuild = packagesToCheck.filter(pkg => !existsSync(pkg.dist));
  
  if (packagesNeedingBuild.length > 0) {
    logger.info(`📦 检测到 ${packagesNeedingBuild.length} 个共享包未构建，正在构建...`);
    logger.info(`   需要构建: ${packagesNeedingBuild.map(p => p.name).join(', ')}`);
    
    // 按顺序构建所有需要的包
    for (const pkg of packagesNeedingBuild) {
      try {
        logger.info(`   正在构建 ${pkg.name}...`);
        await new Promise((resolve, reject) => {
          const buildProcess = spawn('pnpm', ['--filter', pkg.name, 'run', 'build'], {
            cwd: rootDir,
            stdio: 'inherit',
            shell: false
          });
          
          buildProcess.on('close', (code) => {
            if (code === 0) {
              logger.info(`   ✅ ${pkg.name} 构建完成`);
              resolve();
            } else {
              reject(new Error(`${pkg.name} 构建失败，退出码: ${code}`));
            }
          });
          
          buildProcess.on('error', (err) => {
            reject(err);
          });
        });
      } catch (error) {
        logger.warn(`   ⚠️  ${pkg.name} 构建失败: ${error.message}`);
        logger.warn(`      将继续尝试启动，如果失败请手动运行: pnpm --filter ${pkg.name} run build`);
      }
    }
    
    logger.info('✅ 共享包构建检查完成\n');
  }
}

/**
 * 运行 turbo dev:all（带错误监听）
 */
async function runDevAll() {
  // 确保共享包已构建
  await ensureSharedPackagesBuilt();
  
  // 确保数据库已初始化
  try {
    initDatabase();
  } catch (error) {
    logger.warn('数据库初始化失败，错误监听功能可能不可用:', error.message);
  }

  // 初始化堆快照管理器
  try {
    initSnapshotManager();
  } catch (error) {
    logger.warn('堆快照管理器初始化失败:', error.message);
  }

  // 启动内存监控
  let memoryMonitor = null;
  try {
    memoryMonitor = startMonitoring({
      interval: 5000, // 每 5 秒监控一次
      maxHeapSize: 4096 * 1024 * 1024, // 4GB
      onWarning: ({ name, memUsage, threshold }) => {
        logger.warn(`[内存监控] ⚠️  ${name} 内存使用超过 ${(threshold.usagePercent * 100).toFixed(1)}%`);
      },
      onCritical: ({ name, memUsage, threshold }) => {
        logger.error(`[内存监控] 🚨 ${name} 内存使用严重超限 ${(threshold.usagePercent * 100).toFixed(1)}%，可能即将 OOM！`);
      }
    });
    logger.info('📊 内存监控已启动，每 5 秒输出一次内存使用情况');
  } catch (error) {
    logger.warn('内存监控启动失败:', error.message);
  }
  
  // 连接到已存在的监控服务器（如果不存在则尝试启动）
  const monitorServer = getMonitorServer({ port: 3001 });
  if (!monitorServer.server) {
    // 监控服务器未启动，尝试启动（但通常应该由独立的监控服务管理）
    try {
      monitorServer.start();
      logger.info(`📊 错误监控界面: ${monitorServer.getUrl()}`);
    } catch (error) {
      // 如果端口被占用，说明监控服务已在运行
      logger.info(`📊 错误监控界面: ${monitorServer.getUrl()} (已运行)`);
    }
  } else {
    logger.info(`📊 已连接到错误监控服务器: ${monitorServer.getUrl()}`);
  }
  
  // 创建错误监听器
  const errorListener = new DevErrorListener({
    minSeverity: 'warning', // 最低报告警告级别
    autoReport: true,
    reportThreshold: 1, // 出现1次就上报
    debounceMs: 3000 // 3秒防抖
  });
  
  // 监听上报事件
  errorListener.on('report', async (error, dbRecord) => {
    logger.info(`\n🔔 检测到需要上报的错误: ${error.errorType} - ${error.packageName || '未知'}\n`);
    try {
      // 使用监控服务器上报（而不是 Cursor）
      await reportError(error, dbRecord, { useCursor: false });
    } catch (reportError) {
      logger.error('上报错误失败:', reportError);
    }
  });
  
  // 监听错误事件（避免未处理的错误）
  errorListener.on('error', (errorData) => {
    // 真正的错误已经被处理，这里只是确保事件被监听，避免未处理的错误
    // 实际处理逻辑在 'report' 事件中
  });
  
  // 监听警告事件（可选，用于调试）
  errorListener.on('warning', (warningData) => {
    // 警告信息已经被记录到数据库，这里可以添加额外的处理逻辑
    // 例如：只在调试模式下输出
    if (process.env.DEBUG) {
      logger.debug(`[警告] ${warningData.errorMessage}`);
    }
  });
  
  // 启动监听器
  errorListener.start();
  
  // 使用自定义的 runTurboWithListener
  const args = ['run', 'dev', '--concurrency=30', '--filter=!@btc/mobile-app'];
  
  logger.info('🚀 启动所有应用的开发服务器（已排除移动应用）...\n');
  logger.info('📡 错误监听已启用，将自动检测并上报问题\n');
  logger.info(`📊 内存诊断已启用: 堆快照目录=${snapshotDir}\n`);
  
  const code = await runTurboWithListener(args, errorListener, monitorServer, {
    cwd: rootDir,
    memoryMonitor: memoryMonitor // 传递 memoryMonitor 给清理函数
  });
  
  // 停止监听器（但不停止监控服务器，因为它可能被其他命令使用）
  errorListener.stop();
  // 注意：不再停止监控服务器，因为它应该独立运行
  // monitorServer.stop();

  // 停止内存监控
  if (memoryMonitor) {
    memoryMonitor.stop();
    const report = memoryMonitor.getHistory();
    if (report && report.length > 0) {
      const lastRecord = report[report.length - 1];
      const heapUsedMB = (lastRecord.heapUsed / 1024 / 1024).toFixed(2);
      logger.info(`\n📊 内存监控统计: 最后记录 - ${lastRecord.name} 内存使用 ${heapUsedMB} MB`);
    }
  }
  
  // 显示统计信息
  const stats = errorListener.getStats();
  if (stats.total > 0) {
    logger.info(`\n📊 错误统计: 总计 ${stats.total} 个，严重 ${stats.critical} 个，错误 ${stats.errors} 个，警告 ${stats.warnings} 个`);
    logger.info(`   已上报: ${stats.reported} 个，已解决: ${stats.resolved} 个\n`);
  }
  
  // 返回退出码，让拦截器处理
  if (code !== 0) {
    throw new Error(`Turbo命令执行失败，退出码: ${code}`);
  }
  
  return { success: true, code };
}

/**
 * 运行 turbo 命令并监听输出
 * @param {string[]} args - turbo 参数
 * @param {DevErrorListener} errorListener - 错误监听器
 * @param {DevErrorMonitorServer} monitorServer - 监控服务器
 * @param {object} options - 选项
 */
async function runTurboWithListener(args, errorListener, monitorServer, options = {}) {
  const { memoryMonitor } = options;
  const { spawn } = await import('child_process');
  const { existsSync, readdirSync } = await import('fs');
  const { join } = await import('path');
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  
  return new Promise((resolve, reject) => {
    // 查找 turbo 路径（复制自 turbo-helper.mjs）
    const rootNodeModules = join(rootDir, 'node_modules');
    const isWindows = process.platform === 'win32';
    let turboPath = null;
    
    // 首先尝试在 pnpm 的 .pnpm 目录中查找
    const pnpmDir = join(rootNodeModules, '.pnpm');
    if (existsSync(pnpmDir)) {
      try {
        const entries = readdirSync(pnpmDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('turbo@')) {
            const possiblePaths = [
              join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo.js'),
              join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo'),
            ];
            for (const possiblePath of possiblePaths) {
              if (existsSync(possiblePath)) {
                turboPath = possiblePath;
                break;
              }
            }
            if (turboPath) break;
          }
        }
      } catch (error) {
        // 忽略错误，继续查找
      }
    }
    
    // 尝试直接在 node_modules 中查找
    if (!turboPath) {
      const possiblePaths = [
        join(rootNodeModules, 'turbo', 'bin', 'turbo.js'),
        join(rootNodeModules, 'turbo', 'bin', 'turbo'),
      ];
      for (const possiblePath of possiblePaths) {
        if (existsSync(possiblePath)) {
          turboPath = possiblePath;
          break;
        }
      }
    }
    
    // 尝试使用 require.resolve
    if (!turboPath) {
      try {
        turboPath = require.resolve('turbo/bin/turbo.js');
      } catch (e) {
        try {
          turboPath = require.resolve('turbo/bin/turbo');
        } catch (e2) {
          // 仍然找不到
        }
      }
    }
    
    if (!turboPath) {
      reject(new Error('Cannot find turbo. Please run: pnpm install'));
      return;
    }
    
    // 在 Windows 上，清除 NODE_PATH 以避免长度限制问题
    const env = { ...process.env };
    if (isWindows) {
      delete env.NODE_PATH;
    }
    
    // 添加 Node.js 内存诊断参数
    env.NODE_OPTIONS = nodeOptions;
    
    const child = spawn('node', [turboPath, ...args], {
      cwd: options.cwd || rootDir,
      stdio: ['inherit', 'pipe', 'pipe'], // stdin 继承，stdout/stderr 使用 pipe
      shell: false,
      env: { ...env, ...options.env },
    });
    
    // 定义日志监听函数（便于后续移除，防止内存泄漏）
    const onStdoutData = (chunk) => {
      // 转发到控制台
      process.stdout.write(chunk);
      // 发送给错误监听器
      errorListener.processChunk(chunk, 'stdout');
    };

    const onStderrData = (chunk) => {
      // 转发到控制台
      process.stderr.write(chunk);
      // 发送给错误监听器
      errorListener.processChunk(chunk, 'stderr');
    };
    
    // 监听 stdout
    child.stdout.on('data', onStdoutData);
    
    // 监听 stderr
    child.stderr.on('data', onStderrData);
    
    child.on('close', async (code) => {
      // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
      child.stdout.removeListener('data', onStdoutData);
      child.stderr.removeListener('data', onStderrData);
      child.removeAllListeners();
      
      // 刷新监听器缓冲区
      await errorListener.flush();
      resolve(code || 0);
    });
    
    child.on('error', (err) => {
      logger.error('Failed to start turbo:', err);
      
      // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
      child.stdout.removeListener('data', onStdoutData);
      child.stderr.removeListener('data', onStderrData);
      child.removeAllListeners();
      
      errorListener.stop();
      // 注意：不要停止监控服务器，因为它可能被其他命令使用
      // monitorServer.stop();
      reject(err);
    });
    
  // 处理进程退出
  const cleanup = () => {
    try {
      if (child && !child.killed) {
        // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
        try {
          child.stdout.removeListener('data', onStdoutData);
          child.stderr.removeListener('data', onStderrData);
          child.removeAllListeners();
        } catch (e) {
          // 忽略错误
        }
        child.kill('SIGTERM');
      }
      if (errorListener) {
        errorListener.stop();
      }
      // 停止内存监控（添加安全检查）
      if (memoryMonitor && typeof memoryMonitor.stop === 'function') {
        try {
          memoryMonitor.stop();
        } catch (e) {
          // 忽略停止时的错误
        }
      }
      // 注意：不要停止监控服务器，因为它可能被其他命令使用
      // monitorServer.stop();
    } catch (error) {
      // 清理函数中的错误不应该导致进程崩溃，静默处理
      console.error('清理函数执行错误:', error.message);
    }
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  });
}

// 主逻辑：先检查端口，再启动（自动记录dev-workflow skill执行）
(async () => {
  try {
    // 对于长期运行命令，interceptCommand 会异步执行命令，不需要再次执行
    const result = await interceptCommand('dev:all', async () => {
      checkPorts();
      return await runDevAll();
    }, {
      context: {
        description: '启动所有应用的开发服务器'
      },
      longRunning: true // 标记为长期运行命令
    });
    
    // 如果是长期运行命令，拦截器已异步执行，这里只需要等待（不退出）
    if (result && result.longRunning) {
      logger.info('✅ 开发服务器启动中，skill执行已记录...');
      // 不退出，让服务器继续运行
      // interceptCommand 已经异步执行了命令，不需要再次执行
    } else {
      // 短期命令，等待完成
      await result;
    }
  } catch (error) {
    logger.error('❌ 启动失败:', error);
    process.exit(1);
  }
})();

