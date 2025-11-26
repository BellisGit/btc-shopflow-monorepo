# 设置 GITHUB_TOKEN 环境变量的辅助脚本
# 用法: . scripts/setup-github-token.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔑 GitHub Token 设置助手" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检查是否已经设置
$existingToken = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
if ($existingToken) {
    Write-Host "⚠️  检测到已存在的 GITHUB_TOKEN (用户级别)" -ForegroundColor Yellow
    Write-Host "   当前长度: $($existingToken.Length) 字符" -ForegroundColor Gray
    Write-Host ""
    $keep = Read-Host "是否要保留现有 Token？(Y/n)"
    if ($keep -ne 'n' -and $keep -ne 'N') {
        Write-Host "✓ 保留现有 Token" -ForegroundColor Green
        Write-Host ""
        Write-Host "要使用现有 Token，运行:" -ForegroundColor Cyan
        Write-Host "  . scripts/refresh-env.ps1" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "📝 请输入你的 GitHub Personal Access Token" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果还没有 Token，请访问: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "需要的权限:" -ForegroundColor Gray
Write-Host "  - ✅ write:packages (推送镜像到 GHCR)" -ForegroundColor Gray
Write-Host "  - ✅ actions:write (触发 GitHub Actions 工作流)" -ForegroundColor Gray
Write-Host "  - ✅ repo (如果仓库是私有的)" -ForegroundColor Gray
Write-Host ""

$token = Read-Host "GitHub Token" -AsSecureString
$tokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
    Write-Host "❌ Token 不能为空" -ForegroundColor Red
    exit 1
}

# 设置用户级别的环境变量
try {
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $tokenPlain, 'User')
    Write-Host ""
    Write-Host "✓ GITHUB_TOKEN 已设置到用户级别环境变量" -ForegroundColor Green
    Write-Host ""
    
    # 立即刷新到当前会话
    $env:GITHUB_TOKEN = $tokenPlain
    Write-Host "✓ 已加载到当前 PowerShell 会话" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "✅ 设置完成！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 提示:" -ForegroundColor Yellow
    Write-Host "  - 在新打开的 PowerShell 窗口中，Token 会自动加载" -ForegroundColor Gray
    Write-Host "  - 在当前的 PowerShell 窗口中，Token 已立即生效" -ForegroundColor Gray
    Write-Host "  - bash 脚本现在可以读取到此 Token" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ 设置失败: $_" -ForegroundColor Red
    exit 1
}



