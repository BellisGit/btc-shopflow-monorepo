// @btc/shared-core 入口文件

export * from './btc';
export * from './btc/plugins';
export * from './btc/plugins/i18n';
export * from './btc/plugins/permission';
export * from './btc/plugins/theme';
export * from './btc/service/base';
export * from './btc/service/builder';
export * from './btc/service/request';
export * from './btc/service';
export * from './btc/crud';
export * from './btc/composables/useTheme';
export * from './btc/store/theme';
export * from './composables/use-request';
export * from './composables/useBtcForm';
export * from './composables/form-helpers';
export * from './composables/use-sms-code';
export * from './composables/use-email-code';
export * from './composables/useCountdown';
export * from './types/common';
export * from './types/crud';
export * from './types/qiankun';
export * from './utils/menu-icon-assigner';
export { assignIconsToMenuTree } from './utils/menu-icon-assigner';

// 显式导出常用类型和函数，确保 TypeScript 能够正确识别
// 直接从类型定义文件导出，避免路径解析问题
export type { UseCrudReturn } from './btc/crud/types';
export type { ButtonStyle } from './btc/plugins/theme';
export type { ThemeConfig } from './btc/composables/useTheme';
export { useI18n } from './btc/plugins/i18n';
export { useThemePlugin } from './btc/plugins/theme';
export { exportTableToExcel } from './btc/plugins/excel';
export { useCountdown } from './composables/useCountdown';
export { useCrud } from './btc/crud';
export { useSmsCode } from './composables/use-sms-code';
export { usePluginManager } from './btc/plugins/manager';
export { useBtcForm } from './composables/useBtcForm';
export { useTabs, useAction, useElApi, usePlugins } from './composables/form-helpers';


