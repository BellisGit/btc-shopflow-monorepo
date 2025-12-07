import { type App } from 'vue';
import VueECharts from 'vue-echarts';
import { use } from 'echarts/core';
import { registerEChartsThemes } from '@btc/shared-components/charts/utils';

// 导入 ECharts 核心模块
import {
  CanvasRenderer
} from 'echarts/renderers';

import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CandlestickChart
} from 'echarts/charts';

import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  ToolboxComponent
} from 'echarts/components';

// 注册必要的组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CandlestickChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  ToolboxComponent
]);

export default {
  install(app: App) {
    // 检查是否已经注册，避免重复注册
    if (!app.config.globalProperties.$_vueEchartsInstalled) {
      // 全局注册 v-chart 组件
      app.component('v-chart', VueECharts);
      app.config.globalProperties.$_vueEchartsInstalled = true;

      // 在应用启动后注册自定义主题，确保 CSS 变量已经正确设置
      if (typeof window !== 'undefined') {
        // 使用多种方式确保 DOM 和 CSS 变量已经准备好
        const registerThemes = () => {
          registerEChartsThemes();
        };

        // 立即尝试注册
        registerThemes();

        // DOMContentLoaded 时再次注册，确保 CSS 变量已应用
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', registerThemes);
        }

        // 延迟注册，确保所有样式都已加载
        setTimeout(registerThemes, 100);
      }
    }
  }
};
