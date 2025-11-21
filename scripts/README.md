# 🛠️ BTC ShopFlow 部署和维护脚本

本目录包含了用于 BTC ShopFlow 项目部署、维护和备份的所有脚本。

## 📋 脚本清单

### 🚀 部署脚本

#### `build-all.sh`
**用途**: 构建所有应用的 Docker 镜像  
**使用方法**:
```bash
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

**功能**:
- 自动检测项目中的所有应用
- 为每个应用创建 Dockerfile（如果不存在）
- 构建 Docker 镜像并打标签
- 显示构建结果和镜像列表

### 🔧 维护脚本

#### `btc-maintenance.sh`
**用途**: 日常系统维护和健康检查  
**使用方法**:
```bash
chmod +x scripts/btc-maintenance.sh
./scripts/btc-maintenance.sh
```

**功能**:
- 检查系统资源使用情况
- 监控 Docker 和 Kubernetes 状态
- 检查应用健康状态
- 自动重启异常应用
- 清理系统垃圾文件
- 生成维护报告

**建议**: 在宝塔面板计划任务中设置每日执行
```bash
# 每日凌晨 3 点执行维护
0 3 * * * /www/wwwroot/btc-shopflow-monorepo/scripts/btc-maintenance.sh
```

### 💾 备份脚本

#### `btc-backup.sh`
**用途**: 备份项目配置、代码和数据  
**使用方法**:
```bash
chmod +x scripts/btc-backup.sh
./scripts/btc-backup.sh
```

**功能**:
- 备份 Kubernetes 配置文件
- 备份项目源代码
- 导出 Docker 镜像
- 备份数据库（需要配置）
- 清理旧备份文件（保留7天）
- 生成备份报告

**建议**: 在宝塔面板计划任务中设置每日备份
```bash
# 每日凌晨 2 点备份
0 2 * * * /www/wwwroot/btc-shopflow-monorepo/scripts/btc-backup.sh
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

### 2. 监控配置

在宝塔面板 → 监控中配置：
- CPU 使用率告警: > 80%
- 内存使用率告警: > 80%
- 磁盘使用率告警: > 80%

### 3. 日志管理

日志文件位置：
- 维护日志: `/www/logs/btc-maintenance.log`
- 备份报告: `/www/backup/btc-shopflow/backup-report-*.txt`
- 维护报告: `/www/logs/maintenance-report-*.txt`

## 🚨 故障排除

### 常见问题

1. **脚本权限问题**
```bash
chmod +x scripts/*.sh
```

2. **Docker 未安装**
```bash
curl -fsSL https://get.docker.com | bash -s docker
systemctl start docker
systemctl enable docker
```

3. **Kubernetes 未安装**
```bash
curl -sfL https://get.k3s.io | sh -
```

4. **kubectl 配置问题**
```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### 日志查看

```bash
# 查看维护日志
tail -f /www/logs/btc-maintenance.log

# 查看最新备份报告
ls -la /www/backup/btc-shopflow/backup-report-*.txt | tail -1

# 查看 Kubernetes Pod 日志
kubectl logs -f deployment/btc-system-app -n btc-shopflow
```

## 📞 技术支持

如果遇到问题，请检查：
1. 脚本执行权限
2. 系统依赖是否安装完整
3. 网络连接是否正常
4. 磁盘空间是否充足

**联系方式**:
- 邮箱: mlu@bellis-technology.cn
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

## 📝 更新日志

- **v1.0.0** (2024-11-21): 初始版本，包含基础的构建、维护和备份脚本
- 支持宝塔面板集成
- 支持 Docker 和 Kubernetes 环境
- 自动化维护和监控功能
