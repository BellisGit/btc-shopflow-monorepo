# Windows 启用 UTF-8 编码支持指南

## 方法一：通过 Windows 设置（推荐）

### Windows 10 (1903+) 和 Windows 11

1. **打开设置**
   - 按 `Win + I` 打开 Windows 设置
   - 或者点击开始菜单 → 设置

2. **进入区域设置**
   - 点击 "时间和语言" (Time & Language)
   - 点击左侧 "语言和区域" (Language & Region)
   - 或者直接搜索 "区域" (Region)

3. **启用 UTF-8 支持**
   - 点击 "管理语言设置" (Administrative language settings)
   - 在弹出的窗口中，点击 "更改系统区域设置" (Change system locale)
   - 勾选 "Beta: 使用 Unicode UTF-8 提供全球语言支持" (Beta: Use Unicode UTF-8 for worldwide language support)
   - 点击 "确定"
   - **需要重启系统**

### Windows 10 (1809 及更早版本)

这些版本不支持图形界面设置，需要使用注册表或 PowerShell。

## 方法二：通过 PowerShell（需要管理员权限）

### 步骤 1：以管理员身份运行 PowerShell

1. 右键点击 "Windows PowerShell" 或 "PowerShell"
2. 选择 "以管理员身份运行"

### 步骤 2：执行命令

```powershell
# 检查当前代码页
reg query "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Nls\CodePage" /v ACP

# 启用 UTF-8（需要管理员权限）
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "ACP" -Value "65001"
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "OEMCP" -Value "65001"

# 验证更改
reg query "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Nls\CodePage" /v ACP
```

### 步骤 3：重启系统

更改后必须重启系统才能生效。

## 方法三：使用提供的脚本

1. 以管理员身份运行 PowerShell
2. 执行脚本：
   ```powershell
   .\enable-utf8.ps1
   ```

## 验证 UTF-8 是否生效

重启后，在 PowerShell 中执行：

```powershell
# 检查代码页
chcp

# 应该显示：活动代码页: 65001

# 检查 PowerShell 编码
[Console]::OutputEncoding.EncodingName
[System.Text.Encoding]::Default.EncodingName
```

## 注意事项

1. **需要重启**：更改系统区域设置后必须重启系统
2. **兼容性**：某些旧程序可能不兼容 UTF-8，如果遇到问题可以回退
3. **回退方法**：取消勾选 "Beta: 使用 Unicode UTF-8 提供全球语言支持"，或恢复注册表值

## 回退到 GBK（如果需要）

如果遇到兼容性问题，可以回退：

```powershell
# 以管理员身份运行
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "ACP" -Value "936"
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "OEMCP" -Value "936"
```

然后重启系统。

## 仅针对 Git 的临时解决方案

如果不想修改系统设置，可以：

1. **使用 Git Bash**：Git Bash 对 UTF-8 支持更好
2. **使用英文提交信息**：避免编码问题
3. **设置 Git 环境变量**：
   ```powershell
   $env:LANG = "zh_CN.UTF-8"
   $env:LC_ALL = "zh_CN.UTF-8"
   ```
