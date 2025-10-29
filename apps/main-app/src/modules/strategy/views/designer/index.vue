<template>
  <div class="strategy-designer">
    <btc-grid-group left-width="200px" right-width="320px">
      <!-- 顶栏左侧：缩放控制 -->
      <template #headerLeft>
        <div class="zoom-controls btc-flex1">
          <el-button @click="handleZoomOut" :disabled="canvasScale <= minScale">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-dropdown @command="handleZoomCommand" trigger="click" placement="bottom">
            <el-input
              v-model="scaleInputValue"
              @blur="handleScaleInputBlur"
              @keydown.enter="handleScaleInputEnter"
              @input="handleScaleInputChange"
              class="zoom-input"
              size="default"
            />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="fit">
                    <el-icon><FullScreen /></el-icon>
                    适应窗口大小
                  </el-dropdown-item>
                  <el-dropdown-item divided command="100">100%</el-dropdown-item>
                  <el-dropdown-item command="125">125%</el-dropdown-item>
                  <el-dropdown-item command="150">150%</el-dropdown-item>
                  <el-dropdown-item command="175">175%</el-dropdown-item>
                  <el-dropdown-item command="200">200%</el-dropdown-item>
                  <el-dropdown-item command="250">250%</el-dropdown-item>
                  <el-dropdown-item command="300">300%</el-dropdown-item>
                </el-dropdown-menu>
              </template>
          </el-dropdown>
          <el-button @click="handleZoomIn" :disabled="canvasScale >= maxScale">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 顶栏中间：策略名称 -->
      <template #headerMiddle>
        <div class="strategy-input btc-flex1">
          <el-input
            id="strategy-name-input"
            v-model="strategyName"
            placeholder="策略名称"
            style="width: 200px; margin-left: auto; margin-right: 16px;"
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
              size="small"
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
        <div class="canvas-container">
          <!-- SVG 画布 -->
          <svg
            class="strategy-canvas"
            :class="{ dragging: isDragging }"
            :style="{ transform: `translate(${panX}px, ${panY}px) scale(${canvasScale})` }"
            :viewBox="`0 0 ${canvasDimensions.width} ${canvasDimensions.height}`"
            :width="canvasDimensions.width"
            :height="canvasDimensions.height"
            preserveAspectRatio="none"
            @drop="handleCanvasDrop"
            @dragover="(event) => event.preventDefault()"
            @dragleave="handleCanvasDragLeave"
            @mousedown="handleCanvasMouseDown"
            @mousemove="handleCanvasMouseMove"
            @mouseup="handleCanvasMouseUp"
            @click="handleCanvasClick"
          >
            <!-- 定义箭头标记和网格 -->
            <defs>
              <!-- 小网格模式定义 (10x10) -->
              <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" :stroke="getGridColor(true)" stroke-width="0.3"/>
              </pattern>

              <!-- 大网格模式定义 (50x50) -->
              <pattern id="grid-large" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" :stroke="getGridColor(false)" stroke-width="0.5"/>
              </pattern>

              <!-- 边界网格模式 - 确保边界线完整显示 -->
              <pattern :id="`grid-boundary-${canvasDimensions.width}-${canvasDimensions.height}`"
                       :width="canvasDimensions.width"
                       :height="canvasDimensions.height"
                       patternUnits="userSpaceOnUse">
                <!-- 小网格填充 -->
                <rect width="100%" height="100%" fill="url(#grid-small)"/>

                <!-- 大网格线 - 包括边界线 -->
                <g>
                  <!-- 垂直线 -->
                  <g v-for="x in Math.floor(canvasDimensions.width / 50) + 1" :key="`v-${x-1}`">
                    <path :d="`M ${(x-1) * 50} 0 L ${(x-1) * 50} ${canvasDimensions.height}`"
                          fill="none" :stroke="getGridColor(false)" stroke-width="0.5"/>
                  </g>
                  <!-- 水平线 -->
                  <g v-for="y in Math.floor(canvasDimensions.height / 50) + 1" :key="`h-${y-1}`">
                    <path :d="`M 0 ${(y-1) * 50} L ${canvasDimensions.width} ${(y-1) * 50}`"
                          fill="none" :stroke="getGridColor(false)" stroke-width="0.5"/>
                  </g>
                </g>
              </pattern>

              <!-- 默认连接线箭头 - draw.io 风格 -->
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                class="connection-marker"
              >
                <polygon points="0 0, 8 3, 0 6" :fill="getConnectionColor()" />
              </marker>
              <!-- 条件为真时的连接线箭头 -->
              <marker
                id="arrowhead-true"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                class="connection-marker"
              >
                <polygon points="0 0, 8 3, 0 6" :fill="getConnectionColor()" />
              </marker>
              <!-- 条件为假时的连接线箭头 -->
              <marker
                id="arrowhead-false"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                class="connection-marker"
              >
                <polygon points="0 0, 8 3, 0 6" :fill="getConnectionColor()" />
              </marker>
            </defs>

            <!-- 网格背景 - 确保边界线完整显示 -->
            <rect :width="canvasDimensions.width" :height="canvasDimensions.height" :fill="`url(#grid-boundary-${canvasDimensions.width}-${canvasDimensions.height})`" />

            <!-- 已建立的连接线 -->
            <g v-for="pathData in connectionPaths" :key="pathData.id" class="connection-group">
              <path
                :d="pathData.path"
                :stroke="pathData.color"
                stroke-width="2"
                fill="none"
                class="connection-path"
                :marker-end="pathData.marker"
                @click="selectConnection(connections.find(c => c.id === pathData.id)!)"
              />
            </g>

            <!-- 临时连接线 -->
            <g v-if="tempConnection" class="temp-connection-group">
              <path
                :d="tempConnection.path"
                :stroke="getTempConnectionColor()"
                stroke-width="2"
                stroke-dasharray="5,5"
                fill="none"
                class="temp-connection-line"
              />
            </g>

            <!-- 节点层 -->
            <g v-for="node in nodes" :key="node.id">
              <!-- 节点主体 -->
              <g
                :class="[
                  'strategy-node',
                  node.type,
                  { selected: selectedNodeId === node.id }
                ]"
                :data-node-id="node.id"
                :transform="`translate(${node.position.x}, ${node.position.y})`"
                @mousedown="handleNodeMouseDown($event, node, editingNodeId === node.id)"
                @click="handleNodeClick(node, $event)"
                @dblclick="handleNodeDoubleClick(node, $event)"
                @mouseenter="handleNodeMouseEnter(node)"
                @mouseleave="handleNodeMouseLeave"
              >
                <!-- 节点矩形 - 简化版本 -->
                <rect
                  :width="node.style?.width || 120"
                  :height="node.style?.height || 60"
                  :fill="getNodeFillColor(node.type)"
                  :stroke="getNodeStrokeColor(node.type)"
                  stroke-width="2"
                  rx="4"
                  ry="4"
                  class="node-rect"
                />

                <!-- 节点文字 - 居中显示 -->
                <text
                  v-if="editingNodeId !== node.id"
                  :x="(node.style?.width || 120) / 2"
                  :y="(node.style?.height || 60) / 2"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  :fill="getNodeTextColor(node.type)"
                  :font-family="node.textConfig?.fontFamily || defaultTextConfig.fontFamily"
                  :font-weight="node.textConfig?.fontWeight || defaultTextConfig.fontWeight"
                  :font-style="node.textConfig?.fontStyle || defaultTextConfig.fontStyle"
                  :font-size="(node.textConfig?.fontSize || defaultTextConfig.fontSize) + 'px'"
                  class="node-text"
                >
                  {{ node.text || getNodeText(node.type) }}
                </text>

                <!-- 文本编辑模式 -->
                <foreignObject
                  v-if="editingNodeId === node.id"
                  :x="0"
                  :y="0"
                  :width="node.style?.width || 120"
                  :height="node.style?.height || 60"
                >
                  <div class="text-edit-container">
                    <input
                      v-model="editingText"
                      type="text"
                      class="node-text-input"
                      :style="{
                        fontSize: (node.textConfig?.fontSize || defaultTextConfig.fontSize) + 'px',
                        fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
                        fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
                        fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle,
                        color: getNodeTextColor(node.type)
                      }"
                      @blur="finishTextEditing"
                      @keydown="handleTextEditKeyDown"
                      ref="textInputRef"
                    />
                  </div>
                </foreignObject>

        <!-- 8个连接点 - 悬停或选中时显示 -->
        <g class="connection-points" :class="{ visible: hoveredNodeId === node.id || selectedNodeId === node.id }">
                  <!-- 四个顶点连接点 -->
                  <!-- 左上角 -->
                  <circle
                    :cx="0"
                    :cy="0"
                    r="4"
                    fill="white"
                    stroke="#666666"
                    stroke-width="1"
                    class="connection-dot vertex"
                    @click="handleConnectionPointClick($event, node, 'top-left')"
                  />

                  <!-- 右上角 -->
                  <circle
                    :cx="(node.style?.width || 120)"
                    :cy="0"
                    r="4"
                    fill="white"
                    stroke="#666666"
                    stroke-width="1"
                    class="connection-dot vertex"
                    @click="handleConnectionPointClick($event, node, 'top-right')"
                  />

                  <!-- 左下角 -->
                  <circle
                    :cx="0"
                    :cy="(node.style?.height || 60)"
                    r="4"
                    fill="white"
                    stroke="#666666"
                    stroke-width="1"
                    class="connection-dot vertex"
                    @click="handleConnectionPointClick($event, node, 'bottom-left')"
                  />

                  <!-- 右下角 -->
                  <circle
                    :cx="(node.style?.width || 120)"
                    :cy="(node.style?.height || 60)"
                    r="4"
                    fill="white"
                    stroke="#666666"
                    stroke-width="1"
                    class="connection-dot vertex"
                    @click="handleConnectionPointClick($event, node, 'bottom-right')"
                  />

                  <!-- 四个边线中点连接点 + 箭头 -->
                  <!-- 顶部中点 -->
                  <g class="edge-connection-group">
                    <circle
                      :cx="(node.style?.width || 120) / 2"
                      :cy="0"
                      r="4"
                      fill="white"
                      stroke="#666666"
                      stroke-width="1"
                      class="connection-dot edge"
                      @click="handleConnectionPointClick($event, node, 'top')"
                    />
                    <!-- 顶部箭头 - 使用 path 绘制完整箭头 -->
                    <g
                      class="connection-arrow-group"
                      :class="{
                        'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                        'active': activeArrowDirection === 'top' && selectedNodeId === node.id
                      }"
                      @click="handleArrowClick($event, node, 'top')"
                    >
                      <!-- 使用 path 绘制完整箭头 - draw.io 风格 -->
                      <path
                        :d="`M ${(node.style?.width || 120) / 2 - 3} ${-12}
                             L ${(node.style?.width || 120) / 2 - 3} ${-28}
                             L ${(node.style?.width || 120) / 2 - 6} ${-28}
                             L ${(node.style?.width || 120) / 2} ${-36}
                             L ${(node.style?.width || 120) / 2 + 6} ${-28}
                             L ${(node.style?.width || 120) / 2 + 3} ${-28}
                             L ${(node.style?.width || 120) / 2 + 3} ${-12}
                             Z`"
                        class="arrow-shape"
                      />
                    </g>
                  </g>

                  <!-- 右侧中点 -->
                  <g class="edge-connection-group">
                    <circle
                      :cx="(node.style?.width || 120)"
                      :cy="(node.style?.height || 60) / 2"
                      r="4"
                      fill="white"
                      stroke="#666666"
                      stroke-width="1"
                      class="connection-dot edge"
                      @click="handleConnectionPointClick($event, node, 'right')"
                    />
                    <!-- 右侧箭头 - 使用 path 绘制完整箭头 -->
                    <g
                      class="connection-arrow-group"
                      :class="{
                        'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                        'active': activeArrowDirection === 'right' && selectedNodeId === node.id
                      }"
                      @click="handleArrowClick($event, node, 'right')"
                    >
                      <!-- 使用 path 绘制完整箭头 - draw.io 风格 -->
                      <path
                        :d="`M ${(node.style?.width || 120) + 12} ${(node.style?.height || 60) / 2 - 3}
                             L ${(node.style?.width || 120) + 28} ${(node.style?.height || 60) / 2 - 3}
                             L ${(node.style?.width || 120) + 28} ${(node.style?.height || 60) / 2 - 6}
                             L ${(node.style?.width || 120) + 36} ${(node.style?.height || 60) / 2}
                             L ${(node.style?.width || 120) + 28} ${(node.style?.height || 60) / 2 + 6}
                             L ${(node.style?.width || 120) + 28} ${(node.style?.height || 60) / 2 + 3}
                             L ${(node.style?.width || 120) + 12} ${(node.style?.height || 60) / 2 + 3}
                             Z`"
                        class="arrow-shape"
                      />
                    </g>
                  </g>

                  <!-- 底部中点 -->
                  <g class="edge-connection-group">
                    <circle
                      :cx="(node.style?.width || 120) / 2"
                      :cy="(node.style?.height || 60)"
                      r="4"
                      fill="white"
                      stroke="#666666"
                      stroke-width="1"
                      class="connection-dot edge"
                      @click="handleConnectionPointClick($event, node, 'bottom')"
                    />
                    <!-- 底部箭头 - 使用 path 绘制完整箭头 -->
                    <g
                      class="connection-arrow-group"
                      :class="{
                        'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                        'active': activeArrowDirection === 'bottom' && selectedNodeId === node.id
                      }"
                      @click="handleArrowClick($event, node, 'bottom')"
                    >
                      <!-- 使用 path 绘制完整箭头 - draw.io 风格 -->
                      <path
                        :d="`M ${(node.style?.width || 120) / 2 - 3} ${(node.style?.height || 60) + 12}
                             L ${(node.style?.width || 120) / 2 - 3} ${(node.style?.height || 60) + 28}
                             L ${(node.style?.width || 120) / 2 - 6} ${(node.style?.height || 60) + 28}
                             L ${(node.style?.width || 120) / 2} ${(node.style?.height || 60) + 36}
                             L ${(node.style?.width || 120) / 2 + 6} ${(node.style?.height || 60) + 28}
                             L ${(node.style?.width || 120) / 2 + 3} ${(node.style?.height || 60) + 28}
                             L ${(node.style?.width || 120) / 2 + 3} ${(node.style?.height || 60) + 12}
                             Z`"
                        class="arrow-shape"
                      />
                    </g>
                  </g>

                  <!-- 左侧中点 -->
                  <g class="edge-connection-group">
                    <circle
                      :cx="0"
                      :cy="(node.style?.height || 60) / 2"
                      r="4"
                      fill="white"
                      stroke="#666666"
                      stroke-width="1"
                      class="connection-dot edge"
                      @click="handleConnectionPointClick($event, node, 'left')"
                    />
                    <!-- 左侧箭头 - 使用 path 绘制完整箭头 -->
                    <g
                      class="connection-arrow-group"
                      :class="{
                        'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                        'active': activeArrowDirection === 'left' && selectedNodeId === node.id
                      }"
                      @click="handleArrowClick($event, node, 'left')"
                    >
                      <!-- 使用 path 绘制完整箭头 - draw.io 风格 -->
                      <path
                        :d="`M -12 ${(node.style?.height || 60) / 2 - 3}
                             L -28 ${(node.style?.height || 60) / 2 - 3}
                             L -28 ${(node.style?.height || 60) / 2 - 6}
                             L -36 ${(node.style?.height || 60) / 2}
                             L -28 ${(node.style?.height || 60) / 2 + 6}
                             L -28 ${(node.style?.height || 60) / 2 + 3}
                             L -12 ${(node.style?.height || 60) / 2 + 3}
                             Z`"
                        class="arrow-shape"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </template>

      <!-- 内容右侧：属性面板 -->
      <template #bodyRight>
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
            <!-- 文本配置 -->
            <div class="text-config-section">
              <h4>文本配置</h4>
              <el-form label-width="80px" size="small">
                <el-form-item label="字体大小">
            <el-input-number
              v-model="nodeTextConfig.fontSize"
              :min="8"
              :max="32"
              :step="1"
              controls-position="right"
              style="width: 100%"
            />
                </el-form-item>
                <el-form-item label="字体族">
                  <el-select v-model="nodeTextConfig.fontFamily" style="width: 100%">
                    <el-option
                      v-for="option in fontFamilyOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="字体粗细">
                  <el-select v-model="nodeTextConfig.fontWeight" style="width: 100%">
                    <el-option label="极细" value="100" />
                    <el-option label="细体" value="300" />
                    <el-option label="正常" value="normal" />
                    <el-option label="中等" value="500" />
                    <el-option label="粗体" value="bold" />
                    <el-option label="极粗" value="900" />
                  </el-select>
                </el-form-item>
                <el-form-item label="字体样式">
                  <el-select v-model="nodeTextConfig.fontStyle" style="width: 100%">
                    <el-option label="正常" value="normal" />
                    <el-option label="斜体" value="italic" />
                    <el-option label="倾斜" value="oblique" />
                  </el-select>
                </el-form-item>
              </el-form>

              <!-- 字体预览 -->
              <div class="font-preview">
                <h5>预览效果</h5>
                <div
                  class="preview-text"
                  :style="{
                    fontSize: nodeTextConfig.fontSize + 'px',
                    fontFamily: nodeTextConfig.fontFamily,
                    fontWeight: nodeTextConfig.fontWeight,
                    fontStyle: nodeTextConfig.fontStyle
                  }"
                >
                  开始节点
                </div>
              </div>
            </div>

            <!-- 节点属性 -->
            <StrategyNodeProperties
              v-if="selectedNode"
              :node="selectedNode"
              @update="updateNode"
            />

            <!-- 连接属性 -->
            <StrategyConnectionProperties
              v-if="selectedConnection"
              :connection="selectedConnection"
              @update="updateConnection"
            />

            <!-- 空状态 -->
            <div v-if="!selectedNode && !selectedConnection" class="empty-state">
              <div class="empty-icon">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="empty-text">
                请选择一个节点或连接线来配置属性
              </div>
            </div>
          </div>
        </div>
      </template>
    </btc-grid-group>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="策略执行预览" width="80%">
      <StrategyExecutionPreview
        :orchestration="currentOrchestration"
        @close="showPreview = false"
      />
    </el-dialog>

    <!-- 形状选择弹窗 -->
    <div
      v-if="showComponentMenuFlag"
      class="shape-selector-popup"
      :style="{
        left: componentMenuPosition.x + 'px',
        top: componentMenuPosition.y + 'px'
      }"
      @click.stop
    >
      <div class="shape-grid">
        <div
          v-for="component in getCommonComponents()"
          :key="component.type"
          class="shape-item"
          @click="selectComponent(component)"
        >
          <!-- 显示形状而不是图标 -->
          <svg width="40" height="40" viewBox="0 0 40 40">
            <rect
              v-if="component.type === 'START' || component.type === 'END'"
              x="5" y="10" width="30" height="20"
              :fill="getNodeFillColor(component.type)"
              :stroke="getNodeStrokeColor(component.type)"
              stroke-width="2"
              rx="4"
            />
            <path
              v-else-if="component.type === 'CONDITION'"
              :d="`M 20 5 L 35 20 L 20 35 L 5 20 Z`"
              :fill="getNodeFillColor(component.type)"
              :stroke="getNodeStrokeColor(component.type)"
              stroke-width="2"
            />
            <rect
              v-else-if="component.type === 'ACTION'"
              x="5" y="5" width="30" height="30"
              :fill="getNodeFillColor(component.type)"
              :stroke="getNodeStrokeColor(component.type)"
              stroke-width="2"
              rx="4"
            />
            <path
              v-else-if="component.type === 'DECISION'"
              :d="`M 20 5 L 35 20 L 20 35 L 5 20 Z`"
              :fill="getNodeFillColor(component.type)"
              :stroke="getNodeStrokeColor(component.type)"
              stroke-width="2"
            />
            <rect
              v-else-if="component.type === 'GATEWAY'"
              x="5" y="5" width="30" height="30"
              :fill="getNodeFillColor(component.type)"
              :stroke="getNodeStrokeColor(component.type)"
              stroke-width="2"
              rx="4"
            />
          </svg>
          <span class="shape-name">{{ component.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
import { ConnectorType } from '@/types/strategy';
import {
  ZoomIn,
  ZoomOut,
  FullScreen,
  Delete,
  Setting,
  VideoPlay,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection,
  ArrowDown
} from '@element-plus/icons-vue';

import { BtcSelectButton, BtcSearch, BtcGridGroup } from '@btc/shared-components';
import { useComponentLibrary } from './composables/useComponentLibrary';
import { useCanvasInteraction } from './composables/useCanvasInteraction';
import { useNodeManagement } from './composables/useNodeManagement';
import { useConnectionManagement } from './composables/useConnectionManagement';
import { useStrategyOperations } from './composables/useStrategyOperations';
import StrategyNodeProperties from './components/StrategyNodeProperties.vue';
import StrategyConnectionProperties from './components/StrategyConnectionProperties.vue';
import StrategyExecutionPreview from './components/StrategyExecutionPreview.vue';

// 路由
const route = useRoute();

// 使用 composables
// 先定义基础状态
// 节点管理
const {
  nodes,
  selectedNode,
  selectedNodeId,
  isDragging: nodeIsDragging,
  draggingNodeId,
  addNode,
  updateNode,
  deleteNode,
  selectNode,
  getNodeStyle,
  getNodeColor,
  getOutputConnectionClass,
  handleNodeMouseDown
} = useNodeManagement();

// 连接管理
const {
  connections,
  selectedConnectionId,
  selectedConnection,
  connectionState,
  tempConnection,
  connectionPaths,
  startConnection,
  updateTempConnection,
  completeConnection,
  getConnectionPath,
  getConnectionMarker,
  handleConnectionStart,
  selectConnection,
  deleteConnection,
  updateConnection
} = useConnectionManagement(nodes);

// 画布交互
const {
  zoom,
  panX,
  panY,
  dragState,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToScreen,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasWheel
} = useCanvasInteraction(updateTempConnection);

  // 计算属性
  const isDragging = computed(() => dragState.isDragging || nodeIsDragging.value);

// 获取临时连接线颜色
const getTempConnectionColor = () => {
  if (!connectionState.isConnecting || !connectionState.fromNodeId) {
    return 'var(--el-color-primary)';
  }

  const fromNode = nodes.value.find(n => n.id === connectionState.fromNodeId);
  if (!fromNode) {
    return 'var(--el-color-primary)';
  }

  // 根据节点类型和连接条件返回颜色
  if (fromNode.type === 'CONDITION' || fromNode.type === 'DECISION') {
    if (connectionState.fromCondition === 'true') {
      return 'var(--el-color-success)'; // 绿色
    } else if (connectionState.fromCondition === 'false') {
      return 'var(--el-color-danger)'; // 红色
    }
  }

  return 'var(--el-color-primary)'; // 默认蓝色
};

// 获取节点文字 - 简化版本
const getNodeText = (type: string) => {
  const textMap: Record<string, string> = {
    'START': '开始',
    'END': '结束',
    'CONDITION': '条件',
    'ACTION': '动作',
    'DECISION': '决策',
    'GATEWAY': '网关'
  };
  return textMap[type] || '节点';
};

// 获取节点填充颜色 - draw.io 风格
const getNodeFillColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'START': '#d5e8d4',      // 浅绿色
    'END': '#f8cecc',        // 浅红色
    'CONDITION': '#fff2cc',  // 浅黄色
    'ACTION': '#dae8fc',     // 浅蓝色
    'DECISION': '#e1d5e7',   // 浅紫色
    'GATEWAY': '#f5f5f5'     // 浅灰色
  };
  return colorMap[type] || '#f5f5f5';
};

// 获取节点边框颜色 - draw.io 风格
const getNodeStrokeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'START': '#82b366',      // 绿色
    'END': '#b85450',        // 红色
    'CONDITION': '#d6b656',  // 黄色
    'ACTION': '#6c8ebf',     // 蓝色
    'DECISION': '#9673a6',   // 紫色
    'GATEWAY': '#666666'     // 灰色
  };
  return colorMap[type] || '#666666';
};

// 获取节点文字颜色 - draw.io 风格
const getNodeTextColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'START': '#2d5016',      // 深绿色
    'END': '#5c2121',        // 深红色
    'CONDITION': '#6c5b00',  // 深黄色
    'ACTION': '#1f4e79',     // 深蓝色
    'DECISION': '#4c2a5c',   // 深紫色
    'GATEWAY': '#333333'     // 深灰色
  };
  return colorMap[type] || '#333333';
};

// 连接点点击处理
const handleConnectionPointClick = (event: MouseEvent, node: any, direction: string) => {
  event.stopPropagation();
  // 连接点点击暂时不处理，只处理箭头点击
};

// 箭头点击处理
const handleArrowClick = (event: MouseEvent, node: any, direction: string) => {
  event.stopPropagation();

  // 设置激活的箭头方向
  activeArrowDirection.value = direction;

  // 设置选中的节点（确保箭头保持显示）
  selectedNodeId.value = node.id;

  // 检查对应方向是否已有节点
  const nearbyNode = findNearbyNode(node, direction);

  if (nearbyNode) {
    // 如果附近有节点，直接创建连接
    createConnection(node, nearbyNode, direction);
  } else {
    // 如果没有节点，显示组件菜单让用户选择要创建的节点类型
    showComponentMenu(node, direction);
  }
};

// 组件菜单相关状态
const showComponentMenuFlag = ref(false);
const componentMenuPosition = ref({ x: 0, y: 0 });
const selectedNodeForConnection = ref<any>(null);
const selectedDirection = ref('');
const activeArrowDirection = ref('');
const hoveredNodeId = ref<string>('');

// 生成唯一ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// 获取Element Plus主题颜色
const getThemeColor = (cssVar: string) => {
  if (typeof window !== 'undefined') {
    const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return color || '#ffffff'; // 如果获取不到，使用白色作为默认值
  }
  return '#ffffff'; // 默认白色
};

// 判断是否为深色主题
const isDarkTheme = computed(() => {
  if (typeof window !== 'undefined') {
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').trim();
    return bgColor.includes('dark') || bgColor.includes('#1a1a1a') || bgColor.includes('#000');
  }
  return false;
});

// 获取连接线颜色（根据主题动态选择）
const getConnectionColor = () => {
  return isDarkTheme.value ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
};

// 简化的网格尺寸 - 固定尺寸确保一致性
const gridSize = computed(() => {
  return {
    small: 10,  // 小网格 10x10px
    large: 50   // 大网格 50x50px
  };
});

// 画布尺寸响应式状态
const canvasDimensions = ref({ width: 2000, height: 1500 });

// 动态计算画布尺寸，确保边界对齐
const updateCanvasDimensions = () => {
  const largeGrid = gridSize.value.large; // 50px

  // 获取画布容器的实际尺寸
  const container = document.querySelector('.canvas-container');
  if (!container) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // 计算最接近的大网格整数倍尺寸，确保不超过容器
  // 使用 Math.floor 确保画布不会超出容器边界
  const width = Math.floor(containerWidth / largeGrid) * largeGrid;
  const height = Math.floor(containerHeight / largeGrid) * largeGrid;

  // 确保最小尺寸
  const minWidth = largeGrid;
  const minHeight = largeGrid;

  const finalWidth = Math.max(width, minWidth);
  const finalHeight = Math.max(height, minHeight);

  // 强制边界对齐验证
  if (finalWidth % largeGrid !== 0 || finalHeight % largeGrid !== 0) {
    console.error('边界对齐失败！', {
      width: finalWidth,
      height: finalHeight,
      largeGrid,
      widthRemainder: finalWidth % largeGrid,
      heightRemainder: finalHeight % largeGrid
    });
  }

  canvasDimensions.value = {
    width: finalWidth,
    height: finalHeight
  };

  // 验证边界对齐
  const widthGrids = finalWidth / largeGrid;
  const heightGrids = finalHeight / largeGrid;

  console.log(`画布尺寸: ${finalWidth}x${finalHeight}, 大网格: ${largeGrid}px`);
  console.log(`网格数量: ${widthGrids} x ${heightGrids} = ${widthGrids * heightGrids} 个大网格`);
  console.log(`边界对齐验证: 宽度${finalWidth} % ${largeGrid} = ${finalWidth % largeGrid}, 高度${finalHeight} % ${largeGrid} = ${finalHeight % largeGrid}`);
  console.log(`网格线数量: 垂直线${Math.floor(finalWidth / 50) + 1}条, 水平线${Math.floor(finalHeight / 50) + 1}条`);

  // 验证SVG实际尺寸
  nextTick(() => {
    const svg = document.querySelector('.strategy-canvas');
    if (svg) {
      const svgRect = svg.getBoundingClientRect();
      console.log(`SVG实际尺寸: ${svgRect.width}x${svgRect.height}`);
      console.log(`SVG viewBox: ${svg.getAttribute('viewBox')}`);
      console.log(`SVG width/height属性: ${svg.getAttribute('width')}x${svg.getAttribute('height')}`);
    }
  });
};

// 监听窗口大小变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateCanvasDimensions();

  // 使用 ResizeObserver 更精确地监听容器尺寸变化
  const container = document.querySelector('.canvas-container');
  if (container) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    resizeObserver.observe(container);
  }

  // 备用：监听窗口大小变化
  window.addEventListener('resize', updateCanvasDimensions);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', updateCanvasDimensions);
});


// 获取网格颜色 - 两种网格并存，固定颜色
const getGridColor = (isSmall: boolean = true) => {
  if (isSmall) {
    // 小网格 - 较浅的颜色
    return isDarkTheme.value ? getThemeColor('--el-border-color') : getThemeColor('--el-text-color-placeholder');
  } else {
    // 大网格 - 使用合适的颜色，确保在两种主题下都可见
    if (isDarkTheme.value) {
      // 暗色主题：使用稍亮的边框色
      return getThemeColor('--el-border-color-light') || getThemeColor('--el-border-color');
    } else {
      // 亮色主题：使用更明显的颜色
      return getThemeColor('--el-text-color-regular') || getThemeColor('--el-text-color-primary') || '#606266';
    }
  }
};

// 查找附近节点
const findNearbyNode = (sourceNode: any, direction: string) => {
  const threshold = 200; // 距离阈值
  const sourceX = sourceNode.position.x;
  const sourceY = sourceNode.position.y;
  const sourceWidth = sourceNode.style?.width || 120;
  const sourceHeight = sourceNode.style?.height || 60;

  return nodes.value.find(node => {
    if (node.id === sourceNode.id) return false;

    const targetX = node.position.x;
    const targetY = node.position.y;
    const targetWidth = node.style?.width || 120;
    const targetHeight = node.style?.height || 60;

    // 计算节点中心点
    const sourceCenterX = sourceX + sourceWidth / 2;
    const sourceCenterY = sourceY + sourceHeight / 2;
    const targetCenterX = targetX + targetWidth / 2;
    const targetCenterY = targetY + targetHeight / 2;

    // 计算距离
    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 检查是否在指定方向且距离合适
    switch (direction) {
      case 'top':
        return deltaY < 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
      case 'right':
        return deltaX > 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
      case 'bottom':
        return deltaY > 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
      case 'left':
        return deltaX < 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
      default:
        return false;
    }
  });
};

// 创建连接
const createConnection = (sourceNode: any, targetNode: any, direction: string) => {
  // 根据方向确定连接条件
  let condition: 'true' | 'false' | undefined = undefined;
  if (sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') {
    if (direction === 'right') {
      condition = 'true';
    } else if (direction === 'left') {
      condition = 'false';
    }
  }

      // 创建连接
      const newConnection: StrategyConnection = {
        id: generateId(),
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        condition: condition,
        type: ConnectorType.SEQUENCE,
        style: {
          strokeColor: getConnectionColor(),
          strokeWidth: 2
        }
      };

  // 添加到连接列表
  connections.value.push(newConnection);

  // 清除激活状态
  activeArrowDirection.value = '';
};

// 画布缩放状态
const canvasScale = ref(1); // 缩放比例，1 = 100%
const minScale = 1; // 最小缩放比例（100%）
const maxScale = 3; // 最大缩放比例（300%）
const scaleStep = 0.1; // 每次缩放步长

// 缩放输入框状态
const scaleInputValue = ref('100%');
const isInputFocused = ref(false);

// 节点文本配置（全局默认值）
const defaultTextConfig = {
  fontSize: 16, // 默认字体大小
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal'
};

// 字体族选项
const fontFamilyOptions = [
  { label: '系统默认', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: '等宽字体', value: "'Courier New', 'Monaco', 'Menlo', monospace" },
  { label: '衬线字体', value: "'Times New Roman', 'Times', serif" },
  { label: '圆润字体', value: "'Comic Sans MS', 'Chalkboard', cursive" },
  { label: '粗体字体', value: "'Impact', 'Arial Black', sans-serif" },
  { label: '微软雅黑', value: "'Microsoft YaHei', '微软雅黑', sans-serif" },
  { label: '宋体', value: "'SimSun', '宋体', serif" },
  { label: '黑体', value: "'SimHei', '黑体', sans-serif" }
];

// 获取字体族的友好标签
const getFontFamilyLabel = (fontFamily: string) => {
  const option = fontFamilyOptions.find(opt => opt.value === fontFamily);
  return option ? option.label : fontFamily;
};

// 当前选中节点的文本配置
const nodeTextConfig = ref({ ...defaultTextConfig });

// 文本编辑状态
const editingNodeId = ref<string | null>(null);
const editingText = ref<string>('');

// 显示组件菜单
const showComponentMenu = (node: any, direction: string) => {
  selectedNodeForConnection.value = node;
  selectedDirection.value = direction;

  // 获取画布和节点位置
  const canvas = document.querySelector('.strategy-canvas') as HTMLElement;
  if (!canvas) return;

  const canvasRect = canvas.getBoundingClientRect();
  const nodeWidth = node.style?.width || 120;
  const nodeHeight = node.style?.height || 60;

  // 计算箭头在屏幕上的位置
  let menuX = canvasRect.left + node.position.x;
  let menuY = canvasRect.top + node.position.y;

  switch (direction) {
    case 'top':
      menuX += nodeWidth / 2;
      menuY -= 32; // 箭头尖端位置
      break;
    case 'right':
      menuX += nodeWidth + 32;
      menuY += nodeHeight / 2;
      break;
    case 'bottom':
      menuX += nodeWidth / 2;
      menuY += nodeHeight + 32;
      break;
    case 'left':
      menuX -= 32;
      menuY += nodeHeight / 2;
      break;
  }

  componentMenuPosition.value = { x: menuX, y: menuY };
  showComponentMenuFlag.value = true;
};

// 选择组件
const selectComponent = async (component: any) => {
  if (selectedNodeForConnection.value) {
    // 在指定方向添加新节点
    const newNodePosition = calculateNewNodePosition(selectedNodeForConnection.value, selectedDirection.value);
    const newNode = await addNode(component, newNodePosition);

    // 创建连接
    if (newNode) {
      // 根据方向确定连接条件
      let condition: 'true' | 'false' | undefined = undefined;
      if (selectedNodeForConnection.value.type === 'CONDITION' || selectedNodeForConnection.value.type === 'DECISION') {
        if (selectedDirection.value === 'right') {
          condition = 'true';
        } else if (selectedDirection.value === 'left') {
          condition = 'false';
        }
      }

      // 创建连接
      const newConnection: StrategyConnection = {
        id: generateId(),
        sourceNodeId: selectedNodeForConnection.value.id,
        targetNodeId: newNode.id,
        condition: condition,
        type: ConnectorType.SEQUENCE,
        style: {
          strokeColor: getConnectionColor(),
          strokeWidth: 2
        }
      };

      // 添加到连接列表
      connections.value.push(newConnection);
    }
  }

  // 关闭菜单
  closeComponentMenu();
};

// 关闭组件菜单
const closeComponentMenu = () => {
  showComponentMenuFlag.value = false;
  selectedNodeForConnection.value = null;
  selectedDirection.value = '';
  activeArrowDirection.value = '';
};

// 计算新节点位置
const calculateNewNodePosition = (sourceNode: any, direction: string) => {
  const offset = 150; // 节点间距
  const sourceX = sourceNode.position.x;
  const sourceY = sourceNode.position.y;

  switch (direction) {
    case 'top':
      return { x: sourceX, y: sourceY - offset };
    case 'right':
      return { x: sourceX + offset, y: sourceY };
    case 'bottom':
      return { x: sourceX, y: sourceY + offset };
    case 'left':
      return { x: sourceX - offset, y: sourceY };
    default:
      return { x: sourceX + offset, y: sourceY };
  }
};

// 获取常用组件（缩小版组件库）
const getCommonComponents = () => {
  if (!componentLibrary.value || componentLibrary.value.length === 0) {
    return [];
  }
  return componentLibrary.value.slice(0, 6);
};

// 获取方向文本
const getDirectionText = (direction: string) => {
  const directionMap: Record<string, string> = {
    'top': '上方',
    'right': '右侧',
    'bottom': '下方',
    'left': '左侧'
  };
  return directionMap[direction] || '';
};

// 节点悬停处理
// 双击延迟处理
let doubleClickTimer: number | null = null;

// 节点点击处理
const handleNodeClick = (node: any, event?: MouseEvent) => {
  // 阻止事件冒泡到画布
  event?.stopPropagation();

  // 清除双击定时器
  if (doubleClickTimer) {
    clearTimeout(doubleClickTimer);
    doubleClickTimer = null;
    return; // 如果是双击，不处理单击
  }

  // 设置双击延迟
  doubleClickTimer = setTimeout(() => {
    doubleClickTimer = null;

    // 设置选中的节点
    selectedNodeId.value = node.id;

    // 更新文本配置为选中节点的配置
    nodeTextConfig.value = {
      fontSize: node.textConfig?.fontSize || defaultTextConfig.fontSize,
      fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
      fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
      fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle
    };

    // 关闭组件菜单（如果打开）
    if (showComponentMenuFlag.value) {
      closeComponentMenu();
    }
  }, 200); // 200ms 延迟
};

// 文本输入框引用
const textInputRef = ref<HTMLInputElement | null>(null);

// 节点双击处理 - 进入文本编辑模式
const handleNodeDoubleClick = (node: any, event?: MouseEvent) => {
  event?.stopPropagation();
  event?.preventDefault(); // 阻止默认行为

  // 清除单击定时器
  if (doubleClickTimer) {
    clearTimeout(doubleClickTimer);
    doubleClickTimer = null;
  }

  // 设置编辑状态
  editingNodeId.value = node.id;
  editingText.value = node.text || getNodeText(node.type);

  // 选中节点
  selectedNodeId.value = node.id;

  // 更新文本配置
  nodeTextConfig.value = {
    fontSize: node.textConfig?.fontSize || defaultTextConfig.fontSize,
    fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
    fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
    fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle
  };

  // 自动聚焦到输入框
  nextTick(() => {
    const focusInput = () => {
      if (textInputRef.value && typeof textInputRef.value.focus === 'function') {
        textInputRef.value.focus();
        textInputRef.value.select();
        return true;
      }
      return false;
    };

    // 立即尝试聚焦
    if (!focusInput()) {
      // 如果失败，延迟重试
      setTimeout(() => {
        focusInput();
      }, 50);
    }
  });
};

const handleNodeMouseEnter = (node: any) => {
  hoveredNodeId.value = node.id;
  console.log('节点悬停:', node.id, 'hoveredNodeId:', hoveredNodeId.value, 'selectedNodeId:', selectedNodeId.value);
  console.log('箭头应该显示，检查CSS类:', {
    hoveredNodeId: hoveredNodeId.value,
    selectedNodeId: selectedNodeId.value,
    shouldShow: hoveredNodeId.value === node.id || selectedNodeId.value === node.id
  });

  // 检查DOM元素
  nextTick(() => {
    const arrowGroups = document.querySelectorAll(`[data-node-id="${node.id}"] .connection-arrow-group`);
    console.log('找到的箭头组数量:', arrowGroups.length);
    arrowGroups.forEach((group, index) => {
      const path = group.querySelector('.arrow-shape');
      console.log(`箭头组 ${index}:`, {
        element: group,
        classes: group.className,
        visible: group.classList.contains('visible'),
        opacity: getComputedStyle(group).opacity,
        hasPath: !!path,
        pathElement: path,
        pathFill: path ? getComputedStyle(path).fill : 'N/A',
        pathStroke: path ? getComputedStyle(path).stroke : 'N/A'
      });
    });
  });
};

const handleNodeMouseLeave = () => {
  hoveredNodeId.value = '';
  console.log('节点离开, hoveredNodeId:', hoveredNodeId.value);
};

// 画布点击处理
const handleCanvasClick = (event: MouseEvent) => {
  // 如果点击的是画布本身（不是节点），关闭组件菜单并隐藏箭头
  if (showComponentMenuFlag.value) {
    closeComponentMenu();
  }

  // 点击非节点区域时，清除选中状态，隐藏箭头
  selectedNodeId.value = '';
  hoveredNodeId.value = '';
  activeArrowDirection.value = '';
};

const handleCanvasDragLeave = (event: DragEvent) => {
  event.preventDefault();
};

// 缩放控制函数
const handleZoomIn = () => {
  if (canvasScale.value < maxScale) {
    canvasScale.value = Math.min(canvasScale.value + scaleStep, maxScale);
    updateScaleInputValue();
  }
};

const handleZoomOut = () => {
  if (canvasScale.value > minScale) {
    canvasScale.value = Math.max(canvasScale.value - scaleStep, minScale);
    updateScaleInputValue();
  }
};

const handleFitToScreen = () => {
  canvasScale.value = minScale; // 重置为100%
  panX.value = 0; // 重置拖拽位置
  panY.value = 0;
  updateScaleInputValue();
};

// 处理缩放下拉菜单命令
const handleZoomCommand = (command: string) => {
  if (command === 'fit') {
    handleFitToScreen();
  } else {
    const scale = parseInt(command) / 100;
    canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
    updateScaleInputValue();
  }
};

// 更新输入框显示值
const updateScaleInputValue = () => {
  if (!isInputFocused.value) {
    scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
  }
};

// 处理输入框内容变化
const handleScaleInputChange = (value: string) => {
  // 如果用户删除了百分号，不自动添加
  // 如果用户输入了纯数字，也不自动添加百分号
  // 只有在失焦或回车时才处理
};

// 处理输入框失焦
const handleScaleInputBlur = () => {
  isInputFocused.value = false;
  applyScaleFromInput();
};

// 处理输入框回车
const handleScaleInputEnter = () => {
  isInputFocused.value = false;
  applyScaleFromInput();
};

// 应用输入框的缩放值
const applyScaleFromInput = () => {
  let inputValue = scaleInputValue.value.trim();

  // 如果输入值不包含百分号，自动添加
  if (!inputValue.includes('%')) {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      inputValue = `${numericValue}%`;
    }
  }

  // 移除百分号进行数值计算
  const numericValue = parseFloat(inputValue.replace('%', ''));

  if (!isNaN(numericValue) && numericValue > 0) {
    const scale = numericValue / 100;
    canvasScale.value = Math.max(minScale, Math.min(scale, maxScale));
  }

  // 更新显示值，确保有百分号
  scaleInputValue.value = `${Math.round(canvasScale.value * 100)}%`;
};

// 计算缩放百分比显示
const scalePercentage = computed(() => {
  return Math.round(canvasScale.value * 100);
});

// 更新选中节点的文本配置
const updateNodeTextConfig = () => {
  if (selectedNodeId.value) {
    const selectedNode = nodes.value.find(node => node.id === selectedNodeId.value);
    if (selectedNode) {
      // 更新节点的文本配置
      if (!selectedNode.textConfig) {
        selectedNode.textConfig = {};
      }
      selectedNode.textConfig = { ...nodeTextConfig.value };
    }
  }
};

// 监听文本配置变化，自动更新选中节点
watch(nodeTextConfig, () => {
  updateNodeTextConfig();
}, { deep: true });

// 监听缩放变化，同步输入框值
watch(canvasScale, () => {
  updateScaleInputValue();
});

// 完成文本编辑
const finishTextEditing = () => {
  if (editingNodeId.value) {
    const selectedNode = nodes.value.find(node => node.id === editingNodeId.value);
    if (selectedNode) {
      // 更新节点文本
      selectedNode.text = editingText.value;
    }
  }

  // 清除编辑状态
  editingNodeId.value = null;
  editingText.value = '';
};

// 取消文本编辑
const cancelTextEditing = () => {
  // 清除编辑状态
  editingNodeId.value = null;
  editingText.value = '';
};

// 处理文本编辑键盘事件
const handleTextEditKeyDown = (event: KeyboardEvent) => {
  if (editingNodeId.value) {
    if (event.key === 'Enter') {
      event.preventDefault();
      finishTextEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelTextEditing();
    }
  }
};

const handleCanvasDrop = async (event: DragEvent) => {
  event.preventDefault();

  const componentType = event.dataTransfer?.getData('component-type');
  const componentData = event.dataTransfer?.getData('application/json');

  if (componentType && componentData) {
    try {
      const component = JSON.parse(componentData);
      const rect = (event.target as HTMLElement).getBoundingClientRect();

      // 计算相对于画布的位置（考虑缩放和平移）
      const x = (event.clientX - rect.left - panX.value) / canvasScale.value;
      const y = (event.clientY - rect.top - panY.value) / canvasScale.value;

      // 添加节点
      await addNode(component, { x, y });
    } catch (error) {
      console.error('Failed to parse component data:', error);
    }
  }
};

const {
  componentSearch,
  activeCategories,
  filteredComponentCategories,
  componentLibrary,
  handleComponentDragStart
} = useComponentLibrary();

const {
  strategyName,
  currentOrchestration,
  showPreview,
  validateOrchestration,
  previewExecution,
  handleSave
} = useStrategyOperations(nodes, connections);



// 删除选中的元素
const deleteSelected = async () => {
  if (selectedNode.value) {
    try {
      await ElMessageBox.confirm(
        '确定要删除选中的节点吗？这将同时删除相关的连接线。',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      // 直接删除节点，跳过确认弹窗和成功消息
      const nodeId = selectedNode.value.id;
      nodes.value = nodes.value.filter(n => n.id !== nodeId);

      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = '';
      }

      // 删除相关连接线
      connections.value = connections.value.filter(
        conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      );

      ElMessage.success('节点删除成功');
    } catch {
      // 用户取消删除
    }
  } else if (selectedConnection.value) {
    try {
      await ElMessageBox.confirm(
        '确定要删除选中的连接线吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      // 直接删除连接线
      const connectionId = selectedConnection.value.id;
      connections.value = connections.value.filter(conn => conn.id !== connectionId);

      if (selectedConnectionId.value === connectionId) {
        selectedConnectionId.value = '';
      }

      ElMessage.success('连接线删除成功');
    } catch {
      // 用户取消删除
    }
  }
};

// 全局键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 如果正在编辑文本，不处理删除键
  if (editingNodeId.value) {
    return;
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedNode.value || selectedConnection.value) {
      deleteSelected();
    }
  }
};

// 全局鼠标事件处理
const handleGlobalMouseMove = (event: MouseEvent) => {
  handleCanvasMouseMove(event);
};

const handleGlobalMouseUp = (event: MouseEvent) => {
  handleCanvasMouseUp();
};

// 组件挂载
onMounted(async () => {
  // 添加全局事件监听
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);

  // 等待 DOM 渲染完成
  await nextTick();

  // 初始化画布
  // 注意：fitToScreen 需要画布引用和节点数据，这里暂时注释掉
  // 可以在有节点后再调用
  // fitToScreen(canvasRef, nodes.value);
});

// 组件卸载
onUnmounted(() => {
  // 移除全局事件监听
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
});

// 处理组件点击 - 在画布中心创建组件
const handleComponentClick = async (component: any) => {
  // 计算画布中心位置（考虑画布缩放和平移）
  const canvasCenterX = 400; // 画布中心 X 坐标
  const canvasCenterY = 300; // 画布中心 Y 坐标

  // 添加节点到画布中心
  await addNode(component, { x: canvasCenterX, y: canvasCenterY });
};

// 暴露给子组件的方法
defineExpose({
  completeConnection: (nodeId: string) => completeConnection(nodeId),
  selectNode,
  selectConnection
});
</script>

<style lang="scss">
@use './styles/index.scss';
</style>
