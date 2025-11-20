import { registerMicroApps, start } from 'qiankun';
import { microApps } from './apps';
import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';
import { registerTabs, clearTabs, clearTabsExcept, type TabMeta } from '../store/tabRegistry';
import { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, type MenuItem } from '../store/menuRegistry';
import { getManifestTabs, getManifestMenus } from './manifests';
import { useProcessStore, getCurrentAppFromPath } from '../store/process';

// 应用名称映射（用于显示友好的中文名称）
const appNameMap: Record<string, string> = {
  logistics: '物流应用',
  engineering: '工程应用',
  quality: '品质应用',
  production: '生产应用',
};

export function registerManifestTabsForApp(appName: string) {
  const tabs = getManifestTabs(appName);
  if (!tabs.length) {
    return;
  }

  const normalizedTabs: TabMeta[] = tabs.map((tab) => ({
    key: tab.key,
    title: tab.labelKey ?? tab.label ?? tab.path,
    path: tab.path,
    i18nKey: tab.labelKey,
  }));

  registerTabs(appName, normalizedTabs);
}

// 递归转换菜单项（支持任意深度）
function normalizeMenuItems(items: any[]): MenuItem[] {
  return items.map((item) => ({
    index: item.index,
    title: item.labelKey ?? item.label ?? item.index,
    icon: item.icon ?? 'Document',
    children: item.children && item.children.length > 0
      ? normalizeMenuItems(item.children)
      : undefined,
  }));
}

// 深度比较两个菜单数组是否相同
function menusEqual(menus1: MenuItem[], menus2: MenuItem[]): boolean {
  if (menus1.length !== menus2.length) {
    return false;
  }

  for (let i = 0; i < menus1.length; i++) {
    const item1 = menus1[i];
    const item2 = menus2[i];

    if (item1.index !== item2.index ||
        item1.title !== item2.title ||
        item1.icon !== item2.icon) {
      return false;
    }

    // 递归比较子菜单
    if (item1.children && item2.children) {
      if (!menusEqual(item1.children, item2.children)) {
        return false;
      }
    } else if (item1.children || item2.children) {
      return false;
    }
  }

  return true;
}

export function registerManifestMenusForApp(appName: string) {
  const menus = getManifestMenus(appName);
  if (!menus.length) {
    // 如果菜单为空，且当前应用已经有菜单，则保留现有菜单，避免清空
    // 这对于系统域特别重要，因为系统域是默认应用，不应该被清空
    const existingMenus = getMenusForApp(appName);
    if (existingMenus.length > 0) {
      // 保留现有菜单，不进行清空操作
      return;
    }
    // 如果既没有新菜单，也没有现有菜单，则清空（正常情况）
    return;
  }

  // 将 manifest 菜单格式转换为 MenuItem 格式（递归处理任意深度）
  const normalizedMenus: MenuItem[] = normalizeMenuItems(menus);

  // 获取现有菜单，如果内容相同则不更新，避免触发不必要的响应式更新
  const existingMenus = getMenusForApp(appName);
  if (existingMenus.length > 0 && menusEqual(existingMenus, normalizedMenus)) {
    // 菜单内容相同，不需要更新，避免触发重新渲染
    return;
  }

  registerMenus(appName, normalizedMenus);
}

/**
 * 获取当前语言
 */
function getCurrentLocale(): string {
  // 从统一存储读取，或返回默认值
  // 注意：locale 暂时保留在 localStorage，因为可能被其他系统使用
  return localStorage.getItem('locale') || 'zh-CN';
}

/**
 * 过滤 qiankun 沙箱日志
 */
function filterQiankunLogs() {
  // 保存原始方法（保存到全局，供其他地方使用）
  (console as any).__originalLog = console.log;
  (console as any).__originalInfo = console.info;
  (console as any).__originalWarn = console.warn;
  (console as any).__originalError = console.error;

  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);

  console.info = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[qiankun:sandbox]')) {
      return;
    }
    originalInfo(...args);
  };

  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[qiankun:sandbox]')) {
      return;
    }
    originalWarn(...args);
  };
}

/**
 * 初始化qiankun微前端
 */
export function setupQiankun() {
  // 过滤 qiankun 日志
  filterQiankunLogs();

  // 获取当前语言
  const currentLocale = getCurrentLocale();

  // 注册子应用，传递当前语言和 Tab 管理回调
  const appsWithProps = microApps.map(app => ({
    ...app,
    props: {
      locale: currentLocale,
      onReady: () => {
        // 子应用加载完成
        finishLoading();
      },
      // Tab 管理 API
      registerTabs: (tabs: TabMeta[]) => registerTabs(app.name, tabs),
      clearTabs: () => clearTabs(app.name),
      setActiveTab: (tabKey: string) => {
        console.log('[Main] Sub-app set active tab:', app.name, tabKey);
      },
    },
    // 核心配置：指定脚本类型为 module，让 qiankun 以 ES 模块方式加载子应用脚本
    // 这是解决 Vite 子应用 ES 模块加载问题的关键配置
    scriptType: 'module' as const,
    // 自定义 getTemplate：修改 HTML 模板，确保所有 script 标签都有 type="module"
    getTemplate: (tpl: string) => {
      // 使用正则表达式匹配所有 script 标签，确保它们都有 type="module"
      return tpl.replace(
        /<script(\s+[^>]*)?>/gi,
        (match, attrs = '') => {
          // 如果已经有 type 属性，替换为 module
          if (attrs.includes('type=')) {
            return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
          }
          // 如果没有 type 属性，添加 type="module"
          return `<script type="module"${attrs}>`;
        }
      );
    },
    // 配置生命周期超时时间（single-spa 格式）
    // 如果应用配置中有 timeout，使用它，否则使用默认值 10 秒
    timeouts: {
      bootstrap: {
        millis: app.timeout || 10000,
        dieOnTimeout: false, // 超时后不终止应用，只警告
      },
      mount: {
        millis: app.timeout || 10000,
        dieOnTimeout: false,
      },
      unmount: {
        millis: app.timeout || 10000,
        dieOnTimeout: false,
      },
    },
  }));

  registerMicroApps(
    appsWithProps,
    {
      // 应用加载前
      beforeLoad: [(app) => {
        const appName = appNameMap[app.name] || app.name;
        startLoading(appName);

        // 确保容器存在且可见（qiankun 需要容器可见才能加载）
        return new Promise<void>((resolve, reject) => {
          let retryCount = 0;
          const maxRetries = 50; // 增加重试次数到 50 次（约 2.5 秒）
          const retryDelay = 50; // 每次重试间隔 50ms

          const ensureContainer = () => {
            // 使用双重 requestAnimationFrame 确保 Vue 的响应式更新完成
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const container = document.querySelector('#subapp-viewport') as HTMLElement;

                if (container) {
                  // 检查容器是否在 DOM 中（不仅仅是存在，还要在文档中）
                  if (!container.isConnected) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                      setTimeout(ensureContainer, retryDelay);
                      return;
                    } else {
                      console.error(`[qiankun] 容器 #subapp-viewport 不在 DOM 中`);
                      reject(new Error(`容器 #subapp-viewport 不在 DOM 中，无法加载应用 ${app.name}`));
                      return;
                    }
                  }

                  // 强制显示容器（使用 !important 确保优先级）
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                  // 添加标记，防止 Vue 的 v-show 覆盖
                  container.setAttribute('data-qiankun-loading', 'true');

                  // 触发自定义事件，通知 Layout 组件更新状态
                  window.dispatchEvent(new CustomEvent('qiankun:before-load', {
                    detail: { appName: app.name }
                  }));

                  // 再次确认容器可见（等待一个 tick 后检查）
                  setTimeout(() => {
                    const computedStyle = window.getComputedStyle(container);
                    const isVisible = computedStyle.display !== 'none' &&
                                    computedStyle.visibility !== 'hidden' &&
                                    computedStyle.opacity !== '0';

                    if (!isVisible) {
                      console.warn(`[qiankun] 容器 #subapp-viewport 仍然不可见，强制显示`);
                      container.style.setProperty('display', 'flex', 'important');
                      container.style.setProperty('visibility', 'visible', 'important');
                      container.style.setProperty('opacity', '1', 'important');
                    }

                    // 切入子应用前，清理其他子应用的映射，防串味
                    clearTabsExcept(app.name);
                    clearMenusExcept(app.name);

                    registerManifestTabsForApp(app.name);
                    registerManifestMenusForApp(app.name);

                    resolve();
                  }, 10);
                } else {
                  // 容器不存在，重试
                  retryCount++;
                  if (retryCount < maxRetries) {
                    setTimeout(ensureContainer, retryDelay);
                  } else {
                    // 超过最大重试次数，报错
                    console.error(`[qiankun] 容器 #subapp-viewport 在 ${maxRetries * retryDelay}ms 内未找到`);
                    reject(new Error(`容器 #subapp-viewport 不存在，无法加载应用 ${app.name}`));
                  }
                }
              });
            });
          };

          // 开始检查
          ensureContainer();
        });
      }],

      // 应用挂载后
      afterMount: [(_app) => {
        // 触发自定义事件，通知 Layout 组件更新状态
        window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
          detail: { appName: _app.name }
        }));

        // 清理加载标记
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container) {
          container.removeAttribute('data-qiankun-loading');
          // 移除强制样式，让 Vue 的 v-show 正常控制
          container.style.removeProperty('display');
          container.style.removeProperty('visibility');
          container.style.removeProperty('opacity');
        }

        // 如果子应用没有主动调用 onReady，这里兜底
        setTimeout(() => {
          finishLoading();
        }, 100);
        return Promise.resolve();
      }],

      // 应用卸载后
      afterUnmount: [(app) => {
        // 离开子应用，清理其映射
        clearTabs(app.name);
        clearMenus(app.name);

        return Promise.resolve();
      }],
    }
  );

  // 启动qiankun
  start({
    prefetch: false,
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true,
      loose: false,
    },
    singular: true, // 单例模式：同时只能运行一个子应用
    // 关键：允许加载跨域模块脚本，强制以 module 类型加载
    // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
    importEntryOpts: {
      scriptType: 'module', // 再次强调 module 类型
      // 自定义 fetch：确保脚本以正确的方式加载
      fetch: (url: string, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'same-origin',
        });
      },
      // 自定义 getTemplate：确保所有 script 标签都有 type="module"
      getTemplate: (tpl: string) => {
        return tpl.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            if (attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      },
    },
  });

  // 初始加载时，如果当前路径匹配系统域，立即注册菜单和 tabs
  const currentPath = window.location.pathname;
  const isSystemPath = !currentPath.startsWith('/admin') &&
                       !currentPath.startsWith('/logistics') &&
                       !currentPath.startsWith('/engineering') &&
                       !currentPath.startsWith('/quality') &&
                       !currentPath.startsWith('/production') &&
                       !currentPath.startsWith('/finance') &&
                       !currentPath.startsWith('/docs');

  if (isSystemPath) {
    registerManifestTabsForApp('system');
    registerManifestMenusForApp('system');
  }

  // 监听全局错误
  window.addEventListener('error', (event) => {
    if (event.message?.includes('application')) {
      const appMatch = event.message.match(/'(\w+)'/);
      const appName = appMatch ? appNameMap[appMatch[1]] || appMatch[1] : '应用';
      loadingError(appName, event.error);
    }
  });
}

/**
 * 监听子应用就绪事件
 */
export function listenSubAppReady() {
  window.addEventListener('subapp:ready', () => {
    finishLoading();
  });
}

/**
 * 监听子应用路由变化事件
 */
export function listenSubAppRouteChange() {
  window.addEventListener('subapp:route-change', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { path, fullPath, name, meta } = customEvent.detail;

    // ? 如果是子应用首页，将该应用的所有标签设为未激活
    if (meta?.isHome === true) {
      const process = useProcessStore();
      const app = getCurrentAppFromPath(path);
      process.list.forEach(tab => {
        if (tab.app === app) {
          tab.active = false;
        }
      });
      return;
    }

    // 使用统一的 getCurrentAppFromPath 来判断应用类型，更通用
    const process = useProcessStore();
    const app = getCurrentAppFromPath(path);

    // 排除管理域（admin）和无效应用（main）
    // 所有其他应用（system, logistics, engineering, quality, production, finance 等）都应该处理
    if (app === 'admin' || app === 'main') {
      return;
    }

    // 排除文档域（docs）
    if (app === 'docs') {
      return;
    }

    process.add({
      path,
      fullPath,
      name,
      meta,
    });
  });
}

