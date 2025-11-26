# 修复 SSH 密钥权限
$key = "$env:USERPROFILE\.ssh\github_actions_key"
icacls $key /inheritance:r
icacls $key /grant:r "$env:USERNAME:(R)"
icacls $key

