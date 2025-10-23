# Pre-commit 钩子已禁用

## 当前状态
- ✅ Husky 已禁用（package.json 中的 prepare 脚本已修改）
- ✅ lint-staged 配置已禁用（.lintstagedrc.js 已重命名为 .lintstagedrc.js.disabled）

## 如何重新启用

### 1. 重新启用 Husky
在 `package.json` 中修改：
```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### 2. 重新启用 lint-staged
将 `.lintstagedrc.js.disabled` 重命名为 `.lintstagedrc.js`：
```bash
mv .lintstagedrc.js.disabled .lintstagedrc.js
```

### 3. 重新安装 Husky
```bash
pnpm run prepare
```

## 手动检查命令

在禁用 pre-commit 钩子期间，您可以手动运行以下命令进行检查：

### ESLint 检查
```bash
# 检查所有文件
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### Prettier 格式化
```bash
# 格式化所有文件
pnpm run format
```

### TypeScript 类型检查
```bash
# 检查所有项目
pnpm -w tsc:all

# 检查特定应用
pnpm -w tsc:main
pnpm -w tsc:logistics
pnpm -w tsc:engineering
pnpm -w tsc:quality
pnpm -w tsc:production
```

## 注意事项
- 禁用 pre-commit 钩子后，提交时不会自动运行代码检查和格式化
- 请确保在提交前手动运行相关检查命令
- 建议在开发完成后重新启用 pre-commit 钩子以保持代码质量
