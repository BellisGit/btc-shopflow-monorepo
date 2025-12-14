import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
import type { QiankunProps } from '@btc/shared-core';
// 关键：在 main.ts 中也导入 registerManifestTabsForApp，确保在 qiankun 环境下模块能正确加载
import { registerManifestTabsForApp } from '@configs/layout-bridge';
import {
  createFinanceApp,
  mountFinanceApp,
  unmountFinanceApp,
  updateFinanceApp,
} from './bootstrap';
import type { FinanceAppContext } from './bootstrap';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';

let context: FinanceAppContext | null = null;

const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

const render = async (props: QiankunProps = {}) => {
  if (context) {
    unmountFinanceApp(context);
    context = null;
  }

  context = await createFinanceApp(props);
  await mountFinanceApp(context, props);
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve(undefined);
}

async function mount(props: QiankunProps) {
  // 生产环境且非 layout-app：先加载共享资源
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    try {
      await loadSharedResourcesFromLayoutApp({
        onProgress: (loaded, total) => {
          if (import.meta.env.DEV) {
            console.log(`[finance-app] 加载共享资源进度: ${loaded}/${total}`);
          }
        },
      });
    } catch (error) {
      console.warn('[finance-app] 加载共享资源失败，继续使用本地资源:', error);
      // 继续执行，使用本地打包的资源作为降级方案
    }
  }

  await render(props);
}

async function unmount(props: QiankunProps = {}) {
  if (context) {
    unmountFinanceApp(context, props);
    context = null;
  }
}

async function update(props: QiankunProps) {
  if (context) {
    updateFinanceApp(context, props);
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  update,
  unmount,
});

// 导出 timeouts 配置，供 single-spa 使用
// 关键：增加生产环境的超时时间，避免网络延迟和资源加载导致的超时
// 注意：使用 import.meta.env.PROD 明确判定生产环境，避免构建产物环境判断异常导致 warningMillis=4000
const isProd = import.meta.env.PROD;
export const timeouts = {
  bootstrap: {
    millis: isProd ? 20000 : 8000, // 生产环境 20 秒，开发环境 8 秒（考虑网络延迟和资源加载）
    dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
    warningMillis: isProd ? 15000 : 4000, // 警告时间：生产环境 15 秒，开发环境 4 秒（避免过早警告）
  },
  mount: {
    millis: isProd ? 15000 : 8000, // 生产环境 15 秒，开发环境 8 秒
    dieOnTimeout: false, // 超时后不终止应用，只警告
    warningMillis: isProd ? 12000 : 4000, // 警告时间：生产环境 12 秒，开发环境 4 秒
  },
  unmount: {
    millis: 5000, // 增加到 5 秒，确保卸载完成
    dieOnTimeout: false,
    warningMillis: 4000,
  },
};

// 标准 ES 模块导出（qiankun 需要）
// 关键：将 timeouts 也添加到 default 导出中，确保 single-spa 能够读取
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
// 注意：与 admin-app 和 logistics-app 保持一致
if (shouldRunStandalone()) {
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 需要加载 layout-app，先初始化，等待完成后再决定是否渲染
    import('./utils/init-layout-app').then(({ initLayoutApp }) => {
      initLayoutApp()
        .then(() => {
          // layout-app 加载成功，检查是否需要独立渲染
          if ((window as any).__USE_LAYOUT_APP__) {
            // 关键：layout-app 已加载，子应用应该主动挂载到 layout-app 的 #subapp-viewport
            // 而不是等待 layout-app 通过 qiankun 加载（避免二次加载导致 DOM 操作冲突）
            const waitForViewport = (retries = 40): Promise<HTMLElement | null> => {
              return new Promise((resolve) => {
                const viewport = document.querySelector('#subapp-viewport') as HTMLElement | null;
                if (viewport) {
                  resolve(viewport);
                } else if (retries > 0) {
                  setTimeout(() => resolve(waitForViewport(retries - 1)), 50);
                } else {
                  resolve(null);
                }
              });
            };
            
            waitForViewport().then((viewport) => {
              if (viewport) {
                // 挂载到 layout-app 的 #subapp-viewport
                render({ container: viewport } as any).catch((error) => {
                  console.error('[finance-app] 挂载到 layout-app 失败:', error);
                });
              } else {
                console.error('[finance-app] 等待 #subapp-viewport 超时，尝试独立渲染');
                render().catch((error) => {
                  console.error('[finance-app] 独立运行失败:', error);
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              console.error('[finance-app] 独立运行失败:', error);
            });
          }
        })
        .catch((error) => {
          console.error('[finance-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((error) => {
            console.error('[finance-app] 独立运行失败:', error);
          });
        });
    }).catch((error) => {
      console.error('[finance-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((error) => {
        console.error('[finance-app] 独立运行失败:', error);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      console.error('[finance-app] 独立运行失败:', error);
    });
  }
}
