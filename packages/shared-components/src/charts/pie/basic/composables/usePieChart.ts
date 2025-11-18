import { computed, type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { PieChartProps } from '../../../types/pie';
import { getColorByIndex } from '../../../utils/color';

/**
 * ?? composable
 */
export function usePieChart(
  props: PieChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    const textColor = isDark.value ? themeColors.dark.textColor : themeColors.textColor;
    const borderColor = isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight;
    const bgColor = isDark.value ? themeColors.dark.bgColor : themeColors.bgColor;
    const tooltipBg = isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';

    const option: EChartsOption = {
      title: {
        text: props.title || '',
        textStyle: {
          color: textColor
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        show: props.showTooltip ?? true,
        backgroundColor: tooltipBg,
        borderColor: borderColor,
        borderWidth: 1,
        textStyle: {
          color: textColor
        },
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        orient: ['left', 'right'].includes(props.legendPosition || 'top') ? 'vertical' : 'horizontal',
        [props.legendPosition || 'top']: '0%',
        textStyle: {
          color: textColor
        }
      },
      toolbox: {
        show: props.showToolbar ?? false,
        right: '10px',
        top: '10px',
        feature: {
          saveAsImage: {
            show: true,
            title: '?????',
            type: 'png',
            pixelRatio: 2
          },
          dataView: {
            show: true,
            title: '????',
            readOnly: false
          },
          restore: {
            show: true,
            title: '??'
          }
        },
        iconStyle: {
          borderColor: borderColor
        },
        emphasis: {
          iconStyle: {
            borderColor: themeColors.primary
          }
        }
      },
      series: [
        {
          name: '??',
          type: 'pie',
          // ??????????????????????????????
          radius: Array.isArray(props.radius) ? props.radius : (props.radius || '60%'),
          center: props.center || ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: bgColor,
            borderWidth: 2
          },
          label: {
            show: props.showLabel ?? false,
            position: props.labelPosition || 'outside'
          },
          labelLine: {
            show: props.showLabelLine ?? true
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: textColor
            }
          },
          data: props.data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || getColorByIndex(index)
            }
          }))
        }
      ]
    };

    return option;
  };

  return {
    buildOption
  };
}
