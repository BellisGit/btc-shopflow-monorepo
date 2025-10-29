<template>
  <div class="strategy-designer">
    <btc-grid-group left-width="320px" right-width="320px">
      <!-- 顶栏左侧：缩放控制 -->
      <template #headerLeft>
        <div class="zoom-controls">
          <el-button-group>
            <el-button @click="handleZoomOut" :disabled="canvasScale <= minScale">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button disabled>{{ scalePercentage }}%</el-button>
            <el-button @click="handleZoomIn" :disabled="canvasScale >= maxScale">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </el-button-group>
          <el-divider direction="vertical" />
          <el-button @click="handleFitToScreen">
            <el-icon><FullScreen /></el-icon>
            适应屏幕
          </el-button>
        </div>
      </template>

      <!-- 顶栏中间：策略名称 -->
      <template #headerMiddle>
        <div class="strategy-input">
          <el-input
            id="strategy-name-input"
            v-model="strategyName"
            placeholder="策略名称"
            style="width: 200px;"
          />
        </div>
      </template>

      <!-- 顶栏右侧：操作按钮 -->
      <template #headerRight>
        <el-button type="primary" @click="validateOrchestration">验证</el-button>
        <el-button type="warning" @click="previewExecution">预览</el-button>
        <el-button type="success" @click="handleSave">保存</el-button>
      </template>

      <!-- 内容左侧：组件库 -->
      <template #bodyLeft>
        <div class="component-library">
          <div class="library-header">
            <btc-search
              id="component-search-input"
              v-model="componentSearch"
              placeholder="搜索组件"
            />
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
                    @click="handleComponentClick(component)"
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
      </template>

      <!-- 内容中间：画布 -->
      <template #bodyMiddle>
        <StrategyDesignerCanvas
          :nodes="nodes"
          :connections="connections"
          :selected-node-id="selectedNodeId"
          :selected-connection-id="selectedConnectionId"
          :is-dragging="isDragging"
          :canvas-scale="canvasScale"
          :pan-x="panX"
          :pan-y="panY"
          :is-connecting="isConnecting"
          :temp-connection="tempConnection"
          :editing-node-id="editingNodeId"
          :editing-text="editingText"
          :active-arrow-direction="activeArrowDirection"
          :show-shape-selector="showShapeSelector"
          :shape-selector-position="shapeSelectorPosition"
          :common-shapes="commonShapes"
          :default-text-config="defaultTextConfig"
          @canvas-drop="handleCanvasDrop"
          @canvas-drag-leave="handleCanvasDragLeave"
          @canvas-mouse-down="handleCanvasMouseDown"
          @canvas-mouse-move="handleCanvasMouseMove"
          @canvas-mouse-up="handleCanvasMouseUp"
          @canvas-click="handleCanvasClick"
          @node-mouse-down="handleNodeMouseDown"
          @node-click="handleNodeClick"
          @node-double-click="handleNodeDoubleClick"
          @node-mouse-enter="handleNodeMouseEnter"
          @node-mouse-leave="handleNodeMouseLeave"
          @connection-mouse-down="handleConnectionMouseDown"
          @arrow-click="(event, node, direction, position) => handleArrowClick(event, node, direction, position)"
          @shape-select="handleShapeSelect"
          @finish-text-editing="finishTextEditing"
          @text-edit-keydown="handleTextEditKeyDown"
          @update:editing-text="editingText = $event"
        />
      </template>

      <!-- 内容右侧：属性面板 -->
      <template #bodyRight>
        <StrategyDesignerProperties
          :selected-node="selectedNode"
          :selected-connection="selectedConnection"
          :node-text-config="nodeTextConfig"
          @update:node-text-config="nodeTextConfig = $event"
          @update-node="updateNode"
          @update-connection="updateConnection"
          @delete-selected="deleteSelected"
        />
      </template>
    </btc-grid-group>
  </div>
</template>

<script setup lang="ts">
import { ZoomIn, ZoomOut, FullScreen } from '@element-plus/icons-vue';
import { useStrategyDesigner } from './composables/useStrategyDesigner';
import StrategyDesignerCanvas from './components/StrategyDesignerCanvas.vue';
import StrategyDesignerProperties from './components/StrategyDesignerProperties.vue';

// 使用策略设计器组合式函数
const {
  // 状态
  nodes,
  connections,
  selectedNodeId,
  selectedNode,
  selectedConnectionId,
  selectedConnection,
  isDragging,
  isConnecting,
  tempConnection,
  panX,
  panY,
  editingNodeId,
  editingText,
  textInputRef,
  activeArrowDirection,
  hoveredNodeId,
  showShapeSelector,
  shapeSelectorVisible,
  shapeSelectorPosition,
  commonShapes,
  nodeTextConfig,
  defaultTextConfig,

  // 画布缩放
  canvasScale,
  minScale,
  maxScale,
  scalePercentage,

  // 策略操作
  strategyName,
  currentOrchestration,

  // 组件库
  componentSearch,
  activeCategories,
  filteredComponentCategories,
  componentLibrary,

  // 方法
  handleZoomIn,
  handleZoomOut,
  handleFitToScreen,
  handleCanvasDrop,
  handleCanvasDragLeave,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasClick,
  handleNodeMouseDown,
  handleNodeClick,
  handleNodeDoubleClick,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleConnectionMouseDown,
  handleArrowClick,
  handleShapeSelect,
  handleComponentClick,
  handleComponentDragStart,
  handleCanvasDragOver,
  parseDropData,
  finishTextEditing,
  cancelTextEditing,
  handleTextEditKeyDown,
  deleteSelected,
  addNode,
  updateNode,
  deleteNode,
  selectNode,
  addConnection,
  updateConnection,
  deleteConnection,
  selectConnection,
  validateOrchestration,
  previewExecution,
  handleSave,

  // 工具函数
  getNodeStyle,
  getNodeColor,
  getOutputConnectionClass,
  getConnectionStyle,
  getConnectionColor,
  getConnectionClass
} = useStrategyDesigner();
</script>

<style lang="scss">
@use './styles/index.scss';

.strategy-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);

  .btc-grid-group {
    flex: 1;
    height: 100%; // 改为 100%，不再减去 header 高度
    min-height: 0; // 确保flex子元素能够正确收缩
  }
}
</style>
