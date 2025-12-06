/**
 * 清理构建目录插件
 */

import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, rmSync } from 'node:fs';

/**
 * 清理 dist 目录插件
 */
export function cleanDistPlugin(appDir: string): Plugin {
  return {
    name: 'clean-dist-plugin',
    buildStart() {
      const distDir = resolve(appDir, 'dist');
      if (existsSync(distDir)) {
        console.log('[clean-dist-plugin] 🧹 清理旧的 dist 目录...');
        try {
          rmSync(distDir, { recursive: true, force: true });
          console.log('[clean-dist-plugin] ✅ dist 目录已清理');
        } catch (error: any) {
          if (error.code === 'EBUSY' || error.code === 'ENOENT') {
            console.warn(`[clean-dist-plugin] ⚠️  清理失败（${error.code}），Vite 将在构建时自动清理输出目录`);
          } else {
            console.warn('[clean-dist-plugin] ⚠️  清理 dist 目录失败，继续构建:', error.message);
            console.warn('[clean-dist-plugin] ℹ️  Vite 将在构建时自动清理输出目录（emptyOutDir: true）');
          }
        }
      }
    },
  };
}

