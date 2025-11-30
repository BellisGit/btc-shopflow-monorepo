/**
 * 初始化 layout-app 加载
 * 仅在独立运行且需要加载 layout-app 时调用
 */
export async function initLayoutApp() {
  // 关键：如果已经在 qiankun 环境中（由主应用加载），不执行任何独立运行逻辑
  // 生产环境：主应用通过 /micro-apps/logistics/ 路径加载，此时不应该加载 layout-app
  if (window.__POWERED_BY_QIANKUN__ || window.location.pathname.startsWith('/micro-apps/')) {
    return;
  }

  // 仅本地开发环境或独立访问子域名时，才加载 layout-app
  // 生产环境：子域名应该代理到主应用，不应该直接访问子应用的 index.html
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (!shouldLoadLayout) {
    return;
  }

  const LOADER_FLAG = '__layout_app_loader__';
  if ((window as any)[LOADER_FLAG]) {
    return;
  }
  (window as any)[LOADER_FLAG] = true;
  (window as any).__USE_LAYOUT_APP__ = true;

  try {
    // 使用共享工具函数加载 layout-app（需要先安装 qiankun 依赖）
    // 这样可以避免 CDN 的 CORS 问题和网络问题
    // 注意：qiankun 需要在 logistics-app 的 package.json 中安装
    const [qiankun, { loadLayoutApp }] = await Promise.all([
      import('qiankun'),
      import('@btc/shared-utils/qiankun/load-layout-app')
    ]);

    await loadLayoutApp({
      registerMicroApps: qiankun.registerMicroApps,
      start: qiankun.start
    });
  } catch (error) {
    console.error('[logistics-app] 加载 layout-app 失败:', error);
  }
}

