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
            <!-- 关键：使用 v-show 替代 v-if，保持 DOM 节点始终存在，避免销毁重建导致的 DOM 操作冲突 -->
            <!-- 保证微应用的 DOM 不被销毁，避免 insertBefore 等报错 -->
            <!-- 关键：添加 position: relative，确保 transition 的 position: absolute 不影响布局 -->
            <div v-show="isMainApp && !isDocsApp" style="width: 100%; height: 100%; position: relative;">
              <router-view v-slot="{ Component, route }">
                <!-- 关键：始终渲染 transition，避免在动画过程中被销毁 -->
                <!-- 通过外层 v-show 控制显示，transition 内部直接渲染 Component（可能为 null） -->
                <!-- 使用 mode="out-in" 确保先卸载后挂载，避免 DOM 操作冲突 -->
                <transition :name="pageTransitionName" mode="out-in">
                  <!-- 关键：直接渲染 Component，让 Vue 处理组件加载和错误 -->
                  <!-- 如果 Component 存在，尝试渲染它；如果出错，Vue 的错误处理器会捕获 -->
                  <component
                    v-if="Component && isOpsLogs"
                    :is="Component"
                    :key="route.fullPath"
                  />
                  <keep-alive v-else-if="Component">
                    <component :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>

            <!-- 文档应用 iframe -->
            <DocsIframe v-show="isDocsApp" :visible="isDocsApp" />

            <!-- 子应用挂载点（非主应用且非文档应用时显示，只有子应用才会使用） -->
            <!-- 关键：使用 v-show 替代 v-else，保持 DOM 节点始终存在，避免销毁重建导致的 DOM 操作冲突 -->
            <!-- 保证微应用的 DOM 不被销毁，避免 insertBefore 等报错 -->
            <div id="subapp-viewport" v-show="!isMainApp && !isDocsApp">
              <!-- 骨架屏（放在 subapp-viewport 内部，使用 v-show 控制显示，避免销毁重建） -->
              <AppSkeleton v-show="isQiankunLoading" />
            </div>
          </div>
        </div>
      </div>

    <!-- 菜单抽屉 -->
    <MenuDrawer
      v-model:visible="drawerVisible"
      :topbar-height="47"
    />

    <!-- 偏好设置抽屉（用于 qiankun 模式下的子应用） -->
    <BtcUserSettingDrawer v-model="preferencesDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import mitt from 'mitt';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { useBrowser } from '@/composables/useBrowser';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { isMainApp as getIsMainApp } from '@configs/unified-env-config';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
// AppSkeleton 从共享组件库自动导入（通过 unplugin-vue-components）
import DocsIframe from './docs-iframe/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import { provideContentHeight } from '@/composables/useContentHeight';
import BtcUserSettingDrawer from '@btc/shared-components/components/others/btc-user-setting/components/preferences-drawer.vue';

// 创建事件总线
const emitter = mitt();

// 将事件总线挂载到 window，供其他组件使用
(window as any).__APP_EMITTER__ = emitter;

// 生产环境标志（用于模板）

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);
const preferencesDrawerVisible = ref(false);
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

// 页面切换动画名称
const pageTransitionName = computed(() => {
  const path = route.path || '';
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

// 监听页面切换动画变化
function handlePageTransitionChange(event: CustomEvent) {
  // 动画名称会自动通过 computed 更新
}

const isFullscreen = ref(false);
const viewKey = ref(1); // 手动刷新时递增
const isOpsLogs = computed(() => route.path.startsWith('/admin/ops/logs'));

// 浏览器信息
const { browser, onScreenChange } = useBrowser();

// 跟踪之前的 isMini 状态，只在真正切换移动端/桌面端时才改变折叠状态
let prevIsMini = browser.isMini;

// 判断是否为主应用路由（系统域路由）
// 使用统一的主应用判断逻辑，基于应用身份配置，无需硬编码
// 关键：让 isMainApp 函数自己判断是否为独立运行模式，不要硬编码
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
const isMainApp = computed(() => {
  // 关键：如果路由 meta 中明确标记为 isSubApp，直接返回 false（子应用）
  // 这样可以避免在 qiankun 模式下，子应用路由被误判为主应用路由
  if (route.meta?.isSubApp === true) {
    return false;
  }
  
  // 关键：优先使用 window.location.pathname，因为它包含完整的路径
  // route.path 在 qiankun 模式下可能只匹配到 /logistics，而不是完整的 /logistics/warehouse/inventory/info
  const locationPath = window.location.pathname;
  return getIsMainApp(locationPath, locationPath, isStandalone);
});

// 判断是否为文档应用
const isDocsApp = computed(() => {
  const path = route.path;
  return path === '/docs' || path.startsWith('/docs/');
});

// qiankun 加载状态（用于显示骨架屏）
const isQiankunLoading = ref(false);

// 主应用显示状态（直接使用 isMainApp，不需要延迟切换）
// 关键：使用 v-show 已经保证了 DOM 节点始终存在，不需要延迟切换
// 延迟切换反而可能导致状态不一致，直接使用 isMainApp 即可

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
         path === '/docs' ||
         path === '/monitor';
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

// 验证组件是否有效（防止 __vccOpts 错误）

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
// 关键：直接更新状态，不使用 nextTick，因为 AppSkeleton 已经使用 v-show 不会销毁 DOM
// 使用 v-show 已经保证了 DOM 节点始终存在，不需要延迟更新
const handleQiankunBeforeLoad = () => {
  isQiankunLoading.value = true;
};
const handleQiankunAfterMount = () => {
  isQiankunLoading.value = false;
  // 强制隐藏骨架屏，确保立即生效
  // nextTick(() => {
  //   const skeleton = document.getElementById('app-skeleton');
  //   if (skeleton) {
  //     skeleton.style.setProperty('display', 'none', 'important');
  //     skeleton.style.setProperty('visibility', 'hidden', 'important');
  //     skeleton.style.setProperty('opacity', '0', 'important');
  //     console.log('[Layout] 强制隐藏骨架屏');
  //   }
  // });
};

onMounted(() => {
  emitter.on('view.refresh', refreshView);
  // 关键：监听偏好设置抽屉打开事件（用于 qiankun 模式下的子应用）
  emitter.on('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.log('[Layout] 收到 open-preferences-drawer 事件，打开偏好设置抽屉');
    }
  });
  window.addEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);
  // 关键：监听全局偏好设置抽屉打开事件（用于跨应用通信）
  window.addEventListener('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.log('[Layout] 收到 window open-preferences-drawer 事件，打开偏好设置抽屉');
    }
  });

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

  // 监听 qiankun 加载状态（通过 DOM 属性）
  nextTick(() => {
    const container = document.querySelector('#subapp-viewport');
    if (container) {
      // 检查初始状态
      const hasLoadingAttr = container.hasAttribute('data-qiankun-loading');
      isQiankunLoading.value = hasLoadingAttr;
      // console.log('[Layout] 初始化 isQiankunLoading:', hasLoadingAttr);

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

  scheduleContentResize();
});

watch(
  () => route.fullPath,
  () => {
    scheduleContentResize();
  },
);

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  emitter.off('open-preferences-drawer');
  window.removeEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);
  window.removeEventListener('open-preferences-drawer', () => {});
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
  width: 100%; // 使用 100% 而不是 100vw，避免滚动条导致裁切
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
    min-width: 0; // 确保 flex 子元素可以收缩
    // 移除 width: calc(100% - 255px)，只使用 flex: 1，避免滚动条出现/消失时导致宽度变化
    // transition: width 0.2s ease-in-out; // 移除 transition，因为不再使用固定宽度

    // 顶部菜单模式：全宽（flex: 1 已经处理）
    // .menu-type-top & {
    //   width: 100%;
    // }

    // 双栏菜单模式：flex: 1 已经处理
    // .menu-type-dual-menu & {
    //   width: calc(100% - 274px);
    // }

    // 混合菜单模式：flex: 1 已经处理
    // .menu-type-top-left & {
    //   width: calc(100% - 255px);
    // }
  }

  // 顶部区域容器（顶栏、tabbar、面包屑的统一容器）
  &__header {
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
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
    width: calc(100% - 20px); // 减去左右 margin
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
      position: relative; // 为过渡动画提供定位上下文
    }

    // 子应用挂载点（占据内容区域完整尺寸）
    #subapp-viewport {
      position: static !important;
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 1;
      min-height: 0;
      padding: 0 !important;
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

    // 骨架屏（放在容器外部，使用绝对定位覆盖）
    .app-layout__skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      pointer-events: none; // Allow interaction with elements below when hidden
    }

    // 确保当 v-show="false" 时，骨架屏完全隐藏
    .app-layout__skeleton[style*="display: none"],
    .app-layout__skeleton[style*="display:none"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      pointer-events: none;
      background-color: var(--el-bg-color);
    }

    // slide-bottom 动画
    .slide-bottom-enter-active {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      transition: all 0.25s ease-in-out 0.1s;
      background-color: var(--el-bg-color);
      z-index: 1;
    }

    .slide-bottom-leave-active {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      transition: all 0.25s ease-in-out;
      background-color: var(--el-bg-color);
      z-index: 0;
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

