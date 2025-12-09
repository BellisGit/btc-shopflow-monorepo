/**
 * 清理构建目录插件
 */

import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, rmSync } from 'node:fs';

/**
 * 安全输出日志（避免 Windows 控制台编码问题）
 */
function safeLog(message: string) {
  try {
    console.log(message);
  } catch (error) {
    // 如果输出失败（可能是编码问题），使用纯文本输出
    console.log(message.replace(/[^\x00-\x7F]/g, ''));
  }
}

/**
 * 安全输出警告（避免 Windows 控制台编码问题）
 */
function safeWarn(message: string) {
  try {
    console.warn(message);
  } catch (error) {
    // 如果输出失败（可能是编码问题），使用纯文本输出
    console.warn(message.replace(/[^\x00-\x7F]/g, ''));
  }
}

/**
 * 清理 dist 目录插件
 */
export function cleanDistPlugin(appDir: string): Plugin {
  return {
    name: 'clean-dist-plugin',
    buildStart() {
      const distDir = resolve(appDir, 'dist');
      if (existsSync(distDir)) {
        safeLog('[clean-dist-plugin] 清理旧的 dist 目录...');
        try {
          rmSync(distDir, { recursive: true, force: true });
          safeLog('[clean-dist-plugin] dist 目录已清理');
        } catch (error: any) {
          if (error.code === 'EBUSY' || error.code === 'ENOENT') {
            safeWarn(`[clean-dist-plugin] 清理失败（${error.code}），Vite 将在构建时自动清理输出目录`);
          } else {
            safeWarn('[clean-dist-plugin] 清理 dist 目录失败，继续构建: ' + error.message);
            safeWarn('[clean-dist-plugin] Vite 将在构建时自动清理输出目录（emptyOutDir: true）');
          }
        }
      }
    },
  } as Plugin;
}

