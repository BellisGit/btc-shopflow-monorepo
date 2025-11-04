import { useDark } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ThemeConfig } from '../../../composables/useTheme';
import { setThemeColor } from './useThemeColor';

/**
 * 禁用过渡效果（避免主题切换时的水合问题）
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
 * 切换暗黑模式（参考 art-design-pro，临时禁用过渡效果避免水合问题）
 */
export function createToggleDark(
  isDark: ReturnType<typeof useDark>,
  currentTheme: Ref<ThemeConfig>
) {
  return function toggleDark(event?: MouseEvent) {
    const newDarkValue = !isDark.value;

    // 临时禁用过渡效果（参考 art-design-pro，关键步骤）
    disableTransitions();

    // 同步更新状态
    isDark.value = newDarkValue;
    setThemeColor(currentTheme.value.color, isDark.value);

    // 同步更新设置状态（如果存在）
    try {
      // 动态导入避免循环依赖
      import('@btc/shared-utils').then(({ storage }) => {
        const SystemThemeEnum = {
          LIGHT: 'light',
          DARK: 'dark',
          AUTO: 'auto',
        };
        const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
        storage.set('systemThemeType', newTheme);
        storage.set('systemThemeMode', newTheme);
      }).catch(() => {
        // 忽略错误
      });
    } catch (e) {
      // 忽略错误
    }

    // 使用双重 requestAnimationFrame 确保在下一帧恢复过渡效果（参考 art-design-pro）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransitions();
      });
    });
  };
}

