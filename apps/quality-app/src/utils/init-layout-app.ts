/**
 * 初始化 layout-app 加载
 * 仅在独立运行且需要加载 layout-app 时调用
 * 
 * 关键设计：
 * 1. 只在成功加载 layout-app 后才设置 __USE_LAYOUT_APP__ 标志
 * 2. 任何失败（网络错误、超时、挂载失败等）都会清除标志，允许子应用独立渲染
 * 3. 提供详细的错误日志，便于排查问题
 */
export async function initLayoutApp() {
  if (window.__POWERED_BY_QIANKUN__) {
    console.log('[init-layout-app] 已在 qiankun 环境中，跳过 layout-app 加载');
    return;
  }

  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (!shouldLoadLayout) {
    console.log('[init-layout-app] 非生产环境，跳过 layout-app 加载');
    return;
  }

  const LOADER_FLAG = '__layout_app_loader__';
  if ((window as any)[LOADER_FLAG]) {
    console.log('[init-layout-app] layout-app 加载器已启动，跳过重复加载');
    return;
  }
  (window as any)[LOADER_FLAG] = true;

  // 关键：先不设置 __USE_LAYOUT_APP__ 标志，只在成功加载后再设置
  // 这样如果加载失败，子应用可以立即回退到独立渲染模式

  try {
    console.log('[init-layout-app] 开始加载 layout-app...');
    
    const [qiankun, { loadLayoutApp }] = await Promise.all([
      import('qiankun'),
      import('@btc/shared-utils/qiankun/load-layout-app')
    ]);

    // 加载 layout-app（包括挂载到 DOM）
    await loadLayoutApp({
      registerMicroApps: qiankun.registerMicroApps,
      start: qiankun.start
    });

    // 关键：只有在成功加载并挂载后才设置标志
    // 此时 layout-app 已经挂载，子应用不需要独立渲染
    (window as any).__USE_LAYOUT_APP__ = true;
    console.log('[init-layout-app] ✅ layout-app 加载成功，已设置 __USE_LAYOUT_APP__ 标志');
  } catch (error) {
    // 任何错误都要清除标志，确保子应用可以独立渲染
    (window as any).__USE_LAYOUT_APP__ = false;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[init-layout-app] ❌ 加载 layout-app 失败:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      hostname: window.location.hostname,
      href: window.location.href,
    });
    
    // 关键：抛出错误，让调用者知道加载失败，触发回退逻辑
    throw error;
  }
}
