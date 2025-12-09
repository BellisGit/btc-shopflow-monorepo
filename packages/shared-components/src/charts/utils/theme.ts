/**
 * ECharts 主题配置工具
 * 使用官方推荐的 JSON 主题文件方式
 */

import { registerTheme } from 'echarts/core';
import { getCssVar } from './css-var';
import lightTheme from '../themes/btc-light.json';
import darkTheme from '../themes/btc-dark.json';

/**
 * 将十六进制颜色转换为 RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return '64, 158, 255'; // 默认 primary 颜色
  }
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * 更新主题中的主题色（primary）相关颜色
 */
function updateThemePrimaryColors(theme: any, primary: string, primaryLight2: string, primaryLight7: string, primaryLight8: string, primaryLight9: string) {
  // 深拷贝主题对象，避免修改原始 JSON
  const updatedTheme = JSON.parse(JSON.stringify(theme));
  
  // 更新 candlestick
  if (updatedTheme.candlestick?.itemStyle) {
    updatedTheme.candlestick.itemStyle.color = primary;
    updatedTheme.candlestick.itemStyle.borderColor = primary;
    updatedTheme.candlestick.itemStyle.borderColor0 = primary;
  }
  
  // 更新 map emphasis
  if (updatedTheme.map?.emphasis?.itemStyle) {
    updatedTheme.map.emphasis.itemStyle.borderColor = primary;
    updatedTheme.map.emphasis.itemStyle.areaColor = primaryLight9;
  }
  
  // 更新 geo emphasis
  if (updatedTheme.geo?.emphasis?.itemStyle) {
    updatedTheme.geo.emphasis.itemStyle.borderColor = primary;
    updatedTheme.geo.emphasis.itemStyle.areaColor = primaryLight9;
  }
  
  // 更新 toolbox emphasis
  if (updatedTheme.toolbox?.emphasis?.iconStyle) {
    updatedTheme.toolbox.emphasis.iconStyle.borderColor = primary;
  }
  
  // 更新 timeline
  if (updatedTheme.timeline) {
    if (updatedTheme.timeline.itemStyle) {
      updatedTheme.timeline.itemStyle.color = primary;
    }
    if (updatedTheme.timeline.controlStyle) {
      updatedTheme.timeline.controlStyle.color = primary;
      updatedTheme.timeline.controlStyle.borderColor = primary;
    }
    if (updatedTheme.timeline.checkpointStyle) {
      updatedTheme.timeline.checkpointStyle.color = primary;
      updatedTheme.timeline.checkpointStyle.borderColor = primary;
    }
    if (updatedTheme.timeline.emphasis?.itemStyle) {
      updatedTheme.timeline.emphasis.itemStyle.color = primary;
    }
    if (updatedTheme.timeline.emphasis?.controlStyle) {
      updatedTheme.timeline.emphasis.controlStyle.color = primary;
      updatedTheme.timeline.emphasis.controlStyle.borderColor = primary;
    }
  }
  
  // 更新 visualMap
  if (updatedTheme.visualMap) {
    updatedTheme.visualMap.color = [primaryLight2, primaryLight8];
  }
  
  // 更新 dataZoom
  if (updatedTheme.dataZoom) {
    if (updatedTheme.dataZoom.selectedDataBackground?.areaStyle) {
      updatedTheme.dataZoom.selectedDataBackground.areaStyle.color = primaryLight9;
    }
    if (updatedTheme.dataZoom.selectedDataBackground?.lineStyle) {
      updatedTheme.dataZoom.selectedDataBackground.lineStyle.color = primary;
    }
    updatedTheme.dataZoom.fillerColor = `rgba(${hexToRgb(primary)}, 0.2)`;
    updatedTheme.dataZoom.handleColor = primaryLight7;
    updatedTheme.dataZoom.moveHandleColor = primaryLight7;
  }
  
  return updatedTheme;
}

/**
 * 注册自定义 ECharts 主题
 * 使用官方推荐的 JSON 主题文件方式
 */
export function registerEChartsThemes() {
  // 获取当前主题色（从 CSS 变量）
  const primary = typeof document !== 'undefined' ? (getCssVar('--el-color-primary') || '#409eff') : '#409eff';
  const primaryLight2 = typeof document !== 'undefined' ? (getCssVar('--el-color-primary-light-2') || '#66b1ff') : '#66b1ff';
  const primaryLight7 = typeof document !== 'undefined' ? (getCssVar('--el-color-primary-light-7') || '#c6e2ff') : '#c6e2ff';
  const primaryLight8 = typeof document !== 'undefined' ? (getCssVar('--el-color-primary-light-8') || '#d9ecff') : '#d9ecff';
  const primaryLight9 = typeof document !== 'undefined' ? (getCssVar('--el-color-primary-light-9') || '#ecf5ff') : '#ecf5ff';
  
  // 更新主题中的主题色
  const lightThemeWithPrimary = updateThemePrimaryColors(lightTheme, primary, primaryLight2, primaryLight7, primaryLight8, primaryLight9);
  const darkThemeWithPrimary = updateThemePrimaryColors(darkTheme, primary, primaryLight2, primaryLight7, primaryLight8, primaryLight9);
  
  // 注册主题
  registerTheme('btc-light', lightThemeWithPrimary);
  registerTheme('btc-dark', darkThemeWithPrimary);
}
