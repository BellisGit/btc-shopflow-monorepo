import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '@btc/shared-utils';
import { THEME_PRESETS, type ThemeConfig, mixColor } from '../composables/useTheme';
import { setBodyClassName } from '../utils/body-class';

/**
 * 主题 Store
 */
export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取保存的主题配置
  const savedTheme = storage.get('theme') as ThemeConfig | null;

  // 数据迁移：将旧的硬编码标签转换为国际化键值
  let migratedTheme = THEME_PRESETS[0]; // 默认主题

  if (savedTheme) {
    // 检查是否是旧格式（硬编码英文标签）
    const oldLabels = ['Default', 'Green', 'Purple', 'Orange', 'Pink', 'Mint', 'Custom'];
    if (oldLabels.includes(savedTheme.label)) {
      // 根据颜色匹配对应的新主题配置
      const matchedPreset = THEME_PRESETS.find(preset => preset.color === savedTheme.color);
      if (matchedPreset) {
        migratedTheme = matchedPreset;
      } else if (savedTheme.name === 'custom') {
        // 自定义主题
        migratedTheme = {
          name: 'custom',
          label: 'theme.custom',
          color: savedTheme.color
        };
      }
      // 保存迁移后的配置
      storage.set('theme', migratedTheme);
    } else {
      // 已经是新格式，直接使用
      migratedTheme = savedTheme;
    }
  }

  const currentTheme = ref<ThemeConfig>(migratedTheme);

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
    setBodyClassName(`theme-${theme.name}`);

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
      label: 'theme.custom',
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
    setBodyClassName(`theme-${currentTheme.value.name}`);
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

