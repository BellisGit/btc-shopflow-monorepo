# OpenSkills 集成方案

## 概述

OpenSkills 是一个为 AI 编码代理提供通用技能加载系统的工具，可以让 Cursor 等 AI 工具更智能地理解和操作项目。

## 为什么引入 OpenSkills

### 当前痛点
1. AI 代理需要重复理解项目结构和操作流程
2. 复杂的操作（如发布流程）需要多次交互
3. 项目特定的知识散落在文档中，AI 难以快速定位
4. Monorepo 操作复杂，需要了解多个脚本和命令

### OpenSkills 的优势
1. **渐进式加载**：按需加载技能详情，不污染初始 prompt
2. **可复用**：技能可以在团队间共享和版本控制
3. **标准化**：使用 Anthropic 的 SKILL.md 标准格式
4. **多代理支持**：支持 Cursor, Claude Code, Windsurf, Aider 等

## 安装步骤

### 1. 全局安装 OpenSkills

```bash
npm i -g openskills
```

### 2. 选择安装位置

#### 方案 A：仅用于 Cursor（推荐）
```bash
# 安装到项目的 .claude/skills/
cd btc-shopflow-monorepo
openskills install <source>
```

#### 方案 B：多 AI 代理共用
```bash
# 安装到项目的 .agent/skills/（通用位置）
cd btc-shopflow-monorepo
openskills install <source> --universal
```

### 3. 更新 .gitignore

```bash
# 在项目根目录的 .gitignore 中添加
.claude/skills/
.agent/skills/
```

## 建议的项目技能

### 1. monorepo-ops（Monorepo 操作）

**功能**：
- 列出所有应用和包
- 在特定应用中运行命令
- 理解 monorepo 结构
- 应用间依赖关系

**使用场景**：
- "在 admin-app 中添加新模块"
- "更新所有应用的依赖"
- "查看 system-app 的依赖包"

### 2. scripts-ops（Scripts 操作）

**功能**：
- 了解 scripts 目录结构
- 运行构建、开发、测试脚本
- 理解脚本间的依赖关系
- 调试脚本问题

**使用场景**：
- "运行预览构建"
- "清理所有缓存"
- "检查 TypeScript 错误"

### 3. release-flow（发布流程）

**功能**：
- 全自动发布新版本
- 更新 CHANGELOG
- 创建 Git 标签
- 推送到远程仓库

**使用场景**：
- "发布 1.0.11 版本"
- "创建 hotfix 版本"
- "回滚到上一个版本"

### 4. i18n-ops（国际化操作）

**功能**：
- 添加新的翻译 key
- 检查缺失的翻译
- 合并翻译文件
- 验证翻译格式

**使用场景**：
- "添加新的菜单项翻译"
- "检查所有缺失的英文翻译"
- "合并所有应用的 i18n 文件"

### 5. build-deploy（构建部署）

**功能**：
- 了解构建流程
- 理解部署配置
- 触发 CI/CD
- 检查部署状态

**使用场景**：
- "构建 system-app 到 CDN"
- "部署 admin-app 到测试环境"
- "检查 Jenkins 构建状态"

## 技能结构示例

### 基本技能结构

```
.claude/skills/
└── monorepo-ops/
    ├── SKILL.md              # 技能定义和指令
    ├── references/
    │   ├── apps-config.md    # 应用配置说明
    │   └── structure.md      # 目录结构说明
    ├── scripts/
    │   └── list-apps.mjs     # 辅助脚本
    └── assets/
        └── templates/         # 模板文件
```

### SKILL.md 格式

```markdown
---
name: monorepo-ops
description: Monorepo 操作技能，帮助理解和操作 BTC ShopFlow 的 monorepo 结构
---

# Monorepo 操作指南

## 项目结构

BTC ShopFlow 是一个 pnpm monorepo，包含：

- **apps/**：15 个微前端应用
- **packages/**：共享包（components, core, utils 等）
- **scripts/**：构建和部署脚本

## 常用操作

### 列出所有应用

使用 turbo.js 工具：
\`\`\`bash
node scripts/commands/tools/turbo.js ls
\`\`\`

### 在特定应用中运行命令

\`\`\`bash
pnpm --filter=@btc/admin-app <command>
\`\`\`

### 构建所有应用

\`\`\`bash
pnpm build:all
\`\`\`

## 应用列表

查看 apps.config.json 获取完整的应用配置。

主要应用包括：
- admin-app：管理后台
- system-app：系统配置
- logistics-app：物流管理
- ... （其他应用）

## 依赖关系

所有应用都依赖以下共享包：
- @btc/shared-core
- @btc/shared-components
- @btc/shared-router
- @btc/build-utils
```

## 使用方式

### 1. 在 .cursorrules 中配置

在项目根目录的 `.cursorrules` 文件末尾添加：

```markdown
## 项目技能系统

本项目使用 OpenSkills 管理项目特定的操作技能。

### 可用技能

使用以下命令查看所有可用技能：
\`\`\`bash
openskills list
\`\`\`

### 加载技能

当需要执行特定操作时，使用以下命令加载相关技能：
\`\`\`bash
openskills read <skill-name>
\`\`\`

示例：
- `openskills read monorepo-ops` - 加载 Monorepo 操作技能
- `openskills read release-flow` - 加载发布流程技能
- `openskills read i18n-ops` - 加载国际化操作技能

### 技能开发

新技能存储在 `.claude/skills/` 目录下，使用 SKILL.md 格式。
```

### 2. 或者使用 AGENTS.md（可选）

如果项目使用 AGENTS.md，可以通过 `openskills sync` 自动同步：

```bash
openskills sync
```

这会自动更新 AGENTS.md 文件，添加 `<available_skills>` 部分。

## 安装现有技能（可选）

可以从 Anthropic 的技能市场安装一些通用技能：

```bash
# 交互式选择安装
openskills install anthropics/skills

# 推荐安装的技能
# - xlsx: Excel 文件处理
# - docx: Word 文档处理
# - skill-creator: 技能创建指南
```

## 创建自定义技能

### 1. 创建技能目录

```bash
mkdir -p .claude/skills/monorepo-ops
```

### 2. 创建 SKILL.md

参考上面的格式创建技能定义文件。

### 3. 添加辅助资源（可选）

- `references/`：参考文档
- `scripts/`：辅助脚本
- `assets/`：模板、配置等

### 4. 测试技能

```bash
# 列出技能
openskills list

# 加载技能
openskills read monorepo-ops

# 更新 .cursorrules 或 AGENTS.md
openskills sync
```

## 技能开发最佳实践

### 1. 使用清晰的指令

- 使用祈使句（"执行 X"，"检查 Y"）
- 提供具体的命令和示例
- 包含错误处理指南

### 2. 结构化内容

- 使用标题组织内容
- 使用列表和代码块
- 包含"何时使用"部分

### 3. 引用项目文件

```markdown
## 配置文件位置

- 应用配置：`apps.config.json`
- 构建配置：`scripts/config/build.config.js`
- 部署配置：`scripts/config/deploy.config.js`
```

### 4. 提供上下文

```markdown
## 背景

本项目使用 Turbo 进行 monorepo 管理，所有脚本统一存放在 `scripts/` 目录下。

最近完成了 scripts 架构重构（v1.0.10），新结构为：
- `bin/`：统一命令入口
- `commands/`：具体命令实现
- `utils/`：公共工具函数
- `config/`：配置文件
```

## 维护和更新

### 更新技能

1. 编辑 `.claude/skills/<skill-name>/SKILL.md`
2. 重新加载：`openskills read <skill-name>`
3. 更新配置：`openskills sync`

### 版本控制

建议将自定义技能纳入版本控制：

```bash
# 在 .gitignore 中移除（如果要版本控制）
# .claude/skills/

# 或者只版本控制自定义技能
.gitignore:
.claude/skills/*
!.claude/skills/monorepo-ops/
!.claude/skills/scripts-ops/
!.claude/skills/release-flow/
!.claude/skills/i18n-ops/
!.claude/skills/build-deploy/
```

## 预期效果

引入 OpenSkills 后，AI 代理可以：

1. **快速理解项目**：加载 monorepo-ops 技能即可了解整个项目结构
2. **执行复杂操作**：如发布新版本只需一个指令
3. **减少重复询问**：项目特定的知识已编码在技能中
4. **提高准确性**：标准化的操作流程减少错误

## 下一步行动

### 立即开始

1. 安装 OpenSkills：`npm i -g openskills`
2. 创建第一个技能：`monorepo-ops`
3. 更新 `.cursorrules` 配置
4. 测试使用

### 逐步扩展

1. 根据实际使用情况添加更多技能
2. 优化现有技能的指令
3. 在团队中推广使用
4. 收集反馈并持续改进

## 参考资源

- [OpenSkills GitHub](https://github.com/numman-ali/openskills)
- [Anthropic Skills 市场](https://github.com/anthropics/skills)
- [技能创建指南]（安装后可用）：`openskills read skill-creator`
