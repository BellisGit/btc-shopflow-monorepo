---
title: 'BTC SVG 图标组件'
type: package
project: components
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- svg
sidebar_label: btc-svg
sidebar_order: 7
sidebar_group: packages
---
# BTC SVG 图标组件

SVG 图标组件，用于显示通过 vite-plugin 自动扫描的 SVG 图标

## 功能特性

- 自动识别 SVG sprite 中的图标
- 支持自定义大小颜色
- 继承父元素的文本颜色（通过 currentColor）
- 与 cool-admin-vue 的 cl-svg 组件 API 完全一致

## 使用方式

### 基础用法

```vue
<template>
<!-- 显示 icon-home.svg -->
<btc-svg name="home" />

<!-- 显示 icon-user.svg -->
<btc-svg name="user" />
</template>
```

### 自定义大小

```vue
<template>
<!-- 字符串形式 -->
<btc-svg name="home" size="24px" />

<!-- 数字形式（自动添加 px） -->
<btc-svg name="home" :size="32" />
</template>
```

### 自定义颜色

```vue
<template>
<!-- 直接设置颜色 -->
<btc-svg name="home" color="#409eff" />

<!-- 继承父元素颜色（默认） -->
<div style="color: red">
<btc-svg name="home" />
</div>
</template>
```

### 自定义类名

```vue
<template>
<btc-svg name="home" class-name="my-custom-icon" />
</template>

<style>
.my-custom-icon {
margin-right: 8px;
}
</style>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称（不需要 icon- 前缀） | string | - |
| size | 图标大小 | string \| number | - |
| color | 图标颜色 | string | - |
| className | 自定义类名 | string | - |

## SVG 文件命名规则

### 1. 通用图标（带 icon- 前缀）

文件名：`icon-home.svg`
使用：`<btc-svg name="home" />`

vite-plugin 会自动跳过模块名拼接，直接使用 `icon-home` 作为 symbol id

### 2. 模块图标（不带 icon- 前缀）

文件名：`modules/user/avatar.svg`
使用：`<btc-svg name="user-avatar" />`

vite-plugin 会自动拼接模块名 `user-avatar`

## 与 cool-admin-vue 的 cl-svg 对比

| 特性 | btc-svg | cl-svg |
|------|---------|--------|
| 组件名称 | btc-svg | cl-svg |
| API | 完全一致 | - |
| 样式类名 | btc-svg | cl-svg |
| 功能 | 完全一致 | - |

## 国际化图标示例

```vue
<template>
<!-- 中文图标 -->
<btc-svg name="icon-zh" />

<!-- 英文图标 -->
<btc-svg name="icon-en" />

<!-- 日文图标 -->
<btc-svg name="icon-ja" />
</template>
```

## 注意事项

1. **图标名称不需要 `icon-` 前缀**：组件会自动添加
2. **SVG 文件位置**：放在 `src/` 目录下，vite-plugin 会自动扫描
3. **颜色继承**：默认继承父元素的文本颜色（`fill: currentColor`）
4. **大小单位**：数字类型会自动添加 `px` 单位

## 完整示例

```vue
<template>
<div class="icon-demo">
<!-- 基础图标 -->
<btc-svg name="home" />

<!-- 大图标 -->
<btc-svg name="user" :size="48" />

<!-- 彩色图标 -->
<btc-svg name="star" color="#f5a623" :size="32" />

<!-- 在按钮中使用 -->
<el-button>
<btc-svg name="add" :size="16" />
添加
</el-button>

<!-- 国际化切换 -->
<btc-svg
:name="locale === 'zh-CN' ? 'icon-zh' : 'icon-en'"
:size="24"
/>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const locale = ref('zh-CN');
</script>
```

