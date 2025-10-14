import type { Plugin } from '@btc/shared-core';

/**
 * 全局顶栏插件
 * 用于 qiankun 主应用的公共顶栏
 */
export const globalHeaderPlugin: Plugin = {
  name: 'global-header',
  version: '1.0.0',
  description: 'qiankun 主应用全局顶栏',
  author: 'BTC Team',
  updateTime: '2024-10-11',
  enable: true,
  order: 100, // 高优先级，最先加载

  // 自动注册组件
  components: [
    () => import('./components/GlobalHeader.vue'),
    () => import('./components/UserMenu.vue'),
  ],

  // 布局注入配置（注入到顶部）
  layout: {
    position: 'header',
    order: 1,
    component: () => import('./components/GlobalHeader.vue'),
  },

  // qiankun 微前端配置
  qiankun: {
    shared: true, // 共享给子应用
    globalState: {
      headerHeight: 60, // 顶栏高度
    },
    exposeApi: ['updateUserInfo', 'setNotification'],
  },

  // 静态资源配置
  static: {
    svgDir: './static/svg',
  },

  // 插件配置参数
  options: {
    showLogo: true,
    showSearch: false,
    showNotification: true,
  },

  // API 导出（供外部调用）
  api: {
    /**
     * 更新用户信息
     */
    updateUserInfo(userInfo: any) {
      console.log('[GlobalHeader] 更新用户信息:', userInfo);
      // 实现更新逻辑
    },

    /**
     * 设置通知数量
     */
    setNotification(count: number) {
      console.log('[GlobalHeader] 设置通知数量:', count);
      // 实现设置逻辑
    },

    /**
     * 获取顶栏高度
     */
    getHeaderHeight(): number {
      return 60;
    },
  },

  // 生命周期钩子
  async onLoad(events) {
    console.log('[GlobalHeader] 插件加载完成');
    console.log('[GlobalHeader] 接收到的生命周期事件:', events);

    // 可以使用其他插件导出的方法
    // 例如：events.hasToken(() => { ... })

    // 导出方法供其他插件使用
    return {
      getHeaderHeight: () => 60,
      isHeaderVisible: () => true,
    };
  },
};

/**
 * 导出给外部使用的方法
 */
export function useGlobalHeader() {
  return globalHeaderPlugin.api;
}

