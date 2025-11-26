#!/bin/bash

# 自动检测变更的应用并构建部署
# 使用 Turbo 的变更检测功能，只构建和部署被修改的应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 应用名称映射（Turbo 包名 -> 应用名称）
declare -A APP_MAP=(
    ["system-app"]="system-app"
    ["admin-app"]="admin-app"
    ["logistics-app"]="logistics-app"
    ["quality-app"]="quality-app"
    ["production-app"]="production-app"
    ["engineering-app"]="engineering-app"
    ["finance-app"]="finance-app"
    ["mobile-app"]="mobile-app"
)

# 所有应用列表
ALL_APPS=("system-app" "admin-app" "logistics-app" "quality-app" "production-app" "engineering-app" "finance-app" "mobile-app")

# 解析命令行参数
FORCE_ALL=false
BASE_REF=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force-all)
            FORCE_ALL=true
            shift
            ;;
        --base)
            BASE_REF="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --force-all        强制构建和部署所有应用（忽略变更检测）"
            echo "  --base <ref>       指定基准 Git 引用（可选，用于检测相对于该引用的变更）"
            echo "  --dry-run          仅显示将要构建和部署的应用，不实际执行"
            echo "  --help, -h         显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                  # 检测变更并部署"
            echo "  $0 --force-all      # 部署所有应用"
            echo "  $0 --base origin/master  # 相对于 origin/master 检测变更"
            echo "  $0 --dry-run        # 仅查看将要部署的应用"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 检测变更的应用（基于工作区变更，不需要提交）
detect_changed_apps() {
    local changed_apps=()
    
    if [ "$FORCE_ALL" = true ]; then
        log_info "强制模式：将构建和部署所有应用"
        changed_apps=("${ALL_APPS[@]}")
        return 0
    fi
    
    log_info "检测工作区变更的应用（无需提交）..."
    
    # 获取工作区变更的文件列表（未暂存 + 已暂存但未提交）
    local changed_files=""
    
    # 检测未暂存的变更
    local unstaged_files
    unstaged_files=$(git diff --name-only 2>/dev/null || echo "")
    
    # 检测已暂存但未提交的变更
    local staged_files
    staged_files=$(git diff --cached --name-only 2>/dev/null || echo "")
    
    # 合并所有变更的文件
    if [ -n "$unstaged_files" ] && [ -n "$staged_files" ]; then
        changed_files=$(echo -e "$unstaged_files\n$staged_files" | sort -u)
    elif [ -n "$unstaged_files" ]; then
        changed_files="$unstaged_files"
    elif [ -n "$staged_files" ]; then
        changed_files="$staged_files"
    fi
    
    # 如果指定了基准引用，也检测相对于基准的变更
    if [ -n "$BASE_REF" ]; then
        log_info "同时检测相对于 $BASE_REF 的变更..."
        local base_changed_files
        base_changed_files=$(git diff --name-only "$BASE_REF" HEAD 2>/dev/null || echo "")
        if [ -n "$base_changed_files" ]; then
            if [ -n "$changed_files" ]; then
                changed_files=$(echo -e "$changed_files\n$base_changed_files" | sort -u)
            else
                changed_files="$base_changed_files"
            fi
        fi
    fi
    
    if [ -z "$changed_files" ]; then
        log_warning "未检测到变更的文件（工作区或暂存区）"
        log_info "提示: 使用 --force-all 强制部署所有应用"
        return 0
    fi
    
    log_info "检测到变更的文件:"
    echo "$changed_files" | while read -r file; do
        if [ -n "$file" ]; then
            echo "  - $file"
        fi
    done
    
    # 检测受影响的应用
    for app in "${ALL_APPS[@]}"; do
        local app_dir="apps/$app"
        local should_build=false
        
        # 检查应用目录或其依赖是否被修改
        while IFS= read -r file; do
            if [ -z "$file" ]; then
                continue
            fi
            
            # 直接修改了应用目录
            if [[ "$file" == apps/$app/* ]] || [[ "$file" == apps/$app ]]; then
                should_build=true
                break
            fi
            
            # 修改了共享包（所有应用都可能受影响）
            if [[ "$file" == packages/* ]] || [[ "$file" == configs/* ]] || [[ "$file" == scripts/* ]]; then
                should_build=true
                break
            fi
            
            # 修改了根配置文件（所有应用都可能受影响）
            if [[ "$file" == turbo.json ]] || [[ "$file" == package.json ]] || [[ "$file" == pnpm-workspace.yaml ]] || [[ "$file" == tsconfig.json ]]; then
                should_build=true
                break
            fi
        done <<< "$changed_files"
        
        if [ "$should_build" = true ]; then
            changed_apps+=("$app")
        fi
    done
    
    # 如果没有检测到变更的应用，但检测到了变更的文件，可能是共享包的变更
    # 在这种情况下，构建所有应用
    if [ ${#changed_apps[@]} -eq 0 ] && [ -n "$changed_files" ]; then
        log_warning "检测到变更但无法确定受影响的应用，将构建所有应用"
        changed_apps=("${ALL_APPS[@]}")
    fi
    
    echo "${changed_apps[@]}"
}

# 使用 Turbo 检测变更（基于文件系统时间戳和缓存）
detect_changed_apps_with_turbo() {
    local changed_apps=()
    
    log_info "使用 Turbo 检测需要构建的应用（基于文件系统变更）..."
    
    # 检查 turbo 是否可用
    local turbo_cmd="node scripts/turbo.js"
    if command -v turbo > /dev/null 2>&1; then
        turbo_cmd="turbo"
    elif ! $turbo_cmd --version > /dev/null 2>&1; then
        log_warning "Turbo 不可用，使用 Git diff 方法"
        return 1
    fi
    
    # 使用 turbo run build --dry-run=json 获取需要构建的包
    # Turbo 会基于文件系统时间戳和缓存来判断哪些包需要构建
    log_info "运行 Turbo dry-run 检测..."
    local turbo_output
    turbo_output=$($turbo_cmd run build --dry-run=json 2>/dev/null || echo "")
    
    if [ -z "$turbo_output" ]; then
        log_warning "无法获取 Turbo 输出，回退到 Git diff 方法"
        return 1
    fi
    
    # 解析 JSON 输出，提取需要构建的应用
    # Turbo 的 JSON 输出格式：{"tasks": [{"taskId": "app-name#build", "package": "app-name", ...}, ...]}
    # 需要安装 jq 来解析 JSON，如果没有则使用 grep 简单匹配
    if command -v jq > /dev/null 2>&1; then
        # 使用 jq 解析 JSON
        local packages
        packages=$(echo "$turbo_output" | jq -r '.tasks[]? | select(.taskId | endswith("#build")) | .package' 2>/dev/null || echo "")
        
        while IFS= read -r package; do
            if [ -n "$package" ]; then
                # 检查是否是应用包
                for app in "${ALL_APPS[@]}"; do
                    if [[ "$package" == "$app" ]] || [[ "$package" == *"$app"* ]]; then
                        # 避免重复添加
                        local found=false
                        for existing in "${changed_apps[@]}"; do
                            if [ "$existing" == "$app" ]; then
                                found=true
                                break
                            fi
                        done
                        if [ "$found" = false ]; then
                            changed_apps+=("$app")
                        fi
                        break
                    fi
                done
            fi
        done <<< "$packages"
    else
        # 如果没有 jq，使用 grep 简单匹配应用名称
        for app in "${ALL_APPS[@]}"; do
            if echo "$turbo_output" | grep -q "\"$app#build\"" || echo "$turbo_output" | grep -q "\"package\":\"$app\""; then
                changed_apps+=("$app")
            fi
        done
    fi
    
    if [ ${#changed_apps[@]} -gt 0 ]; then
        log_info "Turbo 检测到需要构建的应用: ${changed_apps[*]}"
        echo "${changed_apps[@]}"
        return 0
    fi
    
    return 1
}

# 主函数
main() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 自动检测变更并构建部署"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检测变更的应用
    # 优先使用 Turbo 检测（基于文件系统），如果失败则使用 Git diff
    local changed_apps
    if ! changed_apps=($(detect_changed_apps_with_turbo 2>/dev/null)); then
        log_info "Turbo 检测失败，使用 Git diff 方法..."
        if ! changed_apps=($(detect_changed_apps)); then
            log_error "检测变更失败"
            exit 1
        fi
    fi
    
    if [ ${#changed_apps[@]} -eq 0 ]; then
        log_warning "未检测到需要构建和部署的应用"
        log_info "提示: 使用 --force-all 强制部署所有应用"
        exit 0
    fi
    
    log_success "检测到 ${#changed_apps[@]} 个需要构建和部署的应用:"
    for app in "${changed_apps[@]}"; do
        echo "  - $app"
    done
    
    if [ "$DRY_RUN" = true ]; then
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "✅ 预览模式：将构建和部署以下应用"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        for app in "${changed_apps[@]}"; do
            echo "  - $app"
        done
        exit 0
    fi
    
    log_info ""
    log_info "开始构建和部署..."
    log_info ""
    
    # 为每个应用执行构建和部署
    local success_count=0
    local fail_count=0
    local failed_apps=()
    
    for app in "${changed_apps[@]}"; do
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "📦 构建和部署: $app"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if bash "$SCRIPT_DIR/build-and-push-local.sh" "$app" --auto-deploy; then
            log_success "✅ $app 构建和部署成功"
            ((success_count++))
        else
            log_error "❌ $app 构建和部署失败"
            ((fail_count++))
            failed_apps+=("$app")
        fi
        
        log_info ""
    done
    
    # 输出总结
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "📊 构建和部署总结"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "总计: ${#changed_apps[@]} 个应用"
    log_success "成功: $success_count 个"
    if [ $fail_count -gt 0 ]; then
        log_error "失败: $fail_count 个"
        log_error "失败的应用: ${failed_apps[*]}"
    fi
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ $fail_count -gt 0 ]; then
        exit 1
    fi
}

# 运行主函数
main

