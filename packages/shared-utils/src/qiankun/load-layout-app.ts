/**
 * 加载 layout-app 的共享工具函数
 *
 * 使用说明：
 * 1. 在应用的 package.json 中添加 qiankun 依赖：`"qiankun": "^2.10.16"`
 * 2. 在 index.html 中先导入 qiankun，然后调用此函数
 *
 * @example
 * ```html
 * <script type="module">
 *   import { registerMicroApps, start } from 'qiankun';
 *   import { loadLayoutApp } from '@btc/shared-utils/qiankun/load-layout-app';
 *   loadLayoutApp({ registerMicroApps, start });
 * </script>
 * ```
 */

/**
 * 加载 layout-app
 * @param qiankunAPI - qiankun 的 API 对象，包含 registerMicroApps 和 start 方法
 * @returns Promise，在 layout-app 挂载完成后 resolve
 */
export function loadLayoutApp(qiankunAPI: { registerMicroApps: any; start: any }): Promise<void> {
  const { registerMicroApps, start } = qiankunAPI;

  // 获取当前环境
  const isProd = typeof window !== 'undefined' && window.location.hostname.includes('bellis.com.cn');
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

  // 布局微应用入口
  const layoutEntry = isProd
    ? `${protocol}//layout.bellis.com.cn/`
    : 'http://localhost:4188/';


  const getAssetsBase = (entry: string) => {
    try {
      const entryUrl = new URL(entry, typeof window !== 'undefined' ? window.location.href : 'https://bellis.com.cn');
      return new URL('assets/', entryUrl).toString();
    } catch (_error) {
      return '/assets/';
    }
  };

  const assetsBase = getAssetsBase(layoutEntry);

  const ensureModuleScriptType = (tpl: string) =>
    tpl.replace(
      /<script(\s+[^>]*)?>/gi,
      function (match, attrs) {
        if (!attrs) attrs = '';
        if (attrs.includes('type=')) {
          return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
        }
        return '<script type="module"' + attrs + '>';
      },
    );

  const rewriteAssetUrls = (tpl: string) => {
    // 重写 HTML 属性中的资源路径（href 和 src）
    let result = tpl.replace(/(href|src)=["']\/assets\/([^"']+)["']/gi, (_match, attr, path) => `${attr}="${assetsBase}${path}"`);

    // 重写 import() 动态导入中的资源路径（包括单引号和双引号）
    result = result.replace(/(import\s*\(\s*['"])\/assets\/([^"']+)(['"]\s*\))/gi, `$1${assetsBase}$2$3`);

    // 重写 import 语句中的资源路径（包括相对路径和绝对路径）
    result = result.replace(/(import\s+[^'"]*['"])\/assets\/([^"']+)(['"])/gi, `$1${assetsBase}$2$3`);

    // 重写 new URL() 中的资源路径
    result = result.replace(/(new\s+URL\s*\(\s*['"])\/assets\/([^"']+)(['"])/gi, `$1${assetsBase}$2$3`);

    // 重写 script 标签中的 src 属性（确保使用完整的 assetsBase URL）
    result = result.replace(/(<script[^>]*\s+src=["'])\/assets\/([^"']+)(["'])/gi, `$1${assetsBase}$2$3`);

    // 重写 link 标签中的 href 属性（CSS 文件等）
    result = result.replace(/(<link[^>]*\s+href=["'])\/assets\/([^"']+)(["'])/gi, `$1${assetsBase}$2$3`);

    // 注入运行时修复代码，拦截动态导入和 fetch 请求
    // 在第一个 script 标签之前注入修复代码
    const interceptScript = `
      <script type="module">
        (function() {
          const layoutAssetsBase = '${assetsBase}';
          const currentHost = window.location.hostname;
          const layoutHost = new URL(layoutAssetsBase).hostname;
          const layoutOrigin = new URL(layoutAssetsBase).origin;

          // 修复 URL 的辅助函数
          function fixAssetUrl(url) {
            if (typeof url !== 'string') return url;

            // 如果 URL 是相对路径且指向 /assets/，重写为 layout-app 的完整 URL
            if (url.startsWith('/assets/') || url.startsWith('./assets/') || url.startsWith('../assets/')) {
              const normalizedPath = url.startsWith('/') ? url : url.replace(new RegExp('^[.][.]?/'), '/');
              return layoutAssetsBase + normalizedPath.replace(new RegExp('^/assets/'), '');
            }

            // 如果 URL 已经是完整 URL 但指向错误的域名，修复它
            if (url.startsWith('http://') || url.startsWith('https://')) {
              try {
                const urlObj = new URL(url);
                // 如果 URL 指向当前域名但应该是 layout-app 的域名，修复它
                if (urlObj.hostname === currentHost && urlObj.pathname.startsWith('/assets/') && currentHost !== layoutHost) {
                  urlObj.hostname = layoutHost;
                  return urlObj.toString();
                }
              } catch {}
            }

            return url;
          }

          // 拦截 fetch 请求，修复资源路径
          const originalFetch = window.fetch;
          window.fetch = function(url, ...args) {
            const fixedUrl = fixAssetUrl(url);
            return originalFetch.call(this, fixedUrl, ...args);
          };

          // 重写 import.meta.resolve 来修复动态导入路径（如果支持）
          if (typeof import.meta !== 'undefined' && import.meta.resolve) {
            const originalResolve = import.meta.resolve;
            import.meta.resolve = function(specifier, parent) {
              const resolved = originalResolve.call(this, specifier, parent);
              return fixAssetUrl(resolved);
            };
          }

          // 拦截错误事件，自动修复资源加载错误
          window.addEventListener('error', function(event) {
            if (event.target && (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement)) {
              const target = event.target as HTMLScriptElement | HTMLLinkElement;
              const src = (event.target instanceof HTMLScriptElement ? event.target.src : null) ||
                          (event.target instanceof HTMLLinkElement ? event.target.href : null);

              if (src) {
                const fixedUrl = fixAssetUrl(src);
                if (fixedUrl !== src) {
                  // 阻止默认错误处理
                  event.preventDefault();
                  event.stopPropagation();

                  // 重新加载资源
                  if (target instanceof HTMLScriptElement) {
                    const newScript = document.createElement('script');
                    newScript.src = fixedUrl;
                    newScript.type = 'module';
                    target.parentNode?.replaceChild(newScript, target);
                  } else if (target instanceof HTMLLinkElement) {
                    const newLink = document.createElement('link');
                    newLink.rel = target.rel || 'stylesheet';
                    newLink.href = fixedUrl;
                    if (target.type) {
                      newLink.type = target.type;
                    }
                    target.parentNode?.replaceChild(newLink, target);
                  }
                }
              }
            }
          }, true); // 使用捕获阶段，确保能拦截到错误
        })();
      </script>
    `;

    // 在 </head> 之前注入修复代码
    if (result.includes('</head>')) {
      result = result.replace('</head>', interceptScript + '</head>');
    } else if (result.includes('<body')) {
      // 如果没有 head 标签，在 body 之前注入
      result = result.replace('<body', interceptScript + '<body');
    }

    return result;
  };

  const transformTemplate = (tpl: string) => ensureModuleScriptType(rewriteAssetUrls(tpl));

  // 关键：layout-app 应该直接挂载到 #app，与其他应用保持一致
  // 不需要创建额外的 #layout-container 容器
  // layout-app 内部的 AppLayout 组件会提供 #subapp-viewport 容器用于挂载子应用

  // 拦截动态导入，修复资源路径

  // 创建 Promise，等待 layout-app 挂载完成
  return new Promise<void>((resolve) => {
    let layoutAppMounted = false;
    let mountTimeout: ReturnType<typeof setTimeout> | null = null;

    // 注册并启动 qiankun，仅挂载布局微应用
    registerMicroApps(
      [
        {
          name: 'layout-app',
          entry: layoutEntry,
          container: '#app',
          activeRule: () => true,
          // 添加 scriptType 和 getTemplate 配置，确保资源正确加载
          // 注意：scriptType 和 getTemplate 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
          scriptType: 'module' as any,
          getTemplate: function(tpl: string) {
            return transformTemplate(tpl);
          },
        }
      ],
      {
        beforeLoad: [
          () => {
            // 静默加载
          },
        ],
        beforeMount: [
          () => {
            // 静默挂载
          },
        ],
        afterMount: [
          (app: any) => {
            if (!layoutAppMounted && app.name === 'layout-app') {
              layoutAppMounted = true;
              if (mountTimeout) {
                clearTimeout(mountTimeout);
                mountTimeout = null;
              }
              // 延迟一下，确保 layout-app 完全初始化
              setTimeout(() => {
                resolve();
              }, 200);
            }
          },
        ],
        beforeUnmount: [
          () => {
            // 静默卸载
          },
        ],
        afterUnmount: [
          () => {
            // 静默卸载完成
          },
        ],
      }
    );

    const boundFetch =
      typeof window !== 'undefined' && typeof window.fetch === 'function'
        ? window.fetch.bind(window)
        : typeof fetch === 'function'
          ? fetch
          : null;

    start({
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: true,
      },
      singular: false,
      // 添加自定义 fetch 和 getTemplate 配置，确保跨域资源可以加载
      // 注意：importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
      importEntryOpts: {
        fetch: function (url: RequestInfo | URL, options?: RequestInit) {
          const requestOptions: RequestInit = {
            ...(options || {}),
            mode: 'cors',
            credentials: 'include',
          };

          if (boundFetch) {
            return boundFetch(url, requestOptions);
          }

          throw new Error('[layout-app loader] 当前环境不支持 fetch，无法加载微应用资源');
        },
        getTemplate: function (tpl: string) {
          return transformTemplate(tpl);
        },
      },
    });

    // 设置超时，避免无限等待
    mountTimeout = setTimeout(() => {
      if (!layoutAppMounted) {
        layoutAppMounted = true;
        resolve();
      }
    }, 5000);
  });
}

