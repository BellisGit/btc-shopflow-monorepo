# BTC ShopFlow 磁盘空间需求分析

## 📊 磁盘空间需求概览

### 最小要求
- **最低磁盘空间**: **5GB**
- **推荐磁盘空间**: **10GB**
- **理想磁盘空间**: **20GB+**

## 🔍 详细空间分析

### 1. Docker镜像空间（运行时）

#### 单个应用镜像大小：
- **基础镜像**: `nginx:alpine` ≈ **7MB**
- **构建产物** (`dist/`): 每个应用约 **10-100MB**
  - 小应用（如engineering-app）: ~15MB
  - 中等应用（如quality-app）: ~30-50MB
  - 大应用（如system-app, admin-app）: ~50-100MB
- **镜像元数据**: ~5MB
- **单个镜像总大小**: 约 **20-120MB**（平均 **50MB**）

#### 所有应用镜像：
- **8个应用** × 50MB（平均） = **~400MB**
- **包含latest和SHA标签**: 2倍 = **~800MB**

### 2. Docker系统空间

- **Docker引擎**: ~500MB
- **镜像存储开销**: ~200MB
- **容器运行时空间**: 
  - 8个容器 × 15MB = **~120MB**
- **Docker overlay文件系统**: ~500MB - 1GB
- **Docker系统总计**: **~1.5 - 2GB**

### 3. 拉取镜像时的临时空间

- **镜像下载临时空间**: 
  - 8个镜像 × 平均大小 × 2（压缩和未压缩）= **~1.6GB**
- **解压和处理空间**: **~500MB**
- **拉取镜像临时空间总计**: **~2 - 3GB**

### 4. 系统运行空间

- **系统文件**: ~2-5GB（取决于Linux发行版）
- **日志文件**: ~500MB - 1GB
- **临时文件**: ~500MB
- **系统运行空间**: **~3 - 7GB**

## 📋 空间分配总结

| 项目 | 最小空间 | 推荐空间 | 说明 |
|------|---------|---------|------|
| Docker镜像存储 | 800MB | 1GB | 8个应用的镜像 |
| Docker系统 | 1.5GB | 2GB | Docker引擎和运行环境 |
| 拉取临时空间 | 2GB | 3GB | 拉取镜像时需要的临时空间 |
| 系统运行 | 2GB | 5GB | 操作系统、日志等 |
| **总计** | **6.3GB** | **11GB** | **最小/推荐** |
| **安全余量（20%）** | +1.3GB | +2GB | 留出余量 |
| **最终推荐** | **8GB** | **15GB** | **实际建议** |

## ⚠️ 注意事项

### 磁盘空间不足的风险

1. **镜像拉取失败**
   - 错误: `no space left on device`
   - 影响: 无法部署新版本

2. **Docker登录失败**
   - 错误: `Error saving credentials: no space left on device`
   - 影响: 无法访问容器注册表

3. **容器启动失败**
   - 影响: 服务无法运行

## 🛠️ 空间优化建议

### 1. 定期清理

```bash
# 清理未使用的镜像
docker image prune -af

# 清理未使用的容器
docker container prune -f

# 清理未使用的卷
docker volume prune -f

# 清理所有未使用的资源
docker system prune -af --volumes

# 清理构建缓存
docker builder prune -af
```

### 2. 删除旧版本镜像

```bash
# 只保留latest标签，删除特定SHA标签
docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "latest" | xargs docker rmi
```

### 3. 使用镜像压缩

```bash
# 拉取时使用压缩选项
docker pull --platform linux/amd64 ghcr.io/repo/app:latest
```

### 4. 配置Docker数据目录

如果有更大的磁盘分区，可以移动Docker数据目录：

```bash
# 停止Docker
systemctl stop docker

# 移动数据目录
mv /var/lib/docker /data/docker

# 创建软链接
ln -s /data/docker /var/lib/docker

# 启动Docker
systemctl start docker
```

## 📊 监控磁盘空间

### 检查当前空间使用

```bash
# 查看磁盘使用情况
df -h

# 查看Docker空间使用
docker system df

# 查看详细的空间使用
docker system df -v
```

### 自动化清理脚本

建议创建定期清理脚本（如每周执行一次）：

```bash
#!/bin/bash
# 清理Docker资源
docker system prune -af --volumes

# 清理旧镜像（保留最近3个版本）
docker images --format "{{.Repository}}:{{.Tag}}" | \
  grep -E "(system-app|admin-app|finance-app|logistics-app|quality-app|production-app|engineering-app|mobile-app)" | \
  grep -v "latest" | \
  sort -r | tail -n +4 | \
  xargs -r docker rmi -f

# 检查空间
df -h
docker system df
```

## ✅ 推荐配置

### 生产环境建议

- **最小磁盘空间**: **10GB**
- **推荐磁盘空间**: **20GB**
- **理想磁盘空间**: **50GB+**（考虑日志、备份、更新等）

### 监控阈值

- **警告阈值**: 磁盘使用率 > 80%
- **危险阈值**: 磁盘使用率 > 90%
- **紧急阈值**: 磁盘使用率 > 95%

## 🔄 部署时的空间检查

当前部署脚本已包含：
- ✅ 部署前检查磁盘空间
- ✅ 自动清理未使用的Docker资源
- ✅ 空间不足时的警告提示
- ✅ 拉取镜像前的空间验证

这些措施可以确保部署过程的稳定性。

