/**
 * ViewGroup 右键菜单 Hook
 */

import type { ViewGroupOptions, ViewGroupItem } from '../types';
import { BtcMessage } from '@btc/shared-components';

export function useViewGroupMenu(config: ViewGroupOptions, tree: any) {
  // 右键菜单（列表项）
  function onContextMenu(e: MouseEvent, item: ViewGroupItem) {
    if (!config.enableContextMenu) {
      return false;
    }

    e.preventDefault();

    // 如果有自定义右键菜单回调，使用它
    if (config.onContextMenu) {
      config.onContextMenu(item);
      return;
    }

    // 否则显示默认菜单
    showDefaultContextMenu(item);
  }

  // 右键菜单（树节点）
  function onTreeContextMenu(e: MouseEvent, data: any) {
    if (!config.enableContextMenu) {
      return false;
    }

    e.preventDefault();
    e.stopPropagation();

    // 如果有自定义右键菜单回调，使用它
    if (config.onContextMenu) {
      config.onContextMenu(data);
      return;
    }

    // 否则显示默认菜单
    showDefaultContextMenu(data);
  }

  // 显示默认右键菜单（简化版）
  function showDefaultContextMenu(item: ViewGroupItem) {
    // 这里可以集成 Element Plus 的 Popover 或第三方上下文菜单组件
    console.log('Context menu for:', item);

    // 临时使用原生菜单提示
    const actions = [];
    if (config.enableEdit !== false) actions.push('编辑');
    if (config.enableDelete !== false) actions.push('删除');
    if (tree.visible) actions.push('添加子项');

    BtcMessage.info(`右键菜单: ${actions.join(', ')}`);
  }

  return {
    onContextMenu,
    onTreeContextMenu,
  };
}
