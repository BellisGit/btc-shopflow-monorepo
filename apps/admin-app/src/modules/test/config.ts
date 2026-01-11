/**
 * 测试模块配置
 * 包含测试页面相关的国际化配置
 */

import type { PageConfig } from '../../../../../types/locale';

export default {
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 标题配置（用于 BtcViewGroup/BtcTableGroup 的 left-title 和 right-title）
      'title.inventory.dataSource.domains': '域列表',
      'title.inventory.dataSource.domains.select_required': '请先选择左侧域',
    },
    'en-US': {
      // 标题配置（用于 BtcViewGroup/BtcTableGroup 的 left-title  and right-title）
      'title.inventory.dataSource.domains': 'Domain List',
      'title.inventory.dataSource.domains.select_required': 'Please select a domain on the left first',
    },
  },
} satisfies PageConfig;
