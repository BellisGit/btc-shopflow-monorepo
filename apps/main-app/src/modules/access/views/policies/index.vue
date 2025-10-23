<template>
  <div class="policies-page">
    <BtcCrud ref="crudRef" :service="policyService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索策略..." />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcCrud, BtcTable, BtcPagination, BtcAddBtn, BtcRefreshBtn, BtcMultiDeleteBtn, BtcRow, BtcFlex1, BtcSearchKey } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();

defineOptions({
  name: 'AccessPolicies'
});

// 策略服务 - 使用EPS服务
const policyService = {
  ...service.syspolicy,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.syspolicy.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};
// 表格列配置
const columns = computed<TableColumn[]>(() => [
  {
    label: '策略名称',
    prop: 'policyName',
    minWidth: 150
  },
  {
    label: '策略类型',
    prop: 'policyType',
    width: 100,
    dict: [
      { label: 'RBAC', value: 'RBAC' },
      { label: 'ABAC', value: 'ABAC' },
      { label: 'ACL', value: 'ACL' }
    ]
  },
  {
    label: '效果',
    prop: 'effect',
    width: 80,
    dict: [
      { label: '允许', value: 'allow' },
      { label: '拒绝', value: 'deny' }
    ]
  },
  {
    label: '优先级',
    prop: 'priority',
    width: 80
  },
  {
    label: '条件',
    prop: 'conditions',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '描述',
    prop: 'description',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '状态',
    prop: 'status',
    width: 80,
    dict: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
]);


// 表单配置
const formItems: FormItem[] = [
    {
      label: '策略名称',
      prop: 'policyName',
      component: { name: 'el-input' },
      required: true,
      props: {
        placeholder: '请输入策略名称'
      }
    },
    {
      label: '策略类型',
      prop: 'policyType',
      component: { name: 'el-select' },
      required: true,
      props: {
        placeholder: '请选择策略类型'
      },
      dict: [
        { label: 'RBAC', value: 'RBAC' },
        { label: 'ABAC', value: 'ABAC' },
        { label: 'ACL', value: 'ACL' }
      ]
    },
    {
      label: '效果',
      prop: 'effect',
      component: { name: 'el-select' },
      required: true,
      props: {
        placeholder: '请选择效果'
      },
      dict: [
        { label: '允许', value: 'allow' },
        { label: '拒绝', value: 'deny' }
      ]
    },
    {
      label: '优先级',
      prop: 'priority',
      component: { name: 'el-input-number' },
      required: true,
      props: {
        placeholder: '请输入优先级',
        min: 1,
        max: 1000
      }
    },
    {
      label: '条件',
      prop: 'conditions',
      component: { name: 'el-input' },
      required: true,
      props: {
        type: 'textarea',
        placeholder: '请输入JSON格式条件',
        rows: 4
      }
    },
    {
      label: '描述',
      prop: 'description',
      component: { name: 'el-input' },
      props: {
        type: 'textarea',
        placeholder: '请输入描述',
        rows: 3
      }
    },
    {
      label: '状态',
      prop: 'status',
      component: { name: 'el-radio-group' },
      required: true,
      dict: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
];

const crudRef = ref();

</script>

<style lang="scss" scoped>
.policies-page {
  height: 100%;
}
</style>
