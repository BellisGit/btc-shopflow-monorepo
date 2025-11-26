/**
 * 菜单注册表（主应用主导，命名空间化）
 */

import { ref, type Ref } from 'vue';
// 使用动态导入避免循环依赖（micro/index.ts 导入 store/menuRegistry，而 store/menuRegistry 导入 micro/menus）
// import type { MenuItem } from '@/micro/menus';
// import { appMenus } from '@/micro/menus';
import { assignIconsToMenuTree } from '@btc/shared-core';

// 定义类型，避免直接导入
export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
};

// 延迟加载的菜单数据（避免循环依赖）
let cachedAppMenus: any = null;

async function loadAppMenus() {
  if (!cachedAppMenus) {
    const menusModule = await import('@/micro/menus');
    cachedAppMenus = menusModule.appMenus;
  }
  return cachedAppMenus;
}

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

// 处理管理域菜单，分配图标（延迟加载避免循环依赖）
async function processAdminMenus(): Promise<MenuItem[]> {
  const appMenus = await loadAppMenus();
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
  // 管理域自己的菜单（延迟初始化，避免循环依赖）
  admin: [],
  // 子应用的菜单在进入时注册
  system: [],
  logistics: [],
  engineering: [],
  quality: [],
  production: [],
  finance: [],
  docs: [],
});

// 初始化管理域菜单（延迟加载）
let adminMenusInitialized = false;
async function initializeAdminMenus() {
  if (!adminMenusInitialized) {
    adminMenusInitialized = true;
    registry.value.admin = await processAdminMenus();
  }
}

// 在模块加载后立即初始化（使用微任务避免阻塞）
Promise.resolve().then(() => {
  initializeAdminMenus().catch(console.error);
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
  // 如果是 admin 应用且菜单还未初始化，立即初始化（同步等待）
  if (app === 'admin' && !adminMenusInitialized && registry.value.admin.length === 0) {
    // 同步初始化（如果可能）
    initializeAdminMenus().catch(console.error);
  }
  return registry.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  return registry;
}

