import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import type { QiankunProps } from '@btc/shared-core';
import {
  createFinanceApp,
  mountFinanceApp,
  unmountFinanceApp,
  updateFinanceApp,
} from './bootstrap';
import type { FinanceAppContext } from './bootstrap';

let context: FinanceAppContext | null = null;

const render = (props: QiankunProps = {}) => {
  if (context) {
    unmountFinanceApp(context);
    context = null;
  }

  context = createFinanceApp(props);
  mountFinanceApp(context, props);
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve(undefined);
}

async function mount(props: QiankunProps) {
  render(props);
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
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
