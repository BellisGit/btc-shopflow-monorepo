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

  const appName = typeof window !== 'undefined' 
    ? window.location.hostname.split('.')[0] || 'unknown'
    : 'unknown';

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

  const rewriteAssetUrls = (tpl: string) =>
    tpl
      .replace(/(href|src)=["']\/assets\/([^"']+)["']/gi, (_match, attr, path) => `${attr}="${assetsBase}${path}"`)
      .replace(/(import\(\s*['"])\/assets\//gi, `$1${assetsBase}`);

  const transformTemplate = (tpl: string) => ensureModuleScriptType(rewriteAssetUrls(tpl));

  console.log(`[${appName}-app] 准备加载 layout-app，入口地址:`, layoutEntry);

  // 创建 Promise，等待 layout-app 挂载完成
  return new Promise<void>((resolve, reject) => {
    let layoutAppMounted = false;
    let mountTimeout: ReturnType<typeof setTimeout> | null = null;

    // 注册并启动 qiankun，仅挂载布局微应用
    registerMicroApps(
      [
        {
          name: 'layout-app',
          entry: layoutEntry,
          container: '#layout-container',
          activeRule: () => true,
          // 添加 scriptType 和 getTemplate 配置，确保资源正确加载
          // 注意：scriptType 和 getTemplate 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
          scriptType: 'module' as any,
          getTemplate: function(tpl) {
            return transformTemplate(tpl);
          },
        }
      ],
      {
        beforeLoad: [
          (app) => {
            console.log(`[${appName}-app] 准备加载 layout-app:`, app.name, app.entry);
          },
        ],
        beforeMount: [
          (app) => {
            console.log(`[${appName}-app] 准备挂载 layout-app:`, app.name);
          },
        ],
        afterMount: [
          (app) => {
            console.log(`[${appName}-app] layout-app 挂载完成:`, app.name);
            if (!layoutAppMounted && app.name === 'layout-app') {
              layoutAppMounted = true;
              if (mountTimeout) {
                clearTimeout(mountTimeout);
                mountTimeout = null;
              }
              // 延迟一下，确保 layout-app 完全初始化
              setTimeout(() => {
                console.log(`[${appName}-app] layout-app 已完全初始化，可以继续初始化`);
                resolve();
              }, 200);
            }
          },
        ],
        beforeUnmount: [
          (app) => {
            console.log(`[${appName}-app] 准备卸载 layout-app:`, app.name);
          },
        ],
        afterUnmount: [
          (app) => {
            console.log(`[${appName}-app] layout-app 卸载完成:`, app.name);
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
          console.log(`[${appName}-app] 加载资源:`, url);

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

    console.log(`[${appName}-app] qiankun 已启动，等待 layout-app 挂载...`);

    // 设置超时，避免无限等待
    mountTimeout = setTimeout(() => {
      if (!layoutAppMounted) {
        console.warn(`[${appName}-app] layout-app 挂载超时（5秒），继续初始化`);
        layoutAppMounted = true;
        resolve();
      }
    }, 5000);
  });
}

