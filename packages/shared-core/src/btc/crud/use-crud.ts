/**
 * CRUD Composable
 * 封装 CRUD 通用逻辑：列表加载、分页、搜索、增删改等
 */

import { ref, reactive } from 'vue';
import type { CrudOptions, PaginationConfig, UseCrudReturn } from './types';

export function useCrud<T = Record<string, unknown>>(
  options: CrudOptions<T>,
  callback?: (app: UseCrudReturn<T>) => void
): UseCrudReturn<T> {
  const {
    service,
    onLoad,
    onSuccess,
    onError,
    onBeforeRefresh,
    onAfterRefresh,
    onBeforeDelete,
    onAfterDelete,
  } = options;

  // 表格数据
  const tableData = ref<T[]>([]);
  const loading = ref(false);

  // 分页配置
  const pagination = reactive<PaginationConfig>({
    page: 1,
    size: 20,
    total: 0,
  });

  // 搜索参数
  const searchParams = ref<Record<string, unknown>>({});

  // 选择行
  const selection = ref<T[]>([]);

  // 防止重复调用的标记
  const isRefreshing = ref(false);

  // 新增/编辑弹窗
  const upsertVisible = ref(false);
  const currentRow = ref<T | null>(null);
  const upsertMode = ref<'add' | 'update' | 'info'>('add'); // 弹窗模式

  // 查看详情弹窗
  const viewVisible = ref(false);
  const viewRow = ref<T | null>(null);

  /**
   * 加载数据
   */
  const loadData = async () => {
    loading.value = true;
    onLoad?.();

    try {
      // 合并参数
      let params: Record<string, unknown> = {
        page: pagination.page,
        size: pagination.size,
        ...searchParams.value,
      };

      // 刷新前钩子（对应 cool-admin 的 onRefresh）
      if (onBeforeRefresh) {
        const modifiedParams = onBeforeRefresh(params);
        if (modifiedParams) {
          params = modifiedParams;
        }
      }

      const res = await service.page(params);

      tableData.value = res.list;
      pagination.total = res.total;

      // 刷新后钩子
      onAfterRefresh?.(res);
    } catch (error) {
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 搜索
   */
  const handleSearch = (params: Record<string, unknown>) => {
    searchParams.value = params;
    pagination.page = 1;
    loadData();
  };

  /**
   * 重置搜索
   */
  const handleReset = () => {
    searchParams.value = {};
    pagination.page = 1;
    loadData();
  };

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    currentRow.value = null;
    upsertMode.value = 'add';
    upsertVisible.value = true;
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (row: T) => {
    currentRow.value = { ...row };
    upsertMode.value = 'update';
    upsertVisible.value = true;
  };

  /**
   * 打开详情弹窗（info 模式）
   */
  const handleInfo = (row: T) => {
    currentRow.value = { ...row };
    upsertMode.value = 'info';
    upsertVisible.value = true;
  };

  /**
   * 打开追加弹窗（对应 cool-admin 的 rowAppend）
   * 追加模式：基于现有数据创建新数据
   */
  const handleAppend = (row?: T) => {
    currentRow.value = row ? { ...row } : null;
    upsertMode.value = 'add';
    upsertVisible.value = true;
  };

  /**
   * 打开详情弹窗（独立弹窗）
   */
  const handleView = (row: T) => {
    viewRow.value = { ...row };
    viewVisible.value = true;
  };

  /**
   * 关闭所有弹窗（对应 cool-admin 的 rowClose）
   */
  const closeDialog = () => {
    upsertVisible.value = false;
    viewVisible.value = false;
    currentRow.value = null;
    viewRow.value = null;
  };

  /**
   * 关闭详情弹窗
   */
  const handleViewClose = () => {
    viewVisible.value = false;
    viewRow.value = null;
  };

  /**
   * 删除单行
   */
  const handleDelete = async (row: T & { id: number | string }) => {
    // 删除前钩子（对应 cool-admin 的 onDelete）
    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete([row]);
      if (canDelete === false) {
        return;
      }
    }

    try {
      await service.delete({ ids: [row.id] });
      onSuccess?.('删除成功');
      onAfterDelete?.();
      loadData();
    } catch (error) {
      onError?.(error);
    }
  };

  /**
   * 批量删除
   */
  const handleMultiDelete = async () => {
    if (selection.value.length === 0) {
      onError?.(new Error('请选择要删除的数据'));
      return;
    }

    // 删除前钩子
    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete(selection.value as T[]);
      if (canDelete === false) {
        return;
      }
    }

    try {
      const ids = selection.value.map((row: any) => row.id);
      await service.delete({ ids });
      onSuccess?.(`成功删除 ${ids.length} 条数据`);
      onAfterDelete?.();
      clearSelection();
      loadData();
    } catch (error) {
      onError?.(error);
    }
  };

  /**
   * 选择变化
   */
  const handleSelectionChange = (rows: T[]) => {
    selection.value = rows;
  };

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selection.value = [];
  };

  /**
   * 切换行选择
   */
  const toggleSelection = (row: T, selected?: boolean) => {
    // 这个方法需要在组件中配合 el-table ref 使用
    // 这里只提供状态管理
    const index = selection.value.findIndex((item: any) => item === row);

    if (selected === undefined) {
      // 切换状态
      if (index > -1) {
        selection.value.splice(index, 1);
      } else {
        selection.value.push(row as any);
      }
    } else if (selected && index === -1) {
      // 选中
      selection.value.push(row as any);
    } else if (!selected && index > -1) {
      // 取消选中
      selection.value.splice(index, 1);
    }
  };

  /**
   * 刷新 - 强制更新版本 2024-01-16 15:30
   */
  const handleRefresh = () => {
    if (isRefreshing.value) {
      return;
    }
    isRefreshing.value = true;
    loadData().finally(() => {
      isRefreshing.value = false;
    });
  };

  /**
   * 页码改变 - 强制更新版本 2024-01-16 15:30
   */
  const handlePageChange = (page: number) => {
    if (isRefreshing.value) {
      return;
    }
    pagination.page = page;
    loadData();
  };

  /**
   * 每页条数改变
   */
  const handleSizeChange = (size: number) => {
    pagination.size = size;
    pagination.page = 1;
    loadData();
  };

  /**
   * 获取请求参数（对应 cool-admin 的 getParams）
   */
  const getParams = () => {
    return {
      page: pagination.page,
      size: pagination.size,
      ...searchParams.value,
    };
  };

  /**
   * 设置请求参数（对应 cool-admin 的 setParams）
   */
  const setParams = (params: Record<string, unknown>) => {
    Object.assign(searchParams.value, params);
  };

  const crudInstance = {
    // 数据
    tableData,
    loading,
    pagination,
    searchParams,
    selection,
    upsertVisible,
    currentRow,
    upsertMode, // 新增：弹窗模式
    viewVisible,
    viewRow,
    service, // 暴露 service

    // 数据加载
    loadData,
    handleSearch,
    handleReset,
    handleRefresh,

    // 新增/编辑/查看
    handleAdd,
    handleEdit,
    handleInfo, // 新增：info 模式
    handleAppend,
    handleView,
    handleViewClose,
    closeDialog,

    // 删除
    handleDelete,
    handleMultiDelete,

    // 选择管理
    handleSelectionChange,
    clearSelection,
    toggleSelection,

    // 分页
    handlePageChange,
    handleSizeChange,

    // 参数管理
    getParams,
    setParams,
  } as UseCrudReturn<T>;

  // 如果有回调函数，调用它
  if (callback) {
    callback(crudInstance);
  }

  return crudInstance;
}

