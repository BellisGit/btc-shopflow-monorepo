#!/usr/bin/env node

/**
 * dev:all 包装脚本
 * 在启动所有应用之前检查端口占用情况
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';
import { runTurbo } from '../../utils/turbo-helper.mjs';

const rootDir = getRootDir();
// check-ports.mjs 已被归档，如果需要可以恢复或使用其他检查方式
// const checkPortsScript = join(rootDir, 'scripts', 'archive', 'verify', 'check-ports.mjs');

/**
 * 检查端口占用情况
 * 注意：check-ports.mjs 已被归档，这里暂时跳过端口检查
 * 如果需要端口检查功能，可以从 archive/verify/ 恢复或重新实现
 */
function checkPorts() {
  // 端口检查脚本已被归档，暂时跳过
  logger.info('ℹ️  端口检查已跳过（check-ports.mjs 已被归档）\n');
  // 如果需要恢复端口检查，可以取消下面的注释：
  // try {
  //   logger.info('🔍 检查端口占用情况...\n');
  //   const checkPortsScript = join(rootDir, 'scripts', 'archive', 'verify', 'check-ports.mjs');
  //   execSync(`node "${checkPortsScript}"`, {
  //     cwd: rootDir,
  //     stdio: 'inherit',
  //   });
  //   logger.info('✅ 端口检查通过\n');
  // } catch (error) {
  //   logger.error('\n❌ 端口检查失败，请先释放被占用的端口\n');
  //   process.exit(1);
  // }
}

/**
 * 运行 turbo dev:all
 */
async function runDevAll() {
  const args = ['run', 'dev', '--concurrency=30', '--filter=!@btc/mobile-app'];
  
  logger.info('🚀 启动所有应用的开发服务器（已排除移动应用）...\n');
  
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

// 主逻辑：先检查端口，再启动
(async () => {
  checkPorts();
  await runDevAll();
})();

