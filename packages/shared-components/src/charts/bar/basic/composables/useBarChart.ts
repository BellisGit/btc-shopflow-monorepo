import type { Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { BarChartProps } from '../../../types/bar';
import { createVerticalGradient, createHorizontalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';
// import { getThemeColors } from '../../../utils/css-var'; // 未使用

/**
 * ??? composable
 */
export function useBarChart(
  props: BarChartProps,
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
        show: props.showTooltip ?? true,
        // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        top: '0%',
        left: 'center'
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
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        const seriesConfig: any = {
          name: item.name,
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '60%',
          label: {
            show: props.showLabel ?? false,
            position: 'top',
            fontSize: 12
            // color 由 ECharts 主题处理
          }
        };

        // ??????
        if (props.useGradient) {
          const gradient = props.gradientDirection === 'horizontal'
            ? createHorizontalGradient(baseColor, 0.8, 0.2)
            : createVerticalGradient(baseColor, 0.8, 0.2);
          seriesConfig.itemStyle = {
            color: gradient
          };
        } else {
          seriesConfig.itemStyle = {
            color: baseColor
          };
        }

        // ????? stack?????
        if (item.stack) {
          seriesConfig.stack = item.stack;
        }

        return seriesConfig;
      })
    };

    return option;
  };

  return {
    buildOption
  };
}

