import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import type { QiankunProps } from '@btc/shared-core';
import {
  createLogisticsApp,
  mountLogisticsApp,
  unmountLogisticsApp,
  updateLogisticsApp,
} from './bootstrap';
import type { LogisticsAppContext } from './bootstrap';
import { initLayoutApp } from './utils/init-layout-app';

let context: LogisticsAppContext | null = null;

const render = async (props: QiankunProps = {}) => {
  if (context) {
    unmountLogisticsApp(context);
    context = null;
  }

  context = await createLogisticsApp(props);
  mountLogisticsApp(context, props);
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
// bootstrap 必须是轻量级的，只做无阻塞初始化，不做任何耗时操作
// 关键：bootstrap 超时可能是模块加载阶段的问题，而不是函数执行问题
// 因此 bootstrap 函数本身必须立即返回 resolved Promise
function bootstrap() {
  // bootstrap 必须是轻量级的，直接返回 resolved Promise，确保最快速度
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  try {
  await render(props);
  } catch (error) {
    console.error('[logistics-app] mount 失败:', error);
    throw error;
  }
}

async function unmount(props: QiankunProps = {}) {
  try {
  if (context) {
    unmountLogisticsApp(context, props);
    context = null;
    }
  } catch (error) {
    console.error('[logistics-app] unmount 失败:', error);
    throw error;
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  async update(props: QiankunProps) {
    if (context) {
      updateLogisticsApp(context, props);
    }
  },
  unmount,
});

// 标准 ES 模块导出（qiankun 需要）
export default { bootstrap, mount, unmount };

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

const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

// 独立运行（非 qiankun 环境）
if (shouldRunStandalone()) {
  // 如果需要加载 layout-app，先初始化
  initLayoutApp().catch((error) => {
    console.error('[logistics-app] 初始化 layout-app 失败:', error);
  });
  
  render().catch((error) => {
    console.error('[logistics-app] 独立运行失败:', error);
  });
}
