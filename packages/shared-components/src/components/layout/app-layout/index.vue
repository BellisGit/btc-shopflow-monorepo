<template>
  <div
    class="app-layout"
    :class="{
      'is-collapse': isCollapse && menuType?.value !== 'top' && menuType?.value !== 'dual-menu',
      'is-full': isFullscreen,
      'menu-type-top': menuType?.value === 'top',
      'menu-type-top-left': menuType?.value === 'top-left',
      'menu-type-dual-menu': menuType?.value === 'dual-menu',
      'is-using-layout-app': isUsingLayoutApp,
    }"
  >
    <!-- 遮罩层（移动端使用） -->
    <div class="app-layout__mask" @click="handleMaskClick"></div>

    <!-- 关键：在 layout-app 环境下，隐藏子应用自己的布局（顶栏、侧边栏等） -->
    <!-- layout-app 会提供共享的布局，子应用只需要渲染内容区域 -->
    <template v-if="!isUsingLayoutApp">
    <!-- 顶栏（包含汉堡菜单、Logo、折叠按钮、搜索、主题、语言、用户） -->
    <div class="app-layout__topbar">
      <Topbar
        v-if="menuType"
        :is-collapse="isCollapse"
        :drawer-visible="drawerVisible"
        :menu-type="menuType?.value || 'left'"
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
      <!-- 调试信息：在开发环境或首次渲染时显示 -->
      <template v-if="isDev && (!isUsingLayoutApp || !shouldShowSidebar)">
        <div style="position: fixed; top: 0; left: 0; z-index: 9999; background: yellow; padding: 10px; font-size: 12px;">
          <div>isUsingLayoutApp: {{ isUsingLayoutApp }}</div>
          <div>shouldShowSidebar: {{ shouldShowSidebar }}</div>
          <div>menuType: {{ menuType?.value }}</div>
          <div>__USE_LAYOUT_APP__: {{ useLayoutAppFlag }}</div>
          <div>__IS_LAYOUT_APP__: {{ isLayoutAppFlag }}</div>
        </div>
      </template>
      <div
        v-if="!isUsingLayoutApp && shouldShowSidebar"
        class="app-layout__sidebar"
        :class="{ 'has-dark-menu': isDarkMenuStyle }"
      >
        <Sidebar
          v-if="currentMenuType === 'left'"
          :is-collapse="isCollapse"
          :drawer-visible="drawerVisible"
        />
        <DualMenu v-else-if="currentMenuType === 'dual-menu'" />
        <TopLeftSidebar v-else-if="currentMenuType === 'top-left'" />
      </div>

      <!-- 右侧内容 -->
      <div class="app-layout__main">
        <!-- 顶部区域容器（顶栏、tabbar、面包屑的统一容器，提供统一的 10px 间距） -->
        <div class="app-layout__header">
          <!-- Tabbar -->
          <Process
            :is-fullscreen="isFullscreen"
            @toggle-fullscreen="toggleFullscreen"
          />

          <!-- 面包屑：使用 v-if 条件渲染，不需要频繁计算 -->
          <Breadcrumb
            v-if="showBreadcrumb && showCrumbs?.value !== false"
          />
        </div>

        <div
          class="app-layout__content"
          ref="contentRef"
        >
            <!-- 关键优化：直接挂载路由视图，不需要判断 isMainApp 和 isDocsApp（类似 cool-admin 的做法） -->
            <!-- 主应用和子应用有非常明显的路径差异，可以通过路由自动区分 -->
            <!-- 文档应用已经迁移为单独的子应用和子域名，不需要在此判断 -->
            <!-- 关键：在 layout-app 环境下（包括 layout-app 自己运行），隐藏主应用路由视图，只显示子应用 -->
            <!-- layout-app 的路由都是空组件，应该只显示 #subapp-viewport -->
            <!-- 关键：如果 #subapp-viewport 有内容，也不应该显示主应用路由视图 -->
            <!-- 关键：添加 position: relative，确保 transition 的 position: absolute 不影响布局 -->
            <div v-if="shouldShowMainAppRouterView" style="width: 100%; height: 100%; position: relative;">
              <router-view v-slot="{ Component, route }">
                <transition :name="pageTransitionName" mode="out-in">
                  <component v-if="Component && isOpsLogs" :is="Component" :key="route.fullPath" />
                  <keep-alive v-else-if="Component">
                    <component :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>

            <!-- 子应用挂载点（qiankun 模式或 layout-app 模式使用，保持 DOM 节点始终存在） -->
            <!-- 关键优化：始终存在 DOM 节点（避免销毁重建），在 qiankun 模式或 layout-app 模式下显示 -->
            <!-- 保证微应用的 DOM 不被销毁，避免 insertBefore 等报错 -->
            <div
              id="subapp-viewport"
              ref="subappViewportRef"
              :style="{ display: shouldShowSubAppViewport ? 'flex' : 'none' }"
            >
              <!-- 骨架屏（放在 subapp-viewport 内部，只在加载时显示，子应用挂载后隐藏） -->
              <AppSkeleton v-if="isQiankunLoading" />
            </div>
          </div>
        </div>
      </div>

    <!-- 关键：在 layout-app 环境下，隐藏子应用自己的菜单抽屉 -->
    <!-- layout-app 会提供共享的菜单抽屉 -->
    <MenuDrawer
      v-if="!isUsingLayoutApp"
      v-model:visible="drawerVisible"
      :topbar-height="47"
    />

    <!-- 偏好设置抽屉（用于 layout-app 环境） -->
    <BtcUserSettingDrawer v-model="preferencesDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { mitt } from '@btc/shared-components';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { useBrowser } from '@btc/shared-components/composables/useBrowser';
import { useSettingsState } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { MenuThemeEnum, MenuTypeEnum } from '@btc/shared-components/components/others/btc-user-setting/config/enums';
import { getIsMainAppFn } from './utils';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
import AppSkeleton from '@btc/shared-components/components/basic/app-skeleton/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import BtcUserSettingDrawer from '@btc/shared-components/components/others/btc-user-setting/components/preferences-drawer.vue';
import { provideContentHeight } from '@btc/shared-components/composables/content-height';
import { getSubApps, getAppBySubdomain } from '@configs/app-scanner';

// 开发环境标志（在模板中使用）
const isDev = import.meta.env.DEV;

// Window 对象引用（在模板中使用）
const windowObj = typeof window !== 'undefined' ? (window as any) : null;
const useLayoutAppFlag = windowObj ? windowObj.__USE_LAYOUT_APP__ : false;
const isLayoutAppFlag = windowObj ? windowObj.__IS_LAYOUT_APP__ : false;

// 创建事件总线
// 关键：如果全局事件总线已存在（由 layout-app 初始化时创建），则使用它；否则创建新的
let emitter = (window as any).__APP_EMITTER__;
if (!emitter) {
  emitter = mitt();
  // 将事件总线挂载到 window，供其他组件使用
  (window as any).__APP_EMITTER__ = emitter;
  if (import.meta.env.DEV) {
    console.log('[AppLayout] 创建了新的事件总线并挂载到 window.__APP_EMITTER__');
  }
} else {
  if (import.meta.env.DEV) {
    console.log('[AppLayout] 使用已存在的全局事件总线 (window.__APP_EMITTER__)');
  }
}

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
let showCrumbs: any;
let pageTransition: any;
let menuType: any;
let menuThemeType: any;
let isDark: any;

// 关键：先初始化 menuType 为默认值，确保始终有值
menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);

try {
  const settingsState = useSettingsState();
  showCrumbs = settingsState.showCrumbs;
  pageTransition = settingsState.pageTransition;
  // 关键：如果 settingsState.menuType 存在且有效，使用它；否则保持默认值
  if (settingsState.menuType) {
    const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
    const menuTypeValue = settingsState.menuType?.value;
    if (menuTypeValue && validMenuTypes.includes(menuTypeValue)) {
  menuType = settingsState.menuType;
    } else {
      // 如果值无效，更新为 MenuTypeEnum.LEFT
      if (typeof settingsState.menuType.value !== 'undefined') {
        settingsState.menuType.value = MenuTypeEnum.LEFT;
        menuType = settingsState.menuType;
    }
      // 否则保持使用默认的 ref(MenuTypeEnum.LEFT)
  }
  }
  menuThemeType = settingsState.menuThemeType;
  isDark = settingsState.isDark;
} catch (error) {
  // 使用默认值
  console.warn('[AppLayout] useSettingsState 初始化失败，使用默认值', error);
  showCrumbs = ref(true);
  pageTransition = ref('fade');
  // menuType 已经在上面初始化为 ref('left')，不需要重新赋值
  menuThemeType = ref(null);
  isDark = ref(false);
}

// 防御性检查：确保 menuType 始终有有效值
if (!menuType) {
  menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);
} else {
  const menuTypeValue = menuType.value;
  const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
  // 如果值不在有效值列表中，设置为 MenuTypeEnum.LEFT
  if (!menuTypeValue || !validMenuTypes.includes(menuTypeValue)) {
    menuType.value = MenuTypeEnum.LEFT;
  }
}

// 最终验证：确保 menuType 是一个有效的 ref
if (typeof menuType.value === 'undefined') {
  console.error('[AppLayout] menuType 最终验证失败，强制设置为 ref(MenuTypeEnum.LEFT)');
  menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);
}

// 计算属性：获取当前菜单类型（简化模板访问）
const currentMenuType = computed(() => {
  const mt = menuType?.value;
  return mt || 'left';
});

const VALID_MENU_TYPES = [
  MenuTypeEnum.LEFT,
  MenuTypeEnum.TOP,
  MenuTypeEnum.TOP_LEFT,
  MenuTypeEnum.DUAL_MENU,
] as const;

// 关键：menuType 的值校验/兜底放到 watch 中，避免 computed 中“写状态”导致抖动与不可预期联动
watch(
  () => menuType?.value,
  (val) => {
    if (!menuType) return;
    if (!val || !VALID_MENU_TYPES.includes(val as any)) {
      menuType.value = MenuTypeEnum.LEFT;
    }
  },
  { immediate: true },
);

// 计算属性：判断是否应该显示侧边栏（纯函数，无副作用）
// - left / dual-menu / top-left：有侧边栏
// - top：无侧边栏（顶部菜单在 Topbar 内渲染）
const shouldShowSidebar = computed(() => {
  const mt = currentMenuType.value;
  const result = mt === 'left' || mt === 'dual-menu' || mt === 'top-left';
  return result;
});

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
// 使用依赖注入的函数，如果未注入则使用简单的判断逻辑
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

// 关键：判断是否是 layout-app 自己运行
const isLayoutAppSelf = computed(() => {
  if (typeof window === 'undefined') return false;
  // 检查 __IS_LAYOUT_APP__ 标志
  if ((window as any).__IS_LAYOUT_APP__) {
    return true;
  }
  // 检查 hostname 是否是 layout-app 的域名
  const hostname = window.location.hostname;
  const port = window.location.port || '';
  // 生产环境：layout.bellis.com.cn
  // 预览环境：localhost:4192
  // 开发环境：localhost:4188
  if (hostname === 'layout.bellis.com.cn' ||
      (hostname === 'localhost' && (port === '4192' || port === '4188'))) {
    return true;
  }
  return false;
});

// 关键：判断是否正在使用 layout-app（通过 __USE_LAYOUT_APP__ 标志）
// 但是，如果当前是 layout-app 自己运行，应该返回 false（因为 layout-app 需要渲染自己的 Topbar/MenuDrawer）
const isUsingLayoutApp = computed(() => {
  // 如果当前是 layout-app 自己，返回 false
  if (isLayoutAppSelf.value) {
    return false;
  }
  const useLayoutApp = typeof window !== 'undefined' ? !!(window as any).__USE_LAYOUT_APP__ : false;
  return useLayoutApp;
});
const isMainApp = computed(() => {
  const path = route.path || window.location.pathname || '';

  // 404页面应该显示在主应用路由视图中
  if (path === '/404') {
    return true;
  }

  const fn = getIsMainAppFn();
  if (fn) {
    return fn(route.path, window.location.pathname, isStandalone);
  }
  // 如果函数未注入，使用简单的判断逻辑（基于 qiankun 和路径）
  if (isStandalone) {
    // 登录相关页面不算主应用路由
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }
    return true;
  }
  // 在 qiankun 环境下，简单判断：如果路径不是以已知子应用前缀开头，则认为是主应用
  const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs'];
  if (knownSubAppPrefixes.some(prefix => path.startsWith(prefix))) {
    return false;
  }
  return true;
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
const subappViewportRef = ref<HTMLElement | null>(null);

// 判断子应用容器是否应该显示
// 关键：在 layout-app 环境下（包括 layout-app 自己运行），强制显示 #subapp-viewport
// 只要 #subapp-viewport 有内容，就应该显示
const shouldShowSubAppViewport = computed(() => {
  // qiankun 模式下始终显示
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return true;
  }
  // layout-app 模式下强制显示
  if (isUsingLayoutApp.value) {
    return true;
  }
  // 如果是 layout-app 自己运行，强制显示
  if (isLayoutAppSelf.value) {
    return true;
  }
  // 关键：如果 #subapp-viewport 有内容（子应用已挂载），也应该显示
  // 这样可以处理 layout-app 环境下，__USE_LAYOUT_APP__ 标志设置延迟的情况
  if (subappViewportRef.value && subappViewportRef.value.children.length > 0) {
    return true;
  }
  // 关键：如果 #subapp-viewport 应该显示（通过内联样式检查），也应该显示
  // 这样可以处理 layout-app 环境下，内容已挂载但标志设置延迟的情况
  if (subappViewportRef.value) {
    const computedStyle = window.getComputedStyle(subappViewportRef.value);
    if (computedStyle.display !== 'none' && computedStyle.display !== '') {
      return true;
    }
  }
  return false;
});

// 判断是否应该显示主应用路由视图
// 关键：在 layout-app 环境下（包括 layout-app 自己运行），强制隐藏主应用路由视图
// 只要 #subapp-viewport 有内容或应该显示，就不应该显示主应用路由视图
const shouldShowMainAppRouterView = computed(() => {
  // 如果正在使用 layout-app，不显示主应用路由视图
  if (isUsingLayoutApp.value) {
    return false;
  }
  // 如果是 layout-app 自己运行，不显示主应用路由视图（layout-app 的路由都是空组件）
  if (isLayoutAppSelf.value) {
    return false;
  }
  // 关键：如果 #subapp-viewport 有内容（子应用已挂载），也不应该显示主应用路由视图
  // 这样可以处理 layout-app 环境下，__USE_LAYOUT_APP__ 标志设置延迟的情况
  if (subappViewportRef.value && subappViewportRef.value.children.length > 0) {
    return false;
  }
  // 关键：如果 #subapp-viewport 应该显示，就不应该显示主应用路由视图
  if (shouldShowSubAppViewport.value) {
    return false;
  }
  // 关键：如果 #subapp-viewport 通过内联样式显示（display: flex !important），也不应该显示主应用路由视图
  if (subappViewportRef.value) {
    const computedStyle = window.getComputedStyle(subappViewportRef.value);
    if (computedStyle.display !== 'none' && computedStyle.display !== '') {
      return false;
    }
  }
  return true;
});

// 监听 qiankun 加载状态变化（通过 DOM 属性）
let qiankunLoadingObserver: MutationObserver | null = null;
// 监听 #subapp-viewport 内容变化
let subappContentObserver: MutationObserver | null = null;

// 判断是否是首页（使用全局配置）
const isHomePage = computed(() => {
  const path = route.path;

  // 检查路由 meta 中的 isHome 标记
  if (route.meta?.isHome === true) {
    return true;
  }

  // 检查是否是系统应用首页（主应用）
  if (path === '/' && isMainApp.value) {
    return true;
  }

  // 生产环境子域名判断：路径为 / 且当前应用是子应用
  if (path === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    // 如果通过子域名识别到子应用，则认为是首页
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      return true;
    }
  }

  // 开发/预览环境：检查路径是否匹配任何子应用的 pathPrefix
  const subApps = getSubApps();
  for (const app of subApps) {
    const normalizedPathPrefix = app.pathPrefix.endsWith('/')
      ? app.pathPrefix.slice(0, -1)
      : app.pathPrefix;
    const normalizedPath = path.endsWith('/') && path !== '/'
      ? path.slice(0, -1)
      : path;

    // 精确匹配 pathPrefix 认为是首页
    if (normalizedPath === normalizedPathPrefix) {
      return true;
    }
  }

  return false;
});

// 判断是否显示面包屑区域（使用全局配置，所有应用首页都不显示）
const showBreadcrumb = computed(() => {
  const path = route.path;

  // 如果路由 meta 中标记为首页，不显示面包屑区域
  if (route.meta?.isHome === true) {
    return false;
  }

  // 检查是否是主应用首页（系统应用）
  if (path === '/' && isMainApp.value) {
    return false;
  }

  // 生产环境子域名判断：路径为 / 且当前应用是子应用
  if (path === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    // 如果通过子域名识别到子应用，则不显示面包屑区域
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      return false;
    }
  }

  // 开发/预览环境：检查路径是否匹配任何子应用的 pathPrefix
  const subApps = getSubApps();
  for (const app of subApps) {
    const normalizedPathPrefix = app.pathPrefix.endsWith('/')
      ? app.pathPrefix.slice(0, -1)
      : app.pathPrefix;
    const normalizedPath = path.endsWith('/') && path !== '/'
      ? path.slice(0, -1)
      : path;

    // 精确匹配 pathPrefix 不显示面包屑区域
    if (normalizedPath === normalizedPathPrefix) {
      return false;
    }
  }

  // 个人中心页面不显示面包屑（孤立页面）
  if (path === '/profile') {
    return false;
  }

  // 其他页面显示面包屑区域
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

  drawerVisible.value = !drawerVisible.value;
  scheduleContentResize();
};

const openDrawer = () => {
  // 关键：如果正在使用 layout-app，不要处理抽屉事件（layout-app 会处理）
  // 这可以避免在 qiankun 模式下卸载时触发已卸载组件的更新
  if (isUsingLayoutApp.value) {
    return;
  }

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

// 关键：监听 #subapp-viewport 的内容变化，确保有内容时显示容器并隐藏主应用路由视图
// 这样可以处理 layout-app 环境下，内容已挂载但容器被隐藏的问题
const checkSubAppViewportContent = () => {
  nextTick(() => {
    const viewport = subappViewportRef.value || document.querySelector('#subapp-viewport') as HTMLElement | null;
    if (viewport && viewport.children.length > 0) {
      // 如果 #subapp-viewport 有内容，强制显示（通过设置内联样式）
      // 这样可以覆盖之前的 display: none
      viewport.style.setProperty('display', 'flex', 'important');

      // 关键：同时隐藏主应用路由视图的 div（如果存在）
      const routerViewWrapper = viewport.parentElement?.querySelector('div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"]') as HTMLElement | null;
      if (routerViewWrapper && routerViewWrapper !== viewport) {
        routerViewWrapper.style.setProperty('display', 'none', 'important');
      }
    }
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
  // 关键：再次确认事件总线已正确设置（防止在组件挂载时事件总线被覆盖）
  if (!(window as any).__APP_EMITTER__) {
    (window as any).__APP_EMITTER__ = emitter;
    if (import.meta.env.DEV) {
      console.log('[AppLayout] onMounted: 重新设置事件总线到 window.__APP_EMITTER__');
    }
  }

  emitter.on('view.refresh', refreshView);
  // 关键：监听偏好设置抽屉打开事件（用于 layout-app 环境）
  emitter.on('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.log('[AppLayout] 收到 open-preferences-drawer 事件，打开偏好设置抽屉');
    }
  });
  // eslint-disable-next-line no-undef
  window.addEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  // 关键：偏好设置（子应用环境）切换菜单布局/菜单风格时，需要让 layout-app 立即响应
  // useSettingsHandlers 会派发 window 事件，这里作为兜底消费，避免“写入了 settings，但左侧菜单不切换”
  const handleMenuLayoutChange = ((event: Event) => {
    try {
      const custom = event as CustomEvent<{ layout?: MenuTypeEnum }>;
      const nextLayout = custom.detail?.layout;
      if (!nextLayout) return;
      const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
      if (!validMenuTypes.includes(nextLayout)) return;
      if (menuType?.value !== nextLayout) {
        menuType.value = nextLayout;
        scheduleContentResize();
      }
    } catch {
      // 静默失败
    }
  // eslint-disable-next-line no-undef
  }) as EventListener;

  const handleMenuStyleChange = ((event: Event) => {
    try {
      const custom = event as CustomEvent<{ style?: MenuThemeEnum }>;
      const nextStyle = custom.detail?.style;
      if (!nextStyle) return;
      if (menuThemeType?.value !== nextStyle) {
        menuThemeType.value = nextStyle;
      }
    } catch {
      // 静默失败
    }
  // eslint-disable-next-line no-undef
  }) as EventListener;

  window.addEventListener('menu-layout-change', handleMenuLayoutChange);
  window.addEventListener('menu-style-change', handleMenuStyleChange);

  // 保存引用，卸载时移除
  (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__ = handleMenuLayoutChange;
  (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__ = handleMenuStyleChange;
  // 关键：监听全局偏好设置抽屉打开事件（用于跨应用通信）
  window.addEventListener('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.log('[AppLayout] 收到 window open-preferences-drawer 事件，打开偏好设置抽屉');
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

  // 初始化 MutationObserver
  setupMutationObserver();

  // 初始检查
  checkSubAppViewportContent();

  // 使用 MutationObserver 监听 #subapp-viewport 的内容变化
  nextTick(() => {
    const viewport = subappViewportRef.value || document.querySelector('#subapp-viewport') as HTMLElement | null;
    if (viewport) {
      subappContentObserver = new MutationObserver(() => {
        checkSubAppViewportContent();
      });
      subappContentObserver.observe(viewport, {
        childList: true,
        subtree: true,
      });
    }
  });

  // 监听 sidebar 渲染状态，输出调试信息（构建产物中也输出）
  watch(
    [() => isUsingLayoutApp.value, () => shouldShowSidebar.value, () => menuType?.value],
    ([isUsing, shouldShow, menuTypeValue]) => {
      const shouldRender = !isUsing && shouldShow;
      if (!shouldRender && typeof window !== 'undefined' && !(window as any).__SIDEBAR_NOT_RENDERED_LOGGED__) {
        console.warn('[AppLayout] Sidebar 未渲染', {
          isUsingLayoutApp: isUsing,
          shouldShowSidebar: shouldShow,
          menuType: menuTypeValue,
          __USE_LAYOUT_APP__: typeof window !== 'undefined' ? (window as any).__USE_LAYOUT_APP__ : undefined,
          __IS_LAYOUT_APP__: typeof window !== 'undefined' ? (window as any).__IS_LAYOUT_APP__ : undefined,
          hostname: typeof window !== 'undefined' ? window.location.hostname : '',
          port: typeof window !== 'undefined' ? window.location.port : ''
        });
        if (typeof window !== 'undefined') {
          (window as any).__SIDEBAR_NOT_RENDERED_LOGGED__ = true;
        }
      }
    },
    { immediate: true }
  );

  // 初始化 prevIsMainApp
  prevIsMainApp.value = isMainApp.value;

  scheduleContentResize();
});

watch(
  () => route.fullPath,
  async () => {
    // 关键：移除路由变化时的 scheduleContentResize() 调用
    // 路由切换时不应该触发内容区域尺寸重新计算，避免整个布局重新渲染
    // 只有在真正需要时才调用 scheduleContentResize()（如侧边栏折叠、全屏切换等）

    // 路由切换时重新设置 MutationObserver（因为容器可能被 v-if 移除和重建）
    // 使用 nextTick 确保 DOM 更新完成后再设置观察器
    await nextTick();
    setupMutationObserver();
    // 检查 #subapp-viewport 内容
    checkSubAppViewportContent();
  },
);

// 关键：监听 __USE_LAYOUT_APP__ 标志的变化，确保标志设置后立即显示 #subapp-viewport
watch(
  () => typeof window !== 'undefined' ? !!(window as any).__USE_LAYOUT_APP__ : false,
  (useLayoutApp) => {
    if (useLayoutApp) {
      // 标志设置后，立即检查并显示 #subapp-viewport
      nextTick(() => {
        checkSubAppViewportContent();
      });
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  emitter.off('open-preferences-drawer');
  // eslint-disable-next-line no-undef
  window.removeEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  window.removeEventListener('open-preferences-drawer', () => {});
  window.removeEventListener('qiankun:before-load', handleQiankunBeforeLoad);
  window.removeEventListener('qiankun:after-mount', handleQiankunAfterMount);
  // 清理偏好设置事件监听
  const menuLayoutListener = (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__;
  const menuStyleListener = (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__;
  if (menuLayoutListener) {
    window.removeEventListener('menu-layout-change', menuLayoutListener);
    delete (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__;
  }
  if (menuStyleListener) {
    window.removeEventListener('menu-style-change', menuStyleListener);
    delete (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__;
  }

  // 清理 MutationObserver
  if (qiankunLoadingObserver) {
    qiankunLoadingObserver.disconnect();
    qiankunLoadingObserver = null;
  }
  // 清理 subapp-viewport 内容观察器
  if (subappContentObserver) {
    subappContentObserver.disconnect();
    subappContentObserver = null;
  }

  // 关键：在卸载时重置 drawerVisible，避免响应式更新触发已卸载组件的更新
  // 使用 nextTick 确保在卸载完成前不会触发更新
  nextTick(() => {
    try {
      drawerVisible.value = false;
    } catch (error) {
      // 静默处理，卸载时可能已经无法访问响应式对象
    }
  });

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
    box-sizing: border-box; // 关键：确保 border 包含在宽度内，避免双栏菜单超出

    // 双栏菜单模式：宽度为 255px（与单列菜单宽度一致，保持设计统一）
    // 搜索框宽度会相应调整以匹配双栏菜单宽度
    .menu-type-dual-menu & {
      width: 255px;
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

    // 当不显示面包屑时，内容区域会自动占据 app-layout__main 的剩余高度
    // 由于 app-layout__main 使用 flex 布局，app-layout__content 使用 flex: 1
    // 当 app-layout__header 高度减少时（面包屑不显示），app-layout__content 会自动占据更多空间
    // 不需要额外的样式调整，flex 布局会自动处理


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

    // 双栏菜单模式：宽度与单列菜单一致（255px）
    &.menu-type-dual-menu {
      .app-layout__sidebar {
        width: 255px;
      }
      .app-layout__main {
        width: calc(100% - 255px);
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

// 折叠状态样式（桌面端，> 768px）
// 关键：使用 !important 确保在生产环境下优先级高于默认样式
@media only screen and (min-width: 768px) {
  .app-layout.is-collapse {
    .app-layout__sidebar {
      width: 64px !important;
    }

    .app-layout__main {
      width: calc(100% - 64px) !important;
    }

    // 顶部菜单模式：折叠不影响
    &.menu-type-top {
      .app-layout__main {
        width: 100% !important;
      }
    }

    // 双栏菜单模式：宽度与单列菜单一致（255px）
    &.menu-type-dual-menu {
      .app-layout__main {
        width: calc(100% - 255px) !important;
      }
    }
  }
}
</style>

