#!/usr/bin/env node

/**
 * dev:all 包装脚本
 * 在启动所有应用之前检查端口占用情况
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const turboScript = join(__dirname, 'turbo.js');
const checkPortsScript = join(__dirname, 'check-ports.mjs');

/**
 * 检查端口占用情况
 */
function checkPorts() {
  try {
    console.log('🔍 检查端口占用情况...\n');
    execSync(`node "${checkPortsScript}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ 端口检查通过\n');
  } catch (error) {
    console.error('\n❌ 端口检查失败，请先释放被占用的端口\n');
    process.exit(1);
  }
}

/**
 * 运行 turbo dev:all
 */
function runDevAll() {
  const args = ['run', 'dev', '--concurrency=30', '--filter=!@btc/mobile-app'];
  
  console.log('🚀 启动所有应用的开发服务器（已排除移动应用）...\n');
  
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

// 主逻辑：先检查端口，再启动
checkPorts();
runDevAll();

