import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { existsSync, readFileSync, rmSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, extname, basename } from 'path';
import type { Plugin } from 'vite';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { proxy } from './src/config/proxy';
import { getViteAppConfig } from '../../configs/vite-app-config';

// 从统一配置中获取应用配置
const config = getViteAppConfig('system-app');

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

// 将 public 目录中的图片文件打包到根目录并添加哈希值
const publicImagesToAssetsPlugin = (): Plugin => {
  const imageMap = new Map<string, string>(); // 原文件名 -> 带哈希的文件名（不含路径）
  const emittedFiles = new Map<string, string>(); // 原文件名 -> emitFile 返回的 referenceId
  const publicImageFiles = new Map<string, string>(); // 原文件名 -> 文件路径

  return {
    name: 'public-images-to-assets',
    // 在构建开始时，将 public 目录中的图片文件作为资源导入
    buildStart() {
      const publicDir = resolve(__dirname, 'public');
      if (!existsSync(publicDir)) {
        return;
      }

      // 查找 public 目录中的所有图片文件
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
      const files = readdirSync(publicDir);

      for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const filePath = join(publicDir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            // 记录文件路径，用于 resolveId
            publicImageFiles.set(`/${file}`, filePath);
            publicImageFiles.set(file, filePath);

            // 将文件作为资源导入，这样会被 Rollup 处理并添加到根目录
            // Rollup 会根据 assetFileNames 配置自动生成带哈希的文件名
            const fileContent = readFileSync(filePath);
            // 使用完整的文件名（含扩展名）作为 name，让 Rollup 正确提取 [ext]
            // assetFileNames 配置中的 [name] 会使用这个值，[ext] 会从 name 中提取
            const referenceId = this.emitFile({
              type: 'asset',
              name: file, // 使用完整文件名（含扩展名），让 Rollup 正确应用 assetFileNames 配置
              source: fileContent,
            });
            emittedFiles.set(file, referenceId);
            console.log(`[public-images-to-assets] 📦 将 ${file} 打包到根目录 (referenceId: ${referenceId})`);
          }
        }
      }
    },
    // 解析 /logo.png 这样的路径，返回对应的虚拟模块 ID
    resolveId(id) {
      // 检查是否是 public 目录中的图片文件（以 / 开头的绝对路径）
      if (id.startsWith('/') && publicImageFiles.has(id)) {
        // 返回一个虚拟模块 ID，让 Vite 知道这是一个资源
        return `\0public-image:${id}`;
      }
      return null;
    },
    // 加载虚拟模块，返回资源 URL
    load(id) {
      if (id.startsWith('\0public-image:')) {
        const originalPath = id.replace('\0public-image:', '');
        const fileName = basename(originalPath);
        // 查找对应的 referenceId
        const referenceId = emittedFiles.get(fileName);
        if (referenceId) {
          // 返回一个导出资源 URL 的模块
          // 使用 ?url 后缀让 Vite 将其作为资源处理
          // 但这里我们不能直接使用 ?url，因为这是虚拟模块
          // 所以我们需要在 generateBundle 阶段更新引用
          // 这里先返回一个占位符，在 generateBundle 阶段会更新为带哈希的文件名
          return `export default "/${fileName}";`;
        }
      }
      return null;
    },
    // 在生成 bundle 后，记录实际生成的文件名，并更新代码中的引用
    generateBundle(options, bundle) {
      // 检查 bundle 中是否有我们通过 emitFile 添加的资源
      const bundleAssets = Object.entries(bundle).filter(([_, chunk]) => chunk.type === 'asset');
      console.log(`[public-images-to-assets] 📋 bundle 中的资源文件数量: ${bundleAssets.length}`);

      // 处理通过 emitFile 添加的资源，使用 Rollup 实际生成的文件名
      console.log(`[public-images-to-assets] 🔍 开始处理 ${emittedFiles.size} 个已发出的文件`);
      for (const [originalFile, referenceId] of emittedFiles.entries()) {
        try {
          // 使用 Rollup 的 getFileName 获取实际生成的文件名（包含 Rollup 计算的哈希）
          const actualFileName = this.getFileName(referenceId);

          if (!actualFileName) {
            console.warn(`[public-images-to-assets] ⚠️  无法获取 ${originalFile} 的文件名 (referenceId: ${referenceId})`);
            continue;
          }

          // 检查 bundle 中是否存在该文件
          const assetChunk = bundle[actualFileName];
          if (!assetChunk || assetChunk.type !== 'asset') {
            console.warn(`[public-images-to-assets] ⚠️  在 bundle 中未找到 ${actualFileName} (原始文件: ${originalFile})`);
            continue;
          }

          // 更新 imageMap（只保存文件名，不包含路径前缀）
          // Rollup 已经根据 assetFileNames 配置生成了正确的文件名（包含哈希）
          // 如果文件名包含 assets/ 前缀，移除它；否则直接使用
          const fileNameWithoutPath = actualFileName.startsWith('assets/')
            ? actualFileName.replace('assets/', '')
            : actualFileName;
          imageMap.set(originalFile, fileNameWithoutPath);
          console.log(`[public-images-to-assets] ✅ ${originalFile} -> ${fileNameWithoutPath} (Rollup 生成的文件名)`);
        } catch (error) {
          console.warn(`[public-images-to-assets] ⚠️  处理 ${originalFile} 时出错:`, error);
        }
      }

      // 如果 imageMap 为空，说明 emitFile 没有成功
      if (imageMap.size === 0) {
        console.warn(`[public-images-to-assets] ⚠️  imageMap 为空，可能 emitFile 没有成功执行`);
      } else {
        console.log(`[public-images-to-assets] 📝 imageMap 内容:`, Array.from(imageMap.entries()).map(([k, v]) => `${k} -> ${v}`).join(', '));
      }

      // 更新所有 chunk 代码中的图片引用（包括 JS 和 CSS）
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          let modified = false;
          let newCode = chunk.code;

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = `/${hashedFile}`; // 根目录路径，不带 assets/
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 匹配字符串字面量中的路径（包括单引号、双引号、模板字符串）
            const stringPattern = new RegExp(`(["'\`])${escapedPath}(["'\`])`, 'g');
            if (newCode.includes(originalPath)) {
              newCode = newCode.replace(stringPattern, `$1${newPath}$2`);
              modified = true;
            }
          }

          if (modified) {
            chunk.code = newCode;
            console.log(`[public-images-to-assets] 🔄 更新 ${fileName} 中的图片引用`);
          }
        } else if (chunk.type === 'asset' && fileName.endsWith('.css') && chunk.source) {
          // 处理 CSS 文件中的 URL 引用
          let modified = false;
          let newSource = typeof chunk.source === 'string' ? chunk.source : Buffer.from(chunk.source).toString('utf-8');

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = `/${hashedFile}`; // 根目录路径，不带 assets/
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 匹配 CSS url() 格式
            const urlPatterns = [
              new RegExp(`url\\(${escapedPath}\\)`, 'g'),
              new RegExp(`url\\(['"]${escapedPath}['"]\\)`, 'g'),
            ];

            for (const pattern of urlPatterns) {
              if (pattern.test(newSource)) {
                newSource = newSource.replace(pattern, (match) => {
                  return match.replace(originalPath, newPath);
                });
                modified = true;
                console.log(`[public-images-to-assets] 🔄 更新 CSS ${fileName} 中的引用: ${originalPath} -> ${newPath}`);
              }
            }
          }

          if (modified) {
            chunk.source = newSource;
          }
        }
      }
    },
    // 在写入文件后，更新 HTML 和代码中的引用，并移动文件到 assets 目录
    writeBundle(options) {
      if (imageMap.size === 0) {
        return;
      }

      const outputDir = options.dir || resolve(__dirname, 'dist');
      const assetsDirPath = join(outputDir, 'assets');

      // 确保 assets 目录存在
      if (!existsSync(assetsDirPath)) {
        mkdirSync(assetsDirPath, { recursive: true });
      }

      // 注意：文件移动将在 closeBundle 钩子中执行，确保在所有 writeBundle 执行完毕后进行

      const indexHtmlPath = join(outputDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        // 更新 HTML 中的图片引用（如 /logo.png -> /logo-hash.png）
        for (const [originalFile, hashedFile] of imageMap.entries()) {
          const originalPath = `/${originalFile}`;
          const newPath = `/${hashedFile}`; // 根目录路径，不带 assets/

          if (html.includes(originalPath)) {
            html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
            modified = true;
            console.log(`[public-images-to-assets] 🔄 更新 HTML 中的引用: ${originalPath} -> ${newPath}`);
          }
        }

        if (modified) {
          writeFileSync(indexHtmlPath, html, 'utf-8');
        }
      }

      // 更新 JS 和 CSS 文件中的引用
      const assetsDir = join(outputDir, 'assets');
      if (existsSync(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
        const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'));

        for (const file of [...jsFiles, ...cssFiles]) {
          const filePath = join(assetsDir, file);
          let content = readFileSync(filePath, 'utf-8');
          let modified = false;

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = `/${hashedFile}`; // 根目录路径，不带 assets/

            // 匹配多种格式：
            // 1. 字符串字面量："/logo.png" 或 '/logo.png' 或 `/logo.png`
            // 2. CSS url()：url(/logo.png) 或 url("/logo.png") 或 url('/logo.png')
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const patterns = [
              // 字符串字面量（单引号、双引号、模板字符串）
              new RegExp(`(["'\`])${escapedPath}(["'\`])`, 'g'),
              // CSS url() 格式（无引号）
              new RegExp(`url\\(${escapedPath}\\)`, 'g'),
              // CSS url() 格式（单引号）
              new RegExp(`url\\(['"]${escapedPath}['"]\\)`, 'g'),
            ];

            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (pattern.source.includes('url')) {
                  // CSS url() 格式：保持 url() 结构
                  content = content.replace(pattern, (match) => {
                    return match.replace(originalPath, newPath);
                  });
                } else {
                  // 字符串字面量格式
                  content = content.replace(pattern, `$1${newPath}$2`);
                }
                modified = true;
                console.log(`[public-images-to-assets] 🔄 更新 ${file} 中的引用: ${originalPath} -> ${newPath}`);
              }
            }
          }

          if (modified) {
            writeFileSync(filePath, content, 'utf-8');
          }
        }
      }
    },
    // 在所有 writeBundle 执行完毕后，验证文件是否已正确生成
    closeBundle() {
      if (imageMap.size === 0) {
        return;
      }

      const outputDir = resolve(__dirname, 'dist');

      // 验证所有文件是否已正确生成到根目录
      for (const [originalFile, hashedFile] of imageMap.entries()) {
        const expectedPath = join(outputDir, hashedFile);
        if (existsSync(expectedPath)) {
          console.log(`[public-images-to-assets] ✅ 文件已正确生成: ${hashedFile}`);
        } else {
          console.warn(`[public-images-to-assets] ⚠️  文件不存在: ${hashedFile} (原始文件: ${originalFile})`);
        }
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

// 资源预加载插件：自动为关键资源添加 preload/modulepreload 提示
const resourcePreloadPlugin = (): Plugin => {
  const criticalResources: Array<{ href: string; as?: string; rel: string }> = [];

  return {
    name: 'resource-preload',
    generateBundle(options, bundle) {
      // 收集关键资源：主入口 JS、CSS、EPS 服务 chunk
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      // 主入口文件（index-*.js）
      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      if (indexChunk) {
        criticalResources.push({
          href: `/assets/${indexChunk}`,
          rel: 'modulepreload',
        });
      }

      // EPS 服务 chunk（关键依赖，需要提前加载）
      const epsServiceChunk = jsChunks.find(jsChunk => jsChunk.includes('eps-service-'));
      if (epsServiceChunk) {
        criticalResources.push({
          href: `/assets/${epsServiceChunk}`,
          rel: 'modulepreload',
        });
      }

      // CSS 文件（使用 preload，as="style"）
      cssChunks.forEach(cssChunk => {
        criticalResources.push({
          href: `/assets/${cssChunk}`,
          rel: 'preload',
          as: 'style',
        });
      });
    },
    transformIndexHtml(html) {
      // 在 </head> 之前注入预加载链接
      if (criticalResources.length === 0) {
        return html;
      }

      const preloadLinks = criticalResources
        .map(resource => {
          if (resource.rel === 'modulepreload') {
            return `    <link rel="modulepreload" href="${resource.href}" />`;
          } else {
            return `    <link rel="preload" href="${resource.href}" as="${resource.as || 'script'}" />`;
          }
        })
        .join('\n');

      // 在 </head> 之前插入，确保尽早加载
      if (html.includes('</head>')) {
        return html.replace('</head>', `${preloadLinks}\n</head>`);
      }

      return html;
    },
  };
};

export default defineConfig({
  // 开启构建缓存，复用依赖的编译结果，提高构建速度并稳定哈希
  cacheDir: './node_modules/.vite-cache',
  base: '/', // 明确设置为根路径，不使用 /logistics/
  // 禁用 publicDir 的自动复制，使用 publicImagesToAssetsPlugin 将图片打包到 assets 目录
  // 这样所有图片文件都会添加哈希值，和 JS、CSS 文件一样的打包方式
  publicDir: false,
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
      // 本地 assets 目录（优先级更高，放在 @assets 之前）
      '@assets': resolve(__dirname, 'src/assets'),
      // 共享组件库的 assets（作为后备）
      '@btc-assets': resolve(__dirname, '../../packages/shared-components/src/assets'),
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
    cleanDistPlugin(), // 0. 构建前清理 dist 目录（最前面）
    publicImagesToAssetsPlugin(), // 1. 将 public 目录中的图片打包到 assets 目录并添加哈希值
    corsPreflightPlugin(), // 2. CORS 插件（不干扰构建）
    resourcePreloadPlugin(), // 3. 资源预加载插件（在构建时注入 preload 提示）
    vue({
      // 2. Vue 插件（核心构建插件）
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    createAutoImportConfig(), // 3. 自动导入插件
    createComponentsConfig({ includeShared: true }), // 4. 组件自动注册插件
    UnoCSS({
      // 5. UnoCSS 插件（样式构建）
      configFile: resolve(__dirname, '../../uno.config.ts'),
    }),
    btc({
      // 6. 业务插件
      type: 'admin',
      proxy,
      eps: {
        enable: true,
        dist: './build/eps',
        api: '/api/login/eps/contract',
      },
    }),
    VueI18nPlugin({
      // 7. i18n 插件
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
    // 8. qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun('system', {
      useDevMode: true,
    }),
    // 9. 兜底插件（路径修复、chunk 优化，在最后）
    fixChunkReferencesPlugin(), // 修复 chunk 之间的引用关系（轻量级，不修改第三方库）
    optimizeChunksPlugin(), // 恢复空 chunk 处理（仅移除未被引用的空 chunk）
    chunkVerifyPlugin(), // 新增：chunk 验证插件
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
        silenceDeprecations: ['legacy-js-api', 'import'],
        // 添加共享组件样式目录到 includePaths，确保 @use 相对路径能正确解析
        includePaths: [
          resolve(__dirname, '../../packages/shared-components/src/styles'),
          resolve(__dirname, 'src/styles'), // 本地样式目录
          resolve(__dirname, '../../auth/shared/styles'), // auth 样式目录
          // 添加 src 目录到 includePaths，确保 @/ 别名在 SCSS 中能正确解析
          resolve(__dirname, 'src'),
        ],
        // 添加 additionalData，确保 SCSS 能够访问别名路径
        // 注意：这不会影响 url() 中的别名解析，但可以帮助其他场景
      },
    },
    // 强制 Vite 提取 CSS（关键兜底配置）
    devSourcemap: false, // 生产环境关闭 CSS sourcemap
    // 确保 Vite 能够正确处理 CSS 中的别名路径
    postcss: {
      // 确保 PostCSS 不会干扰 Vite 的别名解析
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false, // 禁用 CSS 代码分割，合并所有 CSS 到一个文件（与平衡拆分策略一致）
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
    // 关键修改1：禁用资源内联，确保所有图片都作为独立文件输出（带哈希）
    // 设置为 0 禁用内联，所有资源都会作为独立文件输出到 assets 目录
    assetsInlineLimit: 0,
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
          // CSS 文件使用特殊命名
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          // 图片和其他资源文件：放在根目录（不带 assets/ 前缀）
          // 如果 name 包含扩展名，提取文件名（不含扩展名）
          if (assetInfo.name && assetInfo.name.includes('.')) {
            const ext = extname(assetInfo.name);
            const nameWithoutExt = basename(assetInfo.name, ext);
            // 使用占位符格式，让 Rollup 自动填充 [hash]
            // 文件输出到根目录，格式：logo-[hash].png
            return `${nameWithoutExt}-[hash]${ext}`;
          }
          // 兜底：使用默认格式（Rollup 会自动处理）
          return '[name]-[hash].[ext]';
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
});
