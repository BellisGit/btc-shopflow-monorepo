/**
 * CDN 资源加速插件
 * 在构建时修改 HTML 中的资源 URL，将静态资源路径转换为 CDN URL
 * 支持当前应用资源 (/assets/) 和布局应用资源 (/assets/layout/)
 */

import type { Plugin } from 'vite';

export interface CdnAssetsPluginOptions {
  /**
   * 应用名称（如 'admin-app'）
   */
  appName: string;
  /**
   * 是否启用 CDN 加速（默认：生产环境启用）
   */
  enabled?: boolean;
  /**
   * CDN 域名（默认：all.bellis.com.cn）
   */
  cdnDomain?: string;
}

/**
 * CDN 资源加速插件
 */
export function cdnAssetsPlugin(options: CdnAssetsPluginOptions): Plugin {
  const {
    appName,
    enabled = process.env.NODE_ENV === 'production' && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    cdnDomain = 'https://all.bellis.com.cn',
  } = options;

  return {
    name: 'cdn-assets',
    apply: 'build',
    buildStart() {
      if (enabled) {
        console.log(`[cdn-assets] CDN 加速已启用，应用: ${appName}, CDN 域名: ${cdnDomain}`);
      } else {
        console.log(`[cdn-assets] CDN 加速已禁用`);
      }
    },
    transformIndexHtml: {
      order: 'post', // 在 addVersionPlugin 之后执行
      handler(html) {
        if (!enabled) {
          return html;
        }

        let newHtml = html;
        let modified = false;

        // 1) 处理 <script src> 标签
        newHtml = newHtml.replace(
          /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, src: string, suffix: string) => {
            
            // 处理当前应用资源：/assets/xxx.js
            if (src.startsWith('/assets/') && !src.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/${appName}${src}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            // 处理布局应用资源：/assets/layout/xxx.js
            if (src.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/layout-app${src}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            // 处理相对路径：./assets/xxx.js 或 assets/xxx.js
            if (src.startsWith('./assets/') || src.startsWith('assets/')) {
              const normalizedPath = src.startsWith('./') ? src.substring(2) : src;
              if (normalizedPath.startsWith('assets/layout/')) {
                const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              } else if (normalizedPath.startsWith('assets/')) {
                const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
            }
            
            return match;
          },
        );

        // 2) 处理 <link href> 标签（CSS、modulepreload 等）
        newHtml = newHtml.replace(
          /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, href: string, suffix: string) => {
            // 处理当前应用资源：/assets/xxx.css
            if (href.startsWith('/assets/') && !href.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/${appName}${href}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            // 处理布局应用资源：/assets/layout/xxx.css
            if (href.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/layout-app${href}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            // 处理相对路径
            if (href.startsWith('./assets/') || href.startsWith('assets/')) {
              const normalizedPath = href.startsWith('./') ? href.substring(2) : href;
              if (normalizedPath.startsWith('assets/layout/')) {
                const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              } else if (normalizedPath.startsWith('assets/')) {
                const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
            }
            
            return match;
          },
        );

        // 3) 处理 <img src> 标签
        newHtml = newHtml.replace(
          /(<img[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, src: string, suffix: string) => {
            // 处理当前应用资源：/assets/xxx.png
            if (src.startsWith('/assets/') && !src.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/${appName}${src}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            // 处理布局应用资源：/assets/layout/xxx.png
            if (src.startsWith('/assets/layout/')) {
              const cdnUrl = `${cdnDomain}/layout-app${src}`;
              modified = true;
              return `${prefix}${cdnUrl}${suffix}`;
            }
            
            return match;
          },
        );

        // 4) 处理内联的 import() 调用（在 HTML 模板中）
        // 修复 qiankun 注入的内联 import('/assets/index-xxx.js')
        const originExpr =
          `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)` +
          `?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin` +
          `:((typeof location!=='undefined'&&location.origin)||''))`;
        
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m: string, _q: string, absPath: string) => {
            modified = true;
            // 保持原有逻辑，但确保路径正确
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          },
        );

        // 5) 注入资源加载器初始化脚本
        if (!newHtml.includes('__BTC_RESOURCE_LOADER__')) {
          // 根据 ENABLE_CDN_ACCELERATION 环境变量决定是否启用 CDN
          const cdnEnabled = process.env.ENABLE_CDN_ACCELERATION !== 'false';
          const loaderScript = `
<script>
  (function() {
    // 资源加载器将在运行时模块中初始化
    // 这里只设置基础配置
    if (typeof window !== 'undefined') {
      window.__BTC_CDN_CONFIG__ = {
        appName: '${appName}',
        cdnDomain: '${cdnDomain}',
        ossDomain: 'https://bellis1.oss-cn-shenzhen.aliyuncs.com',
        enabled: ${cdnEnabled}
      };
    }
  })();
</script>`;
          
          // 在 </head> 之前注入
          if (newHtml.includes('</head>')) {
            newHtml = newHtml.replace('</head>', `${loaderScript}\n</head>`);
            modified = true;
          } else if (newHtml.includes('</body>')) {
            newHtml = newHtml.replace('</body>', `${loaderScript}\n</body>`);
            modified = true;
          }
        }

        if (modified) {
          console.log(`[cdn-assets] 已为 index.html 中的资源引用转换为 CDN URL`);
        }
        
        return newHtml;
      },
    },
  } as Plugin;
}

