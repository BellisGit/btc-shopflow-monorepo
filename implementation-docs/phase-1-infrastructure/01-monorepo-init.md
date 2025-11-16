# 01 - Monorepo 初始化

> **阶段**: Phase 1 | **时间**: 1小时 | **前置**: 无

## 🎯 任务目标

创建 Monorepo 项目根目录，配置 pnpm workspaces。

## 📋 执行步骤

### 1. 创建项目并初始化 Git

```bash
mkdir btc-shopflow-monorepo
cd btc-shopflow-monorepo
git init
```

### 2. 创建 pnpm workspace 配置

**创建 `pnpm-workspace.yaml`**:
```yaml
packages:
  - 'packages/*'
```

**创建 `.npmrc`**:
```ini
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
registry=https://registry.npmmirror.com
engine-strict=true
```

### 3. 初始化 package.json

```bash
pnpm init
```

**编辑 `package.json`**:
```json
{
  "name": "btc-shopflow-monorepo",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "dev:all": "pnpm -r --parallel dev",
    "build:all": "pnpm -r build",
    "clean": "pnpm -r run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "only-allow": "^1.2.1"
  }
}
```

### 4. 创建基础目录结构

```bash
mkdir -p packages
mkdir -p scripts
mkdir -p cdn
mkdir -p docs
```

### 5. 创建 .gitignore

```
node_modules/
dist/
.DS_Store
*.log
.env.local
```

### 6. 创建 README.md

```markdown
# BTC 微前端 Monorepo

基于 Qiankun + pnpm workspaces 的微前端架构。

## 快速开始

\`\`\`bash
pnpm install
pnpm dev:all
\`\`\`

## 项目结构

- packages/ - 所有应用和共享库
- scripts/ - 自动化脚本
- cdn/ - 静态资源
```

### 7. 安装依赖

```bash
pnpm install
```

## ✅ 验收标准

### 检查 1: 目录结构

```bash
tree -L 2
```

预期输出：
```
.
├── packages/
├── scripts/
├── cdn/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── .npmrc
├── .gitignore
└── README.md
```

### 检查 2: pnpm 配置

```bash
pnpm --version  # >= 8.0.0
cat pnpm-workspace.yaml  # 包含 packages/*
```

### 检查 3: 强制使用 pnpm

```bash
npm install  # 应该报错
pnpm install  # 成功
```

## 📝 检查清单

- [ ] Git 仓库初始化完成
- [ ] pnpm-workspace.yaml 创建
- [ ] .npmrc 配置正确
- [ ] package.json 配置完整
- [ ] 目录结构创建完成
- [ ] .gitignore 配置完整
- [ ] README.md 编写完成
- [ ] 强制 pnpm 生效

## 🚨 常见问题

**Q: pnpm install 失败？**  
A: 检查镜像源配置，确认 .npmrc 中 registry 可访问

**Q: preinstall 脚本不生效？**  
A: 确保 only-allow 安装成功，删除 node_modules 重新安装

## 🔗 下一步

- [02 - TypeScript 统一配置](./02-typescript-config.md)

---

**状态**: ✅ 就绪 | **预计时间**: 1小时

