$env:SERVER_HOST = "47.112.31.96"
$env:SERVER_USER = "root"
$env:SERVER_PORT = "22"
$env:REMOTE_PATH = "/www/wwwroot/btc-shopflow-monorepo"
$env:SSH_KEY = "C:\Users\mlu\.ssh\github_actions_key"
# Uncomment and set your GitHub Personal Access Token to enable automatic workflow triggering
# $env:GITHUB_TOKEN = "your_github_personal_access_token_here"

Write-Host "Server configuration loaded:" -ForegroundColor Green
Write-Host "  SERVER_HOST: $env:SERVER_HOST"
Write-Host "  SERVER_USER: $env:SERVER_USER"
Write-Host "  SERVER_PORT: $env:SERVER_PORT"
Write-Host "  REMOTE_PATH: $env:REMOTE_PATH"
Write-Host "  SSH_KEY: $env:SSH_KEY"

if ($env:DOCKER_HOST) {
    Write-Host "  DOCKER_HOST: $env:DOCKER_HOST"
}

if ($env:GITHUB_TOKEN) {
    $tokenLength = $env:GITHUB_TOKEN.Length
    Write-Host "  GITHUB_TOKEN: Set (length: $tokenLength chars)" -ForegroundColor Green
} else {
    Write-Host "  GITHUB_TOKEN: Not set" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  pnpm deploy:system   - Deploy system app" -ForegroundColor Cyan
Write-Host "  pnpm deploy:admin    - Deploy admin app" -ForegroundColor Cyan
Write-Host "  pnpm deploy:all      - Deploy all apps" -ForegroundColor Cyan
