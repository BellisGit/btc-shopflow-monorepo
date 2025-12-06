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
      const isThirdPartyLib = chunk.fileName?.includes('lib-echarts') ||
                               chunk.fileName?.includes('element-plus') ||
                               chunk.fileName?.includes('vue-core') ||
                               chunk.fileName?.includes('vue-router') ||
                               chunk.fileName?.includes('vendor');

      if (isThirdPartyLib) {
        return null;
      }

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
          const isThirdPartyLib = fileName.includes('lib-echarts') ||
                                   fileName.includes('element-plus') ||
                                   fileName.includes('vue-core') ||
                                   fileName.includes('vue-router') ||
                                   fileName.includes('vendor');

          if (isThirdPartyLib) {
            continue;
          }

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
        }
      }
    },
  };
}

