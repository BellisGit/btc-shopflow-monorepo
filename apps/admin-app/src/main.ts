import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import type { QiankunProps } from '@btc/shared-core';
import {
  createAdminApp,
  mountAdminApp,
  unmountAdminApp,
  updateAdminApp,
} from './bootstrap';
import type { AdminAppContext } from './bootstrap';

let context: AdminAppContext | null = null;

const render = (props: QiankunProps = {}) => {
  if (context) {
    unmountAdminApp(context);
    context = null;
  }

  context = createAdminApp(props);
  mountAdminApp(context, props);
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
// bootstrap 必须是轻量级的，直接返回 resolved Promise，确保最快速度
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 不使用 async，直接返回 resolved Promise，确保最快速度
  // 关键：bootstrap 超时可能是模块加载阶段的问题，而不是函数执行问题
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // console.log('[admin-app] mount 开始', props);
  try {
  render(props);
    // 使用 nextTick 确保 Vue 的渲染完成后再返回
    await new Promise(resolve => {
      // 使用 requestAnimationFrame 确保 DOM 更新完成
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // console.log('[admin-app] mount 完成');
          resolve(undefined);
        });
      });
    });
  } catch (error) {
    // console.error('[admin-app] mount 失败:', error);
    throw error;
  }
}

async function unmount(props: QiankunProps = {}) {
  try {
  if (context) {
    unmountAdminApp(context, props);
    context = null;
    }
  } catch (error) {
    // console.error('[admin-app] unmount 失败:', error);
    throw error;
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
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
