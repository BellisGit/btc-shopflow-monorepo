/**
 * 插件配置管理
 */

export type Type = 'admin' | 'app' | 'uniapp-x';

export interface EpsMapping {
  type?: string;
  test?: string[];
  custom?: (params: { propertyName: string; type: string }) => string | null;
}

export interface BtcPluginConfig {
  /**
   * 应用类型
   */
  type: Type;
  /**
   * 后端请求地址（用于获取服务语言类型等）
   */
  reqUrl: string;
  /**
   * 是否为演示模式
   */
  demo: boolean;
  /**
   * 是否启用名称标签
   */
  nameTag: boolean;
  /**
   * EPS 配置
   */
  eps: {
    enable: boolean;
    api: string;
    dist: string;
    mapping: EpsMapping[];
  };
  /**
   * SVG 配置
   */
  svg: {
    skipNames?: string[];
  };
  /**
   * 是否清理旧文件
   */
  clean: boolean;
}

export const config: BtcPluginConfig = {
  type: 'admin',
  reqUrl: '',
  demo: false,
  nameTag: true,
  eps: {
    enable: true,
    api: '/admin/base/open/eps',
    dist: './build/btc',
    mapping: [
      {
        // 自定义匹配
        custom: ({
          propertyName: _propertyName,
          type: _type,
        }: {
          propertyName: string;
          type: string;
        }) => {
          // 如果没有，返回null或者不返回，则继续遍历其他匹配规则
          return null;
        },
      },
      {
        type: 'string',
        test: ['varchar', 'text', 'simple-json'],
      },
      {
        type: 'string[]',
        test: ['simple-array'],
      },
      {
        type: 'Date',
        test: ['datetime', 'date'],
      },
      {
        type: 'number',
        test: ['tinyint', 'int', 'decimal'],
      },
      {
        type: 'BigInt',
        test: ['bigint'],
      },
      {
        type: 'any',
        test: ['json'],
      },
    ],
  },
  svg: {
    skipNames: ['base'],
  },
  clean: false,
};
