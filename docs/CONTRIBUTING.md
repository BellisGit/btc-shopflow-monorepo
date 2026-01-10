# 贡献指南

## 目录

- [Git 提交规范](#git-提交规范)
- [Git 标签规范](#git-标签规范)
- [版本发布流程](#版本发布流程)

## Git 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来规范提交信息。

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（type）

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是bug修复）
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 作用域（scope）

可选，可以是模块名、功能名等，如：
- `i18n`: 国际化相关
- `menu`: 菜单相关
- `logistics`: 物流应用
- `admin-app`: 管理应用
- 等等

### 主题（subject）

- 简短描述，不超过50个字符
- 使用祈使句，首字母小写，结尾不加句号
- 例如：`Fix menu structure`、`Add JWT expiration check`

### 正文（body）

可选，详细描述改动内容：
- 可以多行，每行不超过72个字符
- 使用列表形式说明具体改动点（以 `-` 开头）

### 页脚（footer）

可选，用于：
- 关闭 issue：`Closes #123`
- 说明破坏性变更：`BREAKING CHANGE: xxx`

### 提交示例

#### 简单提交（只需第一行）

```bash
git commit -m "feat(i18n): Fix menu structure for logistics app"
```

#### 详细提交

```bash
git commit
# 在打开的编辑器中填写：
# feat(i18n): Fix menu structure for logistics app
#
# - Change procurement_module to procurement with _ key
# - Change warehouse_module to warehouse with _ key
# - Update all manifest and route configurations
# - Empty JSON locale files to use config.ts scanning approach
```

### 自动检查

项目配置了提交信息自动检查：

1. **提交模板**：使用 `git commit` 会自动打开 `.gitmessage` 模板
2. **格式验证**：提交时会自动运行 commitlint 检查格式
3. **友好提示**：如果格式不符合规范，会显示详细的错误提示和修复建议

### 快速开始

1. **首次使用**（如果还没有配置）：
   ```bash
   git config --local commit.template .gitmessage
   ```

2. **提交代码**：
   ```bash
   git add .
   git commit  # 会自动打开模板
   ```

3. **如果格式错误**：
   - 查看错误提示
   - 根据提示修改提交信息
   - 重新提交

### 常见问题

**Q: 提交时提示格式不符合规范？**

A: 检查提交信息是否符合 `<type>(<scope>): <subject>` 格式，确保：
- 类型是允许的类型之一
- 主题首字母小写
- 主题不超过50字符

**Q: 如何跳过检查？**

A: 不推荐跳过，但如果确实需要，可以使用：
```bash
git commit --no-verify -m "your message"
```

**Q: 模板没有自动打开？**

A: 运行以下命令配置模板：
```bash
git config --local commit.template .gitmessage
```

## Git 标签规范

本项目使用语义化版本规范（Semantic Versioning）来管理版本标签。

### 标签格式

```
v<major>.<minor>.<patch>
```

- **前缀**：必须使用 `v` 前缀（小写）
- **版本号**：遵循语义化版本规范

### 版本号规则

- **主版本号（major）**：不兼容的 API 修改
- **次版本号（minor）**：向下兼容的功能性新增
- **修订号（patch）**：向下兼容的问题修正

### 示例

```
v1.0.0    # 第一个正式版本
v1.0.1    # 修复 bug
v1.1.0    # 新增功能
v2.0.0    # 重大更新（可能不兼容）
```

### 标签在文档中的记录

标签信息可以记录在以下文档中：

1. **CHANGELOG.md**：详细变更日志（推荐）
2. **RELEASES.md**：发布记录
3. **README.md**：版本信息
4. **GitHub Releases**：在线发布说明

### 创建标签

使用自动化脚本（推荐）：
```bash
pnpm release 1.0.8
```

手动创建：
```bash
# 创建附注标签（推荐）
git tag -a v1.0.8 -m "版本 v1.0.8

主要更新:
- 功能 A
- 修复 B"
```

### 查看标签

```bash
# 列出所有标签（按版本排序）
git tag --sort=-version:refname

# 查看标签信息
git show v1.0.7
```

### 详细文档

查看 [Git 标签规范指南](./GIT_TAG_GUIDE.md) 了解完整的标签规范和使用方法。

## 版本发布流程

项目使用 Git Flow 工作流进行版本发布。

### 快速发布

```bash
# 使用自动化脚本
pnpm release 1.0.8
```

### 发布流程

1. 从 develop 创建 release 分支
2. 在 release 分支上进行发布准备
3. 合并到 main 分支并创建标签
4. 合并回 develop 分支
5. 推送所有更改

### 详细文档

查看 [版本发布指南](./VERSION_RELEASE_GUIDE.md) 了解完整的发布流程。
