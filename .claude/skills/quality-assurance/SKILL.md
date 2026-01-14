---
name: quality-assurance
description: 质量保证工具，Lint检查、类型检查、循环依赖检查、测试运行
---

# 质量保证

## 何时使用

当你需要：代码检查、修复lint错误、类型检查、运行测试、检测循环依赖

## 代码质量检查

Lint检查:
  pnpm lint:all           # 检查所有
  pnpm lint:app --app=admin-app  # 检查单个应用
  pnpm lint:fix --app=admin-app  # 自动修复

类型检查:
  pnpm type-check:all     # 检查所有
  pnpm type-check:app --app=admin-app  # 检查单个

循环依赖检查:
  pnpm check:circular
  node scripts/commands/check/check-circular-deps.mjs

i18n检查:
  pnpm check:i18n         # 检查所有
  pnpm check:i18n:apps    # 只检查apps

## 测试运行

单元测试:
  pnpm test:unit

集成测试:
  pnpm test:integration

E2E测试:
  pnpm test:e2e
  pnpm exec playwright test

CI测试（全部）:
  pnpm test:ci

## 错误报告生成

TypeScript错误:
  pnpm ts-error-stats      # 统计
  pnpm ts-error-reports    # 生成报告

Lint错误:
  pnpm lint-error-reports  # 生成lint错误报告

## 代码格式化

格式化代码:
  pnpm format
  prettier --write \"packages/**/*.{ts,tsx,vue,json,md}\"

## 构建前检查（推荐）

发布前完整检查:
  pnpm type-check:all
  pnpm lint:all
  pnpm check:circular
  pnpm check:i18n:all
  pnpm test:ci

## 常见Lint错误

no-chinese-in-template:
  → 使用 \('i18n.key') 替换硬编码中文

require-i18n-key:
  → 确保使用i18n key

i18n-key-format:
  → key格式: module.feature.item

@typescript-eslint/no-explicit-any:
  → 使用具体类型替换any

## 常见类型错误

Property 'xxx' does not exist:
  → 检查类型定义，添加接口

Cannot find module:
  → 检查导入路径，确保包已构建

Argument of type 'X' is not assignable:
  → 检查类型兼容性

## 性能检查

构建性能:
  # Turbo会显示构建时间
  pnpm build:all

运行时性能:
  # 使用Vue DevTools Performance面板

## 常见问题

Q: 如何修复所有lint错误?
A: pnpm lint:fix --app=admin-app（谨慎使用）

Q: 类型错误太多怎么办?
A: pnpm ts-error-stats 查看统计，逐步修复

Q: 循环依赖怎么解决?
A: 查看报告，重构导入关系

Q: 测试失败怎么办?
A: 查看测试日志，修复失败的测试用例
