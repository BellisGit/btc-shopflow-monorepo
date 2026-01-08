import { MenuThemeEnum, SystemThemeEnum } from '@/plugins/user-setting/config/enums';

export const config = {
  app: {
    // 系统名称（使用国际化 key）
    nameKey: 'app.name',
    // 系统标题（使用国际化 key）
    titleKey: 'app.title',
    // 系统描述（使用国际化 key）
    descriptionKey: 'app.description',
    // 系统版本
    version: '1.0.0',
    // 欢迎信息（使用国际化 key）
    welcomeKey: 'app.welcome',
    // 加载页面文案（使用国际化 key）
    loading: {
      titleKey: 'app.loading.title',
      subTitleKey: 'app.loading.subtitle',
    },
    systemSetting: {
      defaultMenuWidth: 255,
      defaultSystemThemeType: SystemThemeEnum.AUTO,
      defaultMenuTheme: MenuThemeEnum.DESIGN,
      defaultSystemThemeColor: '#3F8CFF',
      defaultShowCrumbs: true,
      defaultShowWorkTab: true,
      defaultShowGlobalSearch: true,
      defaultColorWeak: false,
      defaultBoxBorderMode: false,
      defaultUniqueOpened: true,
      defaultTabStyle: 'card',
      defaultPageTransition: 'slide-left',
      defaultCustomRadius: '0.5',
    },
  },
  // API 配置
  api: {
    // 基础路径：统一使用 /api，通过代理转发到后端
    baseURL: '/api',
    // 请求超时时间
    timeout: 30000,
  },
};

export type AppConfig = typeof config;


