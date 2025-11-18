import { storage } from '@btc/shared-utils';
import type { ThemeConfig } from '../../../composables/useTheme';
import { THEME_PRESETS } from '../../../composables/useTheme';

/**
 * 主题数据迁移：将旧的硬编码标签转换为国际化键值
 */
export function migrateThemeConfig(): ThemeConfig {
  const savedTheme = storage.get('theme');

  // 默认主题（现在是品牌红）
  let migratedTheme = THEME_PRESETS[0];

  if (savedTheme && typeof savedTheme === 'object' && savedTheme !== null) {
    // 检查是否是旧格式（硬编码中文或英文标签）
    const oldLabels = [
      'Default',
      'Green',
      'Purple',
      'Orange',
      'Pink',
      'Mint',
      'Custom',
      'Brand Red',
      'Brand Gray',
      '默认',
      '绿色',
      '紫色',
      '橙色',
      '粉色',
      '薄荷绿',
      '拜里斯品牌红',
      '拜里斯品牌灰',
      '蓝色',
    ];
    if (
      'label' in savedTheme &&
      typeof savedTheme.label === 'string' &&
      oldLabels.includes(savedTheme.label)
    ) {
      // 根据颜色匹配对应的新主题配置
      const matchedPreset = THEME_PRESETS.find(
        (preset) => preset.color === (savedTheme as any).color
      );
      if (matchedPreset) {
        migratedTheme = matchedPreset;
      } else if ((savedTheme as any).name === 'custom') {
        // 自定义主题
        migratedTheme = {
          name: 'custom',
          label: 'theme.presets.custom',
          color: (savedTheme as any).color,
        };
      }
      // 保存迁移后的配置到统一的 settings 存储中
      const currentSettings = (storage.get('settings') as Record<string, any> | null) ?? {};
      storage.set('settings', { ...currentSettings, theme: migratedTheme });
    } else {
      // 已经是新格式，直接使用
      migratedTheme = savedTheme as ThemeConfig;
    }
  }

  return migratedTheme;
}

