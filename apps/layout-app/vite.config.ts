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
      '@btc-assets': resolve(__dirname, '../../packages/shared-components/src/assets'), // 添加 @btc-assets 别名，用于图片和图标资源导入
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
    // qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun('layout', {
      // 关键：使用 useDevMode: true，与 system-app 和 admin-app 保持一致
      // 虽然理论上生产环境应该关闭，但实际测试发现 useDevMode: false 会导致入口文件及其依赖被打包到 index 中
      // 使用 useDevMode: true 可以确保代码正确拆分
      useDevMode: true,
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
  preview: {
    port: config.prePort,
    host: config.preHost,
    strictPort: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
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
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false, // 禁用 CSS 代码分割，合并所有 CSS 到一个文件（与 system-app 和 admin-app 一致）
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 禁用可能导致初始化顺序问题的压缩选项
        reduce_vars: false, // 禁用变量合并，避免 TDZ 问题
        reduce_funcs: false, // 禁用函数合并，避免依赖问题
        passes: 1, // 减少压缩次数，避免过度优化
        // 禁用可能导致依赖问题的优化
        collapse_vars: false, // 禁用变量折叠
        dead_code: false, // 禁用死代码消除（可能误删）
      },
      mangle: {
        // 禁用函数名压缩，避免压缩后找不到函数
        keep_fnames: true, // 保留函数名
        keep_classnames: true, // 保留类名
      },
      format: {
        comments: false,
      },
    },
    // 禁用内联，确保资源文件独立
    assetsInlineLimit: 0,
    outDir: 'dist',
    assetsDir: 'assets',
    // 构建前清空输出目录，确保不会残留旧文件
    emptyOutDir: true,
    rollupOptions: {
      // 强制按依赖顺序生成chunk，避免加载顺序混乱
      preserveEntrySignatures: 'strict',
      onwarn(warning, warn) {
        // 过滤动态导入和静态导入冲突的警告，因为我们已经在 manualChunks 中确保它们在同一 chunk
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        // 过滤空 chunk 警告（某些 chunk 可能因为 tree-shaking 而变空，这是正常的）
        if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
          return;
        }
        warn(warning);
      },
      output: {
        // 使用 ES 模块格式，与其他应用保持一致，便于 qiankun 加载
        format: 'esm',
        // 平衡方案：只拆分真正独立的大库，业务代码和 Vue 生态合并
        // 这样可以避免初始化顺序问题，同时控制文件大小
        inlineDynamicImports: false,
        manualChunks(id) {
          // 0. EPS 服务单独打包（所有应用共享，必须在最前面）
          if (id.includes('virtual:eps') ||
              id.includes('\\0virtual:eps') ||
              id.includes('services/eps') ||
              id.includes('services\\eps')) {
            return 'eps-service';
          }

          // 0.5. 菜单相关代码单独打包（确保菜单代码独立，便于查找和加载）
          // 包括：菜单注册表、菜单 manifest 数据、菜单注册函数
          if (id.includes('packages/subapp-manifests') ||
              id.includes('packages/shared-components/src/store/menuRegistry') ||
              id.includes('configs/layout-bridge') ||
              id.includes('@btc/subapp-manifests') ||
              id.includes('@configs/layout-bridge')) {
            return 'menu-registry';
          }

          // 1. 独立大库：ECharts（完全独立，无依赖问题）
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender') ||
              id.includes('node_modules/vue-echarts')) {
            return 'echarts-vendor';
          }

          // 2. 其他独立大库（完全独立）
          if (id.includes('node_modules/monaco-editor')) {
            return 'lib-monaco';
          }
          if (id.includes('node_modules/three')) {
            return 'lib-three';
          }

          // 3. Vue 生态库 + 所有依赖 Vue 的第三方库 + 共享组件库
          // 原因：这些库之间有强依赖关系，拆分会导致初始化顺序问题
          // 解决方案：合并到一个 vendor chunk，让 Rollup 自动处理内部依赖顺序
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/element-plus') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vueuse') ||
              id.includes('node_modules/@element-plus') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/lodash') || // 匹配 lodash 和 lodash-es
              id.includes('node_modules/@vue') ||
              id.includes('packages/shared-components') ||
              id.includes('packages/shared-core') ||
              id.includes('packages/shared-utils')) {
            return 'vendor';
          }

          // 4. 所有其他业务代码合并到主文件
          // 原因：业务代码之间有强依赖，拆分会导致初始化顺序问题
          // 解决方案：合并到一起，让 Rollup 自动处理内部依赖顺序
          return undefined; // 返回 undefined 表示合并到入口文件
        },
        preserveModules: false,
        // 确保模块按正确的顺序输出，避免初始化顺序问题
        generatedCode: {
          constBindings: false, // 不使用 const，避免 TDZ 问题
        },
        // 使用 Rollup 的 [hash] 占位符（基于内容计算，类似 Webpack 的 contenthash）
        // 注意：Rollup 不支持 [contenthash:8] 或长度限制，只能使用 [hash]
        // Rollup 的 [hash] 就是基于文件内容计算的，只有内容变化时哈希才变
        // 关键：将所有资源文件放到 assets/layout/ 子目录，便于 Nginx 区分 layout-app 和子应用的资源
        chunkFileNames: 'assets/layout/[name]-[hash].js',
        entryFileNames: 'assets/layout/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/layout/[name]-[hash].css';
          }
          return 'assets/layout/[name]-[hash].[ext]';
        },
      },
    },
  },
});

