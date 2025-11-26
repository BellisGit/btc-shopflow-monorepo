# 环境变量设置指南

## GITHUB_TOKEN 设置问题排查

### 为什么之前设置的不生效了？

在 Windows 上，环境变量有以下几个级别：

1. **进程级别**（Process）- 只在当前进程有效
   - PowerShell: `$env:GITHUB_TOKEN = "token"`
   - 关闭终端后失效

2. **用户级别**（User）- 对所有用户进程有效
   - PowerShell: `[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'token', 'User')`
   - 需要重新打开终端或刷新才能生效

3. **系统级别**（Machine）- 对所有用户有效（需要管理员权限）

### 问题原因

1. **已打开的 PowerShell 不会自动加载新的用户级环境变量**
   - 需要关闭并重新打开 PowerShell
   - 或者使用 `refresh-env.ps1` 脚本手动刷新

2. **bash 脚本无法读取 PowerShell 会话级变量**
   - bash 只能读取系统级或用户级环境变量
   - 会话级变量只在 PowerShell 进程中有效

3. **环境变量可能在系统更新、重启或清理后被清除**

## 解决方案

### 方法 1：使用辅助脚本（推荐）

```powershell
# 运行设置脚本（交互式）
. scripts/setup-github-token.ps1
```

### 方法 2：手动设置并刷新

```powershell
# 1. 设置用户级环境变量
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')

# 2. 刷新当前会话
. scripts/refresh-env.ps1
```

### 方法 3：在当前会话设置（临时）

```powershell
# 仅在当前 PowerShell 会话有效
$env:GITHUB_TOKEN = "your_token_here"

# 运行 bash 脚本时传递环境变量
bash -c "export GITHUB_TOKEN=$env:GITHUB_TOKEN; bash scripts/build-and-push-local.sh"
```

### 方法 4：使用 Git 凭据管理器

脚本会自动尝试从 Git 凭据管理器读取 Token，如果你之前用 Git 登录过 GitHub，可能会自动获取。

## 验证设置

```powershell
# 检查用户级环境变量
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')

# 检查当前会话环境变量
$env:GITHUB_TOKEN

# 刷新环境变量
. scripts/refresh-env.ps1
```

## 创建 GitHub Token

1. 访问: https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 设置过期时间
4. 选择权限:
   - ✅ `write:packages` (推送镜像到 GHCR)
   - ✅ `actions:write` (触发 GitHub Actions 工作流)
   - ✅ `repo` (如果仓库是私有的)
5. 生成后复制 Token（只显示一次！）



