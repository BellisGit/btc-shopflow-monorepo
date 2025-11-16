# 03 - ESLint & Prettier 配置

> **阶段**: Phase 1 | **时间**: 1小时 | **前置**: 02

## 🎯 任务目标

配置 ESLint 代码检查和 Prettier 代码格式化工具。

## 📋 执行步骤

### 1. 安装 ESLint 相关依赖

```bash
pnpm add -Dw eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -Dw eslint-plugin-vue eslint-config-prettier
```

### 2. 创建 ESLint 配置

**.eslintrc.js**:
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
  },
};
```

### 3. 安装 Prettier

```bash
pnpm add -Dw prettier
```

### 4. 创建 Prettier 配置

**.prettierrc**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 5. 创建忽略文件

**.prettierignore**:
```
node_modules
dist
.husky
pnpm-lock.yaml
```

### 6. 添加脚本到 package.json

```json
{
  "scripts": {
    "lint": "eslint --ext .ts,.tsx,.vue packages/*/src",
    "lint:fix": "eslint --ext .ts,.tsx,.vue packages/*/src --fix",
    "format": "prettier --write \"packages/**/*.{ts,tsx,vue,json,md}\""
  }
}
```

### 7. 创建 .editorconfig

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## ✅ 验收标准

### 检查 1: ESLint 运行

```bash
pnpm lint
# 预期: 执行成功（可能有警告）
```

### 检查 2: Prettier 格式化

```bash
# 创建测试文件
echo "const test='test';const foo={a:1,b:2}" > test.ts

# 格式化
pnpm format

# 检查结果
cat test.ts
# 预期: 代码已格式化
```

### 检查 3: 配置生效

```typescript
// 创建有问题的文件
echo "const unusedVar = 123;" > test.ts

pnpm lint
# 预期: 报错 unusedVar 未使用
```

## 📝 检查清单

- [ ] ESLint 安装成功
- [ ] Prettier 安装成功
- [ ] .eslintrc.js 创建
- [ ] .prettierrc 创建
- [ ] .editorconfig 创建
- [ ] lint 脚本可用
- [ ] format 脚本可用
- [ ] 规则生效

## 🚨 常见问题

**Q: ESLint 和 Prettier 冲突？**  
A: 已配置 eslint-config-prettier，会自动禁用冲突规则

**Q: Vue 文件检查不生效？**  
A: 确保安装了 eslint-plugin-vue 并正确配置 parser

## 🔗 下一步

- [04 - Git Hooks 配置](./04-git-hooks.md)

---

**状态**: ✅ 就绪 | **预计时间**: 1小时

