# 07.5 - Turborepo 构建加速

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 07

## 🎯 任务目标

配置 Turborepo 实现 Monorepo 增量构建和缓存。

## 📋 执行步骤

### 1. 安装 Turborepo

```bash
pnpm add -Dw turbo
```

### 2. 创建配置文件

**turbo.json**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "outputs": [],
      "cache": true
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": true
    },
    "clean": {
      "cache": false
    }
  },
  "globalDependencies": [
    "tsconfig.json",
    ".eslintrc.js",
    ".prettierrc"
  ]
}
```

### 3. 更新 package.json

```json
{
  "scripts": {
    "build:all": "turbo run build",
    "dev:all": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean"
  }
}
```

### 4. 配置远程缓存（可选）

**创建 .turbo 目录**:
```bash
mkdir -p .turbo
echo ".turbo" >> .gitignore
```

**配置 Vercel Remote Cache（可选）**:
```bash
turbo login
turbo link
```

## ✅ 验收标准

### 检查 1: 构建加速

```bash
# 首次构建
time pnpm build:all
# 记录时间: __s

# 第二次构建（缓存）
time pnpm build:all
# 预期: 时间大幅减少（90%+）
```

### 检查 2: 增量构建

```bash
# 修改单个包
echo "// test" >> packages/shared-utils/src/index.ts

# 构建
pnpm build:all
# 预期: 只构建 shared-utils 和依赖它的包
```

## 📝 检查清单

- [ ] Turborepo 安装
- [ ] turbo.json 配置
- [ ] 脚本更新
- [ ] 缓存生效
- [ ] 构建加速明显
- [ ] 增量构建正确

## 🚨 常见问题

**Q: 缓存不生效？**  
A: 检查 turbo.json 中的 outputs 配置是否正确

**Q: Windows 下性能提升不明显？**  
A: 考虑使用 WSL2 或配置远程缓存

## 🔗 下一步

- [07.6 - Tailwind + UnoCSS](./07.6-tailwind-unocss.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

