import { useDark } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ThemeConfig } from '../../../composables/useTheme';
import { setThemeColor } from './useThemeColor';
import { storage } from '@btc/shared-utils';

/**
 * 禁用过渡效果（避免主题切换时的水合问题）
 * 注意：View Transition API 动画不受影响，因为它使用伪元素
 */
const disableTransitions = () => {
  const style = document.createElement('style');
  style.setAttribute('id', 'disable-transitions');
  // 只禁用普通元素的 transition，不影响 view-transition 伪元素
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
 * 切换暗黑模式（重构后调用 changeDark，参考 cool-admin-vue-8.x）
 */
export function createToggleDark(
  isDark: ReturnType<typeof useDark>,
  currentTheme: Ref<ThemeConfig>,
  changeDark?: (el: Element, isDark: boolean, cb: () => void) => void
) {
  return function toggleDark(event?: MouseEvent) {
    const newDarkValue = !isDark.value;

    // 如果有 event 且有 changeDark 方法，使用动画切换（参考 cool-admin-vue-8.x）
    if (event && changeDark) {
      // 获取点击的元素（参考 cool-admin-vue-8.x，使用 currentTarget 获取事件绑定的元素）
      // 如果 currentTarget 不存在，则使用 target 并向上查找最近的元素
      let el: Element | null = (event.currentTarget as Element) || (event.target as Element);
      
      // 如果获取到的是 SVG 内部元素，向上查找父元素
      if (el && (el.tagName === 'path' || el.tagName === 'svg' || el.tagName === 'use')) {
        el = el.closest('.btc-comm__icon') || el.parentElement || el;
      }
      
      // 如果仍然没有找到有效的元素，使用 document.body 作为后备
      if (!el || !(el instanceof Element)) {
        el = document.body;
      }
      
      // 调用 changeDark 方法（参考 cool-admin-vue-8.x 的 setDark 实现）
      changeDark(el, newDarkValue, () => {
        // 同步更新状态
        isDark.value = newDarkValue;
        setThemeColor(currentTheme.value.color, isDark.value);

        // 同步更新设置状态（如果存在）
        // 使用统一的 settings 存储，而不是单独的 systemThemeType 和 systemThemeMode
        try {
          const SystemThemeEnum = {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto',
          };
          const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
          // 获取现有的 settings，更新主题相关字段
          const currentSettings = storage.get<Record<string, any>>('settings') || {};
          storage.set('settings', {
            ...currentSettings,
            systemThemeType: newTheme,
            systemThemeMode: newTheme
          });
          // 清理旧的独立存储 key
          storage.remove('systemThemeType');
          storage.remove('systemThemeMode');
        } catch (e) {
          // 忽略错误
        }
      });
    } else {
      // 没有 event 或 changeDark 方法，直接切换（设置面板切换时使用此路径）
      disableTransitions();

      isDark.value = newDarkValue;
      setThemeColor(currentTheme.value.color, isDark.value);

      try {
        const SystemThemeEnum = {
          LIGHT: 'light',
          DARK: 'dark',
          AUTO: 'auto',
        };
        const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
        // 获取现有的 settings，更新主题相关字段
        const currentSettings = storage.get<Record<string, any>>('settings') || {};
        storage.set('settings', {
          ...currentSettings,
          systemThemeType: newTheme,
          systemThemeMode: newTheme
        });
        // 清理旧的独立存储 key
        storage.remove('systemThemeType');
        storage.remove('systemThemeMode');
      } catch (e) {
        // 忽略错误
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          enableTransitions();
        });
      });
    }
  };
}

