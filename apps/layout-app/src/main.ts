import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { registerMicroApps, start } from 'qiankun';
import { getAppConfig } from '@configs/app-env.config';
import { registerAppEnvAccessors } from '@configs/layout-bridge';
import { setupStore, setupRouter, setupUI, setupI18n, setupEps } from '@system/bootstrap/core';
import { initSettingsConfig } from '@system/plugins/user-setting/composables/useSettingsState';
import { appStorage } from '@system/utils/app-storage';
import 'virtual:svg-icons';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@btc/shared-components/styles/index.scss';

registerAppEnvAccessors();

// 子域名到应用名称的映射
const hostnameToAppMap: Record<string, string> = {
  'admin.bellis.com.cn': 'admin',
  'logistics.bellis.com.cn': 'logistics',
  'quality.bellis.com.cn': 'quality',
  'production.bellis.com.cn': 'production',
  'engineering.bellis.com.cn': 'engineering',
  'finance.bellis.com.cn': 'finance',
};

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const appConfig = getAppConfig(`${appName}-app`);
  if (!appConfig) {
    console.warn(`[layout-app] 未找到应用配置: ${appName}-app`);
    return `/micro-apps/${appName}/`;
  }

  // 生产环境：使用子域名 + /micro-apps/<app>/ 作为入口
  if (import.meta.env.PROD) {
    if (appConfig.prodHost) {
      const protocol = typeof window !== 'undefined' && window.location.protocol
        ? window.location.protocol
        : 'https:';
      return `${protocol}//${appConfig.prodHost}/micro-apps/${appName}/`;
    }
    return `/micro-apps/${appName}/`;
  }

  // 开发/预览环境：使用配置的端口
  const port = window.location.port || appConfig.prePort;
  const host = window.location.hostname || appConfig.preHost;
  return `//${host}:${port}`;
};

/**
 * 根据 hostname 判断当前应该激活的子应用
 */
const getAppFromHostname = (hostname: string): string | null => {
  return hostnameToAppMap[hostname] || null;
};

let settingsInitialized = false;

const initLayoutEnvironment = (appInstance: VueApp) => {
  if (!settingsInitialized) {
    appStorage.init();
    initSettingsConfig();
    settingsInitialized = true;
  }
  setupEps(appInstance);
  setupStore(appInstance);
  setupRouter(appInstance);
  setupUI(appInstance);
  setupI18n(appInstance);
};

let app: ReturnType<typeof createApp> | null = null;
let microAppsRegistered = false;
let qiankunStarted = false;

const ensureMicroAppRegistered = (appName: string, subAppEntry: string) => {
  if (!microAppsRegistered) {
    registerMicroApps(
      [
        {
          name: appName,
          entry: subAppEntry,
          container: '#subapp-viewport',
          activeRule: () => true,
        },
      ],
      {
        beforeLoad: [(app) => console.log('[layout-app] 准备加载子应用:', app.name)],
        beforeMount: [(app) => console.log('[layout-app] 准备挂载子应用:', app.name)],
        afterMount: [(app) => console.log('[layout-app] 子应用挂载完成:', app.name)],
      },
    );
    microAppsRegistered = true;
  }

  if (!qiankunStarted) {
    start({
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: true,
      },
      singular: false,
    });
    qiankunStarted = true;
  }
};

function bootstrap() {
  return Promise.resolve();
}

async function mount(props: any) {
  const container = props?.container || document.querySelector('#layout-container');
  if (!container) {
    throw new Error('布局容器不存在');
  }

  if (!app) {
    app = createApp(App);
    initLayoutEnvironment(app);
    app.mount(container);
  }

  // 如果 layout-app 是被其他应用通过 qiankun 加载的，不应该再注册子应用
  // 因为子应用已经在运行了（它加载了 layout-app）
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    console.log('[layout-app] 被其他应用加载，不注册子应用');
    return;
  }

  // 只有在独立运行时才启动 qiankun 并注册业务子应用
  const hostname = window.location.hostname;
  const appName = getAppFromHostname(hostname);

  if (appName) {
    const subAppEntry = getAppEntry(appName);
    ensureMicroAppRegistered(appName, subAppEntry);
  } else {
    console.warn('[layout-app] 未找到匹配的子应用，hostname:', hostname);
  }
}

async function unmount(props: any) {
  if (app) {
    app.unmount();
    app = null;
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun
renderWithQiankun({
  bootstrap,
  mount,
  unmount,
});

// 标准 ES 模块导出
export default { bootstrap, mount, unmount };

// 独立运行（非 qiankun 环境）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  const container = document.querySelector('#layout-container');
  if (container) {
    app = createApp(App);
    initLayoutEnvironment(app);
    app.mount(container);
    
    // 独立运行时也启动 qiankun
    const hostname = window.location.hostname;
    const appName = getAppFromHostname(hostname);
    
    if (appName) {
      const subAppEntry = getAppEntry(appName);
      ensureMicroAppRegistered(appName, subAppEntry);
    }
  }
}

