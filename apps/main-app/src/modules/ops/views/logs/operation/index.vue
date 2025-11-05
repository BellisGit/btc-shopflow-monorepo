<template>
  <div class="audit-page">
    <!-- 操作日志 -->
    <BtcCrud ref="auditCrudRef" :service="auditService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索操作日志..." />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="auditTableRef" :columns="auditColumns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcTable, BtcPagination, BtcRefreshBtn, BtcRow, BtcFlex1, BtcSearchKey } from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'OpsAudit'
});

// 审计日志服务（操作日志）
const auditService = service.system?.log?.operation;

// 审计日志列配置
const auditColumns = computed<TableColumn[]>(() => [
  {
    label: '操作人',
    prop: 'username',
    width: 120
  },
  {
    label: '操作类型',
    prop: 'operationType',
    width: 120,
    dict: [
      { label: '查询', value: 'SELECT', type: 'info' },
      { label: '新增', value: 'INSERT', type: 'success' },
      { label: '更新', value: 'UPDATE', type: 'warning' },
      { label: '删除', value: 'DELETE', type: 'danger' }
    ],
    dictColor: true // 启用彩色标签
  },
  {
    label: '操作资源',
    prop: 'tableName',
    width: 150,
    showOverflowTooltip: true
  },
  {
    label: 'IP地址',
    prop: 'ipAddress',
    width: 120
  },
  {
    label: '操作描述',
    prop: 'operationDesc',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: '操作数据',
    prop: 'beforeData',
    width: 150,
    showOverflowTooltip: false,
    component: {
      name: 'BtcCodeJson',
      props: {
        popover: true
      }
    }
  },
  {
    prop: 'createdAt',
    label: '操作时间',
    width: 170,
    sortable: true
  }
]);

// CRUD 引用
const auditCrudRef = ref();
</script>

<style lang="scss" scoped>
.audit-page {
  height: 100%;
}
</style>
