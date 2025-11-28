<template>
  <div class="inventory-list-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedMaterialService"
      :table-columns="materialColumns"
      :form-items="materialFormItems"
      :left-title="t('inventory.dataSource.domain')"
      :right-title="t('menu.inventory.dataSource.list')"
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="false"
      :left-size="'small'"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :show-search-key="false"
      :show-toolbar="true"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <BtcImportBtn :on-submit="handleImport" />
      </template>
      <template #actions>
        <el-button type="info" @click="exportMaterialTemplate">
          {{ t('ui.export') }}
        </el-button>
      </template>
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, exportTableToExcel } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup, BtcImportBtn } from '@btc/shared-components';
import { service } from '@/services/eps';

defineOptions({
  name: 'BtcDataInventoryList'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 物料信息表服务（右侧表），使用后端API
const materialService = service.system?.base?.data;

const wrappedMaterialService = {
  ...materialService,
  // 移除删除相关方法，因为不允许删除
  delete: undefined,
  deleteBatch: undefined,
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
  // 可以根据选中的域，过滤右侧的物料信息表数据
  // 这里可以通过 tableGroupRef 来刷新右侧表格
};

// 处理导入
const handleImport = async (data: any, { done, close }: { done: () => void; close: () => void }) => {
  try {
    const rows = (data?.list || data?.rows || []).map((row: Record<string, any>) => {
      const { _index, ...rest } = row || {};
      return rest;
    });
    if (!rows.length) {
      const warnMessage = data?.filename
        ? t('common.import.no_data_or_mapping')
        : t('inventory.dataSource.list.import.no_file');
      message.warning(warnMessage);
      done();
      return;
    }

    const payload = rows.map((row: Record<string, any>) => ({
      materialCode: row.materialCode,
      materialName: row.materialName,
      specification: row.specification,
      unit: row.unit,
      category: row.category,
      status: row.status,
      remark: row.remark,
    }));

    await service.system?.base?.data?.import?.(payload);

    message.success(t('inventory.dataSource.list.import.success'));
    tableGroupRef.value?.crudRef?.crud?.refresh();
    close();
  } catch (error) {
    console.error('[InventoryList] import failed:', error);
    message.error(t('inventory.dataSource.list.import.failed'));
    done();
  }
};

// 物料信息表表格列（移除选择列和操作列）
const materialColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'materialCode', label: t('system.material.fields.materialCode'), minWidth: 140 },
  { prop: 'materialName', label: t('system.material.fields.materialName'), minWidth: 160 },
  { prop: 'specification', label: t('system.material.fields.specification'), minWidth: 140 },
  { prop: 'unit', label: t('system.material.fields.unit'), minWidth: 120 },
  { prop: 'category', label: t('inventory.dataSource.list.fields.category'), minWidth: 120 },
  { prop: 'status', label: t('inventory.dataSource.list.fields.status'), minWidth: 100 },
  { prop: 'remark', label: t('system.inventory.base.fields.remark'), minWidth: 160 },
]);

// 物料信息表表单
const materialFormItems = computed<FormItem[]>(() => [
  { prop: 'materialCode', label: t('system.material.fields.materialCode'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'materialName', label: t('system.material.fields.materialName'), span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'specification', label: t('system.material.fields.specification'), span: 12, component: { name: 'el-input' } },
  { prop: 'unit', label: t('system.material.fields.unit'), span: 12, component: { name: 'el-input' } },
  { prop: 'category', label: t('inventory.dataSource.list.fields.category'), span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: t('inventory.dataSource.list.fields.status'),
    span: 12,
    component: {
      name: 'el-select',
      props: {
        placeholder: t('inventory.dataSource.list.fields.status_placeholder'),
      },
    },
    options: [
      { label: t('common.enabled'), value: 1 },
      { label: t('common.disabled'), value: 0 },
    ],
  },
  { prop: 'remark', label: t('system.inventory.base.fields.remark'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const exportMaterialTemplate = () => {
  exportTableToExcel({
    columns: materialColumns.value,
    data: [],
    filename: `data_${t('menu.inventory.dataSource.list')}`,
  });
};
</script>

<style lang="scss" scoped>
.inventory-list-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
