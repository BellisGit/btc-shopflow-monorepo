// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.20_@types+node@24.7.0_sass@1.93.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.20_vue@3.5.22/node_modules/@vitejs/plugin-vue/dist/index.mjs";
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
      "@plugins": resolve(__vite_injected_original_dirname, "src/plugins"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "src")
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
      external: ["vue", "element-plus", "@element-plus/icons-vue", "@btc/shared-core", "@btc/shared-utils"],
      output: {
        globals: {
          vue: "Vue",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          "@btc/shared-core": "BTCSharedCore",
          "@btc/shared-utils": "BTCSharedUtils"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb21wb25lbnRzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3ZpdGUuY29uZmlnLnRzXCI7XHVGRUZGaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAYnRjLWNvbW1vbic6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbW1vbicpLFxuICAgICAgJ0BidGMtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAYnRjLWNydWQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jcnVkJyksXG4gICAgICAnQGJ0Yy1zdHlsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zdHlsZXMnKSxcbiAgICAgICdAYnRjLWxvY2FsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9sb2NhbGVzJyksXG4gICAgICAnQGFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2Fzc2V0cycpLFxuICAgICAgJ0BwbHVnaW5zJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcGx1Z2lucycpLFxuICAgICAgJ0B1dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3V0aWxzJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBsb2dMZXZlbDogJ2Vycm9yJywgLy8gXHU5MzU5XHVFMDQ1XHU2QTA5XHU3RUMwXHU2RDJBXHU2NTRBXHU3NDg3XHVFMjI0XHU3RDFEXHU5M0I2XHU2MjFEXHU1N0Q3XHU3NDgwXHVGRTQwXHU2MUExXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdCVENTaGFyZWRDb21wb25lbnRzJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0ID09PSAnZXMnID8gJ21qcycgOiAnanMnfWAsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWyd2dWUnLCAnZWxlbWVudC1wbHVzJywgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJywgJ0BidGMvc2hhcmVkLWNvcmUnLCAnQGJ0Yy9zaGFyZWQtdXRpbHMnXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgdnVlOiAnVnVlJyxcbiAgICAgICAgICAnZWxlbWVudC1wbHVzJzogJ0VsZW1lbnRQbHVzJyxcbiAgICAgICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnOiAnRWxlbWVudFBsdXNJY29uc1Z1ZScsXG4gICAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiAnQlRDU2hhcmVkQ29yZScsXG4gICAgICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogJ0JUQ1NoYXJlZFV0aWxzJyxcbiAgICAgICAgfSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09ICdzdHlsZS5jc3MnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3N0eWxlLmNzcyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsIC8vIFx1NzA0Rlx1NTVEOFx1NTg4RFx1OTNDOD9DU1MgXHU5MzVBXHU1ODFEXHU4MkRGXHU5MzUyXHU5ODgxXHU3QUY0XHU2RDkzXHVFMDQ1XHU2NzgzXHU2RDYwXHU2NzM1XHU4MTUxXG4gIH0sXG59KTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5YixTQUFTLG9CQUFvQjtBQUN0ZCxPQUFPLFNBQVM7QUFFaEIsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGVBQWUsUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDOUMsbUJBQW1CLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDdEQsYUFBYSxRQUFRLGtDQUFXLFVBQVU7QUFBQSxNQUMxQyxlQUFlLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQzlDLGdCQUFnQixRQUFRLGtDQUFXLGFBQWE7QUFBQSxNQUNoRCxXQUFXLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQzFDLFlBQVksUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDNUMsVUFBVSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxNQUN4QywwQkFBMEIsUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDcEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsRUFDTjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osS0FBSztBQUFBLFFBQ0wscUJBQXFCLENBQUMsaUJBQWlCLFFBQVE7QUFBQSxNQUNqRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxVQUFVO0FBQUE7QUFBQSxFQUNWLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsV0FBVyxPQUFPLFFBQVEsSUFBSTtBQUFBLElBQy9EO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsT0FBTyxnQkFBZ0IsMkJBQTJCLG9CQUFvQixtQkFBbUI7QUFBQSxNQUNwRyxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxLQUFLO0FBQUEsVUFDTCxnQkFBZ0I7QUFBQSxVQUNoQiwyQkFBMkI7QUFBQSxVQUMzQixvQkFBb0I7QUFBQSxVQUNwQixxQkFBcUI7QUFBQSxRQUN2QjtBQUFBLFFBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUM3QixjQUFJLFVBQVUsU0FBUyxhQUFhO0FBQ2xDLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUE7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
