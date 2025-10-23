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
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { CommonColumns } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// 部门服务 - 使用EPS服务
const departmentService = service.sysdepartment;

// 部门选项数据
const departmentOptions = ref<Array<{ label: string; value: string }>>([]);

// 加载部门选项数据
const loadDepartmentOptions = async () => {
  try {
    const res = await departmentService.list({
      order: 'createdAt',
      sort: 'asc',
      page: 1,
      size: 100,
      keyword: ''
    });

    // 处理响应数据结构：res.data.list 或直接是数组
    let dataArray = [];
    if (res && res.data && res.data.list) {
      dataArray = res.data.list;
    } else if (Array.isArray(res)) {
      dataArray = res;
    }

    departmentOptions.value = dataArray
      .filter((dept: any) => dept.id != null && dept.name) // 过滤掉无效数据
      .map((dept: any) => ({
        label: dept.name,
        value: dept.id
      }));
  } catch (_error) {
    console.error('加载部门选项失败:', _error);
    // 出错时设置为空数组
    departmentOptions.value = [];
  }
};

const wrappedDepartmentService = {
  ...departmentService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await departmentService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

// 部门表格列
const columns = computed<TableColumn[]>(() => [
  CommonColumns.selection(),
  CommonColumns.index(),
  { prop: 'name', label: '部门名称', minWidth: 150 },
  { prop: 'deptCode', label: '部门编码', width: 120 },
  {
    prop: 'parentId',
    label: '上级部门',
    width: 120,
    formatter: (row: any) => {
      if (!row.parentId) return '-';
      const parentDept = departmentOptions.value.find(dept => dept.value === row.parentId);
      return parentDept ? parentDept.label : row.parentId;
    }
  },
  { prop: 'sort', label: '排序', width: 80 },
  CommonColumns.createdAt(),
  CommonColumns.operation(),
]);

// 部门表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'name', label: '部门名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'deptCode', label: '部门编码', span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'parentId',
    label: '上级部门',
    span: 12,
    component: {
      name: 'el-select',
      props: { clearable: true },
      options: departmentOptions.value
    }
  },
  {
    prop: 'sort',
    label: '排序',
    span: 12,
    value: 0,
    component: {
      name: 'el-input-number',
      props: { min: 0, style: { width: '100%' } }
    }
  },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (_error) {
    done();
  }
};

// 组件挂载时加载部门选项
onMounted(() => {
  loadDepartmentOptions();
});
</script>

<style lang="scss" scoped>
.departments-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
