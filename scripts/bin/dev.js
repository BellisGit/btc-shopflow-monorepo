#!/usr/bin/env node

/**
 * 统一开发命令入口
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = join(__dirname, '../commands/dev/dev-all.mjs');
const args = process.argv.slice(2);

const child = spawn('node', [scriptPath, ...args], {
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
