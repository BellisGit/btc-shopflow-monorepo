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
export interface ThemePlugin {
  currentTheme: ReturnType<typeof ref<ThemeConfig>>;
  isDark: ReturnType<typeof useDark>;
  color: ReturnType<typeof computed<string>>;
  THEME_PRESETS: typeof THEME_PRESETS;
  switchTheme: (theme: ThemeConfig) => void;
  toggleDark: (event?: MouseEvent) => void;
  setThemeColor: (color: string, dark: boolean) => void;
  updateThemeColor: (color: string) => void;
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

    // 持久化到 localStorage
    storage.set('theme', currentTheme.value);
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

    // 持久化到 localStorage
    storage.set('theme', currentTheme.value);
  }

  // 使用 composable 创建 toggleDark 函数
  const toggleDark = createToggleDark(isDark, currentTheme);

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
    setThemeColor: themeSetThemeColor,
    updateThemeColor,
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
