import type { App } from 'vue';

export interface BtcOptions {
  // 后续添加配置
  apiBaseUrl?: string;
  timeout?: number;
}

export function useCore() {
  return {
    // 后续添加 service, crud, plugin
  };
}

export function installBtc(app: App, options?: BtcOptions) {
  // 后续实现插件安装逻辑
  console.log('BTC Framework installed', options);

  // 全局属性
  app.config.globalProperties.$btc = {
    options,
  };
}
