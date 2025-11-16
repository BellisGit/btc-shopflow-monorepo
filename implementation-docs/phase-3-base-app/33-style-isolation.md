# 19.5 - 样式隔离方案

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 17

## 🎯 任务目标

配置 qiankun 样式隔离，防止主子应用 CSS 样式冲突。

## 📋 执行步骤

### 1. 配置 qiankun 样式隔离

**src/micro-app.ts**:
```typescript
import { registerMicroApps, start } from 'qiankun';
import { microApps } from './config/micro-apps';

export function setupMicroApps() {
  registerMicroApps(microApps, {
    // ... 生命周期钩子
  });

  start({
    // 🔥 样式隔离配置
    sandbox: {
      // 严格样式隔离：Shadow DOM 模式（可能导致弹窗等问题）
      strictStyleIsolation: false,

      // 实验性样式隔离：推荐使用，给子应用样式添加特殊前缀
      experimentalStyleIsolation: true,
    },

    // 预加载策略
    prefetch: 'all',

    // 单例模式
    singular: false,
  });
}
```

### 2. 主应用样式规范

**packages/main-app/src/styles/index.scss**:
```scss
/* 🔥 主应用样式统一添加命名空间 */
.main-app {
  // 全局样式
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #333;

  // 布局样式
  &__layout {
    display: flex;
    height: 100vh;
  }

  &__header {
    height: 60px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__sidebar {
    width: 200px;
    background: #001529;
  }

  &__content {
    flex: 1;
    padding: 20px;
  }
}

/* 🔥 子应用容器样式隔离 */
#subapp-container {
  width: 100%;
  height: 100%;
  position: relative;

  /* 重置子应用可能的样式影响 */
  & > div {
    width: 100%;
    height: 100%;
  }
}

/* Element Plus 组件库样式覆盖（主应用专用） */
.main-app {
  .el-button {
    /* 主应用按钮样式 */
  }

  .el-table {
    /* 主应用表格样式 */
  }
}
```

### 3. 子应用样式规范

**packages/logistics-app/src/styles/index.scss**:
```scss
/* 🔥 子应用样式统一添加命名空间 */
.logistics-app {
  // 子应用全局样式
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 业务组件样式
  &__order-list {
    padding: 20px;
  }

  &__order-detail {
    background: #fff;
    border-radius: 4px;
  }
}

/* Element Plus 组件库样式覆盖（子应用专用） */
.logistics-app {
  .el-button {
    /* 子应用按钮样式，不会影响主应用 */
  }
}

/* 🔥 确保子应用样式不会泄露到外部 */
:root {
  /* 子应用 CSS 变量 */
  --logistics-primary-color: #409EFF;
}
```

### 4. 应用根元素添加命名空间

**packages/main-app/src/App.vue**:
```vue
<template>
  <!-- 🔥 主应用根元素添加命名空间类 -->
  <div id="app" class="main-app">
    <div v-if="!isSubApp" class="main-app__layout">
      <router-view />
    </div>
    <div id="subapp-container" v-show="isSubApp"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import './styles/index.scss';

const route = useRoute();

const isSubApp = computed(() => {
  return route.path.startsWith('/logistics') ||
         route.path.startsWith('/production');
});
</script>
```

**packages/logistics-app/src/App.vue**:
```vue
<template>
  <!-- 🔥 子应用根元素添加命名空间类 -->
  <div id="logistics-app-root" class="logistics-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import './styles/index.scss';
</script>
```

### 5. Vite 配置 CSS Modules（可选）

**packages/main-app/vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  // 🔥 CSS Modules 配置
  css: {
    modules: {
      // 生成的类名格式
      generateScopedName: '[name]__[local]___[hash:base64:5]',

      // 全局模式
      globalModulePaths: [/global\.scss$/],
    },

    preprocessorOptions: {
      scss: {
        // 自动注入全局变量
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
});
```

### 6. 处理第三方组件库样式

**处理 Element Plus 样式冲突**:
```typescript
// packages/main-app/src/main.ts
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

app.use(ElementPlus, {
  // 🔥 设置命名空间，避免与子应用冲突
  namespace: 'base-el',
});
```

```scss
// packages/main-app/src/styles/element-override.scss

/* 覆盖 Element Plus 命名空间 */
.base-el-button {
  /* 主应用专属样式 */
}
```

### 7. 解决弹窗样式问题

由于 `experimentalStyleIsolation` 会给样式添加属性选择器，可能导致 Teleport 的弹窗样式失效。

**解决方案：动态弹窗容器**

**packages/logistics-app/src/App.vue**:
```vue
<template>
  <div id="logistics-app-root" class="logistics-app">
    <router-view />

    <!-- 🔥 弹窗容器放在子应用根元素内 -->
    <div id="logistics-modal-container"></div>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';

// 提供弹窗容器
provide('modalContainer', '#logistics-modal-container');
</script>
```

**使用弹窗时指定容器**:
```vue
<template>
  <el-dialog
    v-model="visible"
    title="标题"
    :append-to-body="false"
    :teleport="modalContainer"
  >
    内容
  </el-dialog>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const modalContainer = inject('modalContainer', 'body');
</script>
```

## ✅ 验收标准

### 检查 1: 主子应用样式互不影响

```bash
# 1. 启动主应用和子应用
pnpm dev:all

# 2. 在主应用设置按钮样式
.main-app .el-button { background: red; }

# 3. 切换到子应用
# 预期: 子应用按钮样式不受影响

# 4. 在子应用设置表格样式
.logistics-app .el-table { border: 2px solid blue; }

# 预期: 主应用表格样式不受影响
```

### 检查 2: CSS 变量隔离

```bash
# 1. 主应用定义 CSS 变量
:root { --primary-color: #409EFF; }

# 2. 子应用定义相同变量
:root { --primary-color: #67C23A; }

# 预期: 各自生效，互不干扰
```

### 检查 3: 弹窗样式正常

```bash
# 1. 在子应用打开弹窗
# 预期: 弹窗样式正常显示

# 2. 检查弹窗 DOM
# 预期: 弹窗在子应用根元素内，而不是 body
```

### 检查 4: 样式动态加载

```bash
# 1. 切换到子应用
# 预期: 子应用样式自动加载

# 2. 切换回主应用
# 预期: 子应用样式自动卸载（或被隔离）
```

## 📝 检查清单

- [ ] qiankun 样式隔离配置
- [ ] 主应用添加命名空间类
- [ ] 子应用添加命名空间类
- [ ] SCSS 文件添加命名空间
- [ ] CSS Modules 配置（可选）
- [ ] Element Plus 命名空间设置
- [ ] 弹窗容器配置
- [ ] 主子应用样式互不影响
- [ ] 弹窗样式正常显示

## 🚨 常见问题

**Q: 子应用样式影响主应用？**
A: 确保开启 `experimentalStyleIsolation`，并给所有样式添加命名空间类

**Q: 弹窗样式丢失？**
A: 使用 `:teleport="'#logistics-modal-container'"` 将弹窗挂载到子应用内部容器

**Q: 第三方组件库样式冲突？**
A: 使用命名空间或 CSS Modules 隔离，例如 Element Plus 的 `namespace` 配置

**Q: CSS 变量冲突？**
A: 使用子应用特定的变量名，如 `--logistics-primary-color` 代替 `--primary-color`

## 💡 最佳实践

1. **统一命名规范**
   - 主应用：`.main-app-*`
   - 子应用：`.{子应用名}-*`
   - 例如：`.logistics-app-*`、`.production-app-*`

2. **CSS 变量命名**
   - 全局变量：`--global-*`
   - 子应用变量：`--{子应用名}-*`

3. **组件库隔离**
   - 使用 `namespace` 配置
   - 或者使用 CSS Modules

4. **弹窗处理**
   - 优先使用 `:append-to-body="false"`
   - 配合子应用内部容器使用

5. **构建优化**
   - 使用 `scoped` 属性
   - 使用 CSS Modules
   - 按需加载样式文件

## 🔗 下一步

- [20.5 - 全局错误处理](./20.5-error-boundary.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时
