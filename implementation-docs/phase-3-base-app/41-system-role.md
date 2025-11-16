# 24.5 - 系统管理-角色菜单

> **阶段**: Phase 3 | **时间**: 4小时 | **前置**: 24

## 🎯 任务目标

实现角色管理和菜单管理模块，支持权限分配。

## 📋 执行步骤

### 1. 创建角色管理 CRUD

**src/views/system/role/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          name: '管理员',
          code: 'admin',
          description: '系统管理员',
          status: 1,
        },
        {
          id: 2,
          name: '普通用户',
          code: 'user',
          description: '普通用户角色',
          status: 1,
        },
      ],
      total: 2,
    }),
    add: async (data: any) => ({ id: 3 }),
    update: async (data: any) => ({}),
    delete: async (params: any) => ({}),
  },

  table: {
    columns: [
      { prop: 'id', label: 'ID', width: 80 },
      { prop: 'name', label: '角色名称', width: 150 },
      { prop: 'code', label: '角色编码', width: 150 },
      { prop: 'description', label: '描述' },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => row.status === 1 ? '启用' : '禁用',
      },
    ],
    
    actions: {
      custom: [
        {
          label: '分配权限',
          type: 'primary',
          click: (row: any) => {
            // 打开权限分配弹窗
          },
        },
      ],
    },
  },

  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
    ],
  },

  upsert: {
    items: [
      {
        prop: 'name',
        label: '角色名称',
        component: 'el-input',
        rules: [{ required: true, message: '请输入角色名称' }],
      },
      {
        prop: 'code',
        label: '角色编码',
        component: 'el-input',
        rules: [{ required: true, message: '请输入角色编码' }],
        tip: '唯一标识，如：admin、user',
      },
      {
        prop: 'description',
        label: '描述',
        component: 'el-input',
        componentProps: { type: 'textarea', rows: 3 },
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-radio-group',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
        defaultValue: 1,
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建菜单管理 CRUD

**src/views/system/menu/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          name: '系统管理',
          path: '/system',
          icon: 'el-icon-setting',
          sort: 1,
          type: 1, // 1-目录 2-菜单 3-按钮
          parentId: 0,
        },
        {
          id: 11,
          name: '用户管理',
          path: '/system/user',
          icon: 'el-icon-user',
          component: 'system/user/index',
          sort: 1,
          type: 2,
          parentId: 1,
          permission: 'system:user:view',
        },
      ],
      total: 2,
    }),
    add: async (data: any) => ({ id: 3 }),
    update: async (data: any) => ({}),
    delete: async (params: any) => ({}),
  },

  table: {
    columns: [
      { prop: 'name', label: '菜单名称', width: 200 },
      { prop: 'icon', label: '图标', width: 100 },
      { prop: 'path', label: '路径', width: 200 },
      {
        prop: 'type',
        label: '类型',
        width: 100,
        formatter: (row: any) => ['', '目录', '菜单', '按钮'][row.type],
      },
      { prop: 'sort', label: '排序', width: 80 },
      { prop: 'permission', label: '权限标识' },
    ],
  },

  upsert: {
    items: [
      {
        prop: 'type',
        label: '菜单类型',
        component: 'el-radio-group',
        options: [
          { label: '目录', value: 1 },
          { label: '菜单', value: 2 },
          { label: '按钮', value: 3 },
        ],
        defaultValue: 2,
      },
      {
        prop: 'parentId',
        label: '上级菜单',
        component: 'el-tree-select',
        componentProps: {
          data: [], // 树形菜单数据
          checkStrictly: true,
        },
      },
      {
        prop: 'name',
        label: '菜单名称',
        component: 'el-input',
        rules: [{ required: true, message: '请输入菜单名称' }],
      },
      {
        prop: 'path',
        label: '路由路径',
        component: 'el-input',
        tip: '如：/system/user',
      },
      {
        prop: 'component',
        label: '组件路径',
        component: 'el-input',
        tip: '如：system/user/index',
      },
      {
        prop: 'icon',
        label: '图标',
        component: 'el-input',
      },
      {
        prop: 'permission',
        label: '权限标识',
        component: 'el-input',
        tip: '如：system:user:view',
      },
      {
        prop: 'sort',
        label: '排序',
        component: 'el-input-number',
        defaultValue: 1,
      },
    ],
  },
} as CrudConfig;
```

### 3. 创建权限分配组件

**src/views/system/role/components/PermissionDialog.vue**:
```vue
<template>
  <el-dialog v-model="visible" title="分配权限" width="600px">
    <el-tree
      ref="treeRef"
      :data="menuTree"
      :props="{ label: 'name', children: 'children' }"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedKeys"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ElTree } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  roleId?: number;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const treeRef = ref<InstanceType<typeof ElTree>>();
const menuTree = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);

// 加载菜单树和已分配权限
watch(() => props.roleId, async (id) => {
  if (id) {
    // 加载菜单树
    // menuTree.value = await service.menu.tree();
    // 加载已分配权限
    // checkedKeys.value = await service.role.permissions(id);
  }
}, { immediate: true });

const handleSave = async () => {
  const checkedNodes = treeRef.value?.getCheckedKeys() || [];
  
  // 保存权限
  // await service.role.assignPermissions({
  //   roleId: props.roleId,
  //   menuIds: checkedNodes,
  // });
  
  emit('success');
  visible.value = false;
};
</script>
```

## ✅ 验收标准

### 检查 1: 角色管理

```bash
# 访问 /system/role
# 预期:
- 显示角色列表
- 可新增/编辑角色
- 可分配权限
- 权限树正确显示
```

### 检查 2: 菜单管理

```bash
# 访问 /system/menu
# 预期:
- 显示菜单树
- 可新增/编辑菜单
- 支持目录/菜单/按钮类型
- 权限标识配置
```

### 检查 3: 权限分配

```bash
# 点击"分配权限"
# 预期:
- 显示菜单树
- 已分配的权限被选中
- 保存后权限生效
```

## 📝 检查清单

- [ ] 角色 CRUD 创建
- [ ] 菜单 CRUD 创建
- [ ] 权限分配组件
- [ ] 菜单树加载
- [ ] 权限保存
- [ ] 页面路由配置
- [ ] 功能完整

## 🔗 下一步

- [25 - 子应用模板](../phase-4-sub-apps/25-sub-app-template.md)

---

**状态**: ✅ 就绪 | **预计时间**: 4小时

