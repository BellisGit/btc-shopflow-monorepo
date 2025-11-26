#!/bin/bash

# 一次性构建和部署所有应用
# 默认部署所有应用，也可以使用 --changed 参数只部署变更的应用
# 
# 构建方式：
# - 本地构建：在本地串行构建所有应用（较慢）
# - 云端构建：触发 GitHub Actions 并行构建所有应用（推荐，更快）

# 注意：不使用 set -e，因为我们需要在循环中继续执行，即使某个应用构建失败
# 我们会在关键位置手动检查错误

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
DEPLOY_CHANGED=false
BASE_REF=""
DRY_RUN=false
USE_CLOUD_BUILD=false  # 默认使用本地构建（更快，利用本地缓存）

while [[ $# -gt 0 ]]; do
    case $1 in
        --changed)
            DEPLOY_CHANGED=true
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
        --local)
            USE_CLOUD_BUILD=false
            shift
            ;;
        --cloud)
            USE_CLOUD_BUILD=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --changed          只构建和部署变更的应用（默认：部署所有应用）"
            echo "  --base <ref>       指定基准 Git 引用（仅与 --changed 一起使用）"
            echo "  --dry-run          仅显示将要构建和部署的应用，不实际执行"
            echo "  --local            在本地构建（默认，利用本地缓存，更快）"
            echo "  --cloud            在 GitHub Actions 构建（并行，但需要安装依赖）"
            echo "  --help, -h         显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                  # 使用云端构建部署所有应用（推荐）"
            echo "  $0 --local          # 在本地构建部署所有应用"
            echo "  $0 --changed        # 只部署变更的应用（云端构建）"
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
# 注意：Turbo 的 --dry-run=json 会列出所有任务，我们需要使用文本输出来判断实际会执行的任务
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
    
    # 使用 turbo run build --dry-run 获取文本输出（更可靠）
    # 文本输出会显示实际会执行的任务
    log_info "运行 Turbo dry-run 检测..."
    # 将 stderr 重定向到 /dev/null，避免日志干扰
    local turbo_output
    turbo_output=$($turbo_cmd run build --dry-run 2>/dev/null || echo "")
    
    if [ -z "$turbo_output" ]; then
        log_warning "无法获取 Turbo 输出，回退到 Git diff 方法"
        return 1
    fi
    
    # 从文本输出中提取应用名称
    # Turbo 的输出格式类似：• Packages in scope: system-app, admin-app, ...
    # 或者：• Tasks to run: system-app#build, admin-app#build, ...
    # 我们查找包含应用名称和 #build 的行
    for app in "${ALL_APPS[@]}"; do
        # 检查输出中是否包含该应用的构建任务
        # 匹配格式：app-name#build 或 "app-name#build" 或 app-name (在任务列表中)
        # 使用更精确的匹配，避免匹配到日志信息
        if echo "$turbo_output" | grep -qE "(^|[[:space:]])$app#build([[:space:]]|$|\")|(^|[[:space:]])$app([[:space:]]|$)" 2>/dev/null; then
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
        fi
    done
    
    if [ ${#changed_apps[@]} -gt 0 ]; then
        log_info "Turbo 检测到需要构建的应用: ${changed_apps[*]}"
        # 只输出应用名称，不输出日志（通过重定向 stderr 到 /dev/null）
        echo "${changed_apps[@]}" >&1
        return 0
    fi
    
    # 如果没有检测到，可能是所有应用都需要构建（共享包变更）
    # 或者没有变更。这里我们返回失败，让调用者使用 Git diff 方法
    log_info "Turbo 未检测到需要构建的应用"
    return 1
}

# 主函数
main() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 构建和部署所有应用"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local changed_apps=()
    
    # 如果指定了 --changed，则检测变更的应用
    if [ "$DEPLOY_CHANGED" = true ]; then
        log_info "检测变更的应用..."
        
        # 优先使用 Turbo 检测（基于文件系统），如果失败则使用 Git diff
        local changed_apps_raw
        
        # 调用检测函数，将 stderr 重定向到 /dev/null，只捕获 stdout（应用名称）
        if ! changed_apps_raw=$(detect_changed_apps_with_turbo 2>/dev/null); then
            log_info "Turbo 检测失败，使用 Git diff 方法..."
            if ! changed_apps_raw=$(detect_changed_apps 2>/dev/null); then
                log_error "检测变更失败"
                exit 1
            fi
        fi
        
        # 解析返回的应用名称数组（过滤掉空字符串和日志信息）
        if [ -n "$changed_apps_raw" ]; then
            while IFS= read -r app_name; do
                # 过滤掉空字符串、日志标记、ANSI 颜色代码等
                if [ -n "$app_name" ] && [[ "$app_name" != *"[INFO]"* ]] && [[ "$app_name" != *"[SUCCESS]"* ]] && [[ "$app_name" != *"[WARNING]"* ]] && [[ "$app_name" != *"[ERROR]"* ]] && [[ "$app_name" =~ ^[a-z-]+-app$ ]]; then
                    # 避免重复添加
                    local found=false
                    for existing in "${changed_apps[@]}"; do
                        if [ "$existing" == "$app_name" ]; then
                            found=true
                            break
                        fi
                    done
                    if [ "$found" = false ]; then
                        changed_apps+=("$app_name")
                    fi
                fi
            done <<< "$changed_apps_raw"
        fi
        
        if [ ${#changed_apps[@]} -eq 0 ]; then
            log_warning "未检测到需要构建和部署的应用"
            log_info "提示: 不使用 --changed 参数将部署所有应用"
            exit 0
        fi
        
        log_success "检测到 ${#changed_apps[@]} 个需要构建和部署的应用:"
        for app in "${changed_apps[@]}"; do
            echo "  - $app"
        done
    else
        # 默认：部署所有应用
        log_info "将构建和部署所有应用:"
        changed_apps=("${ALL_APPS[@]}")
        for app in "${changed_apps[@]}"; do
            echo "  - $app"
        done
    fi
    
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
    
    # 判断是否使用云端构建（GitHub Actions）
    # 如果部署所有应用（8个）且未指定 --local，使用云端构建
    local use_cloud_build=$USE_CLOUD_BUILD
    local use_bulk_deploy=false
    
    if [ ${#changed_apps[@]} -eq 8 ]; then
        # 检查是否包含所有应用
        local all_present=true
        for required_app in "${ALL_APPS[@]}"; do
            local found=false
            for app in "${changed_apps[@]}"; do
                if [ "$app" == "$required_app" ]; then
                    found=true
                    break
                fi
            done
            if [ "$found" = false ]; then
                all_present=false
                break
            fi
        done
        if [ "$all_present" = true ]; then
            use_bulk_deploy=true
        fi
    fi
    
    # 如果使用云端构建，触发 GitHub Actions 工作流
    if [ "$use_cloud_build" = true ] && [ "$use_bulk_deploy" = true ]; then
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "☁️  使用云端构建（GitHub Actions 并行构建）"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "将触发 GitHub Actions 并行构建所有应用"
        log_info "构建完成后会自动触发全量部署工作流"
        log_info ""
        
        # 获取 GITHUB_TOKEN
        local GITHUB_TOKEN=""
        
        # 方法1: 从环境变量获取
        if [ -n "${GITHUB_TOKEN}" ]; then
            GITHUB_TOKEN="${GITHUB_TOKEN}"
        fi
        
        # 方法2: 从 Git 凭据管理器获取
        if [ -z "$GITHUB_TOKEN" ] && command -v git-credential-manager > /dev/null 2>&1; then
            GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
        fi
        
        # 方法3: 从 Windows 用户级环境变量获取（通过 PowerShell）
        if [ -z "$GITHUB_TOKEN" ]; then
            IS_WINDOWS=false
            if [ -n "$WINDIR" ] || [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || [ "$OSTYPE" = "win32" ]; then
                IS_WINDOWS=true
            fi
            
            if [ "$IS_WINDOWS" = "true" ] || command -v powershell.exe > /dev/null 2>&1; then
                if command -v powershell.exe > /dev/null 2>&1; then
                    PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
                    GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
                    if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
                        GITHUB_TOKEN=""
                    fi
                    if [ -z "${GITHUB_TOKEN// }" ]; then
                        GITHUB_TOKEN=""
                    fi
                fi
            fi
        fi
        
        if [ -z "$GITHUB_TOKEN" ]; then
            log_error "未设置 GITHUB_TOKEN 环境变量，无法触发云端构建"
            log_info "请设置 GITHUB_TOKEN 环境变量，或使用 --local 参数在本地构建"
            exit 1
        fi
        
        local GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
        local GIT_SHA=$(git rev-parse HEAD | cut -c1-7 || echo "latest")
        
        log_info "触发云端构建工作流: build-all-apps.yml"
        log_info "仓库: $GITHUB_REPO"
        log_info "镜像标签: $GIT_SHA"
        
        local REPO_DISPATCH_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/$GITHUB_REPO/dispatches" \
            -d "{\"event_type\":\"build-all-apps\",\"client_payload\":{\"github_sha\":\"$GIT_SHA\"}}" 2>&1)
        
        local REPO_DISPATCH_HTTP_CODE=$(echo "$REPO_DISPATCH_RESPONSE" | tail -n1)
        local REPO_DISPATCH_BODY=$(echo "$REPO_DISPATCH_RESPONSE" | sed '$d')
        
        if [ "$REPO_DISPATCH_HTTP_CODE" -eq 204 ]; then
            log_success "✅ 云端构建工作流已触发 (HTTP 204)"
            log_info "可以在 GitHub Actions 页面查看构建进度:"
            log_info "  https://github.com/$GITHUB_REPO/actions/workflows/build-all-apps.yml"
            log_info ""
            log_info "构建完成后会自动触发全量部署工作流"
            exit 0
        else
            log_error "❌ 云端构建工作流触发失败 (HTTP $REPO_DISPATCH_HTTP_CODE)"
            if [ -n "$REPO_DISPATCH_BODY" ]; then
                log_error "响应: $REPO_DISPATCH_BODY"
            fi
            log_info ""
            log_info "提示: 使用 --local 参数在本地构建"
            exit 1
        fi
    fi
    
    # 本地构建模式
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "💻 使用本地构建（串行构建）"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "提示: 使用云端构建（默认）可以并行构建，速度更快"
    log_info "      运行 '$0 --cloud' 使用云端构建"
    log_info ""
    log_info "开始构建和部署..."
    log_info ""
    
    if [ "$use_bulk_deploy" = true ]; then
        # 使用全量部署工作流：先构建和推送所有镜像，然后触发一次全量部署工作流
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "📦 步骤 1: 构建和推送所有应用镜像"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        local build_success_count=0
        local build_fail_count=0
        local build_failed_apps=()
        
        for app in "${changed_apps[@]}"; do
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "📦 构建和推送: $app"
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            # 构建并推送镜像（不使用 --auto-deploy，因为后面会统一触发全量部署工作流）
            # 使用 set +e 临时禁用错误退出，确保即使构建失败也继续下一个应用
            set +e
            bash "$SCRIPT_DIR/build-and-push-local.sh" "$app"
            BUILD_EXIT_CODE=$?
            set +e  # 保持禁用错误退出，直到循环结束
            
            if [ $BUILD_EXIT_CODE -eq 0 ]; then
                log_success "✅ $app 镜像构建和推送成功"
                build_success_count=$((build_success_count + 1))
            else
                log_error "❌ $app 镜像构建和推送失败 (退出码: $BUILD_EXIT_CODE)"
                build_fail_count=$((build_fail_count + 1))
                build_failed_apps+=("$app")
                log_warning "继续构建下一个应用..."
            fi
            log_info ""
        done
        
        # 循环结束后，重新启用错误退出（仅用于关键步骤）
        set -e
        
        if [ $build_fail_count -gt 0 ]; then
            log_error "部分应用镜像构建失败，无法继续全量部署"
            log_error "失败的应用: ${build_failed_apps[*]}"
            exit 1
        fi
        
        log_info ""
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "📦 步骤 2: 触发全量部署工作流"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 触发全量部署工作流
        # 获取 GITHUB_TOKEN（使用与 build-and-push-local.sh 相同的完整逻辑）
        local GITHUB_TOKEN=""
        
        # 方法1: 从环境变量获取（如果已经设置）
        if [ -n "${GITHUB_TOKEN}" ]; then
            GITHUB_TOKEN="${GITHUB_TOKEN}"
        fi
        
        # 方法2: 从 Git 凭据管理器获取
        if [ -z "$GITHUB_TOKEN" ] && command -v git-credential-manager > /dev/null 2>&1; then
            GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
        fi
        
        # 方法3: 从 Windows 用户级环境变量获取（通过 PowerShell）
        if [ -z "$GITHUB_TOKEN" ]; then
            # 检测是否为 Windows 环境
            IS_WINDOWS=false
            if [ -n "$WINDIR" ] || [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || [ "$OSTYPE" = "win32" ]; then
                IS_WINDOWS=true
            fi
            
            # 如果检测到 Windows 或者 PowerShell 可用，尝试读取
            if [ "$IS_WINDOWS" = "true" ] || command -v powershell.exe > /dev/null 2>&1; then
                if command -v powershell.exe > /dev/null 2>&1; then
                    # 使用和 build-and-push-local.sh 完全相同的命令
                    PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
                    # 清理输出：移除回车符、换行符和可能的 PowerShell 提示符
                    GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
                    # 如果读取成功但包含错误信息，清空变量
                    if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
                        GITHUB_TOKEN=""
                    fi
                    # 如果结果为空或只包含空白字符，清空变量
                    if [ -z "${GITHUB_TOKEN// }" ]; then
                        GITHUB_TOKEN=""
                    fi
                fi
            fi
        fi
        
        if [ -z "$GITHUB_TOKEN" ]; then
            log_error "未设置 GITHUB_TOKEN 环境变量，无法触发全量部署工作流"
            log_info "请设置 GITHUB_TOKEN 环境变量后重试"
            exit 1
        fi
        
        local GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
        local GIT_SHA=$(git rev-parse HEAD | cut -c1-7 || echo "latest")
        
        log_info "触发全量部署工作流: deploy-all-apps.yml"
        log_info "仓库: $GITHUB_REPO"
        log_info "镜像标签: $GIT_SHA"
        
        local REPO_DISPATCH_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/$GITHUB_REPO/dispatches" \
            -d "{\"event_type\":\"deploy-all-apps\",\"client_payload\":{\"github_sha\":\"$GIT_SHA\",\"image_tag\":\"ghcr.io/$(echo $GITHUB_REPO | tr '[:upper:]' '[:lower:]')/system-app:$GIT_SHA\"}}" 2>&1)
        
        local REPO_DISPATCH_HTTP_CODE=$(echo "$REPO_DISPATCH_RESPONSE" | tail -n1)
        local REPO_DISPATCH_BODY=$(echo "$REPO_DISPATCH_RESPONSE" | sed '$d')
        
        if [ "$REPO_DISPATCH_HTTP_CODE" -eq 204 ]; then
            log_success "✅ 全量部署工作流已触发 (HTTP 204)"
            log_info "可以在 GitHub Actions 页面查看部署进度:"
            log_info "  https://github.com/$GITHUB_REPO/actions/workflows/deploy-all-apps.yml"
        else
            log_error "❌ 全量部署工作流触发失败 (HTTP $REPO_DISPATCH_HTTP_CODE)"
            if [ -n "$REPO_DISPATCH_BODY" ]; then
                log_error "响应: $REPO_DISPATCH_BODY"
            fi
            exit 1
        fi
    else
        # 逐个部署：为每个应用执行构建和部署
        local success_count=0
        local fail_count=0
        local failed_apps=()
        
        for app in "${changed_apps[@]}"; do
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "📦 构建和部署: $app"
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            # 使用 set +e 临时禁用错误退出，确保即使构建失败也继续下一个应用
            set +e
            bash "$SCRIPT_DIR/build-and-push-local.sh" "$app" --auto-deploy
            BUILD_EXIT_CODE=$?
            set +e  # 保持禁用错误退出，直到循环结束
            
            if [ $BUILD_EXIT_CODE -eq 0 ]; then
                log_success "✅ $app 构建和部署成功"
                success_count=$((success_count + 1))
            else
                log_error "❌ $app 构建和部署失败 (退出码: $BUILD_EXIT_CODE)"
                fail_count=$((fail_count + 1))
                failed_apps+=("$app")
                log_warning "继续构建下一个应用..."
            fi
            
            log_info ""
        done
        
        # 循环结束后，重新启用错误退出（仅用于关键步骤）
        set -e
        
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
    fi
}

# 运行主函数
main

