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
  return {
    // 文本颜色
    textColor: getCssVar('--el-text-color-primary') || '#303133',
    textColorSecondary: getCssVar('--el-text-color-regular') || '#606266',
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
    
    // 暗色模式下的颜色（通过 useDark 判断后使用）
    dark: {
      textColor: '#f1f1f9',
      textColorSecondary: '#a8abb2',
      borderColor: '#4c4d4f',
      bgColor: '#1d1e1f',
      bgColorPage: '#000000'
    }
  };
}

