/**
 * ViewGroup 操作 Hook（选择、编辑、删除等）
 */
import { nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ViewGroupOptions, ViewGroupItem } from '../types';

export function useViewGroupActions(
  config: ViewGroupOptions,
  tree: any,
  list: any,
  selected: any,
  isMobile: any,
  isExpand: any,
  refresh: any,
  treeRef?: any
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
    if (!data) {
      data = list.value[0];
    }

    selected.value = data;

    nextTick(() => {
      if (data) {
        // 如果是树形结构，需要设置 Element Plus Tree 的当前高亮节点
        if (tree.visible && treeRef?.value) {
          const itemId = getItemId(data);
          treeRef.value.setCurrentKey(itemId);
        }

        if (isMobile.value) {
          expand(false);
        }

        if (config.onSelect) {
          config.onSelect(data);
        }
      }
    });
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
      type: 'warning'
    })
      .then(() => {
        function next(params: any) {
          config.service
            .delete(params)
            .then(async () => {
              ElMessage.success('删除成功');

              // 刷新列表
              await refresh();

              // 删除当前
              const currentId = getItemId(selected.value);
              const itemId = getItemId(item);
              if (currentId === itemId) {
                select();
              }
            })
            .catch((err: Error) => {
              ElMessage.error(err.message);
            });
        }

        function done() {
          // 删除失败或取消后的回调
        }

        // 删除事件
        if (config.onDelete) {
          config.onDelete(item, { next, done });
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

