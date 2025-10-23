<template>
  <div class="app-layout" :class="{ 'is-collapse': isCollapse, 'is-full': isFullscreen }">
    <!-- 顶栏（包含汉堡菜单、Logo、折叠按钮、搜索、主题、语言、用户） -->
    <div class="app-layout__topbar">
      <Topbar
        :is-collapse="isCollapse"
        :drawer-visible="drawerVisible"
        @toggle-sidebar="toggleSidebar"
        @toggle-drawer="toggleDrawer"
        @open-drawer="openDrawer"
      />
    </div>

    <!-- 下方：左侧边栏 + 右侧内容 -->
    <div class="app-layout__body">
      <!-- 左侧边栏（只有搜索和菜单） -->
      <div class="app-layout__sidebar">
        <Sidebar
          :is-collapse="isCollapse"
          :drawer-visible="drawerVisible"
        />
      </div>

      <!-- 右侧内容 -->
      <div class="app-layout__main">
        <!-- Tabbar：使用 v-show 保持 DOM，文档应用时隐藏 -->
        <Process
          v-show="!isDocsApp"
          :is-fullscreen="isFullscreen"
          @toggle-fullscreen="toggleFullscreen"
        />

        <!-- 面包屑：使用 v-if 条件渲染，不需要频繁计算 -->
        <Breadcrumb v-if="showBreadcrumb" />

        <div class="app-layout__content">
            <!-- 主应用路由出口 -->
            <router-view v-if="isMainApp && !isDocsApp" v-slot="{ Component }">
              <transition name="slide" mode="out-in">
                <keep-alive :include="[]">
                  <component :is="Component" :key="viewKey" />
                </keep-alive>
              </transition>
            </router-view>

            <!-- 文档应用 iframe（全局缓存，v-show 控制显示/隐藏） -->
            <DocsIframe :visible="isDocsApp" />

            <!-- 子应用挂载点 -->
            <div id="subapp-viewport" v-show="!isMainApp && !isDocsApp">
              <!-- 骨架屏（挂载在这里，相对于内容区域定位） -->
              <AppSkeleton />
            </div>
          </div>
        </div>
      </div>

    <!-- 菜单抽屉 -->
    <MenuDrawer
      v-model:visible="drawerVisible"
      :topbar-height="47"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import mitt from 'mitt';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
import AppSkeleton from '@/components/AppSkeleton.vue';
import DocsIframe from './docs-iframe/index.vue';

// 创建事件总线
const emitter = mitt();

// 将事件总线挂载到 window，供其他组件使用
(window as any).__APP_EMITTER__ = emitter;

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);
const isFullscreen = ref(false);
const viewKey = ref(1); // 主应用视图 key

// 判断是否为主应用路由
const isMainApp = computed(() => {
  const path = route.path;
  return !path.startsWith('/logistics') &&
         !path.startsWith('/engineering') &&
         !path.startsWith('/quality') &&
         !path.startsWith('/production');
});

// 判断是否为文档应用
const isDocsApp = computed(() => {
  return route.path === '/docs' || route.path.startsWith('/docs/');
});

// 判断是否显示面包屑
const showBreadcrumb = computed(() => {
  const path = route.path;

  // 任意应用首页不显示
  if (path === '/' ||
      path === '/logistics' ||
      path === '/engineering' ||
      path === '/quality' ||
      path === '/production' ||
      path === '/docs') {
    return false;
  }

  // 其他页面显示
  return true;
});

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const openDrawer = () => {
  if (!drawerVisible.value) {
    drawerVisible.value = true;
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 刷新视图
function refreshView() {
  if (isMainApp.value) {
    viewKey.value += 1; // 主应用视图刷新
  } else {
    // 子应用视图刷新（通过事件通知子应用）
    emitter.emit('subapp.refresh');
  }
}

onMounted(() => {
  emitter.on('view.refresh', refreshView);
});

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  delete (window as any).__APP_EMITTER__;
});
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column; // 上下布局
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color);

  // 顶栏区域
  &__topbar {
    width: 100%;
    flex-shrink: 0;
    z-index: 1000; // 确保顶栏在最上层
  }

  // 下方主体区域（左右布局）
  &__body {
    display: flex;
    flex: 1;
    height: calc(100vh - 47px); // 减去顶栏高度
    overflow: hidden;
  }

  &__sidebar {
    width: 255px;
    height: 100%;
    background-color: var(--el-bg-color);
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    flex-shrink: 0;
    border-right: 1px solid var(--el-border-color-extra-light);
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: calc(100% - 255px);
    transition: width 0.2s ease-in-out;
  }

  &__content {
    flex: 1;
    overflow: hidden;
    margin: 10px; // 统一四周间距
    width: calc(100% - 20px);
    box-sizing: border-box;
    border-radius: 6px;
    position: relative;
    background-color: var(--el-bg-color);

    // 统一的页面容器样式（应用于所有路由视图）
    :deep(> *) {
      width: 100%;
      height: 100%;
      overflow: auto;
      box-sizing: border-box;
      background-color: var(--el-bg-color);

      // 只给非 view-group 页面添加 padding
      &:not(.users-page):not(.resources-page):not(.menus-page):not(.modules-page):not(.plugins-page):not(.perm-compose-page) {
        padding: 20px;
      }
    }

    // 子应用挂载点（覆盖默认样式，不需要 padding）
    #subapp-viewport {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      padding: 0 !important;
      background-color: var(--el-bg-color);
    }

    // 文档 iframe 容器（覆盖默认样式，不需要 padding）
    .docs-iframe-wrapper {
      padding: 0 !important; // iframe内部的VitePress有自己的布局
      overflow: hidden !important; // 容器不滚动，滚动由 iframe 内部处理
    }

    // 路由过渡动画（加快速度）
    .slide-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-enter-from {
      transform: translate3d(-5%, 0, 0);
      opacity: 0;
    }

    .slide-leave-to {
      transform: translate3d(5%, 0, 0);
      opacity: 0;
    }

    .slide-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  &.is-collapse {
    .app-layout__sidebar {
      width: 64px;
    }

    .app-layout__main {
      width: calc(100% - 64px);
    }
  }

  // 全屏模式（隐藏顶栏和侧边栏，保留标签页进程栏和面包屑）
  &.is-full {
    // 隐藏顶栏
    .app-layout__topbar {
      height: 0;
      overflow: hidden;
    }

    // 调整主体区域高度为全屏
    .app-layout__body {
      height: 100vh;
    }

    // 隐藏侧边栏
    .app-layout__sidebar {
      width: 0;
    }

    .app-layout__main {
      width: 100%;
    }

    // 保留标签页进程栏和面包屑，确保用户可以退出全屏
    .app-layout__content {
      margin: 10px; // 保持四周间距，包括顶部间距
      width: calc(100% - 20px);
      border-radius: 6px;
    }
  }
}
</style>

