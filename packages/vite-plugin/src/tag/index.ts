import type { Plugin } from 'vite';

/**
 * 名称标签插件
 * 功能：
 * 1. 自动给 Vue 组件添加 name 属性
 * 2. 用于 keep-alive 缓存
 * 3. 方便调试
 *
 * TODO: 在文档 36-layout-tabs 实施
 */
export function tagPlugin(): Plugin {
  return {
    name: 'vite-plugin-tag',
    // 待实现
  };
}
