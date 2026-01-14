/**
 * 认证模块入口
 */

// 导出 composables
export * from './composables/useLogin';
export * from './composables/useNumberAuthLogin';
export * from './composables/usePhoneLogin';
export * from './composables/useRememberMe';

// 导出配置
export { default as config } from './config';
