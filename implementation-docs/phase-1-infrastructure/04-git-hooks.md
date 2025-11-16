# 04 - Git Hooks 配置

> **阶段**: Phase 1 | **时间**: 1小时 | **前置**: 03

## 🎯 任务目标

配置 Husky 和 lint-staged，实现代码提交前自动检查和格式化。

## 📋 执行步骤

### 1. 安装 Husky

```bash
pnpm add -Dw husky
pnpm exec husky install
```

### 2. 配置自动安装

```bash
# 在 package.json 中添加
npm pkg set scripts.prepare="husky install"
```

**package.json**:
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### 3. 安装 lint-staged

```bash
pnpm add -Dw lint-staged
```

### 4. 配置 lint-staged

**package.json** 添加:
```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 5. 添加 pre-commit hook

```bash
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"
```

### 6. 配置 commitlint（可选）

```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional
```

**commitlint.config.js**:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
  },
};
```

### 7. 添加 commit-msg hook

```bash
pnpm exec husky add .husky/commit-msg 'pnpm exec --no -- commitlint --edit ${1}'
```

## ✅ 验收标准

### 检查 1: Husky 安装

```bash
ls .husky
# 预期: 看到 pre-commit 和 commit-msg 文件
```

### 检查 2: pre-commit 生效

```bash
# 创建有问题的文件
echo "const test='test'" > test.ts

# 添加到暂存区
git add test.ts

# 提交（会触发 lint-staged）
git commit -m "test: add test"

# 预期: 代码自动格式化并提交
```

### 检查 3: commit-msg 生效

```bash
# 尝试不规范的提交信息
git commit -m "随便写的提交信息" --allow-empty

# 预期: commitlint 报错阻止提交
```

### 检查 4: 规范提交成功

```bash
git commit -m "feat: add new feature" --allow-empty
# 预期: 提交成功
```

## 📝 检查清单

- [ ] Husky 安装成功
- [ ] lint-staged 安装成功
- [ ] pre-commit hook 创建
- [ ] commit-msg hook 创建
- [ ] 代码自动格式化
- [ ] 提交信息校验生效
- [ ] 不规范提交被拒绝

## 🚨 常见问题

**Q: Husky 不生效？**  
A: 确保运行了 `pnpm exec husky install`，检查 .husky 目录是否存在

**Q: Windows 下 hooks 不执行？**  
A: 确保 Git Bash 可用，或在 .husky/pre-commit 中使用 `#!/usr/bin/env sh`

**Q: commitlint 太严格？**  
A: 可以在 commitlint.config.js 中自定义规则

## 📚 提交规范

```bash
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

## 🔗 下一步

- [05 - 共享工具库搭建](./05-shared-utils.md)

---

**状态**: ✅ 就绪 | **预计时间**: 1小时

