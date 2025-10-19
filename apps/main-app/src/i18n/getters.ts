// i18n/getters.ts
import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';

// 简化版本：直接使用 unplugin 的 messages，让 VueI18n 自己处理
const normalizedMessages = messages;


// 创建一个独立的 i18n 实例用于路由标题
const i18n = createI18n({
  legacy: false,
  globalInjection: false, // 路由中不需要全局注入
  locale: 'zh-CN',
  fallbackLocale: ['zh-CN', 'en-US'],
  messages: normalizedMessages
});

export function tSync(key: string): string {
  try {
    // 获取当前语言设置
    const currentLocale = localStorage.getItem('locale') || 'zh-CN';

    // 更新 i18n 实例的语言
    i18n.global.locale.value = currentLocale as any;

    const g = i18n.global as any;

    // 检查 i18n 是否已初始化
    if (!g || !g.te) {
      return key;
    }

    // 直接检查消息对象中是否存在该键
    const localeMessages = g.getLocaleMessage(currentLocale) || {};

    if (localeMessages[key]) {
      const value = localeMessages[key];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'function') {
        // Vue I18n 编译时优化，返回函数需要调用
        try {
          return value({ normalize: (arr: any[]) => arr[0] });
        } catch (error) {
          return key;
        }
      }
    }

    // 如果直接检查失败，尝试使用 g.te 和 g.t
    if (g.te(key)) {
      return String(g.t(key));
    } else {
      // 如果当前语言没有找到，尝试回退语言
      const fallbackLocale = currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN';
      const fallbackMessages = g.getLocaleMessage(fallbackLocale) || {};
      if (fallbackMessages[key]) {
        const value = fallbackMessages[key];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'function') {
          try {
            return value({ normalize: (arr: any[]) => arr[0] });
          } catch (error) {
            return key;
          }
        }
      }
      return key;
    }
  } catch (error) {
    return key;
  }
}
