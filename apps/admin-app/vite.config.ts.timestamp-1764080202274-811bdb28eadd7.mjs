// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.20_@types+node@24.7.0_sass@1.93.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.20_vue@3.5.22/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.20/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.2_postcss@8.5.6_vite@5.4.20/node_modules/unocss/dist/vite.mjs";
import VueI18nPlugin from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@intlify+unplugin-vue-i18n@1.6.0_vue-i18n@11.1.12/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";
import { existsSync, readFileSync } from "node:fs";

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

// vite-plugin-title-inject.ts
var titles = {
  "zh-CN": {
    "/": "\u9996\u9875",
    "/test/crud": "CRUD\u6D4B\u8BD5",
    "/test/svg-plugin": "SVG\u63D2\u4EF6\u6D4B\u8BD5",
    "/test/i18n": "\u56FD\u9645\u5316\u6D4B\u8BD5",
    "/test/select-button": "\u72B6\u6001\u5207\u6362\u6309\u94AE",
    "/platform/domains": "\u57DF\u5217\u8868",
    "/platform/modules": "\u6A21\u5757\u5217\u8868",
    "/platform/plugins": "\u63D2\u4EF6\u5217\u8868",
    "/org/tenants": "\u79DF\u6237\u5217\u8868",
    "/org/departments": "\u90E8\u95E8\u5217\u8868",
    "/org/users": "\u7528\u6237\u5217\u8868",
    "/access/resources": "\u8D44\u6E90\u5217\u8868",
    "/access/actions": "\u884C\u4E3A\u5217\u8868",
    "/access/permissions": "\u6743\u9650\u5217\u8868",
    "/access/roles": "\u89D2\u8272\u5217\u8868",
    "/access/policies": "\u7B56\u7565\u5217\u8868",
    "/access/perm-compose": "\u6743\u9650\u7EC4\u5408",
    "/navigation/menus": "\u83DC\u5355\u5217\u8868",
    "/navigation/menus/preview": "\u83DC\u5355\u9884\u89C8",
    "/ops/audit": "\u64CD\u4F5C\u65E5\u5FD7",
    "/ops/baseline": "\u6743\u9650\u57FA\u7EBF",
    "/ops/simulator": "\u7B56\u7565\u6A21\u62DF\u5668"
  },
  "en-US": {
    "/": "Home",
    "/test/crud": "CRUD Test",
    "/test/svg-plugin": "SVG Plugin Test",
    "/test/i18n": "i18n Test",
    "/test/select-button": "Select Button",
    "/platform/domains": "Domain List",
    "/platform/modules": "Module List",
    "/platform/plugins": "Plugin List",
    "/org/tenants": "Tenant List",
    "/org/departments": "Department List",
    "/org/users": "User List",
    "/access/resources": "Resource List",
    "/access/actions": "Action List",
    "/access/permissions": "Permission List",
    "/access/roles": "Role List",
    "/access/policies": "Policy List",
    "/access/perm-compose": "Permission Composition",
    "/navigation/menus": "Menu List",
    "/navigation/menus/preview": "Menu Preview",
    "/ops/audit": "Audit Logs",
    "/ops/baseline": "Permission Baseline",
    "/ops/simulator": "Policy Simulator"
  }
};
function getLocaleFromCookie(cookieHeader) {
  if (!cookieHeader) return "zh-CN";
  const match = cookieHeader.match(/(?:^|;\s*)locale=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]).replace(/"/g, "");
    } catch {
      return "zh-CN";
    }
  }
  return "zh-CN";
}
function titleInjectPlugin() {
  let requestPath = "/";
  let requestCookie = "";
  return {
    name: "vite-plugin-title-inject",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        requestPath = req.url || "/";
        requestCookie = req.headers.cookie || "";
        next();
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const locale = getLocaleFromCookie(requestCookie);
        const titleMap = titles[locale] || titles["zh-CN"];
        const pageTitle = titleMap[requestPath] || "BTC \u8F66\u95F4\u6D41\u7A0B\u7BA1\u7406\u7CFB\u7EDF";
        return html.replace("__PAGE_TITLE__", pageTitle);
      }
    }
  };
}

// src/config/proxy.ts
var proxy = {
  "/api": {
    target: "http://10.80.9.76:8115",
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 处理响应头，添加 CORS 头
    configure: (proxy2, options) => {
      proxy2.on("proxyRes", (proxyRes, req, res) => {
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
      proxy2.on("error", (err, req, res) => {
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
      proxy2.on("proxyReq", (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> http://10.80.9.76:8115${req.url}`);
      });
    }
  }
};

// vite.config.ts
import { btc } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/vite-plugin/dist/index.mjs";

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
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/admin-app/vite.config.ts";
var appConfig = getAppConfig("admin-app");
if (!appConfig) {
  throw new Error("\u672A\u627E\u5230 admin-app \u7684\u73AF\u5883\u914D\u7F6E");
}
var APP_PORT = parseInt(appConfig.prePort, 10);
var APP_HOST = appConfig.preHost;
var MAIN_APP_CONFIG = getAppConfig("system-app");
var MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : "http://localhost:4180";
if (process.env.NODE_ENV === "production" || process.env.BUILD) {
  console.log(`[admin-app] \u6784\u5EFA\u914D\u7F6E - base: http://${APP_HOST}:${APP_PORT}/`);
}
var chunkVerifyPlugin = () => {
  return {
    name: "chunk-verify-plugin",
    writeBundle(options, bundle) {
      console.log("\n[chunk-verify-plugin] \u2705 \u751F\u6210\u7684\u6240\u6709 chunk \u6587\u4EF6\uFF1A");
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      console.log(`
JS chunk\uFF08\u5171 ${jsChunks.length} \u4E2A\uFF09\uFF1A`);
      jsChunks.forEach((chunk) => console.log(`  - ${chunk}`));
      console.log(`
CSS chunk\uFF08\u5171 ${cssChunks.length} \u4E2A\uFF09\uFF1A`);
      cssChunks.forEach((chunk) => console.log(`  - ${chunk}`));
      const requiredChunks = ["element-plus", "vendor"];
      const vueChunks = ["vue-core", "vue-router", "pinia", "vue-vendor"];
      const hasVueChunk = vueChunks.some(
        (chunkName) => jsChunks.some((jsChunk) => jsChunk.includes(chunkName))
      );
      const missingRequiredChunks = requiredChunks.filter(
        (chunkName) => !jsChunks.some((jsChunk) => jsChunk.includes(chunkName))
      );
      const hasAppSrc = jsChunks.some((jsChunk) => jsChunk.includes("app-src"));
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      const indexSize = indexChunk ? bundle[indexChunk]?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      if (!hasAppSrc && indexSizeKB > 500) {
        console.warn(`
[chunk-verify-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1Aapp-src chunk \u4E0D\u5B58\u5728\uFF0C\u4F46 index \u6587\u4EF6\u5F88\u5927 (${indexSizeKB.toFixed(2)}KB)`);
        console.warn(`[chunk-verify-plugin] \u5E94\u7528\u4EE3\u7801\u53EF\u80FD\u88AB\u6253\u5305\u5230\u4E86\u5165\u53E3\u6587\u4EF6\uFF0C\u8FD9\u53EF\u80FD\u5BFC\u81F4\u52A0\u8F7D\u6027\u80FD\u95EE\u9898`);
      } else if (!hasAppSrc) {
        missingRequiredChunks.push("app-src");
      }
      if (!hasVueChunk) {
        missingRequiredChunks.push("vue-core/vue-router/pinia");
      }
      if (missingRequiredChunks.length > 0) {
        console.error(`
[chunk-verify-plugin] \u274C \u7F3A\u5931\u6838\u5FC3 chunk\uFF1A`, missingRequiredChunks);
        throw new Error(`\u6838\u5FC3 chunk \u7F3A\u5931\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01`);
      } else {
        console.log(`
[chunk-verify-plugin] \u2705 \u6838\u5FC3 chunk \u5168\u90E8\u5B58\u5728`);
      }
    }
  };
};
var optimizeChunksPlugin = () => {
  return {
    name: "optimize-chunks",
    generateBundle(options, bundle) {
      const emptyChunks = [];
      const chunkReferences = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunk.type === "chunk" && chunk.imports) {
          for (const imported of chunk.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported).push(fileName);
          }
        }
      }
      if (emptyChunks.length === 0) {
        return;
      }
      const chunksToRemove = [];
      const chunksToKeep = [];
      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
        if (referencedBy.length > 0) {
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === "chunk") {
            chunk.code = "export {};";
            chunksToKeep.push(emptyChunk);
            console.log(`[optimize-chunks] \u4FDD\u7559\u88AB\u5F15\u7528\u7684\u7A7A chunk: ${emptyChunk} (\u88AB ${referencedBy.length} \u4E2A chunk \u5F15\u7528\uFF0C\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26)`);
          }
        } else {
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }
      if (chunksToRemove.length > 0) {
        console.log(`[optimize-chunks] \u79FB\u9664\u4E86 ${chunksToRemove.length} \u4E2A\u672A\u88AB\u5F15\u7528\u7684\u7A7A chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        console.log(`[optimize-chunks] \u4FDD\u7559\u4E86 ${chunksToKeep.length} \u4E2A\u88AB\u5F15\u7528\u7684\u7A7A chunk\uFF08\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26\uFF09:`, chunksToKeep);
      }
    }
  };
};
var ensureBaseUrlPlugin = () => {
  const baseUrl = `http://${APP_HOST}:${APP_PORT}/`;
  const mainAppPort = MAIN_APP_CONFIG?.prePort || "4180";
  return {
    name: "ensure-base-url",
    // 使用 renderChunk 钩子，在代码生成时处理
    renderChunk(code, chunk, options) {
      let newCode = code;
      let modified = false;
      const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
      if (relativePathRegex.test(newCode)) {
        newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
          return `${quote}${baseUrl.replace(/\/$/, "")}${path}`;
        });
        modified = true;
      }
      const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}/assets/`, "g");
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, `${baseUrl}assets/`);
        modified = true;
      }
      const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}/assets/`, "g");
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, `//${APP_HOST}:${APP_PORT}/assets/`);
        modified = true;
      }
      const patterns = [
        // 绝对路径，带协议
        {
          regex: new RegExp(`(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
          replacement: `$1${APP_HOST}:${APP_PORT}$3`
        },
        // 协议相对路径
        {
          regex: new RegExp(`(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
          replacement: `$1${APP_HOST}:${APP_PORT}$3`
        },
        // 字符串字面量中的路径
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
          replacement: `$1$2${APP_HOST}:${APP_PORT}$4`
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
          replacement: `$1$2${APP_HOST}:${APP_PORT}$4`
        }
      ];
      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      }
      if (modified) {
        console.log(`[ensure-base-url] \u4FEE\u590D\u4E86 ${chunk.fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84 (${mainAppPort} -> ${APP_PORT})`);
        return {
          code: newCode,
          map: null
        };
      }
      return null;
    },
    // 同时在 generateBundle 中处理，作为兜底
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          let newCode = chunk.code;
          let modified = false;
          const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
          if (relativePathRegex.test(newCode)) {
            newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
              return `${quote}${baseUrl.replace(/\/$/, "")}${path}`;
            });
            modified = true;
          }
          const wrongPortHttpRegex = new RegExp(`http://${APP_HOST}:${mainAppPort}/assets/`, "g");
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, `${baseUrl}assets/`);
            modified = true;
          }
          const wrongPortProtocolRegex = new RegExp(`//${APP_HOST}:${mainAppPort}/assets/`, "g");
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, `//${APP_HOST}:${APP_PORT}/assets/`);
            modified = true;
          }
          const patterns = [
            new RegExp(`http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
            new RegExp(`//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
            new RegExp(`(["'\`])http://(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g"),
            new RegExp(`(["'\`])//(localhost|${APP_HOST}):${mainAppPort}(/[^"'\`\\s]*)`, "g")
          ];
          for (const pattern of patterns) {
            if (pattern.test(newCode)) {
              newCode = newCode.replace(pattern, (match) => {
                if (match.includes("http://")) {
                  return match.replace(new RegExp(`:${mainAppPort}`, "g"), `:${APP_PORT}`);
                } else if (match.includes("//")) {
                  return match.replace(new RegExp(`:${mainAppPort}`, "g"), `:${APP_PORT}`);
                }
                return match;
              });
              modified = true;
            }
          }
          if (modified) {
            chunk.code = newCode;
            console.log(`[ensure-base-url] \u5728 generateBundle \u4E2D\u4FEE\u590D\u4E86 ${fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        }
      }
    }
  };
};
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
    if (req.method === "OPTIONS") {
      const origin2 = req.headers.origin;
      if (origin2) {
        res.setHeader("Access-Control-Allow-Origin", origin2);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      }
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
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
    next();
  };
  return {
    name: "cors-with-credentials",
    enforce: "pre",
    // 确保在其他插件之前执行
    configureServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsDevMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsPreviewMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    }
  };
};
var withSrc = (relativePath) => resolve(fileURLToPath(new URL(".", __vite_injected_original_import_meta_url)), relativePath);
var withPackages = (relativePath) => resolve(fileURLToPath(new URL("../../packages", __vite_injected_original_import_meta_url)), relativePath);
var withRoot = (relativePath) => resolve(fileURLToPath(new URL("../..", __vite_injected_original_import_meta_url)), relativePath);
var ensureCssPlugin = () => {
  return {
    name: "ensure-css-plugin",
    generateBundle(options, bundle) {
      const jsFiles = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      let hasInlineCss = false;
      jsFiles.forEach((file) => {
        const chunk = bundle[file];
        if (chunk && chunk.code && typeof chunk.code === "string") {
          const isModulePreload = chunk.code.includes("modulepreload") || chunk.code.includes("relList");
          if (!isModulePreload && (chunk.code.includes("<style>") || chunk.code.includes("text/css") && chunk.code.includes("insertStyle"))) {
            hasInlineCss = true;
            console.warn(`[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u5728 ${file} \u4E2D\u68C0\u6D4B\u5230\u53EF\u80FD\u7684\u5185\u8054 CSS`);
          }
        }
      });
      if (hasInlineCss) {
        console.warn("[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u68C0\u6D4B\u5230 CSS \u53EF\u80FD\u88AB\u5185\u8054\u5230 JS \u4E2D\uFF0C\u8FD9\u4F1A\u5BFC\u81F4 qiankun \u65E0\u6CD5\u6B63\u786E\u52A0\u8F7D\u6837\u5F0F");
        console.warn("[ensure-css-plugin] \u8BF7\u68C0\u67E5 vite-plugin-qiankun \u914D\u7F6E\u548C build.assetsInlineLimit \u8BBE\u7F6E");
      }
    },
    writeBundle(options, bundle) {
      const cssFiles = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      if (cssFiles.length === 0) {
        console.error("[ensure-css-plugin] \u274C \u9519\u8BEF\uFF1A\u6784\u5EFA\u4EA7\u7269\u4E2D\u65E0 CSS \u6587\u4EF6\uFF01");
        console.error("[ensure-css-plugin] \u8BF7\u68C0\u67E5\uFF1A");
        console.error("1. \u5165\u53E3\u6587\u4EF6\u662F\u5426\u9759\u6001\u5BFC\u5165\u5168\u5C40\u6837\u5F0F\uFF08index.css/uno.css/element-plus.css\uFF09");
        console.error("2. \u662F\u5426\u6709 Vue \u7EC4\u4EF6\u4E2D\u4F7F\u7528 <style> \u6807\u7B7E");
        console.error("3. UnoCSS \u914D\u7F6E\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5BFC\u5165 @unocss all");
        console.error("4. vite-plugin-qiankun \u7684 useDevMode \u662F\u5426\u5728\u751F\u4EA7\u73AF\u5883\u6B63\u786E\u5173\u95ED");
        console.error("5. build.assetsInlineLimit \u662F\u5426\u8BBE\u7F6E\u4E3A 0\uFF08\u7981\u6B62\u5185\u8054\uFF09");
      } else {
        console.log(`[ensure-css-plugin] \u2705 \u6210\u529F\u6253\u5305 ${cssFiles.length} \u4E2A CSS \u6587\u4EF6\uFF1A`, cssFiles);
        cssFiles.forEach((file) => {
          const asset = bundle[file];
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            console.log(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            console.log(`  - ${asset.fileName || file}`);
          }
        });
      }
    }
  };
};
var BASE_URL = `http://${APP_HOST}:${APP_PORT}/`;
console.log(`[admin-app vite.config] Base URL: ${BASE_URL}, APP_HOST: ${APP_HOST}, APP_PORT: ${APP_PORT}`);
var vite_config_default = defineConfig({
  // 关键：base 使用子应用的绝对路径，确保资源路径正确
  // 在 qiankun 环境中，主应用的资源拦截器会修复资源路径
  // 使用绝对路径可以确保独立运行时资源路径正确
  base: BASE_URL,
  resolve: {
    alias: {
      "@": withSrc("src"),
      "@modules": withSrc("src/modules"),
      "@services": withSrc("src/services"),
      "@components": withSrc("src/components"),
      "@utils": withSrc("src/utils"),
      "@auth": withRoot("auth"),
      "@btc/shared-core": withPackages("shared-core/src"),
      "@btc/shared-components": withPackages("shared-components/src"),
      "@btc/shared-utils": withPackages("shared-utils/src"),
      "@btc/subapp-manifests": withPackages("subapp-manifests/src/index.ts"),
      "@btc-common": withPackages("shared-components/src/common"),
      "@btc-components": withPackages("shared-components/src/components"),
      "@btc-styles": withPackages("shared-components/src/styles"),
      "@btc-locales": withPackages("shared-components/src/locales"),
      "@assets": withPackages("shared-components/src/assets"),
      "@plugins": withPackages("shared-components/src/plugins"),
      "@btc-utils": withPackages("shared-components/src/utils"),
      "@btc-crud": withPackages("shared-components/src/crud"),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      "@charts-utils/css-var": withPackages("shared-components/src/charts/utils/css-var"),
      "@charts-utils/color": withPackages("shared-components/src/charts/utils/color"),
      "@charts-utils/gradient": withPackages("shared-components/src/charts/utils/gradient"),
      "@charts-composables/useChartComponent": withPackages("shared-components/src/charts/composables/useChartComponent"),
      "@charts-types": withPackages("shared-components/src/charts/types"),
      "@charts-utils": withPackages("shared-components/src/charts/utils"),
      "@charts-composables": withPackages("shared-components/src/charts/composables"),
      "element-plus/es": "element-plus/es",
      "element-plus/dist": "element-plus/dist"
    },
    dedupe: ["element-plus", "@element-plus/icons-vue", "vue", "vue-router", "pinia", "dayjs"]
  },
  plugins: [
    corsPlugin(),
    // 1. CORS 插件（最前面，不干扰构建）
    titleInjectPlugin(),
    // 2. 自定义插件（无构建干扰）
    vue({
      // 3. Vue 插件（核心构建插件）
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file) => readFileSync(file, "utf-8")
        }
      }
    }),
    createAutoImportConfig(),
    // 4. 自动导入插件
    createComponentsConfig({ includeShared: true }),
    // 5. 组件自动注册插件
    UnoCSS({
      // 6. UnoCSS 插件（样式构建）
      configFile: withRoot("uno.config.ts")
    }),
    btc({
      // 7. 业务插件
      type: "subapp",
      proxy,
      eps: {
        enable: true,
        dict: false,
        dist: "./build/eps"
      },
      svg: {
        skipNames: ["base", "icons"]
      }
    }),
    VueI18nPlugin({
      // 8. i18n 插件
      include: [
        fileURLToPath(new URL("./src/{modules,plugins}/**/locales/**", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-components/src/locales/**", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-components/src/plugins/**/locales/**", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts", __vite_injected_original_import_meta_url))
      ],
      runtimeOnly: true
    }),
    ensureCssPlugin(),
    // 9. CSS 验证插件（在构建后检查）
    // 10. qiankun 插件（最后执行，不干扰其他插件的 chunk 生成）
    qiankun("admin", {
      // 关键：使用 useDevMode: true，与 logistics-app 保持一致
      // 虽然理论上生产环境应该关闭，但实际测试发现 useDevMode: false 会导致入口文件及其依赖被打包到 index 中
      // 使用 useDevMode: true 可以确保代码正确拆分到 app-src chunk
      useDevMode: true
    }),
    // 11. 兜底插件（路径修复、chunk 优化，在最后）
    ensureBaseUrlPlugin(),
    // 恢复路径修复（确保 chunk 路径正确）
    optimizeChunksPlugin(),
    // 恢复空 chunk 处理（仅移除未被引用的空 chunk）
    chunkVerifyPlugin()
    // 新增：chunk 验证插件
  ],
  esbuild: {
    charset: "utf8"
  },
  server: {
    port: parseInt(appConfig.devPort, 10),
    host: "0.0.0.0",
    strictPort: false,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    },
    hmr: {
      // HMR WebSocket 需要使用 localhost，浏览器无法连接 0.0.0.0
      host: appConfig.devHost,
      port: parseInt(appConfig.devPort, 10),
      overlay: false
      // 关闭热更新错误浮层，减少开销
    },
    proxy,
    fs: {
      strict: false,
      allow: [
        withRoot("."),
        withPackages("."),
        withPackages("shared-components/src")
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
    proxy,
    headers: {
      // 允许主应用（4180）跨域访问当前子应用资源
      "Access-Control-Allow-Origin": MAIN_APP_ORIGIN,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    }
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
      "@btc/shared-utils",
      "vite-plugin-qiankun/dist/helper",
      "qiankun",
      "single-spa"
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // 强制预构建，即使依赖已经是最新的
    // 如果遇到模块解析问题，临时设置为 true 强制重新预构建
    force: false,
    // 确保依赖正确解析
    esbuildOptions: {
      plugins: []
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"],
        // 添加共享组件样式目录到 includePaths，确保 @use 相对路径能正确解析
        includePaths: [
          withPackages("shared-components/src/styles")
        ]
      }
    },
    // 强制 Vite 提取 CSS（关键兜底配置）
    devSourcemap: false
    // 生产环境关闭 CSS sourcemap
  },
  build: {
    target: "es2020",
    // 兼容 ES 模块的最低目标
    sourcemap: false,
    // 开发环境关闭 sourcemap，减少文件体积和加载时间
    // 确保构建时使用正确的 base 路径
    // base 已在顶层配置，这里不需要重复设置
    // 启用 CSS 代码分割，与主域保持一致，确保所有 CSS 都被正确提取
    // 每个 chunk 的样式会被提取到对应的 CSS 文件中，确保样式完整
    cssCodeSplit: true,
    // 确保 CSS 文件被正确输出和压缩
    cssMinify: true,
    // 禁止内联任何资源（确保 JS/CSS 都是独立文件）
    assetsInlineLimit: 0,
    // 明确指定输出目录，确保 CSS 文件被正确输出
    outDir: "dist",
    assetsDir: "assets",
    // 让 Vite 自动从 index.html 读取入口（与其他子应用一致）
    rollupOptions: {
      // 抑制 Rollup 关于动态/静态导入冲突的警告（这些警告不影响功能）
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message && typeof warning.message === "string" && warning.message.includes("dynamically imported") && warning.message.includes("statically imported")) {
          return;
        }
        warn(warning);
      },
      output: {
        format: "esm",
        // 明确指定输出格式为 ESM
        inlineDynamicImports: false,
        // 禁用动态导入内联，确保 CSS 被提取
        manualChunks(id) {
          if (id.includes("element-plus") || id.includes("@element-plus")) {
            return "element-plus";
          }
          if (id.includes("node_modules")) {
            if (id.includes("vue") && !id.includes("vue-router") && !id.includes("vue-i18n") && !id.includes("element-plus")) {
              return "vue-core";
            }
            if (id.includes("vue-router")) {
              return "vue-router";
            }
            if (id.includes("pinia")) {
              return "pinia";
            }
            if (id.includes("vue-i18n") || id.includes("@intlify")) {
              return "vue-i18n";
            }
            if (id.includes("echarts")) {
              return "lib-echarts";
            }
            if (id.includes("monaco-editor")) {
              return "lib-monaco";
            }
            if (id.includes("three")) {
              return "lib-three";
            }
            return "vendor";
          }
          if (id.includes("src/") && !id.includes("node_modules")) {
            if (id.includes("src/modules")) {
              const moduleName = id.match(/src\/modules\/([^/]+)/)?.[1];
              if (moduleName && ["access", "navigation", "org", "ops", "platform", "strategy", "api-services"].includes(moduleName)) {
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
            if (id.includes("src/bootstrap")) {
              return "app-src";
            }
            if (id.includes("src/config")) {
              return "app-src";
            }
            if (id.includes("src/composables")) {
              return "app-composables";
            }
            if (id.includes("src/router")) {
              return "app-router";
            }
            if (id.includes("src/i18n")) {
              return "app-src";
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
            return "btc-shared";
          }
          return void 0;
        },
        // 关键：强制所有资源路径使用绝对路径（基于 base）
        // Vite 默认会根据 base 生成绝对路径，但显式声明作为兜底
        // 确保所有资源路径都包含子应用端口（4181），而非主应用端口（4180）
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/[name]-[hash].css";
          }
          return "assets/[name]-[hash].[ext]";
        }
      },
      // 确保第三方样式（如 Element Plus）不被 tree-shaking
      external: [],
      // 关闭 tree-shaking（避免误删依赖 chunk）
      // 子应用微前端场景，tree-shaking 收益极低，风险极高
      treeshake: false
    },
    chunkSizeWarningLimit: 2e3
    // 提高警告阈值，element-plus chunk 较大是正常的
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAidml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0LnRzIiwgInNyYy9jb25maWcvcHJveHkudHMiLCAiLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nO1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSc7XG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bi92aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZUF1dG9JbXBvcnRDb25maWcsIGNyZWF0ZUNvbXBvbmVudHNDb25maWcgfSBmcm9tICcuLi8uLi9jb25maWdzL2F1dG8taW1wb3J0LmNvbmZpZyc7XG5pbXBvcnQgeyB0aXRsZUluamVjdFBsdWdpbiB9IGZyb20gJy4vdml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0JztcbmltcG9ydCB7IHByb3h5IH0gZnJvbSAnLi9zcmMvY29uZmlnL3Byb3h5JztcbmltcG9ydCB7IGJ0YyB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8vIFx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdhZG1pbi1hcHAnKTtcbmlmICghYXBwQ29uZmlnKSB7XG4gIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2MjdFXHU1MjMwIGFkbWluLWFwcCBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkUnKTtcbn1cblxuLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU5ODg0XHU4OUM4XHU3QUVGXHU1M0UzXHU1NDhDXHU0RTNCXHU2NzNBXHVGRjA4XHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4XHVGRjA5XG5jb25zdCBBUFBfUE9SVCA9IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCk7XG5jb25zdCBBUFBfSE9TVCA9IGFwcENvbmZpZy5wcmVIb3N0O1xuY29uc3QgTUFJTl9BUFBfQ09ORklHID0gZ2V0QXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XG5jb25zdCBNQUlOX0FQUF9PUklHSU4gPSBNQUlOX0FQUF9DT05GSUcgPyBgaHR0cDovLyR7TUFJTl9BUFBfQ09ORklHLnByZUhvc3R9OiR7TUFJTl9BUFBfQ09ORklHLnByZVBvcnR9YCA6ICdodHRwOi8vbG9jYWxob3N0OjQxODAnO1xuXG4vLyBcdTY3ODRcdTVFRkFcdTY1RjZcdThGOTNcdTUxRkEgYmFzZSBcdTkxNERcdTdGNkVcdUZGMENcdTc1MjhcdTRFOEVcdThDMDNcdThCRDVcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nIHx8IHByb2Nlc3MuZW52LkJVSUxEKSB7XG4gIGNvbnNvbGUubG9nKGBbYWRtaW4tYXBwXSBcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkUgLSBiYXNlOiBodHRwOi8vJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0vYCk7XG59XG5cbi8vIFx1OUE4Q1x1OEJDMVx1NjI0MFx1NjcwOSBjaHVuayBcdTc1MUZcdTYyMTBcdTYzRDJcdTRFRjZcbmNvbnN0IGNodW5rVmVyaWZ5UGx1Z2luID0gKCk6IFBsdWdpbiA9PiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NodW5rLXZlcmlmeS1wbHVnaW4nLFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgY29uc29sZS5sb2coJ1xcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU3NTFGXHU2MjEwXHU3Njg0XHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1RkYxQScpO1xuICAgICAgLy8gXHU1MjA2XHU3QzdCXHU2MjUzXHU1MzcwIEpTIGNodW5rXHUzMDAxQ1NTIGNodW5rXHUzMDAxXHU1MTc2XHU0RUQ2XHU4RDQ0XHU2RTkwXG4gICAgICBjb25zdCBqc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgY29uc3QgY3NzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuSlMgY2h1bmtcdUZGMDhcdTUxNzEgJHtqc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAganNDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuQ1NTIGNodW5rXHVGRjA4XHU1MTcxICR7Y3NzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBjc3NDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY4MzhcdTVGQzMgY2h1bmsgXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHVGRjA4XHU5MDdGXHU1MTREXHU1MTczXHU5NTJFXHU0RjlEXHU4RDU2XHU0RTIyXHU1OTMxXHVGRjA5XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUF2dWUtdmVuZG9yIFx1NTNFRlx1ODBGRFx1ODhBQlx1NjJDNlx1NTIwNlx1NEUzQSB2dWUtY29yZVx1MzAwMXZ1ZS1yb3V0ZXJcdTMwMDFwaW5pYVx1RkYwQ1x1NjI0MFx1NEVFNVx1NjhDMFx1NjdFNVx1OEZEOVx1NEU5QlxuICAgICAgY29uc3QgcmVxdWlyZWRDaHVua3MgPSBbJ2VsZW1lbnQtcGx1cycsICd2ZW5kb3InXTtcbiAgICAgIGNvbnN0IHZ1ZUNodW5rcyA9IFsndnVlLWNvcmUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICd2dWUtdmVuZG9yJ107XG4gICAgICBjb25zdCBoYXNWdWVDaHVuayA9IHZ1ZUNodW5rcy5zb21lKGNodW5rTmFtZSA9PlxuICAgICAgICBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcyhjaHVua05hbWUpKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IG1pc3NpbmdSZXF1aXJlZENodW5rcyA9IHJlcXVpcmVkQ2h1bmtzLmZpbHRlcihjaHVua05hbWUgPT5cbiAgICAgICAgIWpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKGNodW5rTmFtZSkpXG4gICAgICApO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTUgYXBwLXNyYyBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTRGNDYgaW5kZXggXHU2NTg3XHU0RUY2XHU1Rjg4XHU1OTI3XHVGRjBDXHU4QkY0XHU2NjBFXHU1RTk0XHU3NTI4XHU0RUUzXHU3ODAxXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU0RTg2XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBoYXNBcHBTcmMgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnYXBwLXNyYycpKTtcbiAgICAgIGNvbnN0IGluZGV4Q2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnaW5kZXgtJykpO1xuICAgICAgY29uc3QgaW5kZXhTaXplID0gaW5kZXhDaHVuayA/IChidW5kbGVbaW5kZXhDaHVua10gYXMgYW55KT8uY29kZT8ubGVuZ3RoIHx8IDAgOiAwO1xuICAgICAgY29uc3QgaW5kZXhTaXplS0IgPSBpbmRleFNpemUgLyAxMDI0O1xuXG4gICAgICAvLyBcdTU5ODJcdTY3OUMgaW5kZXggXHU2NTg3XHU0RUY2XHU4RDg1XHU4RkM3IDUwMEtCXHVGRjBDXHU4QkY0XHU2NjBFXHU1RTk0XHU3NTI4XHU0RUUzXHU3ODAxXHU1M0VGXHU4MEZEXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU0RTg2XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XG4gICAgICAvLyBcdThGRDlcdTc5Q0RcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENcdTYyMTFcdTRFRUNcdTUxNDFcdThCQjhcdTZDQTFcdTY3MDkgYXBwLXNyY1x1RkYwQ1x1NEY0Nlx1NEYxQVx1N0VEOVx1NTFGQVx1OEI2Nlx1NTQ0QVxuICAgICAgaWYgKCFoYXNBcHBTcmMgJiYgaW5kZXhTaXplS0IgPiA1MDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQWFwcC1zcmMgY2h1bmsgXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RjQ2IGluZGV4IFx1NjU4N1x1NEVGNlx1NUY4OFx1NTkyNyAoJHtpbmRleFNpemVLQi50b0ZpeGVkKDIpfUtCKWApO1xuICAgICAgICBjb25zb2xlLndhcm4oYFtjaHVuay12ZXJpZnktcGx1Z2luXSBcdTVFOTRcdTc1MjhcdTRFRTNcdTc4MDFcdTUzRUZcdTgwRkRcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTRFODZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMENcdThGRDlcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTUyQTBcdThGN0RcdTYwMjdcdTgwRkRcdTk1RUVcdTk4OThgKTtcbiAgICAgICAgLy8gXHU0RTBEXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjBDXHU1M0VBXHU3RUQ5XHU1MUZBXHU4QjY2XHU1NDRBXG4gICAgICB9IGVsc2UgaWYgKCFoYXNBcHBTcmMpIHtcbiAgICAgICAgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzLnB1c2goJ2FwcC1zcmMnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNWdWVDaHVuaykge1xuICAgICAgICBtaXNzaW5nUmVxdWlyZWRDaHVua3MucHVzaCgndnVlLWNvcmUvdnVlLXJvdXRlci9waW5pYScpO1xuICAgICAgfVxuXG4gICAgICBpZiAobWlzc2luZ1JlcXVpcmVkQ2h1bmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTdGM0FcdTU5MzFcdTY4MzhcdTVGQzMgY2h1bmtcdUZGMUFgLCBtaXNzaW5nUmVxdWlyZWRDaHVua3MpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjgzOFx1NUZDMyBjaHVuayBcdTdGM0FcdTU5MzFcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjgzOFx1NUZDMyBjaHVuayBcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcblxuLy8gXHU0RjE4XHU1MzE2XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU2M0QyXHU0RUY2XHVGRjFBXHU1OTA0XHU3NDA2XHU3QTdBIGNodW5rXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2IDQwNFxuY29uc3Qgb3B0aW1pemVDaHVua3NQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnb3B0aW1pemUtY2h1bmtzJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcbiAgICAgIC8vIFx1NjUzNlx1OTZDNlx1NjI0MFx1NjcwOVx1N0E3QSBjaHVua1xuICAgICAgY29uc3QgZW1wdHlDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua1JlZmVyZW5jZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7IC8vIGNodW5rIFx1NTQwRFx1NzlGMCAtPiBcdTVGMTVcdTc1MjhcdTVCODNcdTc2ODQgY2h1bmsgXHU1MjE3XHU4ODY4XG5cbiAgICAgIC8vIFx1N0IyQ1x1NEUwMFx1NkI2NVx1RkYxQVx1NjI3RVx1NTFGQVx1NjI0MFx1NjcwOVx1N0E3QSBjaHVua1x1RkYwQ1x1NUU3Nlx1NjUzNlx1OTZDNlx1NUYxNVx1NzUyOFx1NTE3M1x1N0NGQlxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGNodW5rLmNvZGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGVtcHR5Q2h1bmtzLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NjUzNlx1OTZDNiBjaHVuayBcdTc2ODRcdTRGOURcdThENTZcdTUxNzNcdTdDRkJcdUZGMDhcdTU0RUFcdTRFOUIgY2h1bmsgXHU1RjE1XHU3NTI4XHU0RTg2XHU4RkQ5XHU0RTJBIGNodW5rXHVGRjA5XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGNodW5rLmltcG9ydHMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGltcG9ydGVkIG9mIGNodW5rLmltcG9ydHMpIHtcbiAgICAgICAgICAgIGlmICghY2h1bmtSZWZlcmVuY2VzLmhhcyhpbXBvcnRlZCkpIHtcbiAgICAgICAgICAgICAgY2h1bmtSZWZlcmVuY2VzLnNldChpbXBvcnRlZCwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2h1bmtSZWZlcmVuY2VzLmdldChpbXBvcnRlZCkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW1wdHlDaHVua3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU3QjJDXHU0RThDXHU2QjY1XHVGRjFBXHU1QkY5XHU0RThFXHU2QkNGXHU0RTJBXHU3QTdBIGNodW5rXHVGRjBDXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU4OEFCXHU1RjE1XHU3NTI4XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTg4QUJcdTVGMTVcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDZcdUZGMDhcdTU0MDhcdTVFNzZcdTUyMzBcdTVGMTVcdTc1MjhcdTVCODNcdTc2ODQgY2h1bmsgXHU2MjE2XHU0RkREXHU3NTU5XHU1MzYwXHU0RjREXHU3QjI2XHVGRjA5XG4gICAgICBjb25zdCBjaHVua3NUb1JlbW92ZTogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGNodW5rc1RvS2VlcDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBlbXB0eUNodW5rIG9mIGVtcHR5Q2h1bmtzKSB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZWRCeSA9IGNodW5rUmVmZXJlbmNlcy5nZXQoZW1wdHlDaHVuaykgfHwgW107XG4gICAgICAgICAgaWYgKHJlZmVyZW5jZWRCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gXHU4OEFCXHU1RjE1XHU3NTI4XHU0RTg2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1MjIwXHU5NjY0XHVGRjBDXHU5NzAwXHU4OTgxXHU0RkREXHU3NTU5XHU2MjE2XHU1NDA4XHU1RTc2XG4gICAgICAgICAgLy8gXHU2NUI5XHU2ODQ4XHVGRjFBXHU0RkREXHU3NTU5XHU0RTAwXHU0RTJBXHU2NzAwXHU1QzBGXHU3Njg0XHU2NzA5XHU2NTQ4IEVTIFx1NkEyMVx1NTc1N1x1NEVFM1x1NzgwMVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1OTUxOVx1OEJFRlxuICAgICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICAgIGlmIChjaHVuayAmJiBjaHVuay50eXBlID09PSAnY2h1bmsnKSB7XG4gICAgICAgICAgICAvLyBcdTUyMUJcdTVFRkFcdTRFMDBcdTRFMkFcdTY3MDBcdTVDMEZcdTc2ODRcdTY3MDlcdTY1NDggRVMgXHU2QTIxXHU1NzU3XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU5NTE5XHU4QkVGXG4gICAgICAgICAgICAvLyBcdTRGN0ZcdTc1MjggZXhwb3J0IHt9IFx1Nzg2RVx1NEZERFx1NUI4M1x1NjYyRlx1NEUwMFx1NEUyQVx1NjcwOVx1NjU0OFx1NzY4NCBFUyBcdTZBMjFcdTU3NTdcbiAgICAgICAgICAgIGNodW5rLmNvZGUgPSAnZXhwb3J0IHt9Oyc7XG4gICAgICAgICAgICBjaHVua3NUb0tlZXAucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6ICR7ZW1wdHlDaHVua30gKFx1ODhBQiAke3JlZmVyZW5jZWRCeS5sZW5ndGh9IFx1NEUyQSBjaHVuayBcdTVGMTVcdTc1MjhcdUZGMENcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjYpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NkNBMVx1NjcwOVx1ODhBQlx1NUYxNVx1NzUyOFx1RkYwQ1x1NTNFRlx1NEVFNVx1NUI4OVx1NTE2OFx1NTIyMFx1OTY2NFxuICAgICAgICAgIGNodW5rc1RvUmVtb3ZlLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtlbXB0eUNodW5rXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2h1bmtzVG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW29wdGltaXplLWNodW5rc10gXHU3OUZCXHU5NjY0XHU0RTg2ICR7Y2h1bmtzVG9SZW1vdmUubGVuZ3RofSBcdTRFMkFcdTY3MkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6YCwgY2h1bmtzVG9SZW1vdmUpO1xuICAgICAgfVxuICAgICAgaWYgKGNodW5rc1RvS2VlcC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTRFODYgJHtjaHVua3NUb0tlZXAubGVuZ3RofSBcdTRFMkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bmtcdUZGMDhcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDk6YCwgY2h1bmtzVG9LZWVwKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcblxuLy8gXHU3ODZFXHU0RkREXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0IGJhc2UgVVJMIFx1NjNEMlx1NEVGNlxuY29uc3QgZW5zdXJlQmFzZVVybFBsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHA6Ly8ke0FQUF9IT1NUfToke0FQUF9QT1JUfS9gO1xuICBjb25zdCBtYWluQXBwUG9ydCA9IE1BSU5fQVBQX0NPTkZJRz8ucHJlUG9ydCB8fCAnNDE4MCc7IC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwQ1x1OTcwMFx1ODk4MVx1NjZGRlx1NjM2Mlx1NzY4NFx1NzZFRVx1NjgwN1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1iYXNlLXVybCcsXG4gICAgLy8gXHU0RjdGXHU3NTI4IHJlbmRlckNodW5rIFx1OTRBOVx1NUI1MFx1RkYwQ1x1NTcyOFx1NEVFM1x1NzgwMVx1NzUxRlx1NjIxMFx1NjVGNlx1NTkwNFx1NzQwNlxuICAgIHJlbmRlckNodW5rKGNvZGUsIGNodW5rLCBvcHRpb25zKSB7XG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgLy8gMS4gXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1OTgyIC9hc3NldHMveHh4LmpzXHVGRjBDXHU2NzJBXHU1RTI2XHU3QUVGXHU1M0UzXHVGRjBDXHU5NzAwXHU2MkZDXHU2M0E1IGJhc2VcdUZGMDlcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKS9nO1xuICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKG1hdGNoLCBxdW90ZSwgcGF0aCkgPT4ge1xuICAgICAgICAgIC8vIFx1NjJGQ1x1NjNBNVx1NUI1MFx1NUU5NFx1NzUyOCBiYXNlXHVGRjBDXHU1OTgyIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MS9hc3NldHMveHh4LmpzXG4gICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyAyLiBcdTVCNTBcdTVFOTRcdTc1MjggYmFzZSBcdTg4QUJcdTk1MTlcdThCRUZcdTY2RkZcdTYzNjJcdTRFM0EgNDE4MCBcdTc2ODRcdTYwQzVcdTUxQjVcdUZGMDhcdTU5ODIgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHhcdUZGMDlcbiAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRIdHRwUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgYCR7YmFzZVVybH1hc3NldHMvYCk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gMy4gXHU1MzRGXHU4QkFFXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4Ly9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4XHVGRjA5XG4gICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCBgLy8ke0FQUF9IT1NUfToke0FQUF9QT1JUfS9hc3NldHMvYCk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gNC4gXHU1MTc2XHU0RUQ2XHU1M0VGXHU4MEZEXHU3Njg0XHU5NTE5XHU4QkVGXHU3QUVGXHU1M0UzXHU2ODNDXHU1RjBGXHVGRjA4XHU4OTg2XHU3NkQ2XHU2MjQwXHU2NzA5XHU2MEM1XHU1MUI1XHVGRjA5XG4gICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgLy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1RTI2XHU1MzRGXHU4QkFFXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKGh0dHA6Ly8pKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiBgJDEke0FQUF9IT1NUfToke0FQUF9QT1JUfSQzYCxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gXHU1MzRGXHU4QkFFXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKC8vKShsb2NhbGhvc3R8JHtBUFBfSE9TVH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSopYCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogYCQxJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0kM2AsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFx1NUI1N1x1N0IyNlx1NEUzMlx1NUI1N1x1OTc2Mlx1OTFDRlx1NEUyRFx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoaHR0cDovLykobG9jYWxob3N0fCR7QVBQX0hPU1R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10qKWAsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAkMSQyJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0kNGAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKSgvLykobG9jYWxob3N0fCR7QVBQX0hPU1R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10qKWAsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAkMSQyJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0kNGAsXG4gICAgICAgIH0sXG4gICAgICBdO1xuXG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4ucmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocGF0dGVybi5yZWdleCwgcGF0dGVybi5yZXBsYWNlbWVudCk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU0RTg2ICR7Y2h1bmsuZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NCAoJHttYWluQXBwUG9ydH0gLT4gJHtBUFBfUE9SVH0pYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogbmV3Q29kZSxcbiAgICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgLy8gXHU1NDBDXHU2NUY2XHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NTkwNFx1NzQwNlx1RkYwQ1x1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVxuICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGNodW5rLmNvZGUpIHtcbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGNodW5rLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyAxLiBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykvZztcbiAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKG1hdGNoLCBxdW90ZSwgcGF0aCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAyLiA0MTgwIFx1N0FFRlx1NTNFM1x1NjZGRlx1NjM2MlxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCBgJHtiYXNlVXJsfWFzc2V0cy9gKTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAzLiBcdTUzNEZcdThCQUVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIGAvLyR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9L2Fzc2V0cy9gKTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA0LiBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTdBRUZcdTUzRTNcdTY4M0NcdTVGMEZcbiAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoYGh0dHA6Ly8obG9jYWxob3N0fCR7QVBQX0hPU1R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10qKWAsICdnJyksXG4gICAgICAgICAgICBuZXcgUmVnRXhwKGAvLyhsb2NhbGhvc3R8JHtBUFBfSE9TVH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSopYCwgJ2cnKSxcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoYChbXCInXFxgXSlodHRwOi8vKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKS8vKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLCAobWF0Y2gpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5jbHVkZXMoJ2h0dHA6Ly8nKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoLnJlcGxhY2UobmV3IFJlZ0V4cChgOiR7bWFpbkFwcFBvcnR9YCwgJ2cnKSwgYDoke0FQUF9QT1JUfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2guaW5jbHVkZXMoJy8vJykpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaC5yZXBsYWNlKG5ldyBSZWdFeHAoYDoke21haW5BcHBQb3J0fWAsICdnJyksIGA6JHtBUFBfUE9SVH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgY2h1bmsuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NEZFRVx1NTkwRFx1NEU4NiAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcblxuLy8gQ09SUyBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHNcdUZGMDlcbmNvbnN0IGNvcnNQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgLy8gQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcdTUxRkRcdTY1NzBcdUZGMDhcdTc1MjhcdTRFOEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDlcbiAgY29uc3QgY29yc0Rldk1pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAvLyBcdThCQkVcdTdGNkUgQ09SUyBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTYyNDBcdTY3MDlcdThCRjdcdTZDNDJcdTkwRkRcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgLy8gQ2hyb21lIFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1ODk4MVx1NkM0Mlx1RkYwOFx1NEVDNVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IG9yaWdpblx1RkYwQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NTdGQVx1NjcyQ1x1NzY4NCBDT1JTIFx1NTkzNFx1RkYwOFx1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1Njc2NVx1NkU5MFx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIC8vIENocm9tZSBcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTg5ODFcdTZDNDJcdUZGMDhcdTRFQzVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIC8vIENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XHU1MUZEXHU2NTcwXHVGRjA4XHU3NTI4XHU0RThFXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XHVGRjA5XG4gIGNvbnN0IGNvcnNQcmV2aWV3TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MiAtIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NEVGQlx1NEY1NVx1NTE3Nlx1NEVENlx1NTkwNFx1NzQwNlx1NEU0Qlx1NTI0RFx1OEZENFx1NTZERVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgICAgLy8gXHU4QkJFXHU3RjZFIENPUlMgXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QkY5XHU0RThFXHU5NzVFIE9QVElPTlMgXHU4QkY3XHU2QzQyXHVGRjBDXHU4QkJFXHU3RjZFIENPUlMgXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsIC8vIFx1Nzg2RVx1NEZERFx1NTcyOFx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYxQVx1NTMwNVx1NTQyQlx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFxuICAgICAgLy8gXHU3NkY0XHU2M0E1XHU2REZCXHU1MkEwXHU1MjMwXHU0RTJEXHU5NUY0XHU0RUY2XHU2ODA4XHU2NzAwXHU1MjREXHU5NzYyXG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICAvLyBcdTc5RkJcdTk2NjRcdTUzRUZcdTgwRkRcdTVERjJcdTVCNThcdTU3MjhcdTc2ODQgQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIC8vIFx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1NkRGQlx1NTJBMCBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlxuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc0Rldk1pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzRGV2TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjFBXHU0RTBEXHU1MzA1XHU1NDJCXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbmNvbnN0IHdpdGhTcmMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+XG4gIHJlc29sdmUoZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSksIHJlbGF0aXZlUGF0aCk7XG5cbmNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT5cbiAgcmVzb2x2ZShmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzJywgaW1wb3J0Lm1ldGEudXJsKSksIHJlbGF0aXZlUGF0aCk7XG5cbmNvbnN0IHdpdGhSb290ID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PlxuICByZXNvbHZlKGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4nLCBpbXBvcnQubWV0YS51cmwpKSwgcmVsYXRpdmVQYXRoKTtcblxuLy8gXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdTYyNTNcdTUzMDVcdTc2ODRcdTYzRDJcdTRFRjZcdUZGMDhcdTU4OUVcdTVGM0FcdTcyNDhcdThCQ0FcdTY1QUQgKyBcdTVGM0FcdTUyMzZcdTYzRDBcdTUzRDZcdUZGMDlcbmNvbnN0IGVuc3VyZUNzc1BsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtY3NzLXBsdWdpbicsXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAvLyBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2OEMwXHU2N0U1XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTZDQTFcdTY3MDlcdTg4QUJcdTUxODVcdTgwNTRcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBDU1MgXHU4OEFCXHU1MTg1XHU4MDU0XHU1MjMwIEpTIFx1NjU4N1x1NEVGNlx1NEUyRFxuICAgICAgY29uc3QganNGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgbGV0IGhhc0lubGluZUNzcyA9IGZhbHNlO1xuICAgICAganNGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlXSBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVuayAmJiBjaHVuay5jb2RlICYmIHR5cGVvZiBjaHVuay5jb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQlx1NTE4NVx1ODA1NFx1NzY4NCBDU1NcdUZGMDhcdTkwMUFcdThGQzcgc3R5bGUgXHU2ODA3XHU3QjdFXHU2MjE2IENTUyBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDlcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFtb2R1bGVwcmVsb2FkIHBvbHlmaWxsIFx1NEVFM1x1NzgwMVx1NTNFRlx1ODBGRFx1NTMwNVx1NTQyQiAndGV4dC9jc3MnXHVGRjBDXHU5NzAwXHU4OTgxXHU2MzkyXHU5NjY0XG4gICAgICAgICAgY29uc3QgaXNNb2R1bGVQcmVsb2FkID0gY2h1bmsuY29kZS5pbmNsdWRlcygnbW9kdWxlcHJlbG9hZCcpIHx8IGNodW5rLmNvZGUuaW5jbHVkZXMoJ3JlbExpc3QnKTtcbiAgICAgICAgICBpZiAoIWlzTW9kdWxlUHJlbG9hZCAmJiAoY2h1bmsuY29kZS5pbmNsdWRlcygnPHN0eWxlPicpIHx8IChjaHVuay5jb2RlLmluY2x1ZGVzKCd0ZXh0L2NzcycpICYmIGNodW5rLmNvZGUuaW5jbHVkZXMoJ2luc2VydFN0eWxlJykpKSkge1xuICAgICAgICAgICAgaGFzSW5saW5lQ3NzID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBXHVGRjFBXHU1NzI4ICR7ZmlsZX0gXHU0RTJEXHU2OEMwXHU2RDRCXHU1MjMwXHU1M0VGXHU4MEZEXHU3Njg0XHU1MTg1XHU4MDU0IENTU2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNJbmxpbmVDc3MpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTY4QzBcdTZENEJcdTUyMzAgQ1NTIFx1NTNFRlx1ODBGRFx1ODhBQlx1NTE4NVx1ODA1NFx1NTIzMCBKUyBcdTRFMkRcdUZGMENcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgcWlhbmt1biBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTUyQTBcdThGN0RcdTY4MzdcdTVGMEYnKTtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1OEJGN1x1NjhDMFx1NjdFNSB2aXRlLXBsdWdpbi1xaWFua3VuIFx1OTE0RFx1N0Y2RVx1NTQ4QyBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdThCQkVcdTdGNkUnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgLy8gXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjhDMFx1NjdFNVx1RkYwQ1x1NkI2NFx1NjVGNlx1NjI0MFx1NjcwOVx1NjU4N1x1NEVGNlx1OTBGRFx1NURGMlx1NzUxRlx1NjIxMFxuICAgICAgY29uc3QgY3NzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG4gICAgICBpZiAoY3NzRmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzRDIFx1OTUxOVx1OEJFRlx1RkYxQVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjVFMCBDU1MgXHU2NTg3XHU0RUY2XHVGRjAxJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1XHVGRjFBJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzEuIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE2OFx1NUM0MFx1NjgzN1x1NUYwRlx1RkYwOGluZGV4LmNzcy91bm8uY3NzL2VsZW1lbnQtcGx1cy5jc3NcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMi4gXHU2NjJGXHU1NDI2XHU2NzA5IFZ1ZSBcdTdFQzRcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjggPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMy4gVW5vQ1NTIFx1OTE0RFx1N0Y2RVx1NjYyRlx1NTQyNlx1NkI2M1x1Nzg2RVx1RkYwQ1x1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NSBAdW5vY3NzIGFsbCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc0LiB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzY4NCB1c2VEZXZNb2RlIFx1NjYyRlx1NTQyNlx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NkI2M1x1Nzg2RVx1NTE3M1x1OTVFRCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc1LiBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdTY2MkZcdTU0MjZcdThCQkVcdTdGNkVcdTRFM0EgMFx1RkYwOFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1RkYwOScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIC8vIFx1NjI1M1x1NTM3MCBDU1MgXHU2NTg3XHU0RUY2XHU3Njg0XHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGXHVGRjA4XHU1OTI3XHU1QzBGL1x1OERFRlx1NUY4NFx1RkYwOVxuICAgICAgICBjc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgICBpZiAoYXNzZXQgJiYgYXNzZXQuc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplS0IgPSAoYXNzZXQuc291cmNlLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtICR7ZmlsZX06ICR7c2l6ZUtCfUtCYCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldCAmJiBhc3NldC5maWxlTmFtZSkge1xuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDIHNvdXJjZSBcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENcdTgxRjNcdTVDMTFcdTY2M0VcdTc5M0FcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gJHthc3NldC5maWxlTmFtZSB8fCBmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbi8vIFx1Njc4NFx1NUVGQVx1NjVGNlx1OEY5M1x1NTFGQSBiYXNlIFx1OTE0RFx1N0Y2RVx1RkYwQ1x1NzUyOFx1NEU4RVx1OEMwM1x1OEJENVxuY29uc3QgQkFTRV9VUkwgPSBgaHR0cDovLyR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9L2A7XG5jb25zb2xlLmxvZyhgW2FkbWluLWFwcCB2aXRlLmNvbmZpZ10gQmFzZSBVUkw6ICR7QkFTRV9VUkx9LCBBUFBfSE9TVDogJHtBUFBfSE9TVH0sIEFQUF9QT1JUOiAke0FQUF9QT1JUfWApO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFiYXNlIFx1NEY3Rlx1NzUyOFx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1Nzg2RVx1NEZERFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAvLyBcdTU3MjggcWlhbmt1biBcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTRFM0JcdTVFOTRcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTYyRTZcdTYyMkFcdTU2NjhcdTRGMUFcdTRGRUVcdTU5MERcdThENDRcdTZFOTBcdThERUZcdTVGODRcbiAgLy8gXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU1M0VGXHU0RUU1XHU3ODZFXHU0RkREXHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHU2NUY2XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU2QjYzXHU3ODZFXG4gIGJhc2U6IEJBU0VfVVJMLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogd2l0aFNyYygnc3JjJyksXG4gICAgICAnQG1vZHVsZXMnOiB3aXRoU3JjKCdzcmMvbW9kdWxlcycpLFxuICAgICAgJ0BzZXJ2aWNlcyc6IHdpdGhTcmMoJ3NyYy9zZXJ2aWNlcycpLFxuICAgICAgJ0Bjb21wb25lbnRzJzogd2l0aFNyYygnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAdXRpbHMnOiB3aXRoU3JjKCdzcmMvdXRpbHMnKSxcbiAgICAgICdAYXV0aCc6IHdpdGhSb290KCdhdXRoJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC11dGlscy9zcmMnKSxcbiAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnOiB3aXRoUGFja2FnZXMoJ3N1YmFwcC1tYW5pZmVzdHMvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQGJ0Yy1jb21tb24nOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24nKSxcbiAgICAgICdAYnRjLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGJ0Yy1zdHlsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMnKSxcbiAgICAgICdAYnRjLWxvY2FsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzJyksXG4gICAgICAnQGFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxuICAgICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgICAgJ0BidGMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscycpLFxuICAgICAgJ0BidGMtY3J1ZCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcbiAgICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwQ1x1NTNCQlx1NjM4OSAudHMgXHU2MjY5XHU1QzU1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA5XG4gICAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAgICdAY2hhcnRzLXR5cGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzJyksXG4gICAgICAnQGNoYXJ0cy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscycpLFxuICAgICAgJ0BjaGFydHMtY29tcG9zYWJsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMnKSxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMnOiAnZWxlbWVudC1wbHVzL2VzJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZGlzdCc6ICdlbGVtZW50LXBsdXMvZGlzdCcsXG4gICAgfSxcbiAgICBkZWR1cGU6IFsnZWxlbWVudC1wbHVzJywgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJywgJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2RheWpzJ10sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBjb3JzUGx1Z2luKCksIC8vIDEuIENPUlMgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU0RTBEXHU1RTcyXHU2MjcwXHU2Nzg0XHU1RUZBXHVGRjA5XG4gICAgdGl0bGVJbmplY3RQbHVnaW4oKSwgLy8gMi4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjA4XHU2NUUwXHU2Nzg0XHU1RUZBXHU1RTcyXHU2MjcwXHVGRjA5XG4gICAgdnVlKHtcbiAgICAgIC8vIDMuIFZ1ZSBcdTYzRDJcdTRFRjZcdUZGMDhcdTY4MzhcdTVGQzNcdTY3ODRcdTVFRkFcdTYzRDJcdTRFRjZcdUZGMDlcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuICAgIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSwgLy8gNC4gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksIC8vIDUuIFx1N0VDNFx1NEVGNlx1ODFFQVx1NTJBOFx1NkNFOFx1NTE4Q1x1NjNEMlx1NEVGNlxuICAgIFVub0NTUyh7XG4gICAgICAvLyA2LiBVbm9DU1MgXHU2M0QyXHU0RUY2XHVGRjA4XHU2ODM3XHU1RjBGXHU2Nzg0XHU1RUZBXHVGRjA5XG4gICAgICBjb25maWdGaWxlOiB3aXRoUm9vdCgndW5vLmNvbmZpZy50cycpLFxuICAgIH0pLFxuICAgIGJ0Yyh7XG4gICAgICAvLyA3LiBcdTRFMUFcdTUyQTFcdTYzRDJcdTRFRjZcbiAgICAgIHR5cGU6ICdzdWJhcHAnIGFzIGFueSxcbiAgICAgIHByb3h5LFxuICAgICAgZXBzOiB7XG4gICAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgICAgZGljdDogZmFsc2UsXG4gICAgICAgIGRpc3Q6ICcuL2J1aWxkL2VwcycsXG4gICAgICB9LFxuICAgICAgc3ZnOiB7XG4gICAgICAgIHNraXBOYW1lczogWydiYXNlJywgJ2ljb25zJ10sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIFZ1ZUkxOG5QbHVnaW4oe1xuICAgICAgLy8gOC4gaTE4biBcdTYzRDJcdTRFRjZcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy97bW9kdWxlcyxwbHVnaW5zfS8qKi9sb2NhbGVzLyoqJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvKionLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucy8qKi9sb2NhbGVzLyoqJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTi50cycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMudHMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIF0sXG4gICAgICBydW50aW1lT25seTogdHJ1ZSxcbiAgICB9KSxcbiAgICBlbnN1cmVDc3NQbHVnaW4oKSwgLy8gOS4gQ1NTIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1Njc4NFx1NUVGQVx1NTQwRVx1NjhDMFx1NjdFNVx1RkYwOVxuICAgIC8vIDEwLiBxaWFua3VuIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjcwMFx1NTQwRVx1NjI2N1x1ODg0Q1x1RkYwQ1x1NEUwRFx1NUU3Mlx1NjI3MFx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NzY4NCBjaHVuayBcdTc1MUZcdTYyMTBcdUZGMDlcbiAgICBxaWFua3VuKCdhZG1pbicsIHtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEY3Rlx1NzUyOCB1c2VEZXZNb2RlOiB0cnVlXHVGRjBDXHU0RTBFIGxvZ2lzdGljcy1hcHAgXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XG4gICAgICAvLyBcdTg2N0RcdTcxMzZcdTc0MDZcdThCQkFcdTRFMEFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTVFOTRcdThCRTVcdTUxNzNcdTk1RURcdUZGMENcdTRGNDZcdTVCOUVcdTk2NDVcdTZENEJcdThCRDVcdTUzRDFcdTczQjAgdXNlRGV2TW9kZTogZmFsc2UgXHU0RjFBXHU1QkZDXHU4MUY0XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU1M0NBXHU1MTc2XHU0RjlEXHU4RDU2XHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwIGluZGV4IFx1NEUyRFxuICAgICAgLy8gXHU0RjdGXHU3NTI4IHVzZURldk1vZGU6IHRydWUgXHU1M0VGXHU0RUU1XHU3ODZFXHU0RkREXHU0RUUzXHU3ODAxXHU2QjYzXHU3ODZFXHU2MkM2XHU1MjA2XHU1MjMwIGFwcC1zcmMgY2h1bmtcbiAgICAgIHVzZURldk1vZGU6IHRydWUsXG4gICAgfSksXG4gICAgLy8gMTEuIFx1NTE1Q1x1NUU5NVx1NjNEMlx1NEVGNlx1RkYwOFx1OERFRlx1NUY4NFx1NEZFRVx1NTkwRFx1MzAwMWNodW5rIFx1NEYxOFx1NTMxNlx1RkYwQ1x1NTcyOFx1NjcwMFx1NTQwRVx1RkYwOVxuICAgIGVuc3VyZUJhc2VVcmxQbHVnaW4oKSwgLy8gXHU2MDYyXHU1OTBEXHU4REVGXHU1Rjg0XHU0RkVFXHU1OTBEXHVGRjA4XHU3ODZFXHU0RkREIGNodW5rIFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVx1RkYwOVxuICAgIG9wdGltaXplQ2h1bmtzUGx1Z2luKCksIC8vIFx1NjA2Mlx1NTkwRFx1N0E3QSBjaHVuayBcdTU5MDRcdTc0MDZcdUZGMDhcdTRFQzVcdTc5RkJcdTk2NjRcdTY3MkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bmtcdUZGMDlcbiAgICBjaHVua1ZlcmlmeVBsdWdpbigpLCAvLyBcdTY1QjBcdTU4OUVcdUZGMUFjaHVuayBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcbiAgXSxcbiAgZXNidWlsZDoge1xuICAgIGNoYXJzZXQ6ICd1dGY4JyxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogcGFyc2VJbnQoYXBwQ29uZmlnLmRldlBvcnQsIDEwKSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXG4gICAgY29yczogdHJ1ZSxcbiAgICBvcmlnaW46IGBodHRwOi8vJHthcHBDb25maWcuZGV2SG9zdH06JHthcHBDb25maWcuZGV2UG9ydH1gLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgnLFxuICAgIH0sXG4gICAgaG1yOiB7XG4gICAgICAvLyBITVIgV2ViU29ja2V0IFx1OTcwMFx1ODk4MVx1NEY3Rlx1NzUyOCBsb2NhbGhvc3RcdUZGMENcdTZENEZcdTg5QzhcdTU2NjhcdTY1RTBcdTZDRDVcdThGREVcdTYzQTUgMC4wLjAuMFxuICAgICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgICBwb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgICAgb3ZlcmxheTogZmFsc2UsIC8vIFx1NTE3M1x1OTVFRFx1NzBFRFx1NjZGNFx1NjVCMFx1OTUxOVx1OEJFRlx1NkQ2RVx1NUM0Mlx1RkYwQ1x1NTFDRlx1NUMxMVx1NUYwMFx1OTUwMFxuICAgIH0sXG4gICAgcHJveHksXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgICBhbGxvdzogW1xuICAgICAgICB3aXRoUm9vdCgnLicpLFxuICAgICAgICB3aXRoUGFja2FnZXMoJy4nKSxcbiAgICAgICAgd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAgIF0sXG4gICAgICAvLyBcdTU0MkZcdTc1MjhcdTdGMTNcdTVCNThcdUZGMENcdTUyQTBcdTkwMUZcdTRGOURcdThENTZcdTUyQTBcdThGN0RcbiAgICAgIGNhY2hlZENoZWNrczogdHJ1ZSxcbiAgICB9LFxuICB9LFxuICAvLyBcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcdUZGMDhcdTU0MkZcdTUyQThcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2ODRcdTk3NTlcdTYwMDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDlcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IEFQUF9QT1JULFxuICAgIHN0cmljdFBvcnQ6IHRydWUsIC8vIFx1N0FFRlx1NTNFM1x1ODhBQlx1NTM2MFx1NzUyOFx1NjVGNlx1NjJBNVx1OTUxOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODFFQVx1NTJBOFx1NTIwN1x1NjM2MlxuICAgIG9wZW46IGZhbHNlLCAvLyBcdTU0MkZcdTUyQThcdTU0MEVcdTRFMERcdTgxRUFcdTUyQThcdTYyNTNcdTVGMDBcdTZENEZcdTg5QzhcdTU2NjhcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcHJveHksXG4gICAgaGVhZGVyczoge1xuICAgICAgLy8gXHU1MTQxXHU4QkI4XHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4NDE4MFx1RkYwOVx1OERFOFx1NTdERlx1OEJCRlx1OTVFRVx1NUY1M1x1NTI0RFx1NUI1MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IE1BSU5fQVBQX09SSUdJTixcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgLy8gXHU1NDJGXHU3NTI4XHU0RjlEXHU4RDU2XHU5ODg0XHU2Nzg0XHU1RUZBXHVGRjBDXHU1MkEwXHU5MDFGXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXG4gICAgLy8gXHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXHU5NzAwXHU4OTgxXHU5ODg0XHU2Nzg0XHU1RUZBXHU3Njg0XHU3QjJDXHU0RTA5XHU2NUI5XHU0RjlEXHU4RDU2XHVGRjBDXHU5MDdGXHU1MTREIFZpdGUgXHU2RjBGXHU1MjI0XHU1QkZDXHU4MUY0XHU1QjlFXHU2NUY2XHU3RjE2XHU4QkQxXHU4MDE3XHU2NUY2XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAgJ2RheWpzJyxcbiAgICAgICdlbGVtZW50LXBsdXMnLFxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscycsXG4gICAgICAndml0ZS1wbHVnaW4tcWlhbmt1bi9kaXN0L2hlbHBlcicsXG4gICAgICAncWlhbmt1bicsXG4gICAgICAnc2luZ2xlLXNwYScsXG4gICAgXSxcbiAgICAvLyBcdTYzOTJcdTk2NjRcdTRFMERcdTk3MDBcdTg5ODFcdTk4ODRcdTY3ODRcdTVFRkFcdTc2ODRcdTRGOURcdThENTZcbiAgICBleGNsdWRlOiBbXSxcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTk4ODRcdTY3ODRcdTVFRkFcdUZGMENcdTUzNzNcdTRGN0ZcdTRGOURcdThENTZcdTVERjJcdTdFQ0ZcdTY2MkZcdTY3MDBcdTY1QjBcdTc2ODRcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTkwNDdcdTUyMzBcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcdUZGMENcdTRFMzRcdTY1RjZcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZSBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICBmb3JjZTogZmFsc2UsXG4gICAgLy8gXHU3ODZFXHU0RkREXHU0RjlEXHU4RDU2XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgIH0sXG4gIH0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddLFxuICAgICAgICAvLyBcdTZERkJcdTUyQTBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTY4MzdcdTVGMEZcdTc2RUVcdTVGNTVcdTUyMzAgaW5jbHVkZVBhdGhzXHVGRjBDXHU3ODZFXHU0RkREIEB1c2UgXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4MEZEXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXG4gICAgICAgIGluY2x1ZGVQYXRoczogW1xuICAgICAgICAgIHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcycpLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFx1NUYzQVx1NTIzNiBWaXRlIFx1NjNEMFx1NTNENiBDU1NcdUZGMDhcdTUxNzNcdTk1MkVcdTUxNUNcdTVFOTVcdTkxNERcdTdGNkVcdUZGMDlcbiAgICBkZXZTb3VyY2VtYXA6IGZhbHNlLCAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTUxNzNcdTk1RUQgQ1NTIHNvdXJjZW1hcFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsIC8vIFx1NTE3Q1x1NUJCOSBFUyBcdTZBMjFcdTU3NTdcdTc2ODRcdTY3MDBcdTRGNEVcdTc2RUVcdTY4MDdcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTUxNzNcdTk1RUQgc291cmNlbWFwXHVGRjBDXHU1MUNGXHU1QzExXHU2NTg3XHU0RUY2XHU0RjUzXHU3OUVGXHU1NDhDXHU1MkEwXHU4RjdEXHU2NUY2XHU5NUY0XG4gICAgLy8gXHU3ODZFXHU0RkREXHU2Nzg0XHU1RUZBXHU2NUY2XHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0IGJhc2UgXHU4REVGXHU1Rjg0XG4gICAgLy8gYmFzZSBcdTVERjJcdTU3MjhcdTk4NzZcdTVDNDJcdTkxNERcdTdGNkVcdUZGMENcdThGRDlcdTkxQ0NcdTRFMERcdTk3MDBcdTg5ODFcdTkxQ0RcdTU5MERcdThCQkVcdTdGNkVcbiAgICAvLyBcdTU0MkZcdTc1MjggQ1NTIFx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1RkYwQ1x1NEUwRVx1NEUzQlx1NTdERlx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOSBDU1MgXHU5MEZEXHU4OEFCXHU2QjYzXHU3ODZFXHU2M0QwXHU1M0Q2XG4gICAgLy8gXHU2QkNGXHU0RTJBIGNodW5rIFx1NzY4NFx1NjgzN1x1NUYwRlx1NEYxQVx1ODhBQlx1NjNEMFx1NTNENlx1NTIzMFx1NUJGOVx1NUU5NFx1NzY4NCBDU1MgXHU2NTg3XHU0RUY2XHU0RTJEXHVGRjBDXHU3ODZFXHU0RkREXHU2ODM3XHU1RjBGXHU1QjhDXHU2NTc0XG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIC8vIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU4RjkzXHU1MUZBXHU1NDhDXHU1MzhCXHU3RjI5XG4gICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgIC8vIFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1NEVGQlx1NEY1NVx1OEQ0NFx1NkU5MFx1RkYwOFx1Nzg2RVx1NEZERCBKUy9DU1MgXHU5MEZEXHU2NjJGXHU3MkVDXHU3QUNCXHU2NTg3XHU0RUY2XHVGRjA5XG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgLy8gXHU2NjBFXHU3ODZFXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdThGOTNcdTUxRkFcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1NEVDRSBpbmRleC5odG1sIFx1OEJGQlx1NTNENlx1NTE2NVx1NTNFM1x1RkYwOFx1NEUwRVx1NTE3Nlx1NEVENlx1NUI1MFx1NUU5NFx1NzUyOFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIFx1NjI5MVx1NTIzNiBSb2xsdXAgXHU1MTczXHU0RThFXHU1MkE4XHU2MDAxL1x1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTFCMlx1N0E4MVx1NzY4NFx1OEI2Nlx1NTQ0QVx1RkYwOFx1OEZEOVx1NEU5Qlx1OEI2Nlx1NTQ0QVx1NEUwRFx1NUY3MVx1NTRDRFx1NTI5Rlx1ODBGRFx1RkYwOVxuICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcbiAgICAgICAgLy8gXHU1RkZEXHU3NTY1XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU1NDhDXHU5NzU5XHU2MDAxXHU1QkZDXHU1MTY1XHU1MUIyXHU3QTgxXHU3Njg0XHU4QjY2XHU1NDRBXG4gICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJyB8fFxuICAgICAgICAgICAgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnZHluYW1pY2FsbHkgaW1wb3J0ZWQnKSAmJlxuICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnc3RhdGljYWxseSBpbXBvcnRlZCcpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdThCNjZcdTU0NEFcdTZCNjNcdTVFMzhcdTY2M0VcdTc5M0FcbiAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZm9ybWF0OiAnZXNtJywgLy8gXHU2NjBFXHU3ODZFXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGXHU0RTNBIEVTTVxuICAgICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE4NVx1ODA1NFx1RkYwQ1x1Nzg2RVx1NEZERCBDU1MgXHU4OEFCXHU2M0QwXHU1M0Q2XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIC8vIFx1NTNDMlx1ODAwM1x1N0NGQlx1N0VERlx1NUU5NFx1NzUyOFx1NzY4NFx1OTE0RFx1N0Y2RVx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOSBjaHVuayBcdTZCNjNcdTc4NkVcdTc1MUZcdTYyMTBcbiAgICAgICAgICAvLyBcdTkxQ0RcdTg5ODFcdUZGMUFFbGVtZW50IFBsdXMgXHU3Njg0XHU1MzM5XHU5MTREXHU1RkM1XHU5ODdCXHU1NzI4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5IGVsZW1lbnQtcGx1cyBcdTc2RjhcdTUxNzNcdTRFRTNcdTc4MDFcdTkwRkRcdTU3MjhcdTU0MENcdTRFMDBcdTRFMkEgY2h1bmtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8IGlkLmluY2x1ZGVzKCdAZWxlbWVudC1wbHVzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZWxlbWVudC1wbHVzJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTU5MDRcdTc0MDYgbm9kZV9tb2R1bGVzIFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1OEZEQlx1ODg0Q1x1NEVFM1x1NzgwMVx1NTIwNlx1NTI3MlxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIC8vIFx1NTIwNlx1NTI3MiBWdWUgXHU3NkY4XHU1MTczXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZScpICYmICFpZC5pbmNsdWRlcygndnVlLXJvdXRlcicpICYmICFpZC5pbmNsdWRlcygndnVlLWkxOG4nKSAmJiAhaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndnVlLWNvcmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2dWUtcm91dGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTIwNlx1NTI3MiBQaW5pYVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwaW5pYScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAncGluaWEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdnVlLWkxOG5cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndnVlLWkxOG4nKSB8fCBpZC5pbmNsdWRlcygnQGludGxpZnknKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3Z1ZS1pMThuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NTkyN1x1NTc4Qlx1NUU5M1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdlY2hhcnRzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdsaWItZWNoYXJ0cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ21vbmFjby1lZGl0b3InKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd0aHJlZScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbGliLXRocmVlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEY1OSBub2RlX21vZHVsZXMgXHU0RjlEXHU4RDU2XHU1NDA4XHU1RTc2XHU1MjMwIHZlbmRvclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUU5NFx1NzUyOFx1NkU5MFx1NEVFM1x1NzgwMVx1RkYwOHNyYy8gXHU3NkVFXHU1RjU1XHVGRjA5XG4gICAgICAgICAgLy8gXHU1M0MyXHU4MDAzXHU3Q0ZCXHU3RURGXHU1RTk0XHU3NTI4XHU3Njg0XHU5MTREXHU3RjZFXHVGRjBDXHU4RkRCXHU4ODRDXHU3RUM2XHU1MjA2XHU3Njg0XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvJykgJiYgIWlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgLy8gXHU2QTIxXHU1NzU3XHU1MjA2XHU1MjcyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IGlkLm1hdGNoKC9zcmNcXC9tb2R1bGVzXFwvKFteL10rKS8pPy5bMV07XG4gICAgICAgICAgICAgIC8vIFx1NUJGOVx1NTkyN1x1NTc4Qlx1NkEyMVx1NTc1N1x1NTIxQlx1NUVGQVx1NTM1NVx1NzJFQ1x1NzY4NCBjaHVua1xuICAgICAgICAgICAgICBpZiAobW9kdWxlTmFtZSAmJiBbJ2FjY2VzcycsICduYXZpZ2F0aW9uJywgJ29yZycsICdvcHMnLCAncGxhdGZvcm0nLCAnc3RyYXRlZ3knLCAnYXBpLXNlcnZpY2VzJ10uaW5jbHVkZXMobW9kdWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYG1vZHVsZS0ke21vZHVsZU5hbWV9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gJ21vZHVsZS1vdGhlcnMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU5ODc1XHU5NzYyXHU2NTg3XHU0RUY2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9wYWdlcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXBhZ2VzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1N0VDNFx1NEVGNlx1NjU4N1x1NEVGNlxuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBY29tcG9uZW50cyBcdTUzRUZcdTgwRkRcdTRGOURcdThENTYgdXNlU2V0dGluZ3NTdGF0ZVx1MzAwMXN0b3JlXHUzMDAxdXRpbHMgXHU3QjQ5XHVGRjA4XHU1NzI4IGFwcC1zcmMgXHU0RTJEXHVGRjA5XHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9jb21wb25lbnRzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NUZBRVx1NTI0RFx1N0FFRlx1NzZGOFx1NTE3M1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvbWljcm8nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1taWNybyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTYzRDJcdTRFRjZcdTMwMDFzdG9yZVx1MzAwMXNlcnZpY2VzXHUzMDAxdXRpbHNcdTMwMDFib290c3RyYXAgXHU0RTBFXHU1OTFBXHU0RTJBXHU2QTIxXHU1NzU3XHU2NzA5XHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmMgXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9wbHVnaW5zJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3N0b3JlJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3NlcnZpY2VzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3V0aWxzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2Jvb3RzdHJhcCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9jb25maWcnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvY29tcG9zYWJsZXMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1jb21wb3NhYmxlcyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9yb3V0ZXInKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1yb3V0ZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaTE4biBcdTZBMjFcdTU3NTdcdTg4QUIgYm9vdHN0cmFwL2NvcmUvaTE4bi50cyBcdTRGN0ZcdTc1MjhcdUZGMDhcdTU3MjggYXBwLXNyYyBcdTRFMkRcdUZGMDlcdUZGMENcdTU0MDhcdTVFNzZcdTUyMzAgYXBwLXNyYyBcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2kxOG4nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvYXNzZXRzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtYXNzZXRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENiBzcmMgXHU2NTg3XHU0RUY2XHVGRjA4XHU1MzA1XHU2MkVDIG1haW4udHNcdUZGMDlcdTdFREZcdTRFMDBcdTU0MDhcdTVFNzZcdTUyMzAgYXBwLXNyY1xuICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtIFx1NTMwNVx1RkYwOFx1NTE3MVx1NEVBQlx1NTMwNVx1RkYwOVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtJykpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYnRjLWNvbXBvbmVudHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICdidGMtc2hhcmVkJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTVCRjlcdTRFOEVcdTY3MkFcdTUzMzlcdTkxNERcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMENcdThGRDRcdTU2REUgdW5kZWZpbmVkIFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1NTkwNFx1NzQwNlxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRSBsb2dpc3RpY3MtYXBwIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1OEZENFx1NTZERSB1bmRlZmluZWQgXHU4MDBDXHU0RTBEXHU2NjJGIGFwcC1zcmNcbiAgICAgICAgICAvLyBcdThGRDlcdTY4MzdcdTUzRUZcdTRFRTVcdTc4NkVcdTRGRERcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTg4QUJcdTUzNTVcdTcyRUNcdTU5MDRcdTc0MDZcdUZGMENcdTUxNzZcdTRFRDZcdTRFRTNcdTc4MDFcdTg4QUJcdTUyMDZcdTkxNERcdTUyMzAgYXBwLXNyY1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUYzQVx1NTIzNlx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NTdGQVx1NEU4RSBiYXNlXHVGRjA5XG4gICAgICAgIC8vIFZpdGUgXHU5RUQ4XHU4QkE0XHU0RjFBXHU2ODM5XHU2MzZFIGJhc2UgXHU3NTFGXHU2MjEwXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU0RjQ2XHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXHU0RjVDXHU0RTNBXHU1MTVDXHU1RTk1XG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OTBGRFx1NTMwNVx1NTQyQlx1NUI1MFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwODQxODFcdUZGMDlcdUZGMENcdTgwMENcdTk3NUVcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDg0MTgwXHVGRjA5XG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uY3NzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU4RDQ0XHU2RTkwXHVGRjA4XHU1NkZFXHU3MjQ3L1x1NUI1N1x1NEY1M1x1RkYwOVx1NjMwOVx1NTM5Rlx1NjcwOVx1ODlDNFx1NTIxOVx1OEY5M1x1NTFGQVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1N0IyQ1x1NEUwOVx1NjVCOVx1NjgzN1x1NUYwRlx1RkYwOFx1NTk4MiBFbGVtZW50IFBsdXNcdUZGMDlcdTRFMERcdTg4QUIgdHJlZS1zaGFraW5nXG4gICAgICBleHRlcm5hbDogW10sXG4gICAgICAvLyBcdTUxNzNcdTk1RUQgdHJlZS1zaGFraW5nXHVGRjA4XHU5MDdGXHU1MTREXHU4QkVGXHU1MjIwXHU0RjlEXHU4RDU2IGNodW5rXHVGRjA5XG4gICAgICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTVGQUVcdTUyNERcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMEN0cmVlLXNoYWtpbmcgXHU2NTM2XHU3NkNBXHU2NzgxXHU0RjRFXHVGRjBDXHU5OENFXHU5NjY5XHU2NzgxXHU5QUQ4XG4gICAgICB0cmVlc2hha2U6IGZhbHNlLFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLCAvLyBcdTYzRDBcdTlBRDhcdThCNjZcdTU0NEFcdTk2MDhcdTUwM0NcdUZGMENlbGVtZW50LXBsdXMgY2h1bmsgXHU4RjgzXHU1OTI3XHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHZpdGUtcGx1Z2luLXRpdGxlLWluamVjdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2FkbWluLWFwcC92aXRlLXBsdWdpbi10aXRsZS1pbmplY3QudHNcIjsvKipcbiAqIFZpdGUgXHU2M0QyXHU0RUY2XHVGRjFBXHU2NzBEXHU1MkExXHU3QUVGXHU2Q0U4XHU1MTY1XHU5ODc1XHU5NzYyXHU2ODA3XHU5ODk4XG4gKlxuICogXHU3NkVFXHU3Njg0XHVGRjFBXHU1NzI4IFZpdGUgZGV2IHNlcnZlciBcdThGRDRcdTU2REUgSFRNTCBcdTY1RjZcdUZGMENcdTY4MzlcdTYzNkVcdThCRjdcdTZDNDJcdThERUZcdTVGODRcdTU0OENcdThCRURcdThBMDBcdTY2RkZcdTYzNjIgX19QQUdFX1RJVExFX18gXHU1MzYwXHU0RjREXHU3QjI2XG4gKiBcdTY1NDhcdTY3OUNcdUZGMUFcdTUyMzdcdTY1QjBcdTY1RjZcdTZENEZcdTg5QzhcdTU2NjhcdTY4MDdcdTdCN0VcdTRFQ0VcdTdCMkNcdTRFMDBcdTVFMjdcdTVDMzFcdTY2M0VcdTc5M0FcdTZCNjNcdTc4NkVcdTY4MDdcdTk4OThcdUZGMENcdTY1RTBcdTk1RUFcdTcwQzFcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLy8gXHU2ODA3XHU5ODk4XHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA4XHU0RUNFIGkxOG4gXHU1NDBDXHU2QjY1XHVGRjA5XG5jb25zdCB0aXRsZXM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0ge1xuICAnemgtQ04nOiB7XG4gICAgJy8nOiAnXHU5OTk2XHU5ODc1JyxcbiAgICAnL3Rlc3QvY3J1ZCc6ICdDUlVEXHU2RDRCXHU4QkQ1JyxcbiAgICAnL3Rlc3Qvc3ZnLXBsdWdpbic6ICdTVkdcdTYzRDJcdTRFRjZcdTZENEJcdThCRDUnLFxuICAgICcvdGVzdC9pMThuJzogJ1x1NTZGRFx1OTY0NVx1NTMxNlx1NkQ0Qlx1OEJENScsXG4gICAgJy90ZXN0L3NlbGVjdC1idXR0b24nOiAnXHU3MkI2XHU2MDAxXHU1MjA3XHU2MzYyXHU2MzA5XHU5NEFFJyxcbiAgICAnL3BsYXRmb3JtL2RvbWFpbnMnOiAnXHU1N0RGXHU1MjE3XHU4ODY4JyxcbiAgICAnL3BsYXRmb3JtL21vZHVsZXMnOiAnXHU2QTIxXHU1NzU3XHU1MjE3XHU4ODY4JyxcbiAgICAnL3BsYXRmb3JtL3BsdWdpbnMnOiAnXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4JyxcbiAgICAnL29yZy90ZW5hbnRzJzogJ1x1NzlERlx1NjIzN1x1NTIxN1x1ODg2OCcsXG4gICAgJy9vcmcvZGVwYXJ0bWVudHMnOiAnXHU5MEU4XHU5NUU4XHU1MjE3XHU4ODY4JyxcbiAgICAnL29yZy91c2Vycyc6ICdcdTc1MjhcdTYyMzdcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL3Jlc291cmNlcyc6ICdcdThENDRcdTZFOTBcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL2FjdGlvbnMnOiAnXHU4ODRDXHU0RTNBXHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9wZXJtaXNzaW9ucyc6ICdcdTY3NDNcdTk2NTBcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL3JvbGVzJzogJ1x1ODlEMlx1ODI3Mlx1NTIxN1x1ODg2OCcsXG4gICAgJy9hY2Nlc3MvcG9saWNpZXMnOiAnXHU3QjU2XHU3NTY1XHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9wZXJtLWNvbXBvc2UnOiAnXHU2NzQzXHU5NjUwXHU3RUM0XHU1NDA4JyxcbiAgICAnL25hdmlnYXRpb24vbWVudXMnOiAnXHU4M0RDXHU1MzU1XHU1MjE3XHU4ODY4JyxcbiAgICAnL25hdmlnYXRpb24vbWVudXMvcHJldmlldyc6ICdcdTgzRENcdTUzNTVcdTk4ODRcdTg5QzgnLFxuICAgICcvb3BzL2F1ZGl0JzogJ1x1NjRDRFx1NEY1Q1x1NjVFNVx1NUZENycsXG4gICAgJy9vcHMvYmFzZWxpbmUnOiAnXHU2NzQzXHU5NjUwXHU1N0ZBXHU3RUJGJyxcbiAgICAnL29wcy9zaW11bGF0b3InOiAnXHU3QjU2XHU3NTY1XHU2QTIxXHU2MkRGXHU1NjY4JyxcbiAgfSxcbiAgJ2VuLVVTJzoge1xuICAgICcvJzogJ0hvbWUnLFxuICAgICcvdGVzdC9jcnVkJzogJ0NSVUQgVGVzdCcsXG4gICAgJy90ZXN0L3N2Zy1wbHVnaW4nOiAnU1ZHIFBsdWdpbiBUZXN0JyxcbiAgICAnL3Rlc3QvaTE4bic6ICdpMThuIFRlc3QnLFxuICAgICcvdGVzdC9zZWxlY3QtYnV0dG9uJzogJ1NlbGVjdCBCdXR0b24nLFxuICAgICcvcGxhdGZvcm0vZG9tYWlucyc6ICdEb21haW4gTGlzdCcsXG4gICAgJy9wbGF0Zm9ybS9tb2R1bGVzJzogJ01vZHVsZSBMaXN0JyxcbiAgICAnL3BsYXRmb3JtL3BsdWdpbnMnOiAnUGx1Z2luIExpc3QnLFxuICAgICcvb3JnL3RlbmFudHMnOiAnVGVuYW50IExpc3QnLFxuICAgICcvb3JnL2RlcGFydG1lbnRzJzogJ0RlcGFydG1lbnQgTGlzdCcsXG4gICAgJy9vcmcvdXNlcnMnOiAnVXNlciBMaXN0JyxcbiAgICAnL2FjY2Vzcy9yZXNvdXJjZXMnOiAnUmVzb3VyY2UgTGlzdCcsXG4gICAgJy9hY2Nlc3MvYWN0aW9ucyc6ICdBY3Rpb24gTGlzdCcsXG4gICAgJy9hY2Nlc3MvcGVybWlzc2lvbnMnOiAnUGVybWlzc2lvbiBMaXN0JyxcbiAgICAnL2FjY2Vzcy9yb2xlcyc6ICdSb2xlIExpc3QnLFxuICAgICcvYWNjZXNzL3BvbGljaWVzJzogJ1BvbGljeSBMaXN0JyxcbiAgICAnL2FjY2Vzcy9wZXJtLWNvbXBvc2UnOiAnUGVybWlzc2lvbiBDb21wb3NpdGlvbicsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzJzogJ01lbnUgTGlzdCcsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzL3ByZXZpZXcnOiAnTWVudSBQcmV2aWV3JyxcbiAgICAnL29wcy9hdWRpdCc6ICdBdWRpdCBMb2dzJyxcbiAgICAnL29wcy9iYXNlbGluZSc6ICdQZXJtaXNzaW9uIEJhc2VsaW5lJyxcbiAgICAnL29wcy9zaW11bGF0b3InOiAnUG9saWN5IFNpbXVsYXRvcicsXG4gIH0sXG59O1xuXG4vKipcbiAqIFx1NEVDRSBjb29raWUgXHU0RTJEXHU2M0QwXHU1M0Q2XHU4QkVEXHU4QTAwXG4gKi9cbmZ1bmN0aW9uIGdldExvY2FsZUZyb21Db29raWUoY29va2llSGVhZGVyPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFjb29raWVIZWFkZXIpIHJldHVybiAnemgtQ04nO1xuXG4gIGNvbnN0IG1hdGNoID0gY29va2llSGVhZGVyLm1hdGNoKC8oPzpefDtcXHMqKWxvY2FsZT0oW147XSspLyk7XG4gIGlmIChtYXRjaCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzFdKS5yZXBsYWNlKC9cIi9nLCAnJyk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3poLUNOJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJ3poLUNOJztcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTY4MDdcdTk4OThcdTZDRThcdTUxNjVcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpdGxlSW5qZWN0UGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCByZXF1ZXN0UGF0aCA9ICcvJztcbiAgbGV0IHJlcXVlc3RDb29raWUgPSAnJztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi10aXRsZS1pbmplY3QnLFxuXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU1NzI4IFZpdGUgXHU1MTg1XHU5MEU4XHU0RTJEXHU5NUY0XHU0RUY2XHU0RTRCXHU1MjREXHU2MkU2XHU2MjJBXHU4QkY3XHU2QzQyXHVGRjBDXHU0RkREXHU1QjU4XHU4REVGXHU1Rjg0XHU1NDhDIGNvb2tpZVxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgcmVxdWVzdFBhdGggPSByZXEudXJsIHx8ICcvJztcbiAgICAgICAgcmVxdWVzdENvb2tpZSA9IHJlcS5oZWFkZXJzLmNvb2tpZSB8fCAnJztcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgb3JkZXI6ICdwcmUnLFxuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIC8vIFx1NEY3Rlx1NzUyOFx1NEZERFx1NUI1OFx1NzY4NFx1OEJGN1x1NkM0Mlx1NEZFMVx1NjA2RlxuICAgICAgICBjb25zdCBsb2NhbGUgPSBnZXRMb2NhbGVGcm9tQ29va2llKHJlcXVlc3RDb29raWUpO1xuICAgICAgICBjb25zdCB0aXRsZU1hcCA9IHRpdGxlc1tsb2NhbGVdIHx8IHRpdGxlc1snemgtQ04nXTtcbiAgICAgICAgY29uc3QgcGFnZVRpdGxlID0gdGl0bGVNYXBbcmVxdWVzdFBhdGhdIHx8ICdCVEMgXHU4RjY2XHU5NUY0XHU2RDQxXHU3QTBCXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGJztcblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTUzNjBcdTRGNERcdTdCMjZcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgnX19QQUdFX1RJVExFX18nLCBwYWdlVGl0bGUpO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcblxuLy8gVml0ZSBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTdDN0JcdTU3OEJcbmludGVyZmFjZSBQcm94eU9wdGlvbnMge1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hhbmdlT3JpZ2luPzogYm9vbGVhbjtcbiAgc2VjdXJlPzogYm9vbGVhbjtcbiAgY29uZmlndXJlPzogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4gdm9pZDtcbn1cblxuY29uc3QgcHJveHk6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IFByb3h5T3B0aW9ucz4gPSB7XG4gICcvYXBpJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIC8vIFx1NEUwRFx1NTE4RFx1NjZGRlx1NjM2Mlx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEY2Q1x1NTNEMSAvYXBpIFx1NTIzMFx1NTQwRVx1N0FFRlx1RkYwOFx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXHVGRjA5XG4gICAgLy8gcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hZG1pbicpIC8vIFx1NURGMlx1NzlGQlx1OTY2NFx1RkYxQVx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXG4gICAgLy8gXHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU2REZCXHU1MkEwIENPUlMgXHU1OTM0XG4gICAgY29uZmlndXJlOiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB7XG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTU0Q0RcdTVFOTRcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBpZiAocHJveHlSZXMuaGVhZGVycykge1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddID0gb3JpZ2luIGFzIHN0cmluZztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyddID0gJ3RydWUnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUyc7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ10gfHwgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSByZXF1ZXN0SGVhZGVycyBhcyBzdHJpbmc7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIFNldC1Db29raWUgXHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU3ODZFXHU0RkREXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHU2NUY2IGNvb2tpZSBcdTgwRkRcdTU5MUZcdTZCNjNcdTc4NkVcdThCQkVcdTdGNkVcbiAgICAgICAgICAvLyBcdTU3MjhcdTk4ODRcdTg5QzhcdTZBMjFcdTVGMEZcdTRFMEJcdUZGMDhcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdUZGMDlcdUZGMENcdTk3MDBcdTg5ODFcdThCQkVcdTdGNkUgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXG4gICAgICAgICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddO1xuICAgICAgICAgIGlmIChzZXRDb29raWVIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb2tpZXMgPSBBcnJheS5pc0FycmF5KHNldENvb2tpZUhlYWRlcikgPyBzZXRDb29raWVIZWFkZXIgOiBbc2V0Q29va2llSGVhZGVyXTtcbiAgICAgICAgICAgIGNvbnN0IGZpeGVkQ29va2llcyA9IGNvb2tpZXMubWFwKChjb29raWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUMgY29va2llIFx1NEUwRFx1NTMwNVx1NTQyQiBTYW1lU2l0ZVx1RkYwQ1x1NjIxNlx1ODAwNSBTYW1lU2l0ZSBcdTRFMERcdTY2MkYgTm9uZVx1RkYwQ1x1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFxuICAgICAgICAgICAgICBpZiAoIWNvb2tpZS5pbmNsdWRlcygnU2FtZVNpdGU9Tm9uZScpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU3M0IwXHU2NzA5XHU3Njg0IFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgIGxldCBmaXhlZENvb2tpZSA9IGNvb2tpZS5yZXBsYWNlKC87XFxzKlNhbWVTaXRlPShTdHJpY3R8TGF4fE5vbmUpL2dpLCAnJyk7XG4gICAgICAgICAgICAgICAgLy8gXHU2REZCXHU1MkEwIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVx1RkYwOFx1NUJGOVx1NEU4RVx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1RkYwOVxuICAgICAgICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVNlY3VyZSBcdTk3MDBcdTg5ODEgSFRUUFNcdUZGMENcdTRGNDZcdTU3MjhcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU2MjExXHU0RUVDXHU0RUNEXHU3MTM2XHU2REZCXHU1MkEwXHU1QjgzXG4gICAgICAgICAgICAgICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU0RjFBXHU1RkZEXHU3NTY1IFNlY3VyZVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTM0Rlx1OEJBRVx1NjYyRiBIVFRQXHVGRjA5XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlJztcbiAgICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGNvb2tpZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddID0gZml4ZWRDb29raWVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBcdThCQjBcdTVGNTVcdTU0MEVcdTdBRUZcdTU0Q0RcdTVFOTRcdTcyQjZcdTYwMDFcbiAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgJiYgcHJveHlSZXMuc3RhdHVzQ29kZSA+PSA1MDApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUHJveHldIEJhY2tlbmQgcmV0dXJuZWQgJHtwcm94eVJlcy5zdGF0dXNDb2RlfSBmb3IgJHtyZXEubWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnKTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcdUZGMUFcdTY1RTBcdTZDRDVcdThGREVcdTYzQTVcdTUyMzBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjggaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU0RUUzXHU3NDA2XHU4QkY3XHU2QzQyXHVGRjA4XHU3NTI4XHU0RThFXHU4QzAzXHU4QkQ1XHVGRjA5XG4gICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXE6IGFueSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtQcm94eV0gJHtyZXEubWV0aG9kfSAke3JlcS51cmx9IC0+IGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUke3JlcS51cmx9YCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG59O1xuXG5leHBvcnQgeyBwcm94eSB9O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhcHAtZW52LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTdFREZcdTRFMDBcdTc2ODRcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OTBGRFx1NEVDRVx1OEZEOVx1OTFDQ1x1OEJGQlx1NTNENlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEU4Q1x1NEU0OVx1NjAyN1xuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwRW52Q29uZmlnIHtcbiAgYXBwTmFtZTogc3RyaW5nO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIGRldlBvcnQ6IHN0cmluZztcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcmVQb3J0OiBzdHJpbmc7XG4gIHByb2RIb3N0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfRU5WX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODAnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgwJyxcbiAgICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbG9naXN0aWNzLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODInLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncXVhbGl0eS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgzJyxcbiAgICBwcm9kSG9zdDogJ3F1YWxpdHkuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncHJvZHVjdGlvbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg0JyxcbiAgICBwcm9kSG9zdDogJ3Byb2R1Y3Rpb24uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZW5naW5lZXJpbmctYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgcHJvZEhvc3Q6ICdlbmdpbmVlcmluZy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdmaW5hbmNlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODYnLFxuICAgIHByb2RIb3N0OiAnZmluYW5jZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgcHJvZEhvc3Q6ICdtb2JpbGUuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0KTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWixTQUFTLG9CQUFvQjtBQUNqYixPQUFPLFNBQVM7QUFDaEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sWUFBWTtBQUNuQixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLGVBQWUsV0FBVztBQUNuQyxTQUFTLGVBQWU7QUFDeEIsU0FBUyxZQUFZLG9CQUFvQjs7O0FDSHpDLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBSzdCLFNBQVMseUJBQXlCO0FBQ3ZDLFNBQU8sV0FBVztBQUFB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
