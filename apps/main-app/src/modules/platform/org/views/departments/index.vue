<template>
  <div class="departments-page">
    <BtcCrud ref="crudRef" :service="wrappedDepartmentService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
      <BtcTable :columns="columns" />
      <BtcUpsert :items="formItems" @submit="handleFormSubmit" />
      <BtcPagination />
      <template #header>
        <BtcRow>
          <BtcFlex1>
            <BtcSearchKey />
          </BtcFlex1>
          <BtcAddBtn />
          <BtcRefreshBtn />
          <BtcMultiDeleteBtn />
        </BtcRow>
      </template>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, unref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { CommonColumns } from '@btc/shared-components';
import { service } from '../../../../../services/eps';

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

    console.log('原始数据:', dataArray);

    const filteredData = dataArray.filter((dept: any) => {
      const isValid = dept.id != null && dept.name;
      console.log(`部门 ${dept.name}: id=${dept.id}, name=${dept.name}, isValid=${isValid}`);
      return isValid;
    });

    console.log('过滤后数据:', filteredData);

    departmentOptions.value = filteredData.map((dept: any) => ({
      label: dept.name,
      value: dept.id
    }));

    console.log('最终选项数据:', departmentOptions.value);
  } catch (error) {
    console.error('加载部门选项失败:', error);
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
  { prop: 'parentId', label: '上级部门ID', width: 120 },
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
      options: departmentOptions
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

const handleBeforeRefresh = (params: any) => {
  return params;
};

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
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
