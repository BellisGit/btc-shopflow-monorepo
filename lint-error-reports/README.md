# ESLint 国际化错误报告

生成时间: 2026-01-07 16:49:16

## 报告文件说明

- $allErrors: 所有错误的完整列表（约 806KB）
- $summary: 错误统计摘要
- pp-*-*.txt: 各应用的详细错误列表
- package-*-*.txt: 各包的详细错误列表

## 统计摘要

总错误数: **3785 个**

### 按应用分类（前10名）
1. **system-app**: 524 个
1. **main-app**: 451 个
1. **docs-app**: 387 个
1. **mobile-app**: 171 个
1. **quality-app**: 139 个
1. **logistics-app**: 73 个
1. **home-app**: 40 个
1. **operations-app**: 31 个
1. **admin-app**: 28 个
1. **personnel-app**: 23 个

### 按包分类
- **shared-core**: 706 个
- **shared-components**: 517 个
- **vite-plugin**: 94 个
- **shared-router**: 1 个

### 按文件类型
- TypeScript: 2640 个
- Vue: 1063 个

## 修复建议

建议按以下优先级修复：

1. **共享包**（shared-core、shared-components）- 影响所有应用
2. **system-app** - 错误最多（524个）
3. **main-app** - 错误较多（451个）
4. **docs-app** - 错误较多（387个）
5. 其他应用按错误数量依次修复
