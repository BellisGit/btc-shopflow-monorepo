# BtcGridGroup 组件

一个灵活的网格布局组件，提供 6 个插槽用于创建顶栏和内容栏的左右中三列布局。

## 特性

- **6 插槽设计**：提供 `headerLeft`、`headerMiddle`、`headerRight`、`bodyLeft`、`bodyMiddle`、`bodyRight` 六个插槽
- **宽度一致性**：顶栏和内容栏的左中右区域宽度完全一致
- **灵活配置**：支持自定义左侧和右侧区域的宽度
- **响应式**：支持响应式布局调整
- **TypeScript**：完整的 TypeScript 类型支持

## 基本用法

```vue
<template>
  <btc-grid-group left-width="320px" right-width="320px">
    <!-- 顶栏左侧 -->
    <template #headerLeft>
      <el-button>左侧按钮</el-button>
    </template>

    <!-- 顶栏中间 -->
    <template #headerMiddle>
      <div>中间内容</div>
    </template>

    <!-- 顶栏右侧 -->
    <template #headerRight>
      <el-button>右侧按钮</el-button>
    </template>

    <!-- 内容左侧 -->
    <template #bodyLeft>
      <div>左侧面板</div>
    </template>

    <!-- 内容中间 -->
    <template #bodyMiddle>
      <div>主要内容区域</div>
    </template>

    <!-- 内容右侧 -->
    <template #bodyRight>
      <div>右侧面板</div>
    </template>
  </btc-grid-group>
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| leftWidth | 左侧区域宽度 | `string` | `'20%'` |
| rightWidth | 右侧区域宽度 | `string` | `'25%'` |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| headerLeft | 顶栏左侧内容 |
| headerMiddle | 顶栏中间内容 |
| headerRight | 顶栏右侧内容 |
| bodyLeft | 内容区域左侧 |
| bodyMiddle | 内容区域中间 |
| bodyRight | 内容区域右侧 |

## 布局说明

组件采用 flexbox 布局，确保顶栏和内容栏的左中右区域宽度完全一致：

- **左侧区域**：使用 `flex: 0 0 v-bind(leftWidth)` 固定宽度
- **中间区域**：使用 `flex: 1` 占据剩余空间
- **右侧区域**：使用 `flex: 0 0 v-bind(rightWidth)` 固定宽度

## 使用示例

### 策略编排器布局

```vue
<template>
  <btc-grid-group left-width="320px" right-width="320px">
    <!-- 顶栏：工具选择 + 画布控制 + 操作按钮 -->
    <template #headerLeft>
      <btc-select-button v-model="currentTool" :options="toolOptions" />
    </template>

    <template #headerMiddle>
      <div class="canvas-controls">
        <el-button-group>
          <el-button @click="zoomIn">放大</el-button>
          <el-button @click="zoomOut">缩小</el-button>
        </el-button-group>
        <el-input v-model="strategyName" placeholder="策略名称" />
      </div>
    </template>

    <template #headerRight>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="warning" @click="preview">预览</el-button>
    </template>

    <!-- 内容：组件库 + 画布 + 属性面板 -->
    <template #bodyLeft>
      <div class="component-library">
        <!-- 组件库内容 -->
      </div>
    </template>

    <template #bodyMiddle>
      <div class="canvas-container">
        <!-- 画布内容 -->
      </div>
    </template>

    <template #bodyRight>
      <div class="properties-panel">
        <!-- 属性面板内容 -->
      </div>
    </template>
  </btc-grid-group>
</template>
```

### 百分比宽度布局

```vue
<template>
  <btc-grid-group left-width="20%" right-width="25%">
    <!-- 内容 -->
  </btc-grid-group>
</template>
```

### 响应式布局

```vue
<template>
  <btc-grid-group 
    :left-width="isMobile ? '100%' : '320px'"
    :right-width="isMobile ? '100%' : '320px'"
  >
    <!-- 内容 -->
  </btc-grid-group>
</template>

<script setup>
import { computed } from 'vue'

const isMobile = computed(() => window.innerWidth < 768)
</script>
```

## 样式定制

组件使用 CSS 变量，可以通过覆盖变量来定制样式：

```scss
.btc-grid-group {
  --el-bg-color: #ffffff;
  --el-border-color-light: #e4e7ed;
}
```

## 注意事项

1. 组件会自动处理宽度一致性，无需手动设置样式
2. 中间区域会自动占据剩余空间
3. 支持任意 CSS 单位（px、%、rem、vw 等）
4. 建议在移动端使用百分比宽度以获得更好的响应式效果
