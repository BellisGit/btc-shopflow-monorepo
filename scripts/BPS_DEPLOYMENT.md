# BPS 部署工作流说明

## 概述

`bps-all.sh` 是一个简化的部署脚本，用于快速将构建产物部署到服务器。对应的 GitHub Actions 工作流是 `deploy-bps-all.yml`。

## 特点

1. **快速部署**：使用 scp 直接上传，无需复杂的中间步骤
2. **支持跳过构建**：可以使用已有的构建产物，避免重复构建
3. **自动密码认证**：使用 sshpass 自动输入密码，无需手动操作
4. **连接优化**：配置了 SSH 保活机制，防止连接超时

## 本地使用

### 安装 sshpass

**WSL/Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y sshpass
```

**macOS:**
```bash
brew install sshpass
```

### 配置服务器信息

1. 复制配置示例文件：
```bash
cp scripts/deploy-config.example.sh scripts/deploy-config.sh
```

2. 编辑配置文件：
```bash
# 编辑 scripts/deploy-config.sh
export SERVER_HOST=your-server-ip
export SERVER_USER=root
export SERVER_PASSWORD=your-password
```

### 运行部署

**构建并部署：**
```bash
pnpm bps:all
```

**仅部署（使用已有构建产物）：**
```bash
bash scripts/bps-all.sh --skip-build
```

## GitHub Actions 工作流

### 工作流文件

`.github/workflows/deploy-bps-all.yml`

### 触发方式

1. **手动触发**：
   - 在 GitHub Actions 页面手动运行
   - 可以选择是否跳过构建（默认跳过）

2. **自动触发**：
   - 当 `Build-Deploy All Apps` 工作流成功完成后自动触发
   - 自动跳过构建，使用构建工作流的产物

### 工作流流程

1. **下载构建产物**（如果跳过构建）：
   - 从 `Build-Deploy All Apps` 工作流下载 artifacts
   - 提取并组织到正确的目录结构

2. **安装工具**：
   - 安装 sshpass
   - 配置 SSH 连接

3. **部署**：
   - 清理服务器部署目录
   - 上传所有应用的构建产物
   - 重启 Nginx

### 需要的 Secrets

在 GitHub 仓库的 Settings > Secrets 中配置：

- `SERVER_HOST`: 服务器地址
- `SERVER_USER`: SSH 用户名（默认：root）
- `SERVER_PASSWORD`: SSH 密码
- `SERVER_PORT`: SSH 端口（默认：22）
- `REMOTE_BASE_PATH`: 远程部署路径（默认：/www/wwwroot）

### 使用场景

**场景 1：构建完成后自动部署**
```
Build-Deploy All Apps (构建) 
  ↓ 成功后自动触发
Deploy with BPS All (部署，使用构建产物)
```

**场景 2：手动部署已有构建产物**
```
在 GitHub Actions 页面手动运行 Deploy with BPS All
  ↓ 选择跳过构建
直接使用仓库中已有的构建产物部署
```

**场景 3：本地快速部署**
```bash
# 本地已经构建完成
pnpm bps:all --skip-build
```

## 与 build-deploy:static:all 的区别

| 特性 | build-deploy:static:all | bps:all |
|------|------------------------|---------|
| 构建方式 | 在工作流中构建 | 可跳过构建，使用已有产物 |
| 部署方式 | rsync（增量同步） | scp（直接上传） |
| 速度 | 较慢（需要构建） | 更快（可跳过构建） |
| 适用场景 | 完整的构建+部署流程 | 快速部署已有产物 |

## 注意事项

1. **构建产物位置**：
   - 本地：`apps/*/dist/` 目录
   - GitHub Actions：从构建工作流的 artifacts 下载

2. **部署路径**：
   - 每个应用部署到对应的子域名目录
   - 例如：`system-app` → `/www/wwwroot/bellis.com.cn`

3. **SSH 连接**：
   - 脚本配置了保活机制，但仍可能因网络问题超时
   - 如果超时，脚本会自动重试 3 次

4. **权限要求**：
   - 工作流需要 `actions: read` 权限来下载其他工作流的 artifacts

## 故障排查

### 问题：SSH 连接超时

**解决方案：**
- 检查服务器防火墙设置
- 检查 SSH 端口是否正确
- 脚本已配置保活机制，如果仍然超时，可能需要检查服务器配置

### 问题：构建产物不存在

**解决方案：**
- 确保已经运行过构建
- 检查 `apps/*/dist/` 目录是否存在
- 在 GitHub Actions 中，确保构建工作流成功完成并上传了 artifacts

### 问题：权限错误

**解决方案：**
- 确保 SSH 用户有权限写入目标目录
- 检查服务器目录权限设置

