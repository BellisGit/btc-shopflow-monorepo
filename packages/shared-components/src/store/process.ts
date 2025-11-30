import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ProcessItem {
  path: string;
  fullPath: string;
  name?: string;
  meta: {
    label?: string;
    labelKey?: string;
    hostLabelKey?: string;
    title?: string;
    breadcrumbs?: any[];
    keepAlive?: boolean;
    isHome?: boolean;
    process?: boolean;
  };
  active?: boolean;
  app?: string; // 添加 app 字段，用于标识标签所属的应用
}

/**
 * 从路径获取当前应用名称
 * 注意：这个函数需要由使用共享布局的应用提供，通过 provide/inject 传递
 * 或者使用全局函数
 */
export function getCurrentAppFromPath(path: string): string {
  // 默认实现：从路径前缀判断
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/logistics')) return 'logistics';
  if (path.startsWith('/engineering')) return 'engineering';
  if (path.startsWith('/quality')) return 'quality';
  if (path.startsWith('/production')) return 'production';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/docs')) return 'docs';
  return 'system';
}

/**
 * 页面标签（Process）Store
 */
export const useProcessStore = defineStore('process', () => {
  const list = ref<ProcessItem[]>([]);
  const pinned = ref<string[]>([]);

  const isPinned = (fullPath: string) => pinned.value.includes(fullPath);

  const reorderTabs = () => {
    if (!list.value.length || !pinned.value.length) return;
    const pinnedSet = new Set(pinned.value);

    const pinnedTabs: ProcessItem[] = [];
    pinned.value.forEach((path) => {
      const tab = list.value.find((item) => item.fullPath === path);
      if (tab) {
        pinnedTabs.push(tab);
      }
    });

    const otherTabs = list.value.filter((tab) => !pinnedSet.has(tab.fullPath));

    list.value = [...pinnedTabs, ...otherTabs];
  };

  const pin = (fullPath: string) => {
    if (!isPinned(fullPath)) {
      pinned.value.push(fullPath);
      reorderTabs();
    }
  };

  const unpin = (fullPath: string) => {
    pinned.value = pinned.value.filter((path) => path !== fullPath);
    reorderTabs();
  };

  const togglePin = (fullPath: string) => {
    if (isPinned(fullPath)) {
      unpin(fullPath);
    } else {
      pin(fullPath);
    }
  };

  const findIndex = (predicate: (tab: ProcessItem) => boolean) =>
    list.value.findIndex(predicate);

  const removeByFullPaths = (paths: Set<string>) => {
    if (!paths.size) return false;
    let changed = false;
    list.value = list.value.filter((tab) => {
      if (paths.has(tab.fullPath)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (!changed) return false;
    if (paths.size) {
      pinned.value = pinned.value.filter((path) => !paths.has(path));
    }
    reorderTabs();
    return true;
  };

  const collectPaths = (tabs: ProcessItem[], app?: string, exclude?: Set<string>) => {
    const result = new Set<string>();
    tabs.forEach((tab) => {
      if (app && tab.app !== app) return;
      if (isPinned(tab.fullPath)) return;
      if (exclude && exclude.has(tab.fullPath)) return;
      result.add(tab.fullPath);
    });
    return result;
  };

  const closeLeft = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex <= 0) return false;
    const leftTabs = list.value.slice(0, targetIndex);
    const paths = collectPaths(leftTabs, app);
    return removeByFullPaths(paths);
  };

  const closeRight = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex === -1) return false;
    const rightTabs = list.value.slice(targetIndex + 1);
    const paths = collectPaths(rightTabs, app);
    return removeByFullPaths(paths);
  };

  const closeOthers = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex === -1) return false;
    const exclude = new Set<string>([fullPath]);
    const otherTabs = list.value.filter((tab) => tab.fullPath !== fullPath);
    const paths = collectPaths(otherTabs, app, exclude);
    return removeByFullPaths(paths);
  };

  const closeAll = (app: string) => {
    const appTabs = list.value.filter((tab) => tab.app === app);
    const paths = collectPaths(appTabs, app);
    return removeByFullPaths(paths);
  };

  const syncPinned = () => {
    const exists = new Set(list.value.map((tab) => tab.fullPath));
    pinned.value = pinned.value.filter((path) => exists.has(path));
    reorderTabs();
  };

  /**
   * 添加标签
   */
  function add(data: ProcessItem) {
    // 将所有标签设为非激活状态
    list.value.forEach((e) => {
      e.active = false;
    });

    if (!data.meta) {
      data.meta = {};
    }

    // 如果不是首页且允许显示标签
    if (!data.meta?.isHome && data.meta?.process !== false) {
      const index = list.value.findIndex((e) => e.path === data.path);

      if (index < 0) {
        // 添加新标签
        list.value.push({
          ...data,
          active: true,
        });
      } else {
        // 激活已存在的标签
        list.value[index] = {
          ...list.value[index],
          ...data,
          active: true,
        };
      }
    }
  }

  /**
   * 关闭当前标签
   */
  function close() {
    const index = list.value.findIndex((e) => e.active);

    if (index > -1) {
      list.value.splice(index, 1);
    }
  }

  /**
   * 移除指定标签
   */
  function remove(index: number) {
    list.value.splice(index, 1);
  }

  /**
   * 设置标签列表
   */
  function set(data: ProcessItem[]) {
    list.value = data;
  }

  /**
   * 清空所有标签
   */
  function clear() {
    list.value = [];
  }

  /**
   * 设置标题
   */
  function setTitle(title: string) {
    const item = list.value.find((e) => e.active);

    if (item) {
      item.meta.label = title;
    }
  }

  return {
    list,
    add,
    remove,
    close,
    set,
    clear,
    setTitle,
    isPinned,
    togglePin,
    closeLeft,
    closeRight,
    closeOthers,
    closeAll,
    syncPinned,
  };
});

