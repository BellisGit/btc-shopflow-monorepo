#!/usr/bin/env node

/**
 * 统一开发脚本
 * 使用 turbo 统一管理所有应用的开发服务器
 * 替代当前的 concurrently 方式
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDefaultDevApps, parseAppArgs, getAppPackageNames } from './apps-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 查找 turbo.js 脚本
const turboScript = join(__dirname, 'turbo.js');

function runTurboDev(apps = null) {
  const args = ['run', 'dev'];
  
  if (apps && apps.length > 0) {
    const packages = getAppPackageNames(apps);
    if (packages.length > 0) {
      args.push('--filter', packages.join('...'));
    }
  }
  
  // 设置并发数为 30，基于 14 核 20 线程 CPU 优化（当前有 22 个工作空间）
  args.push('--concurrency=30');

  console.log(`🚀 启动开发服务器...`);
  if (apps && apps.length > 0) {
    console.log(`📦 应用: ${apps.map(app => app.displayName).join(', ')}`);
  } else {
    console.log(`📦 所有应用`);
  }

  const child = spawn('node', [turboScript, ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  });
}

// 主逻辑
const args = process.argv.slice(2);

if (args.length === 0) {
  // 使用默认开发应用列表
  const defaultApps = getDefaultDevApps();
  runTurboDev(defaultApps);
} else if (args[0] === '--all' || args[0] === '-a') {
  // 启动所有应用
  runTurboDev(null);
} else {
  // 启动指定应用
  const apps = parseAppArgs(args);
  runTurboDev(apps);
}
