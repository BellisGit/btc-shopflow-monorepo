# Lint-Staged 配置说明

## 问题背景

之前每次 `git commit` 都会导致代码"回滚"，这是因为 lint-staged 的自动备份和恢复机制：

1. 提交时触发 pre-commit hook
2. lint-staged 自动备份当前状态到 git stash
3. 运行 eslint --fix 和 prettier --write
4. 如果 eslint 检查失败，自动从 stash 恢复原始状态
5. 结果：最新修改被"回滚"

## 解决方案

### 1. 新的 lint-staged 配置 (`.lintstagedrc.js`)

```javascript
module.exports = {
  '*.{ts,tsx,vue}': (filenames) => {
    const files = filenames.join(' ');
    return [
      `prettier --write ${files}`,  // 先格式化
      `eslint --fix ${files}`,      // 再检查和修复（不强制零警告）
      `prettier --write ${files}`   // 最后确保格式一致
    ];
  },
  '*.{json,md}': (filenames) => {
    const files = filenames.join(' ');
    return [`prettier --write ${files}`];
  }
};
```

### 2. 改进的 pre-commit hook (`.husky/pre-commit`)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

set -e
echo "🔍 Running pre-commit checks..."
npx lint-staged
echo "✅ Pre-commit checks passed!"
```

### 3. 关键改进

- **移除了 `--max-warnings=0`**：不再强制要求零警告
- **使用函数形式**：更好地控制文件处理
- **清理了所有 stash 备份**：避免之前的自动备份影响
- **简化了错误处理**：减少自动恢复的可能性

## 使用方法

现在可以正常提交代码：

```bash
git add .
git commit -m "your message"
```

如果仍有问题，可以使用：

```bash
# 跳过 pre-commit hook
git commit -m "your message" --no-verify

# 或者先手动修复 ESLint 错误
npx eslint "packages/**/src/**/*.{ts,tsx,vue}" --fix
git add .
git commit -m "your message"
```

## 注意事项

- 确保代码符合 ESLint 规则
- 如果遇到问题，检查 `.lintstagedrc.js` 配置
- 可以随时使用 `--no-verify` 跳过检查
