# 环境变量设置参数说明

## SetEnvironmentVariable 方法参数

```powershell
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')
                            ↑                ↑              ↑
                            |                |              └─ 作用域（Scope）
                            |                └─ 值（Value）
                            └─ 变量名（Variable Name）
```

### 参数详解

1. **第一个参数：变量名** - `'GITHUB_TOKEN'`
   - 这是环境变量的名称
   - 脚本会读取这个名称的环境变量

2. **第二个参数：值** - `'your_token'`
   - 这是实际的 GitHub Token 值
   - 例如：`'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'`

3. **第三个参数：作用域** - `'User'`
   - **不是 token 的名字**，而是环境变量的存储级别
   - 可选值：
     - `'User'` - 用户级别，只对当前 Windows 用户有效（推荐）
     - `'Machine'` - 系统级别，对所有用户有效（需要管理员权限）
     - `'Process'` - 进程级别，只在当前进程有效（等同于 `$env:GITHUB_TOKEN`）

### 示例

```powershell
# ✅ 正确示例
# 将 GitHub Token 存储到用户级环境变量
[System.Environment]::SetEnvironmentVariable(
    'GITHUB_TOKEN',           # 变量名
    'ghp_abc123xyz...',       # Token 值（你的实际 token）
    'User'                    # 作用域：用户级别
)

# ❌ 错误理解
# 'User' 不是 token 的名字，token 的名字就是 'GITHUB_TOKEN'
# Token 的值是第二个参数 'ghp_abc123xyz...'
```

### 各作用域的区别

| 作用域 | 存储位置 | 生效范围 | 是否需要管理员 | 推荐场景 |
|--------|----------|----------|----------------|----------|
| `User` | 注册表：`HKEY_CURRENT_USER\Environment` | 当前用户的所有进程 | ❌ 否 | ✅ **推荐** - 个人开发 |
| `Machine` | 注册表：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment` | 所有用户的所有进程 | ✅ 是 | 多用户共享 |
| `Process` | 内存（进程级） | 仅当前 PowerShell 进程 | ❌ 否 | 临时测试 |

### 验证设置

```powershell
# 读取用户级环境变量
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')

# 读取系统级环境变量
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'Machine')

# 读取进程级环境变量
$env:GITHUB_TOKEN
```

