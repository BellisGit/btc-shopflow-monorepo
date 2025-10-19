import type { Plugin } from 'vue';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { THEME_PRESETS, type ThemeConfig } from '../../composables/useTheme';
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
/**
 * 创建主题插件
 */
export declare function createThemePlugin(): Plugin & {
    theme: ThemePlugin;
};
/**
 * 组合式 API：使用主题插件
 */
export declare function useThemePlugin(): ThemePlugin;
/**
 * 导出主题配置类型
 */
export type { ThemeConfig };
export { THEME_PRESETS };
