/**
 * URL 相关插件
 * 确保 base URL 正确
 */

import type { Plugin } from 'vite';
import type { ChunkInfo, OutputOptions, OutputBundle } from 'rollup';

/**
 * 确保 base URL 插件
 */
export function ensureBaseUrlPlugin(baseUrl: string, appHost: string, appPort: number, mainAppPort: string): Plugin {
  const isPreviewBuild = baseUrl.startsWith('http');

  return {
    name: 'ensure-base-url',
    renderChunk(code: string, chunk: ChunkInfo, _options: any) {
      // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
      // 因为 vendor 等库中也可能包含动态导入的资源路径

      let newCode = code;
      let modified = false;

      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = '') => {
            return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
          });
          modified = true;
        }
      }

      const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (_match, path, query = '') => {
          return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
        });
        modified = true;
      }

      const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (_match, path, query = '') => {
          return `//${appHost}:${appPort}${path}${query}`;
        });
        modified = true;
      }

      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, quote: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, quote: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
      ];

      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement as any);
          modified = true;
        }
      }

      if (modified) {
        console.log(`[ensure-base-url] 修复了 ${chunk.fileName} 中的资源路径 (${mainAppPort} -> ${appPort})`);
        return {
          code: newCode,
          map: null,
        };
      }

      return null;
    },
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
          let newCode = chunk.code;
          let modified = false;

          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (_match: string, quote: string, path: string, query: string = '') => {
                return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
              });
              modified = true;
            }
          }

          const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (_match: string, path: string, query: string = '') => {
              return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
            });
            modified = true;
          }

          const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (_match: string, path: string, query: string = '') => {
              return `//${appHost}:${appPort}${path}${query}`;
            });
            modified = true;
          }

          if (modified) {
            (chunk as any).code = newCode;
            console.log(`[ensure-base-url] 在 generateBundle 中修复了 ${fileName} 中的资源路径`);
          }
        } else if (chunk.type === 'asset' && fileName === 'index.html') {
          // 处理 HTML 文件中的资源引用
          // 注意：如果 Vite 配置正确（base: '/', assetsDir: 'assets', rollupOptions.output.chunkFileNames: 'assets/[name]-[hash].js'），
          // Vite 应该自动生成正确的路径，不需要修复。
          // 这里只处理预览构建时的端口修复，以及修复相对路径。
          let htmlContent = (chunk as any).source as string;
          let htmlModified = false;

          // 修复相对路径 ./assets/ 为绝对路径 /assets/（如果出现）
          const relativeAssetRegex = /(href|src)=["'](\.\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (relativeAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(relativeAssetRegex, (_match, attr, path, query = '') => {
              // 将相对路径转换为绝对路径
              const absolutePath = path.replace(/^\./, '');
              htmlModified = true;
              console.log(`[ensure-base-url] 修复相对路径: ${path} -> ${absolutePath}`);
              return `${attr}="${absolutePath}${query}"`;
            });
          }

          // 如果出现根目录的资源路径（如 /index.js），说明配置有问题，记录警告
          // 正常情况下，Vite 应该生成 /assets/[name]-[hash].js 这样的路径
          const rootJsRegex = /(href|src)=["'](\/([^/]+\.(js|mjs)))(\?[^"']*)?["']/g;
          if (rootJsRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootJsRegex);
            if (matches) {
              console.warn(`[ensure-base-url] ⚠️  检测到根目录资源路径，这通常不应该出现。请检查 Vite 配置（base, assetsDir, rollupOptions.output.chunkFileNames）:`, matches);
              // 修复这些路径（作为兜底方案）
              htmlContent = htmlContent.replace(rootJsRegex, (_match, attr, path, fileName, _ext, query = '') => {
                if (!path.startsWith('/assets/') && !path.startsWith('/favicon') && !path.startsWith('/logo') && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                  const newPath = `/assets/${fileName}`;
                  htmlModified = true;
                  console.log(`[ensure-base-url] 修复根目录资源路径（兜底）: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }

          const rootCssRegex = /(href|src)=["'](\/([^/]+\.css))(\?[^"']*)?["']/g;
          if (rootCssRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootCssRegex);
            if (matches) {
              console.warn(`[ensure-base-url] ⚠️  检测到根目录 CSS 路径，这通常不应该出现。请检查 Vite 配置:`, matches);
              // 修复这些路径（作为兜底方案）
              htmlContent = htmlContent.replace(rootCssRegex, (_match, attr, path, fileName, query = '') => {
                if (!path.startsWith('/assets/')) {
                  const newPath = `/assets/${fileName}`;
                  htmlModified = true;
                  console.log(`[ensure-base-url] 修复根目录 CSS 路径（兜底）: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }

          if (htmlModified) {
            (chunk as any).source = htmlContent;
            console.log(`[ensure-base-url] 修复了 index.html 中的资源路径`);
          }
        }
      }
    },
  } as Plugin;
}

