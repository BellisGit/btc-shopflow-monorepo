import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import 'virtual:uno.css';
// Element Plus 样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
// 关键：直接导入确保构建时被正确打包，避免代码分割导致的路径问题
import '@btc/shared-components/styles/dark-theme.css';
// 应用全局样式（global.scss 中已通过 @use 导入共享组件样式）
// 注意：共享组件样式在 global.scss 中使用 @use 导入，确保构建时被正确合并
import './styles/global.scss';
import './styles/theme.scss';
import './styles/nprogress.scss';
import './styles/menu-themes.scss';
import type { QiankunProps } from '@btc/shared-core';
import {
  createAdminApp,
  mountAdminApp,
  unmountAdminApp,
  updateAdminApp,
} from './bootstrap';
import type { AdminAppContext } from './bootstrap';
import { setupSubAppErrorCapture } from '@btc/shared-utils/error-monitor';

let context: AdminAppContext | null = null;

const render = async (props: QiankunProps = {}) => {
  try {
    if (context) {
      await unmountAdminApp(context);
      context = null;
    }

    context = createAdminApp(props);
    await mountAdminApp(context, props);
  } catch (error) {
    console.error('[admin-app] 渲染失败:', error);
    throw error;
  }
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
// bootstrap 必须是轻量级的，直接返回 resolved Promise，确保最快速度
function bootstrap() {
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // 设置子应用错误捕获（如果主应用传递了错误上报方法）
  // 关键：使用 try-catch 确保错误捕获设置失败不会阻塞应用挂载
  try {
    if (props.appName && typeof props.appName === 'string') {
      setupSubAppErrorCapture({
        updateErrorList: typeof props.updateErrorList === 'function'
          ? (props.updateErrorList as (errorInfo: any) => void | Promise<void>)
          : undefined,
        appName: props.appName,
      });
    }
  } catch (error) {
    // 错误捕获设置失败不影响应用运行，只记录警告
    console.warn('[admin-app] 设置错误捕获失败:', error);
  }

  await render(props);
}

async function unmount(props: QiankunProps = {}) {
  if (context) {
    await unmountAdminApp(context, props);
    context = null;
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  async update(props: QiankunProps) {
    if (context) {
      updateAdminApp(context, props);
    }
  },
  unmount,
});

// 导出 timeouts 配置，供 single-spa 使用
// 注意：qiankun 封装后，优先读取主应用 start 中的 lifeCycles 配置
// 这里的配置作为 fallback，主应用配置为准
// 优化后：开发环境 8 秒，生产环境 3-5 秒
const isDev = import.meta.env.DEV;
export const timeouts = {
  bootstrap: {
    millis: isDev ? 8000 : 3000, // 开发环境 8 秒，生产环境 3 秒
    dieOnTimeout: !isDev, // 生产环境超时直接报错，快速发现问题
    warningMillis: isDev ? 4000 : 1500, // 一半时间后开始警告
  },
  mount: {
    millis: isDev ? 8000 : 5000, // 开发环境 8 秒，生产环境 5 秒
    dieOnTimeout: !isDev,
    warningMillis: isDev ? 4000 : 2500,
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: 1500,
  },
};

// 标准 ES 模块导出（qiankun 需要）
// 关键：将 timeouts 也添加到 default 导出中，确保 single-spa 能够读取
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
// 注意：与 logistics-app 保持一致，使用 shouldRunStandalone 检查
const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

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
              console.error('[admin-app] 独立运行失败:', error);
            });
          }
          // 否则，layout-app 会通过 qiankun 挂载子应用，不需要独立渲染
        })
        .catch((error) => {
          console.error('[admin-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((err) => {
            console.error('[admin-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[admin-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((err) => {
        console.error('[admin-app] 独立运行失败:', err);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      console.error('[admin-app] 独立运行失败:', error);
    });
  }
}
