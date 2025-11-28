# 🛠️ BTC ShopFlow 部署脚本

本目录包含了用于 BTC ShopFlow 项目部署和维护的脚本。

## 📋 脚本清单

### 🚀 主要部署脚本

#### `deploy-static.sh` - **静态文件部署脚本（推荐）**
**用途**: 将构建好的静态文件直接部署到宝塔面板，无需 Docker  
**技术**: rsync/scp + Nginx  
**特点**: 部署速度快，资源占用少，配置简单

**使用方法**:
```bash
# 部署单个应用
./scripts/deploy-static.sh --app admin-app

# 部署所有应用
./scripts/deploy-static.sh --all

# 使用 pnpm 命令
pnpm deploy:static:admin
pnpm deploy:static:all
```

**功能**:
- 自动验证构建产物
- 创建部署备份
- 增量同步文件（使用 rsync）
- 自动设置文件权限
- 支持单应用或批量部署
- 自动重载 Nginx

**环境变量**:
```bash
export SERVER_HOST="your-server-ip"
export SERVER_USER="root"
export SERVER_PORT="22"
export SSH_KEY="~/.ssh/id_rsa"
```

详细文档请参考: [静态部署指南](../docs/STATIC_DEPLOYMENT.md)

#### `deploy.sh` - **Docker 部署脚本**
**用途**: 一键部署所有BTC ShopFlow应用到生产环境  
**技术**: Docker + Docker Compose  
**特点**: 稳定可靠，环境一致

**使用方法**:
```bash
# 在Linux服务器上执行
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**功能**:
- 自动检查Docker环境
- 构建所有应用的Docker镜像
- 创建Docker Compose配置
- 启动所有服务（8个应用）
- 配置防火墙规则
- 执行健康检查
- 生成访问地址和管理命令

### 🔧 辅助脚本

#### `build-all.sh`
**用途**: 构建所有应用的Docker镜像  
**使用方法**:
```bash
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

#### `btc-backup.sh`
**用途**: 备份项目配置、代码和数据  
**使用方法**:
```bash
chmod +x scripts/btc-backup.sh
./scripts/btc-backup.sh
```

#### `btc-maintenance.sh`
**用途**: 日常系统维护和健康检查  
**使用方法**:
```bash
chmod +x scripts/btc-maintenance.sh
./scripts/btc-maintenance.sh
```

## 🚀 快速部署指南

### 方式一：静态文件部署（推荐，快速）

**前置条件**:
- 宝塔面板已安装
- Nginx 已配置
- SSH 密钥已配置

**部署步骤**:
```bash
# 1. 构建应用
pnpm --filter admin-app build

# 2. 配置环境变量
export SERVER_HOST="your-server-ip"
export SERVER_USER="root"

# 3. 部署
pnpm deploy:static:admin
```

### 方式二：Docker 部署

**前置条件**:
- Linux服务器（CentOS/Ubuntu）
- 已安装Docker
- 已克隆项目到 `/www/wwwroot/btc-shopflow-monorepo`

**部署步骤**:
```bash
# 1. 进入项目目录
cd /www/wwwroot/btc-shopflow-monorepo

# 2. 执行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 部署后访问
部署完成后，可通过以下地址访问各应用：

| 应用 | 端口 | 访问地址 |
|------|------|----------|
| 主应用 | 30080 | http://服务器IP:30080 |
| 管理后台 | 30081 | http://服务器IP:30081 |
| 物流系统 | 30082 | http://服务器IP:30082 |
| 质量系统 | 30083 | http://服务器IP:30083 |
| 生产系统 | 30084 | http://服务器IP:30084 |
| 工程系统 | 30085 | http://服务器IP:30085 |
| 财务系统 | 30086 | http://服务器IP:30086 |
| 移动端 | 30091 | http://服务器IP:30091 |

## 🔧 日常管理

### 服务管理命令
```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart system-app

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 更新并重启服务
git pull origin master
./scripts/build-all.sh
docker-compose -f docker-compose.prod.yml up -d
```

### 健康检查
```bash
# 执行系统维护
./scripts/btc-maintenance.sh

# 执行数据备份
./scripts/btc-backup.sh
```

## 🏢 宝塔面板集成

### 1. 计划任务配置

在宝塔面板 → 计划任务中添加以下任务：

**备份任务**:
- 任务类型: Shell脚本
- 任务名称: BTC ShopFlow 备份
- 执行周期: 每天 02:00
- 脚本内容: `/www/wwwroot/btc-shopflow-monorepo/scripts/btc-backup.sh`

**维护任务**:
- 任务类型: Shell脚本
- 任务名称: BTC ShopFlow 维护
- 执行周期: 每天 03:00
- 脚本内容: `/www/wwwroot/btc-shopflow-monorepo/scripts/btc-maintenance.sh`

### 2. 反向代理配置

在宝塔面板中为每个应用配置反向代理：

```nginx
# 主应用
location / {
    proxy_pass http://127.0.0.1:30080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 管理后台
location /admin {
    proxy_pass http://127.0.0.1:30081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# 财务系统
location /finance {
    proxy_pass http://127.0.0.1:30086;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. SSL证书配置
- 在宝塔面板中申请Let's Encrypt证书
- 开启强制HTTPS访问

## 🚨 故障排除

### 常见问题

1. **Docker服务未启动**
```bash
systemctl start docker
systemctl enable docker
```

2. **端口被占用**
```bash
# 查看端口占用
netstat -tlnp | grep 30080
# 停止占用进程
kill -9 <PID>
```

3. **镜像构建失败**
```bash
# 清理Docker缓存
docker system prune -f
# 重新构建
./scripts/build-all.sh
```

4. **服务启动失败**
```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs <service-name>
```

### 日志查看

```bash
# 查看部署日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs system-app

# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 📞 技术支持

如果遇到问题，请检查：
1. Docker服务是否正常运行
2. 项目代码是否最新
3. 网络连接是否正常
4. 磁盘空间是否充足

**联系方式**:
- 邮箱: mlu@bellis-technology.cn
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

## 📝 更新日志

- **v2.0.0** (2024-11-21): 简化为单一部署脚本，使用Docker Compose，提高稳定性
- **v1.0.0** (2024-11-21): 初始版本，包含多种部署方案

---

🎉 **现在只需要一个命令就能完成整个项目的部署！**

这个简化的部署方案避免了Kubernetes的复杂性和网络问题，使用成熟稳定的Docker Compose技术，确保部署过程简单可靠。
