import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';
import { btc } from '@btc/vite-plugin';
import { getAppConfig } from '../../configs/app-env.config';

// 从统一配置中获取应用配置
const appConfig = getAppConfig('admin-app');
if (!appConfig) {
  throw new Error('未找到 admin-app 的环境配置');
}

// 子应用预览端口和主机（预览环境使用）
const APP_PORT = parseInt(appConfig.prePort, 10);
const APP_HOST = appConfig.preHost;
const MAIN_APP_CONFIG = getAppConfig('system-app');
const MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : 'http://localhost:4180';

// 判断是否为预览构建（用于本地预览测试）
// 生产构建应该使用相对路径，让浏览器根据当前域名自动解析
const isPreviewBuild = process.env.VITE_PREVIEW === 'true';

// 验证所有 chunk 生成插件
const chunkVerifyPlugin = (): Plugin => {
  return {
    name: 'chunk-verify-plugin',
    writeBundle(options, bundle) {
      console.log('\n[chunk-verify-plugin] ✅ 生成的所有 chunk 文件：');
      // 分类打印 JS chunk、CSS chunk、其他资源
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      console.log(`\nJS chunk（共 ${jsChunks.length} 个）：`);
      jsChunks.forEach(chunk => console.log(`  - ${chunk}`));

      console.log(`\nCSS chunk（共 ${cssChunks.length} 个）：`);
      cssChunks.forEach(chunk => console.log(`  - ${chunk}`));

      // 检查核心 chunk 是否存在（避免关键依赖丢失）
      // 注意：vue-vendor 可能被拆分为 vue-core、vue-router、pinia，所以检查这些
      const requiredChunks = ['element-plus', 'vendor'];
      const vueChunks = ['vue-core', 'vue-router', 'pinia', 'vue-vendor'];
      const hasVueChunk = vueChunks.some(chunkName =>
        jsChunks.some(jsChunk => jsChunk.includes(chunkName))
      );
      const missingRequiredChunks = requiredChunks.filter(chunkName =>
        !jsChunks.some(jsChunk => jsChunk.includes(chunkName))
      );

      // 检查 app-src 是否存在，如果不存在但 index 文件很大，说明应用代码被打包到了入口文件
      const hasAppSrc = jsChunks.some(jsChunk => jsChunk.includes('app-src'));
      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      const indexSize = indexChunk ? (bundle[indexChunk] as any)?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;

      // 如果 index 文件超过 500KB，说明应用代码可能被打包到了入口文件
      // 这种情况下，我们允许没有 app-src，但会给出警告
      if (!hasAppSrc && indexSizeKB > 500) {
        console.warn(`\n[chunk-verify-plugin] ⚠️ 警告：app-src chunk 不存在，但 index 文件很大 (${indexSizeKB.toFixed(2)}KB)`);
        console.warn(`[chunk-verify-plugin] 应用代码可能被打包到了入口文件，这可能导致加载性能问题`);
        // 不抛出错误，只给出警告
      } else if (!hasAppSrc) {
        missingRequiredChunks.push('app-src');
      }

      if (!hasVueChunk) {
        missingRequiredChunks.push('vue-core/vue-router/pinia');
      }

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
      // 收集所有空 chunk
      const emptyChunks: string[] = [];
      const chunkReferences = new Map<string, string[]>(); // chunk 名称 -> 引用它的 chunk 列表

      // 第一步：找出所有空 chunk，并收集引用关系
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        // 收集 chunk 的依赖关系（哪些 chunk 引用了这个 chunk）
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

      // 第二步：对于每个空 chunk，检查是否被引用
      // 如果被引用，需要特殊处理（合并到引用它的 chunk 或保留占位符）
      const chunksToRemove: string[] = [];
      const chunksToKeep: string[] = [];

      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
          if (referencedBy.length > 0) {
          // 被引用了，不能直接删除，需要保留或合并
          // 方案：保留一个最小的有效 ES 模块代码，避免运行时错误
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === 'chunk') {
            // 创建一个最小的有效 ES 模块，避免运行时错误
            // 使用 export {} 确保它是一个有效的 ES 模块
            chunk.code = 'export {};';
            chunksToKeep.push(emptyChunk);
            console.log(`[optimize-chunks] 保留被引用的空 chunk: ${emptyChunk} (被 ${referencedBy.length} 个 chunk 引用，已添加占位符)`);
          }
        } else {
          // 没有被引用，可以安全删除
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

// 确保动态导入使用正确的 base URL 插件
const ensureBaseUrlPlugin = (): Plugin => {
  // 预览构建使用绝对路径，生产构建使用相对路径
  const baseUrl = isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : '/';
  const mainAppPort = MAIN_APP_CONFIG?.prePort || '4180'; // 主应用端口，需要替换的目标

  return {
    name: 'ensure-base-url',
    // 使用 renderChunk 钩子，在代码生成时处理
    renderChunk(code, chunk, options) {
      let newCode = code;
      let modified = false;

      // 1. 相对路径（如 /assets/xxx.js，未带端口，需拼接 base）
      const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
      if (relativePathRegex.test(newCode)) {
        newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
          // 拼接子应用 base，如 http://localhost:4181/assets/xxx.js
          return `${quote}${baseUrl.replace(/\/$/, '')}${path}`;
        });
        modified = true;
      }

      // 2. 子应用 base 被错误替换为 4180 的情况（如 http://localhost:4180/assets/xxx）
      const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}/assets/`, 'g');
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, `${baseUrl}assets/`);
        modified = true;
      }

      // 3. 协议相对路径（//localhost:4180/assets/xxx）
      const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}/assets/`, 'g');
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, `//${APP_HOST}:${APP_PORT}/assets/`);
        modified = true;
      }

      // 4. 其他可能的错误端口格式（覆盖所有情况）
      const patterns = [
        // 绝对路径，带协议
        {
          regex: new RegExp(`(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          replacement: `$1${APP_HOST}:${APP_PORT}$3`,
        },
        // 协议相对路径
        {
          regex: new RegExp(`(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          replacement: `$1${APP_HOST}:${APP_PORT}$3`,
        },
        // 字符串字面量中的路径
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          replacement: `$1$2${APP_HOST}:${APP_PORT}$4`,
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          replacement: `$1$2${APP_HOST}:${APP_PORT}$4`,
        },
      ];

      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      }

      if (modified) {
        console.log(`[ensure-base-url] 修复了 ${chunk.fileName} 中的资源路径 (${mainAppPort} -> ${APP_PORT})`);
        return {
          code: newCode,
          map: null,
        };
      }

      return null;
    },
    // 同时在 generateBundle 中处理，作为兜底
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          let newCode = chunk.code;
          let modified = false;

          // 1. 相对路径替换
          const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
          if (relativePathRegex.test(newCode)) {
            newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
              return `${quote}${baseUrl.replace(/\/$/, '')}${path}`;
            });
            modified = true;
          }

          // 2. 4180 端口替换
          const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}/assets/`, 'g');
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, `${baseUrl}assets/`);
            modified = true;
          }

          // 3. 协议相对路径替换
          const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}/assets/`, 'g');
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, `//${APP_HOST}:${APP_PORT}/assets/`);
            modified = true;
          }

          // 4. 其他错误端口格式
          const patterns = [
            new RegExp(`http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`(["'\`])http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
            new RegExp(`(["'\`])//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, 'g'),
          ];

          for (const pattern of patterns) {
            if (pattern.test(newCode)) {
              newCode = newCode.replace(pattern, (match) => {
                if (match.includes('http://')) {
                  return match.replace(new RegExp(`:${mainAppPort}`, 'g'), `:${APP_PORT}`);
                } else if (match.includes('//')) {
                  return match.replace(new RegExp(`:${mainAppPort}`, 'g'), `:${APP_PORT}`);
                }
                return match;
              });
              modified = true;
            }
          }

          if (modified) {
            chunk.code = newCode;
            console.log(`[ensure-base-url] 在 generateBundle 中修复了 ${fileName} 中的资源路径`);
          }
        }
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
    // 处理 OPTIONS 预检请求 - 必须在任何其他处理之前返回
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;

      // 设置 CORS 响应头
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      }

      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    // 对于非 OPTIONS 请求，设置 CORS 响应头
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
    }

    next();
  };

  return {
    name: 'cors-with-credentials',
    enforce: 'pre', // 确保在其他插件之前执行
    configureServer(server) {
      // 开发服务器：包含私有网络访问头
      // 直接添加到中间件栈最前面
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        // 移除可能已存在的 CORS 中间件
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        // 在最前面添加 CORS 中间件
        (server.middlewares as any).stack = [
          { route: '', handle: corsDevMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server) {
      // 预览服务器：不包含私有网络访问头
      const stack = (server.middlewares as any).stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter((item: any) =>
          item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        (server.middlewares as any).stack = [
          { route: '', handle: corsPreviewMiddleware },
          ...filteredStack,
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    },
  };
};

const withSrc = (relativePath: string) =>
  resolve(fileURLToPath(new URL('.', import.meta.url)), relativePath);

const withPackages = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../../packages', import.meta.url)), relativePath);

const withRoot = (relativePath: string) =>
  resolve(fileURLToPath(new URL('../..', import.meta.url)), relativePath);

// 确保 CSS 文件被正确打包的插件（增强版诊断 + 强制提取）
const ensureCssPlugin = (): Plugin => {
  return {
    name: 'ensure-css-plugin',
    generateBundle(options, bundle) {
      // 在 generateBundle 阶段检查，确保 CSS 没有被内联
      // 检查是否有 CSS 被内联到 JS 文件中
      const jsFiles = Object.keys(bundle).filter(file => file.endsWith('.js'));
      let hasInlineCss = false;
      jsFiles.forEach(file => {
        const chunk = bundle[file] as any;
        if (chunk && chunk.code && typeof chunk.code === 'string') {
          // 检查是否包含内联的 CSS（通过 style 标签或 CSS 字符串）
          // 注意：modulepreload polyfill 代码可能包含 'text/css'，需要排除
          const isModulePreload = chunk.code.includes('modulepreload') || chunk.code.includes('relList');
          if (!isModulePreload && (chunk.code.includes('<style>') || (chunk.code.includes('text/css') && chunk.code.includes('insertStyle')))) {
            hasInlineCss = true;
            console.warn(`[ensure-css-plugin] ⚠️ 警告：在 ${file} 中检测到可能的内联 CSS`);
          }
        }
      });

      if (hasInlineCss) {
        console.warn('[ensure-css-plugin] ⚠️ 警告：检测到 CSS 可能被内联到 JS 中，这会导致 qiankun 无法正确加载样式');
        console.warn('[ensure-css-plugin] 请检查 vite-plugin-qiankun 配置和 build.assetsInlineLimit 设置');
      }
    },
    writeBundle(options, bundle) {
      // 在 writeBundle 阶段检查，此时所有文件都已生成
      const cssFiles = Object.keys(bundle).filter(file => file.endsWith('.css'));
      if (cssFiles.length === 0) {
        console.error('[ensure-css-plugin] ❌ 错误：构建产物中无 CSS 文件！');
        console.error('[ensure-css-plugin] 请检查：');
        console.error('1. 入口文件是否静态导入全局样式（index.css/uno.css/element-plus.css）');
        console.error('2. 是否有 Vue 组件中使用 <style> 标签');
        console.error('3. UnoCSS 配置是否正确，是否导入 @unocss all');
        console.error('4. vite-plugin-qiankun 的 useDevMode 是否在生产环境正确关闭');
        console.error('5. build.assetsInlineLimit 是否设置为 0（禁止内联）');
      } else {
        console.log(`[ensure-css-plugin] ✅ 成功打包 ${cssFiles.length} 个 CSS 文件：`, cssFiles);
        // 打印 CSS 文件的详细信息（大小/路径）
        cssFiles.forEach(file => {
          const asset = bundle[file] as any;
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            console.log(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            // 如果 source 不可用，至少显示文件名
            console.log(`  - ${asset.fileName || file}`);
          }
        });
      }
    },
  };
};

// 构建时输出 base 配置，用于调试
// - 预览构建：使用绝对路径（http://localhost:4181/），用于本地预览测试
// - 生产构建：根据部署方式选择 base 路径
//   - 如果通过独立域名部署（admin.bellis.com.cn），使用根路径 '/'
//   - 如果作为子应用部署在主应用的 /admin/ 路径下，使用 '/admin/'
// 注意：admin.bellis.com.cn 是独立域名，应该使用根路径 '/'
const BASE_URL = isPreviewBuild 
  ? `http://${APP_HOST}:${APP_PORT}/` 
  : '/'; // 生产环境使用根路径，因为 admin.bellis.com.cn 是独立域名
console.log(`[admin-app vite.config] Base URL: ${BASE_URL}, APP_HOST: ${APP_HOST}, APP_PORT: ${APP_PORT}, isPreviewBuild: ${isPreviewBuild}`);

export default defineConfig({
  // 关键：base 配置
  // - 预览构建：使用绝对路径（http://localhost:4181/），用于本地预览测试
  // - 生产构建：使用相对路径（/），让浏览器根据当前域名（admin.bellis.com.cn）自动解析
  // 这样在生产环境访问时，资源路径会自动使用当前域名，而不是硬编码的 localhost
  base: BASE_URL,
  resolve: {
    alias: {
      '@': withSrc('src'),
      '@modules': withSrc('src/modules'),
      '@services': withSrc('src/services'),
      '@components': withSrc('src/components'),
      '@utils': withSrc('src/utils'),
      '@auth': withRoot('auth'),
      '@btc/shared-core': withPackages('shared-core/src'),
      '@btc/shared-components': withPackages('shared-components/src'),
      '@btc/shared-utils': withPackages('shared-utils/src'),
      '@btc/subapp-manifests': withPackages('subapp-manifests/src/index.ts'),
      '@btc-common': withPackages('shared-components/src/common'),
      '@btc-components': withPackages('shared-components/src/components'),
      '@btc-styles': withPackages('shared-components/src/styles'),
      '@btc-locales': withPackages('shared-components/src/locales'),
      '@assets': withPackages('shared-components/src/assets'),
      '@plugins': withPackages('shared-components/src/plugins'),
      '@btc-utils': withPackages('shared-components/src/utils'),
      '@btc-crud': withPackages('shared-components/src/crud'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': withPackages('shared-components/src/charts/utils/css-var'),
      '@charts-utils/color': withPackages('shared-components/src/charts/utils/color'),
      '@charts-utils/gradient': withPackages('shared-components/src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': withPackages('shared-components/src/charts/composables/useChartComponent'),
      '@charts-types': withPackages('shared-components/src/charts/types'),
      '@charts-utils': withPackages('shared-components/src/charts/utils'),
      '@charts-composables': withPackages('shared-components/src/charts/composables'),
      'element-plus/es': 'element-plus/es',
      'element-plus/dist': 'element-plus/dist',
    },
    dedupe: ['element-plus', '@element-plus/icons-vue', 'vue', 'vue-router', 'pinia', 'dayjs'],
  },
  plugins: [
    corsPlugin(), // 1. CORS 插件（最前面，不干扰构建）
    titleInjectPlugin(), // 2. 自定义插件（无构建干扰）
    vue({
      // 3. Vue 插件（核心构建插件）
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        }
      }
    }),
    createAutoImportConfig(), // 4. 自动导入插件
    createComponentsConfig({ includeShared: true }), // 5. 组件自动注册插件
    UnoCSS({
      // 6. UnoCSS 插件（样式构建）
      configFile: withRoot('uno.config.ts'),
    }),
    btc({
      // 7. 业务插件
      type: 'subapp' as any,
      proxy,
      eps: {
        enable: true,
        dict: false,
        dist: './build/eps',
      },
      svg: {
        skipNames: ['base', 'icons'],
      },
    }),
    VueI18nPlugin({
      // 8. i18n 插件
      include: [
        fileURLToPath(new URL('./src/{modules,plugins}/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/plugins/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url)),
      ],
      runtimeOnly: true,
    }),
    ensureCssPlugin(), // 9. CSS 验证插件（在构建后检查）
    // 10. qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun('admin', {
      // 关键：使用 useDevMode: true，与 logistics-app 保持一致
      // 虽然理论上生产环境应该关闭，但实际测试发现 useDevMode: false 会导致入口文件及其依赖被打包到 index 中
      // 使用 useDevMode: true 可以确保代码正确拆分到 app-src chunk
      useDevMode: true,
    }),
    // 11. 兜底插件（路径修复、chunk 优化，在最后）
    ensureBaseUrlPlugin(), // 恢复路径修复（确保 chunk 路径正确）
    optimizeChunksPlugin(), // 恢复空 chunk 处理（仅移除未被引用的空 chunk）
    chunkVerifyPlugin(), // 新增：chunk 验证插件
  ],
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: parseInt(appConfig.devPort, 10),
    host: '0.0.0.0',
    strictPort: false,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      // HMR WebSocket 需要使用 localhost，浏览器无法连接 0.0.0.0
      host: appConfig.devHost,
      port: parseInt(appConfig.devPort, 10),
      overlay: false, // 关闭热更新错误浮层，减少开销
    },
    proxy,
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
        withPackages('.'),
        withPackages('shared-components/src'),
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
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      'single-spa',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // 强制预构建，即使依赖已经是最新的
    // 如果遇到模块解析问题，临时设置为 true 强制重新预构建
    force: false,
    // 确保依赖正确解析
    esbuildOptions: {
      plugins: [],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
        // 添加共享组件样式目录到 includePaths，确保 @use 相对路径能正确解析
        includePaths: [
          withPackages('shared-components/src/styles'),
        ],
      },
    },
    // 强制 Vite 提取 CSS（关键兜底配置）
    devSourcemap: false, // 生产环境关闭 CSS sourcemap
  },
  build: {
    target: 'es2020', // 兼容 ES 模块的最低目标
    sourcemap: false, // 开发环境关闭 sourcemap，减少文件体积和加载时间
    // 确保构建时使用正确的 base 路径
    // base 已在顶层配置，这里不需要重复设置
    // 启用 CSS 代码分割，与主域保持一致，确保所有 CSS 都被正确提取
    // 每个 chunk 的样式会被提取到对应的 CSS 文件中，确保样式完整
    cssCodeSplit: true,
    // 确保 CSS 文件被正确输出和压缩
    cssMinify: true,
    // 禁止内联任何资源（确保 JS/CSS 都是独立文件）
    assetsInlineLimit: 0,
    // 明确指定输出目录，确保 CSS 文件被正确输出
    outDir: 'dist',
    assetsDir: 'assets',
    // 让 Vite 自动从 index.html 读取入口（与其他子应用一致）
    rollupOptions: {
      // 抑制 Rollup 关于动态/静态导入冲突的警告（这些警告不影响功能）
      onwarn(warning, warn) {
        // 忽略动态导入和静态导入冲突的警告
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        // 其他警告正常显示
        warn(warning);
      },
      output: {
        format: 'esm', // 明确指定输出格式为 ESM
        inlineDynamicImports: false, // 禁用动态导入内联，确保 CSS 被提取
        manualChunks(id) {
          // 参考系统应用的配置，确保所有 chunk 正确生成
          // 重要：Element Plus 的匹配必须在最前面，确保所有 element-plus 相关代码都在同一个 chunk
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
            // vue-i18n
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'vue-i18n';
            }
            // 其他大型库
            if (id.includes('echarts')) {
              return 'lib-echarts';
            }
            if (id.includes('monaco-editor')) {
              return 'lib-monaco';
            }
            if (id.includes('three')) {
              return 'lib-three';
            }
            // 其余 node_modules 依赖合并到 vendor
            return 'vendor';
          }

          // 处理应用源代码（src/ 目录）
          // 参考系统应用的配置，进行细分的代码分割
          if (id.includes('src/') && !id.includes('node_modules')) {
            // 模块分割
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              // 对大型模块创建单独的 chunk
              if (moduleName && ['access', 'navigation', 'org', 'ops', 'platform', 'strategy', 'api-services'].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              return 'module-others';
            }
            // 页面文件
            if (id.includes('src/pages')) {
              return 'app-pages';
            }
            // 组件文件
            // 关键：components 可能依赖 useSettingsState、store、utils 等（在 app-src 中），合并到 app-src 避免循环依赖
            if (id.includes('src/components')) {
              return 'app-src';
            }
            // 微前端相关
            if (id.includes('src/micro')) {
              return 'app-micro';
            }
            // 插件、store、services、utils、bootstrap 与多个模块有依赖关系，合并到 app-src 避免循环依赖
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
            if (id.includes('src/bootstrap')) {
              return 'app-src';
            }
            if (id.includes('src/config')) {
              return 'app-src';
            }
            if (id.includes('src/composables')) {
              return 'app-composables';
            }
            if (id.includes('src/router')) {
              return 'app-router';
            }
            // i18n 模块被 bootstrap/core/i18n.ts 使用（在 app-src 中），合并到 app-src 避免循环依赖
            if (id.includes('src/i18n')) {
              return 'app-src';
            }
            if (id.includes('src/assets')) {
              return 'app-assets';
            }
            // 其他 src 文件（包括 main.ts）统一合并到 app-src
            return 'app-src';
          }

          // 处理 @btc/shared- 包（共享包）
          if (id.includes('@btc/shared-')) {
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            return 'btc-shared';
          }

          // 对于未匹配的文件，返回 undefined 让 Vite 自动处理
          // 关键：与 logistics-app 保持一致，返回 undefined 而不是 app-src
          // 这样可以确保入口文件被单独处理，其他代码被分配到 app-src
          return undefined;
        },
        // 关键：强制所有资源路径使用绝对路径（基于 base）
        // Vite 默认会根据 base 生成绝对路径，但显式声明作为兜底
        // 确保所有资源路径都包含子应用端口（4181），而非主应用端口（4180）
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          // 其他资源（图片/字体）按原有规则输出
          return 'assets/[name]-[hash].[ext]';
        },
      },
      // 确保第三方样式（如 Element Plus）不被 tree-shaking
      external: [],
      // 关闭 tree-shaking（避免误删依赖 chunk）
      // 子应用微前端场景，tree-shaking 收益极低，风险极高
      treeshake: false,
    },
    chunkSizeWarningLimit: 2000, // 提高警告阈值，element-plus chunk 较大是正常的
  },
});
