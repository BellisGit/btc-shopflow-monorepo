# 刷新用户级别的环境变量
# 从注册表中重新加载用户环境变量到当前 PowerShell 会话

# 设置输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$userEnvKey = 'Registry::HKEY_CURRENT_USER\Environment'
$userEnv = Get-ItemProperty -Path $userEnvKey

$loadedCount = 0
$userEnv.PSObject.Properties | ForEach-Object {
    if ($_.Name -ne 'PSPath' -and $_.Name -ne 'PSParentPath' -and $_.Name -ne 'PSChildName' -and $_.Name -ne 'PSDrive' -and $_.Name -ne 'PSProvider') {
        $name = $_.Name
        $value = $_.Value
        if ($value) {
            Set-Item -Path "env:$name" -Value $value -ErrorAction SilentlyContinue
            $loadedCount++
        }
    }
}

Write-Host ""
if ($loadedCount -gt 0) {
    Write-Host "Environment variables refreshed. Loaded $loadedCount variables." -ForegroundColor Green
} else {
    Write-Host "No environment variables found to refresh." -ForegroundColor Yellow
}

Write-Host ""
if ($env:GITHUB_TOKEN) {
    Write-Host "  GITHUB_TOKEN: Set (length: $($env:GITHUB_TOKEN.Length))" -ForegroundColor Green
} else {
    Write-Host "  GITHUB_TOKEN: Not set" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set GITHUB_TOKEN, run:" -ForegroundColor Yellow
    Write-Host "  [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')" -ForegroundColor Cyan
    Write-Host "  Then run this script again to refresh environment variables" -ForegroundColor Yellow
}



