# 07.7 - 国际化配置

> **阶段**: Phase 1 | **时间**: 2小时 | **前置**: 07.6

## 🎯 任务目标

在 @btc/shared-core 中创建 i18n 插件，实现多语言支持，供主应用和子应用共享使用。

## 📋 执行步骤

### 1. 安装 vue-i18n

```bash
pnpm add -Dw vue-i18n@9
```

### 2. 创建语言文件（共享库）

**packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts**:
```typescript
export default {
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    search: '搜索',
    reset: '重置',
  },
  menu: {
    dashboard: '首页',
    system: '系统管理',
    user: '用户管理',
    role: '角色管理',
  },
  user: {
    username: '用户名',
    password: '密码',
    login: '登录',
    logout: '退出',
  },
};
```

**packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts**:
```typescript
export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    search: 'Search',
    reset: 'Reset',
  },
  menu: {
    dashboard: 'Dashboard',
    system: 'System',
    user: 'User Management',
    role: 'Role Management',
  },
  user: {
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
  },
};
```

### 3. 创建 i18n 插件

**packages/shared-core/src/btc/plugins/i18n/index.ts**:
```typescript
import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import { storage } from '@btc/shared-utils';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export interface I18nPluginOptions {
  locale?: string;
  fallbackLocale?: string;
  messages?: Record<string, any>;
}

export function createI18nPlugin(options: I18nPluginOptions = {}) {
  const i18n = createI18n({
    legacy: false,
    locale: storage.get('locale') || options.locale || 'zh-CN',
    fallbackLocale: options.fallbackLocale || 'zh-CN',
    messages: {
      ...messages,
      ...options.messages, // 允许应用扩展语言包
    },
  });

  return {
    name: 'i18n',
    install(app: App) {
      app.use(i18n);
      
      // 监听语言切换
      const locale = i18n.global.locale;
      if (typeof locale !== 'string') {
        // @ts-ignore
        locale.value && storage.set('locale', locale.value);
      }
    },
    i18n,
  };
}

export { useI18n } from 'vue-i18n';
```

### 4. 导出插件

**packages/shared-core/src/btc/plugins/index.ts**:
```typescript
export * from './i18n';
```

**packages/shared-core/src/index.ts**:
```typescript
export * from './btc/plugins';
```

### 5. 主应用中使用

**packages/main-app/src/main.ts**:
```typescript
import { createI18nPlugin } from '@btc/shared-core';

const i18nPlugin = createI18nPlugin({
  // 可选：扩展语言包
  messages: {
    'zh-CN': {
      app: {
        title: 'BTC 微前端系统',
      },
    },
  },
});

app.use(i18nPlugin);
```

### 6. 子应用中使用

**packages/logistics-app/src/main.ts**:
```typescript
import { createI18nPlugin } from '@btc/shared-core';

// 子应用可以添加自己的语言包
const i18nPlugin = createI18nPlugin({
  messages: {
    'zh-CN': {
      logistics: {
        order: '订单',
        warehouse: '仓库',
      },
    },
  },
});

subApp.use(i18nPlugin);
```

### 5. 使用示例

**组件中使用**:
```vue
<template>
  <div>
    <!-- 直接使用 -->
    <h1>{{ $t('menu.dashboard') }}</h1>
    
    <!-- Composition API -->
    <button @click="handleLogin">{{ t('user.login') }}</button>

    <!-- 切换语言 -->
    <select v-model="locale">
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const handleLogin = () => {
  console.log(t('user.login'));
};
</script>
```

### 6. Element Plus 国际化

```typescript
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();

app.use(ElementPlus, {
  locale: i18n.locale.value === 'zh-CN' ? zhCn : en,
});
```

## ✅ 验收标准

### 检查：语言切换

```bash
# 访问应用
# 切换语言选择器
# 预期: 界面文字切换为对应语言
```

### 检查：持久化

```bash
# 切换语言后刷新页面
# 预期: 保持所选语言
```

## 📝 检查清单

- [ ] vue-i18n 安装到根目录
- [ ] 插件目录创建（shared-core/src/btc/plugins/i18n/）
- [ ] 语言文件创建（zh-CN.ts, en-US.ts）
- [ ] createI18nPlugin 函数实现
- [ ] 插件导出到 @btc/shared-core
- [ ] 主应用可使用插件
- [ ] 子应用可使用插件
- [ ] 组件中 $t() 可用
- [ ] 语言切换正常
- [ ] 持久化存储（localStorage）

## 🔗 下一步

- [07.8 - 自动导入配置](./07.8-auto-import.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

