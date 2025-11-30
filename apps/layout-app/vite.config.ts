import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc } from '@btc/vite-plugin';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('layout-app');

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

// 虚拟 EPS 服务插件（layout-app 不需要 EPS，提供空实现）
const virtualEpsPlugin = (): Plugin => {
  return {
    name: 'virtual-eps-for-layout',
    resolveId(id) {
      // 拦截 @services/eps 的导入
      if (id === '@services/eps') {
        return id; // 返回虚拟模块 ID
      }
      return null;
    },
    load(id) {
      // 为 @services/eps 提供空实现
      if (id === '@services/eps') {
        return `
          // layout-app 不需要 EPS，提供空实现
          export const service = {};
          export const list = [];
          export default service;
        `;
      }
      return null;
    },
  };
};

export default defineConfig({
  base: '/',
  // 配置 publicDir，指向 system-app 的 public 目录，以便访问 logo.png 等静态资源
  publicDir: resolve(__dirname, '../system-app/public'),
  resolve: {
    alias: {
      '@layout': resolve(__dirname, 'src'),
      '@configs': resolve(__dirname, '../../configs'),
      '@system': resolve(__dirname, '../system-app/src'),
      '@': resolve(__dirname, '../system-app/src'),
      '@services': resolve(__dirname, '../system-app/src/services'),
      '@auth': resolve(__dirname, '../../auth'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@assets': resolve(__dirname, '../../packages/shared-components/src/assets'),
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia'],
  },
  plugins: [
    corsPlugin(),
    virtualEpsPlugin(), // 提供空的 EPS 服务
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    UnoCSS({
      configFile: resolve(__dirname, '../../uno.config.ts'),
    }),
    btc({
      type: 'admin',
      svg: {
        skipNames: ['base', 'icons'],
      },
    }),
    VueI18nPlugin({
      include: [
        resolve(__dirname, '../system-app/src/locales/**'),
        resolve(__dirname, '../system-app/src/{modules,plugins}/**/locales/**'),
        resolve(__dirname, '../../packages/shared-components/src/locales/**'),
        resolve(__dirname, '../../packages/shared-components/src/plugins/**/locales/**'),
        resolve(__dirname, '../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts'),
        resolve(__dirname, '../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts'),
      ],
      runtimeOnly: true,
    }),
    createAutoImportConfig({ includeShared: true }),
    createComponentsConfig({ includeShared: true }),
    qiankun('layout', {
      useDevMode: process.env.NODE_ENV === 'development',
    }),
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
    fs: {
      allow: [
        resolve(__dirname, '..'),
        resolve(__dirname, '../system-app'),
        resolve(__dirname, '../../'),
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
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'layoutApp',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});

