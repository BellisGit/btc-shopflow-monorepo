import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { btc, copyLogoPlugin, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { proxy as mainProxy } from '../admin-app/src/config/proxy';
import { getAppConfig } from '../../configs/app-env.config';

// 插件：将构建产物中的绝对路径资源引用转换为相对路径
// 这样在 qiankun 环境下，资源路径会根据 base 标签正确解析
const relativeAssetsPlugin = (): Plugin => {
  return {
    name: 'relative-assets',
    generateBundle(options, bundle) {
      // 遍历所有生成的 chunk
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 将绝对路径 /assets/ 替换为相对路径 ./assets/
          // 这样在 qiankun 环境下，base 标签会让相对路径正确解析
          chunk.code = chunk.code.replace(/(["'`])\/assets\/([^"'`\s]+)/g, '$1./assets/$2');
        }
      }
    },
  };
};

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

// 构建前清理 dist 目录插件
const cleanDistPlugin = (): Plugin => {
  return {
    name: 'clean-dist-plugin',
    buildStart() {
      const distDir = resolve(__dirname, 'dist');
      if (existsSync(distDir)) {
        console.log('[clean-dist-plugin] 🧹 清理旧的 dist 目录...');
        try {
          rmSync(distDir, { recursive: true, force: true });
          console.log('[clean-dist-plugin] ✅ dist 目录已清理');
        } catch (error) {
          console.warn('[clean-dist-plugin] ⚠️ 清理 dist 目录失败，继续构建:', error);
        }
      }
    },
  };
};

// 验证所有 chunk 生成插件
const chunkVerifyPlugin = (): Plugin => {
  return {
    name: 'chunk-verify-plugin',
    writeBundle(options, bundle) {
      console.log('\n[chunk-verify-plugin] ✅ 生成的所有 chunk 文件：');
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      console.log(`\nJS chunk（共 ${jsChunks.length} 个）：`);
      jsChunks.forEach(chunk => console.log(`  - ${chunk}`));

      console.log(`\nCSS chunk（共 ${cssChunks.length} 个）：`);
      cssChunks.forEach(chunk => console.log(`  - ${chunk}`));

      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      const indexSize = indexChunk ? (bundle[indexChunk] as any)?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;

      const missingRequiredChunks: string[] = [];
      if (!indexChunk) {
        missingRequiredChunks.push('index');
      }

      const hasEpsService = jsChunks.some(jsChunk => jsChunk.includes('eps-service'));
      const hasEchartsVendor = jsChunks.some(jsChunk => jsChunk.includes('echarts-vendor'));
      const hasLibMonaco = jsChunks.some(jsChunk => jsChunk.includes('lib-monaco'));
      const hasLibThree = jsChunks.some(jsChunk => jsChunk.includes('lib-three'));

      console.log(`\n[chunk-verify-plugin] 📦 构建情况（平衡拆分策略）：`);
      if (indexChunk) {
        console.log(`  ✅ index: 主文件（Vue生态 + Element Plus + 业务代码，体积~${indexSizeMB.toFixed(2)}MB 未压缩，gzip后~${(indexSizeMB * 0.3).toFixed(2)}MB）`);
      } else {
        console.log(`  ❌ 入口文件不存在`);
      }
      if (hasEpsService) console.log(`  ✅ eps-service: EPS 服务（所有应用共享，单独打包）`);
      if (hasEchartsVendor) console.log(`  ✅ echarts-vendor: ECharts + zrender（独立大库，无依赖问题）`);
      if (hasLibMonaco) console.log(`  ✅ lib-monaco: Monaco Editor（独立大库）`);
      if (hasLibThree) console.log(`  ✅ lib-three: Three.js（独立大库）`);
      console.log(`  ℹ️  业务代码和 Vue 生态合并到主文件，避免初始化顺序问题`);

      if (missingRequiredChunks.length > 0) {
        console.error(`\n[chunk-verify-plugin] ❌ 缺失核心 chunk：`, missingRequiredChunks);
        throw new Error(`核心 chunk 缺失，构建失败！`);
      } else {
        console.log(`\n[chunk-verify-plugin] ✅ 核心 chunk 全部存在`);
      }
    },
  };
};

// 优化代码分割插件：处理空 chunk，避免运行时 404
const optimizeChunksPlugin = (): Plugin => {
  return {
    name: 'optimize-chunks',
    generateBundle(options, bundle) {
      const emptyChunks: string[] = [];
      const chunkReferences = new Map<string, string[]>();

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunk.type === 'chunk' && chunk.imports) {
          for (const imported of chunk.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported)!.push(fileName);
          }
        }
      }

      if (emptyChunks.length === 0) {
        return;
      }

      const chunksToRemove: string[] = [];
      const chunksToKeep: string[] = [];

      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
        if (referencedBy.length > 0) {
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === 'chunk') {
            chunk.code = 'export {};';
            chunksToKeep.push(emptyChunk);
            console.log(`[optimize-chunks] 保留被引用的空 chunk: ${emptyChunk} (被 ${referencedBy.length} 个 chunk 引用，已添加占位符)`);
          }
        } else {
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }

      if (chunksToRemove.length > 0) {
        console.log(`[optimize-chunks] 移除了 ${chunksToRemove.length} 个未被引用的空 chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        console.log(`[optimize-chunks] 保留了 ${chunksToKeep.length} 个被引用的空 chunk（已添加占位符）:`, chunksToKeep);
      }
    },
  };
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
    cleanDistPlugin(), // 0. 构建前清理 dist 目录（最前面）
    corsPlugin(), // 1. CORS 插件（不干扰构建）
    vue({
      // 2. Vue 插件（核心构建插件）
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    createAutoImportConfig({ includeShared: true }), // 3. 自动导入插件
    createComponentsConfig({ includeShared: true }), // 4. 组件自动注册插件
    btc({
      // 5. 业务插件
      type: 'subapp',
      proxy,
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
      },
    }),
    copyLogoPlugin(), // 6. 复制 logo.png 到 dist 目录
    // 7. qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun('logistics', {
      useDevMode: true,
    }),
    // 8. 将构建产物中的绝对路径资源引用转换为相对路径
    // 这样在 qiankun 环境下，资源路径会根据 base 标签正确解析
    relativeAssetsPlugin(),
    // 9. 确保构建后的 HTML 中的 script 标签有 type="module"，并将绝对路径转换为相对路径
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        // 将 HTML 中的绝对路径 /assets/ 转换为相对路径 ./assets/
        // 这样在 qiankun 环境下，base 标签会让相对路径正确解析
        let processedHtml = html.replace(/(href|src)=["']\/assets\/([^"']+)["']/gi, '$1="./assets/$2"');

        // 确保所有 script 标签都有 type="module"
        processedHtml = processedHtml.replace(
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

        return processedHtml;
      },
    } as Plugin,
    // 10. 兜底插件（路径修复、chunk 优化，在最后）
    fixChunkReferencesPlugin(), // 修复 chunk 之间的引用关系（轻量级，不修改第三方库）
    optimizeChunksPlugin(), // 恢复空 chunk 处理（仅移除未被引用的空 chunk）
    chunkVerifyPlugin(), // 新增：chunk 验证插件
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
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
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
        // 注意：这会导致文件体积增大，但可以避免运行时错误
        keep_fnames: true, // 保留函数名
        keep_classnames: true, // 保留类名
      },
      format: {
        // 保留注释，便于调试
        comments: false,
      },
    },
    // 关键修改1：小资源内联（减少请求数，不影响大包拆分）
    // 10KB以下的资源内联，避免小图标/小css拆成独立文件
    assetsInlineLimit: 10 * 1024,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      // 关键修改2：移除Rollup手动cache（Vite自有缓存更稳定）
      // cache: true,
      // 强制按依赖顺序生成chunk，避免加载顺序混乱
      preserveEntrySignatures: 'strict',
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

          // 3. 所有其他代码（Vue生态 + Element Plus + 业务代码）合并到主文件
          // 原因：Vue生态和业务代码之间有强依赖，拆分会导致初始化顺序问题
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
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
      external: [],
      // 关键修改5：禁用tree-shaking（避免循环依赖导致的初始化顺序问题）
      // 原因：即使合并到同一chunk，tree-shaking可能改变模块初始化顺序，导致"Cannot access 'ut' before initialization"错误
      // 解决方案：禁用tree-shaking，确保所有模块按原始顺序初始化
      treeshake: false,
    },
    // 关键修改6：降低警告阈值（及时发现大包问题）
    chunkSizeWarningLimit: 1000,
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
