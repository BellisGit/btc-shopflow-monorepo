import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';
import { btc } from '@btc/vite-plugin';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';

const proxy = mainProxy;

export default defineConfig({
  base: '/', // 明确设置为根路径，不使用 /logistics/
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@services': resolve(__dirname, 'src/services'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
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
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia', 'dayjs'],
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
    btc({
      type: 'subapp',
      proxy,
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
      },
    }),
    qiankun('logistics', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 8082,
    host: '0.0.0.0',
    strictPort: false,
    proxy,
    cors: {
      origin: '*', // 开发环境允许所有跨域（生产环境替换为主应用域名）
      methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
      exposedHeaders: ['Access-Control-Allow-Origin'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost', // HMR WebSocket 需要使用 localhost，浏览器无法连接 0.0.0.0
      port: 8082,
      overlay: false, // 关闭热更新错误浮层，减少开销
    },
    fs: {
      strict: false,
      allow: [
        resolve(__dirname, '../..'),
        resolve(__dirname, '../../packages'),
        resolve(__dirname, '../../packages/shared-components/src'),
      ],
      // 启用缓存，加速依赖加载
      cachedChecks: true,
    },
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
    target: 'es2020', // 兼容 ES 模块的最低目标
    sourcemap: false, // 开发环境关闭 sourcemap，减少文件体积和加载时间
    rollupOptions: {
      output: {
        format: 'esm', // 明确指定输出格式为 ESM
        manualChunks(id) {
          if (id.includes('src/') && !id.includes('node_modules')) {
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ['customs', 'home', 'procurement', 'warehouse'].includes(moduleName)) {
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
              return 'app-plugins';
            }
            if (id.includes('src/store')) {
              return 'app-store';
            }
            if (id.includes('src/services')) {
              return 'app-services';
            }
            if (id.includes('src/utils')) {
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
            return 'btc-shared';
          }

          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-vendor';
          }

          if (id.includes('node_modules/element-plus')) {
            if (id.includes('/theme') || id.includes('/utils') || id.includes('/locale') || id.includes('/directives')) {
              return 'element-core';
            }
            if (id.includes('/button') || id.includes('/input') || id.includes('/form') || id.includes('/select') || id.includes('/checkbox') || id.includes('/radio') || id.includes('/switch')) {
              return 'element-basic';
            }
            if (id.includes('/layout') || id.includes('/container') || id.includes('/row') || id.includes('/col') || id.includes('/grid') || id.includes('/divider')) {
              return 'element-layout';
            }
            if (id.includes('/table') || id.includes('/pagination') || id.includes('/tree') || id.includes('/calendar') || id.includes('/tag') || id.includes('/badge') || id.includes('/card')) {
              return 'element-data';
            }
            if (id.includes('/dialog') || id.includes('/drawer') || id.includes('/message') || id.includes('/notification') || id.includes('/popover') || id.includes('/tooltip') || id.includes('/alert') || id.includes('/loading')) {
              return 'element-feedback';
            }
            if (id.includes('/menu') || id.includes('/breadcrumb') || id.includes('/tabs') || id.includes('/steps') || id.includes('/affix') || id.includes('/backtop')) {
              return 'element-navigation';
            }
            if (id.includes('/date-picker') || id.includes('/time-picker') || id.includes('/cascader') || id.includes('/upload') || id.includes('/rate') || id.includes('/slider') || id.includes('/color-picker')) {
              return 'element-form';
            }
            return 'element-others';
          }

          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'element-icons';
          }

          if (id.includes('node_modules/axios')) {
            return 'utils-http';
          }
          if (id.includes('node_modules/@vueuse')) {
            return 'utils-vueuse';
          }
          if (id.includes('node_modules/dayjs') || id.includes('node_modules/moment')) {
            return 'utils-date';
          }
          if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
            return 'utils-lodash';
          }

          if (id.includes('node_modules')) {
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'vue-i18n';
            }
            if (id.includes('xlsx')) {
              return 'file-xlsx';
            }
            if (id.includes('file-saver')) {
              return 'file-saver';
            }
            if (id.includes('qiankun')) {
              return 'qiankun';
            }
            if (id.includes('echarts')) {
              return 'lib-echarts';
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
  optimizeDeps: {
    // 启用依赖预构建，加速开发环境模块加载
    // 显式声明需要预构建的第三方依赖，避免 Vite 漏判导致实时编译耗时
    include: [
      'vue',
      'vue-router',
      'pinia',
      'dayjs',
      'element-plus',
      '@element-plus/icons-vue',
      '@btc/shared-core',
      '@btc/shared-components',
      '@btc/shared-utils',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // 强制预构建，即使依赖已经是最新的
    force: false,
  },
});
