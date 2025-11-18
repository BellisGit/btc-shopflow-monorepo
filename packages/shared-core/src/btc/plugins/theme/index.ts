import type { App, Plugin } from 'vue';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '@btc/shared-utils';
import { THEME_PRESETS, type ThemeConfig } from '../../composables/useTheme';
import { setThemeColor } from './composables/useThemeColor';
import { migrateThemeConfig } from './composables/useThemeMigration';
import { createToggleDark } from './composables/useThemeToggle';

/**
 * 主题插件实例
 */
export type ButtonStyle = 'default' | 'minimal';

export interface ThemePlugin {
  currentTheme: ReturnType<typeof ref<ThemeConfig>>;
  isDark: ReturnType<typeof useDark>;
  color: ReturnType<typeof computed<string>>;
  THEME_PRESETS: typeof THEME_PRESETS;
  switchTheme: (theme: ThemeConfig) => void;
  toggleDark: (event?: MouseEvent) => void;
  changeDark: (el: Element, isDark: boolean, cb: () => void) => void;
  setThemeColor: (color: string, dark: boolean) => void;
  updateThemeColor: (color: string) => void;
  buttonStyle: ReturnType<typeof ref<ButtonStyle>>;
  setButtonStyle: (style: ButtonStyle) => void;
}

let themePluginInstance: ThemePlugin | null = null;
// 保存 setThemeColor 函数的最新引用，用于动态绑定
let latestSetThemeColor: ((color: string, dark: boolean) => void) | null = null;

/**
 * 创建主题插件
 */
export function createThemePlugin(): Plugin & { theme: ThemePlugin } {
  // 数据迁移：将旧的硬编码标签转换为国际化键值
  const migratedTheme = migrateThemeConfig();

  const currentTheme = ref<ThemeConfig>(migratedTheme);

  // 使用 VueUse 的 useDark，自动管理暗黑模式并持久化到 localStorage
  const isDark = useDark();

  const settings = storage.get('settings') as Record<string, any> | null;
  // 只从统一的 settings 存储中读取，不再读取旧的独立键
  const storedButtonStyle = settings?.buttonStyle as ButtonStyle | null;
  const buttonStyle = ref<ButtonStyle>(storedButtonStyle || 'default');

  const applyButtonStyle = (style: ButtonStyle) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-button-style', style);
  };

  applyButtonStyle(buttonStyle.value);

  function setButtonStyle(style: ButtonStyle) {
    if (buttonStyle.value === style) return; // 避免重复设置
    buttonStyle.value = style;
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', { ...currentSettings, buttonStyle: style });
    applyButtonStyle(style);
  }

  // 主题颜色（只读）
  const color = computed(() => currentTheme.value.color) as any;

  // 使用 composable 中的 setThemeColor
  const themeSetThemeColor = (color: string, dark: boolean) => {
    setThemeColor(color, dark);
  };

  /**
   * 切换主题
   */
  function switchTheme(theme: ThemeConfig) {
    currentTheme.value = { ...theme };
    themeSetThemeColor(theme.color, isDark.value);
    document.body.className = `theme-${theme.name}`;

    // 持久化到统一的 settings 存储中
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', { ...currentSettings, theme: currentTheme.value });
  }

  /**
   * 更新主题颜色
   */
  function updateThemeColor(color: string) {
    currentTheme.value = {
      ...currentTheme.value,
      name: 'custom',
      label: 'theme.presets.custom',
      color: color,
    };
    themeSetThemeColor(color, isDark.value);

    // 持久化到统一的 settings 存储中
    const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
    storage.set('settings', { ...currentSettings, theme: currentTheme.value });
  }

  /**
   * 切换暗黑模式（带动画，参考 cool-admin-vue-8.x）
   */
  function changeDark(el: Element, isDarkValue: boolean, cb: () => void) {
    // 如果浏览器支持 View Transition API，使用动画
    if ((document as any).startViewTransition) {
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        cb();
      });

      transition.ready.then(() => {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const endRadius = Math.hypot(
          Math.max(x, innerWidth - x),
          Math.max(y, innerHeight - y)
        );
        const clipPath = [
          `circle(0 at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        
        document.documentElement.animate(
          {
            clipPath: isDarkValue ? clipPath.reverse() : clipPath
          },
          {
            duration: 400,
            pseudoElement: isDarkValue
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)'
          }
        );
      }).catch((error: any) => {
        console.error('[ThemePlugin] View Transition 错误:', error);
      });
    } else {
      // 不支持动画，直接执行回调
      cb();
    }
  }

  // 使用 composable 创建 toggleDark 函数（传入 changeDark 方法）
  const toggleDark = createToggleDark(isDark, currentTheme, changeDark);

  /**
   * 初始化主题
   */
  function initTheme() {
    themeSetThemeColor(currentTheme.value.color, isDark.value);
    document.body.className = `theme-${currentTheme.value.name}`;
  }

  // 保存最新的 setThemeColor 函数引用
  latestSetThemeColor = themeSetThemeColor;

  // 创建主题实例
  const theme: ThemePlugin = {
    currentTheme,
    isDark,
    color,
    THEME_PRESETS,
    switchTheme,
    toggleDark,
    changeDark,
    setThemeColor: themeSetThemeColor,
    updateThemeColor,
    buttonStyle,
    setButtonStyle,
  };

  // 保存单例（但每次创建时都使用最新的 THEME_PRESETS）
  themePluginInstance = theme;

  // 将主题插件实例挂载到 window，方便同步访问（避免异步 import 延迟）
  if (typeof window !== 'undefined') {
    (window as any).__THEME_PLUGIN__ = theme;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__THEME_PLUGIN__ = theme;
  }

  // 初始化主题
  initTheme();

  const plugin: Plugin & { theme: ThemePlugin } = {
    install(app: App) {
      // 将主题实例挂载到全局属性
      app.config.globalProperties.$theme = theme;

      // 提供给 composition API 使用
      app.provide('theme', theme);
    },
    theme,
  };

  return plugin;
}

/**
 * 组合式 API：使用主题插件
 */
export function useThemePlugin(): ThemePlugin {
  if (!themePluginInstance) {
    throw new Error('Theme plugin not installed. Please call createThemePlugin() first.');
  }
  // 确保 THEME_PRESETS 是最新的
  themePluginInstance.THEME_PRESETS = THEME_PRESETS;
  // 动态绑定最新的 setThemeColor 函数，确保热更新时使用最新版本
  if (latestSetThemeColor) {
    themePluginInstance.setThemeColor = latestSetThemeColor;
  }
  return themePluginInstance;
}

/**
 * 导出主题配置类型
 */
export type { ThemeConfig };
export { THEME_PRESETS };
