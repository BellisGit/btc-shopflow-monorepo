import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import type { QiankunProps } from '@btc/shared-core';
import {
  createSystemApp,
  mountSystemApp,
  unmountSystemApp,
  updateSystemApp,
} from './bootstrap';
import type { SystemAppContext } from './bootstrap';

let context: SystemAppContext | null = null;

const render = (props: QiankunProps = {}) => {
  if (context) {
    unmountSystemApp(context);
    context = null;
  }

  context = createSystemApp(props);
  mountSystemApp(context, props);
};

renderWithQiankun({
  bootstrap() {
    // 使用 queueMicrotask 确保在下一个事件循环中 resolve
    // 避免模块加载阻塞导致的超时问题
    return new Promise<void>((resolve, reject) => {
      try {
        queueMicrotask(() => {
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  async mount(props: QiankunProps) {
    render(props);
  },
  async update(props: QiankunProps) {
    if (context) {
      updateSystemApp(context, props);
    }
  },
  async unmount(props: QiankunProps) {
    if (context) {
      unmountSystemApp(context, props);
      context = null;
    }
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}

export async function unmount() {
  if (context) {
    unmountSystemApp(context);
    context = null;
  }
}
