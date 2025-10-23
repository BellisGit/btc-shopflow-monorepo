# TypeScript 类型检查命令

## 简化命令

为了方便进行 TypeScript 类型检查，我们提供了以下简化的命令：

### 检查所有项目
```bash
pnpm -w tsc:all
```

### 检查特定应用
```bash
# 主应用
pnpm -w tsc:main

# 物流应用
pnpm -w tsc:logistics

# 工程应用
pnpm -w tsc:engineering

# 质量应用
pnpm -w tsc:quality

# 生产应用
pnpm -w tsc:production
```

## 注意事项

1. **使用 `-w` 参数**：由于这些命令定义在根目录的 package.json 中，需要使用 `-w` 参数来运行工作区根目录的脚本。

2. **子应用类型检查**：子应用使用 `--skipLibCheck` 选项来跳过库文件的类型检查，避免 Vue 文件类型问题。

3. **主应用类型检查**：主应用使用标准的 `tsc --noEmit` 进行完整的类型检查。

## 等效命令

这些简化命令等效于以下完整命令：

```bash
# 等效于 pnpm -w tsc:all
turbo run type-check

# 等效于 pnpm -w tsc:main
pnpm --filter main-app type-check

# 等效于 pnpm -w tsc:logistics
pnpm --filter logistics-app type-check

# 等效于 pnpm -w tsc:engineering
pnpm --filter engineering-app type-check

# 等效于 pnpm -w tsc:quality
pnpm --filter quality-app type-check

# 等效于 pnpm -w tsc:production
pnpm --filter production-app type-check
```

## 故障排除

如果遇到类型检查错误：

1. **Vue 文件类型错误**：已通过添加 `shims-vue.d.ts` 文件解决
   - 所有应用：类型检查正常
   - 解决方案：为每个子应用添加了 Vue 文件类型声明

2. **模块找不到错误**：检查 tsconfig.json 中的路径配置

3. **依赖类型错误**：确保所有依赖包都已正确安装

## 当前状态

- ✅ **主应用 (main-app)**：类型检查完全正常
- ✅ **子应用 (logistics, engineering, quality, production)**：类型检查完全正常
- ✅ **共享包 (shared-*)**: 类型检查完全正常

**所有项目的 TypeScript 类型检查都已通过！**
