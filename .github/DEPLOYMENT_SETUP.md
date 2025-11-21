# 🚀 GitHub Actions 部署设置指南

本文档说明如何配置GitHub Actions进行自动化K8s部署。

## 📋 前置条件

1. **Kubernetes集群**: 已部署并运行的K8s集群
2. **kubectl访问**: 能够通过kubectl访问集群
3. **GitHub仓库**: 具有Actions权限的GitHub仓库
4. **Container Registry**: GitHub Container Registry (GHCR) 访问权限

## 🔐 必需的GitHub Secrets

在GitHub仓库的 `Settings > Secrets and variables > Actions` 中添加以下secrets：

### 1. SERVER_HOST
服务器的IP地址或域名

例如: `192.168.1.100` 或 `your-server.com`

### 2. SERVER_USER
SSH登录用户名

例如: `root` 或 `ubuntu`

### 3. SERVER_PORT
SSH端口号

例如: `22` (默认) 或 `2222`

### 4. SERVER_KEY
SSH私钥内容

```bash
# 在你的本地机器上执行（如果还没有SSH密钥）
ssh-keygen -t rsa -b 4096 -C "github-actions@btc-shopflow"

# 复制私钥内容
cat ~/.ssh/id_rsa
```

将私钥内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）添加为 `SERVER_KEY` secret。

**注意**: 确保对应的公钥已添加到服务器的 `~/.ssh/authorized_keys` 文件中。

### 5. GITHUB_TOKEN (自动提供)
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

## 🖥️ 服务器准备

确保你的服务器已经准备好以下环境：

### 1. Docker环境
```bash
# 安装Docker
curl -fsSL https://get.docker.com | bash
systemctl start docker
systemctl enable docker
```

### 2. 项目目录
```bash
# 创建项目目录
mkdir -p /www/wwwroot
cd /www/wwwroot

# 克隆项目
git clone https://github.com/BellisGit/btc-shopflow-monorepo.git
cd btc-shopflow-monorepo
```

### 3. SSH密钥配置
```bash
# 将GitHub Actions的公钥添加到authorized_keys
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. 防火墙配置
```bash
# 开放应用端口
firewall-cmd --permanent --add-port=30080-30091/tcp
firewall-cmd --reload
```

## 🔄 统一工作流程说明

### 🚀 主工作流 (`main.yml`)
**触发条件:**
- 推送到 `master` 分支
- Pull Request到 `master` 分支
- 手动触发

**分步执行流程:**

#### 第一步：🔍 Quality Check & Test
- 代码检查 (Lint)
- 类型检查 (Type Check)
- 单元测试 (Unit Tests)
- 集成测试 (Integration Tests)
- 端到端测试 (E2E Tests)

#### 第二步：🏗️ Build Docker Images
- 并行构建所有应用的Docker镜像
- 推送镜像到GitHub Container Registry
- 运行镜像健康检查

#### 第三步：🚀 Deploy to Server
- SSH连接到服务器
- 拉取最新代码和Docker镜像
- 使用Docker Compose重启服务
- 运行健康检查

#### 第四步：🔄 Rollback (仅失败时)
- 自动检测部署失败
- 回滚到上一个版本
- 重启服务

#### 第五步：📢 Notify Status
- 发送部署成功/失败通知
- 生成详细的部署报告

### 🎯 手动部署选项 (`manual-deploy.yml`)
**用途**: 紧急情况下的手动部署备选方案
**功能**: 选择性部署特定应用

## 🛠️ 本地测试

在推送到GitHub之前，可以本地测试构建：

```bash
# 测试Docker构建
./scripts/build-all.sh

# 测试服务器部署
./scripts/deploy.sh
```

## 📊 监控部署状态

### GitHub Actions界面
1. 进入仓库的 `Actions` 标签
2. 查看工作流运行状态
3. 点击具体的运行查看详细日志

### 服务器命令
```bash
# SSH连接到服务器
ssh -p SERVER_PORT SERVER_USER@SERVER_HOST

# 查看Docker容器状态
docker ps

# 查看服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart
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
