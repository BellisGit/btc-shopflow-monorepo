/**
 * 设置状态管理
 * 使用 localStorage 持久化设置状态
 */

import { ref, computed } from 'vue';
import { storage } from '@btc/shared-utils';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType } from '../config/enums';

/**
 * 设置状态管理组合式函数
 */
export function useSettingsState() {
  // 菜单相关设置
  const menuType = ref<MenuTypeEnum>(storage.get('menuType') || MenuTypeEnum.LEFT);
  const menuOpenWidth = ref<number>(storage.get('menuOpenWidth') || 240);
  const menuOpen = ref<boolean>(storage.get('menuOpen') ?? true);

  // 主题相关设置
  const systemThemeType = ref<SystemThemeEnum>(storage.get('systemThemeType') || SystemThemeEnum.AUTO);
  const systemThemeMode = ref<SystemThemeEnum>(storage.get('systemThemeMode') || SystemThemeEnum.AUTO);
  const menuThemeType = ref<MenuThemeEnum>(storage.get('menuThemeType') || MenuThemeEnum.DESIGN);
  const systemThemeColor = ref<string>(storage.get('systemThemeColor') || '#409eff');

  // 界面显示设置
  const showMenuButton = ref<boolean>(storage.get('showMenuButton') ?? true);
  const showFastEnter = ref<boolean>(storage.get('showFastEnter') ?? true);
  const showRefreshButton = ref<boolean>(storage.get('showRefreshButton') ?? true);
  const showCrumbs = ref<boolean>(storage.get('showCrumbs') ?? true);
  const showWorkTab = ref<boolean>(storage.get('showWorkTab') ?? true);
  const showGlobalSearch = ref<boolean>(storage.get('showGlobalSearch') ?? true);
  const showLanguage = ref<boolean>(storage.get('showLanguage') ?? true);
  const showNprogress = ref<boolean>(storage.get('showNprogress') ?? true);
  const colorWeak = ref<boolean>(storage.get('colorWeak') ?? false);
  const watermarkVisible = ref<boolean>(storage.get('watermarkVisible') ?? false);

  // 其他设置
  const containerWidth = ref<ContainerWidthEnum>(storage.get('containerWidth') || ContainerWidthEnum.FULL);
  const boxBorderMode = ref<boolean>(storage.get('boxBorderMode') ?? false);
  const uniqueOpened = ref<boolean>(storage.get('uniqueOpened') ?? false);
  const tabStyle = ref<string>(storage.get('tabStyle') || 'tab-default');
  const pageTransition = ref<string>(storage.get('pageTransition') || 'slide-left');
  const customRadius = ref<string>(storage.get('customRadius') || '0.25');

  // 初始化时应用设置
  // 应用色弱模式
  if (colorWeak.value) {
    document.documentElement.classList.add('color-weak');
  }
  // 应用自定义圆角
  document.documentElement.style.setProperty('--custom-radius', `${customRadius.value}rem`);

  /**
   * 切换菜单布局
   */
  function switchMenuLayouts(type: MenuTypeEnum) {
    menuType.value = type;
    storage.set('menuType', type);
  }

  /**
   * 切换菜单样式
   */
  function switchMenuStyles(theme: MenuThemeEnum) {
    menuThemeType.value = theme;
    storage.set('menuThemeType', theme);
  }

  /**
   * 切换主题风格
   */
  function switchThemeStyles(theme: SystemThemeEnum) {
    systemThemeType.value = theme;
    systemThemeMode.value = theme;
    storage.set('systemThemeType', theme);
    storage.set('systemThemeMode', theme);

    // 应用到 DOM
    const htmlEl = document.documentElement;
    if (theme === SystemThemeEnum.DARK) {
      htmlEl.classList.add('dark');
    } else if (theme === SystemThemeEnum.LIGHT) {
      htmlEl.classList.remove('dark');
    } else {
      // AUTO - 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        htmlEl.classList.add('dark');
      } else {
        htmlEl.classList.remove('dark');
      }
    }
  }

  /**
   * 设置系统主题色
   */
  function setSystemThemeColor(color: string) {
    systemThemeColor.value = color;
    storage.set('systemThemeColor', color);
    // 这里可以触发主题色更新事件
    window.dispatchEvent(new CustomEvent('theme-color-change', { detail: { color } }));
  }

  /**
   * 设置容器宽度
   */
  function setContainerWidth(width: ContainerWidthEnum) {
    containerWidth.value = width;
    storage.set('containerWidth', width);
  }

  /**
   * 设置盒子模式
   */
  function setBoxMode(type: BoxStyleType) {
    const isBorderMode = type === BoxStyleType.BORDER;
    boxBorderMode.value = isBorderMode;
    storage.set('boxBorderMode', isBorderMode);
    document.documentElement.setAttribute('data-box-mode', type);
  }

  /**
   * 切换工作台标签
   */
  function toggleWorkTab() {
    showWorkTab.value = !showWorkTab.value;
    storage.set('showWorkTab', showWorkTab.value);
  }

  /**
   * 切换菜单按钮
   */
  function toggleMenuButton() {
    showMenuButton.value = !showMenuButton.value;
    storage.set('showMenuButton', showMenuButton.value);
  }

  /**
   * 切换快速入口
   */
  function toggleFastEnter() {
    showFastEnter.value = !showFastEnter.value;
    storage.set('showFastEnter', showFastEnter.value);
  }

  /**
   * 切换刷新按钮
   */
  function toggleRefreshButton() {
    showRefreshButton.value = !showRefreshButton.value;
    storage.set('showRefreshButton', showRefreshButton.value);
  }

  /**
   * 切换面包屑
   */
  function toggleCrumbs() {
    showCrumbs.value = !showCrumbs.value;
    storage.set('showCrumbs', showCrumbs.value);
  }

  /**
   * 切换语言
   */
  function toggleLanguage() {
    showLanguage.value = !showLanguage.value;
    storage.set('showLanguage', showLanguage.value);
  }

  /**
   * 切换唯一展开
   */
  function toggleUniqueOpened() {
    uniqueOpened.value = !uniqueOpened.value;
    storage.set('uniqueOpened', uniqueOpened.value);
  }

  /**
   * 切换Nprogress
   */
  function toggleNprogress() {
    showNprogress.value = !showNprogress.value;
    storage.set('showNprogress', showNprogress.value);
  }

  /**
   * 切换颜色弱
   */
  function toggleColorWeak() {
    colorWeak.value = !colorWeak.value;
    storage.set('colorWeak', colorWeak.value);
    // 应用 CSS 类到 html 元素
    const htmlEl = document.documentElement;
    if (colorWeak.value) {
      htmlEl.classList.add('color-weak');
    } else {
      htmlEl.classList.remove('color-weak');
    }
  }

  /**
   * 切换水印
   */
  function toggleWatermark() {
    watermarkVisible.value = !watermarkVisible.value;
    storage.set('watermarkVisible', watermarkVisible.value);
  }

  /**
   * 设置标签页样式
   */
  function setTabStyle(style: string) {
    tabStyle.value = style;
    storage.set('tabStyle', style);
    // 触发样式更新事件
    window.dispatchEvent(new CustomEvent('tab-style-change', { detail: { style } }));
  }

  /**
   * 设置页面过渡
   */
  function setPageTransition(transition: string) {
    pageTransition.value = transition;
    storage.set('pageTransition', transition);
    // 触发页面过渡动画更新事件
    window.dispatchEvent(new CustomEvent('page-transition-change', { detail: { transition } }));
  }

  /**
   * 设置自定义圆角
   */
  function setCustomRadius(radius: string) {
    customRadius.value = radius;
    storage.set('customRadius', radius);
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--custom-radius', `${radius}rem`);
  }

  /**
   * 切换全局搜索显示
   */
  function toggleGlobalSearch() {
    showGlobalSearch.value = !showGlobalSearch.value;
    storage.set('showGlobalSearch', showGlobalSearch.value);
  }

  /**
   * 设置菜单展开宽度
   */
  function setMenuOpenWidth(width: number) {
    menuOpenWidth.value = width;
    storage.set('menuOpenWidth', width);
  }

  /**
   * 判断是否为暗色模式
   */
  const isDark = computed(() => {
    return systemThemeType.value === SystemThemeEnum.DARK;
  });

  return {
    // 状态
    menuType,
    menuOpenWidth,
    menuOpen,
    systemThemeType,
    systemThemeMode,
    menuThemeType,
    systemThemeColor,
    showMenuButton,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showWorkTab,
    showGlobalSearch,
    showLanguage,
    showNprogress,
    colorWeak,
    watermarkVisible,
    containerWidth,
    boxBorderMode,
    uniqueOpened,
    tabStyle,
    pageTransition,
    customRadius,
    isDark,
    // 方法
    switchMenuLayouts,
    switchMenuStyles,
    switchThemeStyles,
    setSystemThemeColor,
    setContainerWidth,
    setBoxMode,
    toggleWorkTab,
    toggleMenuButton,
    toggleFastEnter,
    toggleRefreshButton,
    toggleCrumbs,
    toggleLanguage,
    toggleUniqueOpened,
    toggleNprogress,
    toggleColorWeak,
    toggleWatermark,
    setTabStyle,
    setPageTransition,
    setCustomRadius,
    setMenuOpenWidth,
    toggleGlobalSearch,
  };
}

