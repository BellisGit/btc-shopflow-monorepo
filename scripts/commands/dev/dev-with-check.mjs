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
// 动态导入数据库初始化（避免 better-sqlite3 未安装时导致启动失败）
// import { initDatabase } from '../skills/database/init.mjs';
// 注意：不再使用监控服务器（3001端口已废弃）
// import { getMonitorServer } from '../skills/dev-error-monitor-server.mjs';
import { ensureSnapshotDir, getSnapshotDir, initSnapshotManager } from '../../utils/heap-snapshot-manager.mjs';
import { startMonitoring, stopMonitoring } from '../../utils/memory-monitor.mjs';

const rootDir = getRootDir();

// 初始化堆快照目录（静默初始化，不输出日志）
try {
  ensureSnapshotDir();
} catch (error) {
  // 静默失败，不输出日志
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
      logger.warn('⚠️  部分端口被占用且无法自动停止，请手动处理');
      // 不退出，让用户决定是否继续
    } else if (result.killedCount > 0) {
      // 静默清理，不输出日志
    }
  } catch (error) {
    // 静默失败，不输出日志
    // 不退出，让启动继续
  }
}

/**
 * 等待文件稳定（文件大小不再变化）
 */
async function waitForFileStable(filePath, maxWaitMs = 5000, checkIntervalMs = 200) {
  const { existsSync, statSync } = await import('fs');
  
  if (!existsSync(filePath)) {
    return false;
  }
  
  let lastSize = statSync(filePath).size;
  let stableCount = 0;
  const requiredStableChecks = 3; // 需要连续3次检查大小不变才认为稳定
  
  for (let waited = 0; waited < maxWaitMs; waited += checkIntervalMs) {
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    
    if (!existsSync(filePath)) {
      return false;
    }
    
    const currentSize = statSync(filePath).size;
    if (currentSize === lastSize) {
      stableCount++;
      if (stableCount >= requiredStableChecks) {
        return true; // 文件已稳定
      }
    } else {
      stableCount = 0; // 文件还在变化，重置计数
      lastSize = currentSize;
    }
  }
  
  // 超时，但文件存在，返回 true（可能文件很大，需要更长时间）
  return existsSync(filePath);
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
    { 
      name: '@btc/vite-plugin', 
      dist: join(rootDir, 'packages', 'vite-plugin', 'dist', 'index.mjs'),
      // 检查主要构建产物即可
    },
    { 
      name: '@btc/shared-core', 
      dist: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'),
      // 额外检查 configs 目录，因为有些应用依赖这些文件
      extraFiles: [
        join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs'),
        join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'unified-env-config.mjs'),
      ]
    },
    { 
      name: '@btc/shared-components', 
      dist: join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs') 
    },
    { 
      name: '@btc/shared-router', 
      dist: join(rootDir, 'packages', 'shared-router', 'dist', 'index.mjs') 
    }
  ];
  
  // 检查哪些包需要构建（检查主文件和额外文件）
  const packagesNeedingBuild = packagesToCheck.filter(pkg => {
    if (!existsSync(pkg.dist)) {
      return true;
    }
    // 检查额外必需的文件
    if (pkg.extraFiles && pkg.extraFiles.some(file => !existsSync(file))) {
      return true;
    }
    return false;
  });
  
  if (packagesNeedingBuild.length > 0) {
    logger.info(`📦 检测到 ${packagesNeedingBuild.length} 个共享包未构建，正在构建...`);
    logger.info(`   需要构建: ${packagesNeedingBuild.map(p => p.name).join(', ')}`);
    
    // 按顺序构建所有需要的包
    for (const pkg of packagesNeedingBuild) {
      try {
        logger.info(`   正在构建 ${pkg.name}...`);
        await new Promise(async (resolve, reject) => {
          // 使用 exec 而不是 spawn，在 Windows 上更可靠
          const { exec } = await import('child_process');
          const command = `pnpm --filter ${pkg.name} run build`;
          
          exec(command, {
            cwd: rootDir,
            shell: true, // 始终使用 shell，确保跨平台兼容
          }, async (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            
            // 输出构建日志
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
            
            // 等待构建产物文件稳定（确保所有文件都已写入完成）
            const allFiles = [pkg.dist, ...(pkg.extraFiles || [])];
            let allStable = true;
            
            for (const file of allFiles) {
              if (existsSync(file)) {
                const stable = await waitForFileStable(file);
                if (!stable) {
                  allStable = false;
                  logger.warn(`   ⚠️  ${pkg.name} 构建产物 ${file} 可能未完全写入`);
                }
              }
            }
            
            if (allStable) {
              logger.info(`   ✅ ${pkg.name} 构建完成`);
            } else {
              logger.warn(`   ⚠️  ${pkg.name} 构建完成，但部分文件可能未稳定`);
            }
            resolve();
          });
        });
      } catch (error) {
        logger.warn(`   ⚠️  ${pkg.name} 构建失败: ${error.message}`);
        logger.warn(`      将继续尝试启动，如果失败请手动运行: pnpm --filter ${pkg.name} run build`);
      }
    }
    
    logger.info('✅ 共享包构建检查完成\n');
  } else {
    // 即使文件存在，也等待一下确保稳定（可能正在被其他进程写入）
    for (const pkg of packagesToCheck) {
      const allFiles = [pkg.dist, ...(pkg.extraFiles || [])];
      for (const file of allFiles) {
        if (existsSync(file)) {
          await waitForFileStable(file, 1000); // 最多等待1秒
        }
      }
    }
  }
}

/**
 * 运行 turbo dev:all（带错误监听）
 */
async function runDevAll() {
  // 检查共享包构建产物是否存在，如果不存在则先构建
  // 这样可以确保在启动 turbo dev 之前，所有必需的文件都已存在
  // turbo 的 dependsOn: ["^build"] 会使用缓存，不会重复构建
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  
  const criticalFiles = [
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'unified-env-config.mjs'), name: '@btc/shared-core' },
  ];
  
  const missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
  if (missingFiles.length > 0) {
    // 只构建缺失的包（避免重复构建）
    const packagesToBuild = new Set(missingFiles.map(f => f.name));
    logger.info(`📦 构建共享包...`);
    
    // 使用 turbo 构建，这样可以利用缓存，并且不会重复构建
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      const command = `pnpm turbo run build --filter=@btc/vite-plugin --filter=@btc/shared-core --filter=@btc/shared-components --filter=@btc/shared-router`;
      exec(command, {
        cwd: rootDir,
        shell: true,
      }, async (error, stdout, stderr) => {
        // 不输出构建日志，避免重复（turbo 的 dev 任务会再次构建并输出）
        if (error) {
          logger.warn(`⚠️  共享包构建失败: ${error.message}`);
          logger.warn(`   将继续启动，如果失败请手动运行: pnpm --filter @btc/shared-core run build`);
          resolve();
          return;
        }
        
        // 等待所有关键文件稳定（确保文件完全写入）
        // 先等待一小段时间，让文件系统完成写入
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let allStable = true;
        let retryCount = 0;
        const maxRetries = 20; // 最多重试20次（共10秒）
        
        while (retryCount < maxRetries) {
          allStable = true;
          
          for (const { path, name } of criticalFiles) {
            if (!existsSync(path)) {
              allStable = false;
              break;
            }
          }
          
          if (allStable) {
            // 文件都存在，再等待文件稳定
            for (const { path, name } of criticalFiles) {
              const stable = await waitForFileStable(path, 3000, 200); // 每个文件最多等待3秒
              if (!stable) {
                allStable = false;
                break;
              }
            }
            
            if (allStable) {
              break; // 所有文件都稳定了
            }
          }
          
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
        }
        
        if (!allStable) {
          const missing = criticalFiles.filter(({ path }) => !existsSync(path));
          if (missing.length > 0) {
            logger.warn(`⚠️  部分文件未生成，dev 服务器可能会失败`);
          }
        }
        resolve();
      });
    });
  }
  
  // 确保数据库已初始化（动态导入，避免 better-sqlite3 未安装时导致启动失败）
  try {
    const { initDatabase } = await import('../skills/database/init.mjs');
    initDatabase();
  } catch (error) {
    // 静默失败，不输出日志
  }

  // 初始化堆快照管理器
  try {
    initSnapshotManager();
  } catch (error) {
    // 静默失败，不输出日志
  }

  // 启动内存监控（静默启动，不输出日志）
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
    // 不输出启动日志
  } catch (error) {
    // 静默失败，不输出日志
  }
  
  // 注意：不再连接监控服务器（3001端口已不再使用）
  
  // 创建错误监听器（静默启动，不输出日志）
  const errorListener = new DevErrorListener({
    minSeverity: 'warning', // 最低报告警告级别
    autoReport: true,
    reportThreshold: 1, // 出现1次就上报
    debounceMs: 3000 // 3秒防抖
  });
  
  // 监听上报事件（静默处理，不输出日志）
  errorListener.on('report', async (error, dbRecord) => {
    try {
      // 静默上报，不输出日志
      await reportError(error, dbRecord, { useCursor: false });
    } catch (reportError) {
      // 静默失败，不输出日志
    }
  });
  
  // 监听错误事件（避免未处理的错误）
  errorListener.on('error', (errorData) => {
    // 真正的错误已经被处理，这里只是确保事件被监听，避免未处理的错误
  });
  
  // 监听警告事件（可选，用于调试）
  errorListener.on('warning', (warningData) => {
    // 警告信息已经被记录到数据库，这里可以添加额外的处理逻辑
    if (process.env.DEBUG) {
      logger.debug(`[警告] ${warningData.errorMessage}`);
    }
  });
  
  // 启动监听器（静默启动）
  errorListener.start();
  
  // 使用自定义的 runTurboWithListener
  // 注意：日志过滤在 onStdoutData 和 onStderrData 中处理
  const args = ['run', 'dev', '--concurrency=30', '--filter=!@btc/mobile-app'];
  
  logger.info('🚀 启动开发服务器...\n');
  
  const code = await runTurboWithListener(args, errorListener, null, {
    cwd: rootDir,
    memoryMonitor: memoryMonitor // 传递 memoryMonitor 给清理函数
  });
  
  // 停止监听器
  errorListener.stop();

  // 停止内存监控（静默停止，不输出日志）
  if (memoryMonitor) {
    memoryMonitor.stop();
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
 * @param {DevErrorMonitorServer | null} monitorServer - 监控服务器（已废弃，传 null）
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
    
    // 存储已启动的服务器信息，用于最后输出总结
    const startedServers = new Set();
    
    // 日志过滤规则：过滤掉冗余和不必要的日志，只保留总结性信息
    const shouldFilterLog = (line) => {
      const trimmed = line.trim();
      
      // 过滤掉空行（完全空白的行）
      if (!trimmed) {
        return true; // 过滤空行，减少空白
      }
      
      // 过滤掉所有构建阶段的详细日志（通过前缀匹配）
      // 匹配格式：package:build: 或 package:dev: 后面跟着详细构建信息
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*$/.test(trimmed)) {
        return true; // 空的构建/开发行（只有前缀）
      }
      
      // 过滤掉构建命令输出行
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*>/.test(trimmed)) {
        return true; // 构建命令（> xxx@version build...）
      }
      
      // 过滤掉 turbo 的详细构建日志
      if (trimmed.includes('cache hit, replaying logs') || 
          trimmed.includes('cache bypass, force executing') ||
          trimmed.includes('Packages in scope:') ||
          trimmed.includes('Running dev in') ||
          trimmed.includes('Remote caching')) {
        return true;
      }
      
      // 过滤掉插件的详细日志
      if (trimmed.includes('[btc:svg]') ||
          trimmed.includes('[btc:ctx]') ||
          trimmed.includes('[btc:eps]') ||
          trimmed.includes('[clean-dist-plugin]') ||
          trimmed.includes('[copy-dark-theme]') ||
          trimmed.includes('Cannot optimize dependency') ||
          trimmed.includes('Failed to resolve dependency') ||
          trimmed.includes('[btc:proxy]') ||
          trimmed.includes('[unplugin-vue-components]') ||
          trimmed.includes('The language') ||
          trimmed.includes('waiting for changes')) {
        return true;
      }
      
      // 过滤掉设计令牌的详细构建日志（带前缀或不带前缀）
      if (trimmed.includes('Token collisions detected') ||
          trimmed.includes('Use log.verbosity') ||
          trimmed.includes('Refer to:') ||
          trimmed.includes('✔︎ dist/') ||
          /^(css|scss|ts)$/.test(trimmed) || // 单独一行的 css/scss/ts
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*(css|scss|ts)\s*$/.test(trimmed) || // 带前缀的 css/scss/ts
          trimmed.includes('监听设计令牌文件变化') ||
          trimmed.includes('监听目录:') ||
          trimmed.includes('配置文件:') ||
          trimmed.includes('开始构建...') ||
          trimmed.includes('构建完成') ||
          trimmed.includes('等待文件变化')) {
        return true;
      }
      
      // 过滤掉 Vite 的详细构建信息行（带前缀）
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*📦/.test(trimmed)) {
        return true; // 📦 开始构建行
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*-/.test(trimmed)) {
        return true; // 构建详情行（以 - 开头，如 "   - 输入文件"）
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*✅/.test(trimmed)) {
        // 如果包含详细的输出文件信息，则过滤
        if (trimmed.includes('输出文件') || trimmed.includes('类型声明') || trimmed.includes('样式文件')) {
          return true;
        }
      }
      // 过滤 created dist/ 消息（可能带前缀或不带）
      if (trimmed.includes('created dist/') || /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*created dist\//.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 Rollup 构建日志（可能带前缀）
      if (trimmed.includes('bundles src/') ||
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*bundles src\//.test(trimmed) ||
          trimmed.includes('rollup v') ||
          /src\/index\.ts → dist\//.test(trimmed) ||
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*src\/index\.ts →/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 Docs 同步日志（可能带前缀）
      if (trimmed.includes('> node ../../scripts/sync-docs-to-vitepress.mjs') ||
          /^docs-app:dev:\s*> node/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 turbo 版本号
      if (trimmed === 'turbo 2.6.1') {
        return true;
      }
      
      // 过滤掉 "✓ Created dist/src/index.d.ts" 这样的构建产物信息
      if (/✓\s*Created/.test(trimmed) || /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*✓/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 dev 阶段的构建成功信息（watch 模式的正常输出，不需要显示）
      // 只保留 build 阶段的构建成功信息（首次构建）
      if (/^(@btc\/[\w-]+|[\w-]+-app):dev:\s*✅.*构建成功/.test(trimmed)) {
        return true; // 过滤 dev 阶段的构建成功
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):dev:\s*created dist\//.test(trimmed)) {
        return true; // 过滤 dev 阶段的构建产物创建信息
      }
      
      // 保留重要的日志：
      // - VITE ready（服务器启动信息）
      // - 错误信息（error、ERROR、失败、failed）
      // - 构建失败的总结信息（ELIFECYCLE、ERROR、Tasks）
      // - 关键警告
      // - 服务器地址（Local、Network、➜）
      // - build 阶段的构建成功信息（首次构建，需要显示）
      return false;
    };

    // 定义日志监听函数（便于后续移除，防止内存泄漏）
    const onStdoutData = (chunk) => {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split(/\r?\n/);
      
      // 检测服务器启动信息（用于跟踪启动状态，不输出额外日志）
      lines.forEach(line => {
        if (line.includes('VITE') && line.includes('ready')) {
          // 提取应用名称（从行首的工作空间名称）
          const match = line.match(/^(\w+[-]?app|@btc\/[\w-]+):dev:/);
          if (match) {
            startedServers.add(match[1]);
          }
        }
      });
      
      // 过滤日志
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !shouldFilterLog(trimmed);
      });
      
      if (filteredLines.length > 0) {
        // 恢复原始换行格式
        const filteredChunk = filteredLines.join('\n');
        // 保持原始输出的换行风格（如果原始chunk以换行结尾，保持；否则不添加）
        if (filteredChunk) {
          process.stdout.write(filteredChunk + (chunkStr.endsWith('\n') ? '\n' : ''));
        }
      }
      
      // 始终发送给错误监听器（用于错误检测）
      errorListener.processChunk(chunk, 'stdout');
    };

    const onStderrData = (chunk) => {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split(/\r?\n/);
      
      // 过滤日志
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !shouldFilterLog(trimmed);
      });
      
      if (filteredLines.length > 0) {
        // 恢复原始换行格式
        const filteredChunk = filteredLines.join('\n');
        // 保持原始输出的换行风格
        if (filteredChunk) {
          process.stderr.write(filteredChunk + (chunkStr.endsWith('\n') ? '\n' : ''));
        }
      }
      
      // 始终发送给错误监听器（用于错误检测）
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
      
      // 注意：服务器启动总结会在服务器启动时通过日志输出，这里不需要额外处理
      
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
      // 静默启动，不输出日志
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

