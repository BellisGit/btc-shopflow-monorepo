import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve, join, extname, basename } from 'path';
import { existsSync, readFileSync, rmSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createMainAppViteConfig } from '../../configs/vite/factories/mainapp.config';
import { proxy } from './src/config/proxy';

const appDir = fileURLToPath(new URL('.', import.meta.url));

// 将 public 目录中的图片文件打包到根目录并添加哈希值
const publicImagesToAssetsPlugin = (): Plugin => {
  const imageMap = new Map<string, string>();
  const emittedFiles = new Map<string, string>();
  const publicImageFiles = new Map<string, string>();

  const isVirtualModuleId = (id: string): boolean => {
    return id.includes('\0') || id.includes('public-image:');
  };

  const extractOriginalPath = (id: string): string | null => {
    if (!isVirtualModuleId(id)) {
      return null;
    }
    const originalPath = id.replace(/\0public-image:/g, '').replace(/\0/g, '');
    if (originalPath.includes('\0')) {
      return null;
    }
    return originalPath;
  };

  return {
    name: 'public-images-to-assets',
    buildStart() {
      const publicDir = resolve(appDir, 'public');
      if (!existsSync(publicDir)) {
        return;
      }

      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
      const files = readdirSync(publicDir);

      for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const filePath = join(publicDir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            publicImageFiles.set(`/${file}`, filePath);
            publicImageFiles.set(file, filePath);

            const fileContent = readFileSync(filePath);
            const referenceId = this.emitFile({
              type: 'asset',
              name: file,
              source: fileContent,
            });
            emittedFiles.set(file, referenceId);
            console.log(`[public-images-to-assets] 📦 将 ${file} 打包到根目录 (referenceId: ${referenceId})`);
          }
        }
      }
    },
    resolveId(id, importer) {
      if (isVirtualModuleId(id)) {
        if (id.startsWith('\0public-image:') || id.includes('\0public-image:')) {
          return id;
        }
        return null;
      }
      
      if (id.startsWith('/') && publicImageFiles.has(id)) {
        return `\0public-image:${id}`;
      }
      return null;
    },
    load(id) {
      if (!isVirtualModuleId(id)) {
        return null;
      }
      
      const originalPath = extractOriginalPath(id);
      if (!originalPath) {
        console.warn(`[public-images-to-assets] ⚠️  无法提取原始路径，跳过: ${id}`);
        return null;
      }
      
      const fileName = basename(originalPath);
      const referenceId = emittedFiles.get(fileName);
      if (referenceId) {
        return `export default "/${fileName}";`;
      }
      return null;
    },
    generateBundle(options, bundle) {
      const bundleAssets = Object.entries(bundle).filter(([_, chunk]) => chunk.type === 'asset');
      console.log(`[public-images-to-assets] 📋 bundle 中的资源文件数量: ${bundleAssets.length}`);

      console.log(`[public-images-to-assets] 🔍 开始处理 ${emittedFiles.size} 个已发出的文件`);
      for (const [originalFile, referenceId] of emittedFiles.entries()) {
        try {
          const actualFileName = this.getFileName(referenceId);

          if (!actualFileName) {
            console.warn(`[public-images-to-assets] ⚠️  无法获取 ${originalFile} 的文件名 (referenceId: ${referenceId})`);
            continue;
          }

          const assetChunk = bundle[actualFileName];
          if (!assetChunk || assetChunk.type !== 'asset') {
            console.warn(`[public-images-to-assets] ⚠️  在 bundle 中未找到 ${actualFileName} (原始文件: ${originalFile})`);
            continue;
          }

          const fileNameWithoutPath = actualFileName.startsWith('assets/')
            ? actualFileName.replace('assets/', '')
            : actualFileName;
          imageMap.set(originalFile, fileNameWithoutPath);
          console.log(`[public-images-to-assets] ✅ ${originalFile} -> ${fileNameWithoutPath} (Rollup 生成的文件名)`);
        } catch (error) {
          console.warn(`[public-images-to-assets] ⚠️  处理 ${originalFile} 时出错:`, error);
        }
      }

      if (imageMap.size === 0) {
        console.warn(`[public-images-to-assets] ⚠️  imageMap 为空，可能 emitFile 没有成功执行`);
      } else {
        console.log(`[public-images-to-assets] 📝 imageMap 内容:`, Array.from(imageMap.entries()).map(([k, v]) => `${k} -> ${v}`).join(', '));
      }

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          let modified = false;
          let newCode = chunk.code;

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
          let modified = false;
          let newSource = typeof chunk.source === 'string' ? chunk.source : Buffer.from(chunk.source).toString('utf-8');

          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    writeBundle(options) {
      if (imageMap.size === 0) {
        return;
      }

      const outputDir = options.dir || resolve(appDir, 'dist');
      const assetsDirPath = join(outputDir, 'assets');

      if (!existsSync(assetsDirPath)) {
        mkdirSync(assetsDirPath, { recursive: true });
      }

      const indexHtmlPath = join(outputDir, 'index.html');

      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, 'utf-8');
        let modified = false;

        for (const [originalFile, hashedFile] of imageMap.entries()) {
          const originalPath = `/${originalFile}`;
          const newPath = `/${hashedFile}`;

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
            const newPath = `/${hashedFile}`;

            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const patterns = [
              new RegExp(`(["'\`])${escapedPath}(["'\`])`, 'g'),
              new RegExp(`url\\(${escapedPath}\\)`, 'g'),
              new RegExp(`url\\(['"]${escapedPath}['"]\\)`, 'g'),
            ];

            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (pattern.source.includes('url')) {
                  content = content.replace(pattern, (match) => {
                    return match.replace(originalPath, newPath);
                  });
                } else {
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
    closeBundle() {
      if (imageMap.size === 0) {
        return;
      }

      const outputDir = resolve(appDir, 'dist');

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

// CORS 预检请求处理插件
const corsPreflightPlugin = (): Plugin => {
  const corsDevMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  };

  const corsPreviewMiddleware = (req: any, res: any, next: any) => {
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
      server.middlewares.use((req, res, next) => {
        corsDevMiddleware(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        corsPreviewMiddleware(req, res, next);
      });
    },
  };
};

// 资源预加载插件
const resourcePreloadPlugin = (): Plugin => {
  const criticalResources: Array<{ href: string; as?: string; rel: string }> = [];

  return {
    name: 'resource-preload',
    generateBundle(options, bundle) {
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      const getResourceHref = (chunkName: string): string => {
        if (chunkName.startsWith('assets/')) {
          return `/${chunkName}`;
        } else {
          return `/assets/${chunkName}`;
        }
      };

      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      if (indexChunk) {
        criticalResources.push({
          href: getResourceHref(indexChunk),
          rel: 'modulepreload',
        });
      }

      const epsServiceChunk = jsChunks.find(jsChunk => jsChunk.includes('eps-service-'));
      if (epsServiceChunk) {
        criticalResources.push({
          href: getResourceHref(epsServiceChunk),
          rel: 'modulepreload',
        });
      }

      cssChunks.forEach(cssChunk => {
        criticalResources.push({
          href: getResourceHref(cssChunk),
          rel: 'preload',
          as: 'style',
        });
      });
    },
    transformIndexHtml(html) {
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

      if (html.includes('</head>')) {
        return html.replace('</head>', `${preloadLinks}\n</head>`);
      }

      return html;
    },
  };
};

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  return createMainAppViteConfig({
    appName: 'system-app',
    appDir,
    customPlugins: [
      // 只在构建环境中使用 publicImagesToAssetsPlugin
      ...(isDev ? [] : [publicImagesToAssetsPlugin()]),
      corsPreflightPlugin(),
      resourcePreloadPlugin(),
    ],
    customServer: { proxy },
    proxy,
    customBuild: {
      // 开发环境：启用 publicDir，让 Vite 直接处理静态资源
      // 构建环境：禁用 publicDir，使用插件添加哈希值
      publicDir: isDev ? resolve(appDir, 'public') : false,
    },
  });
});
