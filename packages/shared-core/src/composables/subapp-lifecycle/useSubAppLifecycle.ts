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

  // 关键：在 qiankun 或 layout-app 环境下，都需要初始化路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    const initialRoute = deriveInitialSubRoute(options.appId, options.basePath);
    router.replace(initialRoute).catch(() => {});
  }

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
  if (props.container && props.container instanceof HTMLElement) {
    mountPoint = props.container;
  } else if ((window as any).__USE_LAYOUT_APP__) {
    // 使用 layout-app：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      const errorMsg = `[${options.appId}-app] 使用 layout-app 但未找到 #subapp-viewport 元素`;
      console.error(errorMsg, {
        __USE_LAYOUT_APP__: (window as any).__USE_LAYOUT_APP__,
        documentBody: document.body,
        appElement: document.querySelector('#app')
      });
      throw new Error(errorMsg);
    }
  } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      mountPoint = viewport;
    } else {
      throw new Error(`[${options.appId}-app] qiankun 模式下未提供容器元素且未找到 #subapp-viewport`);
    }
  } else {
    // 独立运行模式：使用 #app
    const appElement = document.querySelector('#app') as HTMLElement;
    if (!appElement) {
      throw new Error(`[${options.appId}-app] 独立运行模式下未找到 #app 元素`);
    }
    mountPoint = appElement;
  }

  if (!mountPoint) {
    throw new Error(`[${options.appId}-app] 无法找到挂载节点`);
  }

  context.app.mount(mountPoint);

  // 关键：在应用挂载后再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
  // 这解决了生产环境子域名下独立运行时菜单为空的问题
  try {
    const { registerManifestMenusForApp } = await import('@configs/layout-bridge');
    registerManifestMenusForApp(options.appId);
  } catch (error) {
    // 静默失败
  }

  // 在 qiankun 或 layout-app 环境下，等待路由就绪后再同步初始路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    // 使用 nextTick 确保 Vue 应用已完全挂载
    const { nextTick } = await import('vue');
    await nextTick();
    await context.router.isReady();

    // 使用统一的初始路由推导函数，支持子域名环境（路径为 /）和路径前缀环境（路径为 /finance/xxx）
    const initialRoute = deriveInitialSubRoute(options.appId, options.basePath);
    const currentRoute = context.router.currentRoute.value;
    // 如果当前路由不匹配或没有匹配的路由，则同步到子应用路由
    if (currentRoute.matched.length === 0 ||
        currentRoute.path !== initialRoute.split('?')[0].split('#')[0]) {
      await context.router.replace(initialRoute).catch(() => {});
    }
  }

  if (props.onReady) {
    props.onReady();
  }

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: options.appId } }));
  }
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
    context.cleanup.routerAfterEach = undefined;
  }

  context.cleanup.listeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  });
  context.cleanup.listeners = [];

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
