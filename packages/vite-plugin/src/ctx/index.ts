import type { Plugin } from 'vite';

/**
 * 上下文插件（自动扫描模块）
 * 功能：
 * 1. 扫描 src/modules/ 目录
 * 2. 生成模块列表
 * 3. 生成路由配置
 * 4. 生成菜单配置
 * 5. 支持虚拟模块 virtual:ctx
 *
 * TODO: 在文档 46-module-config 实施
 */
export function ctxPlugin(): Plugin {
  return {
    name: 'vite-plugin-ctx',
    // 待实现
  };
}
