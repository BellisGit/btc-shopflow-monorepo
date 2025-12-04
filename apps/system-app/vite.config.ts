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
import { proxy } from './src/config/proxy';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('system-app');

// CORS 预检请求处理插件（处理 API 请求和所有请求的 CORS 头）
const corsPreflightPlugin = (): Plugin => {
  // CORS 中间件函数（用于开发服务器）
  const corsDevMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    // 设置 CORS 响应头（所有请求都需要）
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      // Chrome 私有网络访问要求（仅开发服务器需要）
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    } else {
      // 如果没有 origin，也设置基本的 CORS 头（允许所有来源）
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      // Chrome 私有网络访问要求（仅开发服务器需要）
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // 处理 OPTIONS 预检请求 - 必须在任何其他处理之前返回
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  };

  // CORS 中间件函数（用于预览服务器，不需要私有网络访问头）
  const corsPreviewMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    // 设置 CORS 响应头（所有请求都需要）
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    } else {
      // 如果没有 origin，也设置基本的 CORS 头（允许所有来源）
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    }

    // 处理 OPTIONS 预检请求 - 必须在任何其他处理之前返回
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
    name: 'cors-preflight',
    configureServer(server) {
      // 开发服务器：包含私有网络访问头
      server.middlewares.use((req, res, next) => {
        corsDevMiddleware(req, res, next);
      });
    },
    configurePreviewServer(server) {
      // 预览服务器：不包含私有网络访问头
      server.middlewares.use((req, res, next) => {
        corsPreviewMiddleware(req, res, next);
      });
    },
  };
};

export default defineConfig({
  base: '/', // 明确设置为根路径，不使用 /logistics/
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@services': resolve(__dirname, 'src/services'),
      '@auth': resolve(__dirname, '../../auth'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@btc/subapp-manifests': resolve(__dirname, '../../packages/subapp-manifests/src/index.ts'),
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@assets': resolve(__dirname, '../../packages/shared-components/src/assets'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': resolve(__dirname, '../../packages/shared-components/src/charts/utils/css-var'),
      '@charts-utils/color': resolve(__dirname, '../../packages/shared-components/src/charts/utils/color'),
      '@charts-utils/gradient': resolve(__dirname, '../../packages/shared-components/src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': resolve(__dirname, '../../packages/shared-components/src/charts/composables/useChartComponent'),
      '@charts-types': resolve(__dirname, '../../packages/shared-components/src/charts/types'),
      '@charts-utils': resolve(__dirname, '../../packages/shared-components/src/charts/utils'),
      '@charts-composables': resolve(__dirname, '../../packages/shared-components/src/charts/composables'),
      '@configs': resolve(__dirname, '../../configs'),
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia'],
  },
  plugins: [
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    UnoCSS({
      configFile: resolve(__dirname, '../../uno.config.ts'),
    }),
    VueI18nPlugin({
      include: [
        resolve(__dirname, 'src/locales/**'),
        resolve(__dirname, 'src/{modules,plugins}/**/locales/**'),
        resolve(__dirname, '../../packages/shared-components/src/locales/**'),
        resolve(__dirname, '../../packages/shared-components/src/plugins/**/locales/**'),
        resolve(__dirname, '../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts'),
        resolve(__dirname, '../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts'),
      ],
      runtimeOnly: true,
    }),
    corsPreflightPlugin(), // 添加 CORS 预检请求处理插件
    btc({
      type: 'admin',
      proxy,
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
      },
    }),
  ],
  server: {
    port: config.devPort,
    host: '0.0.0.0',
    strictPort: false,
    proxy,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      strict: false,
      allow: [
        resolve(__dirname, '../..'),
        resolve(__dirname, '../../packages'),
        resolve(__dirname, '../../packages/shared-components/src'),
      ],
    },
  },
  preview: {
    port: config.prePort,
    host: '0.0.0.0',
    proxy,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      'echarts',
      'vue-echarts',
      '@vueuse/core',
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  build: {
    // 主应用不应该使用 external，所有依赖都应该被打包
    // external 配置仅用于子应用（微前端场景）
    // 提高 chunk 大小警告阈值，避免不必要的警告
    chunkSizeWarningLimit: 2000,
    // 构建前清空输出目录，确保不会残留旧文件
    emptyOutDir: true,
    rollupOptions: {
      // 注意：不在这里配置 treeshake，使用 package.json 的 sideEffects 标记
      // treeshake 配置可能会影响代码分割逻辑，导致某些 chunk 被合并
      // package.json 中的 sideEffects 标记已经足够防止 EPS 模块被 tree-shaking 移除
      output: {
        // 确保相对路径的 import 使用正确的 base URL
        // 这样在微前端场景下，资源路径会正确解析
        format: 'es',
        // 确保所有 chunk 之间的 import 使用相对路径
        // 这样浏览器会根据当前模块的位置解析，而不是根据页面 URL
        preserveModules: false,
        manualChunks(id) {
          // ========================================
          // EPS 代码分割配置
          // ========================================
          // 将 EPS (Endpoint Service) 数据单独拆分，便于线上排查和调试
          // 
          // 说明：
          // 1. virtual:eps 是虚拟模块，由 @btc/vite-plugin 的 epsPlugin 生成
          // 2. 所有导入 virtual:eps 的模块（如 App.vue、services/eps.ts）会被打包到同一个 chunk
          // 3. chunk 名称：eps-contract，最终生成文件：eps-contract-[hash].js
          // 4. 如果构建产物中没有 eps-contract-*.js 文件，说明：
          //    - EPS 数据未生成（检查 build/eps 目录）
          //    - 或者 virtual:eps 未被正确导入
          //    - 或者 EPS 数据为空（所有代码被 tree-shaking 移除）
          if (id.includes('virtual:eps')) {
            return 'eps-contract';
          }

          // 处理 node_modules 依赖，进行代码分割
          if (id.includes('node_modules')) {
            // 进一步分割大型库，减少 vendor chunk 大小
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'vue-i18n';
            }
            if (id.includes('unocss') || id.includes('@unocss')) {
              return 'lib-unocss';
            }
            if (id.includes('echarts')) {
              return 'lib-echarts';
            }
            if (id.includes('qiankun')) {
              return 'qiankun';
            }
            if (id.includes('xlsx')) {
              return 'file-xlsx';
            }
            if (id.includes('file-saver')) {
              return 'file-saver';
            }
            // 分割 Element Plus 相关依赖
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            // 分割 Vue 相关依赖
            if (id.includes('vue') && !id.includes('vue-router')) {
              return 'vue-core';
            }
            if (id.includes('vue-router')) {
              return 'vue-router';
            }
            // 分割 Pinia
            if (id.includes('pinia')) {
              return 'pinia';
            }
            return 'vendor';
          }

          if (id.includes('src/') && !id.includes('node_modules')) {
            // 只对大的 modules 进行分包，小的模块合并到 app-src
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              // module-base 与 app-src 存在循环依赖，合并到 app-src 避免初始化顺序问题
              // 只对真正大的业务模块进行分包，避免循环依赖导致的初始化错误
              if (moduleName && ['api-services', 'customs', 'data', 'home', 'procurement', 'warehouse'].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              // base 模块和其他小模块合并到 app-src，避免循环依赖和加载顺序问题
              return 'app-src';
            }
            // 其他所有业务代码合并到 app-src，避免过细分割
            // 这样可以避免小 chunk 导致的加载顺序问题和 Vue 组件初始化错误
            return 'app-src';
          }

          if (id.includes('@btc/shared-')) {
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            if (id.includes('@btc/subapp-manifests')) {
              return 'btc-manifests';
            }
            return 'btc-shared';
          }

          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      onwarn(warning, warn) {
        // 过滤动态导入和静态导入冲突的警告，因为我们已经在 manualChunks 中确保它们在同一 chunk
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            (warning.message && warning.message.includes('dynamically imported') && warning.message.includes('statically imported'))) {
          return;
        }
        warn(warning);
      },
    },
  },
});
