/**
 * 应用级 Loading 服务
 * 管理覆盖单个应用容器的 loading，仅遮挡当前应用区域，不影响其他应用
 */

import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../loading.config';

/**
 * 应用 Loading 实例信息
 */
interface AppLoadingInstance {
  appName: string;
  container: HTMLElement;
  loadingElement: HTMLElement | null;
  skeletonElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
  showTime: number; // 显示时间戳
}

type LoadingStyle = 'circle' | 'dots';

/**
 * 获取当前的 Loading 样式（同步版本）
 * 注意：由于是同步函数，无法使用动态导入，所以直接读取 localStorage
 */
function getLoadingStyle(): LoadingStyle {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'circle';
    }
    
    // 直接读取 localStorage 中的 settings（因为这是同步函数）
    // 注意：由于 appStorage.settings 可能存储在 Cookie 中，这里需要同时检查 localStorage 和 Cookie
    try {
      // 尝试读取 localStorage 中的 settings
      const settingsStr = localStorage.getItem('settings');
      
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        
        if (settings.loadingStyle === 'dots') {
          return 'dots';
        }
        if (settings.loadingStyle === 'circle') {
          return 'circle';
        }
      }
      
      // 如果 localStorage 中没有，尝试从 Cookie 读取（如果可用）
      try {
        const cookieSettings = document.cookie
          .split('; ')
          .find(row => row.startsWith('btc_settings='));
        if (cookieSettings) {
          const cookieValue = decodeURIComponent(cookieSettings.split('=')[1]);
          const settings = JSON.parse(cookieValue);
          
          if (settings.loadingStyle === 'dots') {
            return 'dots';
          }
          if (settings.loadingStyle === 'circle') {
            return 'circle';
          }
        }
      } catch (cookieError) {
        // 忽略 Cookie 读取错误
      }
      
    } catch (e) {
      // 忽略解析错误
    }
  } catch (e) {
    // 忽略异常
  }
  return 'circle';
}

/**
 * 应用级 Loading 服务
 * 单例模式，管理多个应用的 loading 实例
 */
class AppLoadingService {
  private instances: Map<string, AppLoadingInstance> = new Map();
  
  constructor() {
    // 监听 loading 样式变化事件
    if (typeof window !== 'undefined') {
      window.addEventListener('loading-style-change', (event: any) => {
        const newStyle = event.detail?.style;
        // 更新所有现有的 loading 元素
        this.instances.forEach((instance) => {
          if (instance.loadingElement && instance.isVisible) {
            this.updateLoadingSpinner(instance.loadingElement, newStyle);
          }
        });
      });
    }
  }

  /**
   * 查找或创建应用的容器元素
   */
  private findContainer(_appName: string, container?: HTMLElement): HTMLElement | null {
    if (container) {
      return container;
    }

    // 优先查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      return viewport;
    }

    // 如果找不到，返回 null（由调用方处理）
    return null;
  }

  /**
   * 更新 Loading spinner 样式
   */
  private updateLoadingSpinner(loadingElement: HTMLElement, style: LoadingStyle): void {
    const spinnerContainer = loadingElement.querySelector('.app-loading-spinner-container');
    if (spinnerContainer) {
      spinnerContainer.innerHTML = this.getSpinnerHTML(style);
    }
  }

  /**
   * 获取 Spinner HTML
   */
  private getSpinnerHTML(style: LoadingStyle): string {
    if (style === 'dots') {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" class="app-loading-dots-svg">
          <g class="app-loading-dots-spinner">
            <circle class="app-loading-dot app-loading-dot-1" cx="22" cy="8" r="5"/>
            <circle class="app-loading-dot app-loading-dot-2" cx="36" cy="22" r="5"/>
            <circle class="app-loading-dot app-loading-dot-3" cx="22" cy="36" r="5"/>
            <circle class="app-loading-dot app-loading-dot-4" cx="8" cy="22" r="5"/>
          </g>
        </svg>
      `;
    }
    // circle 样式（默认）
    return '<div class="app-loading-spinner"></div>';
  }

  /**
   * 创建 Loading 元素
   * @param appDisplayName 应用显示名称（如"财务模块"）
   */
  private createLoadingElement(_container: HTMLElement, appDisplayName: string): HTMLElement {
    const loadingStyle = getLoadingStyle();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'app-loading';
    // 关键：使用 fixed 定位覆盖整个屏幕，确保能覆盖子应用index.html中的#Loading元素
    loadingEl.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: ${LOADING_Z_INDEX.APP};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--el-bg-color);
      opacity: 1;
      pointer-events: auto;
    `;

    loadingEl.innerHTML = `
      <div class="app-loading-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
      ">
        <div class="app-loading-name" style="
          font-size: 30px;
          color: var(--el-text-color-primary, #303133);
          letter-spacing: 5px;
          font-weight: bold;
          margin-bottom: 30px;
          min-height: 50px;
          animation: app-loading-fade-in 0.5s ease-in;
        ">${appDisplayName}</div>
        <div class="app-loading-spinner-container">${this.getSpinnerHTML(loadingStyle)}</div>
        <div class="app-loading-title" style="
          color: var(--el-text-color-regular, #606266);
          font-size: 14px;
          margin: 30px 0 20px 0;
          min-height: 20px;
          animation: app-loading-fade-in 0.5s ease-in;
        ">正在加载资源</div>
        <div class="app-loading-subtitle" style="
          color: var(--el-text-color-secondary, #909399);
          font-size: 12px;
          min-height: 20px;
          animation: app-loading-fade-in 0.5s ease-in;
        ">部分资源可能加载时间较长，请耐心等待</div>
      </div>
    `;

    // 添加样式（如果不存在）
    if (!document.getElementById('app-loading-style')) {
      const style = document.createElement('style');
      style.id = 'app-loading-style';
      style.textContent = `
        .app-loading-spinner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          width: 44px;
        }
        .app-loading-spinner-container .app-loading-spinner {
          height: 44px;
          width: 44px;
          border-radius: 30px;
          border: 7px solid currentColor;
          border-bottom-color: #ffffff;
          position: relative;
          animation:
            app-loading-spin 1s infinite cubic-bezier(0.17, 0.67, 0.83, 0.67),
            app-loading-color-change 2s infinite ease-in;
          transform: rotate(0deg);
          box-sizing: border-box;
          color: #409eff;
        }
        .app-loading-spinner-container .app-loading-spinner::before,
        .app-loading-spinner-container .app-loading-spinner::after {
          content: '';
          display: inline-block;
          position: absolute;
          bottom: -2px;
          height: 7px;
          width: 7px;
          border-radius: 10px;
          background-color: currentColor;
        }
        .app-loading-spinner-container .app-loading-spinner::before {
          left: -1px;
        }
        .app-loading-spinner-container .app-loading-spinner::after {
          right: -1px;
        }
        @keyframes app-loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes app-loading-color-change {
          0% { color: #409eff; }
          25% { color: #67c23a; }
          50% { color: #e6a23c; }
          75% { color: #f56c6c; }
          100% { color: #409eff; }
        }
        @keyframes app-loading-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .app-loading-spinner-container .app-loading-dots-svg {
          color: var(--el-color-primary, #409eff);
        }
        .app-loading-spinner-container .app-loading-dots-spinner {
          transform-origin: 22px 22px;
          animation: app-loading-dots-rotate 1.6s linear infinite;
        }
        .app-loading-spinner-container .app-loading-dot {
          animation:
            app-loading-dots-fade 1.6s infinite,
            app-loading-dots-color-change 3.2s infinite ease-in-out;
        }
        .app-loading-spinner-container .app-loading-dot-1 {
          fill: #409eff;
          animation-delay: 0s, 0s;
        }
        .app-loading-spinner-container .app-loading-dot-2 {
          fill: #67c23a;
          animation-delay: 0.4s, 0.8s;
        }
        .app-loading-spinner-container .app-loading-dot-3 {
          fill: #e6a23c;
          animation-delay: 0.8s, 1.6s;
        }
        .app-loading-spinner-container .app-loading-dot-4 {
          fill: #f56c6c;
          animation-delay: 1.2s, 2.4s;
        }
        @keyframes app-loading-dots-rotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes app-loading-dots-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes app-loading-dots-color-change {
          0% { fill: #409eff; }
          25% { fill: #67c23a; }
          50% { fill: #e6a23c; }
          75% { fill: #f56c6c; }
          100% { fill: #409eff; }
        }
        @media (prefers-color-scheme: dark) {
          .app-loading-name {
            color: var(--el-text-color-primary, #ffffff) !important;
          }
          .app-loading-title {
            color: var(--el-text-color-regular, #ffffff) !important;
          }
          .app-loading-subtitle {
            color: var(--el-text-color-secondary, #ababab) !important;
          }
          .app-loading-spinner-container .app-loading-spinner {
            border-bottom-color: #000000 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return loadingEl;
  }

  /**
   * 查找或创建骨架屏元素
   */
  private findOrCreateSkeleton(container: HTMLElement): HTMLElement | null {
    // 优先查找已存在的骨架屏
    let skeleton = container.querySelector('#app-skeleton') as HTMLElement;
    
    if (!skeleton) {
      // 如果不存在，不自动创建（由组件提供）
      return null;
    }

    return skeleton;
  }

  /**
   * 显示应用级 Loading
   * @param appDisplayName 应用显示名称（如"财务模块"，用于显示在loading中）
   * @param container 应用容器（可选，默认查找 #subapp-viewport，即使不存在也会显示，因为使用fixed定位）
   */
  show(appDisplayName: string, container?: HTMLElement): void {
    // 关键：不允许显示"应用"loading（这是默认值，不应该显示）
    // 如果传入"应用"，说明应用名称还没有确定，不应该显示loading
    if (appDisplayName === '应用') {
      console.warn('[AppLoadingService] 不允许显示"应用"loading，应用名称未确定');
      return;
    }
    
    // 关键：在显示新的loading之前，先清除所有#Loading元素（包括system-app的"拜里斯科技"）
    // 确保不会被子应用的index.html中的loading覆盖，也不会被system-app的loading覆盖
    const loadingEls = document.querySelectorAll('#Loading');
    loadingEls.forEach((loadingEl) => {
      if (loadingEl instanceof HTMLElement) {
        // 特别处理system-app的#Loading（包含"拜里斯科技"），在子应用时应该隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
        loadingEl.style.setProperty('visibility', 'hidden', 'important');
        loadingEl.style.setProperty('opacity', '0', 'important');
        loadingEl.style.setProperty('pointer-events', 'none', 'important');
        loadingEl.style.setProperty('z-index', '-1', 'important');
        loadingEl.classList.add('is-hide');
      }
    });

    
    // 关键：隐藏所有其他应用的loading实例（只显示当前应用的loading）
    // 遍历所有实例，隐藏不是当前应用的loading
    this.instances.forEach((instance, key) => {
      if (key !== appDisplayName && instance.isVisible) {
        this.hide(key);
      }
    });
    
    // 查找容器（如果找不到，使用document.body作为占位符，因为loading使用fixed定位）
    const appContainer = this.findContainer(appDisplayName, container) || document.body;

    // 使用显示名称作为 key（如果同一个应用有不同的显示名称，会创建多个实例，但通常不会发生）
    const instanceKey = appDisplayName;

    // 获取或创建实例
    let instance = this.instances.get(instanceKey);
    if (!instance) {
      instance = {
        appName: appDisplayName,
        container: appContainer,
        loadingElement: null,
        skeletonElement: null,
        timeoutId: null,
        isVisible: false,
        showTime: 0,
      };
      this.instances.set(instanceKey, instance);
    } else {
      // 如果容器已变化，更新容器引用
      if (instance.container !== appContainer) {
        instance.container = appContainer;
      }
    }

    // 清除之前的超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
    }

    // 记录显示时间戳
    const showTime = Date.now();
    instance.showTime = showTime;
    
    // 优先使用骨架屏
    const skeleton = this.findOrCreateSkeleton(instance.container);
    if (skeleton) {
      instance.skeletonElement = skeleton;
      skeleton.style.setProperty('display', 'flex', 'important');
      skeleton.style.setProperty('visibility', 'visible', 'important');
      skeleton.style.setProperty('opacity', '1', 'important');
      instance.isVisible = true;
    } else {
      // 如果没有骨架屏，使用 loading 元素
      if (!instance.loadingElement) {
        instance.loadingElement = this.createLoadingElement(instance.container, appDisplayName);
        // 关键：由于使用fixed定位，应该添加到body而不是container，确保覆盖整个屏幕
        document.body.appendChild(instance.loadingElement);
      } else {
        // 如果loading元素已存在，更新显示名称（如果变化了）
        const nameEl = instance.loadingElement.querySelector('.app-loading-name') as HTMLElement;
        if (nameEl && nameEl.textContent !== appDisplayName) {
          nameEl.textContent = appDisplayName;
        }
        // 确保loading元素在body中（如果不在，移动到body）
        if (instance.loadingElement.parentNode !== document.body) {
          document.body.appendChild(instance.loadingElement);
        }
      }
      
      instance.loadingElement.style.setProperty('display', 'flex', 'important');
      instance.loadingElement.style.setProperty('visibility', 'visible', 'important');
      instance.loadingElement.style.setProperty('opacity', '1', 'important');
      instance.isVisible = true;
    }

    // 设置超时关闭（10秒）
    instance.timeoutId = setTimeout(() => {
      this.hide(appDisplayName);
    }, LOADING_TIMEOUT.APP);
  }

  /**
   * 隐藏指定应用的 Loading
   * @param appDisplayName 应用显示名称（如"财务模块"）
   */
  hide(appDisplayName: string): void {
    const hideTime = Date.now();
    
    const instance = this.instances.get(appDisplayName);
    
    // 如果实例不存在，尝试通过 DOM 直接查找并关闭所有 .app-loading 元素（兜底方案）
    if (!instance) {
      // 查找所有 .app-loading 元素并强制关闭
      const loadingEls = document.querySelectorAll('.app-loading');
      loadingEls.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
          setTimeout(() => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          }, 100);
        }
      });
      return;
    }

    // 如果实例存在但不可见，直接返回（不重复隐藏）
    if (!instance.isVisible) {
      return;
    }

    // 计算持续时间
    const duration = instance.showTime > 0 ? hideTime - instance.showTime : 0;

    // 清除超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
    }

    // 隐藏骨架屏
    if (instance.skeletonElement) {
      instance.skeletonElement.style.setProperty('display', 'none', 'important');
      instance.skeletonElement.style.setProperty('visibility', 'hidden', 'important');
      instance.skeletonElement.style.setProperty('opacity', '0', 'important');
    }

    // 隐藏 loading 元素（强制关闭，确保移除）
    if (instance.loadingElement) {
      instance.loadingElement.style.setProperty('display', 'none', 'important');
      instance.loadingElement.style.setProperty('visibility', 'hidden', 'important');
      instance.loadingElement.style.setProperty('opacity', '0', 'important');
      instance.loadingElement.style.setProperty('pointer-events', 'none', 'important');
      
      // 立即移除 DOM 元素（不等待动画，确保强制关闭）
      try {
        if (instance.loadingElement.parentNode) {
          instance.loadingElement.parentNode.removeChild(instance.loadingElement);
        }
      } catch (e) {
        // 如果移除失败，尝试延迟移除
        setTimeout(() => {
          if (instance.loadingElement && instance.loadingElement.parentNode) {
            try {
              instance.loadingElement.parentNode.removeChild(instance.loadingElement);
            } catch (err) {
              // 忽略移除错误
            }
          }
        }, 100);
      }
      instance.loadingElement = null;
    }

    instance.isVisible = false;
    instance.showTime = 0;
  }

  /**
   * 隐藏所有应用的 Loading
   */
  hideAll(): void {
    for (const appName of this.instances.keys()) {
      this.hide(appName);
    }
  }

  /**
   * 销毁指定应用的实例
   */
  destroy(appName: string): void {
    this.hide(appName);
    this.instances.delete(appName);
  }

  /**
   * 销毁所有实例
   */
  destroyAll(): void {
    this.hideAll();
    this.instances.clear();
  }

  /**
   * 检查是否有任何应用级别loading正在显示
   * 供其他服务（如RouteLoadingService）检查，确保互斥
   */
  isAnyVisible(): boolean {
    for (const instance of this.instances.values()) {
      if (instance.isVisible) {
        return true;
      }
    }
    return false;
  }
}

// 导出单例实例
export const appLoadingService = new AppLoadingService();

