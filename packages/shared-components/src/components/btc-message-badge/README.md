# BtcMessageBadge 消息徽章组件

## 概述

`BtcMessageBadge` 是一个用于在消息弹窗上显示重复计数的徽章组件。它专门为消息系统设计，支持数字变化动画和自动隐藏逻辑。

## 功能特性

- ✅ 重复消息计数显示
- ✅ 单条消息自动隐藏
- ✅ 数字变化动画效果
- ✅ 响应式状态管理
- ✅ 完全独立的定位系统

## 使用方法

### 基本用法

```vue
<template>
  <BtcMessageBadge :badge-count="messageCount" />
</template>

<script setup>
import { BtcMessageBadge } from '@btc/shared-components';

const messageCount = ref(3); // 显示数字3
</script>
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| badgeCount | number | 1 | 徽章显示的数字，大于1时显示，否则隐藏 |

### 显示逻辑

- `badgeCount <= 1`: 徽章隐藏（单条消息）
- `badgeCount > 1`: 显示对应数字（重复消息）

### 动画效果

- **数字变化**: 当 `badgeCount` 改变时，徽章会有脉冲动画
- **显示/隐藏**: 徽章出现和消失有平滑的过渡效果

## 技术实现

### 定位系统

徽章使用完全独立的定位系统：
- 不依赖父容器布局
- 通过 `position: fixed` 实现精确定位
- 使用 `transform: translate(50%, -50%)` 居中对齐

### 样式特点

- 尺寸：18x18px 圆形徽章
- 颜色：Element Plus 默认主题色
- 字体：12px，居中对齐
- 动画：0.2s 缓动过渡

## 集成说明

该组件通常与以下系统配合使用：

1. **MessageManager**: 消息队列管理器
2. **ElMessage**: Element Plus 消息组件
3. **Bootstrap**: 应用启动引导程序

## 注意事项

- 组件本身不包含定位逻辑，需要外部系统控制位置
- 徽章内容完全透明，仅用于显示数字
- 支持最大99的数字显示
