#!/bin/bash

# 测试脚本：检查 GITHUB_TOKEN 是否能被正确读取

echo "=== Testing GITHUB_TOKEN Detection ==="
echo ""

# 方法1: 检查当前环境变量
echo "1. Current environment variable:"
if [ -n "$GITHUB_TOKEN" ]; then
    echo "   ✓ GITHUB_TOKEN is set (length: ${#GITHUB_TOKEN})"
else
    echo "   ✗ GITHUB_TOKEN is not set in current environment"
fi
echo ""

# 方法2: 尝试从 Git 凭据管理器获取
echo "2. Trying Git Credential Manager:"
if command -v git-credential-manager > /dev/null 2>&1; then
    TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
    if [ -n "$TOKEN" ]; then
        echo "   ✓ Found token from Git Credential Manager (length: ${#TOKEN})"
    else
        echo "   ✗ No token found in Git Credential Manager"
    fi
else
    echo "   ✗ Git Credential Manager not found"
fi
echo ""

# 方法3: 尝试从 PowerShell 读取用户级环境变量
echo "3. Trying PowerShell to read User environment variable:"
if command -v powershell.exe > /dev/null 2>&1; then
    PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
    echo "   Raw PowerShell output:"
    echo "   ---"
    echo "$PS_OUTPUT" | head -10 | sed 's/^/   /'
    echo "   ---"
    
    TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
    
    if [ -n "$TOKEN" ] && [ -n "${TOKEN// }" ]; then
        if echo "$TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
            echo "   ✗ PowerShell returned error message"
        else
            echo "   ✓ Found token from PowerShell (length: ${#TOKEN})"
            echo "   First 10 chars: ${TOKEN:0:10}..."
        fi
    else
        echo "   ✗ No token found or empty result"
    fi
else
    echo "   ✗ PowerShell not found"
fi
echo ""

# 总结
echo "=== Summary ==="
FINAL_TOKEN=""
if [ -n "$GITHUB_TOKEN" ]; then
    FINAL_TOKEN="$GITHUB_TOKEN"
elif [ -n "$TOKEN" ] && ! echo "$TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
    FINAL_TOKEN="$TOKEN"
fi

if [ -n "$FINAL_TOKEN" ] && [ -n "${FINAL_TOKEN// }" ]; then
    echo "✓ GITHUB_TOKEN is available (length: ${#FINAL_TOKEN})"
    exit 0
else
    echo "✗ GITHUB_TOKEN is NOT available"
    echo ""
    echo "To set it, run in PowerShell:"
    echo "  [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')"
    echo "  . scripts/refresh-env.ps1"
    exit 1
fi



