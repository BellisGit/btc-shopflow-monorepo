# 02 - TypeScript 统一配置

> **阶段**: Phase 1 | **时间**: 1小时 | **前置**: 01

## 🎯 任务目标

配置 TypeScript 根配置和子包继承关系，设置路径别名。

## 📋 执行步骤

### 1. 安装 TypeScript

```bash
pnpm add -Dw typescript @types/node
```

### 2. 创建根 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@btc/shared-utils": ["packages/shared-utils/src"],
      "@btc/shared-components": ["packages/shared-components/src"],
      "@btc/shared-core": ["packages/shared-core/src"]
    }
  },
  "exclude": ["node_modules", "dist", "**/dist"]
}
```

### 3. 创建子包 tsconfig 模板

**packages/tsconfig.base.json**:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "/@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. 为每个包创建 tsconfig.json

```bash
# shared-utils
cat > packages/shared-utils/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.base.json"
}
EOF

# shared-components
cat > packages/shared-components/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.base.json"
}
EOF

# shared-core
cat > packages/shared-core/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.base.json"
}
EOF
```

### 5. 更新根 package.json 添加类型检查

```json
{
  "scripts": {
    "type-check": "pnpm -r --parallel run type-check"
  }
}
```

### 6. 为每个包添加 type-check 脚本

**packages/shared-utils/package.json**:
```json
{
  "name": "@btc/shared-utils",
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

对其他包重复此步骤。

## ✅ 验收标准

### 检查 1: TypeScript 版本

```bash
pnpm exec tsc --version
# 预期: Version 5.x.x
```

### 检查 2: 根配置生效

```bash
cat tsconfig.json | grep "target"
# 预期: "target": "ES2020"
```

### 检查 3: 路径别名配置

```typescript
// 创建测试文件
echo "import { test } from '@btc/shared-utils';" > test.ts

# 运行类型检查
pnpm exec tsc --noEmit test.ts
# 预期: 能识别路径别名
```

### 检查 4: 子包继承

```bash
cd packages/shared-utils
pnpm exec tsc --showConfig | grep "target"
# 预期: 继承根配置
```

## 📝 检查清单

- [ ] TypeScript 安装成功
- [ ] 根 tsconfig.json 创建
- [ ] 子包 tsconfig.base.json 创建
- [ ] 所有子包 tsconfig.json 创建
- [ ] 路径别名配置正确
- [ ] 类型检查脚本添加
- [ ] tsc --noEmit 无错误

## 🚨 常见问题

**Q: 路径别名不生效？**  
A: 检查 baseUrl 和 paths 配置，确保相对路径正确

**Q: VSCode 不识别别名？**  
A: 重启 TS Server (Cmd+Shift+P -> Restart TS Server)

## 🔗 下一步

- [03 - ESLint & Prettier 配置](./03-eslint-prettier.md)

---

**状态**: ✅ 就绪 | **预计时间**: 1小时

