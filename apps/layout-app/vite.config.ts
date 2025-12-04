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

// 注意：layout-app 现在使用真实的 EPS 数据（从 system-app 复制）
// 不再需要虚拟 EPS 插件，EPS 数据会在构建时从 build/eps 目录读取

export default defineConfig({
  base: '/',
  // 配置 publicDir，指向共享组件库的 public 目录，以便访问 logo.png 等静态资源
  // logo.png 从共享组件库复制，确保所有应用使用相同的 logo
  publicDir: resolve(__dirname, '../../packages/shared-components/public'),
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
      '@btc/subapp-manifests': resolve(__dirname, '../../packages/subapp-manifests/src'),
      '@assets': resolve(__dirname, '../../packages/shared-components/src/assets'),
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia'],
  },
  plugins: [
    corsPlugin(),
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
      // 启用 EPS 插件，从 build/eps 目录读取复制的 EPS 数据
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
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
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    qiankun('layout', {
      useDevMode: process.env.NODE_ENV === 'development',
    }),
    // 确保构建后的 HTML 中的 script 标签有 type="module"（用于 qiankun 加载）
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        // 确保所有 script 标签都有 type="module"
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            // 跳过内联脚本（没有 src 属性）
            if (!match.includes('src=')) {
              return match;
            }
            // 如果已经有 type 属性，替换为 module
            if (attrs && attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            // 如果没有 type 属性，添加 type="module"
            return `<script type="module"${attrs}>`;
          }
        );
      },
    } as Plugin,
  ],
  server: {
    port: config.devPort,
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
    // 禁用内联，确保资源文件独立
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    // 提高 chunk 大小警告阈值，避免不必要的警告
    chunkSizeWarningLimit: 2000,
    // 构建前清空输出目录，确保不会残留旧文件
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 使用 ES 模块格式，与其他应用保持一致，便于 qiankun 加载
        format: 'es',
        inlineDynamicImports: false,
        manualChunks(id) {
          // 重要：Element Plus 的匹配必须在最前面
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus';
          }

          // 处理 @btc/shared-components/charts/utils/cleanup
          // 确保动态导入的 cleanup 工具与静态导入的 shared-components 放在同一个 chunk 中
          if (id.includes('@btc/shared-components/charts/utils/cleanup') ||
              id.includes('packages/shared-components/src/charts/utils/cleanup')) {
            return 'btc-components';
          }

          // 处理 system-app 的代码（通过别名 @system 引用）
          // 确保被动态导入和静态导入的模块在同一 chunk
          if (id.includes('system-app/src/') || id.includes('@system') ||
              (id.includes('apps/system-app') && id.includes('src/'))) {
            if (id.includes('store/tabRegistry') ||
                id.includes('store/process') ||
                id.includes('store/menuRegistry') ||
                id.includes('composables/useUser') ||
                id.includes('services/eps') ||
                id.includes('micro/manifests') ||
                id.includes('utils/loadingManager')) {
              return 'app-src';
            }
            return 'app-src';
          }

          // 处理 @configs 包（关键配置和工具函数）
          if (id.includes('@configs')) {
            return 'app-src';
          }

          // 处理业务代码分割（必须在 node_modules 之前，确保优先级）
          if (id.includes('src/') && !id.includes('node_modules') && !id.includes('system-app')) {
            // 关键：所有 src/ 代码必须合并到 app-src，确保 main.ts 和初始化相关的代码在一起
            return 'app-src';
          }

          // 处理 @btc/shared- 包（共享包）
          if (id.includes('@btc/shared-')) {
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            return 'btc-shared';
          }

          // 处理 node_modules 依赖，进行代码分割
          if (id.includes('node_modules')) {
            // 分割 Vue 相关依赖
            if (id.includes('vue') && !id.includes('vue-router') && !id.includes('vue-i18n') && !id.includes('element-plus')) {
              return 'vue-core';
            }
            if (id.includes('vue-router')) {
              return 'vue-router';
            }
            // 分割 Pinia
            if (id.includes('pinia')) {
              return 'pinia';
            }
            // 其他 vendor 依赖
            return 'vendor';
          }

          return undefined;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      onwarn(warning, warn) {
        // 过滤动态导入和静态导入冲突的警告，因为我们已经在 manualChunks 中确保它们在同一 chunk
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && warning.message.includes('dynamically imported') && warning.message.includes('statically imported'))) {
          return;
        }
        // 过滤空 chunk 警告（某些 chunk 可能因为 tree-shaking 而变空，这是正常的）
        if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
          return;
        }
        warn(warning);
      },
    },
  },
});

