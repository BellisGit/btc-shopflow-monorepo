# 15 - 权限指令系统

> **阶段**: Phase 2 | **时间**: 2小时 | **前置**: 14

## 🎯 任务目标

实现权限控制系统，包括指令式和编程式权限判断。

## 📋 执行步骤

### 1. 实现权限指令

**packages/shared-core/src/directives/permission.ts**:
```typescript
import type { Directive } from 'vue';

const permissions = new Set<string>();

export function setPermissions(perms: string[]) {
  permissions.clear();
  perms.forEach(p => permissions.add(p));
}

export function hasPermission(perm: string | string[]): boolean {
  if (Array.isArray(perm)) {
    return perm.some(p => permissions.has(p));
  }
  return permissions.has(perm);
}

export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding;
    
    if (value && !hasPermission(value)) {
      el.parentNode?.removeChild(el);
    }
  },
};
```

### 2. 实现 usePermission

**packages/shared-core/src/composables/use-permission.ts**:
```typescript
import { hasPermission as checkPermission } from '../directives/permission';

export function usePermission() {
  return {
    hasPermission: checkPermission,
    
    hasAnyPermission(...perms: string[]) {
      return perms.some(p => checkPermission(p));
    },
    
    hasAllPermissions(...perms: string[]) {
      return perms.every(p => checkPermission(p));
    },
  };
}
```

### 3. 导出

**packages/shared-core/src/index.ts**:
```typescript
export { vPermission, setPermissions, hasPermission } from './directives/permission';
export { usePermission } from './composables/use-permission';
```

## ✅ 验收标准

### 检查：权限使用

```vue
<template>
  <el-button v-permission="'user:add'" type="primary">
    新增用户
  </el-button>
  
  <el-button v-if="hasPermission('user:edit')">
    编辑
  </el-button>
</template>

<script setup lang="ts">
import { usePermission, setPermissions } from '@btc/shared-core';

const { hasPermission } = usePermission();

// 设置权限
setPermissions(['user:add', 'user:edit']);
</script>
```

## 📝 检查清单

- [ ] 权限指令实现
- [ ] usePermission 实现
- [ ] 权限判断逻辑
- [ ] 导出正确
- [ ] 指令生效

## 🎉 里程碑 M2 完成

恭喜！完成阶段二，核心系统已可用：
- ✅ EPS 自动化服务生成
- ✅ CRUD 配置化系统
- ✅ 插件管理系统
- ✅ 数据字典系统
- ✅ 权限控制系统

## 🔗 下一步

- [16 - 主应用初始化](../phase-3-main-app/16-main-app-init.md)

