// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath3 } from "node:url";

// ../../configs/vite/factories/subapp.config.ts
import { resolve as resolve6 } from "path";
import { createRequire } from "module";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.25/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import { existsSync as existsSync5, readFileSync as readFileSync3 } from "node:fs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir) {
  const withSrc = (relativePath) => resolve(appDir, relativePath);
  const withPackages = (relativePath) => resolve(appDir, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/subapp.config.ts
import { pathToFileURL } from "node:url";

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

// ../../configs/vite/factories/subapp.config.ts
import { btc, fixChunkReferencesPlugin } from "@btc/vite-plugin";

// ../../configs/vite-app-config.ts
import { resolve as resolve2 } from "path";

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
    prePort: "4192",
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
function getBaseUrl(appName, isPreviewBuild = false) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  if (isPreviewBuild) {
    return `http://${appConfig.preHost}:${appConfig.prePort}/`;
  }
  return "/";
}
function getPublicDir(appName, appDir) {
  if (appName === "admin-app" || appName === "mobile-app" || appName === "system-app") {
    return resolve2(appDir, "public");
  }
  return resolve2(appDir, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
function createBaseAliases(appDir, _appName) {
  const { withSrc, withPackages, withRoot, withConfigs } = createPathHelpers(appDir);
  return {
    "@": withSrc("src"),
    "@modules": withSrc("src/modules"),
    "@services": withSrc("src/services"),
    "@components": withSrc("src/components"),
    "@utils": withSrc("src/utils"),
    "@auth": withRoot("auth"),
    "@configs": withConfigs(""),
    "@btc/shared-core": withPackages("shared-core/src"),
    "@btc/shared-components": withPackages("shared-components/src"),
    "@btc/shared-utils": withPackages("shared-utils/src"),
    "@btc/subapp-manifests": withPackages("subapp-manifests/src/index.ts"),
    "@btc-common": withPackages("shared-components/src/common"),
    "@btc-components": withPackages("shared-components/src/components"),
    "@btc-styles": withPackages("shared-components/src/styles"),
    "@btc-locales": withPackages("shared-components/src/locales"),
    "@assets": withPackages("shared-components/src/assets"),
    "@btc-assets": withPackages("shared-components/src/assets"),
    "@plugins": withPackages("shared-components/src/plugins"),
    "@btc-utils": withPackages("shared-components/src/utils"),
    "@btc-crud": withPackages("shared-components/src/crud"),
    // 图表相关别名（具体文件路径放在前面，确保优先匹配）
    "@charts-utils/css-var": withPackages("shared-components/src/charts/utils/css-var"),
    "@charts-utils/color": withPackages("shared-components/src/charts/utils/color"),
    "@charts-utils/gradient": withPackages("shared-components/src/charts/utils/gradient"),
    "@charts-composables/useChartComponent": withPackages("shared-components/src/charts/composables/useChartComponent"),
    "@charts-types": withPackages("shared-components/src/charts/types"),
    "@charts-utils": withPackages("shared-components/src/charts/utils"),
    "@charts-composables": withPackages("shared-components/src/charts/composables"),
    // Element Plus 别名
    "element-plus/es": "element-plus/es",
    "element-plus/dist": "element-plus/dist"
  };
}
function createBaseResolve(appDir, appName) {
  return {
    alias: createBaseAliases(appDir, appName),
    dedupe: ["vue", "vue-router", "pinia", "element-plus", "@element-plus/icons-vue"],
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"]
  };
}

// ../../configs/vite/build/manual-chunks.ts
function createManualChunksStrategy(appName) {
  return (id) => {
    if (id.includes("virtual:eps") || id.includes("\\0virtual:eps") || id.includes("services/eps") || id.includes("services\\eps")) {
      return "eps-service";
    }
    if (id.includes("modules/api-services/auth") || id.includes("modules\\api-services\\auth") || id.includes("api-services/auth")) {
      return "auth-api";
    }
    if (id.includes("packages/shared-components/src/store/menuRegistry") || id.includes("@btc/shared-components/store/menuRegistry") || id.includes("shared-components/store/menuRegistry")) {
      return "vendor";
    }
    if (id.includes("configs/layout-bridge") || id.includes("@configs/layout-bridge")) {
      return "vendor";
    }
    if (id.includes("packages/subapp-manifests") || id.includes("@btc/subapp-manifests")) {
      const otherApps = ["finance", "logistics", "system", "quality", "engineering", "production", "monitor", "admin"];
      const currentAppName = appName.replace("-app", "");
      const shouldExclude = otherApps.filter((app) => app !== currentAppName).some((app) => id.includes(`manifests/${app}.json`));
      if (shouldExclude) {
        return void 0;
      }
      return "menu-registry";
    }
    if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender")) {
      return "echarts-vendor";
    }
    if (id.includes("node_modules/monaco-editor")) {
      return "lib-monaco";
    }
    if (id.includes("node_modules/three")) {
      return "lib-three";
    }
    if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/element-plus") || id.includes("node_modules/pinia") || id.includes("node_modules/@vueuse") || id.includes("node_modules/@element-plus") || id.includes("node_modules/vue-echarts") || id.includes("node_modules/dayjs") || id.includes("node_modules/lodash") || id.includes("node_modules/@vue") || id.includes("packages/shared-components") || id.includes("packages/shared-core") || id.includes("packages/shared-utils")) {
      return "vendor";
    }
    if (id.includes("packages/vite-plugin") || id.includes("@btc/vite-plugin")) {
      return "vendor";
    }
    return void 0;
  };
}

// ../../configs/vite/build/rollup.config.ts
function createRollupConfig(appName, options) {
  const manualChunks = createManualChunksStrategy(appName);
  const assetDir = options?.assetDir || "assets";
  const chunkDir = options?.chunkDir || assetDir;
  return {
    preserveEntrySignatures: "strict",
    onwarn(warning, warn) {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message && typeof warning.message === "string" && warning.message.includes("dynamically imported") && warning.message.includes("statically imported")) {
        return;
      }
      if (warning.message && typeof warning.message === "string" && warning.message.includes("Generated an empty chunk")) {
        return;
      }
      warn(warning);
    },
    output: {
      format: "esm",
      inlineDynamicImports: false,
      manualChunks,
      preserveModules: false,
      generatedCode: {
        constBindings: false,
        // 不使用 const，避免 TDZ 问题
        // 关键：保留导出名称，避免被压缩成单字母
        // 这可以防止 "does not provide an export named 'c'" 错误
        preserveModulesRoot: void 0
      },
      // 关键：确保导出名称不被压缩
      // 虽然 terser 的 mangle 已禁用，但 Rollup 的代码生成也可能压缩导出名称
      chunkFileNames: `${chunkDir}/[name]-[hash].js`,
      entryFileNames: `${chunkDir}/[name]-[hash].js`,
      assetFileNames: (assetInfo) => {
        if (assetInfo.name?.includes("favicon") || assetInfo.name?.includes("icons/")) {
          return assetInfo.name || `${assetDir}/[name].[ext]`;
        }
        if (assetInfo.name?.endsWith(".css")) {
          return `${assetDir}/[name]-[hash].css`;
        }
        return `${assetDir}/[name]-[hash].[ext]`;
      }
    },
    external: [
      // vite-plugin 是构建时插件，不应该被打包到运行时代码中
      "@btc/vite-plugin",
      /^@btc\/vite-plugin/
    ]
  };
}

// ../../configs/vite/plugins/clean.ts
import { resolve as resolve3 } from "path";
import { existsSync, rmSync } from "node:fs";
function safeLog(message) {
  try {
    console.log(message);
  } catch (error) {
    console.log(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function safeWarn(message) {
  try {
    console.warn(message);
  } catch (error) {
    console.warn(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function cleanDistPlugin(appDir) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve3(appDir, "dist");
      if (existsSync(distDir)) {
        safeLog("[clean-dist-plugin] \u6E05\u7406\u65E7\u7684 dist \u76EE\u5F55...");
        try {
          rmSync(distDir, { recursive: true, force: true });
          safeLog("[clean-dist-plugin] dist \u76EE\u5F55\u5DF2\u6E05\u7406");
        } catch (error) {
          if (error.code === "EBUSY" || error.code === "ENOENT") {
            safeWarn(`[clean-dist-plugin] \u6E05\u7406\u5931\u8D25\uFF08${error.code}\uFF09\uFF0CVite \u5C06\u5728\u6784\u5EFA\u65F6\u81EA\u52A8\u6E05\u7406\u8F93\u51FA\u76EE\u5F55`);
          } else {
            safeWarn("[clean-dist-plugin] \u6E05\u7406 dist \u76EE\u5F55\u5931\u8D25\uFF0C\u7EE7\u7EED\u6784\u5EFA: " + error.message);
            safeWarn("[clean-dist-plugin] Vite \u5C06\u5728\u6784\u5EFA\u65F6\u81EA\u52A8\u6E05\u7406\u8F93\u51FA\u76EE\u5F55\uFF08emptyOutDir: true\uFF09");
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/chunk.ts
function chunkVerifyPlugin() {
  return {
    // @ts-ignore - Vite Plugin 类型定义可能不完整，name 属性是标准属性
    name: "chunk-verify-plugin",
    writeBundle(_options, bundle) {
      console.log("\n[chunk-verify-plugin] \u2705 \u751F\u6210\u7684\u6240\u6709 chunk \u6587\u4EF6\uFF1A");
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      console.log(`
JS chunk\uFF08\u5171 ${jsChunks.length} \u4E2A\uFF09\uFF1A`);
      jsChunks.forEach((chunk) => console.log(`  - ${chunk}`));
      console.log(`
CSS chunk\uFF08\u5171 ${cssChunks.length} \u4E2A\uFF09\uFF1A`);
      cssChunks.forEach((chunk) => console.log(`  - ${chunk}`));
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      const indexSize = indexChunk ? bundle[indexChunk]?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;
      const missingRequiredChunks = [];
      if (!indexChunk) {
        missingRequiredChunks.push("index");
      }
      const hasEpsService = jsChunks.some((jsChunk) => jsChunk.includes("eps-service"));
      const hasAuthApi = jsChunks.some((jsChunk) => jsChunk.includes("auth-api"));
      const hasEchartsVendor = jsChunks.some((jsChunk) => jsChunk.includes("echarts-vendor"));
      const hasLibMonaco = jsChunks.some((jsChunk) => jsChunk.includes("lib-monaco"));
      const hasLibThree = jsChunks.some((jsChunk) => jsChunk.includes("lib-three"));
      console.log(`
[chunk-verify-plugin] \u{1F4E6} \u6784\u5EFA\u60C5\u51B5\uFF08\u5E73\u8861\u62C6\u5206\u7B56\u7565\uFF09\uFF1A`);
      if (indexChunk) {
        console.log(`  \u2705 index: \u4E3B\u6587\u4EF6\uFF08Vue\u751F\u6001 + Element Plus + \u4E1A\u52A1\u4EE3\u7801\uFF0C\u4F53\u79EF~${indexSizeMB.toFixed(2)}MB \u672A\u538B\u7F29\uFF0Cgzip\u540E~${(indexSizeMB * 0.3).toFixed(2)}MB\uFF09`);
      } else {
        console.log(`  \u274C \u5165\u53E3\u6587\u4EF6\u4E0D\u5B58\u5728`);
      }
      if (hasEpsService) console.log(`  \u2705 eps-service: EPS \u670D\u52A1\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF09`);
      if (hasAuthApi) console.log(`  \u2705 auth-api: Auth API\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF0C\u7531 system-app \u63D0\u4F9B\uFF09`);
      if (hasEchartsVendor) console.log(`  \u2705 echarts-vendor: ECharts + zrender\uFF08\u72EC\u7ACB\u5927\u5E93\uFF0C\u65E0\u4F9D\u8D56\u95EE\u9898\uFF09`);
      if (hasLibMonaco) console.log(`  \u2705 lib-monaco: Monaco Editor\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      if (hasLibThree) console.log(`  \u2705 lib-three: Three.js\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      console.log(`  \u2139\uFE0F  \u4E1A\u52A1\u4EE3\u7801\u548C Vue \u751F\u6001\u5408\u5E76\u5230\u4E3B\u6587\u4EF6\uFF0C\u907F\u514D\u521D\u59CB\u5316\u987A\u5E8F\u95EE\u9898`);
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
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code) {
          const codeWithoutComments = chunkAny.code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
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
          }
        }
        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }
      if (missingFiles.length > 0) {
        console.error(`
[chunk-verify-plugin] \u274C \u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A`);
        if (missingFiles.length <= 5) {
          console.warn(`
[chunk-verify-plugin] \u26A0\uFE0F  \u8B66\u544A\uFF1A\u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u4F46\u7EE7\u7EED\u6784\u5EFA`);
        } else {
          throw new Error(`\u8D44\u6E90\u5F15\u7528\u4E0D\u4E00\u81F4\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01\u6709 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u5B58\u5728`);
        }
      } else {
        console.log(`
[chunk-verify-plugin] \u2705 \u6240\u6709\u8D44\u6E90\u5F15\u7528\u90FD\u6B63\u786E\uFF08\u5171\u9A8C\u8BC1 ${referencedFiles.size} \u4E2A\u5F15\u7528\uFF09`);
      }
    }
  };
}
function optimizeChunksPlugin() {
  return {
    name: "optimize-chunks",
    generateBundle(_options, bundle) {
      const emptyChunks = [];
      const chunkReferences = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code && chunkAny.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunkAny.type === "chunk" && chunkAny.imports) {
          for (const imported of chunkAny.imports) {
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
}

// ../../configs/vite/plugins/hash.ts
import { join, dirname } from "path";
import { existsSync as existsSync2, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/hash.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);
function getBuildTimestamp() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = join(__dirname, "../../../.build-timestamp");
  if (existsSync2(timestampFile)) {
    try {
      const timestamp2 = readFileSync(timestampFile, "utf-8").trim();
      if (timestamp2) {
        return timestamp2;
      }
    } catch (error) {
    }
  }
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync(timestampFile, timestamp, "utf-8");
  } catch (error) {
  }
  return timestamp;
}
function forceNewHashPlugin() {
  const buildId = getBuildTimestamp();
  const cssFileNameMap = /* @__PURE__ */ new Map();
  const jsFileNameMap = /* @__PURE__ */ new Map();
  return {
    name: "force-new-hash",
    enforce: "post",
    buildStart() {
      console.log(`[force-new-hash] \u6784\u5EFA ID: ${buildId}`);
      cssFileNameMap.clear();
      jsFileNameMap.clear();
    },
    renderChunk(code, chunk) {
      const isThirdPartyLib = chunk.fileName?.includes("lib-echarts") || chunk.fileName?.includes("element-plus") || chunk.fileName?.includes("vue-core") || chunk.fileName?.includes("vue-router") || chunk.fileName?.includes("vendor");
      if (isThirdPartyLib) {
        return null;
      }
      return `/* build-id: ${buildId} */
${code}`;
    },
    generateBundle(_options, bundle) {
      const fileNameMap = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          let baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          if (baseName.endsWith("-")) {
            console.warn(`[force-new-hash] \u26A0\uFE0F  \u68C0\u6D4B\u5230 Rollup \u751F\u6210\u7684\u5F02\u5E38\u6587\u4EF6\u540D\uFF08\u672B\u5C3E\u6709\u8FDE\u5B57\u7B26\uFF09: ${fileName}`);
            baseName = baseName.replace(/-+$/, "");
          }
          const newFileName = `assets/${baseName}-${buildId}.js`;
          fileNameMap.set(fileName, newFileName);
          const oldRef = fileName.replace(/^assets\//, "");
          const newRef = newFileName.replace(/^assets\//, "");
          jsFileNameMap.set(oldRef, newRef);
          chunk.fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        } else if (chunk.type === "asset" && fileName.endsWith(".css") && fileName.startsWith("assets/")) {
          let baseName = fileName.replace(/^assets\//, "").replace(/\.css$/, "");
          baseName = baseName.replace(/-+$/, "");
          const newFileName = `assets/${baseName}-${buildId}.css`;
          fileNameMap.set(fileName, newFileName);
          const oldCssName = fileName.replace(/^assets\//, "");
          const newCssName = newFileName.replace(/^assets\//, "");
          cssFileNameMap.set(oldCssName, newCssName);
          console.log(`[force-new-hash] CSS \u6587\u4EF6\u6620\u5C04: ${oldCssName} -> ${newCssName}`);
          chunk.fileName = newFileName;
          bundle[newFileName] = chunk;
          delete bundle[fileName];
        }
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code) {
          const isThirdPartyLib = fileName.includes("lib-echarts") || fileName.includes("element-plus") || fileName.includes("vue-core") || fileName.includes("vue-router") || fileName.includes("vendor");
          if (isThirdPartyLib && (fileName.includes("vue-router") || fileName.includes("vue-core"))) {
            continue;
          }
          let newCode = chunkAny.code;
          let modified = false;
          for (const [oldFileName, newFileName] of fileNameMap.entries()) {
            const oldRef = oldFileName.replace(/^assets\//, "");
            const newRef = newFileName.replace(/^assets\//, "");
            const oldRefWithoutTrailingDash = oldRef.replace(/-+$/, "");
            const replacePatterns = [
              [`/assets/${oldRef}`, `/assets/${newRef}`],
              [`./${oldRef}`, `./${newRef}`],
              [`"${oldRef}"`, `"${newRef}"`],
              [`'${oldRef}'`, `'${newRef}'`],
              [`\`${oldRef}\``, `\`${newRef}\``],
              [`import('/assets/${oldRef}')`, `import('/assets/${newRef}?v=${buildId}')`],
              [`import("/assets/${oldRef}")`, `import("/assets/${newRef}?v=${buildId}")`],
              [`import(\`/assets/${oldRef}\`)`, `import(\`/assets/${newRef}?v=${buildId}\`)`]
            ];
            if (oldRef !== oldRefWithoutTrailingDash) {
              replacePatterns.push(
                [`/assets/${oldRefWithoutTrailingDash}`, `/assets/${newRef}`],
                [`./${oldRefWithoutTrailingDash}`, `./${newRef}`],
                [`"${oldRefWithoutTrailingDash}"`, `"${newRef}"`],
                [`'${oldRefWithoutTrailingDash}'`, `'${newRef}'`],
                [`\`${oldRefWithoutTrailingDash}\``, `\`${newRef}\``],
                [`import('/assets/${oldRefWithoutTrailingDash}')`, `import('/assets/${newRef}?v=${buildId}')`],
                [`import("/assets/${oldRefWithoutTrailingDash}")`, `import("/assets/${newRef}?v=${buildId}")`],
                [`import(\`/assets/${oldRefWithoutTrailingDash}\`)`, `import(\`/assets/${newRef}?v=${buildId}\`)`]
              );
            }
            replacePatterns.forEach(([oldPattern, newPattern]) => {
              const escapedOldPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(escapedOldPattern, "g");
              if (regex.test(newCode)) {
                newCode = newCode.replace(regex, newPattern);
                modified = true;
              }
            });
            const allImportPattern = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
            newCode = newCode.replace(allImportPattern, (_match, quote, path, _ext, query) => {
              if (query && query.includes("v=")) {
                return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
              } else {
                return `import(${quote}${path}?v=${buildId}${quote})`;
              }
            });
          }
          if (newCode.includes("__vite__mapDeps") && cssFileNameMap.size > 0) {
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const cssPattern = new RegExp(`(["'])assets/${escapedOldCssName}\\1`, "g");
              if (cssPattern.test(newCode)) {
                newCode = newCode.replace(cssPattern, `$1assets/${newCssName}$1`);
                modified = true;
              }
            }
          }
          if (modified) {
            chunkAny.code = newCode;
          }
        }
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "asset" && fileName === "index.html") {
          let htmlContent = chunkAny.source;
          let htmlModified = false;
          if (cssFileNameMap.size > 0) {
            console.log(`[force-new-hash] \u5F00\u59CB\u66F4\u65B0 HTML \u4E2D\u7684 CSS \u5F15\u7528\uFF0C\u6620\u5C04\u8868\u5927\u5C0F: ${cssFileNameMap.size}`);
            const cssRefs = htmlContent.match(/<link[^>]*\s+href=["']([^"']+\.css[^"']*)["'][^>]*>/g);
            if (cssRefs) {
              console.log(`[force-new-hash] HTML \u4E2D\u7684 CSS \u5F15\u7528:`, cssRefs);
            }
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedOldCssName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
              const originalHtml = htmlContent;
              htmlContent = htmlContent.replace(linkPattern, (_match, prefix, path, query, suffix) => {
                const pathPrefix = path.startsWith("./") ? "./" : "/";
                const newPath = `${pathPrefix}assets/${newCssName}`;
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] \u5339\u914D\u5230 CSS \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml) {
                htmlModified = true;
                console.log(`[force-new-hash] \u2705 \u5DF2\u5728 generateBundle \u9636\u6BB5\u66F4\u65B0 HTML \u4E2D\u7684 CSS \u5F15\u7528: ${oldCssName} -> ${newCssName}`);
              } else {
                console.log(`[force-new-hash] \u26A0\uFE0F  \u672A\u627E\u5230\u5339\u914D\u7684 CSS \u5F15\u7528: ${oldCssName}`);
              }
            }
          }
          if (jsFileNameMap.size > 0) {
            console.log(`[force-new-hash] \u5F00\u59CB\u66F4\u65B0 HTML \u4E2D\u7684 JS \u5F15\u7528\uFF0C\u6620\u5C04\u8868\u5927\u5C0F: ${jsFileNameMap.size}`);
            const importRefs = htmlContent.match(/import\s*\(['"]([^'"]+\.js[^'"]*)['"]\)/g);
            if (importRefs) {
              console.log(`[force-new-hash] HTML \u4E2D\u7684 import() \u5F15\u7528:`, importRefs);
            }
            for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
              const escapedOldJsName = oldJsName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const scriptPattern = new RegExp(`(<script[^>]*\\s+src=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
              const originalHtml1 = htmlContent;
              htmlContent = htmlContent.replace(scriptPattern, (_match, prefix, path, query, suffix) => {
                const pathPrefix = path.startsWith("./") ? "./" : "/";
                const newPath = `${pathPrefix}assets/${newJsName}`;
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/g, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] \u5339\u914D\u5230 <script src> \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml1) {
                htmlModified = true;
                console.log(`[force-new-hash] \u2705 \u5DF2\u66F4\u65B0 <script src> \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
              }
              const importPattern = new RegExp(`(import\\s*\\(\\s*['"])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(['"]\\s*\\))`, "g");
              const originalHtml2 = htmlContent;
              htmlContent = htmlContent.replace(importPattern, (_match, prefix, path, query, suffix) => {
                const pathPrefix = path.startsWith("./") ? "./" : "/";
                const newPath = `${pathPrefix}assets/${newJsName}`;
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/g, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] \u5339\u914D\u5230 import() \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml2) {
                htmlModified = true;
                console.log(`[force-new-hash] \u2705 \u5DF2\u66F4\u65B0 import() \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
              }
              const modulepreloadPattern = new RegExp(`(<link[^>]*\\s+rel=["']modulepreload["'][^>]*\\s+href=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
              const originalHtml3 = htmlContent;
              htmlContent = htmlContent.replace(modulepreloadPattern, (_match, prefix, path, query, suffix) => {
                const pathPrefix = path.startsWith("./") ? "./" : "/";
                const newPath = `${pathPrefix}assets/${newJsName}`;
                const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                console.log(`[force-new-hash] \u5339\u914D\u5230 <link rel="modulepreload"> \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
                return `${prefix}${newPath}${newQuery}${suffix}`;
              });
              if (htmlContent !== originalHtml3) {
                htmlModified = true;
                console.log(`[force-new-hash] \u2705 \u5DF2\u66F4\u65B0 <link rel="modulepreload"> \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
              }
            }
            if (htmlModified) {
              console.log(`[force-new-hash] \u2705 \u5DF2\u5728 generateBundle \u9636\u6BB5\u66F4\u65B0 HTML \u4E2D\u7684 JS \u5F15\u7528`);
            }
          }
          if (htmlModified) {
            chunk.source = htmlContent;
          }
        }
      }
      console.log(`[force-new-hash] \u2705 \u5DF2\u4E3A ${fileNameMap.size} \u4E2A\u6587\u4EF6\u6DFB\u52A0\u6784\u5EFA ID: ${buildId}`);
    },
    writeBundle(options) {
      const outputDir = options.dir || join(process.cwd(), "dist");
      const indexHtmlPath = join(outputDir, "index.html");
      if (existsSync2(indexHtmlPath)) {
        let html = readFileSync(indexHtmlPath, "utf-8");
        let modified = false;
        if (cssFileNameMap.size > 0) {
          for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
            const escapedOldCssName = oldCssName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const linkPattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedOldCssName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
            const originalHtml = html;
            html = html.replace(linkPattern, (_match, prefix, path, query, suffix) => {
              const pathPrefix = path.startsWith("./") ? "./" : "/";
              const newPath = `${pathPrefix}assets/${newCssName}`;
              const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml) {
              modified = true;
              console.log(`[force-new-hash] \u5DF2\u66F4\u65B0 HTML \u4E2D\u7684 CSS \u5F15\u7528: ${oldCssName} -> ${newCssName}`);
            }
          }
          if (!modified && cssFileNameMap.size > 0) {
            for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
              const baseNameMatch = oldCssName.match(/^(.+?)-([A-Za-z0-9]{4,})\.css$/);
              if (baseNameMatch) {
                const [, baseName] = baseNameMatch;
                const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const loosePattern = new RegExp(`(<link[^>]*\\s+href=["'])(\\.?/assets/${escapedBaseName}-[^"'\\s]+\\.css)(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
                const originalHtml = html;
                let matchedPath = "";
                html = html.replace(loosePattern, (_match, prefix, path, query, suffix) => {
                  const pathPrefix = path.startsWith("./") ? "./" : "/";
                  const newPath = `${pathPrefix}assets/${newCssName}`;
                  const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                  matchedPath = path;
                  return `${prefix}${newPath}${newQuery}${suffix}`;
                });
                if (html !== originalHtml) {
                  modified = true;
                  console.log(`[force-new-hash] \u5DF2\u901A\u8FC7\u6A21\u7CCA\u5339\u914D\u66F4\u65B0 HTML \u4E2D\u7684 CSS \u5F15\u7528: ${matchedPath} -> ${newCssName}`);
                  break;
                }
              }
            }
          }
        }
        if (jsFileNameMap.size > 0) {
          for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
            const escapedOldJsName = oldJsName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const importPattern = new RegExp(`(import\\s*\\(\\s*['"])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(['"]\\s*\\))`, "g");
            const originalHtml1 = html;
            html = html.replace(importPattern, (_match, prefix, path, query, suffix) => {
              const pathPrefix = path.startsWith("./") ? "./" : "/";
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              console.log(`[force-new-hash] writeBundle \u9636\u6BB5\u5339\u914D\u5230 import() \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml1) {
              modified = true;
              console.log(`[force-new-hash] \u2705 writeBundle \u9636\u6BB5\u5DF2\u66F4\u65B0 import() \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
            }
            const scriptPattern = new RegExp(`(<script[^>]*\\s+src=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
            const originalHtml2 = html;
            html = html.replace(scriptPattern, (_match, prefix, path, query, suffix) => {
              const pathPrefix = path.startsWith("./") ? "./" : "/";
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml2) {
              modified = true;
              console.log(`[force-new-hash] \u2705 writeBundle \u9636\u6BB5\u5DF2\u66F4\u65B0 <script src> \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
            }
            const modulepreloadPattern = new RegExp(`(<link[^>]*\\s+rel=["']modulepreload["'][^>]*\\s+href=["'])(\\.?/assets/${escapedOldJsName})(\\?[^"'\\s]*)?(["'][^>]*>)`, "g");
            const originalHtml3 = html;
            html = html.replace(modulepreloadPattern, (_match, prefix, path, query, suffix) => {
              const pathPrefix = path.startsWith("./") ? "./" : "/";
              const newPath = `${pathPrefix}assets/${newJsName}`;
              const newQuery = query ? query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
              console.log(`[force-new-hash] writeBundle \u9636\u6BB5\u5339\u914D\u5230 <link rel="modulepreload"> \u5F15\u7528: ${path}${query || ""} -> ${newPath}${newQuery}`);
              return `${prefix}${newPath}${newQuery}${suffix}`;
            });
            if (html !== originalHtml3) {
              modified = true;
              console.log(`[force-new-hash] \u2705 writeBundle \u9636\u6BB5\u5DF2\u66F4\u65B0 <link rel="modulepreload"> \u5F15\u7528: ${oldJsName} -> ${newJsName}`);
            }
          }
        }
        const importPatternFallback = /import\s*\(\s*(["'])(\.?\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
        html = html.replace(importPatternFallback, (_match, quote, path, _ext, query) => {
          if (query) {
            return `import(${quote}${path}${query.replace(/[?&]v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
          } else {
            return `import(${quote}${path}?v=${buildId}${quote})`;
          }
        });
        if (modified) {
          writeFileSync(indexHtmlPath, html, "utf-8");
        }
      }
      const assetsDir = join(outputDir, "assets");
      if (existsSync2(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
        let totalFixed = 0;
        const allFileNameMap = /* @__PURE__ */ new Map();
        for (const [oldJsName, newJsName] of jsFileNameMap.entries()) {
          allFileNameMap.set(oldJsName, newJsName);
        }
        for (const [oldCssName, newCssName] of cssFileNameMap.entries()) {
          allFileNameMap.set(oldCssName, newCssName);
        }
        for (const jsFile of jsFiles) {
          const isThirdPartyLib = jsFile.includes("lib-echarts") || jsFile.includes("element-plus") || jsFile.includes("vue-core") || jsFile.includes("vue-router") || jsFile.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          const jsFilePath = join(assetsDir, jsFile);
          let content = readFileSync(jsFilePath, "utf-8");
          let modified = false;
          for (const [oldFileName, newFileName] of allFileNameMap.entries()) {
            const escapedOldFileName = oldFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const patterns = [
              new RegExp(`import\\s*\\(\\s*(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1\\s*\\)`, "g"),
              new RegExp(`(["'\`])/assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, "g"),
              new RegExp(`(["'\`])\\./${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, "g"),
              new RegExp(`(["'\`])assets/${escapedOldFileName}(?![a-zA-Z0-9-])(\\?[^"'\\s]*)?\\1`, "g")
            ];
            patterns.forEach((pattern) => {
              const originalContent = content;
              if (pattern.source.includes("import\\s*\\(")) {
                content = content.replace(pattern, (_match, quote, query) => {
                  const newPath = `/assets/${newFileName}`;
                  const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                  return `import(${quote}${newPath}${newQuery}${quote})`;
                });
                if (content !== originalContent) {
                  modified = true;
                }
              } else {
                if (newFileName.endsWith(".js") || newFileName.endsWith(".mjs")) {
                  content = content.replace(pattern, (match, quote, query) => {
                    let newPath;
                    if (pattern.source.includes("/assets/")) {
                      newPath = `/assets/${newFileName}`;
                    } else if (pattern.source.includes("./")) {
                      newPath = `./${newFileName}`;
                    } else if (pattern.source.includes("assets/")) {
                      newPath = `assets/${newFileName}`;
                    } else {
                      return match;
                    }
                    const newQuery = query ? query.replace(/\?v=[^&'"]*/, `?v=${buildId}`) : `?v=${buildId}`;
                    return `${quote}${newPath}${newQuery}${quote}`;
                  });
                  if (content !== originalContent) {
                    modified = true;
                  }
                } else {
                  content = content.replace(pattern, (match, quote, _query) => {
                    let newPath;
                    if (pattern.source.includes("/assets/")) {
                      newPath = `/assets/${newFileName}`;
                    } else if (pattern.source.includes("./")) {
                      newPath = `./${newFileName}`;
                    } else if (pattern.source.includes("assets/")) {
                      newPath = `assets/${newFileName}`;
                    } else {
                      return match;
                    }
                    return `${quote}${newPath}${quote}`;
                  });
                  if (content !== originalContent) {
                    modified = true;
                  }
                }
              }
            });
          }
          const fallbackImportPattern = /import\s*\(\s*(["'])(\/assets\/[^"'`\s]+\.(js|mjs))(\?[^"'`\s]*)?\1\s*\)/g;
          content = content.replace(fallbackImportPattern, (_match, quote, path, _ext, query) => {
            if (query && query.includes("v=")) {
              return `import(${quote}${path}${query.replace(/\?v=[^&'"]*/, `?v=${buildId}`)}${quote})`;
            } else {
              return `import(${quote}${path}?v=${buildId}${quote})`;
            }
          });
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
}
function fixDynamicImportHashPlugin() {
  const chunkNameMap = /* @__PURE__ */ new Map();
  return {
    name: "fix-dynamic-import-hash",
    generateBundle(_options, bundle) {
      chunkNameMap.clear();
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          const nameMatch = baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) || baseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }
      console.log(`[fix-dynamic-import-hash] \u6536\u96C6\u5230 ${chunkNameMap.size} \u4E2A chunk \u6620\u5C04`);
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code) {
          const isThirdPartyLib = fileName.includes("lib-echarts") || fileName.includes("element-plus") || fileName.includes("vue-core") || fileName.includes("vue-router") || fileName.includes("vendor");
          if (isThirdPartyLib) {
            continue;
          }
          let newCode = chunkAny.code;
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
                const [, namePrefix] = refMatch;
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
                }
              }
            }
          }
          const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
          stringPathPattern.lastIndex = 0;
          while ((match = stringPathPattern.exec(newCode)) !== null) {
            const quote = match[1];
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
                }
              }
            }
          }
          if (replacements.length > 0) {
            replacements.reverse().forEach(({ old, new: newStr }) => {
              newCode = newCode.replace(old, newStr);
            });
            modified = true;
          }
          if (modified) {
            chunkAny.code = newCode;
          }
        }
      }
    },
    writeBundle(options, bundle) {
      const outputDir = options.dir || join(process.cwd(), "dist");
      chunkNameMap.clear();
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const baseName = fileName.replace(/^assets\//, "").replace(/\.js$/, "");
          const cleanBaseName = baseName.replace(/-+$/, "");
          const nameMatch = cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?$/) || cleanBaseName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?$/);
          if (nameMatch) {
            const namePrefix = nameMatch[1];
            if (!chunkNameMap.has(namePrefix)) {
              chunkNameMap.set(namePrefix, fileName);
            }
          }
        }
      }
      let totalFixed = 0;
      const thirdPartyChunks = ["lib-echarts", "element-plus", "vue-core", "vue-router", "vendor"];
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && fileName.endsWith(".js") && fileName.startsWith("assets/")) {
          const isThirdPartyLib = thirdPartyChunks.some((lib) => fileName.includes(lib));
          const isEChartsLib = fileName.includes("lib-echarts");
          if (isThirdPartyLib && !isEChartsLib) {
            continue;
          }
          const filePath = join(outputDir, fileName);
          if (existsSync2(filePath)) {
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
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, ".$1");
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);
                  if (!actualFile) {
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, "").replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, "");
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith(".js") && existingFileName.startsWith("assets/")) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, "").replace(/\.js$/, "");
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, "");
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, "");
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }
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
                  }
                }
              }
            }
            const stringPathPattern = /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g;
            stringPathPattern.lastIndex = 0;
            while ((match = stringPathPattern.exec(content)) !== null) {
              const quote = match[1];
              const referencedFile = match[3];
              const fullMatch = match[0];
              const alreadyFixed = replacements.some((r) => r.old === fullMatch || r.old.includes(referencedFile));
              if (alreadyFixed) {
                continue;
              }
              const existsInBundle = Object.keys(bundle).some((f) => f === `assets/${referencedFile}` || f.endsWith(`/${referencedFile}`));
              if (!existsInBundle) {
                const referencedFileClean = referencedFile.replace(/-+\.(js|mjs|css)$/, ".$1");
                const refMatch = referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.(js|mjs|css)$/) || referencedFileClean.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
                if (refMatch) {
                  const namePrefix = refMatch[1];
                  let actualFile = chunkNameMap.get(namePrefix);
                  if (!actualFile) {
                    const refPrefix = referencedFileClean.replace(/\.(js|mjs|css)$/, "").replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, "");
                    for (const [existingFileName] of Object.entries(bundle)) {
                      if (existingFileName.endsWith(".js") && existingFileName.startsWith("assets/")) {
                        const existingFileBaseName = existingFileName.replace(/^assets\//, "").replace(/\.js$/, "");
                        const existingFileBaseNameClean = existingFileBaseName.replace(/-+$/, "");
                        const existingPrefix = existingFileBaseNameClean.replace(/-[a-zA-Z0-9]{8,}(?:-[a-zA-Z0-9]+)?$/, "");
                        if (existingPrefix === refPrefix) {
                          actualFile = existingFileName;
                          break;
                        }
                      }
                    }
                  }
                  if (actualFile) {
                    const actualFileName = actualFile.replace(/^assets\//, "");
                    const newPath = `/assets/${actualFileName}`;
                    replacements.push({
                      old: fullMatch,
                      new: `${quote}${newPath}${quote}`
                    });
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
            }
          }
        }
      }
      if (totalFixed > 0) {
        console.log(`[fix-dynamic-import-hash] \u2705 writeBundle \u9636\u6BB5\u5171\u4FEE\u590D ${totalFixed} \u4E2A\u6587\u4EF6`);
      }
    }
  };
}

// ../../configs/vite/plugins/url.ts
function ensureBaseUrlPlugin(baseUrl, appHost, appPort, mainAppPort) {
  const isPreviewBuild = baseUrl.startsWith("http");
  return {
    name: "ensure-base-url",
    renderChunk(code, chunk, _options) {
      let newCode = code;
      let modified = false;
      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
            return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
          });
          modified = true;
        }
      }
      const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (_match, path, query = "") => {
          return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
        });
        modified = true;
      }
      const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (_match, path, query = "") => {
          return `//${appHost}:${appPort}${path}${query}`;
        });
        modified = true;
      }
      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        }
      ];
      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      }
      if (modified) {
        console.log(`[ensure-base-url] \u4FEE\u590D\u4E86 ${chunk.fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84 (${mainAppPort} -> ${appPort})`);
        return {
          code: newCode,
          map: null
        };
      }
      return null;
    },
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          let newCode = chunk.code;
          let modified = false;
          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
                return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
              });
              modified = true;
            }
          }
          const wrongPortHttpRegex = new RegExp(`http://${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (_match, path, query = "") => {
              return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
            });
            modified = true;
          }
          const wrongPortProtocolRegex = new RegExp(`//${appHost}:${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (_match, path, query = "") => {
              return `//${appHost}:${appPort}${path}${query}`;
            });
            modified = true;
          }
          if (modified) {
            chunk.code = newCode;
            console.log(`[ensure-base-url] \u5728 generateBundle \u4E2D\u4FEE\u590D\u4E86 ${fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        } else if (chunk.type === "asset" && fileName === "index.html") {
          let htmlContent = chunk.source;
          let htmlModified = false;
          const relativeAssetRegex = /(href|src)=["'](\.\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (relativeAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(relativeAssetRegex, (_match, attr, path, query = "") => {
              const absolutePath = path.replace(/^\./, "");
              htmlModified = true;
              console.log(`[ensure-base-url] \u4FEE\u590D\u76F8\u5BF9\u8DEF\u5F84: ${path} -> ${absolutePath}`);
              return `${attr}="${absolutePath}${query}"`;
            });
          }
          const rootJsRegex = /(href|src)=["'](\/([^/]+\.(js|mjs)))(\?[^"']*)?["']/g;
          if (rootJsRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootJsRegex);
            if (matches) {
              console.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E\uFF08base, assetsDir, rollupOptions.output.chunkFileNames\uFF09:`, matches);
              htmlContent = htmlContent.replace(rootJsRegex, (_match, attr, path, fileName2, _ext, query = "") => {
                if (!path.startsWith("/assets/") && !path.startsWith("/favicon") && !path.startsWith("/logo") && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  console.log(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          const rootCssRegex = /(href|src)=["'](\/([^/]+\.css))(\?[^"']*)?["']/g;
          if (rootCssRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootCssRegex);
            if (matches) {
              console.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E:`, matches);
              htmlContent = htmlContent.replace(rootCssRegex, (_match, attr, path, fileName2, query = "") => {
                if (!path.startsWith("/assets/")) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  console.log(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          if (htmlModified) {
            chunk.source = htmlContent;
            console.log(`[ensure-base-url] \u4FEE\u590D\u4E86 index.html \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/cors.ts
function corsPlugin() {
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
}

// ../../configs/vite/plugins/css.ts
function ensureCssPlugin() {
  return {
    name: "ensure-css-plugin",
    generateBundle(_options, bundle) {
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
          const hasStyleTagWithContent = styleTagMatch && !styleTagMatch[0].includes("'") && !styleTagMatch[0].includes('"') && /\{[^}]{20,}\}/.test(code);
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
      }
    },
    writeBundle(_options, bundle) {
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
}

// ../../configs/vite/plugins/version.ts
import { existsSync as existsSync3, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { resolve as resolve4, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/version.ts";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname2 = dirname2(__filename2);
function getBuildTimestamp2() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolve4(__dirname2, "../../../.build-timestamp");
  if (existsSync3(timestampFile)) {
    try {
      const timestamp2 = readFileSync2(timestampFile, "utf-8").trim();
      if (timestamp2) {
        return timestamp2;
      }
    } catch (error) {
    }
  }
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync2(timestampFile, timestamp, "utf-8");
  } catch (error) {
  }
  return timestamp;
}
function addVersionPlugin() {
  const buildTimestamp = getBuildTimestamp2();
  return {
    // @ts-ignore - Vite Plugin 类型定义可能不完整，name 属性是标准属性
    name: "add-version",
    apply: "build",
    buildStart() {
      console.log(`[add-version] \u6784\u5EFA\u65F6\u95F4\u6233\u7248\u672C\u53F7: ${buildTimestamp}`);
    },
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset" && fileName === "index.html") {
          let htmlContent = chunk.source;
          let modified = false;
          const scriptRegex = /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g;
          htmlContent = htmlContent.replace(scriptRegex, (match, prefix, src, suffix) => {
            if (src.includes("?v=") || src.includes("&v=")) {
              const updatedSrc = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updatedSrc !== src) {
                modified = true;
                return `${prefix}${updatedSrc}${suffix}`;
              }
              return match;
            }
            if (src.startsWith("/assets/") || src.startsWith("./assets/")) {
              modified = true;
              const separator = src.includes("?") ? "&" : "?";
              return `${prefix}${src}${separator}v=${buildTimestamp}${suffix}`;
            }
            return match;
          });
          const linkRegex = /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g;
          htmlContent = htmlContent.replace(linkRegex, (match, prefix, href, suffix) => {
            if (href.includes("?v=") || href.includes("&v=")) {
              const updatedHref = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updatedHref !== href) {
                modified = true;
                return `${prefix}${updatedHref}${suffix}`;
              }
              return match;
            }
            if (href.startsWith("/assets/") || href.startsWith("./assets/")) {
              modified = true;
              const separator = href.includes("?") ? "&" : "?";
              return `${prefix}${href}${separator}v=${buildTimestamp}${suffix}`;
            }
            return match;
          });
          if (modified) {
            chunk.source = htmlContent;
            console.log(`[add-version] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u6DFB\u52A0\u7248\u672C\u53F7: v=${buildTimestamp}`);
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/resolve-logo.ts
import { resolve as resolve5, dirname as dirname3 } from "path";
import { existsSync as existsSync4, copyFileSync, mkdirSync } from "node:fs";
function resolveLogoPlugin(appDir) {
  let viteConfig = null;
  return {
    name: "resolve-logo",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      viteConfig = config;
    },
    resolveId(id) {
      if (id === "/logo.png" || id === "logo.png") {
        const sharedLogoPath = resolve5(appDir, "../../packages/shared-components/public/logo.png");
        if (existsSync4(sharedLogoPath)) {
          return sharedLogoPath;
        }
        const appLogoPath = resolve5(appDir, "public/logo.png");
        if (existsSync4(appLogoPath)) {
          return appLogoPath;
        }
        return `\0logo.png`;
      }
      return null;
    },
    load(id) {
      if (id === "\0logo.png") {
        return "";
      }
      return null;
    },
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }
        const root = viteConfig.root || appDir;
        const sharedLogoPath = resolve5(root, "../../packages/shared-components/public/logo.png");
        let logoSourcePath = null;
        if (existsSync4(sharedLogoPath)) {
          logoSourcePath = sharedLogoPath;
        } else {
          const appLogoPath = resolve5(root, "public/logo.png");
          if (existsSync4(appLogoPath)) {
            logoSourcePath = appLogoPath;
          }
        }
        if (!logoSourcePath) {
          return;
        }
        const outDir = viteConfig.build.outDir || "dist";
        const distDir = resolve5(root, outDir);
        if (!existsSync4(distDir)) {
          return;
        }
        const logoDestPath = resolve5(distDir, "logo.png");
        const destDir = dirname3(logoDestPath);
        if (!existsSync4(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(logoSourcePath, logoDestPath);
      } catch (error) {
      }
    }
  };
}

// ../../configs/vite/factories/subapp.config.ts
function getVueI18nPlugin(appDir) {
  const appDirUrl = pathToFileURL(resolve6(appDir, "package.json")).href;
  const require2 = createRequire(appDirUrl);
  const plugin = require2("@intlify/unplugin-vue-i18n/vite");
  return plugin.default || plugin;
}
function createSubAppViteConfig(options) {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy2 = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot, withPackages } = createPathHelpers(appDir);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir) : false;
  const mainAppConfig = getViteAppConfig("system-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const epsOutputDir = resolve6(appDir, "build", "eps");
  const plugins = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir),
    // 4. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync5,
          readFile: (file) => readFileSync3(file, "utf-8")
        }
      }
    }),
    // 5. 自动导入插件
    createAutoImportConfig(),
    // 6. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 7. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 8. BTC 业务插件
    btc({
      type: "subapp",
      proxy: proxy2,
      eps: {
        enable: true,
        dict: false,
        dist: epsOutputDir,
        ...btcOptions.eps
      },
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir)({
      include: vueI18nOptions?.include || [
        resolve6(appDir, "src/locales/**"),
        resolve6(appDir, "src/{modules,plugins}/**/locales/**"),
        resolve6(appDir, "../../packages/shared-components/src/locales/**"),
        resolve6(appDir, "../../packages/shared-components/src/plugins/**/locales/**"),
        resolve6(appDir, "../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts"),
        resolve6(appDir, "../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 强制生成新 hash 插件
    forceNewHashPlugin(),
    // 13. 修复动态导入 hash 插件
    fixDynamicImportHashPlugin(),
    // 14. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 17. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 18. Chunk 验证插件
    chunkVerifyPlugin()
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        reduce_vars: false,
        reduce_funcs: false,
        passes: 1,
        collapse_vars: false,
        dead_code: false
        // 关键：禁用所有可能影响导出名称的压缩选项
        // 确保导出名称不被压缩成单字母
        // 注意：keep_fnames 和 keep_classnames 应该在 mangle 选项中，但这里也设置以确保兼容性
      },
      // 关键：对于 ES 模块，完全禁用 mangle 以避免导出名称被混淆
      // 这可以防止 "does not provide an export named 'c'" 错误
      // 虽然这会增加一些文件大小，但可以确保动态导入正常工作
      // 注意：即使设置 mangle: { keep_fnames: true } 仍然可能混淆导出名称
      // 因此完全禁用 mangle 是最安全的选择
      mangle: false,
      format: {
        comments: false,
        // 确保导出名称格式正确
        preserve_annotations: false
      }
    },
    assetsInlineLimit: 10 * 1024,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: createRollupConfig(appName.replace("-app", "")),
    chunkSizeWarningLimit: 1e3,
    ...customBuild
  };
  const serverConfig = {
    port: appConfig.devPort,
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
      host: appConfig.devHost,
      port: appConfig.devPort,
      overlay: false
    },
    proxy: proxy2,
    fs: {
      strict: false,
      allow: [
        withRoot("."),
        withPackages("."),
        withPackages("shared-components/src")
      ],
      cachedChecks: true
    },
    ...customServer
  };
  const previewConfig = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: "0.0.0.0",
    proxy: proxy2,
    headers: {
      "Access-Control-Allow-Origin": appConfig.mainAppOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  const optimizeDepsConfig = {
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
    exclude: [],
    force: false,
    esbuildOptions: {
      plugins: []
    },
    ...customOptimizeDeps
  };
  const cssConfig = {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"],
        includePaths: [
          withPackages("shared-components/src/styles")
        ]
      }
    },
    devSourcemap: false,
    ...customCss
  };
  return {
    base: baseUrl,
    publicDir,
    resolve: createBaseResolve(appDir, appName),
    plugins,
    esbuild: {
      charset: "utf8"
    },
    server: serverConfig,
    preview: previewConfig,
    optimizeDeps: optimizeDepsConfig,
    css: cssConfig,
    build: buildConfig
  };
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
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/quality-app/vite.config.ts";
var vite_config_default = defineConfig(
  createSubAppViteConfig({
    appName: "quality-app",
    appDir: fileURLToPath3(new URL(".", __vite_injected_original_import_meta_url3)),
    qiankunName: "quality",
    customServer: { proxy },
    proxy
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hcHAtZW52LmNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvYmFzZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2J1aWxkL21hbnVhbC1jaHVua3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2J1aWxkL3JvbGx1cC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2xlYW4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvaGFzaC50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWxvZ28udHMiLCAiLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxccXVhbGl0eS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxxdWFsaXR5LWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL3F1YWxpdHktYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBwcm94eSBhcyBtYWluUHJveHkgfSBmcm9tICcuLi9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhcbiAgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyh7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBhcHBEaXI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIHFpYW5rdW5OYW1lOiAncXVhbGl0eScsXG4gICAgY3VzdG9tU2VydmVyOiB7IHByb3h5OiBtYWluUHJveHkgfSxcbiAgICBwcm94eTogbWFpblByb3h5LFxuICB9KVxuKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcZmFjdG9yaWVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcXFxcc3ViYXBwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvZmFjdG9yaWVzL3N1YmFwcC5jb25maWcudHNcIjsvKipcclxuICogXHU1QjUwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXHJcbiAqIFx1NzUxRlx1NjIxMFx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NFx1NUI4Q1x1NjU3NCBWaXRlIFx1OTE0RFx1N0Y2RVxyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnO1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XHJcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nO1xyXG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XHJcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvcGF0aC1oZWxwZXJzJztcclxuXHJcbi8vIFx1NUVGNlx1OEZERlx1NTJBMFx1OEY3RCBWdWVJMThuUGx1Z2luXHVGRjBDXHU0RUNFXHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XHU4OUUzXHU2NzkwXHJcbi8vIFx1NEY3Rlx1NzUyOFx1NTFGRFx1NjU3MFx1NTE4NVx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1Nzg2RVx1NEZERFx1NEVDRVx1OEMwM1x1NzUyOFx1ODAwNVx1NzY4NCBub2RlX21vZHVsZXMgXHU4OUUzXHU2NzkwXHJcbmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICdub2RlOnVybCc7XHJcbmZ1bmN0aW9uIGdldFZ1ZUkxOG5QbHVnaW4oYXBwRGlyOiBzdHJpbmcpIHtcclxuICAvLyBcdTRGN0ZcdTc1MjggY3JlYXRlUmVxdWlyZSBcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTg5RTNcdTY3OTBcdTUzMDVcclxuICAvLyBcdTkwMUFcdThGQzcgZmlsZTovLyBVUkwgXHU1MjFCXHU1RUZBXHU2QjYzXHU3ODZFXHU3Njg0IHJlcXVpcmUgXHU0RTBBXHU0RTBCXHU2NTg3XHJcbiAgY29uc3QgYXBwRGlyVXJsID0gcGF0aFRvRmlsZVVSTChyZXNvbHZlKGFwcERpciwgJ3BhY2thZ2UuanNvbicpKS5ocmVmO1xyXG4gIGNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGFwcERpclVybCk7XHJcbiAgY29uc3QgcGx1Z2luID0gcmVxdWlyZSgnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZScpO1xyXG4gIHJldHVybiBwbHVnaW4uZGVmYXVsdCB8fCBwbHVnaW47XHJcbn1cclxuaW1wb3J0IHsgY3JlYXRlQXV0b0ltcG9ydENvbmZpZywgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyB9IGZyb20gJy4uLy4uL2F1dG8taW1wb3J0LmNvbmZpZyc7XHJcbmltcG9ydCB7IGJ0YywgZml4Q2h1bmtSZWZlcmVuY2VzUGx1Z2luIH0gZnJvbSAnQGJ0Yy92aXRlLXBsdWdpbic7XHJcbmltcG9ydCB7IGdldFZpdGVBcHBDb25maWcsIGdldEJhc2VVcmwsIGdldFB1YmxpY0RpciB9IGZyb20gJy4uLy4uL3ZpdGUtYXBwLWNvbmZpZyc7XHJcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xyXG5pbXBvcnQgeyBjcmVhdGVSb2xsdXBDb25maWcgfSBmcm9tICcuLi9idWlsZC9yb2xsdXAuY29uZmlnJztcclxuaW1wb3J0IHtcclxuICBjbGVhbkRpc3RQbHVnaW4sXHJcbiAgY2h1bmtWZXJpZnlQbHVnaW4sXHJcbiAgb3B0aW1pemVDaHVua3NQbHVnaW4sXHJcbiAgZm9yY2VOZXdIYXNoUGx1Z2luLFxyXG4gIGZpeER5bmFtaWNJbXBvcnRIYXNoUGx1Z2luLFxyXG4gIGVuc3VyZUJhc2VVcmxQbHVnaW4sXHJcbiAgY29yc1BsdWdpbixcclxuICBlbnN1cmVDc3NQbHVnaW4sXHJcbiAgYWRkVmVyc2lvblBsdWdpbixcclxuICByZXNvbHZlTG9nb1BsdWdpbixcclxufSBmcm9tICcuLi9wbHVnaW5zJztcclxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3ViQXBwVml0ZUNvbmZpZ09wdGlvbnMge1xyXG4gIC8qKlxyXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxyXG4gICAqL1xyXG4gIGFwcE5hbWU6IHN0cmluZztcclxuICAvKipcclxuICAgKiBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICAgKi9cclxuICBhcHBEaXI6IHN0cmluZztcclxuICAvKipcclxuICAgKiBRaWFua3VuIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4nXHVGRjA5XHJcbiAgICovXHJcbiAgcWlhbmt1bk5hbWU6IHN0cmluZztcclxuICAvKipcclxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjhcclxuICAgKi9cclxuICBjdXN0b21QbHVnaW5zPzogUGx1Z2luW107XHJcbiAgLyoqXHJcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgY3VzdG9tQnVpbGQ/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ2J1aWxkJ10+O1xyXG4gIC8qKlxyXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxyXG4gICAqL1xyXG4gIGN1c3RvbVNlcnZlcj86IFBhcnRpYWw8VXNlckNvbmZpZ1snc2VydmVyJ10+O1xyXG4gIC8qKlxyXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxyXG4gICAqL1xyXG4gIGN1c3RvbVByZXZpZXc/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3ByZXZpZXcnXT47XHJcbiAgLyoqXHJcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RjE4XHU1MzE2XHU0RjlEXHU4RDU2XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgY3VzdG9tT3B0aW1pemVEZXBzPzogUGFydGlhbDxVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXT47XHJcbiAgLyoqXHJcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcclxuICAgKi9cclxuICBjdXN0b21Dc3M/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ2NzcyddPjtcclxuICAvKipcclxuICAgKiBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcclxuICAgKi9cclxuICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XHJcbiAgLyoqXHJcbiAgICogQlRDIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxyXG4gICAqL1xyXG4gIGJ0Y09wdGlvbnM/OiB7XHJcbiAgICB0eXBlPzogJ3N1YmFwcCc7XHJcbiAgICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XHJcbiAgICBlcHM/OiB7XHJcbiAgICAgIGVuYWJsZT86IGJvb2xlYW47XHJcbiAgICAgIGRpY3Q/OiBib29sZWFuO1xyXG4gICAgICBkaXN0Pzogc3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHN2Zz86IHtcclxuICAgICAgc2tpcE5hbWVzPzogc3RyaW5nW107XHJcbiAgICB9O1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogVnVlSTE4biBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcclxuICAgKi9cclxuICB2dWVJMThuT3B0aW9ucz86IHtcclxuICAgIGluY2x1ZGU/OiBzdHJpbmdbXTtcclxuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFFpYW5rdW4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgcWlhbmt1bk9wdGlvbnM/OiB7XHJcbiAgICB1c2VEZXZNb2RlPzogYm9vbGVhbjtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBXHU1QjUwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyhvcHRpb25zOiBTdWJBcHBWaXRlQ29uZmlnT3B0aW9ucyk6IFVzZXJDb25maWcge1xyXG4gIGNvbnN0IHtcclxuICAgIGFwcE5hbWUsXHJcbiAgICBhcHBEaXIsXHJcbiAgICBxaWFua3VuTmFtZSxcclxuICAgIGN1c3RvbVBsdWdpbnMgPSBbXSxcclxuICAgIGN1c3RvbUJ1aWxkLFxyXG4gICAgY3VzdG9tU2VydmVyLFxyXG4gICAgY3VzdG9tUHJldmlldyxcclxuICAgIGN1c3RvbU9wdGltaXplRGVwcyxcclxuICAgIGN1c3RvbUNzcyxcclxuICAgIHByb3h5ID0ge30sXHJcbiAgICBidGNPcHRpb25zID0ge30sXHJcbiAgICB2dWVJMThuT3B0aW9ucyxcclxuICAgIHFpYW5rdW5PcHRpb25zID0geyB1c2VEZXZNb2RlOiB0cnVlIH0sXHJcbiAgfSA9IG9wdGlvbnM7XHJcblxyXG4gIC8vIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxyXG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoYXBwTmFtZSk7XHJcbiAgLy8gXHU0RjdGXHU3NTI4XHU1QkZDXHU1MTY1XHU3Njg0IGNyZWF0ZVBhdGhIZWxwZXJzXHJcbiAgY29uc3QgeyB3aXRoUm9vdCwgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xyXG5cclxuICAvLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcclxuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xyXG4gIGNvbnN0IGJhc2VVcmwgPSBnZXRCYXNlVXJsKGFwcE5hbWUsIGlzUHJldmlld0J1aWxkKTtcclxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTc5ODFcdTc1MjggcHVibGljRGlyXHVGRjBDXHU5MDdGXHU1MTREXHU2MjUzXHU1MzA1XHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHJcbiAgLy8gXHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1RTk0XHU4QkU1XHU3NTMxIGxheW91dC1hcHAgXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XHJcbiAgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RUNEXHU3MTM2XHU5NzAwXHU4OTgxIHB1YmxpY0RpciBcdTY3NjVcdTY3MERcdTUyQTFcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcclxuICBjb25zdCBwdWJsaWNEaXIgPSBpc1ByZXZpZXdCdWlsZCA/IGdldFB1YmxpY0RpcihhcHBOYW1lLCBhcHBEaXIpIDogZmFsc2U7XHJcblxyXG4gIC8vIFx1ODNCN1x1NTNENlx1NEUzQlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxyXG4gIGNvbnN0IG1haW5BcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XHJcbiAgY29uc3QgbWFpbkFwcFBvcnQgPSBtYWluQXBwQ29uZmlnLnByZVBvcnQudG9TdHJpbmcoKTtcclxuXHJcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBRVBTIFx1NzY4NCBvdXRwdXREaXIgXHU1RkM1XHU5ODdCXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1N0ZBXHU0RThFIGFwcERpciBcdTg5RTNcdTY3OTBcclxuICAvLyBcdTkwN0ZcdTUxNERcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTU2RTBcdTRFM0FcdTVERTVcdTRGNUNcdTc2RUVcdTVGNTVcdTUzRDhcdTUzMTZcdTgwMENcdTU3MjggZGlzdCBcdTc2RUVcdTVGNTVcdTRFMEJcdTUyMUJcdTVFRkEgYnVpbGQgXHU3NkVFXHU1RjU1XHJcbiAgY29uc3QgZXBzT3V0cHV0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdidWlsZCcsICdlcHMnKTtcclxuXHJcbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XHJcbiAgY29uc3QgcGx1Z2luczogUGx1Z2luW10gPSBbXHJcbiAgICAvLyAxLiBcdTZFMDVcdTc0MDZcdTYzRDJcdTRFRjZcclxuICAgIGNsZWFuRGlzdFBsdWdpbihhcHBEaXIpLFxyXG4gICAgLy8gMi4gQ09SUyBcdTYzRDJcdTRFRjZcclxuICAgIGNvcnNQbHVnaW4oKSxcclxuICAgIC8vIDMuIExvZ28gXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU3ODZFXHU0RkREIC9sb2dvLnBuZyBcdTgwRkRcdTg4QUJcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcdUZGMDlcclxuICAgIHJlc29sdmVMb2dvUGx1Z2luKGFwcERpciksXHJcbiAgICAvLyA0LiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTY4MzhcdTVGQzNcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdUZGMDlcclxuICAgIC4uLmN1c3RvbVBsdWdpbnMsXHJcbiAgICAvLyA0LiBWdWUgXHU2M0QyXHU0RUY2XHJcbiAgICB2dWUoe1xyXG4gICAgICBzY3JpcHQ6IHtcclxuICAgICAgICBmczoge1xyXG4gICAgICAgICAgZmlsZUV4aXN0czogZXhpc3RzU3luYyxcclxuICAgICAgICAgIHJlYWRGaWxlOiAoZmlsZTogc3RyaW5nKSA9PiByZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JyksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgLy8gNS4gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XHJcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXHJcbiAgICAvLyA2LiBcdTdFQzRcdTRFRjZcdTgxRUFcdTUyQThcdTZDRThcdTUxOENcdTYzRDJcdTRFRjZcclxuICAgIGNyZWF0ZUNvbXBvbmVudHNDb25maWcoeyBpbmNsdWRlU2hhcmVkOiB0cnVlIH0pLFxyXG4gICAgLy8gNy4gVW5vQ1NTIFx1NjNEMlx1NEVGNlxyXG4gICAgVW5vQ1NTKHtcclxuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcclxuICAgIH0pLFxyXG4gICAgLy8gOC4gQlRDIFx1NEUxQVx1NTJBMVx1NjNEMlx1NEVGNlxyXG4gICAgYnRjKHtcclxuICAgICAgdHlwZTogJ3N1YmFwcCcgYXMgYW55LFxyXG4gICAgICBwcm94eSxcclxuICAgICAgZXBzOiB7XHJcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgIGRpY3Q6IGZhbHNlLFxyXG4gICAgICAgIGRpc3Q6IGVwc091dHB1dERpcixcclxuICAgICAgICAuLi5idGNPcHRpb25zLmVwcyxcclxuICAgICAgfSxcclxuICAgICAgc3ZnOiB7XHJcbiAgICAgICAgc2tpcE5hbWVzOiBbJ2Jhc2UnLCAnaWNvbnMnXSxcclxuICAgICAgICAuLi5idGNPcHRpb25zLnN2ZyxcclxuICAgICAgfSxcclxuICAgICAgLi4uYnRjT3B0aW9ucyxcclxuICAgIH0pLFxyXG4gICAgLy8gOS4gVnVlSTE4biBcdTYzRDJcdTRFRjZcclxuICAgIGdldFZ1ZUkxOG5QbHVnaW4oYXBwRGlyKSh7XHJcbiAgICAgIGluY2x1ZGU6IHZ1ZUkxOG5PcHRpb25zPy5pbmNsdWRlIHx8IFtcclxuICAgICAgICByZXNvbHZlKGFwcERpciwgJ3NyYy9sb2NhbGVzLyoqJyksXHJcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMve21vZHVsZXMscGx1Z2luc30vKiovbG9jYWxlcy8qKicpLFxyXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvKionKSxcclxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zLyoqL2xvY2FsZXMvKionKSxcclxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvemgtQ04udHMnKSxcclxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMudHMnKSxcclxuICAgICAgXSxcclxuICAgICAgcnVudGltZU9ubHk6IHZ1ZUkxOG5PcHRpb25zPy5ydW50aW1lT25seSA/PyB0cnVlLFxyXG4gICAgfSksXHJcbiAgICAvLyAxMC4gQ1NTIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxyXG4gICAgZW5zdXJlQ3NzUGx1Z2luKCksXHJcbiAgICAvLyAxMS4gUWlhbmt1biBcdTYzRDJcdTRFRjZcclxuICAgIHFpYW5rdW4ocWlhbmt1bk5hbWUsIHFpYW5rdW5PcHRpb25zKSxcclxuICAgIC8vIDEyLiBcdTVGM0FcdTUyMzZcdTc1MUZcdTYyMTBcdTY1QjAgaGFzaCBcdTYzRDJcdTRFRjZcclxuICAgIGZvcmNlTmV3SGFzaFBsdWdpbigpLFxyXG4gICAgLy8gMTMuIFx1NEZFRVx1NTkwRFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NSBoYXNoIFx1NjNEMlx1NEVGNlxyXG4gICAgZml4RHluYW1pY0ltcG9ydEhhc2hQbHVnaW4oKSxcclxuICAgIC8vIDE0LiBcdTRGRUVcdTU5MEQgY2h1bmsgXHU1RjE1XHU3NTI4XHU2M0QyXHU0RUY2XHJcbiAgICBmaXhDaHVua1JlZmVyZW5jZXNQbHVnaW4oKSxcclxuICAgIC8vIDE1LiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XHJcbiAgICBlbnN1cmVCYXNlVXJsUGx1Z2luKGJhc2VVcmwsIGFwcENvbmZpZy5kZXZIb3N0LCBhcHBDb25maWcucHJlUG9ydCwgbWFpbkFwcFBvcnQpLFxyXG4gICAgLy8gMTYuIFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlx1RkYwOFx1NEUzQSBIVE1MIFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOVxyXG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxyXG4gICAgLy8gMTcuIFx1NEYxOFx1NTMxNiBjaHVua3MgXHU2M0QyXHU0RUY2XHJcbiAgICBvcHRpbWl6ZUNodW5rc1BsdWdpbigpLFxyXG4gICAgLy8gMTguIENodW5rIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxyXG4gICAgY2h1bmtWZXJpZnlQbHVnaW4oKSxcclxuICBdO1xyXG5cclxuICAvLyBcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcclxuICBjb25zdCBidWlsZENvbmZpZzogVXNlckNvbmZpZ1snYnVpbGQnXSA9IHtcclxuICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcclxuICAgIGNzc01pbmlmeTogdHJ1ZSxcclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgICAgcmVkdWNlX3ZhcnM6IGZhbHNlLFxyXG4gICAgICAgIHJlZHVjZV9mdW5jczogZmFsc2UsXHJcbiAgICAgICAgcGFzc2VzOiAxLFxyXG4gICAgICAgIGNvbGxhcHNlX3ZhcnM6IGZhbHNlLFxyXG4gICAgICAgIGRlYWRfY29kZTogZmFsc2UsXHJcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU2MjQwXHU2NzA5XHU1M0VGXHU4MEZEXHU1RjcxXHU1NENEXHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHU3Njg0XHU1MzhCXHU3RjI5XHU5MDA5XHU5ODc5XHJcbiAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHU0RTBEXHU4OEFCXHU1MzhCXHU3RjI5XHU2MjEwXHU1MzU1XHU1QjU3XHU2QkNEXHJcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBa2VlcF9mbmFtZXMgXHU1NDhDIGtlZXBfY2xhc3NuYW1lcyBcdTVFOTRcdThCRTVcdTU3MjggbWFuZ2xlIFx1OTAwOVx1OTg3OVx1NEUyRFx1RkYwQ1x1NEY0Nlx1OEZEOVx1OTFDQ1x1NEU1Rlx1OEJCRVx1N0Y2RVx1NEVFNVx1Nzg2RVx1NEZERFx1NTE3Q1x1NUJCOVx1NjAyN1xyXG4gICAgICB9LFxyXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVCRjlcdTRFOEUgRVMgXHU2QTIxXHU1NzU3XHVGRjBDXHU1QjhDXHU1MTY4XHU3OTgxXHU3NTI4IG1hbmdsZSBcdTRFRTVcdTkwN0ZcdTUxNERcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdTg4QUJcdTZERjdcdTZEQzZcclxuICAgICAgLy8gXHU4RkQ5XHU1M0VGXHU0RUU1XHU5NjMyXHU2QjYyIFwiZG9lcyBub3QgcHJvdmlkZSBhbiBleHBvcnQgbmFtZWQgJ2MnXCIgXHU5NTE5XHU4QkVGXHJcbiAgICAgIC8vIFx1ODY3RFx1NzEzNlx1OEZEOVx1NEYxQVx1NTg5RVx1NTJBMFx1NEUwMFx1NEU5Qlx1NjU4N1x1NEVGNlx1NTkyN1x1NUMwRlx1RkYwQ1x1NEY0Nlx1NTNFRlx1NEVFNVx1Nzg2RVx1NEZERFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NkI2M1x1NUUzOFx1NURFNVx1NEY1Q1xyXG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTUzNzNcdTRGN0ZcdThCQkVcdTdGNkUgbWFuZ2xlOiB7IGtlZXBfZm5hbWVzOiB0cnVlIH0gXHU0RUNEXHU3MTM2XHU1M0VGXHU4MEZEXHU2REY3XHU2REM2XHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHJcbiAgICAgIC8vIFx1NTZFMFx1NkI2NFx1NUI4Q1x1NTE2OFx1Nzk4MVx1NzUyOCBtYW5nbGUgXHU2NjJGXHU2NzAwXHU1Qjg5XHU1MTY4XHU3Njg0XHU5MDA5XHU2MkU5XHJcbiAgICAgIG1hbmdsZTogZmFsc2UsXHJcbiAgICAgIGZvcm1hdDoge1xyXG4gICAgICAgIGNvbW1lbnRzOiBmYWxzZSxcclxuICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdTY4M0NcdTVGMEZcdTZCNjNcdTc4NkVcclxuICAgICAgICBwcmVzZXJ2ZV9hbm5vdGF0aW9uczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDEwICogMTAyNCxcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczogY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWUucmVwbGFjZSgnLWFwcCcsICcnKSksXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAuLi5jdXN0b21CdWlsZCxcclxuICB9O1xyXG5cclxuICAvLyBcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcclxuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xyXG4gICAgcG9ydDogYXBwQ29uZmlnLmRldlBvcnQsXHJcbiAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICAgIGNvcnM6IHRydWUsXHJcbiAgICBvcmlnaW46IGBodHRwOi8vJHthcHBDb25maWcuZGV2SG9zdH06JHthcHBDb25maWcuZGV2UG9ydH1gLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycsXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXHJcbiAgICB9LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIGhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxyXG4gICAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcclxuICAgICAgb3ZlcmxheTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgcHJveHksXHJcbiAgICBmczoge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlLFxyXG4gICAgICBhbGxvdzogW1xyXG4gICAgICAgIHdpdGhSb290KCcuJyksXHJcbiAgICAgICAgd2l0aFBhY2thZ2VzKCcuJyksXHJcbiAgICAgICAgd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcclxuICAgICAgXSxcclxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIC4uLmN1c3RvbVNlcnZlcixcclxuICB9O1xyXG5cclxuICAvLyBcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcclxuICBjb25zdCBwcmV2aWV3Q29uZmlnOiBVc2VyQ29uZmlnWydwcmV2aWV3J10gPSB7XHJcbiAgICBwb3J0OiBhcHBDb25maWcucHJlUG9ydCxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBvcGVuOiBmYWxzZSxcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHByb3h5LFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogYXBwQ29uZmlnLm1haW5BcHBPcmlnaW4sXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgfSxcclxuICAgIC4uLmN1c3RvbVByZXZpZXcsXHJcbiAgfTtcclxuXHJcbiAgLy8gXHU0RjE4XHU1MzE2XHU0RjlEXHU4RDU2XHU5MTREXHU3RjZFXHJcbiAgY29uc3Qgb3B0aW1pemVEZXBzQ29uZmlnOiBVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXSA9IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3Z1ZScsXHJcbiAgICAgICd2dWUtcm91dGVyJyxcclxuICAgICAgJ3BpbmlhJyxcclxuICAgICAgJ2RheWpzJyxcclxuICAgICAgJ2VsZW1lbnQtcGx1cycsXHJcbiAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsXHJcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcclxuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxyXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxyXG4gICAgICAndml0ZS1wbHVnaW4tcWlhbmt1bi9kaXN0L2hlbHBlcicsXHJcbiAgICAgICdxaWFua3VuJyxcclxuICAgICAgJ3NpbmdsZS1zcGEnLFxyXG4gICAgXSxcclxuICAgIGV4Y2x1ZGU6IFtdLFxyXG4gICAgZm9yY2U6IGZhbHNlLFxyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgcGx1Z2luczogW10sXHJcbiAgICB9LFxyXG4gICAgLi4uY3VzdG9tT3B0aW1pemVEZXBzLFxyXG4gIH07XHJcblxyXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcclxuICBjb25zdCBjc3NDb25maWc6IFVzZXJDb25maWdbJ2NzcyddID0ge1xyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J10sXHJcbiAgICAgICAgaW5jbHVkZVBhdGhzOiBbXHJcbiAgICAgICAgICB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMnKSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAuLi5jdXN0b21Dc3MsXHJcbiAgfTtcclxuXHJcbiAgLy8gXHU4RkQ0XHU1NkRFXHU1QjhDXHU2NTc0XHU5MTREXHU3RjZFXHJcbiAgcmV0dXJuIHtcclxuICAgIGJhc2U6IGJhc2VVcmwsXHJcbiAgICBwdWJsaWNEaXIsXHJcbiAgICByZXNvbHZlOiBjcmVhdGVCYXNlUmVzb2x2ZShhcHBEaXIsIGFwcE5hbWUpLFxyXG4gICAgcGx1Z2lucyxcclxuICAgIGVzYnVpbGQ6IHtcclxuICAgICAgY2hhcnNldDogJ3V0ZjgnLFxyXG4gICAgfSxcclxuICAgIHNlcnZlcjogc2VydmVyQ29uZmlnLFxyXG4gICAgcHJldmlldzogcHJldmlld0NvbmZpZyxcclxuICAgIG9wdGltaXplRGVwczogb3B0aW1pemVEZXBzQ29uZmlnLFxyXG4gICAgY3NzOiBjc3NDb25maWcsXHJcbiAgICBidWlsZDogYnVpbGRDb25maWcsXHJcbiAgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcXFxccGF0aC1oZWxwZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHNcIjsvKipcclxuICogXHU4REVGXHU1Rjg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHJcbiAqIFx1NjNEMFx1NEY5Qlx1N0VERlx1NEUwMFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1RkYwQ1x1NzUyOFx1NEU4RSBWaXRlIFx1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4Q1x1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuXHJcbi8qKlxyXG4gKiBcdTUyMUJcdTVFRkFcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcclxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICogQHJldHVybnMgXHU4REVGXHU1Rjg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyOiBzdHJpbmcpIHtcclxuICAvKipcclxuICAgKiBcdTg5RTNcdTY3OTBcdTVFOTRcdTc1Mjggc3JjIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxyXG4gICAqL1xyXG4gIGNvbnN0IHdpdGhTcmMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IHJlc29sdmUoYXBwRGlyLCByZWxhdGl2ZVBhdGgpO1xyXG5cclxuICAvKipcclxuICAgKiBcdTg5RTNcdTY3OTAgcGFja2FnZXMgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHJcbiAgICovXHJcbiAgY29uc3Qgd2l0aFBhY2thZ2VzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcclxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMnLCByZWxhdGl2ZVBhdGgpO1xyXG5cclxuICAvKipcclxuICAgKiBcdTg5RTNcdTY3OTBcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcclxuICAgKi9cclxuICBjb25zdCB3aXRoUm9vdCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXHJcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uJywgcmVsYXRpdmVQYXRoKTtcclxuXHJcbiAgLyoqXHJcbiAgICogXHU4OUUzXHU2NzkwIGNvbmZpZ3MgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHJcbiAgICovXHJcbiAgY29uc3Qgd2l0aENvbmZpZ3MgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxyXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9jb25maWdzJywgcmVsYXRpdmVQYXRoKTtcclxuXHJcbiAgcmV0dXJuIHsgd2l0aFNyYywgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjtcdUZFRkYvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4YWRtaW4tYXBwLCBsb2dpc3RpY3MtYXBwIFx1N0I0OVx1RkYwOVx1NEY3Rlx1NzUyOFxuICovXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIEF1dG8gSW1wb3J0IFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpIHtcbiAgcmV0dXJuIEF1dG9JbXBvcnQoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgIHtcbiAgICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnOiBbXG4gICAgICAgICAgJ3VzZUNydWQnLFxuICAgICAgICAgICd1c2VEaWN0JyxcbiAgICAgICAgICAndXNlUGVybWlzc2lvbicsXG4gICAgICAgICAgJ3VzZVJlcXVlc3QnLFxuICAgICAgICAgICdjcmVhdGVJMThuUGx1Z2luJyxcbiAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgIF0sXG4gICAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IFtcbiAgICAgICAgICAnZm9ybWF0RGF0ZScsXG4gICAgICAgICAgJ2Zvcm1hdERhdGVUaW1lJyxcbiAgICAgICAgICAnZm9ybWF0TW9uZXknLFxuICAgICAgICAgICdmb3JtYXROdW1iZXInLFxuICAgICAgICAgICdpc0VtYWlsJyxcbiAgICAgICAgICAnaXNQaG9uZScsXG4gICAgICAgICAgJ3N0b3JhZ2UnLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxuXG4gICAgZXNsaW50cmM6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgIH0sXG5cbiAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU5ODlEXHU1OTE2XHU3Njg0XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU3NTI4XHU0RThFXHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHVGRjA5XG4gICAqL1xuICBleHRyYURpcnM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgKi9cbiAgaW5jbHVkZVNoYXJlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENvbXBvbmVudHMgXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudHNDb25maWcob3B0aW9uczogQ29tcG9uZW50c0NvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGV4dHJhRGlycyA9IFtdLCBpbmNsdWRlU2hhcmVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBjb25zdCBkaXJzID0gW1xuICAgICdzcmMvY29tcG9uZW50cycsIC8vIFx1NUU5NFx1NzUyOFx1N0VBN1x1N0VDNFx1NEVGNlxuICAgIC4uLmV4dHJhRGlycywgLy8gXHU5ODlEXHU1OTE2XHU3Njg0XHU1N0RGXHU3RUE3XHU3RUM0XHU0RUY2XHU3NkVFXHU1RjU1XG4gIF07XG5cbiAgLy8gXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHVGRjBDXHU2REZCXHU1MkEwXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XG4gIGlmIChpbmNsdWRlU2hhcmVkKSB7XG4gICAgLy8gXHU2REZCXHU1MkEwXHU1MjA2XHU3RUM0XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XG4gICAgZGlycy5wdXNoKFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Jhc2ljJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9sYXlvdXQnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2Zvcm0nLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2RhdGEnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2ZlZWRiYWNrJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9vdGhlcnMnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBDb21wb25lbnRzKHtcbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RCBWaXRlIHJlbG9hZGluZ1xuICAgICAgfSksXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5RTNcdTY3OTBcdTU2NjhcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICAvLyBcdTVDMDYga2ViYWItY2FzZSBcdThGNkNcdTYzNjJcdTRFM0EgUGFzY2FsQ2FzZVxuICAgICAgICAvLyBcdTRGOEJcdTU5ODI6IGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgIGNvbnN0IGNvbnZlcnRUb1Bhc2NhbENhc2UgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdCdGMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7IC8vIFx1NURGMlx1N0VDRlx1NjYyRiBQYXNjYWxDYXNlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgICAgLy8gYnRjLXN2ZyAtPiBCdGNTdmdcbiAgICAgICAgICAgIHJldHVybiBuYW1lXG4gICAgICAgICAgICAgIC5zcGxpdCgnLScpXG4gICAgICAgICAgICAgIC5tYXAocGFydCA9PiBwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFydC5zbGljZSgxKSlcbiAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdCdGMnKSB8fCBjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2J0Yy0nKSkge1xuICAgICAgICAgIGNvbnN0IHBhc2NhbE5hbWUgPSBjb252ZXJ0VG9QYXNjYWxDYXNlKGNvbXBvbmVudE5hbWUpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwYXNjYWxOYW1lLFxuICAgICAgICAgICAgZnJvbTogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSxcbiAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICBkaXJzLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLCAvLyBcdTY1MkZcdTYzMDEgLnZ1ZSBcdTU0OEMgLnRzeCBcdTY1ODdcdTRFRjZcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTkxQ0RcdTY1QjBcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcbiAgICBkZWVwOiB0cnVlLFxuICAgIC8vIFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOSBCdGMgXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XG4gICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnRzeCQvLCAvQnRjW0EtWl0vLCAvYnRjLVthLXpdL10sXG4gIH0pO1xufVxuLy8gVVRGLTggZW5jb2RpbmcgZml4XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGUtYXBwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUtYXBwLWNvbmZpZy50c1wiOy8qKlxyXG4gKiBWaXRlIFx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxyXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcclxuICovXHJcblxyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGdldEFwcENvbmZpZyB9IGZyb20gJy4vYXBwLWVudi5jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1RkYwOFx1NzUyOFx1NEU4RSB2aXRlLmNvbmZpZy50c1x1RkYwOVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZpdGVBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKToge1xyXG4gIGRldlBvcnQ6IG51bWJlcjtcclxuICBkZXZIb3N0OiBzdHJpbmc7XHJcbiAgcHJlUG9ydDogbnVtYmVyO1xyXG4gIHByZUhvc3Q6IHN0cmluZztcclxuICBwcm9kSG9zdDogc3RyaW5nO1xyXG4gIG1haW5BcHBPcmlnaW46IHN0cmluZztcclxufSB7XHJcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xyXG4gIGlmICghYXBwQ29uZmlnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldEFwcENvbmZpZygnc3lzdGVtLWFwcCcpO1xyXG4gIGNvbnN0IG1haW5BcHBPcmlnaW4gPSBtYWluQXBwQ29uZmlnXHJcbiAgICA/IGBodHRwOi8vJHttYWluQXBwQ29uZmlnLnByZUhvc3R9OiR7bWFpbkFwcENvbmZpZy5wcmVQb3J0fWBcclxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxyXG4gICAgZGV2SG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXHJcbiAgICBwcmVQb3J0OiBwYXJzZUludChhcHBDb25maWcucHJlUG9ydCwgMTApLFxyXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXHJcbiAgICBwcm9kSG9zdDogYXBwQ29uZmlnLnByb2RIb3N0LFxyXG4gICAgbWFpbkFwcE9yaWdpbixcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU3QzdCXHU1NzhCXHJcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxyXG4gKiBAcmV0dXJucyBcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBUeXBlKGFwcE5hbWU6IHN0cmluZyk6ICdtYWluJyB8ICdzdWInIHwgJ2xheW91dCcgfCAnbW9iaWxlJyB7XHJcbiAgaWYgKGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykgcmV0dXJuICdtYWluJztcclxuICBpZiAoYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnKSByZXR1cm4gJ2xheW91dCc7XHJcbiAgaWYgKGFwcE5hbWUgPT09ICdtb2JpbGUtYXBwJykgcmV0dXJuICdtb2JpbGUnO1xyXG4gIHJldHVybiAnc3ViJzsgLy8gXHU1MTc2XHU0RUQ2XHU5MEZEXHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTgzQjdcdTUzRDYgYmFzZSBVUkxcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEBwYXJhbSBpc1ByZXZpZXdCdWlsZCBcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcclxuICogQHJldHVybnMgYmFzZSBVUkxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKGFwcE5hbWU6IHN0cmluZywgaXNQcmV2aWV3QnVpbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XHJcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xyXG4gIGlmICghYXBwQ29uZmlnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xyXG4gIH1cclxuICBcclxuICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcclxuICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcclxuICAgIHJldHVybiBgaHR0cDovLyR7YXBwQ29uZmlnLnByZUhvc3R9OiR7YXBwQ29uZmlnLnByZVBvcnR9L2A7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjgzOVx1NjM2RVx1NTdERlx1NTQwRFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOVxyXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzZGNFx1NjNBNVx1OTBFOFx1N0Y3Mlx1NTIzMFx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NTk4MiBwcm9kdWN0aW9uLmJlbGxpcy5jb20uY25cdUZGMDlcclxuICByZXR1cm4gJy8nO1xyXG59XHJcblxyXG4vKipcclxuICogXHU4M0I3XHU1M0Q2IHB1YmxpY0RpciBcdThERUZcdTVGODRcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAqIEByZXR1cm5zIHB1YmxpY0RpciBcdThERUZcdTVGODRcdTYyMTYgZmFsc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaWNEaXIoYXBwTmFtZTogc3RyaW5nLCBhcHBEaXI6IHN0cmluZyk6IHN0cmluZyB8IGZhbHNlIHtcclxuICAvLyBhZG1pbi1hcHBcdTMwMDFtb2JpbGUtYXBwIFx1NTQ4QyBzeXN0ZW0tYXBwIFx1NEY3Rlx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHJcbiAgaWYgKGFwcE5hbWUgPT09ICdhZG1pbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdtb2JpbGUtYXBwJyB8fCBhcHBOYW1lID09PSAnc3lzdGVtLWFwcCcpIHtcclxuICAgIHJldHVybiByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xyXG4gIH1cclxuICBcclxuICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTUxNzFcdTRFQUJcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxyXG4gIHJldHVybiByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYycpO1xyXG59XHJcblxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHNcIjsvKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODAnLFxuICAgIHByb2RIb3N0OiAnYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnYWRtaW4tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MScsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsb2dpc3RpY3MtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MicsXG4gICAgcHJvZEhvc3Q6ICdsb2dpc3RpY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncXVhbGl0eS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgzJyxcbiAgICBwcm9kSG9zdDogJ3F1YWxpdHkuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncHJvZHVjdGlvbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg0JyxcbiAgICBwcm9kSG9zdDogJ3Byb2R1Y3Rpb24uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZW5naW5lZXJpbmctYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgcHJvZEhvc3Q6ICdlbmdpbmVlcmluZy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdmaW5hbmNlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODYnLFxuICAgIHByb2RIb3N0OiAnZmluYW5jZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgcHJvZEhvc3Q6ICdtb2JpbGUuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZG9jcy1zaXRlLWFwcCcsXG4gICAgZGV2SG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgZGV2UG9ydDogJzQxNzInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTczJyxcbiAgICBwcm9kSG9zdDogJ2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbGF5b3V0LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4OCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTInLFxuICAgIHByb2RIb3N0OiAnbGF5b3V0LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ21vbml0b3ItYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg5JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OScsXG4gICAgcHJvZEhvc3Q6ICdtb25pdG9yLmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZyhhcHBOYW1lOiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLmFwcE5hbWUgPT09IGFwcE5hbWUpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NUYwMFx1NTNEMVx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsRGV2UG9ydHMoKTogc3RyaW5nW10ge1xuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTRGN0ZcdTc1MjggdHJ5LWNhdGNoIFx1NjM1NVx1ODNCN1x1NTNFRlx1ODBGRFx1NzY4NCBURFogKFRlbXBvcmFsIERlYWQgWm9uZSkgXHU5NTE5XHU4QkVGXG4gIC8vIFx1NTk4Mlx1Njc5QyBBUFBfRU5WX0NPTkZJR1MgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU3NTMxXHU0RThFXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU2MjE2XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2JlZm9yZSBpbml0aWFsaXphdGlvbicpKSB7XG4gICAgICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTRGN0ZcdTc1MjggdHJ5LWNhdGNoIFx1NjM1NVx1ODNCN1x1NTNFRlx1ODBGRFx1NzY4NCBURFogKFRlbXBvcmFsIERlYWQgWm9uZSkgXHU5NTE5XHU4QkVGXG4gIC8vIFx1NTk4Mlx1Njc5QyBBUFBfRU5WX0NPTkZJR1MgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU3NTMxXHU0RThFXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU2MjE2XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2JlZm9yZSBpbml0aWFsaXphdGlvbicpKSB7XG4gICAgICBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYmFzZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzXCI7LyoqXHJcbiAqIFx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xyXG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODRcdTUyMkJcdTU0MERcdTU0OEMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuL3V0aWxzL3BhdGgtaGVscGVycyc7XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHJcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxyXG4gKiBAcmV0dXJucyBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXI6IHN0cmluZywgX2FwcE5hbWU6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG4gIGNvbnN0IHsgd2l0aFNyYywgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAnQCc6IHdpdGhTcmMoJ3NyYycpLFxyXG4gICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcclxuICAgICdAc2VydmljZXMnOiB3aXRoU3JjKCdzcmMvc2VydmljZXMnKSxcclxuICAgICdAY29tcG9uZW50cyc6IHdpdGhTcmMoJ3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXHJcbiAgICAnQGF1dGgnOiB3aXRoUm9vdCgnYXV0aCcpLFxyXG4gICAgJ0Bjb25maWdzJzogd2l0aENvbmZpZ3MoJycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLWNvcmUnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtdXRpbHMvc3JjJyksXHJcbiAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJzogd2l0aFBhY2thZ2VzKCdzdWJhcHAtbWFuaWZlc3RzL3NyYy9pbmRleC50cycpLFxyXG4gICAgJ0BidGMtY29tbW9uJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXHJcbiAgICAnQGJ0Yy1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cycpLFxyXG4gICAgJ0BidGMtc3R5bGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXHJcbiAgICAnQGJ0Yy1sb2NhbGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcycpLFxyXG4gICAgJ0Bhc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSxcclxuICAgICdAYnRjLWFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxyXG4gICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxyXG4gICAgJ0BidGMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscycpLFxyXG4gICAgJ0BidGMtY3J1ZCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcclxuICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwOVxyXG4gICAgJ0BjaGFydHMtdXRpbHMvY3NzLXZhcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJyksXHJcbiAgICAnQGNoYXJ0cy11dGlscy9jb2xvcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvcicpLFxyXG4gICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcclxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyksXHJcbiAgICAnQGNoYXJ0cy10eXBlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcycpLFxyXG4gICAgJ0BjaGFydHMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcclxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXHJcbiAgICAvLyBFbGVtZW50IFBsdXMgXHU1MjJCXHU1NDBEXHJcbiAgICAnZWxlbWVudC1wbHVzL2VzJzogJ2VsZW1lbnQtcGx1cy9lcycsXHJcbiAgICAnZWxlbWVudC1wbHVzL2Rpc3QnOiAnZWxlbWVudC1wbHVzL2Rpc3QnLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDAgcmVzb2x2ZSBcdTkxNERcdTdGNkVcclxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEByZXR1cm5zIHJlc29sdmUgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZVJlc29sdmUoYXBwRGlyOiBzdHJpbmcsIGFwcE5hbWU6IHN0cmluZyk6IFVzZXJDb25maWdbJ3Jlc29sdmUnXSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFsaWFzOiBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXIsIGFwcE5hbWUpLFxyXG4gICAgZGVkdXBlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSddLFxyXG4gICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcubXRzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnZ1ZSddLFxyXG4gIH07XHJcbn1cclxuXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGJ1aWxkXFxcXG1hbnVhbC1jaHVua3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2J1aWxkL21hbnVhbC1jaHVua3MudHNcIjsvKipcclxuICogbWFudWFsQ2h1bmtzIFx1N0I1Nlx1NzU2NVx1OTE0RFx1N0Y2RVxyXG4gKiBcdTVCOUFcdTRFNDlcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTdCNTZcdTc1NjVcdUZGMENcdTVDMDZcdTRFMERcdTU0MENcdTdDN0JcdTU3OEJcdTc2ODRcdTRFRTNcdTc4MDFcdTYyNTNcdTUzMDVcdTUyMzBcdTRFMERcdTU0MENcdTc2ODQgY2h1bmtcclxuICovXHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTUxRkRcdTY1NzBcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU3NTI4XHU0RThFXHU4RkM3XHU2RUU0XHU3Mjc5XHU1QjlBXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjA5XHJcbiAqIEByZXR1cm5zIG1hbnVhbENodW5rcyBcdTUxRkRcdTY1NzBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgLy8gMC4gRVBTIFx1NjcwRFx1NTJBMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwOVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCd2aXJ0dWFsOmVwcycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ1xcXFwwdmlydHVhbDplcHMnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlc1xcXFxlcHMnKSkge1xyXG4gICAgICByZXR1cm4gJ2Vwcy1zZXJ2aWNlJztcclxuICAgIH1cclxuXHJcbiAgICAvLyAwLjMuIEF1dGggQVBJIFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NzUzMSBzeXN0ZW0tYXBwIFx1NjNEMFx1NEY5Qlx1RkYwOVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdtb2R1bGVzL2FwaS1zZXJ2aWNlcy9hdXRoJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbW9kdWxlc1xcXFxhcGktc2VydmljZXNcXFxcYXV0aCcpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ2FwaS1zZXJ2aWNlcy9hdXRoJykpIHtcclxuICAgICAgcmV0dXJuICdhdXRoLWFwaSc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbWVudVJlZ2lzdHJ5IFx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTVGQzVcdTk4N0JcdTU0OEMgdmVuZG9yIFx1NEUwMFx1OEQ3N1x1NjI1M1x1NTMwNVx1RkYwQ1x1NEUwRFx1ODBGRFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1NTIzMCBtZW51LXJlZ2lzdHJ5XHJcbiAgICAvLyBcdThGRDlcdTY4MzdcdTc4NkVcdTRGREQgVnVlIFx1NzY4NCByZWYgXHU1NzI4IG1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTVERjJcdTdFQ0ZcdTUyMURcdTU5Q0JcdTUzMTZcclxuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NjhDMFx1NjdFNSBsYXlvdXQtYnJpZGdlIFx1NEU0Qlx1NTI0RFx1NjhDMFx1NjdFNVx1RkYwQ1x1NTZFMFx1NEUzQSBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0b3JlL21lbnVSZWdpc3RyeScpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykpIHtcclxuICAgICAgLy8gXHU1QzA2IG1lbnVSZWdpc3RyeSBcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXHVGRjBDXHU3ODZFXHU0RkREIFZ1ZSBcdTRGOURcdThENTZcdTVERjJcdTUyQTBcdThGN0RcclxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyAwLjUuIFx1ODNEQ1x1NTM1NVx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVxyXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2XHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU3Njg0XHU0RUUzXHU3ODAxXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnkgY2h1bmtcdUZGMENcdTRGNDYgbWVudVJlZ2lzdHJ5IFx1NjcyQ1x1OEVBQlx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTk3MDBcdTg5ODFcdTY1M0VcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTQwRVxyXG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBbWVudVJlZ2lzdHJ5IFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IHJlZlx1RkYwQ1x1NjI0MFx1NEVFNVx1NEUwRFx1ODBGRFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwQ1x1NUU5NFx1OEJFNVx1NTQ4QyB2ZW5kb3IgXHU0RTAwXHU4RDc3XHJcbiAgICAvLyBcdTUzRUFcdTVDMDYgbWFuaWZlc3QgXHU2NTcwXHU2MzZFXHU1NDhDIGxheW91dC1icmlkZ2UgXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcclxuICAgIC8vIFx1NEY0NiBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTUgbGF5b3V0LWJyaWRnZSBcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXHJcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0Bjb25maWdzL2xheW91dC1icmlkZ2UnKSkge1xyXG4gICAgICAvLyBsYXlvdXQtYnJpZGdlIFx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTVcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXHJcbiAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gXHU1OTA0XHU3NDA2IHN1YmFwcC1tYW5pZmVzdHNcdUZGMUFcdTUzRUFcdTUzMDVcdTU0MkJcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc3ViYXBwLW1hbmlmZXN0cycpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnKSkge1xyXG4gICAgICAvLyBcdTYzOTJcdTk2NjRcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgSlNPTiBcdTY1ODdcdTRFRjZcclxuICAgICAgY29uc3Qgb3RoZXJBcHBzID0gWydmaW5hbmNlJywgJ2xvZ2lzdGljcycsICdzeXN0ZW0nLCAncXVhbGl0eScsICdlbmdpbmVlcmluZycsICdwcm9kdWN0aW9uJywgJ21vbml0b3InLCAnYWRtaW4nXTtcclxuICAgICAgY29uc3QgY3VycmVudEFwcE5hbWUgPSBhcHBOYW1lLnJlcGxhY2UoJy1hcHAnLCAnJyk7XHJcbiAgICAgIGNvbnN0IHNob3VsZEV4Y2x1ZGUgPSBvdGhlckFwcHNcclxuICAgICAgICAuZmlsdGVyKGFwcCA9PiBhcHAgIT09IGN1cnJlbnRBcHBOYW1lKVxyXG4gICAgICAgIC5zb21lKGFwcCA9PiBpZC5pbmNsdWRlcyhgbWFuaWZlc3RzLyR7YXBwfS5qc29uYCkpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHNob3VsZEV4Y2x1ZGUpIHtcclxuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcdUZGMENcdTRFMERcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgICAgLy8gXHU1M0VBXHU2MjUzXHU1MzA1XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0IFx1NTQ4Q1x1NTE3MVx1NEVBQlx1NEVFM1x1NzgwMVxyXG4gICAgICByZXR1cm4gJ21lbnUtcmVnaXN0cnknO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDEuIFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYxQUVDaGFydHNcdUZGMDhcdTdFQUYgZWNoYXJ0cyBcdTU0OEMgenJlbmRlclx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiB2dWUtZWNoYXJ0c1x1RkYwOVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWNoYXJ0cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96cmVuZGVyJykpIHtcclxuICAgICAgcmV0dXJuICdlY2hhcnRzLXZlbmRvcic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMi4gXHU1MTc2XHU0RUQ2XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA4XHU1QjhDXHU1MTY4XHU3MkVDXHU3QUNCXHVGRjA5XHJcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yJykpIHtcclxuICAgICAgcmV0dXJuICdsaWItbW9uYWNvJztcclxuICAgIH1cclxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3RocmVlJykpIHtcclxuICAgICAgcmV0dXJuICdsaWItdGhyZWUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDMuIFZ1ZSBcdTc1MUZcdTYwMDFcdTVFOTMgKyBcdTYyNDBcdTY3MDlcdTRGOURcdThENTYgVnVlIFx1NzY4NFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyArIFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXInKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3BpbmlhJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGVsZW1lbnQtcGx1cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtZWNoYXJ0cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9sb2Rhc2gnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZScpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvcmUnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtdXRpbHMnKSkge1xyXG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIHZpdGUtcGx1Z2luIFx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NEU1Rlx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvdml0ZS1wbHVnaW4nKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy92aXRlLXBsdWdpbicpKSB7XHJcbiAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgIH1cclxuXHJcbiAgICAvLyA0LiBcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcclxuICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIFx1OEZENFx1NTZERSB1bmRlZmluZWQgXHU4ODY4XHU3OTNBXHU1NDA4XHU1RTc2XHU1MjMwXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHJcbiAgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYnVpbGRcXFxccm9sbHVwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvYnVpbGQvcm9sbHVwLmNvbmZpZy50c1wiOy8qKlxyXG4gKiBSb2xsdXAgXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XHJcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NCBSb2xsdXAgXHU5MTREXHU3RjZFXHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBSb2xsdXBPcHRpb25zLCBXYXJuaW5nSGFuZGxlcldpdGhEZWZhdWx0LCBPdXRwdXRBc3NldCwgV2FybmluZyB9IGZyb20gJ3JvbGx1cCc7XHJcbmltcG9ydCB7IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5IH0gZnJvbSAnLi9tYW51YWwtY2h1bmtzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUm9sbHVwQ29uZmlnT3B0aW9ucyB7XHJcbiAgLyoqXHJcbiAgICogXHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiAnYXNzZXRzJ1x1RkYwOVxyXG4gICAqL1xyXG4gIGFzc2V0RGlyPzogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIGNodW5rIFx1NjU4N1x1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1OUVEOFx1OEJBNDogXHU0RTBFIGFzc2V0RGlyIFx1NzZGOFx1NTQwQ1x1RkYwOVxyXG4gICAqL1xyXG4gIGNodW5rRGlyPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBIFJvbGx1cCBcdTkxNERcdTdGNkVcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxyXG4gKiBAcmV0dXJucyBSb2xsdXAgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWU6IHN0cmluZywgb3B0aW9ucz86IFJvbGx1cENvbmZpZ09wdGlvbnMpOiBSb2xsdXBPcHRpb25zIHtcclxuICBjb25zdCBtYW51YWxDaHVua3MgPSBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lKTtcclxuICBjb25zdCBhc3NldERpciA9IG9wdGlvbnM/LmFzc2V0RGlyIHx8ICdhc3NldHMnO1xyXG4gIGNvbnN0IGNodW5rRGlyID0gb3B0aW9ucz8uY2h1bmtEaXIgfHwgYXNzZXREaXI7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwcmVzZXJ2ZUVudHJ5U2lnbmF0dXJlczogJ3N0cmljdCcsXHJcbiAgICBvbndhcm4od2FybmluZzogV2FybmluZywgd2FybjogV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCkge1xyXG4gICAgICAvLyBcdThGQzdcdTZFRTRcdTVERjJcdTc3RTVcdThCNjZcdTU0NEFcclxuICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnIHx8XHJcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdkeW5hbWljYWxseSBpbXBvcnRlZCcpICYmXHJcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdzdGF0aWNhbGx5IGltcG9ydGVkJykpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdHZW5lcmF0ZWQgYW4gZW1wdHkgY2h1bmsnKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB3YXJuKHdhcm5pbmcpO1xyXG4gICAgfSxcclxuICAgIG91dHB1dDoge1xyXG4gICAgICBmb3JtYXQ6ICdlc20nLFxyXG4gICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsXHJcbiAgICAgIG1hbnVhbENodW5rcyxcclxuICAgICAgcHJlc2VydmVNb2R1bGVzOiBmYWxzZSxcclxuICAgICAgZ2VuZXJhdGVkQ29kZToge1xyXG4gICAgICAgIGNvbnN0QmluZGluZ3M6IGZhbHNlLCAvLyBcdTRFMERcdTRGN0ZcdTc1MjggY29uc3RcdUZGMENcdTkwN0ZcdTUxNEQgVERaIFx1OTVFRVx1OTg5OFxyXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZERFx1NzU1OVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODhBQlx1NTM4Qlx1N0YyOVx1NjIxMFx1NTM1NVx1NUI1N1x1NkJDRFxyXG4gICAgICAgIC8vIFx1OEZEOVx1NTNFRlx1NEVFNVx1OTYzMlx1NkI2MiBcImRvZXMgbm90IHByb3ZpZGUgYW4gZXhwb3J0IG5hbWVkICdjJ1wiIFx1OTUxOVx1OEJFRlxyXG4gICAgICAgIHByZXNlcnZlTW9kdWxlc1Jvb3Q6IHVuZGVmaW5lZCxcclxuICAgICAgfSxcclxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHU0RTBEXHU4OEFCXHU1MzhCXHU3RjI5XHJcbiAgICAgIC8vIFx1ODY3RFx1NzEzNiB0ZXJzZXIgXHU3Njg0IG1hbmdsZSBcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRGNDYgUm9sbHVwIFx1NzY4NFx1NEVFM1x1NzgwMVx1NzUxRlx1NjIxMFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTM4Qlx1N0YyOVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFxyXG4gICAgICBjaHVua0ZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS1baGFzaF0uanNgLFxyXG4gICAgICBlbnRyeUZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS1baGFzaF0uanNgLFxyXG4gICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogT3V0cHV0QXNzZXQpID0+IHtcclxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFmYXZpY29uLmljbyBcdTU0OEMgaWNvbnMgXHU3NkVFXHU1RjU1XHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBEXHU1RTk0XHU4QkU1XHU2REZCXHU1MkEwIGhhc2hcdUZGMENcdTVFOTRcdThCRTVcdTRGRERcdTYzMDFcdTU3MjhcdTUzOUZcdTRGNERcdTdGNkVcclxuICAgICAgICAvLyBcdThGRDlcdTRFOUJcdTY1ODdcdTRFRjZcdTRGMUFcdTg4QUIgcHVibGljRGlyIFx1NjIxNiBjb3B5SWNvbnNQbHVnaW4gXHU1OTBEXHU1MjM2XHU1MjMwXHU2QjYzXHU3ODZFXHU3Njg0XHU0RjREXHU3RjZFXHJcbiAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnZmF2aWNvbicpIHx8IGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnaWNvbnMvJykpIHtcclxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjU4N1x1NEVGNlx1NTQwRFx1NTMwNVx1NTQyQiBmYXZpY29uIFx1NjIxNiBpY29uc1x1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQiBoYXNoXHVGRjA5XHJcbiAgICAgICAgICAvLyBcdTRGNDZcdThGRDlcdTc5Q0RcdTYwQzVcdTUxQjVcdTVFOTRcdThCRTVcdTVGODhcdTVDMTFcdUZGMENcdTU2RTBcdTRFM0EgcHVibGljRGlyIFx1NEYxQVx1NzZGNFx1NjNBNVx1NTkwRFx1NTIzNlx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlxyXG4gICAgICAgICAgcmV0dXJuIGFzc2V0SW5mby5uYW1lIHx8IGAke2Fzc2V0RGlyfS9bbmFtZV0uW2V4dF1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcclxuICAgICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5jc3NgO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYCR7YXNzZXREaXJ9L1tuYW1lXS1baGFzaF0uW2V4dF1gO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGV4dGVybmFsOiBbXHJcbiAgICAgIC8vIHZpdGUtcGx1Z2luIFx1NjYyRlx1Njc4NFx1NUVGQVx1NjVGNlx1NjNEMlx1NEVGNlx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEVFM1x1NzgwMVx1NEUyRFxyXG4gICAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXHJcbiAgICAgIC9eQGJ0Y1xcL3ZpdGUtcGx1Z2luLyxcclxuICAgIF0sXHJcbiAgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNsZWFuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzXCI7LyoqXG4gKiBcdTZFMDVcdTc0MDZcdTY3ODRcdTVFRkFcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgY29uc29sZS5sb2cobWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU4QjY2XHU1NDRBXHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVXYXJuKG1lc3NhZ2U6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTdFQUZcdTY1ODdcdTY3MkNcdThGOTNcdTUxRkFcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjbGVhbi1kaXN0LXBsdWdpbicsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2XHU2NUU3XHU3Njg0IGRpc3QgXHU3NkVFXHU1RjU1Li4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIGRpc3QgXHU3NkVFXHU1RjU1XHU1REYyXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VCVVNZJyB8fCBlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgICAgc2FmZVdhcm4oYFtjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2XHU1OTMxXHU4RDI1XHVGRjA4JHtlcnJvci5jb2RlfVx1RkYwOVx1RkYwQ1ZpdGUgXHU1QzA2XHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4MUVBXHU1MkE4XHU2RTA1XHU3NDA2XHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gVml0ZSBcdTVDMDZcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdUZGMDhlbXB0eU91dERpcjogdHJ1ZVx1RkYwOScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2h1bmsudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHNcIjsvKipcbiAqIENodW5rIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU1MzA1XHU2MkVDIGNodW5rIFx1OUE4Q1x1OEJDMVx1NTQ4Q1x1NEYxOFx1NTMxNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NzUxRlx1NjIxMFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtWZXJpZnlQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVml0ZSBQbHVnaW4gXHU3QzdCXHU1NzhCXHU1QjlBXHU0RTQ5XHU1M0VGXHU4MEZEXHU0RTBEXHU1QjhDXHU2NTc0XHVGRjBDbmFtZSBcdTVDNUVcdTYwMjdcdTY2MkZcdTY4MDdcdTUxQzZcdTVDNUVcdTYwMjdcbiAgICBuYW1lOiAnY2h1bmstdmVyaWZ5LXBsdWdpbicsXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zb2xlLmxvZygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTc1MUZcdTYyMTBcdTc2ODRcdTYyNDBcdTY3MDkgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBJyk7XG4gICAgICBjb25zdCBqc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgY29uc3QgY3NzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuSlMgY2h1bmtcdUZGMDhcdTUxNzEgJHtqc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAganNDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuQ1NTIGNodW5rXHVGRjA4XHU1MTcxICR7Y3NzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBjc3NDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zdCBpbmRleENodW5rID0ganNDaHVua3MuZmluZChqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2luZGV4LScpKTtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZSA9IGluZGV4Q2h1bmsgPyAoYnVuZGxlW2luZGV4Q2h1bmtdIGFzIGFueSk/LmNvZGU/Lmxlbmd0aCB8fCAwIDogMDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZUtCID0gaW5kZXhTaXplIC8gMTAyNDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZU1CID0gaW5kZXhTaXplS0IgLyAxMDI0O1xuXG4gICAgICBjb25zdCBtaXNzaW5nUmVxdWlyZWRDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAoIWluZGV4Q2h1bmspIHtcbiAgICAgICAgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzLnB1c2goJ2luZGV4Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhc0Vwc1NlcnZpY2UgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnZXBzLXNlcnZpY2UnKSk7XG4gICAgICBjb25zdCBoYXNBdXRoQXBpID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2F1dGgtYXBpJykpO1xuICAgICAgY29uc3QgaGFzRWNoYXJ0c1ZlbmRvciA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlY2hhcnRzLXZlbmRvcicpKTtcbiAgICAgIGNvbnN0IGhhc0xpYk1vbmFjbyA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItbW9uYWNvJykpO1xuICAgICAgY29uc3QgaGFzTGliVGhyZWUgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnbGliLXRocmVlJykpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1RENFNiBcdTY3ODRcdTVFRkFcdTYwQzVcdTUxQjVcdUZGMDhcdTVFNzNcdTg4NjFcdTYyQzZcdTUyMDZcdTdCNTZcdTc1NjVcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGlmIChpbmRleENodW5rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIFx1MjcwNSBpbmRleDogXHU0RTNCXHU2NTg3XHU0RUY2XHVGRjA4VnVlXHU3NTFGXHU2MDAxICsgRWxlbWVudCBQbHVzICsgXHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHVGRjBDXHU0RjUzXHU3OUVGfiR7aW5kZXhTaXplTUIudG9GaXhlZCgyKX1NQiBcdTY3MkFcdTUzOEJcdTdGMjlcdUZGMENnemlwXHU1NDBFfiR7KGluZGV4U2l6ZU1CICogMC4zKS50b0ZpeGVkKDIpfU1CXHVGRjA5YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgICBcdTI3NEMgXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4YCk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRXBzU2VydmljZSkgY29uc29sZS5sb2coYCAgXHUyNzA1IGVwcy1zZXJ2aWNlOiBFUFMgXHU2NzBEXHU1MkExXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjA5YCk7XG4gICAgICBpZiAoaGFzQXV0aEFwaSkgY29uc29sZS5sb2coYCAgXHUyNzA1IGF1dGgtYXBpOiBBdXRoIEFQSVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwQ1x1NzUzMSBzeXN0ZW0tYXBwIFx1NjNEMFx1NEY5Qlx1RkYwOWApO1xuICAgICAgaWYgKGhhc0VjaGFydHNWZW5kb3IpIGNvbnNvbGUubG9nKGAgIFx1MjcwNSBlY2hhcnRzLXZlbmRvcjogRUNoYXJ0cyArIHpyZW5kZXJcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMENcdTY1RTBcdTRGOURcdThENTZcdTk1RUVcdTk4OThcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNMaWJNb25hY28pIGNvbnNvbGUubG9nKGAgIFx1MjcwNSBsaWItbW9uYWNvOiBNb25hY28gRWRpdG9yXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA5YCk7XG4gICAgICBpZiAoaGFzTGliVGhyZWUpIGNvbnNvbGUubG9nKGAgIFx1MjcwNSBsaWItdGhyZWU6IFRocmVlLmpzXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA5YCk7XG4gICAgICBjb25zb2xlLmxvZyhgICBcdTIxMzlcdUZFMEYgIFx1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1NTQ4QyBWdWUgXHU3NTFGXHU2MDAxXHU1NDA4XHU1RTc2XHU1MjMwXHU0RTNCXHU2NTg3XHU0RUY2XHVGRjBDXHU5MDdGXHU1MTREXHU1MjFEXHU1OUNCXHU1MzE2XHU5ODdBXHU1RThGXHU5NUVFXHU5ODk4YCk7XG5cbiAgICAgIGlmIChtaXNzaW5nUmVxdWlyZWRDaHVua3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzRDIFx1N0YzQVx1NTkzMVx1NjgzOFx1NUZDMyBjaHVua1x1RkYxQWAsIG1pc3NpbmdSZXF1aXJlZENodW5rcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU2ODM4XHU1RkMzIGNodW5rIFx1N0YzQVx1NTkzMVx1RkYwQ1x1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1RkYwMWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2ODM4XHU1RkMzIGNodW5rIFx1NTE2OFx1OTBFOFx1NUI1OFx1NTcyOGApO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjdcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHVEODNEXHVERDBEIFx1OUE4Q1x1OEJDMVx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NEUwMFx1ODFGNFx1NjAyNy4uLicpO1xuICAgICAgY29uc3QgYWxsQ2h1bmtGaWxlcyA9IG5ldyBTZXQoWy4uLmpzQ2h1bmtzLCAuLi5jc3NDaHVua3NdKTtcbiAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIGNvbnN0IG1pc3NpbmdGaWxlczogQXJyYXk8eyBmaWxlOiBzdHJpbmc7IHJlZmVyZW5jZWRCeTogc3RyaW5nW107IHBvc3NpYmxlTWF0Y2hlczogc3RyaW5nW10gfT4gPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGNodW5rQW55ID0gY2h1bmsgYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5jb2RlKSB7XG4gICAgICAgICAgY29uc3QgY29kZVdpdGhvdXRDb21tZW50cyA9IGNodW5rQW55LmNvZGVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXC8uKiQvZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpO1xuXG4gICAgICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXVxccypcXCkvZztcbiAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IGltcG9ydFBhdHRlcm4uZXhlYyhjb2RlV2l0aG91dENvbW1lbnRzKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL15cXC8/YXNzZXRzXFwvLywgJ2Fzc2V0cy8nKTtcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlZEZpbGVzLmhhcyhyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5zZXQocmVzb3VyY2VGaWxlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuZ2V0KHJlc291cmNlRmlsZSkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHVybFBhdHRlcm4gPSAvbmV3XFxzK1VSTFxccypcXChcXHMqW1wiJ10oXFwvP2Fzc2V0c1xcL1teXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKVtcIiddL2c7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHVybFBhdHRlcm4uZXhlYyhjb2RlV2l0aG91dENvbW1lbnRzKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL15cXC8/YXNzZXRzXFwvLywgJ2Fzc2V0cy8nKTtcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlZEZpbGVzLmhhcyhyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5zZXQocmVzb3VyY2VGaWxlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuZ2V0KHJlc291cmNlRmlsZSkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFtyZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5XSBvZiByZWZlcmVuY2VkRmlsZXMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcmVmZXJlbmNlZEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgbGV0IGV4aXN0cyA9IGFsbENodW5rRmlsZXMuaGFzKGZpbGVOYW1lKTtcbiAgICAgICAgbGV0IHBvc3NpYmxlTWF0Y2hlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gZmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBbLCBuYW1lUHJlZml4LCAsIGV4dF0gPSBtYXRjaDtcbiAgICAgICAgICAgIHBvc3NpYmxlTWF0Y2hlcyA9IEFycmF5LmZyb20oYWxsQ2h1bmtGaWxlcykuZmlsdGVyKGNodW5rRmlsZSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNodW5rTWF0Y2ggPSBjaHVua0ZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgIGlmIChjaHVua01hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgWywgY2h1bmtOYW1lUHJlZml4LCAsIGNodW5rRXh0XSA9IGNodW5rTWF0Y2g7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNodW5rTmFtZVByZWZpeCA9PT0gbmFtZVByZWZpeCAmJiBjaHVua0V4dCA9PT0gZXh0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXhpc3RzID0gcG9zc2libGVNYXRjaGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBtaXNzaW5nRmlsZXMucHVzaCh7IGZpbGU6IHJlZmVyZW5jZWRGaWxlLCByZWZlcmVuY2VkQnksIHBvc3NpYmxlTWF0Y2hlcyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWlzc2luZ0ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTUzRDFcdTczQjAgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUFgKTtcbiAgICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPD0gNSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBXHVGRjFBXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RjQ2XHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFcdTY3MDkgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU5MEZEXHU2QjYzXHU3ODZFXHVGRjA4XHU1MTcxXHU5QThDXHU4QkMxICR7cmVmZXJlbmNlZEZpbGVzLnNpemV9IFx1NEUyQVx1NUYxNVx1NzUyOFx1RkYwOWApO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogXHU0RjE4XHU1MzE2XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU2M0QyXHU0RUY2XHVGRjFBXHU1OTA0XHU3NDA2XHU3QTdBIGNodW5rXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZUNodW5rc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvcHRpbWl6ZS1jaHVua3MnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgZW1wdHlDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua1JlZmVyZW5jZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSAmJiBjaHVua0FueS5jb2RlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBlbXB0eUNodW5rcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlZCBvZiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgICBpZiAoIWNodW5rUmVmZXJlbmNlcy5oYXMoaW1wb3J0ZWQpKSB7XG4gICAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5zZXQoaW1wb3J0ZWQsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5nZXQoaW1wb3J0ZWQpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtcHR5Q2h1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtzVG9LZWVwOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGVtcHR5Q2h1bmsgb2YgZW1wdHlDaHVua3MpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZEJ5ID0gY2h1bmtSZWZlcmVuY2VzLmdldChlbXB0eUNodW5rKSB8fCBbXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZWRCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgIGNodW5rLmNvZGUgPSAnZXhwb3J0IHt9Oyc7XG4gICAgICAgICAgICBjaHVua3NUb0tlZXAucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6ICR7ZW1wdHlDaHVua30gKFx1ODhBQiAke3JlZmVyZW5jZWRCeS5sZW5ndGh9IFx1NEUyQSBjaHVuayBcdTVGMTVcdTc1MjhcdUZGMENcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjYpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNodW5rc1RvUmVtb3ZlLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtlbXB0eUNodW5rXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2h1bmtzVG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW29wdGltaXplLWNodW5rc10gXHU3OUZCXHU5NjY0XHU0RTg2ICR7Y2h1bmtzVG9SZW1vdmUubGVuZ3RofSBcdTRFMkFcdTY3MkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6YCwgY2h1bmtzVG9SZW1vdmUpO1xuICAgICAgfVxuICAgICAgaWYgKGNodW5rc1RvS2VlcC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTRFODYgJHtjaHVua3NUb0tlZXAubGVuZ3RofSBcdTRFMkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bmtcdUZGMDhcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDk6YCwgY2h1bmtzVG9LZWVwKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGhhc2gudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvaGFzaC50c1wiOy8qKlxuICogSGFzaCBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1NTMwNVx1NjJFQ1x1NUYzQVx1NTIzNlx1NzUxRlx1NjIxMFx1NjVCMCBoYXNoIFx1NTQ4Q1x1NEZFRVx1NTkwRFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NSBoYXNoXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgQ2h1bmtJbmZvLCBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgam9pbiwgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jLCByZWFkZGlyU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjE2XHU3NTFGXHU2MjEwXHU1MTY4XHU1QzQwXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU0RTBFIGFkZFZlcnNpb25QbHVnaW4gXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjA5XG4gKiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMENcdTkwRkRcdTZDQTFcdTY3MDlcdTUyMTlcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcbiAqL1xuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgLy8gMS4gXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjA4XHU3NTMxXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU4QkJFXHU3RjZFXHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cblxuICAvLyAyLiBcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdTVGRkRcdTc1NjVcdThCRkJcdTUzRDZcdTk1MTlcdThCRUZcbiAgICB9XG4gIH1cblxuICAvLyAzLiBcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdTVFNzZcdTRGRERcdTVCNThcdTUyMzBcdTY1ODdcdTRFRjZcdUZGMDhcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTRFMkFcdUZGMDlcbiAgLy8gXHU0RjdGXHU3NTI4MzZcdThGREJcdTUyMzZcdTdGMTZcdTc4MDFcdUZGMENcdTc1MUZcdTYyMTBcdTY2RjRcdTc3RURcdTc2ODRcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTUzMDVcdTU0MkJcdTVCNTdcdTZCQ0RcdTU0OENcdTY1NzBcdTVCNTdcdUZGMENcdTU5ODIgbDNrMmoxaFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgdHJ5IHtcbiAgICB3cml0ZUZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsIHRpbWVzdGFtcCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1RkZEXHU3NTY1XHU1MTk5XHU1MTY1XHU5NTE5XHU4QkVGXG4gIH1cbiAgcmV0dXJuIHRpbWVzdGFtcDtcbn1cblxuLyoqXG4gKiBcdTVGM0FcdTUyMzZcdTc1MUZcdTYyMTBcdTY1QjAgaGFzaCBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcmNlTmV3SGFzaFBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBidWlsZElkID0gZ2V0QnVpbGRUaW1lc3RhbXAoKTtcbiAgY29uc3QgY3NzRmlsZU5hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBqc0ZpbGVOYW1lTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmb3JjZS1uZXctaGFzaCcsXG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTY3ODRcdTVFRkEgSUQ6ICR7YnVpbGRJZH1gKTtcbiAgICAgIGNzc0ZpbGVOYW1lTWFwLmNsZWFyKCk7XG4gICAgICBqc0ZpbGVOYW1lTWFwLmNsZWFyKCk7XG4gICAgfSxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBDaHVua0luZm8pIHtcbiAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmZpbGVOYW1lPy5pbmNsdWRlcygndmVuZG9yJyk7XG5cbiAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBgLyogYnVpbGQtaWQ6ICR7YnVpbGRJZH0gKi9cXG4ke2NvZGV9YDtcbiAgICB9LFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgZmlsZU5hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpICYmIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgIGxldCBiYXNlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuanMkLywgJycpO1xuICAgICAgICAgIGlmIChiYXNlTmFtZS5lbmRzV2l0aCgnLScpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtmb3JjZS1uZXctaGFzaF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzAgUm9sbHVwIFx1NzUxRlx1NjIxMFx1NzY4NFx1NUYwMlx1NUUzOFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NjcyQlx1NUMzRVx1NjcwOVx1OEZERVx1NUI1N1x1N0IyNlx1RkYwOTogJHtmaWxlTmFtZX1gKTtcbiAgICAgICAgICAgIGJhc2VOYW1lID0gYmFzZU5hbWUucmVwbGFjZSgvLSskLywgJycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG5ld0ZpbGVOYW1lID0gYGFzc2V0cy8ke2Jhc2VOYW1lfS0ke2J1aWxkSWR9LmpzYDtcbiAgICAgICAgICBmaWxlTmFtZU1hcC5zZXQoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKTtcbiAgICAgICAgICBjb25zdCBvbGRSZWYgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGNvbnN0IG5ld1JlZiA9IG5ld0ZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAganNGaWxlTmFtZU1hcC5zZXQob2xkUmVmLCBuZXdSZWYpO1xuXG4gICAgICAgICAgKGNodW5rIGFzIGFueSkuZmlsZU5hbWUgPSBuZXdGaWxlTmFtZTtcbiAgICAgICAgICBidW5kbGVbbmV3RmlsZU5hbWVdID0gY2h1bms7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmsudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLmNzcycpICYmIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgIGxldCBiYXNlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuY3NzJC8sICcnKTtcbiAgICAgICAgICBiYXNlTmFtZSA9IGJhc2VOYW1lLnJlcGxhY2UoLy0rJC8sICcnKTtcbiAgICAgICAgICBjb25zdCBuZXdGaWxlTmFtZSA9IGBhc3NldHMvJHtiYXNlTmFtZX0tJHtidWlsZElkfS5jc3NgO1xuXG4gICAgICAgICAgZmlsZU5hbWVNYXAuc2V0KGZpbGVOYW1lLCBuZXdGaWxlTmFtZSk7XG4gICAgICAgICAgY29uc3Qgb2xkQ3NzTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgY29uc3QgbmV3Q3NzTmFtZSA9IG5ld0ZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgY3NzRmlsZU5hbWVNYXAuc2V0KG9sZENzc05hbWUsIG5ld0Nzc05hbWUpO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIENTUyBcdTY1ODdcdTRFRjZcdTY2MjBcdTVDMDQ6ICR7b2xkQ3NzTmFtZX0gLT4gJHtuZXdDc3NOYW1lfWApO1xuXG4gICAgICAgICAgKGNodW5rIGFzIGFueSkuZmlsZU5hbWUgPSBuZXdGaWxlTmFtZTtcbiAgICAgICAgICBidW5kbGVbbmV3RmlsZU5hbWVdID0gY2h1bms7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU2NkY0XHU2NUIwXHU2MjQwXHU2NzA5IGNodW5rIFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGNodW5rQW55ID0gY2h1bmsgYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5jb2RlKSB7XG4gICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5TGliID0gZmlsZU5hbWUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICAgICAgaWYgKGlzVGhpcmRQYXJ0eUxpYiAmJiAoZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fCBmaWxlTmFtZS5pbmNsdWRlcygndnVlLWNvcmUnKSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBuZXdDb2RlID0gY2h1bmtBbnkuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIGZvciAoY29uc3QgW29sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZV0gb2YgZmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBvbGRSZWYgPSBvbGRGaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVmID0gbmV3RmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgIGNvbnN0IG9sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2ggPSBvbGRSZWYucmVwbGFjZSgvLSskLywgJycpO1xuXG4gICAgICAgICAgICAvLyBcdTY3MkFcdTRGN0ZcdTc1MjhcdTc2ODRcdThGNkNcdTRFNDlcdTUzRDhcdTkxQ0ZcdUZGMENcdTRGRERcdTc1NTlcdTRFRTVcdTU5MDdcdTVDMDZcdTY3NjVcdTRGN0ZcdTc1MjhcbiAgICAgICAgICAgIC8vIGNvbnN0IGVzY2FwZWRPbGRSZWYgPSBvbGRSZWYucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGVzY2FwZWRPbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNoID0gb2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuXG4gICAgICAgICAgICBjb25zdCByZXBsYWNlUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgIFtgL2Fzc2V0cy8ke29sZFJlZn1gLCBgL2Fzc2V0cy8ke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgW2AuLyR7b2xkUmVmfWAsIGAuLyR7bmV3UmVmfWBdLFxuICAgICAgICAgICAgICBbYFwiJHtvbGRSZWZ9XCJgLCBgXCIke25ld1JlZn1cImBdLFxuICAgICAgICAgICAgICBbYCcke29sZFJlZn0nYCwgYCcke25ld1JlZn0nYF0sXG4gICAgICAgICAgICAgIFtgXFxgJHtvbGRSZWZ9XFxgYCwgYFxcYCR7bmV3UmVmfVxcYGBdLFxuICAgICAgICAgICAgICBbYGltcG9ydCgnL2Fzc2V0cy8ke29sZFJlZn0nKWAsIGBpbXBvcnQoJy9hc3NldHMvJHtuZXdSZWZ9P3Y9JHtidWlsZElkfScpYF0sXG4gICAgICAgICAgICAgIFtgaW1wb3J0KFwiL2Fzc2V0cy8ke29sZFJlZn1cIilgLCBgaW1wb3J0KFwiL2Fzc2V0cy8ke25ld1JlZn0/dj0ke2J1aWxkSWR9XCIpYF0sXG4gICAgICAgICAgICAgIFtgaW1wb3J0KFxcYC9hc3NldHMvJHtvbGRSZWZ9XFxgKWAsIGBpbXBvcnQoXFxgL2Fzc2V0cy8ke25ld1JlZn0/dj0ke2J1aWxkSWR9XFxgKWBdLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgaWYgKG9sZFJlZiAhPT0gb2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaCkge1xuICAgICAgICAgICAgICByZXBsYWNlUGF0dGVybnMucHVzaChcbiAgICAgICAgICAgICAgICBbYC9hc3NldHMvJHtvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNofWAsIGAvYXNzZXRzLyR7bmV3UmVmfWBdLFxuICAgICAgICAgICAgICAgIFtgLi8ke29sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2h9YCwgYC4vJHtuZXdSZWZ9YF0sXG4gICAgICAgICAgICAgICAgW2BcIiR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH1cImAsIGBcIiR7bmV3UmVmfVwiYF0sXG4gICAgICAgICAgICAgICAgW2AnJHtvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNofSdgLCBgJyR7bmV3UmVmfSdgXSxcbiAgICAgICAgICAgICAgICBbYFxcYCR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH1cXGBgLCBgXFxgJHtuZXdSZWZ9XFxgYF0sXG4gICAgICAgICAgICAgICAgW2BpbXBvcnQoJy9hc3NldHMvJHtvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNofScpYCwgYGltcG9ydCgnL2Fzc2V0cy8ke25ld1JlZn0/dj0ke2J1aWxkSWR9JylgXSxcbiAgICAgICAgICAgICAgICBbYGltcG9ydChcIi9hc3NldHMvJHtvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNofVwiKWAsIGBpbXBvcnQoXCIvYXNzZXRzLyR7bmV3UmVmfT92PSR7YnVpbGRJZH1cIilgXSxcbiAgICAgICAgICAgICAgICBbYGltcG9ydChcXGAvYXNzZXRzLyR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH1cXGApYCwgYGltcG9ydChcXGAvYXNzZXRzLyR7bmV3UmVmfT92PSR7YnVpbGRJZH1cXGApYF0sXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcGxhY2VQYXR0ZXJucy5mb3JFYWNoKChbb2xkUGF0dGVybiwgbmV3UGF0dGVybl0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZFBhdHRlcm4gPSBvbGRQYXR0ZXJuLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChlc2NhcGVkT2xkUGF0dGVybiwgJ2cnKTtcbiAgICAgICAgICAgICAgaWYgKHJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlZ2V4LCBuZXdQYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTRFM0FcdTYyNDBcdTY3MDkgaW1wb3J0KCkgXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgICBjb25zdCBhbGxJbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqKFtcIiddKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanMpKShcXD9bXlwiJ2BcXHNdKik/XFwxXFxzKlxcKS9nO1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShhbGxJbXBvcnRQYXR0ZXJuLCAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgX2V4dDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChxdWVyeSAmJiBxdWVyeS5pbmNsdWRlcygndj0nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofSR7cXVlcnkucmVwbGFjZSgvXFw/dj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCl9JHtxdW90ZX0pYDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0/dj0ke2J1aWxkSWR9JHtxdW90ZX0pYDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU2NkY0XHU2NUIwIF9fdml0ZV9fbWFwRGVwcyBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyOFxuICAgICAgICAgIGlmIChuZXdDb2RlLmluY2x1ZGVzKCdfX3ZpdGVfX21hcERlcHMnKSAmJiBjc3NGaWxlTmFtZU1hcC5zaXplID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbb2xkQ3NzTmFtZSwgbmV3Q3NzTmFtZV0gb2YgY3NzRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRDc3NOYW1lID0gb2xkQ3NzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICBjb25zdCBjc3NQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKFtcIiddKWFzc2V0cy8ke2VzY2FwZWRPbGRDc3NOYW1lfVxcXFwxYCwgJ2cnKTtcbiAgICAgICAgICAgICAgaWYgKGNzc1BhdHRlcm4udGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoY3NzUGF0dGVybiwgYCQxYXNzZXRzLyR7bmV3Q3NzTmFtZX0kMWApO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgY2h1bmtBbnkuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTRFNUZcdTY2RjRcdTY1QjAgSFRNTCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyOFxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU1NzI4XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHVGRjA4XHU1OTgyIGFkZFZlcnNpb25QbHVnaW5cdUZGMDlcdTU5MDRcdTc0MDZcdTRFNEJcdTUyNERcdTVDMzFcdTY2RjRcdTY1QjBcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9IGNodW5rQW55LnNvdXJjZSBhcyBzdHJpbmc7XG4gICAgICAgICAgbGV0IGh0bWxNb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgaWYgKGNzc0ZpbGVOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTVGMDBcdTU5Q0JcdTY2RjRcdTY1QjAgSFRNTCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NjYyMFx1NUMwNFx1ODg2OFx1NTkyN1x1NUMwRjogJHtjc3NGaWxlTmFtZU1hcC5zaXplfWApO1xuICAgICAgICAgICAgLy8gXHU1MTQ4XHU2MjUzXHU1MzcwIEhUTUwgXHU0RTJEXHU2MjQwXHU2NzA5IENTUyBcdTVGMTVcdTc1MjhcdUZGMENcdTc1MjhcdTRFOEVcdThDMDNcdThCRDVcbiAgICAgICAgICAgIGNvbnN0IGNzc1JlZnMgPSBodG1sQ29udGVudC5tYXRjaCgvPGxpbmtbXj5dKlxccytocmVmPVtcIiddKFteXCInXStcXC5jc3NbXlwiJ10qKVtcIiddW14+XSo+L2cpO1xuICAgICAgICAgICAgaWYgKGNzc1JlZnMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gSFRNTCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyODpgLCBjc3NSZWZzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBbb2xkQ3NzTmFtZSwgbmV3Q3NzTmFtZV0gb2YgY3NzRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRDc3NOYW1lID0gb2xkQ3NzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICAvLyBcdTY2RjRcdTY1QjAgPGxpbmsgaHJlZj4gXHU2ODA3XHU3QjdFXHU0RTJEXHU3Njg0IENTUyBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTUzMDVcdTYyRUNcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMDlcbiAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NDBDXHU2NUY2XHU1MzM5XHU5MTREIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy8gXHU1RjAwXHU1OTM0XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGNvbnN0IGxpbmtQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxsaW5rW14+XSpcXFxccytocmVmPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZE9sZENzc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbCA9IGh0bWxDb250ZW50O1xuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UobGlua1BhdHRlcm4sIChfbWF0Y2gsIHByZWZpeCwgcGF0aCwgcXVlcnksIHN1ZmZpeCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7cGF0aFByZWZpeH1hc3NldHMvJHtuZXdDc3NOYW1lfWA7XG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1REYyXHU2NzA5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjBDXHU2NkY0XHU2NUIwXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjFCXHU1NDI2XHU1MjE5XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UXVlcnkgPSBxdWVyeSA/IHF1ZXJ5LnJlcGxhY2UoL1s/Jl12PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTUzMzlcdTkxNERcdTUyMzAgQ1NTIFx1NUYxNVx1NzUyODogJHtwYXRofSR7cXVlcnkgfHwgJyd9IC0+ICR7bmV3UGF0aH0ke25ld1F1ZXJ5fWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtuZXdQYXRofSR7bmV3UXVlcnl9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChodG1sQ29udGVudCAhPT0gb3JpZ2luYWxIdG1sKSB7XG4gICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjZGNFx1NjVCMCBIVE1MIFx1NEUyRFx1NzY4NCBDU1MgXHU1RjE1XHU3NTI4OiAke29sZENzc05hbWV9IC0+ICR7bmV3Q3NzTmFtZX1gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI2QTBcdUZFMEYgIFx1NjcyQVx1NjI3RVx1NTIzMFx1NTMzOVx1OTE0RFx1NzY4NCBDU1MgXHU1RjE1XHU3NTI4OiAke29sZENzc05hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoanNGaWxlTmFtZU1hcC5zaXplID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1RjAwXHU1OUNCXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IEpTIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NjYyMFx1NUMwNFx1ODg2OFx1NTkyN1x1NUMwRjogJHtqc0ZpbGVOYW1lTWFwLnNpemV9YCk7XG4gICAgICAgICAgICAvLyBcdTUxNDhcdTYyNTNcdTUzNzAgSFRNTCBcdTRFMkRcdTYyNDBcdTY3MDkgaW1wb3J0KCkgXHU4QkVEXHU1M0U1XHVGRjBDXHU3NTI4XHU0RThFXHU4QzAzXHU4QkQ1XG4gICAgICAgICAgICBjb25zdCBpbXBvcnRSZWZzID0gaHRtbENvbnRlbnQubWF0Y2goL2ltcG9ydFxccypcXChbJ1wiXShbXidcIl0rXFwuanNbXidcIl0qKVsnXCJdXFwpL2cpO1xuICAgICAgICAgICAgaWYgKGltcG9ydFJlZnMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gSFRNTCBcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU1RjE1XHU3NTI4OmAsIGltcG9ydFJlZnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRKc05hbWUsIG5ld0pzTmFtZV0gb2YganNGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZEpzTmFtZSA9IG9sZEpzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gMS4gXHU2NkY0XHU2NUIwIDxzY3JpcHQgc3JjPiBcdTY4MDdcdTdCN0VcdTRFMkRcdTc2ODQgSlMgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU1MzA1XHU2MkVDXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjA5XG4gICAgICAgICAgICAgIGNvbnN0IHNjcmlwdFBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoPHNjcmlwdFtePl0qXFxcXHMrc3JjPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZE9sZEpzTmFtZX0pKFxcXFw/W15cIidcXFxcc10qKT8oW1wiJ11bXj5dKj4pYCwgJ2cnKTtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sMSA9IGh0bWxDb250ZW50O1xuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uoc2NyaXB0UGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXggPSBwYXRoLnN0YXJ0c1dpdGgoJy4vJykgPyAnLi8nIDogJy8nO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwQ1x1NjZGNFx1NjVCMFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYxQlx1NTQyNlx1NTIxOVx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NTMzOVx1OTE0RFx1NTIzMCA8c2NyaXB0IHNyYz4gXHU1RjE1XHU3NTI4OiAke3BhdGh9JHtxdWVyeSB8fCAnJ30gLT4gJHtuZXdQYXRofSR7bmV3UXVlcnl9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGh0bWxDb250ZW50ICE9PSBvcmlnaW5hbEh0bWwxKSB7XG4gICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU2NkY0XHU2NUIwIDxzY3JpcHQgc3JjPiBcdTVGMTVcdTc1Mjg6ICR7b2xkSnNOYW1lfSAtPiAke25ld0pzTmFtZX1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gMi4gXHU2NkY0XHU2NUIwIGltcG9ydCgpIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEJFRFx1NTNFNVx1NEUyRFx1NzY4NCBKUyBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTUzMDVcdTYyRUNcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMDlcbiAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBaW1wb3J0KCcuL2Fzc2V0cy94eHguanMnKSBcdTYyMTYgaW1wb3J0KCcvYXNzZXRzL3h4eC5qcycpXG4gICAgICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoaW1wb3J0XFxcXHMqXFxcXChcXFxccypbJ1wiXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRKc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFsnXCJdXFxcXHMqXFxcXCkpYCwgJ2cnKTtcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sMiA9IGh0bWxDb250ZW50O1xuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UoaW1wb3J0UGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXggPSBwYXRoLnN0YXJ0c1dpdGgoJy4vJykgPyAnLi8nIDogJy8nO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwQ1x1NjZGNFx1NjVCMFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYxQlx1NTQyNlx1NTIxOVx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NTMzOVx1OTE0RFx1NTIzMCBpbXBvcnQoKSBcdTVGMTVcdTc1Mjg6ICR7cGF0aH0ke3F1ZXJ5IHx8ICcnfSAtPiAke25ld1BhdGh9JHtuZXdRdWVyeX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoaHRtbENvbnRlbnQgIT09IG9yaWdpbmFsSHRtbDIpIHtcbiAgICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSBcdTVERjJcdTY2RjRcdTY1QjAgaW1wb3J0KCkgXHU1RjE1XHU3NTI4OiAke29sZEpzTmFtZX0gLT4gJHtuZXdKc05hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIDMuIFx1NjZGNFx1NjVCMCA8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCI+IFx1NjgwN1x1N0I3RVx1NEUyRFx1NzY4NCBKUyBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTUzMDVcdTYyRUNcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMDlcbiAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU2ODNDXHU1RjBGXHVGRjFBPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiIGhyZWY9XCIvYXNzZXRzL3h4eC5qc1wiPiBcdTYyMTYgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiIGhyZWY9XCIuL2Fzc2V0cy94eHguanNcIj5cbiAgICAgICAgICAgICAgY29uc3QgbW9kdWxlcHJlbG9hZFBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoPGxpbmtbXj5dKlxcXFxzK3JlbD1bXCInXW1vZHVsZXByZWxvYWRbXCInXVtePl0qXFxcXHMraHJlZj1bXCInXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRKc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDMgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKG1vZHVsZXByZWxvYWRQYXR0ZXJuLCAoX21hdGNoLCBwcmVmaXgsIHBhdGgsIHF1ZXJ5LCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTc2ODRcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdUZGMDgvYXNzZXRzLyBcdTYyMTYgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke3BhdGhQcmVmaXh9YXNzZXRzLyR7bmV3SnNOYW1lfWA7XG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1REYyXHU2NzA5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjBDXHU2NkY0XHU2NUIwXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjFCXHU1NDI2XHU1MjE5XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UXVlcnkgPSBxdWVyeSA/IHF1ZXJ5LnJlcGxhY2UoL1s/Jl12PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTUzMzlcdTkxNERcdTUyMzAgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiPiBcdTVGMTVcdTc1Mjg6ICR7cGF0aH0ke3F1ZXJ5IHx8ICcnfSAtPiAke25ld1BhdGh9JHtuZXdRdWVyeX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoaHRtbENvbnRlbnQgIT09IG9yaWdpbmFsSHRtbDMpIHtcbiAgICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSBcdTVERjJcdTY2RjRcdTY1QjAgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiPiBcdTVGMTVcdTc1Mjg6ICR7b2xkSnNOYW1lfSAtPiAke25ld0pzTmFtZX1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSBcdTVERjJcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IEpTIFx1NUYxNVx1NzUyOGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChodG1sTW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGNodW5rLnNvdXJjZSA9IGh0bWxDb250ZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU0RTNBICR7ZmlsZU5hbWVNYXAuc2l6ZX0gXHU0RTJBXHU2NTg3XHU0RUY2XHU2REZCXHU1MkEwXHU2Nzg0XHU1RUZBIElEOiAke2J1aWxkSWR9YCk7XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShvcHRpb25zOiBPdXRwdXRPcHRpb25zKSB7XG4gICAgICBjb25zdCBvdXRwdXREaXIgPSBvcHRpb25zLmRpciB8fCBqb2luKHByb2Nlc3MuY3dkKCksICdkaXN0Jyk7XG4gICAgICBjb25zdCBpbmRleEh0bWxQYXRoID0gam9pbihvdXRwdXREaXIsICdpbmRleC5odG1sJyk7XG5cbiAgICAgIGlmIChleGlzdHNTeW5jKGluZGV4SHRtbFBhdGgpKSB7XG4gICAgICAgIGxldCBodG1sID0gcmVhZEZpbGVTeW5jKGluZGV4SHRtbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoY3NzRmlsZU5hbWVNYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRDc3NOYW1lLCBuZXdDc3NOYW1lXSBvZiBjc3NGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRDc3NOYW1lID0gb2xkQ3NzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgLy8gXHU2NkY0XHU2NUIwIDxsaW5rIGhyZWY+IFx1NjgwN1x1N0I3RVx1NEUyRFx1NzY4NCBDU1MgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU1MzA1XHU2MkVDXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU0MENcdTY1RjZcdTUzMzlcdTkxNEQgL2Fzc2V0cy8gXHU1NDhDIC4vYXNzZXRzLyBcdTVGMDBcdTU5MzRcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQW9sZENzc05hbWUgXHU2NjJGXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU4REVGXHU1Rjg0XHVGRjA5XHVGRjBDXHU1OTgyIFwic3R5bGUtQ290MF8xYVouY3NzXCJcbiAgICAgICAgICAgIGNvbnN0IGxpbmtQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxsaW5rW14+XSpcXFxccytocmVmPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZE9sZENzc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEh0bWwgPSBodG1sO1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShsaW5rUGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0Nzc05hbWV9YDtcbiAgICAgICAgICAgICAgY29uc3QgbmV3UXVlcnkgPSBxdWVyeSA/IHF1ZXJ5LnJlcGxhY2UoL1xcP3Y9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChodG1sICE9PSBvcmlnaW5hbEh0bWwpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTVERjJcdTY2RjRcdTY1QjAgSFRNTCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyODogJHtvbGRDc3NOYW1lfSAtPiAke25ld0Nzc05hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTk4Mlx1Njc5QyBjc3NGaWxlTmFtZU1hcCBcdTY3MDlcdTY1NzBcdTYzNkVcdTRGNDYgSFRNTCBcdTZDQTFcdTY3MDlcdTg4QUJcdTRGRUVcdTY1MzlcdUZGMENcdThCRjRcdTY2MEVcdTUzMzlcdTkxNERcdTU5MzFcdThEMjVcbiAgICAgICAgICAvLyBcdTUzRUZcdTgwRkRcdTY2MkYgSFRNTCBcdTRFMkRcdTc2ODRcdThERUZcdTVGODRcdTY4M0NcdTVGMEZcdTRFMEVcdTk4ODRcdTY3MUZcdTRFMERcdTdCMjZcdUZGMENcdTVDMURcdThCRDVcdTY2RjRcdTVCQkRcdTY3N0VcdTc2ODRcdTUzMzlcdTkxNERcbiAgICAgICAgICBpZiAoIW1vZGlmaWVkICYmIGNzc0ZpbGVOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTUzMzlcdTkxNERcdTRFRkJcdTRGNTVcdTUzMDVcdTU0MkJcdTY1RTdcdTY1ODdcdTRFRjZcdTU0MERcdTc2ODRcdThERUZcdTVGODRcdUZGMDhcdTY2RjRcdTVCQkRcdTY3N0VcdTc2ODRcdTUzMzlcdTkxNERcdUZGMDlcbiAgICAgICAgICAgIGZvciAoY29uc3QgW29sZENzc05hbWUsIG5ld0Nzc05hbWVdIG9mIGNzc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdTU0OEMgaGFzaFx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RVx1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFxuICAgICAgICAgICAgICBjb25zdCBiYXNlTmFtZU1hdGNoID0gb2xkQ3NzTmFtZS5tYXRjaCgvXiguKz8pLShbQS1aYS16MC05XXs0LH0pXFwuY3NzJC8pO1xuICAgICAgICAgICAgICBpZiAoYmFzZU5hbWVNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFssIGJhc2VOYW1lXSA9IGJhc2VOYW1lTWF0Y2g7XG4gICAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZEJhc2VOYW1lID0gYmFzZU5hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTRFRkJcdTRGNTVcdTUzMDVcdTU0MkIgYmFzZU5hbWUgXHU3Njg0IENTUyBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgICBjb25zdCBsb29zZVBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoPGxpbmtbXj5dKlxcXFxzK2hyZWY9W1wiJ10pKFxcXFwuPy9hc3NldHMvJHtlc2NhcGVkQmFzZU5hbWV9LVteXCInXFxcXHNdK1xcXFwuY3NzKShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sID0gaHRtbDtcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlZFBhdGggPSAnJztcbiAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKGxvb3NlUGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTc2ODRcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdUZGMDgvYXNzZXRzLyBcdTYyMTYgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0Nzc05hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9cXD92PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICAgIG1hdGNoZWRQYXRoID0gcGF0aDsgLy8gXHU0RkREXHU1QjU4XHU1MzM5XHU5MTREXHU3Njg0XHU4REVGXHU1Rjg0XHU3NTI4XHU0RThFXHU2NUU1XHU1RkQ3XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGh0bWwgIT09IG9yaWdpbmFsSHRtbCkge1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1REYyXHU5MDFBXHU4RkM3XHU2QTIxXHU3Q0NBXHU1MzM5XHU5MTREXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1Mjg6ICR7bWF0Y2hlZFBhdGh9IC0+ICR7bmV3Q3NzTmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBcdTUzRUFcdTY2RjRcdTY1QjBcdTdCMkNcdTRFMDBcdTRFMkFcdTUzMzlcdTkxNERcdTc2ODRcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTY2RjRcdTY1QjBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoanNGaWxlTmFtZU1hcC5zaXplID4gMCkge1xuICAgICAgICAgIGZvciAoY29uc3QgW29sZEpzTmFtZSwgbmV3SnNOYW1lXSBvZiBqc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZE9sZEpzTmFtZSA9IG9sZEpzTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAxLiBcdTY2RjRcdTY1QjAgaW1wb3J0KCkgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjA4XHU1NDBDXHU2NUY2XHU1MzM5XHU5MTREIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoaW1wb3J0XFxcXHMqXFxcXChcXFxccypbJ1wiXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRKc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFsnXCJdXFxcXHMqXFxcXCkpYCwgJ2cnKTtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDEgPSBodG1sO1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShpbXBvcnRQYXR0ZXJuLCAoX21hdGNoLCBwcmVmaXgsIHBhdGgsIHF1ZXJ5LCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke3BhdGhQcmVmaXh9YXNzZXRzLyR7bmV3SnNOYW1lfWA7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NTMzOVx1OTE0RFx1NTIzMCBpbXBvcnQoKSBcdTVGMTVcdTc1Mjg6ICR7cGF0aH0ke3F1ZXJ5IHx8ICcnfSAtPiAke25ld1BhdGh9JHtuZXdRdWVyeX1gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaHRtbCAhPT0gb3JpZ2luYWxIdG1sMSkge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTVERjJcdTY2RjRcdTY1QjAgaW1wb3J0KCkgXHU1RjE1XHU3NTI4OiAke29sZEpzTmFtZX0gLT4gJHtuZXdKc05hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIDIuIFx1NjZGNFx1NjVCMCA8c2NyaXB0IHNyYz4gXHU2ODA3XHU3QjdFXHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjA4XHU1NDBDXHU2NUY2XHU1MzM5XHU5MTREIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdFBhdHRlcm4gPSBuZXcgUmVnRXhwKGAoPHNjcmlwdFtePl0qXFxcXHMrc3JjPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZE9sZEpzTmFtZX0pKFxcXFw/W15cIidcXFxcc10qKT8oW1wiJ11bXj5dKj4pYCwgJ2cnKTtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDIgPSBodG1sO1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShzY3JpcHRQYXR0ZXJuLCAoX21hdGNoLCBwcmVmaXgsIHBhdGgsIHF1ZXJ5LCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke3BhdGhQcmVmaXh9YXNzZXRzLyR7bmV3SnNOYW1lfWA7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtuZXdQYXRofSR7bmV3UXVlcnl9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGh0bWwgIT09IG9yaWdpbmFsSHRtbDIpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1REYyXHU2NkY0XHU2NUIwIDxzY3JpcHQgc3JjPiBcdTVGMTVcdTc1Mjg6ICR7b2xkSnNOYW1lfSAtPiAke25ld0pzTmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMy4gXHU2NkY0XHU2NUIwIDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIj4gXHU2ODA3XHU3QjdFXHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjA4XHU1NDBDXHU2NUY2XHU1MzM5XHU5MTREIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZXByZWxvYWRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxsaW5rW14+XSpcXFxccytyZWw9W1wiJ11tb2R1bGVwcmVsb2FkW1wiJ11bXj5dKlxcXFxzK2hyZWY9W1wiJ10pKFxcXFwuPy9hc3NldHMvJHtlc2NhcGVkT2xkSnNOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbXCInXVtePl0qPilgLCAnZycpO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sMyA9IGh0bWw7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG1vZHVsZXByZWxvYWRQYXR0ZXJuLCAoX21hdGNoLCBwcmVmaXgsIHBhdGgsIHF1ZXJ5LCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke3BhdGhQcmVmaXh9YXNzZXRzLyR7bmV3SnNOYW1lfWA7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NTMzOVx1OTE0RFx1NTIzMCA8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCI+IFx1NUYxNVx1NzUyODogJHtwYXRofSR7cXVlcnkgfHwgJyd9IC0+ICR7bmV3UGF0aH0ke25ld1F1ZXJ5fWApO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChodG1sICE9PSBvcmlnaW5hbEh0bWwzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNzA1IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NURGMlx1NjZGNFx1NjVCMCA8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCI+IFx1NUYxNVx1NzUyODogJHtvbGRKc05hbWV9IC0+ICR7bmV3SnNOYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTkwN1x1NzUyOFx1NjVCOVx1Njg0OFx1RkYxQVx1NTMzOVx1OTE0RFx1NjI0MFx1NjcwOSBpbXBvcnQoKSBcdThCRURcdTUzRTVcdUZGMDhcdTUzMDVcdTYyRUMgL2Fzc2V0cy8gXHU1NDhDIC4vYXNzZXRzL1x1RkYwOVx1RkYwQ1x1NEY0Nlx1NTNFQVx1NjZGNFx1NjVCMFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwQ1x1NEUwRFx1NjZGNFx1NjVCMFx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTY1ODdcdTRFRjZcdTU0MERcdTY2RjRcdTY1QjBcdTVFOTRcdThCRTVcdTVERjJcdTdFQ0ZcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1QjhDXHU2MjEwXHVGRjBDXHU4RkQ5XHU5MUNDXHU1M0VBXHU2NjJGXHU3ODZFXHU0RkREXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2QjYzXHU3ODZFXG4gICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm5GYWxsYmFjayA9IC9pbXBvcnRcXHMqXFwoXFxzKihbXCInXSkoXFwuP1xcL2Fzc2V0c1xcL1teXCInYFxcc10rXFwuKGpzfG1qcykpKFxcP1teXCInYFxcc10qKT9cXDFcXHMqXFwpL2c7XG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoaW1wb3J0UGF0dGVybkZhbGxiYWNrLCAoX21hdGNoLCBxdW90ZSwgcGF0aCwgX2V4dCwgcXVlcnkpID0+IHtcbiAgICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofSR7cXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApfSR7cXVvdGV9KWA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofT92PSR7YnVpbGRJZH0ke3F1b3RlfSlgO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhpbmRleEh0bWxQYXRoLCBodG1sLCAndXRmLTgnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTY2RjRcdTY1QjBcdTYyNDBcdTY3MDkgSlMgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4XG4gICAgICBjb25zdCBhc3NldHNEaXIgPSBqb2luKG91dHB1dERpciwgJ2Fzc2V0cycpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoYXNzZXRzRGlyKSkge1xuICAgICAgICBjb25zdCBqc0ZpbGVzID0gcmVhZGRpclN5bmMoYXNzZXRzRGlyKS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICAgIGxldCB0b3RhbEZpeGVkID0gMDtcblxuICAgICAgICBjb25zdCBhbGxGaWxlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgIGZvciAoY29uc3QgW29sZEpzTmFtZSwgbmV3SnNOYW1lXSBvZiBqc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIGFsbEZpbGVOYW1lTWFwLnNldChvbGRKc05hbWUsIG5ld0pzTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbb2xkQ3NzTmFtZSwgbmV3Q3NzTmFtZV0gb2YgY3NzRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgYWxsRmlsZU5hbWVNYXAuc2V0KG9sZENzc05hbWUsIG5ld0Nzc05hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBqc0ZpbGUgb2YganNGaWxlcykge1xuICAgICAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGpzRmlsZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc0ZpbGUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzRmlsZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc0ZpbGUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc0ZpbGUuaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICAgICAgaWYgKGlzVGhpcmRQYXJ0eUxpYikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QganNGaWxlUGF0aCA9IGpvaW4oYXNzZXRzRGlyLCBqc0ZpbGUpO1xuICAgICAgICAgIGxldCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGpzRmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBbb2xkRmlsZU5hbWUsIG5ld0ZpbGVOYW1lXSBvZiBhbGxGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRGaWxlTmFtZSA9IG9sZEZpbGVOYW1lLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgaW1wb3J0XFxcXHMqXFxcXChcXFxccyooW1wiJ1xcYF0pL2Fzc2V0cy8ke2VzY2FwZWRPbGRGaWxlTmFtZX0oPyFbYS16QS1aMC05LV0pKFxcXFw/W15cIidcXFxcc10qKT9cXFxcMVxcXFxzKlxcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKS9hc3NldHMvJHtlc2NhcGVkT2xkRmlsZU5hbWV9KD8hW2EtekEtWjAtOS1dKShcXFxcP1teXCInXFxcXHNdKik/XFxcXDFgLCAnZycpLFxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pXFxcXC4vJHtlc2NhcGVkT2xkRmlsZU5hbWV9KD8hW2EtekEtWjAtOS1dKShcXFxcP1teXCInXFxcXHNdKik/XFxcXDFgLCAnZycpLFxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pYXNzZXRzLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSkoXFxcXD9bXlwiJ1xcXFxzXSopP1xcXFwxYCwgJ2cnKSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHBhdHRlcm5zLmZvckVhY2gocGF0dGVybiA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygnaW1wb3J0XFxcXHMqXFxcXCgnKSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKF9tYXRjaCwgcXVvdGUsIHF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UXVlcnkgPSBxdWVyeSA/IHF1ZXJ5LnJlcGxhY2UoL1xcP3Y9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoJHtxdW90ZX0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3F1b3RlfSlgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZW50ICE9PSBvcmlnaW5hbENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSB8fCBuZXdGaWxlTmFtZS5lbmRzV2l0aCgnLm1qcycpKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChtYXRjaCwgcXVvdGUsIHF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgL2Fzc2V0cy8ke25ld0ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJy4vJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC4vJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYGFzc2V0cy8ke25ld0ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9cXD92PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7cXVvdGV9YDtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09IG9yaWdpbmFsQ29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKG1hdGNoLCBxdW90ZSwgX3F1ZXJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgL2Fzc2V0cy8ke25ld0ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJy4vJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC4vJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYGFzc2V0cy8ke25ld0ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke25ld1BhdGh9JHtxdW90ZX1gO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBpZiAoY29udGVudCAhPT0gb3JpZ2luYWxDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGZhbGxiYWNrSW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbXCInXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzKSkoXFw/W15cIidgXFxzXSopP1xcMVxccypcXCkvZztcbiAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGZhbGxiYWNrSW1wb3J0UGF0dGVybiwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIF9leHQ6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHF1ZXJ5ICYmIHF1ZXJ5LmluY2x1ZGVzKCd2PScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofSR7cXVlcnkucmVwbGFjZSgvXFw/dj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCl9JHtxdW90ZX0pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtwYXRofT92PSR7YnVpbGRJZH0ke3F1b3RlfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGpzRmlsZVBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgICAgdG90YWxGaXhlZCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3RhbEZpeGVkID4gMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSBcdTVERjJcdTU3Mjggd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU2NkY0XHU2NUIwICR7dG90YWxGaXhlZH0gXHU0RTJBIEpTIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbi8qKlxuICogXHU0RkVFXHU1OTBEXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RTJEXHU3Njg0XHU2NUU3IGhhc2ggXHU1RjE1XHU3NTI4XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXhEeW5hbWljSW1wb3J0SGFzaFBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjaHVua05hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2ZpeC1keW5hbWljLWltcG9ydC1oYXNoJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNodW5rTmFtZU1hcC5jbGVhcigpO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpbGVOYW1lIG9mIE9iamVjdC5rZXlzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuanMkLywgJycpO1xuICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IGJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspPyQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSk/JC8pO1xuICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSBuYW1lTWF0Y2hbMV07XG4gICAgICAgICAgICBpZiAoIWNodW5rTmFtZU1hcC5oYXMobmFtZVByZWZpeCkpIHtcbiAgICAgICAgICAgICAgY2h1bmtOYW1lTWFwLnNldChuYW1lUHJlZml4LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIFx1NjUzNlx1OTZDNlx1NTIzMCAke2NodW5rTmFtZU1hcC5zaXplfSBcdTRFMkEgY2h1bmsgXHU2NjIwXHU1QzA0YCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGZpbGVOYW1lLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2ZW5kb3InKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBuZXdDb2RlID0gY2h1bmtBbnkuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgICAgICBjb25zdCByZXBsYWNlbWVudHM6IEFycmF5PHsgb2xkOiBzdHJpbmc7IG5ldzogc3RyaW5nIH0+ID0gW107XG5cbiAgICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqKFtcIiddKShcXC4/XFwvP2Fzc2V0c1xcLyhbXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSkpXFwxXFxzKlxcKS9nO1xuICAgICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgICBpbXBvcnRQYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IGltcG9ydFBhdHRlcm4uZXhlYyhuZXdDb2RlKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1b3RlID0gbWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGUgPSBtYXRjaFszXTtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxNYXRjaCA9IG1hdGNoWzBdO1xuXG4gICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgaWYgKCFleGlzdHNJbkJ1bmRsZSkge1xuICAgICAgICAgICAgICBjb25zdCByZWZNYXRjaCA9IHJlZmVyZW5jZWRGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAocmVmTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbLCBuYW1lUHJlZml4XSA9IHJlZk1hdGNoO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbEZpbGUgPSBjaHVua05hbWVNYXAuZ2V0KG5hbWVQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbEZpbGVOYW1lID0gYWN0dWFsRmlsZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgICAgICAgICAgbGV0IG5ld1BhdGggPSBmdWxsUGF0aDtcbiAgICAgICAgICAgICAgICAgIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZ1bGxQYXRoLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgLi9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGBhc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGFjdHVhbEZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG9sZDogZnVsbE1hdGNoLFxuICAgICAgICAgICAgICAgICAgICBuZXc6IGBpbXBvcnQoJHtxdW90ZX0ke25ld1BhdGh9JHtxdW90ZX0pYFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc3RyaW5nUGF0aFBhdHRlcm4gPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKSlcXDEvZztcbiAgICAgICAgICBzdHJpbmdQYXRoUGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBzdHJpbmdQYXRoUGF0dGVybi5leGVjKG5ld0NvZGUpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcXVvdGUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGZ1bGxQYXRoID0gbWF0Y2hbMl07IC8vIFx1NjcyQVx1NEY3Rlx1NzUyOFxuICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGUgPSBtYXRjaFszXTtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxNYXRjaCA9IG1hdGNoWzBdO1xuXG4gICAgICAgICAgICBjb25zdCBhbHJlYWR5Rml4ZWQgPSByZXBsYWNlbWVudHMuc29tZShyID0+IHIub2xkID09PSBmdWxsTWF0Y2ggfHwgci5vbGQuaW5jbHVkZXMocmVmZXJlbmNlZEZpbGUpKTtcbiAgICAgICAgICAgIGlmIChhbHJlYWR5Rml4ZWQpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0luQnVuZGxlID0gT2JqZWN0LmtleXMoYnVuZGxlKS5zb21lKGYgPT4gZiA9PT0gYGFzc2V0cy8ke3JlZmVyZW5jZWRGaWxlfWAgfHwgZi5lbmRzV2l0aChgLyR7cmVmZXJlbmNlZEZpbGV9YCkpO1xuXG4gICAgICAgICAgICBpZiAoIWV4aXN0c0luQnVuZGxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlZk1hdGNoID0gcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgIGlmIChyZWZNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgb2xkOiBmdWxsTWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgIG5ldzogYCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9YFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudHMucmV2ZXJzZSgpLmZvckVhY2goKHsgb2xkLCBuZXc6IG5ld1N0ciB9KSA9PiB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uob2xkLCBuZXdTdHIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICBjaHVua0FueS5jb2RlID0gbmV3Q29kZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBvdXRwdXREaXIgPSBvcHRpb25zLmRpciB8fCBqb2luKHByb2Nlc3MuY3dkKCksICdkaXN0Jyk7XG4gICAgICBjaHVua05hbWVNYXAuY2xlYXIoKTtcblxuICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBPYmplY3Qua2V5cyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykgJiYgZmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICBjb25zdCBjbGVhbkJhc2VOYW1lID0gYmFzZU5hbWUucmVwbGFjZSgvLSskLywgJycpO1xuICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IGNsZWFuQmFzZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/JC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhbkJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/JC8pO1xuICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSBuYW1lTWF0Y2hbMV07XG4gICAgICAgICAgICBpZiAoIWNodW5rTmFtZU1hcC5oYXMobmFtZVByZWZpeCkpIHtcbiAgICAgICAgICAgICAgY2h1bmtOYW1lTWFwLnNldChuYW1lUHJlZml4LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCB0b3RhbEZpeGVkID0gMDtcbiAgICAgIGNvbnN0IHRoaXJkUGFydHlDaHVua3MgPSBbJ2xpYi1lY2hhcnRzJywgJ2VsZW1lbnQtcGx1cycsICd2dWUtY29yZScsICd2dWUtcm91dGVyJywgJ3ZlbmRvciddO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSB0aGlyZFBhcnR5Q2h1bmtzLnNvbWUobGliID0+IGZpbGVOYW1lLmluY2x1ZGVzKGxpYikpO1xuICAgICAgICAgIGNvbnN0IGlzRUNoYXJ0c0xpYiA9IGZpbGVOYW1lLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpO1xuXG4gICAgICAgICAgaWYgKGlzVGhpcmRQYXJ0eUxpYiAmJiAhaXNFQ2hhcnRzTGliKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4ob3V0cHV0RGlyLCBmaWxlTmFtZSk7XG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBsZXQgY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudHM6IEFycmF5PHsgb2xkOiBzdHJpbmc7IG5ldzogc3RyaW5nIH0+ID0gW107XG5cbiAgICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccyooW1wiJ10pKFxcLj9cXC8/YXNzZXRzXFwvKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKSlcXDFcXHMqXFwpL2c7XG4gICAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgICBpbXBvcnRQYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gaW1wb3J0UGF0dGVybi5leGVjKGNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjb25zdCBxdW90ZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VkRmlsZSA9IG1hdGNoWzNdO1xuICAgICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTtcblxuICAgICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgICBpZiAoIWV4aXN0c0luQnVuZGxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGVDbGVhbiA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoLy0rXFwuKGpzfG1qc3xjc3MpJC8sICcuJDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZNYXRjaCA9IHJlZmVyZW5jZWRGaWxlQ2xlYW4ubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZUNsZWFuLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICAgIGlmIChyZWZNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZVByZWZpeCA9IHJlZk1hdGNoWzFdO1xuICAgICAgICAgICAgICAgICAgbGV0IGFjdHVhbEZpbGUgPSBjaHVua05hbWVNYXAuZ2V0KG5hbWVQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoIWFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVmUHJlZml4ID0gcmVmZXJlbmNlZEZpbGVDbGVhbi5yZXBsYWNlKC9cXC4oanN8bWpzfGNzcykkLywgJycpLnJlcGxhY2UoLy1bYS16QS1aMC05XXs4LH0oPzotW2EtekEtWjAtOV0rKT8kLywgJycpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtleGlzdGluZ0ZpbGVOYW1lXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nRmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpICYmIGV4aXN0aW5nRmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0ZpbGVCYXNlTmFtZSA9IGV4aXN0aW5nRmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKS5yZXBsYWNlKC9cXC5qcyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0ZpbGVCYXNlTmFtZUNsZWFuID0gZXhpc3RpbmdGaWxlQmFzZU5hbWUucmVwbGFjZSgvLSskLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcmVmaXggPSBleGlzdGluZ0ZpbGVCYXNlTmFtZUNsZWFuLnJlcGxhY2UoLy1bYS16QS1aMC05XXs4LH0oPzotW2EtekEtWjAtOV0rKT8kLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJlZml4ID09PSByZWZQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsRmlsZSA9IGV4aXN0aW5nRmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1BhdGggPSBmdWxsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bGxQYXRoLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZ1bGxQYXRoLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGAuL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZnVsbFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGBhc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBhY3R1YWxGaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICBvbGQ6IGZ1bGxNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgICBuZXc6IGBpbXBvcnQoJHtxdW90ZX0ke25ld1BhdGh9JHtxdW90ZX0pYFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc3RyaW5nUGF0aFBhdHRlcm4gPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvKFteXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKSlcXDEvZztcbiAgICAgICAgICAgIHN0cmluZ1BhdGhQYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gc3RyaW5nUGF0aFBhdHRlcm4uZXhlYyhjb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcXVvdGUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgLy8gY29uc3QgZnVsbFBhdGggPSBtYXRjaFsyXTsgLy8gXHU2NzJBXHU0RjdGXHU3NTI4XG4gICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlID0gbWF0Y2hbM107XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxNYXRjaCA9IG1hdGNoWzBdO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGFscmVhZHlGaXhlZCA9IHJlcGxhY2VtZW50cy5zb21lKHIgPT4gci5vbGQgPT09IGZ1bGxNYXRjaCB8fCByLm9sZC5pbmNsdWRlcyhyZWZlcmVuY2VkRmlsZSkpO1xuICAgICAgICAgICAgICBpZiAoYWxyZWFkeUZpeGVkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgICBpZiAoIWV4aXN0c0luQnVuZGxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGVDbGVhbiA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoLy0rXFwuKGpzfG1qc3xjc3MpJC8sICcuJDEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZNYXRjaCA9IHJlZmVyZW5jZWRGaWxlQ2xlYW4ubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LVthLXpBLVowLTldezgsfSkrKD86LVthLXpBLVowLTldKyk/XFwuKGpzfG1qc3xjc3MpJC8pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZUNsZWFuLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICAgIGlmIChyZWZNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZVByZWZpeCA9IHJlZk1hdGNoWzFdO1xuICAgICAgICAgICAgICAgICAgbGV0IGFjdHVhbEZpbGUgPSBjaHVua05hbWVNYXAuZ2V0KG5hbWVQcmVmaXgpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoIWFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVmUHJlZml4ID0gcmVmZXJlbmNlZEZpbGVDbGVhbi5yZXBsYWNlKC9cXC4oanN8bWpzfGNzcykkLywgJycpLnJlcGxhY2UoLy1bYS16QS1aMC05XXs4LH0oPzotW2EtekEtWjAtOV0rKT8kLywgJycpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtleGlzdGluZ0ZpbGVOYW1lXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nRmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpICYmIGV4aXN0aW5nRmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0ZpbGVCYXNlTmFtZSA9IGV4aXN0aW5nRmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKS5yZXBsYWNlKC9cXC5qcyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0ZpbGVCYXNlTmFtZUNsZWFuID0gZXhpc3RpbmdGaWxlQmFzZU5hbWUucmVwbGFjZSgvLSskLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcmVmaXggPSBleGlzdGluZ0ZpbGVCYXNlTmFtZUNsZWFuLnJlcGxhY2UoLy1bYS16QS1aMC05XXs4LH0oPzotW2EtekEtWjAtOV0rKT8kLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJlZml4ID09PSByZWZQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsRmlsZSA9IGV4aXN0aW5nRmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcblxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgb2xkOiBmdWxsTWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgbmV3OiBgJHtxdW90ZX0ke25ld1BhdGh9JHtxdW90ZX1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVwbGFjZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnJldmVyc2UoKS5mb3JFYWNoKCh7IG9sZCwgbmV3OiBuZXdTdHIgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2Uob2xkLCBuZXdTdHIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIHRvdGFsRml4ZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRvdGFsRml4ZWQgPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZml4LWR5bmFtaWMtaW1wb3J0LWhhc2hdIFx1MjcwNSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTUxNzFcdTRGRUVcdTU5MEQgJHt0b3RhbEZpeGVkfSBcdTRFMkFcdTY1ODdcdTRFRjZgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVybC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHNcIjsvKipcbiAqIFVSTCBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTZCNjNcdTc4NkVcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBDaHVua0luZm8sIE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsOiBzdHJpbmcsIGFwcEhvc3Q6IHN0cmluZywgYXBwUG9ydDogbnVtYmVyLCBtYWluQXBwUG9ydDogc3RyaW5nKTogUGx1Z2luIHtcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBiYXNlVXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtYmFzZS11cmwnLFxuICAgIHJlbmRlckNodW5rKGNvZGU6IHN0cmluZywgY2h1bms6IENodW5rSW5mbywgX29wdGlvbnM6IGFueSkge1xuICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgIC8vIFx1NTZFMFx1NEUzQSB2ZW5kb3IgXHU3QjQ5XHU1RTkzXHU0RTJEXHU0RTVGXHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XG5cbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspKFxcP1teXCInYFxcc10qKT8vZztcbiAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoLCBxdW90ZSwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8ke2FwcEhvc3R9OiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRIdHRwUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vJHthcHBIb3N0fToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIHJldHVybiBgLy8ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYCgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKSgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdO1xuXG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4ucmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocGF0dGVybi5yZWdleCwgcGF0dGVybi5yZXBsYWNlbWVudCBhcyBhbnkpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiAke2NodW5rLmZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODQgKCR7bWFpbkFwcFBvcnR9IC0+ICR7YXBwUG9ydH0pYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogbmV3Q29kZSxcbiAgICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmsuY29kZSkge1xuICAgICAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjaHVuay5jb2RlO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8ke2FwcEhvc3R9OiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLyR7YXBwSG9zdH06JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gYC8vJHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NEZFRVx1NTkwRFx1NEU4NiAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmsudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZSA9PT0gJ2luZGV4Lmh0bWwnKSB7XG4gICAgICAgICAgLy8gXHU1OTA0XHU3NDA2IEhUTUwgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1OTgyXHU2NzlDIFZpdGUgXHU5MTREXHU3RjZFXHU2QjYzXHU3ODZFXHVGRjA4YmFzZTogJy8nLCBhc3NldHNEaXI6ICdhc3NldHMnLCByb2xsdXBPcHRpb25zLm91dHB1dC5jaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJ1x1RkYwOVx1RkYwQ1xuICAgICAgICAgIC8vIFZpdGUgXHU1RTk0XHU4QkU1XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU2QjYzXHU3ODZFXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXHUzMDAyXG4gICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU1M0VBXHU1OTA0XHU3NDA2XHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU3Njg0XHU3QUVGXHU1M0UzXHU0RkVFXHU1OTBEXHVGRjBDXHU0RUU1XHU1M0NBXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHUzMDAyXG4gICAgICAgICAgbGV0IGh0bWxDb250ZW50ID0gKGNodW5rIGFzIGFueSkuc291cmNlIGFzIHN0cmluZztcbiAgICAgICAgICBsZXQgaHRtbE1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgLi9hc3NldHMvIFx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCAvYXNzZXRzL1x1RkYwOFx1NTk4Mlx1Njc5Q1x1NTFGQVx1NzNCMFx1RkYwOVxuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlQXNzZXRSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLlxcL2Fzc2V0c1xcL1teXCInXSspKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlQXNzZXRSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJlbGF0aXZlQXNzZXRSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTVDMDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwuLywgJycpO1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0OiAke3BhdGh9IC0+ICR7YWJzb2x1dGVQYXRofWApO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke2Fic29sdXRlUGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NTFGQVx1NzNCMFx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwOFx1NTk4MiAvaW5kZXguanNcdUZGMDlcdUZGMENcdThCRjRcdTY2MEVcdTkxNERcdTdGNkVcdTY3MDlcdTk1RUVcdTk4OThcdUZGMENcdThCQjBcdTVGNTVcdThCNjZcdTU0NEFcbiAgICAgICAgICAvLyBcdTZCNjNcdTVFMzhcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENWaXRlIFx1NUU5NFx1OEJFNVx1NzUxRlx1NjIxMCAvYXNzZXRzL1tuYW1lXS1baGFzaF0uanMgXHU4RkQ5XHU2ODM3XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgY29uc3Qgcm9vdEpzUmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC8oW14vXStcXC4oanN8bWpzKSkpKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJvb3RKc1JlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gaHRtbENvbnRlbnQubWF0Y2gocm9vdEpzUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwQ1x1OEZEOVx1OTAxQVx1NUUzOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTFGQVx1NzNCMFx1MzAwMlx1OEJGN1x1NjhDMFx1NjdFNSBWaXRlIFx1OTE0RFx1N0Y2RVx1RkYwOGJhc2UsIGFzc2V0c0Rpciwgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXNcdUZGMDk6YCwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1OEZEOVx1NEU5Qlx1OERFRlx1NUY4NFx1RkYwOFx1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1NjVCOVx1Njg0OFx1RkYwOVxuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uocm9vdEpzUmVnZXgsIChfbWF0Y2gsIGF0dHIsIHBhdGgsIGZpbGVOYW1lLCBfZXh0LCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2Zhdmljb24nKSAmJiAhcGF0aC5zdGFydHNXaXRoKCcvbG9nbycpICYmICFwYXRoLm1hdGNoKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnxzdmd8aWNvfGpzb24pJC8pKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCByb290Q3NzUmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC8oW14vXStcXC5jc3MpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290Q3NzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290Q3NzUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFOmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RDc3NSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNvcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50c1wiOy8qKlxuICogQ09SUyBcdTYzRDJcdTRFRjZcbiAqIFx1NjUyRlx1NjMwMSBjcmVkZW50aWFscyBcdTc2ODQgQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuXG4vKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3JzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGNvcnNEZXZNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICBjb25zdCBjb3JzUHJldmlld01pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgfVxuXG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY29ycy13aXRoLWNyZWRlbnRpYWxzJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNEZXZNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc0Rldk1pZGRsZXdhcmUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29uZmlndXJlUHJldmlld1NlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2sgPSBzdGFjay5maWx0ZXIoKGl0ZW06IGFueSkgPT5cbiAgICAgICAgICBpdGVtLmhhbmRsZSAhPT0gY29yc0Rldk1pZGRsZXdhcmUgJiYgaXRlbS5oYW5kbGUgIT09IGNvcnNQcmV2aWV3TWlkZGxld2FyZVxuICAgICAgICApO1xuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc1ByZXZpZXdNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc1ByZXZpZXdNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHNcIjsvKipcbiAqIENTUyBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuLyoqXG4gKiBcdTc4NkVcdTRGREQgQ1NTIFx1NjU4N1x1NEVGNlx1ODhBQlx1NkI2M1x1Nzg2RVx1NjI1M1x1NTMwNVx1NzY4NFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQ3NzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1jc3MtcGx1Z2luJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGpzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpKTtcbiAgICAgIGxldCBoYXNJbmxpbmVDc3MgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHN1c3BpY2lvdXNGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAganNGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlXSBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVuayAmJiBjaHVuay5jb2RlICYmIHR5cGVvZiBjaHVuay5jb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGNvZGUgPSBjaHVuay5jb2RlO1xuXG4gICAgICAgICAgY29uc3QgaXNNb2R1bGVQcmVsb2FkID0gY29kZS5pbmNsdWRlcygnbW9kdWxlcHJlbG9hZCcpIHx8IGNvZGUuaW5jbHVkZXMoJ3JlbExpc3QnKTtcbiAgICAgICAgICBpZiAoaXNNb2R1bGVQcmVsb2FkKSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBpc0tub3duTGlicmFyeSA9IGZpbGUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2ZW5kb3InKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndnVlLWkxOG4nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdtb2R1bGUtJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1jb21wb3NhYmxlcycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdhcHAtcGFnZXMnKTtcbiAgICAgICAgICBpZiAoaXNLbm93bkxpYnJhcnkpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlRWxlbWVudENyZWF0aW9uID0gL2RvY3VtZW50XFwuY3JlYXRlRWxlbWVudFxcKFsnXCJdc3R5bGVbJ1wiXVxcKS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xcLih0ZXh0Q29udGVudHxpbm5lckhUTUwpXFxzKj0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezEwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBoYXNJbnNlcnRTdHlsZVdpdGhDc3MgPSAvaW5zZXJ0U3R5bGVcXHMqXFwoLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvdGV4dFxcL2Nzcy8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MjAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IHN0eWxlVGFnTWF0Y2ggPSBjb2RlLm1hdGNoKC88c3R5bGVbXj5dKj4vKTtcbiAgICAgICAgICBjb25zdCBoYXNTdHlsZVRhZ1dpdGhDb250ZW50ID0gc3R5bGVUYWdNYXRjaCAmJlxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoXCInXCIpICYmXG4gICAgICAgICAgICAhc3R5bGVUYWdNYXRjaFswXS5pbmNsdWRlcygnXCInKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MjAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IGhhc0lubGluZUNzc1N0cmluZyA9IC9bJ1wiYF1bXidcImBdezUwLH06XFxzKlteJ1wiYF17MTAsfTtcXHMqW14nXCJgXXsxMCx9WydcImBdLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvKGNvbG9yfGJhY2tncm91bmR8d2lkdGh8aGVpZ2h0fG1hcmdpbnxwYWRkaW5nfGJvcmRlcnxkaXNwbGF5fHBvc2l0aW9ufGZsZXh8Z3JpZCkvLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gfHwgaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzIHx8IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgfHwgaGFzSW5saW5lQ3NzU3RyaW5nKSB7XG4gICAgICAgICAgICBoYXNJbmxpbmVDc3MgPSB0cnVlO1xuICAgICAgICAgICAgc3VzcGljaW91c0ZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGlmIChoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbikgcGF0dGVybnMucHVzaCgnXHU1MkE4XHU2MDAxXHU1MjFCXHU1RUZBIHN0eWxlIFx1NTE0M1x1N0QyMCcpO1xuICAgICAgICAgICAgaWYgKGhhc0luc2VydFN0eWxlV2l0aENzcykgcGF0dGVybnMucHVzaCgnaW5zZXJ0U3R5bGUgXHU1MUZEXHU2NTcwJyk7XG4gICAgICAgICAgICBpZiAoaGFzU3R5bGVUYWdXaXRoQ29udGVudCkgcGF0dGVybnMucHVzaCgnPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgICAgIGlmIChoYXNJbmxpbmVDc3NTdHJpbmcpIHBhdHRlcm5zLnB1c2goJ1x1NTE4NVx1ODA1NCBDU1MgXHU1QjU3XHU3QjI2XHU0RTMyJyk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NTcyOCAke2ZpbGV9IFx1NEUyRFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NTNFRlx1ODBGRFx1NzY4NFx1NTE4NVx1ODA1NCBDU1NcdUZGMDhcdTZBMjFcdTVGMEZcdUZGMUEke3BhdHRlcm5zLmpvaW4oJywgJyl9XHVGRjA5YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGhhc0lubGluZUNzcykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NjhDMFx1NkQ0Qlx1NTIzMCBDU1MgXHU1M0VGXHU4MEZEXHU4OEFCXHU1MTg1XHU4MDU0XHU1MjMwIEpTIFx1NEUyRFx1RkYwQ1x1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNCBxaWFua3VuIFx1NjVFMFx1NkNENVx1NkI2M1x1Nzg2RVx1NTJBMFx1OEY3RFx1NjgzN1x1NUYwRicpO1xuICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHU1M0VGXHU3NTkxXHU2NTg3XHU0RUY2XHVGRjFBJHtzdXNwaWNpb3VzRmlsZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1OEJGN1x1NjhDMFx1NjdFNSB2aXRlLXBsdWdpbi1xaWFua3VuIFx1OTE0RFx1N0Y2RVx1NTQ4QyBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdThCQkVcdTdGNkUnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgY3NzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG4gICAgICBpZiAoY3NzRmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzRDIFx1OTUxOVx1OEJFRlx1RkYxQVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjVFMCBDU1MgXHU2NTg3XHU0RUY2XHVGRjAxJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1XHVGRjFBJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzEuIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE2OFx1NUM0MFx1NjgzN1x1NUYwRlx1RkYwOGluZGV4LmNzcy91bm8uY3NzL2VsZW1lbnQtcGx1cy5jc3NcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMi4gXHU2NjJGXHU1NDI2XHU2NzA5IFZ1ZSBcdTdFQzRcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjggPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMy4gVW5vQ1NTIFx1OTE0RFx1N0Y2RVx1NjYyRlx1NTQyNlx1NkI2M1x1Nzg2RVx1RkYwQ1x1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NSBAdW5vY3NzIGFsbCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc0LiB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzY4NCB1c2VEZXZNb2RlIFx1NjYyRlx1NTQyNlx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NkI2M1x1Nzg2RVx1NTE3M1x1OTVFRCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc1LiBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdTY2MkZcdTU0MjZcdThCQkVcdTdGNkVcdTRFM0EgMFx1RkYwOFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1RkYwOScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIGNzc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICAgIGlmIChhc3NldCAmJiBhc3NldC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVLQiA9IChhc3NldC5zb3VyY2UubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gJHtmaWxlfTogJHtzaXplS0J9S0JgKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFzc2V0ICYmIGFzc2V0LmZpbGVOYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtICR7YXNzZXQuZmlsZU5hbWUgfHwgZmlsZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdmVyc2lvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy92ZXJzaW9uLnRzXCI7LyoqXG4gKiBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqIFx1NEUzQSBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NTE2OFx1NUM0MFx1N0VERlx1NEUwMFx1NzY4NFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU3NTI4XHU0RThFXHU2RDRGXHU4OUM4XHU1NjY4XHU3RjEzXHU1QjU4XHU2M0E3XHU1MjM2XHVGRjBDXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU0RjFBXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyMTZcdTc1MUZcdTYyMTBcdTUxNjhcdTVDNDBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwQ1x1OTBGRFx1NkNBMVx1NjcwOVx1NTIxOVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFxuICovXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICAvLyAxLiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMDhcdTc1MzFcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdThCQkVcdTdGNkVcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuXG4gIC8vIDIuIFx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1NUZGRFx1NzU2NVx1OEJGQlx1NTNENlx1OTUxOVx1OEJFRlxuICAgIH1cbiAgfVxuXG4gIC8vIDMuIFx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1NUU3Nlx1NEZERFx1NUI1OFx1NTIzMFx1NjU4N1x1NEVGNlx1RkYwOFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTQwQ1x1NEUwMFx1NEUyQVx1RkYwOVxuICAvLyBcdTRGN0ZcdTc1MjgzNlx1OEZEQlx1NTIzNlx1N0YxNlx1NzgwMVx1RkYwQ1x1NzUxRlx1NjIxMFx1NjZGNFx1NzdFRFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NTMwNVx1NTQyQlx1NUI1N1x1NkJDRFx1NTQ4Q1x1NjU3MFx1NUI1N1x1RkYwQ1x1NTk4MiBsM2syajFoXHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICB0cnkge1xuICAgIHdyaXRlRmlsZVN5bmModGltZXN0YW1wRmlsZSwgdGltZXN0YW1wLCAndXRmLTgnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTVGRkRcdTc1NjVcdTUxOTlcdTUxNjVcdTk1MTlcdThCRUZcbiAgfVxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuXG4vKipcbiAqIFx1NEUzQSBIVE1MIFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVyc2lvblBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wKCk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVml0ZSBQbHVnaW4gXHU3QzdCXHU1NzhCXHU1QjlBXHU0RTQ5XHU1M0VGXHU4MEZEXHU0RTBEXHU1QjhDXHU2NTc0XHVGRjBDbmFtZSBcdTVDNUVcdTYwMjdcdTY2MkZcdTY4MDdcdTUxQzZcdTVDNUVcdTYwMjdcbiAgICBuYW1lOiAnYWRkLXZlcnNpb24nLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW2FkZC12ZXJzaW9uXSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjc6ICR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBpZiAoY2h1bmsudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZSA9PT0gJ2luZGV4Lmh0bWwnKSB7XG4gICAgICAgICAgbGV0IGh0bWxDb250ZW50ID0gKGNodW5rIGFzIGFueSkuc291cmNlIGFzIHN0cmluZztcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NEUzQSBzY3JpcHQgXHU2ODA3XHU3QjdFXHU3Njg0IHNyYyBcdTVDNUVcdTYwMjdcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcbiAgICAgICAgICBjb25zdCBzY3JpcHRSZWdleCA9IC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2c7XG4gICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHNjcmlwdFJlZ2V4LCAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU1REYyXHU2NzA5XHU3MjQ4XHU2NzJDXHU1M0Y3XHU3Njg0XHU4RDQ0XHU2RTkwXHVGRjA4XHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU2REZCXHU1MkEwXHVGRjA5XG4gICAgICAgICAgICBpZiAoc3JjLmluY2x1ZGVzKCc/dj0nKSB8fCBzcmMuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwQ1x1NjZGNFx1NjVCMFx1NEUzQVx1NUY1M1x1NTI0RFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkU3JjID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZFNyYyAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkU3JjfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1M0VBXHU0RTNBIC9hc3NldHMvIFx1OERFRlx1NUY4NFx1NzY4NFx1OEQ0NFx1NkU5MFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHNyYy5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7c3JjfSR7c2VwYXJhdG9yfXY9JHtidWlsZFRpbWVzdGFtcH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gXHU0RTNBIGxpbmsgXHU2ODA3XHU3QjdFXHU3Njg0IGhyZWYgXHU1QzVFXHU2MDI3XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgY29uc3QgbGlua1JlZ2V4ID0gLyg8bGlua1tePl0qXFxzK2hyZWY9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nO1xuICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShsaW5rUmVnZXgsIChtYXRjaCwgcHJlZml4LCBocmVmLCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NURGMlx1NjcwOVx1NzI0OFx1NjcyQ1x1NTNGN1x1NzY4NFx1OEQ0NFx1NkU5MFx1RkYwOFx1OTA3Rlx1NTE0RFx1OTFDRFx1NTkwRFx1NkRGQlx1NTJBMFx1RkYwOVxuICAgICAgICAgICAgaWYgKGhyZWYuaW5jbHVkZXMoJz92PScpIHx8IGhyZWYuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwQ1x1NjZGNFx1NjVCMFx1NEUzQVx1NUY1M1x1NTI0RFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkSHJlZiA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkSHJlZiAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZEhyZWZ9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTUzRUFcdTRFM0EgL2Fzc2V0cy8gXHU4REVGXHU1Rjg0XHU3Njg0XHU4RDQ0XHU2RTkwXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBocmVmLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPyc7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtocmVmfSR7c2VwYXJhdG9yfXY9JHtidWlsZFRpbWVzdGFtcH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbYWRkLXZlcnNpb25dIFx1NURGMlx1NEUzQSBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGNzogdj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvbHZlLWxvZ28udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1sb2dvLnRzXCI7LyoqXHJcbiAqIExvZ28gXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU2M0QyXHU0RUY2XHJcbiAqIFx1NzUyOFx1NEU4RVx1NTcyOFx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NjVGNlx1ODlFM1x1Njc5MCAvbG9nby5wbmcgXHU4REVGXHU1Rjg0XHJcbiAqIFx1NUY1MyBwdWJsaWNEaXIgXHU4OEFCXHU3OTgxXHU3NTI4XHU2NUY2XHVGRjBDXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU4OUUzXHU2NzkwIGxvZ28ucG5nIFx1NzY4NFx1OERFRlx1NUY4NFx1NUU3Nlx1NTkwRFx1NTIzNlx1NjU4N1x1NEVGNlxyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIGNvcHlGaWxlU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUxvZ29QbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xyXG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAncmVzb2x2ZS1sb2dvJyxcclxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcclxuICAgIFxyXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xyXG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgcmVzb2x2ZUlkKGlkOiBzdHJpbmcpIHtcclxuICAgICAgLy8gXHU1OTA0XHU3NDA2IC9sb2dvLnBuZyBcdTYyMTYgbG9nby5wbmcgXHU3Njg0XHU4OUUzXHU2NzkwXHJcbiAgICAgIGlmIChpZCA9PT0gJy9sb2dvLnBuZycgfHwgaWQgPT09ICdsb2dvLnBuZycpIHtcclxuICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcdTgzQjdcdTUzRDYgbG9nby5wbmdcclxuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljL2xvZ28ucG5nJyk7XHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc2hhcmVkTG9nb1BhdGgpKSB7XHJcbiAgICAgICAgICByZXR1cm4gc2hhcmVkTG9nb1BhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHU4M0I3XHU1M0Q2XHVGRjA4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzA5XHVGRjA5XHJcbiAgICAgICAgY29uc3QgYXBwTG9nb1BhdGggPSByZXNvbHZlKGFwcERpciwgJ3B1YmxpYy9sb2dvLnBuZycpO1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKGFwcExvZ29QYXRoKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGFwcExvZ29QYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTcgSURcclxuICAgICAgICByZXR1cm4gYFxcMGxvZ28ucG5nYDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xyXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTUxODVcdTVCQjlcdUZGMDhcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdTRGMUFcdTU3MjggY2xvc2VCdW5kbGUgXHU2NUY2XHU1OTBEXHU1MjM2XHVGRjA5XHJcbiAgICAgIGlmIChpZCA9PT0gJ1xcMGxvZ28ucG5nJykge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGNsb3NlQnVuZGxlKCkge1xyXG4gICAgICAvLyBcdTU3MjhcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdTU5MERcdTUyMzYgbG9nby5wbmcgXHU1MjMwIGRpc3QgXHU3NkVFXHU1RjU1XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290ID0gdml0ZUNvbmZpZy5yb290IHx8IGFwcERpcjtcclxuICAgICAgICBcclxuICAgICAgICAvLyBcdTRGMThcdTUxNDhcdTRFQ0VcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcdTgzQjdcdTUzRDYgbG9nby5wbmdcclxuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUocm9vdCwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYy9sb2dvLnBuZycpO1xyXG4gICAgICAgIGxldCBsb2dvU291cmNlUGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc2hhcmVkTG9nb1BhdGgpKSB7XHJcbiAgICAgICAgICBsb2dvU291cmNlUGF0aCA9IHNoYXJlZExvZ29QYXRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTVFOTRcdTc1MjhcdTgxRUFcdTVERjFcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVx1ODNCN1x1NTNENlxyXG4gICAgICAgICAgY29uc3QgYXBwTG9nb1BhdGggPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvbG9nby5wbmcnKTtcclxuICAgICAgICAgIGlmIChleGlzdHNTeW5jKGFwcExvZ29QYXRoKSkge1xyXG4gICAgICAgICAgICBsb2dvU291cmNlUGF0aCA9IGFwcExvZ29QYXRoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoIWxvZ29Tb3VyY2VQYXRoKSB7XHJcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OTc1OVx1OUVEOFx1OERGM1x1OEZDN1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHJcbiAgICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xyXG4gICAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKHJvb3QsIG91dERpcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XHJcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OERGM1x1OEZDN1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9nb0Rlc3RQYXRoID0gcmVzb2x2ZShkaXN0RGlyLCAnbG9nby5wbmcnKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcclxuICAgICAgICBjb25zdCBkZXN0RGlyID0gZGlybmFtZShsb2dvRGVzdFBhdGgpO1xyXG4gICAgICAgIGlmICghZXhpc3RzU3luYyhkZXN0RGlyKSkge1xyXG4gICAgICAgICAgbWtkaXJTeW5jKGRlc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gXHU1OTBEXHU1MjM2XHU2NTg3XHU0RUY2XHJcbiAgICAgICAgY29weUZpbGVTeW5jKGxvZ29Tb3VyY2VQYXRoLCBsb2dvRGVzdFBhdGgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eS50c1wiO2ltcG9ydCB0eXBlIHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuXG4vLyBWaXRlIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVx1N0M3Qlx1NTc4QlxuaW50ZXJmYWNlIFByb3h5T3B0aW9ucyB7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGFuZ2VPcmlnaW4/OiBib29sZWFuO1xuICBzZWN1cmU/OiBib29sZWFuO1xuICBjb25maWd1cmU/OiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkO1xufVxuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUHJveHlPcHRpb25zPiA9IHtcbiAgJy9hcGknOiB7XG4gICAgdGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgLy8gXHU0RTBEXHU1MThEXHU2NkZGXHU2MzYyXHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU4RjZDXHU1M0QxIC9hcGkgXHU1MjMwXHU1NDBFXHU3QUVGXHVGRjA4XHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcdUZGMDlcbiAgICAvLyByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnL2FkbWluJykgLy8gXHU1REYyXHU3OUZCXHU5NjY0XHVGRjFBXHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTZERkJcdTUyQTAgQ09SUyBcdTU5MzRcbiAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NEVFM1x1NzQwNlx1NTRDRFx1NUU5NFxuICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzOiBJbmNvbWluZ01lc3NhZ2UsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKic7XG4gICAgICAgIGlmIChwcm94eVJlcy5oZWFkZXJzKSB7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSBvcmlnaW4gYXMgc3RyaW5nO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAndHJ1ZSc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyddID0gJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJztcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IHJlcS5oZWFkZXJzWydhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LWhlYWRlcnMnXSB8fCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnXSA9IHJlcXVlc3RIZWFkZXJzIGFzIHN0cmluZztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG4gICAgICAgICAgaWYgKHNldENvb2tpZUhlYWRlcikge1xuICAgICAgICAgICAgY29uc3QgY29va2llcyA9IEFycmF5LmlzQXJyYXkoc2V0Q29va2llSGVhZGVyKSA/IHNldENvb2tpZUhlYWRlciA6IFtzZXRDb29raWVIZWFkZXJdO1xuICAgICAgICAgICAgY29uc3QgZml4ZWRDb29raWVzID0gY29va2llcy5tYXAoKGNvb2tpZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5QyBjb29raWUgXHU0RTBEXHU1MzA1XHU1NDJCIFNhbWVTaXRlXHVGRjBDXHU2MjE2XHU4MDA1IFNhbWVTaXRlIFx1NEUwRFx1NjYyRiBOb25lXHVGRjBDXHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXG4gICAgICAgICAgICAgIGlmICghY29va2llLmluY2x1ZGVzKCdTYW1lU2l0ZT1Ob25lJykpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTc5RkJcdTk2NjRcdTczQjBcdTY3MDlcdTc2ODQgU2FtZVNpdGUgXHU4QkJFXHU3RjZFXHVGRjA4XHU1OTgyXHU2NzlDXHU2NzA5XHVGRjA5XG4gICAgICAgICAgICAgICAgbGV0IGZpeGVkQ29va2llID0gY29va2llLnJlcGxhY2UoLztcXHMqU2FtZVNpdGU9KFN0cmljdHxMYXh8Tm9uZSkvZ2ksICcnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTZERkJcdTUyQTAgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXHVGRjA4XHU1QkY5XHU0RThFXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBU2VjdXJlIFx1OTcwMFx1ODk4MSBIVFRQU1x1RkYwQ1x1NEY0Nlx1NTcyOFx1NUYwMFx1NTNEMS9cdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTYyMTFcdTRFRUNcdTRFQ0RcdTcxMzZcdTZERkJcdTUyQTBcdTVCODNcbiAgICAgICAgICAgICAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTRGMUFcdTVGRkRcdTc1NjUgU2VjdXJlXHVGRjA4XHU1OTgyXHU2NzlDXHU1MzRGXHU4QkFFXHU2NjJGIEhUVFBcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlZENvb2tpZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gY29va2llO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ10gPSBmaXhlZENvb2tpZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFx1OEJCMFx1NUY1NVx1NTQwRVx1N0FFRlx1NTRDRFx1NUU5NFx1NzJCNlx1NjAwMVxuICAgICAgICBpZiAocHJveHlSZXMuc3RhdHVzQ29kZSAmJiBwcm94eVJlcy5zdGF0dXNDb2RlID49IDUwMCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtQcm94eV0gQmFja2VuZCByZXR1cm5lZCAke3Byb3h5UmVzLnN0YXR1c0NvZGV9IGZvciAke3JlcS5tZXRob2R9ICR7cmVxLnVybH1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NEVFM1x1NzQwNlx1OTUxOVx1OEJFRlxuICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogRXJyb3IsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQcm94eV0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFRhcmdldDonLCAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScpO1xuICAgICAgICBpZiAocmVzICYmICFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1x1NEVFM1x1NzQwNlx1OTUxOVx1OEJFRlx1RkYxQVx1NjVFMFx1NkNENVx1OEZERVx1NjNBNVx1NTIzMFx1NTQwRVx1N0FFRlx1NjcwRFx1NTJBMVx1NTY2OCBodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTc2RDFcdTU0MkNcdTRFRTNcdTc0MDZcdThCRjdcdTZDNDJcdUZGMDhcdTc1MjhcdTRFOEVcdThDMDNcdThCRDVcdUZGMDlcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcTogYW55LCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1Byb3h5XSAke3JlcS5tZXRob2R9ICR7cmVxLnVybH0gLT4gaHR0cDovLzEwLjgwLjkuNzY6ODExNSR7cmVxLnVybH1gKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH1cbn07XG5cbmV4cG9ydCB7IHByb3h5IH07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBaLFNBQVMsb0JBQW9CO0FBQ3ZiLFNBQVMsaUJBQUFBLHNCQUFxQjs7O0FDSzlCLFNBQVMsV0FBQUMsZ0JBQWU7QUFDeEIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFlBQVk7QUFDbkIsU0FBUyxjQUFBQyxhQUFZLGdCQUFBQyxxQkFBb0I7OztBQ056QyxTQUFTLGVBQWU7QUFPakIsU0FBUyxr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QUFBQSxFQUM3QztBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNF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O0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjs7O0FqQmhGdVEsSUFBTUMsNENBQTJDO0FBS3hULElBQU8sc0JBQVE7QUFBQSxFQUNiLHVCQUF1QjtBQUFBLElBQ3JCLFNBQVM7QUFBQSxJQUNULFFBQVFDLGVBQWMsSUFBSSxJQUFJLEtBQUtELHlDQUFlLENBQUM7QUFBQSxJQUNuRCxhQUFhO0FBQUEsSUFDYixjQUFjLEVBQUUsTUFBaUI7QUFBQSxJQUNqQztBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJmaWxlVVJMVG9QYXRoIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAidGltZXN0YW1wIiwgImZpbGVOYW1lIiwgIm9yaWdpbiIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJkaXJuYW1lIiwgImdldEJ1aWxkVGltZXN0YW1wIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ0aW1lc3RhbXAiLCAicmVhZEZpbGVTeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJyZXF1aXJlIiwgInByb3h5IiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInByb3h5IiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiZmlsZVVSTFRvUGF0aCJdCn0K
