import { registerMicroApps, start } from 'qiankun';
import { microApps } from './apps';
import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';

/**
 * 清除所有 #Loading 元素（可能来自子应用的 index.html）
 * 这个元素会导致页面一直显示 loading 状态
 */
function clearLoadingElement() {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏
    loadingEl.style.display = 'none';
    loadingEl.style.visibility = 'hidden';
    loadingEl.style.opacity = '0';
    loadingEl.style.pointerEvents = 'none';
    // 延迟移除，确保动画完成
    setTimeout(() => {
      if (loadingEl.parentNode) {
        loadingEl.parentNode.removeChild(loadingEl);
      }
    }, 100);
  }
}
import { registerTabs, clearTabs, clearTabsExcept, type TabMeta } from '../store/tabRegistry';
import { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, type MenuItem } from '../store/menuRegistry';
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

  // 获取现有菜单
  const existingMenus = getMenusForApp(appName);

  // 关键修复：对于通过 manifest 注册的应用（如物流域），必须强制重新注册
  // 因为菜单可能被 clearMenusExcept 清空了，即使内容相同也要重新注册
  // 只有管理域（admin）的菜单是从静态配置初始化的，如果内容相同且不为空，可以跳过更新
  if (appName === 'admin') {
    // 管理域：如果菜单内容相同且不为空，则跳过更新，避免触发不必要的响应式更新
  if (existingMenus.length > 0 && menusEqual(existingMenus, normalizedMenus)) {
    return;
    }
  }

  // 其他应用（包括物流域、系统域等）：无论现有菜单是否为空，都强制重新注册
  // 这样可以修复菜单在切换应用后消失的问题
  // 注意：即使菜单内容相同，也要重新注册，因为可能被 clearMenusExcept 清空了
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
    // 过滤 qiankun sandbox 警告
    if (typeof args[0] === 'string' && args[0].includes('[qiankun:sandbox]')) {
      return;
    }
    // 暂时不过滤 single-spa 超时警告，用于验证 timeouts 配置是否生效
    // 如果配置生效，警告应该消失或超时时间变为 8000ms
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
  const appsWithProps = microApps.map(app => {
    // 根据环境设置合理的超时时间
    const isDev = import.meta.env.DEV;
    const defaultTimeout = isDev ? 8000 : 5000; // 开发环境 8 秒，生产环境 5 秒
    const timeout = app.timeout || defaultTimeout;

    // qiankun 2.10+ 支持 single-spa 原生格式的 timeouts 配置
    // 必须包含 millis、dieOnTimeout、warningMillis 字段，qiankun 会直接透传给 single-spa
    const timeoutsConfig = {
      bootstrap: {
        millis: timeout, // 超时毫秒数
        dieOnTimeout: !isDev, // 生产环境超时终止，开发环境不终止（仅警告）
        warningMillis: Math.floor(timeout / 2), // 警告时间（超时时间的一半）
      },
      mount: {
        millis: timeout,
        dieOnTimeout: !isDev,
        warningMillis: Math.floor(timeout / 2),
      },
      unmount: {
        millis: 3000,
        dieOnTimeout: true,
        warningMillis: 1500,
      },
    };

    // 打印超时配置，便于调试
    // if (app.name === 'admin') {
    //   console.log(`[qiankun] 管理域应用超时配置:`, timeoutsConfig, '应用配置:', app);
    // }


    return {
    ...app,
    props: {
      locale: currentLocale,
      onReady: () => {
        // 子应用加载完成
          // console.log(`[qiankun] 子应用 ${app.name} onReady 回调被调用`);

          // 清除超时保护
          const timeoutKey = `__qiankun_timeout_${app.name}__`;
          const timeoutId = (window as any)[timeoutKey];
          if (timeoutId) {
            clearTimeout(timeoutId);
            delete (window as any)[timeoutKey];
            // console.log(`[qiankun] 子应用 ${app.name} onReady 清除超时保护`);
          }

          // 注意：不要在 onReady 中调用 finishLoading
          // 因为 onReady 可能在 afterMount 之前被调用，导致 loading 状态被过早清除
          // finishLoading 应该在 afterMount 中统一调用
          // console.log(`[qiankun] 子应用 ${app.name} onReady 完成，等待 afterMount 清除 loading 状态`);
      },
      // Tab 管理 API
      registerTabs: (tabs: TabMeta[]) => registerTabs(app.name, tabs),
      clearTabs: () => clearTabs(app.name),
      setActiveTab: (tabKey: string) => {
        // console.log('[Main] Sub-app set active tab:', app.name, tabKey);
      },
    },
    // 核心配置：指定脚本类型为 module，让 qiankun 以 ES 模块方式加载子应用脚本
    // 这是解决 Vite 子应用 ES 模块加载问题的关键配置
    scriptType: 'module' as const,
      // 自定义 getTemplate：确保所有 script 标签都有 type="module"
    getTemplate: (tpl: string) => {
      return tpl.replace(
        /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => attrs.includes('type=')
            ? match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"')
            : `<script type="module"${attrs}>`
      );
    },
    // 配置生命周期超时时间（single-spa 格式）
      // qiankun 会将 timeouts 配置传递给 single-spa
      // 注意：bootstrap 超时可能发生在模块加载阶段，而不仅仅是函数执行阶段
      // 关键：必须在这里明确设置超时，确保 single-spa 正确读取
      timeouts: timeoutsConfig,
    };
  });

  registerMicroApps(
    appsWithProps,
    {
      // 应用加载前（每次应用加载时都会调用，包括重复加载）
      beforeLoad: [(app) => {
        const appName = appNameMap[app.name] || app.name;
        // console.log(`[qiankun] 子应用 ${app.name} beforeLoad 开始`);

        // 关键：在加载子应用前，先清除可能存在的 #Loading 元素
        // 避免上一个子应用的 Loading 元素残留
        clearLoadingElement();

        // 设置超时保护：如果 12 秒后仍未完成，强制清除 loading 状态
        // 使用应用名称作为 key，避免多个应用切换时的冲突
        // const timeoutKey = `__qiankun_timeout_${app.name}__`;
        // const timeoutId = setTimeout(() => {
        //   console.warn(`[qiankun] 子应用 ${app.name} 加载超时（12秒），强制清除 loading 状态`);
        //   finishLoading();
        //   delete (window as any)[timeoutKey];
        // }, 12000);
        // (window as any)[timeoutKey] = timeoutId;

        // 快速确认容器存在，添加轻量重试（最多 200ms，避免阻塞）
        return new Promise<void>((resolve, reject) => {
          let retryCount = 0;
          const maxRetries = 4; // 最多重试 4 次（约 200ms）
          const retryDelay = 50; // 每次重试间隔 50ms

          const ensureContainer = () => {
                const container = document.querySelector('#subapp-viewport') as HTMLElement;

            if (container && container.isConnected) {
              // 容器存在且已挂载，立即处理
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                  container.setAttribute('data-qiankun-loading', 'true');

              // 清理其他应用的 tabs/menus（快速操作，无阻塞）
              clearTabsExcept(app.name);
              clearMenusExcept(app.name);
              // 关键：先注册菜单，再注册 tabs，确保菜单在切换应用时不会丢失
              // 即使菜单内容相同，也要重新注册，因为可能被 clearMenusExcept 清空了
              registerManifestMenusForApp(app.name);
              registerManifestTabsForApp(app.name);

              // 先触发事件，确保 Layout 组件的 isQiankunLoading 状态被更新
              // 这样 shouldShowSubAppViewport 会返回 true，容器会显示，骨架屏会渲染
                  window.dispatchEvent(new CustomEvent('qiankun:before-load', {
                    detail: { appName: app.name }
                  }));

              // 等待 Vue 渲染完成后再调用 startLoading，确保骨架屏已经渲染到 DOM 中
              // 使用 requestAnimationFrame 确保 DOM 更新完成
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // startLoading(appName); // 注释掉 loading
                    resolve();
                });
              });
            } else if (retryCount < maxRetries) {
              // 容器不存在，轻量重试
                  retryCount++;
                    setTimeout(ensureContainer, retryDelay);
                  } else {
                    // 超过最大重试次数，报错
              // console.error(`[qiankun] 容器 #subapp-viewport 在 ${maxRetries * retryDelay}ms 内未找到`);
              reject(new Error(`容器缺失，无法加载应用 ${appName}`));
                }
          };

          // 开始检查
          ensureContainer();
        });
      }],

      // 应用挂载前（在 mount 之前调用，作为 beforeLoad 的兜底）
      // 如果 beforeLoad 被跳过（应用已加载过），这里确保 loading 状态被正确设置
      beforeMount: [(_app) => {
        const appName = appNameMap[_app.name] || _app.name;
        // console.log(`[qiankun] 子应用 ${_app.name} beforeMount 钩子被触发`);

        // 检查容器是否有 data-qiankun-loading 属性
        // 如果没有，说明 beforeLoad 被跳过了，需要手动设置 loading 状态
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container && !container.hasAttribute('data-qiankun-loading')) {
          // console.log(`[qiankun] 子应用 ${_app.name} beforeLoad 被跳过，在 beforeMount 中设置 loading 状态`);

          // 先触发 before-load 事件，确保 Layout 组件的状态被更新
          // 这样 shouldShowSubAppViewport 会返回 true，容器会显示，骨架屏会显示（v-show）
          window.dispatchEvent(new CustomEvent('qiankun:before-load', {
            detail: { appName: _app.name }
          }));

          // 设置容器状态
          container.style.setProperty('display', 'flex', 'important');
          container.style.setProperty('visibility', 'visible', 'important');
          container.style.setProperty('opacity', '1', 'important');
          container.setAttribute('data-qiankun-loading', 'true');

          // 设置超时保护
          // const timeoutKey = `__qiankun_timeout_${_app.name}__`;
          // const timeoutId = setTimeout(() => {
          //   console.warn(`[qiankun] 子应用 ${_app.name} 加载超时（12秒），强制清除 loading 状态`);
          //   finishLoading();
          //   delete (window as any)[timeoutKey];
          // }, 12000);
          // (window as any)[timeoutKey] = timeoutId;

          // 关键修复：清理其他应用的 tabs/menus，并重新注册当前应用的菜单
          // 这是修复物流域菜单消失的关键：即使 beforeLoad 被跳过，也要确保菜单被注册
          clearTabsExcept(_app.name);
          clearMenusExcept(_app.name);
          // 关键：先注册菜单，再注册 tabs，确保菜单在切换应用时不会丢失
          registerManifestMenusForApp(_app.name);
          registerManifestTabsForApp(_app.name);

          // 由于骨架屏使用 v-show，它始终在 DOM 中
          // 但需要等待一个微任务，确保 Vue 的响应式更新完成（isQiankunLoading 已更新，骨架屏已显示）
          // 使用同步的微任务，确保在子应用 mount 之前执行
          // queueMicrotask(() => {
          //   startLoading(appName); // 注释掉 loading
          // });
        }

        return Promise.resolve();
      }],

      // 应用挂载后
      afterMount: [(_app) => {
        // console.log(`[qiankun] 子应用 ${_app.name} afterMount 钩子被触发`);

        // 关键：清除可能存在的 #Loading 元素（来自子应用的 index.html）
        // 这个元素会导致页面一直显示 loading 状态
        clearLoadingElement();

        // 清除超时保护
        const timeoutKey = `__qiankun_timeout_${_app.name}__`;
        const timeoutId = (window as any)[timeoutKey];
        if (timeoutId) {
          clearTimeout(timeoutId);
          delete (window as any)[timeoutKey];
          // console.log(`[qiankun] 子应用 ${_app.name} 清除超时保护`);
        }

        // 清理加载标记（必须在触发事件之前，确保 Layout 组件能正确读取状态）
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container) {
          container.removeAttribute('data-qiankun-loading');
          // 移除强制样式，让 Vue 的 v-show 正常控制
          container.style.removeProperty('display');
          container.style.removeProperty('visibility');
          container.style.removeProperty('opacity');
          // console.log(`[qiankun] 子应用 ${_app.name} 容器状态已清理`);

          // 确保容器可见（使用 nextTick 确保 Vue 的响应式更新完成）
          // 使用 requestAnimationFrame 确保 DOM 更新完成
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (container) {
                // 检查容器是否真的可见
                const computedStyle = window.getComputedStyle(container);
                const isVisible = computedStyle.display !== 'none' &&
                                  computedStyle.visibility !== 'hidden' &&
                                  computedStyle.opacity !== '0';
                // console.log(`[qiankun] 子应用 ${_app.name} 容器可见性检查:`, {
                //   display: computedStyle.display,
                //   visibility: computedStyle.visibility,
                //   opacity: computedStyle.opacity,
                //   isVisible,
                //   hasChild: container.children.length > 0,
                //   childCount: container.children.length
                // });

                // 如果容器不可见，强制显示（作为兜底）
                if (!isVisible) {
                  // console.warn(`[qiankun] 子应用 ${_app.name} 容器不可见，强制显示`);
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                }

                // 检查子应用是否正确挂载
                // if (container.children.length === 0) {
                //   console.warn(`[qiankun] 子应用 ${_app.name} 容器内没有子元素，可能挂载失败`);
                // } else {
                //   console.log(`[qiankun] 子应用 ${_app.name} 容器内有 ${container.children.length} 个子元素`);

                //   // 检查子应用的第一个子元素是否可见
                //   const firstChild = container.children[0] as HTMLElement;
                //   if (firstChild) {
                //     const childStyle = window.getComputedStyle(firstChild);
                //     const childIsVisible = childStyle.display !== 'none' && childStyle.visibility !== 'hidden' && childStyle.opacity !== '0';
                //     console.log(`[qiankun] 子应用 ${_app.name} 第一个子元素可见性:`, {
                //       display: childStyle.display,
                //       visibility: childStyle.visibility,
                //       opacity: childStyle.opacity,
                //       isVisible: childIsVisible,
                //       tagName: firstChild.tagName,
                //       id: firstChild.id,
                //       className: firstChild.className
                //     });

                //     // 如果子元素不可见，尝试强制显示
                //     if (!childIsVisible) {
                //       console.warn(`[qiankun] 子应用 ${_app.name} 第一个子元素不可见，尝试强制显示`);
                //       firstChild.style.setProperty('display', 'flex', 'important');
                //       firstChild.style.setProperty('visibility', 'visible', 'important');
                //       firstChild.style.setProperty('opacity', '1', 'important');
                //     }
                //   }
                // }
              }
            });
          });
        }

        // 关键：立即调用 finishLoading，不延迟
        // 子应用的 onReady 也会调用 finishLoading，但这里作为兜底确保 loading 状态被清除
        // console.log(`[qiankun] 子应用 ${_app.name} 调用 finishLoading`);
        // finishLoading(); // 注释掉 loading

        // 触发自定义事件，通知 Layout 组件更新状态（在 finishLoading 之后，确保状态已清除）
        // 使用 nextTick 确保 DOM 更新完成后再触发事件，让 Layout 组件能正确读取容器状态
        Promise.resolve().then(() => {
          window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
            detail: { appName: _app.name }
          }));
          // console.log(`[qiankun] 子应用 ${_app.name} afterMount 事件已触发`);
        });

        return Promise.resolve();
      }],

      // 应用卸载后
      afterUnmount: [(app) => {
        // console.log(`[qiankun] 子应用 ${app.name} afterUnmount 钩子被触发`);
        // 离开子应用，清理其映射
        clearTabs(app.name);
        clearMenus(app.name);

        // 关键：清除可能存在的 #Loading 元素（来自子应用的 index.html）
        // 这个元素会导致页面一直显示 loading 状态
        clearLoadingElement();

        // 清除可能残留的 loading 状态
        // finishLoading(); // 注释掉 loading

        return Promise.resolve();
      }],
    }
  );

  // 启动qiankun
  // 关键：timeouts 配置已在 registerMicroApps 时通过 timeouts 属性传递
  // qiankun 会将 timeouts 配置传递给 single-spa，确保超时设置正确生效
  start({
    prefetch: false,
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true,
      loose: false,
    },
    singular: true, // 单例模式：同时只能运行一个子应用
    // 简化 importEntryOpts：只保留必要的 scriptType，删除重复的 getTemplate 和 fetch
    // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
    importEntryOpts: {
      scriptType: 'module', // 全局强制 module 类型，双重保险
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

