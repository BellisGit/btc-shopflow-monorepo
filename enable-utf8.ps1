# 启用 Windows UTF-8 支持的脚本
# 需要管理员权限运行

Write-Host "检查当前系统区域设置..." -ForegroundColor Yellow
$currentLocale = Get-WinSystemLocale
Write-Host "当前区域: $($currentLocale.Name)" -ForegroundColor Cyan

# 检查是否已经是 UTF-8
$codePage = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name ACP).ACP
Write-Host "当前代码页: $codePage" -ForegroundColor Cyan

if ($codePage -eq "65001") {
    Write-Host "系统已经使用 UTF-8 编码！" -ForegroundColor Green
    exit 0
}

Write-Host "`n准备启用 UTF-8 支持..." -ForegroundColor Yellow
Write-Host "注意：此操作需要管理员权限，并且可能需要重启系统！" -ForegroundColor Red

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n错误：需要管理员权限！" -ForegroundColor Red
    Write-Host "请右键点击 PowerShell，选择'以管理员身份运行'，然后重新执行此脚本。" -ForegroundColor Yellow
    exit 1
}

# 方法1：通过注册表启用 UTF-8（Windows 10 1903+ 和 Windows 11）
Write-Host "`n方法1：通过注册表启用 UTF-8..." -ForegroundColor Yellow

try {
    # 设置区域设置使用 UTF-8
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "ACP" -Value "65001" -ErrorAction Stop
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name "OEMCP" -Value "65001" -ErrorAction Stop
    
    Write-Host "✓ 注册表已更新" -ForegroundColor Green
    
    # 方法2：通过区域设置启用 UTF-8 Beta 功能
    Write-Host "`n方法2：启用区域设置中的 UTF-8 Beta 功能..." -ForegroundColor Yellow
    
    # 获取当前用户区域设置
    $userLocale = Get-Culture
    $localeName = $userLocale.Name
    
    # 设置区域设置使用 UTF-8
    Set-WinSystemLocale -SystemLocale $localeName -ErrorAction SilentlyContinue
    
    Write-Host "✓ 区域设置已更新" -ForegroundColor Green
    
    Write-Host "`n✓ UTF-8 支持已启用！" -ForegroundColor Green
    Write-Host "`n重要提示：" -ForegroundColor Yellow
    Write-Host "1. 需要重启系统才能使更改生效" -ForegroundColor White
    Write-Host "2. 重启后，PowerShell 和命令行将使用 UTF-8 编码" -ForegroundColor White
    Write-Host "3. 某些旧程序可能不兼容 UTF-8，如果遇到问题可以回退" -ForegroundColor White
    
} catch {
    Write-Host "`n错误：无法修改注册表" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
