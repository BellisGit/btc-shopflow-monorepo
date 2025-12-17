/**
 * 挂载 DevTools 组件的工具函数
 * 供所有应用使用，确保所有应用都能看到开发工具悬浮按钮
 */

import { createApp } from 'vue';
import type { App } from 'vue';

let devToolsApp: App | null = null;
let devToolsContainer: HTMLElement | null = null;

/**
 * 挂载 DevTools 组件
 * @param httpInstance - HTTP 实例（可选），用于 API 切换功能
 * @param epsList - EPS 列表（可选），用于 EPS 查看功能
 */
export async function mountDevTools(options?: {
  httpInstance?: any;
  epsList?: any[];
}) {
  console.log('[DevTools] mountDevTools 被调用');

  // 如果已经挂载，不重复挂载
  if (devToolsApp && devToolsContainer) {
    console.log('[DevTools] 已挂载，跳过');
    return;
  }

  try {
    console.log('[DevTools] 开始动态导入 BtcDevTools 组件...');
    // 动态导入 DevTools 组件
    const { BtcDevTools } = await import('../index');
    console.log('[DevTools] BtcDevTools 组件导入成功');

    // 暴露 http 实例到全局，供 DevTools 使用
    if (options?.httpInstance && typeof (window as any).__APP_HTTP__ === 'undefined') {
      (window as any).__APP_HTTP__ = options.httpInstance;
      console.log('[DevTools] 已设置 __APP_HTTP__');
    }

    // 暴露 EPS list 到全局，供 DevTools 使用
    if (options?.epsList && typeof (window as any).__APP_EPS_LIST__ === 'undefined') {
      (window as any).__APP_EPS_LIST__ = options.epsList;
      console.log('[DevTools] 已设置 __APP_EPS_LIST__, 长度:', options.epsList.length);
    }

    // 创建 DevTools 应用实例
    console.log('[DevTools] 创建 Vue 应用实例...');
    devToolsApp = createApp(BtcDevTools);
    devToolsContainer = document.createElement('div');
    document.body.appendChild(devToolsContainer);
    console.log('[DevTools] 挂载到 DOM...');
    devToolsApp.mount(devToolsContainer);
    console.log('[DevTools] 挂载完成');
  } catch (err) {
    console.error('[DevTools] 挂载失败:', err);
  }
}

/**
 * 卸载 DevTools 组件
 */
export function unmountDevTools() {
  if (devToolsApp && devToolsContainer) {
    try {
      devToolsApp.unmount();
      if (devToolsContainer.parentNode) {
        devToolsContainer.parentNode.removeChild(devToolsContainer);
      }
      devToolsApp = null;
      devToolsContainer = null;
    } catch (err) {
      console.warn('[DevTools] 卸载失败:', err);
    }
  }
}

