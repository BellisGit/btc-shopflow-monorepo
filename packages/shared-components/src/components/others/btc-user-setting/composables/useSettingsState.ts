/**
 * 璁剧疆鐘舵€佺鐞? * 浣跨敤 localStorage 鎸佷箙鍖栬缃姸鎬? */

import { ref, computed } from 'vue';
import { storage } from '@btc/shared-utils';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType } from '../config/enums';
import { useThemePlugin, type ButtonStyle } from '@btc/shared-core';

/**
 * 璁剧疆鐘舵€佺鐞嗙粍鍚堝紡鍑芥暟
 */
export function useSettingsState() {
  // 鑿滃崟鐩稿叧璁剧疆
  const menuType = ref<MenuTypeEnum>(storage.get('menuType') || MenuTypeEnum.LEFT);
  const menuOpenWidth = ref<number>(storage.get('menuOpenWidth') || 240);
  const menuOpen = ref<boolean>(storage.get('menuOpen') ?? true);

  // 涓婚鐩稿叧璁剧疆
  const systemThemeType = ref<SystemThemeEnum>(storage.get('systemThemeType') || SystemThemeEnum.AUTO);
  const systemThemeMode = ref<SystemThemeEnum>(storage.get('systemThemeMode') || SystemThemeEnum.AUTO);
  const menuThemeType = ref<MenuThemeEnum>(storage.get('menuThemeType') || MenuThemeEnum.DESIGN);
  const systemThemeColor = ref<string>(storage.get('systemThemeColor') || '#409eff');

  // 鐣岄潰鏄剧ず璁剧疆
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

  // 鍏朵粬璁剧疆
  const containerWidth = ref<ContainerWidthEnum>(storage.get('containerWidth') || ContainerWidthEnum.FULL);
  const boxBorderMode = ref<boolean>(storage.get('boxBorderMode') ?? false);
  const uniqueOpened = ref<boolean>(storage.get('uniqueOpened') ?? false);
  const tabStyle = ref<string>(storage.get('tabStyle') || 'tab-default');
  const pageTransition = ref<string>(storage.get('pageTransition') || 'slide-left');
  const customRadius = ref<string>(storage.get('customRadius') || '0.25');

  // 按钮风格设置
  const getSettings = (): Record<string, any> => (storage.get('settings') as Record<string, any> | null) ?? {};
  const initialSettings = getSettings();
  const legacyButtonStyle = storage.get<ButtonStyle>('button-style');
  const storedButtonStyle = initialSettings.buttonStyle ?? legacyButtonStyle;
  const resolvedButtonStyle: ButtonStyle =
    storedButtonStyle === 'minimal' ? 'minimal' : 'default';
  const buttonStyle = ref<ButtonStyle>(resolvedButtonStyle);
  if (!initialSettings.buttonStyle || (initialSettings.buttonStyle !== 'default' && initialSettings.buttonStyle !== 'minimal')) {
    storage.set('settings', { ...initialSettings, buttonStyle: resolvedButtonStyle });
  }
  if (legacyButtonStyle) {
    storage.remove('buttonStyle');
  }

  const resolveThemePlugin = () => {
    try {
      return useThemePlugin();
    } catch {
      return (globalThis as any).__THEME_PLUGIN__ || null;
    }
  };

  const applyButtonStyle = (style: ButtonStyle) => {
    const themePlugin = resolveThemePlugin();
    if (themePlugin?.setButtonStyle) {
      themePlugin.setButtonStyle(style);
    } else if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-button-style', style);
    }
  };

  applyButtonStyle(buttonStyle.value);

  function setButtonStyle(style: ButtonStyle) {
    if (buttonStyle.value === style) return;
    buttonStyle.value = style;
    const settings = getSettings();
    storage.set('settings', { ...settings, buttonStyle: style });
    applyButtonStyle(style);
  }

  // 鍒濆鍖栨椂搴旂敤璁剧疆
  // 搴旂敤鑹插急妯″紡
  if (colorWeak.value) {
    document.documentElement.classList.add('color-weak');
  }
  // 搴旂敤鑷畾涔夊渾瑙?  document.documentElement.style.setProperty('--custom-radius', `${customRadius.value}rem`);

  /**
   * 鍒囨崲鑿滃崟甯冨眬
   */
  function switchMenuLayouts(type: MenuTypeEnum) {
    menuType.value = type;
    storage.set('menuType', type);
  }

  /**
   * 鍒囨崲鑿滃崟鏍峰紡
   */
  function switchMenuStyles(theme: MenuThemeEnum) {
    menuThemeType.value = theme;
    storage.set('menuThemeType', theme);
  }

  /**
   * 鍒囨崲涓婚椋庢牸
   */
  function switchThemeStyles(theme: SystemThemeEnum) {
    systemThemeType.value = theme;
    systemThemeMode.value = theme;
    // 浣跨敤缁熶竴鐨?settings 瀛樺偍锛岃€屼笉鏄崟鐙殑 systemThemeType 鍜?systemThemeMode
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', {
      ...currentSettings,
      systemThemeType: theme,
      systemThemeMode: theme
    });
    // 娓呯悊鏃х殑鐙珛瀛樺偍 key
    storage.remove('systemThemeType');
    storage.remove('systemThemeMode');

    // 搴旂敤鍒?DOM
    const htmlEl = document.documentElement;
    if (theme === SystemThemeEnum.DARK) {
      htmlEl.classList.add('dark');
    } else if (theme === SystemThemeEnum.LIGHT) {
      htmlEl.classList.remove('dark');
    } else {
      // AUTO - 璺熼殢绯荤粺
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        htmlEl.classList.add('dark');
      } else {
        htmlEl.classList.remove('dark');
      }
    }
  }

  /**
   * 璁剧疆绯荤粺涓婚鑹?   */
  function setSystemThemeColor(color: string) {
    systemThemeColor.value = color;
    // 浣跨敤缁熶竴鐨?settings 瀛樺偍
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', {
      ...currentSettings,
      systemThemeColor: color
    });
    // 娓呯悊鏃х殑鐙珛瀛樺偍 key
    storage.remove('systemThemeColor');
    // 杩欓噷鍙互瑙﹀彂涓婚鑹叉洿鏂颁簨浠?    window.dispatchEvent(new CustomEvent('theme-color-change', { detail: { color } }));
  }

  /**
   * 璁剧疆瀹瑰櫒瀹藉害
   */
  function setContainerWidth(width: ContainerWidthEnum) {
    containerWidth.value = width;
    storage.set('containerWidth', width);
  }

  /**
   * 璁剧疆鐩掑瓙妯″紡
   */
  function setBoxMode(type: BoxStyleType) {
    const isBorderMode = type === BoxStyleType.BORDER;
    boxBorderMode.value = isBorderMode;
    storage.set('boxBorderMode', isBorderMode);
    document.documentElement.setAttribute('data-box-mode', type);
  }

  /**
   * 鍒囨崲宸ヤ綔鍙版爣绛?   */
  function toggleWorkTab() {
    showWorkTab.value = !showWorkTab.value;
    storage.set('showWorkTab', showWorkTab.value);
  }

  /**
   * 鍒囨崲鑿滃崟鎸夐挳
   */
  function toggleMenuButton() {
    showMenuButton.value = !showMenuButton.value;
    storage.set('showMenuButton', showMenuButton.value);
  }

  /**
   * 鍒囨崲蹇€熷叆鍙?   */
  function toggleFastEnter() {
    showFastEnter.value = !showFastEnter.value;
    storage.set('showFastEnter', showFastEnter.value);
  }

  /**
   * 鍒囨崲鍒锋柊鎸夐挳
   */
  function toggleRefreshButton() {
    showRefreshButton.value = !showRefreshButton.value;
    storage.set('showRefreshButton', showRefreshButton.value);
  }

  /**
   * 鍒囨崲闈㈠寘灞?   */
  function toggleCrumbs() {
    showCrumbs.value = !showCrumbs.value;
    storage.set('showCrumbs', showCrumbs.value);
  }

  /**
   * 鍒囨崲璇█
   */
  function toggleLanguage() {
    showLanguage.value = !showLanguage.value;
    storage.set('showLanguage', showLanguage.value);
  }

  /**
   * 鍒囨崲鍞竴灞曞紑
   */
  function toggleUniqueOpened() {
    uniqueOpened.value = !uniqueOpened.value;
    storage.set('uniqueOpened', uniqueOpened.value);
  }

  /**
   * 鍒囨崲Nprogress
   */
  function toggleNprogress() {
    showNprogress.value = !showNprogress.value;
    storage.set('showNprogress', showNprogress.value);
  }

  /**
   * 鍒囨崲棰滆壊寮?   */
  function toggleColorWeak() {
    colorWeak.value = !colorWeak.value;
    storage.set('colorWeak', colorWeak.value);
    // 搴旂敤 CSS 绫诲埌 html 鍏冪礌
    const htmlEl = document.documentElement;
    if (colorWeak.value) {
      htmlEl.classList.add('color-weak');
    } else {
      htmlEl.classList.remove('color-weak');
    }
  }

  /**
   * 鍒囨崲姘村嵃
   */
  function toggleWatermark() {
    watermarkVisible.value = !watermarkVisible.value;
    storage.set('watermarkVisible', watermarkVisible.value);
  }

  /**
   * 璁剧疆鏍囩椤垫牱寮?   */
  function setTabStyle(style: string) {
    tabStyle.value = style;
    storage.set('tabStyle', style);
    // 瑙﹀彂鏍峰紡鏇存柊浜嬩欢
    window.dispatchEvent(new CustomEvent('tab-style-change', { detail: { style } }));
  }

  /**
   * 璁剧疆椤甸潰杩囨浮
   */
  function setPageTransition(transition: string) {
    pageTransition.value = transition;
    storage.set('pageTransition', transition);
    // 瑙﹀彂椤甸潰杩囨浮鍔ㄧ敾鏇存柊浜嬩欢
    window.dispatchEvent(new CustomEvent('page-transition-change', { detail: { transition } }));
  }

  /**
   * 璁剧疆鑷畾涔夊渾瑙?   */
  function setCustomRadius(radius: string) {
    customRadius.value = radius;
    storage.set('customRadius', radius);
    // 璁剧疆 CSS 鍙橀噺
    document.documentElement.style.setProperty('--custom-radius', `${radius}rem`);
  }

  /**
   * 鍒囨崲鍏ㄥ眬鎼滅储鏄剧ず
   */
  function toggleGlobalSearch() {
    showGlobalSearch.value = !showGlobalSearch.value;
    storage.set('showGlobalSearch', showGlobalSearch.value);
  }

  /**
   * 璁剧疆鑿滃崟灞曞紑瀹藉害
   */
  function setMenuOpenWidth(width: number) {
    menuOpenWidth.value = width;
    storage.set('menuOpenWidth', width);
  }

  /**
   * 鍒ゆ柇鏄惁涓烘殫鑹叉ā寮?   */
  const isDark = computed(() => {
    return systemThemeType.value === SystemThemeEnum.DARK;
  });

  return {
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
    buttonStyle,
    isDark,
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
    setButtonStyle,
    setMenuOpenWidth,
    toggleGlobalSearch,
  };
}


