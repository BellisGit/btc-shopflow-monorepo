# 🚀 GitHub Actions 部署设置指南

本文档说明如何配置GitHub Actions进行自动化K8s部署。

## 📋 前置条件

1. **Kubernetes集群**: 已部署并运行的K8s集群
2. **kubectl访问**: 能够通过kubectl访问集群
3. **GitHub仓库**: 具有Actions权限的GitHub仓库
4. **Container Registry**: GitHub Container Registry (GHCR) 访问权限

## 🔐 必需的GitHub Secrets

在GitHub仓库的 `Settings > Secrets and variables > Actions` 中添加以下secrets：

### 1. KUBE_CONFIG
Kubernetes集群的配置文件（base64编码）

```bash
# 在你的本地机器或服务器上执行
cat ~/.kube/config | base64 -w 0
```

将输出的base64字符串添加为 `KUBE_CONFIG` secret。

### 2. GITHUB_TOKEN (自动提供)
GitHub自动提供此token，用于访问Container Registry。

## 🌐 环境变量配置

在GitHub仓库的 `Settings > Secrets and variables > Actions > Variables` 中添加：

### Repository Variables
- `APP_URL`: 应用的访问URL (例如: `https://btc-shopflow.com`)

### Environment Variables (可选)
为不同环境创建不同的变量：

**Production Environment:**
- `APP_URL`: `https://btc-shopflow.com`
- `NAMESPACE`: `btc-shopflow`

**Staging Environment:**
- `APP_URL`: `https://staging.btc-shopflow.com`
- `NAMESPACE`: `btc-shopflow-staging`

## 🏗️ Kubernetes集群准备

确保你的K8s集群已经准备好以下资源：

### 1. 命名空间
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. ConfigMap
```bash
kubectl apply -f k8s/configmap.yaml -n btc-shopflow
```

### 3. 基础部署文件
确保 `k8s/deployments/` 目录包含所有应用的部署文件。

## 🔄 工作流程说明

### 1. 🐳 Build Docker Images (`build-docker.yml`)
**触发条件:**
- 推送到 `master` 或 `develop` 分支
- 修改了 `apps/`, `packages/`, `auth/` 目录
- 手动触发

**功能:**
- 检测代码变更
- 并行构建所有应用的Docker镜像
- 推送镜像到GitHub Container Registry
- 运行镜像健康检查

### 2. ☸️ Kubernetes Deployment (`k8s-deploy.yml`)
**触发条件:**
- Docker构建工作流成功完成
- 手动触发

**功能:**
- 验证集群连接
- 更新K8s部署的镜像
- 等待部署完成
- 运行健康检查
- 失败时自动回滚

### 3. 🚀 Complete Deployment (`deploy.yml`)
**触发条件:**
- 推送到 `master` 分支
- 手动触发

**功能:**
- 构建所有Docker镜像
- 部署到Kubernetes
- 运行完整的健康检查
- 发送部署状态通知

## 🛠️ 本地测试

在推送到GitHub之前，可以本地测试构建：

```bash
# 测试Docker构建
./scripts/build-all.sh

# 测试K8s部署
kubectl apply -f k8s/deployments/complete-apps.yaml -n btc-shopflow
```

## 📊 监控部署状态

### GitHub Actions界面
1. 进入仓库的 `Actions` 标签
2. 查看工作流运行状态
3. 点击具体的运行查看详细日志

### Kubernetes命令
```bash
# 查看部署状态
kubectl get deployments -n btc-shopflow

# 查看Pod状态
kubectl get pods -n btc-shopflow

# 查看服务状态
kubectl get services -n btc-shopflow

# 查看部署历史
kubectl rollout history deployment/btc-system-app -n btc-shopflow
```

## 🔧 故障排除

### 1. 构建失败
- 检查 `build-docker.yml` 工作流日志
- 验证 `package.json` 和依赖是否正确
- 确保所有应用目录存在且包含有效的构建脚本

### 2. 部署失败
- 检查 `KUBE_CONFIG` secret是否正确
- 验证K8s集群连接
- 检查命名空间和资源是否存在

### 3. 镜像拉取失败
- 确保GitHub Container Registry权限正确
- 检查镜像标签是否正确
- 验证 `GITHUB_TOKEN` 权限

### 4. 健康检查失败
- 检查应用是否正确启动
- 验证服务端口配置
- 查看Pod日志: `kubectl logs <pod-name> -n btc-shopflow`

## 🔄 手动部署

如果需要手动触发部署：

1. 进入GitHub仓库的 `Actions` 标签
2. 选择相应的工作流
3. 点击 `Run workflow`
4. 选择分支和环境
5. 点击 `Run workflow` 确认

## 📈 优化建议

### 1. 缓存优化
- 工作流已配置Node.js和pnpm缓存
- Docker构建使用多阶段构建优化

### 2. 并行构建
- 使用matrix策略并行构建多个应用
- 减少总体构建时间

### 3. 智能部署
- 只在相关代码变更时触发构建
- 支持强制部署选项

### 4. 自动回滚
- 部署失败时自动回滚到上一个版本
- 保证服务可用性

## 📞 支持

如果遇到问题：

1. 检查GitHub Actions日志
2. 验证K8s集群状态
3. 查看本文档的故障排除部分
4. 联系技术支持

---

🎉 **配置完成后，每次推送代码到master分支都会自动触发构建和部署！**
