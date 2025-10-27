<template>
  <div class="gateway-node-config">
    <div class="config-header">
      <span>网关配置</span>
    </div>

    <el-form :model="configForm" size="small" label-width="80px">
      <el-form-item label="网关类型" prop="gatewayType">
        <el-select id="gateway-type-select" v-model="configForm.gatewayType" @change="emitUpdate">
          <el-option
            v-for="type in gatewayTypes"
            :key="type.value"
            :id="`gateway-type-${type.value}`"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="合并策略" prop="mergeStrategy">
        <el-select id="gateway-merge-strategy-select" v-model="configForm.mergeStrategy" @change="emitUpdate">
          <el-option id="gateway-merge-all" label="全部通过" value="all" />
          <el-option id="gateway-merge-any" label="任一通过" value="any" />
          <el-option id="gateway-merge-majority" label="多数通过" value="majority" />
          <el-option id="gateway-merge-custom" label="自定义" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="configForm.mergeStrategy === 'custom'" label="自定义规则" prop="customRule">
        <el-input
          id="gateway-custom-rule-input"
          v-model="configForm.customRule"
          type="textarea"
          :rows="3"
          placeholder="如：(result1 && result2) || result3"
          @blur="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="超时时间" prop="timeout">
        <el-input-number
          id="gateway-timeout-input"
          v-model="configForm.timeout"
          :min="1000"
          :max="60000"
          :step="1000"
          @change="emitUpdate"
        />
        <span style="margin-left: 8px; font-size: 12px; color: var(--el-text-color-secondary);">毫秒</span>
      </el-form-item>

      <el-form-item label="并行执行" prop="parallel">
        <el-switch
          id="gateway-parallel-switch"
          v-model="configForm.parallel"
          @change="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="失败处理" prop="failureHandling">
        <el-radio-group id="gateway-failure-handling-group" v-model="configForm.failureHandling" @change="emitUpdate">
          <el-radio id="gateway-failure-continue" label="continue">继续执行</el-radio>
          <el-radio id="gateway-failure-stop" label="stop">停止执行</el-radio>
          <el-radio id="gateway-failure-retry" label="retry">重试</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="configForm.failureHandling === 'retry'" label="重试次数" prop="retryCount">
        <el-input-number
          id="gateway-retry-count-input"
          v-model="configForm.retryCount"
          :min="1"
          :max="10"
          @change="emitUpdate"
        />
      </el-form-item>
    </el-form>

    <!-- 配置预览 -->
    <div class="config-preview">
      <h5>配置预览</h5>
      <pre class="config-json">{{ JSON.stringify(configForm, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Props
interface Props {
  config: Record<string, any>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [config: Record<string, any>];
}>();

// 网关类型选项
const gatewayTypes = [
  { value: 'parallel', label: '并行网关' },
  { value: 'exclusive', label: '排他网关' },
  { value: 'inclusive', label: '包容网关' },
  { value: 'complex', label: '复杂网关' }
];

// 配置表单
const configForm = ref({
  gatewayType: 'parallel',
  mergeStrategy: 'all',
  customRule: '',
  timeout: 5000,
  parallel: true,
  failureHandling: 'continue',
  retryCount: 3,
  ...props.config
});

// 监听配置变化
watch(() => props.config, (newConfig) => {
  configForm.value = {
    gatewayType: 'parallel',
    mergeStrategy: 'all',
    customRule: '',
    timeout: 5000,
    parallel: true,
    failureHandling: 'continue',
    retryCount: 3,
    ...newConfig
  };
}, { deep: true });

// 事件处理
const emitUpdate = () => {
  emit('update', { ...configForm.value });
};
</script>

<style lang="scss" scoped>
.gateway-node-config {
  .config-header {
    margin-bottom: 16px;
    font-weight: 500;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;

    .el-form-item__label {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }

    .el-input,
    .el-select,
    .el-input-number {
      width: 100%;
    }
  }

  .config-preview {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-light);

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: var(--el-text-color-primary);
    }

    .config-json {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 10px;
      color: var(--el-text-color-regular);
      background: var(--el-bg-color-page);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--el-border-color-light);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
