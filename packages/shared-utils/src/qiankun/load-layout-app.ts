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
  // 关键：修复双斜杠问题，确保 URL 格式正确
  const layoutEntry = isProd
    ? `${protocol}//layout.bellis.com.cn/`
    : 'http://localhost:4188/';

  console.log('[loadLayoutApp] 环境检测:', {
    isProd,
    protocol,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    layoutEntry,
  });

  // 关键：layout-app 应该直接挂载到 #app，而不是通过 qiankun
  // 先获取 layout-app 的 HTML，然后从中提取入口文件路径，再直接加载入口文件

  // 创建 Promise，等待 layout-app 挂载完成
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
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

    // 清理可能残留的 DOM 元素（如果加载失败）
    const cleanupDom = () => {
      // 清理可能添加的 script 标签
      const scripts = document.querySelectorAll('script[src*="layout.bellis.com.cn"], script[src*="localhost:4188"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      // 清理可能添加的 base 标签（仅清理我们添加的）
      const base = document.querySelector('base[data-layout-app-base]');
      if (base && base.parentNode) {
        base.parentNode.removeChild(base);
      }
      // 清理 #app 容器中可能残留的 layout-app 内容
      const appContainer = document.querySelector('#app');
      if (appContainer) {
        // 只清理 layout-app 相关的内容，保留其他内容
        const layoutElements = appContainer.querySelectorAll('[data-layout-app]');
        layoutElements.forEach(el => el.remove());
      }
    };

    // 设置标志，告诉 layout-app 它应该挂载到 #app
    (window as any).__LAYOUT_APP_MOUNT_TARGET__ = '#app';

    // 从 HTML 中获取所有 script 标签（包括 vendor、echarts-vendor 等依赖）
    // 这样可以确保所有依赖的 chunk 都在入口文件之前加载完成，避免模块初始化顺序问题
    const entryUrl = new URL(layoutEntry);
    const htmlUrl = `${entryUrl.origin}/index.html`;

    const fetchTimeout = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

    let scriptUrls: string[] = [];

    try {
      const htmlResponse = await fetch(htmlUrl, {
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!htmlResponse.ok) {
        throw new Error(`获取 layout-app HTML 失败: HTTP ${htmlResponse.status} ${htmlResponse.statusText}`);
      }

      const htmlText = await htmlResponse.text();

      console.log('[loadLayoutApp] 开始解析 HTML，HTML 长度:', htmlText.length);

      // 使用 DOM 解析器提取所有 script 标签（更可靠）
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const scripts = Array.from(doc.querySelectorAll('script[src]'));

      // 同时提取 modulepreload 标签中的资源（这些是预加载的依赖）
      const modulepreloadLinks = Array.from(doc.querySelectorAll('link[rel="modulepreload"][href]'));

      console.log(`[loadLayoutApp] 找到 ${scripts.length} 个 script 标签，${modulepreloadLinks.length} 个 modulepreload 标签`);

      // 从 script 标签提取
      const scriptUrlSet = new Set<string>();

      scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        if (!src) {
          console.warn(`[loadLayoutApp] script[${index}] 没有 src 属性`);
          return;
        }

        // 移除版本号查询参数
        let cleanSrc = src.replace(/[?&]v=[^&'"]*/g, '');

        // 转换为绝对路径
        if (cleanSrc.startsWith('/')) {
          cleanSrc = `${entryUrl.origin}${cleanSrc}`;
        } else if (!cleanSrc.startsWith('http://') && !cleanSrc.startsWith('https://')) {
          cleanSrc = `${entryUrl.origin}/${cleanSrc}`;
        }

        scriptUrlSet.add(cleanSrc);
        console.log(`[loadLayoutApp] 从 script 标签提取: ${cleanSrc}`);
      });

      // 从 modulepreload 标签提取（这些通常是依赖 chunk）
      modulepreloadLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (!href) {
          console.warn(`[loadLayoutApp] modulepreload[${index}] 没有 href 属性`);
          return;
        }

        // 只处理 JS 文件
        if (!href.endsWith('.js') && !href.endsWith('.mjs')) {
          return;
        }

        // 移除版本号查询参数
        let cleanHref = href.replace(/[?&]v=[^&'"]*/g, '');

        // 转换为绝对路径
        if (cleanHref.startsWith('/')) {
          cleanHref = `${entryUrl.origin}${cleanHref}`;
        } else if (!cleanHref.startsWith('http://') && !cleanHref.startsWith('https://')) {
          cleanHref = `${entryUrl.origin}/${cleanHref}`;
        }

        scriptUrlSet.add(cleanHref);
        console.log(`[loadLayoutApp] 从 modulepreload 标签提取: ${cleanHref}`);
      });

      scriptUrls = Array.from(scriptUrlSet);

      // 如果 DOM 解析失败或没有找到任何脚本，尝试正则表达式作为回退
      if (scriptUrls.length === 0) {
        console.warn('[loadLayoutApp] DOM 解析未找到脚本，尝试正则表达式回退');
        // 使用正则表达式提取所有 type="module" 的 script 标签
        const scriptRegex = /<script[^>]*(?:type=["']module["'][^>]*src=["']([^"']+)["']|src=["']([^"']+)["'][^>]*type=["']module["'])[^>]*><\/script>/gi;
        const matches = Array.from(htmlText.matchAll(scriptRegex));

        scriptUrls = matches.map(match => {
          let src = match[1] || match[2];
          if (!src) return null;
          src = src.replace(/[?&]v=[^&'"]*/g, '');
          if (src.startsWith('/')) {
            src = `${entryUrl.origin}${src}`;
          } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
            src = `${entryUrl.origin}/${src}`;
          }
          console.log(`[loadLayoutApp] 正则回退提取到 script URL: ${src}`);
          return src;
        }).filter((url): url is string => url !== null);

        // 如果仍然失败，尝试更宽松的匹配
        if (scriptUrls.length === 0) {
          console.warn('[loadLayoutApp] 正则匹配失败，尝试更宽松的匹配');
          const looseScriptRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["'][^>]*>/gi;
          const looseMatches = Array.from(htmlText.matchAll(looseScriptRegex));
          scriptUrls = looseMatches.map(match => {
            let src = match[1];
            if (!src) return null;
            src = src.replace(/[?&]v=[^&'"]*/g, '');
            if (src.startsWith('/')) {
              src = `${entryUrl.origin}${src}`;
            } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
              src = `${entryUrl.origin}/${src}`;
            }
            console.log(`[loadLayoutApp] 宽松匹配提取到 script URL: ${src}`);
            return src;
          }).filter((url): url is string => url !== null);

          // 也尝试匹配 modulepreload
          const modulepreloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.(js|mjs)[^"']*)["'][^>]*>/gi;
          const preloadMatches = Array.from(htmlText.matchAll(modulepreloadRegex));
          const preloadUrls = preloadMatches.map(match => {
            let href = match[1];
            if (!href) return null;
            href = href.replace(/[?&]v=[^&'"]*/g, '');
            if (href.startsWith('/')) {
              href = `${entryUrl.origin}${href}`;
            } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
              href = `${entryUrl.origin}/${href}`;
            }
            console.log(`[loadLayoutApp] 宽松匹配提取到 modulepreload URL: ${href}`);
            return href;
          }).filter((url): url is string => url !== null);

          scriptUrls = [...scriptUrls, ...preloadUrls];
          // 去重
          scriptUrls = Array.from(new Set(scriptUrls));
        }
      }

      console.log(`[loadLayoutApp] 总共提取到 ${scriptUrls.length} 个脚本 URL`);

      // 关键：确保正确的加载顺序，避免模块初始化顺序问题
      // 1. vendor 应该在 echarts-vendor 之前（vendor 包含 Vue 核心函数）
      // 2. 其他依赖（如 menu-registry、eps-service、auth-api）应该在入口文件之前
      // 3. 入口文件（index/main）应该最后加载
      scriptUrls.sort((a, b) => {
        const aFileName = a.substring(a.lastIndexOf('/') + 1);
        const bFileName = b.substring(b.lastIndexOf('/') + 1);

        // 确定文件类型优先级（数字越小，优先级越高）
        const getPriority = (fileName: string): number => {
          // 1. vendor（不包含 echarts）
          if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) return 1;
          // 2. echarts-vendor
          if (fileName.includes('echarts-vendor')) return 2;
          // 3. 其他依赖（menu-registry、eps-service、auth-api 等）
          if (fileName.includes('menu-registry') ||
              fileName.includes('eps-service') ||
              fileName.includes('auth-api')) return 3;
          // 4. 入口文件（index、main）
          if (fileName.includes('index-') || fileName.includes('main-')) return 4;
          // 5. 其他未知文件
          return 3;
        };

        const aPriority = getPriority(aFileName);
        const bPriority = getPriority(bFileName);

        return aPriority - bPriority;
      });

      console.log('[loadLayoutApp] 脚本加载顺序:', scriptUrls.map(url => url.substring(url.lastIndexOf('/') + 1)));

      // 如果没有找到任何 script 标签，使用 manifest 作为回退
      if (scriptUrls.length === 0) {
        console.warn('[loadLayoutApp] 未找到 script 标签，尝试从 manifest.json 获取');
        const manifestUrl = `${entryUrl.origin}/manifest.json`;
        try {
          const manifestResponse = await fetch(manifestUrl, {
            mode: 'cors',
            credentials: 'omit',
          });

          if (manifestResponse.ok) {
            const manifest: Record<string, { file: string; src?: string; isEntry?: boolean }> = await manifestResponse.json();
            console.log('[loadLayoutApp] manifest.json 内容:', manifest);

            // 从 manifest 中提取所有 chunk 文件（包括依赖）
            const manifestUrls: Array<{ url: string; priority: number }> = [];

            console.log(`[loadLayoutApp] 开始从 manifest.json 提取文件，manifest 键数量: ${Object.keys(manifest).length}`);

            for (const [key, entry] of Object.entries(manifest)) {
              // 检查 entry 结构
              if (!entry || typeof entry !== 'object') {
                console.warn(`[loadLayoutApp] manifest 项格式不正确: ${key}`, entry);
                continue;
              }

              if (!entry.file) {
                console.warn(`[loadLayoutApp] manifest 项缺少 file 字段: ${key}`, entry);
                continue;
              }

              if (!entry.file.endsWith('.js')) {
                // 跳过非 JS 文件
                continue;
              }

              let fileUrl = entry.file;

              // 转换为绝对路径
              if (fileUrl.startsWith('/')) {
                fileUrl = `${entryUrl.origin}${fileUrl}`;
              } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                // 如果路径不以 / 开头，添加 / 前缀
                fileUrl = `${entryUrl.origin}/${fileUrl}`;
              }

              // 确定加载优先级
              const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
              let priority = 999;
              if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
                priority = 1;
              } else if (fileName.includes('echarts-vendor')) {
                priority = 2;
              } else if (fileName.includes('menu-registry') ||
                         fileName.includes('eps-service') ||
                         fileName.includes('auth-api')) {
                priority = 3;
              } else if (entry.isEntry || fileName.includes('index-') || fileName.includes('main-')) {
                priority = 4;
              }

              manifestUrls.push({ url: fileUrl, priority });
              console.log(`[loadLayoutApp] 从 manifest.json 提取: ${fileUrl} (优先级: ${priority}, isEntry: ${entry.isEntry || false})`);
            }

            console.log(`[loadLayoutApp] 从 manifest.json 提取到 ${manifestUrls.length} 个文件`);

            // 按优先级排序
            manifestUrls.sort((a, b) => a.priority - b.priority);
            scriptUrls = manifestUrls.map(item => item.url);

            if (scriptUrls.length > 0) {
              console.log(`[loadLayoutApp] ✅ 从 manifest.json 获取 ${scriptUrls.length} 个文件，文件列表:`, scriptUrls.map(url => url.substring(url.lastIndexOf('/') + 1)));
            } else {
              console.warn('[loadLayoutApp] ⚠️  manifest.json 中未找到任何 JS 文件');
            }
          } else {
            console.warn(`[loadLayoutApp] 获取 manifest.json 失败: HTTP ${manifestResponse.status}`);
          }
        } catch (manifestError) {
          console.error('[loadLayoutApp] 获取 manifest.json 时出错:', manifestError);
        }
      }

      // 如果仍然没有找到，使用常见路径作为回退
      if (scriptUrls.length === 0) {
        scriptUrls = [`${entryUrl.origin}/assets/index.js`];
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[loadLayoutApp] 获取 HTML 失败:', error);
      // 如果获取 HTML 失败，尝试从 manifest.json 获取
      const manifestUrl = `${entryUrl.origin}/manifest.json`;
      try {
        const manifestResponse = await fetch(manifestUrl, {
          mode: 'cors',
          credentials: 'omit',
        });

        if (manifestResponse.ok) {
          const manifest: Record<string, { file: string; src?: string; isEntry?: boolean }> = await manifestResponse.json();

          // 从 manifest 中提取所有 chunk 文件（包括依赖）
          const manifestUrls: Array<{ url: string; priority: number }> = [];

          console.log(`[loadLayoutApp] 错误处理：开始从 manifest.json 提取文件，manifest 键数量: ${Object.keys(manifest).length}`);

          for (const [key, entry] of Object.entries(manifest)) {
            // 检查 entry 结构
            if (!entry || typeof entry !== 'object') {
              console.warn(`[loadLayoutApp] 错误处理：manifest 项格式不正确: ${key}`, entry);
              continue;
            }

            if (!entry.file) {
              console.warn(`[loadLayoutApp] 错误处理：manifest 项缺少 file 字段: ${key}`, entry);
              continue;
            }

            if (!entry.file.endsWith('.js')) {
              // 跳过非 JS 文件
              continue;
            }

            let fileUrl = entry.file;

            // 转换为绝对路径
            if (fileUrl.startsWith('/')) {
              fileUrl = `${entryUrl.origin}${fileUrl}`;
            } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
              // 如果路径不以 / 开头，添加 / 前缀
              fileUrl = `${entryUrl.origin}/${fileUrl}`;
            }

            // 确定加载优先级
            const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            let priority = 999;
            if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
              priority = 1;
            } else if (fileName.includes('echarts-vendor')) {
              priority = 2;
            } else if (fileName.includes('menu-registry') ||
                       fileName.includes('eps-service') ||
                       fileName.includes('auth-api')) {
              priority = 3;
            } else if (entry.isEntry || fileName.includes('index-') || fileName.includes('main-')) {
              priority = 4;
            }

            manifestUrls.push({ url: fileUrl, priority });
            console.log(`[loadLayoutApp] 错误处理：从 manifest.json 提取: ${fileUrl} (优先级: ${priority}, isEntry: ${entry.isEntry || false})`);
          }

          console.log(`[loadLayoutApp] 错误处理：从 manifest.json 提取到 ${manifestUrls.length} 个文件`);

          // 按优先级排序
          manifestUrls.sort((a, b) => a.priority - b.priority);
          scriptUrls = manifestUrls.map(item => item.url);

          if (scriptUrls.length > 0) {
            console.log(`[loadLayoutApp] ✅ 错误处理：从 manifest.json 回退获取 ${scriptUrls.length} 个文件，文件列表:`, scriptUrls.map(url => url.substring(url.lastIndexOf('/') + 1)));
          } else {
            // 最后回退到常见路径
            scriptUrls = [`${entryUrl.origin}/assets/index.js`];
            console.warn(`[loadLayoutApp] ⚠️  错误处理：manifest.json 为空，使用默认回退路径: ${scriptUrls[0]}`);
          }
        } else {
          // 最后回退到常见路径
          scriptUrls = [`${entryUrl.origin}/assets/index.js`];
          console.warn(`[loadLayoutApp] manifest.json 获取失败，使用默认回退路径: ${scriptUrls[0]}`);
        }
      } catch (manifestError) {
        // 最后回退到常见路径
        scriptUrls = [`${entryUrl.origin}/assets/index.js`];
        console.warn(`[loadLayoutApp] manifest.json 获取异常，使用默认回退路径: ${scriptUrls[0]}`, manifestError);
      }
    }

    // 关键：在加载入口脚本之前，先设置 <base> 标签，确保动态导入使用正确的 base URL
    // 这样 layout-app 内部的动态导入（如 import('./xxx.js')）会基于 layout.bellis.com.cn 解析
    const baseHref = entryUrl.origin + '/';

    // 检查是否已经存在 <base> 标签
    const existingBase = document.querySelector('base[data-layout-app-base]') as HTMLBaseElement | null;
    if (existingBase) {
      // 如果已存在我们添加的 base 标签，更新它的 href
      existingBase.href = baseHref;
    } else {
      // 如果不存在，创建一个新的
      const base = document.createElement('base');
      base.href = baseHref;
      base.setAttribute('data-layout-app-base', 'true'); // 标记为我们添加的
      // 插入到 <head> 的最前面，确保在其他资源标签之前
      const head = document.head || document.getElementsByTagName('head')[0];
      if (head.firstChild) {
        head.insertBefore(base, head.firstChild);
      } else {
        head.appendChild(base);
      }
    }

    // 使用 script 标签按顺序加载所有脚本（包括 vendor、echarts-vendor 等依赖）
    // 这样可以确保所有依赖的 chunk 都在入口文件之前加载完成，避免模块初始化顺序问题
    let loadedCount = 0;
    let hasError = false;

    const loadScript = (url: string, index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-layout-app', 'true');
        script.setAttribute('data-script-index', index.toString());

        script.onload = () => {
          loadedCount++;
          resolve();
        };

        script.onerror = (error) => {
          hasError = true;
          const errorDetails = {
            url,
            error: error instanceof Error ? error.message : String(error),
            scriptIndex: index,
            totalScripts: scriptUrls.length,
          };
          console.error('[loadLayoutApp] 脚本加载失败:', errorDetails);
          reject(new Error(`加载 layout-app 脚本失败: ${url} (${errorDetails.error})`));
        };

        document.head.appendChild(script);
      });
    };

    // 按顺序加载所有脚本
    try {
      for (let i = 0; i < scriptUrls.length; i++) {
        await loadScript(scriptUrls[i], i);
      }

      // 所有脚本加载完成后，开始检查挂载状态
      const startCheck = () => {
        // layout-app 的所有脚本已加载，等待它挂载完成
        let checkCount = 0;
        // 缩短超时时间：生产环境 5 秒（100 * 50ms），开发环境 10 秒（200 * 50ms）
        const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));
        const maxChecks = isDev ? 200 : 100; // 开发环境 10 秒，生产环境 5 秒

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

            // 等待 layout-app 完全初始化
            // layout-app 会自动注册并启动 qiankun 来加载子应用，不需要手动触发事件
            setTimeout(() => {
              resolve();
            }, 200);
          }
        } else if (checkCount >= maxChecks) {
          // 超时，挂载失败
          cleanup();
          cleanupDom(); // 清理残留的 DOM

          const errorMsg = `layout-app 挂载超时（已等待 ${maxChecks * 50}ms），未检测到挂载内容`;
          // layout-app 挂载超时（日志已移除）
          reject(new Error(errorMsg));
        }
        // 否则继续检查（通过 setInterval）
      };

      // 每 50ms 检查一次
      checkInterval = setInterval(checkLayoutApp, 50);

      // 设置超时，避免无限等待
      // 关键：超时应该 reject，而不是 resolve
      // 缩短超时时间：生产环境 8 秒，开发环境 15 秒
      const totalTimeout = isDev ? 15000 : 8000;
      mountTimeout = setTimeout(() => {
        if (!layoutAppMounted) {
          layoutAppMounted = true;
          cleanup();
          cleanupDom(); // 清理残留的 DOM

          const errorMsg = `加载 layout-app 超时（${totalTimeout}ms），已加载 ${scriptUrls.length} 个脚本`;
          // 加载 layout-app 超时（日志已移除）
          reject(new Error(errorMsg));
        }
      }, totalTimeout);
      };

      // 开始检查挂载状态
      startCheck();
    } catch (error) {
      cleanup();
      cleanupDom();
      const errorMsg = error instanceof Error
        ? `加载 layout-app 脚本失败: ${error.message}`
        : `加载 layout-app 脚本失败: 未知错误`;
      reject(new Error(errorMsg));
      return;
    }
  });
}

