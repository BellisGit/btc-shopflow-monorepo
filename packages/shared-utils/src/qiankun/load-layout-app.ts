/**
 * 加载 layout-app 的共享工具函数
 * 
 * 使用说明：
 * 1. 在应用的 package.json 中添加 qiankun 依赖：`"qiankun": "^2.10.16"`
 * 2. 在 index.html 中调用此函数
 * 
 * @example
 * ```html
 * <script>
 *   import('/@btc/shared-utils/qiankun/load-layout-app').then(({ loadLayoutApp }) => {
 *     loadLayoutApp();
 *   });
 * </script>
 * ```
 */

/**
 * 加载 layout-app
 * 注意：调用此函数前，需要确保已安装 qiankun 依赖
 */
export async function loadLayoutApp() {
  // 动态导入 qiankun（会被 Vite 打包到应用中）
  // 注意：qiankun 需要在调用此函数的应用中安装
  const { registerMicroApps, start } = await import('qiankun');

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

  console.log(`[${appName}-app] 准备加载 layout-app，入口地址:`, layoutEntry);

  // 注册并启动 qiankun，仅挂载布局微应用
  registerMicroApps(
    [
      {
        name: 'layout-app',
        entry: layoutEntry,
        container: '#layout-container',
        activeRule: () => true,
        // 添加 scriptType 和 getTemplate 配置，确保资源正确加载
        // @ts-expect-error - scriptType 和 getTemplate 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
        scriptType: 'module' as const,
        getTemplate: function(tpl) {
          // 确保所有 script 标签都有 type="module"
          return tpl.replace(
            /<script(\s+[^>]*)?>/gi,
            function(match, attrs) {
              if (!attrs) attrs = '';
              // 如果已经有 type 属性，替换为 module
              if (attrs.includes('type=')) {
                return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
              }
              // 如果没有 type 属性，添加 type="module"
              return '<script type="module"' + attrs + '>';
            }
          );
        },
      }
    ],
    {
      beforeLoad: [
        (app) => {
          console.log(`[${appName}-app] 准备加载 layout-app:`, app.name, app.entry);
        }
      ],
      beforeMount: [
        (app) => {
          console.log(`[${appName}-app] 准备挂载 layout-app:`, app.name);
        }
      ],
      afterMount: [
        (app) => {
          console.log(`[${appName}-app] layout-app 挂载完成:`, app.name);
        }
      ],
      beforeUnmount: [
        (app) => {
          console.log(`[${appName}-app] 准备卸载 layout-app:`, app.name);
        }
      ],
      afterUnmount: [
        (app) => {
          console.log(`[${appName}-app] layout-app 卸载完成:`, app.name);
        }
      ],
    }
  );

  start({
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true,
    },
    singular: false,
    // 添加自定义 fetch 和 getTemplate 配置，确保跨域资源可以加载
    // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
    importEntryOpts: {
      fetch: function(url, options) {
        console.log(`[${appName}-app] 加载资源:`, url);
        return fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'include',
        });
      },
      getTemplate: function(tpl) {
        // 确保所有 script 标签都有 type="module"
        return tpl.replace(
          /<script(\s+[^>]*)?>/gi,
          function(match, attrs) {
            if (!attrs) attrs = '';
            // 如果已经有 type 属性，替换为 module
            if (attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            // 如果没有 type 属性，添加 type="module"
            return '<script type="module"' + attrs + '>';
          }
        );
      },
    },
  });

  console.log(`[${appName}-app] qiankun 已启动`);
}

