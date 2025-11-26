# 设置 GitHub 仓库默认分支为 master
# 使用方法：在 PowerShell 中运行此脚本

Write-Host "🔧 设置 GitHub 仓库默认分支为 master" -ForegroundColor Cyan
Write-Host ""

# 配置
$REPO_OWNER = "BellisGit"
$REPO_NAME = "btc-shopflow-monorepo"
$DEFAULT_BRANCH = "master"

# 获取 GitHub Token
$GITHUB_TOKEN = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')

if ([string]::IsNullOrWhiteSpace($GITHUB_TOKEN)) {
    Write-Host "❌ 未找到 GITHUB_TOKEN 环境变量" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先设置 GITHUB_TOKEN:" -ForegroundColor Yellow
    Write-Host "  [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')" -ForegroundColor Gray
    Write-Host "  `$env:GITHUB_TOKEN = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')" -ForegroundColor Gray
    exit 1
}

Write-Host "📋 仓库信息:" -ForegroundColor Cyan
Write-Host "  Owner: $REPO_OWNER"
Write-Host "  Repo: $REPO_NAME"
Write-Host "  目标分支: $DEFAULT_BRANCH"
Write-Host ""

# 验证分支是否存在
Write-Host "🔍 验证分支是否存在..." -ForegroundColor Cyan
$branchCheckUrl = "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$DEFAULT_BRANCH"
$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $GITHUB_TOKEN"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    $branchResponse = Invoke-RestMethod -Uri $branchCheckUrl -Method Get -Headers $headers
    Write-Host "✅ 分支 $DEFAULT_BRANCH 存在" -ForegroundColor Green
} catch {
    Write-Host "❌ 分支 $DEFAULT_BRANCH 不存在或无法访问" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 修改默认分支
Write-Host ""
Write-Host "🔄 修改默认分支..." -ForegroundColor Cyan
$updateUrl = "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME"
$body = @{
    default_branch = $DEFAULT_BRANCH
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $updateUrl -Method Patch -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ 默认分支已成功修改为 $DEFAULT_BRANCH" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 仓库信息:" -ForegroundColor Cyan
    Write-Host "  - 默认分支: $($response.default_branch)"
    Write-Host "  - 仓库 URL: $($response.html_url)"
    Write-Host ""
    Write-Host "💡 提示: 更改可能需要几秒钟才能生效" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 修改失败" -ForegroundColor Red
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "💡 可能的原因:" -ForegroundColor Yellow
    Write-Host "  1. Token 缺少 'admin:repo' 权限"
    Write-Host "  2. 仓库设置不允许修改默认分支"
    Write-Host "  3. 分支保护规则阻止了修改"
    exit 1
}

