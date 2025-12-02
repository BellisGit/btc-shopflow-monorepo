import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { registerMicroApps, start } from 'qiankun';
import { getAppConfig } from '@configs/app-env.config';
import { registerAppEnvAccessors, resolveAppLogoUrl } from '@configs/layout-bridge';
// layout-app 使用最小化配置，不加载 system-app 的路由（避免加载业务逻辑）
import router from './router';
import { setupStore, setupUI, setupI18n, setupEps } from '@system/bootstrap/core';
import { initSettingsConfig } from '@system/plugins/user-setting/composables/useSettingsState';
import { appStorage } from '@system/utils/app-storage';
// 导入 layout-app 的通用插件注册函数
import { registerLayoutPlugins } from './plugins';
import { storage } from '@btc/shared-utils';
import { MenuThemeEnum, SystemThemeEnum } from '@system/plugins/user-setting/config/enums';
// 导入 layout-app 自己的 EPS service 和域列表工具函数
import { service } from './services/eps';
import { getDomainList } from '@system/utils/domain-cache';
import 'virtual:svg-icons';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 关键：shared-components/styles/index.scss 中已经包含了 menu-themes.scss
// 不再需要单独引入 @system/styles/menu-themes.scss，避免跨应用引用导致的打包问题
import '@btc/shared-components/styles/index.scss';

registerAppEnvAccessors();

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

let settingsInitialized = false;

function ensureDefaultSettings() {
  const settings = (storage.get('settings') as Record<string, any> | null) ?? {};
  let changed = false;
  if (!settings.menuThemeType) {
    settings.menuThemeType = MenuThemeEnum.DARK;
    changed = true;
  }
  if (!settings.systemThemeType) {
    settings.systemThemeType = SystemThemeEnum.DARK;
    changed = true;
  }
  if (!settings.systemThemeMode) {
    settings.systemThemeMode = SystemThemeEnum.DARK;
    changed = true;
  }
  if (changed) {
    storage.set('settings', settings);
  }
}

const initLayoutEnvironment = async (appInstance: VueApp) => {
  if (!settingsInitialized) {
    appStorage.init();
    ensureDefaultSettings();
    initSettingsConfig();
    settingsInitialized = true;
    
    // 将必要的对象暴露到全局，供 shared-components 使用
    (window as any).__APP_STORAGE__ = appStorage;
    (window as any).appStorage = appStorage;
    
    // 提供 EPS service / finishLoading 的兜底实现，避免布局应用缺少全局依赖
    if (!(window as any).__APP_EPS_SERVICE__) {
      (window as any).__APP_EPS_SERVICE__ = null;
    }
    if (!(window as any).__APP_FINISH_LOADING__) {
      (window as any).__APP_FINISH_LOADING__ = () => {};
    }
    
    // 暴露 logout 函数
    (window as any).__APP_LOGOUT__ = async () => {
      // layout-app 的 logout 逻辑：清除本地数据，跳转到系统域登录页
      appStorage.auth.clear();
      appStorage.user.clear();
      window.location.href = 'https://bellis.com.cn/login';
    };
    
    // 暴露 Logo URL 获取函数
    (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  }
  setupEps(appInstance);
  setupStore(appInstance);
  // 使用 layout-app 自己的最小化路由，不使用 system-app 的 setupRouter
  appInstance.use(router);
  setupUI(appInstance);
  setupI18n(appInstance);
  
  // EPS service 已经在 ./services/eps.ts 中导入时就暴露到全局了
  // 这里再次确认一下，确保服务已经暴露
  if (!(window as any).__APP_EPS_SERVICE__ || Object.keys((window as any).__APP_EPS_SERVICE__ || {}).length === 0) {
    (window as any).__APP_EPS_SERVICE__ = service;
    (window as any).service = service;
    (window as any).__BTC_SERVICE__ = service;
    console.log('[layout-app] EPS 服务已重新暴露到全局');
  }
  
  // 暴露域列表获取函数，供 menu-drawer 组件使用
  (window as any).__APP_GET_DOMAIN_LIST__ = getDomainList;
  
  // 暴露应用配置获取函数，供 menu-drawer 组件使用
  (window as any).__APP_GET_APP_CONFIG__ = getAppConfig;
  
  // 等待插件注册完成（必须在应用挂载之前完成）
  await registerLayoutPlugins(appInstance).catch((error) => {
    console.error('[layout-app] 注册插件失败:', error);
  });
};

let app: ReturnType<typeof createApp> | null = null;
let microAppsRegistered = false;
let qiankunStarted = false;

/**
 * 注册所有子应用（不包括 system-app）
 * 
 * layout-app 只服务于子应用的独立访问
 * system-app 是主应用，有自己的布局，不需要 layout-app
 */
const ensureMicroAppsRegistered = () => {
  if (microAppsRegistered) {
    return;
  }

  // 获取当前域名，判断应该加载哪个子应用
  const hostname = window.location.hostname;
  const subdomainMap: Record<string, string> = {
    'admin.bellis.com.cn': 'admin',
    'logistics.bellis.com.cn': 'logistics',
    'quality.bellis.com.cn': 'quality',
    'production.bellis.com.cn': 'production',
    'engineering.bellis.com.cn': 'engineering',
    'finance.bellis.com.cn': 'finance',
  };

  // 优先从 URL 参数获取要加载的应用（用于预览环境测试）
  const urlParams = new URLSearchParams(window.location.search);
  const appFromUrl = urlParams.get('app');
  
  // 从域名映射获取，如果不在生产环境域名中，则使用 URL 参数或默认值
  let targetApp = subdomainMap[hostname];
  
  if (!targetApp) {
    // 预览/开发环境：使用 URL 参数或默认加载 logistics-app
    if (appFromUrl) {
      targetApp = appFromUrl;
      console.log('[layout-app] 从 URL 参数加载子应用:', targetApp);
    } else {
      // 默认加载 logistics-app（用于预览环境测试）
      targetApp = 'logistics';
      console.log('[layout-app] 预览环境，默认加载子应用:', targetApp);
    }
  } else {
    console.log('[layout-app] 根据域名加载子应用:', targetApp);
  }

  // 只注册当前域名对应的子应用
  const subApps = [
    {
      name: `${targetApp}-app`,
      entry: getAppEntry(targetApp),
      container: '#subapp-viewport',
      activeRule: () => true, // 当前域名只加载对应的子应用，永远激活
    },
  ];

  registerMicroApps(
    subApps,
    {
      beforeLoad: [(app) => {
        console.log('[layout-app] 准备加载子应用:', app.name);
        // 显示加载状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          viewport.setAttribute('data-qiankun-loading', 'true');
        }
      }],
      beforeMount: [(app) => console.log('[layout-app] 准备挂载子应用:', app.name)],
      afterMount: [(app) => {
        console.log('[layout-app] 子应用挂载完成:', app.name);
        // 移除加载状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          viewport.removeAttribute('data-qiankun-loading');
        }
      }],
    },
  );
  
  microAppsRegistered = true;

  if (!qiankunStarted) {
    start({
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: true,
      },
      singular: true, // 同一时间只运行一个子应用
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
    // 等待初始化完成（包括插件注册）
    await initLayoutEnvironment(app);
    app.mount(container);
  }

  // 如果 layout-app 是被其他应用通过 qiankun 加载的，不应该再注册子应用
  // 因为子应用已经在运行了（它加载了 layout-app）
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    console.log('[layout-app] 被其他应用加载，不注册子应用');
    return;
  }

  // 只有在独立运行时才启动 qiankun 并注册所有业务子应用
  ensureMicroAppsRegistered();
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
  (async () => {
    const container = document.querySelector('#layout-container');
    if (container) {
      app = createApp(App);
      // 等待初始化完成（包括插件注册）
      await initLayoutEnvironment(app);
      app.mount(container);
      
      // 独立运行时启动 qiankun 并注册所有子应用
      ensureMicroAppsRegistered();
    }
  })();
}

