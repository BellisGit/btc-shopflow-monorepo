/**
 * URL 相关插件
 * 确保 base URL 正确
 */

import type { Plugin } from 'vite';

/**
 * 确保 base URL 插件
 */
export function ensureBaseUrlPlugin(baseUrl: string, appHost: string, appPort: number, mainAppPort: string): Plugin {
  const isPreviewBuild = baseUrl.startsWith('http');

  return {
    name: 'ensure-base-url',
    renderChunk(code, chunk, options) {
      // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
      // 因为 vendor 等库中也可能包含动态导入的资源路径

      let newCode = code;
      let modified = false;

      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (match, quote, path, query = '') => {
            return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
          });
          modified = true;
        }
      }

      const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (match, path, query = '') => {
          return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
        });
        modified = true;
      }

      const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (match, path, query = '') => {
          return `//${appHost}:${appPort}${path}${query}`;
        });
        modified = true;
      }

      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, quote: string, protocol: string, host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (match: string, quote: string, protocol: string, host: string, path: string, query: string = '') => {
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
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
          let newCode = chunk.code;
          let modified = false;

          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (match, quote, path, query = '') => {
                return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
              });
              modified = true;
            }
          }

          const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (match, path, query = '') => {
              return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
            });
            modified = true;
          }

          const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (match, path, query = '') => {
              return `//${appHost}:${appPort}${path}${query}`;
            });
            modified = true;
          }

          if (modified) {
            chunk.code = newCode;
            console.log(`[ensure-base-url] 在 generateBundle 中修复了 ${fileName} 中的资源路径`);
          }
        } else if (chunk.type === 'asset' && fileName === 'index.html') {
          // 处理 HTML 文件中的资源引用
          let htmlContent = chunk.source as string;
          let htmlModified = false;

          // 修复 HTML 中的绝对路径资源引用（确保使用相对路径）
          const htmlAssetRegex = /(href|src)=["'](\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (htmlAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(htmlAssetRegex, (match, attr, path, query = '') => {
              // 生产环境使用相对路径，确保资源能正确加载
              return `${attr}="${path}${query}"`;
            });
            htmlModified = true;
          }

          // 修复 HTML 中根路径的图片引用（如 /logo.png）
          const rootImageRegex = /(href|src)=["'](\/[^/][^"']*\.(png|jpg|jpeg|gif|svg|ico))(\?[^"']*)?["']/g;
          if (rootImageRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(rootImageRegex, (match, attr, path, ext, query = '') => {
              // 确保根路径的图片使用相对路径
              return `${attr}="${path}${query}"`;
            });
            htmlModified = true;
          }

          if (htmlModified) {
            chunk.source = htmlContent;
            console.log(`[ensure-base-url] 修复了 index.html 中的资源路径`);
          }
        }
      }
    },
  };
}

