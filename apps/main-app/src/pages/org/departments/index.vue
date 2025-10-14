<template>
  <div class="departments-page">
    <BtcCrud ref="crudRef" :service="wrappedDepartmentService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索部门" />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px" :on-submit="handleFormSubmit" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createMockCrudService, mockHelpers } from '../../../utils/mock';

const { t } = useI18n();
const crudRef = ref();

// 部门服务
const departmentService = createMockCrudService('btc_departments', {
  defaultData: [
    { id: 1, deptNameCn: '物流部', deptCode: 'LOGISTICS', parentId: null, sortOrder: 1, createTime: mockHelpers.randomDate() },
    { id: 2, deptNameCn: '生产部', deptCode: 'PRODUCTION', parentId: null, sortOrder: 2, createTime: mockHelpers.randomDate() },
    { id: 3, deptNameCn: '品质部', deptCode: 'QUALITY', parentId: null, sortOrder: 3, createTime: mockHelpers.randomDate() },
    { id: 4, deptNameCn: '财务部', deptCode: 'FINANCE', parentId: null, sortOrder: 4, createTime: mockHelpers.randomDate() },
    { id: 5, deptNameCn: '工程部', deptCode: 'ENGINEERING', parentId: null, sortOrder: 5, createTime: mockHelpers.randomDate() },
  ]
});

const wrappedDepartmentService = {
  ...departmentService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await departmentService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
};

// 部门表格列
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'deptNameCn', label: '部门名称', minWidth: 150 },
  { prop: 'deptCode', label: '部门编码', width: 120 },
  { prop: 'parentId', label: '上级部门ID', width: 120 },
  { prop: 'sortOrder', label: '排序', width: 80 },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 部门表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'deptNameCn', label: '部门名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'deptCode', label: '部门编码', span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'parentId',
    label: '上级部门',
    span: 12,
    component: {
      name: 'el-select',
      props: { clearable: true },
      options: [
        { label: '物流部', value: 1 },
        { label: '生产部', value: 2 },
        { label: '品质部', value: 3 },
        { label: '财务部', value: 4 },
        { label: '工程部', value: 5 },
      ]
    }
  },
  {
    prop: 'sortOrder',
    label: '排序',
    span: 12,
    value: 1,
    component: {
      name: 'el-input-number',
      props: { min: 0 }
    }
  },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.departments-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
