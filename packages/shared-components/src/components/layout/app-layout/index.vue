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
            <template v-if="isMainApp && !isDocsApp">
              <router-view v-slot="{ Component, route }">
                <transition :name="pageTransitionName" mode="out-in">
                <component v-if="isOpsLogs" :is="Component" :key="route.fullPath" />
                <keep-alive v-else>
                  <component :is="Component" :key="route.fullPath" />
                </keep-alive>
              </transition>
            </router-view>
            </template>

            <!-- 文档应用 iframe -->
            <template v-if="isDocsApp">
              <DocsIframe :visible="true" />
            </template>

            <!-- 子应用挂载点（非主应用且非文档应用时显示，只有子应用才会使用） -->
            <!-- 关键：使用 v-show 替代 v-else，保持 DOM 节点始终存在，避免销毁重建导致的 DOM 操作冲突 -->
            <div id="subapp-viewport" v-show="!isMainApp && !isDocsApp">
              <!-- 骨架屏（放在 subapp-viewport 内部，只在加载时显示，子应用挂载后隐藏） -->
              <AppSkeleton v-if="isQiankunLoading" />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import mitt from '@btc/shared-components/utils/mitt';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { useBrowser } from '@btc/shared-components/composables/useBrowser';
import { useSettingsState } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { MenuThemeEnum } from '@btc/shared-components/components/others/btc-user-setting/config/enums';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
import AppSkeleton from '@btc/shared-components/components/basic/app-skeleton/index.vue';
import DocsIframe from './docs-iframe/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import { provideContentHeight } from '@btc/shared-components/composables/content-height';

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
// 主应用就是系统域（默认域），处理所有非子应用的路径
// 管理域（/admin/*）是子应用，不是主应用路由
// 独立运行时：所有路由都是主应用路由（因为这是独立运行的管理域应用）
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
const isMainApp = computed(() => {
    const path = route.path;
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // 排除不需要 Layout 的页面
    if (path === '/login' ||
        path === '/forget-password' ||
        path === '/register') {
      return false;
    }

  // 独立运行时，所有路由都是主应用路由（除了登录等特殊页面）
  if (isStandalone) {
    return true;
  }

  // qiankun 模式下的逻辑
  // 优先检查子域名（生产环境的关键识别方式）
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomainMap: Record<string, string> = {
      'admin.bellis.com.cn': 'admin',
      'logistics.bellis.com.cn': 'logistics',
      'quality.bellis.com.cn': 'quality',
      'production.bellis.com.cn': 'production',
      'engineering.bellis.com.cn': 'engineering',
      'finance.bellis.com.cn': 'finance',
      'monitor.bellis.com.cn': 'monitor',
    };

    // 关键：如果在生产环境子域名下，说明是子应用，不是主应用
    if (subdomainMap[hostname]) {
      return false; // 子应用，不是主应用
    }
  }

  // 开发环境或主域名访问：通过路径判断
  // 同时检查 route.path 和 location.pathname，确保判断准确
  const actualPath = path || locationPath;

  // 管理域是子应用，不是主应用
  if (actualPath.startsWith('/admin') || path.startsWith('/admin') || locationPath.startsWith('/admin')) {
    return false;
  }
  // 其他子应用路径
  if (actualPath.startsWith('/logistics') || path.startsWith('/logistics') || locationPath.startsWith('/logistics') ||
      actualPath.startsWith('/engineering') || path.startsWith('/engineering') || locationPath.startsWith('/engineering') ||
      actualPath.startsWith('/quality') || path.startsWith('/quality') || locationPath.startsWith('/quality') ||
      actualPath.startsWith('/production') || path.startsWith('/production') || locationPath.startsWith('/production') ||
      actualPath.startsWith('/finance') || path.startsWith('/finance') || locationPath.startsWith('/finance') ||
      actualPath.startsWith('/docs') || path.startsWith('/docs') || locationPath.startsWith('/docs') ||
      actualPath.startsWith('/monitor') || path.startsWith('/monitor') || locationPath.startsWith('/monitor')) {
    return false;
  }
  // 系统域（默认域）是主应用，包括 /、/profile、/data/* 等
  return true;
});

// 判断是否为文档应用
const isDocsApp = computed(() => {
  return route.path === '/docs' || route.path.startsWith('/docs/');
});

// 跟踪之前的 isMainApp 状态，用于检测跨应用切换
const prevIsMainApp = ref(false);

// 页面切换动画名称（需要在 isMainApp 定义后）
const pageTransitionName = computed(() => {
  const path = route.path || '';

  // 检测跨应用切换（从主应用切换到子应用，或反之）
  const isCrossAppSwitch = prevIsMainApp.value !== isMainApp.value;
  if (isCrossAppSwitch) {
    // 跨应用切换时禁用动画，避免与 v-if 冲突
    prevIsMainApp.value = isMainApp.value;
    return '';
  }

  // 更新状态
  prevIsMainApp.value = isMainApp.value;

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

// qiankun 加载状态（用于显示骨架屏）
const isQiankunLoading = ref(false);

// 监听 qiankun 加载状态变化（通过 DOM 属性）
let qiankunLoadingObserver: MutationObserver | null = null;

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
  drawerVisible.value = !drawerVisible.value;
  scheduleContentResize();
};

const openDrawer = () => {
  if (!drawerVisible.value) {
    drawerVisible.value = true;
  }
  scheduleContentResize();
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

// qiankun 事件处理函数（需要在 onMounted 和 onUnmounted 中共享）
// 关键：使用 nextTick 延迟更新，避免在 Vue 更新周期中直接修改响应式状态导致 DOM 操作冲突
const handleQiankunBeforeLoad = () => {
  nextTick(() => {
    isQiankunLoading.value = true;
  });
};
const handleQiankunAfterMount = () => {
  nextTick(() => {
    isQiankunLoading.value = false;
  });
};

// 设置 MutationObserver（需要在路由切换时重新设置）
const setupMutationObserver = () => {
  // 先断开旧的观察器（如果存在）
  if (qiankunLoadingObserver) {
    qiankunLoadingObserver.disconnect();
    qiankunLoadingObserver = null;
  }

  nextTick(() => {
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container && container.isConnected) {
      // 检查初始状态
      const hasAttr = container.hasAttribute('data-qiankun-loading');
      isQiankunLoading.value = hasAttr;

      // 使用 MutationObserver 监听属性变化
      // 关键：在回调中使用 nextTick 延迟更新，避免在 Vue 更新周期中直接修改响应式状态导致 DOM 操作冲突
      qiankunLoadingObserver = new MutationObserver((mutations) => {
        // 检查容器是否还在 DOM 中，避免在组件卸载时操作已移除的元素
        if (!container.isConnected) {
          qiankunLoadingObserver?.disconnect();
          qiankunLoadingObserver = null;
          return;
        }

        // 使用 nextTick 延迟更新，避免与 Vue 的更新周期冲突
        nextTick(() => {
          // 再次检查容器是否还在 DOM 中
          if (!container.isConnected) {
            return;
          }

          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-qiankun-loading') {
              // 再次检查容器是否还在 DOM 中
              if (container.isConnected) {
                try {
                  const hasAttr = container.hasAttribute('data-qiankun-loading');
                  isQiankunLoading.value = hasAttr;
                } catch (error) {
                  // 捕获可能的 DOM 操作错误，避免影响应用运行
                  if (import.meta.env.DEV) {
                    console.warn('[Layout] MutationObserver 更新状态时出错（已忽略）:', error);
                  }
                }
              }
            }
          });
        });
      });

      qiankunLoadingObserver.observe(container, {
        attributes: true,
        attributeFilter: ['data-qiankun-loading'],
      });
    }
  });
};

onMounted(() => {
  emitter.on('view.refresh', refreshView);
  window.addEventListener('page-transition-change', handlePageTransitionChange as EventListener);

  // 监听 qiankun 加载事件，直接更新状态（不依赖 DOM 属性）
  window.addEventListener('qiankun:before-load', handleQiankunBeforeLoad);
  window.addEventListener('qiankun:after-mount', handleQiankunAfterMount);

  // 监听屏幕变化，只在移动端/桌面端切换时改变折叠状态
  onScreenChange(() => {
    // 只在 isMini 状态真正改变时才更新折叠状态（从桌面端切换到移动端，或反之）
    if (prevIsMini !== browser.isMini) {
      isCollapse.value = browser.isMini;
      prevIsMini = browser.isMini;
    }
    scheduleContentResize();
  }, true); // immediate = true，立即执行一次，确保初始状态正确

  // 初始化 MutationObserver
  setupMutationObserver();

  // 初始化 prevIsMainApp
  prevIsMainApp.value = isMainApp.value;

  scheduleContentResize();
});

watch(
  () => route.fullPath,
  async () => {
    scheduleContentResize();
    // 路由切换时重新设置 MutationObserver（因为容器可能被 v-if 移除和重建）
    // 使用 nextTick 确保 DOM 更新完成后再设置观察器
    await nextTick();
    setupMutationObserver();
  },
);

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  window.removeEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  window.removeEventListener('qiankun:before-load', handleQiankunBeforeLoad);
  window.removeEventListener('qiankun:after-mount', handleQiankunAfterMount);

  // 清理 MutationObserver
  if (qiankunLoadingObserver) {
    qiankunLoadingObserver.disconnect();
    qiankunLoadingObserver = null;
  }

  delete (window as any).__APP_EMITTER__;
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
  }

  &__sidebar {
    width: 255px;
    height: 100%;
    background-color: transparent; // 背景色由菜单风格控制
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    flex-shrink: 0; // 关键：防止侧边栏被压缩，与系统应用保持一致
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
      // 只对页面组件根元素设置 flex: 1，不会影响内部组件（如 btc-crud-row）
      > * {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
        flex: 1; // 页面组件根元素需要占据完整高度
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
      position: static !important;
      display: flex;
      flex-direction: column;
      width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
      height: 100% !important; // 关键：确保高度为 100%
      flex: 1;
      min-height: 0;
      min-width: 0 !important; // 使用 !important 防止被覆盖，确保 flex 子元素可以收缩
      padding: 0 !important;
      box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保宽度计算一致
      background-color: var(--el-bg-color) !important;
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

    // 当 layout-app 在 qiankun 包装容器内部时，确保 #subapp-viewport 正确显示
    :deep([id^="__qiankun_microapp_wrapper"] #subapp-viewport) {
      position: static !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      height: 100% !important; // 关键：确保高度为 100%
      flex: 1 !important;
      min-height: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      background-color: var(--el-bg-color) !important;
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

<style lang="scss">
/**
 * 布局容器核心样式（非 scoped）
 * 当 layout-app 作为 qiankun 子应用被加载到子应用的 #app 容器时，
 * 需要非 scoped 样式确保布局样式能够正确应用，不受 qiankun 样式隔离影响
 * 这些样式必须与系统域的布局样式完全一致
 */
.app-layout__body {
  display: flex !important;
  flex-direction: row !important; // 明确指定左右布局
  flex: 1 !important;
  height: calc(100vh - 47px) !important;
  overflow: hidden !important;
}

.app-layout__sidebar {
  width: 255px !important;
  height: 100% !important;
  flex-shrink: 0 !important; // 防止侧边栏被压缩
  overflow: hidden !important;
}

.app-layout__main {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important; // 关键：必须设置高度为 100%，与系统域一致
  overflow: hidden !important;
  min-width: 0 !important; // 确保 flex 子元素可以收缩
}
</style>

