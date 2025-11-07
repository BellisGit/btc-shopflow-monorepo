<template>
  <div class="strategy-management">
    <!-- 策略列表 -->
    <BtcCrud ref="crudRef" :service="wrappedService" class="strategy-crud">
      <BtcRow>
        <!-- 策略类型切换 -->
        <BtcSelectButton
          v-model="selectedType"
          :options="strategyTypeOptions"
          @change="handleTypeChange"
        />

        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />

        <!-- 状态筛选 -->
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 120px; margin-left: 8px;"
          @change="handleStatusFilter"
        >
          <el-option
            v-for="status in strategyStatuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>

        <BtcFlex1 />
        <BtcSearchKey />
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :op="{ buttons: ['edit', 'delete', 'test', 'clone', 'export'] }"
          border
        >
          <!-- 版本 -->
          <template #column-version="{ row }">
            <el-link type="primary" @click="showVersionHistory(row)">
              {{ row.version }}
            </el-link>
          </template>

          <!-- 标签 -->
          <template #column-tags="{ row }">
            <div class="strategy-tags">
              <el-tag
                v-for="tag in row.tags?.slice(0, 2)"
                :key="tag"
                size="small"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <el-popover
                v-if="row.tags && row.tags.length > 2"
                placement="top"
                trigger="hover"
                :content="row.tags.slice(2).join(', ')"
              >
                <template #reference>
                  <el-tag size="small" type="info">+{{ row.tags.length - 2 }}</el-tag>
                </template>
              </el-popover>
            </div>
          </template>

          <!-- 自定义操作按钮 -->
          <template #op-test="{ row }">
            <el-button
              type="warning"
              size="small"
              @click="testStrategy(row)"
              :loading="testingStrategies.has(row.id)"
            >
              测试
            </el-button>
          </template>

          <template #op-clone="{ row }">
            <el-button type="info" size="small" @click="cloneStrategy(row)">
              克隆
            </el-button>
          </template>

          <template #op-export="{ row }">
            <el-button type="success" size="small" @click="exportStrategy(row)">
              导出
            </el-button>
          </template>
        </BtcTable>
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <!-- 策略编辑表单 -->
      <BtcUpsert ref="upsertRef" :items="formItems" width="1200px" />
    </BtcCrud>

    <!-- 版本历史对话框 -->
    <el-dialog v-model="showVersionDialog" title="版本历史" width="800px">
      <el-table :data="versionHistory" stripe>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column prop="updatedBy" label="更新人" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="activateVersion(row)">激活</el-button>
            <el-button size="small" type="info" @click="compareVersion(row)">对比</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 策略测试对话框 -->
    <el-dialog v-model="showTestDialog" title="策略测试" width="800px">
      <div class="test-form">
        <el-form :model="testForm" label-width="120px">
          <el-form-item label="测试上下文">
            <el-input
              v-model="testForm.context"
              type="textarea"
              :rows="8"
              placeholder="请输入JSON格式的测试上下文"
            />
          </el-form-item>
        </el-form>
      </div>

      <div v-if="testResult" class="test-result">
        <el-divider>测试结果</el-divider>
        <el-descriptions border :column="2">
          <el-descriptions-item label="执行结果">
            <el-tag :type="testResult.success ? 'success' : 'danger'">
              {{ testResult.success ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="策略效果">
            <el-tag :type="testResult.effect === 'ALLOW' ? 'success' : 'danger'">
              {{ testResult.effect }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行时间">
            {{ testResult.executionTime }}ms
          </el-descriptions-item>
          <el-descriptions-item label="执行步骤">
            {{ testResult.steps?.length || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <el-collapse v-if="testResult.steps && testResult.steps.length > 0" style="margin-top: 16px;">
          <el-collapse-item title="执行步骤详情" name="steps">
            <el-timeline>
              <el-timeline-item
                v-for="step in testResult.steps"
                :key="step.nodeId"
                :type="step.executed ? 'success' : 'info'"
              >
                <div class="step-info">
                  <div class="step-name">{{ step.nodeName }}</div>
                  <div class="step-duration">{{ step.duration }}ms</div>
                  <div v-if="step.result" class="step-result">
                    结果: {{ JSON.stringify(step.result) }}
                  </div>
                  <div v-if="step.error" class="step-error">
                    错误: {{ step.error }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <el-button @click="showTestDialog = false">关闭</el-button>
        <el-button type="primary" @click="runTest" :loading="testing">
          执行测试
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type { TableColumn, FormItem } from '@btc/shared-components';
import type {
  Strategy,
  StrategyTemplate,
  StrategyExecutionResult,
  StrategyExecutionContext
} from '@/types/strategy';
import {
  StrategyType,
  StrategyStatus
} from '@/types/strategy';
import { strategyService } from '@/services/strategy';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// 响应式数据
const selectedType = ref<StrategyType | 'ALL'>('ALL');
const statusFilter = ref<StrategyStatus | ''>('');
const showVersionDialog = ref(false);
const showTestDialog = ref(false);
const testing = ref(false);
const testingStrategies = ref(new Set<string>());
const versionHistory = ref<Strategy[]>([]);
const testForm = ref({
  context: '{\n  "user": {\n    "id": "123",\n    "roles": ["user"],\n    "permissions": ["read"]\n  },\n  "resource": {\n    "type": "document",\n    "id": "doc-001"\n  }\n}'
});
const testResult = ref<StrategyExecutionResult | null>(null);
const currentTestStrategy = ref<Strategy | null>(null);

// 策略类型选项
const strategyTypeOptions = [
  { label: '全部策略', value: 'ALL' },
  { label: '权限策略', value: 'PERMISSION' },
  { label: '业务策略', value: 'BUSINESS' },
  { label: '数据策略', value: 'DATA' },
  { label: '工作流策略', value: 'WORKFLOW' }
];

// 策略状态选项
const strategyStatuses = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'TESTING', label: '测试中' },
  { value: 'ACTIVE', label: '激活' },
  { value: 'INACTIVE', label: '停用' },
  { value: 'ARCHIVED', label: '已归档' }
];

// 策略服务适配器 - 简化版本，避免响应式循环
const wrappedService = {
  ...strategyService,
  delete: async (id: string) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 单个删除：直接传递 ID
    await strategyService.deleteStrategy(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: string[]) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 批量删除：调用 deleteStrategies 方法
    await strategyService.deleteStrategies(ids);

    message.success(t('crud.message.delete_success'));
  }
};

// 表格列配置
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'name', label: '策略名称', minWidth: 180 },
  {
    prop: 'type',
    label: '类型',
    width: 120,
    dict: [
      { label: '权限', value: 'PERMISSION', type: 'danger' },
      { label: '业务', value: 'BUSINESS', type: 'success' },
      { label: '数据', value: 'DATA', type: 'warning' },
      { label: '工作流', value: 'WORKFLOW', type: 'info' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    dict: [
      { label: '草稿', value: 'DRAFT', type: 'info' },
      { label: '测试中', value: 'TESTING', type: 'warning' },
      { label: '激活', value: 'ACTIVE', type: 'success' },
      { label: '停用', value: 'INACTIVE', type: 'danger' },
      { label: '已归档', value: 'ARCHIVED', type: 'default' }
    ]
  },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'tags', label: '标签', width: 150 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'updatedAt', label: '更新时间', width: 180 }
]);

// 表单配置
const formItems = computed<FormItem[]>(() => [
  {
    prop: 'name',
    label: '策略名称',
    span: 12,
    required: true,
    component: { name: 'el-input' }
  },
  {
    prop: 'type',
    label: '策略类型',
    span: 12,
    required: true,
    component: {
      name: 'el-select',
      options: [
        { label: '权限策略', value: 'PERMISSION' },
        { label: '业务策略', value: 'BUSINESS' },
        { label: '数据策略', value: 'DATA' },
        { label: '工作流策略', value: 'WORKFLOW' }
      ]
    }
  },
  {
    prop: 'priority',
    label: '优先级',
    span: 12,
    component: {
      name: 'el-input-number',
      props: { min: 0, max: 1000 }
    },
    value: 100
  },
  {
    prop: 'tags',
    label: '标签',
    span: 12,
    component: {
      name: 'el-input',
      props: { placeholder: '多个标签用逗号分隔' }
    }
  },
  {
    prop: 'description',
    label: '描述',
    span: 24,
    component: {
      name: 'el-input',
      props: { type: 'textarea', rows: 3 }
    }
  }
]);

// 工具函数
const getStatusTagType = (status: StrategyStatus) => {
  const statusMap = {
    'DRAFT': 'info',
    'TESTING': 'warning',
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'ARCHIVED': 'default'
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus) => {
  const labelMap = {
    'DRAFT': '草稿',
    'TESTING': '测试中',
    'ACTIVE': '激活',
    'INACTIVE': '停用',
    'ARCHIVED': '已归档'
  };
  return labelMap[status] || status;
};

// 事件处理函数
const handleTypeChange = () => {
  // 类型变化时重新加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

const handleStatusFilter = () => {
  // 状态变化时重新加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

const showVersionHistory = async (strategy: Strategy) => {
  try {
    versionHistory.value = await strategyService.getStrategyVersions(strategy.id);
    showVersionDialog.value = true;
  } catch (error) {
    BtcMessage.error('获取版本历史失败');
  }
};

const activateVersion = async (version: Strategy) => {
  try {
    await strategyService.activateStrategyVersion(version.id, version.version);
    BtcMessage.success('版本激活成功');
    showVersionDialog.value = false;
    crudRef.value?.crud.loadData();
  } catch (error) {
    BtcMessage.error('版本激活失败');
  }
};

const compareVersion = (version: Strategy) => {
  BtcMessage.info('版本对比功能将在后续版本实现');
};

const testStrategy = (strategy: Strategy) => {
  currentTestStrategy.value = strategy;
  testResult.value = null;
  showTestDialog.value = true;
};

const runTest = async () => {
  if (!currentTestStrategy.value) return;

  testing.value = true;
  testingStrategies.value.add(currentTestStrategy.value.id);

  try {
    const context: StrategyExecutionContext = {
      strategyId: currentTestStrategy.value.id,
      executionId: Date.now().toString(),
      input: JSON.parse(testForm.value.context),
      variables: {},
      environment: {
        timestamp: Date.now(),
        source: 'test'
      }
    };

    testResult.value = await strategyService.testStrategy(currentTestStrategy.value.id, context);
    BtcMessage.success('策略测试完成');
  } catch (error) {
    BtcMessage.error('策略测试失败');
  } finally {
    testing.value = false;
    testingStrategies.value.delete(currentTestStrategy.value.id);
  }
};

const cloneStrategy = async (strategy: Strategy) => {
  try {
    const cloned = await strategyService.createStrategy({
      ...strategy,
      name: `${strategy.name} (副本)`,
      status: 'DRAFT' as StrategyStatus,
      version: '1.0.0'
    });
    BtcMessage.success('策略克隆成功');
    crudRef.value?.crud.loadData();
  } catch (error) {
    BtcMessage.error('策略克隆失败');
  }
};

const exportStrategy = async (strategy: Strategy) => {
  try {
    const blob = await strategyService.exportStrategy(strategy.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-${strategy.name}-${strategy.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
    BtcMessage.success('策略导出成功');
  } catch (error) {
    BtcMessage.error('策略导出失败');
  }
};

// 初始化
onMounted(() => {
  // 延迟加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>
.strategy-management {
  padding: 16px;

  .strategy-crud {
    .strategy-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
  }

  .test-form {
    margin-bottom: 16px;
  }

  .test-result {
    .step-info {
      .step-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .step-duration {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .step-result {
        font-size: 12px;
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
        padding: 4px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .step-error {
        font-size: 12px;
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }
}
</style>
