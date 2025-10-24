import { createApp, type App } from 'vue';
import BtcContextMenu from './index.vue';
import type { ContextMenuOptions, MenuInstance } from './types';

// 全局菜单实例
let menuApp: App | null = null;
let menuInstance: any = null;

/**
 * 右键菜单工具类
 */
export class ContextMenu {
  /**
   * 打开右键菜单
   * @param event 鼠标事件
   * @param options 菜单配置选项
   */
  static open(event: MouseEvent, options: ContextMenuOptions): void {
    // 先关闭已存在的菜单
    this.close();

    // 创建新的菜单实例
    const container = document.createElement('div');
    container.className = 'btc-context-menu-container';
    document.body.appendChild(container);

    menuApp = createApp(BtcContextMenu, {
      list: options.list,
      event: event,
      customClass: options.customClass,
      width: options.width,
      maxHeight: options.maxHeight,
      onClose: () => {
        this.close();
      }
    });

    menuInstance = menuApp.mount(container);

    // 手动调用打开方法
    if (menuInstance && typeof menuInstance.open === 'function') {
      menuInstance.open(event, options);
    }
  }

  /**
   * 关闭右键菜单
   */
  static close(): void {
    if (menuInstance && typeof menuInstance.close === 'function') {
      menuInstance.close();
    }

    if (menuApp) {
      menuApp.unmount();
      menuApp = null;
      menuInstance = null;
    }

    // 清理 DOM
    const existingContainer = document.querySelector('.btc-context-menu-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }
  }

  /**
   * 销毁菜单实例
   */
  static destroy(): void {
    this.close();
  }
}

// 导出组件和工具类
export { default as BtcContextMenu } from './index.vue';
export { useContextMenu } from './composables/useContextMenu';
export type * from './types';

// 默认导出工具类
export default ContextMenu;
