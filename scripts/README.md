# Verdaccio 脚本使用说明

## 脚本列表

- `start-verdaccio.sh` / `start-verdaccio.ps1` - 启动 Verdaccio 服务
- `publish-to-verdaccio.sh` / `publish-to-verdaccio.ps1` - 发布所有共享组件库
- `check-verdaccio-status.sh` / `check-verdaccio-status.ps1` - 检查 Verdaccio 状态

## 使用方法

### 推荐：使用 Shell 脚本（避免 PowerShell 乱码）

**Windows (Git Bash):**
```bash
bash scripts/start-verdaccio.sh
bash scripts/publish-to-verdaccio.sh
bash scripts/check-verdaccio-status.sh
```

**Linux/Mac:**
```bash
chmod +x scripts/*.sh
./scripts/start-verdaccio.sh
./scripts/publish-to-verdaccio.sh
./scripts/check-verdaccio-status.sh
```

### 使用 PowerShell 脚本

**重要：路径前必须有 `.\`**

```powershell
# 正确 ✅
.\scripts\start-verdaccio.ps1
.\scripts\publish-to-verdaccio.ps1
.\scripts\check-verdaccio-status.ps1

# 错误 ❌
\scripts\publish-to-verdaccio.ps1  # 缺少前面的点
scripts\publish-to-verdaccio.ps1   # 缺少前面的点
```

### PowerShell 执行策略问题

如果遇到 "无法加载文件，因为在此系统上禁止运行脚本" 错误，需要设置执行策略：

```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 设置执行策略（需要管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或者临时绕过（仅当前会话）
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

## 快速开始

1. **启动 Verdaccio**（推荐使用 shell 脚本）：
   ```bash
   bash scripts/start-verdaccio.sh
   ```

2. **创建用户**（在新终端）：
   ```bash
   npm adduser --registry http://localhost:4873
   ```

3. **发布所有包**：
   ```bash
   bash scripts/publish-to-verdaccio.sh
   ```

4. **检查状态**：
   ```bash
   bash scripts/check-verdaccio-status.sh
   ```
