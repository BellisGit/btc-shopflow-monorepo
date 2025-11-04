/**
 * 设置状态管理
 * 使用 localStorage 持久化设置状态
 */

import { ref, computed, nextTick } from 'vue';
import { storage } from '@btc/shared-utils';
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType } from '../config/enums';
import { config } from '@/config';

// 单例状态实例
let settingsStateInstance: ReturnType<typeof createSettingsState> | null = null;

/**
 * 创建设置状态的函数（内部使用）
 */
function createSettingsState() {
  // 从系统配置获取默认值
  const defaultSetting = config.app.systemSetting;

  // 菜单相关设置
  const menuType = ref<MenuTypeEnum>(storage.get('menuType') || MenuTypeEnum.LEFT);
  const menuOpenWidth = ref<number>(storage.get('menuOpenWidth') ?? defaultSetting.defaultMenuWidth);
  const menuOpen = ref<boolean>(storage.get('menuOpen') ?? true);

  // 主题相关设置
  const storedSystemThemeType = storage.get('systemThemeType');
  const systemThemeType = ref<SystemThemeEnum>(
    storedSystemThemeType && Object.values(SystemThemeEnum).includes(storedSystemThemeType as SystemThemeEnum)
      ? (storedSystemThemeType as SystemThemeEnum)
      : defaultSetting.defaultSystemThemeType
  );
  
  const storedSystemThemeMode = storage.get('systemThemeMode');
  const systemThemeMode = ref<SystemThemeEnum>(
    storedSystemThemeMode && Object.values(SystemThemeEnum).includes(storedSystemThemeMode as SystemThemeEnum)
      ? (storedSystemThemeMode as SystemThemeEnum)
      : systemThemeType.value
  );
  
  // 如果使用的是默认值且存储中没有值，保存默认值到存储
  if (!storedSystemThemeType || !Object.values(SystemThemeEnum).includes(storedSystemThemeType as SystemThemeEnum)) {
    storage.set('systemThemeType', systemThemeType.value);
  }
  if (!storedSystemThemeMode || !Object.values(SystemThemeEnum).includes(storedSystemThemeMode as SystemThemeEnum)) {
    storage.set('systemThemeMode', systemThemeMode.value);
  }
  
  // 菜单风格设置 - 从存储读取或使用默认值
  // 如果存储中没有值，使用默认值；如果存储的值无效，也使用默认值
  const storedMenuTheme = storage.get('menuThemeType');
  const validMenuTheme = storedMenuTheme && Object.values(MenuThemeEnum).includes(storedMenuTheme as MenuThemeEnum)
    ? (storedMenuTheme as MenuThemeEnum)
    : defaultSetting.defaultMenuTheme;
  
  const menuThemeType = ref<MenuThemeEnum>(validMenuTheme);
  
  // 如果使用的是默认值且存储中没有值，保存默认值到存储
  if (!storedMenuTheme || !Object.values(MenuThemeEnum).includes(storedMenuTheme as MenuThemeEnum)) {
    storage.set('menuThemeType', validMenuTheme);
  }
  
  const systemThemeColor = ref<string>(storage.get('systemThemeColor') || defaultSetting.defaultSystemThemeColor);

  // 界面显示设置
  const showMenuButton = ref<boolean>(storage.get('showMenuButton') ?? true);
  const showFastEnter = ref<boolean>(storage.get('showFastEnter') ?? true);
  const showRefreshButton = ref<boolean>(storage.get('showRefreshButton') ?? true);
  const showCrumbs = ref<boolean>(storage.get('showCrumbs') ?? defaultSetting.defaultShowCrumbs);
  const showWorkTab = ref<boolean>(storage.get('showWorkTab') ?? defaultSetting.defaultShowWorkTab);
  const showGlobalSearch = ref<boolean>(storage.get('showGlobalSearch') ?? defaultSetting.defaultShowGlobalSearch);
  const showLanguage = ref<boolean>(storage.get('showLanguage') ?? true);
  const showNprogress = ref<boolean>(storage.get('showNprogress') ?? true);
  const colorWeak = ref<boolean>(storage.get('colorWeak') ?? defaultSetting.defaultColorWeak);
  const watermarkVisible = ref<boolean>(storage.get('watermarkVisible') ?? false);

  // 其他设置
  const containerWidth = ref<ContainerWidthEnum>(storage.get('containerWidth') || ContainerWidthEnum.FULL);
  const boxBorderMode = ref<boolean>(storage.get('boxBorderMode') ?? defaultSetting.defaultBoxBorderMode);
  const uniqueOpened = ref<boolean>(storage.get('uniqueOpened') ?? defaultSetting.defaultUniqueOpened);
  const tabStyle = ref<string>(storage.get('tabStyle') || defaultSetting.defaultTabStyle);
  const pageTransition = ref<string>(storage.get('pageTransition') || defaultSetting.defaultPageTransition);
  const customRadius = ref<string>(storage.get('customRadius') || defaultSetting.defaultCustomRadius);

  // 初始化时应用设置
  // 1. 应用系统主题（应用到 DOM）- 确保在页面加载时立即应用
  const applySystemTheme = () => {
    const htmlEl = document.documentElement;
    // 先清除所有可能的主题类，确保干净的状态
    htmlEl.classList.remove('dark');
    
    if (systemThemeType.value === SystemThemeEnum.DARK) {
      htmlEl.classList.add('dark');
    } else if (systemThemeType.value === SystemThemeEnum.LIGHT) {
      // 浅色主题：确保移除 dark class
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
  };

  // 立即应用系统主题
  applySystemTheme();

  // 监听系统主题变化（AUTO 模式）
  if (systemThemeType.value === SystemThemeEnum.AUTO) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      applySystemTheme();
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(handleThemeChange);
    }
  }

  // 2. 应用盒子模式
  document.documentElement.setAttribute('data-box-mode', boxBorderMode.value ? BoxStyleType.BORDER : BoxStyleType.SHADOW);

  // 3. 应用色弱模式
  if (colorWeak.value) {
    document.documentElement.classList.add('color-weak');
  }

  // 4. 应用自定义圆角
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
   * 注意：菜单风格值独立存储，不受系统主题影响
   * UI 层面的限制在 menu-style 组件中处理
   */
  function switchMenuStyles(theme: MenuThemeEnum) {
    menuThemeType.value = theme;
    storage.set('menuThemeType', theme);
  }

  /**
   * 禁用过渡效果（参考 art-design-pro，避免主题切换时的水合问题）
   */
  const disableTransitions = () => {
    const style = document.createElement('style');
    style.setAttribute('id', 'disable-transitions');
    style.textContent = '* { transition: none !important; }';
    document.head.appendChild(style);
  };

  /**
   * 启用过渡效果
   */
  const enableTransitions = () => {
    const style = document.getElementById('disable-transitions');
    if (style) {
      style.remove();
    }
  };

  /**
   * 切换主题风格
   * 使用与顶栏主题切换按钮相同的逻辑（theme.toggleDark），确保一致性
   * 关键：通过 useDark 自动管理 dark 类，避免手动管理导致的冲突
   */
  function switchThemeStyles(theme: SystemThemeEnum) {
    // 计算目标暗色模式状态
    const targetIsDark = theme === SystemThemeEnum.DARK || 
      (theme === SystemThemeEnum.AUTO && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 先更新设置状态（同步执行，避免响应式延迟）
    systemThemeType.value = theme;
    systemThemeMode.value = theme;
    storage.set('systemThemeType', theme);
    storage.set('systemThemeMode', theme);

    // 尝试获取主题插件实例（先尝试同步获取，如果失败则使用动态导入）
    let themePlugin: any = null;
    
    // 优先尝试从 window 获取（同步方式）
    themePlugin = (window as any).__THEME_PLUGIN__ || (globalThis as any).__THEME_PLUGIN__;
    
    // 如果同步获取失败，尝试动态导入（异步方式）
    if (!themePlugin || !themePlugin.isDark) {
      // 使用动态导入获取主题插件
      import('@btc/shared-core').then(({ useThemePlugin }) => {
        try {
          const plugin = useThemePlugin();
          if (plugin && plugin.isDark) {
            // 如果已经是目标状态，直接返回
            if (plugin.isDark.value === targetIsDark) {
              return;
            }

            // 临时禁用过渡效果
            disableTransitions();

            // 使用与 toggleDark 相同的逻辑：同步更新 isDark 状态
            plugin.isDark.value = targetIsDark;

            // 同步更新主题颜色 CSS 变量
            if (plugin.setThemeColor && plugin.currentTheme?.value) {
              plugin.setThemeColor(
                plugin.currentTheme.value.color,
                targetIsDark
              );
            }

            // 强制浏览器立即重新计算样式
            const htmlEl = document.documentElement;
            void htmlEl.offsetHeight;

            // 恢复过渡效果
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                enableTransitions();
              });
            });
          }
        } catch (e) {
          console.warn('Failed to get theme plugin:', e);
        }
      }).catch(() => {
        console.warn('Failed to import theme plugin');
      });
      return;
    }

    // 如果已经是目标状态，直接返回
    if (themePlugin.isDark.value === targetIsDark) {
      return;
    }

    // 临时禁用过渡效果（参考 art-design-pro，关键步骤）
    disableTransitions();

    // 使用与 toggleDark 相同的逻辑：同步更新 isDark 状态
    // useDark 会自动管理 html 元素的 dark 类
    themePlugin.isDark.value = targetIsDark;

    // 同步更新主题颜色 CSS 变量（必须在 useDark 更新 dark 类之后）
    // 这会让 Element Plus 的 CSS 变量立即更新
    if (themePlugin.setThemeColor && themePlugin.currentTheme?.value) {
      themePlugin.setThemeColor(
        themePlugin.currentTheme.value.color,
        targetIsDark
      );
    }

    // 强制浏览器立即重新计算样式（关键步骤）
    const htmlEl = document.documentElement;
    void htmlEl.offsetHeight;

    // 使用双重 requestAnimationFrame 确保在下一帧恢复过渡效果（参考 art-design-pro）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransitions();
      });
    });
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
   * 设置工作台标签页
   */
  function setWorkTab(value: boolean) {
    showWorkTab.value = value;
    storage.set('showWorkTab', value);
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
   * 设置面包屑
   */
  function setCrumbs(value: boolean) {
    showCrumbs.value = value;
    storage.set('showCrumbs', value);
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
   * 设置唯一展开
   */
  function setUniqueOpened(value: boolean) {
    uniqueOpened.value = value;
    storage.set('uniqueOpened', value);
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
   * 设置颜色弱
   */
  function setColorWeak(value: boolean) {
    colorWeak.value = value;
    storage.set('colorWeak', value);
    // 应用 CSS 类到 html 元素
    const htmlEl = document.documentElement;
    if (value) {
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
   * 设置全局搜索
   */
  function setGlobalSearch(value: boolean) {
    showGlobalSearch.value = value;
    storage.set('showGlobalSearch', value);
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
   * 需要考虑 AUTO 模式下系统主题的变化
   */
  const isDark = computed(() => {
    if (systemThemeType.value === SystemThemeEnum.DARK) {
      return true;
    }
    if (systemThemeType.value === SystemThemeEnum.LIGHT) {
      return false;
    }
    // AUTO - 跟随系统
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    setWorkTab,
    setUniqueOpened,
    setGlobalSearch,
    setCrumbs,
    setColorWeak,
  };
}

/**
 * 设置状态管理组合式函数（单例模式）
 * 确保所有组件使用同一个状态实例
 */
export function useSettingsState() {
  if (!settingsStateInstance) {
    settingsStateInstance = createSettingsState();
  }
  return settingsStateInstance;
}

