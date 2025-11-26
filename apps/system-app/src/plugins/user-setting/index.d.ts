import type { Plugin } from '@btc/shared-core';
/**
 * 用户设置插件
 */
export declare const userSettingPlugin: Plugin;
export { default as BtcUserSettingDrawer } from './components/preferences-drawer.vue';
// 移除立即导出 composables，避免在模块加载时触发循环依赖
// composables 应该通过动态导入使用
// export * from './composables';
