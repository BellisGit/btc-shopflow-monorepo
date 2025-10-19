<template>
  <div class="audit-log">
    <BtcCrud ref="crudRef" :service="auditService">
      <BtcRow>
        <BtcRefreshBtn />
        <el-button @click="handleExport">导出日志</el-button>
        <BtcFlex1 />
        <BtcSearchKey />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border>
          <template #column-result="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
          <template #column-detail="{ row }">
            <el-button link type="primary" @click="showDetail(row)">查看详情</el-button>
          </template>
        </BtcTable>
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="操作日志详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作时间">{{ currentLog.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentLog.userName }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ currentLog.operation }}</el-descriptions-item>
        <el-descriptions-item label="资源">{{ currentLog.resource }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ currentLog.result }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>请求详情（JSON�?/el-divider>
      <pre class="json-view">{{ formatJson(currentLog.requestData) }}</pre>

      <el-divider>响应详情（JSON�?/el-divider>
      <pre class="json-view">{{ formatJson(currentLog.responseData) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const detailVisible = ref(false);
const currentLog = ref<any>({});

// Mock数据服务
const auditService = service.base.department => ({
    id: i + 1,
    operateTime: new Date().toISOString(),
    userName: mockHelpers.randomName(),
    operation: mockHelpers.randomChoice(['新增', '编辑', '删除', '查看', '导出']),
    resource: mockHelpers.randomChoice(['用户', '角色', '部门', '权限', '菜单']),
    ipAddress: `192.168.1.${mockHelpers.randomNumber(1, 254)}`,
    result: mockHelpers.randomChoice(['success', 'success', 'success', 'fail']), // 成功率高
    requestData: JSON.stringify({ id: i + 1, name: '测试数据' }),
    responseData: JSON.stringify({ code: 200, message: '操作成功' }),
  }))
});

const columns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'operateTime', label: '操作时间', minWidth: 160 },
  { prop: 'userName', label: '用户', width: 100 },
  { prop: 'operation', label: '操作', width: 100 },
  { prop: 'resource', label: '资源', width: 100 },
  { prop: 'ipAddress', label: 'IP地址', width: 140 },
  { prop: 'result', label: '结果', width: 100 },
  { prop: 'detail', label: '详情', width: 100 },
]);

const showDetail = (row: any) => {
  currentLog.value = row;
  detailVisible.value = true;
};

const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
};

const handleExport = () => {
  message.info('导出功能开发中...');
};

// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.audit-log {
  padding: 20px;
}

.json-view {
  background: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
}
</style>

