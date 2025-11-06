# BtcColorPicker 颜色选择器组件

基于 Element Plus `el-color-picker-panel` 封装的颜色选择器组件，提供统一的外观、预定义颜色支持和透明度选择功能。

## 功能特性

- 🎨 支持颜色选择（RGB、HSL、HSV 等格式）
- 🔍 支持透明度（Alpha）选择
- 📋 预定义颜色快速选择
- 🎯 可自定义的触发按钮
- ⚡ 立即更新模式或确认模式
- 📱 响应式设计
- 🌓 支持暗色模式
- 🎭 马赛克背景显示透明度效果

## 基础用法

### 默认用法（确认模式）

```vue
<template>
  <BtcColorPicker
    v-model="selectedColor"
    placeholder="选择颜色"
    @confirm="handleColorConfirm"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const selectedColor = ref('#409eff');

function handleColorConfirm(color) {
  console.log('确认的颜色:', color);
}
</script>
```

### 立即更新模式

```vue
<template>
  <BtcColorPicker
    v-model="selectedColor"
    immediate
    placeholder="选择颜色"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const selectedColor = ref('#409eff');
</script>
```

### 自定义触发按钮

```vue
<template>
  <BtcColorPicker
    v-model="selectedColor"
    placeholder="选择颜色"
  >
    <template #reference>
      <el-button type="primary" :style="{ backgroundColor: selectedColor }">
        选择主题色
      </el-button>
    </template>
  </BtcColorPicker>
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const selectedColor = ref('#409eff');
</script>
```

### 自定义预定义颜色

```vue
<template>
  <BtcColorPicker
    v-model="selectedColor"
    :predefine-colors="customColors"
  />
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const selectedColor = ref('#409eff');
const customColors = [
  '#ff4500',
  '#ff8c00',
  'rgba(255, 69, 0, 0.68)',
  'rgba(144, 240, 144, 0.5)',
];
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | string \| null | null | 绑定值，颜色字符串（支持 hex、rgb、rgba、hsl、hsv 等格式） |
| predefineColors | string[] | 默认14个预设颜色 | 预定义颜色数组 |
| showAlpha | boolean | true | 是否显示透明度选择器 |
| placeholder | string | '选择颜色' | 触发按钮的占位文本（当没有选中颜色时） |
| popoverWidth | number \| string | 350 | 弹窗宽度 |
| placement | string | 'bottom-start' | 弹窗位置 |
| teleported | boolean | false | 是否将弹窗渲染到 body |
| popperClass | string | '' | 弹窗的自定义类名 |
| triggerSize | 'large' \| 'default' \| 'small' | 'default' | 触发按钮尺寸 |
| triggerType | 'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'text' | 'default' | 触发按钮类型 |
| inputSize | 'large' \| 'default' \| 'small' | 'small' | 输入框尺寸 |
| buttonSize | 'large' \| 'default' \| 'small' | 'small' | 按钮尺寸 |
| clearText | string | '清空' | 清空按钮文本 |
| confirmText | string | '确认' | 确认按钮文本 |
| immediate | boolean | false | 是否立即更新（不需要点击确认） |

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发（仅在 immediate 模式或确认时） | (value: string \| null) |
| change | 值变化时触发（仅在 immediate 模式或确认时） | (value: string \| null) |
| confirm | 点击确认按钮时触发 | (value: string \| null) |
| clear | 点击清空按钮时触发 | - |
| active-change | 颜色选择过程中触发（用于实时预览） | (value: string \| null) |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| reference | 自定义触发按钮 |

### 插槽示例

```vue
<BtcColorPicker v-model="color">
  <template #reference>
    <div class="custom-trigger">
      <div
        class="color-preview"
        :style="{ backgroundColor: color || '#ccc' }"
      />
      <span>点击选择颜色</span>
    </div>
  </template>
</BtcColorPicker>
```

## 使用场景

### 在表单中使用

```vue
<template>
  <el-form>
    <el-form-item label="主题色">
      <BtcColorPicker
        v-model="formData.themeColor"
        placeholder="请选择主题色"
        immediate
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const formData = ref({
  themeColor: '#409eff'
});
</script>
```

### 主题颜色选择

```vue
<template>
  <BtcColorPicker
    v-model="themeColor"
    :predefine-colors="themePresets"
    @confirm="applyTheme"
  >
    <template #reference>
      <el-button type="primary">
        <span v-if="themeColor">当前: {{ themeColor }}</span>
        <span v-else>选择主题色</span>
      </el-button>
    </template>
  </BtcColorPicker>
</template>

<script setup>
import { ref } from 'vue';
import { BtcColorPicker } from '@btc/shared-components';

const themeColor = ref('#409eff');
const themePresets = [
  '#409eff', // 蓝色
  '#67c23a', // 绿色
  '#e6a23c', // 橙色
  '#f56c6c', // 红色
  '#909399', // 灰色
];

function applyTheme(color) {
  // 应用主题颜色
  document.documentElement.style.setProperty('--el-color-primary', color);
}
</script>
```

## 默认预定义颜色

组件默认提供以下14个预定义颜色：

1. `#ff4500` - 橙红色
2. `#ff8c00` - 深橙色
3. `#ffd700` - 金色
4. `#90ee90` - 浅绿色
5. `#00ced1` - 深青色
6. `#1e90ff` - 道奇蓝
7. `#c71585` - 中紫红色
8. `rgba(255, 69, 0, 0.68)` - 半透明橙红色
9. `rgb(255, 120, 0)` - 橙色
10. `hsv(51, 100, 98)` - HSV 格式黄色
11. `rgba(144, 240, 144, 0.5)` - 半透明浅绿色
12. `hsl(181, 100%, 37%)` - HSL 格式青色
13. `rgba(31, 147, 255, 0.73)` - 半透明蓝色
14. `rgba(199, 21, 133, 0.47)` - 半透明紫红色

## 颜色格式支持

组件支持以下颜色格式：

- **HEX**: `#409eff`, `#fff`
- **RGB**: `rgb(64, 158, 255)`
- **RGBA**: `rgba(64, 158, 255, 0.8)`
- **HSL**: `hsl(210, 100%, 62%)`
- **HSLA**: `hsla(210, 100%, 62%, 0.8)`
- **HSV**: `hsv(210, 100%, 100%)`
- **HSVA**: `hsva(210, 100%, 100%, 0.8)`

## 注意事项

1. **确认模式 vs 立即模式**：
   - `immediate: false`（默认）：选择颜色后需要点击"确认"按钮才会更新 `modelValue`
   - `immediate: true`：选择颜色后立即更新 `modelValue`

2. **透明度支持**：
   - 组件会自动为带有透明度的颜色显示马赛克背景效果
   - 如果 Element Plus 将 `rgba` 转换为 `rgb`，组件会通过 CSS `opacity` 恢复透明度效果

3. **预定义颜色的透明度**：
   - 对于默认的预定义颜色，组件会自动处理透明度显示
   - 如果使用自定义预定义颜色且需要透明度效果，确保颜色格式为 `rgba()` 或 `hsla()` 等包含透明度的格式

4. **弹窗位置**：
   - 默认位置为 `bottom-start`，可以根据需要调整 `placement` 属性
   - 如果空间不足，Element Plus 会自动调整位置

5. **样式定制**：
   - 可以通过 `popperClass` 传入自定义类名来覆盖样式
   - 组件使用 `:deep()` 选择器来穿透 Element Plus 的样式作用域

## 与 Element Plus 的区别

- ✅ 提供预定义颜色快速选择
- ✅ 自定义 footer 布局（输入框 + 清空/确认按钮）
- ✅ 支持确认模式和立即更新模式
- ✅ 优化的透明度显示（马赛克背景）
- ✅ 更灵活的触发按钮自定义
- ✅ 更统一的样式和交互体验

