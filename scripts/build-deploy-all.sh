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
            echo "  --base <ref>       指定基准 Git 引用（默认: HEAD~1 或 origin/master）"
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

# 检测变更的应用
detect_changed_apps() {
    local changed_apps=()
    
    if [ "$FORCE_ALL" = true ]; then
        log_info "强制模式：将构建和部署所有应用"
        changed_apps=("${ALL_APPS[@]}")
        return 0
    fi
    
    log_info "检测变更的应用..."
    
    # 确定基准引用
    local base_ref="$BASE_REF"
    if [ -z "$base_ref" ]; then
        # 尝试使用 origin/master（如果存在）
        if git rev-parse --verify origin/master > /dev/null 2>&1; then
            base_ref="origin/master"
        # 否则使用 HEAD~1
        elif git rev-parse --verify HEAD~1 > /dev/null 2>&1; then
            base_ref="HEAD~1"
        else
            log_warning "无法确定基准引用，将使用 --force-all 模式"
            changed_apps=("${ALL_APPS[@]}")
            return 0
        fi
    fi
    
    log_info "基准引用: $base_ref"
    
    # 获取变更的文件列表
    local changed_files
    changed_files=$(git diff --name-only "$base_ref" HEAD 2>/dev/null || echo "")
    
    if [ -z "$changed_files" ]; then
        log_warning "未检测到变更的文件"
        return 0
    fi
    
    log_info "变更的文件:"
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

# 使用 Turbo 检测变更（备用方法）
detect_changed_apps_with_turbo() {
    local changed_apps=()
    
    log_info "使用 Turbo 检测变更的应用..."
    
    # 检查 turbo 是否可用
    if ! command -v turbo > /dev/null 2>&1 && ! node scripts/turbo.js --version > /dev/null 2>&1; then
        log_warning "Turbo 不可用，使用 Git diff 方法"
        return 1
    fi
    
    # 使用 turbo run build --dry-run=json 获取需要构建的应用
    # 注意：这需要 Turbo 能够检测到变更
    local turbo_cmd="node scripts/turbo.js"
    if command -v turbo > /dev/null 2>&1; then
        turbo_cmd="turbo"
    fi
    
    # 尝试获取需要构建的应用列表
    # Turbo 的 --dry-run=json 输出包含需要执行的任务
    local turbo_output
    turbo_output=$($turbo_cmd run build --dry-run=json 2>/dev/null || echo "")
    
    if [ -z "$turbo_output" ]; then
        log_warning "无法使用 Turbo 检测变更，回退到 Git diff 方法"
        return 1
    fi
    
    # 解析 Turbo 输出（简化版，实际可能需要更复杂的 JSON 解析）
    # 这里我们主要使用 Git diff 方法，Turbo 方法作为备用
    
    return 1
}

# 主函数
main() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 自动检测变更并构建部署"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检测变更的应用
    local changed_apps
    if ! changed_apps=($(detect_changed_apps)); then
        log_error "检测变更失败"
        exit 1
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

