#!/usr/bin/env node

/**
 * 统一开发脚本
 * 使用 turbo 统一管理所有应用的开发服务器
 * 替代当前的 concurrently 方式
 */
import { logger } from '../../utils/logger.mjs';

// 导入已更新为使用新的 utils 模块
import { getDefaultDevApps, parseAppArgs, getAppPackageNames } from '../../utils/monorepo-helper.mjs';
import { getRootDir } from '../../utils/path-helper.mjs';
import { runTurbo } from '../../utils/turbo-helper.mjs';

const rootDir = getRootDir();

async function runTurboDev(apps = null) {
  const args = ['run', 'dev'];
  
  if (apps && apps.length > 0) {
    const packages = getAppPackageNames(apps);
    if (packages.length > 0) {
      args.push('--filter', packages.join('...'));
    }
  }
  
  // 设置并发数为 30，基于 14 核 20 线程 CPU 优化（当前有 22 个工作空间）
  args.push('--concurrency=30');

  logger.info(`🚀 启动开发服务器...`);
  if (apps && apps.length > 0) {
    logger.info(`📦 应用: ${apps.map(app => app.displayName).join(', ')}`);
  } else {
    logger.info(`📦 所有应用`);
  }

  try {
    const code = await runTurbo(args, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    process.exit(code);
  } catch (err) {
    logger.error('❌ 启动失败:', err);
    process.exit(1);
  }
}

// 主逻辑
const args = process.argv.slice(2);

(async () => {
  if (args.length === 0) {
    // 使用默认开发应用列表
    const defaultApps = getDefaultDevApps();
    await runTurboDev(defaultApps);
  } else if (args[0] === '--all' || args[0] === '-a') {
    // 启动所有应用
    await runTurboDev(null);
  } else {
    // 启动指定应用
    const apps = parseAppArgs(args);
    await runTurboDev(apps);
  }
})();
