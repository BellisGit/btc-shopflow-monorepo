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

function runCommand(command, args, description, env = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    
    const child = spawn('node', [turboScript, command, ...args], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
      env: { ...process.env, ...env },
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
  // 关键：使用精确匹配，只构建指定的应用
  // Turbo filter 语法：
  // - `--filter layout-app` - 只构建 layout-app（不包括依赖项）
  // - `--filter layout-app...` - 构建 layout-app 及其依赖项
  // - `--filter ^layout-app` - 只构建 layout-app（明确排除依赖项）
  // 这里使用精确匹配，只构建指定的应用本身（不包括依赖项）
  const filterArgs = packages.length > 0 ? ['--filter', packages.join('|')] : [];
  
  console.log(`🔍 过滤参数: ${filterArgs.join(' ')}`);
  console.log(`📦 包名列表: ${packages.join(', ')}`);

  try {
    // 步骤 1: 构建（关键：设置预览环境变量，禁用 CDN）
    // 预览构建必须禁用 CDN，确保构建产物不包含 CDN URL
    await runCommand(
      'run', 
      ['build', ...filterArgs], 
      '构建应用（预览模式，CDN 已禁用）',
      {
        VITE_PREVIEW: 'true',
        ENABLE_CDN_ACCELERATION: 'false',
        ENABLE_CDN_UPLOAD: 'false',
      }
    );
    
    // 步骤 2: 预览（只预览指定的应用）
    await runCommand('run', ['preview', ...filterArgs], '启动预览服务器');
    
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
    console.error(`❌ 未找到指定的应用: ${args.join(', ')}`);
    console.error('提示: 可以使用应用 ID（如 layout）或包名（如 layout-app）');
    process.exit(1);
  }
  
  // 调试信息：显示找到的应用
  console.log(`📦 构建预览应用: ${apps.map(app => `${app.displayName} (${app.packageName})`).join(', ')}`);
  buildAndPreview(apps);
}
