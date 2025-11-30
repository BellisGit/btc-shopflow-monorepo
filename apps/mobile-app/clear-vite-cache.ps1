# 清理 Vite 构建缓存脚本
# 用于确保构建时使用最新的源代码

Write-Host "🧹 正在清理移动端应用的构建缓存..." -ForegroundColor Cyan

$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$distPath = Join-Path $appPath "dist"
$viteCache1 = Join-Path $appPath "node_modules\.vite"
$viteCache2 = Join-Path $appPath ".vite"

$cleaned = 0

# 清理 dist 目录
if (Test-Path $distPath) {
    try {
        Remove-Item -Path $distPath -Recurse -Force
        Write-Host "  ✓ 已清理构建产物 (dist)" -ForegroundColor Green
        $cleaned++
    } catch {
        Write-Host "  ⚠️  清理 dist 失败: $_" -ForegroundColor Yellow
    }
}

# 清理 node_modules/.vite 缓存
if (Test-Path $viteCache1) {
    try {
        Remove-Item -Path $viteCache1 -Recurse -Force
        Write-Host "  ✓ 已清理 Vite 缓存 (node_modules\.vite)" -ForegroundColor Green
        $cleaned++
    } catch {
        Write-Host "  ⚠️  清理 node_modules\.vite 失败: $_" -ForegroundColor Yellow
    }
}

# 清理 .vite 缓存
if (Test-Path $viteCache2) {
    try {
        Remove-Item -Path $viteCache2 -Recurse -Force
        Write-Host "  ✓ 已清理 Vite 缓存 (.vite)" -ForegroundColor Green
        $cleaned++
    } catch {
        Write-Host "  ⚠️  清理 .vite 失败: $_" -ForegroundColor Yellow
    }
}

if ($cleaned -eq 0) {
    Write-Host "  ℹ️  没有找到需要清理的缓存" -ForegroundColor Gray
} else {
    Write-Host "`n✅ 缓存清理完成！共清理 $cleaned 个目录" -ForegroundColor Green
}

