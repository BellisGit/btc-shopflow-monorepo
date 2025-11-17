/**
 * 配置工具模块
 * 提供各种配置相关的工具函数
 */

/**
 * 获取当前语言设置
 */
export const getCurrentLocale = (): string => {
  return localStorage.getItem('locale') || 'zh-CN';
};

/**
 * 设置语言
 */
export const setLocale = (locale: string): void => {
  localStorage.setItem('locale', locale);
  // 触发自定义事件，通知其他组件语言已切换
  window.dispatchEvent(new CustomEvent('language-change'));
};
