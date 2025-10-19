import { type ThemeConfig } from '../composables/useTheme';
/**
 * 主题 Store
 */
export declare const useThemeStore: import("pinia").StoreDefinition<"theme", Pick<{
    currentTheme: globalThis.Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: globalThis.WritableComputedRef<boolean, boolean>;
    color: globalThis.ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "currentTheme" | "THEME_PRESETS">, Pick<{
    currentTheme: globalThis.Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: globalThis.WritableComputedRef<boolean, boolean>;
    color: globalThis.ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "color" | "isDark">, Pick<{
    currentTheme: globalThis.Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: globalThis.WritableComputedRef<boolean, boolean>;
    color: globalThis.ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "switchTheme" | "toggleDark" | "setThemeColor" | "updateThemeColor">>;
