/**
 * 自动挂载 DevTools 的辅助函数
 * 通过监听 DOM 变化，在所有应用挂载后自动挂载 DevTools
 */

let devToolsMounted = false;
let observer: MutationObserver | null = null;
let checkTimer: number | null = null;

/**
 * 自动挂载 DevTools（从全局对象获取依赖）
 */
async function mountDevToolsOnce() {
  // 只挂载一次，避免重复挂载
  if (devToolsMounted) {
    return;
  }

  try {
    const { mountDevTools } = await import('./mount-dev-tools');
    
    // 从全局对象获取 http 实例和 EPS list（可能已经被其他应用设置）
    const httpInstance = (window as any).__APP_HTTP__;
    const epsList = (window as any).__APP_EPS_LIST__ || [];
    
    // 挂载 DevTools（即使没有 http 和 EPS，DevTools 也能正常工作）
    await mountDevTools({
      httpInstance,
      epsList,
    });
    
    devToolsMounted = true;
    
    // 挂载成功后，清理观察器和定时器
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (checkTimer !== null) {
      clearTimeout(checkTimer);
      checkTimer = null;
    }
  } catch (err) {
    // 静默失败，不影响应用运行
    if (import.meta.env.DEV) {
      console.warn('[DevTools] 自动挂载失败:', err);
    }
  }
}

/**
 * 检查是否有应用已挂载
 */
function checkAppMounted() {
  // 检查常见的应用容器
  const containers = [
    document.querySelector('#app'),
    document.querySelector('#layout-container'),
    document.querySelector('#subapp-viewport'),
  ];
  
  // 如果任何一个容器有内容，说明应用已挂载
  for (const container of containers) {
    if (container && container.children.length > 0) {
      return true;
    }
  }
  
  return false;
}

/**
 * 设置自动挂载 DevTools
 * 通过监听 DOM 变化和定时检查，在应用挂载后自动挂载 DevTools
 */
export function setupAutoMountDevTools() {
  // 只在浏览器环境中执行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // 检查是否已经设置过
  if ((window as any).__DEVTOOLS_AUTO_MOUNT_SETUP__) {
    return;
  }

  // 标记已设置
  (window as any).__DEVTOOLS_AUTO_MOUNT_SETUP__ = true;

  // 立即尝试挂载（如果应用已经挂载）
  if (checkAppMounted()) {
    mountDevToolsOnce().catch(() => {
      // 静默失败
    });
    return;
  }

  // 使用 MutationObserver 监听 DOM 变化
  observer = new MutationObserver(() => {
    if (checkAppMounted()) {
      mountDevToolsOnce().catch(() => {
        // 静默失败
      });
    }
  });

  // 获取有效的观察目标节点
  function getTargetNode(): Node | null {
    // 优先使用 body，如果 body 不存在则使用 documentElement
    const body = document.body;
    const docElement = document.documentElement;
    
    // 严格检查：确保是有效的 Node 实例且是元素节点
    if (body && body instanceof Node && body.nodeType === Node.ELEMENT_NODE) {
      return body;
    }
    if (docElement && docElement instanceof Node && docElement.nodeType === Node.ELEMENT_NODE) {
      return docElement;
    }
    
    return null;
  }

  // 尝试设置观察器
  function tryObserve() {
    const targetNode = getTargetNode();
    if (targetNode && observer) {
      try {
        observer.observe(targetNode, {
          childList: true,
          subtree: true,
        });
      } catch (error) {
        // 如果观察失败，静默处理，使用定时器作为兜底
        // 生产环境也静默处理，避免影响应用运行
        observer = null;
      }
    }
  }

  // 如果 DOM 已经就绪，立即尝试观察
  if (document.readyState === 'loading') {
    // DOM 还未加载完成，等待 DOMContentLoaded 事件
    document.addEventListener('DOMContentLoaded', tryObserve, { once: true });
  } else {
    // DOM 已经就绪，立即尝试观察
    tryObserve();
  }

  // 同时使用定时器作为兜底机制（每 500ms 检查一次，最多检查 10 秒）
  let checkCount = 0;
  const maxChecks = 20; // 10 秒 = 20 * 500ms

  checkTimer = window.setTimeout(function check() {
    checkCount++;
    
    if (checkAppMounted()) {
      mountDevToolsOnce().catch(() => {
        // 静默失败
      });
      return;
    }
    
    if (checkCount < maxChecks) {
      checkTimer = window.setTimeout(check, 500);
    } else {
      // 超时后，如果还没有挂载，尝试直接挂载（可能应用使用了非标准的挂载方式）
      mountDevToolsOnce().catch(() => {
        // 静默失败
      });
    }
  }, 500);
}

/**
 * 兼容性：保留原有的 autoMountDevTools 函数
 */
export async function autoMountDevTools() {
  await mountDevToolsOnce();
}
