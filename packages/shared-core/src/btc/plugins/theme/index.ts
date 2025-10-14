import type { App, Plugin } from 'vue';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '@btc/shared-utils';
import { THEME_PRESETS, type ThemeConfig, mixColor } from '../../composables/useTheme';

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

/**
 * 创建主题插件
 */
export function createThemePlugin(): Plugin & { theme: ThemePlugin } {
  // 从 localStorage 读取保存的主题配置
  const currentTheme = ref<ThemeConfig>(
    storage.get('theme') || THEME_PRESETS[0]
  );

  // 使用 VueUse 的 useDark，自动管理暗黑模式并持久化到 localStorage
  const isDark = useDark();

  // 主题颜色（只读）
  const color = computed(() => currentTheme.value.color) as any;

  /**
   * 设置主题颜色
   */
  function setThemeColor(color: string, dark: boolean) {
    const el = document.documentElement;
    const pre = '--el-color-primary';
    const mixWhite = '#ffffff';
    const mixBlack = '#131313';

    el.style.setProperty(pre, color);

    for (let i = 1; i < 10; i += 1) {
      if (dark) {
        el.style.setProperty(`${pre}-light-${i}`, mixColor(color, mixBlack, i * 0.1));
        el.style.setProperty(`${pre}-dark-${i}`, mixColor(color, mixWhite, i * 0.1));
      } else {
        el.style.setProperty(`${pre}-light-${i}`, mixColor(color, mixWhite, i * 0.1));
        el.style.setProperty(`${pre}-dark-${i}`, mixColor(color, mixBlack, i * 0.1));
      }
    }

    // 广播主题变化事件
    window.dispatchEvent(new CustomEvent('theme-change', {
      detail: { color, dark }
    }));
  }

  /**
   * 切换主题
   */
  function switchTheme(theme: ThemeConfig) {
    currentTheme.value = { ...theme };
    setThemeColor(theme.color, isDark.value);
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
      label: 'Custom',
      color: color,
    };
    setThemeColor(color, isDark.value);

    // 持久化到 localStorage
    storage.set('theme', currentTheme.value);
  }

  /**
   * 切换暗黑模式（带动画）
   */
  function toggleDark(event?: MouseEvent) {
    const newDarkValue = !isDark.value;

    // 如果浏览器支持 View Transition API，使用动画
    if (event && (document as any).startViewTransition) {
      const transition = (document as any).startViewTransition(() => {
        isDark.value = newDarkValue;
        setThemeColor(currentTheme.value.color, isDark.value);
      });

      transition.ready.then(() => {
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const clipPath = [
          `circle(0 at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];

        document.documentElement.animate(
          {
            clipPath: newDarkValue ? clipPath.reverse() : clipPath
          },
          {
            duration: 400,
            easing: 'ease-in-out',
            pseudoElement: newDarkValue
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)'
          }
        );
      });
    } else {
      // 不支持动画，直接切换
      isDark.value = newDarkValue;
      setThemeColor(currentTheme.value.color, isDark.value);
    }
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    setThemeColor(currentTheme.value.color, isDark.value);
    document.body.className = `theme-${currentTheme.value.name}`;
  }

  // 创建主题实例
  const theme: ThemePlugin = {
    currentTheme,
    isDark,
    color,
    THEME_PRESETS,
    switchTheme,
    toggleDark,
    setThemeColor,
    updateThemeColor,
  };

  // 保存单例
  themePluginInstance = theme;

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
  return themePluginInstance;
}

/**
 * 导出主题配置类型
 */
export type { ThemeConfig };
export { THEME_PRESETS };

