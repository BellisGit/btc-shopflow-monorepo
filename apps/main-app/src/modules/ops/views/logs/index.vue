<template>
  <div class="logs-page">
    <BtcTabs v-model="activeTab" :tabs="logTabs" @tab-change="handleTabChange">
      <!-- 操作日志 Tab -->
      <template #operation>
        <BtcCrud
          v-if="logServices.operationLog"
          ref="operationCrudRef"
          :service="logServices.operationLog"
          style="padding: 10px;"
        >
          <BtcRow>
            <BtcRefreshBtn />
            <BtcFlex1 />
            <BtcSearchKey placeholder="搜索操作日志..." />
          </BtcRow>
          <BtcRow>
            <BtcTable
              :columns="operationLogColumns"
              :autoHeight="true"
              border
              @button-click="handleButtonClick"
            />
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
        </BtcCrud>
        <div v-else class="service-unavailable">
          <el-empty description="操作日志服务暂不可用" />
        </div>
      </template>

      <!-- 请求日志 Tab -->
      <template #request>
        <BtcCrud
          v-if="logServices.requestLog"
          ref="requestCrudRef"
          :service="logServices.requestLog"
          style="padding: 10px;"
        >
          <BtcRow>
            <BtcRefreshBtn />
            <BtcFlex1 />
            <BtcSearchKey placeholder="搜索请求日志..." />
          </BtcRow>
          <BtcRow>
            <BtcTable
              :columns="requestLogColumns"
              :autoHeight="true"
              border
              @button-click="handleButtonClick"
            />
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
        </BtcCrud>
        <div v-else class="service-unavailable">
          <el-empty description="请求日志服务暂不可用" />
        </div>
      </template>
    </BtcTabs>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="detailTitle"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item
          v-for="item in detailFields"
          :key="item.prop"
          :label="item.label"
        >
          <template v-if="item.prop === 'requestData' || item.prop === 'responseData' || item.prop === 'beforeData'">
            <pre class="json-view">{{ formatJson(currentLog[item.prop]) }}</pre>
          </template>
          <template v-else-if="item.prop === 'createdAt'">
            {{ currentLog[item.prop] ? new Date(currentLog[item.prop]).toLocaleString('zh-CN') : '-' }}
          </template>
          <template v-else>
            {{ currentLog[item.prop] || '-' }}
          </template>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作前数据详情 -->
      <template v-if="currentLog.beforeData">
        <el-divider>操作前数据</el-divider>
        <pre class="json-view">{{ formatJson(currentLog.beforeData) }}</pre>
      </template>

      <!-- 请求/响应数据详情 -->
      <template v-if="currentLog.requestData || currentLog.responseData">
        <el-divider>请求数据</el-divider>
        <pre class="json-view">{{ formatJson(currentLog.requestData) }}</pre>

        <el-divider>响应数据</el-divider>
        <pre class="json-view">{{ formatJson(currentLog.responseData) }}</pre>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  BtcTabs,
  BtcCrud,
  BtcRow,
  BtcRefreshBtn,
  BtcFlex1,
  BtcSearchKey,
  BtcTable,
  BtcPagination
} from '@btc/shared-components';
import {
  operationLogColumns,
  requestLogColumns,
  logServices,
  logTabs
} from './config';

defineOptions({
  name: 'OpsLogs'
});

onMounted(() => {
  console.log('[OpsLogs] 组件已加载');
  console.log('[OpsLogs] logServices:', logServices);
});

// 当前激活的tab
const activeTab = ref('operation');

// CRUD 引用
const operationCrudRef = ref();
const requestCrudRef = ref();

// 详情对话框
const detailVisible = ref(false);
const currentLog = ref<any>({});

// 详情标题
const detailTitle = computed(() => {
  return activeTab.value === 'operation' ? '操作日志详情' : '请求日志详情';
});

// 详情字段配置
const detailFields = computed(() => {
  if (activeTab.value === 'operation') {
    return [
      { prop: 'createdAt', label: '操作时间' },
      { prop: 'username', label: '用户名' },
      { prop: 'operationType', label: '操作类型' },
      { prop: 'operationDesc', label: '操作描述' },
      { prop: 'tableName', label: '表名' },
      { prop: 'ipAddress', label: 'IP地址' },
      { prop: 'beforeData', label: '操作前数据' }
    ];
  } else {
    return [
      { prop: 'requestTime', label: '请求时间' },
      { prop: 'userName', label: '用户名' },
      { prop: 'requestUrl', label: '请求地址' },
      { prop: 'method', label: '请求方法' },
      { prop: 'ipAddress', label: 'IP地址' },
      { prop: 'duration', label: '耗时(ms)' },
      { prop: 'status', label: '状态' },
      { prop: 'requestData', label: '请求数据' },
      { prop: 'responseData', label: '响应数据' }
    ];
  }
});

// 处理tab切换
const handleTabChange = (tab: any) => {
  activeTab.value = tab.name;
};

// 处理按钮点击
const handleButtonClick = (result: any) => {
  if (result.action === 'viewDetail') {
    currentLog.value = result.data;
    detailVisible.value = true;
  }
};

// 格式化JSON
const formatJson = (jsonStr: string) => {
  if (!jsonStr) return '-';
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch (_error) {
    return jsonStr;
  }
};
</script>

<style lang="scss" scoped>
.logs-page {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden; // 防止页面滚动，让表格内部处理滚动
}

.service-unavailable {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
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
  margin: 0;
}
</style>
