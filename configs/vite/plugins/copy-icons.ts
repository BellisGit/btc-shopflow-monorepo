/**
 * 复制 icons 目录插件
 * 用于在构建时复制 public/icons 目录到 dist/icons
 * 主要用于 admin-app，因为它需要显示图标内容
 */

import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, dirname } from 'path';
import { existsSync, copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';

export function copyIconsPlugin(appDir: string): Plugin {
  let viteConfig: ResolvedConfig | null = null;
  
  return {
    name: 'copy-icons',
    apply: 'build', // 只在构建时执行
    
    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },
    
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }

        const root = viteConfig.root || appDir;
        const iconsSourceDir = resolve(root, 'public/icons');
        
        // 检查源目录是否存在
        if (!existsSync(iconsSourceDir)) {
          return; // 如果源目录不存在，静默跳过
        }

        // 获取构建输出目录
        const outDir = viteConfig.build.outDir || 'dist';
        const distDir = resolve(root, outDir);
        
        if (!existsSync(distDir)) {
          return; // 如果输出目录不存在，跳过
        }

        const iconsDestDir = resolve(distDir, 'icons');
        
        // 确保目标目录存在
        if (!existsSync(iconsDestDir)) {
          mkdirSync(iconsDestDir, { recursive: true });
        }

        // 复制 icons 目录中的所有文件
        const files = readdirSync(iconsSourceDir);
        for (const file of files) {
          const sourcePath = resolve(iconsSourceDir, file);
          const destPath = resolve(iconsDestDir, file);
          
          const stats = statSync(sourcePath);
          if (stats.isFile()) {
            copyFileSync(sourcePath, destPath);
          }
        }
        
        // 检查并复制 favicon.ico（如果存在）
        const faviconSource = resolve(root, 'public/favicon.ico');
        const faviconDest = resolve(iconsDestDir, 'favicon.ico');
        if (existsSync(faviconSource)) {
          copyFileSync(faviconSource, faviconDest);
        } else {
          // 如果不存在，使用 favicon-32x32.png 作为 favicon.ico（简单方案）
          const favicon32Source = resolve(iconsSourceDir, 'favicon-32x32.png');
          if (existsSync(favicon32Source)) {
            copyFileSync(favicon32Source, faviconDest);
          }
        }
        
        // 检查并复制 site.webmanifest（如果存在）
        const manifestSource = resolve(root, 'public/icons/site.webmanifest');
        const manifestDest = resolve(iconsDestDir, 'site.webmanifest');
        if (existsSync(manifestSource)) {
          copyFileSync(manifestSource, manifestDest);
        } else {
          // 如果不存在，尝试从 public 根目录复制
          const manifestSourceRoot = resolve(root, 'public/site.webmanifest');
          if (existsSync(manifestSourceRoot)) {
            copyFileSync(manifestSourceRoot, manifestDest);
          } else {
            // 如果都不存在，生成一个基本的 site.webmanifest
            const manifest = {
              name: 'BTC ShopFlow Admin',
              short_name: 'BTC Admin',
              description: 'BTC ShopFlow 管理应用',
              start_url: '/',
              display: 'standalone',
              background_color: '#ffffff',
              theme_color: '#404040',
              icons: [
                {
                  src: '/icons/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: '/icons/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
                {
                  src: '/icons/favicon-32x32.png',
                  sizes: '32x32',
                  type: 'image/png',
                },
                {
                  src: '/icons/favicon-16x16.png',
                  sizes: '16x16',
                  type: 'image/png',
                },
              ],
            };
            writeFileSync(manifestDest, JSON.stringify(manifest, null, 2), 'utf-8');
          }
        }
        
        console.log(`[copy-icons] 已复制 icons 目录到: ${iconsDestDir}`);
      } catch (error) {
        // 静默失败，避免阻塞构建
        console.warn('[copy-icons] 复制 icons 目录失败:', error);
      }
    },
  };
}

