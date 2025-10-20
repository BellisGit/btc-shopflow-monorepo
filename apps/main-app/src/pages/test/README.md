# 智能测试中心

## 概述

智能测试中心是一个自动化的测试实例管理系统，类似于 cool-admin 的插件列表。它能够自动扫描 `test` 目录下的所有测试实例，并以卡片列表的形式展示，支持搜索功能。

## 架构设计

### 1. 多文件夹设计
```
src/pages/test/
├── components/           # 测试中心主页面
│   └── index.vue        # 智能测试中心页面
├── crud/                # CRUD 测试实例
│   └── index.vue        # CRUD 组件测试
├── i18n/                # 国际化测试实例
│   └── index.vue        # 国际化功能测试
├── message-notification/ # 消息通知测试实例
│   └── index.vue        # 消息通知组件测试
├── select-button/       # 选择按钮测试实例
│   └── index.vue        # 选择按钮组件测试
├── svg-plugin/          # SVG 插件测试实例
│   └── index.vue        # SVG 插件测试
└── README.md            # 本文档
```

### 2. 核心组件

#### 测试中心页面 (`components/index.vue`)
- 自动扫描和渲染所有测试实例
- 提供搜索功能
- 卡片式布局展示
- 弹窗形式运行测试实例

#### 测试实例扫描器 (`utils/test-instance-scanner.ts`)
- 管理所有测试实例的配置信息
- 提供动态导入功能
- 支持注册和注销测试实例

## 使用方法

### 1. 创建新的测试实例

1. 在 `src/pages/test/` 下创建新的文件夹，例如 `my-test/`
2. 在文件夹中创建 `index.vue` 文件
3. 在 `src/utils/test-instance-scanner.ts` 中注册配置：

```typescript
export const TEST_INSTANCE_CONFIGS: Record<string, TestInstanceConfig> = {
  // ... 现有配置
  'my-test': {
    name: 'my-test',
    title: '我的测试',
    description: '测试我的自定义组件',
    icon: 'MyIcon',
    tags: ['自定义', '组件'],
    path: '/test/my-test'
  }
};
```

### 2. 测试实例页面结构

每个测试实例的 `index.vue` 应该是一个完整的测试页面：

```vue
<template>
  <div class="my-test-page">
    <h2>我的测试</h2>
    <!-- 测试内容 -->
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MyTestPage',
});

// 测试逻辑
</script>

<style lang="scss" scoped>
.my-test-page {
  padding: 20px;
}
</style>
```

### 3. 路由配置

测试中心只需要一个路由：

```typescript
{
  path: 'test/components',
  name: 'TestComponents',
  component: () => import('../pages/test/components/index.vue'),
  meta: { titleKey: 'menu.test_features.components' },
}
```

## 特性

### 1. 自动发现
- 自动扫描 `test` 目录下的所有测试实例
- 动态导入组件，无需手动配置路由

### 2. 搜索功能
- 支持按标题、描述、标签搜索
- 实时过滤结果

### 3. 卡片式布局
- 美观的卡片设计
- 响应式布局
- 悬停效果

### 4. 弹窗运行
- 点击卡片在弹窗中运行测试
- 支持全屏显示
- 自动滚动

### 5. 标签系统
- 每个测试实例都有标签
- 支持按标签分类和搜索
- 颜色编码

## 配置说明

### TestInstanceConfig 接口

```typescript
interface TestInstanceConfig {
  name: string;        // 实例名称（文件夹名）
  title: string;       // 显示标题
  description: string; // 描述信息
  icon: string;        // 图标名称
  tags: string[];      // 标签数组
  path: string;        // 路径（用于面包屑等）
}
```

### 标签类型映射

```typescript
const getTagType = (tag: string) => {
  const typeMap: Record<string, string> = {
    'CRUD': 'primary',
    '表格': 'success',
    '表单': 'warning',
    '分页': 'info',
    // ... 更多映射
  };
  return typeMap[tag] || 'info';
};
```

## 扩展功能

### 1. 添加新的测试实例
只需要在 `test-instance-scanner.ts` 中注册配置即可，无需修改其他文件。

### 2. 自定义图标
使用 Element Plus 的图标名称，或者自定义图标组件。

### 3. 自定义标签
可以添加任意标签，系统会自动分配颜色类型。

### 4. 批量操作
可以扩展支持批量运行测试、导出测试报告等功能。

## 注意事项

1. **文件夹命名**：测试实例文件夹名必须与配置中的 `name` 字段一致
2. **组件导出**：每个测试实例的 `index.vue` 必须正确导出组件
3. **配置注册**：新测试实例必须在 `test-instance-scanner.ts` 中注册
4. **路由清理**：不需要为每个测试实例单独配置路由
5. **国际化**：测试实例的标题和描述支持国际化

## 优势

1. **维护简单**：添加新测试实例只需要创建文件夹和注册配置
2. **自动发现**：无需手动配置路由和菜单
3. **统一管理**：所有测试实例在一个页面中统一管理
4. **搜索友好**：支持多维度搜索
5. **扩展性强**：易于添加新功能和自定义配置
