import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '@btc/shared-utils';
import { THEME_PRESETS, type ThemeConfig, mixColor } from '../composables/useTheme';

/**
 * 主题 Store
 */
export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取保存的主题配置
  const currentTheme = ref<ThemeConfig>(
    storage.get('theme') || THEME_PRESETS[0]
  );

  // 使用 VueUse 的 useDark，自动管理暗黑模式并持久化到 localStorage
  const isDark = useDark();

  // 主题颜色
  const color = computed(() => currentTheme.value.color);

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
        isDark.value = newDarkValue;  // useDark() 会自动保存到 localStorage
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
      isDark.value = newDarkValue;  // useDark() 会自动保存到 localStorage
      setThemeColor(currentTheme.value.color, isDark.value);
    }
  }

  /**
   * 初始化主题
   */
  function initTheme() {

    // useDark() 会自动处理 dark class，但我们需要应用主题色
    setThemeColor(currentTheme.value.color, isDark.value);
    document.body.className = `theme-${currentTheme.value.name}`;
  }

  // 初始化主题
  initTheme();

  return {
    currentTheme,
    isDark,
    color,
    THEME_PRESETS,
    switchTheme,
    toggleDark,
    setThemeColor,
    updateThemeColor,
  };
});

