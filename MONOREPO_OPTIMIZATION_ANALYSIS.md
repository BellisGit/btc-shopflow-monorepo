# BTC ShopFlow Monorepo 优化分析报告

基于《monorepo项目建议.md》的10条最佳实践，对当前项目进行全面分析。

## 📊 总体评估

| 建议项 | 状态 | 优先级 | 说明 |
|--------|------|--------|------|
| 1. 按业务域命名 | ⚠️ 部分符合 | 中 | 包命名混合了技术和业务 |
| 2. workspace: 协议 | ❌ 不符合 | 高 | 应用层未使用 workspace:* |
| 3. 严格 tsconfig.base.json | ⚠️ 部分符合 | 高 | 缺少严格类型检查选项 |
| 4. TypeScript Project References | ❌ 不符合 | 中 | 未使用 composite 和 references |
| 5. 统一构建工具 | ⚠️ 部分符合 | 中 | 使用 vite 而非 tsup |
| 6. 干净的 exports | ⚠️ 部分符合 | 中 | 存在 deep imports |
| 7. Changesets 发布 | ❌ 不符合 | 低 | 未使用 Changesets |
| 8. ESLint 强化边界 | ❌ 不符合 | 高 | 缺少 import 边界规则 |
| 9. Vitest workspace | ⚠️ 部分符合 | 低 | 仅 admin-app 有测试 |
| 10. 环境变量类型管理 | ⚠️ 部分符合 | 中 | 有统一配置但未用 Zod |

---

## 🔍 详细分析

### 1. 按业务域命名，而不是按技术层命名

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ 应用层按业务命名：`admin-app`, `logistics-app`, `quality-app` 等
- ❌ 包层按技术命名：`shared-core`, `shared-components`, `shared-utils`
- ✅ 有业务包：`subapp-manifests`（虽然命名不够业务化）

**建议：**
```diff
packages/
- shared-core/          → auth/ (认证授权)
- shared-components/    → ui/ (UI组件库)
- shared-utils/         → utils/ (工具库，可保留)
+ auth/                 (认证授权相关)
+ billing/              (计费相关，如有)
+ ui/                   (UI组件库)
```

**影响：** 中等，需要大量重构，但长期收益高

---

### 2. 统一使用 workspaces + workspace: 协议

**当前状态：** ❌ 不符合

**现状：**
- ✅ `packages/shared-components/package.json` 在 devDependencies 中使用 `workspace:*`
- ❌ `apps/admin-app/package.json` 使用固定版本 `^1.0.0`
- ❌ 其他应用也使用固定版本

**问题示例：**
```json
// apps/admin-app/package.json
"dependencies": {
  "@btc/shared-components": "^1.0.0",  // ❌ 应该用 workspace:*
  "@btc/shared-core": "^1.0.0"          // ❌ 应该用 workspace:*
}
```

**建议修复：**
```json
// apps/admin-app/package.json
"dependencies": {
  "@btc/shared-components": "workspace:*",
  "@btc/shared-core": "workspace:*",
  "@btc/shared-utils": "workspace:*"
}
```

**影响：** 高，这是导致版本漂移和发布问题的根源

---

### 3. 使用一个严格的 tsconfig.base.json

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ 有 `packages/tsconfig.base.json`
- ❌ 缺少严格类型检查选项：
  - 缺少 `noUncheckedIndexedAccess`
  - 缺少 `exactOptionalPropertyTypes`
  - 缺少 `verbatimModuleSyntax`
  - `noUnusedLocals` 和 `noUnusedParameters` 设为 false

**当前配置：**
```json
{
  "strict": true,
  "noUnusedLocals": false,        // ❌ 应该启用
  "noUnusedParameters": false,     // ❌ 应该启用
  // 缺少 noUncheckedIndexedAccess
  // 缺少 exactOptionalPropertyTypes
  // 缺少 verbatimModuleSyntax
}
```

**建议：**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**影响：** 高，能及早发现类型问题

---

### 4. 使用 TypeScript Project References + build mode

**当前状态：** ❌ 不符合

**现状：**
- ✅ `packages/shared-core/tsconfig.json` 有 `composite: true`
- ❌ 缺少 `references` 配置
- ❌ 根目录没有统一的构建脚本使用 `tsc -b`

**建议：**
```json
// packages/shared-core/tsconfig.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared-utils" }
  ]
}
```

**根目录脚本：**
```json
{
  "scripts": {
    "build:ts": "tsc -b packages/*",
    "build:ts:watch": "tsc -b -w packages/*"
  }
}
```

**影响：** 中等，能显著提升构建速度

---

### 5. 统一库构建工具：库用 tsup，开发用 tsx

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ 使用 vite 构建（功能完整）
- ❌ 未使用 tsup（更轻量、更快）
- ❌ 未使用 tsx（开发时运行 TypeScript）

**建议：**
```json
// packages/shared-core/package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --dts --format esm,cjs --clean"
  }
}
```

**影响：** 中等，tsup 构建更快，但迁移成本较高

---

### 6. 使用干净的 exports，不要允许 deep imports

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ `packages/shared-components/package.json` 有 exports 配置
- ⚠️ 但允许了一些 deep imports：
  ```json
  "./store/menuRegistry": {...},
  "./components/layout/app-layout/utils": {...},
  "./charts/utils": {...}
  ```

**问题：**
- 允许 deep imports 会导致包内部重构困难
- 应用可能直接导入 `@btc/shared-components/src/...`

**建议：**
- 只暴露顶层 API
- 通过命名导出提供所有功能
- 移除 deep import 路径

**影响：** 中等，需要重构导入方式

---

### 7. 使用 Changesets 发布

**当前状态：** ❌ 不符合

**现状：**
- ❌ 未使用 Changesets
- ✅ 有自定义发布脚本 `scripts/release-version.mjs`

**建议：**
```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

**配置：**
```json
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main"
}
```

**脚本：**
```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm -r build && changeset publish"
  }
}
```

**影响：** 低，当前发布流程可用，但 Changesets 更规范

---

### 8. 用 ESLint 强化边界，而不是靠团队默契

**当前状态：** ❌ 不符合

**现状：**
- ✅ 有 `.eslintrc.js`
- ❌ 缺少 `import/no-restricted-paths` 规则
- ❌ 缺少 `import/no-cycle` 规则

**建议：**
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        // shared-components 不能导入 shared-core 的内部实现
        {
          target: './packages/shared-components/**',
          from: './packages/shared-core/src/**',
          except: ['./packages/shared-core/dist']
        },
        // 应用不能直接导入包的 src
        {
          target: './apps/**',
          from: './packages/**/src/**',
          except: ['./packages/**/dist']
        }
      ]
    }],
    'import/no-cycle': 'error'
  }
};
```

**影响：** 高，能防止架构退化

---

### 9. 一个测试运行器，多项目共用：Vitest workspace

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ 使用 Vitest
- ❌ 只有 `apps/admin-app` 有测试配置
- ❌ 缺少根目录的 `vitest.workspace.ts`

**建议：**
```typescript
// vitest.workspace.ts (根目录)
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      include: ['packages/**/src/**/*.test.ts'],
      name: 'packages'
    }
  },
  {
    test: {
      include: ['apps/**/src/**/*.test.{ts,tsx}'],
      name: 'apps'
    }
  }
]);
```

**影响：** 低，当前测试覆盖不足，需要先增加测试

---

### 10. 集中管理环境变量类型：在 @acme/env 中用 Zod 校验

**当前状态：** ⚠️ 部分符合

**现状：**
- ✅ 有 `configs/unified-env-config.ts`
- ❌ 未使用 Zod 进行运行时验证
- ❌ 环境变量类型未集中管理

**建议：**
```typescript
// packages/env/src/index.ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  VITE_APP_TITLE: z.string(),
  VITE_APP_BASE_API: z.string().url(),
  VITE_APP_UPLOAD_URL: z.string().url().optional(),
});

export const env = schema.parse({
  NODE_ENV: import.meta.env.MODE,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  VITE_APP_BASE_API: import.meta.env.VITE_APP_BASE_API,
  VITE_APP_UPLOAD_URL: import.meta.env.VITE_APP_UPLOAD_URL,
});

export type Env = z.infer<typeof schema>;
```

**影响：** 中等，能及早发现配置错误

---

## 🎯 优化优先级建议

### 高优先级（立即执行）

1. **修复 workspace: 协议** ⭐⭐⭐
   - 影响：防止版本漂移
   - 工作量：小（批量替换）
   - 风险：低

2. **强化 ESLint 边界规则** ⭐⭐⭐
   - 影响：防止架构退化
   - 工作量：小（添加规则）
   - 风险：低

3. **增强 tsconfig.base.json 严格性** ⭐⭐
   - 影响：及早发现类型问题
   - 工作量：中（需要修复类型错误）
   - 风险：中

### 中优先级（计划执行）

4. **实现 TypeScript Project References**
5. **清理 exports，移除 deep imports**
6. **环境变量 Zod 验证**

### 低优先级（可选）

7. **迁移到 tsup**
8. **引入 Changesets**
9. **重构包命名（业务域）**
10. **统一测试配置**

---

## 📝 实施建议

### 第一阶段：快速修复（1-2天）

1. 批量替换应用层的依赖版本为 `workspace:*`
2. 添加 ESLint 边界规则
3. 增强 tsconfig.base.json 严格性（逐步启用）

### 第二阶段：架构优化（1周）

4. 实现 TypeScript Project References
5. 清理 exports，移除不必要的 deep imports
6. 添加环境变量 Zod 验证

### 第三阶段：长期改进（按需）

7. 考虑迁移到 tsup（如果构建速度成为瓶颈）
8. 引入 Changesets（如果需要更规范的发布流程）
9. 重构包命名（如果团队认为有必要）

---

## 🔗 相关文件

- 根目录 `package.json`
- `packages/tsconfig.base.json`
- `.eslintrc.js`
- `apps/*/package.json`
- `packages/*/package.json`

---

**生成时间：** 2025-01-27
**分析基准：** monorepo项目建议.md

