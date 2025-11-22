# BTC ShopFlow 内存（RAM）需求分析

## 📊 内存需求概览

### 快速答案
- **最小内存**: **2GB**
- **推荐内存**: **4GB**
- **理想内存**: **8GB+**

## 🔍 详细内存分析

### 1. 单个应用容器内存占用

#### nginx:alpine 容器内存分析：
- **nginx主进程**: ~5-10MB
- **nginx工作进程** (worker processes): ~5-10MB/进程
  - 默认1个工作进程
  - 总计：~10-20MB
- **静态文件内存映射**: 
  - 小应用（~15MB dist）: ~5-10MB
  - 中等应用（~50MB dist）: ~10-20MB
  - 大应用（~100MB dist）: ~20-40MB
- **容器运行时开销**: ~10-20MB
- **单个容器总计**: **30-90MB**（平均 **50MB**）

#### 8个应用容器：
- **8个容器** × 50MB（平均） = **~400MB**
- **峰值内存**（所有容器同时处理请求）: **~600MB**

### 2. Docker系统内存占用

- **Docker daemon**: ~50-100MB
- **containerd**: ~30-50MB
- **网络驱动**: ~20-30MB
- **存储驱动（overlay2）**: ~10-20MB
- **Docker系统总计**: **~150-250MB**

### 3. 系统基础内存

- **Linux内核**: ~100-200MB
- **系统服务** (systemd, sshd等): ~50-100MB
- **系统缓存**: ~200-500MB（动态）
- **系统基础总计**: **~350-800MB**

### 4. 其他服务内存

- **日志服务** (rsyslog/journald): ~20-50MB
- **监控服务** (如果启用): ~50-200MB
- **其他总计**: **~100-300MB**

## 📋 内存分配总结

| 项目 | 最小内存 | 推荐内存 | 说明 |
|------|---------|---------|------|
| 应用容器（8个） | 400MB | 600MB | nginx容器运行 |
| Docker系统 | 150MB | 250MB | Docker引擎 |
| 系统基础 | 350MB | 800MB | Linux系统 |
| 其他服务 | 100MB | 300MB | 日志、监控等 |
| **基础总计** | **1GB** | **2GB** | **最小运行** |
| **峰值缓冲（50%）** | +500MB | +1GB | 处理峰值请求 |
| **安全余量（20%）** | +300MB | +400MB | 系统稳定性 |
| **最终推荐** | **2GB** | **4GB** | **实际建议** |

## 📊 内存使用场景

### 场景1：最小配置（2GB内存）
```
内存分配:
├── 应用容器: 400MB (8个nginx容器)
├── Docker系统: 200MB
├── 系统基础: 500MB
├── 系统缓存: 400MB
└── 可用缓冲: 500MB

状态: ⚠️ 可运行，但较紧张
建议: 仅用于测试环境
```

### 场景2：推荐配置（4GB内存）
```
内存分配:
├── 应用容器: 600MB (8个nginx容器 + 峰值)
├──  Docker系统: 250MB
├── 系统基础: 800MB
├── 系统缓存: 1GB
└── 可用缓冲: 1.35GB

状态: ✅ 稳定运行
建议: 生产环境推荐
```

### 场景3：理想配置（8GB+内存）
```
内存分配:
├── 应用容器: 600MB
├── Docker系统: 250MB
├── 系统基础: 1GB
├── 系统缓存: 2GB
└── 可用缓冲: 4GB+

状态: ✅✅ 非常稳定
建议: 高负载生产环境
```

## 🔍 内存监控

### 检查当前内存使用

```bash
# 查看系统内存
free -h

# 查看Docker容器内存使用
docker stats --no-stream

# 查看详细内存信息
cat /proc/meminfo

# 查看每个容器的内存限制
docker inspect <container_name> | grep -i memory
```

### 内存使用示例

```bash
# 典型的内存使用情况（4GB服务器）
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           4.0G        1.2G        2.1G         45M        700M        2.5G
Swap:          2.0G          0B        2.0G

# Docker容器内存使用
$ docker stats --no-stream
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
btc-system-app      0.05%     45.2MiB / 4GiB       1.10%
btc-admin-app       0.03%     38.5MiB / 4GiB       0.94%
btc-finance-app     0.02%     32.1MiB / 4GiB       0.78%
btc-logistics-app   0.02%     35.8MiB / 4GiB       0.87%
btc-quality-app     0.02%     28.3MiB / 4GiB       0.69%
btc-production-app  0.02%     30.5MiB / 4GiB       0.74%
btc-engineering-app 0.01%     25.2MiB / 4GiB       0.61%
btc-mobile-app      0.02%     42.1MiB / 4GiB       1.03%
```

## ⚙️ 内存优化建议

### 1. 限制容器内存（可选）

在docker-compose.yml中为每个容器设置内存限制：

```yaml
services:
  system-app:
    image: btc-shopflow/system-app:latest
    mem_limit: 100m      # 限制100MB
    mem_reservation: 50m # 保留50MB
```

### 2. 优化nginx配置

减少nginx工作进程数量（对于静态文件服务，1个进程通常足够）：

```nginx
worker_processes 1;  # 默认值，通常足够
```

### 3. 启用swap（如果内存不足）

```bash
# 创建swap文件（2GB）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. 监控内存使用

设置内存使用告警：

```bash
# 检查内存使用率
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
  echo "⚠️  Warning: Memory usage is ${MEMORY_USAGE}%"
fi
```

## 📊 不同负载下的内存需求

### 低负载（<100并发用户）
- **内存需求**: 2GB
- **容器内存**: ~400MB
- **系统内存**: ~600MB
- **缓存内存**: ~1GB

### 中等负载（100-500并发用户）
- **内存需求**: 4GB
- **容器内存**: ~600MB
- **系统内存**: ~800MB
- **缓存内存**: ~2GB

### 高负载（500+并发用户）
- **内存需求**: 8GB+
- **容器内存**: ~800MB
- **系统内存**: ~1GB
- **缓存内存**: ~4GB+
- **建议**: 考虑负载均衡和水平扩展

## ✅ 推荐配置

### 生产环境建议

| 环境 | 最小内存 | 推荐内存 | 说明 |
|------|---------|---------|------|
| **测试环境** | 2GB | 2GB | 单机测试 |
| **开发环境** | 2GB | 4GB | 开发调试 |
| **生产环境** | 4GB | 8GB | 稳定运行 |
| **高负载生产** | 8GB | 16GB+ | 高并发场景 |

### 内存监控阈值

- **正常**: 内存使用率 < 70%
- **警告**: 内存使用率 70-85%
- **危险**: 内存使用率 85-95%
- **紧急**: 内存使用率 > 95%

## 🔄 内存优化实践

### 1. 定期监控

```bash
# 创建内存监控脚本
cat > /usr/local/bin/check-memory.sh << 'EOF'
#!/bin/bash
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
echo "Memory usage: ${MEMORY_USAGE}%"
if [ "$MEMORY_USAGE" -gt 80 ]; then
  echo "⚠️  High memory usage detected"
  docker stats --no-stream
fi
EOF
chmod +x /usr/local/bin/check-memory.sh
```

### 2. 自动清理

如果内存不足，可以自动清理：

```bash
# 清理未使用的Docker资源
docker system prune -af

# 清理系统缓存（谨慎使用）
sync && echo 3 > /proc/sys/vm/drop_caches
```

## 📝 总结

### 快速参考

- **最小内存**: **2GB**（可运行，但较紧张）
- **推荐内存**: **4GB**（生产环境推荐）
- **理想内存**: **8GB+**（高负载场景）

### 实际内存占用

在4GB内存的服务器上，典型使用情况：
- **已用内存**: ~1.2GB
- **可用内存**: ~2.5GB
- **内存使用率**: ~30-40%

### 结论

对于8个nginx静态应用容器：
- **基础内存需求**: 1-2GB
- **推荐配置**: **4GB内存**
- **可以稳定运行**: 2GB（但建议4GB）

内存需求相对较低，因为nginx容器非常轻量！

