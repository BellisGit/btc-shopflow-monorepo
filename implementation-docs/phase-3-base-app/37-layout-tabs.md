# 21.5 - 页签管理

> **阶段**: Phase 3 | **时间**: 3小时 | **前置**: 21

## 🎯 任务目标

实现多页签管理，支持页面缓存和快速切换。

## 📋 执行步骤

### 1. 创建页签 Store

**src/store/tabs.ts**:
```typescript
import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

interface TabItem {
  path: string;
  title: string;
  name: string;
  query?: Record<string, any>;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as TabItem[],
    activeTab: '',
    cachedViews: [] as string[],
  }),

  actions: {
    addTab(route: RouteLocationNormalizedLoaded) {
      const tab: TabItem = {
        path: route.path,
        title: (route.meta?.title as string) || '未命名',
        name: route.name as string,
        query: route.query,
      };

      // 避免重复
      if (!this.tabs.find(t => t.path === tab.path)) {
        this.tabs.push(tab);
      }

      this.activeTab = tab.path;

      // 添加到缓存
      if (route.meta?.keepAlive && route.name) {
        if (!this.cachedViews.includes(route.name as string)) {
          this.cachedViews.push(route.name as string);
        }
      }
    },

    removeTab(path: string) {
      const index = this.tabs.findIndex(t => t.path === path);
      if (index > -1) {
        const tab = this.tabs[index];
        this.tabs.splice(index, 1);

        // 移除缓存
        const cacheIndex = this.cachedViews.indexOf(tab.name);
        if (cacheIndex > -1) {
          this.cachedViews.splice(cacheIndex, 1);
        }
      }
    },

    removeOtherTabs(path: string) {
      this.tabs = this.tabs.filter(t => t.path === path);
      this.cachedViews = this.tabs.map(t => t.name);
    },

    removeAllTabs() {
      this.tabs = [];
      this.cachedViews = [];
      this.activeTab = '';
    },
  },
});
```

### 2. 创建页签组件

**src/layouts/components/Tabs.vue**:
```vue
<template>
  <div class="tabs-bar">
    <el-tag
      v-for="tab in tabsStore.tabs"
      :key="tab.path"
      :closable="tabsStore.tabs.length > 1"
      :effect="tab.path === route.path ? 'dark' : 'plain'"
      @click="handleTabClick(tab)"
      @close="handleTabClose(tab)"
    >
      {{ tab.title }}
    </el-tag>

    <el-dropdown @command="handleCommand">
      <el-button size="small" text>
        <el-icon><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">刷新</el-dropdown-item>
          <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useTabsStore } from '@/store/tabs';

const router = useRouter();
const route = useRoute();
const tabsStore = useTabsStore();

const handleTabClick = (tab: any) => {
  router.push(tab.path);
};

const handleTabClose = (tab: any) => {
  tabsStore.removeTab(tab.path);
  
  // 如果关闭的是当前页，跳转到最后一个
  if (tab.path === route.path && tabsStore.tabs.length > 0) {
    router.push(tabsStore.tabs[tabsStore.tabs.length - 1].path);
  }
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      router.go(0);
      break;
    case 'closeOthers':
      tabsStore.removeOtherTabs(route.path);
      break;
    case 'closeAll':
      tabsStore.removeAllTabs();
      router.push('/');
      break;
  }
};
</script>

<style scoped>
.tabs-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.el-tag {
  cursor: pointer;
}
</style>
```

### 3. 监听路由变化

**src/App.vue**:
```vue
<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTabsStore } from '@/store/tabs';

const route = useRoute();
const tabsStore = useTabsStore();

watch(
  () => route.path,
  () => {
    if (route.meta?.noTab) return;
    tabsStore.addTab(route);
  },
  { immediate: true }
);
</script>
```

### 4. 集成到布局

**src/layouts/default.vue**:
```vue
<template>
  <div class="layout">
    <Header />
    <Tabs />
    <div class="container">
      <Sidebar />
      <div class="main">
        <router-view v-slot="{ Component }">
          <keep-alive :include="tabsStore.cachedViews">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useTabsStore } from '@/store/tabs';
import Tabs from './components/Tabs.vue';

const route = useRoute();
const tabsStore = useTabsStore();
</script>
```

## ✅ 验收标准

### 检查：页签功能

```bash
# 访问多个页面
/dashboard -> /system/user -> /system/role

# 预期:
- 顶部显示3个页签
- 点击页签可切换
- 可关闭页签
- 页面有缓存（输入的内容保留）
```

## 📝 检查清单

- [ ] Tabs Store 创建
- [ ] 页签组件创建
- [ ] 路由监听
- [ ] keep-alive 缓存
- [ ] 关闭其他/全部
- [ ] 集成到布局
- [ ] 功能正常

## 🔗 下一步

- [22 - 登录认证](./22-auth-login.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

