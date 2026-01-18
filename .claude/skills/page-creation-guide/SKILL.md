---
name: page-creation-guide
description: 根据已有页面布局和自定义组件，为新页面推荐合适的组件组合和代码模板
version: 1.0.0
---

# 页面创建指南

本技能帮助 AI 助手根据项目已有的页面布局模式和自定义组件，为新页面推荐合适的组件组合和代码模板。

## 核心原则

1. **统一布局**：所有应用必须使用 `@btc/shared-components` 的 `AppLayout` 组件
2. **组件复用**：优先使用共享组件库中的组件
3. **模式匹配**：根据页面功能类型，参考现有相似页面
4. **规范遵循**：遵循项目的目录结构和命名规范

## 页面类型识别

根据用户需求，识别页面类型并推荐相应的组件组合：

### 1. CRUD 页面（增删改查）

**识别特征**：
- 需要列表展示
- 需要新增/编辑功能
- 需要删除功能
- 需要分页

**推荐组件组合**：
```vue
<template>
  <BtcCrud ref="crudRef" :service="service">
    <!-- 工具栏 -->
    <BtcCrudRow>
      <BtcRefreshBtn />
      <BtcAddBtn />
      <BtcMultiDeleteBtn />
      <BtcCrudFlex1 />
      <BtcCrudSearchKey placeholder="搜索..." />
    </BtcCrudRow>

    <!-- 表格 -->
    <BtcCrudRow>
      <BtcTable :columns="columns" />
    </BtcCrudRow>

    <!-- 分页 -->
    <BtcCrudRow>
      <BtcCrudFlex1 />
      <BtcPagination />
    </BtcCrudRow>

    <!-- 新增/编辑弹窗 -->
    <BtcUpsert
      :items="formItems"
      width="800px"
      :on-submit="handleFormSubmit"
    />
  </BtcCrud>
</template>

<script setup lang="ts">
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  type TableColumn,
  type FormItem,
  BtcMessage,
} from '@btc/shared-components';

// 定义服务
const service = {
  page: async (params) => {
    // 列表接口
    const res = await api.page(params);
    return { list: res.list, total: res.total };
  },
  add: async (data) => await api.add(data),
  update: async (data) => await api.update(data),
  delete: async ({ ids }) => await api.delete({ ids }),
};

// 表格列配置
const columns: TableColumn[] = [
  { type: 'selection', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
  {
    type: 'op',
    label: '操作',
    width: 200,
    buttons: ['info', 'edit', 'delete']
  },
];

// 表单项配置
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: '名称',
    required: true,
    component: { name: 'el-input' }
  },
];

// 表单提交处理
const handleFormSubmit = async (data: any, { close, done }: any) => {
  try {
    if (data.id) {
      await service.update(data);
    } else {
      await service.add(data);
    }
    close();
    crudRef.value?.crud.loadData();
    BtcMessage.success('保存成功');
  } catch (error: any) {
    done();
    BtcMessage.error(error?.message || '保存失败');
  }
};
</script>
```

**参考页面**：
- `apps/docs-app/packages/components/btc-crud.md` - CRUD 组件文档
- 查看项目中其他 CRUD 页面的实现

### 2. 表单页面（独立表单）

**识别特征**：
- 只需要表单功能
- 不需要列表
- 可能是配置页面、设置页面等

**推荐组件组合**：
```vue
<template>
  <div class="page">
    <btc-card>
      <template #title>表单标题</template>
      
      <BtcForm ref="Form" />
      
      <template #footer>
        <el-button @click="handleSubmit">保存</el-button>
        <el-button @click="handleReset">重置</el-button>
      </template>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBtcForm } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { FormItem } from '@btc/shared-components';

const { Form } = useBtcForm();

// 打开表单
function openForm(data?: any) {
  Form.value?.open({
    title: data ? '编辑' : '新增',
    width: '800px',
    form: data,
    items: [
      {
        prop: 'name',
        label: '名称',
        span: 12,
        required: true,
        component: { name: 'el-input' }
      },
    ],
    on: {
      submit: async (formData: any, { close, done }: any) => {
        try {
          if (formData.id) {
            await api.update(formData);
          } else {
            await api.add(formData);
          }
          BtcMessage.success('保存成功');
          close();
        } catch (error: any) {
          done();
          BtcMessage.error(error?.message || '保存失败');
        }
      }
    }
  });
}

// 提交处理
function handleSubmit() {
  Form.value?.submit();
}

// 重置处理
function handleReset() {
  Form.value?.reset();
}
</script>
```

**参考页面**：
- `apps/main-app/src/pages/profile/index.vue` - 个人信息页面（使用 BtcForm）
- `apps/docs-app/packages/components/btc-form.md` - 表单组件文档

### 3. 详情页面

**识别特征**：
- 只读展示
- 可能需要编辑功能
- 使用卡片布局

**推荐组件组合**：
```vue
<template>
  <div class="page">
    <btc-card v-loading="loading">
      <template #title>详情标题</template>
      
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="字段1">
            {{ data.field1 }}
          </el-descriptions-item>
          <el-descriptions-item label="字段2">
            {{ data.field2 }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="handleEdit">编辑</el-button>
        <el-button @click="handleBack">返回</el-button>
      </template>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const data = ref<any>({});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await api.info({ id: route.params.id });
    data.value = res;
  } finally {
    loading.value = false;
  }
}

// 编辑
function handleEdit() {
  router.push(`/edit/${route.params.id}`);
}

// 返回
function handleBack() {
  router.back();
}

onMounted(() => {
  loadData();
});
</script>
```

**参考页面**：
- `apps/main-app/src/pages/profile/index.vue` - 个人信息详情页面

### 4. 列表页面（只读列表）

**识别特征**：
- 只需要列表展示
- 不需要编辑功能
- 可能需要筛选

**推荐组件组合**：
```vue
<template>
  <div class="page">
    <btc-card>
      <template #title>列表标题</template>
      
      <!-- 筛选表单 -->
      <BtcFilterForm
        :items="filterItems"
        @submit="handleFilter"
      />
      
      <!-- 表格 -->
      <BtcTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        @refresh="loadData"
      />
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { TableColumn, FormItem } from '@btc/shared-components';

const loading = ref(false);
const tableData = ref([]);
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
});

// 筛选表单项
const filterItems: FormItem[] = [
  {
    prop: 'keyword',
    label: '关键词',
    component: { name: 'el-input', props: { placeholder: '请输入关键词' } }
  },
];

// 表格列配置
const columns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
];

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await api.page({
      page: pagination.value.page,
      size: pagination.value.size,
    });
    tableData.value = res.list;
    pagination.value.total = res.total;
  } finally {
    loading.value = false;
  }
}

// 筛选处理
function handleFilter(params: any) {
  pagination.value.page = 1;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
```

## 组件推荐规则

### 根据功能需求推荐组件

| 功能需求 | 推荐组件 | 说明 |
|---------|---------|------|
| 数据列表 + 增删改查 | BtcCrud + BtcTable + BtcUpsert | CRUD 完整功能 |
| 独立表单 | BtcForm | 非 CRUD 场景的表单 |
| 筛选表单 | BtcFilterForm | 列表页面的筛选 |
| 卡片容器 | btc-card | 页面内容容器 |
| 对话框 | BtcDialog | 增强的对话框组件 |
| 上传组件 | BtcUpload | 文件上传 |
| 左树右表 | BtcViewGroup | 树形结构 + 表格 |

### 布局组件

所有页面都在 `AppLayout` 内部，页面本身不需要包含布局组件。

```vue
<!-- 页面组件（在 AppLayout 内部） -->
<template>
  <div class="page">
    <!-- 页面内容 -->
  </div>
</template>
```

## 目录结构规范

### 标准页面目录结构

```
pages/
├── module-name/           # 模块名
│   ├── index.vue         # 列表/主页面
│   ├── components/       # 页面专用组件
│   │   └── CustomComponent.vue
│   ├── composables/      # 组合式函数
│   │   └── useModule.ts
│   └── styles/          # 样式文件
│       └── index.scss
```

### 复杂页面结构

```
pages/
├── complex-page/
│   ├── index.vue         # 主页面
│   ├── detail.vue        # 详情页
│   ├── edit.vue          # 编辑页
│   ├── components/       # 共享组件
│   ├── composables/      # 业务逻辑
│   └── types.ts          # 类型定义
```

## 代码模板生成规则

### ⚠️ 重要：必须先查找参考实现

**在生成任何代码之前，必须先在项目中查找相似功能的实现作为参考。**

### 1. 查找参考实现（第一步，必须执行）

**使用 codebase_search 或 grep 查找相似功能：**

```typescript
// 示例：如果要创建用户管理页面
// 1. 搜索现有的用户管理相关页面
codebase_search("用户管理页面或用户列表页面的实现")
// 2. 搜索相似功能的配置
codebase_search("如何配置用户相关的国际化")
// 3. 搜索相似功能的组件使用
codebase_search("用户表单使用哪些组件")
```

**查找范围：**
- 相似功能的页面实现（`pages/` 或 `modules/*/views/`）
- 相似功能的配置（`modules/*/config.ts`）
- 相似功能的组件使用方式
- 相似功能的样式实现

### 2. 分析参考实现（第二步）

**分析参考实现的关键点：**

- **国际化配置**：参考实现如何配置国际化（config.ts 结构）
- **组件选择**：参考实现使用哪些组件（btc-* vs el-*）
- **代码结构**：参考实现的目录结构和文件组织
- **样式规范**：参考实现的 padding、布局等样式
- **命名规范**：参考实现的命名方式

### 3. 分析用户需求（第三步）

- 识别页面类型（CRUD/表单/详情/列表）
- 识别功能需求（增删改查/只读/筛选等）
- 识别数据来源（API 接口）

### 4. 生成代码模板（第四步）

**基于参考实现和用户需求，生成代码：**

- 严格按照参考实现的代码结构
- 使用参考实现相同的组件和配置方式
- 遵循参考实现的命名和样式规范
- 完整的 Vue 组件代码
- 必要的导入语句
- 类型定义
- 样式结构

### 5. 验证规范（第五步）

- 对比参考实现，确保一致性
- 使用 `common-mistakes-prevention` skill 检查常见错误
- 确保符合项目规范

## 实际应用示例

### 场景 1：创建用户管理页面

**用户需求**："创建一个用户管理页面，包含用户列表、新增、编辑、删除功能"

**识别结果**：
- 页面类型：CRUD 页面
- 功能需求：列表 + 增删改查
- 推荐组件：BtcCrud + BtcTable + BtcUpsert

**生成步骤**：
1. 创建页面文件：`apps/{app-name}/src/pages/user/index.vue`
2. 使用 CRUD 模板
3. 配置表格列（id, name, email, status 等）
4. 配置表单项（name, email, password, role 等）
5. 创建 service 文件定义 API 接口

### 场景 2：创建设置页面

**用户需求**："创建一个系统设置页面，包含多个配置项的表单"

**识别结果**：
- 页面类型：表单页面
- 功能需求：表单提交
- 推荐组件：BtcForm + btc-card

**生成步骤**：
1. 创建页面文件：`apps/{app-name}/src/pages/settings/index.vue`
2. 使用表单模板
3. 配置表单项（多个配置项）
4. 实现保存逻辑

### 场景 3：创建数据看板

**用户需求**："创建一个数据看板，展示各种统计图表"

**识别结果**：
- 页面类型：详情/展示页面
- 功能需求：只读展示
- 推荐组件：btc-card + 图表组件

**生成步骤**：
1. 创建页面文件：`apps/{app-name}/src/pages/dashboard/index.vue`
2. 使用卡片布局
3. 集成图表组件（如 ECharts）
4. 实现数据加载逻辑

## 参考资源

### 组件文档
- `apps/docs-app/packages/components/btc-crud.md` - CRUD 组件文档
- `apps/docs-app/packages/components/btc-form.md` - 表单组件文档
- `apps/docs-app/packages/components/btc-table.md` - 表格组件文档

### 现有页面示例
- `apps/main-app/src/pages/profile/index.vue` - 个人信息页面（表单 + 详情）
- 查看各应用的 `pages/` 目录下的页面实现

### 项目规范
- `docs/development/app-development.md` - 应用开发规范
- `apps/docs-app/components/layout/index.md` - 布局组件架构说明

### 常见错误预防
- **重要**：在创建页面时，务必参考 `common-mistakes-prevention` skill，避免常见错误：
  - 国际化配置应在 `config.ts` 中，而不是 JSON 文件
  - Label 没有 name 时使用 `_hideLabel: true`
  - 优先使用 `btc-*` 自定义组件，而不是 `el-*` 组件
  - 避免不必要的布局美化（背景色、标题、卡片等）
  - 统一使用 `10px` 作为 padding 标准

## 注意事项

1. **必须先查找参考**：在生成任何代码之前，必须先查找项目中相似功能的实现作为参考
2. **严格遵循参考**：参考实现的方式就是标准，不要创新或自由发挥
3. **统一布局**：所有页面都在 `AppLayout` 内部，页面组件不需要包含布局代码
4. **组件导入**：使用自动导入，无需手动 import（已配置 unplugin-vue-components）
5. **类型安全**：所有组件都有完整的 TypeScript 类型定义
6. **响应式设计**：使用 `span` 属性控制表单项宽度（12 列布局）
7. **错误处理**：所有 API 调用都要有错误处理
8. **加载状态**：使用 `v-loading` 或 `loading` prop 显示加载状态

## ⚠️ 禁止的行为

- ❌ **禁止在没有参考的情况下生成代码**：必须先找到参考实现
- ❌ **禁止自由发挥**：不要使用"通用"做法，必须参考现有实现
- ❌ **禁止创新**：不要尝试新的实现方式，除非现有方式确实无法满足需求
- ❌ **禁止猜测**：不确定时，先查找参考实现，不要猜测

## 使用流程

当用户要求创建新页面时，**必须严格按照以下流程执行，顺序不能颠倒：**

### 第一步：查找参考实现（最重要，必须执行）

**在生成任何代码之前，必须先查找参考实现：**

1. **搜索相似功能**
   ```bash
   # 使用 codebase_search 查找相似功能
   # 例如：创建用户管理 → 搜索 "用户管理"、"user"、"用户列表" 等
   ```

2. **查看参考文件**
   - 找到相似功能的页面实现文件
   - 找到相似功能的配置文件（config.ts）
   - 找到相似功能的组件使用示例

3. **记录参考信息**
   - 记录参考文件的路径
   - 记录关键实现方式
   - 记录配置方式

### 第二步：分析参考实现

1. **分析代码结构**
   - 目录组织方式
   - 文件命名规范
   - 代码组织方式

2. **分析配置方式**
   - 国际化配置（config.ts 结构）
   - 组件配置方式
   - 样式配置方式

3. **分析组件使用**
   - 使用了哪些组件（btc-* vs el-*）
   - 组件的使用方式
   - 组件的配置方式

### 第三步：分析用户需求

- 识别页面类型（CRUD/表单/详情/列表）
- 识别功能需求（增删改查/只读/筛选等）
- 识别数据来源（API 接口）

### 第四步：推荐组件

根据参考实现和页面类型，推荐合适的组件组合：
- 参考实现使用了哪些组件
- 根据页面类型推荐组件
- 确保与参考实现一致

### 第五步：生成代码模板

**严格按照参考实现生成代码：**
- 使用参考实现相同的代码结构
- 使用参考实现相同的组件和配置
- 遵循参考实现的命名和样式规范
- 不要创新或自由发挥

### 第六步：验证规范

- 对比参考实现，确保一致性
- 使用 `common-mistakes-prevention` skill 检查常见错误
- 确保符合项目规范和最佳实践

### ⚠️ 关键原则

1. **必须先查找参考**：没有找到参考实现前，不要生成代码
2. **严格遵循参考**：参考实现的方式就是标准，不要创新
3. **不要自由发挥**：即使有"更好的"方式，也要先遵循现有实现
4. **不确定时查找**：任何不确定的地方，先查找参考实现
