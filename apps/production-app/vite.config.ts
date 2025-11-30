import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc } from '@btc/vite-plugin';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('production-app');
const APP_PORT = config.prePort;
const APP_HOST = config.preHost;
const MAIN_APP_ORIGIN = config.mainAppOrigin;

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

export default defineConfig(({ command, mode }) => {
  // 关键：base 配置
  // - 开发模式（vite dev）：使用绝对路径，确保资源路径正确（用于 qiankun 主应用加载）
  // - 构建模式（vite build）：根据环境变量决定 base
  //   - 如果设置了 VITE_PREVIEW=true，使用绝对路径（http://localhost:4184/），用于本地预览测试
  //   - 否则使用相对路径（/），让浏览器根据当前域名（production.bellis.com.cn）自动解析
  // - 预览模式（vite preview）：使用已构建的产物，base 在构建时已确定
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const base = isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : '/';

  return {
  base,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@btc/subapp-manifests': resolve(__dirname, '../../packages/subapp-manifests/src'),
      '@configs': resolve(__dirname, '../../configs'),
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
    btc({
      type: 'subapp',
    }),
    qiankun('production', {
      useDevMode: true,
    }),
  ],
  server: {
    port: config.devPort,
    host: '0.0.0.0',
    cors: true,
    origin: `http://${config.devHost}:${config.devPort}`,
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      protocol: 'ws',
      host: config.devHost, // HMR WebSocket 需要使用配置的主机，浏览器无法连接 0.0.0.0
      port: config.devPort,
      overlay: false, // 关闭热更新错误浮层，减少开销
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
  // 预览服务器配置（启动构建产物的静态服务器）
  preview: {
    port: APP_PORT,
    strictPort: true, // 端口被占用时报错，避免自动切换
    open: false, // 启动后不自动打开浏览器
    host: '0.0.0.0',
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
    cssCodeSplit: true, // 启用 CSS 代码分割
    cssMinify: true, // 压缩 CSS
    assetsInlineLimit: 0, // 禁止内联任何资源（确保 JS/CSS 都是独立文件）
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      // 抑制 Rollup 关于动态/静态导入冲突的警告
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        warn(warning);
      },
      output: {
        format: 'esm', // 明确指定输出格式为 ESM
        inlineDynamicImports: false, // 禁用动态导入内联，确保 CSS 被提取
        manualChunks(id) {
          // 重要：Element Plus 的匹配必须在最前面
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus';
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

          // 处理业务代码分割
          if (id.includes('src/') && !id.includes('node_modules')) {
            // 可以根据需要进一步分割业务代码
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
  },
  };
});
