# 参考查找指南

在编写新功能之前，必须先查找项目中已有的类似功能作为参考，避免自由发挥。

## 核心原则

**在生成任何代码之前，必须先找到参考实现。**

## 查找流程

### 1. 识别功能关键词

根据用户需求，提取关键词：
- 功能名称（如：用户管理、订单列表）
- 功能类型（如：CRUD、表单、详情页）
- 相关模块（如：用户、订单、库存）

### 2. 搜索参考实现

使用以下工具搜索：

#### codebase_search（推荐）

```typescript
// 搜索相似功能的页面实现
codebase_search("用户管理页面的实现，包括列表、表单、配置")

// 搜索相似功能的配置方式
codebase_search("用户相关的国际化配置，config.ts 中的 locale 配置")

// 搜索相似功能的组件使用
codebase_search("用户表单使用的组件，包括 btc-* 组件和 el-* 组件")
```

#### grep 搜索

```bash
# 搜索文件中的关键词
grep -r "用户管理" apps/*/src
grep -r "user.*management" apps/*/src
```

#### glob_file_search

```bash
# 查找相似功能的文件
glob_file_search("**/user*/index.vue")
glob_file_search("**/user*/config.ts")
```

### 3. 查找范围

#### 页面实现
- `apps/*/src/pages/*/index.vue`
- `apps/*/src/modules/*/views/*/index.vue`

#### 配置文件
- `apps/*/src/modules/*/config.ts` - 模块级配置（包含国际化）
- `apps/*/src/locales/config.ts` - 应用级配置

#### 组件使用
- 查看现有页面的组件导入和使用方式
- 查看现有页面的样式实现

### 4. 分析参考实现

找到参考实现后，分析以下关键点：

#### 国际化配置
- 在哪个文件中配置（config.ts vs JSON）
- 配置的结构和格式
- key 的命名规范

#### 组件使用
- 使用了哪些组件（btc-* vs el-*）
- 组件的配置方式
- 组件的使用模式

#### 代码结构
- 目录组织方式
- 文件命名规范
- 代码组织方式

#### 样式规范
- padding 使用（10px vs 16px）
- 布局方式
- 样式组织

### 5. 记录参考信息

在生成代码前，记录：
- 参考文件的路径
- 关键实现方式
- 配置方式
- 组件使用方式

## 示例

### 场景：创建"产品管理"页面

#### 第一步：搜索参考

```typescript
// 1. 搜索相似的管理页面
codebase_search("管理页面实现，包含列表、新增、编辑、删除功能")

// 2. 搜索产品相关的实现（如果有）
codebase_search("产品相关的页面实现或配置")

// 3. 搜索 CRUD 页面的实现模式
codebase_search("使用 BtcCrud BtcTable BtcUpsert 的 CRUD 页面实现")
```

#### 第二步：分析参考

假设找到了 `apps/admin-app/src/modules/org/views/users/index.vue` 作为参考：

1. **查看页面结构**
   - 使用了 `BtcCrud` + `BtcTable` + `BtcUpsert`
   - 目录结构：`modules/org/views/users/`

2. **查看配置方式**
   - 国际化在 `modules/org/config.ts` 中配置
   - 配置格式：`locale: { 'zh-CN': {...}, 'en-US': {...} }`

3. **查看组件使用**
   - 使用 `btc-*` 组件，不是 `el-*`
   - 表格列配置方式
   - 表单项配置方式

4. **查看样式**
   - padding 使用 10px
   - 没有额外的背景色、卡片包装

#### 第三步：遵循参考

严格按照参考实现的方式创建新页面：
- 使用相同的代码结构
- 使用相同的组件和配置方式
- 遵循相同的命名和样式规范

## 查找技巧

### 1. 使用多个关键词搜索

不要只用一个关键词，尝试多个：
- 功能名称
- 功能类型（CRUD、表单等）
- 相关模块名称

### 2. 查看多个参考

如果找到多个相似功能，都查看：
- 选择最相似的作为主要参考
- 其他作为补充参考
- 如果实现方式不一致，选择最常用的方式

### 3. 查看配置文件

不仅要看页面实现，还要看配置：
- `config.ts` 中的国际化配置
- 路由配置
- 组件配置

### 4. 查看样式文件

查看样式实现：
- padding 使用
- 布局方式
- 样式组织

## 常见查找场景

### 场景 1：创建 CRUD 页面

**查找内容：**
- CRUD 页面的实现
- 表格列配置方式
- 表单项配置方式
- 国际化配置方式

**参考文件：**
- `apps/admin-app/src/modules/org/views/users/index.vue`
- `apps/admin-app/src/modules/org/config.ts`

### 场景 2：创建表单页面

**查找内容：**
- 表单页面的实现
- BtcForm 的使用方式
- 表单项配置方式

**参考文件：**
- `apps/main-app/src/pages/profile/index.vue`

### 场景 3：添加国际化配置

**查找内容：**
- 模块级 config.ts 的国际化配置
- 应用级 config.ts 的国际化配置
- key 的命名规范

**参考文件：**
- `apps/admin-app/src/modules/org/config.ts`
- `apps/admin-app/src/locales/config.ts`

## 注意事项

1. **必须先查找**：没有找到参考前，不要生成代码
2. **严格遵循**：参考实现的方式就是标准
3. **不要创新**：即使有"更好的"方式，也要先遵循现有实现
4. **不确定时查找**：任何不确定的地方，先查找参考实现
