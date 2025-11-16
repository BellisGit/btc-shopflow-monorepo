# 20 - 布局-头部组件

> **阶段**: Phase 3 | **时间**: 2小时 | **前置**: 19

## 🎯 任务目标

开发主应用头部组件，包含用户信息和退出功能。

## 📋 执行步骤

### 1. 创建头部组件

**src/layouts/components/Header.vue**:
```vue
<template>
  <div class="layout-header">
    <div class="left">
      <h1>BTC 管理系统</h1>
    </div>

    <div class="right">
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32">{{ userStore.userInfo?.name?.[0] }}</el-avatar>
          <span class="name">{{ userStore.userInfo?.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/profile');
  }
};
</script>

<style scoped>
.layout-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: white;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
```

### 2. 创建默认布局

**src/layouts/default.vue**:
```vue
<template>
  <div class="layout">
    <Header />
    <div class="main">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 20px;
}
</style>
```

## ✅ 验收标准

### 检查：头部显示

```vue
<template>
  <DefaultLayout>
    <div>内容区域</div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue';
</script>
```

## 📝 检查清单

- [ ] 头部组件创建
- [ ] 用户信息显示
- [ ] 下拉菜单
- [ ] 退出登录功能
- [ ] 默认布局创建
- [ ] 样式正确

## 🔗 下一步

- [21 - 布局-侧边栏组件](./21-layout-sidebar.md)

