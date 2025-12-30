import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { resetPluginManager, usePluginManager } from '../../btc/plugins/manager';
import { createSharedUserSettingPlugin } from '@configs/layout-bridge';
import type { QiankunProps } from '../../types/qiankun';
import type { SubAppContext, SubAppOptions } from './types';
import { deriveInitialSubRoute } from './utils';

const sharedUserSettingPlugin = createSharedUserSettingPlugin();

/**
 * 创建 translate 函数
 */
function createTranslate(context: SubAppContext) {
  return (key?: string | null) => {
    if (!key) {
      return '';
    }

    try {
      return (context.i18n?.i18n?.global?.t as any)?.(key) ?? key;
    } catch (_err) {
      return key;
    }
  };
}

/**
 * 设置全局错误处理器（标准化模板）
 */
function setupErrorHandlers(app: VueApp, appId: string): void {
  // 关键：添加全局错误处理，捕获 DOM 操作错误
  // 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
  app.config.errorHandler = (err, instance, info) => {
    // 检查是否是 DOM 操作相关的错误
    if (err instanceof Error && (
      err.message.includes('insertBefore') ||
      err.message.includes('processCommentNode') ||
      err.message.includes('patch') ||
      err.message.includes('__vnode') ||
      err.message.includes('Cannot read properties of null') ||
      err.message.includes('Cannot set properties of null') ||
      err.message.includes('reading \'insertBefore\'') ||
      err.message.includes('reading \'emitsOptions\'')
    )) {
      // DOM 操作错误，可能是容器在更新时被移除
      // 静默处理，避免影响用户体验
      if (import.meta.env.DEV) {
        console.warn(`[${appId}-app] DOM 操作错误已捕获（应用可能正在卸载）:`, err.message);
      }
      return;
    }

    // 关键：CRUD 组件相关的错误不应该被静默处理
    // 这些错误通常表示组件配置问题，需要立即修复
    if (err instanceof Error && (
      err.message.includes('Must be used inside') ||
      err.message.includes('BtcAddBtn') ||
      err.message.includes('BtcMultiDeleteBtn') ||
      err.message.includes('BtcRefreshBtn') ||
      err.message.includes('BtcUpsert') ||
      err.message.includes('BtcTable') ||
      err.message.includes('BtcPagination') ||
      err.message.includes('BtcCrud')
    )) {
      // CRUD 组件错误，必须输出，帮助排查问题
      console.error(`[${appId}-app] CRUD 组件错误（必须修复）:`, err.message, { info, instance });
      // 继续执行，不阻止错误传播
    }

    // 其他错误必须输出，否则会导致"页面空白但无报错"难以排查
    try {
      (window as any).__BTC_SUBAPP_LAST_ERROR__ = { err, info, time: Date.now() };
    } catch (e) {
      // 静默失败
    }
    console.error(`[${appId}-app] Vue errorHandler 捕获到错误:`, err, { info, instance });
  };

  // 同理：warn 也至少在控制台可见（生产环境默认可能被忽略）
  app.config.warnHandler = (msg, instance, trace) => {
    try {
      (window as any).__BTC_SUBAPP_LAST_WARN__ = { msg, trace, time: Date.now() };
    } catch (e) {
      // 静默失败
    }
    console.warn(`[${appId}-app] Vue warn:`, msg, { trace, instance });
  };
}

/**
 * 设置独立运行时的插件（标准化模板）
 */
async function setupStandalonePlugins(app: VueApp, router: any): Promise<void> {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(sharedUserSettingPlugin);
  await pluginManager.install(sharedUserSettingPlugin.name);
}

/**
 * 创建子应用实例（标准化模板）
 * 以财务应用为标准，所有子应用使用相同的逻辑
 */
export async function createSubApp(
  options: SubAppOptions,
  props: QiankunProps = {}
): Promise<SubAppContext> {
  const { AppComponent, createRouter, setupRouter, setupStore, setupI18n, setupUI, setupPlugins } = options;
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

  // 创建 Vue 应用实例
  const app = createApp(AppComponent);

  // 设置全局错误处理器
  setupErrorHandlers(app, options.appId);

  // 先初始化 i18n，确保国际化文件已加载
  const i18n = setupI18n(app, props.locale || 'zh-CN');
  const router = createRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);

  // 独立运行时设置插件
  if (isStandalone && setupPlugins) {
    await setupPlugins(app, router);
  }

  // 关键优化：不在 createSubApp 中立即触发路由导航
  // 路由导航应该在应用挂载后立即触发，确保路由能够立即开始工作
  // 这样路由组件可以立即开始加载，与其他区域同步出现

  const context: SubAppContext = {
    app,
    router,
    pinia,
    i18n,
    theme,
    cleanup: {
      listeners: [],
    },
    props,
    translate: () => '',
  };

  context.translate = createTranslate(context);

  return context;
}

/**
 * 等待容器元素就绪（支持字符串选择器或 HTMLElement）
 */
async function waitForContainer(
  container: HTMLElement | string | null | undefined,
  maxRetries: number = 40,
  retryDelay: number = 50,
  parentElement?: HTMLElement
): Promise<HTMLElement | null> {
  // 如果已经是 HTMLElement 且已连接，检查可见性并返回
  if (container && container instanceof HTMLElement && container.isConnected) {
    // 确保容器可见
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('flex-direction', 'column', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
      container.style.setProperty('opacity', '1', 'important');
    }
    return container;
  }

  // 如果是字符串选择器，尝试查找
  if (typeof container === 'string') {
    // 如果指定了父元素，在父元素内查找
    const element = parentElement 
      ? (parentElement.querySelector(container) as HTMLElement)
      : (document.querySelector(container) as HTMLElement);
    if (element && element.isConnected) {
      // 确保容器可见
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        element.style.setProperty('display', 'flex', 'important');
        element.style.setProperty('flex-direction', 'column', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
      }
      return element;
    }
  }

  // 如果容器不存在或未连接，尝试等待
  const selector = typeof container === 'string' ? container : '#subapp-viewport';
  
  return new Promise((resolve) => {
    let retryCount = 0;
    
    const checkContainer = async () => {
      // 如果指定了父元素，在父元素内查找
      const element = parentElement
        ? (parentElement.querySelector(selector) as HTMLElement)
        : (document.querySelector(selector) as HTMLElement);
      if (element && element.isConnected) {
        // 关键：确保容器可见，如果被隐藏则强制显示
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
          // 强制显示容器（与 app-layout 的样式定义一致）
          element.style.setProperty('display', 'flex', 'important');
          element.style.setProperty('flex-direction', 'column', 'important');
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('opacity', '1', 'important');
        }
        
        // 关键：如果是 #subapp-viewport，确保 layout-app 的 Vue 应用已经渲染完成
        // 通过等待多个 requestAnimationFrame 来确保 Vue 的响应式更新完成
        if (selector === '#subapp-viewport' || (typeof container === 'string' && container === '#subapp-viewport')) {
          // 等待 Vue 应用完全渲染
          await new Promise<void>((resolveRAF) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  resolveRAF();
                });
              });
            });
          });
          
          // 再次检查容器是否可见（Vue 渲染后可能会改变样式）
          const finalComputedStyle = window.getComputedStyle(element);
          if (finalComputedStyle.display === 'none' || finalComputedStyle.visibility === 'hidden' || finalComputedStyle.opacity === '0') {
            // 再次强制显示
            element.style.setProperty('display', 'flex', 'important');
            element.style.setProperty('flex-direction', 'column', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
          }
          
          // 生产环境下输出诊断信息
          if (import.meta.env.PROD && typeof window !== 'undefined') {
            const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
            const isLayoutApp = !!(window as any).__IS_LAYOUT_APP__;
            console.warn('[waitForContainer] 容器准备就绪', {
              selector,
              isUsingLayoutApp,
              isLayoutApp,
              display: finalComputedStyle.display,
              visibility: finalComputedStyle.visibility,
              opacity: finalComputedStyle.opacity,
              hasChildren: element.children.length,
            });
          }
        }
        
        resolve(element);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkContainer, retryDelay);
      } else {
        // 超时后输出诊断信息
        if (import.meta.env.PROD && typeof window !== 'undefined') {
          console.warn('[waitForContainer] 容器查找超时', {
            selector,
            retryCount,
            maxRetries,
            isUsingLayoutApp: !!(window as any).__USE_LAYOUT_APP__,
            isLayoutApp: !!(window as any).__IS_LAYOUT_APP__,
            elementExists: !!document.querySelector(selector),
          });
        }
        resolve(null);
      }
    };
    
    checkContainer();
  });
}

/**
 * 挂载子应用（标准化模板）
 */
export async function mountSubApp(
  context: SubAppContext,
  options: SubAppOptions,
  props: QiankunProps = {}
): Promise<void> {
  context.props = props;

  // 查找挂载点：
  // - 优先使用 props.container（无论是否 qiankun，只要提供了 container 就使用）
  // - 否则：如果 __USE_LAYOUT_APP__ 为 true，尝试查找 #subapp-viewport
  // - 否则：使用 #app（独立运行模式）
  let mountPoint: HTMLElement | null = null;

  // 关键：优先使用 props.container（无论是 qiankun 模式还是嵌入 layout-app 模式）
  // 支持 HTMLElement 或字符串选择器
  // 重要：确保子应用挂载到 #subapp-viewport 容器下，而不是其他位置
  if (props.container) {
    if (props.container instanceof HTMLElement) {
      // 关键：验证容器是否是 #subapp-viewport 元素
      // 如果 qiankun 传递的不是 #subapp-viewport，需要查找正确的容器
      const isSubappViewport = props.container.id === 'subapp-viewport';
      
      if (isSubappViewport) {
        // 容器就是 #subapp-viewport，检查是否已连接到 DOM 且可见
        if (props.container.isConnected) {
          // 关键：在生产环境独立运行模式下，即使容器已连接，也要确保容器已准备好
          // 使用 requestAnimationFrame 确保 Vue 渲染完成
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve(undefined);
              });
            });
          });
          mountPoint = props.container;
        } else {
          // 容器存在但未连接，等待它连接
          mountPoint = await waitForContainer(props.container, 80, 50);
        }
      } else {
        // 容器不是 #subapp-viewport，可能是 qiankun 包装器
        // 关键：在 qiankun 模式下，如果传递的是包装器，应该查找包装器内部的 #app 元素
        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          // qiankun 模式：查找包装器内部的 #app 元素
          const appElement = props.container.querySelector('#app') as HTMLElement;
          if (appElement) {
            mountPoint = appElement;
          } else {
            // 如果包装器内没有 #app，等待它出现（qiankun 可能还在加载 HTML）
            mountPoint = await waitForContainer('#app', 80, 50, props.container);
            if (!mountPoint) {
              // 如果还是找不到，回退到使用传递的容器
              if (props.container.isConnected) {
                await new Promise(resolve => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      resolve(undefined);
                    });
                  });
                });
                mountPoint = props.container;
              } else {
                mountPoint = await waitForContainer(props.container, 80, 50);
              }
            }
          }
        } else {
          // 非 qiankun 模式：查找 #subapp-viewport 元素
          const viewport = await waitForContainer('#subapp-viewport', 80, 50);
          if (viewport) {
            mountPoint = viewport;
          } else {
            // 如果找不到 #subapp-viewport，回退到使用传递的容器（兼容性处理）
            if (props.container.isConnected) {
              await new Promise(resolve => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    resolve(undefined);
                  });
                });
              });
              mountPoint = props.container;
            } else {
              mountPoint = await waitForContainer(props.container, 80, 50);
            }
          }
        }
      }
    } else if (typeof props.container === 'string') {
      // qiankun 可能传递字符串选择器，需要查找
      // 如果是 '#subapp-viewport'，直接使用；否则查找 #subapp-viewport
      if (props.container === '#subapp-viewport') {
        mountPoint = await waitForContainer('#subapp-viewport', 80, 50);
      } else {
        // 传递的选择器不是 #subapp-viewport，优先查找 #subapp-viewport
        const viewport = await waitForContainer('#subapp-viewport', 80, 50);
        if (viewport) {
          mountPoint = viewport;
        } else {
          // 如果找不到 #subapp-viewport，使用传递的选择器（兼容性处理）
          mountPoint = await waitForContainer(props.container, 80, 50);
        }
      }
    }
  }

  // 如果 props.container 不存在或查找失败，尝试其他方式
  if (!mountPoint) {
    // 关键：只有当 __USE_LAYOUT_APP__ 为 true 时，才查找 #subapp-viewport
    // 如果 __USE_LAYOUT_APP__ 为 false，说明 layout-app 加载失败，应该使用独立渲染模式（#app）
    const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
    
    if (isUsingLayoutApp) {
      // 使用 layout-app：尝试查找 #subapp-viewport
      mountPoint = await waitForContainer('#subapp-viewport', 80, 50); // 增加重试次数和延迟
      if (!mountPoint) {
        const errorMsg = `[${options.appId}-app] 使用 layout-app 但未找到 #subapp-viewport 元素`;
        console.error(errorMsg, {
          __USE_LAYOUT_APP__: (window as any).__USE_LAYOUT_APP__,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
          documentBody: typeof document !== 'undefined' ? document.body : null,
          appElement: typeof document !== 'undefined' ? document.querySelector('#app') : null,
          viewportElement: typeof document !== 'undefined' ? document.querySelector('#subapp-viewport') : null,
        });
        throw new Error(errorMsg);
      }
    } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
      mountPoint = await waitForContainer('#subapp-viewport', 80, 50);
      if (!mountPoint) {
        throw new Error(`[${options.appId}-app] qiankun 模式下未提供容器元素且未找到 #subapp-viewport`);
      }
    } else {
      // 独立运行模式：使用 #app
      mountPoint = await waitForContainer('#app');
      if (!mountPoint) {
        throw new Error(`[${options.appId}-app] 独立运行模式下未找到 #app 元素`);
      }
    }
  }

  if (!mountPoint) {
    throw new Error(`[${options.appId}-app] 无法找到挂载节点`);
  }
  
  // 关键：再次确认容器已连接到 DOM 且已准备好
  if (!mountPoint.isConnected) {
    mountPoint = await waitForContainer(mountPoint, 80, 50);
    if (!mountPoint || !mountPoint.isConnected) {
      throw new Error(`[${options.appId}-app] 挂载容器未连接到 DOM`);
    }
  }
  
  // 关键：确保容器已准备好（使用 requestAnimationFrame 确保 Vue 渲染完成）
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(undefined);
      });
    });
  });

  // 关键：确保容器可见（如果容器被 v-show 隐藏，强制显示）
  // 因为 qiankun 需要容器可见才能正确挂载
  const computedStyle = window.getComputedStyle(mountPoint);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    // 临时强制显示容器，确保 qiankun 能够正确挂载
    mountPoint.style.setProperty('display', 'flex', 'important');
    mountPoint.style.setProperty('visibility', 'visible', 'important');
  }

  // 关键优化：立即挂载应用，不等待任何异步操作
  // 这样应用可以立即显示，提升用户体验
  
  context.app.mount(mountPoint);
  

  // 关键优化：应用挂载后立即触发路由导航（类似 cool-admin 的做法）
  // 在 qiankun 或 layout-app 环境下，立即触发路由导航，不等待任何异步操作
  // 这样路由组件可以立即开始加载，与其他区域同步出现
  // 注意：独立运行模式下，Vue Router 会自动根据当前 URL 匹配路由，无需手动触发
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    const initialRoute = deriveInitialSubRoute(options.appId, options.basePath);
    
    // 立即触发路由导航，直接调用不延迟
    // 应用已经挂载，路由可以立即开始工作，不需要 setTimeout
    context.router.replace(initialRoute).catch((error: unknown) => {
      // 路由导航失败时输出错误信息
      console.error(`[${options.appId}-app] 路由导航失败:`, error, {
        initialRoute,
        currentPath: window.location.pathname,
        routerReady: 'pending',
      });
    });
  }

  // 关键优化：将后续操作改为后台异步执行，不阻塞应用挂载和路由导航
  // 应用已经挂载，路由已经开始导航，这些操作可以在后台完成
  (async () => {
    try {
      // 在应用挂载后再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
      // 这解决了生产环境子域名下独立运行时菜单为空的问题
      try {
        const { registerManifestMenusForApp } = await import('@configs/layout-bridge');
        registerManifestMenusForApp(options.appId);
      } catch (error) {
        // 静默失败
      }

      // 检查并启动用户检查轮询（如果已登录且尚未启动）
      try {
        const { startUserCheckPollingIfLoggedIn } = await import('../user-check');
        startUserCheckPollingIfLoggedIn();
      } catch (error) {
        // 静默失败，不影响应用运行
      }

      // 在路由准备好后调用 onReady 回调（但不阻塞路由导航）
      // 路由导航已经在应用挂载后立即触发，这里只需要等待路由准备好后调用回调
      context.router.isReady().then(() => {
        if (props.onReady) {
          props.onReady();
        }

        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: options.appId } }));
        }
      }).catch(() => {
        // 静默失败
      });
    } catch (error) {
      // 静默失败，不影响应用运行
    }
  })();
}

/**
 * 更新子应用配置（标准化模板）
 */
export function updateSubApp(
  context: SubAppContext,
  props: QiankunProps
): void {
  context.props = {
    ...context.props,
    ...props,
  };

  if (props.locale && context.i18n?.i18n?.global) {
    const locale = context.i18n.i18n.global.locale;
    if (locale && typeof locale === 'object' && 'value' in locale) {
      (locale as { value: string }).value = props.locale as 'zh-CN' | 'en-US';
    }
  }
}

/**
 * 卸载子应用（标准化模板）
 */
export async function unmountSubApp(
  context: SubAppContext,
  props: QiankunProps = {}
): Promise<void> {
  // 标记应用已卸载，阻止路由同步和响应式更新
  context.isUnmounted = true;

  // 先清理事件监听器和路由钩子，阻止后续的响应式更新
  if (context.cleanup.routerAfterEach) {
    context.cleanup.routerAfterEach();
    delete context.cleanup.routerAfterEach;
  }

  context.cleanup.listeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  });
  context.cleanup.listeners = [];

  // 清理 history API 的补丁
  if (context.cleanup.historyPatches) {
    context.cleanup.historyPatches();
    delete context.cleanup.historyPatches;
  }

  const clearTabs = props.clearTabs ?? context.props?.clearTabs;
  if (clearTabs) {
    clearTabs();
  }

  // 关键：使用 nextTick 确保所有待处理的响应式更新完成，避免在卸载过程中触发更新
  const { nextTick } = await import('vue');
  await nextTick();

  // 安全卸载：不直接操作 DOM，只卸载 Vue 应用
  // qiankun 会自己管理容器的清理，我们不需要检查 DOM 状态
  try {
    context.app.unmount();
  } catch (error) {
    // 卸载失败，静默处理
    // 这通常发生在容器已经被移除的情况下，属于正常情况
  }

  context.props = {};
}

// 导出 setupStandalonePlugins 供外部使用
export { setupStandalonePlugins };
