<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryCheckService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions>
          <el-button type="info" @click="handleExport">
            <BtcSvg name="export" class="mr-[5px]" />
            {{ t('ui.export') }}
          </el-button>
        </BtcCrudActions>
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: opButtons }"
        />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <BtcUpsert ref="upsertRef" :items="formItems" width="640px" />
    </BtcCrud>

    <!-- 详情弹窗 -->
    <BtcDialog
      v-model="detailVisible"
      :title="t('logistics.inventory.result.detail.title')"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.baseId')">
          {{ detailRow?.baseId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.materialName')">
          {{ detailRow?.materialName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.specification')">
          {{ detailRow?.specification || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.unit')">
          {{ detailRow?.unit || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.batchNo')">
          {{ detailRow?.batchNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.bookQty')">
          {{ detailRow?.bookQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.actualQty')">
          {{ detailRow?.actualQty !== null && detailRow?.actualQty !== undefined ? detailRow.actualQty : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.diffQty')">
          {{ detailRow?.diffQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.diffRate')">
          {{ detailRow?.diffRate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.isDiff')">
          <el-tag :type="detailRow?.isDiff === 1 ? 'danger' : 'success'">
            {{ detailRow?.isDiff === 1 ? t('common.yes') : t('common.no') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.checkerId')">
          {{ detailRow?.checkerId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.base.fields.createdAt')">
          {{ detailRow?.createdAt ? formatDateTime(detailRow.createdAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.remark')" :span="2">
          {{ detailRow?.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.button.close') }}</el-button>
      </template>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, inject } from 'vue';
import { useI18n, type UseCrudReturn } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcDialog, BtcMessage, BtcSvg } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime, formatTableNumber } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-result',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 获取CRUD上下文（使用可选注入，避免警告）
const injectedCrud = inject<UseCrudReturn<any> | undefined>('btc-crud', undefined);

const inventoryCheckService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'base', 'check'],
  service
);

// 获取EPS服务节点
const getEpsServiceNode = (servicePath: string | string[]) => {
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');
  let serviceNode: any = service;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      throw new Error(`EPS服务路径 ${servicePath} 不存在，无法找到 ${key}`);
    }
    serviceNode = serviceNode[key];
  }
  return serviceNode;
};

// 处理导出 - 使用EPS服务
const handleExport = async () => {
  // 优先从crudRef获取，如果没有则从inject获取
  const crudInstance = crudRef.value?.crud || injectedCrud;
  
  if (!crudInstance) {
    BtcMessage.error('CRUD上下文不可用');
    return;
  }

  try {
    // 获取EPS服务节点
    const serviceNode = getEpsServiceNode(['logistics', 'base', 'check']);
    
    // 检查export方法是否存在
    if (!serviceNode || typeof serviceNode.export !== 'function') {
      throw new Error('导出方法不存在');
    }
    
    // 获取当前查询参数
    const params = crudInstance.getParams();
    
    // 构建导出参数（根据EPS配置，没有fieldEq字段，只需要传递keyword）
    const exportParams: any = {};
    
    // 如果有keyword，传递keyword
    if (params.keyword) {
      exportParams.keyword = params.keyword;
    }
    
    // 调用EPS服务的export方法（GET请求，参数作为query参数）
    const response = await serviceNode.export(exportParams);
    
    // 处理响应：EPS服务可能返回Blob、ArrayBuffer或其他格式
    let blob: Blob;
    
    if (response instanceof Blob) {
      blob = response;
    } else if (response instanceof ArrayBuffer) {
      blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else if (response && typeof response === 'object' && 'data' in response) {
      // 如果响应被包装在data字段中
      const data = response.data;
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else {
        // 尝试将数据转换为Blob
        blob = new Blob([JSON.stringify(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }
    } else {
      // 其他情况，尝试直接转换为Blob
      blob = new Blob([response as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `${t('menu.logistics.warehouse.inventory.result')}_${timestamp}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    BtcMessage.success(t('platform.common.export_success'));
  } catch (error: any) {
    console.error('导出失败:', error);
    BtcMessage.error(error.message || t('platform.common.export_failed'));
  }
};

const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => formatTableNumber(value);

// 盘点结果表格列（只显示：序号、物料编码、仓位、账面数量、实际数量、差异数量、操作列）
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { type: 'index', label: t('common.index'), width: 60 },
  { label: t('logistics.inventory.check.fields.materialCode'), prop: 'materialCode', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.check.fields.position'), prop: 'position', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.check.fields.bookQty'), prop: 'bookQty', minWidth: 120, formatter: formatNumber },
  { label: t('logistics.inventory.check.fields.actualQty'), prop: 'actualQty', minWidth: 120, formatter: formatNumber },
  { label: t('logistics.inventory.check.fields.diffQty'), prop: 'diffQty', minWidth: 120, formatter: formatNumber },
]);

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'info',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  {
    label: t('common.button.edit'),
    type: 'primary',
    icon: 'Edit',
  },
]);

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.inventory.check.fields.baseId'),
    prop: 'baseId',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.materialName'),
    prop: 'materialName',
    component: { name: 'el-input', props: { maxlength: 200 } },
  },
  {
    label: t('logistics.inventory.check.fields.specification'),
    prop: 'specification',
    component: { name: 'el-input', props: { maxlength: 200 } },
  },
  {
    label: t('logistics.inventory.check.fields.unit'),
    prop: 'unit',
    component: { name: 'el-input', props: { maxlength: 20 } },
  },
  {
    label: t('logistics.inventory.check.fields.batchNo'),
    prop: 'batchNo',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.bookQty'),
    prop: 'bookQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.actualQty'),
    prop: 'actualQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.storageLocation'),
    prop: 'storageLocation',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.diffQty'),
    prop: 'diffQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.diffRate'),
    prop: 'diffRate',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.checkerId'),
    prop: 'checkerId',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.isDiff'),
    prop: 'isDiff',
    component: {
      name: 'el-select',
      props: {
        clearable: true,
      },
      options: [
        { label: t('common.enabled'), value: 1 },
        { label: t('common.disabled'), value: 0 },
      ],
    },
  },
  {
    label: t('logistics.inventory.check.fields.remark'),
    prop: 'remark',
    component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } },
  },
]);

onMounted(() => {
  // 移除手动调用 loadData，让 BtcCrud 自动加载
  nextTick(() => {
    tableRef.value?.calcMaxHeight?.();
  });
});
</script>

<style scoped lang="scss">
.logistics-crud-wrapper {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}
</style>

