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

  // 关键：先不设置 __USE_LAYOUT_APP__ 标志，只在成功加载后再设置
  // 这样如果加载失败，子应用可以立即回退到独立渲染模式

  try {
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
  } catch (error) {
    // 任何错误都要清除标志，确保子应用可以独立渲染
    (window as any).__USE_LAYOUT_APP__ = false;
    
    // 清理可能残留的 layout-app 相关标志和 DOM 内容
    // 移除可能添加的 script 标签（layout-app 的入口文件）
    const scripts = document.querySelectorAll('script[data-layout-app], script[src*="layout.bellis.com.cn"], script[src*="localhost:4188"]');
    scripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    
    // 清理可能添加的 base 标签（如果是为了 layout-app 添加的）
    const baseTags = document.querySelectorAll('base[data-layout-app-base], base');
    baseTags.forEach(base => {
      // 如果 base 标签有 data-layout-app-base 属性，或者指向 layout-app 的域名，移除它
      if (base.hasAttribute('data-layout-app-base') || 
          (base.href && (base.href.includes('layout.bellis.com.cn') || base.href.includes('localhost:4188')))) {
        if (base.parentNode) {
          base.parentNode.removeChild(base);
        }
      }
    });
    
    // 清理 #app 容器中可能残留的内容（如果 layout-app 部分加载但挂载失败）
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      const hasLayoutContent = appContainer.querySelector('#subapp-viewport') || 
                               appContainer.querySelector('#layout-app') ||
                               appContainer.querySelector('[data-layout-app]');
      if (hasLayoutContent || appContainer.children.length > 0) {
        // 清空容器，让子应用可以重新挂载
        appContainer.innerHTML = '';
      }
    }
    
    // 关键：抛出错误，让调用者知道加载失败，触发回退逻辑
    throw error;
  }
}

