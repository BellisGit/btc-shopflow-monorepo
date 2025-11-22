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
import { proxy as mainProxy } from '../admin-app/src/config/proxy';

const proxy = mainProxy;

// CORS 预检请求处理插件（仅处理 API 请求）
const corsPreflightPlugin = (): Plugin => {
  return {
    name: 'cors-preflight',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 只处理 API 路径的 OPTIONS 预检请求，静态资源不需要
        if (req.method === 'OPTIONS' && req.url?.startsWith('/api')) {
          const origin = req.headers.origin || '*';
          const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
          
          res.writeHead(200, {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': requestHeaders,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Content-Length': '0',
          });
          res.end();
          return;
        }
        next();
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
    createAutoImportConfig({ includeShared: true }),
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
    port: 8080,
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
        manualChunks(id) {
          // 处理 node_modules 依赖，进行代码分割
          if (id.includes('node_modules')) {

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
              return 'app-components';
            }
            if (id.includes('src/micro')) {
              return 'app-micro';
            }
            if (id.includes('src/plugins')) {
              // system-app 有多个插件，可以进一步细分
              if (id.includes('src/plugins/user-setting')) {
                return 'app-plugin-user-setting';
              }
              if (id.includes('src/plugins/echarts')) {
                return 'app-plugin-echarts';
              }
              return 'app-plugins';
            }
            if (id.includes('src/store')) {
              return 'app-store';
            }
            if (id.includes('src/services')) {
              return 'app-services';
            }
            if (id.includes('src/utils')) {
              // system-app 的 utils 有特殊的管理器
              if (id.includes('src/utils/message-manager')) {
                return 'app-utils-message';
              }
              if (id.includes('src/utils/notification-manager')) {
                return 'app-utils-notification';
              }
              return 'app-utils';
            }
            if (id.includes('src/composables')) {
              return 'app-composables';
            }
            if (id.includes('src/bootstrap')) {
              return 'app-bootstrap';
            }
            if (id.includes('src/config')) {
              return 'app-config';
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
            if (id.includes('src/types')) {
              return 'app-types';
            }
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

          // 对于非 external 的 node_modules 依赖
          if (id.includes('node_modules')) {
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
            return 'vendor';
          }

          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
