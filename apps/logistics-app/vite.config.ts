import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc } from '@btc/vite-plugin';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';
import { getAppConfig } from '../../configs/app-env.config';

const proxy = mainProxy;

// 从统一配置中获取应用配置
const appConfig = getAppConfig('logistics-app');
if (!appConfig) {
  throw new Error('未找到 logistics-app 的环境配置');
}

// 子应用预览端口和主机（预览环境使用）
const APP_PORT = parseInt(appConfig.prePort, 10);
const APP_HOST = appConfig.preHost;
const MAIN_APP_CONFIG = getAppConfig('system-app');
const MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : 'http://localhost:4180';

// CORS 插件（支持 credentials）
const corsPlugin = (): Plugin => {
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
    name: 'cors-with-credentials',
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
  // 关键：base 指向子应用本地预览的绝对路径（必须带末尾 /）
  // 这样构建产物中的资源路径会基于这个 base URL
  base: `http://${APP_HOST}:${APP_PORT}/`,
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
    corsPlugin(), // 添加 CORS 插件，支持 credentials
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
    port: parseInt(appConfig.devPort, 10),
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
      host: appConfig.devHost, // HMR WebSocket 需要使用配置的主机，浏览器无法连接 0.0.0.0
      port: parseInt(appConfig.devPort, 10),
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
  // 预览服务器配置（启动构建产物的静态服务器）
  preview: {
    port: APP_PORT,
    strictPort: true, // 端口被占用时报错，避免自动切换
    open: false, // 启动后不自动打开浏览器
    host: '0.0.0.0',
    proxy,
    headers: {
      // 允许主应用（4180）跨域访问当前子应用资源
      'Access-Control-Allow-Origin': MAIN_APP_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    historyApiFallback: true, // 支持单页应用路由（避免子应用路由刷新 404）
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
          // 重要：Element Plus 的匹配必须在最前面，确保所有 element-plus 相关代码都在同一个 chunk
          // 避免 Vite 的自动代码分割将 element-plus 分割成多个 chunk（如 element-layout、element-data、element-feedback 等）
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus';
          }

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
              // 插件与 bootstrap 有依赖关系（bootstrap 会扫描插件），合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/store')) {
              // store 与 bootstrap 有依赖关系，合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/services')) {
              // services 与 bootstrap 有依赖关系，合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/utils')) {
              // utils 与 bootstrap 有依赖关系，合并到 app-src 避免循环依赖
              return 'app-src';
            }
            if (id.includes('src/composables')) {
              return 'app-composables';
            }
            if (id.includes('src/bootstrap')) {
              // bootstrap 与多个模块有依赖关系，放在 app-src 中
              return 'app-src';
            }
            if (id.includes('src/config')) {
              // config 可能依赖 plugins，合并到 app-src 避免循环依赖
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
            if (id.includes('src/types')) {
              // types 通常很小，合并到 app-src 避免空 chunk
              return 'app-src';
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
    chunkSizeWarningLimit: 2000, // 提高警告阈值，element-plus chunk 较大是正常的
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
