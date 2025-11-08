import { useDark } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ThemeConfig } from '../../../composables/useTheme';
/**
 * 切换暗黑模式（重构后调用 changeDark，参考 cool-admin-vue-8.x）
 */
export declare function createToggleDark(isDark: ReturnType<typeof useDark>, currentTheme: Ref<ThemeConfig>, changeDark?: (el: Element, isDark: boolean, cb: () => void) => void): (event?: MouseEvent) => void;
