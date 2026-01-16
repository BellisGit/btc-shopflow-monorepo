---
name: build-guide  
description: BTC ShopFlow 构建指南，包括4种构建模式、单应用/全量构建、预览构建等
---

# 构建指南

## 何时使用

当你需要：构建应用、了解构建模式、预览构建结果、排查构建错误

## 4种构建模式

模式1 - build（基础构建）:
  用途: 本地开发、CI测试、快速构建
  命令: pnpm build:all / pnpm build:app --app=admin-app
  产物: apps/{app}/dist/
  特点: 快速，无CDN

模式2 - build-cdn（CDN构建）:
  用途: CDN部署，静态资源加速
  命令: pnpm build-cdn:all / pnpm build-cdn:system
  产物: apps/{app}/dist-cdn/
  特点: 资源上传OSS，CDN加速
  需要: 配置OSS环境变量

模式3 - build-dist（集中构建）:
  用途: 服务器部署
  命令: pnpm build-dist:all / pnpm build-dist:system  
  产物: dist/{app}/ (根目录)
  特点: 产物集中，方便部署

模式4 - build-dist-cdn（完整构建）:
  用途: 生产环境（服务器+CDN）
  命令: pnpm build-dist-cdn:all / pnpm build-dist-cdn:admin
  产物: dist-cdn/{app}/
  特点: 生产最佳，CDN加速

## 预览构建

本地预览:
  pnpm preview:all
  pnpm preview:app --app=admin-app

构建并预览:
  pnpm build-preview:all
  pnpm build-preview:layout

## 构建前检查

自动检查（prebuild）:
  pnpm check:circular  # 循环依赖
  pnpm run prebuild:all  # 清理缓存

手动检查:
  pnpm type-check:all
  pnpm lint:all
  pnpm check:i18n

## 构建优化

并发构建: Turbo 自动并发（concurrency=20）
增量构建: Turbo 自动检测变更
清理缓存: pnpm clean:vite / pnpm clean

## 常见构建错误

Cannot find module:
  → 运行 pnpm build:share

Type errors:
  → pnpm type-check:app --app=admin-app
  → pnpm ts-error-reports

Out of memory:
  → export NODE_OPTIONS=\"--max-old-space-size=8192\"
  → 重新构建

Circular dependency:
  → pnpm check:circular
  → 根据报告修复

Build hangs:
  → pnpm clean:vite
  → rm -rf node_modules pnpm-lock.yaml && pnpm install

## 构建脚本位置

scripts/commands/build/:
  - cdn-build.mjs
  - dist-build.mjs  
  - dist-cdn-build.mjs
  - preview-build.mjs

统一入口:
  node scripts/bin/build.js cdn system-app
