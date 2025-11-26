# 配置 Docker 直接连接远程服务器（与 WebStorm 相同）

## 为什么 WebStorm 可以连接远程 Docker？

WebStorm 使用 `DOCKER_HOST` 环境变量直接连接远程 Docker daemon，而不是每次都通过 SSH 执行命令。这样更高效、更简洁。

## 配置方法

### 方法 1：使用 DOCKER_HOST 环境变量（推荐，与 WebStorm 相同）

```bash
# Windows PowerShell
$env:DOCKER_HOST="ssh://root@your-server-ip:22"

# Linux/Mac
export DOCKER_HOST="ssh://root@your-server-ip:22"
```

**注意**：需要配置 SSH 密钥到 `~/.ssh/config` 或者使用 SSH agent。

### 方法 2：配置 SSH Config（推荐）

创建或编辑 `~/.ssh/config` 文件（在 Git Bash 中路径为 `/c/Users/your-username/.ssh/config`）：

```
Host your-server-alias
    HostName your-server-ip
    Port 22
    User root
    IdentityFile C:/Users/your-username/.ssh/github_actions_key
    StrictHostKeyChecking no
```

然后使用：

```bash
export DOCKER_HOST="ssh://your-server-alias"
```

### 方法 3：使用我们的脚本（自动检测）

我们的脚本会自动尝试两种方式：
1. 首先尝试直接连接（使用 `DOCKER_HOST`）
2. 如果失败，回退到 SSH 方式

只需设置环境变量：

```bash
# Windows PowerShell
$env:SERVER_HOST="your-server-ip"
$env:GITHUB_TOKEN="your-token"

# 或者同时设置 DOCKER_HOST（直接连接）
$env:DOCKER_HOST="ssh://root@your-server-ip:22"
```

## 验证连接

设置好 `DOCKER_HOST` 后，运行：

```bash
docker info
```

如果能正常显示远程服务器的 Docker 信息，说明连接成功！

## 区别说明

| 方式 | WebStorm 的方式 | 我们脚本的方式 |
|------|----------------|---------------|
| **连接方式** | 直接连接（`DOCKER_HOST`） | SSH 执行命令 |
| **效率** | 高（直接连接） | 中（每次通过 SSH） |
| **配置** | 需要 SSH config | 需要 SSH 密钥路径 |
| **兼容性** | 与 Docker CLI 一致 | 兼容性更好 |

## 推荐配置

为了获得与 WebStorm 相同的体验，建议：

1. **配置 SSH Config**（`~/.ssh/config`）：
```
Host btc-server
    HostName your-server-ip
    Port 22
    User root
    IdentityFile C:/Users/mlu/.ssh/github_actions_key
    StrictHostKeyChecking no
```

2. **设置 DOCKER_HOST**：
```bash
export DOCKER_HOST="ssh://btc-server"
```

3. **运行脚本**：
```bash
pnpm build-deploy:finance
```

脚本会自动检测 `DOCKER_HOST`，如果已设置则使用直接连接模式，否则回退到 SSH 方式。

