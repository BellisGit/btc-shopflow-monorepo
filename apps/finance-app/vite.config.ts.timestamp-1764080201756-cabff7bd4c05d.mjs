// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.20_@types+node@24.7.0_sass@1.93.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.20_vue@3.5.22/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.20/node_modules/vite-plugin-qiankun/dist/index.js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "path";
import { btc } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/vite-plugin/dist/index.mjs";

// ../../configs/auto-import.config.ts
import AutoImport from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-auto-import@20.2.0/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.1.0_vue@3.5.24/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.1.0_vue@3.5.24/node_modules/unplugin-vue-components/dist/resolvers.js";
function createAutoImportConfig() {
  return AutoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia",
      {
        "@btc/shared-core": [
          "useCrud",
          "useDict",
          "usePermission",
          "useRequest",
          "createI18nPlugin",
          "useI18n"
        ],
        "@btc/shared-utils": [
          "formatDate",
          "formatDateTime",
          "formatMoney",
          "formatNumber",
          "isEmail",
          "isPhone",
          "storage"
        ]
      }
    ],
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入
      })
    ],
    dts: "src/auto-imports.d.ts",
    eslintrc: {
      enabled: true,
      filepath: "./.eslintrc-auto-import.json"
    },
    vueTemplate: true
  });
}
function createComponentsConfig(options = {}) {
  const { extraDirs = [], includeShared = true } = options;
  const dirs = [
    "src/components",
    // 应用级组件
    ...extraDirs
    // 额外的域级组件目录
  ];
  if (includeShared) {
    dirs.push(
      "../../packages/shared-components/src/components/basic",
      "../../packages/shared-components/src/components/layout",
      "../../packages/shared-components/src/components/navigation",
      "../../packages/shared-components/src/components/form",
      "../../packages/shared-components/src/components/data",
      "../../packages/shared-components/src/components/feedback",
      "../../packages/shared-components/src/components/others"
    );
  }
  return Components({
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入，避免 Vite reloading
      }),
      // 自定义解析器：@btc/shared-components
      (componentName) => {
        if (componentName.startsWith("Btc") || componentName.startsWith("btc-")) {
          return {
            name: componentName,
            from: "@btc/shared-components"
          };
        }
      }
    ],
    dts: "src/components.d.ts",
    dirs,
    extensions: ["vue", "tsx"],
    // 支持 .vue 和 .tsx 文件
    // 强制重新扫描组件
    deep: true,
    // 包含所有 Btc 开头的组件
    include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/]
  });
}

// ../admin-app/src/config/proxy.ts
var proxy = {
  "/api": {
    target: "http://10.80.9.76:8115",
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 处理响应头，添加 CORS 头
    configure: (proxy3, options) => {
      proxy3.on("proxyRes", (proxyRes, req, res) => {
        const origin = req.headers.origin || "*";
        if (proxyRes.headers) {
          proxyRes.headers["Access-Control-Allow-Origin"] = origin;
          proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
          proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
          const requestHeaders = req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id";
          proxyRes.headers["Access-Control-Allow-Headers"] = requestHeaders;
          const setCookieHeader = proxyRes.headers["set-cookie"];
          if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            const fixedCookies = cookies.map((cookie) => {
              if (!cookie.includes("SameSite=None")) {
                let fixedCookie = cookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, "");
                fixedCookie += "; SameSite=None; Secure";
                return fixedCookie;
              }
              return cookie;
            });
            proxyRes.headers["set-cookie"] = fixedCookies;
          }
        }
        if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
          console.error(`[Proxy] Backend returned ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        }
      });
      proxy3.on("error", (err, req, res) => {
        console.error("[Proxy] Error:", err.message);
        console.error("[Proxy] Request URL:", req.url);
        console.error("[Proxy] Target:", "http://10.80.9.76:8115");
        if (res && !res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": req.headers.origin || "*"
          });
          res.end(JSON.stringify({
            code: 500,
            message: "\u4EE3\u7406\u9519\u8BEF\uFF1A\u65E0\u6CD5\u8FDE\u63A5\u5230\u540E\u7AEF\u670D\u52A1\u5668 http://10.80.9.76:8115",
            error: err.message
          }));
        }
      });
      proxy3.on("proxyReq", (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> http://10.80.9.76:8115${req.url}`);
      });
    }
  }
};

// ../../configs/app-env.config.ts
var APP_ENV_CONFIGS = [
  {
    appName: "system-app",
    devHost: "10.80.8.199",
    devPort: "8080",
    preHost: "localhost",
    prePort: "4180",
    prodHost: "bellis.com.cn"
  },
  {
    appName: "admin-app",
    devHost: "10.80.8.199",
    devPort: "8081",
    preHost: "localhost",
    prePort: "4181",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "logistics-app",
    devHost: "10.80.8.199",
    devPort: "8082",
    preHost: "localhost",
    prePort: "4182",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "quality-app",
    devHost: "10.80.8.199",
    devPort: "8083",
    preHost: "localhost",
    prePort: "4183",
    prodHost: "quality.bellis.com.cn"
  },
  {
    appName: "production-app",
    devHost: "10.80.8.199",
    devPort: "8084",
    preHost: "localhost",
    prePort: "4184",
    prodHost: "production.bellis.com.cn"
  },
  {
    appName: "engineering-app",
    devHost: "10.80.8.199",
    devPort: "8085",
    preHost: "localhost",
    prePort: "4185",
    prodHost: "engineering.bellis.com.cn"
  },
  {
    appName: "finance-app",
    devHost: "10.80.8.199",
    devPort: "8086",
    preHost: "localhost",
    prePort: "4186",
    prodHost: "finance.bellis.com.cn"
  },
  {
    appName: "mobile-app",
    devHost: "10.80.8.199",
    devPort: "8091",
    preHost: "localhost",
    prePort: "4191",
    prodHost: "mobile.bellis.com.cn"
  }
];
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config2) => config2.appName === appName);
}

// ../../configs/vite-app-config.ts
function getViteAppConfig(appName) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  const mainAppConfig = getAppConfig("system-app");
  const mainAppOrigin = mainAppConfig ? `http://${mainAppConfig.preHost}:${mainAppConfig.prePort}` : "http://localhost:4180";
  return {
    devPort: parseInt(appConfig.devPort, 10),
    devHost: appConfig.devHost,
    prePort: parseInt(appConfig.prePort, 10),
    preHost: appConfig.preHost,
    prodHost: appConfig.prodHost,
    mainAppOrigin
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\finance-app";
var proxy2 = proxy;
var config = getViteAppConfig("finance-app");
var APP_PORT = config.prePort;
var APP_HOST = config.preHost;
var MAIN_APP_ORIGIN = config.mainAppOrigin;
var corsPlugin = () => {
  const corsDevMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    next();
  };
  const corsPreviewMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    next();
  };
  return {
    name: "cors-with-credentials",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        corsDevMiddleware(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        corsPreviewMiddleware(req, res, next);
      });
    }
  };
};
var vite_config_default = defineConfig({
  // 关键：base 指向子应用本地预览的绝对路径（必须带末尾 /）
  // 这样构建产物中的资源路径会基于这个 base URL
  base: `http://${APP_HOST}:${APP_PORT}/`,
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@services": resolve(__vite_injected_original_dirname, "src/services"),
      "@btc/shared-core": resolve(__vite_injected_original_dirname, "../../packages/shared-core/src"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src"),
      "@btc/shared-utils": resolve(__vite_injected_original_dirname, "../../packages/shared-utils/src"),
      "@btc-common": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/common"),
      "@btc-components": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/components"),
      "@btc-crud": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/crud"),
      "@assets": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/assets"),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      "@charts-utils/css-var": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/utils/css-var"),
      "@charts-utils/color": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/utils/color"),
      "@charts-utils/gradient": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/utils/gradient"),
      "@charts-composables/useChartComponent": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/composables/useChartComponent"),
      "@charts-types": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/types"),
      "@charts-utils": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/utils"),
      "@charts-composables": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/composables")
    }
  },
  plugins: [
    corsPlugin(),
    // 添加 CORS 插件，支持 credentials
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file) => readFileSync(file, "utf-8")
        }
      }
    }),
    createAutoImportConfig({ includeShared: true }),
    createComponentsConfig({ includeShared: true }),
    btc({
      type: "subapp",
      proxy: proxy2,
      eps: {
        enable: true,
        dist: "./build/eps",
        api: "/api/login/eps/contract"
      }
    }),
    qiankun("finance", {
      useDevMode: true
    })
  ],
  server: {
    port: config.devPort,
    host: "0.0.0.0",
    cors: true,
    origin: `http://${config.devHost}:${config.devPort}`,
    strictPort: false,
    proxy: proxy2,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    },
    hmr: {
      protocol: "ws",
      host: config.devHost,
      // HMR WebSocket 需要使用配置的主机，浏览器无法连接 0.0.0.0
      port: config.devPort,
      overlay: false
      // 关闭热更新错误浮层，减少开销
    },
    fs: {
      strict: false,
      allow: [
        resolve(__vite_injected_original_dirname, "../.."),
        resolve(__vite_injected_original_dirname, "../../packages"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-components/src")
      ]
    }
  },
  // 预览服务器配置（启动构建产物的静态服务器）
  preview: {
    port: APP_PORT,
    strictPort: true,
    // 端口被占用时报错，避免自动切换
    open: false,
    // 启动后不自动打开浏览器
    host: "0.0.0.0",
    proxy: proxy2,
    headers: {
      // 允许主应用（4180）跨域访问当前子应用资源
      "Access-Control-Allow-Origin": MAIN_APP_ORIGIN,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    historyApiFallback: true
    // 支持单页应用路由（避免子应用路由刷新 404）
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        "vue",
        "vue-router",
        "pinia",
        "element-plus",
        "@element-plus/icons-vue",
        "axios",
        "lodash-es",
        "dayjs",
        "@vueuse/core"
      ],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          pinia: "Pinia",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          axios: "axios",
          "lodash-es": "lodash",
          dayjs: "dayjs",
          "@vueuse/core": "VueUse"
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 500
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHMiLCAiLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUtYXBwLWNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxmaW5hbmNlLWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGZpbmFuY2UtYXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvZmluYW5jZS1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgYnRjIH0gZnJvbSAnQGJ0Yy92aXRlLXBsdWdpbic7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgcHJveHkgYXMgbWFpblByb3h5IH0gZnJvbSAnLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHknO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnJztcblxuY29uc3QgcHJveHkgPSBtYWluUHJveHk7XG5cbi8vIFx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuY29uc3QgY29uZmlnID0gZ2V0Vml0ZUFwcENvbmZpZygnZmluYW5jZS1hcHAnKTtcbmNvbnN0IEFQUF9QT1JUID0gY29uZmlnLnByZVBvcnQ7XG5jb25zdCBBUFBfSE9TVCA9IGNvbmZpZy5wcmVIb3N0O1xuY29uc3QgTUFJTl9BUFBfT1JJR0lOID0gY29uZmlnLm1haW5BcHBPcmlnaW47XG5cbi8vIENPUlMgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzXHVGRjA5XG5jb25zdCBjb3JzUGx1Z2luID0gKCk6IFBsdWdpbiA9PiB7XG4gIC8vIENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XHU1MUZEXHU2NTcwXHVGRjA4XHU3NTI4XHU0RThFXHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHVGRjA5XG4gIGNvbnN0IGNvcnNEZXZNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIFxuICAgIC8vIFx1OEJCRVx1N0Y2RSBDT1JTIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NjI0MFx1NjcwOVx1OEJGN1x1NkM0Mlx1OTBGRFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICAvLyBDaHJvbWUgXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU4OTgxXHU2QzQyXHVGRjA4XHU0RUM1XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU5NzAwXHU4OTgxXHVGRjA5XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDkgb3JpZ2luXHVGRjBDXHU0RTVGXHU4QkJFXHU3RjZFXHU1N0ZBXHU2NzJDXHU3Njg0IENPUlMgXHU1OTM0XHVGRjA4XHU1MTQxXHU4QkI4XHU2MjQwXHU2NzA5XHU2NzY1XHU2RTkwXHVGRjA5XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgLy8gQ2hyb21lIFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1ODk4MVx1NkM0Mlx1RkYwOFx1NEVDNVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIG5leHQoKTtcbiAgfTtcblxuICAvLyBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlx1NTFGRFx1NjU3MFx1RkYwOFx1NzUyOFx1NEU4RVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFx1RkYwOVxuICBjb25zdCBjb3JzUHJldmlld01pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG4gICAgXG4gICAgLy8gXHU4QkJFXHU3RjZFIENPUlMgXHU1NENEXHU1RTk0XHU1OTM0XHVGRjA4XHU2MjQwXHU2NzA5XHU4QkY3XHU2QzQyXHU5MEZEXHU5NzAwXHU4OTgxXHVGRjA5XG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IG9yaWdpblx1RkYwQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NTdGQVx1NjcyQ1x1NzY4NCBDT1JTIFx1NTkzNFx1RkYwOFx1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1Njc2NVx1NkU5MFx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIG5leHQoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3JzLXdpdGgtY3JlZGVudGlhbHMnLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYxQVx1NTMwNVx1NTQyQlx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29yc0Rldk1pZGRsZXdhcmUocmVxLCByZXMsIG5leHQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjFBXHU0RTBEXHU1MzA1XHU1NDJCXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb3JzUHJldmlld01pZGRsZXdhcmUocmVxLCByZXMsIG5leHQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWJhc2UgXHU2MzA3XHU1NDExXHU1QjUwXHU1RTk0XHU3NTI4XHU2NzJDXHU1NzMwXHU5ODg0XHU4OUM4XHU3Njg0XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1RkM1XHU5ODdCXHU1RTI2XHU2NzJCXHU1QzNFIC9cdUZGMDlcbiAgLy8gXHU4RkQ5XHU2ODM3XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU0RjFBXHU1N0ZBXHU0RThFXHU4RkQ5XHU0RTJBIGJhc2UgVVJMXG4gIGJhc2U6IGBodHRwOi8vJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0vYCxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICAnQHNlcnZpY2VzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2VydmljZXMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLXV0aWxzL3NyYycpLFxuICAgICAgJ0BidGMtY29tbW9uJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXG4gICAgICAnQGJ0Yy1jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cycpLFxuICAgICAgJ0BidGMtY3J1ZCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcbiAgICAgICdAYXNzZXRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksXG4gICAgICAvLyBcdTU2RkVcdTg4NjhcdTc2RjhcdTUxNzNcdTUyMkJcdTU0MERcdUZGMDhcdTUxNzdcdTRGNTNcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdTY1M0VcdTU3MjhcdTUyNERcdTk3NjJcdUZGMENcdTc4NkVcdTRGRERcdTRGMThcdTUxNDhcdTUzMzlcdTkxNERcdUZGMENcdTUzQkJcdTYzODkgLnRzIFx1NjI2OVx1NUM1NVx1NTQwRFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1NTkwNFx1NzQwNlx1RkYwOVxuICAgICAgJ0BjaGFydHMtdXRpbHMvY3NzLXZhcic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJyksXG4gICAgICAnQGNoYXJ0cy11dGlscy9jb2xvcic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvcicpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcbiAgICAgICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyksXG4gICAgICAnQGNoYXJ0cy10eXBlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcycpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIGNvcnNQbHVnaW4oKSwgLy8gXHU2REZCXHU1MkEwIENPUlMgXHU2M0QyXHU0RUY2XHVGRjBDXHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzXG4gICAgdnVlKHtcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgY3JlYXRlQXV0b0ltcG9ydENvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdzdWJhcHAnLFxuICAgICAgcHJveHksXG4gICAgICBlcHM6IHtcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgICBkaXN0OiAnLi9idWlsZC9lcHMnLFxuICAgICAgICBhcGk6ICcvYXBpL2xvZ2luL2Vwcy9jb250cmFjdCcsXG4gICAgICB9LFxuICAgIH0pLFxuICAgIHFpYW5rdW4oJ2ZpbmFuY2UnLCB7XG4gICAgICB1c2VEZXZNb2RlOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiBjb25maWcuZGV2UG9ydCxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgY29yczogdHJ1ZSxcbiAgICBvcmlnaW46IGBodHRwOi8vJHtjb25maWcuZGV2SG9zdH06JHtjb25maWcuZGV2UG9ydH1gLFxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxuICAgIHByb3h5LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgnLFxuICAgIH0sXG4gICAgaG1yOiB7XG4gICAgICBwcm90b2NvbDogJ3dzJyxcbiAgICAgIGhvc3Q6IGNvbmZpZy5kZXZIb3N0LCAvLyBITVIgV2ViU29ja2V0IFx1OTcwMFx1ODk4MVx1NEY3Rlx1NzUyOFx1OTE0RFx1N0Y2RVx1NzY4NFx1NEUzQlx1NjczQVx1RkYwQ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjVFMFx1NkNENVx1OEZERVx1NjNBNSAwLjAuMC4wXG4gICAgICBwb3J0OiBjb25maWcuZGV2UG9ydCxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLCAvLyBcdTUxNzNcdTk1RURcdTcwRURcdTY2RjRcdTY1QjBcdTk1MTlcdThCRUZcdTZENkVcdTVDNDJcdUZGMENcdTUxQ0ZcdTVDMTFcdTVGMDBcdTk1MDBcbiAgICB9LFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgYWxsb3c6IFtcbiAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicpLFxuICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzJyksXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVx1RkYwOFx1NTQyRlx1NTJBOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzY4NFx1OTc1OVx1NjAwMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogQVBQX1BPUlQsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgLy8gXHU3QUVGXHU1M0UzXHU4OEFCXHU1MzYwXHU3NTI4XHU2NUY2XHU2MkE1XHU5NTE5XHVGRjBDXHU5MDdGXHU1MTREXHU4MUVBXHU1MkE4XHU1MjA3XHU2MzYyXG4gICAgb3BlbjogZmFsc2UsIC8vIFx1NTQyRlx1NTJBOFx1NTQwRVx1NEUwRFx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwcm94eSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAvLyBcdTUxNDFcdThCQjhcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDg0MTgwXHVGRjA5XHU4REU4XHU1N0RGXHU4QkJGXHU5NUVFXHU1RjUzXHU1MjREXHU1QjUwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogTUFJTl9BUFBfT1JJR0lOLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICAgIGhpc3RvcnlBcGlGYWxsYmFjazogdHJ1ZSwgLy8gXHU2NTJGXHU2MzAxXHU1MzU1XHU5ODc1XHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHVGRjA4XHU5MDdGXHU1MTREXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHU1MjM3XHU2NUIwIDQwNFx1RkYwOVxuICB9LFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaScsICdpbXBvcnQnXVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAndnVlJyxcbiAgICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgICAncGluaWEnLFxuICAgICAgICAnZWxlbWVudC1wbHVzJyxcbiAgICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICAgJ2F4aW9zJyxcbiAgICAgICAgJ2xvZGFzaC1lcycsXG4gICAgICAgICdkYXlqcycsXG4gICAgICAgICdAdnVldXNlL2NvcmUnXG4gICAgICBdLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICB2dWU6ICdWdWUnLFxuICAgICAgICAgICd2dWUtcm91dGVyJzogJ1Z1ZVJvdXRlcicsXG4gICAgICAgICAgcGluaWE6ICdQaW5pYScsXG4gICAgICAgICAgJ2VsZW1lbnQtcGx1cyc6ICdFbGVtZW50UGx1cycsXG4gICAgICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJzogJ0VsZW1lbnRQbHVzSWNvbnNWdWUnLFxuICAgICAgICAgIGF4aW9zOiAnYXhpb3MnLFxuICAgICAgICAgICdsb2Rhc2gtZXMnOiAnbG9kYXNoJyxcbiAgICAgICAgICBkYXlqczogJ2RheWpzJyxcbiAgICAgICAgICAnQHZ1ZXVzZS9jb3JlJzogJ1Z1ZVVzZSdcbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjtcdUZFRkYvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4YWRtaW4tYXBwLCBsb2dpc3RpY3MtYXBwIFx1N0I0OVx1RkYwOVx1NEY3Rlx1NzUyOFxuICovXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIEF1dG8gSW1wb3J0IFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpIHtcbiAgcmV0dXJuIEF1dG9JbXBvcnQoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgIHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiBbXG4gICAgICAgICAgJ3VzZUNydWQnLFxuICAgICAgICAgICd1c2VEaWN0JyxcbiAgICAgICAgICAndXNlUGVybWlzc2lvbicsXG4gICAgICAgICAgJ3VzZVJlcXVlc3QnLFxuICAgICAgICAgICdjcmVhdGVJMThuUGx1Z2luJyxcbiAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgIF0sXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IFtcbiAgICAgICAgICAnZm9ybWF0RGF0ZScsXG4gICAgICAgICAgJ2Zvcm1hdERhdGVUaW1lJyxcbiAgICAgICAgICAnZm9ybWF0TW9uZXknLFxuICAgICAgICAgICdmb3JtYXROdW1iZXInLFxuICAgICAgICAgICdpc0VtYWlsJyxcbiAgICAgICAgICAnaXNQaG9uZScsXG4gICAgICAgICAgJ3N0b3JhZ2UnLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxuXG4gICAgZXNsaW50cmM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgIH0sXG5cbiAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU5ODlEXHU1OTE2XHU3Njg0XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHVGRjA5XG4gICAqL1xuICBleHRyYURpcnM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgKi9cbiAgaW5jbHVkZVNoYXJlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENvbXBvbmVudHMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudHNDb25maWcob3B0aW9uczogQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGV4dHJhRGlycyA9IFtdLCBpbmNsdWRlU2hhcmVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBjb25zdCBkaXJzID0gW1xuICAgICdzcmMvY29tcG9uZW50cycsIC8vIFx1NUU5NFx1NzUyOFx1N0VBN1x1N0VDNFx1NEVGNlxuICAgIC4uLmV4dHJhRGlycywgLy8gXHU5ODlEXHU1OTE2XHU3Njg0XHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XG4gIF07XG5cbiAgLy8gXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHVGRjBDXHU2REZCXHU1MkEwXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIGlmIChpbmNsdWRlU2hhcmVkKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XG4gICAgZGlycy5wdXNoKFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Jhc2ljJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9sYXlvdXQnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Zvcm0nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2RhdGEnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2ZlZWRiYWNrJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9vdGhlcnMnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBDb21wb25lbnRzKHtcbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIHJlbG9hZGluZ1xuICAgICAgfSksXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5RTNcdTY3OTBcdTU2NjhcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICBpZiAoY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdCdGMnKSB8fCBjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBjb21wb25lbnROYW1lLFxuICAgICAgICAgICAgZnJvbTogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSxcbiAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICBkaXJzLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLCAvLyBcdTY1MkZcdTYzMDEgLnZ1ZSBcdTU0OEMgLnRzeCBcdTY1ODdcdTRFRjZcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcbiAgICBkZWVwOiB0cnVlLFxuICAgIC8vIFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOSBCdGMgXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XG4gICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnRzeCQvLCAvQnRjW0EtWl0vLCAvYnRjLVthLXpdL10sXG4gIH0pO1xufVxuLy8gVVRGLTggZW5jb2RpbmcgZml4XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcblxuLy8gVml0ZSBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTdDN0JcdTU3OEJcbmludGVyZmFjZSBQcm94eU9wdGlvbnMge1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hhbmdlT3JpZ2luPzogYm9vbGVhbjtcbiAgc2VjdXJlPzogYm9vbGVhbjtcbiAgY29uZmlndXJlPzogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4gdm9pZDtcbn1cblxuY29uc3QgcHJveHk6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IFByb3h5T3B0aW9ucz4gPSB7XG4gICcvYXBpJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIC8vIFx1NEUwRFx1NTE4RFx1NjZGRlx1NjM2Mlx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEY2Q1x1NTNEMSAvYXBpIFx1NTIzMFx1NTQwRVx1N0FFRlx1RkYwOFx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXHVGRjA5XG4gICAgLy8gcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hZG1pbicpIC8vIFx1NURGMlx1NzlGQlx1OTY2NFx1RkYxQVx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXG4gICAgLy8gXHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU2REZCXHU1MkEwIENPUlMgXHU1OTM0XG4gICAgY29uZmlndXJlOiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB7XG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTU0Q0RcdTVFOTRcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBpZiAocHJveHlSZXMuaGVhZGVycykge1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddID0gb3JpZ2luIGFzIHN0cmluZztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyddID0gJ3RydWUnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUyc7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ10gfHwgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSByZXF1ZXN0SGVhZGVycyBhcyBzdHJpbmc7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIFNldC1Db29raWUgXHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU3ODZFXHU0RkREXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHU2NUY2IGNvb2tpZSBcdTgwRkRcdTU5MUZcdTZCNjNcdTc4NkVcdThCQkVcdTdGNkVcbiAgICAgICAgICAvLyBcdTU3MjhcdTk4ODRcdTg5QzhcdTZBMjFcdTVGMEZcdTRFMEJcdUZGMDhcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdUZGMDlcdUZGMENcdTk3MDBcdTg5ODFcdThCQkVcdTdGNkUgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXG4gICAgICAgICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddO1xuICAgICAgICAgIGlmIChzZXRDb29raWVIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb2tpZXMgPSBBcnJheS5pc0FycmF5KHNldENvb2tpZUhlYWRlcikgPyBzZXRDb29raWVIZWFkZXIgOiBbc2V0Q29va2llSGVhZGVyXTtcbiAgICAgICAgICAgIGNvbnN0IGZpeGVkQ29va2llcyA9IGNvb2tpZXMubWFwKChjb29raWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUMgY29va2llIFx1NEUwRFx1NTMwNVx1NTQyQiBTYW1lU2l0ZVx1RkYwQ1x1NjIxNlx1ODAwNSBTYW1lU2l0ZSBcdTRFMERcdTY2MkYgTm9uZVx1RkYwQ1x1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFxuICAgICAgICAgICAgICBpZiAoIWNvb2tpZS5pbmNsdWRlcygnU2FtZVNpdGU9Tm9uZScpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU3M0IwXHU2NzA5XHU3Njg0IFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgIGxldCBmaXhlZENvb2tpZSA9IGNvb2tpZS5yZXBsYWNlKC87XFxzKlNhbWVTaXRlPShTdHJpY3R8TGF4fE5vbmUpL2dpLCAnJyk7XG4gICAgICAgICAgICAgICAgLy8gXHU2REZCXHU1MkEwIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVx1RkYwOFx1NUJGOVx1NEU4RVx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1RkYwOVxuICAgICAgICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVNlY3VyZSBcdTk3MDBcdTg5ODEgSFRUUFNcdUZGMENcdTRGNDZcdTU3MjhcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU2MjExXHU0RUVDXHU0RUNEXHU3MTM2XHU2REZCXHU1MkEwXHU1QjgzXG4gICAgICAgICAgICAgICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU0RjFBXHU1RkZEXHU3NTY1IFNlY3VyZVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTM0Rlx1OEJBRVx1NjYyRiBIVFRQXHVGRjA5XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlJztcbiAgICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGNvb2tpZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddID0gZml4ZWRDb29raWVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBcdThCQjBcdTVGNTVcdTU0MEVcdTdBRUZcdTU0Q0RcdTVFOTRcdTcyQjZcdTYwMDFcbiAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgJiYgcHJveHlSZXMuc3RhdHVzQ29kZSA+PSA1MDApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUHJveHldIEJhY2tlbmQgcmV0dXJuZWQgJHtwcm94eVJlcy5zdGF0dXNDb2RlfSBmb3IgJHtyZXEubWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnKTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcdUZGMUFcdTY1RTBcdTZDRDVcdThGREVcdTYzQTVcdTUyMzBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjggaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU0RUUzXHU3NDA2XHU4QkY3XHU2QzQyXHVGRjA4XHU3NTI4XHU0RThFXHU4QzAzXHU4QkQ1XHVGRjA5XG4gICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXE6IGFueSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtQcm94eV0gJHtyZXEubWV0aG9kfSAke3JlcS51cmx9IC0+IGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUke3JlcS51cmx9YCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG59O1xuXG5leHBvcnQgeyBwcm94eSB9O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhcHAtZW52LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTdFREZcdTRFMDBcdTc2ODRcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OTBGRFx1NEVDRVx1OEZEOVx1OTFDQ1x1OEJGQlx1NTNENlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEU4Q1x1NEU0OVx1NjAyN1xuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwRW52Q29uZmlnIHtcbiAgYXBwTmFtZTogc3RyaW5nO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIGRldlBvcnQ6IHN0cmluZztcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcmVQb3J0OiBzdHJpbmc7XG4gIHByb2RIb3N0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfRU5WX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODAnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgwJyxcbiAgICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbG9naXN0aWNzLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODInLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncXVhbGl0eS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgzJyxcbiAgICBwcm9kSG9zdDogJ3F1YWxpdHkuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncHJvZHVjdGlvbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg0JyxcbiAgICBwcm9kSG9zdDogJ3Byb2R1Y3Rpb24uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZW5naW5lZXJpbmctYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgcHJvZEhvc3Q6ICdlbmdpbmVlcmluZy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdmaW5hbmNlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODYnLFxuICAgIHByb2RIb3N0OiAnZmluYW5jZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgcHJvZEhvc3Q6ICdtb2JpbGUuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0KTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlLWFwcC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlLWFwcC1jb25maWcudHNcIjsvKipcclxuICogVml0ZSBcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcclxuICogXHU3NTI4XHU0RThFXHU0RUNFXHU3RURGXHU0RTAwXHU5MTREXHU3RjZFXHU0RTJEXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnLCB0eXBlIEFwcEVudkNvbmZpZyB9IGZyb20gJy4vYXBwLWVudi5jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1RkYwOFx1NzUyOFx1NEU4RSB2aXRlLmNvbmZpZy50c1x1RkYwOVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZpdGVBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKToge1xyXG4gIGRldlBvcnQ6IG51bWJlcjtcclxuICBkZXZIb3N0OiBzdHJpbmc7XHJcbiAgcHJlUG9ydDogbnVtYmVyO1xyXG4gIHByZUhvc3Q6IHN0cmluZztcclxuICBwcm9kSG9zdDogc3RyaW5nO1xyXG4gIG1haW5BcHBPcmlnaW46IHN0cmluZztcclxufSB7XHJcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xyXG4gIGlmICghYXBwQ29uZmlnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldEFwcENvbmZpZygnc3lzdGVtLWFwcCcpO1xyXG4gIGNvbnN0IG1haW5BcHBPcmlnaW4gPSBtYWluQXBwQ29uZmlnXHJcbiAgICA/IGBodHRwOi8vJHttYWluQXBwQ29uZmlnLnByZUhvc3R9OiR7bWFpbkFwcENvbmZpZy5wcmVQb3J0fWBcclxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxyXG4gICAgZGV2SG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXHJcbiAgICBwcmVQb3J0OiBwYXJzZUludChhcHBDb25maWcucHJlUG9ydCwgMTApLFxyXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXHJcbiAgICBwcm9kSG9zdDogYXBwQ29uZmlnLnByb2RIb3N0LFxyXG4gICAgbWFpbkFwcE9yaWdpbixcclxuICB9O1xyXG59XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBaLFNBQVMsb0JBQW9CO0FBQ3ZiLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsU0FBUyxZQUFZLG9CQUFvQjtBQUN6QyxTQUFTLGVBQWU7QUFFeEIsU0FBUyxXQUFXOzs7QUNGcEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFLN0IsU0FBUyx5QkFBeUI7QUFDdkMsU0FBTyxXQUFXO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxRQUNFLG9CQUFvQjtBQUFBLFVBQ2xCO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsUUFDQSxxQkFBcUI7QUFBQSxVQUNuQjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsV0FBVztBQUFBLE1BQ1Qsb0JBQW9CO0FBQUEsUUFDbEIsYUFBYTtBQUFBO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsS0FBSztBQUFBLElBRUwsVUFBVTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUVBLGFBQWE7QUFBQSxFQUNmLENBQUM7QUFDSDtBQWlCTyxTQUFTLHVCQUF1QixVQUFtQyxDQUFDLEdBQUc7QUFDNUUsUUFBTSxFQUFFLFlBQVksQ0FBQyxHQUFHLGdCQUFnQixLQUFLLElBQUk7QUFFakQsUUFBTSxPQUFPO0FBQUEsSUFDWDtBQUFBO0FBQUEsSUFDQSxHQUFHO0FBQUE7QUFBQSxFQUNMO0FBR0EsTUFBSSxlQUFlO0FBRWpCLFNBQUs7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R0FBRyw2QkFBNkIsSUFBSSxHQUFHLEVBQUU7QUFBQSxNQUNwRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjs7O0FDL0RPLElBQU0sa0JBQWtDO0FBQUEsRUFDN0M7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztB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
