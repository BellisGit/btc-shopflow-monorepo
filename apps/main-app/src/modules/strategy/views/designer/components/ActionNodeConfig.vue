<template>
  <div class="action-node-config">
    <div class="config-header">
      <span>动作配置</span>
      <el-button size="small" type="primary" @click="addAction">
        <el-icon><Plus /></el-icon>
        添加动作
      </el-button>
    </div>

    <div v-if="actions.length === 0" class="empty-state">
      <el-empty description="暂无动作，请添加动作" :image-size="60" />
    </div>

    <div v-else class="actions-list">
      <div
        v-for="(action, index) in actions"
        :key="action.id"
        class="action-item"
      >
        <div class="action-header">
          <span class="action-index">动作 {{ index + 1 }}</span>
          <el-button
            size="small"
            type="danger"
            text
            @click="removeAction(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <btc-config-form :model="action" size="small" label-width="60px">
          <btc-config-form-item label="类型" prop="type">
            <el-select
              v-model="action.type"
              placeholder="选择动作类型"
              @change="emitUpdate"
            >
              <el-option
                v-for="type in actionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </btc-config-form-item>

          <btc-config-form-item label="参数" prop="parametersJson">
            <el-input
              v-model="action.parametersJson"
              type="textarea"
              :rows="3"
              placeholder='{"key": "value"}'
              @blur="updateParameters(action)"
            />
          </btc-config-form-item>

          <btc-config-form-item label="描述" prop="description">
            <el-input
              v-model="action.description"
              placeholder="动作描述"
              @blur="emitUpdate"
            />
          </btc-config-form-item>
        </btc-config-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import type { StrategyAction } from '@/types/strategy';
import { BtcConfigForm, BtcConfigFormItem } from '@/components/btc-config-form';

// Props
interface Props {
  actions: StrategyAction[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [actions: StrategyAction[]];
}>();

// 扩展动作接口以支持JSON编辑
interface ExtendedAction extends StrategyAction {
  parametersJson?: string;
}

// 动作类型选项
const actionTypes = [
  { value: 'ALLOW_ACCESS', label: '允许访问' },
  { value: 'DENY_ACCESS', label: '拒绝访问' },
  { value: 'LOG_EVENT', label: '记录日志' },
  { value: 'SEND_NOTIFICATION', label: '发送通知' },
  { value: 'UPDATE_DATA', label: '更新数据' },
  { value: 'CALL_API', label: '调用接口' },
  { value: 'EXECUTE_SCRIPT', label: '执行脚本' },
  { value: 'SET_VARIABLE', label: '设置变量' }
];

// 计算属性
const actions = computed({
  get: () => props.actions.map(action => ({
    ...action,
    parametersJson: JSON.stringify(action.parameters || {}, null, 2)
  })) as ExtendedAction[],
  set: (value) => {
    const normalizedActions = value.map(action => ({
      id: action.id,
      type: action.type,
      parameters: action.parameters || {},
      description: action.description
    }));
    emit('update', normalizedActions);
  }
});

// 工具函数
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const addAction = () => {
  const newAction: ExtendedAction = {
    id: generateId(),
    type: 'ALLOW_ACCESS',
    parameters: {},
    parametersJson: '{}',
    description: ''
  };

  actions.value = [...actions.value, newAction];
};

const removeAction = (index: number) => {
  const newActions = [...actions.value];
  newActions.splice(index, 1);
  actions.value = newActions;
};

const updateParameters = (action: ExtendedAction) => {
  try {
    action.parameters = JSON.parse(action.parametersJson || '{}');
    emitUpdate();
  } catch (error) {
    ElMessage.error('参数格式错误，请输入有效的JSON');
  }
};

const emitUpdate = () => {
  const normalizedActions = actions.value.map(action => ({
    id: action.id,
    type: action.type,
    parameters: action.parameters || {},
    description: action.description
  }));
  emit('update', normalizedActions);
};
</script>

<style lang="scss" scoped>
.action-node-config {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .empty-state {
    padding: 20px 0;
  }

  .actions-list {
    .action-item {
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      background: var(--el-bg-color-page);

      .action-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .action-index {
          font-size: 12px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      :deep(.btc-config-form-item) {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .btc-config-form-item__label {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
