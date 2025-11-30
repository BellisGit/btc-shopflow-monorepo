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

// 显式导出常用类型，确保 TypeScript 能够正确识别
export type { UseCrudReturn } from './btc/crud';
export type { ButtonStyle, ThemeConfig } from './btc/plugins/theme';
