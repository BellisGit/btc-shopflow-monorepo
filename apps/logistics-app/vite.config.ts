import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc, copyLogoPlugin } from '@btc/vite-plugin';
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

// 判断是否为预览构建（用于本地预览测试）
// 生产构建应该使用相对路径，让浏览器根据当前域名自动解析
const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
// 注意：由于主应用使用 scriptType: 'module' 加载子应用，所有子应用都应构建为 ES 模块格式
// 与其他应用（admin-app, quality-app 等）保持一致，统一使用 ES 模块格式
const enableUmdBuild = false; // 始终使用 ES 模块格式，与主应用的 scriptType: 'module' 配置一致

const getManualChunkName = (id: string) => {
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
      return 'app-src';
    }
    if (id.includes('src/store')) {
      return 'app-src';
    }
    if (id.includes('src/services')) {
      return 'app-src';
    }
    if (id.includes('src/utils')) {
      return 'app-src';
    }
    if (id.includes('src/composables')) {
      return 'app-composables';
    }
    if (id.includes('src/bootstrap')) {
      return 'app-src';
    }
    if (id.includes('src/config')) {
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
};

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
  // 关键：base 配置
  // - 预览构建（VITE_PREVIEW=true）：使用绝对路径，便于远程调试
  // - 正式/生产构建：使用相对路径（/），让浏览器根据当前域名自动解析
  //   当直接访问 logistics.bellis.com.cn 时，资源路径为 /assets/...，nginx 配置中的 /assets/ location 可以正确匹配
  //   当主应用通过 /micro-apps/logistics/ 路径加载时，nginx 配置中的 /micro-apps/logistics/ location 会处理路径重写
  base: isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : '/',
  // 配置 publicDir，指向共享组件库的 public 目录，以便访问 logo.png 等静态资源
  // logo.png 从共享组件库复制，确保所有应用使用相同的 logo
  publicDir: resolve(__dirname, '../../packages/shared-components/public'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@services': resolve(__dirname, 'src/services'),
      '@configs': resolve(__dirname, '../../configs'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@btc/subapp-manifests': resolve(__dirname, '../../packages/subapp-manifests/src'),
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
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
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
    copyLogoPlugin(), // 复制 logo.png 到 dist 目录
    qiankun('logistics', {
      // 仅在开发环境使用 devMode，生产构建输出 ES 模块，供 qiankun 以 module 方式加载
      useDevMode: process.env.NODE_ENV === 'development',
    }),
    // 确保构建后的 HTML 中的 script 标签有 type="module"
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
    target: 'es2018', // 与 qiankun 兼容的最低目标
    cssTarget: 'chrome61',
    sourcemap: false,
    rollupOptions: {
      output: {
        format: 'esm', // 明确指定输出格式为 ESM，与主应用的 scriptType: 'module' 配置一致
        manualChunks: getManualChunkName,
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
