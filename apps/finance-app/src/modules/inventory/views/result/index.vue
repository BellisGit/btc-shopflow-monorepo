<template>
  <div class="finance-crud-wrapper">
    <BtcCrud ref="crudRef" :service="financeInventoryService">
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
      :title="t('finance.inventory.result.detail.title')"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('finance.inventory.result.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.position')">
          {{ detailRow?.position || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.unitCost')">
          {{ formatTableNumber(detailRow?.unitCost) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.bookQty')">
          {{ formatTableNumber(detailRow?.bookQty) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.actualQty')">
          {{ formatTableNumber(detailRow?.actualQty) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.diffQty')">
          <span :class="{ 'text-red-500': (detailRow?.diffQty || 0) < 0, 'text-green-500': (detailRow?.diffQty || 0) > 0 }">
            {{ formatTableNumber(detailRow?.diffQty) || '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.varianceCost')" :span="2">
          <span :class="{ 'text-red-500': (detailRow?.varianceCost || 0) < 0, 'text-green-500': (detailRow?.varianceCost || 0) > 0 }">
            {{ formatTableNumber(detailRow?.varianceCost) || '-' }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import type { CrudService, UseCrudReturn } from '@btc/shared-core';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatTableNumber } from '@btc/shared-utils';
import { service } from '@/services/eps';
import { BtcMessage, BtcSvg } from '@btc/shared-components';

defineOptions({
  name: 'btc-finance-inventory-result',
});

const { t } = useI18n();

// 详情弹窗相关
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 获取CRUD上下文
// 优先通过ref获取，如果ref不可用则通过inject获取（使用可选注入，避免警告）
const crudRef = ref<any>(null);
const injectedCrud = inject<UseCrudReturn<any> | undefined>('btc-crud', undefined);

// 创建财务盘点结果服务 - 参考管理域的参数处理方式
const baseFinanceService = createCrudServiceFromEps('finance.base.financeResult', service);

// 包装服务以正确处理参数传递
const financeInventoryService: CrudService<any> = {
  ...baseFinanceService,
  async page(params: any) {
    // 参考管理域的模式，确保keyword对象包含所有必需字段
    const finalParams = { ...params };

    // 确保keyword是一个对象，并包含EPS配置中的所有fieldEq字段
    if (!finalParams.keyword || typeof finalParams.keyword !== 'object' || Array.isArray(finalParams.keyword)) {
      finalParams.keyword = {};
    }

    // 根据EPS配置的fieldEq，添加必需的字段
    if (finalParams.keyword.materialCode === undefined) {
      finalParams.keyword.materialCode = '';
    }
    if (finalParams.keyword.position === undefined) {
      finalParams.keyword.position = '';
    }

    return await baseFinanceService.page(finalParams);
  }
};

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
    const serviceNode = getEpsServiceNode('finance.base.financeResult');

    // 检查export方法是否存在
    if (!serviceNode || typeof serviceNode.export !== 'function') {
      throw new Error('导出方法不存在');
    }

    // 获取当前查询参数
    const params = crudInstance.getParams();

    // 构建导出参数，将keyword对象转换为查询参数
    const exportParams: any = {};

    // 添加keyword中的字段（根据EPS配置的fieldEq字段）
    if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
      const keyword = params.keyword as Record<string, any>;
      if (keyword.materialCode !== undefined && keyword.materialCode !== '') {
        exportParams.materialCode = keyword.materialCode;
      }
      if (keyword.position !== undefined && keyword.position !== '') {
        exportParams.position = keyword.position;
      }
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
    a.download = `${t('menu.finance.inventoryManagement.result')}_${timestamp}.xlsx`;
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

// 盘点结果表格列
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { type: 'index', label: t('common.index'), width: 60 },
  { label: t('finance.inventory.result.fields.materialCode'), prop: 'materialCode', minWidth: 120, showOverflowTooltip: true },
  { label: t('finance.inventory.result.fields.position'), prop: 'position', width: 80, showOverflowTooltip: true },
  { label: `${t('finance.inventory.result.fields.unitCost')} ($)`, prop: 'unitCost', width: 100, align: 'right', formatter: formatNumber },
  { label: t('finance.inventory.result.fields.bookQty'), prop: 'bookQty', width: 100, align: 'right', formatter: formatNumber },
  { label: t('finance.inventory.result.fields.actualQty'), prop: 'actualQty', width: 100, align: 'right', formatter: formatNumber },
  { label: t('finance.inventory.result.fields.diffQty'), prop: 'diffQty', width: 100, align: 'right', formatter: formatNumber },
  { label: `${t('finance.inventory.result.fields.varianceCost')} ($)`, prop: 'varianceCost', width: 120, align: 'right', formatter: formatNumber },
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

// 表单项配置
const formItems = computed<FormItem[]>(() => [
  {
    label: t('finance.inventory.result.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('finance.inventory.result.fields.materialCode'),
        maxlength: 50
      }
    },
  },
  {
    label: t('finance.inventory.result.fields.position'),
    prop: 'position',
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('finance.inventory.result.fields.position'),
        maxlength: 10
      }
    },
  },
  {
    label: t('finance.inventory.result.fields.unitCost'),
    prop: 'unitCost',
    required: true,
    component: {
      name: 'el-input-number',
      props: {
        placeholder: t('finance.inventory.result.fields.unitCost'),
        precision: 5,
        min: 0,
        step: 0.01,
        controlsPosition: 'right'
      }
    },
  },
  {
    label: t('finance.inventory.result.fields.bookQty'),
    prop: 'bookQty',
    required: true,
    component: {
      name: 'el-input-number',
      props: {
        placeholder: t('finance.inventory.result.fields.bookQty'),
        precision: 0,
        min: 0,
        step: 1,
        controlsPosition: 'right'
      }
    },
  },
  {
    label: t('finance.inventory.result.fields.actualQty'),
    prop: 'actualQty',
    required: true,
    component: {
      name: 'el-input-number',
      props: {
        placeholder: t('finance.inventory.result.fields.actualQty'),
        precision: 0,
        min: 0,
        step: 1,
        controlsPosition: 'right'
      }
    },
  },
]);
</script>

<style scoped lang="scss">
.finance-crud-wrapper {
  height: 100%;
  box-sizing: border-box;
}
</style>

