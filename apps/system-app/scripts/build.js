#!/usr/bin/env node
/**
 * 构建脚本包装器
 * 用于解决 Windows 上 pnpm NODE_PATH 过长的问题
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readdirSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');
const monorepoRoot = resolve(__dirname, '../../..');

// 查找 vite 可执行文件
function findViteBin() {
  // 方法1: 从 pnpm 的 .pnpm 目录查找（最可靠的方法）
  const pnpmPath = resolve(monorepoRoot, 'node_modules/.pnpm');
  if (existsSync(pnpmPath)) {
    try {
      const viteDirs = readdirSync(pnpmPath).filter(dir => dir.startsWith('vite@'));
      if (viteDirs.length > 0) {
        // 使用最新的版本
        const latestViteDir = viteDirs.sort().reverse()[0];
        const viteBinPath = resolve(pnpmPath, latestViteDir, 'node_modules/vite/bin/vite.js');
        if (existsSync(viteBinPath)) {
          return viteBinPath;
        }
      }
    } catch (e) {
      // 忽略错误，继续尝试其他方法
    }
  }

  // 方法2: 从本地 node_modules 查找
  const localVitePath = resolve(__dirname, '../node_modules/vite/bin/vite.js');
  if (existsSync(localVitePath)) {
    return localVitePath;
  }

  // 方法3: 从项目根目录的 node_modules 查找
  const rootVitePath = resolve(projectRoot, 'node_modules/vite/bin/vite.js');
  if (existsSync(rootVitePath)) {
    return rootVitePath;
  }

  // 如果都找不到，抛出错误
  throw new Error('Cannot find vite binary. Please ensure vite is installed.');
}

let viteBin;
try {
  viteBin = findViteBin();
  // 确保找到的是 .js 文件，而不是 shell 脚本
  if (!viteBin.endsWith('.js')) {
    throw new Error(`Found vite binary is not a .js file: ${viteBin}`);
  }
} catch (error) {
  console.error('Failed to find vite binary:', error.message);
  process.exit(1);
}

const args = process.argv.slice(2); // 获取传递给脚本的参数

// 如果是 build 命令，只清理 dist 目录，保留 build 目录（包含 EPS 数据）
if (args[0] === 'build') {
  const appDir = resolve(__dirname, '..');
  const distDir = resolve(appDir, 'dist');
  
  console.log('🧹 清理构建产物...');
  
  // 只清理 dist 目录，保留 build 目录（包含 EPS 数据）
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
    console.log('✅ 已清理 dist 目录');
  }
  
  console.log('✅ 清理完成（已保留 build/eps 目录）\n');
}

// 使用 node 运行 vite，避免 pnpm 设置过长的 NODE_PATH
// 清除 NODE_PATH 环境变量，避免命令行过长
const env = { ...process.env };
delete env.NODE_PATH;

const child = spawn('node', [viteBin, ...args], {
  stdio: 'inherit',
  shell: false, // 不使用 shell，直接执行
  cwd: resolve(__dirname, '..'),
  env: env,
});

child.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

