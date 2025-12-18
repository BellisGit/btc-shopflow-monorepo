<template>
  <div class="inventory-confirm-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="checkService"
      :right-service="approvalService"
      :table-columns="approvalColumns"
      :form-items="approvalFormItems"
      :op="opConfig"
      :left-title="t('inventory.check.list')"
      :right-title="t('inventory.confirm.title')"
      :search-placeholder="t('inventory.confirm.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :label-field="'checkType'"
      @select="onCheckSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n, normalizePageResponse } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup, BtcMessage, BtcConfirm } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryConfirm'
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedCheck = ref<any>(null);

// 盘点列表服务（左侧）- 使用后端接口
const checkService = {
  list: async (params?: any) => {
    const checkListService = service.logistics?.warehouse?.check?.list;
    if (!checkListService) {
      console.warn('[InventoryConfirm] 盘点列表接口不存在');
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }

    try {
      // 调用后端接口
      const response = await checkListService(params || {});

      // 处理响应格式：后端返回 { code, msg, data } 格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        // 如果响应包含 data 字段，使用 data 字段
        data = response.data;
      }

      // 标准化响应格式
      const page = params?.page || 1;
      const size = params?.size || 10;
      const normalized = normalizePageResponse(data, page, size);

      return {
        list: normalized.list,
        pagination: normalized.pagination,
      };
    } catch (error) {
      console.error('[InventoryConfirm] 获取盘点列表失败:', error);
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }
  }
};

// 流程确认服务（右侧）- 使用 approval 服务
const approvalService = {
  page: async (params?: any) => {
    const approvalPageService = service.system?.base?.approval?.page;
    if (!approvalPageService) {
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }

    try {
      // BtcTableGroup 会自动将左侧选中项的 checkNo 传递到 keyword 对象中
      // 这里只需要直接调用接口即可
      const response = await approvalPageService(params || {});

      // 处理响应格式：后端返回 { code, msg, data } 格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      // 标准化响应格式
      const page = params?.page || 1;
      const size = params?.size || 10;
      const normalized = normalizePageResponse(data, page, size);

      return {
        list: normalized.list,
        pagination: normalized.pagination,
      };
    } catch (error) {
      console.error('[InventoryConfirm] 获取流程确认列表失败:', error);
      return {
        list: [],
        pagination: {
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        }
      };
    }
  },
  list: async () => {
    return [];
  },
  get: async () => {
    return null;
  },
  add: async () => {
    return null;
  },
  update: async () => {
    return null;
  },
  delete: async () => {
    return null;
  },
  deleteBatch: async () => {
    return null;
  },
};

// 盘点选择处理
const onCheckSelect = (check: any) => {
  selectedCheck.value = check;
  // BtcTableGroup 会自动刷新右侧表格，不需要手动调用 refresh()
};

// 判断是否已确认
const isConfirmed = (row: any): boolean => {
  const status = row?.status;
  if (!status) return false;
  // 支持多种状态值：'已确认'、'confirmed'、'CONFIRMED' 等
  const statusStr = String(status);
  return statusStr === '已确认' || statusStr.toLowerCase() === 'confirmed' || statusStr === 'CONFIRMED';
};

// 确认处理（针对单行数据）
const handleConfirm = async (row: any) => {
  // 检查是否已确认
  if (isConfirmed(row)) {
    BtcMessage.warning(t('inventory.confirm.alreadyConfirmed') || '已确认，无需再次确认！');
    return;
  }

  // 使用该行的 checkNo，如果没有则使用左侧选中的 checkNo
  const checkNo = row?.checkNo || selectedCheck.value?.checkNo;

  if (!checkNo) {
    BtcMessage.warning(t('inventory.confirm.selectCheckFirst') || '请先选择左侧流程');
    return;
  }

  try {
    // 二次确认对话框
    await BtcConfirm(
      t('inventory.confirm.confirmMessage') || `确定要确认流程 ${checkNo} 吗？`,
      t('inventory.confirm.confirmTitle') || '确认',
      {
        confirmButtonText: t('common.button.confirm') || '确定',
        cancelButtonText: t('common.button.cancel') || '取消',
        type: 'warning'
      }
    );

    // 调用确认接口
    const confirmService = service.system?.base?.approval?.confirm;
    if (!confirmService) {
      BtcMessage.error(t('inventory.confirm.serviceNotFound') || '确认接口不存在');
      return;
    }

    // 传递 checkNo
    const response = await confirmService({ checkNo });

    // 处理响应
    if (response && (response.code === 2000 || response.code === 200 || response.code === 1000)) {
      BtcMessage.success(t('inventory.confirm.success') || '确认成功');
      // 刷新右侧表格
      if (tableGroupRef.value?.crudRef) {
        tableGroupRef.value.crudRef.refresh();
      }
    } else {
      BtcMessage.error(response?.msg || t('inventory.confirm.failed') || '确认失败');
    }
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel' || error?.message === 'cancel') {
      return;
    }
    console.error('[InventoryConfirm] 确认失败:', error);
    BtcMessage.error(error?.msg || t('inventory.confirm.failed') || '确认失败');
  }
};

// 操作列配置（根据状态动态渲染按钮）
const opConfig = computed(() => ({
  buttons: ({ scope }: any) => {
    const row = scope?.row;
    const confirmed = isConfirmed(row);

    return [
      {
        label: confirmed
          ? (t('inventory.confirm.confirmed') || '已确认')
          : (t('inventory.confirm.confirm') || '确认'),
        type: confirmed ? 'success' : 'primary',
        onClick: ({ scope }: any) => {
          handleConfirm(scope.row);
        }
      }
    ];
  }
}));

// 流程确认表格列配置
const approvalColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'name', label: t('inventory.confirm.fields.name') || '名称', minWidth: 150 },
  {
    prop: 'status',
    label: t('inventory.confirm.fields.status') || '状态',
    width: 120,
    dictColor: true,
    dict: [
      {
        label: t('inventory.confirm.status.confirmed') || '已确认',
        value: '已确认',
        type: 'success'
      },
      {
        label: t('inventory.confirm.status.unconfirmed') || '未确认',
        value: '未确认',
        type: 'info'
      },
      // 兼容英文状态值
      {
        label: t('inventory.confirm.status.confirmed') || '已确认',
        value: 'confirmed',
        type: 'success'
      },
      {
        label: t('inventory.confirm.status.unconfirmed') || '未确认',
        value: 'unconfirmed',
        type: 'info'
      },
      {
        label: t('inventory.confirm.status.confirmed') || '已确认',
        value: 'CONFIRMED',
        type: 'success'
      },
      {
        label: t('inventory.confirm.status.unconfirmed') || '未确认',
        value: 'UNCONFIRMED',
        type: 'info'
      }
    ]
  },
  { prop: 'confirmer', label: t('inventory.confirm.fields.confirmer') || '确认人', width: 120 },
  { prop: 'createdAt', label: t('inventory.confirm.fields.createdAt') || '确认时间', width: 180, formatter: (row: any) => {
    if (!row.createdAt) return '-';
    return new Date(row.createdAt).toLocaleString('zh-CN');
  }},
]);

// 流程确认表单项配置（暂时不需要表单）
const approvalFormItems = computed<FormItem[]>(() => []);
</script>

<style lang="scss" scoped>
.inventory-confirm-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
