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

// 标准 ES 模块导出（qiankun 需要）
export default { bootstrap, mount, unmount };

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
          // 如果 __USE_LAYOUT_APP__ 已设置，说明 layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
          if (!(window as any).__USE_LAYOUT_APP__) {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              console.error('[finance-app] 独立运行失败:', error);
            });
          }
          // 否则，layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
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
