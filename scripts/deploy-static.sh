#!/bin/bash

# BTC ShopFlow - 静态文件部署脚本
# 将构建好的 dist 目录直接部署到宝塔面板服务器，无需 Docker
# 支持单应用或批量部署

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

# 配置（从环境变量或参数读取）
SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
DEPLOY_CONFIG="${DEPLOY_CONFIG:-deploy.config.json}"

# 应用列表
APPS=(
    "system-app"
    "admin-app"
    "finance-app"
    "logistics-app"
    "quality-app"
    "production-app"
    "engineering-app"
    "mobile-app"
)

# 显示帮助信息
show_help() {
    cat << EOF
BTC ShopFlow 静态文件部署脚本

用法:
  $0 [选项]

选项:
  --app <name>      部署指定应用（如: admin-app）
  --all             部署所有应用
  --config <file>   指定部署配置文件（默认: deploy.config.json）
  --help            显示此帮助信息

示例:
  $0 --app admin-app
  $0 --all
  $0 --app system-app --config custom.config.json

环境变量:
  SERVER_HOST       服务器地址（必需，GitHub Actions 会自动设置）
  SERVER_USER       服务器用户名（默认: root，GitHub Actions 会自动设置）
  SERVER_PORT       SSH 端口（默认: 22，GitHub Actions 会自动设置）
  SSH_KEY           SSH 私钥路径（默认: ~/.ssh/id_rsa，GitHub Actions 会自动设置）

EOF
}

# 解析参数
DEPLOY_MODE=""
TARGET_APP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --app)
            DEPLOY_MODE="single"
            TARGET_APP="$2"
            shift 2
            ;;
        --all)
            DEPLOY_MODE="all"
            shift
            ;;
        --config)
            DEPLOY_CONFIG="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查必需工具
check_requirements() {
    log_info "检查必需工具..."
    
    if ! command -v rsync &> /dev/null && ! command -v scp &> /dev/null; then
        log_error "需要安装 rsync 或 scp"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "SSH 未安装，请先安装 SSH 客户端"
        exit 1
    fi
    
    log_success "所有必需工具已就绪"
}

# 检查服务器配置
check_server_config() {
    # 如果在 GitHub Actions 环境中，必须配置服务器信息
    if [ -n "$GITHUB_ACTIONS" ]; then
        if [ -z "$SERVER_HOST" ]; then
            log_error "在 GitHub Actions 中，SERVER_HOST 必须从 secrets 设置"
            exit 1
        fi
    else
        # 本地环境：如果没有配置服务器信息，只验证构建产物，不执行部署
        if [ -z "$SERVER_HOST" ]; then
            log_warning "SERVER_HOST 未设置，将只验证构建产物，不执行部署"
            log_info "如需部署，请在 GitHub Actions 中运行，或设置环境变量："
            log_info "  export SERVER_HOST=your-server-ip"
            log_info "  export SERVER_USER=root"
            log_info "  export SERVER_PORT=22"
            log_info "  export SSH_KEY=~/.ssh/id_rsa"
            return 1
        fi
    fi
    
    log_info "服务器配置: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
    
    # 测试 SSH 连接
    log_info "测试 SSH 连接..."
    if ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
        "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" &>/dev/null; then
        log_success "SSH 连接成功"
    else
        log_error "SSH 连接失败，请检查服务器配置和 SSH 密钥"
        exit 1
    fi
}

# 读取部署配置
read_deploy_config() {
    if [ ! -f "$DEPLOY_CONFIG" ]; then
        log_warning "部署配置文件不存在: $DEPLOY_CONFIG"
        log_info "将使用默认部署路径（基于应用名称）"
        log_info "如需自定义路径，请创建配置文件，参考: deploy.config.example.json"
        return 1
    fi
    
    # 检查 jq 是否可用（用于解析 JSON）
    if command -v jq &> /dev/null; then
        log_info "使用 jq 解析配置文件: $DEPLOY_CONFIG"
        return 0
    else
        log_warning "jq 未安装，将使用默认部署路径"
        return 1
    fi
}

# 获取应用的部署路径
get_app_deploy_path() {
    local app_name=$1
    
    if command -v jq &> /dev/null && [ -f "$DEPLOY_CONFIG" ]; then
        local path=$(jq -r ".apps.\"$app_name\".deployPath // empty" "$DEPLOY_CONFIG" 2>/dev/null)
        if [ -n "$path" ] && [ "$path" != "null" ]; then
            echo "$path"
            return 0
        fi
    fi
    
    # 默认路径（基于应用名称）
    case $app_name in
        system-app)
            echo "/www/wwwroot/bellis.com.cn"
            ;;
        admin-app)
            echo "/www/wwwroot/admin.bellis.com.cn"
            ;;
        logistics-app)
            echo "/www/wwwroot/logistics.bellis.com.cn"
            ;;
        quality-app)
            echo "/www/wwwroot/quality.bellis.com.cn"
            ;;
        production-app)
            echo "/www/wwwroot/production.bellis.com.cn"
            ;;
        engineering-app)
            echo "/www/wwwroot/engineering.bellis.com.cn"
            ;;
        finance-app)
            echo "/www/wwwroot/finance.bellis.com.cn"
            ;;
        mobile-app)
            echo "/www/wwwroot/mobile.bellis.com.cn"
            ;;
        *)
            log_warning "未知应用: $app_name，使用默认路径"
            echo "/www/wwwroot/$app_name"
            ;;
    esac
}

# 验证构建产物（不执行部署）
verify_app_build() {
    local app_name=$1
    local app_dir="apps/$app_name"
    local dist_dir="$app_dir/dist"
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "验证应用: $app_name"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查 dist 目录是否存在
    if [ ! -d "$dist_dir" ] || [ -z "$(ls -A "$dist_dir" 2>/dev/null)" ]; then
        log_error "$app_name 的 dist 目录不存在或为空"
        log_info "请先运行: pnpm --filter $app_name build"
        return 1
    fi
    
    log_info "构建产物目录: $dist_dir"
    log_info "文件统计:"
    find "$dist_dir" -type f | wc -l | xargs echo "  总文件数:"
    du -sh "$dist_dir" | awk '{print "  总大小: " $1}'
    log_success "$app_name 构建产物验证通过"
    return 0
}

# 部署单个应用
deploy_app() {
    local app_name=$1
    local app_dir="apps/$app_name"
    local dist_dir="$app_dir/dist"
    local deploy_path=$(get_app_deploy_path "$app_name")
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "部署应用: $app_name"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查 dist 目录是否存在
    if [ ! -d "$dist_dir" ] || [ -z "$(ls -A "$dist_dir" 2>/dev/null)" ]; then
        log_error "$app_name 的 dist 目录不存在或为空"
        log_info "请先运行: pnpm --filter $app_name build"
        return 1
    fi
    
    log_info "构建产物目录: $dist_dir"
    log_info "部署目标路径: $deploy_path"
    
    # SSH 连接参数（优化连接稳定性）
    local ssh_opts="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=60 -o ServerAliveCountMax=3"
    
    # 确保目标目录存在
    log_info "确保目标目录存在..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "mkdir -p $deploy_path" || {
        log_error "无法创建目标目录: $deploy_path"
        return 1
    }
    
    # 在服务器上创建备份
    log_info "创建备份..."
    local backup_dir="/www/backups/$app_name/$(date +%Y%m%d_%H%M%S)"
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "mkdir -p $backup_dir && \
         if [ -d $deploy_path ] && [ -n \"\$(ls -A $deploy_path 2>/dev/null)\" ]; then \
             cp -r $deploy_path/* $backup_dir/ 2>/dev/null || true; \
             echo 'Backup created: $backup_dir'; \
         else \
             echo 'No existing deployment to backup'; \
         fi" || log_warning "备份失败，继续部署"
    
    # 检查服务器上是否有 rsync（更可靠的方法）
    local use_rsync=false
    if command -v rsync &> /dev/null; then
        # 检查服务器上是否也有 rsync
        if ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "command -v rsync" &>/dev/null; then
            use_rsync=true
        fi
    fi
    
    # 同步文件
    if [ "$use_rsync" = true ]; then
        log_info "使用 rsync 同步文件..."
        if rsync -avz --delete \
            -e "ssh $ssh_opts" \
            --exclude='*.map' \
            --exclude='.DS_Store' \
            --timeout=300 \
            "$dist_dir/" \
            "$SERVER_USER@$SERVER_HOST:$deploy_path/"; then
            log_success "文件同步成功"
        else
            log_error "rsync 同步失败，尝试使用 scp..."
            use_rsync=false
        fi
    fi
    
    if [ "$use_rsync" = false ]; then
        # 使用 scp（较慢，但兼容性更好）
        log_info "使用 scp 同步文件..."
        # 先删除远程目录内容（保留目录本身）
        ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
            "rm -rf $deploy_path/* $deploy_path/.[!.]* 2>/dev/null || true"
        
        # 上传文件（使用 tar 压缩传输，更高效）
        log_info "打包并上传文件..."
        cd "$dist_dir" && tar czf - . | ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
            "cd $deploy_path && tar xzf -" || {
            log_error "文件上传失败"
            return 1
        }
        cd - > /dev/null
    fi
    
    # 验证文件是否同步成功
    log_info "验证文件同步..."
    local local_count=$(find "$dist_dir" -type f | wc -l)
    local remote_count=$(ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "find $deploy_path -type f 2>/dev/null | wc -l" || echo "0")
    
    if [ "$remote_count" -lt "$local_count" ]; then
        log_warning "远程文件数量 ($remote_count) 少于本地 ($local_count)，但继续执行"
    else
        log_success "文件同步验证通过（本地: $local_count, 远程: $remote_count）"
    fi
    
    # 设置权限
    log_info "设置文件权限..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "chown -R www:www $deploy_path 2>/dev/null && \
         chmod -R 755 $deploy_path 2>/dev/null && \
         find $deploy_path -type f -exec chmod 644 {} \; 2>/dev/null" || {
        log_warning "权限设置失败，但不影响部署"
    }
    
    log_success "$app_name 部署完成"
    
    # 单个应用部署时立即重载 Nginx
    # 批量部署时将在所有应用完成后统一重载（避免多次重载）
    if [ "$DEPLOY_MODE" != "all" ]; then
        log_info "重载 Nginx 配置..."
        ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" \
            "nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true" || {
            log_warning "Nginx 重载失败，但不影响部署结果"
        }
    fi
    
    return 0
}

# 主函数
main() {
    log_info "🚀 BTC ShopFlow 静态文件部署"
    echo "================================"
    
    # 检查项目目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        log_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    check_requirements
    
    # 检查服务器配置（如果失败，进入验证模式）
    local can_deploy=true
    if ! check_server_config; then
        can_deploy=false
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "进入验证模式：只验证构建产物，不执行部署"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        read_deploy_config || true
    fi
    
    # 根据模式执行部署或验证
    if [ "$DEPLOY_MODE" = "single" ]; then
        if [ -z "$TARGET_APP" ]; then
            log_error "请指定要部署的应用名称"
            exit 1
        fi
        
        # 验证应用名称
        if [[ ! " ${APPS[@]} " =~ " ${TARGET_APP} " ]]; then
            log_error "无效的应用名称: $TARGET_APP"
            log_info "可用应用: ${APPS[*]}"
            exit 1
        fi
        
        if [ "$can_deploy" = true ]; then
            deploy_app "$TARGET_APP"
        else
            verify_app_build "$TARGET_APP"
        fi
        
    elif [ "$DEPLOY_MODE" = "all" ]; then
        if [ "$can_deploy" = true ]; then
            log_info "批量并行部署所有应用..."
        else
            log_info "批量验证所有应用构建产物..."
        fi
        
        local failed_apps=()
        local pids=()
        local results=()
        
        # 创建临时文件用于存储每个应用的结果
        local temp_dir=$(mktemp -d)
        trap "rm -rf $temp_dir" EXIT
        
        # 限制并发数（避免 SSH 连接过多导致连接被关闭）
        local max_concurrent=4
        
        # 并行执行部署或验证（带并发限制）
        for app in "${APPS[@]}"; do
            # 等待直到有可用的并发槽位
            while [ ${#pids[@]} -ge $max_concurrent ]; do
                sleep 0.5
                # 检查已完成的进程并移除
                local new_pids=()
                for pid in "${pids[@]}"; do
                    if kill -0 $pid 2>/dev/null; then
                        new_pids+=($pid)
                    fi
                done
                pids=("${new_pids[@]}")
            done
            
            local result_file="$temp_dir/${app}.result"
            (
                if [ "$can_deploy" = true ]; then
                    if deploy_app "$app"; then
                        echo "success" > "$result_file"
                        echo "$app 部署成功" >> "$result_file"
                    else
                        echo "failed" > "$result_file"
                        echo "$app 部署失败" >> "$result_file"
                    fi
                else
                    if verify_app_build "$app"; then
                        echo "success" > "$result_file"
                        echo "$app 验证成功" >> "$result_file"
                    else
                        echo "failed" > "$result_file"
                        echo "$app 验证失败" >> "$result_file"
                    fi
                fi
            ) &
            pids+=($!)
        done
        
        # 等待所有后台进程完成
        log_info "等待所有任务完成（最大并发数: $max_concurrent）..."
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        # 收集结果
        for app in "${APPS[@]}"; do
            local result_file="$temp_dir/${app}.result"
            if [ -f "$result_file" ]; then
                local status=$(head -n1 "$result_file")
                local message=$(tail -n+2 "$result_file")
                
                if [ "$status" = "success" ]; then
                    log_success "$message"
                else
                    log_error "$message"
                    failed_apps+=("$app")
                fi
            else
                log_error "$app 执行异常（结果文件不存在）"
                failed_apps+=("$app")
            fi
        done
        
        # 所有部署完成后，统一重载 Nginx（仅在实际部署时）
        if [ "$can_deploy" = true ] && [ ${#failed_apps[@]} -eq 0 ]; then
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "重载 Nginx 配置..."
            ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" \
                "nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true" || {
                log_warning "Nginx 重载失败，但不影响部署结果"
            }
            log_success "Nginx 配置已重载"
        fi
        
        # 汇总结果
        echo ""
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        if [ ${#failed_apps[@]} -eq 0 ]; then
            if [ "$can_deploy" = true ]; then
                log_success "所有应用部署成功！"
            else
                log_success "所有应用构建产物验证通过！"
                log_info "提示：在 GitHub Actions 中运行以执行实际部署"
            fi
        else
            if [ "$can_deploy" = true ]; then
                log_error "以下应用部署失败: ${failed_apps[*]}"
            else
                log_error "以下应用验证失败: ${failed_apps[*]}"
            fi
            exit 1
        fi
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        log_error "请指定部署模式: --app <name> 或 --all"
        show_help
        exit 1
    fi
}

# 执行主函数
main

