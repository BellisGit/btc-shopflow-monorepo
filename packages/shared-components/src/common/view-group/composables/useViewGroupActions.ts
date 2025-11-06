/**
 * ViewGroup 操作 Hook（选择、编辑、删除等）
 */
// import { nextTick } from 'vue'; // 不再需要
import { ElMessageBox } from 'element-plus';
// import { ElMessage } from 'element-plus'; // 不再直接使用，让响应拦截器统一处理
import { BtcMessage } from '@btc-components/feedback/btc-message';
import type { ViewGroupOptions, ViewGroupItem } from '../types';

export function useViewGroupActions(
  config: ViewGroupOptions,
  tree: any,
  isMobile: any,
  isExpand: any
) {
  // 获取项的 ID（兼容不同的 ID 字段名）
  function getItemId(item: any) {
    if (!item) return undefined;
    return item[tree.props.id] || item.id;
  }

  // 收起、展开
  function expand(value?: boolean) {
    isExpand.value = value === undefined ? !isExpand.value : value;
  }

  // 设置选中值
  function select(data?: ViewGroupItem) {
    if (data) {
      if (isMobile.value) {
        expand(false);
      }

      if (config.onSelect) {
        config.onSelect(data);
      }
    }
  }

  // 编辑
  function edit(item?: ViewGroupItem) {
    console.warn('[btc-view-group] edit function needs to be implemented by parent component');

    if (config.onEdit) {
      config.onEdit(item);
    }
  }

  // 删除
  function remove(item: ViewGroupItem) {
    ElMessageBox.confirm('此操作将会删除选择的数据，是否继续？', '提示', {
      type: 'warning',
    })
      .then(() => {
        function next(params: any) {
          config.service
            .delete(params)
            .then(() => {
              // 删除成功，由 BtcMasterList 自动刷新
              BtcMessage.success('删除成功');
            })
            .catch((err: Error) => {
              // 不在这里显示错误消息，让响应拦截器统一处理
              console.error('Delete failed:', err);
            });
        }

        function done() {
          // 删除失败或取消后的回调
        }

        // 删除事件
        if (config.onDelete) {
          config.onDelete(item, { next: (params?: any) => next(params), done: () => done() });
        } else {
          const itemId = getItemId(item);
          next({ ids: [itemId] });
        }
      })
      .catch(() => null);
  }

  return {
    getItemId,
    expand,
    select,
    edit,
    remove,
  };
}
