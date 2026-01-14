# 文档迁移映射表

## 一、删除（Delete）

### 重复文档
| 原路径 | 保留版本 | 理由 |
|--------|---------|------|
| `docs/NGINX_SUBDOMAIN_PROXY.md` | `apps/docs-app/guides/deployment/nginx-subdomain-proxy.md` | docs-app 是文档站点，应作为单一来源 |
| `docs/K8S_INCREMENTAL_DEPLOYMENT.md` | `apps/docs-app/guides/deployment/k8s-incremental-deployment.md` | 同上 |
| `docs/REVERSE_PROXY_ARCHITECTURE.md` | `apps/docs-app/guides/deployment/reverse-proxy-architecture.md` | 同上 |
| `docs/SUBDOMAIN_LAYOUT_INTEGRATION.md` | `apps/docs-app/guides/deployment/subdomain-layout-integration.md` | 同上 |
| `docs/GITHUB_ACTIONS_K8S_SETUP.md` | `apps/docs-app/guides/deployment/github-actions-k8s-setup.md` | 同上 |

### 空 README 文件
| 原路径 | 操作 | 理由 |
|--------|------|------|
| `apps/*/src/components/README.md` | 删除 | 空文件无意义，目录结构已说明 |
| `apps/*/src/composables/README.md` | 删除 | 同上 |
| `apps/*/src/config/README.md` | 删除 | 同上 |
| `apps/*/src/micro/README.md` | 删除 | 同上 |
| `apps/*/src/plugins/README.md` | 删除 | 同上 |
| `apps/*/src/services/README.md` | 删除 | 同上 |
| `apps/*/src/utils/README.md` | 删除 | 同上 |
| `apps/*/src/i18n/README.md` | 删除 | 同上 |

### 错误报告文件
| 原路径 | 操作 | 理由 |
|--------|------|------|
| `ts-error-reports/` | 删除整个目录 | 临时报告，不应纳入版本控制 |
| `lint-error-reports/` | 删除整个目录 | 临时报告，不应纳入版本控制 |

## 二、归档（Archive）

### 设计令牌迁移
| 原路径 | 新路径 | 理由 |
|--------|--------|------|
| `packages/design-tokens/MIGRATION_*.md` (8个) | `docs/archive/design-tokens/` | 迁移已完成，保留历史记录 |
| `packages/design-tokens/IMPLEMENTATION_*.md` (2个) | `docs/archive/design-tokens/` | 实现已完成 |
| `packages/design-tokens/PLAN_EXECUTION_SUMMARY.md` | `docs/archive/design-tokens/` | 执行已完成 |
| `packages/design-tokens/FINAL_VERIFICATION.md` | `docs/archive/design-tokens/` | 验证已完成 |

### 日志迁移
| 原路径 | 新路径 | 理由 |
|--------|--------|------|
| `CONSOLE_TO_LOGGER_MIGRATION_REPORT.md` | `docs/archive/migrations/console-to-logger.md` | 迁移已完成 |
| `MIGRATION_COMPLETE_SUMMARY.md` | `docs/archive/migrations/migration-summary.md` | 迁移已完成 |
| `LOGGING_LIBRARY_ANALYSIS.md` | `docs/archive/migrations/logging-library-analysis.md` | 分析已完成 |

### CSS 架构重构
| 原路径 | 新路径 | 理由 |
|--------|--------|------|
| `packages/shared-components/src/styles/IMPLEMENTATION_SUMMARY.md` | `docs/archive/css-architecture/implementation-summary.md` | 重构已完成 |
| `packages/shared-components/src/styles/ITCSS_RESTRUCTURE_PLAN.md` | `docs/archive/css-architecture/itcss-restructure-plan.md` | 重构已完成 |

### i18n 优化分析
| 原路径 | 新路径 | 理由 |
|--------|--------|------|
| `docs/i18n-optimization-analysis.md` | `docs/archive/i18n/optimization-analysis-v1.md` | 优化已完成 |
| `docs/i18n-optimization-analysis-v2.md` | `docs/archive/i18n/optimization-analysis-v2.md` | 优化已完成 |
| `docs/i18n-scripts-integration.md` | `docs/archive/i18n/scripts-integration.md` | 集成已完成 |

### 模块架构对比（旧版本）
| 原路径 | 新路径 | 理由 |
|--------|--------|------|
| `docs/module-architecture-comparison.md` | `docs/archive/architecture/module-architecture-comparison-v1.md` | 旧版本，已被 complete-comparison 替代 |

## 三、移动（Move）

### 重组 docs/ 目录

#### 创建子目录结构
```bash
mkdir -p docs/getting-started
mkdir -p docs/architecture
mkdir -p docs/development
mkdir -p docs/deployment
mkdir -p docs/ci-cd
mkdir -p docs/guides/i18n
mkdir -p docs/guides/routing
mkdir -p docs/guides/styling
mkdir -p docs/api
mkdir -p docs/research
```

#### 移动文档
| 原路径 | 新路径 | 分类 |
|--------|--------|------|
| `docs/APP_DEVELOPMENT_GUIDE.md` | `docs/development/app-development.md` | 开发指南 |
| `docs/auto-route-discovery-usage.md` | `docs/guides/routing/auto-discovery.md` | 路由指南 |
| `docs/i18n-quick-start.md` | `docs/guides/i18n/quick-start.md` | i18n 指南 |
| `docs/i18n-flat-structure-rationale.md` | `docs/guides/i18n/flat-structure.md` | i18n 指南 |
| `docs/ESLINT-I18N-RULES.md` | `docs/guides/i18n/eslint-rules.md` | i18n 指南 |
| `docs/I18N-NAMING-CONVENTION.md` | `docs/guides/i18n/naming-convention.md` | i18n 指南 |
| `docs/I18N-LOADING-ORDER.md` | `docs/guides/i18n/loading-order.md` | i18n 指南 |
| `docs/CDN_RESOURCE_ACCELERATION.md` | `docs/deployment/cdn-acceleration.md` | 部署文档 |
| `docs/STORAGE_USAGE_AUDIT.md` | `docs/api/storage-usage.md` | API 文档 |
| `docs/CHART_ARCHITECTURE_ANALYSIS.md` | `docs/architecture/chart-system.md` | 架构文档 |
| `docs/SCRIPTS_USAGE.md` | `docs/development/scripts-usage.md` | 开发文档 |
| `docs/USER-CHECK-API.md` | `docs/api/user-check.md` | API 文档 |
| `docs/GIT_TAG_GUIDE.md` | `docs/development/git-tag.md` | 开发文档 |
| `docs/JENKINS_SETUP.md` | `docs/ci-cd/setup.md` | CI/CD 文档 |
| `SPECULATION_RULES_API_EVALUATION.md` | `docs/research/speculation-rules.md` | 技术研究 |

### 移动 Jenkins 文档
| 原路径 | 新路径 |
|--------|--------|
| `jenkins/` 下所有文档 | `docs/ci-cd/` |

## 四、重命名（Rename）

### packages/shared-components/ 目录
| 原文件名 | 新文件名 |
|---------|---------|
| `COMPONENT_ANALYSIS.md` | `component-analysis.md` |
| `COMPONENT_ANALYSIS_FILTER_TABLE_GROUP.md` | `filter-table-group-analysis.md` |
| `COMPONENT_NAMING_ANALYSIS.md` | `component-naming-analysis.md` |
| `GROUP_COMPONENTS_ANALYSIS.md` | `group-components-analysis.md` |
| `CIRCULAR_REFERENCE_GUIDE.md` | `circular-reference-guide.md` |
| `BTC_LAYOUT_ENHANCED_PLAN.md` | `layout-enhanced-plan.md` |
| `BTC_LAYOUT_UNIFIED_ASSESSMENT.md` | `layout-unified-assessment.md` |
| `BTC_DOUBLE_LAYOUT_MIGRATION_ASSESSMENT.md` | `double-layout-migration-assessment.md` |
| `BTC_FILTER_TABLE_GROUP_IMPLEMENTATION_PLAN.md` | `filter-table-group-implementation-plan.md` |

### 根目录中文文档
| 原文件名 | 新路径 |
|---------|--------|
| `封装输入框.md` | `apps/docs-app/guides/components/input-component-design.md` |
| `输入框封装分析与建议.md` | `apps/docs-app/guides/components/input-component-analysis.md` |
| `常见问题.md` | `apps/docs-app/guides/faq.md` |

## 五、合并（Merge）

### Jenkins 文档合并策略

#### 目标文档: `docs/ci-cd/setup.md`
合并以下文档：
- `jenkins/credentials-setup.md`
- `jenkins/github-webhook-setup-guide.md`
- `jenkins/jenkins-poll-scm-guide.md`
- `jenkins/JENKINS_SETUP.md`（docs 下的）

#### 目标文档: `docs/ci-cd/deployment.md`
合并以下文档：
- `jenkins/deployment-strategies.md`
- `jenkins/deployment-strategy-comparison.md`
- `jenkins/docker-deployment-guide.md`
- `jenkins/smart-trigger-strategy.md`

#### 目标文档: `docs/ci-cd/job-management.md`
合并以下文档：
- `jenkins/create-individual-jobs-cli-guide.md`
- `jenkins/scm-path-filter-guide.md`

### i18n 文档合并策略

#### 目标文档: `docs/guides/i18n/best-practices.md`
合并以下文档的结论部分：
- `docs/i18n-optimization-analysis.md`（第 5-7 节）
- `docs/i18n-optimization-analysis-v2.md`（最佳实践部分）

## 六、创建新文档（Create）

### 核心导航文档
- [ ] `docs/README.md` - 文档导航总览
- [ ] `docs/architecture/README.md` - 架构文档导航
- [ ] `docs/guides/README.md` - 指南文档导航
- [ ] `docs/guides/i18n/README.md` - i18n 专题导航

### 简化文档
- [ ] `packages/design-tokens/MIGRATION_HISTORY.md` - 迁移历史简要
- [ ] `docs/architecture/module-system.md` - 模块系统说明（精简版）
- [ ] `docs/guides/i18n/best-practices.md` - i18n 最佳实践（合并分析结论）

### 最佳实践文档
- [ ] `docs/development/best-practices.md` - 开发最佳实践
- [ ] `docs/architecture/module-plugin-best-practices.md` - 模块vs插件使用场景

## 七、执行顺序建议

### 第一步：删除无争议的文件（最快见效）
1. 删除空 README（30+ 个）
2. 删除错误报告目录（2 个）
3. 删除明显重复的部署文档（5 个）

**预期**: 减少 37 个文档，立即见效

### 第二步：归档迁移文档（整理历史）
1. 创建 archive 目录结构
2. 移动所有 MIGRATION_* 和 IMPLEMENTATION_* 文档
3. 创建简要的历史总结文档

**预期**: 清理 30 个迁移文档，保持项目整洁

### 第三步：重组 docs/ 目录（建立新结构）
1. 创建子目录（architecture, development, deployment 等）
2. 移动文档到新位置
3. 更新内部链接

**预期**: 建立清晰的文档结构

### 第四步：规范命名（统一风格）
1. 重命名全大写文档
2. 重命名中文文档
3. 更新所有链接

**预期**: 统一文档命名风格

### 第五步：创建导航（提升可发现性）
1. 创建 docs/README.md
2. 更新根 README.md
3. 更新 docs-app 导航

**预期**: 文档易于发现和访问

## 八、风险评估

### 低风险操作
- ✅ 删除空 README
- ✅ 删除错误报告
- ✅ 归档迁移文档
- ✅ 创建新目录

### 中风险操作
- ⚠️ 删除重复文档（可能有内部链接）
- ⚠️ 移动文档位置（需要更新链接）
- ⚠️ 合并文档（需要保留所有有用信息）

### 高风险操作
- 🚨 重命名被外部引用的文档
- 🚨 删除可能被 CI/CD 脚本使用的文档

### 缓解措施
1. **执行前备份**: `git tag docs-before-cleanup`
2. **链接检查**: 使用工具检查所有内部链接
3. **逐步执行**: 按阶段执行，每个阶段验证
4. **保留历史**: 重要文档先归档，不直接删除

## 九、验证脚本

### 检查重复文档
```powershell
# 按文件大小和行数查找相似文档
Get-ChildItem -Recurse -Filter "*.md" | 
  Where-Object { $_.FullName -notmatch "node_modules|dist" } |
  Group-Object Length | 
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object { $_.Group | Select-Object FullName, Length }
```

### 检查空 README
```powershell
# 查找小于 150 字节的 README
Get-ChildItem -Recurse -Filter "README.md" | 
  Where-Object { 
    $_.FullName -notmatch "node_modules|dist" -and 
    $_.Length -lt 150 
  } |
  Select-Object FullName, Length
```

### 检查内部链接
```bash
# 使用 markdown-link-check 工具
find docs -name "*.md" -exec markdown-link-check {} \;
```

## 十、回滚计划

### 如果出现问题
```bash
# 1. 回滚到备份标签
git reset --hard docs-before-cleanup

# 2. 或者从归档恢复
cp -r docs/archive/design-tokens/* packages/design-tokens/
```

### 保留备份
- 在执行前创建分支: `git checkout -b docs-cleanup`
- 归档的文档保留至少 6 个月
- 重要文档永久归档
