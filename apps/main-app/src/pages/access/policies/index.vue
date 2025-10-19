<template>
  <div class="policies-list">
    <BtcCrud ref="crudRef" :service="wrappedService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border>
          <template #column-effect="{ row }">
            <el-tag :type="row.effect === 'allow' ? 'success' : 'danger'">
              {{ row.effect === 'allow' ? '允许' : '拒绝' }}
            </el-tag>
          </template>
        </BtcTable>
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="900px" :on-submit="handleFormSubmit" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// Mock数据服务
const policyService = createMockCrudService('btc_policies', {

});

// 添加delete确认
const wrappedService = {
  ...policyService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await policyService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'policyName', label: '策略名称', minWidth: 150 },
  { prop: 'policyType', label: '策略类型', width: 120 },
  { prop: 'effect', label: '效果', width: 100 },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'conditions', label: '条件（JSON）', minWidth: 200 },
  { prop: 'description', label: '描述', minWidth: 150 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'policyName', label: '策略名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'policyType', label: '策略类型', span: 12, required: true, component: {
    name: 'el-select',
    options: [
      { label: 'RBAC（基于角色）', value: 'RBAC' },
      { label: 'ABAC（基于属性）', value: 'ABAC' },
      { label: 'ACL（访问控制列表）', value: 'ACL' },
    ]
  } },
  { prop: 'effect', label: '效果', span: 12, required: true, component: {
    name: 'el-radio-group',
    options: [
      { label: '允许', value: 'allow' },
      { label: '拒绝', value: 'deny' },
    ]
  } },
  { prop: 'priority', label: '优先级', span: 12, component: { name: 'el-input-number', props: { min: 0, max: 1000 } }, value: 100 },
  { prop: 'conditions', label: '条件（JSON格式）', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 5, placeholder: '例：{"role": "admin", "resource": "user"}' } } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.policies-list {
  padding: 20px;
}
</style>

