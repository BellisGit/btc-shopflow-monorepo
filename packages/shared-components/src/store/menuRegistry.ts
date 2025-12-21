/**
 * 菜单注册表（主应用主导，命名空间化）
 *
 * 关键：在微前端环境中，layout-app 和子应用是不同的构建产物，
 * 它们各自有独立的菜单注册表实例。为了确保菜单能够正确共享，
 * 需要通过全局对象（window）共享同一个注册表实例。
 */

import { ref, triggerRef, type Ref } from 'vue';
// import { assignIconsToMenuTree } from '@btc/shared-core'; // 未使用

// 定义类型，避免直接导入
export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
};

// 全局菜单注册表的键名
const GLOBAL_REGISTRY_KEY = '__BTC_MENU_REGISTRY__';

// 获取或创建全局菜单注册表
function getGlobalRegistry(): Ref<Record<string, MenuItem[]>> {
  if (typeof window !== 'undefined') {
    // 如果全局对象中已存在注册表，直接使用
    if ((window as any)[GLOBAL_REGISTRY_KEY]) {
      const existingRegistry = (window as any)[GLOBAL_REGISTRY_KEY];
      return existingRegistry;
    }

    // 创建新的注册表并挂载到全局对象
    const registry: Ref<Record<string, MenuItem[]>> = ref({
      // 所有应用的菜单在进入时通过 manifest 注册
      admin: [],
      system: [],
      logistics: [],
      engineering: [],
      quality: [],
      production: [],
      finance: [],
      docs: [],
      operations: [],
    });

    (window as any)[GLOBAL_REGISTRY_KEY] = registry;
    return registry;
  }

  // SSR 环境或非浏览器环境，创建本地注册表
  return ref({
    admin: [],
    system: [],
    logistics: [],
    engineering: [],
    quality: [],
    production: [],
    finance: [],
    docs: [],
    operations: [],
  });
}

// 使用全局共享的菜单注册表
// 关键：每次都从全局对象获取，确保所有模块使用同一个注册表实例
function getRegistry(): Ref<Record<string, MenuItem[]>> {
  // 关键：每次都从全局对象获取，而不是使用模块级缓存
  // 这样可以确保 layout-app 和子应用使用同一个注册表实例
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_REGISTRY_KEY]) {
    return (window as any)[GLOBAL_REGISTRY_KEY];
  }
  // 如果全局不存在，创建新的并挂载到全局
  return getGlobalRegistry();
}

/**
 * 深度比较两个菜单数组是否相同
 */
function menusEqual(menus1: MenuItem[], menus2: MenuItem[]): boolean {
  if (menus1.length !== menus2.length) {
    return false;
  }

  for (let i = 0; i < menus1.length; i++) {
    const item1 = menus1[i];
    const item2 = menus2[i];

    // 比较所有字段
    if (item1.index !== item2.index ||
        item1.title !== item2.title ||
        item1.icon !== item2.icon ||
        (item1 as any).externalUrl !== (item2 as any).externalUrl) {
      return false;
    }

    // 递归比较子菜单
    if (item1.children && item2.children) {
      if (!menusEqual(item1.children, item2.children)) {
        return false;
      }
    } else if (item1.children || item2.children) {
      return false;
    }
  }

  return true;
}

/**
 * 注册子应用的菜单
 */
export function registerMenus(app: string, menus: MenuItem[]) {
  // 关键：优先使用全局注册表（layout-app 创建的），确保所有模块使用同一个实例
  let reg: Ref<Record<string, MenuItem[]>>;
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_REGISTRY_KEY]) {
    // 使用已存在的全局注册表
    reg = (window as any)[GLOBAL_REGISTRY_KEY];
  } else {
    // 如果全局不存在，获取或创建新的注册表
    reg = getRegistry();
    // 确保挂载到全局
    if (typeof window !== 'undefined') {
      (window as any)[GLOBAL_REGISTRY_KEY] = reg;
    }
  }

  const existingMenus = reg.value[app] || [];

  // 如果菜单内容相同，跳过更新，避免触发不必要的响应式更新
  if (existingMenus.length > 0 && menusEqual(existingMenus, menus)) {
    return;
  }

  // 如果菜单内容不同或现有菜单为空，需要更新
  reg.value[app] = menus;
  // 关键：手动触发响应式更新，确保 Vue 能够检测到全局对象的变化
  triggerRef(reg);
}

/**
 * 清理子应用的菜单
 */
export function clearMenus(app: string) {
  const reg = getRegistry();
  if (reg.value[app]) {
    reg.value[app] = [];
    triggerRef(reg);
  }
}

/**
 * 清理除指定应用外的所有菜单
 */
export function clearMenusExcept(app: string) {
  const reg = getRegistry();
  Object.keys(reg.value).forEach(key => {
    if (key !== app) {
      reg.value[key] = [];
    }
  });
  triggerRef(reg);
}

/**
 * 获取指定应用的菜单（响应式）
 */
export function getMenusForApp(app: string): MenuItem[] {
  const reg = getRegistry();
  return reg.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  return getRegistry();
}

