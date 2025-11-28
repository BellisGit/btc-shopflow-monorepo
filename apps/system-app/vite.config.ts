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
    rollupOptions: {
      output: {
        // 确保相对路径的 import 使用正确的 base URL
        // 这样在微前端场景下，资源路径会正确解析
        format: 'es',
        // 确保所有 chunk 之间的 import 使用相对路径
        // 这样浏览器会根据当前模块的位置解析，而不是根据页面 URL
        preserveModules: false,
        manualChunks(id) {
          // 将 EPS 数据单独拆分，便于线上排查
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
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ['api-services', 'base', 'customs', 'data', 'home', 'procurement', 'warehouse'].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              return 'module-others';
            }
            if (id.includes('src/pages')) {
              return 'app-pages';
            }
            if (id.includes('src/components')) {
              // components 依赖 useSettingsState（在 app-src 中），合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/micro')) {
              return 'app-micro';
            }
            if (id.includes('src/plugins/user-setting/components')) {
              // 将 user-setting 的组件放到 app-components，避免循环依赖
              return 'app-components';
            }
            if (id.includes('src/plugins')) {
              // system-app 有多个插件，可以进一步细分
              // 注意：user-setting 插件与 store 之间存在依赖关系，
              // 将它们放在 store 之后但在其他插件之前，避免循环依赖问题
              if (id.includes('src/plugins/user-setting')) {
                // user-setting 插件与 store 有依赖关系，但 bootstrap 也依赖它
                // 将它们都放在 app-src 中，避免跨 chunk 循环依赖
                return 'app-src';
              }
              if (id.includes('src/plugins/echarts')) {
                return 'app-plugin-echarts';
              }
              // 其他插件与 bootstrap 有依赖关系（bootstrap 会扫描插件），放在 app-src 中
              // 避免 bootstrap 和 plugins 之间的循环依赖
              return 'app-src';
            }
            if (id.includes('src/store')) {
              // store 与 bootstrap 有依赖关系（bootstrap 导出 store），放在 app-src 中
              // 避免 bootstrap（app-src）和 store（app-store）之间的循环依赖
              return 'app-src';
            }
            if (id.includes('src/bootstrap')) {
              // bootstrap 与 main.ts、services 和 store 有依赖关系，放在 app-src 中
              return 'app-src';
            }
            if (id.includes('src/services')) {
              // services 与 main.ts 和 bootstrap 有依赖关系，放在 app-src 中
              return 'app-src';
            }
            if (id.includes('src/utils')) {
              // utils 与 bootstrap 有依赖关系（bootstrap 导入多个 utils），放在 app-src 中
              // 避免 bootstrap（app-src）和 utils（app-utils）之间的循环依赖
              return 'app-src';
            }
            if (id.includes('src/composables')) {
              return 'app-composables';
            }
            if (id.includes('src/config')) {
              // config 依赖 plugins/user-setting/config/enums（在 app-src 中），合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/router')) {
              return 'app-router';
            }
            if (id.includes('src/i18n')) {
              return 'app-i18n';
            }
            if (id.includes('src/assets')) {
              return 'app-assets';
            }
            // 移除 src/types 的单独 chunk
            // types 目录中的文件通常很小，合并到 app-src 即可
            // 避免生成空 chunk 警告
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
    },
    chunkSizeWarningLimit: 2000, // 提高警告阈值，vendor chunk 较大是正常的
  },
});
