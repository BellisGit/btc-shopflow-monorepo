import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getActiveApp, resolveTabMeta } from './tabRegistry';

export interface ProcessItem {
  path: string;
  fullPath: string;
  name?: string;
  meta: {
    label?: string;
    keepAlive?: boolean;
    isHome?: boolean;
    process?: boolean;
  };
  active?: boolean;
  app?: string; // 标签所属应用
}

/**
 * 获取当前应用名称（使用统一的 tabRegistry）
 */
export function getCurrentAppFromPath(path: string): string {
  return getActiveApp(path);
}

/**
 * 页面标签（Process）Store
 */
export const useProcessStore = defineStore('process', () => {
  const list = ref<ProcessItem[]>([]); // 所有标签

  /**
   * 添加标签（通过 tabRegistry 解析元数据）
   */
  function add(data: ProcessItem) {
    // 确定标签所属应用
    const app = getCurrentAppFromPath(data.path);

    // 解析 Tab 元数据
    const tabMeta = resolveTabMeta(data.path);

    // 如果解析失败（没有元数据），拒绝添加（防止脏 Tab）
    if (!tabMeta) {
      return;
    }

    // 将所有标签设为非激活状态
    list.value.forEach((e) => {
      e.active = false;
    });

    if (!data.meta) {
      data.meta = {};
    }

    // 如果不是首页且允许显示标签
    if (!data.meta?.isHome && data.meta?.process !== false) {
      // 使用 fullPath 进行更精确的去重
      const index = list.value.findIndex((e) => e.fullPath === data.fullPath);

      if (index < 0) {
        // 添加新标签，使用 tabRegistry 的元数据
        list.value.push({
          ...data,
          active: true,
          app,
          meta: {
            ...data.meta,
            label: tabMeta.i18nKey || tabMeta.title,
          },
        });
      } else {
        // 更新已存在的标签
        list.value[index].active = true;
        list.value[index].meta = {
          ...data.meta,
          label: tabMeta.i18nKey || tabMeta.title,
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
   * 清空当前应用的标签
   */
  function clearCurrentApp(app: string) {
    list.value = list.value.filter(tab => tab.app !== app);
  }

  /**
   * 获取当前应用的标签
   */
  function getAppTabs(app: string) {
    return list.value.filter(tab => tab.app === app);
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
    clearCurrentApp,
    getAppTabs,
    setTitle,
  };
});


