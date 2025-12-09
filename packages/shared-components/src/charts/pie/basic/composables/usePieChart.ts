import type { Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { PieChartProps } from '../../../types/pie';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';

/**
 * ?? composable
 */
export function usePieChart(
  props: PieChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    // 每次构建时重新获取主题颜色，用于需要动态计算的颜色（如饼图边框）
    const currentThemeColors = typeof window !== 'undefined' 
      ? getThemeColors()
      : themeColors;
    const bgColor = isDark.value ? currentThemeColors.dark.bgColor : currentThemeColors.bgColor;

    const option: EChartsOption = {
      title: {
        text: props.title || ''
        // textStyle.color 由 ECharts 主题处理
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        show: props.showTooltip ?? true,
        // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        orient: ['left', 'right'].includes(props.legendPosition || 'top') ? 'vertical' : 'horizontal',
        [props.legendPosition || 'top']: '0%'
        // textStyle.color 由 ECharts 主题处理
      },
      toolbox: {
        show: props.showToolbar ?? false,
        right: '10px',
        top: '10px',
        feature: {
          saveAsImage: {
            show: true,
            title: '保存为图片',
            type: 'png',
            pixelRatio: 2
          },
          dataView: {
            show: true,
            title: '数据视图',
            readOnly: false
          },
          restore: {
            show: true,
            title: '还原'
          }
        }
        // iconStyle.borderColor 由 ECharts 主题处理
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
            position: props.labelPosition || 'outside',
            fontSize: 12
            // color 由 ECharts 主题处理
          },
          labelLine: {
            show: props.showLabelLine ?? true
            // lineStyle.color 由 ECharts 主题处理
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
              // color 由 ECharts 主题处理
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
