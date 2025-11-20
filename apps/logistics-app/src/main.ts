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

let context: LogisticsAppContext | null = null;

const render = (props: QiankunProps = {}) => {
  if (context) {
    unmountLogisticsApp(context);
    context = null;
  }

  context = createLogisticsApp(props);
  mountLogisticsApp(context, props);
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  console.log('[logistics-app] 子应用 mount', props);
  render(props);
}

async function unmount(props: QiankunProps = {}) {
  console.log('[logistics-app] 子应用 unmount');
  if (context) {
    unmountLogisticsApp(context, props);
    context = null;
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

// 独立运行（非 qiankun 环境）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
