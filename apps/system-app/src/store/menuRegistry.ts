/**
 * 菜单注册表（主应用主导，命名空间化）
 */

import { ref, type Ref } from 'vue';
import type { MenuItem } from '@/micro/menus';
import { appMenus } from '@/micro/menus';
import { assignIconsToMenuTree } from '@btc/shared-core';

export type { MenuItem };

// 递归映射所有层级的 title 到 labelKey
function mapTitleToLabelKey(items: any[]): any[] {
  return items.map(item => ({
    ...item,
    labelKey: item.labelKey || item.title || item.label,
    children: item.children && item.children.length > 0
      ? mapTitleToLabelKey(item.children)
      : undefined,
  }));
}

// 处理管理域菜单，分配图标
function processAdminMenus(): MenuItem[] {
  const adminMenus = appMenus.admin || [];
  if (!adminMenus.length) return [];
  
  // 递归映射所有层级的 title 字段到 labelKey 字段
  const itemsWithLabelKey = mapTitleToLabelKey(adminMenus);
  
  // 使用智能图标分配工具
  const usedIcons = new Set<string>();
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, usedIcons);
  
  // 递归转换函数
  const convertToMenuItem = (item: any): MenuItem => ({
    index: item.index,
    title: item.labelKey ?? item.label ?? item.title ?? item.index,
    icon: item.icon,
    children: item.children && item.children.length > 0
      ? item.children.map(convertToMenuItem)
      : undefined,
  });
  
  return itemsWithIcons.map(convertToMenuItem);
}

// 使用响应式对象存储菜单
const registry: Ref<Record<string, MenuItem[]>> = ref({
  // 管理域自己的菜单（从静态配置初始化，并分配图标）
  admin: processAdminMenus(),
  // 子应用的菜单在进入时注册
  system: [],
  logistics: [],
  engineering: [],
  quality: [],
  production: [],
  finance: [],
  docs: [],
});

/**
 * 注册子应用的菜单
 */
export function registerMenus(app: string, menus: MenuItem[]) {
  registry.value[app] = menus;
}

/**
 * 清理子应用的菜单
 */
export function clearMenus(app: string) {
  if (app !== 'admin' && registry.value[app]) {
    registry.value[app] = [];
  }
}

/**
 * 清理除指定应用外的所有菜单
 */
export function clearMenusExcept(app: string) {
  Object.keys(registry.value).forEach(key => {
    if (key !== 'admin' && key !== app) {
      registry.value[key] = [];
    }
  });
}

/**
 * 获取指定应用的菜单（响应式）
 */
export function getMenusForApp(app: string): MenuItem[] {
  return registry.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  return registry;
}

