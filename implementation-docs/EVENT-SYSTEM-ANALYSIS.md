# 事件系统分析：cool-admin vs BTC

## ? cool-admin-vue 事件系统用途

### 1. **组件间通信 - `crud.proxy`**

#### 场景：CRUD 容器 → 子组件通信

```vue
<!-- cool-admin 的组件结构 -->
<cl-crud>
  <cl-table />      <!-- 表格组件 -->
  <cl-upsert />     <!-- 弹窗组件 -->
</cl-crud>
```

**问题**：`<cl-table>` 中点击"编辑"按钮，如何打开 `<cl-upsert>` 弹窗？

**cool-admin 的解决方案**：事件总线

```typescript
// 在 cl-table 中（通过 helper.ts）
function rowEdit(data) {
  mitt.emit("crud.proxy", {
    name: "edit",
    data: [data]
  });
}

// 在 cl-upsert 中（通过 hooks/index.ts）
mitt.on("crud.proxy", ({ name, data }) => {
  if (name === "edit") {
    // 打开弹窗并填充数据
    open(data[0]);
  }
});
```

**核心代码**（`crud/src/hooks/index.ts:43`）：
```typescript
mitt.on("crud.proxy", ({ name, data = [], callback }: any) => {
  if (ctx[name]) {  // ctx 是 upsert/table 等组件的实例
    let d = null;
    if (isFunction(ctx[name])) {
      d = ctx[name](...data);  // 调用组件方法
    }
    if (callback) {
      callback(d);
    }
  }
});
```

---

### 2. **数据刷新通知 - `crud.refresh`**

#### 场景：刷新数据后通知所有子组件

```typescript
// 在 helper.ts 刷新完成后
const res = await service.page(params);
mitt.emit("crud.refresh", res);  // 广播数据

// 在 cl-table 中监听
mitt.on("crud.refresh", ({ list }) => {
  data.value = list;  // 更新表格数据
});

// 在 cl-pagination 中监听
mitt.on("crud.refresh", (res) => {
  total.value = res.pagination.total;  // 更新分页
});
```

---

### 3. **UI 交互事件 - `crud.openAdvSearch`、`resize`**

```typescript
// 打开高级搜索
mitt.emit("crud.openAdvSearch");

// 窗口大小调整
mitt.on("resize", () => {
  calcMaxHeight();  // 重新计算表格高度
});
```

---

## ? BTC 架构的替代方案

### ? 方案 1：**直接访问（最优）**

在 BTC 中，所有状态和方法都在同一个作用域：

```vue
<template>
  <div>
    <!-- 表格 -->
    <el-table :data="tableData" :loading="loading">
      <el-table-column label="操作">
        <template #default="{ row }">
          <!-- 直接调用方法 -->
          <el-button @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog v-model="upsertVisible" title="编辑">
      <el-form :model="currentRow">
        <!-- 直接访问数据 -->
        <el-form-item label="姓名">
          <el-input v-model="currentRow.name" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 所有状态和方法在同一个作用域
const {
  tableData,
  loading,
  upsertVisible,
  currentRow,
  handleEdit,
} = useCrud<User>({ service });

// 直接操作，无需事件
function customEdit(row: User) {
  currentRow.value = { ...row };
  upsertVisible.value = true;  // 直接修改状态
}
</script>
```

**优势**：
- ? 类型安全（TypeScript 完整支持）
- ? 简单直观（无魔法，直接调用）
- ? IDE 支持（代码补全、跳转定义）
- ? 调试方便（无需追踪事件）

---

### ? 方案 2：**Provide/Inject（跨层级组件）**

如果真的需要跨组件通信（如拆分成多个子组件）：

```vue
<!-- 父组件 -->
<script setup lang="ts">
const crud = useCrud<User>({ service });

// 提供给子组件
provide('crud', crud);
</script>

<template>
  <div>
    <UserTable />      <!-- 表格子组件 -->
    <UserDialog />     <!-- 弹窗子组件 -->
  </div>
</template>
```

```vue
<!-- 子组件：UserTable.vue -->
<script setup lang="ts">
const crud = inject<UseCrudReturn<User>>('crud');

// 直接使用
const handleClick = (row: User) => {
  crud?.handleEdit(row);  // 类型安全
};
</script>
```

**优势**：
- ? 类型安全（比事件总线强）
- ? 官方推荐（Vue 3 标准方案）
- ? 按需注入（只传递需要的部分）

---

### ? 方案 3：**Composable 组合（代码复用）**

如果需要在多个组件中复用 CRUD 逻辑：

```typescript
// composables/useUserManagement.ts
export function useUserManagement() {
  const crud = useCrud<User>({
    service: userService,
    onSuccess: (msg) => ElMessage.success(msg),
  });

  // 自定义业务逻辑
  const handleExport = () => {
    // 导出选中的数据
    const ids = crud.selection.value.map(u => u.id);
    exportUsers(ids);
  };

  return {
    ...crud,
    handleExport,
  };
}
```

```vue
<!-- 在任何组件中使用 -->
<script setup lang="ts">
const { tableData, handleEdit, handleExport } = useUserManagement();
</script>
```

**优势**：
- ? 逻辑复用（DRY 原则）
- ? 独立测试（每个 composable 可单独测试）
- ? 渐进增强（按需组合功能）

---

### ? 方案 4：**Pinia 状态管理（全局状态）**

如果需要跨页面共享 CRUD 状态（如多标签页同步）：

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const crud = useCrud<User>({ service: userService });
  
  // 额外的全局状态
  const activeUserId = ref<number | null>(null);
  
  return {
    ...crud,
    activeUserId,
  };
});
```

```vue
<!-- 在任何组件中使用 -->
<script setup lang="ts">
const userStore = useUserStore();
const { tableData, handleEdit } = userStore;
</script>
```

**优势**：
- ? 全局共享（跨页面同步）
- ? 持久化（可配合 pinia-plugin-persistedstate）
- ? DevTools 支持（Vue DevTools 可视化）

---

## ? 方案对比表

| 维度 | cool-admin<br/>事件总线 | BTC<br/>直接访问 | BTC<br/>Provide/Inject | BTC<br/>Pinia |
|------|----------------------|----------------|---------------------|-------------|
| **类型安全** | ? 无类型 | ? 完全类型安全 | ? 完全类型安全 | ? 完全类型安全 |
| **IDE 支持** | ? 无补全 | ? 完整补全 | ? 完整补全 | ? 完整补全 |
| **调试难度** | ? 需追踪事件 | ? 直接追踪 | ? 直接追踪 | ? DevTools 可视化 |
| **代码可读性** | ? 需理解事件流 | ? 一目了然 | ? 清晰明了 | ? 集中管理 |
| **跨组件通信** | ? 支持 | ? 同作用域 | ? 支持 | ? 全局支持 |
| **跨页面共享** | ? 不支持 | ? 不支持 | ? 不支持 | ? 支持 |
| **性能开销** | ? 事件监听 | ? 无额外开销 | ? 轻量 | ? 响应式代理 |

---

## ? 实际场景对比

### 场景 1：点击编辑按钮

#### cool-admin（事件总线）
```typescript
// 1. 表格组件触发事件
mitt.emit("crud.proxy", { name: "edit", data: [row] });

// 2. 事件总线转发
mitt.on("crud.proxy", ({ name, data }) => { ... });

// 3. Upsert 组件响应
if (name === "edit") {
  open(data[0]);
}
```
**步骤**：3 步，跨 3 个文件

#### BTC（直接调用）
```typescript
// 1. 直接调用
handleEdit(row);
```
**步骤**：1 步，同一个文件

---

### 场景 2：刷新后更新多个组件

#### cool-admin（事件广播）
```typescript
// 发送方
mitt.emit("crud.refresh", res);

// 接收方 1（Table）
mitt.on("crud.refresh", ({ list }) => { data.value = list; });

// 接收方 2（Pagination）
mitt.on("crud.refresh", (res) => { total.value = res.total; });
```

#### BTC（响应式状态）
```typescript
// 数据更新后，自动响应
const res = await service.page(params);
tableData.value = res.list;        // Table 自动更新
pagination.total = res.total;      // Pagination 自动更新
```
**无需事件，Vue 响应式系统自动处理**

---

### 场景 3：子组件需要访问 CRUD 方法

#### cool-admin（事件或 ref）
```vue
<!-- 父组件 -->
<cl-crud ref="crudRef">
  <CustomButton />
</cl-crud>

<!-- 子组件 -->
<script>
const crudRef = inject('crudRef');
crudRef.value?.refresh();  // 需要 ref
</script>
```

#### BTC（Provide/Inject）
```vue
<!-- 父组件 -->
<script setup>
const crud = useCrud({ service });
provide('crud', crud);
</script>

<!-- 子组件 -->
<script setup>
const { handleRefresh } = inject('crud');
handleRefresh();  // 直接调用，类型安全
</script>
```

---

## ? 结论

### 为什么 BTC 不需要事件系统？

1. **架构不同**
   - cool-admin：组件驱动（父子组件分离）
   - BTC：Composable 驱动（逻辑集中）

2. **通信方式更好**
   - cool-admin：事件总线（字符串，无类型）
   - BTC：直接调用 / Provide/Inject（类型安全）

3. **Vue 3 原生支持**
   - Composition API 本身就是为了避免事件总线
   - 响应式系统自动处理数据流

### 什么时候需要事件系统？

**? 几乎不需要！**

但如果真的遇到以下场景：
- 跨路由/跨页面通信 → **用 Pinia**
- 全局事件广播（如 WebSocket 消息） → **用 Mitt 或 EventBus**
- 第三方插件集成 → **用 Mitt**

对于 CRUD 功能：**完全不需要事件系统** ?

---

## ? 推荐实践

```typescript
// ? 推荐：单组件内使用
const crud = useCrud({ service });

// ? 推荐：跨组件使用
provide('crud', crud);
const crud = inject('crud');

// ? 推荐：全局状态
const store = defineStore('user', () => useCrud({ service }));

// ? 不推荐：事件总线
mitt.emit('crud:refresh');
mitt.on('crud:refresh', callback);
```

---

## ? 总结

| 方案 | 适用场景 | 优先级 |
|------|---------|--------|
| **直接访问** | 单组件 CRUD（90% 场景） | ? 首选 |
| **Provide/Inject** | 父子/兄弟组件通信 | ? 备选 |
| **Pinia** | 跨页面共享状态 | ? 特定场景 |
| **事件总线** | 全局事件广播 | ? 极少使用 |

**BTC 的 Composable 架构从根本上消除了对事件系统的依赖，提供了更简洁、类型安全、易维护的解决方案！** ?

