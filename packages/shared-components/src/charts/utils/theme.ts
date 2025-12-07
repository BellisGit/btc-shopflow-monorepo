/**
 * ECharts 主题配置工具
 */

import { registerTheme } from 'echarts/core';
import { getThemeColors } from './css-var';

// 主题注册标记，避免重复注册
let themesRegistered = false;

/**
 * 注册自定义 ECharts 主题
 * 注意：ECharts 不支持更新已注册的主题，所以如果需要更新主题，需要先注销再注册
 * 但为了简化，我们允许重复注册，ECharts 会使用最新的配置
 */
export function registerEChartsThemes() {
  // 每次注册时都重新读取 CSS 变量，确保获取最新的主题颜色
  const themeColors = getThemeColors();

  // 浅色主题
  registerTheme('btc-light', {
    backgroundColor: 'transparent',
    textStyle: {
      color: themeColors.textColor
    },
    title: {
      textStyle: {
        color: themeColors.textColor
      },
      subtextStyle: {
        color: themeColors.textColor
      }
    },
    line: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    radar: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: themeColors.borderColor
      }
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.bgColor
      }
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.bgColor
      }
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.borderColor
      }
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.borderColor
      }
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.borderColor
      }
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.bgColor
      }
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.borderColor
      }
    },
    candlestick: {
      itemStyle: {
        color: themeColors.primary,
        color0: 'transparent',
        borderColor: themeColors.primary,
        borderColor0: themeColors.primary,
        borderWidth: 1
      }
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.bgColor
      },
      lineStyle: {
        width: 1,
        color: themeColors.borderColor
      },
      symbolSize: 4,
      symbol: 'emptyCircle'
    },
    map: {
      itemStyle: {
        areaColor: themeColors.bgColorPage,
        borderColor: themeColors.borderColor,
        borderWidth: 0.5
      },
      label: {
        color: themeColors.textColor
      },
      emphasis: {
        itemStyle: {
          areaColor: themeColors.primaryLight9,
          borderColor: themeColors.primary,
          borderWidth: 1
        },
        label: {
          color: themeColors.textColor
        }
      }
    },
    geo: {
      itemStyle: {
        areaColor: themeColors.bgColorPage,
        borderColor: themeColors.borderColor,
        borderWidth: 0.5
      },
      label: {
        color: themeColors.textColor
      },
      emphasis: {
        itemStyle: {
          areaColor: themeColors.primaryLight9,
          borderColor: themeColors.primary,
          borderWidth: 1
        },
        label: {
          color: themeColors.textColor
        }
      }
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.textColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [themeColors.borderColorLighter]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.bgColorPage, themeColors.bgColor]
        }
      }
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.textColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [themeColors.borderColorLighter]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.bgColorPage, themeColors.bgColor]
        }
      }
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.textColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [themeColors.borderColorLighter]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.bgColorPage, themeColors.bgColor]
        }
      }
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.borderColorLight
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.textColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [themeColors.borderColorLighter]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.bgColorPage, themeColors.bgColor]
        }
      }
    },
    toolbox: {
      iconStyle: {
        borderColor: themeColors.borderColor
      },
      emphasis: {
        iconStyle: {
          borderColor: themeColors.primary
        }
      }
    },
    legend: {
      textStyle: {
        color: themeColors.textColor
      }
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: themeColors.borderColor,
          width: 1
        },
        crossStyle: {
          color: themeColors.borderColor,
          width: 1
        }
      }
    },
    timeline: {
      lineStyle: {
        color: themeColors.borderColor,
        width: 1
      },
      itemStyle: {
        color: themeColors.primary,
        borderWidth: 1
      },
      controlStyle: {
        color: themeColors.primary,
        borderColor: themeColors.primary,
        borderWidth: 0.5
      },
      checkpointStyle: {
        color: themeColors.primary,
        borderColor: themeColors.primary,
        borderWidth: 2
      },
      label: {
        color: themeColors.textColor
      },
      emphasis: {
        itemStyle: {
          color: themeColors.primary
        },
        controlStyle: {
          color: themeColors.primary,
          borderColor: themeColors.primary,
          borderWidth: 0.5
        },
        label: {
          color: themeColors.textColor
        }
      }
    },
    visualMap: {
      color: [themeColors.primaryLight2, themeColors.primaryLight8]
    },
    dataZoom: {
      borderColor: themeColors.borderColor,
      textStyle: {
        color: themeColors.textColor
      },
      handleSize: '80%',
      dataBackground: {
        areaStyle: {
          color: themeColors.borderColorLighter
        },
        lineStyle: {
          opacity: 0.8,
          color: themeColors.borderColor
        }
      },
      selectedDataBackground: {
        areaStyle: {
          color: themeColors.primaryLight9
        },
        lineStyle: {
          opacity: 1,
          color: themeColors.primary
        }
      },
      fillerColor: `rgba(${hexToRgb(themeColors.primary)}, 0.2)`,
      handleColor: themeColors.primaryLight7,
      handleIcon: 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.2,10.8,24.1,24.1,24.1C44.2,51.7,55,40.8,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.1-0.2,0.3-0.5,0.3c-0.3,0-0.5-0.2-0.5-0.3c0-0.1,0.2-0.3,0.5-0.3C36.7,35.5,36.9,35.6,36.9,35.8z',
      moveHandleIcon: 'path://M-320.9-50L-320.9-50c18.1,0,27.1,9,27.1,27.1V85.9c0,18.1-9,27.1-27.1,27.1h0.1c-18.1,0-27.1-9-27.1-27.1V-22.9C-348-41-339-50-320.9-50z M-320.8-8.9c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1s14.1-6.3,14.1-14.1S-313-8.9-320.8-8.9z M-296.4-14.2c-2.9,0-5.8,1.2-7.8,3.2c-1.9,1.9-3.2,4.9-3.2,7.8c0,2.9,1.2,5.8,3.2,7.8c1.9,1.9,4.9,3.2,7.8,3.2c2.9,0,5.8-1.2,7.8-3.2c1.9-1.9,3.2-4.9,3.2-7.8c0-2.9-1.2-5.8-3.2-7.8C-290.6-13-293.5-14.2-296.4-14.2z',
      moveHandleColor: themeColors.primaryLight7,
      moveHandleSize: 8
    },
    markPoint: {
      label: {
        color: themeColors.textColor
      },
      emphasis: {
        label: {
          color: themeColors.textColor
        }
      }
    }
  });

  // 深色主题
  registerTheme('btc-dark', {
    backgroundColor: 'transparent',
    textStyle: {
      color: themeColors.dark.textColor
    },
    title: {
      textStyle: {
        color: themeColors.dark.textColor
      },
      subtextStyle: {
        color: themeColors.dark.textColor
      }
    },
    line: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    radar: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: themeColors.dark.borderColor
      }
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.bgColor
      }
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.bgColor
      }
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.borderColor
      }
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.borderColor
      }
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.borderColor
      }
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.bgColor
      }
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.borderColor
      }
    },
    candlestick: {
      itemStyle: {
        color: themeColors.primary,
        color0: 'transparent',
        borderColor: themeColors.primary,
        borderColor0: themeColors.primary,
        borderWidth: 1
      }
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: themeColors.dark.bgColor
      },
      lineStyle: {
        width: 1,
        color: themeColors.dark.borderColor
      },
      symbolSize: 4,
      symbol: 'emptyCircle'
    },
    map: {
      itemStyle: {
        areaColor: themeColors.dark.bgColorPage,
        borderColor: themeColors.dark.borderColor,
        borderWidth: 0.5
      },
      label: {
        color: themeColors.dark.textColor
      },
      emphasis: {
        itemStyle: {
          areaColor: themeColors.primaryLight9,
          borderColor: themeColors.primary,
          borderWidth: 1
        },
        label: {
          color: themeColors.dark.textColor
        }
      }
    },
    geo: {
      itemStyle: {
        areaColor: themeColors.dark.bgColorPage,
        borderColor: themeColors.dark.borderColor,
        borderWidth: 0.5
      },
      label: {
        color: themeColors.dark.textColor
      },
      emphasis: {
        itemStyle: {
          areaColor: themeColors.primaryLight9,
          borderColor: themeColors.primary,
          borderWidth: 1
        },
        label: {
          color: themeColors.dark.textColor
        }
      }
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.dark.textColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [themeColors.dark.borderColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.dark.bgColorPage, themeColors.dark.bgColor]
        }
      }
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.dark.textColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [themeColors.dark.borderColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.dark.bgColorPage, themeColors.dark.bgColor]
        }
      }
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.dark.textColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [themeColors.dark.borderColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.dark.bgColorPage, themeColors.dark.bgColor]
        }
      }
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: themeColors.dark.borderColor
        }
      },
      axisLabel: {
        show: true,
        color: themeColors.dark.textColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [themeColors.dark.borderColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [themeColors.dark.bgColorPage, themeColors.dark.bgColor]
        }
      }
    },
    toolbox: {
      iconStyle: {
        borderColor: themeColors.dark.borderColor
      },
      emphasis: {
        iconStyle: {
          borderColor: themeColors.primary
        }
      }
    },
    legend: {
      textStyle: {
        color: themeColors.dark.textColor
      }
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: themeColors.dark.borderColor,
          width: 1
        },
        crossStyle: {
          color: themeColors.dark.borderColor,
          width: 1
        }
      }
    },
    timeline: {
      lineStyle: {
        color: themeColors.dark.borderColor,
        width: 1
      },
      itemStyle: {
        color: themeColors.primary,
        borderWidth: 1
      },
      controlStyle: {
        color: themeColors.primary,
        borderColor: themeColors.primary,
        borderWidth: 0.5
      },
      checkpointStyle: {
        color: themeColors.primary,
        borderColor: themeColors.primary,
        borderWidth: 2
      },
      label: {
        color: themeColors.dark.textColor
      },
      emphasis: {
        itemStyle: {
          color: themeColors.primary
        },
        controlStyle: {
          color: themeColors.primary,
          borderColor: themeColors.primary,
          borderWidth: 0.5
        },
        label: {
          color: themeColors.dark.textColor
        }
      }
    },
    visualMap: {
      color: [themeColors.primaryLight2, themeColors.primaryLight8]
    },
    dataZoom: {
      borderColor: themeColors.dark.borderColor,
      textStyle: {
        color: themeColors.dark.textColor
      },
      handleSize: '80%',
      dataBackground: {
        areaStyle: {
          color: themeColors.dark.borderColor
        },
        lineStyle: {
          opacity: 0.8,
          color: themeColors.dark.borderColor
        }
      },
      selectedDataBackground: {
        areaStyle: {
          color: themeColors.primaryLight9
        },
        lineStyle: {
          opacity: 1,
          color: themeColors.primary
        }
      },
      fillerColor: `rgba(${hexToRgb(themeColors.primary)}, 0.2)`,
      handleColor: themeColors.primaryLight7,
      handleIcon: 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.2,10.8,24.1,24.1,24.1C44.2,51.7,55,40.8,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.1-0.2,0.3-0.5,0.3c-0.3,0-0.5-0.2-0.5-0.3c0-0.1,0.2-0.3,0.5-0.3C36.7,35.5,36.9,35.6,36.9,35.8z',
      moveHandleIcon: 'path://M-320.9-50L-320.9-50c18.1,0,27.1,9,27.1,27.1V85.9c0,18.1-9,27.1-27.1,27.1h0.1c-18.1,0-27.1-9-27.1-27.1V-22.9C-348-41-339-50-320.9-50z M-320.8-8.9c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1s14.1-6.3,14.1-14.1S-313-8.9-320.8-8.9z M-296.4-14.2c-2.9,0-5.8,1.2-7.8,3.2c-1.9,1.9-3.2,4.9-3.2,7.8c0,2.9,1.2,5.8,3.2,7.8c1.9,1.9,4.9,3.2,7.8,3.2c2.9,0,5.8-1.2,7.8-3.2c1.9-1.9,3.2-4.9,3.2-7.8c0-2.9-1.2-5.8-3.2-7.8C-290.6-13-293.5-14.2-296.4-14.2z',
      moveHandleColor: themeColors.primaryLight7,
      moveHandleSize: 8
    },
    markPoint: {
      label: {
        color: themeColors.dark.textColor
      },
      emphasis: {
        label: {
          color: themeColors.dark.textColor
        }
      }
    }
  });
}

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

