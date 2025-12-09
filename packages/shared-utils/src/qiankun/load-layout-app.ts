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
export function loadLayoutApp(_qiankunAPI: { registerMicroApps: any; start: any }): Promise<void> {
  // const { registerMicroApps, start } = qiankunAPI; // 未使用

  // 获取当前环境
  const isProd = typeof window !== 'undefined' && window.location.hostname.includes('bellis.com.cn');
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

  // 布局微应用入口
  const layoutEntry = isProd
    ? `${protocol}//layout.bellis.com.cn/`
    : 'http://localhost:4188/';


  // 未使用的函数，保留以备将来使用
  /*
  const getAssetsBase = (entry: string) => {
    try {
      const entryUrl = new URL(entry, typeof window !== 'undefined' ? window.location.href : 'https://bellis.com.cn');
      // 关键：layout-app 的资源现在在 assets/layout/ 子目录中
      return new URL('assets/layout/', entryUrl).toString();
    } catch (_error) {
      return '/assets/layout/';
    }
  };

  const assetsBase = getAssetsBase(layoutEntry);

  // 未使用的函数，保留以备将来使用
  /*
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
    // 匹配格式：href="/assets/xxx.js" 或 src="/assets/xxx.js"
    // 注意：现在 layout-app 的资源在 /assets/layout/ 中，需要匹配这个路径
    let result = tpl.replace(/(href|src)=["']\/assets\/(layout\/)?([^"']+)["']/gi, (_match, attr, layoutPrefix, path) => {
      // 如果已经是 /assets/layout/ 路径，直接使用 assetsBase
      if (layoutPrefix === 'layout/') {
        return `${attr}="${assetsBase}${path}"`;
      }
      // 如果是 /assets/ 路径（没有 layout/ 前缀），添加 layout/ 前缀
      return `${attr}="${assetsBase}${path}"`;
    });

    // 重写 import() 动态导入中的资源路径（包括单引号和双引号）
    // 匹配格式：import('/assets/xxx.js') 或 import("/assets/xxx.js") 或 import('/assets/layout/xxx.js')
    result = result.replace(/(import\s*\(\s*['"])\/assets\/(layout\/)?([^"']+)(['"]\s*\))/gi, (_match, prefix, _layoutPrefix, path, suffix) => {
      return `${prefix}${assetsBase}${path}${suffix}`;
    });

    // 重写 import 语句中的资源路径（包括相对路径和绝对路径）
    // 匹配格式：import xxx from '/assets/xxx.js'
    result = result.replace(/(import\s+[^'"]*['"])\/assets\/(layout\/)?([^"']+)(['"])/gi, (_match, prefix, _layoutPrefix, path, suffix) => {
      return `${prefix}${assetsBase}${path}${suffix}`;
    });

    // 重写 new URL() 中的资源路径
    // 匹配格式：new URL('/assets/xxx.js', ...)
    result = result.replace(/(new\s+URL\s*\(\s*['"])\/assets\/(layout\/)?([^"']+)(['"])/gi, (_match, prefix, _layoutPrefix, path, suffix) => {
      return `${prefix}${assetsBase}${path}${suffix}`;
    });

    // 重写 script 标签中的 src 属性（确保使用完整的 assetsBase URL）
    // 匹配格式：<script src="/assets/xxx.js">
    result = result.replace(/(<script[^>]*\s+src=["'])\/assets\/(layout\/)?([^"']+)(["'])/gi, (_match, prefix, _layoutPrefix, path, suffix) => {
      return `${prefix}${assetsBase}${path}${suffix}`;
    });

    // 重写 link 标签中的 href 属性（CSS 文件等）
    // 匹配格式：<link href="/assets/xxx.css">
    result = result.replace(/(<link[^>]*\s+href=["'])\/assets\/(layout\/)?([^"']+)(["'])/gi, (_match, prefix, _layoutPrefix, path, suffix) => {
      return `${prefix}${assetsBase}${path}${suffix}`;
    });

    // 额外处理：重写所有以 /assets/ 或 /assets/layout/ 开头的字符串（兜底，处理其他可能的格式）
    // 注意：这个替换必须在其他替换之后，避免重复替换
    result = result.replace(/(['"])\/assets\/(layout\/)?([^"']+)(['"])/gi, (_match, quote1, _layoutPrefix, path, quote2) => {
      // 检查是否已经被替换过（如果路径已经是完整 URL，跳过）
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return _match;
      }
      return `${quote1}${assetsBase}${path}${quote2}`;
    });

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

            // 如果 URL 是相对路径且指向 /assets/layout/，重写为 layout-app 的完整 URL
            if (url.startsWith('/assets/layout/') || url.startsWith('./assets/layout/') || url.startsWith('../assets/layout/')) {
              const normalizedPath = url.startsWith('/') ? url : url.replace(new RegExp('^[.][.]?/'), '/');
              return layoutAssetsBase + normalizedPath.replace(new RegExp('^/assets/layout/'), '');
            }
            // 兼容旧的 /assets/ 路径（如果存在，自动添加 layout/ 前缀）
            if (url.startsWith('/assets/') || url.startsWith('./assets/') || url.startsWith('../assets/')) {
              const normalizedPath = url.startsWith('/') ? url : url.replace(new RegExp('^[.][.]?/'), '/');
              // 如果路径不是 /assets/layout/，添加 layout/ 前缀
              if (!normalizedPath.startsWith('/assets/layout/')) {
                const pathWithoutPrefix = normalizedPath.replace(new RegExp('^/assets/'), '');
                return layoutAssetsBase + pathWithoutPrefix;
              }
              return layoutAssetsBase + normalizedPath.replace(new RegExp('^/assets/layout/'), '');
            }

            // 如果 URL 已经是完整 URL 但指向错误的域名，修复它
            if (url.startsWith('http://') || url.startsWith('https://')) {
              try {
                const urlObj = new URL(url);
                // 如果 URL 指向当前域名但应该是 layout-app 的域名，修复它
                if (urlObj.hostname === currentHost && urlObj.pathname.startsWith('/assets/') && currentHost !== layoutHost) {
                  urlObj.hostname = layoutHost;
                  // 确保路径是 /assets/layout/
                  if (!urlObj.pathname.startsWith('/assets/layout/')) {
                    urlObj.pathname = urlObj.pathname.replace('/assets/', '/assets/layout/');
                  }
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

          // 拦截动态 import() 调用
          // 注意：无法直接重写 import()，但可以通过拦截错误来修复
          // 或者使用 Proxy 拦截模块加载（如果支持）

          // 重写 import.meta.resolve 来修复动态导入路径（如果支持）
          if (typeof import.meta !== 'undefined' && import.meta.resolve) {
            const originalResolve = import.meta.resolve;
            import.meta.resolve = function(specifier, parent) {
              const resolved = originalResolve.call(this, specifier, parent);
              return fixAssetUrl(resolved);
            };
          }

          // 拦截所有资源加载错误，自动修复并重试
          // 这包括 script、link、img 等所有资源类型
          const originalAddEventListener = EventTarget.prototype.addEventListener;
          EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'error' && this instanceof HTMLScriptElement || this instanceof HTMLLinkElement) {
              const wrappedListener = function(event) {
                if (event.target && (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement)) {
                  const target = event.target;
                  const src = (target instanceof HTMLScriptElement ? target.src : null) ||
                              (target instanceof HTMLLinkElement ? target.href : null);

                  if (src) {
                    const fixedUrl = fixAssetUrl(src);
                    if (fixedUrl !== src) {
                      event.preventDefault();
                      event.stopPropagation();
                      event.stopImmediatePropagation();

                      // 重新加载资源
                      if (target instanceof HTMLScriptElement) {
                        const newScript = document.createElement('script');
                        newScript.src = fixedUrl;
                        newScript.type = 'module';
                        newScript.crossOrigin = 'anonymous';
                        target.parentNode?.replaceChild(newScript, target);
                      } else if (target instanceof HTMLLinkElement) {
                        const newLink = document.createElement('link');
                        newLink.rel = target.rel || 'stylesheet';
                        newLink.href = fixedUrl;
                        newLink.crossOrigin = 'anonymous';
                        if (target.type) {
                          newLink.type = target.type;
                        }
                        target.parentNode?.replaceChild(newLink, target);
                      }
                      return false;
                    }
                  }
                }
                if (listener) {
                  return listener.call(this, event);
                }
              };
              return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
          };

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
  */

  // const transformTemplate = (tpl: string) => ensureModuleScriptType(rewriteAssetUrls(tpl)); // 未使用

  // 关键：layout-app 应该直接挂载到 #app，而不是通过 qiankun
  // 先获取 layout-app 的 HTML，然后从中提取入口文件路径，再直接加载入口文件

  // 创建 Promise，等待 layout-app 挂载完成
  return new Promise<void>((resolve, reject) => {
    let layoutAppMounted = false;
    let mountTimeout: ReturnType<typeof setTimeout> | null = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    // 清理函数（定义在 Promise 回调中，可以访问所有变量）
    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (mountTimeout) {
        clearTimeout(mountTimeout);
        mountTimeout = null;
      }
    };

    // 确保 #app 容器存在
    // 未使用，保留以备将来使用
    /*
    const ensureAppContainer = () => {
      let appContainer = document.querySelector('#app') as HTMLElement;
      if (!appContainer) {
        // 如果 #app 不存在，创建一个
        appContainer = document.createElement('div');
        appContainer.id = 'app';
        document.body.appendChild(appContainer);
      }
      return appContainer;
    };
    */

    // 提前确保容器存在
    // const appContainer = ensureAppContainer(); // 未使用

    // 设置标志，告诉 layout-app 它应该挂载到 #app
    (window as any).__LAYOUT_APP_MOUNT_TARGET__ = '#app';

    console.log('[layout-app loader] 开始加载 layout-app，入口地址:', layoutEntry);

    // 先获取 layout-app 的 HTML，从中提取入口文件路径
    fetch(layoutEntry, {
      mode: 'cors',
      credentials: 'omit',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`获取 layout-app HTML 失败: HTTP ${response.status} ${response.statusText}`);
        }
        console.log('[layout-app loader] ✅ 成功获取 layout-app HTML');
        return response.text();
      })
      .then(html => {
        // 从 HTML 中提取入口文件路径
        // 开发环境：<script type="module" src="/src/main.ts"></script>
        // 生产环境：<script type="module" src="/assets/layout/index-[hash].js"></script>
        const scriptMatch = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/i);
        if (!scriptMatch) {
          throw new Error(`无法从 layout-app 的 HTML 中提取入口文件路径。HTML 长度: ${html.length} 字符`);
        }

        let mainEntry = scriptMatch[1];
        console.log('[layout-app loader] 从 HTML 中提取到入口文件路径:', mainEntry);

        // 如果是相对路径，转换为绝对路径
        if (mainEntry.startsWith('/')) {
          const entryUrl = new URL(layoutEntry);
          mainEntry = `${entryUrl.origin}${mainEntry}`;
        } else if (!mainEntry.startsWith('http://') && !mainEntry.startsWith('https://')) {
          const entryUrl = new URL(layoutEntry);
          mainEntry = `${entryUrl.origin}/${mainEntry}`;
        }

        console.log('[layout-app loader] 解析后的入口文件完整路径:', mainEntry);

        // 关键：在加载入口脚本之前，先设置 <base> 标签，确保动态导入使用正确的 base URL
        // 这样 layout-app 内部的动态导入（如 import('./xxx.js')）会基于 layout.bellis.com.cn 解析
        const entryUrl = new URL(layoutEntry);
        const baseHref = entryUrl.origin + '/';

        // 检查是否已经存在 <base> 标签
        let existingBase = document.querySelector('base');
        if (existingBase) {
          // 如果已存在，更新它的 href
          existingBase.href = baseHref;
        } else {
          // 如果不存在，创建一个新的
          const base = document.createElement('base');
          base.href = baseHref;
          // 插入到 <head> 的最前面，确保在其他资源标签之前
          const head = document.head || document.getElementsByTagName('head')[0];
          if (head.firstChild) {
            head.insertBefore(base, head.firstChild);
          } else {
            head.appendChild(base);
          }
        }

        console.log('[layout-app loader] 已设置 <base> 标签:', baseHref);

        // 创建 script 标签来加载 layout-app
        const script = document.createElement('script');
        script.type = 'module';
        script.src = mainEntry;
        script.crossOrigin = 'anonymous';

        // 监听加载完成事件
        script.onload = () => {
          console.log('[layout-app loader] ✅ layout-app 入口文件加载成功，等待挂载...');

          // layout-app 的入口文件已加载，等待它挂载完成
          // 监听 layout-app 的挂载事件
          let checkCount = 0;
          const maxChecks = 200; // 最多检查 10 秒（200 * 50ms）

          const checkLayoutApp = () => {
            checkCount++;

            // 检查 #app 容器中是否有 layout-app 的内容（不仅仅是空容器）
            const appContainer = document.querySelector('#app') as HTMLElement;
            const hasLayoutContent = appContainer &&
              (appContainer.children.length > 0 ||
               appContainer.innerHTML.trim().length > 0 ||
               document.querySelector('#layout-app') !== null ||
               document.querySelector('#subapp-viewport') !== null);

            if (hasLayoutContent) {
              if (!layoutAppMounted) {
                layoutAppMounted = true;
                cleanup();

                console.log('[layout-app loader] ✅ layout-app 挂载成功');

                // 等待 layout-app 完全初始化
                // layout-app 会自动注册并启动 qiankun 来加载子应用，不需要手动触发事件
                setTimeout(() => {
                  resolve();
                }, 200);
              }
            } else if (checkCount >= maxChecks) {
              // 超时，挂载失败
              cleanup();

              const errorMsg = `layout-app 挂载超时（已等待 ${maxChecks * 50}ms），未检测到挂载内容`;
              console.error('[layout-app loader] ❌', errorMsg, {
                appContainer: appContainer ? {
                  exists: true,
                  childrenCount: appContainer.children.length,
                  innerHTMLLength: appContainer.innerHTML.trim().length,
                } : { exists: false },
              });
              reject(new Error(errorMsg));
            }
            // 否则继续检查（通过 setInterval）
          };

          // 每 50ms 检查一次
          checkInterval = setInterval(checkLayoutApp, 50);
        };

        script.onerror = (error) => {
          cleanup();

          const errorMsg = `加载 layout-app 入口文件失败: ${mainEntry}`;
          console.error('[layout-app loader] ❌', errorMsg, {
            error,
            entryUrl: mainEntry,
            layoutEntry,
          });
          reject(new Error(errorMsg));
        };

        // 添加到页面
        document.head.appendChild(script);
        console.log('[layout-app loader] 已添加 script 标签，开始加载入口文件...');

        // 设置超时，避免无限等待
        // 关键：超时应该 reject，而不是 resolve
        mountTimeout = setTimeout(() => {
          if (!layoutAppMounted) {
            layoutAppMounted = true;
            cleanup();

            const errorMsg = `加载 layout-app 超时（${10000}ms），入口文件: ${mainEntry}`;
            console.error('[layout-app loader] ❌', errorMsg);
            reject(new Error(errorMsg));
          }
        }, 10000);
      })
      .catch(error => {
        if (mountTimeout) {
          clearTimeout(mountTimeout);
          mountTimeout = null;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorMsg = `获取 layout-app HTML 失败: ${errorMessage}`;
        console.error('[layout-app loader] ❌', errorMsg, {
          layoutEntry,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error,
        });
        reject(new Error(errorMsg));
      });
  });
}

