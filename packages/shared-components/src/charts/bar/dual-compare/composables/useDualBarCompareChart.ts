import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { DualBarCompareChartProps } from '../../../types/bar';
import { getColorByIndex } from '../../../utils/color';
// import { getThemeColors } from '../../../utils/css-var'; // 未使用

/**
 * ???? composable
 */
export function useDualBarCompareChart(
  props: DualBarCompareChartProps,
  _isDark: Ref<boolean>,
  _themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    const option: EChartsOption = {
      title: {
        text: props.title || ''
        // textStyle.color 由 ECharts 主题处理
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        show: props.showTooltip ?? true,
        // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        top: '0%',
        left: 'center',
        data: [props.label1 || '数据1', props.label2 || '数据2']
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
      grid: props.grid || {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '3%'
      },
      xAxis: {
        type: 'category',
        data: props.xAxisData
        // axisLine.lineStyle.color, axisLabel.color 由 ECharts 主题处理
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        // splitLine.lineStyle.color 由 ECharts 主题处理
        axisLabel: {
          formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
          // color 由 ECharts 主题处理
        }
      },
      series: [
        ...props.data1.map((item) => ({
          name: props.label1 || '??1',
          type: 'bar' as const,
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(0)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top' as const,
            fontSize: 12
            // color 由 ECharts 主题处理
          }
        })),
        ...props.data2.map((item) => ({
          name: props.label2 || '??2',
          type: 'bar' as const,
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(1)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top' as const,
            fontSize: 12
            // color 由 ECharts 主题处理
          }
        }))
      ] as any
    };

    return option;
  };

  return {
    buildOption
  };
}
