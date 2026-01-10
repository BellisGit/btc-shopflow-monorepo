#!/usr/bin/env node

/**
 * 构建并上传到 CDN 的包装脚本
 * 自动设置 ENABLE_CDN_UPLOAD=true 并执行 build-dist 命令
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// 解析命令行参数
const args = process.argv.slice(2);
const isAll = args.includes('--all');
const appName = args.find(arg => !arg.startsWith('--'));

// 确定要执行的命令
let command;
let commandArgs;

if (isAll) {
  // 构建所有应用
  command = 'node';
  commandArgs = [resolve(projectRoot, 'scripts', 'build-to-dist.mjs')];
} else if (appName) {
  // 构建单个应用
  command = 'node';
  commandArgs = [resolve(projectRoot, 'scripts', 'build-to-dist.mjs'), '--app', appName];
} else {
  console.error('❌ 错误：请指定应用名称或使用 --all');
  console.error('   示例: node scripts/build-dist-cdn.mjs system-app');
  console.error('   示例: node scripts/build-dist-cdn.mjs --all');
  process.exit(1);
}

// 设置环境变量
const env = {
  ...process.env,
  ENABLE_CDN_ACCELERATION: 'true',
  ENABLE_CDN_UPLOAD: 'true',
  BUILD_OUT_DIR: 'dist-cdn',
};

console.log('🚀 开始构建并上传到 CDN...');
console.log(`   环境变量: ENABLE_CDN_ACCELERATION=true, ENABLE_CDN_UPLOAD=true, BUILD_OUT_DIR=dist-cdn`);
console.log(`   输出目录: dist-cdn`);
if (isAll) {
  console.log(`   目标: 所有应用`);
} else {
  console.log(`   目标: ${appName}`);
}
console.log('');

// 执行命令
const child = spawn(command, commandArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error('❌ 执行失败:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ 构建并上传完成！');
  } else {
    console.error(`\n❌ 构建失败，退出代码: ${code}`);
    process.exit(code ?? 1);
  }
});

