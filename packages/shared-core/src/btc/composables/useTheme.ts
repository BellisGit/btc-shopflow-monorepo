import { ref } from 'vue';
import { storage } from '@btc/shared-utils';
import { setBodyClassName } from '../utils/body-class';

/**
 * 颜色混合工具函数
 */
export function mixColor(color1: string, color2: string, weight: number): string {
  weight = Math.max(Math.min(Number(weight), 1), 0);
  
  // 确保颜色格式正确（必须是 #RRGGBB 格式）
  if (!color1.startsWith('#') || color1.length !== 7) {
    throw new Error(`mixColor: color1 must be in #RRGGBB format, got: ${color1}`);
  }
  if (!color2.startsWith('#') || color2.length !== 7) {
    throw new Error(`mixColor: color2 must be in #RRGGBB format, got: ${color2}`);
  }
  
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // 验证解析结果
  if (isNaN(r1) || isNaN(g1) || isNaN(b1) || isNaN(r2) || isNaN(g2) || isNaN(b2)) {
    throw new Error(`mixColor: Failed to parse color values. color1: ${color1}, color2: ${color2}`);
  }
  
  let r = Math.round(r1 * (1 - weight) + r2 * weight).toString(16);
  let g = Math.round(g1 * (1 - weight) + g2 * weight).toString(16);
  let b = Math.round(b1 * (1 - weight) + b2 * weight).toString(16);
  r = ('0' + (r || 0).toString(16)).slice(-2);
  g = ('0' + (g || 0).toString(16)).slice(-2);
  b = ('0' + (b || 0).toString(16)).slice(-2);
  return '#' + r + g + b;
}

export interface ThemeConfig {
  name: string;
  label: string;
  color: string;
}

/**
 * 预设主题列表
 * 注意：label 字段存储国际化键值，需要在模板中使用 t() 函数进行翻译
 */
export const THEME_PRESETS: ThemeConfig[] = [
  { name: 'brand-red', label: 'theme.presets.brand_red', color: '#DA281C' },
  { name: 'brand-gray', label: 'theme.presets.brand_gray', color: '#404040' },
  { name: 'default', label: 'theme.presets.blue', color: '#409eff' },
  { name: 'green', label: 'theme.presets.green', color: '#51C21A' },
  { name: 'purple', label: 'theme.presets.purple', color: '#d0378d' },
  { name: 'orange', label: 'theme.presets.orange', color: '#FFA500' },
  { name: 'pink', label: 'theme.presets.pink', color: '#FF69B4' },
  { name: 'mint', label: 'theme.presets.mint', color: '#3EB489' },
];

/**
 * 主题管理 Hook
 */
export function useTheme() {
  const isDark = ref(false);
  const currentTheme = ref<ThemeConfig>(
    storage.get('theme') || THEME_PRESETS[0]
  );

  /**
   * 设置主题色
   */
  function setThemeColor(color: string, dark = false) {
    const el = document.documentElement;
    const pre = '--el-color-primary';
    const mixWhite = '#ffffff';
    const mixBlack = '#131313';

    // 设置主色
    el.style.setProperty(pre, color);

    // 设置辅色
    for (let i = 1; i < 10; i++) {
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
  function changeTheme(theme: ThemeConfig) {
    currentTheme.value = theme;
    setThemeColor(theme.color, isDark.value);
    storage.set('theme', theme);
    setBodyClassName(`theme-${theme.name}`);
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

        if (isDark.value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

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

      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setThemeColor(currentTheme.value.color, isDark.value);
    }

    storage.set('isDark', isDark.value);
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    const savedDark = storage.get('isDark') as boolean | null;
    if (savedDark !== null && savedDark !== undefined) {
      isDark.value = savedDark;
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      }
    }

    setThemeColor(currentTheme.value.color, isDark.value);
    setBodyClassName(`theme-${currentTheme.value.name}`);
  }

  // 初始化
  initTheme();

  return {
    isDark,
    currentTheme,
    themes: THEME_PRESETS,
    changeTheme,
    toggleDark,
    setThemeColor,
  };
}

