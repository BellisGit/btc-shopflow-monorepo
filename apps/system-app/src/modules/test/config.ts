/**
 * 测试模块配置
 */
;
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'test',
  label: 'common.module.test.label',
  order: 100,

  // 路由配置
  views: [
    {
      path: 'test/test-one',
      name: 'TestTestOne',
      component: () => import('./views/test-one/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test.test_one',
      },
    },
  ],

  // PageConfig 字段
  locale: {
    'zh-CN': {
      // 模块标签
      'common.module.test.label': '测试模块',
      // 菜单配置
      'menu.test': '测试模块',
      'menu.test.test_one': '测试一',
    },
    'en-US': {
      // 模块标签
      'common.module.test.label': 'Test Module',
      // 菜单配置
      'menu.test': 'Test Module',
      'menu.test.test_one': 'Test One',
    },
  },
} satisfies ModuleConfig;
