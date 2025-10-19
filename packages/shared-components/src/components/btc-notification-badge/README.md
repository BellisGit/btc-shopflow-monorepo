# BtcNotificationBadge 组件

## 概述

`BtcNotificationBadge` 是一个专门为 Element Plus 的 `ElNotification` 组件设计的徽章组件，用于显示重复通知的数量。该组件与 `BtcMessageBadge` 类似，但针对通知的显示特点进行了优化。

## 特性

- **智能显示**: 只有重复通知（count > 1）才显示徽章
- **动画效果**: 数字变化时具有脉冲动画效果
- **精确定位**: 徽章中心与通知弹窗左上角顶点重合
- **响应式**: 支持动态更新徽章数量
- **独立渲染**: 完全独立的层，不影响通知弹窗的布局

## 使用方法

```vue
<template>
  <BtcNotificationBadge :badge-count="notificationCount" />
</template>

<script setup>
import { BtcNotificationBadge } from '@btc/shared-components';

const notificationCount = ref(3);
</script>
```

## Props

| 属性名     | 类型   | 默认值 | 说明                              |
| ---------- | ------ | ------ | --------------------------------- |
| badgeCount | number | 1      | 徽章显示的数字，只有大于1时才显示 |

## 样式特点

- 徽章尺寸: 18px × 18px
- 定位方式: 绝对定位，中心与左上角顶点重合
- 动画效果: 数字变化时的脉冲动画
- 隐藏逻辑: badgeCount <= 1 时自动隐藏

## 与 BtcMessageBadge 的区别

1. **定位差异**:
   - `BtcMessageBadge`: 徽章中心与消息弹窗右上角顶点重合
   - `BtcNotificationBadge`: 徽章中心与通知弹窗左上角顶点重合

2. **使用场景**:
   - `BtcMessageBadge`: 用于页面顶部的消息提示
   - `BtcNotificationBadge`: 用于页面右上角的通知提示

3. **样式调整**:
   - transform 值不同以适配不同的定位需求
