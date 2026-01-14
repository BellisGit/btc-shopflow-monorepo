#!/bin/bash

# ============================================================================
# 宝塔面板自动备份脚本
# 功能：监控回收站变化，自动备份进入回收站的应用文件夹
# 特点：被动侦测、动态扫描、自动清理旧备份、支持一键还原
# 
# 部署流程说明：
# 1. 手动删除 wwwroot 下的应用文件夹（或某个应用文件夹下的所有产物）
# 2. 文件会被移动到宝塔回收站
# 3. 脚本检测到回收站中有新的应用文件夹，自动从回收站备份
# 4. 重新上传新版本文件
# 
# 使用方法：
# 1. 确保已安装 inotify-tools: yum install -y inotify-tools 或 apt-get install -y inotify-tools
# 2. 修改脚本中的配置变量（如需要）
# 3. 运行脚本: bash backup.sh 或 nohup bash backup.sh &
# 4. 查看日志: tail -f /www/front_backups/backup.log
# 
# 测试监控是否正常工作：
# 在回收站目录中创建测试文件夹: mkdir -p /www/.Recycle_bin/test.bellis.com.cn
# 观察日志是否检测到事件并触发备份
# ============================================================================

# 配置变量
TARGET_DIR="/www/wwwroot"                    # 目标目录（应用文件夹所在位置）
BACKUP_DIR="/www/front_backups"              # 备份存储目录（避免与宝塔目录冲突）
RECYCLE_BIN="/.Recycle_bin"                  # 宝塔回收站目录路径（根目录下）
LOG_FILE="/www/front_backups/backup.log"     # 日志文件路径
BACKUP_RETENTION_DAYS=7                      # 备份保留天数（默认7天）

# 日志函数
log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    # 同时输出到控制台（如果脚本在终端运行）
    [ -t 0 ] && echo "[$timestamp] [$level] $message"
}

# 检查依赖
check_dependencies() {
    if ! command -v inotifywait &> /dev/null; then
        log "ERROR" "inotifywait 未安装，请先安装 inotify-tools"
        log "ERROR" "安装命令: yum install -y inotify-tools 或 apt-get install -y inotify-tools"
        exit 1
    fi
}

# 检查目录
check_directories() {
    if [ ! -d "$TARGET_DIR" ]; then
        log "ERROR" "目标目录不存在: $TARGET_DIR"
        exit 1
    fi
    
    if [ ! -d "$RECYCLE_BIN" ]; then
        log "WARN" "回收站目录不存在: $RECYCLE_BIN"
        log "WARN" "尝试查找常见的宝塔回收站路径..."
        
        # 尝试查找常见的宝塔回收站路径
        local possible_paths=(
            "/.Recycle_bin"
            "/www/.Recycle_bin"
            "/www/Recycle_bin"
            "/www/.recycle"
            "/www/recycle"
        )
        
        local found=false
        for path in "${possible_paths[@]}"; do
            if [ -d "$path" ]; then
                log "INFO" "找到回收站目录: $path"
                RECYCLE_BIN="$path"
                found=true
                break
            fi
        done
        
        if [ "$found" = false ]; then
            log "ERROR" "未找到回收站目录，请手动设置正确的路径"
            log "ERROR" "可以在宝塔面板中查看回收站的实际路径"
            exit 1
        fi
    fi
    
    # 检查回收站目录权限
    if [ ! -r "$RECYCLE_BIN" ]; then
        log "ERROR" "回收站目录不可读: $RECYCLE_BIN"
        exit 1
    fi
    
    log "INFO" "回收站目录验证通过: $RECYCLE_BIN"
    
    # 创建备份目录和日志目录
    mkdir -p "$BACKUP_DIR" || {
        log "ERROR" "无法创建备份目录: $BACKUP_DIR"
        exit 1
    }
    
    # 创建日志文件（如果不存在）
    touch "$LOG_FILE" || {
        log "ERROR" "无法创建日志文件: $LOG_FILE"
        exit 1
    }
}

# 动态扫描应用目录
scan_apps() {
    local apps=()
    if [ -d "$TARGET_DIR" ]; then
        # 扫描所有子目录，排除隐藏目录
        while IFS= read -r -d '' dir; do
            local app_name=$(basename "$dir")
            # 排除隐藏目录和特殊目录
            if [[ ! "$app_name" =~ ^\. ]]; then
                apps+=("$app_name")
            fi
        done < <(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)
    fi
    echo "${apps[@]}"
}

# 清理过期备份
cleanup_old_backups() {
    log "INFO" "开始清理 $BACKUP_RETENTION_DAYS 天前的旧备份..."
    
    # 使用临时文件记录删除的文件数（避免子shell变量作用域问题）
    local temp_count_file=$(mktemp)
    echo "0" > "$temp_count_file"
    
    # 在每个应用子目录中查找并删除过期备份文件
    find "$BACKUP_DIR" -mindepth 2 -maxdepth 2 -name "*.tar.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -print0 2>/dev/null | while IFS= read -r -d '' backup_file; do
        local app_name=$(basename "$(dirname "$backup_file")")
        local file_name=$(basename "$backup_file")
        if rm -f "$backup_file" 2>/dev/null; then
            local count=$(cat "$temp_count_file")
            echo $((count + 1)) > "$temp_count_file"
            log "INFO" "已删除过期备份: ${app_name}/${file_name}"
        fi
    done
    
    local deleted_count=$(cat "$temp_count_file" 2>/dev/null || echo "0")
    rm -f "$temp_count_file"
    
    if [ "$deleted_count" -gt 0 ]; then
        log "INFO" "清理完成，共删除 $deleted_count 个过期备份"
    else
        log "INFO" "没有需要清理的过期备份"
    fi
}

# 从宝塔回收站重命名格式中提取原始应用名称
# 格式: _bt_路径段1_bt_路径段2_bt_..._bt_文件名_t_时间戳
# 例如: 
#   _bt_www_bt_wwwroot_bt_admin.bellis.com.cn_t_1765203777.0562916 -> admin.bellis.com.cn
#   _bt_www_bt_wwwroot_bt_quality.bellis.com.cn_t_1765239611.1408987 -> quality.bellis.com.cn
extract_app_name() {
    local renamed_name="$1"
    local original_name=""
    
    # 检查是否是宝塔回收站重命名格式
    if [[ "$renamed_name" =~ ^_bt_ ]]; then
        # 移除结尾的 _t_时间戳
        local without_timestamp=$(echo "$renamed_name" | sed 's/_t_[0-9.]*$//')
        
        # 使用 awk 按 _bt_ 分割，取最后一个字段（即原始文件名/目录名）
        original_name=$(echo "$without_timestamp" | awk -F'_bt_' '{print $NF}')
        
        # 如果提取失败，尝试使用 sed
        if [ -z "$original_name" ] || [ "$original_name" = "$renamed_name" ]; then
            # 移除开头的 _bt_，然后找到最后一个 _bt_ 后的内容
            original_name=$(echo "$without_timestamp" | sed 's/^_bt_//' | sed 's/.*_bt_//')
        fi
        
        # 如果还是失败，尝试使用 grep（如果系统支持 -P 选项）
        if [ -z "$original_name" ] || [ "$original_name" = "$renamed_name" ]; then
            original_name=$(echo "$renamed_name" | grep -oP '(?<=_bt_)[^_]+(?=_t_)' | tail -1 2>/dev/null || echo "")
        fi
    else
        # 不是重命名格式，直接使用原名称
        original_name="$renamed_name"
    fi
    
    # 如果提取结果为空或等于原名称，返回原名称
    if [ -z "$original_name" ]; then
        original_name="$renamed_name"
    fi
    
    echo "$original_name"
}

# 备份应用文件夹（从回收站）
backup_app() {
    local app="$1"
    local recycle_path="${RECYCLE_BIN}/${app}"
    
    # 检查回收站中是否存在（app 可能是重命名后的名称）
    if [ ! -d "$recycle_path" ]; then
        log "ERROR" "应用目录不存在于回收站: $app"
        log "ERROR" "回收站路径: $recycle_path"
        return 1
    fi
    
    # 提取原始应用名称（用于备份文件命名）
    local original_app=$(extract_app_name "$app")
    if [ -z "$original_app" ] || [ "$original_app" = "$app" ]; then
        original_app="$app"
    fi
    
    log "INFO" "从回收站备份应用"
    log "INFO" "原始名称: $original_app"
    log "INFO" "重命名: $app"
    log "INFO" "回收站路径: $recycle_path"
    
    # 创建应用专属备份目录（使用原始应用名称）
    local app_backup_dir="${BACKUP_DIR}/${original_app}"
    mkdir -p "$app_backup_dir" || {
        log "ERROR" "无法创建应用备份目录: $app_backup_dir"
        return 1
    }
    
    # 每次备份时重新获取时间戳（使用倒序时间戳，确保最新的文件在文件列表最前面）
    # 格式：YYYYMMDD_HHMMSS，这样按文件名排序时最新的会在前面
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="${app_backup_dir}/${original_app}_${timestamp}.tar.gz"
    
    log "INFO" "开始备份应用: $original_app"
    log "INFO" "备份源: $recycle_path"
    log "INFO" "备份目标: $backup_file"
    
    # 从回收站直接备份（使用重命名后的文件夹名称）
    if tar -czf "$backup_file" -C "$RECYCLE_BIN" "$app" 2>>"$LOG_FILE"; then
        # 更新文件时间戳为当前时间，确保最新的文件时间戳最大
        touch "$backup_file"
        
        local size=$(du -h "$backup_file" | cut -f1)
        log "INFO" "备份成功: $original_app (大小: $size, 路径: ${original_app}/$(basename "$backup_file"))"
        return 0
    else
        log "ERROR" "备份失败: $original_app (重命名: $app)"
        # 如果备份失败，删除可能不完整的文件
        [ -f "$backup_file" ] && rm -f "$backup_file"
        return 1
    fi
}

# 主备份流程
perform_backup() {
    local app_name="$1"
    log "INFO" "=========================================="
    log "INFO" "检测到应用文件夹被删除，触发备份流程"
    log "INFO" "应用名称: $app_name"
    
    if [ -z "$app_name" ]; then
        log "ERROR" "应用名称为空，无法备份"
        return
    fi
    
    # 直接备份指定的应用
    if backup_app "$app_name"; then
        log "INFO" "备份成功: $app_name"
    else
        log "ERROR" "备份失败: $app_name"
    fi
    
    # 清理过期备份
    cleanup_old_backups
    
    log "INFO" "备份流程结束"
    log "INFO" "=========================================="
}

# 主函数
main() {
    log "INFO" "=========================================="
    log "INFO" "宝塔面板自动备份脚本启动"
    log "INFO" "目标目录: $TARGET_DIR"
    log "INFO" "备份目录: $BACKUP_DIR"
    log "INFO" "回收站目录: $RECYCLE_BIN"
    log "INFO" "备份保留天数: $BACKUP_RETENTION_DAYS"
    log "INFO" "=========================================="
    
    # 检查依赖和目录
    check_dependencies
    check_directories
    
    log "INFO" "开始监控回收站目录: $RECYCLE_BIN"
    log "INFO" "等待回收站变化..."
    log "INFO" "监控事件: create, moved_to, moved_from, move_self (递归监控所有子目录)"
    log "INFO" "提示: 可以通过在回收站中创建测试文件来验证监控是否正常工作"
    
    # 列出回收站当前内容（用于调试）
    log "INFO" "回收站当前内容:"
    ls -la "$RECYCLE_BIN" 2>/dev/null | head -20 | while read -r line; do
        log "DEBUG" "  $line"
    done
    
    # 诊断：查找所有可能的应用文件夹（包括子目录）
    log "INFO" "诊断：搜索所有可能的应用文件夹..."
    find "$RECYCLE_BIN" -type d -name "*.bellis.com.cn" -o -name "*.com.cn" 2>/dev/null | while read -r found_path; do
        if [ -n "$found_path" ]; then
            log "INFO" "发现可能的应用文件夹: $found_path"
        fi
    done
    
    # 诊断：列出回收站中所有目录（包括子目录，最多3层）
    log "INFO" "诊断：回收站目录结构（最多3层）:"
    find "$RECYCLE_BIN" -maxdepth 3 -type d 2>/dev/null | head -30 | while read -r dir_path; do
        if [ "$dir_path" != "$RECYCLE_BIN" ]; then
            local rel_path="${dir_path#$RECYCLE_BIN/}"
            log "DEBUG" "  目录: $rel_path"
        fi
    done
    
    # 记录已备份的文件夹（避免重复备份）
    local backed_up_file="${BACKUP_DIR}/.backed_up_apps.txt"
    touch "$backed_up_file"
    
    # 定期扫描函数（作为 inotifywait 的备选方案）
    scan_and_backup() {
        log "INFO" "执行定期扫描回收站: $RECYCLE_BIN"
        local found_new=false
        local total_dirs=0
        
        # 查找回收站中的所有目录（包括宝塔重命名的）
        log "INFO" "开始查找回收站中的目录..."
        while IFS= read -r -d '' app_path; do
            total_dirs=$((total_dirs + 1))
            local renamed_name=$(basename "$app_path")
            log "INFO" "找到目录 #$total_dirs: $renamed_name (完整路径: $app_path)"
            
            [ -z "$renamed_name" ] && continue
            
            # 跳过隐藏目录（但保留 _bt_ 开头的，因为那是宝塔重命名的）
            if [[ "$renamed_name" =~ ^\. ]] && [[ ! "$renamed_name" =~ ^_bt_ ]]; then
                log "DEBUG" "跳过隐藏目录: $renamed_name"
                continue
            fi
            
            # 从重命名格式中提取原始应用名称
            local app_name=$(extract_app_name "$renamed_name")
            log "INFO" "  重命名: $renamed_name -> 原始名称: $app_name"
            
            # 检查是否已经备份过（使用原始名称和重命名名称都检查）
            local already_backed=false
            if [ -f "$backed_up_file" ]; then
                if grep -q "^${app_name}$" "$backed_up_file" 2>/dev/null || \
                   grep -q "^${renamed_name}$" "$backed_up_file" 2>/dev/null; then
                    already_backed=true
                fi
            fi
            
            if [ "$already_backed" = true ]; then
                log "INFO" "应用已备份过，跳过: $app_name (重命名: $renamed_name)"
                continue
            fi
            
            # 检查是否是应用文件夹
            local is_app=false
            local detection_method=""
            
            # 方法1: 检查原始名称的命名模式
            if [[ "$app_name" =~ \.(bellis\.com\.cn|com\.cn)$ ]]; then
                is_app=true
                detection_method="命名模式"
                log "INFO" "✓ 通过命名模式识别为应用文件夹: $app_name"
            fi
            
            # 方法2: 检查文件夹结构
            if [ "$is_app" = false ] && [ -d "$app_path" ]; then
                log "DEBUG" "检查文件夹结构: $app_path"
                if [ -f "$app_path/index.html" ]; then
                    is_app=true
                    detection_method="index.html"
                    log "INFO" "✓ 通过 index.html 识别为应用文件夹: $app_name"
                elif [ -f "$app_path/index.php" ]; then
                    is_app=true
                    detection_method="index.php"
                    log "INFO" "✓ 通过 index.php 识别为应用文件夹: $app_name"
                elif [ -d "$app_path/dist" ]; then
                    is_app=true
                    detection_method="dist目录"
                    log "INFO" "✓ 通过 dist 目录识别为应用文件夹: $app_name"
                elif [ -d "$app_path/build" ]; then
                    is_app=true
                    detection_method="build目录"
                    log "INFO" "✓ 通过 build 目录识别为应用文件夹: $app_name"
                elif [ -d "$app_path/static" ]; then
                    is_app=true
                    detection_method="static目录"
                    log "INFO" "✓ 通过 static 目录识别为应用文件夹: $app_name"
                elif [ -d "$app_path/assets" ]; then
                    is_app=true
                    detection_method="assets目录"
                    log "INFO" "✓ 通过 assets 目录识别为应用文件夹: $app_name"
                fi
            fi
            
            if [ "$is_app" = true ]; then
                log "INFO" "=========================================="
                log "INFO" "定期扫描发现新的应用文件夹"
                log "INFO" "原始名称: $app_name"
                log "INFO" "重命名: $renamed_name"
                log "INFO" "检测方法: $detection_method"
                log "INFO" "完整路径: $app_path"
                log "INFO" "开始备份..."
                # 记录原始名称和重命名名称，避免重复备份
                echo "$app_name" >> "$backed_up_file"
                echo "$renamed_name" >> "$backed_up_file"
                # 使用重命名的文件夹名称进行备份（因为实际路径是重命名的）
                perform_backup "$renamed_name"
                found_new=true
                log "INFO" "=========================================="
            else
                log "DEBUG" "忽略非应用文件夹: $app_name (重命名: $renamed_name, 路径: $app_path)"
            fi
        done < <(find "$RECYCLE_BIN" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)
        
        log "INFO" "扫描完成: 共找到 $total_dirs 个目录"
        if [ "$found_new" = false ]; then
            log "INFO" "未发现新的应用文件夹需要备份"
        fi
    }
    
    # 立即执行一次扫描（检查启动时已存在的文件）
    log "INFO" "执行启动时扫描..."
    scan_and_backup
    
    # 启动定期扫描（每30秒扫描一次，作为备选方案）
    (
        while true; do
            sleep 30
            scan_and_backup
        done
    ) &
    local scan_pid=$!
    log "INFO" "已启动定期扫描（PID: $scan_pid），每30秒扫描一次"
    
    # 测试 inotifywait 是否正常工作（非阻塞测试）
    log "INFO" "inotifywait 已就绪，等待事件..."
    
    # 监控回收站目录（递归监控所有子目录）
    # 使用 -r 参数递归监控，-m 持续监控
    # create: 文件/目录创建（包括文件夹）
    # moved_to: 文件/目录移动到监控目录
    # moved_from: 文件/目录从其他位置移动过来（可能在某些系统上需要）
    # move_self: 目录本身被移动
    # 注意：宝塔删除文件夹时，会在回收站中创建对应的文件夹，所以需要监控目录创建事件
    # 使用 --monitor 模式持续监控，并输出所有事件到日志
    # 监控所有可能的事件类型（注意：不能同时使用 -m 和 --timeout）
    inotifywait -m -r -e create,moved_to,moved_from,move_self,delete,delete_self --format '%e|%w%f' "$RECYCLE_BIN" 2>>"$LOG_FILE" | while IFS='|' read -r event_type full_path; do
        # 记录所有原始事件（用于调试）
        log "INFO" "捕获到事件: event_type=$event_type, full_path=$full_path"
        # 忽略空路径
        if [ -z "$full_path" ]; then
            log "DEBUG" "忽略空路径事件"
            continue
        fi
        
        # 获取相对于回收站目录的路径
        local relative_path="${full_path#$RECYCLE_BIN/}"
        local item_name=$(basename "$full_path")
        
        # 记录所有事件（用于调试）
        log "INFO" "检测到事件: $event_type - 完整路径: $full_path - 相对路径: $relative_path - 名称: $item_name"
        
        # 忽略隐藏文件和临时文件
        if [[ "$item_name" =~ ^\. ]] || [[ "$item_name" =~ ~$ ]] || [[ "$item_name" =~ \.tmp$ ]]; then
            log "DEBUG" "忽略临时/隐藏文件: $item_name"
            continue
        fi
        
        # 检查是否是应用文件夹
        # 方法1: 检查是否是目录（文件夹）
        if [ ! -d "$full_path" ]; then
            log "DEBUG" "忽略文件（非目录）: $item_name"
            continue
        fi
        
        # 方法2: 检查文件夹名是否匹配应用命名模式（*.bellis.com.cn 或 *.com.cn）
        # 或者检查 wwwroot 中是否有同名文件夹（说明这是一个应用）
        local is_app_folder=false
        
        # 检查命名模式
        if [[ "$item_name" =~ \.(bellis\.com\.cn|com\.cn)$ ]] || [[ "$item_name" =~ ^[a-z-]+\.(bellis\.com\.cn|com\.cn)$ ]]; then
            is_app_folder=true
            log "DEBUG" "通过命名模式识别为应用文件夹: $item_name"
        fi
        
        # 如果命名模式不匹配，检查 wwwroot 中是否有同名文件夹（可能被删除了）
        if [ "$is_app_folder" = false ] && [ -d "${TARGET_DIR}/${item_name}" ]; then
            is_app_folder=true
            log "DEBUG" "通过 wwwroot 检查识别为应用文件夹: $item_name"
        fi
        
        # 如果还是不确定，检查回收站中的文件夹结构（应用文件夹通常包含特定文件）
        if [ "$is_app_folder" = false ] && [ -d "$full_path" ]; then
            # 检查是否包含 index.html 或其他常见的前端应用文件
            if [ -f "$full_path/index.html" ] || [ -f "$full_path/index.php" ] || [ -d "$full_path/dist" ] || [ -d "$full_path/build" ] || [ -d "$full_path/static" ]; then
                is_app_folder=true
                log "DEBUG" "通过文件结构识别为应用文件夹: $item_name"
            fi
        fi
        
        if [ "$is_app_folder" = true ]; then
            log "INFO" "检测到应用文件夹进入回收站: $item_name"
            log "INFO" "事件类型: $event_type, 完整路径: $full_path"
            
            # 等待一小段时间，确保文件夹完全移动到回收站
            sleep 1
            
            # 验证文件夹确实存在于回收站
            if [ -d "$full_path" ]; then
                log "INFO" "确认应用文件夹已存在于回收站，开始备份"
                
                # 检查是否已经备份过（避免重复备份）
                if [ -f "$backed_up_file" ] && grep -q "^${item_name}$" "$backed_up_file" 2>/dev/null; then
                    log "INFO" "应用文件夹已备份过，跳过: $item_name"
                else
                    # 记录到已备份列表
                    echo "$item_name" >> "$backed_up_file"
                    # 执行备份（从回收站备份）
                    perform_backup "$item_name"
                fi
            else
                log "WARN" "应用文件夹不存在于预期路径，可能已被移动或删除: $full_path"
            fi
        else
            log "DEBUG" "忽略非应用文件夹: $item_name"
        fi
    done
}

# 捕获退出信号，确保日志记录和清理
trap 'log "INFO" "脚本被终止，清理子进程"; kill $scan_pid 2>/dev/null; exit 0' INT TERM

# 运行主函数
main
