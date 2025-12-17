import {
  registerAppEnvAccessors,
  registerManifestMenusForApp,
  registerManifestTabsForApp,
  createAppStorageBridge,
  resolveAppLogoUrl,
  injectDomainListResolver,
} from '@configs/layout-bridge';

export interface SubAppGlobalsOptions {
  appId: string;
  basePath: string;
  domainCachePath: string;
  domainCacheModule?: { getDomainList?: any; clearDomainCache?: any }; // 可选的预导入模块对象
}

/**
 * 设置子应用的全局函数（标准化模板）
 * 以财务应用为标准，所有子应用使用相同的逻辑
 */
export async function setupSubAppGlobals(options: SubAppGlobalsOptions): Promise<void> {
  const { appId, basePath, domainCachePath, domainCacheModule } = options;

  if (typeof window === 'undefined') {
    return;
  }

  // 注册应用环境访问器
  registerAppEnvAccessors();

  const win = window as any;

  // 应用存储桥接
  if (!win.__APP_STORAGE__) {
    win.__APP_STORAGE__ = createAppStorageBridge(appId);
  }

  // EPS 服务设置（支持全局服务优先）
  if (!win.__APP_EPS_SERVICE__) {
    win.__APP_EPS_SERVICE__ = {};
  }

  // 关键：使用统一的域列表注入函数，确保汉堡菜单应用列表能够调用 me 接口
  // 优先使用传入的 domainCacheModule（静态导入的模块对象），如果没有则使用路径字符串
  // 注意：在生产环境下，动态导入相对路径会失败，所以应该在调用方静态导入模块后传递
  await injectDomainListResolver(appId, domainCacheModule || domainCachePath);

  // 完成加载回调
  if (!win.__APP_FINISH_LOADING__) {
    win.__APP_FINISH_LOADING__ = () => {};
  }

  // Logo URL 获取函数
  win.__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();

  // 文档搜索服务（默认返回空数组）
  win.__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];

  // 关键：在独立运行模式下，确保菜单注册表已初始化
  // 先初始化菜单注册表，再注册菜单，确保菜单在 AppLayout 渲染前已准备好
  try {
    const sharedComponents = await import('@btc/shared-components');
    const { getMenuRegistry } = sharedComponents;
    const registry = getMenuRegistry();
    // 确保注册表已挂载到全局对象
    if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
      (window as any).__BTC_MENU_REGISTRY__ = registry;
    }
  } catch (error) {
    // 静默失败
  }

  // 注册菜单和 Tabs（无论是否独立运行都需要注册）
  registerManifestMenusForApp(appId);
  registerManifestTabsForApp(appId);
}
