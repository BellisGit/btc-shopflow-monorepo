import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { registerMicroApps, start } from 'qiankun';
import { getAppConfig } from '@configs/app-env.config';
import { registerAppEnvAccessors, resolveAppLogoUrl, registerManifestMenusForApp, registerManifestTabsForApp } from '@configs/layout-bridge';
// 关键：延迟导入菜单注册表相关函数，避免循环依赖或导入错误导致白屏
// import { getMenuRegistry } from '@btc/shared-components';
// 使用相对路径导入，避免 TypeScript 路径解析问题
import { getAppBySubdomain } from '../../../configs/app-scanner';
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
// 使用相对路径导入 mitt，避免 TypeScript 路径解析问题
import mitt from '../../../packages/shared-components/src/utils/mitt';
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
  const fullAppName = `${appName}-app`;
  const appConfig = getAppConfig(fullAppName);

  if (!appConfig) {
    const fallbackUrl = `/${appName}/`;
    return fallbackUrl;
  }

  // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
  if (import.meta.env.PROD) {
    if (appConfig.prodHost) {
      const protocol = typeof window !== 'undefined' && window.location.protocol
        ? window.location.protocol
        : 'https:';
      const entryUrl = `${protocol}//${appConfig.prodHost}/`;
      return entryUrl;
    }
    const fallbackUrl = `/${appName}/`;
    return fallbackUrl;
  }

  // 开发/预览环境：使用配置的端口
  const port = window.location.port || appConfig.prePort;
  const host = window.location.hostname || appConfig.preHost;
  const entryUrl = `//${host}:${port}`;
  return entryUrl;
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
  // 关键：在初始化开始时就创建并设置事件总线，确保在 Vue 应用创建之前事件总线就已存在
  // 这样子应用的 UserInfo 组件就能立即访问到事件总线
  if (!(window as any).__APP_EMITTER__) {
    const emitter = mitt();
    (window as any).__APP_EMITTER__ = emitter;

    // 关键：添加全局 window 事件监听器作为兜底方案，确保即使事件总线未正确初始化也能工作
    // 监听 'open-preferences-drawer' 事件，直接触发 layout-app 的偏好设置抽屉
    window.addEventListener('open-preferences-drawer', () => {
      // 通过事件总线触发（如果存在）
      if ((window as any).__APP_EMITTER__) {
        (window as any).__APP_EMITTER__.emit('open-preferences-drawer');
      }
    });
  }

  if (!settingsInitialized) {
    appStorage.init();
    ensureDefaultSettings();
    initSettingsConfig();
    settingsInitialized = true;

    // 关键：在 layout-app 初始化时立即创建菜单注册表，确保菜单注册表已存在
    // 这样后续的菜单注册就能正确工作
    // 使用异步导入，但在注册菜单之前确保注册表已初始化
    import('@btc/shared-components').then((module) => {
      try {
        if (module.getMenuRegistry) {
          // 关键：优先使用已存在的全局注册表，确保与子应用使用同一个实例
          if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
            // 使用已存在的全局注册表（可能由其他模块创建）
            if (import.meta.env.DEV) {
              console.log('[layout-app] 使用已存在的全局菜单注册表（早期初始化）');
            }
          } else {
            // 如果全局不存在，创建新的并挂载到全局对象
            const registry = module.getMenuRegistry();
            if (typeof window !== 'undefined') {
              (window as any).__BTC_MENU_REGISTRY__ = registry;
            }
            if (import.meta.env.DEV) {
              console.log('[layout-app] 创建新的全局菜单注册表（早期初始化）');
            }
          }
        }
      } catch (error) {
        // 静默失败
      }
    }).catch(() => {
      // 静默失败
    });

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

    // 关键：在 layout-app 挂载之前，根据当前域名或路径提前注册菜单
    // 这样菜单组件渲染时就能读取到菜单数据
    // 使用异步导入确保菜单注册表已初始化，并等待注册完成
    await import('@btc/shared-components').then(async (module) => {
      try {
        if (module.getMenuRegistry) {
          // 关键：优先使用已存在的全局注册表，确保与子应用使用同一个实例
          let registry: any;
          if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
            // 使用已存在的全局注册表（可能由其他模块创建）
            registry = (window as any).__BTC_MENU_REGISTRY__;
            if (import.meta.env.DEV) {
              console.log('[layout-app] 使用已存在的全局菜单注册表');
            }
          } else {
            // 如果全局不存在，创建新的并挂载到全局对象
            registry = module.getMenuRegistry();
            if (typeof window !== 'undefined') {
              (window as any).__BTC_MENU_REGISTRY__ = registry;
            }
            if (import.meta.env.DEV) {
              console.log('[layout-app] 创建新的全局菜单注册表');
            }
          }

          // 现在注册表已初始化，可以注册菜单了
          const hostname = window.location.hostname;
          const appBySubdomain = getAppBySubdomain(hostname);
          let targetApp = appBySubdomain?.id;

          // 如果没有从子域名获取到应用，根据路径判断（开发/预览环境）
          if (!targetApp) {
            const pathname = window.location.pathname;
            if (pathname.startsWith('/admin')) {
              targetApp = 'admin';
            } else if (pathname.startsWith('/logistics')) {
              targetApp = 'logistics';
            } else if (pathname.startsWith('/engineering')) {
              targetApp = 'engineering';
            } else if (pathname.startsWith('/quality')) {
              targetApp = 'quality';
            } else if (pathname.startsWith('/production')) {
              targetApp = 'production';
            } else if (pathname.startsWith('/finance')) {
              targetApp = 'finance';
            } else if (pathname.startsWith('/monitor')) {
              targetApp = 'monitor';
            } else {
              // 默认注册 system 应用的菜单（系统域）
              targetApp = 'system';
            }
          }

          if (targetApp) {
            // 同步注册菜单，确保在组件渲染之前完成
            registerManifestMenusForApp(targetApp);
            registerManifestTabsForApp(targetApp);

            // 设置浏览器标题
            try {
              const { getManifest } = await import('@btc/subapp-manifests');
              const manifest = getManifest(targetApp);
              if (manifest?.app?.nameKey) {
                // 如果有 nameKey，尝试从 i18n 获取翻译
                const { tSync } = await import('@system/i18n/getters');
                const appName = tSync(manifest.app.nameKey);
                if (appName && appName !== manifest.app.nameKey) {
                  document.title = appName;
                } else if (manifest.app.nameKey) {
                  // 如果翻译失败，使用 nameKey 作为后备
                  document.title = manifest.app.nameKey;
                }
              }
            } catch (e) {
              // 静默失败
            }
          }
        }
      } catch (error) {
        // 静默失败
      }
    }).catch(() => {
      // 静默失败
    });
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
  }

  // 暴露域列表获取函数，供 menu-drawer 组件使用
  (window as any).__APP_GET_DOMAIN_LIST__ = getDomainList;

  // 暴露应用配置获取函数，供 menu-drawer 组件使用
  (window as any).__APP_GET_APP_CONFIG__ = getAppConfig;

  // 等待插件注册完成（必须在应用挂载之前完成）
  await registerLayoutPlugins(appInstance).catch(() => {
    // 静默失败
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
const ensureMicroAppsRegistered = async () => {
  if (microAppsRegistered) {
    return;
  }

  // 获取当前域名，判断应该加载哪个子应用（使用应用扫描器，顶层已导入）
  const hostname = window.location.hostname;

  // 优先从 URL 参数获取要加载的应用（用于预览环境测试）
  const urlParams = new URLSearchParams(window.location.search);
  const appFromUrl = urlParams.get('app');

  // 从域名映射获取，如果不在生产环境域名中，则使用路径前缀判断（和汉堡菜单一样）
  const appBySubdomain = getAppBySubdomain(hostname);
  let targetApp = appBySubdomain?.id;

  if (!targetApp) {
    // 优先从 URL 参数获取要加载的应用（用于预览环境测试）
    if (appFromUrl) {
      targetApp = appFromUrl;
    } else {
      // 开发/预览环境：根据路径前缀判断应该加载哪个子应用（和汉堡菜单一样）
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin')) {
        targetApp = 'admin';
      } else if (pathname.startsWith('/logistics')) {
        targetApp = 'logistics';
      } else if (pathname.startsWith('/engineering')) {
        targetApp = 'engineering';
      } else if (pathname.startsWith('/quality')) {
        targetApp = 'quality';
      } else if (pathname.startsWith('/production')) {
        targetApp = 'production';
      } else if (pathname.startsWith('/finance')) {
        targetApp = 'finance';
      } else if (pathname.startsWith('/monitor')) {
        targetApp = 'monitor';
      } else {
        // 默认加载 logistics-app（用于预览环境测试）
        targetApp = 'logistics';
      }
    }
  }

  // 加载超时定时器
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  const clearLoadingState = () => {
    const viewport = document.querySelector('#subapp-viewport');
    if (viewport) {
      viewport.removeAttribute('data-qiankun-loading');
    }
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
  };

  // 根据环境设置超时时间：生产环境3秒，开发环境10秒（缩短超时时间，快速清除loading）
  const isDev = import.meta.env.DEV;
  const LOADING_TIMEOUT = isDev ? 10000 : 3000;

  // 确保容器在注册前就可见（提前设置，避免 qiankun 查找时容器被隐藏）
  // 使用双重 requestAnimationFrame 确保 Vue 的响应式更新完成
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
        if (viewport) {
          viewport.setAttribute('data-qiankun-loading', 'true');
          viewport.style.setProperty('display', 'flex', 'important');
          viewport.style.setProperty('visibility', 'visible', 'important');
          viewport.style.setProperty('opacity', '1', 'important');
          // 触发自定义事件，通知 Layout 组件立即更新状态
          window.dispatchEvent(new CustomEvent('qiankun:before-load', {
            detail: { appName: `${targetApp}-app` }
          }));
        }
        resolve();
      });
    });
  });

  // 注册子应用
  // 生产环境：只注册当前域名对应的子应用
  // 开发/预览环境：注册所有子应用，使用动态 activeRule 根据路径判断应该激活哪个应用
  const subApps: any[] = [];

  if (targetApp && (import.meta.env.PROD || appBySubdomain)) {
    // 生产环境或子域名环境：只注册当前域名对应的子应用
    subApps.push({
      name: `${targetApp}-app`,
      entry: getAppEntry(targetApp),
      container: '#subapp-viewport',
      activeRule: () => true, // 当前域名只加载对应的子应用，永远激活
      props: {
        onReady: () => {
          clearLoadingState();
          setTimeout(() => {
            const viewport = document.querySelector('#subapp-viewport');
            if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
              viewport.removeAttribute('data-qiankun-loading');
            }
          }, 50);
        },
      },
    });
  } else {
    // 开发/预览环境：注册所有子应用，使用动态 activeRule
    const allApps = ['admin', 'logistics', 'engineering', 'quality', 'production', 'finance', 'monitor'];
    allApps.forEach((appName) => {
      subApps.push({
        name: `${appName}-app`,
        entry: getAppEntry(appName),
        container: '#subapp-viewport',
        activeRule: () => {
          // 关键：使用 window.location.pathname 确保获取最新的路径
          // 这样即使在同一应用内路由切换时，activeRule 也能正确返回 true
          const pathname = window.location.pathname;
          if (appName === 'admin' && pathname.startsWith('/admin')) return true;
          if (appName === 'logistics' && pathname.startsWith('/logistics')) return true;
          if (appName === 'engineering' && pathname.startsWith('/engineering')) return true;
          if (appName === 'quality' && pathname.startsWith('/quality')) return true;
          if (appName === 'production' && pathname.startsWith('/production')) return true;
          if (appName === 'finance' && pathname.startsWith('/finance')) return true;
          if (appName === 'monitor' && pathname.startsWith('/monitor')) return true;
          return false;
        },
        props: {
          onReady: () => {
            clearLoadingState();
            setTimeout(() => {
              const viewport = document.querySelector('#subapp-viewport');
              if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
                viewport.removeAttribute('data-qiankun-loading');
              }
            }, 50);
          },
        },
      });
    });
  }

  registerMicroApps(
    subApps,
    {
      beforeLoad: [async (app: any) => {
        // 显示加载状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          viewport.setAttribute('data-qiankun-loading', 'true');
          // 确保容器可见
          (viewport as HTMLElement).style.setProperty('display', 'block', 'important');
          (viewport as HTMLElement).style.setProperty('visibility', 'visible', 'important');
          (viewport as HTMLElement).style.setProperty('opacity', '1', 'important');
        }

        // 设置超时保护：生产环境15秒，开发环境30秒后自动清除 loading 状态
        loadingTimeout = setTimeout(() => {
          clearLoadingState();
        }, LOADING_TIMEOUT);

        // 关键：在子应用加载之前尝试提前注册菜单和 Tabs
        // 但从应用名称中提取应用ID（例如 'monitor-app' -> 'monitor'）
        // 注意：此时 menu-registry chunk 可能还没有加载，所以这里可能会失败
        // 真正的注册应该在 afterMount 中进行，当子应用的 JS 已经加载完成时
        const appNameMatch = app.name?.match(/^(.+)-app$/);
        const appId = appNameMatch ? appNameMatch[1] : targetApp;
        if (appId) {
          try {
            // 尝试提前注册，但失败也不影响（会在 afterMount 中重试）
            registerManifestMenusForApp(appId);
            registerManifestTabsForApp(appId);
          } catch (error) {
            // 忽略错误，因为 menu-registry chunk 可能还没有加载
            // 真正的注册会在 afterMount 中进行
          }
        }
      }],
      beforeMount: [async (_app: any) => {
        // 子应用准备挂载
      }],
      afterMount: [async (app: any) => {
        // 关键：确保 CSS 变量能够传递到子应用容器
        // 在 qiankun 环境下，CSS 变量需要从父元素显式传递
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          const htmlElement = document.documentElement;
          const computedStyle = getComputedStyle(htmlElement);

          // 获取主应用的 CSS 变量值
          const bgColorPage = computedStyle.getPropertyValue('--el-bg-color-page') || computedStyle.getPropertyValue('--el-bg-color') || '#0a0a0a';
          const bgColor = computedStyle.getPropertyValue('--el-bg-color') || '#0a0a0a';

          // 设置到子应用容器，确保子应用能够继承
          (viewport as HTMLElement).style.setProperty('--el-bg-color-page', bgColorPage);
          (viewport as HTMLElement).style.setProperty('--el-bg-color', bgColor);
        }

        // 关键：强制清除 loading 状态（兜底机制，即使 onReady 未被调用）
        // 使用 setTimeout 确保在下一个事件循环中清除，给子应用一些时间完成初始化
        setTimeout(() => {
          clearLoadingState();
        }, 100);

        // 关键：在子应用挂载后注册菜单和 Tabs，确保子应用的 menu-registry chunk 已经加载
        // 从应用名称中提取应用ID（例如 'monitor-app' -> 'monitor'）
        const appNameMatch = app.name?.match(/^(.+)-app$/);
        const appId = appNameMatch ? appNameMatch[1] : null;
        if (appId) {
          // 关键：先检查菜单是否已注册且不为空，如果已注册则跳过重试
          // 避免覆盖子应用自己注册的菜单
          const menuRegistry = (window as any).__BTC_MENU_REGISTRY__;
          const existingMenus = menuRegistry?.value?.[appId];
          
          if (existingMenus && existingMenus.length > 0) {
            // 菜单已注册且不为空，跳过重试
            if (import.meta.env.DEV) {
              console.log(`[layout-app] 应用 ${appId} 的菜单已注册，跳过重试`);
            }
            return;
          }

          // 使用多次重试机制，确保菜单注册成功
          // 因为子应用的 menu-registry chunk 可能还在加载中
          let retryCount = 0;
          const maxRetries = 15;
          const retryDelay = 300;

          const tryRegisterMenus = () => {
            try {
              // 再次检查菜单是否已注册（可能在重试期间被子应用注册了）
              const currentRegistry = (window as any).__BTC_MENU_REGISTRY__;
              const currentMenus = currentRegistry?.value?.[appId];
              
              if (currentMenus && currentMenus.length > 0) {
                // 菜单已注册，停止重试
                if (import.meta.env.DEV) {
                  console.log(`[layout-app] 应用 ${appId} 的菜单已在重试期间注册，停止重试`);
                }
                return;
              }

              // 尝试注册菜单
              registerManifestMenusForApp(appId);
              registerManifestTabsForApp(appId);

              // 验证菜单是否已注册
              const registeredMenus = currentRegistry?.value?.[appId];

              if (registeredMenus && registeredMenus.length > 0) {
                // 注册成功，停止重试
                if (import.meta.env.DEV) {
                  console.log(`[layout-app] 应用 ${appId} 的菜单注册成功，共 ${registeredMenus.length} 个顶级菜单项`);
                }
                return;
              }

              // 菜单仍为空，继续重试
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryRegisterMenus, retryDelay);
              } else if (import.meta.env.DEV) {
                console.warn(`[layout-app] 应用 ${appId} 的菜单注册失败，已达到最大重试次数`);
              }
            } catch (error) {
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryRegisterMenus, retryDelay);
              } else if (import.meta.env.DEV) {
                console.error(`[layout-app] 应用 ${appId} 的菜单注册出错:`, error);
              }
            }
          };

          setTimeout(tryRegisterMenus, 200);
        }
      }],
      // 关键：添加错误处理钩子，处理子应用加载失败的情况
      // 注意：qiankun 的类型定义可能不完整，使用类型断言
      onError: [
        () => {
          // 立即清除 loading 状态，避免一直卡在 loading
          clearLoadingState();
        },
      ],
    } as any, // 类型断言：qiankun 实际支持 onError，但类型定义可能不完整
  );

  microAppsRegistered = true;

  if (!qiankunStarted) {
    start({
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: false, // 关闭样式隔离：layout-app 是独立应用，需要样式正确应用
      },
      singular: true, // 同一时间只运行一个子应用
      prefetch: false, // 禁用预加载，避免不必要的资源加载
      // 关键：配置 importEntryOpts，确保正确处理子应用的 HTML 模板和资源路径
      // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
      importEntryOpts: {
        scriptType: 'module', // 强制使用 module 类型
        // 自定义 fetch：确保脚本以正确的方式加载
        fetch: (url: string, options?: RequestInit) => {
          return fetch(url, {
            ...options,
            mode: 'cors',
            credentials: 'same-origin',
          });
        },
        // 自定义 getTemplate：处理子应用的 HTML 模板，修复资源路径
        getTemplate: (tpl: string, entry?: string) => {
          let processedTpl = tpl;

          // 如果提供了 entry，计算 base URL
          if (entry) {
            try {
              const entryUrl = new URL(entry, window.location.href);
              // base URL 应该是 entry 的目录路径
              const baseHref = entryUrl.pathname.endsWith('/')
                ? entryUrl.pathname
                : entryUrl.pathname + '/';

              // 移除旧的 base 标签
              processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');

              // 在 <head> 标签内添加新的 <base> 标签
              if (processedTpl.includes('<head')) {
                processedTpl = processedTpl.replace(
                  /(<head[^>]*>)/i,
                  `$1\n    <base href="${baseHref}">`
                );
              } else if (processedTpl.includes('<html')) {
                processedTpl = processedTpl.replace(
                  /(<html[^>]*>)/i,
                  `$1\n  <base href="${baseHref}">`
                );
              }

              // 关键：修复所有 link 标签中的 href 路径（CSS 文件、modulepreload 等）
              // 在 qiankun 环境中，需要确保所有资源路径都是绝对路径（以 / 开头）
              // 这样可以避免在子路由下（如 /config/storage-location）资源路径被错误解析
              processedTpl = processedTpl.replace(
                /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, href, after) => {
                  // 如果 href 已经是完整 URL，直接返回
                  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
                    return match;
                  }

                  // 如果 href 已经是绝对路径（以 / 开头），保持原样
                  if (href.startsWith('/')) {
                    return match;
                  }

                  // 如果 href 是相对路径（不以 / 开头），转换为绝对路径
                  // 关键：确保所有资源路径都是绝对路径，避免在子路由下被错误解析
                  const fixedHref = '/' + href;
                  return `<link${before} href="${fixedHref}"${after}>`;
                }
              );

              // 关键：修复所有 script 标签中的 src 路径
              // 在 qiankun 环境中，需要确保所有资源路径都是绝对路径（以 / 开头）
              // 这样可以避免在子路由下（如 /config/storage-location）资源路径被错误解析
              processedTpl = processedTpl.replace(
                /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, src, after) => {
                  // 如果 src 已经是完整 URL，直接返回
                  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
                    return match;
                  }

                  // 如果 src 已经是绝对路径（以 / 开头），保持原样
                  if (src.startsWith('/')) {
                    return match;
                  }

                  // 如果 src 是相对路径（不以 / 开头），转换为绝对路径
                  // 关键：确保所有资源路径都是绝对路径，避免在子路由下被错误解析
                  const fixedSrc = '/' + src;
                  return `<script${before} src="${fixedSrc}"${after}>`;
                }
              );

            } catch (error) {
              // 静默失败
            }
          }

          // 确保所有 script 标签都有 type="module"
          processedTpl = processedTpl.replace(
            /<script(\s+[^>]*)?>/gi,
            (match, attrs = '') => {
              // 跳过内联脚本（没有 src 属性）
              if (!match.includes('src=')) {
                return match;
              }
              // 如果已经有 type 属性，替换为 module
              if (attrs && attrs.includes('type=')) {
                return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
              }
              // 如果没有 type 属性，添加 type="module"
              return `<script type="module"${attrs}>`;
            }
          );

          return processedTpl;
        },
      },
    });
    qiankunStarted = true;

    // 关键：qiankun 启动后，手动加载子应用
    // 在开发环境中，需要根据当前路径找到对应的应用并加载
    // 在生产环境中，直接加载第一个应用（因为只注册了一个）
    import('qiankun').then(({ loadMicroApp }) => {
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          // 再次确保容器可见
          const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
          if (viewport) {
            viewport.setAttribute('data-qiankun-loading', 'true');
            viewport.style.setProperty('display', 'flex', 'important');
            viewport.style.setProperty('visibility', 'visible', 'important');
            viewport.style.setProperty('opacity', '1', 'important');
          }

          // 找到应该加载的应用
          let appToLoad = subApps[0];
          if (subApps.length > 1) {
            // 开发环境：根据当前路径找到对应的应用
            const pathname = window.location.pathname;
            appToLoad = subApps.find((app) => {
              if (app.name === 'admin-app' && pathname.startsWith('/admin')) return true;
              if (app.name === 'logistics-app' && pathname.startsWith('/logistics')) return true;
              if (app.name === 'engineering-app' && pathname.startsWith('/engineering')) return true;
              if (app.name === 'quality-app' && pathname.startsWith('/quality')) return true;
              if (app.name === 'production-app' && pathname.startsWith('/production')) return true;
              if (app.name === 'finance-app' && pathname.startsWith('/finance')) return true;
              if (app.name === 'monitor-app' && pathname.startsWith('/monitor')) return true;
              return false;
            }) || subApps[0]; // 如果找不到，使用第一个应用
          }

          // 手动加载子应用
          try {
            const microApp = loadMicroApp(appToLoad, {
              singular: true,
            });

            // 监听子应用加载完成
            microApp.mountPromise.then(() => {
              // 加载完成
            }).catch(() => {
              // 加载失败，静默处理
            });
          } catch (error) {
            // 如果 loadMicroApp 失败，尝试触发路由匹配
            window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
          }
        });
      });
    }).catch(() => {
      // 如果 qiankun 导入失败，尝试触发路由匹配
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        });
      });
    });
  }
};

function bootstrap() {
  return Promise.resolve();
}

async function mount(props: any) {
  // 关键：qiankun 会通过 props.container 传递容器元素
  // 当 layout-app 被其他应用通过 qiankun 加载时，容器应该是 #app
  // 如果 props.container 不存在，尝试查找 #app 容器
  let container = props?.container as HTMLElement;

  if (!container) {
    // 尝试查找 #app 容器（子应用的根容器）
    container = document.querySelector('#app') as HTMLElement;
  }

  // 如果还是找不到，尝试查找 #layout-container（独立运行时的容器）
  if (!container) {
    container = document.querySelector('#layout-container') as HTMLElement;
  }

  if (!container) {
    throw new Error('布局容器不存在，请确保页面中存在 #app 或 #layout-container 元素');
  }

  // 验证容器 ID，确保挂载位置正确
  if (container.id !== 'app' && container.id !== 'layout-container') {
    // 如果容器 ID 不正确，尝试查找正确的容器
    const correctContainer = document.querySelector('#app') as HTMLElement;
    if (correctContainer && document.body.contains(correctContainer)) {
      container = correctContainer;
    } else {
      throw new Error(`布局容器 ID 不正确: 期望 #app 或 #layout-container，实际为 #${container.id || 'unknown'}`);
    }
  }

  if (!app) {
    app = createApp(App);
    // 等待初始化完成（包括插件注册）
    await initLayoutEnvironment(app);
    app.mount(container);
  }

  // 如果 layout-app 是被其他应用通过 qiankun 加载的，不应该再注册子应用
  // 因为子应用已经在运行了（它加载了 layout-app），子应用应该直接挂载到 layout-app 的 #subapp-viewport 中
  // 子应用的挂载由子应用自己处理（通过 props.container 获取 #subapp-viewport）
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 当 layout-app 作为 qiankun 子应用被加载时，不需要注册子应用
    // 子应用会通过自己的 mount 函数直接挂载到 layout-app 的 #subapp-viewport 中
    return;
  }

  // 只有在独立运行时才启动 qiankun 并注册所有业务子应用
  ensureMicroAppsRegistered();

  // 关键：添加全局错误监听，捕获子应用加载失败
  // 这作为最后的兜底机制，确保即使其他错误处理机制失效，loading 也能被清除
  const handleGlobalError = (event: ErrorEvent) => {
    // 检查是否是子应用相关的错误
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';

      // 如果错误信息包含应用相关关键词，可能是子应用加载失败
      if (
        errorMessage.includes('application') ||
        errorMessage.includes('micro-app') ||
        errorMessage.includes('subapp') ||
        errorSource.includes('micro-apps')
      ) {
        // 清除 loading 状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
          viewport.removeAttribute('data-qiankun-loading');
        }
      }
  };

  // 监听全局错误事件
  window.addEventListener('error', handleGlobalError, true);

  // 监听未处理的 Promise 拒绝
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const errorMessage = reason?.message || String(reason);

      // 检查是否是子应用加载相关的 Promise 拒绝
      if (
        errorMessage.includes('application') ||
        errorMessage.includes('micro-app') ||
        errorMessage.includes('subapp') ||
        (reason?.stack && reason.stack.includes('micro-apps'))
      ) {
        // 清除 loading 状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
          viewport.removeAttribute('data-qiankun-loading');
        }
      }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

async function unmount(_props: any) {
  if (app) {
    app.unmount();
    app = null;
  }
}

async function update(_props: any) {
  // layout-app 的 update 方法：当主应用更新 props 时调用
  // 目前 layout-app 不需要特殊的更新逻辑，保持空实现
  // 如果需要，可以在这里处理 props 更新（例如更新菜单、主题等）
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun
renderWithQiankun({
  bootstrap,
  mount,
  update,
  unmount,
});

// 标准 ES 模块导出
export default { bootstrap, mount, unmount };

// 独立运行（非 qiankun 环境）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  (async () => {
    // 检查是否设置了挂载目标（子应用环境）
    const mountTarget = (window as any).__LAYOUT_APP_MOUNT_TARGET__;
    let container: HTMLElement | null = null;

    if (mountTarget) {
      // 子应用环境：挂载到指定的容器（通常是 #app）
      container = document.querySelector(mountTarget) as HTMLElement;
      if (!container) {
        container = document.querySelector('#app') as HTMLElement;
      }
    } else {
      // 独立运行环境：挂载到 #layout-container
      container = document.querySelector('#layout-container') as HTMLElement;
    }

    if (container) {
      app = createApp(App);
      // 等待初始化完成（包括插件注册）
      await initLayoutEnvironment(app);
      app.mount(container);

      // 关键：无论是否设置了 mountTarget，layout-app 都需要注册并启动 qiankun 来加载子应用
      // 因为子应用（如 admin-app）需要通过 qiankun 自动加载到 #subapp-viewport
      // 当 layout-app 通过 loadLayoutApp 直接加载到 #app 时，也应该启动 qiankun
      ensureMicroAppsRegistered();
    }
  })();
}

