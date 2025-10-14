# 文档创建脚本
# 用法: .\scripts\new-doc.ps1 -Type adr -Name "my-decision"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("adr", "rfc", "sop", "runbook")]
    [string]$Type,
    
    [Parameter(Mandatory=$true)]
    [string]$Name
)

$date = Get-Date -Format "yyyy-MM-dd"

# 根据类型确定文件名
if ($Type -eq "adr" -or $Type -eq "rfc") {
    $fileName = "$date-$Name.md"
} else {
    $fileName = "$Name.md"
}

$targetPath = "docs\$Type\$fileName"
$templatePath = "docs\templates\$Type-template.md"

# 检查目标文件是否存在
if (Test-Path $targetPath) {
    Write-Host "❌ 文件已存在: $targetPath" -ForegroundColor Red
    Write-Host "提示：请更新现有文档，不要创建重复文档" -ForegroundColor Yellow
    exit 1
}

# 检查模板是否存在
if (!(Test-Path $templatePath)) {
    Write-Host "❌ 模板不存在: $templatePath" -ForegroundColor Red
    exit 1
}

# 复制模板
Copy-Item -Path $templatePath -Destination $targetPath

Write-Host "✅ 已创建文档: $targetPath" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 编辑文件，填写 Front-Matter" -ForegroundColor White
Write-Host "2. 填写内容（注意长度限制）" -ForegroundColor White
Write-Host "3. 检查是否符合规范" -ForegroundColor White
Write-Host ""
Write-Host "打开文件:" -ForegroundColor Cyan
Write-Host "  code $targetPath" -ForegroundColor White

