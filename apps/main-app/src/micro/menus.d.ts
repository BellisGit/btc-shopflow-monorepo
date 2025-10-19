/**
 * 各个子应用的菜单配置
 */
export interface MenuItem {
    index: string;
    title: string;
    icon: string;
    children?: MenuItem[];
}
export interface AppMenuConfig {
    [appName: string]: MenuItem[];
}
/**
 * 所有应用的菜单配置
 */
export declare const appMenus: AppMenuConfig;
