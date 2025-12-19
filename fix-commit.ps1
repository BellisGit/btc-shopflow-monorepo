# 读取现有的提交信息模板（如果有）
$template = if (Test-Path "COMMIT_EDITMSG") { Get-Content "COMMIT_EDITMSG" -Raw } else { "" }

# 写入正确的中文提交信息
$msg = "fix: 修复健康检查和构建依赖问题"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("COMMIT_EDITMSG", $msg, $utf8NoBom)
