<template>
  <div class="topbar" :class="{ 'is-dark-menu': isDarkMenuStyle }">
    <!-- 左侧：汉堡菜单 + Logo 区域（与侧边栏宽度一致） -->
      <div
        class="topbar__brand"
        :class="{
          'is-collapse': isCollapse && props.menuType !== 'top' && props.menuType !== 'dual-menu',
          'menu-type-top': props.menuType === 'top',
          'menu-type-dual-menu': props.menuType === 'dual-menu',
        }"
      >
      <!-- 汉堡菜单 -->
      <div
        class="topbar__hamburger"
        :class="{ 'is-active': drawerVisible }"
        @click.stop="$emit('toggle-drawer')"
        @mouseenter="$emit('open-drawer')"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>

      <!-- Logo + 标题（顶部菜单和双栏菜单模式下隐藏） -->
      <div
        v-if="props.menuType !== 'top' && props.menuType !== 'dual-menu'"
        :key="logoKey"
        class="topbar__logo-content"
        :class="{
          'is-dark-menu': isDarkMenuStyle,
          'is-dark-theme': isDark,
        }"
      >
        <img :src="logoUrl" alt="BTC Logo" class="topbar__logo-img" @error="handleLogoError" />
        <h2
          class="topbar__logo-text"
          :style="{ color: menuThemeConfig.systemNameColor }"
        >{{ logoTitle }}</h2>
      </div>
    </div>

    <!-- 中间：工具区域（折叠按钮 + 搜索框 + 顶部菜单） -->
    <div class="topbar__left">
      <!-- 折叠按钮（仅左侧菜单和混合菜单显示） -->
      <BtcIconButton
        v-if="props.menuType === 'left' || props.menuType === 'top-left'"
        :config="{
          icon: () => isCollapse ? 'expand' : 'fold',
          tooltip: () => isCollapse ? t('common.tooltip.expand_sidebar') : t('common.tooltip.collapse_sidebar'),
          onClick: handleToggleSidebar
        }"
      />

      <!-- 全局搜索（移动端隐藏，且设置中启用，顶部菜单模式下也显示） -->
      <GlobalSearch v-if="!browser.isMini && showGlobalSearch" />

      <!-- 顶部菜单（仅顶部菜单模式显示，在搜索框右侧） -->
      <TopMenu v-if="props.menuType === 'top'" />

      <!-- 混合菜单顶部（仅混合菜单模式显示，在搜索框右侧） -->
      <TopLeftMenu v-if="props.menuType === 'top-left'" />
    </div>

    <div class="topbar__right">
      <!-- 工具栏 -->
      <ul class="topbar__tools">
        <!-- 动态插件工具栏组件（按order排序，根据移动端/桌面端过滤） -->
        <li v-for="toolbarConfig in filteredToolbarComponents" :key="toolbarConfig.order">
          <component :is="toolbarConfig.component" />
        </li>
        <!-- 调试信息：如果工具栏为空，显示调试信息 -->
        <li v-if="filteredToolbarComponents.length === 0" style="padding: 5px; color: red; font-size: 12px; background: yellow;">
          [调试] 工具栏组件为空 (总数: {{ toolbarComponents.length }})
        </li>
      </ul>

      <!-- 用户信息 -->
      <UserInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopbar'
});

import { ref, onMounted, onUnmounted, markRaw, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePluginManager } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';
import { useSettingsState, useSettingsConfig } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { MenuThemeEnum } from '@btc/shared-components/components/others/btc-user-setting/config/enums';
import { useBrowser } from '@btc/shared-components/composables/useBrowser';
import { getCurrentSubApp, isMainApp } from '@configs/unified-env-config';
import { getAppById } from '@configs/app-scanner';
import GlobalSearch from '../global-search/index.vue';
import TopMenu from '../top-menu/index.vue';
import TopLeftMenu from '../top-left-menu/index.vue';
import UserInfo from '../user-info/index.vue';

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
  menuType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
  menuType: 'left',
});

// 获取 emit 函数
const emit = defineEmits<{
  'toggle-sidebar': [];
  'toggle-drawer': [];
  'open-drawer': [];
}>();

const { t } = useI18n();
const route = useRoute();

// 处理折叠按钮点击事件
const handleToggleSidebar = () => {
  emit('toggle-sidebar');
};

// 调试日志：组件初始化
console.log('[Topbar] 组件开始初始化');

// 处理 Logo 加载错误
const handleLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 如果加载失败，隐藏图片或使用占位符
  img.style.display = 'none';
};

// Logo URL - 通过全局函数获取或使用默认值
const logoUrl = computed(() => {
  const getLogoUrl = (window as any).__APP_GET_LOGO_URL__;
  if (getLogoUrl) {
    return getLogoUrl();
  }
  // 默认值
  return '/logo.png';
});

// 浏览器信息
const { browser } = useBrowser();

// 获取设置状态
let showGlobalSearch: any;
let menuThemeType: any;
let isDark: any;
let menuStyleList: any;

try {
  const settingsState = useSettingsState();
  showGlobalSearch = settingsState.showGlobalSearch;
  menuThemeType = settingsState.menuThemeType;
  isDark = settingsState.isDark;
  console.log('[Topbar] useSettingsState 成功:', {
    showGlobalSearch: !!showGlobalSearch,
    menuThemeType: menuThemeType?.value,
    isDark: isDark?.value
  });
} catch (error) {
  console.error('[Topbar] useSettingsState 失败:', error);
  // 使用默认值
  showGlobalSearch = ref(false);
  menuThemeType = ref(null);
  isDark = ref(false);
}

try {
  const settingsConfig = useSettingsConfig();
  menuStyleList = settingsConfig.menuStyleList;
  console.log('[Topbar] useSettingsConfig 成功:', { menuStyleList: menuStyleList?.value?.length });
} catch (error) {
  console.error('[Topbar] useSettingsConfig 失败:', error);
  menuStyleList = ref([]);
}

// 确保所有变量都有值
if (!showGlobalSearch) {
  showGlobalSearch = ref(false);
}
if (!menuThemeType) {
  menuThemeType = ref(null);
}
if (!isDark) {
  isDark = ref(false);
}
if (!menuStyleList) {
  menuStyleList = ref([]);
}

// Logo 区域的 key，用于强制重新渲染
const logoKey = ref(0);

// 响应式的路径和主机名，用于触发 computed 重新计算
const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');
const currentHostname = ref(typeof window !== 'undefined' ? window.location.hostname : '');

// Logo 标题：主应用显示"拜里斯科技"，子应用显示应用名称（如"物流模块"）
const logoTitle = computed(() => {
  try {
    // 使用响应式的路径和主机名，确保在应用切换时重新计算
    // 这里仍然调用函数，但依赖响应式变量来触发重新计算
    void currentPath.value;
    void currentHostname.value;
    void route.path; // 也依赖路由路径

    // 判断是否是主应用
    const isMain = isMainApp();

    if (isMain) {
      // 主应用：显示"拜里斯科技"
      return t('app.title');
    }

    // 子应用：获取当前应用信息
    const currentSubAppId = getCurrentSubApp();
    if (currentSubAppId) {
      // 获取应用配置
      const appConfig = getAppById(currentSubAppId);
      if (appConfig) {
        // 优先使用国际化键 domain.type.{appId}（与菜单抽屉保持一致）
        const domainTypeKey = `domain.type.${currentSubAppId}`;
        const domainTypeName = t(domainTypeKey);

        // 如果国际化值存在且不是 key 本身，则使用国际化值
        if (domainTypeName && domainTypeName !== domainTypeKey) {
          return domainTypeName;
        }

        // 兜底使用应用配置中的 name
        return appConfig.name;
      }
    }

    // 默认使用 app.title
    return t('app.title');
  } catch (error) {
    // 如果出现任何错误（如 getCurrentSubApp 或 getAppById 抛出错误），使用默认标题
    console.error('[Topbar] 计算 logoTitle 时出错:', error);
    try {
      return t('app.title');
    } catch {
      return '拜里斯科技';
    }
  }
});

// 判断是否为深色菜单风格（展示层逻辑）
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 更新路径和主机名的函数
const updateLocation = () => {
  if (typeof window !== 'undefined') {
    currentPath.value = window.location.pathname;
    currentHostname.value = window.location.hostname;
    // 强制更新 logoKey 以触发重新渲染
    nextTick(() => {
      logoKey.value++;
    });
  }
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateLocation();
  },
  { immediate: true }
);

// 监听主题变化，强制更新 Logo 区域
watch(
  () => [isDark?.value, menuThemeType?.value],
  () => {
    // 使用 nextTick 确保在 DOM 更新后强制重新渲染
    nextTick(() => {
      logoKey.value++;
    });
  },
  { immediate: false }
);

// 获取当前菜单主题配置（类似 art-design-pro 的 getMenuTheme）
const menuThemeConfig = computed(() => {
  // 优先判断菜单风格类型（不受系统主题影响）
  const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;

  // 如果是深色菜单风格，无论系统主题如何，都使用深色菜单配置
  if (theme === MenuThemeEnum.DARK) {
    // 深色系统主题下，使用 #0a0a0a 与内容区域一致
    if (isDark?.value === true) {
      return {
        background: '#0a0a0a',
        systemNameColor: '#FFFFFF',
        rightLineColor: '#EDEEF0',
      };
    }
    // 浅色系统主题下，使用深色菜单背景色
    return {
      background: '#0a0a0a',
      systemNameColor: '#BABBBD',
      rightLineColor: '#3F4257',
    };
  }

  // 深色系统主题下强制使用深色菜单配置（展示层逻辑）
  if (isDark?.value === true) {
    return {
      background: '#0a0a0a',
      systemNameColor: '#FFFFFF',
      rightLineColor: '#EDEEF0',
    };
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const themeConfig = menuStyleList.value.find(item => item.theme === theme);

  if (themeConfig) {
    return {
      background: themeConfig.background,
      systemNameColor: themeConfig.systemNameColor,
      rightLineColor: themeConfig.rightLineColor,
    };
  }

  // 默认配置
  return {
    background: '#FFFFFF',
    systemNameColor: 'var(--el-text-color-primary)',
    rightLineColor: '#EDEEF0',
  };
});

// 插件管理器
const pluginManager = usePluginManager();


// 动态工具栏组件
const toolbarComponents = ref<any[]>([]);

// 过滤后的工具栏组件（根据移动端/桌面端显示）
const filteredToolbarComponents = computed(() => {
  console.log('[Topbar] filteredToolbarComponents 计算:', {
    'toolbarComponents.value.length': toolbarComponents.value.length,
    'browser.isMini': browser.isMini,
    'toolbarComponents': toolbarComponents.value.map(c => ({ name: c.name, order: c.order, pc: c.pc, h5: c.h5 }))
  });
  const filtered = toolbarComponents.value.filter(config => {
    // 与 cool-admin 完全一致的过滤逻辑
    if (browser.isMini) {
      // 移动端：使用 h5 属性，如果未定义则默认为 true
      // 注意：如果 h5 为 false，则隐藏；如果 h5 为 true 或 undefined，则显示
      const shouldShow = config.h5 ?? true;
      return shouldShow;
    } else {
      // 桌面端：使用 pc 属性，如果未定义则默认为 true
      // 注意：如果 pc 为 false，则隐藏；如果 pc 为 true 或 undefined，则显示
      const shouldShow = config.pc ?? true;
      return shouldShow;
    }
  });
  console.log('[Topbar] filteredToolbarComponents 结果:', filtered.length, '个');
  return filtered;
});


// 加载工具栏组件的函数
const loadToolbarComponents = async () => {
  try {
    console.log('[Topbar] 开始获取工具栏组件');
    console.log('[Topbar] pluginManager:', pluginManager);
    const toolbarConfigs = pluginManager.getToolbarComponents();
    console.log('[Topbar] 工具栏组件配置:', toolbarConfigs);
    console.log('[Topbar] 工具栏组件数量:', toolbarConfigs.length);

    if (toolbarConfigs.length === 0) {
      console.warn('[Topbar] 没有找到工具栏组件，可能是插件未安装');
      return;
    }

    for (const config of toolbarConfigs) {
      try {
        console.log('[Topbar] 加载工具栏组件:', config.order);
        const component = await config.component();
        toolbarComponents.value.push({
          ...config,
          component: markRaw(component.default || component)
        });
        console.log('[Topbar] 工具栏组件加载成功:', config.order);
      } catch (error) {
        console.error('[Topbar] Failed to load toolbar component:', config.order, error);
      }
    }
    console.log('[Topbar] 工具栏组件加载完成，共', toolbarComponents.value.length, '个');
  } catch (error) {
    console.error('[Topbar] Failed to get toolbar components:', error);
  }
};

// 初始化工具栏组件和用户信息
onMounted(async () => {
  console.log('[Topbar] onMounted 开始执行');
  console.log('[Topbar] props:', {
    isCollapse: props.isCollapse,
    drawerVisible: props.drawerVisible,
    menuType: props.menuType
  });

  // 立即尝试加载工具栏组件
  await loadToolbarComponents();

  // 如果工具栏组件为空，监听插件安装事件
  if (toolbarComponents.value.length === 0) {
    console.log('[Topbar] 工具栏组件为空，等待插件安装...');
    const emitter = (window as any).__APP_EMITTER__;
    if (emitter) {
      const onPluginsInstalled = async () => {
        console.log('[Topbar] 收到插件安装事件，重新加载工具栏组件');
        await loadToolbarComponents();
        emitter.off('plugins-installed', onPluginsInstalled);
      };
      emitter.on('plugins-installed', onPluginsInstalled);

      // 设置超时，避免无限等待
      setTimeout(() => {
        if (toolbarComponents.value.length === 0) {
          console.warn('[Topbar] 等待插件安装超时，尝试重新加载工具栏组件');
          loadToolbarComponents();
        }
      }, 2000);
    }
  }

  console.log('[Topbar] onMounted 执行完成');

  // 监听应用切换事件，更新 Logo 标题
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.on('app.switch', updateLocation);
  }

  // 监听浏览器历史记录变化（popstate 事件）
  window.addEventListener('popstate', updateLocation);

  // 监听 pushState 和 replaceState（通过重写 history API）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    // 延迟更新，确保路径已变化
    setTimeout(updateLocation, 0);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    // 延迟更新，确保路径已变化
    setTimeout(updateLocation, 0);
  };

  // 保存原始方法以便清理
  (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__ = originalPushState;
  (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__ = originalReplaceState;
});

// 清理事件监听
onUnmounted(() => {
  // 清理应用切换事件监听
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.off('app.switch', updateLocation);
  }

  // 清理浏览器历史记录监听
  window.removeEventListener('popstate', updateLocation);

  // 恢复原始的 history API
  const originalPushState = (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__;
  const originalReplaceState = (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__;
  if (originalPushState) {
    history.pushState = originalPushState;
  }
  if (originalReplaceState) {
    history.replaceState = originalReplaceState;
  }
});

</script>

<style lang="scss" scoped>
.topbar {
  height: 47px;
  min-height: 47px;
  width: 100%; // 明确设置宽度为 100%，确保延伸到最右侧
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: visible; // 确保内容不被裁切

  // 品牌区域（汉堡菜单 + Logo，与侧边栏宽度一致）
  // 无论屏幕大小，都与侧边栏同步折叠和展开
  &__brand {
    display: flex;
    align-items: stretch;
    width: 255px; // 与侧边栏宽度一致
    height: 47px;
    border-right: 1px solid var(--el-border-color); // 右侧分隔线
    border-bottom: 1px solid var(--el-border-color); // 底部分隔线（logo区域和搜索区域之间），与顶栏底部分隔线保持一致
    position: relative;
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    // 与侧边栏同步折叠
    &.is-collapse {
      width: 64px; // 折叠时只显示汉堡菜单

      .topbar__logo-content {
        opacity: 0;
        visibility: hidden;
      }
    }

    // 顶部菜单模式：只显示汉堡菜单，隐藏logo和标题
    &.menu-type-top {
      width: 64px; // 只显示汉堡菜单

      .topbar__logo-content {
        display: none;
      }
    }

    // 双栏菜单模式：品牌区域宽度固定，隐藏 logo 和标题
    &.menu-type-dual-menu {
      width: 64px; // 与折叠菜单和双栏菜单左侧栏宽度一致

      .topbar__logo-content {
        display: none !important; // 完全隐藏 logo 和标题
      }
    }
  }

  // 汉堡菜单样式（主题色背景）
  &__hamburger {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 47px;
    cursor: pointer;
    flex-shrink: 0;
    gap: 5px;
    background-color: var(--el-color-primary); // 主题色背景
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover {
        background-color: var(--el-color-primary-light-3); // 悬停时浅色主题色

        .hamburger-line {
          background-color: #fff;
        }
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active {
        background-color: var(--el-color-primary-light-3);

        .hamburger-line {
          background-color: #fff;
        }
      }
    }

    &:active {
      background-color: var(--el-color-primary-dark-2); // 按下时深色主题色
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background-color: #fff; // 白色线条
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    // 交叉状态（抽屉打开时）
    &.is-active {
      .hamburger-line {
        &:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        &:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        &:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }
  }

  // Logo 内容区域（填充剩余空间）
  &__logo-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    overflow: hidden;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 默认浅色背景（根据菜单风格配置）
    background-color: #FFFFFF;

    // 暗色系统主题下强制使用深色背景
    html.dark & {
      background-color: #0a0a0a !important;
    }

    // 深色菜单风格下（浅色系统主题）使用深色背景
    &.is-dark-menu:not(.is-dark-theme) {
      background-color: #0a0a0a !important;
    }
  }

  &__logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  // 左侧工具区（折叠按钮 + 搜索 + 顶部菜单）
  &__left {
    display: flex;
    align-items: center;
    gap: 5px !important; // 与 tabbar 的按钮间距保持一致，使用 !important 确保优先级
    padding-left: 10px; // 与品牌区域的间距（对应 tabbar 内容区的 padding-left）
    flex: 1; // 占据剩余空间，让顶部菜单可以展开
    overflow: hidden; // 防止溢出
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    user-select: none;
  }

  &__right {
    display: flex;
    align-items: center;
    margin-left: auto; // 自动靠右
  }

  &__tools {
    display: flex;
    margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    margin-right: 0; // 移除右边距，让背景延伸到最右侧
    column-gap: 10px !important; // 使用 !important 确保优先级，防止浏览器默认样式影响

    & > li {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
      padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
      height: 45px;
      cursor: pointer;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    padding: 5px 5px 5px 10px;
    border-radius: 6px;

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active {
        background-color: var(--el-fill-color-light);
      }
    }

    &-name {
      position: relative;
      display: inline-block;
      margin-right: 10px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;

      // 使用伪元素预留完整宽度（不可见，用于保持布局）
      &::before {
        content: attr(data-full-name);
        visibility: hidden;
        display: inline-block;
        height: 0;
        font-weight: bold;
      }

      &-text {
        position: absolute;
        left: 0;
        top: 0;
        white-space: nowrap;
        // 从左到右炫彩渐变（静态，不动画）- 亮色模式
        background: linear-gradient(to right, #4F46E5, #EC4899, #06B6D4);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;

        // 暗色模式适配
        &.is-dark {
          background: linear-gradient(to right, #818cf8, #f472b6, #22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
        }
      }

      &-cursor {
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        color: #4F46E5;
        animation: cursorBlink 1.2s infinite;
        white-space: nowrap;
        // 光标位置跟随文字，通过 JavaScript 动态设置

        // 暗色模式适配
        .topbar.is-dark-menu & {
          color: #818cf8;
        }
      }
    }

    @keyframes cursorBlink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
    }
  }
}
</style>

<style lang="scss">
/**
 * 全局样式（非 scoped）
 * 用于覆盖深色菜单风格下的 Logo 文字颜色
 */

// 深色菜单风格下的顶栏 logo 文字颜色
.topbar.is-dark-menu {
  .topbar__logo-content {
    .topbar__logo-text {
      // 浅色系统主题下的深色菜单风格使用灰色
      color: #BABBBD !important;

      // 暗色系统主题下使用白色以提高对比度
      html.dark & {
        color: #FFFFFF !important;
      }
    }
  }

  // 品牌区域底部分隔线（logo 区域和搜索区域之间）与顶栏底部分隔线保持一致
  .topbar__brand {
    border-bottom-color: var(--el-border-color) !important;
  }

  // Logo 内容区域背景色（深色菜单风格，与菜单背景一致）
  .topbar__brand .topbar__logo-content {
    // 深色系统主题下，使用 #0a0a0a 与内容区域一致
    html.dark & {
      background-color: #0a0a0a !important;
    }

    // 浅色系统主题下，使用深色菜单背景色
    html:not(.dark) & {
      background-color: #0a0a0a !important;
    }
  }
}
</style>
