import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc } from '@btc/vite-plugin';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('monitor-app');

// CORS 插件
const corsPlugin = (): Plugin => {
  const corsDevMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  };

  return {
    name: 'cors-with-credentials',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        corsDevMiddleware(req, res, next);
      });
    },
  };
};

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@monitor': resolve(__dirname, 'src'),
      '@configs': resolve(__dirname, '../../configs'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@btc/subapp-manifests': resolve(__dirname, '../../packages/subapp-manifests/src'),
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@assets': resolve(__dirname, '../../packages/shared-components/src/assets'),
      '@btc-assets': resolve(__dirname, '../../packages/shared-components/src/assets'), // 添加 @btc-assets 别名，用于图片和图标资源导入
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia'],
  },
  optimizeDeps: {
    include: ['@configs/layout-bridge'],
  },
  plugins: [
    corsPlugin(),
    vue(),
    btc({
      type: 'subapp',
    }),
    UnoCSS({
      configFile: resolve(__dirname, '../../uno.config.ts'),
    }),
    qiankun('monitor', {
      useDevMode: process.env.NODE_ENV === 'development',
    }),
    // 确保构建后的 HTML 中的 script 标签有 type="module"
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            if (!match.includes('src=')) {
              return match;
            }
            if (attrs && attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      },
    } as Plugin,
  ],
  server: {
    port: parseInt(config.devPort, 10),
    host: config.devHost,
    strictPort: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    hmr: {
      overlay: false, // 关闭热更新错误浮层，避免 HTMLElement 构造错误
    },
    fs: {
      strict: false,
      allow: [
        resolve(__dirname, '../..'),
        resolve(__dirname, '../../packages'),
        resolve(__dirname, '../../configs'),
        resolve(__dirname, '../../packages/shared-components/src'),
      ],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  build: {
    target: 'es2018',
    cssTarget: 'chrome61',
    sourcemap: false,
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    // 构建前清空输出目录，确保不会残留旧文件
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: false,
        manualChunks(id) {
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus';
          }
          if (id.includes('node_modules')) {
            if (id.includes('vue') && !id.includes('vue-router') && !id.includes('vue-i18n') && !id.includes('element-plus')) {
              return 'vue-core';
            }
            if (id.includes('vue-router')) {
              return 'vue-router';
            }
            if (id.includes('pinia')) {
              return 'pinia';
            }
            return 'vendor';
          }
          if (id.includes('@btc/shared-')) {
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            return 'btc-shared';
          }
          return 'app-src';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});

