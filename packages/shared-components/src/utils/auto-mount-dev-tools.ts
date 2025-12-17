/**
 * 自动挂载 DevTools 的辅助函数
 * 通过监听 DOM 变化，在所有应用挂载后自动挂载 DevTools
 * 注意：只在主应用（admin-app/system-app）中启用，子应用不显示 DevTools
 */

let devToolsMounted = false;
let observer: MutationObserver | null = null;
let checkTimer: number | null = null;

/**
 * 简单的 cookie 读取函数
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

/**
 * 检查是否为 moselu 用户（无论主应用还是子应用，无论开发环境还是生产环境，都显示 DevTools）
 */
function isMoseluUser(): boolean {
  try {
    const btcUser = getCookie('btc_user');
    console.log('[DevTools] 检查 moselu 用户 - btc_user cookie:', btcUser ? '存在' : '不存在');
    if (!btcUser) {
      return false;
    }

    // 尝试解码 cookie 值（可能是 URL 编码的）
    let decodedValue: string;
    try {
      decodedValue = decodeURIComponent(btcUser);
    } catch {
      // 如果解码失败，直接使用原值
      decodedValue = btcUser;
    }

    const userInfo = JSON.parse(decodedValue);
    console.log('[DevTools] 解析用户信息:', userInfo);
    // 优先使用 username 字段，不区分大小写
    const userName = (userInfo?.username || userInfo?.name || '').toLowerCase();
    const isMoselu = userName === 'moselu';
    console.log('[DevTools] 用户名:', userName, '是否为 moselu:', isMoselu);

    return isMoselu;
  } catch (error) {
    console.warn('[DevTools] 检查 moselu 用户时出错:', error);
    return false;
  }
}

/**
 * 检查是否为主应用
 */
function isMainApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 开发环境：优先检查开发环境标志，在开发环境下更宽松地判断
  if (import.meta.env.DEV) {
    // 开发环境下，如果 hostname 是本地地址或开发服务器地址，且不是明确的子应用路径，则认为是主应用
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 排除明确的子应用路径
    const isSubAppPath = pathname.startsWith('/logistics') ||
                        pathname.startsWith('/engineering') ||
                        pathname.startsWith('/quality') ||
                        pathname.startsWith('/production') ||
                        pathname.startsWith('/finance') ||
                        pathname.startsWith('/monitor');

    // 开发环境：如果是本地地址或开发服务器地址，且不是子应用路径，则为主应用
    if ((hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('10.80.8.199')) && !isSubAppPath) {
      return true;
    }

    // 开发环境：检查路径（兼容原有逻辑）
    if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/data')) {
      return true;
    }
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // 生产环境：检查是否是主应用的子域名
  if (hostname === 'admin.bellis.com.cn' || hostname === 'bellis.com.cn') {
    // 如果是主域名或 admin 子域名，且路径不是子应用路径，则为主应用
    if (!pathname.startsWith('/logistics') &&
        !pathname.startsWith('/engineering') &&
        !pathname.startsWith('/quality') &&
        !pathname.startsWith('/production') &&
        !pathname.startsWith('/finance') &&
        !pathname.startsWith('/monitor')) {
      return true;
    }
  }

  return false;
}

/**
 * 自动挂载 DevTools（从全局对象获取依赖）
 */
async function mountDevToolsOnce() {
  // 只挂载一次，避免重复挂载
  if (devToolsMounted) {
    console.log('[DevTools] 已挂载，跳过重复挂载');
    return;
  }

  console.log('[DevTools] 开始挂载 DevTools...');

  try {
    const { mountDevTools } = await import('./mount-dev-tools');
    console.log('[DevTools] 已导入 mountDevTools');

    // 从全局对象获取 http 实例和 EPS list（可能已经被其他应用设置）
    const httpInstance = (window as any).__APP_HTTP__;
    const epsList = (window as any).__APP_EPS_LIST__ || [];
    console.log('[DevTools] httpInstance:', httpInstance ? '存在' : '不存在', 'epsList 长度:', epsList.length);

    // 挂载 DevTools（即使没有 http 和 EPS，DevTools 也能正常工作）
    await mountDevTools({
      httpInstance,
      epsList,
    });

    devToolsMounted = true;
    console.log('[DevTools] 挂载成功');

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
    console.error('[DevTools] 自动挂载失败:', err);
  }
}

/**
 * 检查是否有应用已挂载
 */
function checkAppMounted() {
  // 检查常见的应用容器
  const containers = [
    { selector: '#app', element: document.querySelector('#app') },
    { selector: '#layout-container', element: document.querySelector('#layout-container') },
    { selector: '#subapp-viewport', element: document.querySelector('#subapp-viewport') },
  ];

  // 如果任何一个容器有内容，说明应用已挂载
  for (const { selector, element } of containers) {
    if (element && element.children.length > 0) {
      console.log('[DevTools] 检测到应用已挂载，容器:', selector, '子元素数量:', element.children.length);
      return true;
    }
  }

  console.log('[DevTools] 未检测到应用已挂载');
  return false;
}

/**
 * 设置自动挂载 DevTools
 * 通过监听 DOM 变化和定时检查，在应用挂载后自动挂载 DevTools
 * 注意：只在主应用中启用，子应用不显示 DevTools
 */
export function setupAutoMountDevTools() {
  console.log('[DevTools] setupAutoMountDevTools 被调用');

  // 只在浏览器环境中执行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('[DevTools] 非浏览器环境，退出');
    return;
  }

  // 如果是 moselu 用户，无论主应用还是子应用都启用 DevTools
  // 否则只在主应用中启用 DevTools
  const isMoselu = isMoseluUser();
  const isMain = isMainApp();
  const shouldEnable = isMoselu || isMain;
  console.log('[DevTools] isMoseluUser:', isMoselu, 'isMainApp:', isMain, 'shouldEnable:', shouldEnable);

  if (!shouldEnable) {
    console.log('[DevTools] 不满足挂载条件，退出');
    return;
  }

  // 检查是否已经设置过
  if ((window as any).__DEVTOOLS_AUTO_MOUNT_SETUP__) {
    console.log('[DevTools] 已设置过，退出');
    return;
  }

  // 标记已设置
  (window as any).__DEVTOOLS_AUTO_MOUNT_SETUP__ = true;
  console.log('[DevTools] 标记已设置，开始初始化挂载流程');

  // 立即尝试挂载（如果应用已经挂载）
  const appMounted = checkAppMounted();
  console.log('[DevTools] 应用是否已挂载:', appMounted);

  if (appMounted) {
    console.log('[DevTools] 应用已挂载，立即挂载 DevTools');
    mountDevToolsOnce().catch((err) => {
      console.error('[DevTools] 立即挂载失败:', err);
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
