# 部署配置说明

## 前置要求

### 安装 sshpass（必需）

脚本使用 `sshpass` 来自动输入密码，无需手动输入。

**WSL/Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y sshpass
```

**CentOS/RHEL:**
```bash
sudo yum install -y sshpass
```

**macOS:**
```bash
brew install sshpass
```

**验证安装:**
```bash
sshpass -V
```

## 快速开始

### 方式 1: 使用配置文件（推荐）

1. 复制配置示例文件：
```bash
cp scripts/deploy-config.example.sh scripts/deploy-config.sh
```

2. 编辑配置文件，填写实际服务器信息：
```bash
# 编辑 scripts/deploy-config.sh
export SERVER_HOST=your-server-ip
export SERVER_USER=root
export SERVER_PASSWORD=your-password
```

3. 运行部署脚本：
```bash
pnpm bps:all
```

脚本会自动加载 `scripts/deploy-config.sh` 文件中的配置。

### 方式 2: 使用环境变量

在运行脚本前设置环境变量：

**Linux/Mac:**
```bash
export SERVER_HOST=47.112.31.96
export SERVER_USER=root
export SERVER_PASSWORD=Bellis99+
export SERVER_PORT=22
pnpm bps:all
```

**Windows (PowerShell):**
```powershell
$env:SERVER_HOST="47.112.31.96"
$env:SERVER_USER="root"
$env:SERVER_PASSWORD="Bellis99+"
$env:SERVER_PORT="22"
pnpm bps:all
```

**Windows (CMD):**
```cmd
set SERVER_HOST=47.112.31.96
set SERVER_USER=root
set SERVER_PASSWORD=Bellis99+
set SERVER_PORT=22
pnpm bps:all
```

### 方式 3: 使用默认值

如果不设置任何环境变量，脚本会使用硬编码的默认值。

## 配置项说明

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `SERVER_HOST` | 服务器 IP 地址或域名 | `47.112.31.96` |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SERVER_PASSWORD` | SSH 密码 | `Bellis99+` |
| `SERVER_PORT` | SSH 端口 | `22` |
| `REMOTE_BASE_PATH` | 远程部署基础路径 | `/www/wwwroot` |

## SSH 连接优化

脚本已自动配置以下 SSH 选项以防止连接超时：

- `ServerAliveInterval=60`: 每 60 秒发送一次保活消息
- `ServerAliveCountMax=3`: 最多发送 3 次保活消息
- `ConnectTimeout=30`: 连接超时 30 秒
- `TCPKeepAlive=yes`: 启用 TCP 保活

如果连接仍然超时，可以增加保活间隔：
```bash
# 在脚本中修改 SSH_OPTS，增加 ServerAliveInterval
```

## 重试机制

脚本已实现自动重试机制：
- SSH 命令失败时自动重试 3 次
- SCP 上传失败时自动重试 3 次
- 每次重试间隔 2 秒

## 安全建议

1. **不要将包含密码的配置文件提交到 Git**
   - `scripts/deploy-config.sh` 已在 `.gitignore` 中
   - 只提交 `scripts/deploy-config.example.sh`

2. **使用 SSH 密钥认证（可选）**
   - 配置 SSH 密钥后，可以移除密码配置
   - 脚本会自动检测是否使用密钥认证

3. **限制配置文件权限**
   ```bash
   chmod 600 scripts/deploy-config.sh
   ```

