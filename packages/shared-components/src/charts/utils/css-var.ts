/**
 * CSS变量获取工具
 */

/**
 * 获取CSS变量值
 */
export function getCssVar(varName: string, element?: HTMLElement): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const el = element || document.documentElement;
  const value = getComputedStyle(el).getPropertyValue(varName).trim();
  return value || '';
}

/**
 * 获取主题颜色
 */
export function getThemeColors() {
  // 获取 CSS 变量值，如果获取不到则使用默认值
  const textColorPrimary = getCssVar('--el-text-color-primary') || '#303133';
  const textColorRegular = getCssVar('--el-text-color-regular') || '#606266';
  
  return {
    // 文本颜色 - 确保浅色主题下有足够的对比度
    textColor: textColorPrimary,
    // 次要文本颜色 - 在浅色主题下使用更深的颜色以确保可见性
    textColorSecondary: textColorRegular || '#606266',
    textColorPlaceholder: getCssVar('--el-text-color-placeholder') || '#a8abb2',
    
    // 边框颜色
    borderColor: getCssVar('--el-border-color') || '#dcdfe6',
    borderColorLight: getCssVar('--el-border-color-light') || '#e4e7ed',
    borderColorLighter: getCssVar('--el-border-color-lighter') || '#ebeef5',
    
    // 背景颜色
    bgColor: getCssVar('--el-bg-color') || '#ffffff',
    bgColorPage: getCssVar('--el-bg-color-page') || '#f2f3f5',
    
    // 主题色
    primary: getCssVar('--el-color-primary') || '#409eff',
    primaryLight1: getCssVar('--el-color-primary-light-1') || '#53a8ff',
    primaryLight2: getCssVar('--el-color-primary-light-2') || '#66b1ff',
    primaryLight3: getCssVar('--el-color-primary-light-3') || '#79bbff',
    primaryLight4: getCssVar('--el-color-primary-light-4') || '#8cc5ff',
    primaryLight5: getCssVar('--el-color-primary-light-5') || '#a0cfff',
    primaryLight6: getCssVar('--el-color-primary-light-6') || '#b3d8ff',
    primaryLight7: getCssVar('--el-color-primary-light-7') || '#c6e2ff',
    primaryLight8: getCssVar('--el-color-primary-light-8') || '#d9ecff',
    primaryLight9: getCssVar('--el-color-primary-light-9') || '#ecf5ff',
    
    // 暗色模式下的颜色（从 CSS 变量获取，如果没有则使用默认值）
    dark: {
      textColor: getCssVar('--el-text-color-primary') || '#f1f1f9',
      textColorSecondary: getCssVar('--el-text-color-regular') || '#a8abb2',
      borderColor: getCssVar('--el-border-color') || '#4c4d4f',
      bgColor: getCssVar('--el-bg-color') || '#1d1e1f',
      bgColorPage: getCssVar('--el-bg-color-page') || '#000000'
    }
  };
}

