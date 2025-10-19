import type { Plugin } from '@btc/shared-core';
import { githubPlugin } from './github';
import { i18nPlugin as i18nToolbarPlugin } from './i18n';
import { themePlugin as themeToolbarPlugin } from './theme';
/**
 * Excel 插件
 */
export declare const excelPlugin: Plugin;
/**
 * 导出所有插件
 */
export { githubPlugin, i18nToolbarPlugin, themeToolbarPlugin };
/**
 * 通知插件（示例）
 */
export declare const notificationPlugin: Plugin;
/**
 * Logger 插件（示例，依赖 notification）
 */
export declare const loggerPlugin: Plugin;
