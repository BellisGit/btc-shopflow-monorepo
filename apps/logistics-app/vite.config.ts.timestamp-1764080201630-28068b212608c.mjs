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
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\logistics-app";
var proxy2 = proxy;
var appConfig = getAppConfig("logistics-app");
if (!appConfig) {
  throw new Error("\u672A\u627E\u5230 logistics-app \u7684\u73AF\u5883\u914D\u7F6E");
}
var APP_PORT = parseInt(appConfig.prePort, 10);
var APP_HOST = appConfig.preHost;
var MAIN_APP_CONFIG = getAppConfig("system-app");
var MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : "http://localhost:4180";
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
    },
    dedupe: ["element-plus", "@element-plus/icons-vue", "vue", "vue-router", "pinia", "dayjs"]
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
    qiankun("logistics", {
      useDevMode: true
    })
  ],
  server: {
    port: parseInt(appConfig.devPort, 10),
    host: "0.0.0.0",
    strictPort: false,
    proxy: proxy2,
    cors: {
      origin: "*",
      // 开发环境允许所有跨域（生产环境替换为主应用域名）
      methods: ["GET", "POST", "OPTIONS", "HEAD"],
      allowedHeaders: ["Content-Type", "Access-Control-Allow-Origin"],
      exposedHeaders: ["Access-Control-Allow-Origin"]
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    },
    hmr: {
      protocol: "ws",
      host: appConfig.devHost,
      // HMR WebSocket 需要使用配置的主机，浏览器无法连接 0.0.0.0
      port: parseInt(appConfig.devPort, 10),
      overlay: false
      // 关闭热更新错误浮层，减少开销
    },
    fs: {
      strict: false,
      allow: [
        resolve(__vite_injected_original_dirname, "../.."),
        resolve(__vite_injected_original_dirname, "../../packages"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-components/src")
      ],
      // 启用缓存，加速依赖加载
      cachedChecks: true
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
    target: "es2020",
    // 兼容 ES 模块的最低目标
    sourcemap: false,
    // 开发环境关闭 sourcemap，减少文件体积和加载时间
    rollupOptions: {
      output: {
        format: "esm",
        // 明确指定输出格式为 ESM
        manualChunks(id) {
          if (id.includes("element-plus") || id.includes("@element-plus")) {
            return "element-plus";
          }
          if (id.includes("src/") && !id.includes("node_modules")) {
            if (id.includes("src/modules")) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ["customs", "home", "procurement", "warehouse"].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              return "module-others";
            }
            if (id.includes("src/pages")) {
              return "app-pages";
            }
            if (id.includes("src/components")) {
              return "app-components";
            }
            if (id.includes("src/micro")) {
              return "app-micro";
            }
            if (id.includes("src/plugins")) {
              return "app-src";
            }
            if (id.includes("src/store")) {
              return "app-src";
            }
            if (id.includes("src/services")) {
              return "app-src";
            }
            if (id.includes("src/utils")) {
              return "app-src";
            }
            if (id.includes("src/composables")) {
              return "app-composables";
            }
            if (id.includes("src/bootstrap")) {
              return "app-src";
            }
            if (id.includes("src/config")) {
              return "app-src";
            }
            if (id.includes("src/router")) {
              return "app-router";
            }
            if (id.includes("src/i18n")) {
              return "app-i18n";
            }
            if (id.includes("src/assets")) {
              return "app-assets";
            }
            if (id.includes("src/types")) {
              return "app-src";
            }
            return "app-src";
          }
          if (id.includes("@btc/shared-")) {
            if (id.includes("@btc/shared-components")) {
              return "btc-components";
            }
            return "btc-shared";
          }
          if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/pinia")) {
            return "vue-vendor";
          }
          if (id.includes("node_modules/axios")) {
            return "utils-http";
          }
          if (id.includes("node_modules/@vueuse")) {
            return "utils-vueuse";
          }
          if (id.includes("node_modules/dayjs") || id.includes("node_modules/moment")) {
            return "utils-date";
          }
          if (id.includes("node_modules/lodash") || id.includes("node_modules/lodash-es")) {
            return "utils-lodash";
          }
          if (id.includes("node_modules")) {
            if (id.includes("vue-i18n") || id.includes("@intlify")) {
              return "vue-i18n";
            }
            if (id.includes("xlsx")) {
              return "file-xlsx";
            }
            if (id.includes("file-saver")) {
              return "file-saver";
            }
            if (id.includes("qiankun")) {
              return "qiankun";
            }
            if (id.includes("echarts")) {
              return "lib-echarts";
            }
            return "vendor";
          }
          return void 0;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 2e3
    // 提高警告阈值，element-plus chunk 较大是正常的
  },
  optimizeDeps: {
    // 启用依赖预构建，加速开发环境模块加载
    // 显式声明需要预构建的第三方依赖，避免 Vite 漏判导致实时编译耗时
    include: [
      "vue",
      "vue-router",
      "pinia",
      "dayjs",
      "element-plus",
      "@element-plus/icons-vue",
      "@btc/shared-core",
      "@btc/shared-components",
      "@btc/shared-utils"
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // 强制预构建，即使依赖已经是最新的
    force: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHMiLCAiLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxsb2dpc3RpY3MtYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbG9naXN0aWNzLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2xvZ2lzdGljcy1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgYnRjIH0gZnJvbSAnQGJ0Yy92aXRlLXBsdWdpbic7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgcHJveHkgYXMgbWFpblByb3h5IH0gZnJvbSAnLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHknO1xuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbmNvbnN0IHByb3h5ID0gbWFpblByb3h5O1xuXG4vLyBcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbmNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZygnbG9naXN0aWNzLWFwcCcpO1xuaWYgKCFhcHBDb25maWcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYyN0VcdTUyMzAgbG9naXN0aWNzLWFwcCBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkUnKTtcbn1cblxuLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU5ODg0XHU4OUM4XHU3QUVGXHU1M0UzXHU1NDhDXHU0RTNCXHU2NzNBXHVGRjA4XHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4XHVGRjA5XG5jb25zdCBBUFBfUE9SVCA9IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCk7XG5jb25zdCBBUFBfSE9TVCA9IGFwcENvbmZpZy5wcmVIb3N0O1xuY29uc3QgTUFJTl9BUFBfQ09ORklHID0gZ2V0QXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XG5jb25zdCBNQUlOX0FQUF9PUklHSU4gPSBNQUlOX0FQUF9DT05GSUcgPyBgaHR0cDovLyR7TUFJTl9BUFBfQ09ORklHLnByZUhvc3R9OiR7TUFJTl9BUFBfQ09ORklHLnByZVBvcnR9YCA6ICdodHRwOi8vbG9jYWxob3N0OjQxODAnO1xuXG4vLyBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBjcmVkZW50aWFsc1x1RkYwOVxuY29uc3QgY29yc1BsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICAvLyBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlx1NTFGRFx1NjU3MFx1RkYwOFx1NzUyOFx1NEU4RVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICBjb25zdCBjb3JzRGV2TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcbiAgICBcbiAgICAvLyBcdThCQkVcdTdGNkUgQ09SUyBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTYyNDBcdTY3MDlcdThCRjdcdTZDNDJcdTkwRkRcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgLy8gQ2hyb21lIFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1ODk4MVx1NkM0Mlx1RkYwOFx1NEVDNVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IG9yaWdpblx1RkYwQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NTdGQVx1NjcyQ1x1NzY4NCBDT1JTIFx1NTkzNFx1RkYwOFx1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1Njc2NVx1NkU5MFx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIC8vIENocm9tZSBcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTg5ODFcdTZDNDJcdUZGMDhcdTRFQzVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MiAtIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NEVGQlx1NEY1NVx1NTE3Nlx1NEVENlx1NTkwNFx1NzQwNlx1NEU0Qlx1NTI0RFx1OEZENFx1NTZERVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgLy8gQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcdTUxRkRcdTY1NzBcdUZGMDhcdTc1MjhcdTRFOEVcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTU5MzRcdUZGMDlcbiAgY29uc3QgY29yc1ByZXZpZXdNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIFxuICAgIC8vIFx1OEJCRVx1N0Y2RSBDT1JTIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NjI0MFx1NjcwOVx1OEJGN1x1NkM0Mlx1OTBGRFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSBvcmlnaW5cdUZGMENcdTRFNUZcdThCQkVcdTdGNkVcdTU3RkFcdTY3MkNcdTc2ODQgQ09SUyBcdTU5MzRcdUZGMDhcdTUxNDFcdThCQjhcdTYyNDBcdTY3MDlcdTY3NjVcdTZFOTBcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MiAtIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NEVGQlx1NEY1NVx1NTE3Nlx1NEVENlx1NTkwNFx1NzQwNlx1NEU0Qlx1NTI0RFx1OEZENFx1NTZERVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY29ycy13aXRoLWNyZWRlbnRpYWxzJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMUFcdTUzMDVcdTU0MkJcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTU5MzRcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvcnNEZXZNaWRkbGV3YXJlKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY29uZmlndXJlUHJldmlld1NlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYxQVx1NEUwRFx1NTMwNVx1NTQyQlx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29yc1ByZXZpZXdNaWRkbGV3YXJlKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFiYXNlIFx1NjMwN1x1NTQxMVx1NUI1MFx1NUU5NFx1NzUyOFx1NjcyQ1x1NTczMFx1OTg4NFx1ODlDOFx1NzY4NFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NUZDNVx1OTg3Qlx1NUUyNlx1NjcyQlx1NUMzRSAvXHVGRjA5XG4gIC8vIFx1OEZEOVx1NjgzN1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1NEYxQVx1NTdGQVx1NEU4RVx1OEZEOVx1NEUyQSBiYXNlIFVSTFxuICBiYXNlOiBgaHR0cDovLyR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9L2AsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgICAgJ0BzZXJ2aWNlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NlcnZpY2VzJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC11dGlscy9zcmMnKSxcbiAgICAgICdAYnRjLWNvbW1vbic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbW1vbicpLFxuICAgICAgJ0BidGMtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAYnRjLWNydWQnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jcnVkJyksXG4gICAgICAnQGFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxuICAgICAgLy8gXHU1NkZFXHU4ODY4XHU3NkY4XHU1MTczXHU1MjJCXHU1NDBEXHVGRjA4XHU1MTc3XHU0RjUzXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU2NTNFXHU1NzI4XHU1MjREXHU5NzYyXHVGRjBDXHU3ODZFXHU0RkREXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXHVGRjBDXHU1M0JCXHU2Mzg5IC50cyBcdTYyNjlcdTVDNTVcdTU0MERcdThCQTkgVml0ZSBcdTgxRUFcdTUyQThcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhcicpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMvY29sb3InOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3InKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50JzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2dyYWRpZW50JyksXG4gICAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcpLFxuICAgICAgJ0BjaGFydHMtdHlwZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMnKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzJyksXG4gICAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcycpLFxuICAgIH0sXG4gICAgZGVkdXBlOiBbJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsICd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdkYXlqcyddLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgY29yc1BsdWdpbigpLCAvLyBcdTZERkJcdTUyQTAgQ09SUyBcdTYzRDJcdTRFRjZcdUZGMENcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHNcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGZzOiB7XG4gICAgICAgICAgZmlsZUV4aXN0czogZXhpc3RzU3luYyxcbiAgICAgICAgICByZWFkRmlsZTogKGZpbGU6IHN0cmluZykgPT4gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKHsgaW5jbHVkZVNoYXJlZDogdHJ1ZSB9KSxcbiAgICBjcmVhdGVDb21wb25lbnRzQ29uZmlnKHsgaW5jbHVkZVNoYXJlZDogdHJ1ZSB9KSxcbiAgICBidGMoe1xuICAgICAgdHlwZTogJ3N1YmFwcCcsXG4gICAgICBwcm94eSxcbiAgICAgIGVwczoge1xuICAgICAgICBlbmFibGU6IHRydWUsXG4gICAgICAgIGRpc3Q6ICcuL2J1aWxkL2VwcycsXG4gICAgICAgIGFwaTogJy9hcGkvbG9naW4vZXBzL2NvbnRyYWN0JyxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgcWlhbmt1bignbG9naXN0aWNzJywge1xuICAgICAgdXNlRGV2TW9kZTogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogcGFyc2VJbnQoYXBwQ29uZmlnLmRldlBvcnQsIDEwKSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXG4gICAgcHJveHksXG4gICAgY29yczoge1xuICAgICAgb3JpZ2luOiAnKicsIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1OERFOFx1NTdERlx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NjZGRlx1NjM2Mlx1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFx1NTdERlx1NTQwRFx1RkYwOVxuICAgICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdPUFRJT05TJywgJ0hFQUQnXSxcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nXSxcbiAgICAgIGV4cG9zZWRIZWFkZXJzOiBbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddLFxuICAgIH0sXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsIC8vIEhNUiBXZWJTb2NrZXQgXHU5NzAwXHU4OTgxXHU0RjdGXHU3NTI4XHU5MTREXHU3RjZFXHU3Njg0XHU0RTNCXHU2NzNBXHVGRjBDXHU2RDRGXHU4OUM4XHU1NjY4XHU2NUUwXHU2Q0Q1XHU4RkRFXHU2M0E1IDAuMC4wLjBcbiAgICAgIHBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXG4gICAgICBvdmVybGF5OiBmYWxzZSwgLy8gXHU1MTczXHU5NUVEXHU3MEVEXHU2NkY0XHU2NUIwXHU5NTE5XHU4QkVGXHU2RDZFXHU1QzQyXHVGRjBDXHU1MUNGXHU1QzExXHU1RjAwXHU5NTAwXG4gICAgfSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgIGFsbG93OiBbXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKSxcbiAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcycpLFxuICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxuICAgICAgXSxcbiAgICAgIC8vIFx1NTQyRlx1NzUyOFx1N0YxM1x1NUI1OFx1RkYwQ1x1NTJBMFx1OTAxRlx1NEY5RFx1OEQ1Nlx1NTJBMFx1OEY3RFxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxuICAgIH0sXG4gIH0sXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVx1RkYwOFx1NTQyRlx1NTJBOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzY4NFx1OTc1OVx1NjAwMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogQVBQX1BPUlQsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgLy8gXHU3QUVGXHU1M0UzXHU4OEFCXHU1MzYwXHU3NTI4XHU2NUY2XHU2MkE1XHU5NTE5XHVGRjBDXHU5MDdGXHU1MTREXHU4MUVBXHU1MkE4XHU1MjA3XHU2MzYyXG4gICAgb3BlbjogZmFsc2UsIC8vIFx1NTQyRlx1NTJBOFx1NTQwRVx1NEUwRFx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwcm94eSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAvLyBcdTUxNDFcdThCQjhcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDg0MTgwXHVGRjA5XHU4REU4XHU1N0RGXHU4QkJGXHU5NUVFXHU1RjUzXHU1MjREXHU1QjUwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogTUFJTl9BUFBfT1JJR0lOLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICAgIGhpc3RvcnlBcGlGYWxsYmFjazogdHJ1ZSwgLy8gXHU2NTJGXHU2MzAxXHU1MzU1XHU5ODc1XHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHVGRjA4XHU5MDdGXHU1MTREXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU3NTMxXHU1MjM3XHU2NUIwIDQwNFx1RkYwOVxuICB9LFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaScsICdpbXBvcnQnXVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLCAvLyBcdTUxN0NcdTVCQjkgRVMgXHU2QTIxXHU1NzU3XHU3Njg0XHU2NzAwXHU0RjRFXHU3NkVFXHU2ODA3XG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1MTczXHU5NUVEIHNvdXJjZW1hcFx1RkYwQ1x1NTFDRlx1NUMxMVx1NjU4N1x1NEVGNlx1NEY1M1x1NzlFRlx1NTQ4Q1x1NTJBMFx1OEY3RFx1NjVGNlx1OTVGNFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmb3JtYXQ6ICdlc20nLCAvLyBcdTY2MEVcdTc4NkVcdTYzMDdcdTVCOUFcdThGOTNcdTUxRkFcdTY4M0NcdTVGMEZcdTRFM0EgRVNNXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIC8vIFx1OTFDRFx1ODk4MVx1RkYxQUVsZW1lbnQgUGx1cyBcdTc2ODRcdTUzMzlcdTkxNERcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDkgZWxlbWVudC1wbHVzIFx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1OTBGRFx1NTcyOFx1NTQwQ1x1NEUwMFx1NEUyQSBjaHVua1xuICAgICAgICAgIC8vIFx1OTA3Rlx1NTE0RCBWaXRlIFx1NzY4NFx1ODFFQVx1NTJBOFx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1NUMwNiBlbGVtZW50LXBsdXMgXHU1MjA2XHU1MjcyXHU2MjEwXHU1OTFBXHU0RTJBIGNodW5rXHVGRjA4XHU1OTgyIGVsZW1lbnQtbGF5b3V0XHUzMDAxZWxlbWVudC1kYXRhXHUzMDAxZWxlbWVudC1mZWVkYmFjayBcdTdCNDlcdUZGMDlcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8IGlkLmluY2x1ZGVzKCdAZWxlbWVudC1wbHVzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZWxlbWVudC1wbHVzJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy8nKSAmJiAhaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IGlkLm1hdGNoKC9zcmNcXC9tb2R1bGVzXFwvKFteL10rKS8pPy5bMV07XG4gICAgICAgICAgICAgIGlmIChtb2R1bGVOYW1lICYmIFsnY3VzdG9tcycsICdob21lJywgJ3Byb2N1cmVtZW50JywgJ3dhcmVob3VzZSddLmluY2x1ZGVzKG1vZHVsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBtb2R1bGUtJHttb2R1bGVOYW1lfWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuICdtb2R1bGUtb3RoZXJzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BhZ2VzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtcGFnZXMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvY29tcG9uZW50cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLWNvbXBvbmVudHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvbWljcm8nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1taWNybyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9wbHVnaW5zJykpIHtcbiAgICAgICAgICAgICAgLy8gXHU2M0QyXHU0RUY2XHU0RTBFIGJvb3RzdHJhcCBcdTY3MDlcdTRGOURcdThENTZcdTUxNzNcdTdDRkJcdUZGMDhib290c3RyYXAgXHU0RjFBXHU2MjZCXHU2M0NGXHU2M0QyXHU0RUY2XHVGRjA5XHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9zdG9yZScpKSB7XG4gICAgICAgICAgICAgIC8vIHN0b3JlIFx1NEUwRSBib290c3RyYXAgXHU2NzA5XHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9zZXJ2aWNlcycpKSB7XG4gICAgICAgICAgICAgIC8vIHNlcnZpY2VzIFx1NEUwRSBib290c3RyYXAgXHU2NzA5XHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy91dGlscycpKSB7XG4gICAgICAgICAgICAgIC8vIHV0aWxzIFx1NEUwRSBib290c3RyYXAgXHU2NzA5XHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9jb21wb3NhYmxlcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLWNvbXBvc2FibGVzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2Jvb3RzdHJhcCcpKSB7XG4gICAgICAgICAgICAgIC8vIGJvb3RzdHJhcCBcdTRFMEVcdTU5MUFcdTRFMkFcdTZBMjFcdTU3NTdcdTY3MDlcdTRGOURcdThENTZcdTUxNzNcdTdDRkJcdUZGMENcdTY1M0VcdTU3MjggYXBwLXNyYyBcdTRFMkRcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbmZpZycpKSB7XG4gICAgICAgICAgICAgIC8vIGNvbmZpZyBcdTUzRUZcdTgwRkRcdTRGOURcdThENTYgcGx1Z2luc1x1RkYwQ1x1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvcm91dGVyJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtcm91dGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2kxOG4nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1pMThuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2Fzc2V0cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLWFzc2V0cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy90eXBlcycpKSB7XG4gICAgICAgICAgICAgIC8vIHR5cGVzIFx1OTAxQVx1NUUzOFx1NUY4OFx1NUMwRlx1RkYwQ1x1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1N0E3QSBjaHVua1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLScpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2J0Yy1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYnRjLXNoYXJlZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtcm91dGVyJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9waW5pYScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3Z1ZS12ZW5kb3InO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2F4aW9zJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndXRpbHMtaHR0cCc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd1dGlscy12dWV1c2UnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbW9tZW50JykpIHtcbiAgICAgICAgICAgIHJldHVybiAndXRpbHMtZGF0ZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xvZGFzaCcpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbG9kYXNoLWVzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndXRpbHMtbG9kYXNoJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZS1pMThuJykgfHwgaWQuaW5jbHVkZXMoJ0BpbnRsaWZ5JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2dWUtaTE4bic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3hsc3gnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2ZpbGUteGxzeCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZpbGUtc2F2ZXInKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2ZpbGUtc2F2ZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdxaWFua3VuJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdxaWFua3VuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZWNoYXJ0cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbGliLWVjaGFydHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLCAvLyBcdTYzRDBcdTlBRDhcdThCNjZcdTU0NEFcdTk2MDhcdTUwM0NcdUZGMENlbGVtZW50LXBsdXMgY2h1bmsgXHU4RjgzXHU1OTI3XHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIC8vIFx1NTQyRlx1NzUyOFx1NEY5RFx1OEQ1Nlx1OTg4NFx1Njc4NFx1NUVGQVx1RkYwQ1x1NTJBMFx1OTAxRlx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFxuICAgIC8vIFx1NjYzRVx1NUYwRlx1NThGMFx1NjYwRVx1OTcwMFx1ODk4MVx1OTg4NFx1Njc4NFx1NUVGQVx1NzY4NFx1N0IyQ1x1NEUwOVx1NjVCOVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIFx1NkYwRlx1NTIyNFx1NUJGQ1x1ODFGNFx1NUI5RVx1NjVGNlx1N0YxNlx1OEJEMVx1ODAxN1x1NjVGNlxuICAgIGluY2x1ZGU6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgICdkYXlqcycsXG4gICAgICAnZWxlbWVudC1wbHVzJyxcbiAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZScsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgIF0sXG4gICAgLy8gXHU2MzkyXHU5NjY0XHU0RTBEXHU5NzAwXHU4OTgxXHU5ODg0XHU2Nzg0XHU1RUZBXHU3Njg0XHU0RjlEXHU4RDU2XG4gICAgZXhjbHVkZTogW10sXG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5ODg0XHU2Nzg0XHU1RUZBXHVGRjBDXHU1MzczXHU0RjdGXHU0RjlEXHU4RDU2XHU1REYyXHU3RUNGXHU2NjJGXHU2NzAwXHU2NUIwXHU3Njg0XG4gICAgZm9yY2U6IGZhbHNlLFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGF1dG8taW1wb3J0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2F1dG8taW1wb3J0LmNvbmZpZy50c1wiO1x1RkVGRi8qKlxuICogXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXHU2QTIxXHU2NzdGXG4gKiBcdTRGOUJcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdUZGMDhhZG1pbi1hcHAsIGxvZ2lzdGljcy1hcHAgXHU3QjQ5XHVGRjA5XHU0RjdGXHU3NTI4XG4gKi9cbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQXV0byBJbXBvcnQgXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCkge1xuICByZXR1cm4gQXV0b0ltcG9ydCh7XG4gICAgaW1wb3J0czogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAge1xuICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IFtcbiAgICAgICAgICAndXNlQ3J1ZCcsXG4gICAgICAgICAgJ3VzZURpY3QnLFxuICAgICAgICAgICd1c2VQZXJtaXNzaW9uJyxcbiAgICAgICAgICAndXNlUmVxdWVzdCcsXG4gICAgICAgICAgJ2NyZWF0ZUkxOG5QbHVnaW4nLFxuICAgICAgICAgICd1c2VJMThuJyxcbiAgICAgICAgXSxcbiAgICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogW1xuICAgICAgICAgICdmb3JtYXREYXRlJyxcbiAgICAgICAgICAnZm9ybWF0RGF0ZVRpbWUnLFxuICAgICAgICAgICdmb3JtYXRNb25leScsXG4gICAgICAgICAgJ2Zvcm1hdE51bWJlcicsXG4gICAgICAgICAgJ2lzRW1haWwnLFxuICAgICAgICAgICdpc1Bob25lJyxcbiAgICAgICAgICAnc3RvcmFnZScsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVxuICAgICAgfSksXG4gICAgXSxcblxuICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXG5cbiAgICBlc2xpbnRyYzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZpbGVwYXRoOiAnLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvbicsXG4gICAgfSxcblxuICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTk4OURcdTU5MTZcdTc2ODRcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdUZGMDlcbiAgICovXG4gIGV4dHJhRGlycz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1XHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXG4gICAqL1xuICBpbmNsdWRlU2hhcmVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ29tcG9uZW50cyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50c0NvbmZpZyhvcHRpb25zOiBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgZXh0cmFEaXJzID0gW10sIGluY2x1ZGVTaGFyZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGRpcnMgPSBbXG4gICAgJ3NyYy9jb21wb25lbnRzJywgLy8gXHU1RTk0XHU3NTI4XHU3RUE3XHU3RUM0XHU0RUY2XG4gICAgLi4uZXh0cmFEaXJzLCAvLyBcdTk4OURcdTU5MTZcdTc2ODRcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgXTtcblxuICAvLyBcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkJcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdUZGMENcdTZERkJcdTUyQTBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcbiAgaWYgKGluY2x1ZGVTaGFyZWQpIHtcbiAgICAvLyBcdTZERkJcdTUyQTBcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcdUZGMENcdTY1MkZcdTYzMDFcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcbiAgICBkaXJzLnB1c2goXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvYmFzaWMnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2xheW91dCcsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbmF2aWdhdGlvbicsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZm9ybScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZGF0YScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZmVlZGJhY2snLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL290aGVycydcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIENvbXBvbmVudHMoe1xuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREIFZpdGUgcmVsb2FkaW5nXG4gICAgICB9KSxcbiAgICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1ODlFM1x1Njc5MFx1NTY2OFx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHNcbiAgICAgIChjb21wb25lbnROYW1lKSA9PiB7XG4gICAgICAgIGlmIChjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ0J0YycpIHx8IGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnYnRjLScpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IGNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICBmcm9tOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdLFxuICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxuICAgIGRpcnMsXG4gICAgZXh0ZW5zaW9uczogWyd2dWUnLCAndHN4J10sIC8vIFx1NjUyRlx1NjMwMSAudnVlIFx1NTQ4QyAudHN4IFx1NjU4N1x1NEVGNlxuICAgIC8vIFx1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlxuICAgIGRlZXA6IHRydWUsXG4gICAgLy8gXHU1MzA1XHU1NDJCXHU2MjQwXHU2NzA5IEJ0YyBcdTVGMDBcdTU5MzRcdTc2ODRcdTdFQzRcdTRFRjZcbiAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudHN4JC8sIC9CdGNbQS1aXS8sIC9idGMtW2Etel0vXSxcbiAgfSk7XG59XG4vLyBVVEYtOCBlbmNvZGluZyBmaXhcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eS50c1wiO2ltcG9ydCB0eXBlIHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuXG4vLyBWaXRlIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVx1N0M3Qlx1NTc4QlxuaW50ZXJmYWNlIFByb3h5T3B0aW9ucyB7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGFuZ2VPcmlnaW4/OiBib29sZWFuO1xuICBzZWN1cmU/OiBib29sZWFuO1xuICBjb25maWd1cmU/OiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkO1xufVxuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUHJveHlPcHRpb25zPiA9IHtcbiAgJy9hcGknOiB7XG4gICAgdGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgLy8gXHU0RTBEXHU1MThEXHU2NkZGXHU2MzYyXHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU4RjZDXHU1M0QxIC9hcGkgXHU1MjMwXHU1NDBFXHU3QUVGXHVGRjA4XHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcdUZGMDlcbiAgICAvLyByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnL2FkbWluJykgLy8gXHU1REYyXHU3OUZCXHU5NjY0XHVGRjFBXHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTZERkJcdTUyQTAgQ09SUyBcdTU5MzRcbiAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NEVFM1x1NzQwNlx1NTRDRFx1NUU5NFxuICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzOiBJbmNvbWluZ01lc3NhZ2UsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKic7XG4gICAgICAgIGlmIChwcm94eVJlcy5oZWFkZXJzKSB7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSBvcmlnaW4gYXMgc3RyaW5nO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAndHJ1ZSc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyddID0gJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJztcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IHJlcS5oZWFkZXJzWydhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LWhlYWRlcnMnXSB8fCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnXSA9IHJlcXVlc3RIZWFkZXJzIGFzIHN0cmluZztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG4gICAgICAgICAgaWYgKHNldENvb2tpZUhlYWRlcikge1xuICAgICAgICAgICAgY29uc3QgY29va2llcyA9IEFycmF5LmlzQXJyYXkoc2V0Q29va2llSGVhZGVyKSA/IHNldENvb2tpZUhlYWRlciA6IFtzZXRDb29raWVIZWFkZXJdO1xuICAgICAgICAgICAgY29uc3QgZml4ZWRDb29raWVzID0gY29va2llcy5tYXAoKGNvb2tpZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5QyBjb29raWUgXHU0RTBEXHU1MzA1XHU1NDJCIFNhbWVTaXRlXHVGRjBDXHU2MjE2XHU4MDA1IFNhbWVTaXRlIFx1NEUwRFx1NjYyRiBOb25lXHVGRjBDXHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXG4gICAgICAgICAgICAgIGlmICghY29va2llLmluY2x1ZGVzKCdTYW1lU2l0ZT1Ob25lJykpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTc5RkJcdTk2NjRcdTczQjBcdTY3MDlcdTc2ODQgU2FtZVNpdGUgXHU4QkJFXHU3RjZFXHVGRjA4XHU1OTgyXHU2NzlDXHU2NzA5XHVGRjA5XG4gICAgICAgICAgICAgICAgbGV0IGZpeGVkQ29va2llID0gY29va2llLnJlcGxhY2UoLztcXHMqU2FtZVNpdGU9KFN0cmljdHxMYXh8Tm9uZSkvZ2ksICcnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTZERkJcdTUyQTAgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXHVGRjA4XHU1QkY5XHU0RThFXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBU2VjdXJlIFx1OTcwMFx1ODk4MSBIVFRQU1x1RkYwQ1x1NEY0Nlx1NTcyOFx1NUYwMFx1NTNEMS9cdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTYyMTFcdTRFRUNcdTRFQ0RcdTcxMzZcdTZERkJcdTUyQTBcdTVCODNcbiAgICAgICAgICAgICAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTRGMUFcdTVGRkRcdTc1NjUgU2VjdXJlXHVGRjA4XHU1OTgyXHU2NzlDXHU1MzRGXHU4QkFFXHU2NjJGIEhUVFBcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlZENvb2tpZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gY29va2llO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ10gPSBmaXhlZENvb2tpZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFx1OEJCMFx1NUY1NVx1NTQwRVx1N0FFRlx1NTRDRFx1NUU5NFx1NzJCNlx1NjAwMVxuICAgICAgICBpZiAocHJveHlSZXMuc3RhdHVzQ29kZSAmJiBwcm94eVJlcy5zdGF0dXNDb2RlID49IDUwMCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtQcm94eV0gQmFja2VuZCByZXR1cm5lZCAke3Byb3h5UmVzLnN0YXR1c0NvZGV9IGZvciAke3JlcS5tZXRob2R9ICR7cmVxLnVybH1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NEVFM1x1NzQwNlx1OTUxOVx1OEJFRlxuICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogRXJyb3IsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQcm94eV0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFRhcmdldDonLCAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScpO1xuICAgICAgICBpZiAocmVzICYmICFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1x1NEVFM1x1NzQwNlx1OTUxOVx1OEJFRlx1RkYxQVx1NjVFMFx1NkNENVx1OEZERVx1NjNBNVx1NTIzMFx1NTQwRVx1N0FFRlx1NjcwRFx1NTJBMVx1NTY2OCBodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTc2RDFcdTU0MkNcdTRFRTNcdTc0MDZcdThCRjdcdTZDNDJcdUZGMDhcdTc1MjhcdTRFOEVcdThDMDNcdThCRDVcdUZGMDlcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcTogYW55LCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1Byb3h5XSAke3JlcS5tZXRob2R9ICR7cmVxLnVybH0gLT4gaHR0cDovLzEwLjgwLjkuNzY6ODExNSR7cmVxLnVybH1gKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH1cbn07XG5cbmV4cG9ydCB7IHByb3h5IH07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHNcIjsvKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODAnLFxuICAgIHByb2RIb3N0OiAnYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnYWRtaW4tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MScsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsb2dpc3RpY3MtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MicsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdxdWFsaXR5LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHByb2RIb3N0OiAncXVhbGl0eS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdwcm9kdWN0aW9uLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODQnLFxuICAgIHByb2RIb3N0OiAncHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdlbmdpbmVlcmluZy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODUnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg1JyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ21vYmlsZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkxJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVGMDBcdTUzRDFcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbERldlBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcucHJlUG9ydCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU3QUVGXHU1M0UzXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeURldlBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0ID09PSBwb3J0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQgPT09IHBvcnQpO1xufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdhLFNBQVMsb0JBQW9CO0FBQzdiLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsU0FBUyxZQUFZLG9CQUFvQjtBQUN6QyxTQUFTLGVBQWU7QUFFeEIsU0FBUyxXQUFXOzs7QUNGcEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFLN0IsU0FBUyx5QkFBeUI7QUFDdkMsU0FBTyxXQUFXO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxRQUNFLG9CQUFvQjtBQUFBLFVBQ2xCO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsUUFDQSxxQkFBcUI7QUFBQSxVQUNuQjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsV0FBVztBQUFBLE1BQ1Qsb0JBQW9CO0FBQUEsUUFDbEIsYUFBYTtBQUFBO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsS0FBSztBQUFBLElBRUws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QUNUO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxHQUFHLFNBQVMsa0JBQWtCLEtBQUssR0FBRyxTQUFTLHlCQUF5QixLQUFLLEdBQUcsU0FBUyxvQkFBb0IsR0FBRztBQUNsSCxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxjQUFJLEdBQUcsU0FBUyxvQkFBb0IsR0FBRztBQUNyQyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxzQkFBc0IsR0FBRztBQUN2QyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxvQkFBb0IsS0FBSyxHQUFHLFNBQVMscUJBQXFCLEdBQUc7QUFDM0UsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMscUJBQXFCLEtBQUssR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQy9FLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixnQkFBSSxHQUFHLFNBQVMsVUFBVSxLQUFLLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDdEQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLE1BQU0sR0FBRztBQUN2QixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxTQUFTLEdBQUc7QUFDMUIscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLFNBQVMsR0FBRztBQUMxQixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUE7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsY0FBYztBQUFBO0FBQUE7QUFBQSxJQUdaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFNBQVMsQ0FBQztBQUFBO0FBQUEsSUFFVixPQUFPO0FBQUEsRUFDVDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInByb3h5IiwgInByb3h5Il0KfQo=
