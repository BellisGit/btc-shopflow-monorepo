# 管理应用 BtcDialog 使用说明

## 1. BtcDialog 的使用方式

### 1.1 直接使用（较少）
```vue
<template>
  <BtcDialog v-model="visible" title="标题">
    <div>内容</div>
  </BtcDialog>
</template>

<script setup>
import { BtcDialog } from '@btc/shared-components';
</script>
```

### 1.2 通过 BtcUpsert 使用（主要方式）
```vue
<template>
  <BtcCrud>
    <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
  </BtcCrud>
</template>

<script setup>
import { BtcCrud, BtcUpsert } from '@btc/shared-components';
</script>
```

**说明：**
- `BtcUpsert` 内部使用 `BtcDialog` 来显示表单弹窗
- `BtcUpsert` 通过 `v-bind="dialogProps"` 传递额外的 props 给 `BtcDialog`
- 管理应用中的 CRUD 页面主要使用这种方式

## 2. z-index 配置

### 2.1 Element Plus 自动管理 z-index

**BtcDialog 不直接设置 z-index**，而是由 **Element Plus 的 ElDialog 自动管理**：

1. **默认起始值**：Element Plus 的 ElDialog 默认 z-index 起始值为 **2000**
2. **自动递增**：每个新打开的弹窗会自动递增 z-index（通常是 +2 或 +4）
3. **动态计算**：z-index 值会根据页面上已有的弹窗数量动态计算

### 2.2 实际 z-index 值

根据你提供的 HTML（物流应用点击新增按钮后）：
```html
<div class="el-overlay el-modal-dialog" style="z-index: 2008;">
```

**说明：**
- z-index 为 **2008**（不是 2006）
- 这个值是由 Element Plus 自动计算的
- 如果页面上已经有其他弹窗，z-index 会更高（如 2010, 2012 等）

### 2.3 BtcDialog 中的 z-index 配置

**唯一设置的 z-index：**
```scss
// packages/shared-components/src/common/dialog/styles/index.scss
.btc-dialog__controls {
  z-index: 9;  // 仅用于控制按钮（全屏、关闭按钮）
}
```

**说明：**
- 这个 z-index: 9 是相对于弹窗内部的，用于确保控制按钮在弹窗内容之上
- **不是**弹窗本身的 z-index

## 3. 管理应用中的使用链路

```
页面组件
  └─ <BtcCrud>
       └─ <BtcUpsert>  (通过 @btc/shared-components 导入)
            └─ <BtcDialog>  (BtcUpsert 内部使用)
                 └─ <ElDialog>  (Element Plus 组件)
                      └─ z-index: 2000+ (自动计算)
```

## 4. 关键配置

### 4.1 appendToBody 配置

**生产环境独立运行：**
```typescript
// packages/shared-components/src/common/dialog/composables/useDialogRender.ts
appendToBody: true  // 生产环境独立运行时，挂载到 body
```

**开发环境微前端：**
```typescript
appendToBody: false  // 微前端环境，挂载到指定容器
appendTo: '#subapp-viewport'  // 或指定的容器选择器
```

### 4.2 样式配置

**BtcDialog 样式：**
```scss
// packages/shared-components/src/common/dialog/styles/index.scss
.btc-dialog {
  // 不设置 z-index，由 Element Plus 管理
  
  :deep(.el-overlay) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}
```

## 5. 总结

1. **z-index 不由 BtcDialog 控制**，而是由 Element Plus 的 ElDialog 自动管理
2. **默认起始值为 2000**，每个新弹窗会自动递增
3. **实际值可能是 2006、2008、2010 等**，取决于页面上已有的弹窗数量
4. **管理应用主要通过 BtcUpsert 使用 BtcDialog**，而不是直接使用
5. **生产环境独立运行时，appendToBody 为 true**，弹窗挂载到 body

## 6. 如果 z-index 有问题

如果发现 z-index 冲突或弹窗被遮挡：

1. **检查是否有其他组件设置了更高的 z-index**
2. **检查 Element Plus 的 z-index 管理器是否正常工作**
3. **检查是否有全局样式覆盖了 Element Plus 的 z-index 计算**

**注意：** 不应该手动设置 BtcDialog 的 z-index，应该让 Element Plus 自动管理。
