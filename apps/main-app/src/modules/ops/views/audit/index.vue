<template>
  <div class="audit-page">
    <BtcCrud
      ref="crudRef"
      :service="auditService"
      :columns="columns"
      :search-form="searchForm"
      :permission="permission"
    >
      <template #table-operation="{ row }">
        <el-button
          v-permission="permission.info"
          type="info"
          size="small"
          @click="viewDetails(row)"
        >
          {{ t('ops.audit.view_detail') }}
        </el-button>
      </template>
    </BtcCrud>

    <!-- 审计详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="t('ops.audit.detail_title')"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('ops.audit.operation_time')">{{ currentLog.operationTime }}</el-descriptions-item>
        <el-descriptions-item :label="t('ops.audit.user_name')">{{ currentLog.userName }}</el-descriptions-item>
        <el-descriptions-item :label="t('ops.audit.operation_type')">{{ currentLog.operationType }}</el-descriptions-item>
        <el-descriptions-item :label="t('ops.audit.resource_name')">{{ currentLog.resourceName }}</el-descriptions-item>
        <el-descriptions-item :label="t('ops.audit.ip_address')">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item :label="t('ops.audit.result')">{{ currentLog.result }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>{{ t('ops.audit.request_data') }}</el-divider>
      <pre class="json-view">{{ formatJson(currentLog.requestData) }}</pre>

      <el-divider>{{ t('ops.audit.response_data') }}</el-divider>
      <pre class="json-view">{{ formatJson(currentLog.responseData) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@btc/shared-core';
import { service } from '../../../../services/eps';

defineOptions({
  name: 'OpsAudit'
});

const { t } = useI18n();

// ????
const permission = {
  list: 'ops:audit:list',
  info: 'ops:audit:info'
};

// Mock??
const auditService = createMockCrudService('btc_audit_logs', {
  list: [
    {
      id: 3,
      operationTime: '2024-01-15 10:40:08',
      userName: 'manager',
      operationType: '??',
      resourceName: '????',
      ipAddress: '192.168.1.101',
      result: '??',
      requestData: JSON.stringify({
        orderNo: 'ORD20240115001',
        customerName: '??',
        amount: 1000
      }),
      responseData: JSON.stringify({
        code: 200,
        message: '??????',
        data: {
          id: 12345
        }
      })
    },
    {
      id: 4,
      operationTime: '2024-01-15 10:45:33',
      userName: 'employee',
      operationType: '??',
      resourceName: '????',
      ipAddress: '192.168.1.102',
      result: '??',
      requestData: JSON.stringify({
        configId: 1
      }),
      responseData: JSON.stringify({
        code: 403,
        message: '?????????????'
      })
    },
    {
      id: 5,
      operationTime: '2024-01-15 10:50:15',
      userName: 'admin',
      operationType: '??',
      resourceName: '????',
      ipAddress: '192.168.1.100',
      result: '??',
      requestData: JSON.stringify({
        roleId: 2,
        roleName: '????',
        permissions: [1, 2, 3]
      }),
      responseData: JSON.stringify({
        code: 200,
        message: '??????'
      })
    }
  ]
});

// 审计日志列配置
const columns = [
  {
    label: t('ops.audit.operation_time'),
    prop: 'operationTime',
    width: 160
  },
  {
    label: t('ops.audit.user_name'),
    prop: 'userName',
    width: 100
  },
  {
    label: t('ops.audit.operation_type'),
    prop: 'operationType',
    width: 100
  },
  {
    label: t('ops.audit.resource_name'),
    prop: 'resourceName',
    minWidth: 120
  },
  {
    label: t('ops.audit.ip_address'),
    prop: 'ipAddress',
    width: 120
  },
  {
    label: t('ops.audit.result'),
    prop: 'result',
    width: 80,
    dict: [
      { label: t('ops.audit.success'), value: t('ops.audit.success') },
      { label: t('ops.audit.failed'), value: t('ops.audit.failed') }
    ]
  }
];

// ??????
const searchForm = {
  items: [
    {
      label: '????',
      prop: 'userName',
      component: 'el-input',
      props: {
        placeholder: '??????'
      }
    },
    {
      label: '????',
      prop: 'operationType',
      component: 'el-select',
      props: {
        placeholder: '???????',
        clearable: true
      },
      dict: [
        { label: '??', value: '??' },
        { label: '??', value: '??' },
        { label: '??', value: '??' },
        { label: '??', value: '??' },
        { label: '??', value: '??' }
      ]
    },
    {
      label: '??',
      prop: 'result',
      component: 'el-select',
      props: {
        placeholder: '?????',
        clearable: true
      },
      dict: [
        { label: '??', value: '??' },
        { label: '??', value: '??' }
      ]
    },
    {
      label: '????',
      prop: 'operationTime',
      component: 'el-date-picker',
      props: {
        type: 'datetimerange',
        'range-separator': '?',
        'start-placeholder': '????',
        'end-placeholder': '????',
        format: 'YYYY-MM-DD HH:mm:ss',
        'value-format': 'YYYY-MM-DD HH:mm:ss'
      }
    }
  ]
};

// ?????
const detailDialogVisible = ref(false);
const currentLog = ref<any>({});

// ???JSON
const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch (error) {
    return jsonStr;
  }
};

const crudRef = ref();
const viewDetails = (row: any) => {
  currentLog.value = row;
  detailDialogVisible.value = true;
};
</script>

<style lang="scss" scoped>
.audit-page {
  height: 100%;
}

.json-view {
  background: var(--el-fill-color-lighter);
  padding: 15px;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
