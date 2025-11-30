/**
 * 初始化 layout-app 加载
 * 仅在独立运行且需要加载 layout-app 时调用
 */
export async function initLayoutApp() {
  if (window.__POWERED_BY_QIANKUN__) {
    return;
  }

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
    const [qiankun, { loadLayoutApp }] = await Promise.all([
      import('qiankun'),
      import('@btc/shared-utils/qiankun/load-layout-app')
    ]);

    await loadLayoutApp({
      registerMicroApps: qiankun.registerMicroApps,
      start: qiankun.start
    });
  } catch (error) {
    console.error('[finance-app] 加载 layout-app 失败:', error);
  }
}

