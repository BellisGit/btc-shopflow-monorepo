# 07.6 - Tailwind + UnoCSS 配置

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 07.5

## 🎯 任务目标

配置原子化 CSS 方案，提升样式开发效率。

## 📋 执行步骤

### 1. 安装 UnoCSS

```bash
pnpm add -Dw unocss @unocss/preset-uno @unocss/preset-attributify
```

### 2. 创建 UnoCSS 配置

**uno.config.ts**:
```typescript
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  
  shortcuts: {
    'btn': 'px-4 py-2 rounded inline-block bg-blue-500 text-white cursor-pointer hover:bg-blue-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'btn-primary': 'bg-blue-500 hover:bg-blue-600',
    'btn-success': 'bg-green-500 hover:bg-green-600',
    'btn-danger': 'bg-red-500 hover:bg-red-600',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
  },

  theme: {
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
    },
  },
});
```

### 3. 集成到 Vite

**packages/main-app/vite.config.ts**:
```typescript
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
});
```

### 4. 引入样式

**packages/main-app/src/main.ts**:
```typescript
import 'virtual:uno.css';
import { createApp } from 'vue';
// ...
```

### 5. 使用示例

**示例组件**:
```vue
<template>
  <!-- Tailwind 风格 -->
  <div class="flex items-center justify-between p-4 bg-white rounded shadow">
    <h1 class="text-2xl font-bold text-gray-800">标题</h1>
    <button class="btn btn-primary">按钮</button>
  </div>

  <!-- Attributify 风格 -->
  <div 
    flex="~ items-center justify-between" 
    p="4" 
    bg="white" 
    rounded 
    shadow
  >
    <h1 text="2xl" font="bold" text="gray-800">标题</h1>
    <button class="btn btn-primary">按钮</button>
  </div>
</template>
```

### 6. VSCode 配置（可选）

**.vscode/settings.json**:
```json
{
  "unocss.root": ".",
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## ✅ 验收标准

### 检查：样式生效

```bash
pnpm dev

# 访问页面，检查元素
# 预期: 原子化类名正确应用
```

### 检查：按需生成

```bash
pnpm build

# 检查 CSS 文件大小
ls -lh packages/main-app/dist/assets/*.css
# 预期: CSS 文件很小（< 50KB）
```

## 📝 检查清单

- [ ] UnoCSS 安装
- [ ] 配置文件创建
- [ ] Vite 集成
- [ ] 样式引入
- [ ] 工具类生效
- [ ] 按需生成
- [ ] VSCode 提示

## 🔗 下一步

- [07.7 - 国际化配置](./07.7-i18n-setup.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

