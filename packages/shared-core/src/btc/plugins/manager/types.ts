import type { App, Directive } from 'vue';

/**
 * 插件配置选项
 */
export interface PluginOptions {
  [key: string]: any;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /**
   * 排序（数字越小越靠前）
   */
  order?: number;

  /**
   * 是否在 PC 端显示
   */
  pc?: boolean;

  /**
   * 是否在 H5 端显示
   */
  h5?: boolean;

  /**
   * 工具栏组件
   */
  component: () => Promise<any>;
}

/**
 * 布局注入配置
 */
export interface LayoutConfig {
  /**
   * 注入位置
   */
  position: 'header' | 'sidebar' | 'footer' | 'global';

  /**
   * 排序（数字越小越靠前）
   */
  order?: number;

  /**
   * 布局组件
   */
  component: () => Promise<any>;
}

/**
 * qiankun 微前端配置
 */
export interface QiankunConfig {
  /**
   * 是否共享给子应用
   */
  shared?: boolean;

  /**
   * 全局状态（供子应用访问）
   */
  globalState?: Record<string, any>;

  /**
   * 子应用可访问的 API
   */
  exposeApi?: string[];
}

/**
 * 静态资源配置
 */
export interface StaticConfig {
  /**
   * SVG 图标目录路径（相对于插件根目录）
   */
  svgDir?: string;

  /**
   * 其他静态资源目录
   */
  assetsDir?: string;
}

/**
 * 生命周期事件参数
 */
export interface PluginLifecycleEvents {
  /**
   * 其他插件导出的方法和变量
   */
  [key: string]: any;
}

/**
 * 插件接口（扩展版）
 */
export interface Plugin<T = any> {
  /**
   * 插件名称（唯一标识）
   */
  name: string;

  /**
   * 插件版本
   */
  version?: string;

  /**
   * 插件描述
   */
  description?: string;

  /**
   * 作者
   */
  author?: string;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * Logo URL
   */
  logo?: string;

  /**
   * 插件依赖（其他插件名称）
   */
  dependencies?: string[];

  /**
   * 是否启用
   */
  enable?: boolean;

  /**
   * 加载顺序（数字越大越先加载）
   */
  order?: number;

  /**
   * 插件安装钩子
   * @param app Vue 应用实例
   * @param options 插件配置选项
   */
  install?: (app: App, options?: PluginOptions) => void | Promise<void>;

  /**
   * 插件卸载钩子
   */
  uninstall?: () => void | Promise<void>;

  /**
   * 插件加载完成后的钩子
   * @param events 生命周期事件参数（可以接收其他插件导出的方法）
   * @returns 导出给其他插件使用的方法和变量
   */
  onLoad?: (events: PluginLifecycleEvents) => Promise<Record<string, any>> | Record<string, any>;

  /**
   * 插件功能实例（如 Excel 导出函数、Upload 工具等）
   */
  api?: T;

  /**
   * 全局组件自动注册
   */
  components?: (() => Promise<any>)[];

  /**
   * 全局指令自动注册
   * key 为指令名，value 为指令定义
   */
  directives?: Record<string, Directive>;

  /**
   * 视图路由（会被注册到主路由的 children 中）
   */
  views?: any[];

  /**
   * 页面路由（独立的一级路由）
   */
  pages?: any[];

  /**
   * 顶栏工具配置
   */
  toolbar?: ToolbarConfig;

  /**
   * 布局注入配置
   */
  layout?: LayoutConfig;

  /**
   * 静态资源配置
   */
  static?: StaticConfig;

  /**
   * qiankun 微前端配置
   */
  qiankun?: QiankunConfig;

  /**
   * 插件配置参数（可供外部使用）
   */
  options?: PluginOptions;

  /**
   * 插件元数据
   */
  meta?: Record<string, any>;
}

/**
 * 插件管理器配置
 */
export interface PluginManagerOptions {
  /**
   * 是否在安装插件时检查依赖
   */
  checkDependencies?: boolean;

  /**
   * 是否允许重复注册（覆盖）
   */
  allowOverride?: boolean;

  /**
   * 是否启用调试日志
   */
  debug?: boolean;
}

/**
 * 插件状态
 */
export enum PluginStatus {
  /** 已注册但未安装 */
  Registered = 'registered',
  /** 已安装 */
  Installed = 'installed',
  /** 已卸载 */
  Uninstalled = 'uninstalled',
  /** 安装失败 */
  Failed = 'failed',
}

/**
 * 插件记录
 */
export interface PluginRecord<T = any> {
  plugin: Plugin<T>;
  status: PluginStatus;
  installedAt?: Date;
  error?: Error;
}

