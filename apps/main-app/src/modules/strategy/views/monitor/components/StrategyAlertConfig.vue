<template>
  <div class="strategy-alert-config">
    <div class="config-header">
      <div class="header-info">
        <h3>告警配置</h3>
        <p v-if="strategy">为策略 "{{ strategy.name }}" 配置监控告警</p>
        <p v-else>配置系统级监控告警</p>
      </div>
    </div>

    <el-form :model="alertForm" :rules="alertRules" ref="formRef" label-width="120px">
      <el-form-item label="告警名称" prop="name">
        <el-input v-model="alertForm.name" placeholder="请输入告警名称" />
      </el-form-item>

      <el-form-item label="告警类型" prop="type">
        <el-select v-model="alertForm.type" placeholder="选择告警类型" @change="handleTypeChange">
          <el-option label="性能告警" value="PERFORMANCE" />
          <el-option label="错误率告警" value="ERROR_RATE" />
          <el-option label="执行次数告警" value="EXECUTION_COUNT" />
        </el-select>
      </el-form-item>

      <el-form-item label="监控指标" prop="metric">
        <el-select v-model="alertForm.condition.metric" placeholder="选择监控指标">
          <el-option
            v-for="metric in availableMetrics"
            :key="metric.value"
            :label="metric.label"
            :value="metric.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="比较操作符" prop="operator">
        <el-select v-model="alertForm.condition.operator" placeholder="选择操作符">
          <el-option label="大于 (>)" value="gt" />
          <el-option label="大于等于 (>=)" value="gte" />
          <el-option label="小于 (<)" value="lt" />
          <el-option label="小于等于 (<=)" value="lte" />
          <el-option label="等于 (=)" value="eq" />
        </el-select>
      </el-form-item>

      <el-form-item label="阈值" prop="threshold">
        <el-input-number
          v-model="alertForm.condition.threshold"
          :min="0"
          :precision="getThresholdPrecision()"
          style="width: 100%;"
        />
        <span class="threshold-unit">{{ getThresholdUnit() }}</span>
      </el-form-item>

      <el-form-item label="持续时间" prop="duration">
        <el-input-number
          v-model="alertForm.condition.duration"
          :min="60"
          :max="3600"
          style="width: 100%;"
        />
        <span class="threshold-unit">秒</span>
      </el-form-item>

      <el-form-item label="告警方式">
        <el-checkbox-group v-model="selectedActionTypes">
          <el-checkbox label="EMAIL">邮件通知</el-checkbox>
          <el-checkbox label="WEBHOOK">Webhook</el-checkbox>
          <el-checkbox label="SMS">短信通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 邮件配置 -->
      <template v-if="selectedActionTypes.includes('EMAIL')">
        <el-form-item label="邮件地址">
          <el-input v-model="emailConfig.recipients" placeholder="多个邮箱用逗号分隔" />
        </el-form-item>
        <el-form-item label="邮件主题">
          <el-input v-model="emailConfig.subject" placeholder="告警邮件主题" />
        </el-form-item>
      </template>

      <!-- Webhook配置 -->
      <template v-if="selectedActionTypes.includes('WEBHOOK')">
        <el-form-item label="Webhook URL">
          <el-input v-model="webhookConfig.url" placeholder="https://example.com/webhook" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select v-model="webhookConfig.method">
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 短信配置 -->
      <template v-if="selectedActionTypes.includes('SMS')">
        <el-form-item label="手机号码">
          <el-input v-model="smsConfig.phoneNumbers" placeholder="多个号码用逗号分隔" />
        </el-form-item>
      </template>

      <el-form-item label="启用状态">
        <el-switch v-model="alertForm.enabled" />
      </el-form-item>
    </el-form>

    <!-- 告警预览 -->
    <div class="alert-preview">
      <h4>告警规则预览</h4>
      <div class="preview-content">
        <el-alert
          :title="getPreviewTitle()"
          :description="getPreviewDescription()"
          type="info"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <!-- 现有告警列表 -->
    <div v-if="existingAlerts.length > 0" class="existing-alerts">
      <h4>现有告警规则</h4>
      <el-table :data="existingAlerts" stripe>
        <el-table-column prop="name" label="告警名称" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="condition.metric" label="监控指标" width="120" />
        <el-table-column label="条件" width="150">
          <template #default="{ row }">
            {{ row.condition.operator }} {{ row.condition.threshold }}
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="editAlert(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteAlert(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="form-actions">
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="saveAlert" :loading="saving">
        保存告警规则
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Strategy, StrategyAlert } from '@/types/strategy';
import { StrategyType, StrategyStatus } from '@/types/strategy';
import { strategyService } from '@/services/strategy';

// Props
interface Props {
  strategy?: Strategy;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  save: [];
}>();

// 响应式数据
const formRef = ref();
const saving = ref(false);
const existingAlerts = ref<StrategyAlert[]>([]);
const selectedActionTypes = ref<string[]>([]);

// 表单数据
const alertForm = ref({
  name: '',
  type: 'PERFORMANCE' as const,
  condition: {
    metric: '',
    operator: 'gt',
    threshold: 0,
    duration: 300
  },
  enabled: true
});

// 动作配置
const emailConfig = ref({
  recipients: '',
  subject: '策略监控告警'
});

const webhookConfig = ref({
  url: '',
  method: 'POST'
});

const smsConfig = ref({
  phoneNumbers: ''
});

// 表单验证规则
const alertRules = {
  name: [
    { required: true, message: '请输入告警名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择告警类型', trigger: 'change' }
  ]
};

// 计算属性
const availableMetrics = computed(() => {
  const metricsMap = {
    'PERFORMANCE': [
      { value: 'avg_response_time', label: '平均响应时间' },
      { value: 'p95_response_time', label: 'P95响应时间' },
      { value: 'p99_response_time', label: 'P99响应时间' }
    ],
    'ERROR_RATE': [
      { value: 'error_rate', label: '错误率' },
      { value: 'failure_count', label: '失败次数' }
    ],
    'EXECUTION_COUNT': [
      { value: 'execution_count', label: '执行次数' },
      { value: 'execution_rate', label: '执行频率' }
    ]
  };

  return metricsMap[alertForm.value.type] || [];
});

// 工具函数
const getThresholdPrecision = () => {
  const metric = alertForm.value.condition.metric;
  if (metric === 'error_rate') return 2;
  return 0;
};

const getThresholdUnit = () => {
  const metric = alertForm.value.condition.metric;
  const unitMap: Record<string, string> = {
    'avg_response_time': 'ms',
    'p95_response_time': 'ms',
    'p99_response_time': 'ms',
    'error_rate': '%',
    'failure_count': '次',
    'execution_count': '次',
    'execution_rate': '次/分钟'
  };
  return unitMap[metric] || '';
};

const getTypeLabel = (type: string) => {
  const labelMap = {
    'PERFORMANCE': '性能',
    'ERROR_RATE': '错误率',
    'EXECUTION_COUNT': '执行次数'
  };
  return labelMap[type] || type;
};

const getPreviewTitle = () => {
  if (!alertForm.value.name) return '告警规则预览';
  return `告警规则: ${alertForm.value.name}`;
};

const getPreviewDescription = () => {
  const { condition } = alertForm.value;
  if (!condition.metric) return '请完善告警配置';

  const metricLabel = availableMetrics.value.find(m => m.value === condition.metric)?.label || condition.metric;
  const operatorMap = {
    'gt': '大于',
    'gte': '大于等于',
    'lt': '小于',
    'lte': '小于等于',
    'eq': '等于'
  };

  return `当 ${metricLabel} ${operatorMap[condition.operator]} ${condition.threshold}${getThresholdUnit()} 且持续 ${condition.duration} 秒时触发告警`;
};

// 事件处理
const handleTypeChange = () => {
  alertForm.value.condition.metric = '';
  alertForm.value.condition.threshold = 0;
};

const resetForm = () => {
  alertForm.value = {
    name: '',
    type: 'PERFORMANCE',
    condition: {
      metric: '',
      operator: 'gt',
      threshold: 0,
      duration: 300
    },
    enabled: true
  };
  selectedActionTypes.value = [];
  emailConfig.value = { recipients: '', subject: '策略监控告警' };
  webhookConfig.value = { url: '', method: 'POST' };
  smsConfig.value = { phoneNumbers: '' };
};

const saveAlert = async () => {
  try {
    await formRef.value.validate();

    saving.value = true;

    // 构建告警动作
    const actions = selectedActionTypes.value.map(type => {
      const configMap = {
        'EMAIL': emailConfig.value,
        'WEBHOOK': webhookConfig.value,
        'SMS': smsConfig.value
      };

      return {
        type,
        config: configMap[type] || {}
      };
    });

    const alertData = {
      strategyId: props.strategy?.id || '',
      name: alertForm.value.name,
      type: alertForm.value.type,
      condition: alertForm.value.condition,
      actions,
      enabled: alertForm.value.enabled
    };

    await strategyService.createAlert(alertData);

    ElMessage.success('告警规则保存成功');
    emit('save');

    // 重新加载告警列表
    loadExistingAlerts();
    resetForm();

  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const editAlert = (alert: StrategyAlert) => {
  alertForm.value = {
    name: alert.name,
    type: alert.type,
    condition: { ...alert.condition },
    enabled: alert.enabled
  };

  // 设置动作配置
  selectedActionTypes.value = alert.actions.map(action => action.type);

  alert.actions.forEach(action => {
    if (action.type === 'EMAIL') {
      emailConfig.value = { ...action.config };
    } else if (action.type === 'WEBHOOK') {
      webhookConfig.value = { ...action.config };
    } else if (action.type === 'SMS') {
      smsConfig.value = { ...action.config };
    }
  });
};

const deleteAlert = async (alert: StrategyAlert) => {
  try {
    await ElMessageBox.confirm('确定要删除这个告警规则吗？', '确认删除', {
      type: 'warning'
    });

    await strategyService.deleteAlert(alert.id);
    ElMessage.success('告警规则删除成功');

    loadExistingAlerts();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const loadExistingAlerts = async () => {
  try {
    const alerts = await strategyService.getAlerts(props.strategy?.id);
    existingAlerts.value = alerts;
  } catch (error) {
    console.error('加载告警列表失败:', error);
  }
};

// 生命周期
onMounted(() => {
  loadExistingAlerts();

  // 设置默认告警名称
  if (props.strategy) {
    alertForm.value.name = `${props.strategy.name} - 性能告警`;
  }
});
</script>

<style lang="scss" scoped>
.strategy-alert-config {
  .config-header {
    margin-bottom: 24px;

    .header-info {
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  .threshold-unit {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .alert-preview {
    margin: 24px 0;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .preview-content {
      padding: 12px;
      background: var(--el-bg-color-page);
      border-radius: 6px;
      border: 1px solid var(--el-border-color-light);
    }
  }

  .existing-alerts {
    margin: 24px 0;

    h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .form-actions {
    margin-top: 24px;
    text-align: right;

    .el-button {
      margin-left: 12px;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-checkbox-group) {
    .el-checkbox {
      margin-right: 16px;
      margin-bottom: 8px;
    }
  }
}
</style>
