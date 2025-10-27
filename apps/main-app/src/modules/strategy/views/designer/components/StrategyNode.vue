<template>
  <div
    class="strategy-node"
    :class="[
      `node-type-${node.type.toLowerCase()}`,
      { 'node-selected': selected }
    ]"
    :style="{
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${node.style?.width || 120}px`,
      height: `${node.style?.height || 80}px`,
      backgroundColor: node.style?.backgroundColor,
      borderColor: selected ? '#409eff' : node.style?.borderColor,
      transform: `scale(${Math.max(0.5, Math.min(2, 1 / zoom))})`
    }"
    @mousedown="handleMouseDown"
    @click="handleClick"
    @dblclick="handleDoubleClick"
  >
    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 节点图标 -->
      <div class="node-icon">
        <el-icon><component :is="getNodeIcon(node.type)" /></el-icon>
      </div>

      <!-- 节点标题 -->
      <div class="node-title">{{ node.name }}</div>

      <!-- 节点描述 -->
      <div v-if="node.description" class="node-description">
        {{ node.description }}
      </div>

      <!-- 节点状态指示器 -->
      <div v-if="hasValidationErrors" class="node-status error">
        <el-icon><WarningFilled /></el-icon>
      </div>
      <div v-else-if="isConfigured" class="node-status success">
        <el-icon><CircleCheckFilled /></el-icon>
      </div>
    </div>

    <!-- 连接点 -->
    <div class="connection-points">
      <!-- 输入连接点 -->
      <div
        v-if="canHaveInput"
        class="connection-point input"
        @mousedown.stop="handleInputConnect"
        @mouseup.stop="handleInputDrop"
      >
        <div class="connection-dot" />
      </div>

      <!-- 普通输出连接点（非条件节点） -->
      <div
        v-if="canHaveOutput && node.type !== 'DECISION' && node.type !== 'CONDITION'"
        class="connection-point output"
        @mousedown.stop="handleOutputConnect"
      >
        <div class="connection-dot" />
      </div>

      <!-- 条件输出连接点（用于决策节点和条件节点） -->
      <template v-if="node.type === 'DECISION' || node.type === 'CONDITION'">
        <div
          class="connection-point output-true"
          @mousedown.stop="(event) => handleConditionalOutputConnect(event, 'true')"
        >
          <div class="connection-dot success" />
          <span class="connection-label">是</span>
        </div>
        <div
          class="connection-point output-false"
          @mousedown.stop="(event) => handleConditionalOutputConnect(event, 'false')"
        >
          <div class="connection-dot danger" />
          <span class="connection-label">否</span>
        </div>
      </template>
    </div>

    <!-- 调整大小手柄 -->
    <div
      v-if="selected"
      class="resize-handles"
    >
      <div
        class="resize-handle bottom-right"
        @mousedown.stop="handleResizeStart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  VideoPlay,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection,
  WarningFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import type { StrategyNode as IStrategyNode, NodeType } from '@/types/strategy';

// Props
interface Props {
  node: IStrategyNode;
  selected: boolean;
  zoom: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  select: [nodeId: string];
  move: [nodeId: string, position: { x: number; y: number }];
  connect: [fromNodeId: string, event: MouseEvent, condition?: 'true' | 'false'];
  edit: [nodeId: string];
  'complete-connection': [nodeId: string];
}>();

// 响应式数据
const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = ref({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

// 计算属性
const canHaveInput = computed(() => {
  return props.node.type !== 'START';
});

const canHaveOutput = computed(() => {
  return props.node.type !== 'END';
});

const isConfigured = computed(() => {
  const { data } = props.node;

  switch (props.node.type) {
    case 'CONDITION':
      return data.conditions && data.conditions.length > 0;
    case 'ACTION':
      return data.actions && data.actions.length > 0;
    case 'DECISION':
      return data.rules && data.rules.length > 0;
    default:
      return true;
  }
});

const hasValidationErrors = computed(() => {
  // 简单的验证逻辑
  if (props.node.type === 'CONDITION' && (!props.node.data.conditions || props.node.data.conditions.length === 0)) {
    return true;
  }
  if (props.node.type === 'ACTION' && (!props.node.data.actions || props.node.data.actions.length === 0)) {
    return true;
  }
  return false;
});

// 工具函数
const getNodeIcon = (type: NodeType) => {
  const iconMap = {
    'START': VideoPlay,
    'END': VideoPause,
    'CONDITION': QuestionFilled,
    'ACTION': Lightning,
    'DECISION': Share,
    'GATEWAY': Connection
  };
  return iconMap[type] || QuestionFilled;
};

// 事件处理
const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit('select', props.node.id);
};

const handleDoubleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit('edit', props.node.id);
};

const handleMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) return; // 只处理左键

  event.stopPropagation();

  isDragging.value = true;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    nodeX: props.node.position.x,
    nodeY: props.node.position.y
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value && !isResizing.value) return;

  if (isDragging.value) {
    const deltaX = (event.clientX - dragStart.value.x) / props.zoom;
    const deltaY = (event.clientY - dragStart.value.y) / props.zoom;

    const newPosition = {
      x: Math.max(0, dragStart.value.nodeX + deltaX),
      y: Math.max(0, dragStart.value.nodeY + deltaY)
    };

    // 实时更新节点位置，确保连接线同步移动
    emit('move', props.node.id, newPosition);
  }

  if (isResizing.value) {
    const deltaX = (event.clientX - resizeStart.value.x) / props.zoom;
    const deltaY = (event.clientY - resizeStart.value.y) / props.zoom;

    const newWidth = Math.max(80, resizeStart.value.width + deltaX);
    const newHeight = Math.max(60, resizeStart.value.height + deltaY);

    // 更新节点样式
    if (props.node.style) {
      props.node.style.width = newWidth;
      props.node.style.height = newHeight;
    }
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  isResizing.value = false;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleResizeStart = (event: MouseEvent) => {
  event.stopPropagation();

  isResizing.value = true;
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: props.node.style?.width || 120,
    height: props.node.style?.height || 80
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleInputConnect = (event: MouseEvent) => {
  // 输入连接点暂时不处理拖拽开始
  event.stopPropagation();
};

const handleInputDrop = (event: MouseEvent) => {
  event.stopPropagation();
  // 通知父组件完成连接
  emit('complete-connection', props.node.id);
};

const handleOutputConnect = (event: MouseEvent) => {
  event.stopPropagation();
  emit('connect', props.node.id, event);
};

const handleConditionalOutputConnect = (event: MouseEvent, condition: 'true' | 'false') => {
  event.stopPropagation();
  emit('connect', props.node.id, event, condition);
};
</script>

<style lang="scss" scoped>
.strategy-node {
  position: absolute;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: var(--el-box-shadow-light);
  transform-origin: center;

  &:hover {
    box-shadow: var(--el-box-shadow);
  }

  &.node-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }

  // 不同类型节点的样式
  &.node-type-start {
    border-color: #67c23a;

    .node-icon {
      color: #67c23a;
    }
  }

  &.node-type-end {
    border-color: #f56c6c;

    .node-icon {
      color: #f56c6c;
    }
  }

  &.node-type-condition {
    border-color: #e6a23c;

    .node-icon {
      color: #e6a23c;
    }

    // 条件节点特殊标识
    .node-title::after {
      content: ' ?';
      color: #e6a23c;
      font-weight: bold;
    }
  }

  &.node-type-action {
    border-color: #409eff;

    .node-icon {
      color: #409eff;
    }
  }

  &.node-type-decision {
    border-color: #909399;

    .node-icon {
      color: #909399;
    }

    // 决策节点特殊标识
    .node-title::after {
      content: ' ?';
      color: #909399;
      font-weight: bold;
    }
  }

  &.node-type-gateway {
    border-color: #9c27b0;

    .node-icon {
      color: #9c27b0;
    }
  }

  .node-content {
    padding: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .node-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .node-title {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 2px;
      color: var(--el-text-color-primary);
    }

    .node-description {
      font-size: 10px;
      color: var(--el-text-color-regular);
      text-align: center;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .node-status {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;

      &.success {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.error {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }
    }
  }

  .connection-points {
    .connection-point {
      position: absolute;
      width: 16px;
      height: 16px;
      cursor: crosshair;
      z-index: 10;

      .connection-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--el-color-primary);
        border: 2px solid var(--el-bg-color);
        box-shadow: 0 0 0 1px var(--el-color-primary), var(--el-box-shadow-light);
        transition: all 0.2s;
        margin: 3px;

        &:hover {
          transform: scale(1.3);
          box-shadow: 0 0 0 2px var(--el-color-primary), var(--el-box-shadow);
        }

        &.success {
          background: var(--el-color-success);
          box-shadow: 0 0 0 1px var(--el-color-success), var(--el-box-shadow-light);

          &:hover {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px var(--el-color-success), var(--el-box-shadow);
          }
        }

        &.danger {
          background: var(--el-color-danger);
          box-shadow: 0 0 0 1px var(--el-color-danger), var(--el-box-shadow-light);

          &:hover {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px var(--el-color-danger), var(--el-box-shadow);
          }
        }
      }

      .connection-label {
        position: absolute;
        font-size: 10px;
        white-space: nowrap;
        pointer-events: none;
        color: var(--el-text-color-regular);
      }

      &.input {
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.output {
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.output-true {
        bottom: -8px;
        right: 15%;
        transform: translateX(50%);

        .connection-label {
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: #67c23a;
          font-weight: 600;
          font-size: 11px;
        }
      }

      &.output-false {
        bottom: -8px;
        left: 15%;
        transform: translateX(-50%);

        .connection-label {
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: #f56c6c;
          font-weight: 600;
          font-size: 11px;
        }
      }
    }
  }

  .resize-handles {
    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #409eff;
      border: 1px solid white;
      border-radius: 2px;

      &.bottom-right {
        bottom: -4px;
        right: -4px;
        cursor: nw-resize;
      }
    }
  }
}

// 缩放适配
@media (max-width: 768px) {
  .strategy-node {
    .node-content {
      .node-title {
        font-size: 11px;
      }

      .node-description {
        font-size: 9px;
      }
    }

    .connection-points {
      .connection-point {
        width: 16px;
        height: 16px;

        .connection-dot {
          width: 10px;
          height: 10px;
        }
      }
    }
  }
}
</style>
