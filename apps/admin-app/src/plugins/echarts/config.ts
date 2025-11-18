import { type App } from 'vue';
import VueECharts from 'vue-echarts';
import { use } from 'echarts/core';

// 导入 ECharts 核心模块
import {
  CanvasRenderer
} from 'echarts/renderers';

import {
  BarChart,
  LineChart,
  PieChart
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
    }
  }
};
