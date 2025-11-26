// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.20_@types+node@24.7.0_sass@1.93.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.20_vue@3.5.22/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.2_postcss@8.5.6_vite@5.4.20/node_modules/unocss/dist/vite.mjs";
import VueI18nPlugin from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@intlify+unplugin-vue-i18n@1.6.0_vue-i18n@11.1.12/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
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

// src/config/proxy.ts
var getBackendTarget = () => {
  const isDockerProduction = process.env.DOCKER_ENV === "production" || process.env.VITE_API_TARGET === "production" || process.env.NODE_ENV === "production" && process.env.DOCKER === "true";
  const target = isDockerProduction ? "http://10.0.0.168:8115" : "http://10.80.9.76:8115";
  return target;
};
var backendTarget = getBackendTarget();
var proxy = {
  "/api": {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 启用手动处理响应，以便修改响应体
    selfHandleResponse: true,
    // 处理响应头，添加 CORS 头
    configure: (proxy2, options) => {
      proxy2.on("proxyRes", (proxyRes, req, res) => {
        const origin = req.headers.origin || "*";
        const isLoginRequest = req.url?.includes("/login");
        let extractedToken = null;
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
              if (cookie.includes("access_token=")) {
                const tokenMatch = cookie.match(/access_token=([^;]+)/);
                if (tokenMatch && tokenMatch[1]) {
                  extractedToken = tokenMatch[1];
                }
              }
              let fixedCookie = cookie;
              fixedCookie = fixedCookie.replace(/;\s*Domain=[^;]+/gi, "");
              if (!fixedCookie.includes("Path=")) {
                fixedCookie += "; Path=/";
              } else {
                fixedCookie = fixedCookie.replace(/;\s*Path=[^;]+/gi, "; Path=/");
              }
              const forwardedProto = req.headers["x-forwarded-proto"];
              const isHttps = forwardedProto === "https" || req.socket?.encrypted === true || req.connection?.encrypted === true;
              const host = req.headers.host || "";
              const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
              const isIpAddress = /^\d+\.\d+\.\d+\.\d+/.test(host.split(":")[0]);
              fixedCookie = fixedCookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, "");
              if (isHttps) {
                fixedCookie += "; SameSite=None; Secure";
              } else if (isLocalhost) {
              } else if (isIpAddress) {
              } else {
              }
              if (fixedCookie.includes("HttpOnly") && !cookie.includes("HttpOnly=false")) {
                fixedCookie = fixedCookie.replace(/;\s*HttpOnly/gi, "");
              }
              if (!isHttps && fixedCookie.includes("Secure")) {
                fixedCookie = fixedCookie.replace(/;\s*Secure/gi, "");
              }
              return fixedCookie;
            });
            proxyRes.headers["set-cookie"] = fixedCookies;
          }
          const chunks = [];
          proxyRes.on("data", (chunk) => {
            chunks.push(chunk);
          });
          proxyRes.on("end", () => {
            if (isLoginRequest && extractedToken) {
              const originalHeaders = {};
              Object.keys(proxyRes.headers).forEach((key) => {
                const lowerKey = key.toLowerCase();
                if (lowerKey !== "content-length") {
                  originalHeaders[key] = proxyRes.headers[key];
                }
              });
              try {
                const body = Buffer.concat(chunks).toString("utf8");
                let responseData;
                try {
                  responseData = JSON.parse(body);
                } catch {
                  res.writeHead(proxyRes.statusCode || 200, originalHeaders);
                  res.end(body);
                  return;
                }
                if (!responseData.token && !responseData.accessToken && extractedToken) {
                  responseData.token = extractedToken;
                  responseData.accessToken = extractedToken;
                }
                const newBody = JSON.stringify(responseData);
                originalHeaders["content-length"] = Buffer.byteLength(newBody).toString();
                res.writeHead(proxyRes.statusCode || 200, originalHeaders);
                res.end(newBody);
              } catch (error) {
                console.error("[Proxy] \u2717 \u5904\u7406\u767B\u5F55\u54CD\u5E94\u65F6\u51FA\u9519:", error);
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                res.end(Buffer.concat(chunks));
              }
            } else {
              res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
              res.end(Buffer.concat(chunks));
            }
          });
          proxyRes.on("error", (err) => {
            console.error("[Proxy] \u2717 \u8BFB\u53D6\u54CD\u5E94\u6D41\u65F6\u51FA\u9519:", err);
            if (!res.headersSent) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin
              });
              res.end(JSON.stringify({ error: "\u4EE3\u7406\u5904\u7406\u54CD\u5E94\u65F6\u51FA\u9519" }));
            }
          });
        }
      });
      proxy2.on("error", (err, req, res) => {
        console.error("[Proxy] Error:", err.message);
        console.error("[Proxy] Request URL:", req.url);
        console.error("[Proxy] Target:", backendTarget);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": req.headers.origin || "*"
          });
          res.end(JSON.stringify({
            code: 500,
            message: `\u4EE3\u7406\u9519\u8BEF\uFF1A\u65E0\u6CD5\u8FDE\u63A5\u5230\u540E\u7AEF\u670D\u52A1\u5668 ${backendTarget}`,
            error: err.message
          }));
        }
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
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\system-app";
var config = getViteAppConfig("system-app");
var corsPreflightPlugin = () => {
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
    name: "cors-preflight",
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
  base: "/",
  // 明确设置为根路径，不使用 /logistics/
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@services": resolve(__vite_injected_original_dirname, "src/services"),
      "@auth": resolve(__vite_injected_original_dirname, "../../auth"),
      "@btc/shared-core": resolve(__vite_injected_original_dirname, "../../packages/shared-core/src"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src"),
      "@btc/shared-utils": resolve(__vite_injected_original_dirname, "../../packages/shared-utils/src"),
      "@btc/subapp-manifests": resolve(__vite_injected_original_dirname, "../../packages/subapp-manifests/src/index.ts"),
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
      "@charts-composables": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/charts/composables"),
      "@configs": resolve(__vite_injected_original_dirname, "../../configs")
    },
    dedupe: ["element-plus", "@element-plus/icons-vue", "vue", "vue-router", "pinia"]
  },
  plugins: [
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file) => readFileSync(file, "utf-8")
        }
      }
    }),
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    UnoCSS({
      configFile: resolve(__vite_injected_original_dirname, "../../uno.config.ts")
    }),
    VueI18nPlugin({
      include: [
        resolve(__vite_injected_original_dirname, "src/locales/**"),
        resolve(__vite_injected_original_dirname, "src/{modules,plugins}/**/locales/**"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/locales/**"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/plugins/**/locales/**"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts"),
        resolve(__vite_injected_original_dirname, "../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts")
      ],
      runtimeOnly: true
    }),
    corsPreflightPlugin(),
    // 添加 CORS 预检请求处理插件
    btc({
      type: "admin",
      proxy,
      eps: {
        enable: true,
        dist: "./build/eps",
        api: "/api/login/eps/contract"
      }
    })
  ],
  server: {
    port: config.devPort,
    host: "0.0.0.0",
    strictPort: false,
    proxy,
    headers: {
      "Access-Control-Allow-Origin": "*"
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
  preview: {
    port: config.prePort,
    host: "0.0.0.0",
    proxy,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      "@element-plus/icons-vue",
      "echarts",
      "vue-echarts",
      "@vueuse/core"
    ]
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
    // 主应用不应该使用 external，所有依赖都应该被打包
    // external 配置仅用于子应用（微前端场景）
    rollupOptions: {
      output: {
        // 确保相对路径的 import 使用正确的 base URL
        // 这样在微前端场景下，资源路径会正确解析
        format: "es",
        // 确保所有 chunk 之间的 import 使用相对路径
        // 这样浏览器会根据当前模块的位置解析，而不是根据页面 URL
        preserveModules: false,
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue-i18n") || id.includes("@intlify")) {
              return "vue-i18n";
            }
            if (id.includes("unocss") || id.includes("@unocss")) {
              return "lib-unocss";
            }
            if (id.includes("echarts")) {
              return "lib-echarts";
            }
            if (id.includes("qiankun")) {
              return "qiankun";
            }
            if (id.includes("xlsx")) {
              return "file-xlsx";
            }
            if (id.includes("file-saver")) {
              return "file-saver";
            }
            if (id.includes("element-plus")) {
              return "element-plus";
            }
            if (id.includes("vue") && !id.includes("vue-router")) {
              return "vue-core";
            }
            if (id.includes("vue-router")) {
              return "vue-router";
            }
            if (id.includes("pinia")) {
              return "pinia";
            }
            return "vendor";
          }
          if (id.includes("src/") && !id.includes("node_modules")) {
            if (id.includes("src/modules")) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ["api-services", "base", "customs", "data", "home", "procurement", "warehouse"].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              return "module-others";
            }
            if (id.includes("src/pages")) {
              return "app-pages";
            }
            if (id.includes("src/components")) {
              return "app-src";
            }
            if (id.includes("src/micro")) {
              return "app-micro";
            }
            if (id.includes("src/plugins/user-setting/components")) {
              return "app-components";
            }
            if (id.includes("src/plugins")) {
              if (id.includes("src/plugins/user-setting")) {
                return "app-src";
              }
              if (id.includes("src/plugins/echarts")) {
                return "app-plugin-echarts";
              }
              return "app-src";
            }
            if (id.includes("src/store")) {
              return "app-src";
            }
            if (id.includes("src/bootstrap")) {
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
            return "app-src";
          }
          if (id.includes("@btc/shared-")) {
            if (id.includes("@btc/shared-components")) {
              return "btc-components";
            }
            if (id.includes("@btc/subapp-manifests")) {
              return "btc-manifests";
            }
            return "btc-shared";
          }
          return void 0;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 2e3
    // 提高警告阈值，vendor chunk 较大是正常的
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAic3JjL2NvbmZpZy9wcm94eS50cyIsICIuLi8uLi9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXHN5c3RlbS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvc3lzdGVtLWFwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCBWdWVJMThuUGx1Z2luIGZyb20gJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgYnRjIH0gZnJvbSAnQGJ0Yy92aXRlLXBsdWdpbic7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgcHJveHkgfSBmcm9tICcuL3NyYy9jb25maWcvcHJveHknO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnJztcblxuLy8gXHU0RUNFXHU3RURGXHU0RTAwXHU5MTREXHU3RjZFXHU0RTJEXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG5jb25zdCBjb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XG5cbi8vIENPUlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XHVGRjA4XHU1OTA0XHU3NDA2IEFQSSBcdThCRjdcdTZDNDJcdTU0OENcdTYyNDBcdTY3MDlcdThCRjdcdTZDNDJcdTc2ODQgQ09SUyBcdTU5MzRcdUZGMDlcbmNvbnN0IGNvcnNQcmVmbGlnaHRQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgLy8gQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcdTUxRkRcdTY1NzBcdUZGMDhcdTc1MjhcdTRFOEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDlcbiAgY29uc3QgY29yc0Rldk1pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAvLyBcdThCQkVcdTdGNkUgQ09SUyBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTYyNDBcdTY3MDlcdThCRjdcdTZDNDJcdTkwRkRcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgLy8gQ2hyb21lIFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1ODk4MVx1NkM0Mlx1RkYwOFx1NEVDNVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IG9yaWdpblx1RkYwQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NTdGQVx1NjcyQ1x1NzY4NCBDT1JTIFx1NTkzNFx1RkYwOFx1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1Njc2NVx1NkU5MFx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIC8vIENocm9tZSBcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTg5ODFcdTZDNDJcdUZGMDhcdTRFQzVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIC8vIENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XHU1MUZEXHU2NTcwXHVGRjA4XHU3NTI4XHU0RThFXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XHVGRjA5XG4gIGNvbnN0IGNvcnNQcmV2aWV3TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgIC8vIFx1OEJCRVx1N0Y2RSBDT1JTIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwOFx1NjI0MFx1NjcwOVx1OEJGN1x1NkM0Mlx1OTBGRFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSBvcmlnaW5cdUZGMENcdTRFNUZcdThCQkVcdTdGNkVcdTU3RkFcdTY3MkNcdTc2ODQgQ09SUyBcdTU5MzRcdUZGMDhcdTUxNDFcdThCQjhcdTYyNDBcdTY3MDlcdTY3NjVcdTZFOTBcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtcHJlZmxpZ2h0JyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMUFcdTUzMDVcdTU0MkJcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTU5MzRcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvcnNEZXZNaWRkbGV3YXJlKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY29uZmlndXJlUHJldmlld1NlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYxQVx1NEUwRFx1NTMwNVx1NTQyQlx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29yc1ByZXZpZXdNaWRkbGV3YXJlKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLycsIC8vIFx1NjYwRVx1Nzg2RVx1OEJCRVx1N0Y2RVx1NEUzQVx1NjgzOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1NEY3Rlx1NzUyOCAvbG9naXN0aWNzL1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICAgICdAc2VydmljZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zZXJ2aWNlcycpLFxuICAgICAgJ0BhdXRoJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9hdXRoJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC11dGlscy9zcmMnKSxcbiAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3N1YmFwcC1tYW5pZmVzdHMvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQGJ0Yy1jb21tb24nOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24nKSxcbiAgICAgICdAYnRjLWNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGJ0Yy1jcnVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICAgJ0Bhc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSxcbiAgICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwQ1x1NTNCQlx1NjM4OSAudHMgXHU2MjY5XHU1QzU1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA5XG4gICAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAgICdAY2hhcnRzLXR5cGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzJyksXG4gICAgICAnQGNoYXJ0cy11dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscycpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMnKSxcbiAgICAgICdAY29uZmlncyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vY29uZmlncycpLFxuICAgIH0sXG4gICAgZGVkdXBlOiBbJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsICd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKHtcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpLFxuICAgIGNyZWF0ZUNvbXBvbmVudHNDb25maWcoeyBpbmNsdWRlU2hhcmVkOiB0cnVlIH0pLFxuICAgIFVub0NTUyh7XG4gICAgICBjb25maWdGaWxlOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbG9jYWxlcy8qKicpLFxuICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy97bW9kdWxlcyxwbHVnaW5zfS8qKi9sb2NhbGVzLyoqJyksXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvKionKSxcbiAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucy8qKi9sb2NhbGVzLyoqJyksXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTi50cycpLFxuICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMudHMnKSxcbiAgICAgIF0sXG4gICAgICBydW50aW1lT25seTogdHJ1ZSxcbiAgICB9KSxcbiAgICBjb3JzUHJlZmxpZ2h0UGx1Z2luKCksIC8vIFx1NkRGQlx1NTJBMCBDT1JTIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0Mlx1NTkwNFx1NzQwNlx1NjNEMlx1NEVGNlxuICAgIGJ0Yyh7XG4gICAgICB0eXBlOiAnYWRtaW4nLFxuICAgICAgcHJveHksXG4gICAgICBlcHM6IHtcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgICBkaXN0OiAnLi9idWlsZC9lcHMnLFxuICAgICAgICBhcGk6ICcvYXBpL2xvZ2luL2Vwcy9jb250cmFjdCcsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiBjb25maWcuZGV2UG9ydCxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXG4gICAgcHJveHksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICB9LFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgYWxsb3c6IFtcbiAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicpLFxuICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzJyksXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiBjb25maWcucHJlUG9ydCxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcHJveHksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICAnZWxlbWVudC1wbHVzJyxcbiAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsXG4gICAgICAnZWNoYXJ0cycsXG4gICAgICAndnVlLWVjaGFydHMnLFxuICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgXSxcbiAgfSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J11cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHU0RTBEXHU1RTk0XHU4QkU1XHU0RjdGXHU3NTI4IGV4dGVybmFsXHVGRjBDXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHU5MEZEXHU1RTk0XHU4QkU1XHU4OEFCXHU2MjUzXHU1MzA1XG4gICAgLy8gZXh0ZXJuYWwgXHU5MTREXHU3RjZFXHU0RUM1XHU3NTI4XHU0RThFXHU1QjUwXHU1RTk0XHU3NTI4XHVGRjA4XHU1RkFFXHU1MjREXHU3QUVGXHU1NzNBXHU2NjZGXHVGRjA5XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NzY4NCBpbXBvcnQgXHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0IGJhc2UgVVJMXG4gICAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTcyOFx1NUZBRVx1NTI0RFx1N0FFRlx1NTczQVx1NjY2Rlx1NEUwQlx1RkYwQ1x1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1NEYxQVx1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MFxuICAgICAgICBmb3JtYXQ6ICdlcycsXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOSBjaHVuayBcdTRFNEJcdTk1RjRcdTc2ODQgaW1wb3J0IFx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAvLyBcdThGRDlcdTY4MzdcdTZENEZcdTg5QzhcdTU2NjhcdTRGMUFcdTY4MzlcdTYzNkVcdTVGNTNcdTUyNERcdTZBMjFcdTU3NTdcdTc2ODRcdTRGNERcdTdGNkVcdTg5RTNcdTY3OTBcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTY4MzlcdTYzNkVcdTk4NzVcdTk3NjIgVVJMXG4gICAgICAgIHByZXNlcnZlTW9kdWxlczogZmFsc2UsXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBub2RlX21vZHVsZXMgXHU0RjlEXHU4RDU2XHVGRjBDXHU4RkRCXHU4ODRDXHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgLy8gXHU4RkRCXHU0RTAwXHU2QjY1XHU1MjA2XHU1MjcyXHU1OTI3XHU1NzhCXHU1RTkzXHVGRjBDXHU1MUNGXHU1QzExIHZlbmRvciBjaHVuayBcdTU5MjdcdTVDMEZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndnVlLWkxOG4nKSB8fCBpZC5pbmNsdWRlcygnQGludGxpZnknKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3Z1ZS1pMThuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndW5vY3NzJykgfHwgaWQuaW5jbHVkZXMoJ0B1bm9jc3MnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2xpYi11bm9jc3MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdlY2hhcnRzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdsaWItZWNoYXJ0cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3FpYW5rdW4nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3FpYW5rdW4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd4bHN4JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdmaWxlLXhsc3gnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdmaWxlLXNhdmVyJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdmaWxlLXNhdmVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTIwNlx1NTI3MiBFbGVtZW50IFBsdXMgXHU3NkY4XHU1MTczXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnZWxlbWVudC1wbHVzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTIwNlx1NTI3MiBWdWUgXHU3NkY4XHU1MTczXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZScpICYmICFpZC5pbmNsdWRlcygndnVlLXJvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndnVlLWNvcmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2dWUtcm91dGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTIwNlx1NTI3MiBQaW5pYVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwaW5pYScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAncGluaWEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjLycpICYmICFpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL21vZHVsZXMnKSkge1xuICAgICAgICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gaWQubWF0Y2goL3NyY1xcL21vZHVsZXNcXC8oW14vXSspLyk/LlsxXTtcbiAgICAgICAgICAgICAgaWYgKG1vZHVsZU5hbWUgJiYgWydhcGktc2VydmljZXMnLCAnYmFzZScsICdjdXN0b21zJywgJ2RhdGEnLCAnaG9tZScsICdwcm9jdXJlbWVudCcsICd3YXJlaG91c2UnXS5pbmNsdWRlcyhtb2R1bGVOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgbW9kdWxlLSR7bW9kdWxlTmFtZX1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAnbW9kdWxlLW90aGVycyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9wYWdlcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXBhZ2VzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICAvLyBjb21wb25lbnRzIFx1NEY5RFx1OEQ1NiB1c2VTZXR0aW5nc1N0YXRlXHVGRjA4XHU1NzI4IGFwcC1zcmMgXHU0RTJEXHVGRjA5XHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9taWNybycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLW1pY3JvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BsdWdpbnMvdXNlci1zZXR0aW5nL2NvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICAvLyBcdTVDMDYgdXNlci1zZXR0aW5nIFx1NzY4NFx1N0VDNFx1NEVGNlx1NjUzRVx1NTIzMCBhcHAtY29tcG9uZW50c1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BsdWdpbnMnKSkge1xuICAgICAgICAgICAgICAvLyBzeXN0ZW0tYXBwIFx1NjcwOVx1NTkxQVx1NEUyQVx1NjNEMlx1NEVGNlx1RkYwQ1x1NTNFRlx1NEVFNVx1OEZEQlx1NEUwMFx1NkI2NVx1N0VDNlx1NTIwNlxuICAgICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUF1c2VyLXNldHRpbmcgXHU2M0QyXHU0RUY2XHU0RTBFIHN0b3JlIFx1NEU0Qlx1OTVGNFx1NUI1OFx1NTcyOFx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwQ1xuICAgICAgICAgICAgICAvLyBcdTVDMDZcdTVCODNcdTRFRUNcdTY1M0VcdTU3Mjggc3RvcmUgXHU0RTRCXHU1NDBFXHU0RjQ2XHU1NzI4XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU5NUVFXHU5ODk4XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BsdWdpbnMvdXNlci1zZXR0aW5nJykpIHtcbiAgICAgICAgICAgICAgICAvLyB1c2VyLXNldHRpbmcgXHU2M0QyXHU0RUY2XHU0RTBFIHN0b3JlIFx1NjcwOVx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwQ1x1NEY0NiBib290c3RyYXAgXHU0RTVGXHU0RjlEXHU4RDU2XHU1QjgzXG4gICAgICAgICAgICAgICAgLy8gXHU1QzA2XHU1QjgzXHU0RUVDXHU5MEZEXHU2NTNFXHU1NzI4IGFwcC1zcmMgXHU0RTJEXHVGRjBDXHU5MDdGXHU1MTREXHU4REU4IGNodW5rIFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvcGx1Z2lucy9lY2hhcnRzJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1wbHVnaW4tZWNoYXJ0cyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHU0RTBFIGJvb3RzdHJhcCBcdTY3MDlcdTRGOURcdThENTZcdTUxNzNcdTdDRkJcdUZGMDhib290c3RyYXAgXHU0RjFBXHU2MjZCXHU2M0NGXHU2M0QyXHU0RUY2XHVGRjA5XHVGRjBDXHU2NTNFXHU1NzI4IGFwcC1zcmMgXHU0RTJEXG4gICAgICAgICAgICAgIC8vIFx1OTA3Rlx1NTE0RCBib290c3RyYXAgXHU1NDhDIHBsdWdpbnMgXHU0RTRCXHU5NUY0XHU3Njg0XHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9zdG9yZScpKSB7XG4gICAgICAgICAgICAgIC8vIHN0b3JlIFx1NEUwRSBib290c3RyYXAgXHU2NzA5XHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHVGRjA4Ym9vdHN0cmFwIFx1NUJGQ1x1NTFGQSBzdG9yZVx1RkYwOVx1RkYwQ1x1NjUzRVx1NTcyOCBhcHAtc3JjIFx1NEUyRFxuICAgICAgICAgICAgICAvLyBcdTkwN0ZcdTUxNEQgYm9vdHN0cmFwXHVGRjA4YXBwLXNyY1x1RkYwOVx1NTQ4QyBzdG9yZVx1RkYwOGFwcC1zdG9yZVx1RkYwOVx1NEU0Qlx1OTVGNFx1NzY4NFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvYm9vdHN0cmFwJykpIHtcbiAgICAgICAgICAgICAgLy8gYm9vdHN0cmFwIFx1NEUwRSBtYWluLnRzXHUzMDAxc2VydmljZXMgXHU1NDhDIHN0b3JlIFx1NjcwOVx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwQ1x1NjUzRVx1NTcyOCBhcHAtc3JjIFx1NEUyRFxuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvc2VydmljZXMnKSkge1xuICAgICAgICAgICAgICAvLyBzZXJ2aWNlcyBcdTRFMEUgbWFpbi50cyBcdTU0OEMgYm9vdHN0cmFwIFx1NjcwOVx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwQ1x1NjUzRVx1NTcyOCBhcHAtc3JjIFx1NEUyRFxuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvdXRpbHMnKSkge1xuICAgICAgICAgICAgICAvLyB1dGlscyBcdTRFMEUgYm9vdHN0cmFwIFx1NjcwOVx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwOGJvb3RzdHJhcCBcdTVCRkNcdTUxNjVcdTU5MUFcdTRFMkEgdXRpbHNcdUZGMDlcdUZGMENcdTY1M0VcdTU3MjggYXBwLXNyYyBcdTRFMkRcbiAgICAgICAgICAgICAgLy8gXHU5MDdGXHU1MTREIGJvb3RzdHJhcFx1RkYwOGFwcC1zcmNcdUZGMDlcdTU0OEMgdXRpbHNcdUZGMDhhcHAtdXRpbHNcdUZGMDlcdTRFNEJcdTk1RjRcdTc2ODRcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbXBvc2FibGVzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtY29tcG9zYWJsZXMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvY29uZmlnJykpIHtcbiAgICAgICAgICAgICAgLy8gY29uZmlnIFx1NEY5RFx1OEQ1NiBwbHVnaW5zL3VzZXItc2V0dGluZy9jb25maWcvZW51bXNcdUZGMDhcdTU3MjggYXBwLXNyYyBcdTRFMkRcdUZGMDlcdUZGMENcdTU0MDhcdTVFNzZcdTUyMzAgYXBwLXNyYyBcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3JvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXJvdXRlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9pMThuJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtaTE4bic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9hc3NldHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1hc3NldHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0IHNyYy90eXBlcyBcdTc2ODRcdTUzNTVcdTcyRUMgY2h1bmtcbiAgICAgICAgICAgIC8vIHR5cGVzIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NjU4N1x1NEVGNlx1OTAxQVx1NUUzOFx1NUY4OFx1NUMwRlx1RkYwQ1x1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1NTM3M1x1NTNFRlxuICAgICAgICAgICAgLy8gXHU5MDdGXHU1MTREXHU3NTFGXHU2MjEwXHU3QTdBIGNodW5rIFx1OEI2Nlx1NTQ0QVxuICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLScpKSB7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2J0Yy1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdidGMtbWFuaWZlc3RzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYnRjLXNoYXJlZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsIC8vIFx1NjNEMFx1OUFEOFx1OEI2Nlx1NTQ0QVx1OTYwOFx1NTAzQ1x1RkYwQ3ZlbmRvciBjaHVuayBcdThGODNcdTU5MjdcdTY2MkZcdTZCNjNcdTVFMzhcdTc2ODRcbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjtcdUZFRkYvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4YWRtaW4tYXBwLCBsb2dpc3RpY3MtYXBwIFx1N0I0OVx1RkYwOVx1NEY3Rlx1NzUyOFxuICovXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIEF1dG8gSW1wb3J0IFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpIHtcbiAgcmV0dXJuIEF1dG9JbXBvcnQoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgIHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiBbXG4gICAgICAgICAgJ3VzZUNydWQnLFxuICAgICAgICAgICd1c2VEaWN0JyxcbiAgICAgICAgICAndXNlUGVybWlzc2lvbicsXG4gICAgICAgICAgJ3VzZVJlcXVlc3QnLFxuICAgICAgICAgICdjcmVhdGVJMThuUGx1Z2luJyxcbiAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgIF0sXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IFtcbiAgICAgICAgICAnZm9ybWF0RGF0ZScsXG4gICAgICAgICAgJ2Zvcm1hdERhdGVUaW1lJyxcbiAgICAgICAgICAnZm9ybWF0TW9uZXknLFxuICAgICAgICAgICdmb3JtYXROdW1iZXInLFxuICAgICAgICAgICdpc0VtYWlsJyxcbiAgICAgICAgICAnaXNQaG9uZScsXG4gICAgICAgICAgJ3N0b3JhZ2UnLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxuXG4gICAgZXNsaW50cmM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgIH0sXG5cbiAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU5ODlEXHU1OTE2XHU3Njg0XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHVGRjA5XG4gICAqL1xuICBleHRyYURpcnM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgKi9cbiAgaW5jbHVkZVNoYXJlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENvbXBvbmVudHMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudHNDb25maWcob3B0aW9uczogQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGV4dHJhRGlycyA9IFtdLCBpbmNsdWRlU2hhcmVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBjb25zdCBkaXJzID0gW1xuICAgICdzcmMvY29tcG9uZW50cycsIC8vIFx1NUU5NFx1NzUyOFx1N0VBN1x1N0VDNFx1NEVGNlxuICAgIC4uLmV4dHJhRGlycywgLy8gXHU5ODlEXHU1OTE2XHU3Njg0XHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XG4gIF07XG5cbiAgLy8gXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHVGRjBDXHU2REZCXHU1MkEwXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIGlmIChpbmNsdWRlU2hhcmVkKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XG4gICAgZGlycy5wdXNoKFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Jhc2ljJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9sYXlvdXQnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Zvcm0nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2RhdGEnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2ZlZWRiYWNrJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9vdGhlcnMnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBDb21wb25lbnRzKHtcbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIHJlbG9hZGluZ1xuICAgICAgfSksXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5RTNcdTY3OTBcdTU2NjhcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICBpZiAoY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdCdGMnKSB8fCBjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBjb21wb25lbnROYW1lLFxuICAgICAgICAgICAgZnJvbTogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSxcbiAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICBkaXJzLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLCAvLyBcdTY1MkZcdTYzMDEgLnZ1ZSBcdTU0OEMgLnRzeCBcdTY1ODdcdTRFRjZcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcbiAgICBkZWVwOiB0cnVlLFxuICAgIC8vIFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOSBCdGMgXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XG4gICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnRzeCQvLCAvQnRjW0EtWl0vLCAvYnRjLVthLXpdL10sXG4gIH0pO1xufVxuLy8gVVRGLTggZW5jb2RpbmcgZml4XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9zeXN0ZW0tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcblxuLy8gVml0ZSBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTdDN0JcdTU3OEJcbmludGVyZmFjZSBQcm94eU9wdGlvbnMge1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hhbmdlT3JpZ2luPzogYm9vbGVhbjtcbiAgc2VjdXJlPzogYm9vbGVhbjtcbiAgY29uZmlndXJlPzogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4gdm9pZDtcbn1cblxuLy8gXHU2ODM5XHU2MzZFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU3ODZFXHU1QjlBXHU1NDBFXHU3QUVGXHU1NzMwXHU1NzQwXG4vLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMDhcdTUzMDVcdTYyRUMgdml0ZSBkZXYgXHU1NDhDIHZpdGUgcHJldmlld1x1RkYwOVx1RkYxQTEwLjgwLjkuNzY6ODExNVxuLy8gRG9ja2VyIFx1NUJCOVx1NTY2OFx1NTE4NVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQTEwLjAuMC4xNjg6ODExNVxuY29uc3QgZ2V0QmFja2VuZFRhcmdldCA9ICgpOiBzdHJpbmcgPT4ge1xuICAvLyBcdTUzRUFcdTY3MDlcdTU3MjggRG9ja2VyIFx1NUJCOVx1NTY2OFx1NTE4NVx1NEUxNFx1NjYwRVx1Nzg2RVx1NjgwN1x1OEJDNlx1NEUzQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NjVGNlx1NjI0RFx1NEY3Rlx1NzUyOFx1NzUxRlx1NEVBN1x1NTczMFx1NTc0MFxuICAvLyBcdTUzRUZcdTRFRTVcdTkwMUFcdThGQzdcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0YgRE9DS0VSX0VOVj1wcm9kdWN0aW9uIFx1NjIxNiBWSVRFX0FQSV9UQVJHRVQ9cHJvZHVjdGlvbiBcdTY3NjVcdTY4MDdcdThCQzZcbiAgY29uc3QgaXNEb2NrZXJQcm9kdWN0aW9uID0gXG4gICAgcHJvY2Vzcy5lbnYuRE9DS0VSX0VOViA9PT0gJ3Byb2R1Y3Rpb24nIHx8IFxuICAgIHByb2Nlc3MuZW52LlZJVEVfQVBJX1RBUkdFVCA9PT0gJ3Byb2R1Y3Rpb24nIHx8XG4gICAgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgcHJvY2Vzcy5lbnYuRE9DS0VSID09PSAndHJ1ZScpO1xuICBcbiAgY29uc3QgdGFyZ2V0ID0gaXNEb2NrZXJQcm9kdWN0aW9uID8gJ2h0dHA6Ly8xMC4wLjAuMTY4OjgxMTUnIDogJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuY29uc3QgYmFja2VuZFRhcmdldCA9IGdldEJhY2tlbmRUYXJnZXQoKTtcblxuY29uc3QgcHJveHk6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IFByb3h5T3B0aW9ucz4gPSB7XG4gICcvYXBpJzoge1xuICAgIHRhcmdldDogYmFja2VuZFRhcmdldCxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICAvLyBcdTRFMERcdTUxOERcdTY2RkZcdTYzNjJcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdThGNkNcdTUzRDEgL2FwaSBcdTUyMzBcdTU0MEVcdTdBRUZcdUZGMDhcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVx1RkYwOVxuICAgIC8vIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcvYWRtaW4nKSAvLyBcdTVERjJcdTc5RkJcdTk2NjRcdUZGMUFcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVxuICAgIC8vIFx1NTQyRlx1NzUyOFx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1RkYwQ1x1NEVFNVx1NEZCRlx1NEZFRVx1NjUzOVx1NTRDRFx1NUU5NFx1NEY1M1xuICAgIHNlbGZIYW5kbGVSZXNwb25zZTogdHJ1ZSxcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTZERkJcdTUyQTAgQ09SUyBcdTU5MzRcbiAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBjb25zdCBpc0xvZ2luUmVxdWVzdCA9IHJlcS51cmw/LmluY2x1ZGVzKCcvbG9naW4nKTtcbiAgICAgICAgbGV0IGV4dHJhY3RlZFRva2VuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm94eVJlcy5oZWFkZXJzKSB7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSBvcmlnaW4gYXMgc3RyaW5nO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAndHJ1ZSc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyddID0gJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJztcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IHJlcS5oZWFkZXJzWydhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LWhlYWRlcnMnXSB8fCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnXSA9IHJlcXVlc3RIZWFkZXJzIGFzIHN0cmluZztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHNldENvb2tpZUhlYWRlcikge1xuICAgICAgICAgICAgY29uc3QgY29va2llcyA9IEFycmF5LmlzQXJyYXkoc2V0Q29va2llSGVhZGVyKSA/IHNldENvb2tpZUhlYWRlciA6IFtzZXRDb29raWVIZWFkZXJdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBmaXhlZENvb2tpZXMgPSBjb29raWVzLm1hcCgoY29va2llOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2IGFjY2Vzc190b2tlbiBcdTc2ODRcdTUwM0NcdUZGMDhcdTc1MjhcdTRFOEVcdTZERkJcdTUyQTBcdTUyMzBcdTU0Q0RcdTVFOTRcdTRGNTNcdUZGMDlcbiAgICAgICAgICAgICAgaWYgKGNvb2tpZS5pbmNsdWRlcygnYWNjZXNzX3Rva2VuPScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9rZW5NYXRjaCA9IGNvb2tpZS5tYXRjaCgvYWNjZXNzX3Rva2VuPShbXjtdKykvKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW5NYXRjaCAmJiB0b2tlbk1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICBleHRyYWN0ZWRUb2tlbiA9IHRva2VuTWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBsZXQgZml4ZWRDb29raWUgPSBjb29raWU7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5RkJcdTk2NjQgRG9tYWluIFx1OEJCRVx1N0Y2RVx1RkYwQ1x1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NTdERlx1NTQwRFxuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTU0MEVcdTdBRUZcdThCQkVcdTdGNkVcdTRFODYgRG9tYWluPTEwLjgwLjguMTk5IFx1NjIxNlx1NTE3Nlx1NEVENlx1NTAzQ1x1RkYwQ1x1NEYxQVx1NUJGQ1x1ODFGNCBKYXZhU2NyaXB0IFx1NjVFMFx1NkNENVx1OEJGQlx1NTNENlxuICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqRG9tYWluPVteO10rL2dpLCAnJyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTc4NkVcdTRGREQgUGF0aD0vXHVGRjBDXHU4QkE5IGNvb2tpZSBcdTU3MjhcdTY1NzRcdTRFMkFcdTU3REZcdTU0MERcdTRFMEJcdTUzRUZcdTc1MjhcbiAgICAgICAgICAgICAgaWYgKCFmaXhlZENvb2tpZS5pbmNsdWRlcygnUGF0aD0nKSkge1xuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llICs9ICc7IFBhdGg9Lyc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1REYyXHU2NzA5IFBhdGhcdUZGMENcdTc4NkVcdTRGRERcdTY2MkYgL1xuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llID0gZml4ZWRDb29raWUucmVwbGFjZSgvO1xccypQYXRoPVteO10rL2dpLCAnOyBQYXRoPS8nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEIFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdTUzM0FcdTUyMkJcdUZGMUFcbiAgICAgICAgICAgICAgLy8gLSBsb2NhbGhvc3Q6IFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NUMwNlx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1ODlDNlx1NEUzQVx1NTQwQ1x1NEUwMFx1N0FEOVx1NzBCOVx1RkYwQ1NhbWVTaXRlPUxheCBcdTUzRUZcdTgwRkRcdTUxNDFcdThCQjhcdThERThcdTdBRUZcdTUzRTMgY29va2llXG4gICAgICAgICAgICAgIC8vIC0gSVAgXHU1NzMwXHU1NzQwXHVGRjA4XHU1OTgyIDEwLjgwLjguMTk5XHVGRjA5OiBcdTZENEZcdTg5QzhcdTU2NjhcdTVDMDZcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdTg5QzZcdTRFM0FcdTRFMERcdTU0MENcdTdBRDlcdTcwQjlcdUZGMENTYW1lU2l0ZT1MYXggXHU0RTBEXHU1MTQxXHU4QkI4XHU4REU4XHU3QUQ5XHU3MEI5IGNvb2tpZVxuICAgICAgICAgICAgICAvLyBcdTYyNDBcdTRFRTVcdTU3MjggSVAgXHU1NzMwXHU1NzQwXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjBDXHU1MzczXHU0RjdGXHU0RjdGXHU3NTI4IFNhbWVTaXRlPUxheFx1RkYwQ1x1OERFOFx1N0FFRlx1NTNFMyBjb29raWUgXHU0RTVGXHU1M0VGXHU4MEZEXHU1OTMxXHU4RDI1XG4gICAgICAgICAgICAgIGNvbnN0IGZvcndhcmRlZFByb3RvID0gcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLXByb3RvJ107XG4gICAgICAgICAgICAgIGNvbnN0IGlzSHR0cHMgPSBmb3J3YXJkZWRQcm90byA9PT0gJ2h0dHBzJyB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlcSBhcyBhbnkpLnNvY2tldD8uZW5jcnlwdGVkID09PSB0cnVlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXEgYXMgYW55KS5jb25uZWN0aW9uPy5lbmNyeXB0ZWQgPT09IHRydWU7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTY4QzBcdTZENEJcdTY2MkZcdTU0MjZcdTY2MkYgbG9jYWxob3N0XHVGRjA4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHVGRjA5XHU4RkQ4XHU2NjJGIElQIFx1NTczMFx1NTc0MFx1RkYwOFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBob3N0ID0gcmVxLmhlYWRlcnMuaG9zdCB8fCAnJztcbiAgICAgICAgICAgICAgY29uc3QgaXNMb2NhbGhvc3QgPSBob3N0LmluY2x1ZGVzKCdsb2NhbGhvc3QnKSB8fCBob3N0LmluY2x1ZGVzKCcxMjcuMC4wLjEnKTtcbiAgICAgICAgICAgICAgY29uc3QgaXNJcEFkZHJlc3MgPSAvXlxcZCtcXC5cXGQrXFwuXFxkK1xcLlxcZCsvLnRlc3QoaG9zdC5zcGxpdCgnOicpWzBdKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NFx1NzNCMFx1NjcwOVx1NzY4NCBTYW1lU2l0ZSBcdThCQkVcdTdGNkVcbiAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlNhbWVTaXRlPShTdHJpY3R8TGF4fE5vbmUpL2dpLCAnJyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAoaXNIdHRwcykge1xuICAgICAgICAgICAgICAgIC8vIEhUVFBTIFx1NzNBRlx1NTg4M1x1NEUwQlx1RkYxQVx1NEY3Rlx1NzUyOCBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcdUZGMDhcdTY1MkZcdTYzMDFcdThERThcdTU3REZcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9jYWxob3N0KSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWxob3N0ICsgSFRUUFx1RkYxQVx1NEUwRFx1OEJCRVx1N0Y2RSBTYW1lU2l0ZVx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NTAzQ1x1RkYwQ1x1OTAxQVx1NUUzOFx1NjYyRiBMYXhcdUZGMDlcbiAgICAgICAgICAgICAgICAvLyBsb2NhbGhvc3QgXHU0RTBBXHVGRjBDXHU2RDRGXHU4OUM4XHU1NjY4XHU1QkY5XHU4REU4XHU3QUVGXHU1M0UzIGNvb2tpZSBcdTY2RjRcdTVCQkRcdTY3N0VcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0lwQWRkcmVzcykge1xuICAgICAgICAgICAgICAgIC8vIElQIFx1NTczMFx1NTc0MCArIEhUVFBcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcdUZGMENcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTUwM0NcdUZGMDhcdTRFMEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTYwQzVcdTUxQjVcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREIEh0dHBPbmx5IFx1ODhBQlx1NzlGQlx1OTY2NFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTQwRVx1N0FFRlx1OEJCRVx1N0Y2RVx1NEU4NiBIdHRwT25seT1mYWxzZVx1RkYwQ1x1NEY0Nlx1NTNFRlx1ODBGRFx1OEZEOFx1NjcwOVx1NTE3Nlx1NEVENlx1OEJCRVx1N0Y2RVx1RkYwOVxuICAgICAgICAgICAgICBpZiAoZml4ZWRDb29raWUuaW5jbHVkZXMoJ0h0dHBPbmx5JykgJiYgIWNvb2tpZS5pbmNsdWRlcygnSHR0cE9ubHk9ZmFsc2UnKSkge1xuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llID0gZml4ZWRDb29raWUucmVwbGFjZSgvO1xccypIdHRwT25seS9naSwgJycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTc4NkVcdTRGREQgU2VjdXJlIFx1ODhBQlx1NzlGQlx1OTY2NFx1RkYwOFx1NTcyOCBIVFRQIFx1NzNBRlx1NTg4M1x1NEUwQlx1RkYwOVxuICAgICAgICAgICAgICBpZiAoIWlzSHR0cHMgJiYgZml4ZWRDb29raWUuaW5jbHVkZXMoJ1NlY3VyZScpKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlNlY3VyZS9naSwgJycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXSA9IGZpeGVkQ29va2llcztcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTgyXHU2NzlDXHU2NjJGXHU3NjdCXHU1RjU1XHU2M0E1XHU1M0UzXHU3Njg0XHU1NENEXHU1RTk0XHVGRjBDXHU0RTE0XHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU2Q0ExXHU2NzA5IHRva2VuXHVGRjBDXHU1MjE5XHU0RUNFIFNldC1Db29raWUgXHU0RTJEXHU2M0QwXHU1M0Q2XHU1RTc2XHU2REZCXHU1MkEwXHU1MjMwXHU1NENEXHU1RTk0XHU0RjUzXG4gICAgICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1MjREXHU3QUVGXHU1QzMxXHU1M0VGXHU0RUU1XHU0RUNFXHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU4M0I3XHU1M0Q2IHRva2VuXHVGRjBDXHU1MzczXHU0RjdGIGNvb2tpZSBcdTY2MkYgSHR0cE9ubHkgXHU3Njg0XG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RjdGXHU3NTI4IHNlbGZIYW5kbGVSZXNwb25zZTogdHJ1ZSBcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTYyNEJcdTUyQThcdTU5MDRcdTc0MDZcdTYyNDBcdTY3MDlcdTU0Q0RcdTVFOTRcbiAgICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG4gICAgICAgICAgXG4gICAgICAgICAgcHJveHlSZXMub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNMb2dpblJlcXVlc3QgJiYgZXh0cmFjdGVkVG9rZW4pIHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ+ID0ge307XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHByb3h5UmVzLmhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb3dlcktleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChsb3dlcktleSAhPT0gJ2NvbnRlbnQtbGVuZ3RoJykge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWxIZWFkZXJzW2tleV0gPSBwcm94eVJlcy5oZWFkZXJzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZURhdGE6IGFueTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NjYyRiBKU09OXHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XG4gICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBvcmlnaW5hbEhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU2Q0ExXHU2NzA5IHRva2VuXHVGRjBDXHU2REZCXHU1MkEwXHU0RUNFIGNvb2tpZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTc2ODQgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlRGF0YS50b2tlbiAmJiAhcmVzcG9uc2VEYXRhLmFjY2Vzc1Rva2VuICYmIGV4dHJhY3RlZFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZURhdGEudG9rZW4gPSBleHRyYWN0ZWRUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YS5hY2Nlc3NUb2tlbiA9IGV4dHJhY3RlZFRva2VuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBcdTkxQ0RcdTY1QjBcdThCQkVcdTdGNkUgQ29udGVudC1MZW5ndGhcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdCb2R5ID0gSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VEYXRhKTtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPSBCdWZmZXIuYnl0ZUxlbmd0aChuZXdCb2R5KS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NEZFRVx1NjUzOVx1NTQwRVx1NzY4NFx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIG9yaWdpbmFsSGVhZGVycyk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChuZXdCb2R5KTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFx1MjcxNyBcdTU5MDRcdTc0MDZcdTc2N0JcdTVGNTVcdTU0Q0RcdTVFOTRcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIHByb3h5UmVzLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU5NzVFXHU3NjdCXHU1RjU1XHU4QkY3XHU2QzQyXHU2MjE2XHU2Q0ExXHU2NzA5IHRva2VuIFx1NjVGNlx1RkYwQ1x1NkI2M1x1NUUzOFx1OEY2Q1x1NTNEMVx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBwcm94eVJlcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIHByb3h5UmVzLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFx1MjcxNyBcdThCRkJcdTUzRDZcdTU0Q0RcdTVFOTRcdTZENDFcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyKTtcbiAgICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogb3JpZ2luIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1x1NEVFM1x1NzQwNlx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NjVGNlx1NTFGQVx1OTUxOScgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU5NTE5XHU4QkVGXG4gICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyOiBFcnJvciwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBFcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQcm94eV0gUmVxdWVzdCBVUkw6JywgcmVxLnVybCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQcm94eV0gVGFyZ2V0OicsIGJhY2tlbmRUYXJnZXQpO1xuICAgICAgICBpZiAocmVzICYmICFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogYFx1NEVFM1x1NzQwNlx1OTUxOVx1OEJFRlx1RkYxQVx1NjVFMFx1NkNENVx1OEZERVx1NjNBNVx1NTIzMFx1NTQwRVx1N0FFRlx1NjcwRFx1NTJBMVx1NTY2OCAke2JhY2tlbmRUYXJnZXR9YCxcbiAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gIH1cbn07XG5cbmV4cG9ydCB7IHByb3h5IH07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHNcIjsvKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODAnLFxuICAgIHByb2RIb3N0OiAnYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnYWRtaW4tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MScsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsb2dpc3RpY3MtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MicsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdxdWFsaXR5LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHByb2RIb3N0OiAncXVhbGl0eS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdwcm9kdWN0aW9uLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODQnLFxuICAgIHByb2RIb3N0OiAncHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdlbmdpbmVlcmluZy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODUnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg1JyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ21vYmlsZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkxJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVGMDBcdTUzRDFcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbERldlBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcucHJlUG9ydCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU3QUVGXHU1M0UzXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeURldlBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0ID09PSBwb3J0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQgPT09IHBvcnQpO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGUtYXBwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUtYXBwLWNvbmZpZy50c1wiOy8qKlxyXG4gKiBWaXRlIFx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxyXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRBcHBDb25maWcsIHR5cGUgQXBwRW52Q29uZmlnIH0gZnJvbSAnLi9hcHAtZW52LmNvbmZpZyc7XHJcblxyXG4vKipcclxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Vml0ZUFwcENvbmZpZyhhcHBOYW1lOiBzdHJpbmcpOiB7XHJcbiAgZGV2UG9ydDogbnVtYmVyO1xyXG4gIGRldkhvc3Q6IHN0cmluZztcclxuICBwcmVQb3J0OiBudW1iZXI7XHJcbiAgcHJlSG9zdDogc3RyaW5nO1xyXG4gIHByb2RIb3N0OiBzdHJpbmc7XHJcbiAgbWFpbkFwcE9yaWdpbjogc3RyaW5nO1xyXG59IHtcclxuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XHJcbiAgaWYgKCFhcHBDb25maWcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XHJcbiAgY29uc3QgbWFpbkFwcE9yaWdpbiA9IG1haW5BcHBDb25maWdcclxuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxyXG4gICAgOiAnaHR0cDovL2xvY2FsaG9zdDo0MTgwJztcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRldlBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXHJcbiAgICBkZXZIb3N0OiBhcHBDb25maWcuZGV2SG9zdCxcclxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXHJcbiAgICBwcmVIb3N0OiBhcHBDb25maWcucHJlSG9zdCxcclxuICAgIHByb2RIb3N0OiBhcHBDb25maWcucHJvZEhvc3QsXHJcbiAgICBtYWluQXBwT3JpZ2luLFxyXG4gIH07XHJcbn1cclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVosU0FBUyxvQkFBb0I7QUFDcGIsT0FBTyxTQUFTO0FBRWhCLE9BQU8sWUFBWTtBQUNuQixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLFlBQVksb0JBQW9CO0FBQ3pDLFNBQVMsZUFBZTtBQUV4QixTQUFTLFdBQVc7OztBQ0pwQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQUs3QixTQUFTLHlCQUF5QjtB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UUFDSjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7OztBQ3RNTyxJQUFNLGtCQUFrQztBQUFBLEVBQzdDO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNU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
