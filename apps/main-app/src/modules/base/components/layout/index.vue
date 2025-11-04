<template>
  <div
    class="app-layout"
    :class="{
      'is-collapse': isCollapse && menuType !== 'top' && menuType !== 'dual-menu',
      'is-full': isFullscreen,
      'menu-type-top': menuType === 'top',
      'menu-type-top-left': menuType === 'top-left',
      'menu-type-dual-menu': menuType === 'dual-menu',
    }"
  >
    <!-- 遮罩层（移动端使用） -->
    <div class="app-layout__mask" @click="handleMaskClick"></div>

    <!-- 顶栏（包含汉堡菜单、Logo、折叠按钮、搜索、主题、语言、用户） -->
    <div class="app-layout__topbar">
      <Topbar
        :is-collapse="isCollapse"
        :drawer-visible="drawerVisible"
        :menu-type="menuType"
        @toggle-sidebar="toggleSidebar"
        @toggle-drawer="toggleDrawer"
        @open-drawer="openDrawer"
      />
    </div>



    <!-- 下方：左侧边栏 + 右侧内容 -->
    <div class="app-layout__body">
      <!-- 左侧边栏（左侧菜单、双栏菜单左侧、混合菜单左侧） -->
      <div
        v-if="menuType === 'left' || menuType === 'dual-menu' || menuType === 'top-left'"
        class="app-layout__sidebar"
        :class="{ 'has-dark-menu': isDarkMenuStyle }"
      >
        <Sidebar
          v-if="menuType === 'left'"
          :is-collapse="isCollapse"
          :drawer-visible="drawerVisible"
        />
        <DualMenu v-else-if="menuType === 'dual-menu'" />
        <TopLeftSidebar v-else />
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
        <Breadcrumb v-if="showBreadcrumb && showCrumbs" />

        <div class="app-layout__content">
            <!-- 主应用路由出口 -->
            <router-view v-if="isMainApp && !isDocsApp" v-slot="{ Component }">
              <transition :name="pageTransitionName" mode="out-in">
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
import { useBrowser } from '@/composables/useBrowser';
import { useSettingsState } from '@/plugins/user-setting/composables';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
import AppSkeleton from '@/components/AppSkeleton.vue';
import DocsIframe from './docs-iframe/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';

// 创建事件总线
const emitter = mitt();

// 将事件总线挂载到 window，供其他组件使用
(window as any).__APP_EMITTER__ = emitter;

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);

// 获取设置状态
const { showCrumbs, pageTransition, menuType, menuThemeType, isDark } = useSettingsState();

// 判断是否为深色菜单风格
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 页面切换动画名称
const pageTransitionName = computed(() => {
  const transition = pageTransition.value || 'slide-left';
  return transition || ''; // 空字符串表示无动画
});

// 监听页面切换动画变化
function handlePageTransitionChange(event: CustomEvent) {
  // 动画名称会自动通过 computed 更新
}

const isFullscreen = ref(false);
const viewKey = ref(1); // 主应用视图 key

// 浏览器信息
const { browser, onScreenChange } = useBrowser();

// 跟踪之前的 isMini 状态，只在真正切换移动端/桌面端时才改变折叠状态
let prevIsMini = browser.isMini;

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

  // 个人中心页面不显示面包屑（孤立页面）
  if (path === '/profile') {
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

// 遮罩层点击事件（移动端关闭侧边栏）
const handleMaskClick = () => {
  isCollapse.value = true;
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
  window.addEventListener('page-transition-change', handlePageTransitionChange as EventListener);

  // 监听屏幕变化，只在移动端/桌面端切换时改变折叠状态
  onScreenChange(() => {
    // 只在 isMini 状态真正改变时才更新折叠状态（从桌面端切换到移动端，或反之）
    if (prevIsMini !== browser.isMini) {
      isCollapse.value = browser.isMini;
      prevIsMini = browser.isMini;
    }
  }, true); // immediate = true，立即执行一次，确保初始状态正确
});

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  window.removeEventListener('page-transition-change', handlePageTransitionChange as EventListener);
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
    background-color: transparent; // 背景色由菜单风格控制
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    flex-shrink: 0;
    border-right: 1px solid var(--el-border-color-extra-light);

    // 双栏菜单模式：宽度为 274px（与顶栏搜索框对齐）
    .menu-type-dual-menu & {
      width: 274px;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: calc(100% - 255px);
    transition: width 0.2s ease-in-out;

    // 顶部菜单模式：全宽
    .menu-type-top & {
      width: 100%;
    }

    // 双栏菜单模式：减去左侧菜单宽度（与顶栏搜索框对齐）
    .menu-type-dual-menu & {
      width: calc(100% - 274px);
    }

    // 混合菜单模式：减去左侧菜单宽度
    .menu-type-top-left & {
      width: calc(100% - 255px);
    }
  }

  &__mask {
    position: fixed;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    height: 100%;
    width: 100%;
    z-index: 999;
    display: none;
  }

  &__content {
    flex: 1;
    overflow: hidden;
    margin: 0 10px 10px 10px; // 统一间距（上右左下），顶部不留间距
    width: calc(100% - 20px);
    box-sizing: border-box;
    border-radius: 6px;
    position: relative;
    background-color: var(--el-bg-color);

    // 统一的页面容器样式（应用于所有路由视图）
    :deep(> *) {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background-color: var(--el-bg-color);

      // 使用 btc-view-group 的页面（滚动由内部组件控制，不需要外层滚动）
      &.users-page,
      &.resources-page,
      &.menus-page,
      &.modules-page,
      &.plugins-page,
      &.perm-compose-page {
        overflow: hidden;
      }

      // 其他页面允许滚动
      &:not(.users-page):not(.resources-page):not(.menus-page):not(.modules-page):not(.plugins-page):not(.perm-compose-page):not(.btc-grid-group):not(.strategy-designer):not(.templates-page):not(.file-preview-page) {
        overflow: auto;
        padding: 10px;
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
    // slide-left 动画（默认）
    .slide-left-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-left-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-left-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-left-enter-from {
      transform: translate3d(-5%, 0, 0);
      opacity: 0;
    }

    .slide-left-leave-to {
      transform: translate3d(5%, 0, 0);
      opacity: 0;
    }

    .slide-left-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    // slide-bottom 动画
    .slide-bottom-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-bottom-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-bottom-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-bottom-enter-from {
      transform: translate3d(0, 5%, 0);
      opacity: 0;
    }

    .slide-bottom-leave-to {
      transform: translate3d(0, -5%, 0);
      opacity: 0;
    }

    .slide-bottom-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    // slide-top 动画
    .slide-top-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-top-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-top-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-top-enter-from {
      transform: translate3d(0, -5%, 0);
      opacity: 0;
    }

    .slide-top-leave-to {
      transform: translate3d(0, 5%, 0);
      opacity: 0;
    }

    .slide-top-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    // fade 动画
    .fade-enter-active {
      transition: opacity 0.25s ease-in-out;
    }

    .fade-leave-active {
      transition: opacity 0.25s ease-in-out;
    }

    .fade-enter-to {
      opacity: 1;
    }

    .fade-enter-from {
      opacity: 0;
    }

    .fade-leave-to {
      opacity: 0;
    }

    .fade-leave-from {
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

    // 顶部菜单模式：折叠不影响
    &.menu-type-top {
      .app-layout__main {
        width: 100%;
      }
    }

    // 双栏菜单模式：折叠不影响（双栏菜单有自己的宽度，与顶栏搜索框对齐）
    &.menu-type-dual-menu {
      .app-layout__sidebar {
        width: 274px;
      }
      .app-layout__main {
        width: calc(100% - 274px);
      }
    }
  }

  // 移动端响应式样式（<= 768px）
  @media only screen and (max-width: 768px) {
    &__sidebar {
      position: absolute;
      left: 0;
      z-index: 9999;
      transition:
        transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1),
        box-shadow 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
    }

    &__main {
      width: 100%;
    }

    &__mask {
      display: block;
    }

    &.is-collapse {
      .app-layout__sidebar {
        transform: translateX(-100%);
      }

      .app-layout__mask {
        display: none;
      }
    }
  }

  // 桌面端响应式样式（> 768px）
  @media only screen and (min-width: 768px) {
    &__sidebar,
    &__main {
      transition: width 0.2s ease-in-out;
    }

    &__mask {
      display: none;
    }

    &.is-collapse {
      .app-layout__sidebar {
        width: 64px;
        transform: none;
      }

      .app-layout__main {
        width: calc(100% - 64px);
      }
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
      margin: 0 10px 10px 10px; // 保持左右和底部间距，顶部不留间距（与正常模式一致）
      width: calc(100% - 20px);
      border-radius: 6px;
    }
  }
}
</style>

