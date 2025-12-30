/**
 * 全局根级 Loading 服务
 * 管理覆盖整个浏览器视口的最高级 loading，所有内容之上，唯一实例
 */

import { LOADING_Z_INDEX, LOADING_TIMEOUT, getMaskBackground, getTextColor, getSpinnerColor, isDarkMode } from '../loading.config';

/**
 * 全局根级 Loading 服务
 * 单例模式，确保全局唯一实例
 */
class RootLoadingService {
  private instance: HTMLElement | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isVisible = false;
  private showTime: number = 0;

  /**
   * 获取或创建 Loading 元素
   */
  private getOrCreateElement(): HTMLElement {
    if (this.instance) {
      return this.instance;
    }

    // 检查是否已存在 #Loading 元素
    let loadingEl = document.getElementById('Loading');
    if (!loadingEl) {
      // 创建 Loading 元素
      loadingEl = document.createElement('div');
      loadingEl.id = 'Loading';
      document.body.appendChild(loadingEl);
    }

    // 设置基础样式
    this.updateStyles(loadingEl);
    this.instance = loadingEl;
    return loadingEl;
  }

  /**
   * 更新 Loading 元素样式
   */
  private updateStyles(element: HTMLElement): void {
    const isDark = isDarkMode();
    const maskBg = getMaskBackground(isDark);
    const textColor = getTextColor(isDark);
    const spinnerColor = getSpinnerColor(isDark);

    // 基础样式
    element.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: ${LOADING_Z_INDEX.ROOT};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: ${maskBg};
      transition: opacity 0.3s ease-in;
      opacity: 1;
      pointer-events: auto;
    `;

    // 如果元素内容为空，创建默认内容
    if (!element.innerHTML.trim()) {
      element.innerHTML = `
        <div class="root-loading-container" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        ">
          <div class="root-loading-spinner" style="
            width: 50px;
            height: 50px;
            border: 4px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-top-color: ${spinnerColor};
            border-radius: 50%;
            animation: root-loading-spin 1s linear infinite;
          "></div>
          <div class="root-loading-text" style="
            color: ${textColor};
            font-size: 14px;
            font-weight: 500;
          "></div>
        </div>
      `;

      // 添加旋转动画
      if (!document.getElementById('root-loading-style')) {
        const style = document.createElement('style');
        style.id = 'root-loading-style';
        style.textContent = `
          @keyframes root-loading-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  /**
   * 显示全局根级 Loading
   * @param text 提示文字（可选）
   */
  show(text?: string): void {
    const loadingEl = this.getOrCreateElement();
    
    // 更新文字
    if (text) {
      const textEl = loadingEl.querySelector('.root-loading-text') as HTMLElement;
      if (textEl) {
        textEl.textContent = text;
      }
    }

    // 记录显示时间戳
    this.showTime = Date.now();
    
    // 显示
    loadingEl.style.setProperty('display', 'flex', 'important');
    loadingEl.style.setProperty('visibility', 'visible', 'important');
    loadingEl.style.setProperty('opacity', '1', 'important');
    loadingEl.style.setProperty('pointer-events', 'auto', 'important');
    loadingEl.classList.remove('is-hide');
    this.isVisible = true;

    // 清除之前的超时定时器
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // 设置超时关闭（10秒）
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, LOADING_TIMEOUT.ROOT);
  }

  /**
   * 隐藏全局根级 Loading
   */
  hide(): void {
    // 如果实例不存在，尝试通过 DOM 直接查找并关闭 #Loading 元素（兜底方案）
    if (!this.instance) {
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        loadingEl.style.setProperty('display', 'none', 'important');
        loadingEl.style.setProperty('visibility', 'hidden', 'important');
        loadingEl.style.setProperty('opacity', '0', 'important');
        loadingEl.style.setProperty('pointer-events', 'none', 'important');
        loadingEl.classList.add('is-hide');
      }
      this.isVisible = false;
      return;
    }

    if (!this.isVisible) {
      return;
    }

    // 清除超时定时器
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // 强制隐藏（立即生效）
    this.instance.style.setProperty('display', 'none', 'important');
    this.instance.style.setProperty('visibility', 'hidden', 'important');
    this.instance.style.setProperty('opacity', '0', 'important');
    this.instance.style.setProperty('pointer-events', 'none', 'important');
    this.instance.classList.add('is-hide');
    this.isVisible = false;
    this.showTime = 0;
  }

  /**
   * 更新提示文字
   * @param text 新的提示文字
   */
  updateText(text: string): void {
    if (!this.instance) {
      return;
    }

    const textEl = this.instance.querySelector('.root-loading-text') as HTMLElement;
    if (textEl) {
      textEl.textContent = text;
    }
  }

  /**
   * 销毁实例（清理）
   */
  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.instance && this.instance.parentNode) {
      this.instance.parentNode.removeChild(this.instance);
    }

    this.instance = null;
    this.isVisible = false;
  }
}

// 导出单例实例
export const rootLoadingService = new RootLoadingService();

