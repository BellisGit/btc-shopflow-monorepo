import { registerMicroApps, start } from 'qiankun';
import { microApps } from './apps';
import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';
import { registerTabs, clearTabs, clearTabsExcept, type TabMeta } from '../store/tabRegistry';
import { registerMenus, clearMenus, clearMenusExcept, type MenuItem } from '../store/menuRegistry';
import { getManifestTabs, getManifestMenus } from './manifests';
import { useProcessStore, getCurrentAppFromPath } from '../store/process';
import { appStorage } from '../utils/app-storage';

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

export function registerManifestMenusForApp(appName: string) {
  const menus = getManifestMenus(appName);
  if (!menus.length) {
    return;
  }

  // 将 manifest 菜单格式转换为 MenuItem 格式（递归处理任意深度）
  const normalizedMenus: MenuItem[] = normalizeMenuItems(menus);

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
  }));

  registerMicroApps(
    appsWithProps,
    {
      // 应用加载前
      beforeLoad: [(app) => {
        const appName = appNameMap[app.name] || app.name;
        startLoading(appName);

        // 确保容器存在且可见（qiankun 需要容器可见才能加载）
        const container = document.querySelector('#subapp-viewport');
        if (container) {
          // 强制显示容器（确保 qiankun 能找到它）
          (container as HTMLElement).style.display = 'flex';
        }

        // 切入子应用前，清理其他子应用的映射，防串味
        clearTabsExcept(app.name);
        clearMenusExcept(app.name);

        registerManifestTabsForApp(app.name);
        registerManifestMenusForApp(app.name);

        return Promise.resolve();
      }],

      // 应用挂载后
      afterMount: [(_app) => {
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

