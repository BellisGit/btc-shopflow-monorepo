// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.25/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\packages\\shared-components";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@btc-common": resolve(__vite_injected_original_dirname, "src/common"),
      "@btc-components": resolve(__vite_injected_original_dirname, "src/components"),
      "@btc-crud": resolve(__vite_injected_original_dirname, "src/crud"),
      "@btc-styles": resolve(__vite_injected_original_dirname, "src/styles"),
      "@btc-locales": resolve(__vite_injected_original_dirname, "src/locales"),
      "@assets": resolve(__vite_injected_original_dirname, "src/assets"),
      "@btc-assets": resolve(__vite_injected_original_dirname, "src/assets"),
      // 添加 @btc-assets 别名，用于图片资源导入
      "@plugins": resolve(__vite_injected_original_dirname, "src/plugins"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "src"),
      // 添加 @configs 别名，指向项目根目录的 configs 文件夹（用于开发环境）
      // 在构建时，这些模块会被标记为 external，不会被打包
      "@configs": resolve(__vite_injected_original_dirname, "../../configs"),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      "@charts-utils/css-var": resolve(__vite_injected_original_dirname, "src/charts/utils/css-var"),
      "@charts-utils/color": resolve(__vite_injected_original_dirname, "src/charts/utils/color"),
      "@charts-utils/gradient": resolve(__vite_injected_original_dirname, "src/charts/utils/gradient"),
      "@charts-composables/useChartComponent": resolve(__vite_injected_original_dirname, "src/charts/composables/useChartComponent"),
      "@charts": resolve(__vite_injected_original_dirname, "src/charts"),
      "@charts-types": resolve(__vite_injected_original_dirname, "src/charts/types"),
      "@charts-utils": resolve(__vite_injected_original_dirname, "src/charts/utils"),
      "@charts-composables": resolve(__vite_injected_original_dirname, "src/charts/composables")
    }
  },
  plugins: [
    vue()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    }
  },
  logLevel: "error",
  // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "BTCSharedComponents",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`
    },
    rollupOptions: {
      external: ["vue", "vue-router", "pinia", "element-plus", "@element-plus/icons-vue", "@btc/shared-core", "@btc/shared-utils", "@btc/subapp-manifests", "@configs/unified-env-config", "@configs/app-scanner"],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          "pinia": "Pinia",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          "@btc/shared-core": "BTCSharedCore",
          "@btc/shared-utils": "BTCSharedUtils",
          "@btc/subapp-manifests": "BTCSubappManifests"
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "style.css";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    },
    cssCodeSplit: false
    // 灏嗘墍鏈?CSS 鍚堝苟鍒颁竴涓枃浠朵腑
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3ZpdGUuY29uZmlnLnRzXCI7XHVGRUZGaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAYnRjLWNvbW1vbic6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbW1vbicpLFxuICAgICAgJ0BidGMtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAYnRjLWNydWQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jcnVkJyksXG4gICAgICAnQGJ0Yy1zdHlsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zdHlsZXMnKSxcbiAgICAgICdAYnRjLWxvY2FsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9sb2NhbGVzJyksXG4gICAgICAnQGFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2Fzc2V0cycpLFxuICAgICAgJ0BidGMtYXNzZXRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvYXNzZXRzJyksIC8vIFx1NkRGQlx1NTJBMCBAYnRjLWFzc2V0cyBcdTUyMkJcdTU0MERcdUZGMENcdTc1MjhcdTRFOEVcdTU2RkVcdTcyNDdcdThENDRcdTZFOTBcdTVCRkNcdTUxNjVcbiAgICAgICdAcGx1Z2lucyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3BsdWdpbnMnKSxcbiAgICAgICdAdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy91dGlscycpLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgICAgLy8gXHU2REZCXHU1MkEwIEBjb25maWdzIFx1NTIyQlx1NTQwRFx1RkYwQ1x1NjMwN1x1NTQxMVx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NCBjb25maWdzIFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NzUyOFx1NEU4RVx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYwOVxuICAgICAgLy8gXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU4RkQ5XHU0RTlCXHU2QTIxXHU1NzU3XHU0RjFBXHU4OEFCXHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjBDXHU0RTBEXHU0RjFBXHU4OEFCXHU2MjUzXHU1MzA1XG4gICAgICAnQGNvbmZpZ3MnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2NvbmZpZ3MnKSxcbiAgICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwQ1x1NTNCQlx1NjM4OSAudHMgXHU2MjY5XHU1QzU1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA5XG4gICAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAgICdAY2hhcnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzJyksXG4gICAgICAnQGNoYXJ0cy10eXBlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NoYXJ0cy90eXBlcycpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBsb2dMZXZlbDogJ2Vycm9yJywgLy8gXHU5MzU5XHVFMDQ1XHU2QTA5XHU3RUMwXHU2RDJBXHU2NTRBXHU3NDg3XHVFMjI0XHU3RDFEXHU5M0I2XHU2MjFEXHU1N0Q3XHU3NDgwXHVGRTQwXHU2MUExXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdCVENTaGFyZWRDb21wb25lbnRzJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0ID09PSAnZXMnID8gJ21qcycgOiAnanMnfWAsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLCAnQGJ0Yy9zaGFyZWQtY29yZScsICdAYnRjL3NoYXJlZC11dGlscycsICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnLCAnQGNvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJywgJ0Bjb25maWdzL2FwcC1zY2FubmVyJ10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHZ1ZTogJ1Z1ZScsXG4gICAgICAgICAgJ3Z1ZS1yb3V0ZXInOiAnVnVlUm91dGVyJyxcbiAgICAgICAgICAncGluaWEnOiAnUGluaWEnLFxuICAgICAgICAgICdlbGVtZW50LXBsdXMnOiAnRWxlbWVudFBsdXMnLFxuICAgICAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSc6ICdFbGVtZW50UGx1c0ljb25zVnVlJyxcbiAgICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6ICdCVENTaGFyZWRDb3JlJyxcbiAgICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiAnQlRDU2hhcmVkVXRpbHMnLFxuICAgICAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnOiAnQlRDU3ViYXBwTWFuaWZlc3RzJyxcbiAgICAgICAgfSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09ICdzdHlsZS5jc3MnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3N0eWxlLmNzcyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsIC8vIFx1NzA0Rlx1NTVEOFx1NTg4RFx1OTNDOD9DU1MgXHU5MzVBXHU1ODFEXHU4MkRGXHU5MzUyXHU5ODgxXHU3QUY0XHU2RDkzXHVFMDQ1XHU2NzgzXHU2RDYwXHU2NzM1XHU4MTUxXG4gIH0sXG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5YixTQUFTLG9CQUFvQjtBQUN0ZCxPQUFPLFNBQVM7QUFFaEIsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGVBQWUsUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDOUMsbUJBQW1CLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDdEQsYUFBYSxRQUFRLGtDQUFXLFVBQVU7QUFBQSxNQUMxQyxlQUFlLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQzlDLGdCQUFnQixRQUFRLGtDQUFXLGFBQWE7QUFBQSxNQUNoRCxXQUFXLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQzFDLGVBQWUsUUFBUSxrQ0FBVyxZQUFZO0FBQUE7QUFBQSxNQUM5QyxZQUFZLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQzVDLFVBQVUsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDeEMsMEJBQTBCLFFBQVEsa0NBQVcsS0FBSztBQUFBO0FBQUE7QUFBQSxNQUdsRCxZQUFZLFFBQVEsa0NBQVcsZUFBZTtBQUFBO0FBQUEsTUFFOUMseUJBQXlCLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDdEUsdUJBQXVCLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDbEUsMEJBQTBCLFFBQVEsa0NBQVcsMkJBQTJCO0FBQUEsTUFDeEUseUNBQXlDLFFBQVEsa0NBQVcsMENBQTBDO0FBQUEsTUFDdEcsV0FBVyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUMxQyxpQkFBaUIsUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQSxNQUN0RCxpQkFBaUIsUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQSxNQUN0RCx1QkFBdUIsUUFBUSxrQ0FBVyx3QkFBd0I7QUFBQSxJQUNwRTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxFQUNOO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxxQkFBcUIsQ0FBQyxpQkFBaUIsUUFBUTtBQUFBLE1BQ2pEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFVBQVU7QUFBQTtBQUFBLEVBQ1YsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVcsU0FBUyxXQUFXLE9BQU8sUUFBUSxJQUFJO0FBQUEsSUFDL0Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxPQUFPLGNBQWMsU0FBUyxnQkFBZ0IsMkJBQTJCLG9CQUFvQixxQkFBcUIseUJBQXlCLCtCQUErQixzQkFBc0I7QUFBQSxNQUMzTSxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxLQUFLO0FBQUEsVUFDTCxjQUFjO0FBQUEsVUFDZCxTQUFTO0FBQUEsVUFDVCxnQkFBZ0I7QUFBQSxVQUNoQiwyQkFBMkI7QUFBQSxVQUMzQixvQkFBb0I7QUFBQSxVQUNwQixxQkFBcUI7QUFBQSxVQUNyQix5QkFBeUI7QUFBQSxRQUMzQjtBQUFBLFFBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUM3QixjQUFJLFVBQVUsU0FBUyxhQUFhO0FBQ2xDLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUE7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
