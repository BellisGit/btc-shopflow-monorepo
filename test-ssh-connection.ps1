# BTC ShopFlow SSH连接测试脚本
# 用于在Windows上测试SSH连接

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "root",
    
    [Parameter(Mandatory=$false)]
    [int]$ServerPort = 22
)

Write-Host "=== BTC ShopFlow SSH连接测试 ===" -ForegroundColor Cyan
Write-Host ""

# 检查SSH密钥
$privateKey = "$env:USERPROFILE\.ssh\github_actions_key"
$publicKey = "$env:USERPROFILE\.ssh\github_actions_key.pub"

Write-Host "检查SSH密钥文件..." -ForegroundColor Yellow

if (Test-Path $privateKey) {
    Write-Host "✅ 私钥存在: $privateKey" -ForegroundColor Green
    $keySize = (Get-Item $privateKey).Length
    Write-Host "   文件大小: $keySize 字节" -ForegroundColor Gray
} else {
    Write-Host "❌ 私钥不存在: $privateKey" -ForegroundColor Red
    exit 1
}

if (Test-Path $publicKey) {
    Write-Host "✅ 公钥存在: $publicKey" -ForegroundColor Green
    Write-Host "   公钥内容:" -ForegroundColor Gray
    $pubKeyContent = Get-Content $publicKey
    Write-Host "   $pubKeyContent" -ForegroundColor Gray
} else {
    Write-Host "❌ 公钥不存在: $publicKey" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "连接参数:" -ForegroundColor Yellow
Write-Host "  服务器: $ServerUser@$ServerIP:$ServerPort" -ForegroundColor Gray
Write-Host "  私钥: $privateKey" -ForegroundColor Gray

Write-Host ""
Write-Host "测试SSH连接..." -ForegroundColor Yellow

# 构建SSH命令
$sshCommand = "ssh -o ConnectTimeout=10 -o BatchMode=yes -i `"$privateKey`" -p $ServerPort $ServerUser@$ServerIP `"echo 'SSH连接测试成功'`""

Write-Host "执行命令: $sshCommand" -ForegroundColor Gray
Write-Host ""

try {
    # 执行SSH连接测试
    $result = Invoke-Expression $sshCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH连接成功!" -ForegroundColor Green
        Write-Host "服务器响应: $result" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 你的SSH配置是正确的!" -ForegroundColor Green
        Write-Host ""
        Write-Host "GitHub Secrets配置:" -ForegroundColor Cyan
        Write-Host "SERVER_HOST: $ServerIP" -ForegroundColor Gray
        Write-Host "SERVER_USER: $ServerUser" -ForegroundColor Gray
        Write-Host "SERVER_PORT: $ServerPort" -ForegroundColor Gray
        Write-Host "SERVER_KEY: (复制下面的私钥内容)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "=== 私钥内容 (复制到GitHub Secrets的SERVER_KEY) ===" -ForegroundColor Yellow
        Get-Content $privateKey
        Write-Host "=== 私钥内容结束 ===" -ForegroundColor Yellow
    } else {
        Write-Host "❌ SSH连接失败!" -ForegroundColor Red
        Write-Host "错误信息: $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "可能的原因:" -ForegroundColor Yellow
        Write-Host "1. 公钥没有添加到服务器的 ~/.ssh/authorized_keys" -ForegroundColor Gray
        Write-Host "2. 服务器IP地址错误: $ServerIP" -ForegroundColor Gray
        Write-Host "3. SSH端口不正确: $ServerPort" -ForegroundColor Gray
        Write-Host "4. 服务器防火墙阻止SSH连接" -ForegroundColor Gray
        Write-Host "5. SSH服务没有运行" -ForegroundColor Gray
        Write-Host ""
        Write-Host "解决步骤:" -ForegroundColor Cyan
        Write-Host "1. 登录服务器 (通过密码或控制台)" -ForegroundColor Gray
        Write-Host "2. 执行以下命令:" -ForegroundColor Gray
        Write-Host "   mkdir -p ~/.ssh" -ForegroundColor White
        Write-Host "   chmod 700 ~/.ssh" -ForegroundColor White
        Write-Host "   echo `"$pubKeyContent`" >> ~/.ssh/authorized_keys" -ForegroundColor White
        Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
        Write-Host "3. 重新运行此测试脚本" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 执行SSH命令时出错: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "测试完成。" -ForegroundColor Cyan
