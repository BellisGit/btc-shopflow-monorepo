import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import 'virtual:uno.css';
// Element Plus 样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
// 关键：直接导入确保构建时被正确打包，避免代码分割导致的路径问题
import '@btc/shared-components/styles/dark-theme.css';
// 应用全局样式（global.scss 中已通过 @use 导入共享组件样式）
// 注意：共享组件样式在 global.scss 中使用 @use 导入，确保构建时被正确合并
import './styles/global.scss';
import './styles/theme.scss';
import './styles/nprogress.scss';
import './styles/menu-themes.scss';
import type { QiankunProps } from '@btc/shared-core';
import {
  createAdminApp,
  mountAdminApp,
  unmountAdminApp,
  updateAdminApp,
} from './bootstrap';
import type { AdminAppContext } from './bootstrap';
import { setupSubAppErrorCapture } from '@btc/shared-utils/error-monitor';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';

// 关键：在应用启动时立即设置全局错误监听器，捕获 Vue patch 过程中的 DOM 操作错误
// 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
if (typeof window !== 'undefined') {
  // 使用捕获阶段监听，确保能捕获所有错误（包括 Vue 内部的错误）
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorStack = event.error?.stack || '';
    
    // 检查是否是 DOM 操作相关的错误
    if (
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('processCommentNode') ||
      errorMessage.includes('patch') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('Cannot set properties of null') ||
      errorMessage.includes('reading \'insertBefore\'') ||
      errorMessage.includes('reading \'emitsOptions\'') ||
      errorStack.includes('insertBefore') ||
      errorStack.includes('processCommentNode') ||
      errorStack.includes('patch')
    ) {
      // DOM 操作错误，静默处理，避免影响用户体验
      event.preventDefault();
      event.stopPropagation();
      if (import.meta.env.DEV) {
        console.warn('[admin-app] 全局错误监听器捕获到 DOM 操作错误:', errorMessage);
      }
      return true; // 阻止默认错误处理
    }
    return false; // 其他错误继续正常处理
  }, true); // 使用捕获阶段
}

let context: AdminAppContext | null = null;

const render = async (props: QiankunProps = {}) => {
  try {
    if (context) {
      await unmountAdminApp(context);
      context = null;
    }

    context = createAdminApp(props);
    await mountAdminApp(context, props);
    
    // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
    removeLoadingElement();
    clearNavigationFlag();
  } catch (error) {
    console.error('[admin-app] 渲染失败:', error);
    // 即使挂载失败，也要移除 Loading
    removeLoadingElement();
    clearNavigationFlag();
    throw error;
  }
};

/**
 * 移除 Loading 元素
 */
function removeLoadingElement() {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏（使用内联样式确保优先级）
    loadingEl.style.setProperty('display', 'none', 'important');
    loadingEl.style.setProperty('visibility', 'hidden', 'important');
    loadingEl.style.setProperty('opacity', '0', 'important');
    loadingEl.style.setProperty('pointer-events', 'none', 'important');

    // 添加淡出类（如果 CSS 中有定义）
    loadingEl.classList.add('is-hide');

    // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          // 如果 parentNode 为 null 但元素仍在 DOM 中，直接移除
          loadingEl.remove();
        }
      } catch (error) {
        // 如果移除失败，至少确保元素被隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
      }
    }, 350);
  }
}

/**
 * 清理导航标记
 */
function clearNavigationFlag() {
  try {
    sessionStorage.removeItem('__BTC_NAV_LOADING__');
  } catch (e) {
    // 静默失败（某些浏览器可能禁用 sessionStorage）
  }
}

// qiankun 生命周期钩子（标准 ES 模块导出格式）
// bootstrap 必须是轻量级的，直接返回 resolved Promise，确保最快速度
function bootstrap() {
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // 生产环境且非 layout-app：先加载共享资源
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    try {
      await loadSharedResourcesFromLayoutApp({
        onProgress: (loaded, total) => {
          if (import.meta.env.DEV) {
            console.log(`[admin-app] 加载共享资源进度: ${loaded}/${total}`);
          }
        },
      });
    } catch (error) {
      console.warn('[admin-app] 加载共享资源失败，继续使用本地资源:', error);
      // 继续执行，使用本地打包的资源作为降级方案
    }
  }

  // 设置子应用错误捕获（如果主应用传递了错误上报方法）
  // 关键：使用 try-catch 确保错误捕获设置失败不会阻塞应用挂载
  try {
    if (props.appName && typeof props.appName === 'string') {
      setupSubAppErrorCapture({
        updateErrorList: typeof props.updateErrorList === 'function'
          ? (props.updateErrorList as (errorInfo: any) => void | Promise<void>)
          : undefined,
        appName: props.appName,
      });
    }
  } catch (error) {
    // 错误捕获设置失败不影响应用运行，只记录警告
    console.warn('[admin-app] 设置错误捕获失败:', error);
  }

  await render(props);
}

async function unmount(props: QiankunProps = {}) {
  if (context) {
    await unmountAdminApp(context, props);
    context = null;
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
renderWithQiankun({
  bootstrap,
  mount,
  async update(props: QiankunProps) {
    if (context) {
      updateAdminApp(context, props);
    }
  },
  unmount,
});

// 导出 timeouts 配置，供 single-spa 使用
// 注意：qiankun 封装后，优先读取主应用 start 中的 lifeCycles 配置
// 这里的配置作为 fallback，主应用配置为准
// 关键：增加生产环境的超时时间，避免网络延迟和资源加载导致的超时
// 注意：使用 import.meta.env.PROD 而不是 !import.meta.env.DEV，确保生产环境构建时正确识别
const isProd = import.meta.env.PROD;
export const timeouts = {
  bootstrap: {
    millis: isProd ? 20000 : 8000, // 生产环境 20 秒，开发环境 8 秒（考虑网络延迟和资源加载）
    dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
    warningMillis: isProd ? 15000 : 4000, // 警告时间：生产环境 15 秒，开发环境 4 秒（避免过早警告）
  },
  mount: {
    millis: isProd ? 15000 : 8000, // 生产环境 15 秒，开发环境 8 秒
    dieOnTimeout: false, // 超时后不终止应用，只警告
    warningMillis: isProd ? 12000 : 4000, // 警告时间：生产环境 12 秒，开发环境 4 秒
  },
  unmount: {
    millis: 5000, // 增加到 5 秒，确保卸载完成
    dieOnTimeout: false,
    warningMillis: 4000,
  },
};

// 标准 ES 模块导出（qiankun 需要）
// 关键：将 timeouts 也添加到 default 导出中，确保 single-spa 能够读取
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
// 注意：与 logistics-app 保持一致，使用 shouldRunStandalone 检查
const shouldRunStandalone = () =>
  !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

if (shouldRunStandalone()) {
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 需要加载 layout-app，先初始化，等待完成后再决定是否渲染
    import('./utils/init-layout-app').then(({ initLayoutApp }) => {
      initLayoutApp()
        .then(() => {
          // layout-app 加载成功，检查是否需要独立渲染
          if ((window as any).__USE_LAYOUT_APP__) {
            // 关键：layout-app 已加载，子应用应该主动挂载到 layout-app 的 #subapp-viewport
            // 而不是等待 layout-app 通过 qiankun 加载（避免二次加载导致 DOM 操作冲突）
            const waitForViewport = (retries = 40): Promise<HTMLElement | null> => {
              return new Promise((resolve) => {
                const viewport = document.querySelector('#subapp-viewport') as HTMLElement | null;
                if (viewport) {
                  resolve(viewport);
                } else if (retries > 0) {
                  setTimeout(() => resolve(waitForViewport(retries - 1)), 50);
                } else {
                  resolve(null);
                }
              });
            };
            
            waitForViewport().then((viewport) => {
              if (viewport) {
                // 挂载到 layout-app 的 #subapp-viewport
                render({ container: viewport } as any).catch((error) => {
                  console.error('[admin-app] 挂载到 layout-app 失败:', error);
                });
              } else {
                console.error('[admin-app] 等待 #subapp-viewport 超时，尝试独立渲染');
                render().catch((error) => {
                  console.error('[admin-app] 独立运行失败:', error);
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              console.error('[admin-app] 独立运行失败:', error);
            });
          }
        })
        .catch((error) => {
          console.error('[admin-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((err) => {
            console.error('[admin-app] 独立运行失败:', err);
          });
        });
    }).catch((error) => {
      console.error('[admin-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((err) => {
        console.error('[admin-app] 独立运行失败:', err);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      console.error('[admin-app] 独立运行失败:', error);
    });
  }
}
