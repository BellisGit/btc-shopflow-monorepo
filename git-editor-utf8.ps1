param([string]$file)
$msg = "fix: 修复健康检查和构建依赖问题"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $msg, $utf8NoBom)
