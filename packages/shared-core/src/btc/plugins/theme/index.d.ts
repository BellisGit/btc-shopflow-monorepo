import type { Plugin } from 'vue';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { THEME_PRESETS, type ThemeConfig } from '../../composables/useTheme';
/**
 * 涓婚鎻掍欢瀹炰緥
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
/**
 * 鍒涘缓涓婚鎻掍欢
 */
export declare function createThemePlugin(): Plugin & {
    theme: ThemePlugin;
};
/**
 * 缁勫悎寮?API锛氫娇鐢ㄤ富棰樻彃浠? */
export declare function useThemePlugin(): ThemePlugin;
/**
 * 瀵煎嚭涓婚閰嶇疆绫诲瀷
 */
export type { ThemeConfig };
export { THEME_PRESETS };


