# 设置 GitHub Token 环境变量（永久）
# 使用方法：在 PowerShell 中运行此脚本，然后输入你的 Token

Write-Host "🔐 设置 GitHub Token 环境变量" -ForegroundColor Cyan
Write-Host ""

# 提示用户输入 Token
$token = Read-Host "请输入你的 GitHub Personal Access Token (输入时不会显示)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Token 不能为空" -ForegroundColor Red
    exit 1
}

# 验证 Token 格式（GitHub PAT 通常以 ghp_ 开头）
if (-not $token.StartsWith("ghp_")) {
    Write-Host "⚠️  警告: Token 格式可能不正确（GitHub PAT 通常以 'ghp_' 开头）" -ForegroundColor Yellow
    $confirm = Read-Host "是否继续？(y/n)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        exit 1
    }
}

# 设置用户级环境变量
try {
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $token, 'User')
    Write-Host "✅ GitHub Token 已成功设置到用户环境变量" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 下一步：" -ForegroundColor Cyan
    Write-Host "  1. 刷新当前会话的环境变量：" -ForegroundColor White
    Write-Host "     `$env:GITHUB_TOKEN = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. 或者重新打开 PowerShell 终端" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. 验证设置：" -ForegroundColor White
    Write-Host "     `$env:GITHUB_TOKEN" -ForegroundColor Gray
    Write-Host ""
    
    # 自动刷新当前会话
    $env:GITHUB_TOKEN = $token
    Write-Host "✅ 当前会话的环境变量已刷新" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 提示: 新打开的终端会自动加载此环境变量" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 设置失败: $_" -ForegroundColor Red
    exit 1
}

