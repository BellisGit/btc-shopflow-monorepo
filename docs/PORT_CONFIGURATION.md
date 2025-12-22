# 应用端口配置清单

## 开发环境端口配置

| 应用名称 | 端口 | HMR端口 | 配置文件 | 说明 |
|---------|------|---------|---------|------|
| system-app | 8080 | - | `apps/system-app/vite.config.ts` | 系统主应用 |
| admin-app | 8081 | 8081 | `apps/admin-app/vite.config.ts` | 管理应用 |
| logistics-app | 8082 | 8082 | `apps/logistics-app/vite.config.ts` | 物流应用 |
| quality-app | 8083 | 8083 | `apps/quality-app/vite.config.ts` | 质量应用 |
| production-app | 8084 | 8084 | `apps/production-app/vite.config.ts` | 生产应用 |
| engineering-app | 8085 | 8085 | `apps/engineering-app/vite.config.ts` | 工程应用 |
| finance-app | 8086 | 8086 | `apps/finance-app/vite.config.ts` | 财务应用 |
| docs-app | 8087 | 8088 | `apps/docs-app/.vitepress/config.ts` | 文档站点（VitePress） |
| mobile-app | 8091 | - | `apps/mobile-app/vite.config.ts` | 移动应用 |

## 端口冲突检查

### ✅ 无冲突
所有应用的端口都是唯一的，没有冲突：
- 8080: system-app
- 8081: admin-app
- 8082: logistics-app
- 8083: quality-app
- 8084: production-app
- 8085: engineering-app
- 8086: finance-app
- 8087: docs-app (主端口)
- 8088: docs-app (HMR端口)
- 8091: mobile-app

### ⚠️ 注意事项

1. **端口配置说明**：
   - 所有应用的端口都统一配置在各自的 `vite.config.ts` 中
   - `package.json` 中的 `dev` 脚本不再硬编码端口参数，使用配置文件中的端口

2. **docs-app 使用两个端口**：
   - 主服务器端口: 8087
   - HMR 端口: 8088 (避免与主端口冲突)

3. **端口范围**：
   - 应用端口范围: 8080-8087, 8091
   - HMR 端口: 与主端口相同（docs-app 除外，使用 8088）

## Docker 部署端口映射

根据 `docker-compose.yml`，生产环境的端口映射（已与开发环境保持一致）：
- system-app: 8080:80
- admin-app: 8081:80
- logistics-app: 8082:80
- quality-app: 8083:80
- production-app: 8084:80
- engineering-app: 8085:80
- finance-app: 8086:80
- docs-app: 8087:80
- mobile-app: 8091:80

✅ **已与开发环境端口完全一致**

## 建议

1. **统一端口配置**：所有应用的端口都统一配置在各自的 `vite.config.ts` 中，`package.json` 中的 `dev` 脚本不再硬编码端口参数
2. **开发与生产环境一致**：Docker 部署的端口映射已与开发环境完全一致，便于开发和部署切换
3. **端口预留**：如需添加新应用，建议使用 8092+ 的端口范围
