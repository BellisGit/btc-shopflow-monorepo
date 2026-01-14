# 文档清理检查清单

## Phase 1: 删除重复文档（优先级：高）

### 1.1 删除 docs/ 下的重复部署文档
- [ ] `docs/NGINX_SUBDOMAIN_PROXY.md` → 保留 `apps/docs-app/guides/deployment/nginx-subdomain-proxy.md`
- [ ] `docs/K8S_INCREMENTAL_DEPLOYMENT.md` → 保留 `apps/docs-app/guides/deployment/k8s-incremental-deployment.md`
- [ ] `docs/REVERSE_PROXY_ARCHITECTURE.md` → 保留 `apps/docs-app/guides/deployment/reverse-proxy-architecture.md`
- [ ] `docs/SUBDOMAIN_LAYOUT_INTEGRATION.md` → 保留 `apps/docs-app/guides/deployment/subdomain-layout-integration.md`
- [ ] `docs/GITHUB_ACTIONS_K8S_SETUP.md` → 保留 `apps/docs-app/guides/deployment/github-actions-k8s-setup.md`

**命令**:
```bash
cd docs
rm NGINX_SUBDOMAIN_PROXY.md
rm K8S_INCREMENTAL_DEPLOYMENT.md
rm REVERSE_PROXY_ARCHITECTURE.md
rm SUBDOMAIN_LAYOUT_INTEGRATION.md
rm GITHUB_ACTIONS_K8S_SETUP.md
```

### 1.2 删除根目录重复的输入框文档
- [ ] 合并 `封装输入框.md` 和 `输入框封装分析与建议.md` → 移至 docs-app

### 1.3 删除空 README 文件
- [ ] `apps/admin-app/src/components/README.md` (0.1 KB, 2行)
- [ ] `apps/admin-app/src/composables/README.md`
- [ ] `apps/logistics-app/src/components/README.md`
- [ ] `apps/logistics-app/src/composables/README.md`
- [ ] `apps/logistics-app/src/config/README.md`
- [ ] `apps/logistics-app/src/micro/README.md`
- [ ] `apps/logistics-app/src/plugins/README.md`
- [ ] `apps/logistics-app/src/services/README.md`
- [ ] `apps/logistics-app/src/utils/README.md`
- [ ] `apps/logistics-app/src/i18n/README.md`
- [ ] 所有其他应用的类似空 README（约 30+ 个）

**命令**:
```bash
# 删除所有 2 行的空 README
Get-ChildItem -Recurse -Filter "README.md" | Where-Object { 
  $_.FullName -notmatch "node_modules|dist" -and 
  (Get-Content $_.FullName | Measure-Object -Line).Lines -eq 2 
} | Remove-Item -Verbose
```

### 1.4 删除错误报告文件
- [ ] `ts-error-reports/SUMMARY.md`
- [ ] `lint-error-reports/SUMMARY.md`
- [ ] `lint-error-reports/README.md`

**命令**:
```bash
rm -rf ts-error-reports
rm -rf lint-error-reports
```

## Phase 2: 归档过时文档（优先级：高）

### 2.1 创建归档目录
```bash
mkdir -p docs/archive/migrations
mkdir -p docs/archive/design-tokens
mkdir -p docs/archive/css-architecture
```

### 2.2 归档设计令牌迁移文档
从 `packages/design-tokens/` 移至 `docs/archive/design-tokens/`:
- [ ] `MIGRATION_COMPLETE.md`
- [ ] `MIGRATION_SUMMARY.md`
- [ ] `MIGRATION_MILESTONES.md`
- [ ] `MIGRATION_CURRENT_STATE.md`
- [ ] `MIGRATION_PROGRESS.md`
- [ ] `MIGRATION_EXECUTION_GUIDE.md`
- [ ] `MIGRATION_INDEX.md`
- [ ] `MIGRATION_ATOMIC_STEPS.md`
- [ ] `IMPLEMENTATION_COMPLETE.md`
- [ ] `IMPLEMENTATION_STATUS.md`
- [ ] `PLAN_EXECUTION_SUMMARY.md`
- [ ] `FINAL_VERIFICATION.md`

**保留**:
- ✅ `README.md` - 使用指南
- ✅ `TOKENS_STRUCTURE.md` - 令牌结构
- ✅ `TESTING_GUIDE.md` - 测试指南

**创建新文件**:
- [ ] `MIGRATION_HISTORY.md` - 迁移历史简要（链接到归档）

### 2.3 归档日志迁移文档
从根目录移至 `docs/archive/migrations/`:
- [ ] `CONSOLE_TO_LOGGER_MIGRATION_REPORT.md`
- [ ] `MIGRATION_COMPLETE_SUMMARY.md`
- [ ] `LOGGING_LIBRARY_ANALYSIS.md`

### 2.4 归档 CSS 架构重构文档
从 `packages/shared-components/src/styles/` 移至 `docs/archive/css-architecture/`:
- [ ] `IMPLEMENTATION_SUMMARY.md`
- [ ] `ITCSS_RESTRUCTURE_PLAN.md`

**保留**:
- ✅ `CSS_ARCHITECTURE.md` - CSS 架构文档
- ✅ `CSS_VARIABLES.md` - CSS 变量文档
- ✅ `INTEGRATION_GUIDE.md` - 集成指南

## Phase 3: 重新组织文档（优先级：中）

### 3.1 移动位置不当的文档

#### 根目录文档 → docs-app/guides/
- [ ] `封装输入框.md` → `apps/docs-app/guides/components/input-component-design.md`
- [ ] `输入框封装分析与建议.md` → `apps/docs-app/guides/components/input-component-analysis.md`
- [ ] `常见问题.md` → `apps/docs-app/guides/faq.md`

#### 根目录文档 → docs/research/
- [ ] `SPECULATION_RULES_API_EVALUATION.md` → `docs/research/speculation-rules-evaluation.md`

#### 包根目录文档 → docs/
- [ ] `auth/README.md` → `docs/architecture/auth.md`
- [ ] `k8s/README.md` → `docs/deployment/k8s.md`

### 3.2 合并 i18n 文档
目标目录: `docs/guides/i18n/`

**合并策略**:
- [ ] 保留 `i18n-quick-start.md` 作为快速开始
- [ ] 保留 `i18n-flat-structure-rationale.md` 作为架构决策
- [ ] 保留 `ESLINT-I18N-RULES.md` 作为规范文档
- [ ] 归档 `i18n-optimization-analysis.md` 和 `i18n-optimization-analysis-v2.md`（分析完成）
- [ ] 归档 `i18n-scripts-integration.md`（集成完成）

**创建**:
- [ ] `docs/guides/i18n/README.md` - i18n 总览和导航
- [ ] `docs/guides/i18n/best-practices.md` - 最佳实践（合并分析结论）

### 3.3 合并 Jenkins 文档
目标目录: `docs/ci-cd/`

**当前 jenkins/ 目录 (26 个文档)**，合并为：
- [ ] `README.md` - Jenkins 总览
- [ ] `setup.md` - 合并所有 setup 相关文档
  - `credentials-setup.md`
  - `github-webhook-setup-guide.md`
  - `jenkins-poll-scm-guide.md`
- [ ] `deployment.md` - 合并所有 deployment 相关文档
  - `deployment-strategies.md`
  - `deployment-strategy-comparison.md`
  - `docker-deployment-guide.md`
  - `smart-trigger-strategy.md`
- [ ] `job-management.md` - 合并任务管理文档
  - `create-individual-jobs-cli-guide.md`
  - `scm-path-filter-guide.md`
- [ ] `best-practices.md` - 最佳实践

**归档其余文档**到 `docs/archive/jenkins/`

### 3.4 整理模块架构文档
目标: `docs/architecture/`

- [ ] 保留 `module-architecture-complete-comparison.md` 作为主要参考
- [ ] 归档 `module-architecture-comparison.md`（旧版本）
- [ ] 创建 `docs/architecture/module-system.md` - 模块系统说明（精简版）

## Phase 4: 规范命名（优先级：低）

### 4.1 重命名全大写文档

#### docs/ 目录
- [ ] `ESLINT-I18N-RULES.md` → `eslint-i18n-rules.md`
- [ ] `I18N-NAMING-CONVENTION.md` → `i18n-naming-convention.md`
- [ ] `I18N-LOADING-ORDER.md` → `i18n-loading-order.md`
- [ ] `CDN_RESOURCE_ACCELERATION.md` → `cdn-resource-acceleration.md`
- [ ] `STORAGE_USAGE_AUDIT.md` → `storage-usage-audit.md`
- [ ] `CHART_ARCHITECTURE_ANALYSIS.md` → `chart-architecture-analysis.md`
- [ ] `GIT_TAG_GUIDE.md` → `git-tag-guide.md`
- [ ] `JENKINS_SETUP.md` → `jenkins-setup.md`
- [ ] `APP_DEVELOPMENT_GUIDE.md` → `app-development-guide.md`
- [ ] `SCRIPTS_USAGE.md` → `scripts-usage.md`
- [ ] `USER-CHECK-API.md` → `user-check-api.md`

#### packages/ 目录
- [ ] `shared-components/COMPONENT_ANALYSIS.md` → `component-analysis.md`
- [ ] `shared-components/COMPONENT_ANALYSIS_FILTER_TABLE_GROUP.md` → `component-analysis-filter-table-group.md`
- [ ] `shared-components/COMPONENT_NAMING_ANALYSIS.md` → `component-naming-analysis.md`
- [ ] `shared-components/GROUP_COMPONENTS_ANALYSIS.md` → `group-components-analysis.md`
- [ ] `shared-components/CIRCULAR_REFERENCE_GUIDE.md` → `circular-reference-guide.md`
- [ ] `shared-components/BTC_LAYOUT_ENHANCED_PLAN.md` → `btc-layout-enhanced-plan.md`
- [ ] `shared-components/BTC_LAYOUT_UNIFIED_ASSESSMENT.md` → `btc-layout-unified-assessment.md`
- [ ] `shared-components/BTC_DOUBLE_LAYOUT_MIGRATION_ASSESSMENT.md` → `btc-double-layout-migration-assessment.md`
- [ ] `shared-components/BTC_FILTER_TABLE_GROUP_IMPLEMENTATION_PLAN.md` → `btc-filter-table-group-implementation-plan.md`

## Phase 5: 创建导航文档（优先级：高）

### 5.1 创建 docs/README.md
- [ ] 创建文档导航索引
- [ ] 链接到各子目录
- [ ] 说明文档组织方式

### 5.2 更新根目录 README.md
- [ ] 添加"文档"章节
- [ ] 链接到 `docs/` 和 `apps/docs-app/`

### 5.3 更新 apps/docs-app 导航
- [ ] 更新 VitePress 配置中的侧边栏
- [ ] 删除已移除文档的链接
- [ ] 添加新文档的链接

## 验证清单

### 链接验证
- [ ] 所有内部链接可访问
- [ ] 所有图片链接有效
- [ ] 所有代码示例路径正确

### 内容验证
- [ ] 没有重复文档
- [ ] 过时文档已归档
- [ ] 文档命名符合规范
- [ ] 文档位置合理

### 可访问性验证
- [ ] 从 README.md 能找到所有重要文档
- [ ] docs/ 有清晰的导航
- [ ] docs-app 侧边栏正确

## 进度追踪

- **Phase 1 (删除重复)**: 0/40 ⬜⬜⬜⬜⬜
- **Phase 2 (归档过时)**: 0/30 ⬜⬜⬜⬜⬜
- **Phase 3 (重新组织)**: 0/20 ⬜⬜⬜⬜⬜
- **Phase 4 (规范命名)**: 0/25 ⬜⬜⬜⬜⬜
- **Phase 5 (创建导航)**: 0/6 ⬜⬜⬜⬜⬜

**总进度**: 0/121 (0%)

## 预期成果

### 清理前
- 文档总数: ~200
- 重复文档: ~15
- 空 README: ~30
- 过时文档: ~30

### 清理后
- 文档总数: ~140 (-30%)
- 重复文档: 0 (-100%)
- 空 README: 0 (-100%)
- 过时文档: 0 (已归档)

### 效益
- ✅ 减少维护成本
- ✅ 提高文档可发现性
- ✅ 避免信息混淆
- ✅ 规范文档管理
