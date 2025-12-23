# BtcDialog 引入和使用链路对比

## 1. 组件导出链路

### 物流应用和管理应用：**完全一致**

```
packages/shared-components/src/index.ts
  ├─ export { default as BtcDialog } from './common/dialog/index.vue';
  └─ export { default as BtcUpsert } from './crud/upsert/index.vue';
```

## 2. 自动导入配置

### 物流应用
```typescript
// apps/logistics-app/src/components.d.ts
BtcDialog: typeof import('@btc/shared-components')['BtcDialog']
```

### 管理应用
```typescript
// apps/admin-app/src/components.d.ts
BtcDialog: typeof import('@btc/shared-components')['BtcDialog']
```

**结论：完全一致**

## 3. BtcUpsert 内部导入 BtcDialog

### 物流应用和管理应用：**完全一致**

```typescript
// packages/shared-components/src/crud/upsert/index.vue
import BtcDialog from '../../common/dialog/index.vue';
```

## 4. 页面使用方式

### 物流应用示例
```vue
<!-- apps/logistics-app/src/modules/warehouse/views/material/list/index.vue -->
<template>
  <BtcCrud>
    <BtcUpsert ref="upsertRef" :items="formItems" width="720px" />
  </BtcCrud>
</template>

<script setup>
import { BtcCrud, BtcUpsert } from '@btc/shared-components';
</script>
```

### 管理应用示例
```vue
<!-- apps/admin-app/src/modules/platform/access/views/roles/index.vue -->
<template>
  <BtcCrud>
    <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
  </BtcCrud>
</template>

<script setup>
import { BtcCrud, BtcUpsert } from '@btc/shared-components';
</script>
```

**结论：使用方式完全一致**

## 5. BtcDialog 组件实现

### 物流应用和管理应用：**完全一致**

```typescript
// packages/shared-components/src/common/dialog/index.vue
export default defineComponent({
  name: 'BtcDialog',
  setup(props, { emit, expose, slots }) {
    const dialogContext = useDialog(props, emit);
    const { render } = useDialogRender(props, dialogContext, slots);
    return render;
  }
});
```

## 6. 样式导入链路

### 物流应用
```typescript
// apps/logistics-app/src/main.ts
import '@btc/shared-components/styles/dark-theme.css';

// apps/logistics-app/src/bootstrap/index.ts
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

// apps/logistics-app/src/bootstrap/core/ui.ts
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../../styles/theme.scss';
```

### 管理应用
```typescript
// apps/admin-app/src/main.ts
import '@btc/shared-components/styles/dark-theme.css';
import './styles/nprogress.scss';
import './styles/menu-themes.scss';

// apps/admin-app/src/bootstrap/index.ts
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

// apps/admin-app/src/bootstrap/core/ui.ts
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '../../styles/theme.scss';
```

**差异点：**
- 管理应用的 `main.ts` 中多导入了 `nprogress.scss` 和 `menu-themes.scss`
- 管理应用之前有 `virtual:uno.css`（已移除）

## 7. Element Plus 注册

### 物流应用和管理应用：**完全一致**

```typescript
// 两个应用的 bootstrap/core/ui.ts 完全相同
export const setupElementPlus = (app: App) => {
  const currentLocale = getCurrentLocale();
  app.use(ElementPlus, {
    locale: elementLocale[currentLocale as keyof typeof elementLocale] || zhCn
  });
};
```

## 8. 关键差异总结

| 项目 | 物流应用 | 管理应用 | 是否影响 BtcDialog |
|------|---------|---------|-------------------|
| 组件导出路径 | `@btc/shared-components` | `@btc/shared-components` | ❌ 一致 |
| 自动导入配置 | 相同 | 相同 | ❌ 一致 |
| BtcUpsert 导入 | 相对路径 | 相对路径 | ❌ 一致 |
| 使用方式 | `<BtcUpsert>` | `<BtcUpsert>` | ❌ 一致 |
| Element Plus 注册 | `app.use(ElementPlus)` | `app.use(ElementPlus)` | ❌ 一致 |
| 样式导入顺序 | 标准顺序 | 标准顺序 | ❌ 一致 |
| main.ts 额外导入 | 无 | `nprogress.scss`, `menu-themes.scss` | ⚠️ 可能影响 |

## 9. 可能的问题点

1. **样式加载顺序**：管理应用的 `main.ts` 中额外导入了样式文件，可能影响样式优先级
2. **Element Plus 初始化时机**：虽然注册方式一致，但初始化时机可能有差异
3. **Vue 应用挂载时机**：两个应用的挂载流程可能有细微差异

## 10. 建议检查点

1. ✅ 已移除管理应用 `main.ts` 中的 `virtual:uno.css`
2. ⚠️ 检查管理应用的样式加载顺序是否影响 Element Plus 组件渲染
3. ⚠️ 检查两个应用的 Vue 应用实例创建和挂载时机
4. ⚠️ 检查是否有全局样式覆盖了 Element Plus 的样式
