#!/usr/bin/env node

/**
 * 统一构建预览脚本
 * 支持单个应用或所有应用的构建+预览流程
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseAppArgs, getAppPackageNames, getAllApps } from './apps-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const turboScript = join(__dirname, 'turbo.js');

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    
    const child = spawn('node', [turboScript, command, ...args], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出码: ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function buildAndPreview(apps) {
  const packages = getAppPackageNames(apps);
  const filterArgs = packages.length > 0 ? ['--filter', packages.join('...')] : [];

  try {
    // 步骤 1: 构建
    await runCommand('run', ['build', ...filterArgs], '构建应用');
    
    // 步骤 2: 预览
    await runCommand('run', ['preview', ...filterArgs, '--concurrency=25'], '启动预览服务器');
    
    console.log('\n✅ 构建预览完成！');
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 主逻辑
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--all' || args[0] === '-a') {
  // 构建预览所有应用
  console.log('📦 构建预览所有应用');
  buildAndPreview(getAllApps());
} else {
  // 构建预览指定应用
  const apps = parseAppArgs(args);
  if (apps.length === 0) {
    console.error('❌ 未找到指定的应用');
    process.exit(1);
  }
  
  console.log(`📦 构建预览应用: ${apps.map(app => app.displayName).join(', ')}`);
  buildAndPreview(apps);
}
