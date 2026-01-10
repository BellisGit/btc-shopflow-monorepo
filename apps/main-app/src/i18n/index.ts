/**
 * 基座应用 i18n 初始化
 * 初始化全局 i18n 实例，通过 qiankun globalState 管控语言切换
 */

import { createAppI18n, getLocaleFromStorage, setLocaleToStorage, type AppLocale } from '@btc/i18n';
import { setGlobalState } from '@btc/shared-core';
import { sharedLocalesZhCN, sharedLocalesEnUS } from '@btc/shared-components';
// 导入 overview 模块的语言包
import overviewZhCN from '../modules/overview/locales/zh-CN.json';
import overviewEnUS from '../modules/overview/locales/en-US.json';

/**
 * 转换 unplugin-vue-i18n 的 AST 格式为字符串格式
 * 处理函数格式的消息（AST 格式）
 */
function transformMessages(messages: any): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value === 'function') {
      // 如果是函数（AST 格式），尝试提取字符串
      try {
        // 调用函数获取结果（vue-i18n 的 AST 格式函数会返回字符串）
        const resultValue = value({ normalize: (arr: any[]) => arr[0] });
        if (typeof resultValue === 'string') {
          result[key] = resultValue;
        } else if (value.loc?.source) {
          // 如果有 loc.source，使用它
          result[key] = value.loc.source;
        } else {
          // 如果无法提取，保留原值（可能是其他格式）
          result[key] = value as any;
        }
      } catch {
        // 如果调用失败，尝试从 loc.source 获取
        if ((value as any).loc?.source) {
          result[key] = (value as any).loc.source;
        } else {
          result[key] = value as any;
        }
      }
    } else if (typeof value === 'string') {
      // 如果已经是字符串，直接使用
      result[key] = value;
    } else if (value && typeof value === 'object' && 'loc' in value) {
      // 如果是 AST 对象格式，提取 loc.source
      const message = (value as any).loc?.source;
      if (typeof message === 'string') {
        result[key] = message;
      } else {
        result[key] = value as any;
      }
    } else {
      // 其他格式，直接使用
      result[key] = value as any;
    }
  }
  
  return result;
}

// 从 localStorage 读取默认语言
const defaultLocale = getLocaleFromStorage();

// 转换 overview 语言包（处理可能的 AST 格式）
const transformedOverviewZhCN = transformMessages(overviewZhCN);
const transformedOverviewEnUS = transformMessages(overviewEnUS);

// 初始化全局 i18n 实例（全局通用词条 + shared-components 语言包 + overview 模块词条）
// 注意：子应用的国际化数据会在 beforeMount 阶段动态加载并合并
export const i18n = createAppI18n(defaultLocale, {
  'zh-CN': { 
    ...(sharedLocalesZhCN as Record<string, any>),
    ...transformedOverviewZhCN 
  } as any,
  'en-US': { 
    ...(sharedLocalesEnUS as Record<string, any>),
    ...transformedOverviewEnUS 
  } as any,
});


// 暴露到全局，供 tSync 使用（包含预加载的子应用国际化数据）
if (typeof window !== 'undefined') {
  (window as any).__MAIN_APP_I18N__ = i18n;
}

/**
 * 全局切换语言（同步所有子应用）
 * @param locale 目标语言
 * @param globalState qiankun 全局状态对象（可选，已废弃，保留用于向后兼容）
 * @deprecated 优先使用 window.__PLUGIN_API__.i18n.changeLocale
 */
export function changeGlobalLocale(locale: AppLocale, globalState?: any) {
  // 优先使用插件API
  if (typeof window !== 'undefined' && (window as any).__PLUGIN_API__?.i18n?.changeLocale) {
    (window as any).__PLUGIN_API__.i18n.changeLocale(locale);
    return;
  }

  // 向后兼容：直接操作（如果插件API未初始化）
  // 1. 更新基座自身语言
  i18n.global.locale.value = locale;
  
  // 2. 存储到 localStorage（子应用可读取）
  setLocaleToStorage(locale);
  
  // 3. 通过 qiankun globalState 通知所有子应用切换语言（通过统一中间层）
  setGlobalState({ locale }, false).catch(() => {
    // 忽略错误（可能在初始化中）
  });
  
  // 4. 触发 language-change 事件（向后兼容，如果某些地方还在使用事件）
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-change', { detail: { locale } }));
  }
}

