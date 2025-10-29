<template>
  <div class="properties-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
      <div class="panel-actions">
        <el-button
          v-if="selectedNode"
          type="danger"
          size="small"
          @click="deleteSelected"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <div class="panel-content">
      <!-- 节点属性配置 -->
      <div v-if="selectedNode" class="node-properties">
        <h4>节点属性</h4>

        <!-- 文本配置 -->
        <div class="text-config">
          <h5>文本配置</h5>

          <div class="config-item">
            <label>字体大小</label>
            <el-input-number
              v-model="nodeTextConfig.fontSize"
              :min="8"
              :max="32"
              :step="1"
              size="small"
            />
          </div>

          <div class="config-item">
            <label>字体族</label>
            <el-select v-model="nodeTextConfig.fontFamily" size="small">
              <el-option
                v-for="font in fontFamilyOptions"
                :key="font.value"
                :label="font.label"
                :value="font.value"
              />
            </el-select>
          </div>

          <div class="config-item">
            <label>字体粗细</label>
            <el-select v-model="nodeTextConfig.fontWeight" size="small">
              <el-option
                v-for="weight in fontWeightOptions"
                :key="weight.value"
                :label="weight.label"
                :value="weight.value"
              />
            </el-select>
          </div>

          <div class="config-item">
            <label>字体样式</label>
            <el-select v-model="nodeTextConfig.fontStyle" size="small">
              <el-option
                v-for="style in fontStyleOptions"
                :key="style.value"
                :label="style.label"
                :value="style.value"
              />
            </el-select>
          </div>

          <!-- 字体预览 -->
          <div class="font-preview">
            <label>预览效果</label>
            <div
              class="preview-text"
              :style="{
                fontSize: nodeTextConfig.fontSize + 'px',
                fontFamily: nodeTextConfig.fontFamily,
                fontWeight: nodeTextConfig.fontWeight,
                fontStyle: nodeTextConfig.fontStyle,
                color: getNodeTextColor(selectedNode.type)
              }"
            >
              {{ selectedNode.text || getNodeText(selectedNode.type) }}
            </div>
          </div>
        </div>

        <!-- 节点类型特定配置 -->
        <div class="node-specific-config">
          <component
            :is="getNodeConfigComponent(selectedNode.type)"
            :model-value="selectedNode"
            @update:model-value="updateNode"
          />
        </div>
      </div>

      <!-- 连接线属性配置 -->
      <div v-else-if="selectedConnection" class="connection-properties">
        <h4>连接线属性</h4>
        <StrategyConnectionProperties
          :model-value="selectedConnection"
          @update:model-value="updateConnection"
        />
      </div>

      <!-- 默认提示 -->
      <div v-else class="empty-state">
        <el-empty description="请选择一个节点或连接线" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import type { StrategyNode, StrategyConnection, NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';
import StrategyConnectionProperties from './StrategyConnectionProperties.vue';
import ActionNodeConfig from './ActionNodeConfig.vue';
import ConditionNodeConfig from './ConditionNodeConfig.vue';
import DecisionNodeConfig from './DecisionNodeConfig.vue';
import GatewayNodeConfig from './GatewayNodeConfig.vue';

interface Props {
  selectedNode: StrategyNode | null;
  selectedConnection: StrategyConnection | null;
  nodeTextConfig: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
  };
}

interface Emits {
  (e: 'update:nodeTextConfig', value: any): void;
  (e: 'update-node', node: StrategyNode): void;
  (e: 'update-connection', connection: StrategyConnection): void;
  (e: 'delete-selected'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 字体配置选项
const fontFamilyOptions = [
  { label: '系统默认', value: 'system-ui, -apple-system, sans-serif' },
  { label: '等宽字体', value: '"JetBrains Mono", "Fira Code", monospace' },
  { label: '衬线字体', value: '"Times New Roman", "Georgia", serif' },
  { label: '圆润字体', value: '"Segoe UI", "PingFang SC", sans-serif' },
  { label: '粗体字体', value: '"Impact", "Arial Black", sans-serif' }
];

const fontWeightOptions = [
  { label: '极细', value: '100' },
  { label: '细体', value: '200' },
  { label: '轻体', value: '300' },
  { label: '正常', value: '400' },
  { label: '中等', value: '500' },
  { label: '粗体', value: '700' }
];

const fontStyleOptions = [
  { label: '正常', value: 'normal' },
  { label: '斜体', value: 'italic' },
  { label: '倾斜', value: 'oblique' }
];

// 计算属性
const nodeTextConfig = computed({
  get: () => props.nodeTextConfig,
  set: (value) => emit('update:nodeTextConfig', value)
});

// 方法
const getNodeConfigComponent = (type: NodeType) => {
  const componentMap = {
    [NodeTypeEnum.ACTION]: ActionNodeConfig,
    [NodeTypeEnum.CONDITION]: ConditionNodeConfig,
    [NodeTypeEnum.DECISION]: DecisionNodeConfig,
    [NodeTypeEnum.GATEWAY]: GatewayNodeConfig
  };
  return componentMap[type] || null;
};

const updateNode = (node: StrategyNode) => {
  emit('update-node', node);
};

const updateConnection = (connection: StrategyConnection) => {
  emit('update-connection', connection);
};

const deleteSelected = () => {
  emit('delete-selected');
};

const getNodeTextColor = (type: NodeType): string => {
  return '#ffffff';
};

const getNodeText = (type: NodeType): string => {
  const textMap = {
    [NodeTypeEnum.START]: '开始',
    [NodeTypeEnum.END]: '结束',
    [NodeTypeEnum.CONDITION]: '条件',
    [NodeTypeEnum.ACTION]: '动作',
    [NodeTypeEnum.DECISION]: '决策',
    [NodeTypeEnum.GATEWAY]: '网关'
  };
  return textMap[type] || '节点';
};
</script>

<style lang="scss">
@use '../styles/properties-panel.scss';
</style>
