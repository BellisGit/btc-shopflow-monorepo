<template>
  <div class="resources-page">
    <BtcCrud ref="crudRef" :service="resourceService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <el-button
            type="warning"
            class="btc-crud-btn"
            :loading="syncLoading"
            @click="handleSync"
          >
            <BtcSvg class="btc-crud-btn__icon" name="sync" />
            <span class="btc-crud-btn__text">
              {{ t('access.resources.sync') }}
            </span>
          </el-button>
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions />
      </BtcRow>

      <BtcRow>
        <BtcTable :columns="resourceColumns" border />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <BtcUpsert :items="resourceFormItems" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type { TableColumn, FormItem } from '@btc/shared-components';
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcRefreshBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
  BtcCrudActions,
} from '@btc/shared-components';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const syncLoading = ref(false);

// 资源服务 - 使用EPS服务
const resourceService = service.admin?.iam?.resource;

// 数据同步处理
const handleSync = async () => {
  if (syncLoading.value) return;
  
  try {
    syncLoading.value = true;
    
    // 调用 pull 接口拉取资源
    await service.admin?.iam?.resource?.pull();
    
    message.success(t('access.resources.sync_success'));
    
    // 刷新表格数据
    if (crudRef.value?.crud) {
      await crudRef.value.crud.refresh();
    }
  } catch (error) {
    message.error(t('access.resources.sync_failed'));
    console.error('数据同步失败:', error);
  } finally {
    syncLoading.value = false;
  }
};

// 资源表格列
const resourceTypeDict = [
  { label: '文件', value: 'FILE', type: 'info' },
  { label: 'API', value: 'API', type: 'warning' },
  { label: '数据表', value: 'TABLE', type: 'primary' },
] as const;

const resourceColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: '序号', width: 60 },
  { prop: 'resourceNameCn', label: '资源名称', minWidth: 150 },
  { prop: 'resourceCode', label: '资源编码', minWidth: 150 },
  {
    prop: 'resourceType',
    label: '类型',
    width: 120,
    dict: resourceTypeDict.map((item) => ({ ...item })),
    dictColor: true,
  },
  { prop: 'description', label: '描述', minWidth: 200 },
]);

// 资源表单
const resourceFormItems = computed<FormItem[]>(() => [
  { prop: 'resourceNameCn', label: '资源名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'resourceCode', label: '资源编码', span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'resourceType',
    label: '类型',
    span: 12,
    component: {
      name: 'el-select',
      options: resourceTypeDict.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    }
  },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

</script>

<style lang="scss" scoped>
.resources-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
