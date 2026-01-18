<template>
  <BtcCrud ref="crudRef" :service="service">
    <!-- 工具栏 -->
    <BtcCrudRow>
      <BtcRefreshBtn />
      <BtcAddBtn />
      <BtcMultiDeleteBtn />
      <BtcCrudFlex1 />
      <BtcCrudSearchKey placeholder="搜索..." />
    </BtcCrudRow>

    <!-- 表格 -->
    <BtcCrudRow>
      <BtcTable :columns="columns">
        <!-- 自定义列插槽示例 -->
        <!-- <template #column-status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template> -->

        <!-- 自定义操作按钮示例 -->
        <!-- <template #slot-custom="{ row }">
          <el-button link @click="handleCustom(row)">自定义</el-button>
        </template> -->
      </BtcTable>
    </BtcCrudRow>

    <!-- 分页 -->
    <BtcCrudRow>
      <BtcCrudFlex1 />
      <BtcPagination />
    </BtcCrudRow>

    <!-- 新增/编辑弹窗 -->
    <BtcUpsert
      :items="formItems"
      width="800px"
      :on-submit="handleFormSubmit"
    />
  </BtcCrud>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  type TableColumn,
  type FormItem,
  BtcMessage,
} from '@btc/shared-components';

defineOptions({
  name: 'PageName'
});

const crudRef = ref();

// 定义服务（需要根据实际 API 调整）
const service = {
  page: async (params: any) => {
    // TODO: 替换为实际的 API 调用
    // const res = await api.page(params);
    // return { list: res.list, total: res.total };
    return { list: [], total: 0 };
  },
  add: async (data: any) => {
    // TODO: 替换为实际的 API 调用
    // return await api.add(data);
  },
  update: async (data: any) => {
    // TODO: 替换为实际的 API 调用
    // return await api.update(data);
  },
  delete: async ({ ids }: { ids: string[] }) => {
    // TODO: 替换为实际的 API 调用
    // return await api.delete({ ids });
  },
};

// 表格列配置
const columns: TableColumn[] = [
  { type: 'selection', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
  // 添加更多列...
  {
    type: 'op',
    label: '操作',
    width: 200,
    buttons: ['info', 'edit', 'delete']
  },
];

// 表单项配置
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: '名称',
    span: 12,
    required: true,
    component: { name: 'el-input' }
  },
  // 添加更多表单项...
];

// 表单提交处理
const handleFormSubmit = async (data: any, { close, done }: any) => {
  try {
    if (data.id) {
      await service.update(data);
    } else {
      await service.add(data);
    }
    close();
    crudRef.value?.crud.loadData();
    BtcMessage.success('保存成功');
  } catch (error: any) {
    done();
    BtcMessage.error(error?.message || '保存失败');
  }
};
</script>

<style lang="scss" scoped>
// 页面样式
</style>
