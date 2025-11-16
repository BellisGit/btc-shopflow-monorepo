# CRUD Composable 实施总结

## ? 任务完成度：97%

### ? 已实现功能（32/33）

#### 1. **基础数据管理** (4/4)
- `tableData` - 表格数据列表
- `loading` - 加载状态
- `selection` - 选择行数组
- `searchParams` + `pagination` - 查询参数

#### 2. **分页功能** (3/3)
- `pagination.page/size/total` - 分页配置
- `handlePageChange(page)` - 页码变化
- `handleSizeChange(size)` - 每页条数变化

#### 3. **数据加载** (4/4)
- `loadData()` - 加载数据
- `handleSearch(params)` - 搜索
- `handleReset()` - 重置搜索
- `handleRefresh()` - 刷新

#### 4. **新增/编辑/查看** (7/7)
- `handleAdd()` - 新增
- `handleEdit(row)` - 编辑
- `handleAppend(row?)` - 追加（对应 cool-admin rowAppend）
- `handleView(row)` - 查看详情
- `handleViewClose()` - 关闭详情
- `closeDialog()` - 统一关闭所有弹窗（对应 cool-admin rowClose）
- `upsertVisible/viewVisible` + `currentRow/viewRow` - 弹窗状态管理

#### 5. **删除功能** (2/2)
- `handleDelete(row)` - 单行删除
- `handleMultiDelete()` - 批量删除

#### 6. **选择管理** (3/3)
- `handleSelectionChange(rows)` - 选择变化回调
- `clearSelection()` - 清空选择
- `toggleSelection(row, selected?)` - 切换选择

#### 7. **参数管理** (2/3) ? 97%
- ? `getParams()` - 获取当前查询参数（对应 cool-admin getParams）
- ? `setParams(params)` - 设置查询参数（对应 cool-admin setParams）
- ? `paramsReplace()` - 参数字典替换（Phase 3 实现）

#### 8. **生命周期钩子** (7/7)
- `onLoad()` - 加载前钩子
- `onBeforeRefresh(params)` - 刷新前钩子，可修改参数（对应 cool-admin onRefresh）
- `onAfterRefresh(data)` - 刷新后钩子
- `onBeforeDelete(rows)` - 删除前钩子，返回 false 可阻止删除（对应 cool-admin onDelete）
- `onAfterDelete()` - 删除后钩子
- `onSuccess(message)` - 成功回调
- `onError(error)` - 错误回调

---

## ? 与 cool-admin-vue 对比

| 维度 | cool-admin-vue | BTC 实现 | 差异说明 |
|------|---------------|---------|---------|
| **核心功能** | 33 项 | 32 项 (97%) | 缺 1 项：参数字典替换 |
| **架构** | 组件驱动 + 事件总线 | Composable 直接调用 | 更简洁 |
| **类型安全** | ? 部分 | ? 完全 | TypeScript 泛型 |
| **IDE 支持** | ? 有限 | ? 完整 | 代码补全/跳转 |
| **调试难度** | ? 需追踪事件 | ? 直接追踪 | 无魔法 |
| **学习曲线** | ? 陡峭 | ? 平缓 | 符合 Vue 3 最佳实践 |

---

## ? 架构优势

### 1. **无需事件系统**

**cool-admin 方式**（事件总线）：
```typescript
// 3 步，跨 3 个文件
mitt.emit("crud.proxy", { name: "edit", data: [row] });
```

**BTC 方式**（直接调用）：
```typescript
// 1 步，同一个文件
handleEdit(row);
```

**详见**：`EVENT-SYSTEM-ANALYSIS.md`

---

### 2. **完全类型安全**

```typescript
const {
  tableData,      // Ref<User[]> - 有类型提示
  handleEdit,     // (row: User) => void - 参数类型检查
  pagination,     // { page: number; size: number; total: number }
} = useCrud<User>({ service: userService });

// IDE 会自动提示所有方法和属性
handleEdit(user);  // ? 类型检查
handleEdit({});    // ? 编译错误
```

---

### 3. **灵活组合**

```typescript
// 基础使用
const crud = useCrud<User>({ service });

// 扩展业务逻辑
const { tableData, handleEdit, selection } = crud;

const handleExport = () => {
  const ids = selection.value.map(u => u.id);
  exportUsers(ids);
};

// 全局状态（Pinia）
const store = defineStore('user', () => {
  const crud = useCrud<User>({ service });
  return { ...crud, customMethod };
});
```

---

## ? 使用示例

### 基础 CRUD 页面

```vue
<template>
  <div>
    <!-- 工具栏 -->
    <el-button type="primary" @click="handleAdd">新增</el-button>
    <el-button 
      type="danger" 
      :disabled="selection.length === 0"
      @click="handleMultiDelete"
    >
      批量删除 ({{ selection.length }})
    </el-button>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      :loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link @click="handleView(row)">查看</el-button>
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useCrud } from '@btc/shared-core';

const {
  tableData,
  loading,
  pagination,
  selection,
  upsertVisible,
  currentRow,
  loadData,
  handleAdd,
  handleEdit,
  handleView,
  handleDelete,
  handleMultiDelete,
  handleSelectionChange,
  handlePageChange,
  handleSizeChange,
} = useCrud<User>({
  service: userService,
  onSuccess: (msg) => ElMessage.success(msg),
  onError: (err) => ElMessage.error(err.message),
});

onMounted(() => loadData());
</script>
```

### 高级钩子使用

```typescript
useCrud<User>({
  service: userService,
  
  // 刷新前：添加时间戳
  onBeforeRefresh: (params) => ({
    ...params,
    timestamp: Date.now(),
  }),
  
  // 刷新后：统计数据
  onAfterRefresh: (data) => {
    console.log(`加载了 ${data.list.length} 条数据`);
  },
  
  // 删除前：确认弹窗
  onBeforeDelete: async (rows) => {
    const result = await ElMessageBox.confirm(
      `确认删除 ${rows.length} 条数据？`,
      '提示',
      { type: 'warning' }
    );
    return result === 'confirm';
  },
  
  // 删除后：刷新其他数据
  onAfterDelete: () => {
    refreshOtherData();
  },
});
```

---

## ? 相关文档

1. **使用文档**：`btc-shopflow-monorepo/packages/shared-core/src/btc/crud/README.md`
2. **功能对比**：`implementation-docs/CRUD-FEATURE-COMPARISON.md`
3. **事件系统分析**：`implementation-docs/EVENT-SYSTEM-ANALYSIS.md`
4. **类型定义**：`btc-shopflow-monorepo/packages/shared-core/src/btc/crud/types.ts`

---

## ? Phase 3 计划（3% 未完成功能）

### 1. **参数字典替换** (高优先级)

支持后端字段映射：

```typescript
useCrud<User>({
  service,
  dict: {
    pagination: {
      page: 'pageNum',    // 前端 page → 后端 pageNum
      size: 'pageSize',   // 前端 size → 后端 pageSize
    },
    search: {
      keyword: 'searchKey',
    },
  },
});
```

### 2. **权限控制集成** (高优先级)

```typescript
const { checkPermission } = useCrud<User>({
  service,
  permission: {
    add: true,
    delete: false,
  },
});

// 在模板中
<el-button v-if="checkPermission('add')" @click="handleAdd">新增</el-button>
```

### 3. **字典系统集成** (中优先级)

与 i18n 整合，支持自定义标签：

```typescript
useCrud<User>({
  service,
  labels: {
    add: 'crud.button.add',       // 使用 i18n key
    delete: 'crud.button.delete',
  },
});
```

---

## ? 总结

**BTC 的 CRUD Composable 已经达到 97% 的功能对齐，提供了比 cool-admin-vue 更简洁、类型安全、易维护的解决方案！**

**核心优势**：
- ? 直接调用，无需事件总线
- ? 完全类型安全
- ? 简单易懂
- ? 符合 Vue 3 最佳实践
- ? 文档完整

**下一步**：Phase 2 继续实施 CRUD 组件层（Table/Form/Search）?

