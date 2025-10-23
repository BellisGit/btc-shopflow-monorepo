/**
 * 棰滆壊娣峰悎宸ュ叿鍑芥暟
 */
export declare function mixColor(color1: string, color2: string, weight: number): string;
export interface ThemeConfig {
    name: string;
    label: string;
    color: string;
}
/**
 * 棰勮涓婚鍒楄〃
 */
export declare const THEME_PRESETS: ThemeConfig[];
/**
 * 涓婚绠＄悊 Hook
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


