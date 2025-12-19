<template>
  <div
    class="app-layout"
    :class="{
      'is-collapse': isCollapse && menuType !== 'top' && menuType !== 'dual-menu',
      'is-full': isFullscreen,
      'menu-type-top': menuType === 'top',
      'menu-type-top-left': menuType === 'top-left',
      'menu-type-dual-menu': menuType === 'dual-menu',
      'is-using-layout-app': isUsingLayoutApp,
    }"
  >
    <!-- 关键：在 layout-app 环境下，隐藏子应用自己的布局（顶栏、侧边栏等） -->
    <!-- layout-app 会提供共享的布局，子应用只需要渲染内容区域 -->
    <template v-if="!isUsingLayoutApp">
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
    </template>



    <!-- 下方：左侧边栏 + 右侧内容 -->
    <div class="app-layout__body">
      <!-- 关键：在 layout-app 环境下，隐藏子应用自己的侧边栏 -->
      <!-- 左侧边栏（左侧菜单、双栏菜单左侧、混合菜单左侧） -->
      <div
        v-if="!isUsingLayoutApp && (menuType === 'left' || menuType === 'dual-menu' || menuType === 'top-left')"
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
        <!-- 顶部区域容器（顶栏、tabbar、面包屑的统一容器，提供统一的 10px 间距） -->
        <div class="app-layout__header">
          <!-- Tabbar：使用 v-show 保持 DOM，文档应用时隐藏 -->
          <Process
            v-show="!isDocsApp"
            :is-fullscreen="isFullscreen"
            @toggle-fullscreen="toggleFullscreen"
          />

          <!-- 面包屑：使用 v-if 条件渲染，不需要频繁计算 -->
          <Breadcrumb
            v-if="showBreadcrumb && showCrumbs"
          />
        </div>

        <div
          class="app-layout__content"
          ref="contentRef"
        >
            <!-- 主应用路由出口 -->
            <!-- 关键：使用 v-if 确保只在主应用路由时渲染，避免与子应用容器同时存在 -->
            <template v-if="isMainApp && !isDocsApp">
              <router-view v-slot="{ Component, route }">
                <!-- 移除 transition，避免在 v-if 切换和 DOM 操作期间触发更新 -->
                <component v-if="isOpsLogs" :is="Component" :key="route.fullPath" />
                <keep-alive v-else>
                  <component :is="Component" :key="route.fullPath" />
                </keep-alive>
              </router-view>
            </template>

            <!-- 文档应用 iframe -->
            <template v-else-if="isDocsApp">
              <DocsIframe :visible="true" />
            </template>

            <!-- 子应用挂载点（非主应用且非文档应用时显示，只有子应用才会使用） -->
            <template v-else>
              <div id="subapp-viewport" data-subapp-container>
                <!-- 骨架屏（通过 CSS 控制显示/隐藏，避免 Vue 响应式更新导致的 DOM 冲突） -->
                <AppSkeleton class="subapp-skeleton" />
              </div>
            </template>
          </div>
        </div>
      </div>

    <!-- 菜单抽屉由 layout-app 提供，子应用不需要自己的 menu-drawer -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import mitt from 'mitt';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { useBrowser } from '@/composables/useBrowser';
import { useSettingsState } from '@/plugins/user-setting/composables';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { isMainApp as getIsMainApp } from '@configs/unified-env-config';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import AppSkeleton from '@/components/AppSkeleton.vue';
import DocsIframe from './docs-iframe/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import { provideContentHeight } from '@/composables/useContentHeight';

// 创建事件总线
const emitter = mitt();

// 将事件总线挂载到 window，供其他组件使用
(window as any).__APP_EMITTER__ = emitter;

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);
const contentRef = ref<HTMLElement | null>(null);
const { register: registerContentHeight, emit: emitContentResize } = provideContentHeight();

watch(
  () => contentRef.value,
  (el) => {
    registerContentHeight(el ?? null);
  },
  { immediate: true },
);

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

// 获取设置状态
const { showCrumbs, pageTransition, menuType, menuThemeType, isDark } = useSettingsState();

// 判断是否为深色菜单风格
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 跟踪之前的 isMainApp 状态，用于检测跨应用切换（需要在 isMainApp 定义之前声明）
// 注意：初始值将在 isMainApp 定义后更新
const prevIsMainApp = ref(false);

// 监听页面切换动画变化
function handlePageTransitionChange(event: CustomEvent) {
  // 动画名称会自动通过 computed 更新
}

const isFullscreen = ref(false);
const viewKey = ref(1); // 手动刷新时递增
const routeKey = computed(() => route.fullPath); // 常规路由 key
const isOpsLogs = computed(() => route.path.startsWith('/admin/ops/logs'));

// 浏览器信息
const { browser, onScreenChange } = useBrowser();

// 跟踪之前的 isMini 状态，只在真正切换移动端/桌面端时才改变折叠状态
let prevIsMini = browser.isMini;

// 判断是否为主应用路由（系统域路由）
// 使用统一的主应用判断逻辑，基于应用身份配置，无需硬编码
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
// 关键：判断是否正在使用 layout-app（通过 __USE_LAYOUT_APP__ 标志）
const isUsingLayoutApp = computed(() => {
  return !!(window as any).__USE_LAYOUT_APP__;
});
const isMainApp = computed(() => {
  return getIsMainApp(route.path, window.location.pathname, isStandalone);
});

// 判断是否为文档应用
const isDocsApp = computed(() => {
  return route.path === '/docs' || route.path.startsWith('/docs/');
});

// 初始化 prevIsMainApp（在 isMainApp 定义后）
prevIsMainApp.value = isMainApp.value;

// 使用 watch 来更新 prevIsMainApp，避免在 computed 中修改状态
// 关键：使用 flush: 'post' 确保在 DOM 更新之后执行，避免与 DOM 操作冲突
watch(
  () => isMainApp.value,
  (newValue) => {
    // 使用 nextTick 延迟更新，确保 DOM 操作完成
    nextTick(() => {
      prevIsMainApp.value = newValue;
    });
  },
  { immediate: true, flush: 'post' }
);

// 页面切换动画名称（需要在 isMainApp 定义后）
// 注意：不再在 computed 中修改状态，改为只读取状态
const pageTransitionName = computed(() => {
  const path = route.path || '';

  // 检测跨应用切换（从主应用切换到子应用，或反之）
  // 注意：使用 prevIsMainApp.value 读取之前的值，但不在这里修改
  const isCrossAppSwitch = prevIsMainApp.value !== isMainApp.value;
  if (isCrossAppSwitch) {
    // 跨应用切换时禁用动画，避免与 v-if 冲突
    return '';
  }

  // 日志中心关闭过渡，避免尺寸变化引发观察链
  // 禁用以下页面的动画：
  // - /admin/ops/logs (日志中心主页)
  // - /admin/ops/logs/operation (操作日志页面)
  // - /admin/ops/logs/request (请求日志页面)
  if (path.startsWith('/admin/ops/logs')) {
    return '';
  }
  const transition = pageTransition.value || 'slide-left';
  return transition || '';
});

// 注意：不再使用响应式状态来控制骨架屏的显示
// 改为通过 CSS 和 DOM 属性来控制，避免 Vue 响应式更新导致的 DOM 操作冲突
// 骨架屏会在 #subapp-viewport 有 data-qiankun-loading 属性时显示，否则隐藏

// 判断是否是首页
const isHomePage = computed(() => {
  const path = route.path;
  return path === '/' ||
         path === '/admin' ||
         path === '/logistics' ||
         path === '/engineering' ||
         path === '/quality' ||
         path === '/production' ||
         path === '/finance' ||
         path === '/docs';
});

// 判断是否显示面包屑
const showBreadcrumb = computed(() => {
  const path = route.path;

  // 任意应用首页不显示
  if (isHomePage.value) {
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
  scheduleContentResize();
};

const toggleDrawer = () => {
  // 关键：如果正在使用 layout-app，不要处理抽屉事件（layout-app 会处理）
  // 这可以避免在 qiankun 模式下卸载时触发已卸载组件的更新
  if (isUsingLayoutApp.value) {
    return;
  }

  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      drawerVisible.value = !drawerVisible.value;
      scheduleContentResize();
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
      if (import.meta.env.DEV) {
        console.warn('[Layout] toggleDrawer error:', error);
      }
    }
  });
};

const openDrawer = () => {
  // 关键：如果正在使用 layout-app，不要处理抽屉事件（layout-app 会处理）
  // 这可以避免在 qiankun 模式下卸载时触发已卸载组件的更新
  if (isUsingLayoutApp.value) {
    return;
  }

  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      if (!drawerVisible.value) {
        drawerVisible.value = true;
      }
      scheduleContentResize();
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
      if (import.meta.env.DEV) {
        console.warn('[Layout] openDrawer error:', error);
      }
    }
  });
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  scheduleContentResize();
};

// 遮罩层点击事件（移动端关闭侧边栏）
const handleMaskClick = () => {
  isCollapse.value = true;
  scheduleContentResize();
};

// 刷新视图
function refreshView() {
  if (isMainApp.value) {
    viewKey.value += 1; // 主应用视图刷新
  } else {
    // 子应用视图刷新（通过事件通知子应用）
    emitter.emit('subapp.refresh');
  }
  scheduleContentResize();
}

// 注意：不再使用 qiankun 事件监听器来更新 isQiankunLoading
// 因为事件触发时容器可能还未渲染，导致 Vue 尝试更新不存在的 DOM 元素
// 改为完全依赖 MutationObserver 来监听 DOM 属性的变化

onMounted(() => {
  emitter.on('view.refresh', refreshView);
  window.addEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);

  // 监听屏幕变化，只在移动端/桌面端切换时改变折叠状态
  onScreenChange(() => {
    // 只在 isMini 状态真正改变时才更新折叠状态（从桌面端切换到移动端，或反之）
    if (prevIsMini !== browser.isMini) {
      isCollapse.value = browser.isMini;
      prevIsMini = browser.isMini;
    }
    scheduleContentResize();
  }, true); // immediate = true，立即执行一次，确保初始状态正确

  scheduleContentResize();
});

watch(
  () => route.fullPath,
  () => {
    // 使用 nextTick 确保在 DOM 更新之后执行，避免与 Qiankun 的 DOM 操作冲突
    nextTick(() => {
      scheduleContentResize();
    });
  },
  { flush: 'post' }
);

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  window.removeEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);

  delete (window as any).__APP_EMITTER__;

  // 关键：在卸载时重置 drawerVisible，避免响应式更新触发已卸载组件的更新
  // 使用 nextTick 确保在卸载完成前不会触发更新
  nextTick(() => {
    try {
      drawerVisible.value = false;
    } catch (error) {
      // 静默处理，卸载时可能已经无法访问响应式对象
    }
  });
});
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column; // 上下布局
  height: 100vh;
  width: 100%; // 使用 100% 而不是 100vw，避免滚动条导致裁切（与系统域一致）
  overflow: hidden;
  background-color: var(--bg-color);

  // 顶栏区域
  &__topbar {
    width: 100%;
    flex-shrink: 0;
    z-index: 1000; // 确保顶栏在最上层
    overflow: visible; // 确保内容不被裁切
    position: relative; // 为 z-index 提供定位上下文
  }

  // 下方主体区域（左右布局）
  &__body {
    display: flex;
    flex: 1;
    height: calc(100vh - 47px); // 减去顶栏高度
    overflow: hidden;
    // 移除 width 和 box-sizing，让 flex 布局自动计算宽度
  }

  &__sidebar {
    width: 255px; // 使用 !important 确保宽度稳定
    height: 100%;
    background-color: transparent; // 背景色由菜单风格控制
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    box-sizing: border-box; // 使用 !important 覆盖全局 border-box，与系统域保持一致

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
    min-width: 0; // 确保 flex 子元素可以收缩
  }

  // 顶部区域容器（顶栏、tabbar、面包屑的统一容器）
  &__header {
    flex-shrink: 0;
    width: 100%; // 与系统域一致，移除 !important
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
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 10px; // 统一四周间距（包含与 header 之间的间距）
    width: calc(100% - 20px); // 减去左右 margin（与系统域一致，移除 !important）
    box-sizing: border-box;
    border-radius: 6px;
    position: relative;
    background-color: var(--el-bg-color);
    min-height: 0;


    // 主应用路由视图（占据内容区域完整尺寸）
    :deep(> router-view) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      // 确保 router-view 内部渲染的页面组件根元素占据完整高度
      > * {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
        width: 100%;
      }
    }

    // 文档应用 iframe（占据内容区域完整尺寸）
    :deep(.docs-iframe-wrapper) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    // 子应用挂载点（占据内容区域完整尺寸）
    #subapp-viewport {
      position: relative !important; // 为骨架屏提供定位上下文，同时覆盖外部样式
      display: flex;
      flex-direction: column;
      width: 100% !important;
      height: 100% !important; // 关键：确保高度为 100%
      flex: 1;
      min-height: 0;
      min-width: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      background-color: var(--el-bg-color) !important;

      // 骨架屏样式：默认隐藏，只在有 data-qiankun-loading 属性时显示
      .subapp-skeleton {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
      }

      // 当有加载标记时显示骨架屏（通过 CSS 控制，避免 Vue 响应式更新）
      &[data-qiankun-loading] .subapp-skeleton {
        display: block;
      }
    }

    :deep(#subapp-viewport > [data-qiankun]) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      height: 100%;
      width: 100%;
    }

    // qiankun 包装器容器（确保高度正确）
    :deep(#subapp-viewport [id^="__qiankun_microapp_wrapper"]) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      height: 100%;
      width: 100%;
    }

    :deep(#subapp-viewport > [data-qiankun] > *) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
    }

    // 子应用的 #app 元素（确保高度正确）
    :deep(#subapp-viewport #app) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      height: 100%;
      width: 100%;
    }

    :deep(qiankun-head) {
      display: none !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
    }

    // 文档 iframe 容器（覆盖默认样式，不需要 padding）
    .docs-iframe-wrapper {
      padding: 0 !important; // iframe内部的VitePress有自己的布局
      overflow: hidden !important; // 容器不滚动，滚动由 iframe 内部处理
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

    // 已移除 fade 动画样式
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
      margin: 10px; // 统一四周间距（与正常模式一致）
      width: calc(100% - 20px);
      border-radius: 6px;
    }
  }
}
</style>

