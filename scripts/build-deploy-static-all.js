#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const repoRoot = path.resolve(__dirname, '..');
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

const run = (args, extraEnv = {}) => {
  const result = spawnSync(pnpmCmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runNode = (scriptPath, args = [], extraEnv = {}) => {
  const result = spawnSync(nodeCmd, [scriptPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

// 清理移动端应用的构建产物和缓存，确保强制重新构建
const mobileAppDistPath = path.join(repoRoot, 'apps', 'mobile-app', 'dist');
const mobileAppViteCachePath = path.join(repoRoot, 'apps', 'mobile-app', 'node_modules', '.vite');
const mobileAppViteCachePath2 = path.join(repoRoot, 'apps', 'mobile-app', '.vite');

console.log('🧹 清理移动端应用旧的构建产物和缓存...');
if (fs.existsSync(mobileAppDistPath)) {
  try {
    fs.rmSync(mobileAppDistPath, { recursive: true, force: true });
    console.log('✓ 已清理移动端应用构建产物');
  } catch (error) {
    console.warn('⚠️  清理移动端应用构建产物失败:', error.message);
  }
}

if (fs.existsSync(mobileAppViteCachePath)) {
  try {
    fs.rmSync(mobileAppViteCachePath, { recursive: true, force: true });
    console.log('✓ 已清理移动端应用 Vite 缓存 (node_modules/.vite)');
  } catch (error) {
    console.warn('⚠️  清理 Vite 缓存失败:', error.message);
  }
}

if (fs.existsSync(mobileAppViteCachePath2)) {
  try {
    fs.rmSync(mobileAppViteCachePath2, { recursive: true, force: true });
    console.log('✓ 已清理移动端应用 Vite 缓存 (.vite)');
  } catch (error) {
    console.warn('⚠️  清理 Vite 缓存失败:', error.message);
  }
}

// 构建阶段强制 VITE_PREVIEW=false，确保生产包走 /micro-apps/<app> 路径
// 使用 --force 标志强制 turbo 重新构建所有应用，避免使用缓存
// 特别针对移动端应用，使用 --no-cache 确保完全重新构建
const turboScriptPath = path.join(repoRoot, 'scripts', 'turbo.js');
console.log('🔨 开始构建所有应用（强制重新构建，不使用缓存）...');
runNode(turboScriptPath, ['run', 'build', '--force', '--no-cache'], { VITE_PREVIEW: 'false' });

// 构建成功后继续执行原来的静态发布
run(['deploy:static:all']);
