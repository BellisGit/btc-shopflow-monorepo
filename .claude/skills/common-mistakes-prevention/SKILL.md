---
name: common-mistakes-prevention
description: 避免常见错误和遵循项目规范 - 记录项目中反复出现的错误和正确的解决方案
version: 1.0.0
---

# 常见错误预防指南

本技能记录项目中反复出现的常见错误及其正确的解决方案，帮助 AI 助手在编写代码时避免这些错误。

## 核心原则

1. **参考现有实现**：在编写新功能前，必须先查找项目中已有的类似功能作为参考
2. **遵循项目规范**：严格按照项目已有的规范和最佳实践，不要自由发挥
3. **避免重复错误**：识别并避免之前出现过的错误模式
4. **使用正确的方式**：优先使用项目推荐的方式，而不是通用方式

## ⚠️ 最重要的原则：参考现有实现

**在编写任何新功能之前，必须：**

1. **查找相似功能**：在项目中搜索已实现的类似功能
2. **参考代码结构**：查看现有代码的组织方式和实现模式
3. **遵循已有规范**：严格按照现有代码的规范，不要创新或自由发挥
4. **对比差异**：如果发现与现有实现不一致，优先采用现有实现的方式

### 查找参考的步骤

1. **搜索相似功能**
   ```bash
   # 在项目中搜索相似的关键词
   # 例如：如果要创建用户管理，搜索 "user"、"用户" 等
   ```

2. **查看现有实现**
   - 查看相似功能的页面实现
   - 查看相似功能的配置方式
   - 查看相似功能的组件使用方式

3. **参考代码模式**
   - 目录结构：参考现有功能的目录组织方式
   - 命名规范：参考现有功能的命名方式
   - 代码风格：参考现有功能的代码风格

4. **验证规范**
   - 国际化配置：查看现有功能如何配置国际化
   - 组件使用：查看现有功能使用哪些组件
   - 样式规范：查看现有功能的样式实现

---

## 错误 1：国际化配置位置错误

### ❌ 错误做法

直接在 JSON 文件中添加国际化配置：

```json
// ❌ 错误：直接在 zh-CN.json 中添加
{
  "menu.new_feature": "新功能"
}
```

### ✅ 正确做法

国际化配置应该在 `config.ts` 文件中，由模块级配置和应用级配置统一组装：

**模块级配置**（`src/modules/{module-name}/config.ts`）：
```typescript
export default {
  name: 'module-name',
  locale: {
    'zh-CN': {
      'menu.module_name.feature': '功能名称',
      'page.module_name.feature.title': '页面标题',
    },
    'en-US': {
      'menu.module_name.feature': 'Feature Name',
      'page.module_name.feature.title': 'Page Title',
    },
  },
  // ... 其他配置
};
```

**应用级配置**（`src/locales/config.ts`）：
```typescript
export default {
  'zh-CN': {
    'app.name': '应用名称',
    'common.button.submit': '提交',
  },
  'en-US': {
    'app.name': 'App Name',
    'common.button.submit': 'Submit',
  },
};
```

### 📝 说明

- 国际化配置通过 `import.meta.glob` 自动扫描 `config.ts` 文件
- 模块级配置优先级高于应用级配置
- 不要直接在 `zh-CN.json` 或 `en-US.json` 中添加配置

### 🔍 参考文件

- `apps/{app-name}/src/locales/config.ts` - 应用级配置示例
- `apps/{app-name}/src/modules/{module}/config.ts` - 模块级配置示例
- `apps/{app-name}/src/i18n/getters.ts` - 配置加载逻辑

---

## 错误 2：Label 没有 name 的情况处理

### ❌ 错误做法

为没有 name 的 label 添加 name 属性：

```typescript
// ❌ 错误：添加 name 属性
{
  prop: 'color',
  label: '', // 没有 label
  name: '颜色', // 错误：不应该添加 name
  component: { name: 'el-color-picker' }
}
```

### ✅ 正确做法

使用 `_hideLabel` 属性隐藏 label（适用于颜色选择器等特殊输入表单）：

```typescript
// ✅ 正确：使用 _hideLabel 隐藏 label
{
  prop: 'color',
  label: '颜色', // 可以保留 label（用于表单验证提示）
  _hideLabel: true, // 隐藏 label 显示
  component: { name: 'el-color-picker' }
}
```

或者直接设置空 label：

```typescript
// ✅ 也可以：直接设置空 label
{
  prop: 'color',
  label: '', // 空 label
  component: { name: 'el-color-picker' }
}
```

### 📝 说明

- `_hideLabel: true` 会隐藏 label 的显示，但保留 label 用于验证提示
- 适用于颜色选择器、文件上传等特殊输入组件
- 不要添加 `name` 属性来替代 label

### 🔍 参考文件

- `packages/shared-components/src/crud/upsert/index.vue` - `_hideLabel` 使用示例
- `packages/shared-components/src/components/form/btc-form/composables/useFormRenderer.ts` - label 隐藏逻辑

---

## 错误 3：组件选择错误

### ❌ 错误做法

默认使用 Element Plus 原生组件：

```vue
<!-- ❌ 错误：使用 el-button -->
<el-button type="primary">提交</el-button>
```

### ✅ 正确做法

优先使用项目自定义组件（`btc-*` 前缀）：

```vue
<!-- ✅ 正确：使用 btc-button -->
<btc-button type="primary">提交</btc-button>
```

### 📋 组件映射表

| Element Plus 组件 | BTC 自定义组件 | 说明 |
|------------------|---------------|------|
| `el-button` | `btc-button` | 按钮组件 |
| `el-card` | `btc-card` | 卡片组件 |
| `el-tag` | `btc-tag` | 标签组件（扩展了更多颜色） |
| `el-dialog` | `btc-dialog` | 对话框组件（增强功能） |
| `el-form` | `btc-form` | 表单组件 |
| `el-upload` | `btc-upload` | 上传组件 |
| `el-input` | `btc-input` | 输入框组件 |

### 📝 说明

- 项目自定义组件基于 Element Plus 封装，提供额外功能
- 自定义组件支持自动导入，无需手动 import
- 只有在自定义组件不满足需求时才使用 Element Plus 原生组件

### 🔍 参考文件

- `packages/shared-components/src/components/basic/` - 基础组件目录
- `packages/shared-components/component-analysis.md` - 组件分析文档

---

## 错误 4：不必要的布局美化

### ❌ 错误做法

自动添加不必要的布局、背景色、标题、卡片等：

```vue
<!-- ❌ 错误：添加不必要的布局 -->
<template>
  <div class="page" style="background: #f5f5f5; padding: 20px;">
    <el-card>
      <template #header>
        <h2>页面标题</h2>
      </template>
      <div style="padding: 16px;">
        <!-- 页面内容 -->
      </div>
    </el-card>
  </div>
</template>
```

### ✅ 正确做法

保持简洁，只包含必要的结构：

```vue
<!-- ✅ 正确：简洁的页面结构 -->
<template>
  <div class="page">
    <!-- 直接使用业务组件，不需要额外的卡片包装 -->
    <BtcCrud ref="crudRef" :service="service">
      <!-- CRUD 内容 -->
    </BtcCrud>
  </div>
</template>
```

### 📝 说明

- **不要添加**：背景色、标题、el-card 包装等美化元素
- **页面已经在 AppLayout 内部**：不需要额外的布局容器
- **保持简洁**：直接使用业务组件，让组件自己处理样式
- **测试功能时**：不需要美化，专注于功能实现

### 🎯 何时需要卡片

只有在以下情况才使用 `btc-card`：
- 需要明确的视觉分组
- 需要卡片标题和操作按钮
- 需要折叠功能

---

## 错误 5：Padding 间距不规范

### ❌ 错误做法

使用 16px 或其他非标准间距：

```vue
<!-- ❌ 错误：使用 16px -->
<style scoped>
.page {
  padding: 16px; /* 错误：应该使用 10px */
}
</style>
```

```typescript
// ❌ 错误：在组件配置中使用 16px
{
  padding: '16px'
}
```

### ✅ 正确做法

统一使用 10px 作为标准间距：

```vue
<!-- ✅ 正确：使用 10px -->
<style scoped>
.page {
  padding: 10px; /* 标准间距 */
}
</style>
```

```typescript
// ✅ 正确：使用 10px
{
  padding: '10px'
}
```

### 📝 说明

- **统一标准**：页面 padding 统一使用 `10px`
- **组件内部**：组件内部的 padding 也优先使用 `10px`
- **特殊情况**：只有在设计规范明确要求时才使用其他间距（如 12px、16px）

### 🔍 参考示例

查看项目中的标准实现：
- `packages/shared-components/src/components/form/btc-filter-form/index.vue` - 使用 `padding: 10px`
- `packages/shared-components/src/crud/context/index.vue` - 使用 `padding: '10px'`

---

## 参考查找清单（执行顺序）

在编写新代码之前，必须先完成以下查找：

### ✅ 第一步：查找参考实现（必须）

- [ ] 是否在项目中搜索了相似功能的实现？
- [ ] 是否找到了参考的页面实现文件？
- [ ] 是否找到了参考的配置文件（config.ts）？
- [ ] 是否查看了参考实现的代码结构？
- [ ] 是否记录了参考文件的路径？

### ✅ 第二步：分析参考实现（必须）

- [ ] 是否分析了参考实现的国际化配置方式？
- [ ] 是否分析了参考实现的组件使用方式？
- [ ] 是否分析了参考实现的样式规范？
- [ ] 是否分析了参考实现的代码结构？

### ✅ 第三步：遵循参考实现（必须）

- [ ] 是否严格按照参考实现的方式编写代码？
- [ ] 是否使用了参考实现相同的组件？
- [ ] 是否遵循了参考实现的配置方式？
- [ ] 是否避免了自由发挥和创新？

## 综合检查清单

在编写新代码时，请检查以下事项：

### ✅ 国际化配置
- [ ] 是否在 `config.ts` 中配置国际化（而不是 JSON 文件）
- [ ] 是否使用了正确的 key 格式（snake_case，2-5 层）
- [ ] 是否同时配置了 `zh-CN` 和 `en-US`

### ✅ 表单配置
- [ ] 对于特殊输入（颜色选择器等），是否使用 `_hideLabel: true` 而不是添加 `name`
- [ ] Label 配置是否正确

### ✅ 组件选择
- [ ] 是否优先使用 `btc-*` 自定义组件
- [ ] 是否只在必要时使用 Element Plus 原生组件

### ✅ 页面布局
- [ ] 是否避免了不必要的背景色、标题、卡片包装
- [ ] 页面结构是否简洁
- [ ] 是否在 AppLayout 内部（不需要额外布局）

### ✅ 样式规范
- [ ] Padding 是否使用 `10px`（而不是 16px）
- [ ] 间距是否统一

---

## 使用建议

### 在创建新功能时（重要流程）

**必须遵循以下流程，顺序不能颠倒：**

1. **第一步：查找参考实现**（最重要）
   - 在项目中搜索相似功能的实现
   - 查看现有功能的代码结构、配置方式、组件使用
   - 记录参考文件的路径和关键实现方式

2. **第二步：分析参考实现**
   - 分析参考功能如何配置国际化（config.ts 结构）
   - 分析参考功能使用哪些组件（btc-* vs el-*）
   - 分析参考功能的样式规范（padding、布局等）
   - 分析参考功能的目录结构

3. **第三步：遵循参考实现**
   - 严格按照参考实现的方式编写代码
   - 不要创新或自由发挥
   - 如果参考实现有多种方式，选择最常用的方式

4. **第四步：检查常见错误**
   - 使用本技能中的检查清单验证
   - 确保没有出现已知的常见错误

### ⚠️ 禁止的行为

- ❌ **禁止自由发挥**：不要使用"通用"做法，必须参考现有实现
- ❌ **禁止创新**：不要尝试新的实现方式，除非现有方式确实无法满足需求
- ❌ **禁止猜测**：不确定时，先查找参考实现，不要猜测

### 在代码审查时

1. **检查清单**：使用上面的检查清单逐项检查
2. **对比规范**：将代码与项目规范对比
3. **参考示例**：查看参考文件中的正确实现

---

## 参考资源

### 参考查找指南
- `reference-lookup-guide.md` - 详细的参考查找流程和技巧

### 国际化配置
- `docs/guides/i18n/best-practices.md` - 国际化最佳实践
- `docs/guides/i18n/naming-convention.md` - 命名规范
- `apps/{app-name}/src/locales/config.ts` - 应用级配置示例
- `apps/{app-name}/src/modules/{module}/config.ts` - 模块级配置示例

### 组件使用
- `packages/shared-components/README.md` - 组件库文档
- `apps/docs-app/packages/components/` - 组件使用文档

### 样式规范
- `packages/shared-components/src/styles/` - 样式文件
- 查看现有页面的样式实现

### 参考实现示例
- `apps/admin-app/src/modules/org/views/users/index.vue` - CRUD 页面参考
- `apps/admin-app/src/modules/org/config.ts` - 模块配置参考
- `apps/main-app/src/pages/profile/index.vue` - 表单页面参考

---

## 参考查找工具

### 使用 codebase_search 查找参考

```typescript
// 示例：查找用户管理相关实现
codebase_search("用户管理页面的实现，包括列表、表单、配置")
codebase_search("用户相关的国际化配置方式")
codebase_search("用户表单使用的组件和配置")
```

### 使用 grep 查找参考

```bash
# 查找相似功能的文件
grep -r "用户管理" apps/*/src
grep -r "user.*management" apps/*/src
```

### 查找范围

1. **页面实现**：`apps/*/src/pages/` 或 `apps/*/src/modules/*/views/`
2. **配置文件**：`apps/*/src/modules/*/config.ts`
3. **组件使用**：查看现有页面的组件使用方式
4. **样式实现**：查看现有页面的样式文件

## 更新日志

- v1.0.1 (2025-01-17): 强调"参考现有实现"原则，避免自由发挥
- v1.0.0 (2025-01-17): 初始版本，记录 5 个常见错误

---

## 注意事项

1. **持续更新**：当发现新的常见错误时，应及时更新本技能
2. **实际验证**：所有规范都应基于项目实际代码验证
3. **团队共识**：确保规范与团队共识一致
