#!/usr/bin/env node

/**
 * 构建并验证 admin-app，确保所有引用都正确
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const appDistDir = join(rootDir, 'apps', 'admin-app', 'dist');

console.log('🔨 开始构建 admin-app...\n');

try {
  // 清理旧的构建产物
  if (existsSync(appDistDir)) {
    const { rmSync } = await import('fs');
    rmSync(appDistDir, { recursive: true, force: true });
    console.log('✅ 已清理旧的构建产物\n');
  }

  // 构建
  console.log('📦 正在构建...\n');
  execSync('pnpm --filter admin-app build', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  console.log('\n✅ 构建完成\n');

  // 验证
  console.log('🔍 开始验证构建产物...\n');
  const { default: verify } = await import('./verify-admin-build.mjs');
  
} catch (error) {
  console.error('\n❌ 构建或验证失败:', error.message);
  process.exit(1);
}

