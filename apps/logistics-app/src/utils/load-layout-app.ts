/**
 * 加载 layout-app 的工具函数
 * 使用本地安装的 qiankun，而不是从 CDN 加载
 */

export async function loadLayoutApp() {
  // 动态导入 qiankun（会被 Vite 打包到应用中）
  const { registerMicroApps, start } = await import('qiankun');

  // 获取当前环境
  const isProd = window.location.hostname.includes('bellis.com.cn');
  const protocol = window.location.protocol;
  
  // 布局微应用入口
  const layoutEntry = isProd
    ? `${protocol}//layout.bellis.com.cn/`
    : 'http://localhost:4188/';

  console.log('[logistics-app] 准备加载 layout-app，入口地址:', layoutEntry);

  // 注册并启动 qiankun，仅挂载布局微应用
  registerMicroApps(
    [
      {
        name: 'layout-app',
        entry: layoutEntry,
        container: '#layout-container',
        activeRule: () => true,
        // 添加 scriptType 和 getTemplate 配置，确保资源正确加载
        scriptType: 'module',
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
          console.log('[logistics-app] 准备加载 layout-app:', app.name, app.entry);
        }
      ],
      beforeMount: [
        (app) => {
          console.log('[logistics-app] 准备挂载 layout-app:', app.name);
        }
      ],
      afterMount: [
        (app) => {
          console.log('[logistics-app] layout-app 挂载完成:', app.name);
        }
      ],
      beforeUnmount: [
        (app) => {
          console.log('[logistics-app] 准备卸载 layout-app:', app.name);
        }
      ],
      afterUnmount: [
        (app) => {
          console.log('[logistics-app] layout-app 卸载完成:', app.name);
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
    // 添加错误处理
    errorHandler: function(error) {
      console.error('[logistics-app] qiankun 错误:', error);
    },
    // 添加自定义 fetch 和 getTemplate 配置，确保跨域资源可以加载
    importEntryOpts: {
      fetch: function(url, options) {
        console.log('[logistics-app] 加载资源:', url);
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

  console.log('[logistics-app] qiankun 已启动');
}

