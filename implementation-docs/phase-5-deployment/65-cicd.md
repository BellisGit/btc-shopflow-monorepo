# 37 - GitHub Actions CI/CD

> **阶段**: Phase 5 | **时间**: 4小时 | **前置**: 36

## 🎯 任务目标

配置 GitHub Actions 实现自动化构建和部署。

## 📋 执行步骤

### 1. 创建工作流配置

**.github/workflows/deploy.yml**:
```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Build all apps
        run: pnpm build:all

      - name: Deploy to server
        if: github.ref == 'refs/heads/main'
        uses: easingthemes/ssh-deploy@v2
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: "packages/*/dist/"
          TARGET: "/var/www/"
```

### 2. 配置 Secrets

在 GitHub 仓库设置中添加：
- `SSH_PRIVATE_KEY`: SSH 私钥
- `REMOTE_HOST`: 服务器地址
- `REMOTE_USER`: 服务器用户

### 3. 创建部署脚本

**scripts/deploy.sh**:
```bash
#!/bin/bash

echo "开始部署..."

# 构建所有应用
pnpm build:all

# 上传到服务器
rsync -avz packages/main-app/dist/ user@server:/var/www/base/
rsync -avz packages/logistics-app/dist/ user@server:/var/www/logistics/
rsync -avz packages/production-app/dist/ user@server:/var/www/production/

# 重启 Nginx
ssh user@server 'nginx -s reload'

echo "部署完成！"
```

## ✅ 验收标准

### 检查：CI/CD 流程

```bash
# 提交代码
git add .
git commit -m "feat: add new feature"
git push origin main

# 在 GitHub Actions 中查看
# 预期:
- ✓ Checkout
- ✓ Setup pnpm
- ✓ Install dependencies
- ✓ Lint
- ✓ Type check
- ✓ Build
- ✓ Deploy

# 访问生产环境
# 预期: 更新已生效
```

## 📝 检查清单

- [ ] workflow 配置创建
- [ ] Secrets 配置
- [ ] 部署脚本创建
- [ ] 流水线运行成功
- [ ] 自动部署生效

## 🔗 下一步

- [38 - 性能检测和优化](./38-performance-check.md)

