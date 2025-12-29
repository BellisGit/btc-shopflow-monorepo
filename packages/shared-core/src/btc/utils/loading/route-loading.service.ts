/**
 * 路由级 Loading 服务
 * 管理覆盖单个页面/路由视图区域的 loading，自动在路由切换时显示
 */

import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../loading.config';
import { appLoadingService } from './app-loading.service';

/**
 * 路由 Loading 实例信息
 */
interface RouteLoadingInstance {
  container: HTMLElement | null;
  loadingElement: HTMLElement | null;
  skeletonElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
}

/**
 * 路由级 Loading 服务
 * 单例模式，管理路由级别的 loading
 */
class RouteLoadingService {
  private instance: RouteLoadingInstance = {
    container: null,
    loadingElement: null,
    skeletonElement: null,
    timeoutId: null,
    isVisible: false,
  };

  /**
   * 查找路由视图容器
   */
  private findContainer(): HTMLElement | null {
    // 默认查找 router-view
    return document.querySelector('router-view') as HTMLElement ||
           document.querySelector('[data-router-view]') as HTMLElement ||
           document.querySelector('.router-view-container') as HTMLElement;
  }

  /**
   * 创建 Loading 元素
   */
  private createLoadingElement(container: HTMLElement): HTMLElement {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'route-loading';
    loadingEl.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: ${LOADING_Z_INDEX.ROUTE};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--el-bg-color);
      opacity: 1;
      pointer-events: auto;
      min-height: 200px;
    `;

    loadingEl.innerHTML = `
      <div class="route-loading-spinner" style="
        width: 32px;
        height: 32px;
        border: 3px solid var(--el-border-color-lighter);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: route-loading-spin 1s linear infinite;
      "></div>
    `;

    // 添加旋转动画（如果不存在）
    if (!document.getElementById('route-loading-style')) {
      const style = document.createElement('style');
      style.id = 'route-loading-style';
      style.textContent = `
        @keyframes route-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return loadingEl;
  }

  /**
   * 查找骨架屏元素
   */
  private findSkeleton(container: HTMLElement): HTMLElement | null {
    return container.querySelector('.route-skeleton, [data-route-skeleton]') as HTMLElement;
  }

  /**
   * 检查是否有应用级别loading正在显示
   */
  private isAppLoadingVisible(): boolean {
    try {
      // 优先使用appLoadingService的isAnyVisible方法（更可靠）
      if (appLoadingService && typeof appLoadingService.isAnyVisible === 'function') {
        return appLoadingService.isAnyVisible();
      }
    } catch (e) {
      // 如果调用失败，回退到DOM查询
    }
    
    // 回退方案：通过DOM查询检查
    try {
      // 检查body中是否有.app-loading元素（因为应用级别loading使用fixed定位，添加到body）
      const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
      if (!appLoadingEl) {
        return false;
      }
      
      const style = window.getComputedStyle(appLoadingEl);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             parseFloat(style.opacity) > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * 显示路由 Loading
   */
  show(): void {
    // 如果已经显示，先隐藏
    if (this.instance.isVisible) {
      this.hide();
    }

    // 检查是否有应用级别loading正在显示，如果有则不显示路由loading（互斥原则）
    if (this.isAppLoadingVisible()) {
      return;
    }

    // 查找容器
    const container = this.findContainer();
    if (!container) {
      console.warn('[RouteLoadingService] 无法找到路由视图容器');
      return;
    }

    this.instance.container = container;

    // 确保容器是相对定位
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.position === 'static') {
      container.style.position = 'relative';
    }

    // 优先使用骨架屏
    const skeleton = this.findSkeleton(container);
    if (skeleton) {
      this.instance.skeletonElement = skeleton;
      skeleton.style.setProperty('display', 'block', 'important');
      skeleton.style.setProperty('visibility', 'visible', 'important');
      skeleton.style.setProperty('opacity', '1', 'important');
      this.instance.isVisible = true;
    } else {
      // 如果没有骨架屏，使用 loading 元素
      if (!this.instance.loadingElement) {
        this.instance.loadingElement = this.createLoadingElement(container);
        container.appendChild(this.instance.loadingElement);
      } else {
        // 如果loading元素已存在但不在容器中，重新添加到容器
        if (!container.contains(this.instance.loadingElement)) {
          container.appendChild(this.instance.loadingElement);
        }
      }
      
      this.instance.loadingElement.style.setProperty('display', 'flex', 'important');
      this.instance.loadingElement.style.setProperty('visibility', 'visible', 'important');
      this.instance.loadingElement.style.setProperty('opacity', '1', 'important');
      this.instance.isVisible = true;
    }

    // 清除之前的超时定时器
    if (this.instance.timeoutId) {
      clearTimeout(this.instance.timeoutId);
      this.instance.timeoutId = null;
    }

    // 设置超时关闭（5秒）
    this.instance.timeoutId = setTimeout(() => {
      console.warn('[RouteLoadingService] 路由 loading 超时自动关闭（5秒）');
      this.hide();
    }, LOADING_TIMEOUT.ROUTE);
  }

  /**
   * 隐藏路由 Loading
   */
  hide(): void {
    if (!this.instance.isVisible) {
      return;
    }

    // 清除超时定时器
    if (this.instance.timeoutId) {
      clearTimeout(this.instance.timeoutId);
      this.instance.timeoutId = null;
    }

    // 隐藏骨架屏
    if (this.instance.skeletonElement) {
      this.instance.skeletonElement.style.setProperty('opacity', '0', 'important');
      setTimeout(() => {
        if (this.instance.skeletonElement) {
          this.instance.skeletonElement.style.setProperty('display', 'none', 'important');
          this.instance.skeletonElement.style.setProperty('visibility', 'hidden', 'important');
        }
      }, 300);
    }

    // 隐藏 loading 元素
    if (this.instance.loadingElement) {
      this.instance.loadingElement.style.setProperty('opacity', '0', 'important');
      this.instance.loadingElement.style.setProperty('pointer-events', 'none', 'important');
      
      // 延迟移除 DOM 元素（确保动画完成）
      setTimeout(() => {
        if (this.instance.loadingElement && this.instance.loadingElement.parentNode) {
          this.instance.loadingElement.parentNode.removeChild(this.instance.loadingElement);
        }
        this.instance.loadingElement = null;
      }, 300);
    }

    this.instance.isVisible = false;
  }

  /**
   * 检查是否正在显示
   */
  isVisible(): boolean {
    return this.instance.isVisible;
  }
}

// 导出单例实例
export const routeLoadingService = new RouteLoadingService();

