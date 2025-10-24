<template>
  <div class="audit-page">
    <!-- 操作日志 -->
    <BtcCrud v-if="logType === 'audit'" ref="auditCrudRef" :service="auditService">
      <BtcRow>
        <BtcSelectButton
          v-model="logType"
          :options="logTypeOptions"
          @change="handleLogTypeChange"
        />
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

    <!-- 请求日志 -->
    <BtcCrud v-if="logType === 'request'" ref="requestCrudRef" :service="requestService">
      <BtcRow>
        <BtcSelectButton
          v-model="logType"
          :options="logTypeOptions"
          @change="handleLogTypeChange"
        />
        <BtcRefreshBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索请求地址、用户昵称、IP..." />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="requestTableRef" :columns="requestColumns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
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
import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcTable, BtcPagination, BtcRefreshBtn, BtcRow, BtcFlex1, BtcSearchKey, BtcSelectButton, BtcCodeJson } from '@btc/shared-components';
import { createMockCrudService } from '@utils/http';

defineOptions({
  name: 'OpsAudit'
});

const { t } = useI18n();

// 日志类型选择
const logType = ref('audit');
const logTypeOptions = [
  { label: '操作日志', value: 'audit' },
  { label: '请求日志', value: 'request' }
];

// 处理日志类型切换
const handleLogTypeChange = (value: string) => {
  logType.value = value;
};


// 审计日志服务
const auditService = createMockCrudService('btc_audit_logs');

// 请求日志服务
const requestService = createMockCrudService('btc_request_logs');

// 审计日志列配置
const auditColumns = computed<TableColumn[]>(() => [
  {
    label: '操作时间',
    prop: 'operationTime',
    width: 160
  },
  {
    label: '用户名',
    prop: 'userName',
    width: 100
  },
  {
    label: '操作类型',
    prop: 'operationType',
    width: 100
  },
  {
    label: '资源名称',
    prop: 'resourceName',
    minWidth: 120
  },
  {
    label: 'IP地址',
    prop: 'ipAddress',
    width: 120
  },
  {
    label: '结果',
    prop: 'result',
    width: 80,
    dict: [
      { label: '成功', value: '成功' },
      { label: '失败', value: '失败' }
    ]
  },
  {
    label: '操作',
    prop: 'op',
    width: 100,
    fixed: 'right',
    buttons: [
      {
        label: '详情',
        type: 'primary',
        onClick: ({ scope }: any) => viewDetails(scope.row)
      }
    ]
  }
]);

// 请求日志列配置
const requestColumns = computed<TableColumn[]>(() => [
  {
    label: '用户ID',
    prop: 'userId',
    width: 80
  },
  {
    label: '用户昵称',
    prop: 'name',
    width: 100
  },
  {
    label: '请求地址',
    prop: 'action',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '请求参数',
    prop: 'params',
    minWidth: 200,
    component: {
      name: 'btc-code-json',
      props: {
        popover: true
      }
    }
  },
  {
    label: 'IP地址',
    prop: 'ip',
    width: 120,
    dict: [],
    dictColor: true,
    formatter(row: any) {
      return row.ip.split(',');
    }
  },
  {
    label: '请求时间',
    prop: 'createTime',
    width: 160,
    sortable: true
  },
  {
    label: '耗时(ms)',
    prop: 'duration',
    width: 100,
    formatter(row: any) {
      return `${row.duration}ms`;
    }
  },
  {
    label: '状态',
    prop: 'status',
    width: 80,
    dict: [
      { label: '成功', value: 'success', type: 'success' },
      { label: '失败', value: 'failed', type: 'danger' }
    ]
  }
]);


// CRUD 引用
const auditCrudRef = ref();
const requestCrudRef = ref();

// 审计详情对话框
const detailDialogVisible = ref(false);
const currentLog = ref<any>({});

// 格式化JSON
const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch (_error) {
    return jsonStr;
  }
};

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
