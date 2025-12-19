# Jenkins 端口修改脚本
# 使用方法: .\jenkins\fix-port.ps1 -NewPort 9080

param(
    [int]$NewPort = 9080
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Jenkins 端口修改脚本" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检查当前端口占用
Write-Host "检查当前 8080 端口占用..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    $process = Get-Process -Id $port8080.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "  当前 8080 端口被进程占用: $($process.ProcessName) (PID: $($port8080.OwningProcess))" -ForegroundColor Yellow
}

# 可能的 Jenkins 配置文件路径
$possiblePaths = @(
    "$env:ProgramFiles\Jenkins\jenkins.xml",
    "$env:ProgramFiles(x86)\Jenkins\jenkins.xml",
    "$env:USERPROFILE\.jenkins\jenkins.xml",
    "$env:APPDATA\Jenkins\jenkins.xml"
)

$jenkinsXml = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $jenkinsXml = $path
        Write-Host "✅ 找到 Jenkins 配置文件: $path" -ForegroundColor Green
        break
    }
}

if (-not $jenkinsXml) {
    Write-Host "❌ 未找到 jenkins.xml 配置文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动查找 Jenkins 安装目录，然后：" -ForegroundColor Yellow
    Write-Host "1. 找到 jenkins.xml 文件" -ForegroundColor Yellow
    Write-Host "2. 修改 --httpPort=8080 为 --httpPort=$NewPort" -ForegroundColor Yellow
    Write-Host "3. 重启 Jenkins 服务" -ForegroundColor Yellow
    exit 1
}

# 备份原文件
$backupPath = "$jenkinsXml.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-Host "备份配置文件到: $backupPath" -ForegroundColor Yellow
Copy-Item $jenkinsXml $backupPath

# 读取并修改配置文件
Write-Host "读取配置文件..." -ForegroundColor Yellow
$content = Get-Content $jenkinsXml -Raw -Encoding UTF8

if ($content -match '--httpPort=(\d+)') {
    $oldPort = $matches[1]
    Write-Host "当前端口: $oldPort" -ForegroundColor Yellow
    Write-Host "新端口: $NewPort" -ForegroundColor Yellow
    
    # 替换端口
    $content = $content -replace "--httpPort=$oldPort", "--httpPort=$NewPort"
    
    # 保存文件
    Write-Host "保存配置文件..." -ForegroundColor Yellow
    Set-Content $jenkinsXml -Value $content -Encoding UTF8 -NoNewline
    
    Write-Host "✅ 端口已修改为 $NewPort" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "下一步操作：" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 重启 Jenkins 服务：" -ForegroundColor Yellow
    Write-Host "   Restart-Service jenkins" -ForegroundColor White
    Write-Host "   或者通过服务管理器重启 Jenkins 服务" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 访问新的地址：" -ForegroundColor Yellow
    Write-Host "   http://localhost:$NewPort" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ 未找到 --httpPort 配置" -ForegroundColor Red
    Write-Host "配置文件可能使用其他格式，请手动修改" -ForegroundColor Yellow
    exit 1
}
