/**
 * 插件配置管理
 */

export interface BtcPluginConfig {
  /**
   * 应用类型
   */
  type?: 'admin' | 'app';
  /**
   * EPS 配置
   */
  eps?: {
    enable?: boolean;
    api?: string;
    dist?: string;
  };
  /**
   * SVG 配置
   */
  svg?: {
    enable?: boolean;
    dirs?: string[];
  };
  /**
   * 上下文配置
   */
  ctx?: {
    enable?: boolean;
    modulesDir?: string;
  };
  /**
   * 名称标签
   */
  nameTag?: boolean;
  /**
   * 代理配置
   */
  proxy?: any;
}

export const config: BtcPluginConfig = {
  type: 'admin',
  eps: {
    enable: true,
    api: '/admin/base/open/eps',
    dist: 'build/eps',
  },
  svg: {
    enable: false,
  },
  ctx: {
    enable: false,
  },
  nameTag: true,
};
