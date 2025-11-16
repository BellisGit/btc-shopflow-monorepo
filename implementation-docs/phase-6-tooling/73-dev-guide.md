# 41 - 开发规范文档

> **阶段**: Phase 6 | **时间**: 3小时 | **前置**: 40

## 🎯 任务目标

编写完整的开发规范文档，统一团队开发标准。

## 📋 执行步骤

### 1. 创建规范文档目录

```bash
mkdir -p docs/guidelines
```

### 2. 编写代码规范

**docs/guidelines/coding-standards.md**:
```markdown
# 代码规范

## 命名规范

### 文件命名
- 组件文件：PascalCase（如：UserList.vue）
- 工具文件：kebab-case（如：format-date.ts）
- 配置文件：kebab-case（如：vite.config.ts）

### 变量命名
- 常量：UPPER_SNAKE_CASE
- 变量/函数：camelCase
- 类/接口：PascalCase
- 组件：PascalCase，必须 'btc-' 前缀

## TypeScript 规范

### 类型定义
\`\`\`typescript
// ✅ 推荐
interface User {
  id: number;
  name: string;
}

// ❌ 不推荐
type User = {
  id: any;
  name: any;
};
\`\`\`

### 避免 any
\`\`\`typescript
// ✅ 使用具体类型
function getUser(): User {}

// ❌ 避免
function getUser(): any {}
\`\`\`

## Vue 规范

### 组件结构
\`\`\`vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 导入
// 类型定义
// 变量声明
// 方法定义
// 生命周期
</script>

<style scoped>
/* 样式 */
</style>
\`\`\`

### Props 定义
\`\`\`typescript
// ✅ 使用 TypeScript 类型
defineProps<{
  title: string;
  count?: number;
}>();

// ❌ 避免运行时声明
defineProps({
  title: String,
});
\`\`\`

## Git 提交规范

### Commit 格式
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Type 类型
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

### 示例
\`\`\`
feat(user): 添加用户列表导出功能

- 实现 Excel 导出
- 添加权限控制

Closes #123
\`\`\`

## CRUD 开发规范

### 配置文件结构
\`\`\`typescript
export default {
  service: service.xxx,
  table: { columns: [...] },
  search: { items: [...] },
  upsert: { items: [...] },
} as CrudConfig;
\`\`\`

### 字段命名
- 统一使用 camelCase
- 避免缩写，使用完整单词
- 布尔值以 is/has/can 开头
```

### 3. 编写分支管理规范

**docs/guidelines/branch-strategy.md**:
```markdown
# 分支管理规范

## 分支模型

\`\`\`
main (生产)
  ├── develop (开发)
  │   ├── feature/xxx (功能)
  │   ├── fix/xxx (修复)
  │   └── refactor/xxx (重构)
  └── hotfix/xxx (紧急修复)
\`\`\`

## 分支命名

- feature/模块-功能（如：feature/user-export）
- fix/问题描述（如：fix/login-error）
- hotfix/问题描述（如：hotfix/critical-bug）
- refactor/模块名（如：refactor/user-module）

## 工作流程

1. 从 develop 创建 feature 分支
2. 开发完成后提交 PR
3. Code Review 通过后合并
4. 定期从 develop 合并到 main

## 合并策略

- feature → develop: Squash and merge
- develop → main: Merge commit
- hotfix → main: Merge commit
```

### 4. 编写 PR 规范

**docs/guidelines/pull-request.md**:
```markdown
# Pull Request 规范

## PR 标题格式

\`[类型] 简短描述\`

示例：
- [Feature] 添加用户导出功能
- [Fix] 修复登录页面样式问题
- [Refactor] 重构 CRUD 系统

## PR 描述模板

\`\`\`markdown
### 变更内容
- 添加了什么功能
- 修复了什么问题

### 测试
- [ ] 本地测试通过
- [ ] 单元测试通过
- [ ] 代码审查通过

### 截图
（如有必要）

### 相关 Issue
Closes #123
\`\`\`

## Code Review 检查点

- [ ] 代码符合规范
- [ ] 没有明显 bug
- [ ] 测试覆盖充分
- [ ] 文档已更新
- [ ] 无性能问题
```

## ✅ 验收标准

### 检查：文档完整性

```bash
ls docs/guidelines/
# 预期文件:
- coding-standards.md
- branch-strategy.md
- pull-request.md
- crud-development.md
```

## 📝 检查清单

- [ ] 代码规范文档
- [ ] 分支管理规范
- [ ] PR 规范
- [ ] CRUD 开发规范
- [ ] 示例代码完整
- [ ] 文档易于理解

## 🔗 下一步

- [42 - 团队培训材料](./42-team-training.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

