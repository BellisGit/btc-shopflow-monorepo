# @btc/vite-plugin

> BTC 微前端 Vite 插件集合

## 📦 包含功能

| 功能        | 状态      | 对应文档 | 说明                           |
| ----------- | --------- | -------- | ------------------------------ |
| **EPS**     | ✅ 已实现 | 12-13    | Endpoint Service（API 自动化） |
| **Virtual** | ⏳ 待实现 | 13       | 虚拟模块整合                   |
| **SVG**     | ⏳ 待实现 | 21+      | SVG 图标处理                   |
| **Ctx**     | ⏳ 待实现 | 46       | 上下文（模块扫描）             |
| **Tag**     | ⏳ 待实现 | 36       | 组件名称标签                   |
| **File**    | ⏳ 待实现 | 69-71    | 文件操作工具                   |
| **Proxy**   | ⏳ 待实现 | 65       | 代理配置管理                   |

## 🚀 使用方式

### 方式 1：统一配置（推荐）

```typescript
import { btc } from '@btc/vite-plugin';

export default defineConfig({
  plugins: [
    vue(),
    btc({
      eps: {
        enable: true,
        api: '/admin/base/open/eps',
        dist: 'build/eps',
      },
      svg: {
        enable: true,
        dirs: ['src/assets/icons'],
      },
      ctx: {
        enable: true,
        modulesDir: 'src/modules',
      },
      nameTag: true,
    }),
  ],
});
```

### 方式 2：按需引入

```typescript
import { epsPlugin, svgPlugin } from '@btc/vite-plugin';

export default defineConfig({
  plugins: [
    vue(),
    epsPlugin({
      epsUrl: '/admin/base/open/eps',
      outputDir: 'build/eps',
    }),
    // svgPlugin(),  // 按需添加
  ],
});
```

## 📋 功能详解

### EPS（Endpoint Service）✅

从后端自动生成 API 服务层：

```typescript
// 自动生成
import { service } from 'virtual:eps';

// 使用
await service.user.list({ page: 1 });
await service.order.create({ name: 'xxx' });
```

### SVG 图标（待实现）

自动扫描和注册 SVG 图标：

```vue
<template>
  <svg-icon name="user" />
  <svg-icon name="order" />
</template>
```

### Ctx 上下文（待实现）

自动扫描模块并生成配置：

```typescript
import { modules } from 'virtual:ctx';
// modules = [
//   { name: 'user', routes: [...], menus: [...] }
// ]
```

### Tag 标签（待实现）

自动添加组件 name：

```vue
<!-- 自动添加 name="UserList" -->
<script setup lang="ts">
// ...
</script>
```

## 🔄 实施计划

当前进度：12/76

**已完成**：

- ✅ EPS 基础插件
- ✅ 虚拟模块支持

**待实施**（按文档顺序）：

- ⏳ 文档 13-14: EPS 完善
- ⏳ 文档 21-23: 业务插件（Excel、PDF、Upload）
- ⏳ 文档 36: Tag 插件
- ⏳ 文档 46: Ctx 插件
- ⏳ 文档 69-71: CLI 工具

---

**参考 Cool-Admin 架构，完整实现所有功能！**
