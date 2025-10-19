/**
 * 颜色混合工具函数
 */
export declare function mixColor(color1: string, color2: string, weight: number): string;
export interface ThemeConfig {
    name: string;
    label: string;
    color: string;
}
/**
 * 预设主题列表
 */
export declare const THEME_PRESETS: ThemeConfig[];
/**
 * 主题管理 Hook
 */
export declare function useTheme(): {
    isDark: globalThis.Ref<boolean, boolean>;
    currentTheme: globalThis.Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    themes: ThemeConfig[];
    changeTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark?: boolean) => void;
};
