import { registerMicroApps, start } from 'qiankun';
import { microApps } from './apps';
import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';
import { registerTabs, clearTabs, clearTabsExcept, type TabMeta } from '../store/tabRegistry';

// 应用名称映射（用于显示友好的中文名称）
const appNameMap: Record<string, string> = {
  logistics: '物流应用',
  engineering: '工程应用',
  quality: '品质应用',
  production: '生产应用',
};

/**
 * 获取当前语言
 */
function getCurrentLocale(): string {
  // 从 localStorage 读取，或返回默认值
  return localStorage.getItem('locale') || 'zh-CN';
}

/**
 * 过滤 qiankun 沙箱日志
 */
function filterQiankunLogs() {
  // 保存原始方法
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  // 创建过滤器函数
  const createFilter = (originalMethod: (...args: any[]) => void) => {
    return (...args: any[]) => {
      const message = args[0];

      // 过滤所有包含 [qiankun:sandbox] 的日志
      if (typeof message === 'string' && message.includes('[qiankun:sandbox]')) {
        return;
      }

      // 过滤其他 qiankun 相关的日志
      if (typeof message === 'string' && (
        message.includes('qiankun modified global properties') ||
        message.includes('qiankun restored global properties') ||
        message.includes('qiankun') && message.includes('restore')
      )) {
        return;
      }


      originalMethod.apply(console, args);
    };
  };

  // 重写所有 console 方法
  console.log = createFilter(originalLog);
  console.info = createFilter(originalInfo);
  console.warn = createFilter(originalWarn);
  console.error = createFilter(originalError);
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

        // 切入子应用前，清理其他子应用的映射，防串味
        clearTabsExcept(app.name);

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
      import('../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
        const process = useProcessStore();
        const app = getCurrentAppFromPath(path);
        process.list.forEach(tab => {
          if (tab.app === app) {
            tab.active = false;
          }
        });
      });
      return;
    }

    // 验证路径格式（必须是子应用路径）
    const isValidSubAppPath = ['/logistics/', '/engineering/', '/quality/', '/production/'].some(prefix =>
      path.startsWith(prefix)
    );

    if (!isValidSubAppPath) {
      return;
    }

    // 动态导入 store 并添加标签
    import('../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
      const process = useProcessStore();
      const app = getCurrentAppFromPath(path);

      // 确认是子应用
      if (app === 'main') {
        return;
      }

      process.add({
        path,
        fullPath,
        name,
        meta,
      });
    });
  });
}

