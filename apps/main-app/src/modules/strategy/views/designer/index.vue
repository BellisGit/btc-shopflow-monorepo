<template>
  <div class="strategy-designer">
    <!-- 工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="currentTool === 'select' ? 'primary' : 'default'"
            @click="setTool('select')"
          >
            <el-icon><Pointer /></el-icon>
            选择
          </el-button>
          <el-button
            :type="currentTool === 'drag' ? 'primary' : 'default'"
            @click="setTool('drag')"
          >
            <el-icon><Rank /></el-icon>
            拖拽
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button @click="resetZoom">
            {{ Math.round(zoom * 100) }}%
          </el-button>
          <el-button @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button @click="handleFitToScreen">
          <el-icon><FullScreen /></el-icon>
          适应屏幕
        </el-button>
      </div>

      <div class="toolbar-center">
        <el-input
          id="strategy-name-input"
          v-model="strategyName"
          placeholder="策略名称"
          style="width: 200px;"
        />
      </div>

      <div class="toolbar-right">
        <el-button @click="validateOrchestration">
          <el-icon><CircleCheck /></el-icon>
          验证
        </el-button>
        <el-button type="warning" @click="previewExecution">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="success" @click="handleSave">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="designer-content">
      <!-- 组件库面板 -->
      <div class="component-library">
        <div class="library-header">
          <h3>组件库</h3>
          <el-input
            id="component-search-input"
            v-model="componentSearch"
            placeholder="搜索组件"
            size="small"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="library-content">
          <el-collapse v-model="activeCategories" accordion>
            <el-collapse-item
              v-for="category in filteredComponentCategories"
              :key="category.name"
              :title="category.title"
              :name="category.name"
              :id="`collapse-${category.name}`"
            >
              <div class="component-list">
                <div
                  v-for="component in category.components"
                  :key="component.type"
                  :id="`component-item-${component.type}`"
                  class="component-item"
                  :data-type="component.type"
                  :draggable="true"
                  role="button"
                  :aria-label="`拖拽 ${component.name} 组件到画布`"
                  @dragstart="handleComponentDragStart($event, component)"
                >
                  <div class="component-icon">
                    <el-icon><component :is="component.icon" /></el-icon>
                  </div>
                  <div class="component-info">
                    <div class="component-name">{{ component.name }}</div>
                    <div class="component-desc">{{ component.description }}</div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="canvas-container">
        <div
          ref="canvasRef"
          class="strategy-canvas"
          :style="{
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'top left'
          }"
          @drop="handleCanvasDrop"
          @dragover="handleCanvasDragOver"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @wheel="(event) => handleCanvasWheel(event, canvasRef || null)"
          @click="handleCanvasClick"
        >
          <!-- 网格背景 -->
          <div class="canvas-grid" />

          <!-- 连接线 -->
          <svg class="connections-layer" :width="canvasWidth" :height="canvasHeight" key="connections-svg">
            <defs>
              <!-- 默认蓝色箭头 -->
              <marker
                id="arrowhead-blue"
                markerWidth="10"
                markerHeight="7"
                refX="8.5"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
              </marker>
              <!-- 绿色箭头（条件为真） -->
              <marker
                id="arrowhead-green"
                markerWidth="10"
                markerHeight="7"
                refX="8.5"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#67c23a" />
              </marker>
              <!-- 红色箭头（条件为假） -->
              <marker
                id="arrowhead-red"
                markerWidth="10"
                markerHeight="7"
                refX="8.5"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f56c6c" />
              </marker>
            </defs>

            <!-- 连接线 -->
            <path
              v-for="connection in connections"
              :key="connection.id"
              :d="getConnectionPath(connection)"
              :stroke="connection.style?.strokeColor || '#409eff'"
              :stroke-width="connection.style?.strokeWidth || 2"
              :stroke-dasharray="connection.style?.strokeDasharray"
              fill="none"
              :marker-end="getArrowMarker(connection)"
              class="connection-path"
              @click="selectConnection(connection)"
            />

            <!-- 临时连接线 -->
            <path
              v-if="connectionState.tempConnection"
              :d="connectionState.tempConnection.path"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
              fill="none"
              marker-end="url(#arrowhead)"
            />
          </svg>

          <!-- 策略节点 -->
          <StrategyNode
            v-for="node in nodes"
            :key="node.id"
            :node="node"
            :selected="selectedNodeId === node.id"
            :zoom="zoom"
            @select="selectNode"
            @move="handleMoveNode"
            @connect="handleStartConnection"
            @edit="editNode"
            @complete-connection="handleCompleteConnection"
          />
        </div>
      </div>

      <!-- 属性面板 -->
      <div class="properties-panel">
        <div class="panel-header">
          <h3>属性配置</h3>
          <el-button
            v-if="selectedNode || selectedConnection"
            size="small"
            type="danger"
            @click="deleteSelected"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>

        <div class="panel-content">
          <!-- 节点属性 -->
          <StrategyNodeProperties
            v-if="selectedNode"
            :node="selectedNode"
            @update="updateNodeProperties"
          />

          <!-- 连接属性 -->
          <StrategyConnectionProperties
            v-else-if="selectedConnection"
            :connection="selectedConnection"
            @update="updateConnectionProperties"
          />

          <!-- 空状态 -->
          <el-empty
            v-else
            description="请选择节点或连接进行配置"
            :image-size="80"
          />
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="策略执行预览" width="80%">
      <StrategyExecutionPreview
        :orchestration="currentOrchestration"
        @close="showPreview = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Pointer,
  Rank,
  ZoomIn,
  ZoomOut,
  FullScreen,
  CircleCheck,
  View,
  Document,
  Search,
  Delete,
  VideoPlay,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection
} from '@element-plus/icons-vue';

// 导入 composables
import { useCanvasInteraction } from './composables/useCanvasInteraction';
import { useNodeManagement } from './composables/useNodeManagement';
import { useConnectionManagement } from './composables/useConnectionManagement';
import { useComponentLibrary } from './composables/useComponentLibrary';
import { useStrategyOperations } from './composables/useStrategyOperations';

// 导入组件
import StrategyNode from './components/StrategyNode.vue';
import StrategyNodeProperties from './components/StrategyNodeProperties.vue';
import StrategyConnectionProperties from './components/StrategyConnectionProperties.vue';
import StrategyExecutionPreview from './components/StrategyExecutionPreview.vue';

// 导入类型
import type { StrategyConnection } from '@/types/strategy';

// 导入样式
import './styles/index.scss';

// Props
interface Props {
  strategyId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  strategyId: ''
});

// 路由
const route = useRoute();
const routeStrategyId = computed(() => route.query.strategyId as string || '');

// 画布引用
const canvasRef = ref<HTMLElement>();
const canvasWidth = ref(2000);
const canvasHeight = ref(2000);

// 使用 composables
const {
  currentTool,
  zoom,
  panX,
  panY,
  setTool,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToScreen,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasWheel
} = useCanvasInteraction();

const {
  nodes,
  selectedNodeId,
  selectedNode,
  addNode,
  selectNode,
  moveNode,
  updateNodeProperties,
  deleteNode,
  clearNodes
} = useNodeManagement();

const {
  connections,
  selectedConnectionId,
  selectedConnection,
  connectionState,
  startConnection,
  updateTempConnection,
  completeConnection,
  selectConnection,
  updateConnectionProperties,
  deleteConnection,
  deleteNodeConnections,
  getConnectionPath,
  clearConnections
} = useConnectionManagement(nodes);

const {
  componentSearch,
  activeCategories,
  filteredComponentCategories,
  handleComponentDragStart,
  handleCanvasDragOver,
  parseDropData
} = useComponentLibrary();

const {
  strategyName,
  showPreview,
  currentOrchestration,
  validateOrchestration,
  previewExecution,
  saveOrchestration,
  loadOrchestration
} = useStrategyOperations(nodes, connections);

// 事件处理
const handleFitToScreen = () => {
  fitToScreen(canvasRef.value || null, nodes.value);
};

const handleCanvasDrop = async (event: DragEvent) => {
  event.preventDefault();
  const component = parseDropData(event);
  if (!component || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = (event.clientX - rect.left - panX.value) / zoom.value;
  const y = (event.clientY - rect.top - panY.value) / zoom.value;

  await addNode(component, { x: Math.max(0, x - 60), y: Math.max(0, y - 40) });
};

const handleCanvasClick = (event: MouseEvent) => {
  if (event.target === canvasRef.value) {
    selectedNodeId.value = '';
    selectedConnectionId.value = '';
  }
};

const handleSave = () => {
  const strategyId = props.strategyId || routeStrategyId.value;
  saveOrchestration(strategyId);
};

const editNode = (nodeId: string) => {
  selectNode(nodeId);
};

// 包装 moveNode 以确保连接线同步更新
const handleMoveNode = (nodeId: string, position: { x: number; y: number }) => {
  moveNode(nodeId, position);
  // 强制触发连接线重新计算（通过触发响应式更新）
  nextTick(() => {
    // 连接线会通过 getConnectionPath 自动重新计算
  });
};

// 连接处理函数
const handleStartConnection = (fromNodeId: string, event: MouseEvent, condition?: 'true' | 'false') => {
  startConnection(fromNodeId, event, condition);
};

const handleCompleteConnection = (toNodeId: string) => {
  completeConnection(toNodeId);
};

// 根据连接条件获取对应的箭头标记
const getArrowMarker = (connection: StrategyConnection) => {
  if (connection.condition === 'true') {
    return 'url(#arrowhead-green)';
  } else if (connection.condition === 'false') {
    return 'url(#arrowhead-red)';
  } else {
    return 'url(#arrowhead-blue)';
  }
};

const deleteSelected = async () => {
  try {
    // 统一的删除确认弹窗
    const elementType = selectedNodeId.value ? '节点' : '连接';
    await ElMessageBox.confirm(`确定要删除选中的${elementType}吗？`, '确认删除', {
      type: 'warning'
    });

    if (selectedNodeId.value) {
      deleteNodeConnections(selectedNodeId.value);
      await deleteNode(selectedNodeId.value, true); // 跳过二次确认
    } else if (selectedConnectionId.value) {
      await deleteConnection(selectedConnectionId.value, true); // 跳过二次确认
    }
  } catch {
    // 用户取消删除
  }
};

// 全局事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' && (selectedNodeId.value || selectedConnectionId.value)) {
    deleteSelected();
  }
};

const handleGlobalMouseMove = (event: MouseEvent) => {
  handleCanvasMouseMove(event);
  updateTempConnection(event, canvasRef.value);
};

const handleGlobalMouseUp = (event: MouseEvent) => {
  handleCanvasMouseUp();

  // 如果正在连接但没有完成连接，则取消连接
  if (connectionState.isConnecting) {
    // 延迟取消，给 complete-connection 事件处理时间
    setTimeout(() => {
      if (connectionState.isConnecting) {
        connectionState.isConnecting = false;
        connectionState.tempConnection = null;
        connectionState.fromNodeId = '';
      }
    }, 10);
  }
};

// 生命周期
onMounted(async () => {
  // 加载现有编排
  const strategyId = props.strategyId || routeStrategyId.value;
  if (strategyId) {
    await loadOrchestration(strategyId);
    await nextTick();
    if (nodes.value.length > 0) {
      handleFitToScreen();
    }
  }

  // 添加全局事件监听
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
});

// 暴露给子组件的方法
defineExpose({
  completeConnection,
  selectNode,
  selectConnection
});
</script>
