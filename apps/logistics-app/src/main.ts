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

renderWithQiankun({
  async bootstrap() {},
  async mount(props: QiankunProps) {
    render(props);
  },
  async update(props: QiankunProps) {
    if (context) {
      updateLogisticsApp(context, props);
    }
  },
  async unmount(props: QiankunProps) {
    if (context) {
      unmountLogisticsApp(context, props);
      context = null;
    }
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}

export async function unmount() {
  if (context) {
    unmountLogisticsApp(context);
    context = null;
  }
}
