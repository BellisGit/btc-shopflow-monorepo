// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.25/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import VueI18nPlugin from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@intlify+unplugin-vue-i18n@1.6.0_vue-i18n@11.2.2/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { fileURLToPath, URL } from "node:url";
import { resolve, join } from "path";
import { existsSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";

// ../../configs/auto-import.config.ts
import AutoImport from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-auto-import@20.3.0/node_modules/unplugin-auto-import/dist/vite.mjs";
import Components from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.25/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.25/node_modules/unplugin-vue-components/dist/resolvers.js";
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
        const convertToPascalCase = (name) => {
          if (name.startsWith("Btc")) {
            return name;
          }
          if (name.startsWith("btc-")) {
            return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
          }
          return name;
        };
        if (componentName.startsWith("Btc") || componentName.startsWith("btc-")) {
          const pascalName = convertToPascalCase(componentName);
          return {
            name: pascalName,
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
    prodHost: "logistics.bellis.com.cn"
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
  },
  {
    appName: "docs-site-app",
    devHost: "localhost",
    devPort: "4172",
    preHost: "localhost",
    prePort: "4173",
    prodHost: "docs.bellis.com.cn"
  },
  {
    appName: "layout-app",
    devHost: "10.80.8.199",
    devPort: "8088",
    preHost: "localhost",
    prePort: "4188",
    prodHost: "layout.bellis.com.cn"
  },
  {
    appName: "monitor-app",
    devHost: "10.80.8.199",
    devPort: "8089",
    preHost: "localhost",
    prePort: "4189",
    prodHost: "monitor.bellis.com.cn"
  }
];
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\admin-app";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/admin-app/vite.config.ts";
var appConfig = getAppConfig("admin-app");
if (!appConfig) {
  throw new Error("\u672A\u627E\u5230 admin-app \u7684\u73AF\u5883\u914D\u7F6E");
}
var APP_PORT = parseInt(appConfig.prePort, 10);
var APP_HOST = appConfig.preHost;
var MAIN_APP_CONFIG = getAppConfig("system-app");
var MAIN_APP_ORIGIN = MAIN_APP_CONFIG ? `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}` : "http://localhost:4180";
var isPreviewBuild = process.env.VITE_PREVIEW === "true";
var cleanDistPlugin = () => {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve(__vite_injected_original_dirname, "dist");
      if (existsSync(distDir)) {
        console.log("[clean-dist-plugin] \u{1F9F9} \u6E05\u7406\u65E7\u7684 dist \u76EE\u5F55...");
        try {
          rmSync(distDir, { recursive: true, force: true });
          console.log("[clean-dist-plugin] \u2705 dist \u76EE\u5F55\u5DF2\u6E05\u7406");
        } catch (error) {
          console.warn("[clean-dist-plugin] \u26A0\uFE0F \u6E05\u7406 dist \u76EE\u5F55\u5931\u8D25\uFF0C\u7EE7\u7EED\u6784\u5EFA:", error);
        }
      }
    }
  };
};
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
        console.log(`
[chunk-verify-plugin] \u2139\uFE0F \u4FE1\u606F\uFF1Aapp-src chunk \u4E0D\u5B58\u5728\uFF0C\u4F46 index \u6587\u4EF6\u8F83\u5927 (${indexSizeKB.toFixed(2)}KB)`);
        console.log(`[chunk-verify-plugin] \u5E94\u7528\u4EE3\u7801\u88AB\u6253\u5305\u5230\u4E86\u5165\u53E3\u6587\u4EF6\uFF0C\u8FD9\u662F\u6B63\u5E38\u7684\u6784\u5EFA\u884C\u4E3A`);
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
      console.log("\n[chunk-verify-plugin] \u{1F50D} \u9A8C\u8BC1\u8D44\u6E90\u5F15\u7528\u4E00\u81F4\u6027...");
      const allChunkFiles = /* @__PURE__ */ new Set([...jsChunks, ...cssChunks]);
      const referencedFiles = /* @__PURE__ */ new Map();
      const missingFiles = [];
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          const codeWithoutComments = chunk.code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
          const importPattern = /import\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']\s*\)/g;
          let match;
          while ((match = importPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
          const urlPattern = /new\s+URL\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']/g;
          while ((match = urlPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
        }
      }
      for (const [referencedFile, referencedBy] of referencedFiles.entries()) {
        const fileName = referencedFile.replace(/^assets\//, "");
        let exists = allChunkFiles.has(fileName);
        let possibleMatches = [];
        if (!exists) {
          const match = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
          if (match) {
            const [, namePrefix, , ext] = match;
            possibleMatches = Array.from(allChunkFiles).filter((chunkFile) => {
              const chunkMatch = chunkFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (chunkMatch) {
                const [, chunkNamePrefix, , chunkExt] = chunkMatch;
                return chunkNamePrefix === namePrefix && chunkExt === ext;
              }
              return false;
            });
            exists = possibleMatches.length > 0;
          } else {
            const nameWithoutExt = fileName.replace(/\.(js|mjs|css)$/, "");
            possibleMatches = Array.from(allChunkFiles).filter((chunkFile) => {
              const chunkNameWithoutExt = chunkFile.replace(/\.(js|mjs|css)$/, "");
              return chunkNameWithoutExt.startsWith(nameWithoutExt.substring(0, 10)) || nameWithoutExt.startsWith(chunkNameWithoutExt.substring(0, 10));
            });
          }
        }
        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }
      if (missingFiles.length > 0) {
        console.error(`
[chunk-verify-plugin] \u274C \u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A`);
        console.error(`
[chunk-verify-plugin] \u5B9E\u9645\u5B58\u5728\u7684\u6587\u4EF6\uFF08\u5171 ${allChunkFiles.size} \u4E2A\uFF09\uFF1A`);
        Array.from(allChunkFiles).sort().forEach((file) => console.error(`  - ${file}`));
        console.error(`
[chunk-verify-plugin] \u5F15\u7528\u7684\u6587\u4EF6\uFF08\u5171 ${referencedFiles.size} \u4E2A\uFF09\uFF1A`);
        Array.from(referencedFiles.keys()).sort().forEach((file) => console.error(`  - ${file}`));
        console.error(`
[chunk-verify-plugin] \u7F3A\u5931\u7684\u6587\u4EF6\u8BE6\u60C5\uFF1A`);
        missingFiles.forEach(({ file, referencedBy, possibleMatches }) => {
          console.error(`  - ${file}`);
          console.error(`    \u88AB\u4EE5\u4E0B\u6587\u4EF6\u5F15\u7528: ${referencedBy.join(", ")}`);
          if (possibleMatches.length > 0) {
            console.error(`    \u53EF\u80FD\u7684\u5339\u914D\u6587\u4EF6: ${possibleMatches.join(", ")}`);
          }
        });
        console.error("\n[chunk-verify-plugin] \u8FD9\u901A\u5E38\u662F\u56E0\u4E3A\uFF1A");
        console.error("  1. \u6784\u5EFA\u524D\u6CA1\u6709\u6E05\u7406\u65E7\u7684 dist \u76EE\u5F55\uFF08\u5DF2\u81EA\u52A8\u5904\u7406\uFF09");
        console.error("  2. \u6784\u5EFA\u8FC7\u7A0B\u4E2D\u6587\u4EF6\u540D hash \u4E0D\u4E00\u81F4");
        console.error("  3. useDevMode \u914D\u7F6E\u5BFC\u81F4\u8D44\u6E90\u5F15\u7528\u4E0D\u4E00\u81F4");
        console.error("  4. \u6784\u5EFA\u4EA7\u7269\u4E0D\u5B8C\u6574\uFF08\u90E8\u5206\u6587\u4EF6\u672A\u751F\u6210\uFF09");
        console.error("  5. \u9A8C\u8BC1\u903B\u8F91\u8BEF\u62A5\uFF08\u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u6587\u4EF6\uFF09");
        console.error("\n[chunk-verify-plugin] \u89E3\u51B3\u65B9\u6848\uFF1A");
        console.error("  1. \u8FD0\u884C pnpm prebuild:all \u6E05\u7406\u7F13\u5B58\u548C dist \u76EE\u5F55");
        console.error("  2. \u91CD\u65B0\u6784\u5EFA\u5E94\u7528");
        console.error("  3. \u68C0\u67E5\u6784\u5EFA\u65E5\u5FD7\uFF0C\u786E\u8BA4\u6240\u6709\u6587\u4EF6\u90FD\u5DF2\u751F\u6210");
        console.error("  4. \u5982\u679C\u786E\u8BA4\u662F\u8BEF\u62A5\uFF0C\u53EF\u4EE5\u4E34\u65F6\u7981\u7528\u6B64\u9A8C\u8BC1\u63D2\u4EF6");
        if (missingFiles.length <= 5) {
          console.warn(`
[chunk-verify-plugin] \u26A0\uFE0F  \u8B66\u544A\uFF1A\u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u4F46\u7EE7\u7EED\u6784\u5EFA`);
          console.warn(`[chunk-verify-plugin] \u8BF7\u68C0\u67E5\u4E0A\u8FF0\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u786E\u8BA4\u662F\u5426\u771F\u7684\u5B58\u5728\u95EE\u9898`);
        } else {
          throw new Error(`\u8D44\u6E90\u5F15\u7528\u4E0D\u4E00\u81F4\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01\u6709 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u5B58\u5728`);
        }
      } else {
        console.log(`
[chunk-verify-plugin] \u2705 \u6240\u6709\u8D44\u6E90\u5F15\u7528\u90FD\u6B63\u786E\uFF08\u5171\u9A8C\u8BC1 ${referencedFiles.size} \u4E2A\u5F15\u7528\uFF09`);
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
var forceNewHashPlugin = () => {
  const buildId = Date.now().toString(36);
  const cssFileNameMap = /* @__PURE__ */ new Map();
  const jsFileNameMap = /* @__PURE__ */ new Map();
  return {
    name: "force-new-hash",
    buildStart() {
      console.log(`[force-new-hash] \u6784\u5EFA ID: ${buildId}`);
      cssFileNameMap.clear();
    },
    renderChunk(code, chunk) {
      const isThirdPartyLib = chunk.fileName?.includes("lib-echarts") || chunk.fileName?.includes("element-plus") || chunk.fileName?.includes("vue-core") || chunk.fileName?.includes("vue-router") || chunk.fileName?.includes("vendor");
      if (isThirdPartyLib) {
        return null;
      }
      return `/* build-id: ${buildId} */
${code}`;
    },
    generateBundle(options, bundle) {
      const fileNameMap = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const isEChartsLib = fileName.includes("lib-echarts");
          if (isEChartsLib) {
            console.log(`[force-new-hash] \u26A0\uFE0F  \u8DF3\u8FC7 lib-echarts \u7684\u6587\u4EF6\u540D\u4FEE\u6539: ${fileName}`);
            continue;
          }
          const baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          const newFileName = `assets/${baseName}-${buildId}.js`;
          fileNameMap.set(fileName, newFileName);
          const oldRef = fileName.replace(/^assets\//, "");
          const newRef = newFileName.replace(/^assets\//, "");
          jsFileNameMap.set(oldRef, newRef);
          chunk.fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        } else if (chunk.type === "asset" && fileName.endsWith(".css") && fileName.startsWith("assets/")) {
          const baseName = fileName.replace(/^assets\//, "").replace(/\.css$/, "");
          const newFileName = `assets/${baseName}-${buildId}.css`;
          fileNameMap.set(fileName, newFileName);
          const oldCssName = fileName.replace(/^assets\//, "");
          const newCssName = newFileName.replace(/^assets\//, "");
          cssFileNameMap.set(oldCssName, newCssName);
          chunk.fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          const isThirdPartyLib = fileName.includes("lib-echarts") || fileName.includes("element-plus") || fileName.includes("vue-core") || fileName.includes("vue-router") || fileName.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          let newCode = chunk.code;
          let modified = false;
          for (const [oldFileName, newFileName] of fileNameMap.entries()) {
            const isThirdPartyRef = oldFileName.includes("lib-echarts") || oldFileName.includes("element-plus") || oldFileName.includes("vue-core") || oldFileName.includes("vue-router") || oldFileName.includes("vendor");
            const oldRef = oldFileName.replace(/^assets\//, "");
            const newRef = newFileName.replace(/^assets\//, "");
            const escapedOldRef = oldRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if (isThirdPartyRef) {
              const strictPatterns = [
                // 绝对路径：/assets/vue-core-CXAVbLNX.js
                [`/assets/${oldRef}`, `/assets/${newRef}`],
                // 相对路径：./assets/vue-core-CXAVbLNX.js
                [`./assets/${oldRef}`, `./assets/${newRef}`],
                // 无前缀相对路径：assets/vue-core-CXAVbLNX.js
                [`assets/${oldRef}`, `assets/${newRef}`],
                // 字符串中的引用："vue-core-CXAVbLNX.js" 或 'vue-core-CXAVbLNX.js'
                [`"${oldRef}"`, `"${newRef}"`],
                [`'${oldRef}'`, `'${newRef}`],
                [`\`${oldRef}\``, `\`${newRef}\``],
                // import() 动态导入：import('/assets/vue-core-CXAVbLNX.js')
                [`import('/assets/${oldRef}')`, `import('/assets/${newRef}')`],
                [`import("/assets/${oldRef}")`, `import("/assets/${newRef}")`],
                [`import(\`/assets/${oldRef}\`)`, `import(\`/assets/${newRef}\`)`],
                // 在对象或数组中的引用：{ file: "vue-core-CXAVbLNX.js" } 或 ["vue-core-CXAVbLNX.js"]
                [`:"${oldRef}"`, `:"${newRef}"`],
                [`:'${oldRef}'`, `:'${newRef}'`],
                [`:\`${oldRef}\``, `:\`${newRef}\``],
                [`["${oldRef}"]`, `["${newRef}"]`],
                [`['${oldRef}']`, `['${newRef}']`],
                [`[\`${oldRef}\`]`, `[\`${newRef}\`]`]
              ];
              strictPatterns.forEach(([oldPattern, newPattern]) => {
                const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const regex = new RegExp(escapedOldPattern, "g");
                if (regex.test(newCode)) {
                  newCode = newCode.replace(regex, newPattern);
                  modified = true;
                  console.log(`[force-new-hash] \u66F4\u65B0\u7B2C\u4E09\u65B9\u5E93\u5F15\u7528: ${oldPattern} -> ${newPattern} (\u5728 ${fileName} \u4E2D)`);
                }
              });
            }
            const replacePatterns = [
              // 绝对路径：/assets/vendor-Bhb-Bl-F.js -> /assets/vendor-Bhb-Bl-F-mipvcia9.js
              [`/assets/${oldRef}`, `/assets/${newRef}`],
              // 相对路径：./vendor-Bhb-Bl-F.js -> ./vendor-Bhb-Bl-F-mipvcia9.js
              [`./${oldRef}`, `./${newRef}`],
              // 无前缀：vendor-Bhb-Bl-F.js -> vendor-Bhb-Bl-F-mipvcia9.js（在 import from 中）
              [`"${oldRef}"`, `"${newRef}"`],
              [`'${oldRef}'`, `'${newRef}'`],
              [`\`${oldRef}\``, `\`${newRef}\``]
            ];
            replacePatterns.forEach(([oldPattern, newPattern]) => {
              const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(escapedOldPattern, "g");
              if (regex.test(newCode)) {
                newCode = newCode.replace(regex, newPattern);
                modified = true;
              }
            });
            const complexPatterns = [
              // 在对象或数组中的引用：{ file: "vue-core-CXAVbLNX.js" } 或 ["vue-core-CXAVbLNX.js"]
              new RegExp(`(["'\`])${escapedOldRef}\\1`, "g"),
              // 在函数调用中的引用：loadChunk("vue-core-CXAVbLNX.js")
              new RegExp(`\\(\\s*(["'\`])${escapedOldRef}\\1\\s*\\)`, "g")
            ];
            complexPatterns.forEach((pattern) => {
              if (pattern.test(newCode)) {
                newCode = newCode.replace(pattern, (match, quote) => {
                  if (match.startsWith("(")) {
                    return `(${quote}${newRef}${quote})`;
                  } else {
                    return `${quote}${newRef}${quote}`;
                  }
                });
                modified = true;
              }
            });
            const directFileNamePattern = new RegExp(`\\b${escapedOldRef}\\b`, "g");
            if (directFileNamePattern.test(newCode)) {
              newCode = newCode.replace(directFileNamePattern, (match, offset, string) => {
                const before = string.substring(Math.max(0, offset - 50), offset);
                const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 50));
                const isInImportExport = /(?:import|export|require)\s*\(?\s*["'`]/.test(before) || /from\s+["'`]/.test(before) || /import\s*\(/.test(before);
                const isInString = (before.match(/["'`]/g) || []).length % 2 === 1;
                const isInPath = /[/'"`]assets\/|\.\/|\.\.\//.test(before) || /["'`]\s*$/.test(before);
                const isVariableName = /[a-zA-Z_$][a-zA-Z0-9_$]*\s*$/.test(before) && !isInString;
                const isObjectProperty = /\.\s*$/.test(before);
                if ((isInImportExport || isInString || isInPath) && !isVariableName && !isObjectProperty) {
                  return newRef;
                }
                return match;
              });
              modified = true;
            }
          }
          if (newCode.includes("__vite__mapDeps") && cssFileNameMap.size > 0) {
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const cssPattern = new RegExp(`(["'])assets/${escapedOldCssName}\\1`, "g");
              if (cssPattern.test(newCode)) {
                newCode = newCode.replace(cssPattern, `$1assets/${newCssName}$1`);
                modified = true;
                console.log(`[force-new-hash] \u66F4\u65B0 __vite__mapDeps \u4E2D\u7684 CSS \u5F15\u7528: assets/${oldCssName} -> assets/${newCssName}`);
              }
            }
          }
          if (modified) {
            chunk.code = newCode;
          }
        }
      }
      console.log(`[force-new-hash] \u2705 \u5DF2\u4E3A ${fileNameMap.size} \u4E2A\u6587\u4EF6\u6DFB\u52A0\u6784\u5EFA ID: ${buildId}`);
      const thirdPartyMappings = Array.from(fileNameMap.entries()).filter(
        ([oldName]) => oldName.includes("vue-core") || oldName.includes("vue-router") || oldName.includes("element-plus") || oldName.includes("vendor") || oldName.includes("lib-echarts")
      );
      if (thirdPartyMappings.length > 0) {
        console.log(`[force-new-hash] \u{1F4CB} \u7B2C\u4E09\u65B9\u5E93\u6587\u4EF6\u540D\u6620\u5C04:`);
        thirdPartyMappings.forEach(([oldName, newName]) => {
          console.log(`  ${oldName.replace(/^assets\//, "")} -> ${newName.replace(/^assets\//, "")}`);
        });
      }
    },
    writeBundle(options) {
      const outputDir = options.dir || join(process.cwd(), "dist");
      const indexHtmlPath = join(outputDir, "index.html");
      const assetsDir = join(outputDir, "assets");
      if (existsSync(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, "utf-8");
        let modified = false;
        if (cssFileNameMap.size > 0) {
          for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
            const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const linkPattern = new RegExp(`(href=["'])/assets/${escapedOldCssName}(["'])`, "g");
            if (linkPattern.test(html)) {
              html = html.replace(linkPattern, `$1/assets/${newCssName}$2`);
              modified = true;
            }
          }
        }
        const importPattern = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))\1\s*\)/g;
        if (importPattern.test(html)) {
          html = html.replace(importPattern, (match, quote, path) => {
            if (path.includes("?")) {
              return `import(${quote}${path.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
            } else {
              return `import(${quote}${path}?v=${buildId}${quote})`;
            }
          });
          modified = true;
          console.log(`[force-new-hash] \u2705 \u5DF2\u4E3A index.html \u4E2D\u7684 script \u6807\u7B7E\u6DFB\u52A0\u6784\u5EFA ID \u67E5\u8BE2\u53C2\u6570: v=${buildId}`);
        }
        if (modified) {
          writeFileSync(indexHtmlPath, html, "utf-8");
          if (cssFileNameMap.size > 0) {
            console.log(`[force-new-hash] \u2705 \u5DF2\u66F4\u65B0 index.html \u4E2D\u7684 CSS \u5F15\u7528`);
          }
        }
      }
      if (existsSync(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
        let totalFixed = 0;
        const allFileNameMap = /* @__PURE__ */ new Map();
        for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
          allFileNameMap.set(oldJsName, newJsName);
        }
        for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
          allFileNameMap.set(oldCssName, newCssName);
        }
        if (allFileNameMap.size === 0) {
          const actualFiles = readdirSync(assetsDir);
          for (const file of actualFiles) {
            const match = file.match(/^(.+?)-([A-Za-z0-9]{4,})-([a-zA-Z0-9]+)\.(js|mjs|css)$/);
            if (match) {
              const [, baseName, hash, buildId2, ext] = match;
              const oldFileName = `${baseName}-${hash}.${ext}`;
              if (oldFileName !== file) {
                allFileNameMap.set(oldFileName, file);
              }
            }
          }
        }
        for (const jsFile of jsFiles) {
          const jsFilePath = join(assetsDir, jsFile);
          const isThirdPartyLib = jsFile.includes("lib-echarts") || jsFile.includes("element-plus") || jsFile.includes("vue-core") || jsFile.includes("vue-router") || jsFile.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          let content = readFileSync(jsFilePath, "utf-8");
          let modified = false;
          for (const [oldFileName, newFileName] of allFileNameMap.entries()) {
            const escapedOldFileName = oldFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const patterns = [
              // 绝对路径：/assets/xxx.js（必须在引号内或 import/from 语句中）
              new RegExp(`(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, "g"),
              // import() 动态导入：import('/assets/xxx.js')
              new RegExp(`import\\s*\\(\\s*(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1\\s*\\)`, "g"),
              // 相对路径：./xxx.js（必须在引号内）
              new RegExp(`(["'\`])\\./${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, "g"),
              // assets/xxx.js（在 __vite__mapDeps 中，必须在引号内）
              new RegExp(`(["'\`])assets/${escapedOldFileName}(?![a-zA-Z0-9-])\\1`, "g")
            ];
            patterns.forEach((pattern) => {
              if (pattern.test(content)) {
                if (pattern.source.includes("/assets/")) {
                  content = content.replace(pattern, (match, quote) => {
                    if (match.includes("import(")) {
                      return match.replace(`/assets/${oldFileName}`, `/assets/${newFileName}`);
                    }
                    return `${quote}/assets/${newFileName}${quote}`;
                  });
                } else if (pattern.source.includes("./")) {
                  content = content.replace(pattern, (match, quote) => `${quote}./${newFileName}${quote}`);
                } else if (pattern.source.includes("assets/")) {
                  content = content.replace(pattern, (match, quote) => `${quote}assets/${newFileName}${quote}`);
                }
                modified = true;
              }
            });
          }
          if (modified) {
            writeFileSync(jsFilePath, content, "utf-8");
            totalFixed++;
          }
        }
        if (totalFixed > 0) {
          console.log(`[force-new-hash] \u2705 \u5DF2\u5728 writeBundle \u9636\u6BB5\u66F4\u65B0 ${totalFixed} \u4E2A JS \u6587\u4EF6\u4E2D\u7684\u5F15\u7528`);
        }
      }
    }
  };
};
var fixDynamicImportHashPlugin = () => {
  const chunkNameMap = /* @__PURE__ */ new Map();
  return {
    name: "fix-dynamic-import-hash",
    // 在 generateBundle 阶段收集所有 chunk 文件名
    generateBundle(options, bundle) {
      chunkNameMap.clear();
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) || baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            } else {
              console.warn(`[fix-dynamic-import-hash] \u26A0\uFE0F  \u53D1\u73B0\u591A\u4E2A\u540C\u540D chunk: ${namePrefix} (${chunkNameMap.get(namePrefix)}, ${fileName})`);
            }
          }
        }
      }
      console.log(`[fix-dynamic-import-hash] \u6536\u96C6\u5230 ${chunkNameMap.size} \u4E2A chunk \u6620\u5C04`);
      if (chunkNameMap.size > 0) {
        const sampleEntries = Array.from(chunkNameMap.entries()).slice(0, 5);
        console.log(`[fix-dynamic-import-hash] \u793A\u4F8B\u6620\u5C04: ${sampleEntries.map(([k, v]) => `${k} -> ${v.split("/").pop()}`).join(", ")}`);
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          const isThirdPartyLib = fileName.includes("lib-echarts") || fileName.includes("element-plus") || fileName.includes("vue-core") || fileName.includes("vue-router") || fileName.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          let newCode = chunk.code;
          let modified = false;
          const replacements = [];
          const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
          let match;
          importPattern.lastIndex = 0;
          while ((match = importPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const fullPath = match[2];
            const referencedFile = match[3];
            const fullMatch = match[0];
            const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
            if (!existsInBundle) {
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const [, namePrefix, , ext] = refMatch;
                const key = `${namePrefix}.${ext}`;
                const actualFile = chunkNameMap.get(namePrefix);
                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, "");
                  let newPath = fullPath;
                  if (fullPath.startsWith("/assets/")) {
                    newPath = `/assets/${actualFileName}`;
                  } else if (fullPath.startsWith("./assets/")) {
                    newPath = `./assets/${actualFileName}`;
                  } else if (fullPath.startsWith("assets/")) {
                    newPath = `assets/${actualFileName}`;
                  } else {
                    newPath = actualFileName;
                  }
                  replacements.push({
                    old: fullMatch,
                    new: `import(${quote}${newPath}${quote})`
                  });
                  console.log(`[fix-dynamic-import-hash] \u4FEE\u590D ${fileName} \u4E2D\u7684\u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                } else {
                  console.warn(`[fix-dynamic-import-hash] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 ${namePrefix} \u5BF9\u5E94\u7684\u6587\u4EF6\uFF0C\u5F15\u7528: ${referencedFile}`);
                }
              }
            }
          }
          const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
          stringPathPattern.lastIndex = 0;
          while ((match = stringPathPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const fullPath = match[2];
            const referencedFile = match[3];
            const fullMatch = match[0];
            const alreadyFixed = replacements.some((r) => r.old === fullMatch || r.old.includes(referencedFile));
            if (alreadyFixed) {
              continue;
            }
            const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
            if (!existsInBundle) {
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const namePrefix = refMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);
                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, "");
                  const newPath = `/assets/${actualFileName}`;
                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${newPath}${quote}`
                  });
                  console.log(`[fix-dynamic-import-hash] \u4FEE\u590D ${fileName} \u4E2D\u7684\u5B57\u7B26\u4E32\u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                } else {
                  console.warn(`[fix-dynamic-import-hash] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 ${namePrefix} \u5BF9\u5E94\u7684\u6587\u4EF6\uFF0C\u5F15\u7528: ${referencedFile} (\u5728 ${fileName} \u4E2D)`);
                }
              }
            }
          }
          const relativePathPattern = /(["'])(\.\/)([^"'`\s]+\.(js|mjs|css))\1/g;
          relativePathPattern.lastIndex = 0;
          while ((match = relativePathPattern.exec(newCode)) !== null) {
            const quote = match[1];
            const relativePrefix = match[2];
            const referencedFile = match[3];
            const fullMatch = match[0];
            const alreadyFixed = replacements.some((r) => r.old === fullMatch);
            if (alreadyFixed) {
              continue;
            }
            const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
            if (!existsInBundle) {
              const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (refMatch) {
                const namePrefix = refMatch[1];
                const actualFile = chunkNameMap.get(namePrefix);
                if (actualFile) {
                  const actualFileName = actualFile.replace(/^assets\//, "");
                  replacements.push({
                    old: fullMatch,
                    new: `${quote}${relativePrefix}${actualFileName}${quote}`
                  });
                  console.log(`[fix-dynamic-import-hash] \u4FEE\u590D ${fileName} \u4E2D\u7684\u76F8\u5BF9\u8DEF\u5F84\u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                }
              }
            }
          }
          if (replacements.length > 0) {
            replacements.reverse().forEach(({ old, new: newStr }) => {
              newCode = newCode.replace(old, newStr);
            });
            modified = true;
            console.log(`[fix-dynamic-import-hash] \u2705 \u5DF2\u4FEE\u590D ${fileName} \u4E2D\u7684 ${replacements.length} \u4E2A\u5F15\u7528`);
          }
          if (modified) {
            chunk.code = newCode;
          }
        }
      }
    },
    // 在 writeBundle 阶段再次修复，确保所有引用都被修复
    writeBundle(options, bundle) {
      chunkNameMap.clear();
      const thirdPartyChunks = ["lib-echarts", "element-plus", "vue-core", "vue-router", "vendor"];
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          } else {
            const namePrefix = baseName.split("-")[0];
            if (namePrefix && !chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }
      const outputDir = options.dir || join(process.cwd(), "dist");
      let totalFixed = 0;
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const isThirdPartyLib = thirdPartyChunks.some((lib) => fileName.includes(lib));
          const filePath = join(outputDir, fileName);
          if (existsSync(filePath)) {
            let content = readFileSync(filePath, "utf-8");
            const replacements = [];
            const importPattern = /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g;
            let match;
            importPattern.lastIndex = 0;
            while ((match = importPattern.exec(content)) !== null) {
              const quote = match[1];
              const fullPath = match[2];
              const referencedFile = match[3];
              const fullMatch = match[0];
              const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
              if (!existsInBundle) {
                const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  const actualFile = chunkNameMap.get(namePrefix);
                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, "");
                    let newPath = fullPath;
                    if (fullPath.startsWith("/assets/")) {
                      newPath = `/assets/${actualFileName}`;
                    } else if (fullPath.startsWith("./assets/")) {
                      newPath = `./assets/${actualFileName}`;
                    } else if (fullPath.startsWith("assets/")) {
                      newPath = `assets/${actualFileName}`;
                    } else {
                      newPath = actualFileName;
                    }
                    replacements.push({
                      old: fullMatch,
                      new: `import(${quote}${newPath}${quote})`
                    });
                    console.log(`[fix-dynamic-import-hash] writeBundle: \u4FEE\u590D ${fileName} \u4E2D\u7684 import() \u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                  } else {
                    console.warn(`[fix-dynamic-import-hash] writeBundle: \u65E0\u6CD5\u627E\u5230 ${namePrefix} \u5BF9\u5E94\u7684\u6587\u4EF6\uFF0C\u5F15\u7528: ${referencedFile} (\u5728 ${fileName} \u4E2D)`);
                  }
                }
              }
            }
            const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
            stringPathPattern.lastIndex = 0;
            while ((match = stringPathPattern.exec(content)) !== null) {
              const quote = match[1];
              const fullPath = match[2];
              const referencedFile = match[3];
              const fullMatch = match[0];
              const alreadyFixed = replacements.some((r) => r.old === fullMatch || r.old.includes(referencedFile));
              if (alreadyFixed) {
                continue;
              }
              const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
              if (!existsInBundle) {
                const refMatch = referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  const actualFile = chunkNameMap.get(namePrefix);
                  if (!actualFile && namePrefix.includes("-")) {
                    const firstPart = namePrefix.split("-")[0];
                    const possibleMatch = Array.from(chunkNameMap.entries()).find(([key]) => key.startsWith(firstPart));
                    if (possibleMatch) {
                      const [, foundFile] = possibleMatch;
                      const actualFileName = foundFile.replace(/^assets\//, "");
                      const newPath = `/assets/${actualFileName}`;
                      replacements.push({
                        old: fullMatch,
                        new: `${quote}${newPath}${quote}`
                      });
                      console.log(`[fix-dynamic-import-hash] writeBundle: \u4F7F\u7528\u5BBD\u677E\u5339\u914D\u4FEE\u590D ${fileName} \u4E2D\u7684\u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                      continue;
                    }
                  }
                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, "");
                    const newPath = `/assets/${actualFileName}`;
                    replacements.push({
                      old: fullMatch,
                      new: `${quote}${newPath}${quote}`
                    });
                    console.log(`[fix-dynamic-import-hash] writeBundle: \u4FEE\u590D ${fileName} \u4E2D\u7684\u5F15\u7528: ${referencedFile} -> ${actualFileName}`);
                  } else {
                    console.warn(`[fix-dynamic-import-hash] writeBundle: \u65E0\u6CD5\u627E\u5230 ${namePrefix} \u5BF9\u5E94\u7684\u6587\u4EF6\uFF0C\u5F15\u7528: ${referencedFile} (\u5728 ${fileName} \u4E2D)`);
                  }
                }
              }
            }
            if (replacements.length > 0) {
              replacements.reverse().forEach(({ old, new: newStr }) => {
                content = content.replace(old, newStr);
              });
              writeFileSync(filePath, content, "utf-8");
              totalFixed++;
              console.log(`[fix-dynamic-import-hash] \u2705 writeBundle \u9636\u6BB5\u4FEE\u590D ${fileName} \u4E2D\u7684 ${replacements.length} \u4E2A\u5F15\u7528`);
            }
          }
        }
      }
      if (totalFixed > 0) {
        console.log(`[fix-dynamic-import-hash] \u2705 writeBundle \u9636\u6BB5\u5171\u4FEE\u590D ${totalFixed} \u4E2A\u6587\u4EF6`);
      }
    }
  };
};
var ensureBaseUrlPlugin = () => {
  const baseUrl = isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : "/";
  const mainAppPort = MAIN_APP_CONFIG?.prePort || "4180";
  return {
    name: "ensure-base-url",
    // 使用 renderChunk 钩子，在代码生成时处理
    renderChunk(code, chunk, options) {
      const isThirdPartyLib = chunk.fileName?.includes("lib-echarts") || chunk.fileName?.includes("element-plus") || chunk.fileName?.includes("vue-core") || chunk.fileName?.includes("vue-router") || chunk.fileName?.includes("vendor");
      if (isThirdPartyLib) {
        return null;
      }
      let newCode = code;
      let modified = false;
      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
            return `${quote}${baseUrl.replace(/\/$/, "")}${path}`;
          });
          modified = true;
        }
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
          const isThirdPartyLib = fileName.includes("lib-echarts") || fileName.includes("element-plus") || fileName.includes("vue-core") || fileName.includes("vue-router") || fileName.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          let newCode = chunk.code;
          let modified = false;
          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (match, quote, path) => {
                return `${quote}${baseUrl.replace(/\/$/, "")}${path}`;
              });
              modified = true;
            }
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
      const suspiciousFiles = [];
      jsFiles.forEach((file) => {
        const chunk = bundle[file];
        if (chunk && chunk.code && typeof chunk.code === "string") {
          const code = chunk.code;
          const isModulePreload = code.includes("modulepreload") || code.includes("relList");
          if (isModulePreload) return;
          const isKnownLibrary = file.includes("vue-core") || file.includes("element-plus") || file.includes("vendor") || file.includes("vue-i18n") || file.includes("vue-router") || file.includes("lib-echarts") || file.includes("module-") || file.includes("app-composables") || file.includes("app-pages");
          if (isKnownLibrary) return;
          const hasStyleElementCreation = /document\.createElement\(['"]style['"]\)/.test(code) && /\.(textContent|innerHTML)\s*=/.test(code) && /\{[^}]{10,}\}/.test(code);
          const hasInsertStyleWithCss = /insertStyle\s*\(/.test(code) && /text\/css/.test(code) && /\{[^}]{20,}\}/.test(code);
          const styleTagMatch = code.match(/<style[^>]*>/);
          const hasStyleTagWithContent = styleTagMatch && !styleTagMatch[0].includes("'") && // 排除字符串中的内容
          !styleTagMatch[0].includes('"') && // 排除字符串中的内容
          /\{[^}]{20,}\}/.test(code);
          const hasInlineCssString = /['"`][^'"`]{50,}:\s*[^'"`]{10,};\s*[^'"`]{10,}['"`]/.test(code) && /(color|background|width|height|margin|padding|border|display|position|flex|grid)/.test(code);
          if (hasStyleElementCreation || hasInsertStyleWithCss || hasStyleTagWithContent || hasInlineCssString) {
            hasInlineCss = true;
            suspiciousFiles.push(file);
            const patterns = [];
            if (hasStyleElementCreation) patterns.push("\u52A8\u6001\u521B\u5EFA style \u5143\u7D20");
            if (hasInsertStyleWithCss) patterns.push("insertStyle \u51FD\u6570");
            if (hasStyleTagWithContent) patterns.push("<style> \u6807\u7B7E");
            if (hasInlineCssString) patterns.push("\u5185\u8054 CSS \u5B57\u7B26\u4E32");
            console.warn(`[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u5728 ${file} \u4E2D\u68C0\u6D4B\u5230\u53EF\u80FD\u7684\u5185\u8054 CSS\uFF08\u6A21\u5F0F\uFF1A${patterns.join(", ")}\uFF09`);
          }
        }
      });
      if (hasInlineCss) {
        console.warn("[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u68C0\u6D4B\u5230 CSS \u53EF\u80FD\u88AB\u5185\u8054\u5230 JS \u4E2D\uFF0C\u8FD9\u4F1A\u5BFC\u81F4 qiankun \u65E0\u6CD5\u6B63\u786E\u52A0\u8F7D\u6837\u5F0F");
        console.warn(`[ensure-css-plugin] \u53EF\u7591\u6587\u4EF6\uFF1A${suspiciousFiles.join(", ")}`);
        console.warn("[ensure-css-plugin] \u8BF7\u68C0\u67E5 vite-plugin-qiankun \u914D\u7F6E\u548C build.assetsInlineLimit \u8BBE\u7F6E");
        console.warn("[ensure-css-plugin] \u5982\u679C\u8FD9\u662F\u8BEF\u62A5\uFF0C\u8BF7\u68C0\u67E5\u8FD9\u4E9B\u6587\u4EF6\u7684\u5B9E\u9645\u5185\u5BB9");
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
var BASE_URL = isPreviewBuild ? `http://${APP_HOST}:${APP_PORT}/` : "/";
console.log(`[admin-app vite.config] Base URL: ${BASE_URL}, APP_HOST: ${APP_HOST}, APP_PORT: ${APP_PORT}, isPreviewBuild: ${isPreviewBuild}`);
var vite_config_default = defineConfig({
  // 关键：base 配置
  // - 预览构建：使用绝对路径（http://localhost:4181/），用于本地预览测试
  // - 生产构建：使用相对路径（/），让浏览器根据当前域名（admin.bellis.com.cn）自动解析
  // 这样在生产环境访问时，资源路径会自动使用当前域名，而不是硬编码的 localhost
  base: BASE_URL,
  // 配置 publicDir，指向 admin-app 自己的 public 目录
  // 注意：admin-app 需要自己的 icons 和 templates 目录，所以使用自己的 public 目录
  // 其他子应用使用共享组件库的 public 目录（只有 logo.png）
  publicDir: resolve(__vite_injected_original_dirname, "public"),
  resolve: {
    alias: {
      "@": withSrc("src"),
      "@modules": withSrc("src/modules"),
      "@services": withSrc("src/services"),
      "@components": withSrc("src/components"),
      "@utils": withSrc("src/utils"),
      "@auth": withRoot("auth"),
      "@configs": withRoot("configs"),
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
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    dedupe: ["element-plus", "@element-plus/icons-vue", "vue", "vue-router", "pinia", "dayjs"]
  },
  plugins: [
    cleanDistPlugin(),
    // 0. 构建前清理 dist 目录（最前面）
    corsPlugin(),
    // 1. CORS 插件（不干扰构建）
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
    forceNewHashPlugin(),
    // 强制生成新 hash（在 renderChunk 阶段添加构建 ID）
    fixDynamicImportHashPlugin(),
    // 修复动态导入中的旧 hash 引用
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
    // 关键：禁用 JS 代码压缩，避免破坏 ECharts 等第三方库的内部代码
    // 如果必须压缩，使用 terser 而不是 esbuild，因为 esbuild 可能破坏某些代码
    minify: false,
    // 关键：禁用代码压缩时，确保不会对第三方库进行任何转换
    // 通过 rollupOptions 的 external 或 preserveModules 来保护第三方库
    // 禁止内联任何资源（确保 JS/CSS 都是独立文件）
    assetsInlineLimit: 0,
    // 明确指定输出目录，确保 CSS 文件被正确输出
    outDir: "dist",
    assetsDir: "assets",
    // 构建前清空输出目录，确保不会残留旧文件
    emptyOutDir: true,
    // 让 Vite 自动从 index.html 读取入口（与其他子应用一致）
    rollupOptions: {
      // 禁用 Rollup 缓存，确保每次构建都重新生成所有 chunk
      // 这可以避免旧的 chunk 引用没有被更新
      cache: false,
      // 关键：将 ECharts 相关模块外部化，避免 Rollup 处理它们
      // 这样可以确保 ECharts 的内部代码不会被破坏
      // 但注意：external 会导致 ECharts 不被打包，需要从 CDN 加载
      // 暂时不使用 external，而是通过跳过处理来保护
      // external: (id) => {
      //   return id.includes('echarts') || id.includes('vue-echarts');
      // },
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
        // 关键：确保 ECharts 相关 chunk 不被修改
        // 通过 manualChunks 确保它们被正确分割，但不进行任何额外处理
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
              return "app-src";
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
              return "app-src";
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
            if (id.includes(".css") || id.includes(".scss") || id.includes("styles/")) {
              return void 0;
            }
            if (id.includes("@btc/shared-components")) {
              return "btc-components";
            }
            return "btc-shared";
          }
          return "app-src";
        },
        // 关键：确保 chunk 之间的导入使用相对路径，而不是绝对路径
        // 这样在 qiankun 环境下，资源路径会根据入口 HTML 的位置正确解析
        preserveModules: false,
        // 关键：强制所有资源路径使用绝对路径（基于 base）
        // Vite 默认会根据 base 生成绝对路径，但显式声明作为兜底
        // 确保所有资源路径都包含子应用端口（4181），而非主应用端口（4180）
        // 使用标准格式，时间戳由 forceNewHashPlugin 插件在 generateBundle 阶段添加
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAidml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0LnRzIiwgInNyYy9jb25maWcvcHJveHkudHMiLCAiLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nO1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSc7XG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bi92aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IHJlc29sdmUsIGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcm1TeW5jLCB3cml0ZUZpbGVTeW5jLCByZWFkZGlyU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZUF1dG9JbXBvcnRDb25maWcsIGNyZWF0ZUNvbXBvbmVudHNDb25maWcgfSBmcm9tICcuLi8uLi9jb25maWdzL2F1dG8taW1wb3J0LmNvbmZpZyc7XG5pbXBvcnQgeyB0aXRsZUluamVjdFBsdWdpbiB9IGZyb20gJy4vdml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0JztcbmltcG9ydCB7IHByb3h5IH0gZnJvbSAnLi9zcmMvY29uZmlnL3Byb3h5JztcbmltcG9ydCB7IGJ0YyB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8vIFx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdhZG1pbi1hcHAnKTtcbmlmICghYXBwQ29uZmlnKSB7XG4gIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2MjdFXHU1MjMwIGFkbWluLWFwcCBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkUnKTtcbn1cblxuLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU5ODg0XHU4OUM4XHU3QUVGXHU1M0UzXHU1NDhDXHU0RTNCXHU2NzNBXHVGRjA4XHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4XHVGRjA5XG5jb25zdCBBUFBfUE9SVCA9IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCk7XG5jb25zdCBBUFBfSE9TVCA9IGFwcENvbmZpZy5wcmVIb3N0O1xuY29uc3QgTUFJTl9BUFBfQ09ORklHID0gZ2V0QXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XG5jb25zdCBNQUlOX0FQUF9PUklHSU4gPSBNQUlOX0FQUF9DT05GSUcgPyBgaHR0cDovLyR7TUFJTl9BUFBfQ09ORklHLnByZUhvc3R9OiR7TUFJTl9BUFBfQ09ORklHLnByZVBvcnR9YCA6ICdodHRwOi8vbG9jYWxob3N0OjQxODAnO1xuXG4vLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMDhcdTc1MjhcdTRFOEVcdTY3MkNcdTU3MzBcdTk4ODRcdTg5QzhcdTZENEJcdThCRDVcdUZGMDlcbi8vIFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NUU5NFx1OEJFNVx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjgzOVx1NjM2RVx1NUY1M1x1NTI0RFx1NTdERlx1NTQwRFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFxuY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcblxuLy8gXHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG5jb25zdCBjbGVhbkRpc3RQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2xlYW4tZGlzdC1wbHVnaW4nLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdUQ4M0VcdURERjkgXHU2RTA1XHU3NDA2XHU2NUU3XHU3Njg0IGRpc3QgXHU3NkVFXHU1RjU1Li4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3MDUgZGlzdCBcdTc2RUVcdTVGNTVcdTVERjJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcblxuLy8gXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NzUxRlx1NjIxMFx1NjNEMlx1NEVGNlxuY29uc3QgY2h1bmtWZXJpZnlQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2h1bmstdmVyaWZ5LXBsdWdpbicsXG4gICAgd3JpdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICBjb25zb2xlLmxvZygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTc1MUZcdTYyMTBcdTc2ODRcdTYyNDBcdTY3MDkgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBJyk7XG4gICAgICAvLyBcdTUyMDZcdTdDN0JcdTYyNTNcdTUzNzAgSlMgY2h1bmtcdTMwMDFDU1MgY2h1bmtcdTMwMDFcdTUxNzZcdTRFRDZcdThENDRcdTZFOTBcbiAgICAgIGNvbnN0IGpzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICBjb25zdCBjc3NDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBcXG5KUyBjaHVua1x1RkYwOFx1NTE3MSAke2pzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBqc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGNvbnNvbGUubG9nKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBcXG5DU1MgY2h1bmtcdUZGMDhcdTUxNzEgJHtjc3NDaHVua3MubGVuZ3RofSBcdTRFMkFcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGNzc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGNvbnNvbGUubG9nKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjgzOFx1NUZDMyBjaHVuayBcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdUZGMDhcdTkwN0ZcdTUxNERcdTUxNzNcdTk1MkVcdTRGOURcdThENTZcdTRFMjJcdTU5MzFcdUZGMDlcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXZ1ZS12ZW5kb3IgXHU1M0VGXHU4MEZEXHU4OEFCXHU2MkM2XHU1MjA2XHU0RTNBIHZ1ZS1jb3JlXHUzMDAxdnVlLXJvdXRlclx1MzAwMXBpbmlhXHVGRjBDXHU2MjQwXHU0RUU1XHU2OEMwXHU2N0U1XHU4RkQ5XHU0RTlCXG4gICAgICBjb25zdCByZXF1aXJlZENodW5rcyA9IFsnZWxlbWVudC1wbHVzJywgJ3ZlbmRvciddO1xuICAgICAgY29uc3QgdnVlQ2h1bmtzID0gWyd2dWUtY29yZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ3Z1ZS12ZW5kb3InXTtcbiAgICAgIGNvbnN0IGhhc1Z1ZUNodW5rID0gdnVlQ2h1bmtzLnNvbWUoY2h1bmtOYW1lID0+XG4gICAgICAgIGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKGNodW5rTmFtZSkpXG4gICAgICApO1xuICAgICAgY29uc3QgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzID0gcmVxdWlyZWRDaHVua3MuZmlsdGVyKGNodW5rTmFtZSA9PlxuICAgICAgICAhanNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNSBhcHAtc3JjIFx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NEUwRFx1NUI1OFx1NTcyOFx1NEY0NiBpbmRleCBcdTY1ODdcdTRFRjZcdTVGODhcdTU5MjdcdUZGMENcdThCRjRcdTY2MEVcdTVFOTRcdTc1MjhcdTRFRTNcdTc4MDFcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTRFODZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IGhhc0FwcFNyYyA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdhcHAtc3JjJykpO1xuICAgICAgY29uc3QgaW5kZXhDaHVuayA9IGpzQ2h1bmtzLmZpbmQoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdpbmRleC0nKSk7XG4gICAgICBjb25zdCBpbmRleFNpemUgPSBpbmRleENodW5rID8gKGJ1bmRsZVtpbmRleENodW5rXSBhcyBhbnkpPy5jb2RlPy5sZW5ndGggfHwgMCA6IDA7XG4gICAgICBjb25zdCBpbmRleFNpemVLQiA9IGluZGV4U2l6ZSAvIDEwMjQ7XG5cbiAgICAgIC8vIFx1NTk4Mlx1Njc5QyBpbmRleCBcdTY1ODdcdTRFRjZcdThEODVcdThGQzcgNTAwS0JcdUZGMENcdThCRjRcdTY2MEVcdTVFOTRcdTc1MjhcdTRFRTNcdTc4MDFcdTUzRUZcdTgwRkRcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTRFODZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1OEZEOVx1NzlDRFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1x1NjIxMVx1NEVFQ1x1NTE0MVx1OEJCOFx1NkNBMVx1NjcwOSBhcHAtc3JjXHVGRjBDXHU1M0VBXHU4QkIwXHU1RjU1XHU0RkUxXHU2MDZGXHVGRjA4XHU0RTBEXHU1M0QxXHU1MUZBXHU4QjY2XHU1NDRBXHVGRjBDXHU1NkUwXHU0RTNBXHU4RkQ5XHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XHU2Nzg0XHU1RUZBXHU4ODRDXHU0RTNBXHVGRjA5XG4gICAgICBpZiAoIWhhc0FwcFNyYyAmJiBpbmRleFNpemVLQiA+IDUwMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjEzOVx1RkUwRiBcdTRGRTFcdTYwNkZcdUZGMUFhcHAtc3JjIGNodW5rIFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEY0NiBpbmRleCBcdTY1ODdcdTRFRjZcdThGODNcdTU5MjcgKCR7aW5kZXhTaXplS0IudG9GaXhlZCgyKX1LQilgKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtjaHVuay12ZXJpZnktcGx1Z2luXSBcdTVFOTRcdTc1MjhcdTRFRTNcdTc4MDFcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTRFODZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMENcdThGRDlcdTY2MkZcdTZCNjNcdTVFMzhcdTc2ODRcdTY3ODRcdTVFRkFcdTg4NENcdTRFM0FgKTtcbiAgICAgICAgLy8gXHU0RTBEXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjBDXHU1M0VBXHU4QkIwXHU1RjU1XHU0RkUxXHU2MDZGXG4gICAgICB9IGVsc2UgaWYgKCFoYXNBcHBTcmMpIHtcbiAgICAgICAgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzLnB1c2goJ2FwcC1zcmMnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNWdWVDaHVuaykge1xuICAgICAgICBtaXNzaW5nUmVxdWlyZWRDaHVua3MucHVzaCgndnVlLWNvcmUvdnVlLXJvdXRlci9waW5pYScpO1xuICAgICAgfVxuXG4gICAgICBpZiAobWlzc2luZ1JlcXVpcmVkQ2h1bmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTdGM0FcdTU5MzFcdTY4MzhcdTVGQzMgY2h1bmtcdUZGMUFgLCBtaXNzaW5nUmVxdWlyZWRDaHVua3MpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjgzOFx1NUZDMyBjaHVuayBcdTdGM0FcdTU5MzFcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjgzOFx1NUZDMyBjaHVuayBcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1NEUyRFx1NUYxNVx1NzUyOFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1OTBGRFx1NUI1OFx1NTcyOFxuICAgICAgY29uc29sZS5sb2coJ1xcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdUQ4M0RcdUREMEQgXHU5QThDXHU4QkMxXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTAwXHU4MUY0XHU2MDI3Li4uJyk7XG4gICAgICBjb25zdCBhbGxDaHVua0ZpbGVzID0gbmV3IFNldChbLi4uanNDaHVua3MsIC4uLmNzc0NodW5rc10pO1xuICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpOyAvLyBcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MEQgLT4gXHU1RjE1XHU3NTI4XHU1QjgzXHU3Njg0IGNodW5rIFx1NTIxN1x1ODg2OFxuICAgICAgY29uc3QgbWlzc2luZ0ZpbGVzOiBBcnJheTx7IGZpbGU6IHN0cmluZzsgcmVmZXJlbmNlZEJ5OiBzdHJpbmdbXTsgcG9zc2libGVNYXRjaGVzOiBzdHJpbmdbXSB9PiA9IFtdO1xuXG4gICAgICAvLyBcdTRFQ0VcdTYyNDBcdTY3MDkgSlMgY2h1bmsgXHU0RTJEXHU2M0QwXHU1M0Q2XHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgICAvLyBcdTUzRUFcdTUzMzlcdTkxNERcdTc3MUZcdTZCNjNcdTc2ODRcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTU0OENcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBpZiAoY2h1bmsudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVuay5jb2RlKSB7XG4gICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU2Q0U4XHU5MUNBXHVGRjBDXHU5MDdGXHU1MTREXHU1MzM5XHU5MTREXHU2Q0U4XHU5MUNBXHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgY29uc3QgY29kZVdpdGhvdXRDb21tZW50cyA9IGNodW5rLmNvZGVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXC8uKiQvZ20sICcnKSAvLyBcdTc5RkJcdTk2NjRcdTUzNTVcdTg4NENcdTZDRThcdTkxQ0FcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKTsgLy8gXHU3OUZCXHU5NjY0XHU1OTFBXHU4ODRDXHU2Q0U4XHU5MUNBXG5cbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMUFpbXBvcnQoJy9hc3NldHMveHh4LmpzJykgXHU2MjE2IGltcG9ydChcIi9hc3NldHMveHh4LmpzXCIpXG4gICAgICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXVxccypcXCkvZztcbiAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IGltcG9ydFBhdHRlcm4uZXhlYyhjb2RlV2l0aG91dENvbW1lbnRzKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL15cXC8/YXNzZXRzXFwvLywgJ2Fzc2V0cy8nKTtcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlZEZpbGVzLmhhcyhyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5zZXQocmVzb3VyY2VGaWxlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuZ2V0KHJlc291cmNlRmlsZSkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBuZXcgVVJMKCcvYXNzZXRzL3h4eC5qcycsIC4uLilcbiAgICAgICAgICBjb25zdCB1cmxQYXR0ZXJuID0gL25ld1xccytVUkxcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXS9nO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB1cmxQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2MjQwXHU2NzA5XHU1RjE1XHU3NTI4XHU3Njg0XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU5MEZEXHU1NzI4IGJ1bmRsZSBcdTRFMkRcdTVCNThcdTU3MjhcbiAgICAgIGZvciAoY29uc3QgW3JlZmVyZW5jZWRGaWxlLCByZWZlcmVuY2VkQnldIG9mIHJlZmVyZW5jZWRGaWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU4REVGXHU1Rjg0XHVGRjA5XHVGRjFBeHh4LWhhc2guanNcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSByZWZlcmVuY2VkRmlsZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1NUI4Q1x1NTE2OFx1NTMzOVx1OTE0RFx1NzY4NFx1NjU4N1x1NEVGNlxuICAgICAgICBsZXQgZXhpc3RzID0gYWxsQ2h1bmtGaWxlcy5oYXMoZmlsZU5hbWUpO1xuICAgICAgICBsZXQgcG9zc2libGVNYXRjaGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NUI1OFx1NTcyOFx1NUI4Q1x1NTE2OFx1NTMzOVx1OTE0RFx1RkYwQ1x1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NTQwRFx1NkEyMVx1NUYwRlx1NTMzOVx1OTE0RFx1RkYwOFx1NUZGRFx1NzU2NSBoYXNoXHVGRjA5XG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU2NTg3XHU0RUY2XHU1NDBEXHU1MjREXHU3RjAwXHVGRjA4XHU1OTgyIGVsZW1lbnQtcGx1c1x1RkYwOVx1NTQ4Q1x1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgICAgIC8vIFx1NjUyRlx1NjMwMVx1NTkxQVx1NzlDRFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRlx1RkYxQW5hbWUtaGFzaC5leHQsIG5hbWUtaGFzaC1oYXNoLmV4dCwgbmFtZS5leHRcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICAvLyBcdTY3RTVcdTYyN0VcdTYyNDBcdTY3MDlcdTUzMzlcdTkxNERcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMDhcdTVGRkRcdTc1NjUgaGFzaFx1RkYwOVxuICAgICAgICAgICAgcG9zc2libGVNYXRjaGVzID0gQXJyYXkuZnJvbShhbGxDaHVua0ZpbGVzKS5maWx0ZXIoY2h1bmtGaWxlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY2h1bmtNYXRjaCA9IGNodW5rRmlsZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgaWYgKGNodW5rTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbLCBjaHVua05hbWVQcmVmaXgsICwgY2h1bmtFeHRdID0gY2h1bmtNYXRjaDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2h1bmtOYW1lUHJlZml4ID09PSBuYW1lUHJlZml4ICYmIGNodW5rRXh0ID09PSBleHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBleGlzdHMgPSBwb3NzaWJsZU1hdGNoZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NTg3XHU0RUY2XHU1NDBEXHU2ODNDXHU1RjBGXHU0RTBEXHU1MzM5XHU5MTREXHVGRjBDXHU1QzFEXHU4QkQ1XHU3NkY0XHU2M0E1XHU2N0U1XHU2MjdFXHU3NkY4XHU0RjNDXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXG4gICAgICAgICAgICBjb25zdCBuYW1lV2l0aG91dEV4dCA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLihqc3xtanN8Y3NzKSQvLCAnJyk7XG4gICAgICAgICAgICBwb3NzaWJsZU1hdGNoZXMgPSBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLmZpbHRlcihjaHVua0ZpbGUgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaHVua05hbWVXaXRob3V0RXh0ID0gY2h1bmtGaWxlLnJlcGxhY2UoL1xcLihqc3xtanN8Y3NzKSQvLCAnJyk7XG4gICAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NTQwRFx1NTI0RFx1N0YwMFx1NjYyRlx1NTQyNlx1NzZGOFx1NEYzQ1x1RkYwOFx1ODFGM1x1NUMxMVx1NTI0RDEwXHU0RTJBXHU1QjU3XHU3QjI2XHU1MzM5XHU5MTREXHVGRjA5XG4gICAgICAgICAgICAgIHJldHVybiBjaHVua05hbWVXaXRob3V0RXh0LnN0YXJ0c1dpdGgobmFtZVdpdGhvdXRFeHQuc3Vic3RyaW5nKDAsIDEwKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgIG5hbWVXaXRob3V0RXh0LnN0YXJ0c1dpdGgoY2h1bmtOYW1lV2l0aG91dEV4dC5zdWJzdHJpbmcoMCwgMTApKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgbWlzc2luZ0ZpbGVzLnB1c2goeyBmaWxlOiByZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5LCBwb3NzaWJsZU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBYCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTVCOUVcdTk2NDVcdTVCNThcdTU3MjhcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMDhcdTUxNzEgJHthbGxDaHVua0ZpbGVzLnNpemV9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAgICBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLnNvcnQoKS5mb3JFYWNoKGZpbGUgPT4gY29uc29sZS5lcnJvcihgICAtICR7ZmlsZX1gKSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMDhcdTUxNzEgJHtyZWZlcmVuY2VkRmlsZXMuc2l6ZX0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICAgIEFycmF5LmZyb20ocmVmZXJlbmNlZEZpbGVzLmtleXMoKSkuc29ydCgpLmZvckVhY2goZmlsZSA9PiBjb25zb2xlLmVycm9yKGAgIC0gJHtmaWxlfWApKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1N0YzQVx1NTkzMVx1NzY4NFx1NjU4N1x1NEVGNlx1OEJFNlx1NjBDNVx1RkYxQWApO1xuICAgICAgICBtaXNzaW5nRmlsZXMuZm9yRWFjaCgoeyBmaWxlLCByZWZlcmVuY2VkQnksIHBvc3NpYmxlTWF0Y2hlcyB9KSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgICAtICR7ZmlsZX1gKTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGAgICAgXHU4OEFCXHU0RUU1XHU0RTBCXHU2NTg3XHU0RUY2XHU1RjE1XHU3NTI4OiAke3JlZmVyZW5jZWRCeS5qb2luKCcsICcpfWApO1xuICAgICAgICAgIGlmIChwb3NzaWJsZU1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgICAgIFx1NTNFRlx1ODBGRFx1NzY4NFx1NTMzOVx1OTE0RFx1NjU4N1x1NEVGNjogJHtwb3NzaWJsZU1hdGNoZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHU4RkQ5XHU5MDFBXHU1RTM4XHU2NjJGXHU1NkUwXHU0RTNBXHVGRjFBJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgMS4gXHU2Nzg0XHU1RUZBXHU1MjREXHU2Q0ExXHU2NzA5XHU2RTA1XHU3NDA2XHU2NUU3XHU3Njg0IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjA4XHU1REYyXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA5Jyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgMi4gXHU2Nzg0XHU1RUZBXHU4RkM3XHU3QTBCXHU0RTJEXHU2NTg3XHU0RUY2XHU1NDBEIGhhc2ggXHU0RTBEXHU0RTAwXHU4MUY0Jyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgMy4gdXNlRGV2TW9kZSBcdTkxNERcdTdGNkVcdTVCRkNcdTgxRjRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMERcdTRFMDBcdTgxRjQnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignICA0LiBcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTVCOENcdTY1NzRcdUZGMDhcdTkwRThcdTUyMDZcdTY1ODdcdTRFRjZcdTY3MkFcdTc1MUZcdTYyMTBcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignICA1LiBcdTlBOENcdThCQzFcdTkwM0JcdThGOTFcdThCRUZcdTYyQTVcdUZGMDhcdTVGMTVcdTc1MjhcdTRFODZcdTRFMERcdTVCNThcdTU3MjhcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1ODlFM1x1NTFCM1x1NjVCOVx1Njg0OFx1RkYxQScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcgIDEuIFx1OEZEMFx1ODg0QyBwbnBtIHByZWJ1aWxkOmFsbCBcdTZFMDVcdTc0MDZcdTdGMTNcdTVCNThcdTU0OEMgZGlzdCBcdTc2RUVcdTVGNTUnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignICAyLiBcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFOTRcdTc1MjgnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignICAzLiBcdTY4QzBcdTY3RTVcdTY3ODRcdTVFRkFcdTY1RTVcdTVGRDdcdUZGMENcdTc4NkVcdThCQTRcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcdTkwRkRcdTVERjJcdTc1MUZcdTYyMTAnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignICA0LiBcdTU5ODJcdTY3OUNcdTc4NkVcdThCQTRcdTY2MkZcdThCRUZcdTYyQTVcdUZGMENcdTUzRUZcdTRFRTVcdTRFMzRcdTY1RjZcdTc5ODFcdTc1MjhcdTZCNjRcdTlBOENcdThCQzFcdTYzRDJcdTRFRjYnKTtcblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTdGM0FcdTU5MzFcdTY1ODdcdTRFRjZcdTY1NzBcdTkxQ0ZcdThGODNcdTVDMTFcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdThCRUZcdTYyQTVcdUZGMDlcdUZGMENcdTUzRUFcdThCNjZcdTU0NEFcdUZGMUJcdTU0MjZcdTUyMTlcdTYyQTVcdTk1MTlcbiAgICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPD0gNSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBXHVGRjFBXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RjQ2XHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBYCk7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBbY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1XHU0RTBBXHU4RkYwXHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGXHVGRjBDXHU3ODZFXHU4QkE0XHU2NjJGXHU1NDI2XHU3NzFGXHU3Njg0XHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFcdTY3MDkgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU5MEZEXHU2QjYzXHU3ODZFXHVGRjA4XHU1MTcxXHU5QThDXHU4QkMxICR7cmVmZXJlbmNlZEZpbGVzLnNpemV9IFx1NEUyQVx1NUYxNVx1NzUyOFx1RkYwOWApO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59O1xuXG4vLyBcdTRGMThcdTUzMTZcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTYzRDJcdTRFRjZcdUZGMUFcdTU5MDRcdTc0MDZcdTdBN0EgY2h1bmtcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjYgNDA0XG5jb25zdCBvcHRpbWl6ZUNodW5rc1BsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvcHRpbWl6ZS1jaHVua3MnLFxuICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgLy8gXHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5XHU3QTdBIGNodW5rXG4gICAgICBjb25zdCBlbXB0eUNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGNodW5rUmVmZXJlbmNlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTsgLy8gY2h1bmsgXHU1NDBEXHU3OUYwIC0+IFx1NUYxNVx1NzUyOFx1NUI4M1x1NzY4NCBjaHVuayBcdTUyMTdcdTg4NjhcblxuICAgICAgLy8gXHU3QjJDXHU0RTAwXHU2QjY1XHVGRjFBXHU2MjdFXHU1MUZBXHU2MjQwXHU2NzA5XHU3QTdBIGNodW5rXHVGRjBDXHU1RTc2XHU2NTM2XHU5NkM2XHU1RjE1XHU3NTI4XHU1MTczXHU3Q0ZCXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmsuY29kZS50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgZW1wdHlDaHVua3MucHVzaChmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU2NTM2XHU5NkM2IGNodW5rIFx1NzY4NFx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwOFx1NTRFQVx1NEU5QiBjaHVuayBcdTVGMTVcdTc1MjhcdTRFODZcdThGRDlcdTRFMkEgY2h1bmtcdUZGMDlcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmsuaW1wb3J0cykge1xuICAgICAgICAgIGZvciAoY29uc3QgaW1wb3J0ZWQgb2YgY2h1bmsuaW1wb3J0cykge1xuICAgICAgICAgICAgaWYgKCFjaHVua1JlZmVyZW5jZXMuaGFzKGltcG9ydGVkKSkge1xuICAgICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuc2V0KGltcG9ydGVkLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuZ2V0KGltcG9ydGVkKSEucHVzaChmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbXB0eUNodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTdCMkNcdTRFOENcdTZCNjVcdUZGMUFcdTVCRjlcdTRFOEVcdTZCQ0ZcdTRFMkFcdTdBN0EgY2h1bmtcdUZGMENcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTg4QUJcdTVGMTVcdTc1MjhcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1ODhBQlx1NUYxNVx1NzUyOFx1RkYwQ1x1OTcwMFx1ODk4MVx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1RkYwOFx1NTQwOFx1NUU3Nlx1NTIzMFx1NUYxNVx1NzUyOFx1NUI4M1x1NzY4NCBjaHVuayBcdTYyMTZcdTRGRERcdTc1NTlcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDlcbiAgICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtzVG9LZWVwOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGVtcHR5Q2h1bmsgb2YgZW1wdHlDaHVua3MpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZEJ5ID0gY2h1bmtSZWZlcmVuY2VzLmdldChlbXB0eUNodW5rKSB8fCBbXTtcbiAgICAgICAgICBpZiAocmVmZXJlbmNlZEJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBcdTg4QUJcdTVGMTVcdTc1MjhcdTRFODZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTUyMjBcdTk2NjRcdUZGMENcdTk3MDBcdTg5ODFcdTRGRERcdTc1NTlcdTYyMTZcdTU0MDhcdTVFNzZcbiAgICAgICAgICAvLyBcdTY1QjlcdTY4NDhcdUZGMUFcdTRGRERcdTc1NTlcdTRFMDBcdTRFMkFcdTY3MDBcdTVDMEZcdTc2ODRcdTY3MDlcdTY1NDggRVMgXHU2QTIxXHU1NzU3XHU0RUUzXHU3ODAxXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU5NTE5XHU4QkVGXG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgIC8vIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NjcwMFx1NUMwRlx1NzY4NFx1NjcwOVx1NjU0OCBFUyBcdTZBMjFcdTU3NTdcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTk1MTlcdThCRUZcbiAgICAgICAgICAgIC8vIFx1NEY3Rlx1NzUyOCBleHBvcnQge30gXHU3ODZFXHU0RkREXHU1QjgzXHU2NjJGXHU0RTAwXHU0RTJBXHU2NzA5XHU2NTQ4XHU3Njg0IEVTIFx1NkEyMVx1NTc1N1xuICAgICAgICAgICAgY2h1bmsuY29kZSA9ICdleHBvcnQge307JztcbiAgICAgICAgICAgIGNodW5rc1RvS2VlcC5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazogJHtlbXB0eUNodW5rfSAoXHU4OEFCICR7cmVmZXJlbmNlZEJ5Lmxlbmd0aH0gXHU0RTJBIGNodW5rIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNilgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU2Q0ExXHU2NzA5XHU4OEFCXHU1RjE1XHU3NTI4XHVGRjBDXHU1M0VGXHU0RUU1XHU1Qjg5XHU1MTY4XHU1MjIwXHU5NjY0XG4gICAgICAgICAgY2h1bmtzVG9SZW1vdmUucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICBkZWxldGUgYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaHVua3NUb1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbb3B0aW1pemUtY2h1bmtzXSBcdTc5RkJcdTk2NjRcdTRFODYgJHtjaHVua3NUb1JlbW92ZS5sZW5ndGh9IFx1NEUyQVx1NjcyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazpgLCBjaHVua3NUb1JlbW92ZSk7XG4gICAgICB9XG4gICAgICBpZiAoY2h1bmtzVG9LZWVwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1NEU4NiAke2NodW5rc1RvS2VlcC5sZW5ndGh9IFx1NEUyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVua1x1RkYwOFx1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOTpgLCBjaHVua3NUb0tlZXApO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59O1xuXG4vLyBcdTVGM0FcdTUyMzZcdTc1MUZcdTYyMTBcdTY1QjAgaGFzaCBcdTYzRDJcdTRFRjZcdUZGMUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTZERkJcdTUyQTBcdTY3ODRcdTVFRkEgSUQgXHU1MjMwXHU0RUUzXHU3ODAxXHU0RTJEXHVGRjBDXHU3ODZFXHU0RkREXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU1MTg1XHU1QkI5XHU5MEZEXHU0RTBEXHU1NDBDXG4vLyBcdTU0MENcdTY1RjZcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU0RkVFXHU2NTM5XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjBDXHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXG5jb25zdCBmb3JjZU5ld0hhc2hQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgY29uc3QgYnVpbGRJZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICBjb25zdCBjc3NGaWxlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIFx1NjVFNyBDU1MgXHU2NTg3XHU0RUY2XHU1NDBEIC0+IFx1NjVCMCBDU1MgXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCIGFzc2V0cy8gXHU1MjREXHU3RjAwXHVGRjA5XG4gIGNvbnN0IGpzRmlsZU5hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpOyAvLyBcdTY1RTcgSlMgXHU2NTg3XHU0RUY2XHU1NDBEIC0+IFx1NjVCMCBKUyBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkIgYXNzZXRzLyBcdTUyNERcdTdGMDBcdUZGMDlcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmb3JjZS1uZXctaGFzaCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1Njc4NFx1NUVGQSBJRDogJHtidWlsZElkfWApO1xuICAgICAgY3NzRmlsZU5hbWVNYXAuY2xlYXIoKTtcbiAgICB9LFxuICAgIHJlbmRlckNodW5rKGNvZGUsIGNodW5rKSB7XG4gICAgICAvLyBcdTU3MjhcdTZCQ0ZcdTRFMkEgY2h1bmsgXHU3Njg0XHU1RjAwXHU1OTM0XHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEIFx1NkNFOFx1OTFDQVx1RkYwQ1x1OEZEOVx1NjgzN1x1NTE4NVx1NUJCOVx1NTNEOFx1NEU4Nlx1RkYwQ2hhc2ggXHU1QzMxXHU0RjFBXHU1M0Q4XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThERjNcdThGQzdcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgY2h1bmtcdUZGMENcdTkwN0ZcdTUxNERcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTRFRTNcdTc4MDFcbiAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygndmVuZG9yJyk7XG5cbiAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgLy8gXHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHU0RTBEXHU2REZCXHU1MkEwXHU2Q0U4XHU5MUNBXHVGRjBDXHU5MDdGXHU1MTREXHU3ODM0XHU1NzRGXHU0RUUzXHU3ODAxXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTRGRUVcdTY1MzlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGAvKiBidWlsZC1pZDogJHtidWlsZElkfSAqL1xcbiR7Y29kZX1gO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAvLyBcdTRGRUVcdTY1MzlcdTYyNDBcdTY3MDkgY2h1bmsgXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjBDXHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEXG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTk3MDBcdTg5ODFcdTU3MjggZml4RHluYW1pY0ltcG9ydEhhc2hQbHVnaW4gXHU0RTRCXHU1MjREXHU2MjY3XHU4ODRDXHVGRjBDXHU3ODZFXHU0RkREXHU2NTg3XHU0RUY2XHU1NDBEXHU1REYyXHU3RUNGXHU2NkY0XHU2NUIwXG4gICAgICBjb25zdCBmaWxlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIFx1NjVFN1x1NjU4N1x1NEVGNlx1NTQwRCAtPiBcdTY1QjBcdTY1ODdcdTRFRjZcdTU0MERcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVCOENcdTUxNjhcdThERjNcdThGQzcgbGliLWVjaGFydHMgXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXHU0RkVFXHU2NTM5XHVGRjBDXHU5MDdGXHU1MTREXHU0RUZCXHU0RjU1XHU1M0VGXHU4MEZEXHU3Njg0XHU1OTA0XHU3NDA2XG4gICAgICAgICAgLy8gRUNoYXJ0cyBcdTVFOTNcdTVCRjlcdTRFRTNcdTc4MDFcdTU5MDRcdTc0MDZcdTk3NUVcdTVFMzhcdTY1NEZcdTYxMUZcdUZGMENcdTRFRkJcdTRGNTVcdTRGRUVcdTY1MzlcdTkwRkRcdTUzRUZcdTgwRkRcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTRFRTNcdTc4MDFcbiAgICAgICAgICBjb25zdCBpc0VDaGFydHNMaWIgPSBmaWxlTmFtZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKTtcblxuICAgICAgICAgIGlmIChpc0VDaGFydHNMaWIpIHtcbiAgICAgICAgICAgIC8vIGxpYi1lY2hhcnRzIFx1NEUwRFx1NEZFRVx1NjUzOVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwQ1x1NEU1Rlx1NEUwRFx1OEJCMFx1NUY1NVx1NjYyMFx1NUMwNFxuICAgICAgICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1MTc2XHU0RUQ2XHU2NTg3XHU0RUY2XHU0RTJEXHU1QkY5XHU1QjgzXHU3Njg0XHU1RjE1XHU3NTI4XHU0RTVGXHU0RTBEXHU0RjFBXHU4OEFCXHU0RkVFXHU2NTM5XHVGRjBDXHU5MDdGXHU1MTREXHU3ODM0XHU1NzRGXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDNyBsaWItZWNoYXJ0cyBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTRGRUVcdTY1Mzk6ICR7ZmlsZU5hbWV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTUzQkJcdTYzODkgYXNzZXRzLyBcdTUyNERcdTdGMDBcdTU0OEMgLmpzIFx1NTQwRVx1N0YwMFx1RkYwOVxuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKS5yZXBsYWNlKC9cXC5qcyQvLCAnJyk7XG4gICAgICAgICAgLy8gXHU1NzI4XHU2NTg3XHU0RUY2XHU1NDBEXHU2NzJCXHU1QzNFXHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEXG4gICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHVGRjFBbmFtZS1oYXNoIC0+IG5hbWUtaGFzaC1idWlsZElkXG4gICAgICAgICAgY29uc3QgbmV3RmlsZU5hbWUgPSBgYXNzZXRzLyR7YmFzZU5hbWV9LSR7YnVpbGRJZH0uanNgO1xuXG4gICAgICAgICAgLy8gXHU4QkIwXHU1RjU1XHU2NTg3XHU0RUY2XHU1NDBEXHU2NjIwXHU1QzA0XG4gICAgICAgICAgZmlsZU5hbWVNYXAuc2V0KGZpbGVOYW1lLCBuZXdGaWxlTmFtZSk7XG4gICAgICAgICAgLy8gXHU0RTVGXHU0RkREXHU1QjU4XHU1MjMwXHU2M0QyXHU0RUY2XHU0RTBBXHU0RTBCXHU2NTg3XHU0RTJEXHVGRjBDXHU0RjlCIHdyaXRlQnVuZGxlIFx1NEY3Rlx1NzUyOFxuICAgICAgICAgIGNvbnN0IG9sZFJlZiA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgY29uc3QgbmV3UmVmID0gbmV3RmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICBqc0ZpbGVOYW1lTWFwLnNldChvbGRSZWYsIG5ld1JlZik7XG5cbiAgICAgICAgICAvLyBcdTY2RjRcdTY1QjAgY2h1bmsgXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXG4gICAgICAgICAgKGNodW5rIGFzIGFueSkuZmlsZU5hbWUgPSBuZXdGaWxlTmFtZTtcblxuICAgICAgICAgIC8vIFx1NUMwNiBjaHVuayBcdTc5RkJcdTUyQThcdTUyMzBcdTY1QjBcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgICBidW5kbGVbbmV3RmlsZU5hbWVdID0gY2h1bms7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmsudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLmNzcycpICYmIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgIC8vIENTUyBcdTY1ODdcdTRFRjZcdTRFNUZcdTZERkJcdTUyQTBcdTY3ODRcdTVFRkEgSURcbiAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuY3NzJC8sICcnKTtcbiAgICAgICAgICBjb25zdCBuZXdGaWxlTmFtZSA9IGBhc3NldHMvJHtiYXNlTmFtZX0tJHtidWlsZElkfS5jc3NgO1xuXG4gICAgICAgICAgZmlsZU5hbWVNYXAuc2V0KGZpbGVOYW1lLCBuZXdGaWxlTmFtZSk7XG4gICAgICAgICAgLy8gXHU4QkIwXHU1RjU1IENTUyBcdTY1ODdcdTRFRjZcdTU0MERcdTY2MjBcdTVDMDRcdUZGMDhcdTc1MjhcdTRFOEVcdTY2RjRcdTY1QjAgaW5kZXguaHRtbFx1RkYwOVxuICAgICAgICAgIGNvbnN0IG9sZENzc05hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGNvbnN0IG5ld0Nzc05hbWUgPSBuZXdGaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGNzc0ZpbGVOYW1lTWFwLnNldChvbGRDc3NOYW1lLCBuZXdDc3NOYW1lKTtcblxuICAgICAgICAgIChjaHVuayBhcyBhbnkpLmZpbGVOYW1lID0gbmV3RmlsZU5hbWU7XG4gICAgICAgICAgYnVuZGxlW25ld0ZpbGVOYW1lXSA9IGNodW5rO1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZmlsZU5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NjI0MFx1NjcwOSBjaHVuayBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBpZiAoY2h1bmsudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVuay5jb2RlKSB7XG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4REYzXHU4RkM3XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzIGNodW5rIFx1NzY4NFx1NTE4NVx1NUJCOVx1NEZFRVx1NjUzOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzgzNFx1NTc0Rlx1NTE3Nlx1NTE4NVx1OTBFOFx1NEVFM1x1NzgwMVxuICAgICAgICAgIC8vIFx1OEZEOVx1NEU5Qlx1NUU5M1x1NTNFRlx1ODBGRFx1NTMwNVx1NTQyQlx1NTM4Qlx1N0YyOVx1NTQwRVx1NzY4NFx1NEVFM1x1NzgwMVx1RkYwQ1x1NEZFRVx1NjUzOVx1NTNFRlx1ODBGRFx1NzgzNFx1NTc0Rlx1NTE3Nlx1NTE4NVx1OTBFOFx1NUYxNVx1NzUyOFxuICAgICAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGZpbGVOYW1lLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2ZW5kb3InKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgICAgIC8vIFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyBjaHVuayBcdTRFMERcdTRGRUVcdTY1MzlcdTUxODVcdTVCQjlcdUZGMENcdTUzRUFcdTRGRUVcdTY1MzlcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTVERjJcdTU3MjhcdTRFMEFcdTk3NjJcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1NEY0Nlx1NjYyRlx1RkYwQ1x1NjIxMVx1NEVFQ1x1OTcwMFx1ODk4MVx1NjZGNFx1NjVCMFx1NTE3Nlx1NEVENlx1NjU4N1x1NEVGNlx1NEUyRFx1NUJGOVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1NzY4NFx1NUYxNVx1NzUyOFxuICAgICAgICAgICAgLy8gXHU4RkQ5XHU0RTJBXHU5MDNCXHU4RjkxXHU1NzI4XHU0RTBCXHU5NzYyXHU3Njg0XHU1RkFBXHU3M0FGXHU0RTJEXHU1OTA0XHU3NDA2XHVGRjBDXHU2MjQwXHU0RUU1XHU4RkQ5XHU5MUNDXHU3NkY0XHU2M0E1XHU4REYzXHU4RkM3XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGNodW5rLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTYyNDBcdTY3MDlcdTY1RTdcdTY1ODdcdTRFRjZcdTU0MERcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDhcdTUzMDVcdTYyRUNcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWVdIG9mIGZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NjJGXHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHU3Njg0XHU1RjE1XHU3NTI4XG4gICAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlSZWYgPSBvbGRGaWxlTmFtZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRmlsZU5hbWUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRGaWxlTmFtZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRmlsZU5hbWUuaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICAgICAgICBjb25zdCBvbGRSZWYgPSBvbGRGaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVmID0gbmV3RmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcblxuICAgICAgICAgICAgLy8gXHU4RjZDXHU0RTQ5XHU3Mjc5XHU2QjhBXHU1QjU3XHU3QjI2XG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkT2xkUmVmID0gb2xkUmVmLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG5cbiAgICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlSZWYpIHtcbiAgICAgICAgICAgICAgLy8gXHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHU1RjE1XHU3NTI4XHVGRjFBXHU0RjdGXHU3NTI4XHU2NkY0XHU1MTY4XHU5NzYyXHU3Njg0XHU1MzM5XHU5MTREXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU2ODNDXHU1RjBGXHU5MEZEXHU4OEFCXHU2NkY0XHU2NUIwXG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OTcwMFx1ODk4MVx1NTMzOVx1OTE0RFx1NjI0MFx1NjcwOVx1NTNFRlx1ODBGRFx1NzY4NFx1NUYxNVx1NzUyOFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTMwNVx1NjJFQ1x1RkYxQVxuICAgICAgICAgICAgICAvLyAxLiBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMUEvYXNzZXRzL3Z1ZS1jb3JlLUNYQVZiTE5YLmpzXG4gICAgICAgICAgICAgIC8vIDIuIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS4vYXNzZXRzL3Z1ZS1jb3JlLUNYQVZiTE5YLmpzIFx1NjIxNiBhc3NldHMvdnVlLWNvcmUtQ1hBVmJMTlguanNcbiAgICAgICAgICAgICAgLy8gMy4gXHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4XHVGRjFBXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiIFx1NjIxNiAndnVlLWNvcmUtQ1hBVmJMTlguanMnIFx1NjIxNiBgdnVlLWNvcmUtQ1hBVmJMTlguanNgXG4gICAgICAgICAgICAgIC8vIDQuIGltcG9ydCgpIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYxQWltcG9ydCgnL2Fzc2V0cy92dWUtY29yZS1DWEFWYkxOWC5qcycpXG4gICAgICAgICAgICAgIC8vIDUuIFx1NTcyOFx1NUJGOVx1OEM2MVx1MzAwMVx1NjU3MFx1N0VDNFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYxQXsgZmlsZTogXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiIH0gXHU2MjE2IFtcInZ1ZS1jb3JlLUNYQVZiTE5YLmpzXCJdXG5cbiAgICAgICAgICAgICAgY29uc3Qgc3RyaWN0UGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgICAgLy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBL2Fzc2V0cy92dWUtY29yZS1DWEFWYkxOWC5qc1xuICAgICAgICAgICAgICAgIFtgL2Fzc2V0cy8ke29sZFJlZn1gLCBgL2Fzc2V0cy8ke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgICAvLyBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUEuL2Fzc2V0cy92dWUtY29yZS1DWEFWYkxOWC5qc1xuICAgICAgICAgICAgICAgIFtgLi9hc3NldHMvJHtvbGRSZWZ9YCwgYC4vYXNzZXRzLyR7bmV3UmVmfWBdLFxuICAgICAgICAgICAgICAgIC8vIFx1NjVFMFx1NTI0RFx1N0YwMFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQWFzc2V0cy92dWUtY29yZS1DWEFWYkxOWC5qc1xuICAgICAgICAgICAgICAgIFtgYXNzZXRzLyR7b2xkUmVmfWAsIGBhc3NldHMvJHtuZXdSZWZ9YF0sXG4gICAgICAgICAgICAgICAgLy8gXHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4XHVGRjFBXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiIFx1NjIxNiAndnVlLWNvcmUtQ1hBVmJMTlguanMnXG4gICAgICAgICAgICAgICAgW2BcIiR7b2xkUmVmfVwiYCwgYFwiJHtuZXdSZWZ9XCJgXSxcbiAgICAgICAgICAgICAgICBbYCcke29sZFJlZn0nYCwgYCcke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgICBbYFxcYCR7b2xkUmVmfVxcYGAsIGBcXGAke25ld1JlZn1cXGBgXSxcbiAgICAgICAgICAgICAgICAvLyBpbXBvcnQoKSBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMUFpbXBvcnQoJy9hc3NldHMvdnVlLWNvcmUtQ1hBVmJMTlguanMnKVxuICAgICAgICAgICAgICAgIFtgaW1wb3J0KCcvYXNzZXRzLyR7b2xkUmVmfScpYCwgYGltcG9ydCgnL2Fzc2V0cy8ke25ld1JlZn0nKWBdLFxuICAgICAgICAgICAgICAgIFtgaW1wb3J0KFwiL2Fzc2V0cy8ke29sZFJlZn1cIilgLCBgaW1wb3J0KFwiL2Fzc2V0cy8ke25ld1JlZn1cIilgXSxcbiAgICAgICAgICAgICAgICBbYGltcG9ydChcXGAvYXNzZXRzLyR7b2xkUmVmfVxcYClgLCBgaW1wb3J0KFxcYC9hc3NldHMvJHtuZXdSZWZ9XFxgKWBdLFxuICAgICAgICAgICAgICAgIC8vIFx1NTcyOFx1NUJGOVx1OEM2MVx1NjIxNlx1NjU3MFx1N0VDNFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYxQXsgZmlsZTogXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiIH0gXHU2MjE2IFtcInZ1ZS1jb3JlLUNYQVZiTE5YLmpzXCJdXG4gICAgICAgICAgICAgICAgW2A6XCIke29sZFJlZn1cImAsIGA6XCIke25ld1JlZn1cImBdLFxuICAgICAgICAgICAgICAgIFtgOicke29sZFJlZn0nYCwgYDonJHtuZXdSZWZ9J2BdLFxuICAgICAgICAgICAgICAgIFtgOlxcYCR7b2xkUmVmfVxcYGAsIGA6XFxgJHtuZXdSZWZ9XFxgYF0sXG4gICAgICAgICAgICAgICAgW2BbXCIke29sZFJlZn1cIl1gLCBgW1wiJHtuZXdSZWZ9XCJdYF0sXG4gICAgICAgICAgICAgICAgW2BbJyR7b2xkUmVmfSddYCwgYFsnJHtuZXdSZWZ9J11gXSxcbiAgICAgICAgICAgICAgICBbYFtcXGAke29sZFJlZn1cXGBdYCwgYFtcXGAke25ld1JlZn1cXGBdYF0sXG4gICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgc3RyaWN0UGF0dGVybnMuZm9yRWFjaCgoW29sZFBhdHRlcm4sIG5ld1BhdHRlcm5dKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZFBhdHRlcm4gPSBvbGRQYXR0ZXJuLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGVzY2FwZWRPbGRQYXR0ZXJuLCAnZycpO1xuICAgICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlZ2V4LCBuZXdQYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NjZGNFx1NjVCMFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1NUYxNVx1NzUyODogJHtvbGRQYXR0ZXJufSAtPiAke25ld1BhdHRlcm59IChcdTU3MjggJHtmaWxlTmFtZX0gXHU0RTJEKWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgLy8gXHU3RUU3XHU3RUVEXHU2MjY3XHU4ODRDXHU5MDFBXHU3NTI4XHU2NkZGXHU2MzYyXHU5MDNCXHU4RjkxXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU2ODNDXHU1RjBGXHU5MEZEXHU4OEFCXHU4OTg2XHU3NkQ2XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwOFx1NTMwNVx1NjJFQ1x1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1NTQ4Q1x1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOVxuICAgICAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU2NkY0XHU5MDFBXHU3NTI4XHU3Njg0XHU2NkZGXHU2MzYyXHU2NUI5XHU1RjBGXHVGRjBDXHU3NkY0XHU2M0E1XHU2NkZGXHU2MzYyXHU2NTg3XHU0RUY2XHU1NDBEXHU5MEU4XHU1MjA2XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgIC8vIFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS9hc3NldHMvdmVuZG9yLUJoYi1CbC1GLmpzIC0+IC9hc3NldHMvdmVuZG9yLUJoYi1CbC1GLW1pcHZjaWE5LmpzXG4gICAgICAgICAgICAgIFtgL2Fzc2V0cy8ke29sZFJlZn1gLCBgL2Fzc2V0cy8ke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgLy8gXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi92ZW5kb3ItQmhiLUJsLUYuanMgLT4gLi92ZW5kb3ItQmhiLUJsLUYtbWlwdmNpYTkuanNcbiAgICAgICAgICAgICAgW2AuLyR7b2xkUmVmfWAsIGAuLyR7bmV3UmVmfWBdLFxuICAgICAgICAgICAgICAvLyBcdTY1RTBcdTUyNERcdTdGMDBcdUZGMUF2ZW5kb3ItQmhiLUJsLUYuanMgLT4gdmVuZG9yLUJoYi1CbC1GLW1pcHZjaWE5LmpzXHVGRjA4XHU1NzI4IGltcG9ydCBmcm9tIFx1NEUyRFx1RkYwOVxuICAgICAgICAgICAgICBbYFwiJHtvbGRSZWZ9XCJgLCBgXCIke25ld1JlZn1cImBdLFxuICAgICAgICAgICAgICBbYCcke29sZFJlZn0nYCwgYCcke25ld1JlZn0nYF0sXG4gICAgICAgICAgICAgIFtgXFxgJHtvbGRSZWZ9XFxgYCwgYFxcYCR7bmV3UmVmfVxcYGBdLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmVwbGFjZVBhdHRlcm5zLmZvckVhY2goKFtvbGRQYXR0ZXJuLCBuZXdQYXR0ZXJuXSkgPT4ge1xuICAgICAgICAgICAgICAvLyBcdThGNkNcdTRFNDlcdTcyNzlcdTZCOEFcdTVCNTdcdTdCMjZcbiAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZFBhdHRlcm4gPSBvbGRQYXR0ZXJuLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChlc2NhcGVkT2xkUGF0dGVybiwgJ2cnKTtcbiAgICAgICAgICAgICAgaWYgKHJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlZ2V4LCBuZXdQYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTk4OURcdTU5MTZcdTU5MDRcdTc0MDZcdUZGMUFcdTUzMzlcdTkxNERcdTY2RjRcdTU5MERcdTY3NDJcdTc2ODRcdTVGMTVcdTc1MjhcdTY4M0NcdTVGMEZcbiAgICAgICAgICAgIC8vIFx1NEY4Qlx1NTk4Mlx1RkYxQVx1NTcyOFx1NUJGOVx1OEM2MVx1MzAwMVx1NjU3MFx1N0VDNFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NjIxNlx1ODAwNVx1NEY1Q1x1NEUzQVx1NTFGRFx1NjU3MFx1NTNDMlx1NjU3MFxuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1M0VBXHU1MzM5XHU5MTREXHU1NzI4XHU1QjU3XHU3QjI2XHU0RTMyXHU2MjE2XHU3Mjc5XHU1QjlBXHU0RTBBXHU0RTBCXHU2NTg3XHU0RTJEXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXG4gICAgICAgICAgICBjb25zdCBjb21wbGV4UGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgIC8vIFx1NTcyOFx1NUJGOVx1OEM2MVx1NjIxNlx1NjU3MFx1N0VDNFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYxQXsgZmlsZTogXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiIH0gXHU2MjE2IFtcInZ1ZS1jb3JlLUNYQVZiTE5YLmpzXCJdXG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAoYChbXCInXFxgXSkke2VzY2FwZWRPbGRSZWZ9XFxcXDFgLCAnZycpLFxuICAgICAgICAgICAgICAvLyBcdTU3MjhcdTUxRkRcdTY1NzBcdThDMDNcdTc1MjhcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMUFsb2FkQ2h1bmsoXCJ2dWUtY29yZS1DWEFWYkxOWC5qc1wiKVxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGBcXFxcKFxcXFxzKihbXCInXFxgXSkke2VzY2FwZWRPbGRSZWZ9XFxcXDFcXFxccypcXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBjb21wbGV4UGF0dGVybnMuZm9yRWFjaChwYXR0ZXJuID0+IHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocGF0dGVybiwgKG1hdGNoLCBxdW90ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoLnN0YXJ0c1dpdGgoJygnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCgke3F1b3RlfSR7bmV3UmVmfSR7cXVvdGV9KWA7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtuZXdSZWZ9JHtxdW90ZX1gO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1OTg5RFx1NTkxNlx1NTkwNFx1NzQwNlx1RkYxQVx1NzZGNFx1NjNBNVx1NjZGRlx1NjM2Mlx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTMwNVx1NTQyQlx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOVx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NUYxNVx1NzUyOFx1OTBGRFx1ODhBQlx1NjZGNFx1NjVCMFxuICAgICAgICAgICAgLy8gXHU4RkQ5XHU1M0VGXHU0RUU1XHU2MzU1XHU4M0I3XHU5MEEzXHU0RTlCXHU2ODNDXHU1RjBGXHU0RTBEXHU2ODA3XHU1MUM2XHU3Njg0XHU1RjE1XHU3NTI4XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzRUFcdTUzMzlcdTkxNERcdTU3MjggaW1wb3J0L2V4cG9ydC9yZXF1aXJlL1x1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1N0I0OVx1OEJFRFx1NTNFNVx1NEUyRFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1NTMzOVx1OTE0RFx1NEVFM1x1NzgwMVx1NEUyRFx1NzY4NFx1NTNEOFx1OTFDRlx1NTQwRFxuICAgICAgICAgICAgY29uc3QgZGlyZWN0RmlsZU5hbWVQYXR0ZXJuID0gbmV3IFJlZ0V4cChgXFxcXGIke2VzY2FwZWRPbGRSZWZ9XFxcXGJgLCAnZycpO1xuICAgICAgICAgICAgaWYgKGRpcmVjdEZpbGVOYW1lUGF0dGVybi50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NEUwQVx1NEUwQlx1NjU4N1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjYyRlx1NjU4N1x1NEVGNlx1NUYxNVx1NzUyOFx1ODAwQ1x1NEUwRFx1NjYyRlx1NTE3Nlx1NEVENlx1NTE4NVx1NUJCOVxuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKGRpcmVjdEZpbGVOYW1lUGF0dGVybiwgKG1hdGNoLCBvZmZzZXQsIHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NTI0RFx1NTQwRVx1NjU4N1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjYyRlx1NjU4N1x1NEVGNlx1NUYxNVx1NzUyOFxuICAgICAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHN0cmluZy5zdWJzdHJpbmcoTWF0aC5tYXgoMCwgb2Zmc2V0IC0gNTApLCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFmdGVyID0gc3RyaW5nLnN1YnN0cmluZyhvZmZzZXQgKyBtYXRjaC5sZW5ndGgsIE1hdGgubWluKHN0cmluZy5sZW5ndGgsIG9mZnNldCArIG1hdGNoLmxlbmd0aCArIDUwKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBcdTY2RjRcdTRFMjVcdTY4M0NcdTc2ODRcdTY4QzBcdTY3RTVcdUZGMUFcdTUzRUFcdTY3MDlcdTU3MjhcdTRFRTVcdTRFMEJcdTYwQzVcdTUxQjVcdTRFMEJcdTYyNERcdTY2RkZcdTYzNjJcbiAgICAgICAgICAgICAgICAvLyAxLiBcdTU3MjggaW1wb3J0L2V4cG9ydC9yZXF1aXJlIFx1OEJFRFx1NTNFNVx1NEUyRFxuICAgICAgICAgICAgICAgIC8vIDIuIFx1NTcyOFx1NUI1N1x1N0IyNlx1NEUzMlx1NUI1N1x1OTc2Mlx1OTFDRlx1NEUyRFx1RkYwOFx1NUYxNVx1NTNGN1x1NTE4NVx1RkYwOVxuICAgICAgICAgICAgICAgIC8vIDMuIFx1NTcyOFx1OERFRlx1NUY4NFx1NzZGOFx1NTE3M1x1NzY4NFx1NEUwQVx1NEUwQlx1NjU4N1x1NEUyRFx1RkYwOFx1NTMwNVx1NTQyQiAvYXNzZXRzLyBcdTYyMTYgLi8gXHU2MjE2IC4uL1x1RkYwOVxuICAgICAgICAgICAgICAgIGNvbnN0IGlzSW5JbXBvcnRFeHBvcnQgPSAvKD86aW1wb3J0fGV4cG9ydHxyZXF1aXJlKVxccypcXCg/XFxzKltcIidgXS8udGVzdChiZWZvcmUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9mcm9tXFxzK1tcIidgXS8udGVzdChiZWZvcmUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9pbXBvcnRcXHMqXFwoLy50ZXN0KGJlZm9yZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJblN0cmluZyA9IChiZWZvcmUubWF0Y2goL1tcIidgXS9nKSB8fCBbXSkubGVuZ3RoICUgMiA9PT0gMTsgLy8gXHU1OTQ3XHU2NTcwXHU0RTJBXHU1RjE1XHU1M0Y3XHU4ODY4XHU3OTNBXHU1NzI4XHU1QjU3XHU3QjI2XHU0RTMyXHU1MTg1XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJblBhdGggPSAvWy8nXCJgXWFzc2V0c1xcL3xcXC5cXC98XFwuXFwuXFwvLy50ZXN0KGJlZm9yZSkgfHwgL1tcIidgXVxccyokLy50ZXN0KGJlZm9yZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBcdTYzOTJcdTk2NjRcdUZGMUFcdTU5ODJcdTY3OUNcdTY2MkZcdTU3MjhcdTUzRDhcdTkxQ0ZcdTU0MERcdTMwMDFcdTUxRkRcdTY1NzBcdTU0MERcdTMwMDFcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTdCNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTY2RkZcdTYzNjJcbiAgICAgICAgICAgICAgICBjb25zdCBpc1ZhcmlhYmxlTmFtZSA9IC9bYS16QS1aXyRdW2EtekEtWjAtOV8kXSpcXHMqJC8udGVzdChiZWZvcmUpICYmICFpc0luU3RyaW5nO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzT2JqZWN0UHJvcGVydHkgPSAvXFwuXFxzKiQvLnRlc3QoYmVmb3JlKTtcblxuICAgICAgICAgICAgICAgIGlmICgoaXNJbkltcG9ydEV4cG9ydCB8fCBpc0luU3RyaW5nIHx8IGlzSW5QYXRoKSAmJiAhaXNWYXJpYWJsZU5hbWUgJiYgIWlzT2JqZWN0UHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdSZWY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTY2RjRcdTY1QjAgX192aXRlX19tYXBEZXBzIFx1NEUyRFx1NzY4NCBDU1MgXHU1RjE1XHU3NTI4XG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBX192aXRlX19tYXBEZXBzPShpLG09X192aXRlX19tYXBEZXBzLGQ9KG0uZnx8KG0uZj1bXCJhc3NldHMveHh4LmNzc1wiLC4uLl0pKT0+Li4uXG4gICAgICAgICAgaWYgKG5ld0NvZGUuaW5jbHVkZXMoJ19fdml0ZV9fbWFwRGVwcycpICYmIGNzc0ZpbGVOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRDc3NOYW1lLCBuZXdDc3NOYW1lXSBvZiBjc3NGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgLy8gXHU4RjZDXHU0RTQ5XHU3Mjc5XHU2QjhBXHU1QjU3XHU3QjI2XG4gICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRDc3NOYW1lID0gb2xkQ3NzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgXCJhc3NldHMveHh4LmNzc1wiIFx1NjIxNiAnYXNzZXRzL3h4eC5jc3MnXHVGRjA4XHU1NzI4IF9fdml0ZV9fbWFwRGVwcyBcdTY1NzBcdTdFQzRcdTRFMkRcdUZGMDlcbiAgICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU1MzM5XHU5MTREXHU1RjE1XHU1M0Y3XHU1MTg1XHU3Njg0XHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGNvbnN0IGNzc1BhdHRlcm4gPSBuZXcgUmVnRXhwKGAoW1wiJ10pYXNzZXRzLyR7ZXNjYXBlZE9sZENzc05hbWV9XFxcXDFgLCAnZycpO1xuICAgICAgICAgICAgICBpZiAoY3NzUGF0dGVybi50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShjc3NQYXR0ZXJuLCBgJDFhc3NldHMvJHtuZXdDc3NOYW1lfSQxYCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NjZGNFx1NjVCMCBfX3ZpdGVfX21hcERlcHMgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1Mjg6IGFzc2V0cy8ke29sZENzc05hbWV9IC0+IGFzc2V0cy8ke25ld0Nzc05hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGNodW5rLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU0RTNBICR7ZmlsZU5hbWVNYXAuc2l6ZX0gXHU0RTJBXHU2NTg3XHU0RUY2XHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEOiAke2J1aWxkSWR9YCk7XG5cbiAgICAgIC8vIFx1OEMwM1x1OEJENVx1RkYxQVx1OEY5M1x1NTFGQVx1NjU4N1x1NEVGNlx1NTQwRFx1NjYyMFx1NUMwNFx1RkYwOFx1NEVDNVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1RkYwOVxuICAgICAgY29uc3QgdGhpcmRQYXJ0eU1hcHBpbmdzID0gQXJyYXkuZnJvbShmaWxlTmFtZU1hcC5lbnRyaWVzKCkpLmZpbHRlcigoW29sZE5hbWVdKSA9PlxuICAgICAgICBvbGROYW1lLmluY2x1ZGVzKCd2dWUtY29yZScpIHx8IG9sZE5hbWUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICBvbGROYW1lLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fCBvbGROYW1lLmluY2x1ZGVzKCd2ZW5kb3InKSB8fFxuICAgICAgICBvbGROYW1lLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpXG4gICAgICApO1xuICAgICAgaWYgKHRoaXJkUGFydHlNYXBwaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1RDgzRFx1RENDQiBcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdTY1ODdcdTRFRjZcdTU0MERcdTY2MjBcdTVDMDQ6YCk7XG4gICAgICAgIHRoaXJkUGFydHlNYXBwaW5ncy5mb3JFYWNoKChbb2xkTmFtZSwgbmV3TmFtZV0pID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgICAke29sZE5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKX0gLT4gJHtuZXdOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyl9YCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgd3JpdGVCdW5kbGUob3B0aW9ucykge1xuICAgICAgLy8gXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjZGNFx1NjVCMCBpbmRleC5odG1sIFx1NTQ4QyBKUyBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyOFxuICAgICAgLy8gXHU2QjY0XHU2NUY2XHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XHU1NDBEXHU5MEZEXHU1REYyXHU3RUNGXHU3ODZFXHU1QjlBXG4gICAgICBjb25zdCBvdXRwdXREaXIgPSBvcHRpb25zLmRpciB8fCBqb2luKHByb2Nlc3MuY3dkKCksICdkaXN0Jyk7XG4gICAgICBjb25zdCBpbmRleEh0bWxQYXRoID0gam9pbihvdXRwdXREaXIsICdpbmRleC5odG1sJyk7XG4gICAgICBjb25zdCBhc3NldHNEaXIgPSBqb2luKG91dHB1dERpciwgJ2Fzc2V0cycpO1xuXG4gICAgICAvLyAxLiBcdTY2RjRcdTY1QjAgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUU3Nlx1NEUzQSBzY3JpcHQgXHU2ODA3XHU3QjdFXHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEIFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1OTA3Rlx1NTE0RFx1NkQ0Rlx1ODlDOFx1NTY2OFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgICAgaWYgKGV4aXN0c1N5bmMoaW5kZXhIdG1sUGF0aCkpIHtcbiAgICAgICAgbGV0IGh0bWwgPSByZWFkRmlsZVN5bmMoaW5kZXhIdG1sUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIDEuMSBcdTY2RjRcdTY1QjAgQ1NTIFx1NUYxNVx1NzUyOFxuICAgICAgICBpZiAoY3NzRmlsZU5hbWVNYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRDc3NOYW1lLCBuZXdDc3NOYW1lXSBvZiBjc3NGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIC8vIFx1OEY2Q1x1NEU0OVx1NzI3OVx1NkI4QVx1NUI1N1x1N0IyNlxuICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZENzc05hbWUgPSBvbGRDc3NOYW1lLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIC4uLiBocmVmPVwiL2Fzc2V0cy94eHguY3NzXCI+XG4gICAgICAgICAgICBjb25zdCBsaW5rUGF0dGVybiA9IG5ldyBSZWdFeHAoYChocmVmPVtcIiddKS9hc3NldHMvJHtlc2NhcGVkT2xkQ3NzTmFtZX0oW1wiJ10pYCwgJ2cnKTtcbiAgICAgICAgICAgIGlmIChsaW5rUGF0dGVybi50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobGlua1BhdHRlcm4sIGAkMS9hc3NldHMvJHtuZXdDc3NOYW1lfSQyYCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyAxLjIgXHU0RTNBIHNjcmlwdCBcdTY4MDdcdTdCN0VcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEIFx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1OTA3Rlx1NTE0RFx1NkQ0Rlx1ODlDOFx1NTY2OFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgICAgICAvLyBcdTUzMzlcdTkxNEQgaW1wb3J0KCcvYXNzZXRzL3h4eC5qcycpIFx1NjIxNiBpbXBvcnQoXCIvYXNzZXRzL3h4eC5qc1wiKVxuICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqKFtcIiddKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanMpKVxcMVxccypcXCkvZztcbiAgICAgICAgaWYgKGltcG9ydFBhdHRlcm4udGVzdChodG1sKSkge1xuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoaW1wb3J0UGF0dGVybiwgKG1hdGNoLCBxdW90ZSwgcGF0aCkgPT4ge1xuICAgICAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1REYyXHU3RUNGXHU2NzA5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXG4gICAgICAgICAgICBpZiAocGF0aC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1N0VDRlx1NjcwOVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwQ1x1NjZGRlx1NjM2Mlx1NzI0OFx1NjcyQ1x1NTNGN1x1OTBFOFx1NTIwNlxuICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aC5yZXBsYWNlKC9cXD92PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKX0ke3F1b3RlfSlgO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjBDXHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEXG4gICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofT92PSR7YnVpbGRJZH0ke3F1b3RlfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0IHNjcmlwdCBcdTY4MDdcdTdCN0VcdTZERkJcdTUyQTBcdTY3ODRcdTVFRkEgSUQgXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwOiB2PSR7YnVpbGRJZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIHdyaXRlRmlsZVN5bmMoaW5kZXhIdG1sUGF0aCwgaHRtbCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgaWYgKGNzc0ZpbGVOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU2NkY0XHU2NUIwIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1MjhgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gMi4gXHU2NkY0XHU2NUIwXHU2MjQwXHU2NzA5IEpTIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwOFx1NTMwNVx1NjJFQyBKUyBcdTU0OEMgQ1NTIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1RkYwOVxuICAgICAgaWYgKGV4aXN0c1N5bmMoYXNzZXRzRGlyKSkge1xuICAgICAgICBjb25zdCBqc0ZpbGVzID0gcmVhZGRpclN5bmMoYXNzZXRzRGlyKS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICAgIGxldCB0b3RhbEZpeGVkID0gMDtcblxuICAgICAgICAvLyBcdTY1MzZcdTk2QzZcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcdTU0MERcdTY2MjBcdTVDMDRcdUZGMDhcdTUzMDVcdTYyRUMgSlMgXHU1NDhDIENTU1x1RkYwOVxuICAgICAgICBjb25zdCBhbGxGaWxlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU2M0QyXHU0RUY2XHU0RTBBXHU0RTBCXHU2NTg3XHU0RTJEXHU0RkREXHU1QjU4XHU3Njg0XHU2NjIwXHU1QzA0XG4gICAgICAgIGZvciAoY29uc3QgW29sZEpzTmFtZSwgbmV3SnNOYW1lXSBvZiBqc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIGFsbEZpbGVOYW1lTWFwLnNldChvbGRKc05hbWUsIG5ld0pzTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTRFNUZcdTZERkJcdTUyQTAgQ1NTIFx1NjU4N1x1NEVGNlx1NjYyMFx1NUMwNFxuICAgICAgICBmb3IgKGNvbnN0IFtvbGRDc3NOYW1lLCBuZXdDc3NOYW1lXSBvZiBjc3NGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBhbGxGaWxlTmFtZU1hcC5zZXQob2xkQ3NzTmFtZSwgbmV3Q3NzTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MjBcdTVDMDRcdTRFM0FcdTdBN0FcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdTkxQ0RcdTVFRkFcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDlcbiAgICAgICAgaWYgKGFsbEZpbGVOYW1lTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlcyA9IHJlYWRkaXJTeW5jKGFzc2V0c0Rpcik7XG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGFjdHVhbEZpbGVzKSB7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTY4M0NcdTVGMEZcdUZGMUFuYW1lLWhhc2gtYnVpbGRJZC5leHRcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gZmlsZS5tYXRjaCgvXiguKz8pLShbQS1aYS16MC05XXs0LH0pLShbYS16QS1aMC05XSspXFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IFssIGJhc2VOYW1lLCBoYXNoLCBidWlsZElkLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICAgIGNvbnN0IG9sZEZpbGVOYW1lID0gYCR7YmFzZU5hbWV9LSR7aGFzaH0uJHtleHR9YDtcbiAgICAgICAgICAgICAgaWYgKG9sZEZpbGVOYW1lICE9PSBmaWxlKSB7XG4gICAgICAgICAgICAgICAgYWxsRmlsZU5hbWVNYXAuc2V0KG9sZEZpbGVOYW1lLCBmaWxlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QganNGaWxlIG9mIGpzRmlsZXMpIHtcbiAgICAgICAgICBjb25zdCBqc0ZpbGVQYXRoID0gam9pbihhc3NldHNEaXIsIGpzRmlsZSk7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThERjNcdThGQzdcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdTY1ODdcdTRFRjZcdTc2ODRcdTUxODVcdTVCQjlcdTRGRUVcdTY1MzlcdUZGMENcdTkwN0ZcdTUxNERcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTRFRTNcdTc4MDFcbiAgICAgICAgICAvLyBcdThGRDlcdTRFOUJcdTVFOTNcdTUzRUZcdTgwRkRcdTUzMDVcdTU0MkJcdTUzOEJcdTdGMjlcdTU0MEVcdTc2ODRcdTRFRTNcdTc4MDFcdUZGMENcdTRGRUVcdTY1MzlcdTUzRUZcdTgwRkRcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTVGMTVcdTc1MjhcbiAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBqc0ZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc0ZpbGUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCd2ZW5kb3InKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgICAgIC8vIFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1NjU4N1x1NEVGNlx1NEUwRFx1NEZFRVx1NjUzOVx1NTE4NVx1NUJCOVx1RkYwQ1x1NTNFQVx1NEZFRVx1NjUzOVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NURGMlx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGpzRmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gXHU2NkY0XHU2NUIwXHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XHU1RjE1XHU3NTI4XHVGRjA4SlMgXHU1NDhDIENTU1x1RkYwOVxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTNFQVx1NjZGRlx1NjM2Mlx1NzcxRlx1NkI2M1x1NzY4NFx1NjU4N1x1NEVGNlx1NUYxNVx1NzUyOFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzgzNFx1NTc0Rlx1NTM4Qlx1N0YyOS9cdTZERjdcdTZEQzZcdTU0MEVcdTc2ODRcdTRFRTNcdTc4MDFcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWVdIG9mIGFsbEZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZEZpbGVOYW1lID0gb2xkRmlsZU5hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1NDA0XHU3OUNEXHU1RjE1XHU3NTI4XHU2ODNDXHU1RjBGXHVGRjA4XHU2NkY0XHU3Q0JFXHU3ODZFXHU3Njg0XHU2QTIxXHU1RjBGXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU1MzM5XHU5MTREXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgICAgLy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBL2Fzc2V0cy94eHguanNcdUZGMDhcdTVGQzVcdTk4N0JcdTU3MjhcdTVGMTVcdTUzRjdcdTUxODVcdTYyMTYgaW1wb3J0L2Zyb20gXHU4QkVEXHU1M0U1XHU0RTJEXHVGRjA5XG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAoYChbXCInXFxgXSkvYXNzZXRzLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSlcXFxcMWAsICdnJyksXG4gICAgICAgICAgICAgIC8vIGltcG9ydCgpIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYxQWltcG9ydCgnL2Fzc2V0cy94eHguanMnKVxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGBpbXBvcnRcXFxccypcXFxcKFxcXFxzKihbXCInXFxgXSkvYXNzZXRzLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSlcXFxcMVxcXFxzKlxcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgLy8gXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi94eHguanNcdUZGMDhcdTVGQzVcdTk4N0JcdTU3MjhcdTVGMTVcdTUzRjdcdTUxODVcdUZGMDlcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKVxcXFwuLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSlcXFxcMWAsICdnJyksXG4gICAgICAgICAgICAgIC8vIGFzc2V0cy94eHguanNcdUZGMDhcdTU3MjggX192aXRlX19tYXBEZXBzIFx1NEUyRFx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NUYxNVx1NTNGN1x1NTE4NVx1RkYwOVxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pYXNzZXRzLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSlcXFxcMWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBwYXR0ZXJucy5mb3JFYWNoKHBhdHRlcm4gPT4ge1xuICAgICAgICAgICAgICBpZiAocGF0dGVybi50ZXN0KGNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChtYXRjaCwgcXVvdGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoLmluY2x1ZGVzKCdpbXBvcnQoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShgL2Fzc2V0cy8ke29sZEZpbGVOYW1lfWAsIGAvYXNzZXRzLyR7bmV3RmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfS9hc3NldHMvJHtuZXdGaWxlTmFtZX0ke3F1b3RlfWA7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCcuLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChtYXRjaCwgcXVvdGUpID0+IGAke3F1b3RlfS4vJHtuZXdGaWxlTmFtZX0ke3F1b3RlfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShwYXR0ZXJuLCAobWF0Y2gsIHF1b3RlKSA9PiBgJHtxdW90ZX1hc3NldHMvJHtuZXdGaWxlTmFtZX0ke3F1b3RlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhqc0ZpbGVQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgIHRvdGFsRml4ZWQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG90YWxGaXhlZCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjZGNFx1NjVCMCAke3RvdGFsRml4ZWR9IFx1NEUyQSBKUyBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH07XG59O1xuXG4vLyBcdTRGRUVcdTU5MERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTRFMkRcdTc2ODRcdTY1RTcgaGFzaCBcdTVGMTVcdTc1MjhcdTYzRDJcdTRFRjZcbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NzNCMFx1NTcyOFx1NEY3Rlx1NzUyOFx1NjVGNlx1OTVGNFx1NjIzMyArIGhhc2ggXHU3Njg0XHU2NUI5XHU1RjBGXHVGRjBDXHU3ODZFXHU0RkREXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEXG4vLyBcdThGRDlcdTRFMkFcdTYzRDJcdTRFRjZcdTRFM0JcdTg5ODFcdTc1MjhcdTRFOEVcdTRGRUVcdTU5MERcdTVGMTVcdTc1MjhcdTRFMERcdTUzMzlcdTkxNERcdTc2ODRcdTYwQzVcdTUxQjVcdUZGMDhcdTg2N0RcdTcxMzZcdTc0MDZcdThCQkFcdTRFMEFcdTRFMERcdTVFOTRcdThCRTVcdTUzRDFcdTc1MUZcdUZGMDlcbi8vIFx1OEZEOVx1NEUyQVx1NjNEMlx1NEVGNlx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTU0OEMgd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU5MEZEXHU4RkRCXHU4ODRDXHU0RkVFXHU1OTBEXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU1RjE1XHU3NTI4XHU5MEZEXHU4OEFCXHU0RkVFXHU1OTBEXG5jb25zdCBmaXhEeW5hbWljSW1wb3J0SGFzaFBsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICBjb25zdCBjaHVua05hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2ZpeC1keW5hbWljLWltcG9ydC1oYXNoJyxcbiAgICAvLyBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1NTQwRFxuICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgLy8gXHU1RUZBXHU3QUNCXHU2NTg3XHU0RUY2XHU1NDBEXHU2NjIwXHU1QzA0XHVGRjFBXHU2NTg3XHU0RUY2XHU1NDBEXHU1MjREXHU3RjAwIC0+IFx1NUI5RVx1OTY0NVx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgY2h1bmtOYW1lTWFwLmNsZWFyKCk7XG5cbiAgICAgIC8vIFx1N0IyQ1x1NEUwMFx1NkI2NVx1RkYxQVx1NjUzNlx1OTZDNlx1NjI0MFx1NjcwOSBjaHVuayBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMENcdTVFRkFcdTdBQ0JcdTY2MjBcdTVDMDRcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRlx1NTNFRlx1ODBGRFx1NjYyRiBuYW1lLWhhc2gtdGltZXN0YW1wLmpzIFx1NjIxNiBuYW1lLWhhc2guanNcbiAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgT2JqZWN0LmtleXMoYnVuZGxlKSkge1xuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpICYmIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgIC8vIFx1NjNEMFx1NTNENlx1NjU4N1x1NEVGNlx1NTQwRFx1NTI0RFx1N0YwMFx1RkYwOFx1NTk4MiB2ZW5kb3JcdTMwMDF2dWUtY29yZSBcdTdCNDlcdUZGMDlcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTk3MDBcdTg5ODFcdTU5MDRcdTc0MDZcdTU5MUFcdTZCQjVcdTU0MERcdTc5RjBcdUZGMENcdTU5ODIgYXBwLXNyY1x1MzAwMW1vZHVsZS1hY2Nlc3MgXHU3QjQ5XG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBbmFtZS1oYXNoLXRpbWVzdGFtcC5qcyBcdTYyMTYgbmFtZS1oYXNoLmpzXG4gICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICAvLyBcdTc5RkJcdTk2NjQgaGFzaCBcdTU0OENcdTY1RjZcdTk1RjRcdTYyMzNcdTkwRThcdTUyMDZcdUZGMENcdTUzRUFcdTRGRERcdTc1NTlcdTU0MERcdTc5RjBcdTUyNERcdTdGMDBcbiAgICAgICAgICAvLyBcdTY4M0NcdTVGMEZcdUZGMUFuYW1lLWhhc2gtdGltZXN0YW1wIFx1NjIxNiBuYW1lLWhhc2hcbiAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSBiYXNlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT8kLykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pPyQvKTtcbiAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gbmFtZU1hdGNoWzFdO1xuICAgICAgICAgICAgLy8gXHU1QkY5XHU0RThFXHU1OTFBXHU2QkI1XHU1NDBEXHU3OUYwXHVGRjBDXHU5NzAwXHU4OTgxXHU2M0QwXHU1M0Q2XHU1QjhDXHU2NTc0XHU3Njg0XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyIGFwcC1zcmNcdTMwMDFtb2R1bGUtYWNjZXNzXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTRGNDZcdTRFNUZcdTg5ODFcdTY1MkZcdTYzMDFcdTUzNTVcdTZCQjVcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgdmVuZG9yXHUzMDAxdnVlLWNvcmVcdUZGMDlcbiAgICAgICAgICAgIGlmICghY2h1bmtOYW1lTWFwLmhhcyhuYW1lUHJlZml4KSkge1xuICAgICAgICAgICAgICBjaHVua05hbWVNYXAuc2V0KG5hbWVQcmVmaXgsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1N0VDRlx1NjcwOVx1NjYyMFx1NUMwNFx1RkYwQ1x1NEZERFx1NzU1OVx1N0IyQ1x1NEUwMFx1NEUyQVx1RkYwOFx1OTAxQVx1NUUzOFx1NTNFQVx1NjcwOVx1NEUwMFx1NEUyQVx1RkYwOVxuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gXHUyNkEwXHVGRTBGICBcdTUzRDFcdTczQjBcdTU5MUFcdTRFMkFcdTU0MENcdTU0MEQgY2h1bms6ICR7bmFtZVByZWZpeH0gKCR7Y2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KX0sICR7ZmlsZU5hbWV9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTY1MzZcdTk2QzZcdTUyMzAgJHtjaHVua05hbWVNYXAuc2l6ZX0gXHU0RTJBIGNodW5rIFx1NjYyMFx1NUMwNGApO1xuICAgICAgLy8gXHU4QzAzXHU4QkQ1XHVGRjFBXHU4RjkzXHU1MUZBXHU2NjIwXHU1QzA0XHU1MTczXHU3Q0ZCXG4gICAgICBpZiAoY2h1bmtOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgIGNvbnN0IHNhbXBsZUVudHJpZXMgPSBBcnJheS5mcm9tKGNodW5rTmFtZU1hcC5lbnRyaWVzKCkpLnNsaWNlKDAsIDUpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTc5M0FcdTRGOEJcdTY2MjBcdTVDMDQ6ICR7c2FtcGxlRW50cmllcy5tYXAoKFtrLCB2XSkgPT4gYCR7a30gLT4gJHt2LnNwbGl0KCcvJykucG9wKCl9YCkuam9pbignLCAnKX1gKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU3QjJDXHU0RThDXHU2QjY1XHVGRjFBXHU0RkVFXHU1OTBEXHU2MjQwXHU2NzA5IGNodW5rIFx1NEUyRFx1NzY4NFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NUYxNVx1NzUyOFxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGNodW5rLmNvZGUpIHtcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThERjNcdThGQzdcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgY2h1bmsgXHU3Njg0XHU1MTg1XHU1QkI5XHU0RkVFXHU2NTM5XHVGRjBDXHU5MDdGXHU1MTREXHU3ODM0XHU1NzRGXHU1MTc2XHU1MTg1XHU5MEU4XHU0RUUzXHU3ODAxXG4gICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5TGliID0gZmlsZU5hbWUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICAgICAgaWYgKGlzVGhpcmRQYXJ0eUxpYikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjaHVuay5jb2RlO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50czogQXJyYXk8eyBvbGQ6IHN0cmluZzsgbmV3OiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEUyRFx1NzY4NFx1NjVFNyBoYXNoIFx1NUYxNVx1NzUyOFxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTkxQVx1NzlDRFx1NjgzQ1x1NUYwRlx1RkYxQVxuICAgICAgICAgIC8vIDEuIGltcG9ydCgnL2Fzc2V0cy92ZW5kb3ItQjJ4YUo5alQuanMnKVxuICAgICAgICAgIC8vIDIuIGltcG9ydChcIi4vYXNzZXRzL3Z1ZS1jb3JlLUN0MFFCdW1HLmpzXCIpXG4gICAgICAgICAgLy8gMy4gXCIvYXNzZXRzL3ZlbmRvci1CMnhhSjlqVC5qc1wiIChcdTVCNTdcdTdCMjZcdTRFMzJcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjgpXG4gICAgICAgICAgLy8gNC4gJy4vYXNzZXRzL3Z1ZS1jb3JlLUN0MFFCdW1HLmpzJyAoXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0KVxuXG4gICAgICAgICAgLy8gXHU2QTIxXHU1RjBGMTogaW1wb3J0KCkgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XG4gICAgICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbXCInXSkoXFwuP1xcLz9hc3NldHNcXC8oW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpKVxcMVxccypcXCkvZztcbiAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgaW1wb3J0UGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMobmV3Q29kZSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBxdW90ZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBtYXRjaFsyXTsgLy8gL2Fzc2V0cy92ZW5kb3ItQjJ4YUo5alQuanMgXHU2MjE2IC4vYXNzZXRzL3Z1ZS1jb3JlLUN0MFFCdW1HLmpzXG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2VkRmlsZSA9IG1hdGNoWzNdOyAvLyB2ZW5kb3ItQjJ4YUo5alQuanNcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxNYXRjaCA9IG1hdGNoWzBdOyAvLyBpbXBvcnQoXCIvYXNzZXRzL3ZlbmRvci1CMnhhSjlqVC5qc1wiKVxuXG4gICAgICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdTRFOEUgYnVuZGxlIFx1NEUyRFxuICAgICAgICAgICAgY29uc3QgZXhpc3RzSW5CdW5kbGUgPSBPYmplY3Qua2V5cyhidW5kbGUpLnNvbWUoZiA9PiBmID09PSBgYXNzZXRzLyR7cmVmZXJlbmNlZEZpbGV9YCB8fCBmLmVuZHNXaXRoKGAvJHtyZWZlcmVuY2VkRmlsZX1gKSk7XG5cbiAgICAgICAgICAgIGlmICghZXhpc3RzSW5CdW5kbGUpIHtcbiAgICAgICAgICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU1QzFEXHU4QkQ1XHU2MjdFXHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0XHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHVGRjA4XHU1RkZEXHU3NTY1IGhhc2hcdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgcmVmTWF0Y2ggPSByZWZlcmVuY2VkRmlsZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgaWYgKHJlZk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gcmVmTWF0Y2g7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7bmFtZVByZWZpeH0uJHtleHR9YDtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICAgICAgICBpZiAoZnVsbFBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC4vYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZnVsbFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBhY3R1YWxGaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBvbGQ6IGZ1bGxNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgbmV3OiBgaW1wb3J0KCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9KWBcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gXHU0RkVFXHU1OTBEICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyODogJHtyZWZlcmVuY2VkRmlsZX0gLT4gJHthY3R1YWxGaWxlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIFx1MjZBMFx1RkUwRiAgXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwICR7bmFtZVByZWZpeH0gXHU1QkY5XHU1RTk0XHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU1RjE1XHU3NTI4OiAke3JlZmVyZW5jZWRGaWxlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NkEyMVx1NUYwRjI6IFx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NCAvYXNzZXRzL3h4eC5qcyBcdTVGMTVcdTc1MjhcdUZGMDhcdTUzMDVcdTYyRUNcdTU3MjhcdTY1NzBcdTdFQzRcdTMwMDFcdTVCRjlcdThDNjFcdTdCNDlcdTRFMkRcdUZGMDlcbiAgICAgICAgICAvLyBcdThGRDlcdTRFMkFcdTZBMjFcdTVGMEZcdTk3MDBcdTg5ODFcdTUzMzlcdTkxNERcdTYyNDBcdTY3MDlcdTUzRUZcdTgwRkRcdTc2ODRcdTVGMTVcdTc1MjhcdTY4M0NcdTVGMEZcdUZGMENcdTUzMDVcdTYyRUNcdUZGMUFcbiAgICAgICAgICAvLyAtIFwiL2Fzc2V0cy92dWUtcm91dGVyLUI5XzdQeHQzLmpzXCJcbiAgICAgICAgICAvLyAtICcvYXNzZXRzL3Z1ZS1yb3V0ZXItQjlfN1B4dDMuanMnXG4gICAgICAgICAgLy8gLSBgL2Fzc2V0cy92dWUtcm91dGVyLUI5XzdQeHQzLmpzYFxuICAgICAgICAgIGNvbnN0IHN0cmluZ1BhdGhQYXR0ZXJuID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcLyhbXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSkpXFwxL2c7XG4gICAgICAgICAgc3RyaW5nUGF0aFBhdHRlcm4ubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gc3RyaW5nUGF0aFBhdHRlcm4uZXhlYyhuZXdDb2RlKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1b3RlID0gbWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG1hdGNoWzJdOyAvLyAvYXNzZXRzL3ZlbmRvci1CMnhhSjlqVC5qc1xuICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGUgPSBtYXRjaFszXTsgLy8gdmVuZG9yLUIyeGFKOWpULmpzXG4gICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTsgLy8gXCIvYXNzZXRzL3ZlbmRvci1CMnhhSjlqVC5qc1wiXG5cbiAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1N0VDRlx1ODhBQlx1NTE3Nlx1NEVENlx1ODlDNFx1NTIxOVx1NTkwNFx1NzQwNlx1OEZDN1xuICAgICAgICAgICAgY29uc3QgYWxyZWFkeUZpeGVkID0gcmVwbGFjZW1lbnRzLnNvbWUociA9PiByLm9sZCA9PT0gZnVsbE1hdGNoIHx8IHIub2xkLmluY2x1ZGVzKHJlZmVyZW5jZWRGaWxlKSk7XG4gICAgICAgICAgICBpZiAoYWxyZWFkeUZpeGVkKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcdTRFOEUgYnVuZGxlIFx1NEUyRFxuICAgICAgICAgICAgY29uc3QgZXhpc3RzSW5CdW5kbGUgPSBPYmplY3Qua2V5cyhidW5kbGUpLnNvbWUoZiA9PiBmID09PSBgYXNzZXRzLyR7cmVmZXJlbmNlZEZpbGV9YCB8fCBmLmVuZHNXaXRoKGAvJHtyZWZlcmVuY2VkRmlsZX1gKSk7XG5cbiAgICAgICAgICAgIGlmICghZXhpc3RzSW5CdW5kbGUpIHtcbiAgICAgICAgICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU1QzFEXHU4QkQ1XHU2MjdFXHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0XHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHVGRjA4XHU1RkZEXHU3NTY1IGhhc2ggXHU1NDhDXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjA5XG4gICAgICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1OTcwMFx1ODk4MVx1NTkwNFx1NzQwNlx1NTkxQVx1NkJCNVx1NTQwRFx1NzlGMFx1RkYwQ1x1NTk4MiBhcHAtc3JjXHUzMDAxbW9kdWxlLWFjY2VzcyBcdTdCNDlcbiAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBbmFtZS1oYXNoLXRpbWVzdGFtcC5qcyBcdTYyMTYgbmFtZS1oYXNoLmpzXG4gICAgICAgICAgICAgIGNvbnN0IHJlZk1hdGNoID0gcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgIGlmIChyZWZNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgb2xkOiBmdWxsTWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgIG5ldzogYCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9YFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTRGRUVcdTU5MEQgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1QjU3XHU3QjI2XHU0RTMyXHU1RjE1XHU3NTI4OiAke3JlZmVyZW5jZWRGaWxlfSAtPiAke2FjdHVhbEZpbGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzAgJHtuYW1lUHJlZml4fSBcdTVCRjlcdTVFOTRcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMENcdTVGMTVcdTc1Mjg6ICR7cmVmZXJlbmNlZEZpbGV9IChcdTU3MjggJHtmaWxlTmFtZX0gXHU0RTJEKWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NkEyMVx1NUYwRjM6IFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NCAuL3h4eC5qc1xuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFBhdHRlcm4gPSAvKFtcIiddKShcXC5cXC8pKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKVxcMS9nO1xuICAgICAgICAgIHJlbGF0aXZlUGF0aFBhdHRlcm4ubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gcmVsYXRpdmVQYXRoUGF0dGVybi5leGVjKG5ld0NvZGUpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcXVvdGUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUHJlZml4ID0gbWF0Y2hbMl07IC8vIC4vXG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2VkRmlsZSA9IG1hdGNoWzNdOyAvLyB2dWUtY29yZS1DdDBRQnVtRy5qc1xuICAgICAgICAgICAgY29uc3QgZnVsbE1hdGNoID0gbWF0Y2hbMF07IC8vIFwiLi92dWUtY29yZS1DdDBRQnVtRy5qc1wiXG5cbiAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1N0VDRlx1ODhBQlx1NTE3Nlx1NEVENlx1ODlDNFx1NTIxOVx1NTkwNFx1NzQwNlx1OEZDN1xuICAgICAgICAgICAgY29uc3QgYWxyZWFkeUZpeGVkID0gcmVwbGFjZW1lbnRzLnNvbWUociA9PiByLm9sZCA9PT0gZnVsbE1hdGNoKTtcbiAgICAgICAgICAgIGlmIChhbHJlYWR5Rml4ZWQpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NUYxNVx1NzUyOFx1NzY4NFx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1NEU4RSBidW5kbGUgXHU0RTJEXG4gICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgaWYgKCFleGlzdHNJbkJ1bmRsZSkge1xuICAgICAgICAgICAgICAvLyBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTVDMURcdThCRDVcdTYyN0VcdTUyMzBcdTVCRjlcdTVFOTRcdTc2ODRcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdUZGMDhcdTVGRkRcdTc1NjUgaGFzaCBcdTU0OENcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMDlcbiAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBbmFtZS1oYXNoLXRpbWVzdGFtcC5qcyBcdTYyMTYgbmFtZS1oYXNoLmpzXG4gICAgICAgICAgICAgIGNvbnN0IHJlZk1hdGNoID0gcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgIGlmIChyZWZNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcblxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBvbGQ6IGZ1bGxNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgbmV3OiBgJHtxdW90ZX0ke3JlbGF0aXZlUHJlZml4fSR7YWN0dWFsRmlsZU5hbWV9JHtxdW90ZX1gXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIFx1NEZFRVx1NTkwRCAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTVGMTVcdTc1Mjg6ICR7cmVmZXJlbmNlZEZpbGV9IC0+ICR7YWN0dWFsRmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1RTk0XHU3NTI4XHU2MjQwXHU2NzA5XHU2NkZGXHU2MzYyXHVGRjA4XHU0RUNFXHU1NDBFXHU1RjgwXHU1MjREXHU2NkZGXHU2MzYyXHVGRjBDXHU5MDdGXHU1MTREXHU0RjREXHU3RjZFXHU1MDRGXHU3OUZCXHVGRjA5XG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudHMucmV2ZXJzZSgpLmZvckVhY2goKHsgb2xkLCBuZXc6IG5ld1N0ciB9KSA9PiB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uob2xkLCBuZXdTdHIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTI3MDUgXHU1REYyXHU0RkVFXHU1OTBEICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NCAke3JlcGxhY2VtZW50cy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOGApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgY2h1bmsuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFx1NTcyOCB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTUxOERcdTZCMjFcdTRGRUVcdTU5MERcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTVGMTVcdTc1MjhcdTkwRkRcdTg4QUJcdTRGRUVcdTU5MERcbiAgICB3cml0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcblxuICAgICAgLy8gXHU5MUNEXHU2NUIwXHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NTZFMFx1NEUzQVx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTE5OVx1NTE2NVx1NjU4N1x1NEVGNlx1N0NGQlx1N0VERlx1RkYwOVxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU2NTg3XHU0RUY2XHU1NDBEXHU2ODNDXHU1RjBGXHU1M0VGXHU4MEZEXHU2NjJGIG5hbWUtaGFzaC10aW1lc3RhbXAuanMgXHU2MjE2IG5hbWUtaGFzaC5qc1xuICAgICAgY2h1bmtOYW1lTWFwLmNsZWFyKCk7XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OERGM1x1OEZDN1x1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyBjaHVuayBcdTc2ODRcdTRGRUVcdTU5MERcdUZGMENcdTkwN0ZcdTUxNERcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTRFRTNcdTc4MDFcbiAgICAgIGNvbnN0IHRoaXJkUGFydHlDaHVua3MgPSBbJ2xpYi1lY2hhcnRzJywgJ2VsZW1lbnQtcGx1cycsICd2dWUtY29yZScsICd2dWUtcm91dGVyJywgJ3ZlbmRvciddO1xuICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBPYmplY3Qua2V5cyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykgJiYgZmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBbmFtZS1oYXNoLXRpbWVzdGFtcC5qcyBcdTYyMTYgbmFtZS1oYXNoLmpzXG4gICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2IG5hbWUgXHU5MEU4XHU1MjA2XHVGRjA4XHU3QjJDXHU0RTAwXHU0RTJBXHU4RkRFXHU1QjU3XHU3QjI2XHU0RTRCXHU1MjREXHU3Njg0XHU2MjQwXHU2NzA5XHU1MTg1XHU1QkI5XHVGRjBDXHU0RjQ2XHU1OTgyXHU2NzlDXHU2NjJGXHU1OTFBXHU2QkI1XHU1NDBEXHU3OUYwXHU1OTgyIGFwcC1zcmNcdUZGMENcdTk3MDBcdTg5ODFcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuanMkLywgJycpO1xuICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NCBoYXNoIFx1NTQ4Q1x1NjVGNlx1OTVGNFx1NjIzM1x1OTBFOFx1NTIwNlx1RkYwQ1x1NTNFQVx1NEZERFx1NzU1OVx1NTQwRFx1NzlGMFx1NTI0RFx1N0YwMFxuICAgICAgICAgIC8vIFx1NjgzQ1x1NUYwRlx1RkYxQW5hbWUtaGFzaC10aW1lc3RhbXAgXHU2MjE2IG5hbWUtaGFzaFxuICAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1OTcwMFx1ODk4MVx1NjNEMFx1NTNENiBuYW1lIFx1OTBFOFx1NTIwNlx1RkYwOFx1N0IyQ1x1NEUwMFx1NEUyQVx1OEZERVx1NUI1N1x1N0IyNlx1NEU0Qlx1NTI0RFx1NzY4NFx1NjI0MFx1NjcwOVx1NTE4NVx1NUJCOVx1RkYwQ1x1NEY0Nlx1NTk4Mlx1Njc5Q1x1NjYyRlx1NTkxQVx1NkJCNVx1NTQwRFx1NzlGMFx1RkYwQ1x1OTcwMFx1ODk4MVx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1RkYwOVxuICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IGJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspPyQvKTtcbiAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gbmFtZU1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKCFjaHVua05hbWVNYXAuaGFzKG5hbWVQcmVmaXgpKSB7XG4gICAgICAgICAgICAgIGNodW5rTmFtZU1hcC5zZXQobmFtZVByZWZpeCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUzMzlcdTkxNERcdTUyMzBcdUZGMENcdTVDMURcdThCRDVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTUzQkJcdTYzODkgYXNzZXRzLyBcdTU0OEMgLmpzXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gYmFzZU5hbWUuc3BsaXQoJy0nKVswXTtcbiAgICAgICAgICAgIGlmIChuYW1lUHJlZml4ICYmICFjaHVua05hbWVNYXAuaGFzKG5hbWVQcmVmaXgpKSB7XG4gICAgICAgICAgICAgIGNodW5rTmFtZU1hcC5zZXQobmFtZVByZWZpeCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTRGRUVcdTU5MERcdTYyNDBcdTY3MDlcdTVERjJcdTUxOTlcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IG91dHB1dERpciA9IG9wdGlvbnMuZGlyIHx8IGpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2Rpc3QnKTtcbiAgICAgIGxldCB0b3RhbEZpeGVkID0gMDtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThERjNcdThGQzdcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgY2h1bmsgXHU3Njg0XHU1MTg1XHU1QkI5XHU0RkVFXHU2NTM5XHVGRjBDXHU0RjQ2XHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXHU1MTc2XHU0RUQ2XHU2NTg3XHU0RUY2XHU0RTJEXHU1QkY5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHU3Njg0XHU1RjE1XHU3NTI4XG4gICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5TGliID0gdGhpcmRQYXJ0eUNodW5rcy5zb21lKGxpYiA9PiBmaWxlTmFtZS5pbmNsdWRlcyhsaWIpKTtcblxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihvdXRwdXREaXIsIGZpbGVOYW1lKTtcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgIGxldCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50czogQXJyYXk8eyBvbGQ6IHN0cmluZzsgbmV3OiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU1M0VBXHU0RkVFXHU1OTBEXHU1QkY5XHU1QjgzXHU3Njg0XHU1RjE1XHU3NTI4XHVGRjBDXHU0RTBEXHU0RkVFXHU2NTM5XHU1MTc2XHU1MTg1XHU1QkI5XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTRFMERcdTY2MkZcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTRGRUVcdTU5MERcdTYyNDBcdTY3MDlcdTVGMTVcdTc1MjhcdUZGMDhcdTUzMDVcdTYyRUNcdTVCRjlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDlcblxuICAgICAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU3NkY4XHU1NDBDXHU3Njg0XHU0RkVFXHU1OTBEXHU5MDNCXHU4RjkxXG4gICAgICAgICAgICAvLyBcdTZBMjFcdTVGMEYxOiBpbXBvcnQoKSBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcbiAgICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccyooW1wiJ10pKFxcLj9cXC8/YXNzZXRzXFwvKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKSlcXDFcXHMqXFwpL2c7XG4gICAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgICBpbXBvcnRQYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gaW1wb3J0UGF0dGVybi5leGVjKGNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCBxdW90ZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VkRmlsZSA9IG1hdGNoWzNdO1xuICAgICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTtcblxuICAgICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgICBpZiAoIWV4aXN0c0luQnVuZGxlKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5NzAwXHU4OTgxXHU1OTA0XHU3NDA2XHU1RTI2XHU2Nzg0XHU1RUZBIElEIFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRlxuICAgICAgICAgICAgICAgIC8vIFx1NjgzQ1x1NUYwRlx1NTNFRlx1ODBGRFx1NjYyRlx1RkYxQW5hbWUtaGFzaC5qcyBcdTYyMTYgbmFtZS1oYXNoLWJ1aWxkSWQuanNcbiAgICAgICAgICAgICAgICAvLyBcdTk3MDBcdTg5ODFcdTYzRDBcdTUzRDYgbmFtZSBcdTUyNERcdTdGMDBcdTY3NjVcdTY3RTVcdTYyN0VcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcbiAgICAgICAgICAgICAgICBjb25zdCByZWZNYXRjaCA9IHJlZmVyZW5jZWRGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspP1xcLihqc3xtanN8Y3NzKSQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlZk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gcmVmTWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBhY3R1YWxGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGAvYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgLi9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZ1bGxQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYWN0dWFsRmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgb2xkOiBmdWxsTWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgbmV3OiBgaW1wb3J0KCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9KWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIHdyaXRlQnVuZGxlOiBcdTRGRUVcdTU5MEQgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1NUYxNVx1NzUyODogJHtyZWZlcmVuY2VkRmlsZX0gLT4gJHthY3R1YWxGaWxlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSB3cml0ZUJ1bmRsZTogXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwICR7bmFtZVByZWZpeH0gXHU1QkY5XHU1RTk0XHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU1RjE1XHU3NTI4OiAke3JlZmVyZW5jZWRGaWxlfSAoXHU1NzI4ICR7ZmlsZU5hbWV9IFx1NEUyRClgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHU2QTIxXHU1RjBGMjogXHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0IC9hc3NldHMveHh4LmpzIFx1NUYxNVx1NzUyOFxuICAgICAgICAgICAgY29uc3Qgc3RyaW5nUGF0aFBhdHRlcm4gPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKSlcXDEvZztcbiAgICAgICAgICAgIHN0cmluZ1BhdGhQYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gc3RyaW5nUGF0aFBhdHRlcm4uZXhlYyhjb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcXVvdGUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGUgPSBtYXRjaFszXTtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbE1hdGNoID0gbWF0Y2hbMF07XG5cbiAgICAgICAgICAgICAgY29uc3QgYWxyZWFkeUZpeGVkID0gcmVwbGFjZW1lbnRzLnNvbWUociA9PiByLm9sZCA9PT0gZnVsbE1hdGNoIHx8IHIub2xkLmluY2x1ZGVzKHJlZmVyZW5jZWRGaWxlKSk7XG4gICAgICAgICAgICAgIGlmIChhbHJlYWR5Rml4ZWQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0c0luQnVuZGxlID0gT2JqZWN0LmtleXMoYnVuZGxlKS5zb21lKGYgPT4gZiA9PT0gYGFzc2V0cy8ke3JlZmVyZW5jZWRGaWxlfWAgfHwgZi5lbmRzV2l0aChgLyR7cmVmZXJlbmNlZEZpbGV9YCkpO1xuXG4gICAgICAgICAgICAgIGlmICghZXhpc3RzSW5CdW5kbGUpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTY4M0NcdTVGMEZcdUZGMUFuYW1lLWhhc2gtdGltZXN0YW1wLmpzIFx1NjIxNiBuYW1lLWhhc2guanNcbiAgICAgICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDYgbmFtZSBcdTkwRThcdTUyMDZcdUZGMDhcdTdCMkNcdTRFMDBcdTRFMkFcdThGREVcdTVCNTdcdTdCMjZcdTRFNEJcdTUyNERcdTc2ODRcdTYyNDBcdTY3MDlcdTUxODVcdTVCQjlcdUZGMENcdTRGNDZcdTU5ODJcdTY3OUNcdTY2MkZcdTU5MUFcdTZCQjVcdTU0MERcdTc5RjBcdTU5ODIgYXBwLXNyY1x1RkYwQ1x1OTcwMFx1ODk4MVx1NEZERFx1NzU1OVx1RkYwOVxuICAgICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OTcwMFx1ODk4MVx1NTkwNFx1NzQwNlx1NEUyNFx1NzlDRFx1NjBDNVx1NTFCNVx1RkYxQVxuICAgICAgICAgICAgICAgIC8vIDEuIFx1NjVFN1x1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NkNBMVx1NjcwOVx1Njc4NFx1NUVGQSBJRFx1RkYwOVx1RkYxQXZ1ZS1jb3JlLUNYQVZiTE5YLmpzIC0+IFx1NjNEMFx1NTNENiB2dWUtY29yZVxuICAgICAgICAgICAgICAgIC8vIDIuIFx1NjVCMFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NjcwOVx1Njc4NFx1NUVGQSBJRFx1RkYwOVx1RkYxQXZ1ZS1jb3JlLUNYQVZiTE5YLW1pcTRtN3IxLmpzIC0+IFx1NjNEMFx1NTNENiB2dWUtY29yZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZk1hdGNoID0gcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAocmVmTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbEZpbGUgPSBjaHVua05hbWVNYXAuZ2V0KG5hbWVQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTYyN0VcdTRFMERcdTUyMzBcdUZGMENcdTVDMURcdThCRDVcdTY2RjRcdTVCQkRcdTY3N0VcdTc2ODRcdTUzMzlcdTkxNERcdUZGMDhcdTUzRUFcdTUzMzlcdTkxNERcdTdCMkNcdTRFMDBcdTRFMkFcdThGREVcdTVCNTdcdTdCMjZcdTRFNEJcdTUyNERcdTc2ODRcdTkwRThcdTUyMDZcdUZGMDlcbiAgICAgICAgICAgICAgICAgIGlmICghYWN0dWFsRmlsZSAmJiBuYW1lUHJlZml4LmluY2x1ZGVzKCctJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlyc3RQYXJ0ID0gbmFtZVByZWZpeC5zcGxpdCgnLScpWzBdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NzaWJsZU1hdGNoID0gQXJyYXkuZnJvbShjaHVua05hbWVNYXAuZW50cmllcygpKS5maW5kKChba2V5XSkgPT4ga2V5LnN0YXJ0c1dpdGgoZmlyc3RQYXJ0KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgWywgZm91bmRGaWxlXSA9IHBvc3NpYmxlTWF0Y2g7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBmb3VuZEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZDogZnVsbE1hdGNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3OiBgJHtxdW90ZX0ke25ld1BhdGh9JHtxdW90ZX1gXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gd3JpdGVCdW5kbGU6IFx1NEY3Rlx1NzUyOFx1NUJCRFx1Njc3RVx1NTMzOVx1OTE0RFx1NEZFRVx1NTkwRCAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1Mjg6ICR7cmVmZXJlbmNlZEZpbGV9IC0+ICR7YWN0dWFsRmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBhY3R1YWxGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgIG9sZDogZnVsbE1hdGNoLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldzogYCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gd3JpdGVCdW5kbGU6IFx1NEZFRVx1NTkwRCAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1Mjg6ICR7cmVmZXJlbmNlZEZpbGV9IC0+ICR7YWN0dWFsRmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtmaXgtZHluYW1pYy1pbXBvcnQtaGFzaF0gd3JpdGVCdW5kbGU6IFx1NjVFMFx1NkNENVx1NjI3RVx1NTIzMCAke25hbWVQcmVmaXh9IFx1NUJGOVx1NUU5NFx1NzY4NFx1NjU4N1x1NEVGNlx1RkYwQ1x1NUYxNVx1NzUyODogJHtyZWZlcmVuY2VkRmlsZX0gKFx1NTcyOCAke2ZpbGVOYW1lfSBcdTRFMkQpYCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NUU5NFx1NzUyOFx1NjI0MFx1NjcwOVx1NjZGRlx1NjM2MlxuICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5yZXZlcnNlKCkuZm9yRWFjaCgoeyBvbGQsIG5ldzogbmV3U3RyIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZCwgbmV3U3RyKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgICAgICB0b3RhbEZpeGVkKys7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIFx1MjcwNSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTRGRUVcdTU5MEQgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0ICR7cmVwbGFjZW1lbnRzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3RhbEZpeGVkID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTI3MDUgd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1MTcxXHU0RkVFXHU1OTBEICR7dG90YWxGaXhlZH0gXHU0RTJBXHU2NTg3XHU0RUY2YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbi8vIFx1Nzg2RVx1NEZERFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEY3Rlx1NzUyOFx1NkI2M1x1Nzg2RVx1NzY4NCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbmNvbnN0IGVuc3VyZUJhc2VVcmxQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gIGNvbnN0IGJhc2VVcmwgPSBpc1ByZXZpZXdCdWlsZCA/IGBodHRwOi8vJHtBUFBfSE9TVH06JHtBUFBfUE9SVH0vYCA6ICcvJztcbiAgY29uc3QgbWFpbkFwcFBvcnQgPSBNQUlOX0FQUF9DT05GSUc/LnByZVBvcnQgfHwgJzQxODAnOyAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMENcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcdTc2ODRcdTc2RUVcdTY4MDdcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtYmFzZS11cmwnLFxuICAgIC8vIFx1NEY3Rlx1NzUyOCByZW5kZXJDaHVuayBcdTk0QTlcdTVCNTBcdUZGMENcdTU3MjhcdTRFRTNcdTc4MDFcdTc1MUZcdTYyMTBcdTY1RjZcdTU5MDRcdTc0MDZcbiAgICByZW5kZXJDaHVuayhjb2RlLCBjaHVuaywgb3B0aW9ucykge1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4REYzXHU4RkM3XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzIGNodW5rXHVGRjBDXHU5MDdGXHU1MTREXHU3ODM0XHU1NzRGXHU1MTc2XHU1MTg1XHU5MEU4XHU0RUUzXHU3ODAxXG4gICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuZmlsZU5hbWU/LmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuZmlsZU5hbWU/LmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICBpZiAoaXNUaGlyZFBhcnR5TGliKSB7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTRGRUVcdTY1MzlcbiAgICAgIH1cblxuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgIC8vIDEuIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NTk4MiAvYXNzZXRzL3h4eC5qc1x1RkYwOVxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA4YmFzZSA9ICcvJ1x1RkYwOVx1RkYwQ1x1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NURGMlx1N0VDRlx1NjYyRlx1NkI2M1x1Nzg2RVx1NzY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOVxuICAgICAgLy8gXHU1NzI4XHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHVGRjA4YmFzZSA9ICdodHRwOi8vbG9jYWxob3N0OjQxODEvJ1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKS9nO1xuICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChtYXRjaCwgcXVvdGUsIHBhdGgpID0+IHtcbiAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1RkYxQVx1NjJGQ1x1NjNBNVx1NUI1MFx1NUU5NFx1NzUyOCBiYXNlXHVGRjBDXHU1OTgyIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MS9hc3NldHMveHh4LmpzXG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgL2Fzc2V0cy94eHguanMgXHU1REYyXHU3RUNGXHU2NjJGXHU2QjYzXHU3ODZFXHU3Njg0XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5XG5cbiAgICAgIC8vIDIuIFx1NUI1MFx1NUU5NFx1NzUyOCBiYXNlIFx1ODhBQlx1OTUxOVx1OEJFRlx1NjZGRlx1NjM2Mlx1NEUzQSA0MTgwIFx1NzY4NFx1NjBDNVx1NTFCNVx1RkYwOFx1NTk4MiBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eFx1RkYwOVxuICAgICAgY29uc3Qgd3JvbmdQb3J0SHR0cFJlZ2V4ID0gbmV3IFJlZ0V4cChgaHR0cDovLyR7QVBQX0hPU1R9OiR7bWFpbkFwcFBvcnR9L2Fzc2V0cy9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCBgJHtiYXNlVXJsfWFzc2V0cy9gKTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyAzLiBcdTUzNEZcdThCQUVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDgvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHhcdUZGMDlcbiAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLyR7QVBQX0hPU1R9OiR7bWFpbkFwcFBvcnR9L2Fzc2V0cy9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIGAvLyR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9L2Fzc2V0cy9gKTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBcdTUxNzZcdTRFRDZcdTUzRUZcdTgwRkRcdTc2ODRcdTk1MTlcdThCRUZcdTdBRUZcdTUzRTNcdTY4M0NcdTVGMEZcdUZGMDhcdTg5ODZcdTc2RDZcdTYyNDBcdTY3MDlcdTYwQzVcdTUxQjVcdUZGMDlcbiAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICAvLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTVFMjZcdTUzNEZcdThCQUVcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoaHR0cDovLykobG9jYWxob3N0fCR7QVBQX0hPU1R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10qKWAsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAkMSR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9JDNgLFxuICAgICAgICB9LFxuICAgICAgICAvLyBcdTUzNEZcdThCQUVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoLy8pKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiBgJDEke0FQUF9IT1NUfToke0FQUF9QT1JUfSQzYCxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gXHU1QjU3XHU3QjI2XHU0RTMyXHU1QjU3XHU5NzYyXHU5MUNGXHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKShodHRwOi8vKShsb2NhbGhvc3R8JHtBUFBfSE9TVH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSopYCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogYCQxJDIke0FQUF9IT1NUfToke0FQUF9QT1JUfSQ0YCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKC8vKShsb2NhbGhvc3R8JHtBUFBfSE9TVH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSopYCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogYCQxJDIke0FQUF9IT1NUfToke0FQUF9QT1JUfSQ0YCxcbiAgICAgICAgfSxcbiAgICAgIF07XG5cbiAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICBpZiAocGF0dGVybi5yZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLnJlZ2V4LCBwYXR0ZXJuLnJlcGxhY2VtZW50KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0ICgke21haW5BcHBQb3J0fSAtPiAke0FQUF9QT1JUfSlgKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBuZXdDb2RlLFxuICAgICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICAvLyBcdTU0MENcdTY1RjZcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU1OTA0XHU3NDA2XHVGRjBDXHU0RjVDXHU0RTNBXHU1MTVDXHU1RTk1XG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmsuY29kZSkge1xuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OERGM1x1OEZDN1x1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyBjaHVuayBcdTc2ODRcdTUxODVcdTVCQjlcdTRGRUVcdTY1MzlcdUZGMENcdTkwN0ZcdTUxNERcdTc4MzRcdTU3NEZcdTUxNzZcdTUxODVcdTkwRThcdTRFRTNcdTc4MDFcbiAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBmaWxlTmFtZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndmVuZG9yJyk7XG5cbiAgICAgICAgICBpZiAoaXNUaGlyZFBhcnR5TGliKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGNodW5rLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyAxLiBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDhiYXNlID0gJy8nXHVGRjA5XHVGRjBDXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU1REYyXHU3RUNGXHU2NjJGXHU2QjYzXHU3ODZFXHU3Njg0XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5XG4gICAgICAgICAgLy8gXHU1NzI4XHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHVGRjA4YmFzZSA9ICdodHRwOi8vbG9jYWxob3N0OjQxODEvJ1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspL2c7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAobWF0Y2gsIHF1b3RlLCBwYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgL2Fzc2V0cy94eHguanMgXHU1REYyXHU3RUNGXHU2NjJGXHU2QjYzXHU3ODZFXHU3Njg0XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5XG5cbiAgICAgICAgICAvLyAyLiA0MTgwIFx1N0FFRlx1NTNFM1x1NjZGRlx1NjM2MlxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCBgJHtiYXNlVXJsfWFzc2V0cy9gKTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAzLiBcdTUzNEZcdThCQUVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8ke0FQUF9IT1NUfToke21haW5BcHBQb3J0fS9hc3NldHMvYCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIGAvLyR7QVBQX0hPU1R9OiR7QVBQX1BPUlR9L2Fzc2V0cy9gKTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA0LiBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTdBRUZcdTUzRTNcdTY4M0NcdTVGMEZcbiAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoYGh0dHA6Ly8obG9jYWxob3N0fCR7QVBQX0hPU1R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10qKWAsICdnJyksXG4gICAgICAgICAgICBuZXcgUmVnRXhwKGAvLyhsb2NhbGhvc3R8JHtBUFBfSE9TVH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSopYCwgJ2cnKSxcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoYChbXCInXFxgXSlodHRwOi8vKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKS8vKGxvY2FsaG9zdHwke0FQUF9IT1NUfSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKilgLCAnZycpLFxuICAgICAgICAgIF07XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLCAobWF0Y2gpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5jbHVkZXMoJ2h0dHA6Ly8nKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoLnJlcGxhY2UobmV3IFJlZ0V4cChgOiR7bWFpbkFwcFBvcnR9YCwgJ2cnKSwgYDoke0FQUF9QT1JUfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2guaW5jbHVkZXMoJy8vJykpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaC5yZXBsYWNlKG5ldyBSZWdFeHAoYDoke21haW5BcHBQb3J0fWAsICdnJyksIGA6JHtBUFBfUE9SVH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgY2h1bmsuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NEZFRVx1NTkwRFx1NEU4NiAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufTtcblxuLy8gQ09SUyBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHNcdUZGMDlcbmNvbnN0IGNvcnNQbHVnaW4gPSAoKTogUGx1Z2luID0+IHtcbiAgLy8gQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcdTUxRkRcdTY1NzBcdUZGMDhcdTc1MjhcdTRFOEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDlcbiAgY29uc3QgY29yc0Rldk1pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAvLyBcdThCQkVcdTdGNkUgQ09SUyBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMDhcdTYyNDBcdTY3MDlcdThCRjdcdTZDNDJcdTkwRkRcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgLy8gQ2hyb21lIFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1ODk4MVx1NkM0Mlx1RkYwOFx1NEVDNVx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1OTcwMFx1ODk4MVx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IG9yaWdpblx1RkYwQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NTdGQVx1NjcyQ1x1NzY4NCBDT1JTIFx1NTkzNFx1RkYwOFx1NTE0MVx1OEJCOFx1NjI0MFx1NjcwOVx1Njc2NVx1NkU5MFx1RkYwOVxuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIC8vIENocm9tZSBcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcdTg5ODFcdTZDNDJcdUZGMDhcdTRFQzVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyIC0gXHU1RkM1XHU5ODdCXHU1NzI4XHU0RUZCXHU0RjU1XHU1MTc2XHU0RUQ2XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU4RkQ0XHU1NkRFXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIC8vIENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XHU1MUZEXHU2NTcwXHVGRjA4XHU3NTI4XHU0RThFXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XHVGRjA5XG4gIGNvbnN0IGNvcnNQcmV2aWV3TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MiAtIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NEVGQlx1NEY1NVx1NTE3Nlx1NEVENlx1NTkwNFx1NzQwNlx1NEU0Qlx1NTI0RFx1OEZENFx1NTZERVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgICAgLy8gXHU4QkJFXHU3RjZFIENPUlMgXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1QkY5XHU0RThFXHU5NzVFIE9QVElPTlMgXHU4QkY3XHU2QzQyXHVGRjBDXHU4QkJFXHU3RjZFIENPUlMgXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsIC8vIFx1Nzg2RVx1NEZERFx1NTcyOFx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYxQVx1NTMwNVx1NTQyQlx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJCRlx1OTVFRVx1NTkzNFxuICAgICAgLy8gXHU3NkY0XHU2M0E1XHU2REZCXHU1MkEwXHU1MjMwXHU0RTJEXHU5NUY0XHU0RUY2XHU2ODA4XHU2NzAwXHU1MjREXHU5NzYyXG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICAvLyBcdTc5RkJcdTk2NjRcdTUzRUZcdTgwRkRcdTVERjJcdTVCNThcdTU3MjhcdTc2ODQgQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIC8vIFx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1NkRGQlx1NTJBMCBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlxuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc0Rldk1pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzRGV2TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjFBXHU0RTBEXHU1MzA1XHU1NDJCXHU3OUMxXHU2NzA5XHU3RjUxXHU3RURDXHU4QkJGXHU5NUVFXHU1OTM0XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbmNvbnN0IHdpdGhTcmMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+XG4gIHJlc29sdmUoZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSksIHJlbGF0aXZlUGF0aCk7XG5cbmNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT5cbiAgcmVzb2x2ZShmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzJywgaW1wb3J0Lm1ldGEudXJsKSksIHJlbGF0aXZlUGF0aCk7XG5cbmNvbnN0IHdpdGhSb290ID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PlxuICByZXNvbHZlKGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4nLCBpbXBvcnQubWV0YS51cmwpKSwgcmVsYXRpdmVQYXRoKTtcblxuLy8gXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdTYyNTNcdTUzMDVcdTc2ODRcdTYzRDJcdTRFRjZcdUZGMDhcdTU4OUVcdTVGM0FcdTcyNDhcdThCQ0FcdTY1QUQgKyBcdTVGM0FcdTUyMzZcdTYzRDBcdTUzRDZcdUZGMDlcbmNvbnN0IGVuc3VyZUNzc1BsdWdpbiA9ICgpOiBQbHVnaW4gPT4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtY3NzLXBsdWdpbicsXG4gICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAvLyBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2OEMwXHU2N0U1XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTZDQTFcdTY3MDlcdTg4QUJcdTUxODVcdTgwNTRcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBDU1MgXHU4OEFCXHU1MTg1XHU4MDU0XHU1MjMwIEpTIFx1NjU4N1x1NEVGNlx1NEUyRFxuICAgICAgY29uc3QganNGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgbGV0IGhhc0lubGluZUNzcyA9IGZhbHNlO1xuICAgICAgY29uc3Qgc3VzcGljaW91c0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBqc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLmNvZGUgJiYgdHlwZW9mIGNodW5rLmNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGNodW5rLmNvZGU7XG5cbiAgICAgICAgICAvLyBcdTYzOTJcdTk2NjQgbW9kdWxlcHJlbG9hZCBwb2x5ZmlsbCBcdTRFRTNcdTc4MDFcbiAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSBjb2RlLmluY2x1ZGVzKCdtb2R1bGVwcmVsb2FkJykgfHwgY29kZS5pbmNsdWRlcygncmVsTGlzdCcpO1xuICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQpIHJldHVybjtcblxuICAgICAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NURGMlx1NzdFNVx1NzY4NFx1NUU5M1x1NjU4N1x1NEVGNlx1NTQ4Q1x1NUU5NFx1NzUyOFx1NkEyMVx1NTc1N1x1NjU4N1x1NEVGNlx1RkYwQ1x1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NCBDU1MgXHU1QjU3XHU3QjI2XHU0RTMyXHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XHVGRjA4XHU1OTgyIFZ1ZVx1MzAwMUVsZW1lbnQgUGx1cyBcdTdCNDlcdUZGMDlcbiAgICAgICAgICAvLyBcdTVFOTRcdTc1MjhcdTZBMjFcdTU3NTdcdTY1ODdcdTRFRjZcdUZGMDhtb2R1bGUtKlx1RkYwOVx1NEUyRFx1NzY4NCBDU1MgXHU1QjU3XHU3QjI2XHU0RTMyXHU5MDFBXHU1RTM4XHU2NjJGXHU2ODM3XHU1RjBGXHU5MTREXHU3RjZFXHU2MjE2XHU1RTM4XHU5MUNGXHVGRjBDXHU0RTBEXHU2NjJGXHU3NzFGXHU2QjYzXHU3Njg0XHU1MTg1XHU4MDU0IENTU1xuICAgICAgICAgIGNvbnN0IGlzS25vd25MaWJyYXJ5ID0gZmlsZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3ZlbmRvcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtaTE4bicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ21vZHVsZS0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLWNvbXBvc2FibGVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1wYWdlcycpO1xuICAgICAgICAgIGlmIChpc0tub3duTGlicmFyeSkgcmV0dXJuO1xuXG4gICAgICAgICAgLy8gXHU2NkY0XHU3Q0JFXHU3ODZFXHU3Njg0XHU2OEMwXHU2RDRCXHVGRjFBXHU2N0U1XHU2MjdFXHU3NzFGXHU2QjYzXHU1MTg1XHU4MDU0IENTUyBcdTc2ODRcdTZBMjFcdTVGMEZcbiAgICAgICAgICAvLyBcdTUzRUFcdTY4QzBcdTZENEJcdTc3MUZcdTZCNjNcdTc2ODRcdTk1RUVcdTk4OThcdUZGMENcdTYzOTJcdTk2NjRcdTVFOTNcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODRcdTVCNTdcdTdCMjZcdTRFMzJcdTUzMzlcdTkxNERcblxuICAgICAgICAgIC8vIDEuIFx1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSBzdHlsZSBcdTY4MDdcdTdCN0VcdTVFNzZcdThCQkVcdTdGNkUgQ1NTIFx1NTE4NVx1NUJCOVx1RkYwOFx1NUZDNVx1OTg3Qlx1NTQwQ1x1NjVGNlx1NkVFMVx1OERCM1x1NTIxQlx1NUVGQVx1NTE0M1x1N0QyMFx1NTQ4Q1x1OEJCRVx1N0Y2RVx1NTE4NVx1NUJCOVx1RkYwOVxuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlRWxlbWVudENyZWF0aW9uID0gL2RvY3VtZW50XFwuY3JlYXRlRWxlbWVudFxcKFsnXCJdc3R5bGVbJ1wiXVxcKS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xcLih0ZXh0Q29udGVudHxpbm5lckhUTUwpXFxzKj0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezEwLH1cXH0vLnRlc3QoY29kZSk7IC8vIFx1Nzg2RVx1NEZERFx1NjcwOVx1NUI5RVx1OTY0NVx1NzY4NCBDU1MgXHU4OUM0XHU1MjE5XHVGRjA4XHU4MUYzXHU1QzExMTBcdTRFMkFcdTVCNTdcdTdCMjZcdUZGMDlcblxuICAgICAgICAgIC8vIDIuIFx1NEY3Rlx1NzUyOCBpbnNlcnRTdHlsZSBcdTUxRkRcdTY1NzBcdTRFMTRcdTUzMDVcdTU0MkJcdTVCOUVcdTk2NDVcdTc2ODQgQ1NTIFx1ODlDNFx1NTIxOVx1RkYwOFx1NjZGNFx1NEUyNVx1NjgzQ1x1NzY4NFx1NjhDMFx1NjdFNVx1RkYwOVxuICAgICAgICAgIGNvbnN0IGhhc0luc2VydFN0eWxlV2l0aENzcyA9IC9pbnNlcnRTdHlsZVxccypcXCgvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC90ZXh0XFwvY3NzLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpOyAvLyBcdTc4NkVcdTRGRERcdTY3MDlcdTVCOUVcdTk2NDVcdTc2ODQgQ1NTIFx1ODlDNFx1NTIxOVx1RkYwOFx1ODFGM1x1NUMxMTIwXHU0RTJBXHU1QjU3XHU3QjI2XHVGRjA5XG5cbiAgICAgICAgICAvLyAzLiBcdTc2RjRcdTYzQTVcdTUzMDVcdTU0MkIgPHN0eWxlPiBcdTY4MDdcdTdCN0VcdTRFMTRcdTU0MEVcdTk3NjJcdTY3MDkgQ1NTIFx1NTE4NVx1NUJCOVx1RkYwOFx1NjM5Mlx1OTY2NFx1NUI1N1x1N0IyNlx1NEUzMlx1NUI1N1x1OTc2Mlx1OTFDRlx1NTQ4Q1x1NkNFOFx1OTFDQVx1RkYwOVxuICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjYyRlx1NzcxRlx1NkI2M1x1NzY4NCBIVE1MIFx1NjgwN1x1N0I3RVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NFx1NTE4NVx1NUJCOVxuICAgICAgICAgIGNvbnN0IHN0eWxlVGFnTWF0Y2ggPSBjb2RlLm1hdGNoKC88c3R5bGVbXj5dKj4vKTtcbiAgICAgICAgICBjb25zdCBoYXNTdHlsZVRhZ1dpdGhDb250ZW50ID0gc3R5bGVUYWdNYXRjaCAmJlxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoXCInXCIpICYmIC8vIFx1NjM5Mlx1OTY2NFx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NFx1NTE4NVx1NUJCOVxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoJ1wiJykgJiYgLy8gXHU2MzkyXHU5NjY0XHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0XHU1MTg1XHU1QkI5XG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpOyAvLyBcdTc4NkVcdTRGRERcdTY3MDlcdTVCOUVcdTk2NDVcdTc2ODQgQ1NTIFx1ODlDNFx1NTIxOVx1RkYwOFx1ODFGM1x1NUMxMTIwXHU0RTJBXHU1QjU3XHU3QjI2XHVGRjA5XG5cbiAgICAgICAgICAvLyA0LiBcdTY4QzBcdTZENEJcdTUxODVcdTgwNTQgQ1NTIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTMwNVx1NTQyQiBDU1MgXHU4OUM0XHU1MjE5XHU3Njg0XHU5NTdGXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA5XG4gICAgICAgICAgY29uc3QgaGFzSW5saW5lQ3NzU3RyaW5nID0gL1snXCJgXVteJ1wiYF17NTAsfTpcXHMqW14nXCJgXXsxMCx9O1xccypbXidcImBdezEwLH1bJ1wiYF0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC8oY29sb3J8YmFja2dyb3VuZHx3aWR0aHxoZWlnaHR8bWFyZ2lufHBhZGRpbmd8Ym9yZGVyfGRpc3BsYXl8cG9zaXRpb258ZmxleHxncmlkKS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIC8vIFx1NTNFQVx1NjhDMFx1NkQ0Qlx1NzcxRlx1NkI2M1x1NzY4NFx1OTVFRVx1OTg5OFx1RkYwQ1x1NEUwRFx1NjhDMFx1NkQ0Qlx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NCBDU1NcdUZGMDhcdThGRDlcdTRFOUJcdTkwMUFcdTVFMzhcdTY2MkZcdTVFOTNcdTRFRTNcdTc4MDFcdUZGMDlcbiAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gfHwgaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzIHx8IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgfHwgaGFzSW5saW5lQ3NzU3RyaW5nKSB7XG4gICAgICAgICAgICBoYXNJbmxpbmVDc3MgPSB0cnVlO1xuICAgICAgICAgICAgc3VzcGljaW91c0ZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAvLyBcdThGOTNcdTUxRkFcdTY2RjRcdThCRTZcdTdFQzZcdTc2ODRcdThCNjZcdTU0NEFcdTRGRTFcdTYwNkZcdUZGMENcdTUzMDVcdTU0MkJcdTY4QzBcdTZENEJcdTUyMzBcdTc2ODRcdTZBMjFcdTVGMEZcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zID0gW107XG4gICAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24pIHBhdHRlcm5zLnB1c2goJ1x1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSBzdHlsZSBcdTUxNDNcdTdEMjAnKTtcbiAgICAgICAgICAgIGlmIChoYXNJbnNlcnRTdHlsZVdpdGhDc3MpIHBhdHRlcm5zLnB1c2goJ2luc2VydFN0eWxlIFx1NTFGRFx1NjU3MCcpO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlVGFnV2l0aENvbnRlbnQpIHBhdHRlcm5zLnB1c2goJzxzdHlsZT4gXHU2ODA3XHU3QjdFJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5saW5lQ3NzU3RyaW5nKSBwYXR0ZXJucy5wdXNoKCdcdTUxODVcdTgwNTQgQ1NTIFx1NUI1N1x1N0IyNlx1NEUzMicpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTU3MjggJHtmaWxlfSBcdTRFMkRcdTY4QzBcdTZENEJcdTUyMzBcdTUzRUZcdTgwRkRcdTc2ODRcdTUxODVcdTgwNTQgQ1NTXHVGRjA4XHU2QTIxXHU1RjBGXHVGRjFBJHtwYXR0ZXJucy5qb2luKCcsICcpfVx1RkYwOWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNJbmxpbmVDc3MpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTY4QzBcdTZENEJcdTUyMzAgQ1NTIFx1NTNFRlx1ODBGRFx1ODhBQlx1NTE4NVx1ODA1NFx1NTIzMCBKUyBcdTRFMkRcdUZGMENcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgcWlhbmt1biBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTUyQTBcdThGN0RcdTY4MzdcdTVGMEYnKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1NTNFRlx1NzU5MVx1NjU4N1x1NEVGNlx1RkYxQSR7c3VzcGljaW91c0ZpbGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTUgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTkxNERcdTdGNkVcdTU0OEMgYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU4QkJFXHU3RjZFJyk7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTU5ODJcdTY3OUNcdThGRDlcdTY2MkZcdThCRUZcdTYyQTVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdThGRDlcdTRFOUJcdTY1ODdcdTRFRjZcdTc2ODRcdTVCOUVcdTk2NDVcdTUxODVcdTVCQjknKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgLy8gXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjhDMFx1NjdFNVx1RkYwQ1x1NkI2NFx1NjVGNlx1NjI0MFx1NjcwOVx1NjU4N1x1NEVGNlx1OTBGRFx1NURGMlx1NzUxRlx1NjIxMFxuICAgICAgY29uc3QgY3NzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG4gICAgICBpZiAoY3NzRmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzRDIFx1OTUxOVx1OEJFRlx1RkYxQVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjVFMCBDU1MgXHU2NTg3XHU0RUY2XHVGRjAxJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1XHVGRjFBJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzEuIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE2OFx1NUM0MFx1NjgzN1x1NUYwRlx1RkYwOGluZGV4LmNzcy91bm8uY3NzL2VsZW1lbnQtcGx1cy5jc3NcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMi4gXHU2NjJGXHU1NDI2XHU2NzA5IFZ1ZSBcdTdFQzRcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjggPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMy4gVW5vQ1NTIFx1OTE0RFx1N0Y2RVx1NjYyRlx1NTQyNlx1NkI2M1x1Nzg2RVx1RkYwQ1x1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NSBAdW5vY3NzIGFsbCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc0LiB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzY4NCB1c2VEZXZNb2RlIFx1NjYyRlx1NTQyNlx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NkI2M1x1Nzg2RVx1NTE3M1x1OTVFRCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc1LiBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdTY2MkZcdTU0MjZcdThCQkVcdTdGNkVcdTRFM0EgMFx1RkYwOFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1RkYwOScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIC8vIFx1NjI1M1x1NTM3MCBDU1MgXHU2NTg3XHU0RUY2XHU3Njg0XHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGXHVGRjA4XHU1OTI3XHU1QzBGL1x1OERFRlx1NUY4NFx1RkYwOVxuICAgICAgICBjc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgICBpZiAoYXNzZXQgJiYgYXNzZXQuc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplS0IgPSAoYXNzZXQuc291cmNlLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtICR7ZmlsZX06ICR7c2l6ZUtCfUtCYCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldCAmJiBhc3NldC5maWxlTmFtZSkge1xuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDIHNvdXJjZSBcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENcdTgxRjNcdTVDMTFcdTY2M0VcdTc5M0FcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gJHthc3NldC5maWxlTmFtZSB8fCBmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn07XG5cbi8vIFx1Njc4NFx1NUVGQVx1NjVGNlx1OEY5M1x1NTFGQSBiYXNlIFx1OTE0RFx1N0Y2RVx1RkYwQ1x1NzUyOFx1NEU4RVx1OEMwM1x1OEJENVxuLy8gLSBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDhodHRwOi8vbG9jYWxob3N0OjQxODEvXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFXHU2NzJDXHU1NzMwXHU5ODg0XHU4OUM4XHU2RDRCXHU4QkQ1XG4vLyAtIFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1RkYxQVx1NjgzOVx1NjM2RVx1OTBFOFx1N0Y3Mlx1NjVCOVx1NUYwRlx1OTAwOVx1NjJFOSBiYXNlIFx1OERFRlx1NUY4NFxuLy8gICAtIFx1NTk4Mlx1Njc5Q1x1OTAxQVx1OEZDN1x1NzJFQ1x1N0FDQlx1NTdERlx1NTQwRFx1OTBFOFx1N0Y3Mlx1RkYwOGFkbWluLmJlbGxpcy5jb20uY25cdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODQgJy8nXG4vLyAgIC0gXHU1OTgyXHU2NzlDXHU0RjVDXHU0RTNBXHU1QjUwXHU1RTk0XHU3NTI4XHU5MEU4XHU3RjcyXHU1NzI4XHU0RTNCXHU1RTk0XHU3NTI4XHU3Njg0IC9hZG1pbi8gXHU4REVGXHU1Rjg0XHU0RTBCXHVGRjBDXHU0RjdGXHU3NTI4ICcvYWRtaW4vJ1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBYWRtaW4uYmVsbGlzLmNvbS5jbiBcdTY2MkZcdTcyRUNcdTdBQ0JcdTU3REZcdTU0MERcdUZGMENcdTVFOTRcdThCRTVcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODQgJy8nXG5jb25zdCBCQVNFX1VSTCA9IGlzUHJldmlld0J1aWxkXG4gID8gYGh0dHA6Ly8ke0FQUF9IT1NUfToke0FQUF9QT1JUfS9gXG4gIDogJy8nOyAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTU2RTBcdTRFM0EgYWRtaW4uYmVsbGlzLmNvbS5jbiBcdTY2MkZcdTcyRUNcdTdBQ0JcdTU3REZcdTU0MERcbmNvbnNvbGUubG9nKGBbYWRtaW4tYXBwIHZpdGUuY29uZmlnXSBCYXNlIFVSTDogJHtCQVNFX1VSTH0sIEFQUF9IT1NUOiAke0FQUF9IT1NUfSwgQVBQX1BPUlQ6ICR7QVBQX1BPUlR9LCBpc1ByZXZpZXdCdWlsZDogJHtpc1ByZXZpZXdCdWlsZH1gKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBYmFzZSBcdTkxNERcdTdGNkVcbiAgLy8gLSBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDhodHRwOi8vbG9jYWxob3N0OjQxODEvXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFXHU2NzJDXHU1NzMwXHU5ODg0XHU4OUM4XHU2RDRCXHU4QkQ1XG4gIC8vIC0gXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4L1x1RkYwOVx1RkYwQ1x1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjgzOVx1NjM2RVx1NUY1M1x1NTI0RFx1NTdERlx1NTQwRFx1RkYwOGFkbWluLmJlbGxpcy5jb20uY25cdUZGMDlcdTgxRUFcdTUyQThcdTg5RTNcdTY3OTBcbiAgLy8gXHU4RkQ5XHU2ODM3XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4QkJGXHU5NUVFXHU2NUY2XHVGRjBDXHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU0RjFBXHU4MUVBXHU1MkE4XHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1N0RGXHU1NDBEXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU3ODZDXHU3RjE2XHU3ODAxXHU3Njg0IGxvY2FsaG9zdFxuICBiYXNlOiBCQVNFX1VSTCxcbiAgLy8gXHU5MTREXHU3RjZFIHB1YmxpY0Rpclx1RkYwQ1x1NjMwN1x1NTQxMSBhZG1pbi1hcHAgXHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBYWRtaW4tYXBwIFx1OTcwMFx1ODk4MVx1ODFFQVx1NURGMVx1NzY4NCBpY29ucyBcdTU0OEMgdGVtcGxhdGVzIFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjI0MFx1NEVFNVx1NEY3Rlx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIC8vIFx1NTE3Nlx1NEVENlx1NUI1MFx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1x1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHVGRjA4XHU1M0VBXHU2NzA5IGxvZ28ucG5nXHVGRjA5XG4gIHB1YmxpY0RpcjogcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHdpdGhTcmMoJ3NyYycpLFxuICAgICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcbiAgICAgICdAc2VydmljZXMnOiB3aXRoU3JjKCdzcmMvc2VydmljZXMnKSxcbiAgICAgICdAY29tcG9uZW50cyc6IHdpdGhTcmMoJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXG4gICAgICAnQGF1dGgnOiB3aXRoUm9vdCgnYXV0aCcpLFxuICAgICAgJ0Bjb25maWdzJzogd2l0aFJvb3QoJ2NvbmZpZ3MnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLXV0aWxzL3NyYycpLFxuICAgICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cyc6IHdpdGhQYWNrYWdlcygnc3ViYXBwLW1hbmlmZXN0cy9zcmMvaW5kZXgudHMnKSxcbiAgICAgICdAYnRjLWNvbW1vbic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbW1vbicpLFxuICAgICAgJ0BidGMtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAYnRjLXN0eWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcycpLFxuICAgICAgJ0BidGMtbG9jYWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMnKSxcbiAgICAgICdAYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksXG4gICAgICAnQHBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgICAnQGJ0Yy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3V0aWxzJyksXG4gICAgICAnQGJ0Yy1jcnVkJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICAgLy8gXHU1NkZFXHU4ODY4XHU3NkY4XHU1MTczXHU1MjJCXHU1NDBEXHVGRjA4XHU1MTc3XHU0RjUzXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU2NTNFXHU1NzI4XHU1MjREXHU5NzYyXHVGRjBDXHU3ODZFXHU0RkREXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXHVGRjBDXHU1M0JCXHU2Mzg5IC50cyBcdTYyNjlcdTVDNTVcdTU0MERcdThCQTkgVml0ZSBcdTgxRUFcdTUyQThcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhcicpLFxuICAgICAgJ0BjaGFydHMtdXRpbHMvY29sb3InOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3InKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2dyYWRpZW50JyksXG4gICAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcpLFxuICAgICAgJ0BjaGFydHMtdHlwZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMnKSxcbiAgICAgICdAY2hhcnRzLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzJyksXG4gICAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcycpLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcyc6ICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9kaXN0JzogJ2VsZW1lbnQtcGx1cy9kaXN0JyxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLm10cycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXSxcbiAgICBkZWR1cGU6IFsnZWxlbWVudC1wbHVzJywgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJywgJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2RheWpzJ10sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBjbGVhbkRpc3RQbHVnaW4oKSwgLy8gMC4gXHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjA4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjA5XG4gICAgY29yc1BsdWdpbigpLCAvLyAxLiBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NEUwRFx1NUU3Mlx1NjI3MFx1Njc4NFx1NUVGQVx1RkYwOVxuICAgIHRpdGxlSW5qZWN0UGx1Z2luKCksIC8vIDIuIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1RkYwOFx1NjVFMFx1Njc4NFx1NUVGQVx1NUU3Mlx1NjI3MFx1RkYwOVxuICAgIHZ1ZSh7XG4gICAgICAvLyAzLiBWdWUgXHU2M0QyXHU0RUY2XHVGRjA4XHU2ODM4XHU1RkMzXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHVGRjA5XG4gICAgICBzY3JpcHQ6IHtcbiAgICAgICAgZnM6IHtcbiAgICAgICAgICBmaWxlRXhpc3RzOiBleGlzdHNTeW5jLFxuICAgICAgICAgIHJlYWRGaWxlOiAoZmlsZTogc3RyaW5nKSA9PiByZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JyksXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksIC8vIDQuIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxuICAgIGNyZWF0ZUNvbXBvbmVudHNDb25maWcoeyBpbmNsdWRlU2hhcmVkOiB0cnVlIH0pLCAvLyA1LiBcdTdFQzRcdTRFRjZcdTgxRUFcdTUyQThcdTZDRThcdTUxOENcdTYzRDJcdTRFRjZcbiAgICBVbm9DU1Moe1xuICAgICAgLy8gNi4gVW5vQ1NTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjgzN1x1NUYwRlx1Njc4NFx1NUVGQVx1RkYwOVxuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICBidGMoe1xuICAgICAgLy8gNy4gXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgICB0eXBlOiAnc3ViYXBwJyBhcyBhbnksXG4gICAgICBwcm94eSxcbiAgICAgIGVwczoge1xuICAgICAgICBlbmFibGU6IHRydWUsXG4gICAgICAgIGRpY3Q6IGZhbHNlLFxuICAgICAgICBkaXN0OiAnLi9idWlsZC9lcHMnLFxuICAgICAgfSxcbiAgICAgIHN2Zzoge1xuICAgICAgICBza2lwTmFtZXM6IFsnYmFzZScsICdpY29ucyddLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgIC8vIDguIGkxOG4gXHU2M0QyXHU0RUY2XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMve21vZHVsZXMscGx1Z2luc30vKiovbG9jYWxlcy8qKicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzLyoqJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMvKiovbG9jYWxlcy8qKicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvemgtQ04udHMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTLnRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICBdLFxuICAgICAgcnVudGltZU9ubHk6IHRydWUsXG4gICAgfSksXG4gICAgZW5zdXJlQ3NzUGx1Z2luKCksIC8vIDkuIENTUyBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTY3ODRcdTVFRkFcdTU0MEVcdTY4QzBcdTY3RTVcdUZGMDlcbiAgICAvLyAxMC4gcWlhbmt1biBcdTYzRDJcdTRFRjZcdUZGMDhcdTY3MDBcdTU0MEVcdTYyNjdcdTg4NENcdUZGMENcdTRFMERcdTVFNzJcdTYyNzBcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTc2ODQgY2h1bmsgXHU3NTFGXHU2MjEwXHVGRjA5XG4gICAgcWlhbmt1bignYWRtaW4nLCB7XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGN0ZcdTc1MjggdXNlRGV2TW9kZTogdHJ1ZVx1RkYwQ1x1NEUwRSBsb2dpc3RpY3MtYXBwIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFxuICAgICAgLy8gXHU4NjdEXHU3MTM2XHU3NDA2XHU4QkJBXHU0RTBBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1RTk0XHU4QkU1XHU1MTczXHU5NUVEXHVGRjBDXHU0RjQ2XHU1QjlFXHU5NjQ1XHU2RDRCXHU4QkQ1XHU1M0QxXHU3M0IwIHVzZURldk1vZGU6IGZhbHNlIFx1NEYxQVx1NUJGQ1x1ODFGNFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NTNDQVx1NTE3Nlx1NEY5RFx1OEQ1Nlx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMCBpbmRleCBcdTRFMkRcbiAgICAgIC8vIFx1NEY3Rlx1NzUyOCB1c2VEZXZNb2RlOiB0cnVlIFx1NTNFRlx1NEVFNVx1Nzg2RVx1NEZERFx1NEVFM1x1NzgwMVx1NkI2M1x1Nzg2RVx1NjJDNlx1NTIwNlx1NTIzMCBhcHAtc3JjIGNodW5rXG4gICAgICB1c2VEZXZNb2RlOiB0cnVlLFxuICAgIH0pLFxuICAgIC8vIDExLiBcdTUxNUNcdTVFOTVcdTYzRDJcdTRFRjZcdUZGMDhcdThERUZcdTVGODRcdTRGRUVcdTU5MERcdTMwMDFjaHVuayBcdTRGMThcdTUzMTZcdUZGMENcdTU3MjhcdTY3MDBcdTU0MEVcdUZGMDlcbiAgICBmb3JjZU5ld0hhc2hQbHVnaW4oKSwgLy8gXHU1RjNBXHU1MjM2XHU3NTFGXHU2MjEwXHU2NUIwIGhhc2hcdUZGMDhcdTU3MjggcmVuZGVyQ2h1bmsgXHU5NjM2XHU2QkI1XHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEXHVGRjA5XG4gICAgZml4RHluYW1pY0ltcG9ydEhhc2hQbHVnaW4oKSwgLy8gXHU0RkVFXHU1OTBEXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RTJEXHU3Njg0XHU2NUU3IGhhc2ggXHU1RjE1XHU3NTI4XG4gICAgZW5zdXJlQmFzZVVybFBsdWdpbigpLCAvLyBcdTYwNjJcdTU5MERcdThERUZcdTVGODRcdTRGRUVcdTU5MERcdUZGMDhcdTc4NkVcdTRGREQgY2h1bmsgXHU4REVGXHU1Rjg0XHU2QjYzXHU3ODZFXHVGRjA5XG4gICAgb3B0aW1pemVDaHVua3NQbHVnaW4oKSwgLy8gXHU2MDYyXHU1OTBEXHU3QTdBIGNodW5rIFx1NTkwNFx1NzQwNlx1RkYwOFx1NEVDNVx1NzlGQlx1OTY2NFx1NjcyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVua1x1RkYwOVxuICAgIGNodW5rVmVyaWZ5UGx1Z2luKCksIC8vIFx1NjVCMFx1NTg5RVx1RkYxQWNodW5rIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICBdLFxuICBlc2J1aWxkOiB7XG4gICAgY2hhcnNldDogJ3V0ZjgnLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIG9yaWdpbjogYGh0dHA6Ly8ke2FwcENvbmZpZy5kZXZIb3N0fToke2FwcENvbmZpZy5kZXZQb3J0fWAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIC8vIEhNUiBXZWJTb2NrZXQgXHU5NzAwXHU4OTgxXHU0RjdGXHU3NTI4IGxvY2FsaG9zdFx1RkYwQ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjVFMFx1NkNENVx1OEZERVx1NjNBNSAwLjAuMC4wXG4gICAgICBob3N0OiBhcHBDb25maWcuZGV2SG9zdCxcbiAgICAgIHBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXG4gICAgICBvdmVybGF5OiBmYWxzZSwgLy8gXHU1MTczXHU5NUVEXHU3MEVEXHU2NkY0XHU2NUIwXHU5NTE5XHU4QkVGXHU2RDZFXHU1QzQyXHVGRjBDXHU1MUNGXHU1QzExXHU1RjAwXHU5NTAwXG4gICAgfSxcbiAgICBwcm94eSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgIGFsbG93OiBbXG4gICAgICAgIHdpdGhSb290KCcuJyksXG4gICAgICAgIHdpdGhQYWNrYWdlcygnLicpLFxuICAgICAgICB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxuICAgICAgXSxcbiAgICAgIC8vIFx1NTQyRlx1NzUyOFx1N0YxM1x1NUI1OFx1RkYwQ1x1NTJBMFx1OTAxRlx1NEY5RFx1OEQ1Nlx1NTJBMFx1OEY3RFxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxuICAgIH0sXG4gIH0sXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVx1RkYwOFx1NTQyRlx1NTJBOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzY4NFx1OTc1OVx1NjAwMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogQVBQX1BPUlQsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgLy8gXHU3QUVGXHU1M0UzXHU4OEFCXHU1MzYwXHU3NTI4XHU2NUY2XHU2MkE1XHU5NTE5XHVGRjBDXHU5MDdGXHU1MTREXHU4MUVBXHU1MkE4XHU1MjA3XHU2MzYyXG4gICAgb3BlbjogZmFsc2UsIC8vIFx1NTQyRlx1NTJBOFx1NTQwRVx1NEUwRFx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwcm94eSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAvLyBcdTUxNDFcdThCQjhcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDg0MTgwXHVGRjA5XHU4REU4XHU1N0RGXHU4QkJGXHU5NUVFXHU1RjUzXHU1MjREXHU1QjUwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogTUFJTl9BUFBfT1JJR0lOLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICAvLyBcdTU0MkZcdTc1MjhcdTRGOURcdThENTZcdTk4ODRcdTY3ODRcdTVFRkFcdUZGMENcdTUyQTBcdTkwMUZcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcbiAgICAvLyBcdTY2M0VcdTVGMEZcdTU4RjBcdTY2MEVcdTk3MDBcdTg5ODFcdTk4ODRcdTY3ODRcdTVFRkFcdTc2ODRcdTdCMkNcdTRFMDlcdTY1QjlcdTRGOURcdThENTZcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSBcdTZGMEZcdTUyMjRcdTVCRkNcdTgxRjRcdTVCOUVcdTY1RjZcdTdGMTZcdThCRDFcdTgwMTdcdTY1RjZcbiAgICBpbmNsdWRlOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICAnZGF5anMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cycsXG4gICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgICd2aXRlLXBsdWdpbi1xaWFua3VuL2Rpc3QvaGVscGVyJyxcbiAgICAgICdxaWFua3VuJyxcbiAgICAgICdzaW5nbGUtc3BhJyxcbiAgICBdLFxuICAgIC8vIFx1NjM5Mlx1OTY2NFx1NEUwRFx1OTcwMFx1ODk4MVx1OTg4NFx1Njc4NFx1NUVGQVx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgIGV4Y2x1ZGU6IFtdLFxuICAgIC8vIFx1NUYzQVx1NTIzNlx1OTg4NFx1Njc4NFx1NUVGQVx1RkYwQ1x1NTM3M1x1NEY3Rlx1NEY5RFx1OEQ1Nlx1NURGMlx1N0VDRlx1NjYyRlx1NjcwMFx1NjVCMFx1NzY4NFxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTA0N1x1NTIzMFx1NkEyMVx1NTc1N1x1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFx1RkYwQ1x1NEUzNFx1NjVGNlx1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlIFx1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1OTg4NFx1Njc4NFx1NUVGQVxuICAgIGZvcmNlOiBmYWxzZSxcbiAgICAvLyBcdTc4NkVcdTRGRERcdTRGOURcdThENTZcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgcGx1Z2luczogW10sXG4gICAgfSxcbiAgfSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J10sXG4gICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NjgzN1x1NUYwRlx1NzZFRVx1NUY1NVx1NTIzMCBpbmNsdWRlUGF0aHNcdUZGMENcdTc4NkVcdTRGREQgQHVzZSBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTgwRkRcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcbiAgICAgICAgaW5jbHVkZVBhdGhzOiBbXG4gICAgICAgICAgd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gXHU1RjNBXHU1MjM2IFZpdGUgXHU2M0QwXHU1M0Q2IENTU1x1RkYwOFx1NTE3M1x1OTUyRVx1NTE1Q1x1NUU5NVx1OTE0RFx1N0Y2RVx1RkYwOVxuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTE3M1x1OTVFRCBDU1Mgc291cmNlbWFwXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIwJywgLy8gXHU1MTdDXHU1QkI5IEVTIFx1NkEyMVx1NTc1N1x1NzY4NFx1NjcwMFx1NEY0RVx1NzZFRVx1NjgwN1xuICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NTE3M1x1OTVFRCBzb3VyY2VtYXBcdUZGMENcdTUxQ0ZcdTVDMTFcdTY1ODdcdTRFRjZcdTRGNTNcdTc5RUZcdTU0OENcdTUyQTBcdThGN0RcdTY1RjZcdTk1RjRcbiAgICAvLyBcdTc4NkVcdTRGRERcdTY3ODRcdTVFRkFcdTY1RjZcdTRGN0ZcdTc1MjhcdTZCNjNcdTc4NkVcdTc2ODQgYmFzZSBcdThERUZcdTVGODRcbiAgICAvLyBiYXNlIFx1NURGMlx1NTcyOFx1OTg3Nlx1NUM0Mlx1OTE0RFx1N0Y2RVx1RkYwQ1x1OEZEOVx1OTFDQ1x1NEUwRFx1OTcwMFx1ODk4MVx1OTFDRFx1NTkwRFx1OEJCRVx1N0Y2RVxuICAgIC8vIFx1NTQyRlx1NzUyOCBDU1MgXHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHVGRjBDXHU0RTBFXHU0RTNCXHU1N0RGXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5IENTUyBcdTkwRkRcdTg4QUJcdTZCNjNcdTc4NkVcdTYzRDBcdTUzRDZcbiAgICAvLyBcdTZCQ0ZcdTRFMkEgY2h1bmsgXHU3Njg0XHU2ODM3XHU1RjBGXHU0RjFBXHU4OEFCXHU2M0QwXHU1M0Q2XHU1MjMwXHU1QkY5XHU1RTk0XHU3Njg0IENTUyBcdTY1ODdcdTRFRjZcdTRFMkRcdUZGMENcdTc4NkVcdTRGRERcdTY4MzdcdTVGMEZcdTVCOENcdTY1NzRcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgLy8gXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdThGOTNcdTUxRkFcdTU0OENcdTUzOEJcdTdGMjlcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4IEpTIFx1NEVFM1x1NzgwMVx1NTM4Qlx1N0YyOVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzgzNFx1NTc0RiBFQ2hhcnRzIFx1N0I0OVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1NzY4NFx1NTE4NVx1OTBFOFx1NEVFM1x1NzgwMVxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUZDNVx1OTg3Qlx1NTM4Qlx1N0YyOVx1RkYwQ1x1NEY3Rlx1NzUyOCB0ZXJzZXIgXHU4MDBDXHU0RTBEXHU2NjJGIGVzYnVpbGRcdUZGMENcdTU2RTBcdTRFM0EgZXNidWlsZCBcdTUzRUZcdTgwRkRcdTc4MzRcdTU3NEZcdTY3RDBcdTRFOUJcdTRFRTNcdTc4MDFcbiAgICBtaW5pZnk6IGZhbHNlLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzk4MVx1NzUyOFx1NEVFM1x1NzgwMVx1NTM4Qlx1N0YyOVx1NjVGNlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEUwRFx1NEYxQVx1NUJGOVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1OEZEQlx1ODg0Q1x1NEVGQlx1NEY1NVx1OEY2Q1x1NjM2MlxuICAgIC8vIFx1OTAxQVx1OEZDNyByb2xsdXBPcHRpb25zIFx1NzY4NCBleHRlcm5hbCBcdTYyMTYgcHJlc2VydmVNb2R1bGVzIFx1Njc2NVx1NEZERFx1NjJBNFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1xuICAgIC8vIFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1NEVGQlx1NEY1NVx1OEQ0NFx1NkU5MFx1RkYwOFx1Nzg2RVx1NEZERCBKUy9DU1MgXHU5MEZEXHU2NjJGXHU3MkVDXHU3QUNCXHU2NTg3XHU0RUY2XHVGRjA5XG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgLy8gXHU2NjBFXHU3ODZFXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdThGOTNcdTUxRkFcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1Njc4NFx1NUVGQVx1NTI0RFx1NkUwNVx1N0E3QVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVx1RkYwQ1x1Nzg2RVx1NEZERFx1NEUwRFx1NEYxQVx1NkI4Qlx1NzU1OVx1NjVFN1x1NjU4N1x1NEVGNlxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIC8vIFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1NEVDRSBpbmRleC5odG1sIFx1OEJGQlx1NTNENlx1NTE2NVx1NTNFM1x1RkYwOFx1NEUwRVx1NTE3Nlx1NEVENlx1NUI1MFx1NUU5NFx1NzUyOFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIFx1Nzk4MVx1NzUyOCBSb2xsdXAgXHU3RjEzXHU1QjU4XHVGRjBDXHU3ODZFXHU0RkREXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU2MjQwXHU2NzA5IGNodW5rXG4gICAgICAvLyBcdThGRDlcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNERcdTY1RTdcdTc2ODQgY2h1bmsgXHU1RjE1XHU3NTI4XHU2Q0ExXHU2NzA5XHU4OEFCXHU2NkY0XHU2NUIwXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVDMDYgRUNoYXJ0cyBcdTc2RjhcdTUxNzNcdTZBMjFcdTU3NTdcdTU5MTZcdTkwRThcdTUzMTZcdUZGMENcdTkwN0ZcdTUxNEQgUm9sbHVwIFx1NTkwNFx1NzQwNlx1NUI4M1x1NEVFQ1xuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU3ODZFXHU0RkREIEVDaGFydHMgXHU3Njg0XHU1MTg1XHU5MEU4XHU0RUUzXHU3ODAxXHU0RTBEXHU0RjFBXHU4OEFCXHU3ODM0XHU1NzRGXG4gICAgICAvLyBcdTRGNDZcdTZDRThcdTYxMEZcdUZGMUFleHRlcm5hbCBcdTRGMUFcdTVCRkNcdTgxRjQgRUNoYXJ0cyBcdTRFMERcdTg4QUJcdTYyNTNcdTUzMDVcdUZGMENcdTk3MDBcdTg5ODFcdTRFQ0UgQ0ROIFx1NTJBMFx1OEY3RFxuICAgICAgLy8gXHU2NjgyXHU2NUY2XHU0RTBEXHU0RjdGXHU3NTI4IGV4dGVybmFsXHVGRjBDXHU4MDBDXHU2NjJGXHU5MDFBXHU4RkM3XHU4REYzXHU4RkM3XHU1OTA0XHU3NDA2XHU2NzY1XHU0RkREXHU2MkE0XG4gICAgICAvLyBleHRlcm5hbDogKGlkKSA9PiB7XG4gICAgICAvLyAgIHJldHVybiBpZC5pbmNsdWRlcygnZWNoYXJ0cycpIHx8IGlkLmluY2x1ZGVzKCd2dWUtZWNoYXJ0cycpO1xuICAgICAgLy8gfSxcbiAgICAgIC8vIFx1NjI5MVx1NTIzNiBSb2xsdXAgXHU1MTczXHU0RThFXHU1MkE4XHU2MDAxL1x1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTFCMlx1N0E4MVx1NzY4NFx1OEI2Nlx1NTQ0QVx1RkYwOFx1OEZEOVx1NEU5Qlx1OEI2Nlx1NTQ0QVx1NEUwRFx1NUY3MVx1NTRDRFx1NTI5Rlx1ODBGRFx1RkYwOVxuICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcbiAgICAgICAgLy8gXHU1RkZEXHU3NTY1XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU1NDhDXHU5NzU5XHU2MDAxXHU1QkZDXHU1MTY1XHU1MUIyXHU3QTgxXHU3Njg0XHU4QjY2XHU1NDRBXG4gICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJyB8fFxuICAgICAgICAgICAgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnZHluYW1pY2FsbHkgaW1wb3J0ZWQnKSAmJlxuICAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnc3RhdGljYWxseSBpbXBvcnRlZCcpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdThCNjZcdTU0NEFcdTZCNjNcdTVFMzhcdTY2M0VcdTc5M0FcbiAgICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZm9ybWF0OiAnZXNtJywgLy8gXHU2NjBFXHU3ODZFXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGXHU0RTNBIEVTTVxuICAgICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE4NVx1ODA1NFx1RkYwQ1x1Nzg2RVx1NEZERCBDU1MgXHU4OEFCXHU2M0QwXHU1M0Q2XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCBFQ2hhcnRzIFx1NzZGOFx1NTE3MyBjaHVuayBcdTRFMERcdTg4QUJcdTRGRUVcdTY1MzlcbiAgICAgICAgLy8gXHU5MDFBXHU4RkM3IG1hbnVhbENodW5rcyBcdTc4NkVcdTRGRERcdTVCODNcdTRFRUNcdTg4QUJcdTZCNjNcdTc4NkVcdTUyMDZcdTUyNzJcdUZGMENcdTRGNDZcdTRFMERcdThGREJcdTg4NENcdTRFRkJcdTRGNTVcdTk4OURcdTU5MTZcdTU5MDRcdTc0MDZcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgLy8gXHU1M0MyXHU4MDAzXHU3Q0ZCXHU3RURGXHU1RTk0XHU3NTI4XHU3Njg0XHU5MTREXHU3RjZFXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5IGNodW5rIFx1NkI2M1x1Nzg2RVx1NzUxRlx1NjIxMFxuICAgICAgICAgIC8vIFx1OTFDRFx1ODk4MVx1RkYxQUVsZW1lbnQgUGx1cyBcdTc2ODRcdTUzMzlcdTkxNERcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDkgZWxlbWVudC1wbHVzIFx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1OTBGRFx1NTcyOFx1NTQwQ1x1NEUwMFx1NEUyQSBjaHVua1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHwgaWQuaW5jbHVkZXMoJ0BlbGVtZW50LXBsdXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdlbGVtZW50LXBsdXMnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBub2RlX21vZHVsZXMgXHU0RjlEXHU4RDU2XHVGRjBDXHU4RkRCXHU4ODRDXHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgLy8gXHU1MjA2XHU1MjcyIFZ1ZSBcdTc2RjhcdTUxNzNcdTRGOURcdThENTZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndnVlJykgJiYgIWlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgJiYgIWlkLmluY2x1ZGVzKCd2dWUtaTE4bicpICYmICFpZC5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2dWUtY29yZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3Z1ZS1yb3V0ZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1MjA2XHU1MjcyIFBpbmlhXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3BpbmlhJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdwaW5pYSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2dWUtaTE4blxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd2dWUtaTE4bicpIHx8IGlkLmluY2x1ZGVzKCdAaW50bGlmeScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndnVlLWkxOG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1OTI3XHU1NzhCXHU1RTkzXG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFFQ2hhcnRzIFx1NUU5M1x1NUJGOVx1NEVFM1x1NzgwMVx1NTkwNFx1NzQwNlx1OTc1RVx1NUUzOFx1NjU0Rlx1NjExRlx1RkYwQ1x1NEVGQlx1NEY1NVx1NTkwNFx1NzQwNlx1OTBGRFx1NTNFRlx1ODBGRFx1NzgzNFx1NTc0Rlx1NTE3Nlx1NTE4NVx1OTBFOFx1NEVFM1x1NzgwMVxuICAgICAgICAgICAgLy8gXHU3Q0ZCXHU3RURGXHU1RTk0XHU3NTI4XHU2Q0ExXHU2NzA5XHU0RjdGXHU3NTI4IGZvcmNlTmV3SGFzaFBsdWdpbiBcdTdCNDlcdTYzRDJcdTRFRjZcdUZGMENcdTYyNDBcdTRFRTVcdTZDQTFcdTY3MDlcdThGRDlcdTRFMkFcdTk1RUVcdTk4OThcbiAgICAgICAgICAgIC8vIFx1NEUzQVx1NEU4Nlx1NEZERFx1NjMwMVx1NEUwRVx1N0NGQlx1N0VERlx1NUU5NFx1NzUyOFx1NEUwMFx1ODFGNFx1NzY4NFx1ODg0Q1x1NEUzQVx1RkYwQ1x1NjIxMVx1NEVFQ1x1Nzg2RVx1NEZERCBFQ2hhcnRzIFx1ODhBQlx1NkI2M1x1Nzg2RVx1NTIwNlx1NTI3Mlx1RkYwQ1x1NEY0Nlx1NEUwRFx1OEZEQlx1ODg0Q1x1NEVGQlx1NEY1NVx1OTg5RFx1NTkxNlx1NTkwNFx1NzQwNlxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdlY2hhcnRzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdsaWItZWNoYXJ0cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ21vbmFjby1lZGl0b3InKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd0aHJlZScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbGliLXRocmVlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEY1OSBub2RlX21vZHVsZXMgXHU0RjlEXHU4RDU2XHU1NDA4XHU1RTc2XHU1MjMwIHZlbmRvclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUU5NFx1NzUyOFx1NkU5MFx1NEVFM1x1NzgwMVx1RkYwOHNyYy8gXHU3NkVFXHU1RjU1XHVGRjA5XG4gICAgICAgICAgLy8gXHU1M0MyXHU4MDAzXHU3Q0ZCXHU3RURGXHU1RTk0XHU3NTI4XHU3Njg0XHU5MTREXHU3RjZFXHVGRjBDXHU4RkRCXHU4ODRDXHU3RUM2XHU1MjA2XHU3Njg0XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvJykgJiYgIWlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU1MThEXHU1QzA2IHNyYy9wbHVnaW5zL2VjaGFydHMgXHU1RjNBXHU1MjM2XHU2NTNFXHU1MTY1IGxpYi1lY2hhcnRzIGNodW5rXG4gICAgICAgICAgICAvLyBcdTU2RTBcdTRFM0EgWlJUZXh0IFx1NTcyOCB2ZW5kb3IgY2h1bmsgXHU0RTJEXHVGRjBDXHU1RjNBXHU1MjM2XHU2NTNFXHU1MTY1IGxpYi1lY2hhcnRzIFx1NTNFRlx1ODBGRFx1NUJGQ1x1ODFGNFx1NEY5RFx1OEQ1Nlx1OTVFRVx1OTg5OFxuICAgICAgICAgICAgLy8gXHU4QkE5IHNyYy9wbHVnaW5zL2VjaGFydHMgXHU2MzA5XHU5RUQ4XHU4QkE0XHU4OUM0XHU1MjE5XHU1OTA0XHU3NDA2XHVGRjA4XHU4RkRCXHU1MTY1IGFwcC1zcmMgXHU2MjE2XHU1MTc2XHU0RUQ2IGNodW5rXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTZBMjFcdTU3NTdcdTUyMDZcdTUyNzJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL21vZHVsZXMnKSkge1xuICAgICAgICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gaWQubWF0Y2goL3NyY1xcL21vZHVsZXNcXC8oW14vXSspLyk/LlsxXTtcbiAgICAgICAgICAgICAgLy8gXHU1QkY5XHU1OTI3XHU1NzhCXHU2QTIxXHU1NzU3XHU1MjFCXHU1RUZBXHU1MzU1XHU3MkVDXHU3Njg0IGNodW5rXG4gICAgICAgICAgICAgIGlmIChtb2R1bGVOYW1lICYmIFsnYWNjZXNzJywgJ25hdmlnYXRpb24nLCAnb3JnJywgJ29wcycsICdwbGF0Zm9ybScsICdzdHJhdGVneScsICdhcGktc2VydmljZXMnXS5pbmNsdWRlcyhtb2R1bGVOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgbW9kdWxlLSR7bW9kdWxlTmFtZX1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAnbW9kdWxlLW90aGVycyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTk4NzVcdTk3NjJcdTY1ODdcdTRFRjZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BhZ2VzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtcGFnZXMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU3RUM0XHU0RUY2XHU2NTg3XHU0RUY2XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFjb21wb25lbnRzIFx1NTNFRlx1ODBGRFx1NEY5RFx1OEQ1NiB1c2VTZXR0aW5nc1N0YXRlXHUzMDAxc3RvcmVcdTMwMDF1dGlscyBcdTdCNDlcdUZGMDhcdTU3MjggYXBwLXNyYyBcdTRFMkRcdUZGMDlcdUZGMENcdTU0MDhcdTVFNzZcdTUyMzAgYXBwLXNyYyBcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1RkFFXHU1MjREXHU3QUVGXHU3NkY4XHU1MTczXG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFtaWNybyBcdTZBMjFcdTU3NTdcdTRGOURcdThENTYgc3RvcmUvdGFiUmVnaXN0cnlcdTMwMDFzdG9yZS9tZW51UmVnaXN0cnlcdTMwMDFzdG9yZS9wcm9jZXNzIFx1N0I0OVx1RkYwOFx1NTcyOCBhcHAtc3JjIFx1NEUyRFx1RkYwOVxuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MjA2XHU1MjcyXHU1MjMwIGFwcC1taWNyb1x1RkYwQ1x1NEYxQVx1NUJGQ1x1ODFGNCBcIkNhbm5vdCBhY2Nlc3MgJ1FhJyBiZWZvcmUgaW5pdGlhbGl6YXRpb25cIiBcdTk1MTlcdThCRUZcbiAgICAgICAgICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NTQ4Q1x1NTIxRFx1NTlDQlx1NTMxNlx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OFxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvbWljcm8nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU2M0QyXHU0RUY2XHUzMDAxc3RvcmVcdTMwMDFzZXJ2aWNlc1x1MzAwMXV0aWxzXHUzMDAxYm9vdHN0cmFwIFx1NEUwRVx1NTkxQVx1NEUyQVx1NkEyMVx1NTc1N1x1NjcwOVx1NEY5RFx1OEQ1Nlx1NTE3M1x1N0NGQlx1RkYwQ1x1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZWNoYXJ0cyBcdTYzRDJcdTRFRjZcdTVERjJcdTdFQ0ZcdTU3MjhcdTRFMEFcdTk3NjJcdTUzNTVcdTcyRUNcdTU5MDRcdTc0MDZcdUZGMENcdThGRDlcdTkxQ0NcdTYzOTJcdTk2NjRcdTVCODNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3BsdWdpbnMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvc3RvcmUnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvc2VydmljZXMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvdXRpbHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvYm9vdHN0cmFwJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL2NvbmZpZycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9jb21wb3NhYmxlcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLWNvbXBvc2FibGVzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQXJvdXRlciBcdTRFMEUgYm9vdHN0cmFwIFx1NjcwOVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1NTIxRFx1NTlDQlx1NTMxNlx1OTUxOVx1OEJFRlxuICAgICAgICAgICAgLy8gcm91dGVyIFx1ODhBQiBib290c3RyYXAvY29yZS9yb3V0ZXIudHMgXHU1NDhDIGJvb3RzdHJhcC9pbnRlZ3JhdGlvbnMvaW50ZXJjZXB0b3JzLnRzIFx1NEY3Rlx1NzUyOFxuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MjA2XHU1MjcyXHU1MjMwIGFwcC1yb3V0ZXIgY2h1bmtcdUZGMENcdTRGMUFcdTVCRkNcdTgxRjQgXCJDYW5ub3QgYWNjZXNzICdsJyBiZWZvcmUgaW5pdGlhbGl6YXRpb25cIiBcdTk1MTlcdThCRUZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjL3JvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpMThuIFx1NkEyMVx1NTc1N1x1ODhBQiBib290c3RyYXAvY29yZS9pMThuLnRzIFx1NEY3Rlx1NzUyOFx1RkYwOFx1NTcyOCBhcHAtc3JjIFx1NEUyRFx1RkYwOVx1RkYwQ1x1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjIFx1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvaTE4bicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnYXBwLXNyYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NyYy9hc3NldHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1hc3NldHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2IHNyYyBcdTY1ODdcdTRFRjZcdUZGMDhcdTUzMDVcdTYyRUMgbWFpbi50c1x1RkYwOVx1N0VERlx1NEUwMFx1NTQwOFx1NUU3Nlx1NTIzMCBhcHAtc3JjXG4gICAgICAgICAgICByZXR1cm4gJ2FwcC1zcmMnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC0gXHU1MzA1XHVGRjA4XHU1MTcxXHU0RUFCXHU1MzA1XHVGRjA5XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAYnRjL3NoYXJlZC0nKSkge1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2ODM3XHU1RjBGXHU2NTg3XHU0RUY2XHVGRjA4Q1NTL1NDU1NcdUZGMDlcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTUyMDZcdTUyNzJcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTRFM0JcdTUxNjVcdTUzRTNcdTRFMkRcdTUyQTBcdThGN0RcbiAgICAgICAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RFx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1NUJGQ1x1ODFGNFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBc3lzdGVtLWFwcCBcdTZDQTFcdTY3MDlcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDZcdTY4MzdcdTVGMEZcdTY1ODdcdTRFRjZcdUZGMENcdTRGNDZcdTVCODNcdTc2ODRcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTkxNERcdTdGNkVcdTRFMERcdTU0MENcbiAgICAgICAgICAgIC8vIGFkbWluLWFwcCBcdTk3MDBcdTg5ODFcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDZcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTc2ODRcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTY2RjRcdTdFQzZcdTdDOTJcdTVFQTZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnLmNzcycpIHx8IGlkLmluY2x1ZGVzKCcuc2NzcycpIHx8IGlkLmluY2x1ZGVzKCdzdHlsZXMvJykpIHtcbiAgICAgICAgICAgICAgLy8gXHU2ODM3XHU1RjBGXHU2NTg3XHU0RUY2XHU0RTBEXHU1MjA2XHU1MjcyXHVGRjBDXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU1OTA0XHU3NDA2XHVGRjA4XHU5MDFBXHU1RTM4XHU0RjFBXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU1MTY1XHU1M0UzIGNodW5rXHVGRjA5XG4gICAgICAgICAgICAgIC8vIFx1OEZENFx1NTZERSB1bmRlZmluZWQgXHU4QkE5IFZpdGUgXHU2ODM5XHU2MzZFXHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHU4MUVBXHU1MkE4XHU1MUIzXHU1QjlBXHVGRjBDXHU5MDFBXHU1RTM4XHU0RjFBXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU1MTY1XHU1M0UzIGNodW5rXG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2J0Yy1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYnRjLXNoYXJlZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1QkY5XHU0RThFXHU2NzJBXHU1MzM5XHU5MTREXHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU1NDA4XHU1RTc2XHU1MjMwIGFwcC1zcmNcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTkwRkRcdTU3MjggYXBwLXNyYyBcdTRFMkRcdUZGMENcdTkwN0ZcdTUxNERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdTZBMjFcdTU3NTdcdTYyN0VcdTRFMERcdTUyMzBcbiAgICAgICAgICAvLyBcdTcyNzlcdTUyMkJcdTY2MkZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDhtYWluLnRzXHVGRjA5XHU1NDhDXHU1MjFEXHU1OUNCXHU1MzE2XHU3NkY4XHU1MTczXHU3Njg0XHU0RUUzXHU3ODAxXHU1RkM1XHU5ODdCXHU1NzI4XHU0RTAwXHU4RDc3XG4gICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIGNodW5rIFx1NEU0Qlx1OTVGNFx1NzY4NFx1NUJGQ1x1NTE2NVx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAvLyBcdThGRDlcdTY4MzdcdTU3MjggcWlhbmt1biBcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTRGMUFcdTY4MzlcdTYzNkVcdTUxNjVcdTUzRTMgSFRNTCBcdTc2ODRcdTRGNERcdTdGNkVcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcbiAgICAgICAgcHJlc2VydmVNb2R1bGVzOiBmYWxzZSxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1RjNBXHU1MjM2XHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU1N0ZBXHU0RThFIGJhc2VcdUZGMDlcbiAgICAgICAgLy8gVml0ZSBcdTlFRDhcdThCQTRcdTRGMUFcdTY4MzlcdTYzNkUgYmFzZSBcdTc1MUZcdTYyMTBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTRGNDZcdTY2M0VcdTVGMEZcdTU4RjBcdTY2MEVcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcbiAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU1MzA1XHU1NDJCXHU1QjUwXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXHVGRjA4NDE4MVx1RkYwOVx1RkYwQ1x1ODAwQ1x1OTc1RVx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwODQxODBcdUZGMDlcbiAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU2ODA3XHU1MUM2XHU2ODNDXHU1RjBGXHVGRjBDXHU2NUY2XHU5NUY0XHU2MjMzXHU3NTMxIGZvcmNlTmV3SGFzaFBsdWdpbiBcdTYzRDJcdTRFRjZcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2REZCXHU1MkEwXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uY3NzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU4RDQ0XHU2RTkwXHVGRjA4XHU1NkZFXHU3MjQ3L1x1NUI1N1x1NEY1M1x1RkYwOVx1NjMwOVx1NTM5Rlx1NjcwOVx1ODlDNFx1NTIxOVx1OEY5M1x1NTFGQVxuICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1N0IyQ1x1NEUwOVx1NjVCOVx1NjgzN1x1NUYwRlx1RkYwOFx1NTk4MiBFbGVtZW50IFBsdXNcdUZGMDlcdTRFMERcdTg4QUIgdHJlZS1zaGFraW5nXG4gICAgICBleHRlcm5hbDogW10sXG4gICAgICAvLyBcdTUxNzNcdTk1RUQgdHJlZS1zaGFraW5nXHVGRjA4XHU5MDdGXHU1MTREXHU4QkVGXHU1MjIwXHU0RjlEXHU4RDU2IGNodW5rXHVGRjA5XG4gICAgICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTVGQUVcdTUyNERcdTdBRUZcdTU3M0FcdTY2NkZcdUZGMEN0cmVlLXNoYWtpbmcgXHU2NTM2XHU3NkNBXHU2NzgxXHU0RjRFXHVGRjBDXHU5OENFXHU5NjY5XHU2NzgxXHU5QUQ4XG4gICAgICB0cmVlc2hha2U6IGZhbHNlLFxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLCAvLyBcdTYzRDBcdTlBRDhcdThCNjZcdTU0NEFcdTk2MDhcdTUwM0NcdUZGMENlbGVtZW50LXBsdXMgY2h1bmsgXHU4RjgzXHU1OTI3XHU2NjJGXHU2QjYzXHU1RTM4XHU3Njg0XG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgLy8gXHU1QzA2IGtlYmFiLWNhc2UgXHU4RjZDXHU2MzYyXHU0RTNBIFBhc2NhbENhc2VcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyOiBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICBjb25zdCBjb252ZXJ0VG9QYXNjYWxDYXNlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnQnRjJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lOyAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgUGFzY2FsQ2FzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICAgIC8vIGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgICAgICAgICAuc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAubWFwKHBhcnQgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXG4gICAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICBjb25zdCBwYXNjYWxOYW1lID0gY29udmVydFRvUGFzY2FsQ2FzZShjb21wb25lbnROYW1lKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGFzY2FsTmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHZpdGUtcGx1Z2luLXRpdGxlLWluamVjdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2FkbWluLWFwcC92aXRlLXBsdWdpbi10aXRsZS1pbmplY3QudHNcIjsvKipcbiAqIFZpdGUgXHU2M0QyXHU0RUY2XHVGRjFBXHU2NzBEXHU1MkExXHU3QUVGXHU2Q0U4XHU1MTY1XHU5ODc1XHU5NzYyXHU2ODA3XHU5ODk4XG4gKlxuICogXHU3NkVFXHU3Njg0XHVGRjFBXHU1NzI4IFZpdGUgZGV2IHNlcnZlciBcdThGRDRcdTU2REUgSFRNTCBcdTY1RjZcdUZGMENcdTY4MzlcdTYzNkVcdThCRjdcdTZDNDJcdThERUZcdTVGODRcdTU0OENcdThCRURcdThBMDBcdTY2RkZcdTYzNjIgX19QQUdFX1RJVExFX18gXHU1MzYwXHU0RjREXHU3QjI2XG4gKiBcdTY1NDhcdTY3OUNcdUZGMUFcdTUyMzdcdTY1QjBcdTY1RjZcdTZENEZcdTg5QzhcdTU2NjhcdTY4MDdcdTdCN0VcdTRFQ0VcdTdCMkNcdTRFMDBcdTVFMjdcdTVDMzFcdTY2M0VcdTc5M0FcdTZCNjNcdTc4NkVcdTY4MDdcdTk4OThcdUZGMENcdTY1RTBcdTk1RUFcdTcwQzFcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLy8gXHU2ODA3XHU5ODk4XHU2NjIwXHU1QzA0XHU4ODY4XHVGRjA4XHU0RUNFIGkxOG4gXHU1NDBDXHU2QjY1XHVGRjA5XG5jb25zdCB0aXRsZXM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0ge1xuICAnemgtQ04nOiB7XG4gICAgJy8nOiAnXHU5OTk2XHU5ODc1JyxcbiAgICAnL3Rlc3QvY3J1ZCc6ICdDUlVEXHU2RDRCXHU4QkQ1JyxcbiAgICAnL3Rlc3Qvc3ZnLXBsdWdpbic6ICdTVkdcdTYzRDJcdTRFRjZcdTZENEJcdThCRDUnLFxuICAgICcvdGVzdC9pMThuJzogJ1x1NTZGRFx1OTY0NVx1NTMxNlx1NkQ0Qlx1OEJENScsXG4gICAgJy90ZXN0L3NlbGVjdC1idXR0b24nOiAnXHU3MkI2XHU2MDAxXHU1MjA3XHU2MzYyXHU2MzA5XHU5NEFFJyxcbiAgICAnL3BsYXRmb3JtL2RvbWFpbnMnOiAnXHU1N0RGXHU1MjE3XHU4ODY4JyxcbiAgICAnL3BsYXRmb3JtL21vZHVsZXMnOiAnXHU2QTIxXHU1NzU3XHU1MjE3XHU4ODY4JyxcbiAgICAnL3BsYXRmb3JtL3BsdWdpbnMnOiAnXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4JyxcbiAgICAnL29yZy90ZW5hbnRzJzogJ1x1NzlERlx1NjIzN1x1NTIxN1x1ODg2OCcsXG4gICAgJy9vcmcvZGVwYXJ0bWVudHMnOiAnXHU5MEU4XHU5NUU4XHU1MjE3XHU4ODY4JyxcbiAgICAnL29yZy91c2Vycyc6ICdcdTc1MjhcdTYyMzdcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL3Jlc291cmNlcyc6ICdcdThENDRcdTZFOTBcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL2FjdGlvbnMnOiAnXHU4ODRDXHU0RTNBXHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9wZXJtaXNzaW9ucyc6ICdcdTY3NDNcdTk2NTBcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL3JvbGVzJzogJ1x1ODlEMlx1ODI3Mlx1NTIxN1x1ODg2OCcsXG4gICAgJy9hY2Nlc3MvcG9saWNpZXMnOiAnXHU3QjU2XHU3NTY1XHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9wZXJtLWNvbXBvc2UnOiAnXHU2NzQzXHU5NjUwXHU3RUM0XHU1NDA4JyxcbiAgICAnL25hdmlnYXRpb24vbWVudXMnOiAnXHU4M0RDXHU1MzU1XHU1MjE3XHU4ODY4JyxcbiAgICAnL25hdmlnYXRpb24vbWVudXMvcHJldmlldyc6ICdcdTgzRENcdTUzNTVcdTk4ODRcdTg5QzgnLFxuICAgICcvb3BzL2F1ZGl0JzogJ1x1NjRDRFx1NEY1Q1x1NjVFNVx1NUZENycsXG4gICAgJy9vcHMvYmFzZWxpbmUnOiAnXHU2NzQzXHU5NjUwXHU1N0ZBXHU3RUJGJyxcbiAgICAnL29wcy9zaW11bGF0b3InOiAnXHU3QjU2XHU3NTY1XHU2QTIxXHU2MkRGXHU1NjY4JyxcbiAgfSxcbiAgJ2VuLVVTJzoge1xuICAgICcvJzogJ0hvbWUnLFxuICAgICcvdGVzdC9jcnVkJzogJ0NSVUQgVGVzdCcsXG4gICAgJy90ZXN0L3N2Zy1wbHVnaW4nOiAnU1ZHIFBsdWdpbiBUZXN0JyxcbiAgICAnL3Rlc3QvaTE4bic6ICdpMThuIFRlc3QnLFxuICAgICcvdGVzdC9zZWxlY3QtYnV0dG9uJzogJ1NlbGVjdCBCdXR0b24nLFxuICAgICcvcGxhdGZvcm0vZG9tYWlucyc6ICdEb21haW4gTGlzdCcsXG4gICAgJy9wbGF0Zm9ybS9tb2R1bGVzJzogJ01vZHVsZSBMaXN0JyxcbiAgICAnL3BsYXRmb3JtL3BsdWdpbnMnOiAnUGx1Z2luIExpc3QnLFxuICAgICcvb3JnL3RlbmFudHMnOiAnVGVuYW50IExpc3QnLFxuICAgICcvb3JnL2RlcGFydG1lbnRzJzogJ0RlcGFydG1lbnQgTGlzdCcsXG4gICAgJy9vcmcvdXNlcnMnOiAnVXNlciBMaXN0JyxcbiAgICAnL2FjY2Vzcy9yZXNvdXJjZXMnOiAnUmVzb3VyY2UgTGlzdCcsXG4gICAgJy9hY2Nlc3MvYWN0aW9ucyc6ICdBY3Rpb24gTGlzdCcsXG4gICAgJy9hY2Nlc3MvcGVybWlzc2lvbnMnOiAnUGVybWlzc2lvbiBMaXN0JyxcbiAgICAnL2FjY2Vzcy9yb2xlcyc6ICdSb2xlIExpc3QnLFxuICAgICcvYWNjZXNzL3BvbGljaWVzJzogJ1BvbGljeSBMaXN0JyxcbiAgICAnL2FjY2Vzcy9wZXJtLWNvbXBvc2UnOiAnUGVybWlzc2lvbiBDb21wb3NpdGlvbicsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzJzogJ01lbnUgTGlzdCcsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzL3ByZXZpZXcnOiAnTWVudSBQcmV2aWV3JyxcbiAgICAnL29wcy9hdWRpdCc6ICdBdWRpdCBMb2dzJyxcbiAgICAnL29wcy9iYXNlbGluZSc6ICdQZXJtaXNzaW9uIEJhc2VsaW5lJyxcbiAgICAnL29wcy9zaW11bGF0b3InOiAnUG9saWN5IFNpbXVsYXRvcicsXG4gIH0sXG59O1xuXG4vKipcbiAqIFx1NEVDRSBjb29raWUgXHU0RTJEXHU2M0QwXHU1M0Q2XHU4QkVEXHU4QTAwXG4gKi9cbmZ1bmN0aW9uIGdldExvY2FsZUZyb21Db29raWUoY29va2llSGVhZGVyPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFjb29raWVIZWFkZXIpIHJldHVybiAnemgtQ04nO1xuXG4gIGNvbnN0IG1hdGNoID0gY29va2llSGVhZGVyLm1hdGNoKC8oPzpefDtcXHMqKWxvY2FsZT0oW147XSspLyk7XG4gIGlmIChtYXRjaCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzFdKS5yZXBsYWNlKC9cIi9nLCAnJyk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3poLUNOJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJ3poLUNOJztcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTY4MDdcdTk4OThcdTZDRThcdTUxNjVcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpdGxlSW5qZWN0UGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCByZXF1ZXN0UGF0aCA9ICcvJztcbiAgbGV0IHJlcXVlc3RDb29raWUgPSAnJztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi10aXRsZS1pbmplY3QnLFxuXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU1NzI4IFZpdGUgXHU1MTg1XHU5MEU4XHU0RTJEXHU5NUY0XHU0RUY2XHU0RTRCXHU1MjREXHU2MkU2XHU2MjJBXHU4QkY3XHU2QzQyXHVGRjBDXHU0RkREXHU1QjU4XHU4REVGXHU1Rjg0XHU1NDhDIGNvb2tpZVxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgcmVxdWVzdFBhdGggPSByZXEudXJsIHx8ICcvJztcbiAgICAgICAgcmVxdWVzdENvb2tpZSA9IHJlcS5oZWFkZXJzLmNvb2tpZSB8fCAnJztcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgb3JkZXI6ICdwcmUnLFxuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIC8vIFx1NEY3Rlx1NzUyOFx1NEZERFx1NUI1OFx1NzY4NFx1OEJGN1x1NkM0Mlx1NEZFMVx1NjA2RlxuICAgICAgICBjb25zdCBsb2NhbGUgPSBnZXRMb2NhbGVGcm9tQ29va2llKHJlcXVlc3RDb29raWUpO1xuICAgICAgICBjb25zdCB0aXRsZU1hcCA9IHRpdGxlc1tsb2NhbGVdIHx8IHRpdGxlc1snemgtQ04nXTtcbiAgICAgICAgY29uc3QgcGFnZVRpdGxlID0gdGl0bGVNYXBbcmVxdWVzdFBhdGhdIHx8ICdCVEMgXHU4RjY2XHU5NUY0XHU2RDQxXHU3QTBCXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGJztcblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTUzNjBcdTRGNERcdTdCMjZcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgnX19QQUdFX1RJVExFX18nLCBwYWdlVGl0bGUpO1xuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcblxuLy8gVml0ZSBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTdDN0JcdTU3OEJcbmludGVyZmFjZSBQcm94eU9wdGlvbnMge1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hhbmdlT3JpZ2luPzogYm9vbGVhbjtcbiAgc2VjdXJlPzogYm9vbGVhbjtcbiAgY29uZmlndXJlPzogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4gdm9pZDtcbn1cblxuY29uc3QgcHJveHk6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IFByb3h5T3B0aW9ucz4gPSB7XG4gICcvYXBpJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIC8vIFx1NEUwRFx1NTE4RFx1NjZGRlx1NjM2Mlx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEY2Q1x1NTNEMSAvYXBpIFx1NTIzMFx1NTQwRVx1N0FFRlx1RkYwOFx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXHVGRjA5XG4gICAgLy8gcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hZG1pbicpIC8vIFx1NURGMlx1NzlGQlx1OTY2NFx1RkYxQVx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXG4gICAgLy8gXHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU2REZCXHU1MkEwIENPUlMgXHU1OTM0XG4gICAgY29uZmlndXJlOiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB7XG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTU0Q0RcdTVFOTRcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBpZiAocHJveHlSZXMuaGVhZGVycykge1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddID0gb3JpZ2luIGFzIHN0cmluZztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyddID0gJ3RydWUnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUyc7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ10gfHwgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSByZXF1ZXN0SGVhZGVycyBhcyBzdHJpbmc7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIFNldC1Db29raWUgXHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU3ODZFXHU0RkREXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHU2NUY2IGNvb2tpZSBcdTgwRkRcdTU5MUZcdTZCNjNcdTc4NkVcdThCQkVcdTdGNkVcbiAgICAgICAgICAvLyBcdTU3MjhcdTk4ODRcdTg5QzhcdTZBMjFcdTVGMEZcdTRFMEJcdUZGMDhcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdUZGMDlcdUZGMENcdTk3MDBcdTg5ODFcdThCQkVcdTdGNkUgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXG4gICAgICAgICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddO1xuICAgICAgICAgIGlmIChzZXRDb29raWVIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb2tpZXMgPSBBcnJheS5pc0FycmF5KHNldENvb2tpZUhlYWRlcikgPyBzZXRDb29raWVIZWFkZXIgOiBbc2V0Q29va2llSGVhZGVyXTtcbiAgICAgICAgICAgIGNvbnN0IGZpeGVkQ29va2llcyA9IGNvb2tpZXMubWFwKChjb29raWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUMgY29va2llIFx1NEUwRFx1NTMwNVx1NTQyQiBTYW1lU2l0ZVx1RkYwQ1x1NjIxNlx1ODAwNSBTYW1lU2l0ZSBcdTRFMERcdTY2MkYgTm9uZVx1RkYwQ1x1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFxuICAgICAgICAgICAgICBpZiAoIWNvb2tpZS5pbmNsdWRlcygnU2FtZVNpdGU9Tm9uZScpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU3M0IwXHU2NzA5XHU3Njg0IFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgIGxldCBmaXhlZENvb2tpZSA9IGNvb2tpZS5yZXBsYWNlKC87XFxzKlNhbWVTaXRlPShTdHJpY3R8TGF4fE5vbmUpL2dpLCAnJyk7XG4gICAgICAgICAgICAgICAgLy8gXHU2REZCXHU1MkEwIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVx1RkYwOFx1NUJGOVx1NEU4RVx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1RkYwOVxuICAgICAgICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVNlY3VyZSBcdTk3MDBcdTg5ODEgSFRUUFNcdUZGMENcdTRGNDZcdTU3MjhcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU2MjExXHU0RUVDXHU0RUNEXHU3MTM2XHU2REZCXHU1MkEwXHU1QjgzXG4gICAgICAgICAgICAgICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU0RjFBXHU1RkZEXHU3NTY1IFNlY3VyZVx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTM0Rlx1OEJBRVx1NjYyRiBIVFRQXHVGRjA5XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlJztcbiAgICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGNvb2tpZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snc2V0LWNvb2tpZSddID0gZml4ZWRDb29raWVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBcdThCQjBcdTVGNTVcdTU0MEVcdTdBRUZcdTU0Q0RcdTVFOTRcdTcyQjZcdTYwMDFcbiAgICAgICAgaWYgKHByb3h5UmVzLnN0YXR1c0NvZGUgJiYgcHJveHlSZXMuc3RhdHVzQ29kZSA+PSA1MDApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUHJveHldIEJhY2tlbmQgcmV0dXJuZWQgJHtwcm94eVJlcy5zdGF0dXNDb2RlfSBmb3IgJHtyZXEubWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnKTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcdUZGMUFcdTY1RTBcdTZDRDVcdThGREVcdTYzQTVcdTUyMzBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjggaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU3NkQxXHU1NDJDXHU0RUUzXHU3NDA2XHU4QkY3XHU2QzQyXHVGRjA4XHU3NTI4XHU0RThFXHU4QzAzXHU4QkQ1XHVGRjA5XG4gICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXE6IGFueSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFtQcm94eV0gJHtyZXEubWV0aG9kfSAke3JlcS51cmx9IC0+IGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUke3JlcS51cmx9YCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG59O1xuXG5leHBvcnQgeyBwcm94eSB9O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhcHAtZW52LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTdFREZcdTRFMDBcdTc2ODRcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OTBGRFx1NEVDRVx1OEZEOVx1OTFDQ1x1OEJGQlx1NTNENlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEU4Q1x1NEU0OVx1NjAyN1xuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwRW52Q29uZmlnIHtcbiAgYXBwTmFtZTogc3RyaW5nO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIGRldlBvcnQ6IHN0cmluZztcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcmVQb3J0OiBzdHJpbmc7XG4gIHByb2RIb3N0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfRU5WX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODAnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgwJyxcbiAgICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbG9naXN0aWNzLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODInLFxuICAgIHByb2RIb3N0OiAnbG9naXN0aWNzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MycsXG4gICAgcHJvZEhvc3Q6ICdxdWFsaXR5LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3Byb2R1Y3Rpb24tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NCcsXG4gICAgcHJvZEhvc3Q6ICdwcm9kdWN0aW9uLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODUnLFxuICAgIHByb2RIb3N0OiAnZW5naW5lZXJpbmcuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZmluYW5jZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg2JyxcbiAgICBwcm9kSG9zdDogJ2ZpbmFuY2UuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbW9iaWxlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTEnLFxuICAgIHByb2RIb3N0OiAnbW9iaWxlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2RvY3Mtc2l0ZS1hcHAnLFxuICAgIGRldkhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIGRldlBvcnQ6ICc0MTcyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE3MycsXG4gICAgcHJvZEhvc3Q6ICdkb2NzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xheW91dC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODgnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg4JyxcbiAgICBwcm9kSG9zdDogJ2xheW91dC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb25pdG9yLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4OScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODknLFxuICAgIHByb2RIb3N0OiAnbW9uaXRvci5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVGMDBcdTUzRDFcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbERldlBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcucHJlUG9ydCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU3QUVGXHU1M0UzXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeURldlBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0ID09PSBwb3J0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQgPT09IHBvcnQpO1xufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9aLFNBQVMsb0JBQW9CO0FBQ2piLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsZUFBZSxXQUFXO0FBQ25DLFNBQVMsU0FBUyxZQUFZO0FBQzlCLFNBQVMsWUFBWSxjQUFjLFFBQVEsZUFBZSxtQkFBbUI7OztBQ0g3RSxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQUs3QixTQUFTLHlCQUF5QjtBQUN2QyxTQUFPLFdBQVc7QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLFFBQ0Usb0JBQW9CO0FBQUEsVUFDbEI7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxRQUNBLHFCQUFxQjtBQUFBLFVBQ25CO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFFQSxXQUFXO0FBQUEsTUFDVCxvQkFBb0I7QUFBQSxRQUNsQixhQUFhO0FBQUE7QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFFQSxLQUFLO0FBQUEsSUFFTCxVQUFVO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxVQUFV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V0FBVyxHQUFHO0FBQzVCLHFCQUFPO0FBQUEsWUFDVDtBQUdBLGdCQUFJLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDOUIscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLFdBQVcsR0FBRztBQUM1QixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxXQUFXLEdBQUc7QUFDNUIscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLGVBQWUsR0FBRztBQUNoQyxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxxQkFBTztBQUFBLFlBQ1Q7QUFJQSxnQkFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLHFCQUFPO0FBQUEsWUFDVDtBQUVBLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDM0IscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLFlBQVksR0FBRztBQUM3QixxQkFBTztBQUFBLFlBQ1Q7QUFFQSxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFLL0IsZ0JBQUksR0FBRyxTQUFTLE1BQU0sS0FBSyxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxTQUFTLEdBQUc7QUFHekUscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQ3pDLHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUtBLGlCQUFPO0FBQUEsUUFDVDtBQUFBO0FBQUE7QUFBQSxRQUdBLGlCQUFpQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLakIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCLENBQUMsY0FBYztBQUM3QixjQUFJLFVBQVUsTUFBTSxTQUFTLE1BQU0sR0FBRztBQUNwQyxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLFVBQVUsQ0FBQztBQUFBO0FBQUE7QUFBQSxNQUdYLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSx1QkFBdUI7QUFBQTtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicHJveHkiLCAiYnVpbGRJZCIsICJvcmlnaW4iXQp9Cg==
