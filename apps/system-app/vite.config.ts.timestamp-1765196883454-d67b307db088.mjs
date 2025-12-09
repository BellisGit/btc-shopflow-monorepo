// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath3 } from "node:url";

// ../../configs/vite/factories/mainapp.config.ts
import { resolve as resolve6 } from "path";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.25/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import { existsSync as existsSync5, readFileSync as readFileSync4 } from "node:fs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir2) {
  const withSrc = (relativePath) => resolve(appDir2, relativePath);
  const withPackages = (relativePath) => resolve(appDir2, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir2, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir2, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/mainapp.config.ts
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

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

// ../../configs/vite/factories/mainapp.config.ts
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
function getAllDevPorts() {
  return APP_ENV_CONFIGS.map((config) => config.devPort);
}
function getAllPrePorts() {
  return APP_ENV_CONFIGS.map((config) => config.prePort);
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
function getPublicDir(appName, appDir2) {
  if (appName === "admin-app" || appName === "mobile-app" || appName === "system-app") {
    return resolve2(appDir2, "public");
  }
  return resolve2(appDir2, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
function createBaseAliases(appDir2, _appName) {
  const { withSrc, withPackages, withRoot, withConfigs } = createPathHelpers(appDir2);
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
function createBaseResolve(appDir2, appName) {
  return {
    alias: createBaseAliases(appDir2, appName),
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
    if (id.includes("configs/layout-bridge") || id.includes("@configs/layout-bridge")) {
      return "menu-registry";
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
        constBindings: false
        // 不使用 const，避免 TDZ 问题
      },
      chunkFileNames: `${chunkDir}/[name]-[hash].js`,
      entryFileNames: `${chunkDir}/[name]-[hash].js`,
      assetFileNames: (assetInfo) => {
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
function cleanDistPlugin(appDir2) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve3(appDir2, "dist");
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
              return `${attr}="${absolutePath}${query}"`;
            });
          }
          const htmlAssetRegex = /(href|src)=["'](\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (htmlAssetRegex.test(htmlContent)) {
          }
          const rootImageRegex = /(href|src)=["'](\/[^/][^"']*\.(png|jpg|jpeg|gif|svg|ico))(\?[^"']*)?["']/g;
          if (rootImageRegex.test(htmlContent)) {
          }
          if (htmlModified) {
            chunk.source = htmlContent;
            console.log(`[ensure-base-url] \u4FEE\u590D\u4E86 index.html \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84\uFF08\u76F8\u5BF9\u8DEF\u5F84 -> \u7EDD\u5BF9\u8DEF\u5F84\uFF09`);
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

// ../../configs/vite/plugins/public-images.ts
import { resolve as resolve5, join as join2, extname, basename } from "path";
import { existsSync as existsSync4, readFileSync as readFileSync3, readdirSync as readdirSync2, statSync, writeFileSync as writeFileSync3, mkdirSync } from "node:fs";
function publicImagesToAssetsPlugin(appDir2) {
  const imageMap = /* @__PURE__ */ new Map();
  const emittedFiles = /* @__PURE__ */ new Map();
  const publicImageFiles = /* @__PURE__ */ new Map();
  const rootImageFiles = ["logo.png", "login_cut_dark.png", "login_cut_light.png"];
  const isVirtualModuleId = (id) => {
    return id.includes("\0") || id.includes("public-image:");
  };
  const extractOriginalPath = (id) => {
    if (!isVirtualModuleId(id)) {
      return null;
    }
    const originalPath = id.replace(/\0public-image:/g, "").replace(/\0/g, "");
    if (originalPath.includes("\0")) {
      return null;
    }
    return originalPath;
  };
  return {
    name: "public-images-to-assets",
    buildStart() {
      const publicDir = resolve5(appDir2, "public");
      if (!existsSync4(publicDir)) {
        return;
      }
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];
      const files = readdirSync2(publicDir);
      for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          if (rootImageFiles.includes(file)) {
            console.log(`[public-images-to-assets] \u{1F4E6} \u5904\u7406 ${file}\uFF0C\u5C06\u590D\u5236\u5230\u6839\u76EE\u5F55\uFF08\u65E0\u54C8\u5E0C\u503C\uFF09`);
            publicImageFiles.set(file, join2(publicDir, file));
            continue;
          }
          const filePath = join2(publicDir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            publicImageFiles.set(`/${file}`, filePath);
            publicImageFiles.set(file, filePath);
            const fileContent = readFileSync3(filePath);
            const referenceId = this.emitFile({
              type: "asset",
              name: file,
              // 文件名（不含路径），Rollup 会自动添加哈希值并放在 assetsDir
              source: fileContent
            });
            emittedFiles.set(file, referenceId);
            console.log(`[public-images-to-assets] \u{1F4E6} \u5C06 ${file} \u6253\u5305 (referenceId: ${referenceId})`);
          }
        }
      }
    },
    resolveId(id, _importer) {
      if (isVirtualModuleId(id)) {
        if (id.startsWith("\0public-image:") || id.includes("\0public-image:")) {
          return id;
        }
        return null;
      }
      if (id === "/logo.png" || id === "logo.png") {
        const logoPath = publicImageFiles.get("logo.png");
        if (logoPath && existsSync4(logoPath)) {
          return logoPath;
        }
        return `\0public-image:/logo.png`;
      }
      if (id.startsWith("/") && publicImageFiles.has(id)) {
        return `\0public-image:${id}`;
      }
      return null;
    },
    load(id) {
      for (const rootFile of rootImageFiles) {
        if (id.endsWith(rootFile) && existsSync4(id)) {
          return `export default "/${rootFile}";`;
        }
      }
      if (!isVirtualModuleId(id)) {
        return null;
      }
      const originalPath = extractOriginalPath(id);
      if (!originalPath) {
        for (const rootFile of rootImageFiles) {
          if (id.includes(rootFile)) {
            return `export default "/${rootFile}";`;
          }
        }
        console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u65E0\u6CD5\u63D0\u53D6\u539F\u59CB\u8DEF\u5F84\uFF0C\u8DF3\u8FC7: ${id}`);
        return null;
      }
      const fileName = basename(originalPath);
      if (rootImageFiles.includes(fileName)) {
        return `export default "/${fileName}";`;
      }
      const referenceId = emittedFiles.get(fileName);
      if (referenceId) {
        return `export default "/${fileName}";`;
      }
      return null;
    },
    generateBundle(_options, bundle) {
      const bundleAssets = Object.entries(bundle).filter(([_, chunk]) => chunk.type === "asset");
      console.log(`[public-images-to-assets] \u{1F4CB} bundle \u4E2D\u7684\u8D44\u6E90\u6587\u4EF6\u6570\u91CF: ${bundleAssets.length}`);
      console.log(`[public-images-to-assets] \u{1F50D} \u5F00\u59CB\u5904\u7406 ${emittedFiles.size} \u4E2A\u5DF2\u53D1\u51FA\u7684\u6587\u4EF6`);
      for (const [originalFile, referenceId] of emittedFiles.entries()) {
        try {
          const actualFileName = this.getFileName(referenceId);
          if (!actualFileName) {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u65E0\u6CD5\u83B7\u53D6 ${originalFile} \u7684\u6587\u4EF6\u540D (referenceId: ${referenceId})`);
            continue;
          }
          const assetChunk = bundle[actualFileName];
          if (!assetChunk || assetChunk.type !== "asset") {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u5728 bundle \u4E2D\u672A\u627E\u5230 ${actualFileName} (\u539F\u59CB\u6587\u4EF6: ${originalFile})`);
            continue;
          }
          const fileNameWithPath = actualFileName;
          imageMap.set(originalFile, fileNameWithPath);
          console.log(`[public-images-to-assets] \u2705 ${originalFile} -> ${fileNameWithPath} (Rollup \u751F\u6210\u7684\u6587\u4EF6\u540D)`);
        } catch (error) {
          console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u5904\u7406 ${originalFile} \u65F6\u51FA\u9519:`, error);
        }
      }
      if (imageMap.size === 0) {
        console.warn(`[public-images-to-assets] \u26A0\uFE0F  imageMap \u4E3A\u7A7A\uFF0C\u53EF\u80FD emitFile \u6CA1\u6709\u6210\u529F\u6267\u884C`);
      } else {
        console.log(`[public-images-to-assets] \u{1F4DD} imageMap \u5185\u5BB9:`, Array.from(imageMap.entries()).map(([k, v]) => `${k} -> ${v}`).join(", "));
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code) {
          let modified = false;
          let newCode = chunk.code;
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const stringPattern = new RegExp(`(["'\`])${escapedPath}(["'\`])`, "g");
            if (newCode.includes(originalPath)) {
              newCode = newCode.replace(stringPattern, `$1${newPath}$2`);
              modified = true;
            }
          }
          if (modified) {
            chunk.code = newCode;
            console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${fileName} \u4E2D\u7684\u56FE\u7247\u5F15\u7528`);
          }
        } else if (chunk.type === "asset" && fileName.endsWith(".css") && chunk.source) {
          let modified = false;
          let newSource = typeof chunk.source === "string" ? chunk.source : Buffer.from(chunk.source).toString("utf-8");
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, "");
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || ".png";
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace(".", "\\.")}`, "g");
            if (assetsPattern.test(newSource)) {
              newSource = newSource.replace(assetsPattern, rootPath);
              modified = true;
              console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 CSS ${fileName} \u4E2D\u7684\u6839\u76EE\u5F55\u56FE\u7247\u5F15\u7528: /assets/${rootFile} -> ${rootPath}`);
            }
            const rootPattern = new RegExp(`url\\(["']?${rootPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\?[^"')]*)?["']?\\)`, "g");
            if (rootPattern.test(newSource)) {
            }
          }
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const urlPatterns = [
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, "g"),
              new RegExp(`url\\(["']${escapedPath}(\\?[^"']*)?["']\\)`, "g")
            ];
            for (const pattern of urlPatterns) {
              if (pattern.test(newSource)) {
                newSource = newSource.replace(pattern, (match) => {
                  const queryMatch = match.match(/(\?[^)]*)/);
                  const query = queryMatch ? queryMatch[1] : "";
                  return match.replace(originalPath, newPath).replace(/\?[^)]*/, query);
                });
                modified = true;
                console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 CSS ${fileName} \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
              }
            }
          }
          if (modified) {
            chunk.source = newSource;
          }
        }
      }
    },
    writeBundle(options) {
      const outputDir = options.dir || resolve5(appDir2, "dist");
      for (const rootFile of rootImageFiles) {
        const filePath = publicImageFiles.get(rootFile);
        if (filePath && existsSync4(filePath)) {
          const fileDest = join2(outputDir, rootFile);
          try {
            const fileContent = readFileSync3(filePath);
            writeFileSync3(fileDest, fileContent);
            console.log(`[public-images-to-assets] \u2705 \u5DF2\u590D\u5236 ${rootFile} \u5230\u6839\u76EE\u5F55: ${fileDest}`);
          } catch (error) {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u590D\u5236 ${rootFile} \u5931\u8D25:`, error);
          }
        }
      }
      if (imageMap.size === 0) {
        return;
      }
      const assetsDirPath = join2(outputDir, "assets");
      if (!existsSync4(assetsDirPath)) {
        mkdirSync(assetsDirPath, { recursive: true });
      }
      const indexHtmlPath = join2(outputDir, "index.html");
      if (existsSync4(indexHtmlPath)) {
        let html = readFileSync3(indexHtmlPath, "utf-8");
        let modified = false;
        for (const [originalFile, hashedFile] of imageMap.entries()) {
          if (rootImageFiles.includes(originalFile)) {
            continue;
          }
          const originalPath = `/${originalFile}`;
          const newPath = `/${hashedFile}`;
          if (html.includes(originalPath)) {
            html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), newPath);
            modified = true;
            console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 HTML \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
          }
        }
        if (modified) {
          writeFileSync3(indexHtmlPath, html, "utf-8");
        }
      }
      const assetsDir = join2(outputDir, "assets");
      if (existsSync4(assetsDir)) {
        const jsFiles = readdirSync2(assetsDir).filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
        const cssFiles = readdirSync2(assetsDir).filter((f) => f.endsWith(".css"));
        for (const file of [...jsFiles, ...cssFiles]) {
          const filePath = join2(assetsDir, file);
          let content = readFileSync3(filePath, "utf-8");
          let modified = false;
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, "");
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || ".png";
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace(".", "\\.")}`, "g");
            if (assetsPattern.test(content)) {
              content = content.replace(assetsPattern, rootPath);
              modified = true;
              console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${file} \u4E2D\u7684\u6839\u76EE\u5F55\u56FE\u7247\u5F15\u7528: /assets/${rootFile} -> ${rootPath}`);
            }
          }
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const backtick = "`";
            const quotePattern = `["'` + backtick + "]";
            const negatedQuotePattern = `[^"'` + backtick + "]";
            const patterns = [
              new RegExp("(" + quotePattern + ")" + escapedPath + "(\\?" + negatedQuotePattern + "*)?(" + quotePattern + ")", "g"),
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, "g"),
              new RegExp(`url\\(['"]${escapedPath}(\\?[^"']*)?['"]\\)`, "g")
            ];
            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (pattern.source.includes("url")) {
                  content = content.replace(pattern, (match) => {
                    const queryMatch = match.match(/(\?[^)]*)/);
                    const query = queryMatch ? queryMatch[1] : "";
                    return match.replace(originalPath, newPath).replace(/\?[^)]*/, query);
                  });
                } else {
                  content = content.replace(pattern, (_match, quote1, _path, query, quote2) => {
                    return `${quote1}${newPath}${query || ""}${quote2}`;
                  });
                }
                modified = true;
                console.log(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${file} \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
              }
            }
          }
          if (modified) {
            writeFileSync3(filePath, content, "utf-8");
          }
        }
      }
    },
    closeBundle() {
      if (imageMap.size === 0) {
        return;
      }
      const outputDir = resolve5(appDir2, "dist");
      for (const [originalFile, hashedFile] of imageMap.entries()) {
        const expectedPath = join2(outputDir, hashedFile);
        if (existsSync4(expectedPath)) {
          console.log(`[public-images-to-assets] \u2705 \u6587\u4EF6\u5DF2\u6B63\u786E\u751F\u6210: ${hashedFile}`);
        } else {
          const rootPath = hashedFile.startsWith("assets/") ? join2(outputDir, hashedFile.replace("assets/", "")) : join2(outputDir, hashedFile);
          if (existsSync4(rootPath)) {
            console.log(`[public-images-to-assets] \u2705 \u6587\u4EF6\u5728\u6839\u76EE\u5F55: ${hashedFile.replace("assets/", "")}`);
          } else {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u6587\u4EF6\u4E0D\u5B58\u5728: ${hashedFile} (\u539F\u59CB\u6587\u4EF6: ${originalFile})`);
            console.warn(`[public-images-to-assets]   \u68C0\u67E5\u8DEF\u5F84: ${expectedPath}`);
            console.warn(`[public-images-to-assets]   \u68C0\u67E5\u8DEF\u5F84: ${rootPath}`);
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/resource-preload.ts
function resourcePreloadPlugin() {
  const criticalResources = [];
  return {
    name: "resource-preload",
    generateBundle(_options, bundle) {
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js") || file.endsWith(".mjs"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      const getResourceHref = (chunkName) => {
        if (chunkName.startsWith("assets/")) {
          return `/${chunkName}`;
        } else {
          return `/assets/${chunkName}`;
        }
      };
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      if (indexChunk) {
        criticalResources.push({
          href: getResourceHref(indexChunk),
          rel: "modulepreload"
        });
      }
      const epsServiceChunk = jsChunks.find((jsChunk) => jsChunk.includes("eps-service-"));
      if (epsServiceChunk) {
        criticalResources.push({
          href: getResourceHref(epsServiceChunk),
          rel: "modulepreload"
        });
      }
      cssChunks.forEach((cssChunk) => {
        criticalResources.push({
          href: getResourceHref(cssChunk),
          rel: "preload",
          as: "style"
        });
      });
    },
    transformIndexHtml(html) {
      if (criticalResources.length === 0) {
        return html;
      }
      const preloadLinks = criticalResources.map((resource) => {
        if (resource.rel === "modulepreload") {
          return `    <link rel="modulepreload" href="${resource.href}" />`;
        } else {
          return `    <link rel="preload" href="${resource.href}" as="${resource.as || "script"}" />`;
        }
      }).join("\n");
      if (html.includes("</head>")) {
        return html.replace("</head>", `${preloadLinks}
</head>`);
      }
      return html;
    }
  };
}

// ../../configs/vite/factories/mainapp.config.ts
function createMainAppViteConfig(options) {
  const {
    appName,
    appDir: appDir2,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy2 = {},
    btcOptions = {},
    vueI18nOptions,
    publicImagesToAssets = true,
    enableResourcePreload = true
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot, withPackages } = createPathHelpers(appDir2);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = "/";
  const publicDir = getPublicDir(appName, appDir2);
  const mainAppConfig = getViteAppConfig("system-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const plugins = [
    // 1. 清理插件
    cleanDistPlugin(appDir2),
    // 2. CORS 插件
    corsPlugin(),
    // 3. Public 图片资源处理插件（如果启用）
    ...publicImagesToAssets && !isPreviewBuild ? [publicImagesToAssetsPlugin(appDir2)] : [],
    // 4. 资源预加载插件（如果启用）
    ...enableResourcePreload !== false ? [resourcePreloadPlugin()] : [],
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 6. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync5,
          readFile: (file) => readFileSync4(file, "utf-8")
        }
      }
    }),
    // 7. 自动导入插件
    createAutoImportConfig(),
    // 8. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 9. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 10. BTC 业务插件
    btc({
      type: "admin",
      proxy: proxy2,
      eps: {
        enable: true,
        dict: false,
        dist: "./build/eps",
        ...btcOptions.eps
      },
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 11. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve6(appDir2, "src/locales/**"),
        resolve6(appDir2, "src/{modules,plugins}/**/locales/**"),
        resolve6(appDir2, "../../packages/shared-components/src/locales/**"),
        resolve6(appDir2, "../../packages/shared-components/src/plugins/**/locales/**"),
        resolve6(appDir2, "../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts"),
        resolve6(appDir2, "../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 12. CSS 验证插件
    ensureCssPlugin(),
    // 13. 强制生成新 hash 插件
    forceNewHashPlugin(),
    // 14. 修复动态导入 hash 插件
    fixDynamicImportHashPlugin(),
    // 15. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 16. 确保 base URL 插件（主应用也需要，因为可能有子应用资源引用）
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 17. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 18. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 19. Chunk 验证插件
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
        // 只移除 console.log，保留 console.error 和 console.warn，便于生产环境调试
        drop_console: ["log"],
        drop_debugger: true,
        reduce_vars: false,
        reduce_funcs: false,
        passes: 1,
        collapse_vars: false,
        dead_code: false
      },
      // 关键：对于 ES 模块，完全禁用 mangle 以避免导出名称被混淆
      // 这可以防止 "does not provide an export named 'r'" 错误
      // 虽然这会增加一些文件大小，但可以确保动态导入正常工作
      mangle: false,
      // 或者使用以下配置保留函数名和类名，但禁用变量名混淆：
      // mangle: {
      //   keep_fnames: true,
      //   keep_classnames: true,
      //   reserved: [],
      //   properties: false,
      // },
      format: {
        comments: false
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
      "Access-Control-Allow-Origin": "*",
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
      "element-plus/es",
      "element-plus/es/locale/lang/zh-cn",
      "element-plus/es/locale/lang/en",
      "element-plus/es/components/cascader/style/css",
      "@element-plus/icons-vue",
      "@btc/shared-core",
      "@btc/shared-components",
      "@btc/shared-utils",
      "vite-plugin-qiankun/dist/helper",
      "qiankun",
      "single-spa",
      "@vueuse/core",
      "vue-i18n",
      "lodash-es",
      "xlsx",
      "chardet",
      "echarts/core"
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
  const finalPublicDir = publicDir;
  return {
    base: baseUrl,
    publicDir: finalPublicDir,
    resolve: createBaseResolve(appDir2, appName),
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

// ../../configs/unified-env-config.ts
var configSchemes = {
  default: {
    development: {
      api: {
        baseURL: "/api",
        timeout: 3e4,
        backendTarget: "http://10.80.9.76:8115"
      },
      microApp: {
        baseURL: "//10.80.8.199",
        entryPrefix: ""
      },
      docs: {
        url: "http://localhost:4172",
        port: "4172"
      },
      ws: {
        url: "ws://10.80.9.76:8115"
      },
      upload: {
        url: "/api/upload"
      }
    },
    preview: {
      api: {
        baseURL: "/api",
        timeout: 3e4
      },
      microApp: {
        baseURL: "http://localhost",
        entryPrefix: "/index.html"
      },
      docs: {
        url: "http://localhost:4173",
        port: "4173"
      },
      ws: {
        url: "ws://localhost:8115"
      },
      upload: {
        url: "/api/upload"
      }
    },
    production: {
      api: {
        baseURL: "/api",
        timeout: 3e4
      },
      microApp: {
        baseURL: "https://bellis.com.cn",
        entryPrefix: ""
        // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: "https://docs.bellis.com.cn",
        port: ""
      },
      ws: {
        url: "wss://api.bellis.com.cn"
      },
      upload: {
        url: "/api/upload"
      }
    }
  },
  custom: {
    // 可以通过 .env 定义自定义配置方案
    // 这里可以扩展其他配置方案
    development: {
      api: {
        baseURL: "/api",
        timeout: 3e4,
        backendTarget: "http://10.80.9.76:8115"
      },
      microApp: {
        baseURL: "//10.80.8.199",
        entryPrefix: ""
      },
      docs: {
        url: "http://localhost:4172",
        port: "4172"
      },
      ws: {
        url: "ws://10.80.9.76:8115"
      },
      upload: {
        url: "/api/upload"
      }
    },
    preview: {
      api: {
        baseURL: "/api",
        timeout: 3e4
      },
      microApp: {
        baseURL: "http://localhost",
        entryPrefix: "/index.html"
      },
      docs: {
        url: "http://localhost:4173",
        port: "4173"
      },
      ws: {
        url: "ws://localhost:8115"
      },
      upload: {
        url: "/api/upload"
      }
    },
    production: {
      api: {
        baseURL: "/api",
        timeout: 3e4
      },
      microApp: {
        baseURL: "https://bellis.com.cn",
        entryPrefix: ""
        // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: "https://docs.bellis.com.cn",
        port: ""
      },
      ws: {
        url: "wss://api.bellis.com.cn"
      },
      upload: {
        url: "/api/upload"
      }
    }
  }
};
function getConfigScheme() {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "default";
  }
  return import.meta.env.VITE_CONFIG_SCHEME || "default";
}
function getEnvironment() {
  if (typeof window === "undefined") {
    const prodFlag2 = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD) ?? process.env.NODE_ENV === "production";
    return prodFlag2 ? "production" : "development";
  }
  const hostname = window.location.hostname;
  const port = window.location.port || "";
  if (hostname.includes("bellis.com.cn")) {
    return "production";
  }
  if (getAllPrePorts().includes(port)) {
    return "preview";
  }
  if (getAllDevPorts().includes(port)) {
    return "development";
  }
  const prodFlag = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD) ?? false;
  return prodFlag ? "production" : "development";
}
function getEnvConfig() {
  const scheme = getConfigScheme();
  const env = getEnvironment();
  return configSchemes[scheme][env];
}
var currentEnvironment = getEnvironment();
var envConfig = getEnvConfig();

// src/config/proxy.ts
var backendTarget = envConfig.api.backendTarget || "http://10.80.9.76:8115";
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
    configure: (proxy2) => {
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
              const isProduction = host.includes("bellis.com.cn");
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
              if (isProduction) {
                fixedCookie += "; Domain=.bellis.com.cn";
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

// vite.config.ts
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/system-app/vite.config.ts";
var appDir = fileURLToPath3(new URL(".", __vite_injected_original_import_meta_url3));
var vite_config_default = defineConfig(({ command, mode }) => {
  const baseConfig = createMainAppViteConfig({
    appName: "system-app",
    appDir,
    // 启用 public 图片资源处理插件（构建时自动启用）
    publicImagesToAssets: true,
    // 启用资源预加载插件（默认启用）
    enableResourcePreload: true,
    customServer: { proxy },
    proxy
  });
  if (command === "serve") {
    return baseConfig;
  } else {
    const isPreviewBuild = process.env.VITE_PREVIEW === "true";
    if (!isPreviewBuild) {
      return {
        ...baseConfig,
        publicDir: false
        // 构建时禁用 publicDir，由插件处理
      };
    }
    return baseConfig;
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9tYWluYXBwLmNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzIiwgIi4uLy4uL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9idWlsZC9tYW51YWwtY2h1bmtzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9idWlsZC9yb2xsdXAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NodW5rLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2hhc2gudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdXJsLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY3NzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcHVibGljLWltYWdlcy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvdXJjZS1wcmVsb2FkLnRzIiwgIi4uLy4uL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnLnRzIiwgInNyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcc3lzdGVtLWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXHN5c3RlbS1hcHBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9zeXN0ZW0tYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIENvbmZpZ0VudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGNyZWF0ZU1haW5BcHBWaXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9tYWluYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBwcm94eSB9IGZyb20gJy4vc3JjL2NvbmZpZy9wcm94eSc7XG5cbmNvbnN0IGFwcERpciA9IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9OiBDb25maWdFbnYpID0+IHtcbiAgY29uc3QgYmFzZUNvbmZpZyA9IGNyZWF0ZU1haW5BcHBWaXRlQ29uZmlnKHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgYXBwRGlyLFxuICAgIC8vIFx1NTQyRlx1NzUyOCBwdWJsaWMgXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XHVGRjA4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4MUVBXHU1MkE4XHU1NDJGXHU3NTI4XHVGRjA5XG4gICAgcHVibGljSW1hZ2VzVG9Bc3NldHM6IHRydWUsXG4gICAgLy8gXHU1NDJGXHU3NTI4XHU4RDQ0XHU2RTkwXHU5ODg0XHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHVGRjA4XHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHVGRjA5XG4gICAgZW5hYmxlUmVzb3VyY2VQcmVsb2FkOiB0cnVlLFxuICAgIGN1c3RvbVNlcnZlcjogeyBwcm94eSB9LFxuICAgIHByb3h5LFxuICB9KTtcblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTY4MzlcdTYzNkUgY29tbWFuZCBcdTUyQThcdTYwMDFcdTkxNERcdTdGNkUgcHVibGljRGlyXG4gIC8vIC0gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHVGRjA4c2VydmVcdUZGMDlcdUZGMUFcdTU0MkZcdTc1MjggcHVibGljRGlyXHVGRjBDXHU4QkE5IFZpdGUgXHU2QjYzXHU1RTM4XHU2NzBEXHU1MkExIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTc2ODRcdTY1ODdcdTRFRjZcbiAgLy8gLSBcdTY3ODRcdTVFRkFcdTczQUZcdTU4ODNcdUZGMDhidWlsZFx1RkYwOVx1RkYxQVx1Nzk4MVx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdTc1MzEgcHVibGljSW1hZ2VzVG9Bc3NldHNQbHVnaW4gXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XHU2NTg3XHU0RUY2XG4gIGlmIChjb21tYW5kID09PSAnc2VydmUnKSB7XG4gICAgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHVGRjFBXHU1NDJGXHU3NTI4IHB1YmxpY0RpclxuICAgIHJldHVybiBiYXNlQ29uZmlnO1xuICB9IGVsc2Uge1xuICAgIC8vIFx1Njc4NFx1NUVGQVx1NzNBRlx1NTg4M1x1RkYxQVx1NTk4Mlx1Njc5Q1x1NTQyRlx1NzUyOFx1NEU4NiBwdWJsaWNJbWFnZXNUb0Fzc2V0cyBcdTYzRDJcdTRFRjZcdUZGMENcdTc5ODFcdTc1MjggcHVibGljRGlyXG4gICAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgICBpZiAoIWlzUHJldmlld0J1aWxkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlQ29uZmlnLFxuICAgICAgICBwdWJsaWNEaXI6IGZhbHNlLCAvLyBcdTY3ODRcdTVFRkFcdTY1RjZcdTc5ODFcdTc1MjggcHVibGljRGlyXHVGRjBDXHU3NTMxXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gYmFzZUNvbmZpZztcbiAgfVxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcZmFjdG9yaWVzXFxcXG1haW5hcHAuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvbWFpbmFwcC5jb25maWcudHNcIjsvKipcclxuICogXHU0RTNCXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXHJcbiAqIFx1NzUxRlx1NjIxMFx1NEUzQlx1NUU5NFx1NzUyOFx1NzY4NFx1NUI4Q1x1NjU3NCBWaXRlIFx1OTE0RFx1N0Y2RVx1RkYwOHN5c3RlbS1hcHBcdUZGMDlcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcsIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xyXG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XHJcblxyXG4vLyBcdTRGN0ZcdTc1MjggRVNNIFx1NUJGQ1x1NTE2NSBWdWVJMThuUGx1Z2luXHVGRjA4Vml0ZSBcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdTY1MkZcdTYzMDEgRVNNXHVGRjA5XHJcbmltcG9ydCBWdWVJMThuUGx1Z2luIGZyb20gJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnO1xyXG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vYXV0by1pbXBvcnQuY29uZmlnJztcclxuaW1wb3J0IHsgYnRjLCBmaXhDaHVua1JlZmVyZW5jZXNQbHVnaW4gfSBmcm9tICdAYnRjL3ZpdGUtcGx1Z2luJztcclxuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcclxuaW1wb3J0IHsgY3JlYXRlQmFzZVJlc29sdmUgfSBmcm9tICcuLi9iYXNlLmNvbmZpZyc7XHJcbmltcG9ydCB7IGNyZWF0ZVJvbGx1cENvbmZpZyB9IGZyb20gJy4uL2J1aWxkL3JvbGx1cC5jb25maWcnO1xyXG5pbXBvcnQge1xyXG4gIGNsZWFuRGlzdFBsdWdpbixcclxuICBjaHVua1ZlcmlmeVBsdWdpbixcclxuICBvcHRpbWl6ZUNodW5rc1BsdWdpbixcclxuICBmb3JjZU5ld0hhc2hQbHVnaW4sXHJcbiAgZml4RHluYW1pY0ltcG9ydEhhc2hQbHVnaW4sXHJcbiAgZW5zdXJlQmFzZVVybFBsdWdpbixcclxuICBjb3JzUGx1Z2luLFxyXG4gIGVuc3VyZUNzc1BsdWdpbixcclxuICBhZGRWZXJzaW9uUGx1Z2luLFxyXG4gIHB1YmxpY0ltYWdlc1RvQXNzZXRzUGx1Z2luLFxyXG4gIHJlc291cmNlUHJlbG9hZFBsdWdpbixcclxufSBmcm9tICcuLi9wbHVnaW5zJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTWFpbkFwcFZpdGVDb25maWdPcHRpb25zIHtcclxuICAvKipcclxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ3N5c3RlbS1hcHAnXHVGRjA5XHJcbiAgICovXHJcbiAgYXBwTmFtZTogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxyXG4gICAqL1xyXG4gIGFwcERpcjogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OFxyXG4gICAqL1xyXG4gIGN1c3RvbVBsdWdpbnM/OiBQbHVnaW5bXTtcclxuICAvKipcclxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcclxuICAgKi9cclxuICBjdXN0b21CdWlsZD86IFBhcnRpYWw8VXNlckNvbmZpZ1snYnVpbGQnXT47XHJcbiAgLyoqXHJcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgY3VzdG9tU2VydmVyPzogUGFydGlhbDxVc2VyQ29uZmlnWydzZXJ2ZXInXT47XHJcbiAgLyoqXHJcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgY3VzdG9tUHJldmlldz86IFBhcnRpYWw8VXNlckNvbmZpZ1sncHJldmlldyddPjtcclxuICAvKipcclxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcclxuICAgKi9cclxuICBjdXN0b21PcHRpbWl6ZURlcHM/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ29wdGltaXplRGVwcyddPjtcclxuICAvKipcclxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDkgQ1NTIFx1OTE0RFx1N0Y2RVxyXG4gICAqL1xyXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xyXG4gIC8qKlxyXG4gICAqIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVxyXG4gICAqL1xyXG4gIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcclxuICAvKipcclxuICAgKiBCVEMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgYnRjT3B0aW9ucz86IHtcclxuICAgIHR5cGU/OiAnYWRtaW4nO1xyXG4gICAgcHJveHk/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xyXG4gICAgZXBzPzoge1xyXG4gICAgICBlbmFibGU/OiBib29sZWFuO1xyXG4gICAgICBkaWN0PzogYm9vbGVhbjtcclxuICAgICAgZGlzdD86IHN0cmluZztcclxuICAgIH07XHJcbiAgICBzdmc/OiB7XHJcbiAgICAgIHNraXBOYW1lcz86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIFZ1ZUkxOG4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXHJcbiAgICovXHJcbiAgdnVlSTE4bk9wdGlvbnM/OiB7XHJcbiAgICBpbmNsdWRlPzogc3RyaW5nW107XHJcbiAgICBydW50aW1lT25seT86IGJvb2xlYW47XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTkxNERcdTdGNkVcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdTcyNzlcdTY3MDlcdUZGMDlcclxuICAgKi9cclxuICBwdWJsaWNJbWFnZXNUb0Fzc2V0cz86IGJvb2xlYW47XHJcbiAgLyoqXHJcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU4RDQ0XHU2RTkwXHU5ODg0XHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHJcbiAgICovXHJcbiAgZW5hYmxlUmVzb3VyY2VQcmVsb2FkPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQVx1NEUzQlx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1haW5BcHBWaXRlQ29uZmlnKG9wdGlvbnM6IE1haW5BcHBWaXRlQ29uZmlnT3B0aW9ucyk6IFVzZXJDb25maWcge1xyXG4gIGNvbnN0IHtcclxuICAgIGFwcE5hbWUsXHJcbiAgICBhcHBEaXIsXHJcbiAgICBjdXN0b21QbHVnaW5zID0gW10sXHJcbiAgICBjdXN0b21CdWlsZCxcclxuICAgIGN1c3RvbVNlcnZlcixcclxuICAgIGN1c3RvbVByZXZpZXcsXHJcbiAgICBjdXN0b21PcHRpbWl6ZURlcHMsXHJcbiAgICBjdXN0b21Dc3MsXHJcbiAgICBwcm94eSA9IHt9LFxyXG4gICAgYnRjT3B0aW9ucyA9IHt9LFxyXG4gICAgdnVlSTE4bk9wdGlvbnMsXHJcbiAgICBwdWJsaWNJbWFnZXNUb0Fzc2V0cyA9IHRydWUsXHJcbiAgICBlbmFibGVSZXNvdXJjZVByZWxvYWQgPSB0cnVlLFxyXG4gIH0gPSBvcHRpb25zO1xyXG5cclxuICAvLyBcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcclxuICBjb25zdCBhcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWUpO1xyXG4gIC8vIFx1NEY3Rlx1NzUyOFx1NUJGQ1x1NTE2NVx1NzY4NCBjcmVhdGVQYXRoSGVscGVyc1xyXG4gIGNvbnN0IHsgd2l0aFJvb3QsIHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcclxuXHJcbiAgLy8gXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHJcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcclxuICBjb25zdCBiYXNlVXJsID0gJy8nOyAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdTU2RkFcdTVCOUFcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODRcclxuICBjb25zdCBwdWJsaWNEaXIgPSBnZXRQdWJsaWNEaXIoYXBwTmFtZSwgYXBwRGlyKTtcclxuXHJcbiAgLy8gXHU4M0I3XHU1M0Q2XHU0RTNCXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIGVuc3VyZUJhc2VVcmxQbHVnaW5cdUZGMDlcclxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0Vml0ZUFwcENvbmZpZygnc3lzdGVtLWFwcCcpO1xyXG4gIGNvbnN0IG1haW5BcHBQb3J0ID0gbWFpbkFwcENvbmZpZy5wcmVQb3J0LnRvU3RyaW5nKCk7XHJcblxyXG4gIC8vIFx1Njc4NFx1NUVGQVx1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OFxyXG4gIGNvbnN0IHBsdWdpbnM6IChQbHVnaW4gfCBQbHVnaW5bXSlbXSA9IFtcclxuICAgIC8vIDEuIFx1NkUwNVx1NzQwNlx1NjNEMlx1NEVGNlxyXG4gICAgY2xlYW5EaXN0UGx1Z2luKGFwcERpciksXHJcbiAgICAvLyAyLiBDT1JTIFx1NjNEMlx1NEVGNlxyXG4gICAgY29yc1BsdWdpbigpLFxyXG4gICAgLy8gMy4gUHVibGljIFx1NTZGRVx1NzI0N1x1OEQ0NFx1NkU5MFx1NTkwNFx1NzQwNlx1NjNEMlx1NEVGNlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTQyRlx1NzUyOFx1RkYwOVxyXG4gICAgLi4uKHB1YmxpY0ltYWdlc1RvQXNzZXRzICYmICFpc1ByZXZpZXdCdWlsZCA/IFtwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbihhcHBEaXIpXSA6IFtdKSxcclxuICAgIC8vIDQuIFx1OEQ0NFx1NkU5MFx1OTg4NFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NTQyRlx1NzUyOFx1RkYwOVxyXG4gICAgLi4uKGVuYWJsZVJlc291cmNlUHJlbG9hZCAhPT0gZmFsc2UgPyBbcmVzb3VyY2VQcmVsb2FkUGx1Z2luKCldIDogW10pLFxyXG4gICAgLy8gNS4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2ODM4XHU1RkMzXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjA5XHJcbiAgICAuLi5jdXN0b21QbHVnaW5zLFxyXG4gICAgLy8gNi4gVnVlIFx1NjNEMlx1NEVGNlxyXG4gICAgdnVlKHtcclxuICAgICAgc2NyaXB0OiB7XHJcbiAgICAgICAgZnM6IHtcclxuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXHJcbiAgICAgICAgICByZWFkRmlsZTogKGZpbGU6IHN0cmluZykgPT4gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIC8vIDcuIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxyXG4gICAgY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpLFxyXG4gICAgLy8gOC4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XHJcbiAgICBjcmVhdGVDb21wb25lbnRzQ29uZmlnKHsgaW5jbHVkZVNoYXJlZDogdHJ1ZSB9KSxcclxuICAgIC8vIDkuIFVub0NTUyBcdTYzRDJcdTRFRjZcclxuICAgIFVub0NTUyh7XHJcbiAgICAgIGNvbmZpZ0ZpbGU6IHdpdGhSb290KCd1bm8uY29uZmlnLnRzJyksXHJcbiAgICB9KSxcclxuICAgIC8vIDEwLiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XHJcbiAgICBidGMoe1xyXG4gICAgICB0eXBlOiAnYWRtaW4nIGFzIGFueSxcclxuICAgICAgcHJveHksXHJcbiAgICAgIGVwczoge1xyXG4gICAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICAgICAgICBkaWN0OiBmYWxzZSxcclxuICAgICAgICBkaXN0OiAnLi9idWlsZC9lcHMnLFxyXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuZXBzLFxyXG4gICAgICB9LFxyXG4gICAgICBzdmc6IHtcclxuICAgICAgICBza2lwTmFtZXM6IFsnYmFzZScsICdpY29ucyddLFxyXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuc3ZnLFxyXG4gICAgICB9LFxyXG4gICAgICAuLi5idGNPcHRpb25zLFxyXG4gICAgfSksXHJcbiAgICAvLyAxMS4gVnVlSTE4biBcdTYzRDJcdTRFRjZcclxuICAgIFZ1ZUkxOG5QbHVnaW4oe1xyXG4gICAgICBpbmNsdWRlOiB2dWVJMThuT3B0aW9ucz8uaW5jbHVkZSB8fCBbXHJcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbG9jYWxlcy8qKicpLFxyXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL3ttb2R1bGVzLHBsdWdpbnN9LyoqL2xvY2FsZXMvKionKSxcclxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzLyoqJyksXHJcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucy8qKi9sb2NhbGVzLyoqJyksXHJcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL3poLUNOLnRzJyksXHJcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTLnRzJyksXHJcbiAgICAgIF0sXHJcbiAgICAgIHJ1bnRpbWVPbmx5OiB2dWVJMThuT3B0aW9ucz8ucnVudGltZU9ubHkgPz8gdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgLy8gMTIuIENTUyBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcclxuICAgIGVuc3VyZUNzc1BsdWdpbigpLFxyXG4gICAgLy8gMTMuIFx1NUYzQVx1NTIzNlx1NzUxRlx1NjIxMFx1NjVCMCBoYXNoIFx1NjNEMlx1NEVGNlxyXG4gICAgZm9yY2VOZXdIYXNoUGx1Z2luKCksXHJcbiAgICAvLyAxNC4gXHU0RkVFXHU1OTBEXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1IGhhc2ggXHU2M0QyXHU0RUY2XHJcbiAgICBmaXhEeW5hbWljSW1wb3J0SGFzaFBsdWdpbigpLFxyXG4gICAgLy8gMTUuIFx1NEZFRVx1NTkwRCBjaHVuayBcdTVGMTVcdTc1MjhcdTYzRDJcdTRFRjZcclxuICAgIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbigpLFxyXG4gICAgLy8gMTYuIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdTRFNUZcdTk3MDBcdTg5ODFcdUZGMENcdTU2RTBcdTRFM0FcdTUzRUZcdTgwRkRcdTY3MDlcdTVCNTBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdUZGMDlcclxuICAgIGVuc3VyZUJhc2VVcmxQbHVnaW4oYmFzZVVybCwgYXBwQ29uZmlnLmRldkhvc3QsIGFwcENvbmZpZy5wcmVQb3J0LCBtYWluQXBwUG9ydCksXHJcbiAgICAvLyAxNy4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XHJcbiAgICBhZGRWZXJzaW9uUGx1Z2luKCksXHJcbiAgICAvLyAxOC4gXHU0RjE4XHU1MzE2IGNodW5rcyBcdTYzRDJcdTRFRjZcclxuICAgIG9wdGltaXplQ2h1bmtzUGx1Z2luKCksXHJcbiAgICAvLyAxOS4gQ2h1bmsgXHU5QThDXHU4QkMxXHU2M0QyXHU0RUY2XHJcbiAgICBjaHVua1ZlcmlmeVBsdWdpbigpLFxyXG4gIF07XHJcblxyXG4gIC8vIFx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxyXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xyXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxyXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICAvLyBcdTUzRUFcdTc5RkJcdTk2NjQgY29uc29sZS5sb2dcdUZGMENcdTRGRERcdTc1NTkgY29uc29sZS5lcnJvciBcdTU0OEMgY29uc29sZS53YXJuXHVGRjBDXHU0RkJGXHU0RThFXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4QzAzXHU4QkQ1XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiBbJ2xvZyddLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgICAgcmVkdWNlX3ZhcnM6IGZhbHNlLFxyXG4gICAgICAgIHJlZHVjZV9mdW5jczogZmFsc2UsXHJcbiAgICAgICAgcGFzc2VzOiAxLFxyXG4gICAgICAgIGNvbGxhcHNlX3ZhcnM6IGZhbHNlLFxyXG4gICAgICAgIGRlYWRfY29kZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUJGOVx1NEU4RSBFUyBcdTZBMjFcdTU3NTdcdUZGMENcdTVCOENcdTUxNjhcdTc5ODFcdTc1MjggbWFuZ2xlIFx1NEVFNVx1OTA3Rlx1NTE0RFx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFx1ODhBQlx1NkRGN1x1NkRDNlxyXG4gICAgICAvLyBcdThGRDlcdTUzRUZcdTRFRTVcdTk2MzJcdTZCNjIgXCJkb2VzIG5vdCBwcm92aWRlIGFuIGV4cG9ydCBuYW1lZCAncidcIiBcdTk1MTlcdThCRUZcclxuICAgICAgLy8gXHU4NjdEXHU3MTM2XHU4RkQ5XHU0RjFBXHU1ODlFXHU1MkEwXHU0RTAwXHU0RTlCXHU2NTg3XHU0RUY2XHU1OTI3XHU1QzBGXHVGRjBDXHU0RjQ2XHU1M0VGXHU0RUU1XHU3ODZFXHU0RkREXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU2QjYzXHU1RTM4XHU1REU1XHU0RjVDXHJcbiAgICAgIG1hbmdsZTogZmFsc2UsXHJcbiAgICAgIC8vIFx1NjIxNlx1ODAwNVx1NEY3Rlx1NzUyOFx1NEVFNVx1NEUwQlx1OTE0RFx1N0Y2RVx1NEZERFx1NzU1OVx1NTFGRFx1NjU3MFx1NTQwRFx1NTQ4Q1x1N0M3Qlx1NTQwRFx1RkYwQ1x1NEY0Nlx1Nzk4MVx1NzUyOFx1NTNEOFx1OTFDRlx1NTQwRFx1NkRGN1x1NkRDNlx1RkYxQVxyXG4gICAgICAvLyBtYW5nbGU6IHtcclxuICAgICAgLy8gICBrZWVwX2ZuYW1lczogdHJ1ZSxcclxuICAgICAgLy8gICBrZWVwX2NsYXNzbmFtZXM6IHRydWUsXHJcbiAgICAgIC8vICAgcmVzZXJ2ZWQ6IFtdLFxyXG4gICAgICAvLyAgIHByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICAvLyB9LFxyXG4gICAgICBmb3JtYXQ6IHtcclxuICAgICAgICBjb21tZW50czogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDEwICogMTAyNCxcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczogY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWUucmVwbGFjZSgnLWFwcCcsICcnKSksXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAuLi5jdXN0b21CdWlsZCxcclxuICB9O1xyXG5cclxuICAvLyBcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcclxuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xyXG4gICAgcG9ydDogYXBwQ29uZmlnLmRldlBvcnQsXHJcbiAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICAgIGNvcnM6IHRydWUsXHJcbiAgICBvcmlnaW46IGBodHRwOi8vJHthcHBDb25maWcuZGV2SG9zdH06JHthcHBDb25maWcuZGV2UG9ydH1gLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycsXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXHJcbiAgICB9LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIGhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxyXG4gICAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcclxuICAgICAgb3ZlcmxheTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgcHJveHksXHJcbiAgICBmczoge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlLFxyXG4gICAgICBhbGxvdzogW1xyXG4gICAgICAgIHdpdGhSb290KCcuJyksXHJcbiAgICAgICAgd2l0aFBhY2thZ2VzKCcuJyksXHJcbiAgICAgICAgd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcclxuICAgICAgXSxcclxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIC4uLmN1c3RvbVNlcnZlcixcclxuICB9O1xyXG5cclxuICAvLyBcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcclxuICBjb25zdCBwcmV2aWV3Q29uZmlnOiBVc2VyQ29uZmlnWydwcmV2aWV3J10gPSB7XHJcbiAgICBwb3J0OiBhcHBDb25maWcucHJlUG9ydCxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBvcGVuOiBmYWxzZSxcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHByb3h5LFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsT1BUSU9OUycsXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcclxuICAgIH0sXHJcbiAgICAuLi5jdXN0b21QcmV2aWV3LFxyXG4gIH07XHJcblxyXG4gIC8vIFx1NEYxOFx1NTMxNlx1NEY5RFx1OEQ1Nlx1OTE0RFx1N0Y2RVxyXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OTg4NFx1NTE0OFx1NTMwNVx1NTQyQlx1NjI0MFx1NjcwOVx1NUI1MFx1NUU5NFx1NzUyOFx1NTNFRlx1ODBGRFx1NzUyOFx1NTIzMFx1NzY4NFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTIwN1x1NjM2Mlx1NUU5NFx1NzUyOFx1NjVGNlx1ODlFNlx1NTNEMVx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFxyXG4gIGNvbnN0IG9wdGltaXplRGVwc0NvbmZpZzogVXNlckNvbmZpZ1snb3B0aW1pemVEZXBzJ10gPSB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICd2dWUnLFxyXG4gICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICdwaW5pYScsXHJcbiAgICAgICdkYXlqcycsXHJcbiAgICAgICdlbGVtZW50LXBsdXMnLFxyXG4gICAgICAnZWxlbWVudC1wbHVzL2VzJyxcclxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy96aC1jbicsXHJcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvZW4nLFxyXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY2FzY2FkZXIvc3R5bGUvY3NzJyxcclxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcclxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxyXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXHJcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscycsXHJcbiAgICAgICd2aXRlLXBsdWdpbi1xaWFua3VuL2Rpc3QvaGVscGVyJyxcclxuICAgICAgJ3FpYW5rdW4nLFxyXG4gICAgICAnc2luZ2xlLXNwYScsXHJcbiAgICAgICdAdnVldXNlL2NvcmUnLFxyXG4gICAgICAndnVlLWkxOG4nLFxyXG4gICAgICAnbG9kYXNoLWVzJyxcclxuICAgICAgJ3hsc3gnLFxyXG4gICAgICAnY2hhcmRldCcsXHJcbiAgICAgICdlY2hhcnRzL2NvcmUnLFxyXG4gICAgXSxcclxuICAgIGV4Y2x1ZGU6IFtdLFxyXG4gICAgZm9yY2U6IGZhbHNlLFxyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgcGx1Z2luczogW10sXHJcbiAgICB9LFxyXG4gICAgLi4uY3VzdG9tT3B0aW1pemVEZXBzLFxyXG4gIH07XHJcblxyXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcclxuICBjb25zdCBjc3NDb25maWc6IFVzZXJDb25maWdbJ2NzcyddID0ge1xyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J10sXHJcbiAgICAgICAgaW5jbHVkZVBhdGhzOiBbXHJcbiAgICAgICAgICB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMnKSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAuLi5jdXN0b21Dc3MsXHJcbiAgfTtcclxuXHJcbiAgLy8gXHU4RkQ0XHU1NkRFXHU1QjhDXHU2NTc0XHU5MTREXHU3RjZFXHJcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBcHVibGljRGlyIFx1NzY4NFx1OTE0RFx1N0Y2RVx1OTcwMFx1ODk4MVx1NTcyOCB2aXRlLmNvbmZpZy50cyBcdTRFMkRcdTY4MzlcdTYzNkUgY29tbWFuZCBcdTUyQThcdTYwMDFcdThCQkVcdTdGNkVcclxuICAvLyBcdThGRDlcdTkxQ0NcdTU5Q0JcdTdFQzhcdTU0MkZcdTc1MjggcHVibGljRGlyXHVGRjBDXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4XHVGRjBDXHU2Nzg0XHU1RUZBXHU3M0FGXHU1ODgzXHU0RjFBXHU1NzI4IHZpdGUuY29uZmlnLnRzIFx1NEUyRFx1ODhBQlx1ODk4Nlx1NzZENlxyXG4gIGNvbnN0IGZpbmFsUHVibGljRGlyID0gcHVibGljRGlyO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBiYXNlOiBiYXNlVXJsLFxyXG4gICAgcHVibGljRGlyOiBmaW5hbFB1YmxpY0RpcixcclxuICAgIHJlc29sdmU6IGNyZWF0ZUJhc2VSZXNvbHZlKGFwcERpciwgYXBwTmFtZSksXHJcbiAgICBwbHVnaW5zLFxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICBjaGFyc2V0OiAndXRmOCcsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiBzZXJ2ZXJDb25maWcsXHJcbiAgICBwcmV2aWV3OiBwcmV2aWV3Q29uZmlnLFxyXG4gICAgb3B0aW1pemVEZXBzOiBvcHRpbWl6ZURlcHNDb25maWcsXHJcbiAgICBjc3M6IGNzc0NvbmZpZyxcclxuICAgIGJ1aWxkOiBidWlsZENvbmZpZyxcclxuICB9O1xyXG59XHJcblxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFx1dGlsc1xcXFxwYXRoLWhlbHBlcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3V0aWxzL3BhdGgtaGVscGVycy50c1wiOy8qKlxyXG4gKiBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcclxuICogXHU2M0QwXHU0RjlCXHU3RURGXHU0RTAwXHU3Njg0XHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU1MUZEXHU2NTcwXHVGRjBDXHU3NTI4XHU0RThFIFZpdGUgXHU5MTREXHU3RjZFXHU0RTJEXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuLyoqXHJcbiAqIFx1NTIxQlx1NUVGQVx1OERFRlx1NUY4NFx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxyXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxyXG4gKiBAcmV0dXJucyBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXI6IHN0cmluZykge1xyXG4gIC8qKlxyXG4gICAqIFx1ODlFM1x1Njc5MFx1NUU5NFx1NzUyOCBzcmMgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHJcbiAgICovXHJcbiAgY29uc3Qgd2l0aFNyYyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShhcHBEaXIsIHJlbGF0aXZlUGF0aCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFx1ODlFM1x1Njc5MCBwYWNrYWdlcyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcclxuICAgKi9cclxuICBjb25zdCB3aXRoUGFja2FnZXMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxyXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcycsIHJlbGF0aXZlUGF0aCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFx1ODlFM1x1Njc5MFx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxyXG4gICAqL1xyXG4gIGNvbnN0IHdpdGhSb290ID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcclxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4nLCByZWxhdGl2ZVBhdGgpO1xyXG5cclxuICAvKipcclxuICAgKiBcdTg5RTNcdTY3OTAgY29uZmlncyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcclxuICAgKi9cclxuICBjb25zdCB3aXRoQ29uZmlncyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXHJcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL2NvbmZpZ3MnLCByZWxhdGl2ZVBhdGgpO1xyXG5cclxuICByZXR1cm4geyB3aXRoU3JjLCB3aXRoUGFja2FnZXMsIHdpdGhSb290LCB3aXRoQ29uZmlncyB9O1xyXG59XHJcblxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGF1dG8taW1wb3J0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2F1dG8taW1wb3J0LmNvbmZpZy50c1wiO1x1RkVGRi8qKlxuICogXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXHU2QTIxXHU2NzdGXG4gKiBcdTRGOUJcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdUZGMDhhZG1pbi1hcHAsIGxvZ2lzdGljcy1hcHAgXHU3QjQ5XHVGRjA5XHU0RjdGXHU3NTI4XG4gKi9cbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQXV0byBJbXBvcnQgXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCkge1xuICByZXR1cm4gQXV0b0ltcG9ydCh7XG4gICAgaW1wb3J0czogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAge1xuICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IFtcbiAgICAgICAgICAndXNlQ3J1ZCcsXG4gICAgICAgICAgJ3VzZURpY3QnLFxuICAgICAgICAgICd1c2VQZXJtaXNzaW9uJyxcbiAgICAgICAgICAndXNlUmVxdWVzdCcsXG4gICAgICAgICAgJ2NyZWF0ZUkxOG5QbHVnaW4nLFxuICAgICAgICAgICd1c2VJMThuJyxcbiAgICAgICAgXSxcbiAgICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogW1xuICAgICAgICAgICdmb3JtYXREYXRlJyxcbiAgICAgICAgICAnZm9ybWF0RGF0ZVRpbWUnLFxuICAgICAgICAgICdmb3JtYXRNb25leScsXG4gICAgICAgICAgJ2Zvcm1hdE51bWJlcicsXG4gICAgICAgICAgJ2lzRW1haWwnLFxuICAgICAgICAgICdpc1Bob25lJyxcbiAgICAgICAgICAnc3RvcmFnZScsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVxuICAgICAgfSksXG4gICAgXSxcblxuICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXG5cbiAgICBlc2xpbnRyYzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZpbGVwYXRoOiAnLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvbicsXG4gICAgfSxcblxuICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTk4OURcdTU5MTZcdTc2ODRcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdUZGMDlcbiAgICovXG4gIGV4dHJhRGlycz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1XHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXG4gICAqL1xuICBpbmNsdWRlU2hhcmVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ29tcG9uZW50cyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50c0NvbmZpZyhvcHRpb25zOiBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgZXh0cmFEaXJzID0gW10sIGluY2x1ZGVTaGFyZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGRpcnMgPSBbXG4gICAgJ3NyYy9jb21wb25lbnRzJywgLy8gXHU1RTk0XHU3NTI4XHU3RUE3XHU3RUM0XHU0RUY2XG4gICAgLi4uZXh0cmFEaXJzLCAvLyBcdTk4OURcdTU5MTZcdTc2ODRcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgXTtcblxuICAvLyBcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkJcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdUZGMENcdTZERkJcdTUyQTBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcbiAgaWYgKGluY2x1ZGVTaGFyZWQpIHtcbiAgICAvLyBcdTZERkJcdTUyQTBcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcdUZGMENcdTY1MkZcdTYzMDFcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcbiAgICBkaXJzLnB1c2goXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvYmFzaWMnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2xheW91dCcsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbmF2aWdhdGlvbicsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZm9ybScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZGF0YScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZmVlZGJhY2snLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL290aGVycydcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIENvbXBvbmVudHMoe1xuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREIFZpdGUgcmVsb2FkaW5nXG4gICAgICB9KSxcbiAgICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1ODlFM1x1Njc5MFx1NTY2OFx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHNcbiAgICAgIChjb21wb25lbnROYW1lKSA9PiB7XG4gICAgICAgIC8vIFx1NUMwNiBrZWJhYi1jYXNlIFx1OEY2Q1x1NjM2Mlx1NEUzQSBQYXNjYWxDYXNlXG4gICAgICAgIC8vIFx1NEY4Qlx1NTk4MjogYnRjLXN2ZyAtPiBCdGNTdmdcbiAgICAgICAgY29uc3QgY29udmVydFRvUGFzY2FsQ2FzZSA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ0J0YycpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTsgLy8gXHU1REYyXHU3RUNGXHU2NjJGIFBhc2NhbENhc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnYnRjLScpKSB7XG4gICAgICAgICAgICAvLyBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgICAgICAgICAgLnNwbGl0KCctJylcbiAgICAgICAgICAgICAgLm1hcChwYXJ0ID0+IHBhcnQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXJ0LnNsaWNlKDEpKVxuICAgICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ0J0YycpIHx8IGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnYnRjLScpKSB7XG4gICAgICAgICAgY29uc3QgcGFzY2FsTmFtZSA9IGNvbnZlcnRUb1Bhc2NhbENhc2UoY29tcG9uZW50TmFtZSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHBhc2NhbE5hbWUsXG4gICAgICAgICAgICBmcm9tOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdLFxuICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxuICAgIGRpcnMsXG4gICAgZXh0ZW5zaW9uczogWyd2dWUnLCAndHN4J10sIC8vIFx1NjUyRlx1NjMwMSAudnVlIFx1NTQ4QyAudHN4IFx1NjU4N1x1NEVGNlxuICAgIC8vIFx1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlxuICAgIGRlZXA6IHRydWUsXG4gICAgLy8gXHU1MzA1XHU1NDJCXHU2MjQwXHU2NzA5IEJ0YyBcdTVGMDBcdTU5MzRcdTc2ODRcdTdFQzRcdTRFRjZcbiAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudHN4JC8sIC9CdGNbQS1aXS8sIC9idGMtW2Etel0vXSxcbiAgfSk7XG59XG4vLyBVVEYtOCBlbmNvZGluZyBmaXhcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZS1hcHAtY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnLnRzXCI7LyoqXHJcbiAqIFZpdGUgXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHJcbiAqIFx1NzUyOFx1NEU4RVx1NEVDRVx1N0VERlx1NEUwMFx1OTE0RFx1N0Y2RVx1NEUyRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi9hcHAtZW52LmNvbmZpZyc7XHJcblxyXG4vKipcclxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Vml0ZUFwcENvbmZpZyhhcHBOYW1lOiBzdHJpbmcpOiB7XHJcbiAgZGV2UG9ydDogbnVtYmVyO1xyXG4gIGRldkhvc3Q6IHN0cmluZztcclxuICBwcmVQb3J0OiBudW1iZXI7XHJcbiAgcHJlSG9zdDogc3RyaW5nO1xyXG4gIHByb2RIb3N0OiBzdHJpbmc7XHJcbiAgbWFpbkFwcE9yaWdpbjogc3RyaW5nO1xyXG59IHtcclxuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XHJcbiAgaWYgKCFhcHBDb25maWcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdzeXN0ZW0tYXBwJyk7XHJcbiAgY29uc3QgbWFpbkFwcE9yaWdpbiA9IG1haW5BcHBDb25maWdcclxuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxyXG4gICAgOiAnaHR0cDovL2xvY2FsaG9zdDo0MTgwJztcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRldlBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5kZXZQb3J0LCAxMCksXHJcbiAgICBkZXZIb3N0OiBhcHBDb25maWcuZGV2SG9zdCxcclxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXHJcbiAgICBwcmVIb3N0OiBhcHBDb25maWcucHJlSG9zdCxcclxuICAgIHByb2RIb3N0OiBhcHBDb25maWcucHJvZEhvc3QsXHJcbiAgICBtYWluQXBwT3JpZ2luLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEByZXR1cm5zIFx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcFR5cGUoYXBwTmFtZTogc3RyaW5nKTogJ21haW4nIHwgJ3N1YicgfCAnbGF5b3V0JyB8ICdtb2JpbGUnIHtcclxuICBpZiAoYXBwTmFtZSA9PT0gJ3N5c3RlbS1hcHAnKSByZXR1cm4gJ21haW4nO1xyXG4gIGlmIChhcHBOYW1lID09PSAnbGF5b3V0LWFwcCcpIHJldHVybiAnbGF5b3V0JztcclxuICBpZiAoYXBwTmFtZSA9PT0gJ21vYmlsZS1hcHAnKSByZXR1cm4gJ21vYmlsZSc7XHJcbiAgcmV0dXJuICdzdWInOyAvLyBcdTUxNzZcdTRFRDZcdTkwRkRcdTY2MkZcdTVCNTBcdTVFOTRcdTc1MjhcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1ODNCN1x1NTNENiBiYXNlIFVSTFxyXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcclxuICogQHBhcmFtIGlzUHJldmlld0J1aWxkIFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxyXG4gKiBAcmV0dXJucyBiYXNlIFVSTFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwoYXBwTmFtZTogc3RyaW5nLCBpc1ByZXZpZXdCdWlsZDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcclxuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XHJcbiAgaWYgKCFhcHBDb25maWcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxyXG4gIGlmIChpc1ByZXZpZXdCdWlsZCkge1xyXG4gICAgcmV0dXJuIGBodHRwOi8vJHthcHBDb25maWcucHJlSG9zdH06JHthcHBDb25maWcucHJlUG9ydH0vYDtcclxuICB9XHJcbiAgXHJcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU4QkE5XHU2RDRGXHU4OUM4XHU1NjY4XHU2ODM5XHU2MzZFXHU1N0RGXHU1NDBEXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA5XHJcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1QjUwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU1OTgyIHByb2R1Y3Rpb24uYmVsbGlzLmNvbS5jblx1RkYwOVxyXG4gIHJldHVybiAnLyc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTgzQjdcdTUzRDYgcHVibGljRGlyIFx1OERFRlx1NUY4NFxyXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcclxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICogQHJldHVybnMgcHVibGljRGlyIFx1OERFRlx1NUY4NFx1NjIxNiBmYWxzZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0RpcihhcHBOYW1lOiBzdHJpbmcsIGFwcERpcjogc3RyaW5nKTogc3RyaW5nIHwgZmFsc2Uge1xyXG4gIC8vIGFkbWluLWFwcFx1MzAwMW1vYmlsZS1hcHAgXHU1NDhDIHN5c3RlbS1hcHAgXHU0RjdGXHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcclxuICBpZiAoYXBwTmFtZSA9PT0gJ2FkbWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ21vYmlsZS1hcHAnIHx8IGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykge1xyXG4gICAgcmV0dXJuIHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTE3MVx1NEVBQlx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHJcbiAgcmV0dXJuIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljJyk7XHJcbn1cclxuXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXBwLWVudi5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hcHAtZW52LmNvbmZpZy50c1wiOy8qKlxuICogXHU3RURGXHU0RTAwXHU3Njg0XHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTkwRkRcdTRFQ0VcdThGRDlcdTkxQ0NcdThCRkJcdTUzRDZcdUZGMENcdTkwN0ZcdTUxNERcdTRFOENcdTRFNDlcdTYwMjdcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwcEVudkNvbmZpZyB7XG4gIGFwcE5hbWU6IHN0cmluZztcbiAgZGV2SG9zdDogc3RyaW5nO1xuICBkZXZQb3J0OiBzdHJpbmc7XG4gIHByZUhvc3Q6IHN0cmluZztcbiAgcHJlUG9ydDogc3RyaW5nO1xuICBwcm9kSG9zdDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgY29uc3QgQVBQX0VOVl9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAge1xuICAgIGFwcE5hbWU6ICdzeXN0ZW0tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgwJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MCcsXG4gICAgcHJvZEhvc3Q6ICdiZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdhZG1pbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgxJyxcbiAgICBwcm9kSG9zdDogJ2FkbWluLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xvZ2lzdGljcy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgyJyxcbiAgICBwcm9kSG9zdDogJ2xvZ2lzdGljcy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdxdWFsaXR5LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHByb2RIb3N0OiAncXVhbGl0eS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdwcm9kdWN0aW9uLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODQnLFxuICAgIHByb2RIb3N0OiAncHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdlbmdpbmVlcmluZy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODUnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg1JyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ21vYmlsZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkxJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdkb2NzLXNpdGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBkZXZQb3J0OiAnNDE3MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxNzMnLFxuICAgIHByb2RIb3N0OiAnZG9jcy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsYXlvdXQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg4JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MicsXG4gICAgcHJvZEhvc3Q6ICdsYXlvdXQuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbW9uaXRvci1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODknLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg5JyxcbiAgICBwcm9kSG9zdDogJ21vbml0b3IuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0KTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYmFzZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzXCI7LyoqXHJcbiAqIFx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xyXG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODRcdTUyMkJcdTU0MERcdTU0OEMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcclxuICovXHJcblxyXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuL3V0aWxzL3BhdGgtaGVscGVycyc7XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHJcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxyXG4gKiBAcmV0dXJucyBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXI6IHN0cmluZywgX2FwcE5hbWU6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xyXG4gIGNvbnN0IHsgd2l0aFNyYywgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAnQCc6IHdpdGhTcmMoJ3NyYycpLFxyXG4gICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcclxuICAgICdAc2VydmljZXMnOiB3aXRoU3JjKCdzcmMvc2VydmljZXMnKSxcclxuICAgICdAY29tcG9uZW50cyc6IHdpdGhTcmMoJ3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXHJcbiAgICAnQGF1dGgnOiB3aXRoUm9vdCgnYXV0aCcpLFxyXG4gICAgJ0Bjb25maWdzJzogd2l0aENvbmZpZ3MoJycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLWNvcmUnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxyXG4gICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtdXRpbHMvc3JjJyksXHJcbiAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJzogd2l0aFBhY2thZ2VzKCdzdWJhcHAtbWFuaWZlc3RzL3NyYy9pbmRleC50cycpLFxyXG4gICAgJ0BidGMtY29tbW9uJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXHJcbiAgICAnQGJ0Yy1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cycpLFxyXG4gICAgJ0BidGMtc3R5bGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXHJcbiAgICAnQGJ0Yy1sb2NhbGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcycpLFxyXG4gICAgJ0Bhc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSxcclxuICAgICdAYnRjLWFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxyXG4gICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxyXG4gICAgJ0BidGMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscycpLFxyXG4gICAgJ0BidGMtY3J1ZCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcclxuICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NTE3N1x1NEY1M1x1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1Nzg2RVx1NEZERFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1RkYwOVxyXG4gICAgJ0BjaGFydHMtdXRpbHMvY3NzLXZhcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJyksXHJcbiAgICAnQGNoYXJ0cy11dGlscy9jb2xvcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvcicpLFxyXG4gICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcclxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyksXHJcbiAgICAnQGNoYXJ0cy10eXBlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcycpLFxyXG4gICAgJ0BjaGFydHMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcclxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXHJcbiAgICAvLyBFbGVtZW50IFBsdXMgXHU1MjJCXHU1NDBEXHJcbiAgICAnZWxlbWVudC1wbHVzL2VzJzogJ2VsZW1lbnQtcGx1cy9lcycsXHJcbiAgICAnZWxlbWVudC1wbHVzL2Rpc3QnOiAnZWxlbWVudC1wbHVzL2Rpc3QnLFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDAgcmVzb2x2ZSBcdTkxNERcdTdGNkVcclxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEByZXR1cm5zIHJlc29sdmUgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZVJlc29sdmUoYXBwRGlyOiBzdHJpbmcsIGFwcE5hbWU6IHN0cmluZyk6IFVzZXJDb25maWdbJ3Jlc29sdmUnXSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFsaWFzOiBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXIsIGFwcE5hbWUpLFxyXG4gICAgZGVkdXBlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSddLFxyXG4gICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcubXRzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnZ1ZSddLFxyXG4gIH07XHJcbn1cclxuXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGJ1aWxkXFxcXG1hbnVhbC1jaHVua3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2J1aWxkL21hbnVhbC1jaHVua3MudHNcIjsvKipcclxuICogbWFudWFsQ2h1bmtzIFx1N0I1Nlx1NzU2NVx1OTE0RFx1N0Y2RVxyXG4gKiBcdTVCOUFcdTRFNDlcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTdCNTZcdTc1NjVcdUZGMENcdTVDMDZcdTRFMERcdTU0MENcdTdDN0JcdTU3OEJcdTc2ODRcdTRFRTNcdTc4MDFcdTYyNTNcdTUzMDVcdTUyMzBcdTRFMERcdTU0MENcdTc2ODQgY2h1bmtcclxuICovXHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTUxRkRcdTY1NzBcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU3NTI4XHU0RThFXHU4RkM3XHU2RUU0XHU3Mjc5XHU1QjlBXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjA5XHJcbiAqIEByZXR1cm5zIG1hbnVhbENodW5rcyBcdTUxRkRcdTY1NzBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgLy8gMC4gRVBTIFx1NjcwRFx1NTJBMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwOVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCd2aXJ0dWFsOmVwcycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ1xcXFwwdmlydHVhbDplcHMnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlc1xcXFxlcHMnKSkge1xyXG4gICAgICByZXR1cm4gJ2Vwcy1zZXJ2aWNlJztcclxuICAgIH1cclxuXHJcbiAgICAvLyAwLjUuIFx1ODNEQ1x1NTM1NVx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdjb25maWdzL2xheW91dC1icmlkZ2UnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdAY29uZmlncy9sYXlvdXQtYnJpZGdlJykpIHtcclxuICAgICAgcmV0dXJuICdtZW51LXJlZ2lzdHJ5JztcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gXHU1OTA0XHU3NDA2IHN1YmFwcC1tYW5pZmVzdHNcdUZGMUFcdTUzRUFcdTUzMDVcdTU0MkJcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc3ViYXBwLW1hbmlmZXN0cycpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnKSkge1xyXG4gICAgICAvLyBcdTYzOTJcdTk2NjRcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgSlNPTiBcdTY1ODdcdTRFRjZcclxuICAgICAgY29uc3Qgb3RoZXJBcHBzID0gWydmaW5hbmNlJywgJ2xvZ2lzdGljcycsICdzeXN0ZW0nLCAncXVhbGl0eScsICdlbmdpbmVlcmluZycsICdwcm9kdWN0aW9uJywgJ21vbml0b3InLCAnYWRtaW4nXTtcclxuICAgICAgY29uc3QgY3VycmVudEFwcE5hbWUgPSBhcHBOYW1lLnJlcGxhY2UoJy1hcHAnLCAnJyk7XHJcbiAgICAgIGNvbnN0IHNob3VsZEV4Y2x1ZGUgPSBvdGhlckFwcHNcclxuICAgICAgICAuZmlsdGVyKGFwcCA9PiBhcHAgIT09IGN1cnJlbnRBcHBOYW1lKVxyXG4gICAgICAgIC5zb21lKGFwcCA9PiBpZC5pbmNsdWRlcyhgbWFuaWZlc3RzLyR7YXBwfS5qc29uYCkpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHNob3VsZEV4Y2x1ZGUpIHtcclxuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcdUZGMENcdTRFMERcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgICAgLy8gXHU1M0VBXHU2MjUzXHU1MzA1XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0IFx1NTQ4Q1x1NTE3MVx1NEVBQlx1NEVFM1x1NzgwMVxyXG4gICAgICByZXR1cm4gJ21lbnUtcmVnaXN0cnknO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDEuIFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYxQUVDaGFydHNcdUZGMDhcdTdFQUYgZWNoYXJ0cyBcdTU0OEMgenJlbmRlclx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiB2dWUtZWNoYXJ0c1x1RkYwOVxyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWNoYXJ0cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96cmVuZGVyJykpIHtcclxuICAgICAgcmV0dXJuICdlY2hhcnRzLXZlbmRvcic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMi4gXHU1MTc2XHU0RUQ2XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA4XHU1QjhDXHU1MTY4XHU3MkVDXHU3QUNCXHVGRjA5XHJcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yJykpIHtcclxuICAgICAgcmV0dXJuICdsaWItbW9uYWNvJztcclxuICAgIH1cclxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3RocmVlJykpIHtcclxuICAgICAgcmV0dXJuICdsaWItdGhyZWUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDMuIFZ1ZSBcdTc1MUZcdTYwMDFcdTVFOTMgKyBcdTYyNDBcdTY3MDlcdTRGOURcdThENTYgVnVlIFx1NzY4NFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyArIFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xyXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXInKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3BpbmlhJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGVsZW1lbnQtcGx1cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtZWNoYXJ0cycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9sb2Rhc2gnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZScpIHx8XHJcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcclxuICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvcmUnKSB8fFxyXG4gICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtdXRpbHMnKSkge1xyXG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIHZpdGUtcGx1Z2luIFx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NEU1Rlx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvdml0ZS1wbHVnaW4nKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy92aXRlLXBsdWdpbicpKSB7XHJcbiAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgIH1cclxuXHJcbiAgICAvLyA0LiBcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcclxuICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIFx1OEZENFx1NTZERSB1bmRlZmluZWQgXHU4ODY4XHU3OTNBXHU1NDA4XHU1RTc2XHU1MjMwXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHJcbiAgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYnVpbGRcXFxccm9sbHVwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvYnVpbGQvcm9sbHVwLmNvbmZpZy50c1wiOy8qKlxyXG4gKiBSb2xsdXAgXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XHJcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NCBSb2xsdXAgXHU5MTREXHU3RjZFXHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBSb2xsdXBPcHRpb25zLCBXYXJuaW5nSGFuZGxlcldpdGhEZWZhdWx0LCBPdXRwdXRBc3NldCwgV2FybmluZyB9IGZyb20gJ3JvbGx1cCc7XHJcbmltcG9ydCB7IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5IH0gZnJvbSAnLi9tYW51YWwtY2h1bmtzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUm9sbHVwQ29uZmlnT3B0aW9ucyB7XHJcbiAgLyoqXHJcbiAgICogXHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiAnYXNzZXRzJ1x1RkYwOVxyXG4gICAqL1xyXG4gIGFzc2V0RGlyPzogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIGNodW5rIFx1NjU4N1x1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1OUVEOFx1OEJBNDogXHU0RTBFIGFzc2V0RGlyIFx1NzZGOFx1NTQwQ1x1RkYwOVxyXG4gICAqL1xyXG4gIGNodW5rRGlyPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBIFJvbGx1cCBcdTkxNERcdTdGNkVcclxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHJcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxyXG4gKiBAcmV0dXJucyBSb2xsdXAgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWU6IHN0cmluZywgb3B0aW9ucz86IFJvbGx1cENvbmZpZ09wdGlvbnMpOiBSb2xsdXBPcHRpb25zIHtcclxuICBjb25zdCBtYW51YWxDaHVua3MgPSBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lKTtcclxuICBjb25zdCBhc3NldERpciA9IG9wdGlvbnM/LmFzc2V0RGlyIHx8ICdhc3NldHMnO1xyXG4gIGNvbnN0IGNodW5rRGlyID0gb3B0aW9ucz8uY2h1bmtEaXIgfHwgYXNzZXREaXI7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwcmVzZXJ2ZUVudHJ5U2lnbmF0dXJlczogJ3N0cmljdCcsXHJcbiAgICBvbndhcm4od2FybmluZzogV2FybmluZywgd2FybjogV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCkge1xyXG4gICAgICAvLyBcdThGQzdcdTZFRTRcdTVERjJcdTc3RTVcdThCNjZcdTU0NEFcclxuICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnIHx8XHJcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdkeW5hbWljYWxseSBpbXBvcnRlZCcpICYmXHJcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdzdGF0aWNhbGx5IGltcG9ydGVkJykpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdHZW5lcmF0ZWQgYW4gZW1wdHkgY2h1bmsnKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB3YXJuKHdhcm5pbmcpO1xyXG4gICAgfSxcclxuICAgIG91dHB1dDoge1xyXG4gICAgICBmb3JtYXQ6ICdlc20nLFxyXG4gICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsXHJcbiAgICAgIG1hbnVhbENodW5rcyxcclxuICAgICAgcHJlc2VydmVNb2R1bGVzOiBmYWxzZSxcclxuICAgICAgZ2VuZXJhdGVkQ29kZToge1xyXG4gICAgICAgIGNvbnN0QmluZGluZ3M6IGZhbHNlLCAvLyBcdTRFMERcdTRGN0ZcdTc1MjggY29uc3RcdUZGMENcdTkwN0ZcdTUxNEQgVERaIFx1OTVFRVx1OTg5OFxyXG4gICAgICB9LFxyXG4gICAgICBjaHVua0ZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS1baGFzaF0uanNgLFxyXG4gICAgICBlbnRyeUZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS1baGFzaF0uanNgLFxyXG4gICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogT3V0cHV0QXNzZXQpID0+IHtcclxuICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcclxuICAgICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5jc3NgO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYCR7YXNzZXREaXJ9L1tuYW1lXS1baGFzaF0uW2V4dF1gO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGV4dGVybmFsOiBbXHJcbiAgICAgIC8vIHZpdGUtcGx1Z2luIFx1NjYyRlx1Njc4NFx1NUVGQVx1NjVGNlx1NjNEMlx1NEVGNlx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEVFM1x1NzgwMVx1NEUyRFxyXG4gICAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXHJcbiAgICAgIC9eQGJ0Y1xcL3ZpdGUtcGx1Z2luLyxcclxuICAgIF0sXHJcbiAgfTtcclxufVxyXG5cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNsZWFuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzXCI7LyoqXG4gKiBcdTZFMDVcdTc0MDZcdTY3ODRcdTVFRkFcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgY29uc29sZS5sb2cobWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU4QjY2XHU1NDRBXHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVXYXJuKG1lc3NhZ2U6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTdFQUZcdTY1ODdcdTY3MkNcdThGOTNcdTUxRkFcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjbGVhbi1kaXN0LXBsdWdpbicsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2XHU2NUU3XHU3Njg0IGRpc3QgXHU3NkVFXHU1RjU1Li4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIGRpc3QgXHU3NkVFXHU1RjU1XHU1REYyXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VCVVNZJyB8fCBlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgICAgc2FmZVdhcm4oYFtjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2XHU1OTMxXHU4RDI1XHVGRjA4JHtlcnJvci5jb2RlfVx1RkYwOVx1RkYwQ1ZpdGUgXHU1QzA2XHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4MUVBXHU1MkE4XHU2RTA1XHU3NDA2XHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gVml0ZSBcdTVDMDZcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdUZGMDhlbXB0eU91dERpcjogdHJ1ZVx1RkYwOScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2h1bmsudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHNcIjsvKipcbiAqIENodW5rIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU1MzA1XHU2MkVDIGNodW5rIFx1OUE4Q1x1OEJDMVx1NTQ4Q1x1NEYxOFx1NTMxNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NzUxRlx1NjIxMFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtWZXJpZnlQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVml0ZSBQbHVnaW4gXHU3QzdCXHU1NzhCXHU1QjlBXHU0RTQ5XHU1M0VGXHU4MEZEXHU0RTBEXHU1QjhDXHU2NTc0XHVGRjBDbmFtZSBcdTVDNUVcdTYwMjdcdTY2MkZcdTY4MDdcdTUxQzZcdTVDNUVcdTYwMjdcbiAgICBuYW1lOiAnY2h1bmstdmVyaWZ5LXBsdWdpbicsXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zb2xlLmxvZygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTc1MUZcdTYyMTBcdTc2ODRcdTYyNDBcdTY3MDkgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBJyk7XG4gICAgICBjb25zdCBqc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgY29uc3QgY3NzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuSlMgY2h1bmtcdUZGMDhcdTUxNzEgJHtqc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAganNDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgXFxuQ1NTIGNodW5rXHVGRjA4XHU1MTcxICR7Y3NzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBjc3NDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmxvZyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zdCBpbmRleENodW5rID0ganNDaHVua3MuZmluZChqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2luZGV4LScpKTtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZSA9IGluZGV4Q2h1bmsgPyAoYnVuZGxlW2luZGV4Q2h1bmtdIGFzIGFueSk/LmNvZGU/Lmxlbmd0aCB8fCAwIDogMDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZUtCID0gaW5kZXhTaXplIC8gMTAyNDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZU1CID0gaW5kZXhTaXplS0IgLyAxMDI0O1xuXG4gICAgICBjb25zdCBtaXNzaW5nUmVxdWlyZWRDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAoIWluZGV4Q2h1bmspIHtcbiAgICAgICAgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzLnB1c2goJ2luZGV4Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhc0Vwc1NlcnZpY2UgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnZXBzLXNlcnZpY2UnKSk7XG4gICAgICBjb25zdCBoYXNFY2hhcnRzVmVuZG9yID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpO1xuICAgICAgY29uc3QgaGFzTGliTW9uYWNvID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2xpYi1tb25hY28nKSk7XG4gICAgICBjb25zdCBoYXNMaWJUaHJlZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItdGhyZWUnKSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHVEODNEXHVEQ0U2IFx1Njc4NFx1NUVGQVx1NjBDNVx1NTFCNVx1RkYwOFx1NUU3M1x1ODg2MVx1NjJDNlx1NTIwNlx1N0I1Nlx1NzU2NVx1RkYwOVx1RkYxQWApO1xuICAgICAgaWYgKGluZGV4Q2h1bmspIHtcbiAgICAgICAgY29uc29sZS5sb2coYCAgXHUyNzA1IGluZGV4OiBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMDhWdWVcdTc1MUZcdTYwMDEgKyBFbGVtZW50IFBsdXMgKyBcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdUZGMENcdTRGNTNcdTc5RUZ+JHtpbmRleFNpemVNQi50b0ZpeGVkKDIpfU1CIFx1NjcyQVx1NTM4Qlx1N0YyOVx1RkYwQ2d6aXBcdTU0MEV+JHsoaW5kZXhTaXplTUIgKiAwLjMpLnRvRml4ZWQoMil9TUJcdUZGMDlgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgIFx1Mjc0QyBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNFcHNTZXJ2aWNlKSBjb25zb2xlLmxvZyhgICBcdTI3MDUgZXBzLXNlcnZpY2U6IEVQUyBcdTY3MERcdTUyQTFcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNFY2hhcnRzVmVuZG9yKSBjb25zb2xlLmxvZyhgICBcdTI3MDUgZWNoYXJ0cy12ZW5kb3I6IEVDaGFydHMgKyB6cmVuZGVyXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjBDXHU2NUUwXHU0RjlEXHU4RDU2XHU5NUVFXHU5ODk4XHVGRjA5YCk7XG4gICAgICBpZiAoaGFzTGliTW9uYWNvKSBjb25zb2xlLmxvZyhgICBcdTI3MDUgbGliLW1vbmFjbzogTW9uYWNvIEVkaXRvclx1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOWApO1xuICAgICAgaWYgKGhhc0xpYlRocmVlKSBjb25zb2xlLmxvZyhgICBcdTI3MDUgbGliLXRocmVlOiBUaHJlZS5qc1x1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOWApO1xuICAgICAgY29uc29sZS5sb2coYCAgXHUyMTM5XHVGRTBGICBcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0OEMgVnVlIFx1NzUxRlx1NjAwMVx1NTQwOFx1NUU3Nlx1NTIzMFx1NEUzQlx1NjU4N1x1NEVGNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTIxRFx1NTlDQlx1NTMxNlx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OGApO1xuXG4gICAgICBpZiAobWlzc2luZ1JlcXVpcmVkQ2h1bmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTdGM0FcdTU5MzFcdTY4MzhcdTVGQzMgY2h1bmtcdUZGMUFgLCBtaXNzaW5nUmVxdWlyZWRDaHVua3MpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjgzOFx1NUZDMyBjaHVuayBcdTdGM0FcdTU5MzFcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjgzOFx1NUZDMyBjaHVuayBcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU5QThDXHU4QkMxXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTAwXHU4MUY0XHU2MDI3XG4gICAgICBjb25zb2xlLmxvZygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1REQwRCBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjcuLi4nKTtcbiAgICAgIGNvbnN0IGFsbENodW5rRmlsZXMgPSBuZXcgU2V0KFsuLi5qc0NodW5rcywgLi4uY3NzQ2h1bmtzXSk7XG4gICAgICBjb25zdCByZWZlcmVuY2VkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBjb25zdCBtaXNzaW5nRmlsZXM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyByZWZlcmVuY2VkQnk6IHN0cmluZ1tdOyBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdIH0+ID0gW107XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGNvZGVXaXRob3V0Q29tbWVudHMgPSBjaHVua0FueS5jb2RlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwvLiokL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKTtcblxuICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccypbXCInXShcXC8/YXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpW1wiJ11cXHMqXFwpL2c7XG4gICAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1cmxQYXR0ZXJuID0gL25ld1xccytVUkxcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXS9nO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB1cmxQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbcmVmZXJlbmNlZEZpbGUsIHJlZmVyZW5jZWRCeV0gb2YgcmVmZXJlbmNlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgIGxldCBleGlzdHMgPSBhbGxDaHVua0ZpbGVzLmhhcyhmaWxlTmFtZSk7XG4gICAgICAgIGxldCBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICBwb3NzaWJsZU1hdGNoZXMgPSBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLmZpbHRlcihjaHVua0ZpbGUgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaHVua01hdGNoID0gY2h1bmtGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAoY2h1bmtNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFssIGNodW5rTmFtZVByZWZpeCwgLCBjaHVua0V4dF0gPSBjaHVua01hdGNoO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaHVua05hbWVQcmVmaXggPT09IG5hbWVQcmVmaXggJiYgY2h1bmtFeHQgPT09IGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4aXN0cyA9IHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgbWlzc2luZ0ZpbGVzLnB1c2goeyBmaWxlOiByZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5LCBwb3NzaWJsZU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBYCk7XG4gICAgICAgIGlmIChtaXNzaW5nRmlsZXMubGVuZ3RoIDw9IDUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NTNEMVx1NzNCMCAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEY0Nlx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTBEXHU0RTAwXHU4MUY0XHVGRjBDXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxXHU2NzA5ICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1OTBGRFx1NkI2M1x1Nzg2RVx1RkYwOFx1NTE3MVx1OUE4Q1x1OEJDMSAke3JlZmVyZW5jZWRGaWxlcy5zaXplfSBcdTRFMkFcdTVGMTVcdTc1MjhcdUZGMDlgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFx1NEYxOFx1NTMxNlx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1NjNEMlx1NEVGNlx1RkYxQVx1NTkwNFx1NzQwNlx1N0E3QSBjaHVua1xuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVDaHVua3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnb3B0aW1pemUtY2h1bmtzJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGVtcHR5Q2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtSZWZlcmVuY2VzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGNodW5rQW55LmNvZGUgJiYgY2h1bmtBbnkuY29kZS50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgZW1wdHlDaHVua3MucHVzaChmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuaW1wb3J0cykge1xuICAgICAgICAgIGZvciAoY29uc3QgaW1wb3J0ZWQgb2YgY2h1bmtBbnkuaW1wb3J0cykge1xuICAgICAgICAgICAgaWYgKCFjaHVua1JlZmVyZW5jZXMuaGFzKGltcG9ydGVkKSkge1xuICAgICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuc2V0KGltcG9ydGVkLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuZ2V0KGltcG9ydGVkKSEucHVzaChmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbXB0eUNodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjaHVua3NUb1JlbW92ZTogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGNodW5rc1RvS2VlcDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBlbXB0eUNodW5rIG9mIGVtcHR5Q2h1bmtzKSB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZWRCeSA9IGNodW5rUmVmZXJlbmNlcy5nZXQoZW1wdHlDaHVuaykgfHwgW107XG4gICAgICAgIGlmIChyZWZlcmVuY2VkQnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICAgIGlmIChjaHVuayAmJiBjaHVuay50eXBlID09PSAnY2h1bmsnKSB7XG4gICAgICAgICAgICBjaHVuay5jb2RlID0gJ2V4cG9ydCB7fTsnO1xuICAgICAgICAgICAgY2h1bmtzVG9LZWVwLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW29wdGltaXplLWNodW5rc10gXHU0RkREXHU3NTU5XHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rOiAke2VtcHR5Q2h1bmt9IChcdTg4QUIgJHtyZWZlcmVuY2VkQnkubGVuZ3RofSBcdTRFMkEgY2h1bmsgXHU1RjE1XHU3NTI4XHVGRjBDXHU1REYyXHU2REZCXHU1MkEwXHU1MzYwXHU0RjREXHU3QjI2KWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaHVua3NUb1JlbW92ZS5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGNodW5rc1RvUmVtb3ZlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtvcHRpbWl6ZS1jaHVua3NdIFx1NzlGQlx1OTY2NFx1NEU4NiAke2NodW5rc1RvUmVtb3ZlLmxlbmd0aH0gXHU0RTJBXHU2NzJBXHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rOmAsIGNodW5rc1RvUmVtb3ZlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaHVua3NUb0tlZXAubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW29wdGltaXplLWNodW5rc10gXHU0RkREXHU3NTU5XHU0RTg2ICR7Y2h1bmtzVG9LZWVwLmxlbmd0aH0gXHU0RTJBXHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rXHVGRjA4XHU1REYyXHU2REZCXHU1MkEwXHU1MzYwXHU0RjREXHU3QjI2XHVGRjA5OmAsIGNodW5rc1RvS2VlcCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxoYXNoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2hhc2gudHNcIjsvKipcbiAqIEhhc2ggXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTUzMDVcdTYyRUNcdTVGM0FcdTUyMzZcdTc1MUZcdTYyMTBcdTY1QjAgaGFzaCBcdTU0OENcdTRGRUVcdTU5MERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjUgaGFzaFxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IENodW5rSW5mbywgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGpvaW4sIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjIxNlx1NzUxRlx1NjIxMFx1NTE2OFx1NUM0MFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwOVxuICogXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjBDXHU5MEZEXHU2Q0ExXHU2NzA5XHU1MjE5XHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XG4gKi9cbmZ1bmN0aW9uIGdldEJ1aWxkVGltZXN0YW1wKCk6IHN0cmluZyB7XG4gIC8vIDEuIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwOFx1NzUzMVx1Njc4NFx1NUVGQVx1ODExQVx1NjcyQ1x1OEJCRVx1N0Y2RVx1RkYwOVxuICBpZiAocHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QO1xuICB9XG5cbiAgLy8gMi4gXHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcEZpbGUgPSBqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5idWlsZC10aW1lc3RhbXAnKTtcbiAgaWYgKGV4aXN0c1N5bmModGltZXN0YW1wRmlsZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gcmVhZEZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsICd1dGYtOCcpLnRyaW0oKTtcbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gXHU1RkZEXHU3NTY1XHU4QkZCXHU1M0Q2XHU5NTE5XHU4QkVGXG4gICAgfVxuICB9XG5cbiAgLy8gMy4gXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHU1RTc2XHU0RkREXHU1QjU4XHU1MjMwXHU2NTg3XHU0RUY2XHVGRjA4XHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU1NDBDXHU0RTAwXHU0RTJBXHVGRjA5XG4gIC8vIFx1NEY3Rlx1NzUyODM2XHU4RkRCXHU1MjM2XHU3RjE2XHU3ODAxXHVGRjBDXHU3NTFGXHU2MjEwXHU2NkY0XHU3N0VEXHU3Njg0XHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU1MzA1XHU1NDJCXHU1QjU3XHU2QkNEXHU1NDhDXHU2NTcwXHU1QjU3XHVGRjBDXHU1OTgyIGwzazJqMWhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG4gIHRyeSB7XG4gICAgd3JpdGVGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCB0aW1lc3RhbXAsICd1dGYtOCcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NUZGRFx1NzU2NVx1NTE5OVx1NTE2NVx1OTUxOVx1OEJFRlxuICB9XG4gIHJldHVybiB0aW1lc3RhbXA7XG59XG5cbi8qKlxuICogXHU1RjNBXHU1MjM2XHU3NTFGXHU2MjEwXHU2NUIwIGhhc2ggXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JjZU5ld0hhc2hQbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgYnVpbGRJZCA9IGdldEJ1aWxkVGltZXN0YW1wKCk7XG4gIGNvbnN0IGNzc0ZpbGVOYW1lTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QganNGaWxlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZm9yY2UtbmV3LWhhc2gnLFxuICAgIGVuZm9yY2U6ICdwb3N0JyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU2Nzg0XHU1RUZBIElEOiAke2J1aWxkSWR9YCk7XG4gICAgICBjc3NGaWxlTmFtZU1hcC5jbGVhcigpO1xuICAgICAganNGaWxlTmFtZU1hcC5jbGVhcigpO1xuICAgIH0sXG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogQ2h1bmtJbmZvKSB7XG4gICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuZmlsZU5hbWU/LmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuZmlsZU5hbWU/LmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5maWxlTmFtZT8uaW5jbHVkZXMoJ3ZlbmRvcicpO1xuXG4gICAgICBpZiAoaXNUaGlyZFBhcnR5TGliKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYC8qIGJ1aWxkLWlkOiAke2J1aWxkSWR9ICovXFxuJHtjb2RlfWA7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGZpbGVOYW1lTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICBsZXQgYmFzZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICBpZiAoYmFzZU5hbWUuZW5kc1dpdGgoJy0nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwIFJvbGx1cCBcdTc1MUZcdTYyMTBcdTc2ODRcdTVGMDJcdTVFMzhcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTY3MkJcdTVDM0VcdTY3MDlcdThGREVcdTVCNTdcdTdCMjZcdUZGMDk6ICR7ZmlsZU5hbWV9YCk7XG4gICAgICAgICAgICBiYXNlTmFtZSA9IGJhc2VOYW1lLnJlcGxhY2UoLy0rJC8sICcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBuZXdGaWxlTmFtZSA9IGBhc3NldHMvJHtiYXNlTmFtZX0tJHtidWlsZElkfS5qc2A7XG4gICAgICAgICAgZmlsZU5hbWVNYXAuc2V0KGZpbGVOYW1lLCBuZXdGaWxlTmFtZSk7XG4gICAgICAgICAgY29uc3Qgb2xkUmVmID0gZmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICBjb25zdCBuZXdSZWYgPSBuZXdGaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGpzRmlsZU5hbWVNYXAuc2V0KG9sZFJlZiwgbmV3UmVmKTtcblxuICAgICAgICAgIChjaHVuayBhcyBhbnkpLmZpbGVOYW1lID0gbmV3RmlsZU5hbWU7XG4gICAgICAgICAgYnVuZGxlW25ld0ZpbGVOYW1lXSA9IGNodW5rO1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZmlsZU5hbWVdO1xuICAgICAgICB9IGVsc2UgaWYgKGNodW5rLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy5jc3MnKSAmJiBmaWxlTmFtZS5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICBsZXQgYmFzZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpLnJlcGxhY2UoL1xcLmNzcyQvLCAnJyk7XG4gICAgICAgICAgYmFzZU5hbWUgPSBiYXNlTmFtZS5yZXBsYWNlKC8tKyQvLCAnJyk7XG4gICAgICAgICAgY29uc3QgbmV3RmlsZU5hbWUgPSBgYXNzZXRzLyR7YmFzZU5hbWV9LSR7YnVpbGRJZH0uY3NzYDtcblxuICAgICAgICAgIGZpbGVOYW1lTWFwLnNldChmaWxlTmFtZSwgbmV3RmlsZU5hbWUpO1xuICAgICAgICAgIGNvbnN0IG9sZENzc05hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGNvbnN0IG5ld0Nzc05hbWUgPSBuZXdGaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICAgIGNzc0ZpbGVOYW1lTWFwLnNldChvbGRDc3NOYW1lLCBuZXdDc3NOYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBDU1MgXHU2NTg3XHU0RUY2XHU2NjIwXHU1QzA0OiAke29sZENzc05hbWV9IC0+ICR7bmV3Q3NzTmFtZX1gKTtcblxuICAgICAgICAgIChjaHVuayBhcyBhbnkpLmZpbGVOYW1lID0gbmV3RmlsZU5hbWU7XG4gICAgICAgICAgYnVuZGxlW25ld0ZpbGVOYW1lXSA9IGNodW5rO1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZmlsZU5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NjI0MFx1NjcwOSBjaHVuayBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUxpYiA9IGZpbGVOYW1lLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCd2ZW5kb3InKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIgJiYgKGZpbGVOYW1lLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHwgZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGNodW5rQW55LmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWVdIG9mIGZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3Qgb2xkUmVmID0gb2xkRmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1JlZiA9IG5ld0ZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNoID0gb2xkUmVmLnJlcGxhY2UoLy0rJC8sICcnKTtcblxuICAgICAgICAgICAgLy8gXHU2NzJBXHU0RjdGXHU3NTI4XHU3Njg0XHU4RjZDXHU0RTQ5XHU1M0Q4XHU5MUNGXHVGRjBDXHU0RkREXHU3NTU5XHU0RUU1XHU1OTA3XHU1QzA2XHU2NzY1XHU0RjdGXHU3NTI4XG4gICAgICAgICAgICAvLyBjb25zdCBlc2NhcGVkT2xkUmVmID0gb2xkUmVmLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAvLyBjb25zdCBlc2NhcGVkT2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaCA9IG9sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2gucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgY29uc3QgcmVwbGFjZVBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBbYC9hc3NldHMvJHtvbGRSZWZ9YCwgYC9hc3NldHMvJHtuZXdSZWZ9YF0sXG4gICAgICAgICAgICAgIFtgLi8ke29sZFJlZn1gLCBgLi8ke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgW2BcIiR7b2xkUmVmfVwiYCwgYFwiJHtuZXdSZWZ9XCJgXSxcbiAgICAgICAgICAgICAgW2AnJHtvbGRSZWZ9J2AsIGAnJHtuZXdSZWZ9J2BdLFxuICAgICAgICAgICAgICBbYFxcYCR7b2xkUmVmfVxcYGAsIGBcXGAke25ld1JlZn1cXGBgXSxcbiAgICAgICAgICAgICAgW2BpbXBvcnQoJy9hc3NldHMvJHtvbGRSZWZ9JylgLCBgaW1wb3J0KCcvYXNzZXRzLyR7bmV3UmVmfT92PSR7YnVpbGRJZH0nKWBdLFxuICAgICAgICAgICAgICBbYGltcG9ydChcIi9hc3NldHMvJHtvbGRSZWZ9XCIpYCwgYGltcG9ydChcIi9hc3NldHMvJHtuZXdSZWZ9P3Y9JHtidWlsZElkfVwiKWBdLFxuICAgICAgICAgICAgICBbYGltcG9ydChcXGAvYXNzZXRzLyR7b2xkUmVmfVxcYClgLCBgaW1wb3J0KFxcYC9hc3NldHMvJHtuZXdSZWZ9P3Y9JHtidWlsZElkfVxcYClgXSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGlmIChvbGRSZWYgIT09IG9sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2gpIHtcbiAgICAgICAgICAgICAgcmVwbGFjZVBhdHRlcm5zLnB1c2goXG4gICAgICAgICAgICAgICAgW2AvYXNzZXRzLyR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH1gLCBgL2Fzc2V0cy8ke25ld1JlZn1gXSxcbiAgICAgICAgICAgICAgICBbYC4vJHtvbGRSZWZXaXRob3V0VHJhaWxpbmdEYXNofWAsIGAuLyR7bmV3UmVmfWBdLFxuICAgICAgICAgICAgICAgIFtgXCIke29sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2h9XCJgLCBgXCIke25ld1JlZn1cImBdLFxuICAgICAgICAgICAgICAgIFtgJyR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH0nYCwgYCcke25ld1JlZn0nYF0sXG4gICAgICAgICAgICAgICAgW2BcXGAke29sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2h9XFxgYCwgYFxcYCR7bmV3UmVmfVxcYGBdLFxuICAgICAgICAgICAgICAgIFtgaW1wb3J0KCcvYXNzZXRzLyR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH0nKWAsIGBpbXBvcnQoJy9hc3NldHMvJHtuZXdSZWZ9P3Y9JHtidWlsZElkfScpYF0sXG4gICAgICAgICAgICAgICAgW2BpbXBvcnQoXCIvYXNzZXRzLyR7b2xkUmVmV2l0aG91dFRyYWlsaW5nRGFzaH1cIilgLCBgaW1wb3J0KFwiL2Fzc2V0cy8ke25ld1JlZn0/dj0ke2J1aWxkSWR9XCIpYF0sXG4gICAgICAgICAgICAgICAgW2BpbXBvcnQoXFxgL2Fzc2V0cy8ke29sZFJlZldpdGhvdXRUcmFpbGluZ0Rhc2h9XFxgKWAsIGBpbXBvcnQoXFxgL2Fzc2V0cy8ke25ld1JlZn0/dj0ke2J1aWxkSWR9XFxgKWBdLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXBsYWNlUGF0dGVybnMuZm9yRWFjaCgoW29sZFBhdHRlcm4sIG5ld1BhdHRlcm5dKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRQYXR0ZXJuID0gb2xkUGF0dGVybi5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoZXNjYXBlZE9sZFBhdHRlcm4sICdnJyk7XG4gICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWdleCwgbmV3UGF0dGVybik7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHU0RTNBXHU2MjQwXHU2NzA5IGltcG9ydCgpIFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgY29uc3QgYWxsSW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbXCInXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzKSkoXFw/W15cIidgXFxzXSopP1xcMVxccypcXCkvZztcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoYWxsSW1wb3J0UGF0dGVybiwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIF9leHQ6IHN0cmluZywgcXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAocXVlcnkgJiYgcXVlcnkuaW5jbHVkZXMoJ3Y9JykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0ke3F1ZXJ5LnJlcGxhY2UoL1xcP3Y9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApfSR7cXVvdGV9KWA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoJHtxdW90ZX0ke3BhdGh9P3Y9JHtidWlsZElkfSR7cXVvdGV9KWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NjZGNFx1NjVCMCBfX3ZpdGVfX21hcERlcHMgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1MjhcbiAgICAgICAgICBpZiAobmV3Q29kZS5pbmNsdWRlcygnX192aXRlX19tYXBEZXBzJykgJiYgY3NzRmlsZU5hbWVNYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW29sZENzc05hbWUsIG5ld0Nzc05hbWVdIG9mIGNzc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICBjb25zdCBlc2NhcGVkT2xkQ3NzTmFtZSA9IG9sZENzc05hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgICAgY29uc3QgY3NzUGF0dGVybiA9IG5ldyBSZWdFeHAoYChbXCInXSlhc3NldHMvJHtlc2NhcGVkT2xkQ3NzTmFtZX1cXFxcMWAsICdnJyk7XG4gICAgICAgICAgICAgIGlmIChjc3NQYXR0ZXJuLnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKGNzc1BhdHRlcm4sIGAkMWFzc2V0cy8ke25ld0Nzc05hbWV9JDFgKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGNodW5rQW55LmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU0RTVGXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1MjhcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1NTcyOFx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1RkYwOFx1NTk4MiBhZGRWZXJzaW9uUGx1Z2luXHVGRjA5XHU1OTA0XHU3NDA2XHU0RTRCXHU1MjREXHU1QzMxXHU2NkY0XHU2NUIwXHU2NTg3XHU0RUY2XHU1NDBEXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnYXNzZXQnICYmIGZpbGVOYW1lID09PSAnaW5kZXguaHRtbCcpIHtcbiAgICAgICAgICBsZXQgaHRtbENvbnRlbnQgPSBjaHVua0FueS5zb3VyY2UgYXMgc3RyaW5nO1xuICAgICAgICAgIGxldCBodG1sTW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIGlmIChjc3NGaWxlTmFtZU1hcC5zaXplID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1RjAwXHU1OUNCXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1MjhcdUZGMENcdTY2MjBcdTVDMDRcdTg4NjhcdTU5MjdcdTVDMEY6ICR7Y3NzRmlsZU5hbWVNYXAuc2l6ZX1gKTtcbiAgICAgICAgICAgIC8vIFx1NTE0OFx1NjI1M1x1NTM3MCBIVE1MIFx1NEUyRFx1NjI0MFx1NjcwOSBDU1MgXHU1RjE1XHU3NTI4XHVGRjBDXHU3NTI4XHU0RThFXHU4QzAzXHU4QkQ1XG4gICAgICAgICAgICBjb25zdCBjc3NSZWZzID0gaHRtbENvbnRlbnQubWF0Y2goLzxsaW5rW14+XSpcXHMraHJlZj1bXCInXShbXlwiJ10rXFwuY3NzW15cIiddKilbXCInXVtePl0qPi9nKTtcbiAgICAgICAgICAgIGlmIChjc3NSZWZzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIEhUTUwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1Mjg6YCwgY3NzUmVmcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoY29uc3QgW29sZENzc05hbWUsIG5ld0Nzc05hbWVdIG9mIGNzc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICBjb25zdCBlc2NhcGVkT2xkQ3NzTmFtZSA9IG9sZENzc05hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgICAgLy8gXHU2NkY0XHU2NUIwIDxsaW5rIGhyZWY+IFx1NjgwN1x1N0I3RVx1NEUyRFx1NzY4NCBDU1MgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU1MzA1XHU2MkVDXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjA5XG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTQwQ1x1NjVGNlx1NTMzOVx1OTE0RCAvYXNzZXRzLyBcdTU0OEMgLi9hc3NldHMvIFx1NUYwMFx1NTkzNFx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBjb25zdCBsaW5rUGF0dGVybiA9IG5ldyBSZWdFeHAoYCg8bGlua1tePl0qXFxcXHMraHJlZj1bXCInXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRDc3NOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbXCInXVtePl0qPilgLCAnZycpO1xuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbEh0bWwgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKGxpbmtQYXR0ZXJuLCAoX21hdGNoLCBwcmVmaXgsIHBhdGgsIHF1ZXJ5LCBzdWZmaXgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTc2ODRcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdUZGMDgvYXNzZXRzLyBcdTYyMTYgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke3BhdGhQcmVmaXh9YXNzZXRzLyR7bmV3Q3NzTmFtZX1gO1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwQ1x1NjZGNFx1NjVCMFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYxQlx1NTQyNlx1NTIxOVx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1MzM5XHU5MTREXHU1MjMwIENTUyBcdTVGMTVcdTc1Mjg6ICR7cGF0aH0ke3F1ZXJ5IHx8ICcnfSAtPiAke25ld1BhdGh9JHtuZXdRdWVyeX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoaHRtbENvbnRlbnQgIT09IG9yaWdpbmFsSHRtbCkge1xuICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNzA1IFx1NURGMlx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTY2RjRcdTY1QjAgSFRNTCBcdTRFMkRcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyODogJHtvbGRDc3NOYW1lfSAtPiAke25ld0Nzc05hbWV9YCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNkEwXHVGRTBGICBcdTY3MkFcdTYyN0VcdTUyMzBcdTUzMzlcdTkxNERcdTc2ODQgQ1NTIFx1NUYxNVx1NzUyODogJHtvbGRDc3NOYW1lfWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGpzRmlsZU5hbWVNYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NUYwMFx1NTlDQlx1NjZGNFx1NjVCMCBIVE1MIFx1NEUyRFx1NzY4NCBKUyBcdTVGMTVcdTc1MjhcdUZGMENcdTY2MjBcdTVDMDRcdTg4NjhcdTU5MjdcdTVDMEY6ICR7anNGaWxlTmFtZU1hcC5zaXplfWApO1xuICAgICAgICAgICAgLy8gXHU1MTQ4XHU2MjUzXHU1MzcwIEhUTUwgXHU0RTJEXHU2MjQwXHU2NzA5IGltcG9ydCgpIFx1OEJFRFx1NTNFNVx1RkYwQ1x1NzUyOFx1NEU4RVx1OEMwM1x1OEJENVxuICAgICAgICAgICAgY29uc3QgaW1wb3J0UmVmcyA9IGh0bWxDb250ZW50Lm1hdGNoKC9pbXBvcnRcXHMqXFwoWydcIl0oW14nXCJdK1xcLmpzW14nXCJdKilbJ1wiXVxcKS9nKTtcbiAgICAgICAgICAgIGlmIChpbXBvcnRSZWZzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIEhUTUwgXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1NUYxNVx1NzUyODpgLCBpbXBvcnRSZWZzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChjb25zdCBbb2xkSnNOYW1lLCBuZXdKc05hbWVdIG9mIGpzRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRKc05hbWUgPSBvbGRKc05hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIDEuIFx1NjZGNFx1NjVCMCA8c2NyaXB0IHNyYz4gXHU2ODA3XHU3QjdFXHU0RTJEXHU3Njg0IEpTIFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NTMwNVx1NjJFQ1x1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBzY3JpcHRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxzY3JpcHRbXj5dKlxcXFxzK3NyYz1bXCInXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRKc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDEgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHNjcmlwdFBhdHRlcm4sIChfbWF0Y2gsIHByZWZpeCwgcGF0aCwgcXVlcnksIHN1ZmZpeCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7cGF0aFByZWZpeH1hc3NldHMvJHtuZXdKc05hbWV9YDtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMENcdTY2RjRcdTY1QjBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMUJcdTU0MjZcdTUyMTlcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTUzMzlcdTkxNERcdTUyMzAgPHNjcmlwdCBzcmM+IFx1NUYxNVx1NzUyODogJHtwYXRofSR7cXVlcnkgfHwgJyd9IC0+ICR7bmV3UGF0aH0ke25ld1F1ZXJ5fWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtuZXdQYXRofSR7bmV3UXVlcnl9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChodG1sQ29udGVudCAhPT0gb3JpZ2luYWxIdG1sMSkge1xuICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNzA1IFx1NURGMlx1NjZGNFx1NjVCMCA8c2NyaXB0IHNyYz4gXHU1RjE1XHU3NTI4OiAke29sZEpzTmFtZX0gLT4gJHtuZXdKc05hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIDIuIFx1NjZGNFx1NjVCMCBpbXBvcnQoKSBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThCRURcdTUzRTVcdTRFMkRcdTc2ODQgSlMgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU1MzA1XHU2MkVDXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjA5XG4gICAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NjgzQ1x1NUYwRlx1RkYxQWltcG9ydCgnLi9hc3NldHMveHh4LmpzJykgXHU2MjE2IGltcG9ydCgnL2Fzc2V0cy94eHguanMnKVxuICAgICAgICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKGltcG9ydFxcXFxzKlxcXFwoXFxcXHMqWydcIl0pKFxcXFwuPy9hc3NldHMvJHtlc2NhcGVkT2xkSnNOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbJ1wiXVxcXFxzKlxcXFwpKWAsICdnJyk7XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDIgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKGltcG9ydFBhdHRlcm4sIChfbWF0Y2gsIHByZWZpeCwgcGF0aCwgcXVlcnksIHN1ZmZpeCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ID0gcGF0aC5zdGFydHNXaXRoKCcuLycpID8gJy4vJyA6ICcvJztcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7cGF0aFByZWZpeH1hc3NldHMvJHtuZXdKc05hbWV9YDtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMENcdTY2RjRcdTY1QjBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMUJcdTU0MjZcdTUyMTlcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTUzMzlcdTkxNERcdTUyMzAgaW1wb3J0KCkgXHU1RjE1XHU3NTI4OiAke3BhdGh9JHtxdWVyeSB8fCAnJ30gLT4gJHtuZXdQYXRofSR7bmV3UXVlcnl9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGh0bWxDb250ZW50ICE9PSBvcmlnaW5hbEh0bWwyKSB7XG4gICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU2NkY0XHU2NUIwIGltcG9ydCgpIFx1NUYxNVx1NzUyODogJHtvbGRKc05hbWV9IC0+ICR7bmV3SnNOYW1lfWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyAzLiBcdTY2RjRcdTY1QjAgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiPiBcdTY4MDdcdTdCN0VcdTRFMkRcdTc2ODQgSlMgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU1MzA1XHU2MkVDXHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHVGRjA5XG4gICAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NjgzQ1x1NUYwRlx1RkYxQTxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIiBocmVmPVwiL2Fzc2V0cy94eHguanNcIj4gXHU2MjE2IDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIiBocmVmPVwiLi9hc3NldHMveHh4LmpzXCI+XG4gICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXByZWxvYWRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxsaW5rW14+XSpcXFxccytyZWw9W1wiJ11tb2R1bGVwcmVsb2FkW1wiJ11bXj5dKlxcXFxzK2hyZWY9W1wiJ10pKFxcXFwuPy9hc3NldHMvJHtlc2NhcGVkT2xkSnNOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbXCInXVtePl0qPilgLCAnZycpO1xuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbEh0bWwzID0gaHRtbENvbnRlbnQ7XG4gICAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShtb2R1bGVwcmVsb2FkUGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXggPSBwYXRoLnN0YXJ0c1dpdGgoJy4vJykgPyAnLi8nIDogJy8nO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwQ1x1NjZGNFx1NjVCMFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYxQlx1NTQyNlx1NTIxOVx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1MzM5XHU5MTREXHU1MjMwIDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIj4gXHU1RjE1XHU3NTI4OiAke3BhdGh9JHtxdWVyeSB8fCAnJ30gLT4gJHtuZXdQYXRofSR7bmV3UXVlcnl9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGh0bWxDb250ZW50ICE9PSBvcmlnaW5hbEh0bWwzKSB7XG4gICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU2NkY0XHU2NUIwIDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIj4gXHU1RjE1XHU3NTI4OiAke29sZEpzTmFtZX0gLT4gJHtuZXdKc05hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGh0bWxNb2RpZmllZCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjZGNFx1NjVCMCBIVE1MIFx1NEUyRFx1NzY4NCBKUyBcdTVGMTVcdTc1MjhgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICBjaHVuay5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNzA1IFx1NURGMlx1NEUzQSAke2ZpbGVOYW1lTWFwLnNpemV9IFx1NEUyQVx1NjU4N1x1NEVGNlx1NkRGQlx1NTJBMFx1Njc4NFx1NUVGQSBJRDogJHtidWlsZElkfWApO1xuICAgIH0sXG4gICAgd3JpdGVCdW5kbGUob3B0aW9uczogT3V0cHV0T3B0aW9ucykge1xuICAgICAgY29uc3Qgb3V0cHV0RGlyID0gb3B0aW9ucy5kaXIgfHwgam9pbihwcm9jZXNzLmN3ZCgpLCAnZGlzdCcpO1xuICAgICAgY29uc3QgaW5kZXhIdG1sUGF0aCA9IGpvaW4ob3V0cHV0RGlyLCAnaW5kZXguaHRtbCcpO1xuXG4gICAgICBpZiAoZXhpc3RzU3luYyhpbmRleEh0bWxQYXRoKSkge1xuICAgICAgICBsZXQgaHRtbCA9IHJlYWRGaWxlU3luYyhpbmRleEh0bWxQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGNzc0ZpbGVOYW1lTWFwLnNpemUgPiAwKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBbb2xkQ3NzTmFtZSwgbmV3Q3NzTmFtZV0gb2YgY3NzRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkT2xkQ3NzTmFtZSA9IG9sZENzc05hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NjZGNFx1NjVCMCA8bGluayBocmVmPiBcdTY4MDdcdTdCN0VcdTRFMkRcdTc2ODQgQ1NTIFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NTMwNVx1NjJFQ1x1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOVxuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NDBDXHU2NUY2XHU1MzM5XHU5MTREIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy8gXHU1RjAwXHU1OTM0XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFvbGRDc3NOYW1lIFx1NjYyRlx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQlx1OERFRlx1NUY4NFx1RkYwOVx1RkYwQ1x1NTk4MiBcInN0eWxlLUNvdDBfMWFaLmNzc1wiXG4gICAgICAgICAgICBjb25zdCBsaW5rUGF0dGVybiA9IG5ldyBSZWdFeHAoYCg8bGlua1tePl0qXFxcXHMraHJlZj1bXCInXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRDc3NOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbXCInXVtePl0qPilgLCAnZycpO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxIdG1sID0gaHRtbDtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobGlua1BhdHRlcm4sIChfbWF0Y2gsIHByZWZpeCwgcGF0aCwgcXVlcnksIHN1ZmZpeCkgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTc2ODRcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdUZGMDgvYXNzZXRzLyBcdTYyMTYgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXggPSBwYXRoLnN0YXJ0c1dpdGgoJy4vJykgPyAnLi8nIDogJy8nO1xuICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7cGF0aFByZWZpeH1hc3NldHMvJHtuZXdDc3NOYW1lfWA7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9cXD92PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaHRtbCAhPT0gb3JpZ2luYWxIdG1sKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHU1REYyXHU2NkY0XHU2NUIwIEhUTUwgXHU0RTJEXHU3Njg0IENTUyBcdTVGMTVcdTc1Mjg6ICR7b2xkQ3NzTmFtZX0gLT4gJHtuZXdDc3NOYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUMgY3NzRmlsZU5hbWVNYXAgXHU2NzA5XHU2NTcwXHU2MzZFXHU0RjQ2IEhUTUwgXHU2Q0ExXHU2NzA5XHU4OEFCXHU0RkVFXHU2NTM5XHVGRjBDXHU4QkY0XHU2NjBFXHU1MzM5XHU5MTREXHU1OTMxXHU4RDI1XG4gICAgICAgICAgLy8gXHU1M0VGXHU4MEZEXHU2NjJGIEhUTUwgXHU0RTJEXHU3Njg0XHU4REVGXHU1Rjg0XHU2ODNDXHU1RjBGXHU0RTBFXHU5ODg0XHU2NzFGXHU0RTBEXHU3QjI2XHVGRjBDXHU1QzFEXHU4QkQ1XHU2NkY0XHU1QkJEXHU2NzdFXHU3Njg0XHU1MzM5XHU5MTREXG4gICAgICAgICAgaWYgKCFtb2RpZmllZCAmJiBjc3NGaWxlTmFtZU1hcC5zaXplID4gMCkge1xuICAgICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU1MzM5XHU5MTREXHU0RUZCXHU0RjU1XHU1MzA1XHU1NDJCXHU2NUU3XHU2NTg3XHU0RUY2XHU1NDBEXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjA4XHU2NkY0XHU1QkJEXHU2NzdFXHU3Njg0XHU1MzM5XHU5MTREXHVGRjA5XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRDc3NOYW1lLCBuZXdDc3NOYW1lXSBvZiBjc3NGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHU1NDhDIGhhc2hcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEVcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNERcbiAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWVNYXRjaCA9IG9sZENzc05hbWUubWF0Y2goL14oLis/KS0oW0EtWmEtejAtOV17NCx9KVxcLmNzcyQvKTtcbiAgICAgICAgICAgICAgaWYgKGJhc2VOYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbLCBiYXNlTmFtZV0gPSBiYXNlTmFtZU1hdGNoO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRCYXNlTmFtZSA9IGJhc2VOYW1lLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU0RUZCXHU0RjU1XHU1MzA1XHU1NDJCIGJhc2VOYW1lIFx1NzY4NCBDU1MgXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgICAgY29uc3QgbG9vc2VQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxsaW5rW14+XSpcXFxccytocmVmPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZEJhc2VOYW1lfS1bXlwiJ1xcXFxzXStcXFxcLmNzcykoXFxcXD9bXlwiJ1xcXFxzXSopPyhbXCInXVtePl0qPilgLCAnZycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZWRQYXRoID0gJyc7XG4gICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShsb29zZVBhdHRlcm4sIChfbWF0Y2gsIHByZWZpeCwgcGF0aCwgcXVlcnksIHN1ZmZpeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU3Njg0XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHVGRjA4L2Fzc2V0cy8gXHU2MjE2IC4vYXNzZXRzL1x1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7cGF0aFByZWZpeH1hc3NldHMvJHtuZXdDc3NOYW1lfWA7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvXFw/dj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgICAgICBtYXRjaGVkUGF0aCA9IHBhdGg7IC8vIFx1NEZERFx1NUI1OFx1NTMzOVx1OTE0RFx1NzY4NFx1OERFRlx1NUY4NFx1NzUyOFx1NEU4RVx1NjVFNVx1NUZEN1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChodG1sICE9PSBvcmlnaW5hbEh0bWwpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1NURGMlx1OTAxQVx1OEZDN1x1NkEyMVx1N0NDQVx1NTMzOVx1OTE0RFx1NjZGNFx1NjVCMCBIVE1MIFx1NEUyRFx1NzY4NCBDU1MgXHU1RjE1XHU3NTI4OiAke21hdGNoZWRQYXRofSAtPiAke25ld0Nzc05hbWV9YCk7XG4gICAgICAgICAgICAgICAgICBicmVhazsgLy8gXHU1M0VBXHU2NkY0XHU2NUIwXHU3QjJDXHU0RTAwXHU0RTJBXHU1MzM5XHU5MTREXHU3Njg0XHVGRjBDXHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU2NkY0XHU2NUIwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzRmlsZU5hbWVNYXAuc2l6ZSA+IDApIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvbGRKc05hbWUsIG5ld0pzTmFtZV0gb2YganNGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRPbGRKc05hbWUgPSBvbGRKc05hbWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMS4gXHU2NkY0XHU2NUIwIGltcG9ydCgpIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEUyRFx1NzY4NFx1OERFRlx1NUY4NFx1RkYwOFx1NTQwQ1x1NjVGNlx1NTMzOVx1OTE0RCAvYXNzZXRzLyBcdTU0OEMgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKGltcG9ydFxcXFxzKlxcXFwoXFxcXHMqWydcIl0pKFxcXFwuPy9hc3NldHMvJHtlc2NhcGVkT2xkSnNOYW1lfSkoXFxcXD9bXlwiJ1xcXFxzXSopPyhbJ1wiXVxcXFxzKlxcXFwpKWAsICdnJyk7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEh0bWwxID0gaHRtbDtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoaW1wb3J0UGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTUzMzlcdTkxNERcdTUyMzAgaW1wb3J0KCkgXHU1RjE1XHU3NTI4OiAke3BhdGh9JHtxdWVyeSB8fCAnJ30gLT4gJHtuZXdQYXRofSR7bmV3UXVlcnl9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtuZXdQYXRofSR7bmV3UXVlcnl9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGh0bWwgIT09IG9yaWdpbmFsSHRtbDEpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1REYyXHU2NkY0XHU2NUIwIGltcG9ydCgpIFx1NUYxNVx1NzUyODogJHtvbGRKc05hbWV9IC0+ICR7bmV3SnNOYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAyLiBcdTY2RjRcdTY1QjAgPHNjcmlwdCBzcmM+IFx1NjgwN1x1N0I3RVx1NEUyRFx1NzY4NFx1OERFRlx1NUY4NFx1RkYwOFx1NTQwQ1x1NjVGNlx1NTMzOVx1OTE0RCAvYXNzZXRzLyBcdTU0OEMgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBzY3JpcHRQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKDxzY3JpcHRbXj5dKlxcXFxzK3NyYz1bXCInXSkoXFxcXC4/L2Fzc2V0cy8ke2VzY2FwZWRPbGRKc05hbWV9KShcXFxcP1teXCInXFxcXHNdKik/KFtcIiddW14+XSo+KWAsICdnJyk7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEh0bWwyID0gaHRtbDtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2Uoc2NyaXB0UGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7bmV3UGF0aH0ke25ld1F1ZXJ5fSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChodG1sICE9PSBvcmlnaW5hbEh0bWwyKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtmb3JjZS1uZXctaGFzaF0gXHUyNzA1IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NURGMlx1NjZGNFx1NjVCMCA8c2NyaXB0IHNyYz4gXHU1RjE1XHU3NTI4OiAke29sZEpzTmFtZX0gLT4gJHtuZXdKc05hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIDMuIFx1NjZGNFx1NjVCMCA8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCI+IFx1NjgwN1x1N0I3RVx1NEUyRFx1NzY4NFx1OERFRlx1NUY4NFx1RkYwOFx1NTQwQ1x1NjVGNlx1NTMzOVx1OTE0RCAvYXNzZXRzLyBcdTU0OEMgLi9hc3NldHMvXHVGRjA5XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVwcmVsb2FkUGF0dGVybiA9IG5ldyBSZWdFeHAoYCg8bGlua1tePl0qXFxcXHMrcmVsPVtcIiddbW9kdWxlcHJlbG9hZFtcIiddW14+XSpcXFxccytocmVmPVtcIiddKShcXFxcLj8vYXNzZXRzLyR7ZXNjYXBlZE9sZEpzTmFtZX0pKFxcXFw/W15cIidcXFxcc10qKT8oW1wiJ11bXj5dKj4pYCwgJ2cnKTtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSHRtbDMgPSBodG1sO1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShtb2R1bGVwcmVsb2FkUGF0dGVybiwgKF9tYXRjaCwgcHJlZml4LCBwYXRoLCBxdWVyeSwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1NzY4NFx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1RkYwOC9hc3NldHMvIFx1NjIxNiAuL2Fzc2V0cy9cdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeCA9IHBhdGguc3RhcnRzV2l0aCgnLi8nKSA/ICcuLycgOiAnLyc7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtwYXRoUHJlZml4fWFzc2V0cy8ke25ld0pzTmFtZX1gO1xuICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApIDogYD92PSR7YnVpbGRJZH1gO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTUzMzlcdTkxNERcdTUyMzAgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiPiBcdTVGMTVcdTc1Mjg6ICR7cGF0aH0ke3F1ZXJ5IHx8ICcnfSAtPiAke25ld1BhdGh9JHtuZXdRdWVyeX1gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaHRtbCAhPT0gb3JpZ2luYWxIdG1sMykge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZm9yY2UtbmV3LWhhc2hdIFx1MjcwNSB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTVERjJcdTY2RjRcdTY1QjAgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiPiBcdTVGMTVcdTc1Mjg6ICR7b2xkSnNOYW1lfSAtPiAke25ld0pzTmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTU5MDdcdTc1MjhcdTY1QjlcdTY4NDhcdUZGMUFcdTUzMzlcdTkxNERcdTYyNDBcdTY3MDkgaW1wb3J0KCkgXHU4QkVEXHU1M0U1XHVGRjA4XHU1MzA1XHU2MkVDIC9hc3NldHMvIFx1NTQ4QyAuL2Fzc2V0cy9cdUZGMDlcdUZGMENcdTRGNDZcdTUzRUFcdTY2RjRcdTY1QjBcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMENcdTRFMERcdTY2RjRcdTY1QjBcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU2NTg3XHU0RUY2XHU1NDBEXHU2NkY0XHU2NUIwXHU1RTk0XHU4QkU1XHU1REYyXHU3RUNGXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NUI4Q1x1NjIxMFx1RkYwQ1x1OEZEOVx1OTFDQ1x1NTNFQVx1NjYyRlx1Nzg2RVx1NEZERFx1NzI0OFx1NjcyQ1x1NTNGN1x1NkI2M1x1Nzg2RVxuICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuRmFsbGJhY2sgPSAvaW1wb3J0XFxzKlxcKFxccyooW1wiJ10pKFxcLj9cXC9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanMpKShcXD9bXlwiJ2BcXHNdKik/XFwxXFxzKlxcKS9nO1xuICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKGltcG9ydFBhdHRlcm5GYWxsYmFjaywgKF9tYXRjaCwgcXVvdGUsIHBhdGgsIF9leHQsIHF1ZXJ5KSA9PiB7XG4gICAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0ke3F1ZXJ5LnJlcGxhY2UoL1s/Jl12PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKX0ke3F1b3RlfSlgO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0/dj0ke2J1aWxkSWR9JHtxdW90ZX0pYDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIHdyaXRlRmlsZVN5bmMoaW5kZXhIdG1sUGF0aCwgaHRtbCwgJ3V0Zi04Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU2NkY0XHU2NUIwXHU2MjQwXHU2NzA5IEpTIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFxuICAgICAgY29uc3QgYXNzZXRzRGlyID0gam9pbihvdXRwdXREaXIsICdhc3NldHMnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGFzc2V0c0RpcikpIHtcbiAgICAgICAgY29uc3QganNGaWxlcyA9IHJlYWRkaXJTeW5jKGFzc2V0c0RpcikuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgICBsZXQgdG90YWxGaXhlZCA9IDA7XG5cbiAgICAgICAgY29uc3QgYWxsRmlsZU5hbWVNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgICBmb3IgKGNvbnN0IFtvbGRKc05hbWUsIG5ld0pzTmFtZV0gb2YganNGaWxlTmFtZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBhbGxGaWxlTmFtZU1hcC5zZXQob2xkSnNOYW1lLCBuZXdKc05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW29sZENzc05hbWUsIG5ld0Nzc05hbWVdIG9mIGNzc0ZpbGVOYW1lTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIGFsbEZpbGVOYW1lTWFwLnNldChvbGRDc3NOYW1lLCBuZXdDc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QganNGaWxlIG9mIGpzRmlsZXMpIHtcbiAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBqc0ZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc0ZpbGUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganNGaWxlLmluY2x1ZGVzKCd2ZW5kb3InKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGpzRmlsZVBhdGggPSBqb2luKGFzc2V0c0RpciwganNGaWxlKTtcbiAgICAgICAgICBsZXQgY29udGVudCA9IHJlYWRGaWxlU3luYyhqc0ZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIGZvciAoY29uc3QgW29sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZV0gb2YgYWxsRmlsZU5hbWVNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkT2xkRmlsZU5hbWUgPSBvbGRGaWxlTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAoYGltcG9ydFxcXFxzKlxcXFwoXFxcXHMqKFtcIidcXGBdKS9hc3NldHMvJHtlc2NhcGVkT2xkRmlsZU5hbWV9KD8hW2EtekEtWjAtOS1dKShcXFxcP1teXCInXFxcXHNdKik/XFxcXDFcXFxccypcXFxcKWAsICdnJyksXG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAoYChbXCInXFxgXSkvYXNzZXRzLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSkoXFxcXD9bXlwiJ1xcXFxzXSopP1xcXFwxYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKVxcXFwuLyR7ZXNjYXBlZE9sZEZpbGVOYW1lfSg/IVthLXpBLVowLTktXSkoXFxcXD9bXlwiJ1xcXFxzXSopP1xcXFwxYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgKFtcIidcXGBdKWFzc2V0cy8ke2VzY2FwZWRPbGRGaWxlTmFtZX0oPyFbYS16QS1aMC05LV0pKFxcXFw/W15cIidcXFxcc10qKT9cXFxcMWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBwYXR0ZXJucy5mb3JFYWNoKHBhdHRlcm4gPT4ge1xuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICAgICAgICBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJ2ltcG9ydFxcXFxzKlxcXFwoJykpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChfbWF0Y2gsIHF1b3RlLCBxdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7bmV3RmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gcXVlcnkgPyBxdWVyeS5yZXBsYWNlKC9cXD92PVteJidcIl0qLywgYD92PSR7YnVpbGRJZH1gKSA6IGA/dj0ke2J1aWxkSWR9YDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtuZXdQYXRofSR7bmV3UXVlcnl9JHtxdW90ZX0pYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudCAhPT0gb3JpZ2luYWxDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuZXdGaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykgfHwgbmV3RmlsZU5hbWUuZW5kc1dpdGgoJy5tanMnKSkge1xuICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShwYXR0ZXJuLCAobWF0Y2gsIHF1b3RlLCBxdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3UGF0aDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC9hc3NldHMvJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCcuLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGAuLyR7bmV3RmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGBhc3NldHMvJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeSA9IHF1ZXJ5ID8gcXVlcnkucmVwbGFjZSgvXFw/dj1bXiYnXCJdKi8sIGA/dj0ke2J1aWxkSWR9YCkgOiBgP3Y9JHtidWlsZElkfWA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke25ld1BhdGh9JHtuZXdRdWVyeX0ke3F1b3RlfWA7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjb250ZW50ICE9PSBvcmlnaW5hbENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChtYXRjaCwgcXVvdGUsIF9xdWVyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3UGF0aDogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC9hc3NldHMvJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdHRlcm4uc291cmNlLmluY2x1ZGVzKCcuLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGAuLyR7bmV3RmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGBhc3NldHMvJHtuZXdGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9YDtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQgIT09IG9yaWdpbmFsQ29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBmYWxsYmFja0ltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccyooW1wiJ10pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rXFwuKGpzfG1qcykpKFxcP1teXCInYFxcc10qKT9cXDFcXHMqXFwpL2c7XG4gICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShmYWxsYmFja0ltcG9ydFBhdHRlcm4sIChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBfZXh0OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChxdWVyeSAmJiBxdWVyeS5pbmNsdWRlcygndj0nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0ke3F1ZXJ5LnJlcGxhY2UoL1xcP3Y9W14mJ1wiXSovLCBgP3Y9JHtidWlsZElkfWApfSR7cXVvdGV9KWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7cGF0aH0/dj0ke2J1aWxkSWR9JHtxdW90ZX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhqc0ZpbGVQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgIHRvdGFsRml4ZWQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG90YWxGaXhlZCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW2ZvcmNlLW5ldy1oYXNoXSBcdTI3MDUgXHU1REYyXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NjZGNFx1NjVCMCAke3RvdGFsRml4ZWR9IFx1NEUyQSBKUyBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4vKipcbiAqIFx1NEZFRVx1NTkwRFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEUyRFx1NzY4NFx1NjVFNyBoYXNoIFx1NUYxNVx1NzUyOFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml4RHluYW1pY0ltcG9ydEhhc2hQbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgY2h1bmtOYW1lTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmaXgtZHluYW1pYy1pbXBvcnQtaGFzaCcsXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjaHVua05hbWVNYXAuY2xlYXIoKTtcblxuICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBPYmplY3Qua2V5cyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykgJiYgZmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSBiYXNlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT8kLykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pPyQvKTtcbiAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gbmFtZU1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKCFjaHVua05hbWVNYXAuaGFzKG5hbWVQcmVmaXgpKSB7XG4gICAgICAgICAgICAgIGNodW5rTmFtZU1hcC5zZXQobmFtZVByZWZpeCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTY1MzZcdTk2QzZcdTUyMzAgJHtjaHVua05hbWVNYXAuc2l6ZX0gXHU0RTJBIGNodW5rIFx1NjYyMFx1NUMwNGApO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGNodW5rQW55LmNvZGUpIHtcbiAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlMaWIgPSBmaWxlTmFtZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygndmVuZG9yJyk7XG5cbiAgICAgICAgICBpZiAoaXNUaGlyZFBhcnR5TGliKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGNodW5rQW55LmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzOiBBcnJheTx7IG9sZDogc3RyaW5nOyBuZXc6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbXCInXSkoXFwuP1xcLz9hc3NldHNcXC8oW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpKVxcMVxccypcXCkvZztcbiAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgaW1wb3J0UGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMobmV3Q29kZSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBxdW90ZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBtYXRjaFsyXTtcbiAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlID0gbWF0Y2hbM107XG4gICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTtcblxuICAgICAgICAgICAgY29uc3QgZXhpc3RzSW5CdW5kbGUgPSBPYmplY3Qua2V5cyhidW5kbGUpLnNvbWUoZiA9PiBmID09PSBgYXNzZXRzLyR7cmVmZXJlbmNlZEZpbGV9YCB8fCBmLmVuZHNXaXRoKGAvJHtyZWZlcmVuY2VkRmlsZX1gKSk7XG5cbiAgICAgICAgICAgIGlmICghZXhpc3RzSW5CdW5kbGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVmTWF0Y2ggPSByZWZlcmVuY2VkRmlsZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgaWYgKHJlZk1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeF0gPSByZWZNYXRjaDtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9IGFjdHVhbEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICAgICAgICBpZiAoZnVsbFBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYC4vYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZnVsbFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBhY3R1YWxGaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBvbGQ6IGZ1bGxNYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgbmV3OiBgaW1wb3J0KCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9KWBcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0cmluZ1BhdGhQYXR0ZXJuID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcLyhbXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSkpXFwxL2c7XG4gICAgICAgICAgc3RyaW5nUGF0aFBhdHRlcm4ubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gc3RyaW5nUGF0aFBhdHRlcm4uZXhlYyhuZXdDb2RlKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1b3RlID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAvLyBjb25zdCBmdWxsUGF0aCA9IG1hdGNoWzJdOyAvLyBcdTY3MkFcdTRGN0ZcdTc1MjhcbiAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlID0gbWF0Y2hbM107XG4gICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTtcblxuICAgICAgICAgICAgY29uc3QgYWxyZWFkeUZpeGVkID0gcmVwbGFjZW1lbnRzLnNvbWUociA9PiByLm9sZCA9PT0gZnVsbE1hdGNoIHx8IHIub2xkLmluY2x1ZGVzKHJlZmVyZW5jZWRGaWxlKSk7XG4gICAgICAgICAgICBpZiAoYWxyZWFkeUZpeGVkKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBleGlzdHNJbkJ1bmRsZSA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuc29tZShmID0+IGYgPT09IGBhc3NldHMvJHtyZWZlcmVuY2VkRmlsZX1gIHx8IGYuZW5kc1dpdGgoYC8ke3JlZmVyZW5jZWRGaWxlfWApKTtcblxuICAgICAgICAgICAgaWYgKCFleGlzdHNJbkJ1bmRsZSkge1xuICAgICAgICAgICAgICBjb25zdCByZWZNYXRjaCA9IHJlZmVyZW5jZWRGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspP1xcLihqc3xtanN8Y3NzKSQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAocmVmTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gcmVmTWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZSA9IGNodW5rTmFtZU1hcC5nZXQobmFtZVByZWZpeCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWN0dWFsRmlsZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBhY3R1YWxGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG9sZDogZnVsbE1hdGNoLFxuICAgICAgICAgICAgICAgICAgICBuZXc6IGAke3F1b3RlfSR7bmV3UGF0aH0ke3F1b3RlfWBcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyZXBsYWNlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnJldmVyc2UoKS5mb3JFYWNoKCh7IG9sZCwgbmV3OiBuZXdTdHIgfSkgPT4ge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKG9sZCwgbmV3U3RyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgY2h1bmtBbnkuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShvcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3Qgb3V0cHV0RGlyID0gb3B0aW9ucy5kaXIgfHwgam9pbihwcm9jZXNzLmN3ZCgpLCAnZGlzdCcpO1xuICAgICAgY2h1bmtOYW1lTWFwLmNsZWFyKCk7XG5cbiAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgT2JqZWN0LmtleXMoYnVuZGxlKSkge1xuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpICYmIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgIGNvbnN0IGJhc2VOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKS5yZXBsYWNlKC9cXC5qcyQvLCAnJyk7XG4gICAgICAgICAgY29uc3QgY2xlYW5CYXNlTmFtZSA9IGJhc2VOYW1lLnJlcGxhY2UoLy0rJC8sICcnKTtcbiAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSBjbGVhbkJhc2VOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspPyQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5CYXNlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpPyQvKTtcbiAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lUHJlZml4ID0gbmFtZU1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKCFjaHVua05hbWVNYXAuaGFzKG5hbWVQcmVmaXgpKSB7XG4gICAgICAgICAgICAgIGNodW5rTmFtZU1hcC5zZXQobmFtZVByZWZpeCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgdG90YWxGaXhlZCA9IDA7XG4gICAgICBjb25zdCB0aGlyZFBhcnR5Q2h1bmtzID0gWydsaWItZWNoYXJ0cycsICdlbGVtZW50LXBsdXMnLCAndnVlLWNvcmUnLCAndnVlLXJvdXRlcicsICd2ZW5kb3InXTtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGNodW5rQW55ID0gY2h1bmsgYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLmpzJykgJiYgZmlsZU5hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5TGliID0gdGhpcmRQYXJ0eUNodW5rcy5zb21lKGxpYiA9PiBmaWxlTmFtZS5pbmNsdWRlcyhsaWIpKTtcbiAgICAgICAgICBjb25zdCBpc0VDaGFydHNMaWIgPSBmaWxlTmFtZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKTtcblxuICAgICAgICAgIGlmIChpc1RoaXJkUGFydHlMaWIgJiYgIWlzRUNoYXJ0c0xpYikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBqb2luKG91dHB1dERpciwgZmlsZU5hbWUpO1xuICAgICAgICAgIGlmIChleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzOiBBcnJheTx7IG9sZDogc3RyaW5nOyBuZXc6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqKFtcIiddKShcXC4/XFwvP2Fzc2V0c1xcLyhbXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSkpXFwxXFxzKlxcKS9nO1xuICAgICAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICAgICAgaW1wb3J0UGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IGltcG9ydFBhdHRlcm4uZXhlYyhjb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3QgcXVvdGUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGUgPSBtYXRjaFszXTtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbE1hdGNoID0gbWF0Y2hbMF07XG5cbiAgICAgICAgICAgICAgY29uc3QgZXhpc3RzSW5CdW5kbGUgPSBPYmplY3Qua2V5cyhidW5kbGUpLnNvbWUoZiA9PiBmID09PSBgYXNzZXRzLyR7cmVmZXJlbmNlZEZpbGV9YCB8fCBmLmVuZHNXaXRoKGAvJHtyZWZlcmVuY2VkRmlsZX1gKSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFleGlzdHNJbkJ1bmRsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlQ2xlYW4gPSByZWZlcmVuY2VkRmlsZS5yZXBsYWNlKC8tK1xcLihqc3xtanN8Y3NzKSQvLCAnLiQxJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmTWF0Y2ggPSByZWZlcmVuY2VkRmlsZUNsZWFuLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspP1xcLihqc3xtanN8Y3NzKSQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVDbGVhbi5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAocmVmTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgICAgaWYgKCFhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZlByZWZpeCA9IHJlZmVyZW5jZWRGaWxlQ2xlYW4ucmVwbGFjZSgvXFwuKGpzfG1qc3xjc3MpJC8sICcnKS5yZXBsYWNlKC8tW2EtekEtWjAtOV17OCx9KD86LVthLXpBLVowLTldKyk/JC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbZXhpc3RpbmdGaWxlTmFtZV0gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ0ZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBleGlzdGluZ0ZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdGaWxlQmFzZU5hbWUgPSBleGlzdGluZ0ZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuanMkLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdGaWxlQmFzZU5hbWVDbGVhbiA9IGV4aXN0aW5nRmlsZUJhc2VOYW1lLnJlcGxhY2UoLy0rJC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJlZml4ID0gZXhpc3RpbmdGaWxlQmFzZU5hbWVDbGVhbi5yZXBsYWNlKC8tW2EtekEtWjAtOV17OCx9KD86LVthLXpBLVowLTldKyk/JC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1ByZWZpeCA9PT0gcmVmUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEZpbGUgPSBleGlzdGluZ0ZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBhY3R1YWxGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdQYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGAvYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdWxsUGF0aC5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgLi9hc3NldHMvJHthY3R1YWxGaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZ1bGxQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBgYXNzZXRzLyR7YWN0dWFsRmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gYWN0dWFsRmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgb2xkOiBmdWxsTWF0Y2gsXG4gICAgICAgICAgICAgICAgICAgICAgbmV3OiBgaW1wb3J0KCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9KWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ1BhdGhQYXR0ZXJuID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcLyhbXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSkpXFwxL2c7XG4gICAgICAgICAgICBzdHJpbmdQYXRoUGF0dGVybi5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHN0cmluZ1BhdGhQYXR0ZXJuLmV4ZWMoY29udGVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHF1b3RlID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgIC8vIGNvbnN0IGZ1bGxQYXRoID0gbWF0Y2hbMl07IC8vIFx1NjcyQVx1NEY3Rlx1NzUyOFxuICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VkRmlsZSA9IG1hdGNoWzNdO1xuICAgICAgICAgICAgICBjb25zdCBmdWxsTWF0Y2ggPSBtYXRjaFswXTtcblxuICAgICAgICAgICAgICBjb25zdCBhbHJlYWR5Rml4ZWQgPSByZXBsYWNlbWVudHMuc29tZShyID0+IHIub2xkID09PSBmdWxsTWF0Y2ggfHwgci5vbGQuaW5jbHVkZXMocmVmZXJlbmNlZEZpbGUpKTtcbiAgICAgICAgICAgICAgaWYgKGFscmVhZHlGaXhlZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgZXhpc3RzSW5CdW5kbGUgPSBPYmplY3Qua2V5cyhidW5kbGUpLnNvbWUoZiA9PiBmID09PSBgYXNzZXRzLyR7cmVmZXJlbmNlZEZpbGV9YCB8fCBmLmVuZHNXaXRoKGAvJHtyZWZlcmVuY2VkRmlsZX1gKSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFleGlzdHNJbkJ1bmRsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlQ2xlYW4gPSByZWZlcmVuY2VkRmlsZS5yZXBsYWNlKC8tK1xcLihqc3xtanN8Y3NzKSQvLCAnLiQxJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmTWF0Y2ggPSByZWZlcmVuY2VkRmlsZUNsZWFuLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi1bYS16QS1aMC05XXs4LH0pKyg/Oi1bYS16QS1aMC05XSspP1xcLihqc3xtanN8Y3NzKSQvKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVDbGVhbi5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAocmVmTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVQcmVmaXggPSByZWZNYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxGaWxlID0gY2h1bmtOYW1lTWFwLmdldChuYW1lUHJlZml4KTtcblxuICAgICAgICAgICAgICAgICAgaWYgKCFhY3R1YWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZlByZWZpeCA9IHJlZmVyZW5jZWRGaWxlQ2xlYW4ucmVwbGFjZSgvXFwuKGpzfG1qc3xjc3MpJC8sICcnKS5yZXBsYWNlKC8tW2EtekEtWjAtOV17OCx9KD86LVthLXpBLVowLTldKyk/JC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbZXhpc3RpbmdGaWxlTmFtZV0gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ0ZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSAmJiBleGlzdGluZ0ZpbGVOYW1lLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdGaWxlQmFzZU5hbWUgPSBleGlzdGluZ0ZpbGVOYW1lLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJykucmVwbGFjZSgvXFwuanMkLywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdGaWxlQmFzZU5hbWVDbGVhbiA9IGV4aXN0aW5nRmlsZUJhc2VOYW1lLnJlcGxhY2UoLy0rJC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJlZml4ID0gZXhpc3RpbmdGaWxlQmFzZU5hbWVDbGVhbi5yZXBsYWNlKC8tW2EtekEtWjAtOV17OCx9KD86LVthLXpBLVowLTldKyk/JC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1ByZWZpeCA9PT0gcmVmUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEZpbGUgPSBleGlzdGluZ0ZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsRmlsZU5hbWUgPSBhY3R1YWxGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2FjdHVhbEZpbGVOYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgIG9sZDogZnVsbE1hdGNoLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldzogYCR7cXVvdGV9JHtuZXdQYXRofSR7cXVvdGV9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50cy5yZXZlcnNlKCkuZm9yRWFjaCgoeyBvbGQsIG5ldzogbmV3U3RyIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKG9sZCwgbmV3U3RyKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnQsICd1dGYtOCcpO1xuICAgICAgICAgICAgICB0b3RhbEZpeGVkKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3RhbEZpeGVkID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW2ZpeC1keW5hbWljLWltcG9ydC1oYXNoXSBcdTI3MDUgd3JpdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU1MTcxXHU0RkVFXHU1OTBEICR7dG90YWxGaXhlZH0gXHU0RTJBXHU2NTg3XHU0RUY2YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cmwudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXJsLnRzXCI7LyoqXG4gKiBVUkwgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2QjYzXHU3ODZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgQ2h1bmtJbmZvLCBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUJhc2VVcmxQbHVnaW4oYmFzZVVybDogc3RyaW5nLCBhcHBIb3N0OiBzdHJpbmcsIGFwcFBvcnQ6IG51bWJlciwgbWFpbkFwcFBvcnQ6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGNvbnN0IGlzUHJldmlld0J1aWxkID0gYmFzZVVybC5zdGFydHNXaXRoKCdodHRwJyk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWJhc2UtdXJsJyxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBDaHVua0luZm8sIF9vcHRpb25zOiBhbnkpIHtcbiAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAvLyBcdTU2RTBcdTRFM0EgdmVuZG9yIFx1N0I0OVx1NUU5M1x1NEUyRFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTMwNVx1NTQyQlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFxuXG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgIGlmIChyZWxhdGl2ZVBhdGhSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaCwgcXVvdGUsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vJHthcHBIb3N0fToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRIdHRwUmVnZXgsIChfbWF0Y2gsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLyR7YXBwSG9zdH06JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2gsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICByZXR1cm4gYC8vJHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXTtcblxuICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgIGlmIChwYXR0ZXJuLnJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHBhdHRlcm4ucmVnZXgsIHBhdHRlcm4ucmVwbGFjZW1lbnQgYXMgYW55KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0ICgke21haW5BcHBQb3J0fSAtPiAke2FwcFBvcnR9KWApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IG5ld0NvZGUsXG4gICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGlmIChjaHVuay50eXBlID09PSAnY2h1bmsnICYmIGNodW5rLmNvZGUpIHtcbiAgICAgICAgICAvLyBcdTRFMERcdTUxOERcdThERjNcdThGQzcgdmVuZG9yIFx1N0I0OVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OTBGRFx1NkI2M1x1Nzg2RVxuICAgICAgICAgIGxldCBuZXdDb2RlID0gY2h1bmsuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspKFxcP1teXCInYFxcc10qKT8vZztcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZVBhdGhSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vJHthcHBIb3N0fToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8ke2FwcEhvc3R9OiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2g6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGAvLyR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtlbnN1cmUtYmFzZS11cmxdIFx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTRFMkRcdTRGRUVcdTU5MERcdTRFODYgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNodW5rLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFxuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9IChjaHVuayBhcyBhbnkpLnNvdXJjZSBhcyBzdHJpbmc7XG4gICAgICAgICAgbGV0IGh0bWxNb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIEhUTUwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMvXHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzIGJhc2UgXHU2NjJGIC9cdUZGMDlcbiAgICAgICAgICAvLyBcdTRFMERcdTg5ODFcdTVDMDYgL2Fzc2V0cy8gXHU4RjZDXHU2MzYyXHU0RTNBXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjUwXHU1RTk0XHU3NTI4XHU5MEU4XHU3RjcyXHU1NzI4XHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5XHU5NTE5XHU4QkVGXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU2MjE2XHU3RjNBXHU1QzExIC9hc3NldHMvIFx1NTI0RFx1N0YwMFx1NzY4NFx1OEQ0NFx1NkU5MFxuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlQXNzZXRSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLlxcL2Fzc2V0c1xcL1teXCInXSspKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlQXNzZXRSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJlbGF0aXZlQXNzZXRSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTVDMDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwuLywgJycpO1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke2Fic29sdXRlUGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOSAvYXNzZXRzLyBcdThERUZcdTVGODRcdTc2ODRcdThENDRcdTZFOTBcdTRGRERcdTYzMDFcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODMgYmFzZSBcdTY2MkYgL1x1RkYwOVxuICAgICAgICAgIGNvbnN0IGh0bWxBc3NldFJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvYXNzZXRzXFwvW15cIiddKykoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAoaHRtbEFzc2V0UmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIC8vIFx1OUE4Q1x1OEJDMVx1OERFRlx1NUY4NFx1NjYyRlx1NTQyNlx1NkI2M1x1Nzg2RVx1RkYwQ1x1NEUwRFx1NTA1QVx1NEZFRVx1NjUzOVx1RkYwOFx1NEZERFx1NjMwMSAvYXNzZXRzLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1OEZEOVx1NjYyRlx1NkI2M1x1Nzg2RVx1NzY4NFx1RkYwQ1x1NTZFMFx1NEUzQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4MyBiYXNlIFx1NjYyRiAvXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU0RkVFXHU1OTBEIEhUTUwgXHU0RTJEXHU2ODM5XHU4REVGXHU1Rjg0XHU3Njg0XHU1NkZFXHU3MjQ3XHU1RjE1XHU3NTI4XHVGRjA4XHU1OTgyIC9sb2dvLnBuZ1x1RkYwOVxuICAgICAgICAgIGNvbnN0IHJvb3RJbWFnZVJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvW14vXVteXCInXSpcXC4ocG5nfGpwZ3xqcGVnfGdpZnxzdmd8aWNvKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdEltYWdlUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NjgzOVx1OERFRlx1NUY4NFx1NTZGRVx1NzI0N1x1NzY4NFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4MyBiYXNlIFx1NjYyRiAvXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTRFMERcdTUwNUFcdTRGRUVcdTY1MzlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgLT4gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjb3JzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHNcIjsvKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XG4gKiBcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHMgXHU3Njg0IENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBjcmVkZW50aWFsc1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yc1BsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjb3JzRGV2TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgY29uc3QgY29yc1ByZXZpZXdNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzRGV2TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNEZXZNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbmZpZ3VyZVByZXZpZXdTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY3NzLnRzXCI7LyoqXG4gKiBDU1MgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTc4NkVcdTRGREQgQ1NTIFx1NjU4N1x1NEVGNlx1ODhBQlx1NkI2M1x1Nzg2RVx1NjI1M1x1NTMwNVxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdTYyNTNcdTUzMDVcdTc2ODRcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUNzc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtY3NzLXBsdWdpbicsXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBqc0ZpbGVzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICBsZXQgaGFzSW5saW5lQ3NzID0gZmFsc2U7XG4gICAgICBjb25zdCBzdXNwaWNpb3VzRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGpzRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmsgJiYgY2h1bmsuY29kZSAmJiB0eXBlb2YgY2h1bmsuY29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBjb2RlID0gY2h1bmsuY29kZTtcblxuICAgICAgICAgIGNvbnN0IGlzTW9kdWxlUHJlbG9hZCA9IGNvZGUuaW5jbHVkZXMoJ21vZHVsZXByZWxvYWQnKSB8fCBjb2RlLmluY2x1ZGVzKCdyZWxMaXN0Jyk7XG4gICAgICAgICAgaWYgKGlzTW9kdWxlUHJlbG9hZCkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgaXNLbm93bkxpYnJhcnkgPSBmaWxlLmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndmVuZG9yJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3Z1ZS1pMThuJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnbW9kdWxlLScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdhcHAtY29tcG9zYWJsZXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLXBhZ2VzJyk7XG4gICAgICAgICAgaWYgKGlzS25vd25MaWJyYXJ5KSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbiA9IC9kb2N1bWVudFxcLmNyZWF0ZUVsZW1lbnRcXChbJ1wiXXN0eWxlWydcIl1cXCkvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXC4odGV4dENvbnRlbnR8aW5uZXJIVE1MKVxccyo9Ly50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsxMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3QgaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzID0gL2luc2VydFN0eWxlXFxzKlxcKC8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL3RleHRcXC9jc3MvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezIwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBzdHlsZVRhZ01hdGNoID0gY29kZS5tYXRjaCgvPHN0eWxlW14+XSo+Lyk7XG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVUYWdXaXRoQ29udGVudCA9IHN0eWxlVGFnTWF0Y2ggJiZcbiAgICAgICAgICAgICFzdHlsZVRhZ01hdGNoWzBdLmluY2x1ZGVzKFwiJ1wiKSAmJlxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoJ1wiJykgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezIwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBoYXNJbmxpbmVDc3NTdHJpbmcgPSAvWydcImBdW14nXCJgXXs1MCx9OlxccypbXidcImBdezEwLH07XFxzKlteJ1wiYF17MTAsfVsnXCJgXS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgLyhjb2xvcnxiYWNrZ3JvdW5kfHdpZHRofGhlaWdodHxtYXJnaW58cGFkZGluZ3xib3JkZXJ8ZGlzcGxheXxwb3NpdGlvbnxmbGV4fGdyaWQpLy50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgaWYgKGhhc1N0eWxlRWxlbWVudENyZWF0aW9uIHx8IGhhc0luc2VydFN0eWxlV2l0aENzcyB8fCBoYXNTdHlsZVRhZ1dpdGhDb250ZW50IHx8IGhhc0lubGluZUNzc1N0cmluZykge1xuICAgICAgICAgICAgaGFzSW5saW5lQ3NzID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1c3BpY2lvdXNGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybnM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24pIHBhdHRlcm5zLnB1c2goJ1x1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSBzdHlsZSBcdTUxNDNcdTdEMjAnKTtcbiAgICAgICAgICAgIGlmIChoYXNJbnNlcnRTdHlsZVdpdGhDc3MpIHBhdHRlcm5zLnB1c2goJ2luc2VydFN0eWxlIFx1NTFGRFx1NjU3MCcpO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlVGFnV2l0aENvbnRlbnQpIHBhdHRlcm5zLnB1c2goJzxzdHlsZT4gXHU2ODA3XHU3QjdFJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5saW5lQ3NzU3RyaW5nKSBwYXR0ZXJucy5wdXNoKCdcdTUxODVcdTgwNTQgQ1NTIFx1NUI1N1x1N0IyNlx1NEUzMicpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTU3MjggJHtmaWxlfSBcdTRFMkRcdTY4QzBcdTZENEJcdTUyMzBcdTUzRUZcdTgwRkRcdTc2ODRcdTUxODVcdTgwNTQgQ1NTXHVGRjA4XHU2QTIxXHU1RjBGXHVGRjFBJHtwYXR0ZXJucy5qb2luKCcsICcpfVx1RkYwOWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNJbmxpbmVDc3MpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTY4QzBcdTZENEJcdTUyMzAgQ1NTIFx1NTNFRlx1ODBGRFx1ODhBQlx1NTE4NVx1ODA1NFx1NTIzMCBKUyBcdTRFMkRcdUZGMENcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgcWlhbmt1biBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTUyQTBcdThGN0RcdTY4MzdcdTVGMEYnKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1NTNFRlx1NzU5MVx1NjU4N1x1NEVGNlx1RkYxQSR7c3VzcGljaW91c0ZpbGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTUgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTkxNERcdTdGNkVcdTU0OEMgYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU4QkJFXHU3RjZFJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGNzc0ZpbGVzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuICAgICAgaWYgKGNzc0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1Mjc0QyBcdTk1MTlcdThCRUZcdUZGMUFcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMkRcdTY1RTAgQ1NTIFx1NjU4N1x1NEVGNlx1RkYwMScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1OEJGN1x1NjhDMFx1NjdFNVx1RkYxQScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcxLiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTk3NTlcdTYwMDFcdTVCRkNcdTUxNjVcdTUxNjhcdTVDNDBcdTY4MzdcdTVGMEZcdUZGMDhpbmRleC5jc3MvdW5vLmNzcy9lbGVtZW50LXBsdXMuY3NzXHVGRjA5Jyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzIuIFx1NjYyRlx1NTQyNlx1NjcwOSBWdWUgXHU3RUM0XHU0RUY2XHU0RTJEXHU0RjdGXHU3NTI4IDxzdHlsZT4gXHU2ODA3XHU3QjdFJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzMuIFVub0NTUyBcdTkxNERcdTdGNkVcdTY2MkZcdTU0MjZcdTZCNjNcdTc4NkVcdUZGMENcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjUgQHVub2NzcyBhbGwnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignNC4gdml0ZS1wbHVnaW4tcWlhbmt1biBcdTc2ODQgdXNlRGV2TW9kZSBcdTY2MkZcdTU0MjZcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTZCNjNcdTc4NkVcdTUxNzNcdTk1RUQnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignNS4gYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU2NjJGXHU1NDI2XHU4QkJFXHU3RjZFXHU0RTNBIDBcdUZGMDhcdTc5ODFcdTZCNjJcdTUxODVcdTgwNTRcdUZGMDknKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjcwNSBcdTYyMTBcdTUyOUZcdTYyNTNcdTUzMDUgJHtjc3NGaWxlcy5sZW5ndGh9IFx1NEUyQSBDU1MgXHU2NTg3XHU0RUY2XHVGRjFBYCwgY3NzRmlsZXMpO1xuICAgICAgICBjc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgICBpZiAoYXNzZXQgJiYgYXNzZXQuc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplS0IgPSAoYXNzZXQuc291cmNlLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtICR7ZmlsZX06ICR7c2l6ZUtCfUtCYCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldCAmJiBhc3NldC5maWxlTmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCAgLSAke2Fzc2V0LmZpbGVOYW1lIHx8IGZpbGV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHZlcnNpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50c1wiOy8qKlxuICogXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XG4gKiBcdTRFM0EgSFRNTCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTUxNjhcdTVDNDBcdTdFREZcdTRFMDBcdTc2ODRcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NzUyOFx1NEU4RVx1NkQ0Rlx1ODlDOFx1NTY2OFx1N0YxM1x1NUI1OFx1NjNBN1x1NTIzNlx1RkYwQ1x1NkJDRlx1NkIyMVx1Njc4NFx1NUVGQVx1OTBGRFx1NEYxQVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1xuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjE2XHU3NTFGXHU2MjEwXHU1MTY4XHU1QzQwXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMENcdTkwRkRcdTZDQTFcdTY3MDlcdTUyMTlcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcbiAqL1xuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgLy8gMS4gXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjA4XHU3NTMxXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU4QkJFXHU3RjZFXHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cblxuICAvLyAyLiBcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdTVGRkRcdTc1NjVcdThCRkJcdTUzRDZcdTk1MTlcdThCRUZcbiAgICB9XG4gIH1cblxuICAvLyAzLiBcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdTVFNzZcdTRGRERcdTVCNThcdTUyMzBcdTY1ODdcdTRFRjZcdUZGMDhcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTRFMkFcdUZGMDlcbiAgLy8gXHU0RjdGXHU3NTI4MzZcdThGREJcdTUyMzZcdTdGMTZcdTc4MDFcdUZGMENcdTc1MUZcdTYyMTBcdTY2RjRcdTc3RURcdTc2ODRcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTUzMDVcdTU0MkJcdTVCNTdcdTZCQ0RcdTU0OENcdTY1NzBcdTVCNTdcdUZGMENcdTU5ODIgbDNrMmoxaFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgdHJ5IHtcbiAgICB3cml0ZUZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsIHRpbWVzdGFtcCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1RkZEXHU3NTY1XHU1MTk5XHU1MTY1XHU5NTE5XHU4QkVGXG4gIH1cbiAgcmV0dXJuIHRpbWVzdGFtcDtcbn1cblxuLyoqXG4gKiBcdTRFM0EgSFRNTCBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFZlcnNpb25QbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBnZXRCdWlsZFRpbWVzdGFtcCgpO1xuXG4gIHJldHVybiB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFZpdGUgUGx1Z2luIFx1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVx1NTNFRlx1ODBGRFx1NEUwRFx1NUI4Q1x1NjU3NFx1RkYwQ25hbWUgXHU1QzVFXHU2MDI3XHU2NjJGXHU2ODA3XHU1MUM2XHU1QzVFXHU2MDI3XG4gICAgbmFtZTogJ2FkZC12ZXJzaW9uJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5sb2coYFthZGQtdmVyc2lvbl0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3OiAke2J1aWxkVGltZXN0YW1wfWApO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9IChjaHVuayBhcyBhbnkpLnNvdXJjZSBhcyBzdHJpbmc7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTRFM0Egc2NyaXB0IFx1NjgwN1x1N0I3RVx1NzY4NCBzcmMgXHU1QzVFXHU2MDI3XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gICAgICAgICAgY29uc3Qgc2NyaXB0UmVnZXggPSAvKDxzY3JpcHRbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nO1xuICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShzY3JpcHRSZWdleCwgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NURGMlx1NjcwOVx1NzI0OFx1NjcyQ1x1NTNGN1x1NzY4NFx1OEQ0NFx1NkU5MFx1RkYwOFx1OTA3Rlx1NTE0RFx1OTFDRFx1NTkwRFx1NkRGQlx1NTJBMFx1RkYwOVxuICAgICAgICAgICAgaWYgKHNyYy5pbmNsdWRlcygnP3Y9JykgfHwgc3JjLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDlcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMENcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNERcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFNyYyA9IHNyYy5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCBgP3Y9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRTcmMgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZFNyY30ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTNFQVx1NEUzQSAvYXNzZXRzLyBcdThERUZcdTVGODRcdTc2ODRcdThENDRcdTZFOTBcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcbiAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSB8fCBzcmMuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBzcmMuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3NyY30ke3NlcGFyYXRvcn12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFx1NEUzQSBsaW5rIFx1NjgwN1x1N0I3RVx1NzY4NCBocmVmIFx1NUM1RVx1NjAyN1x1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgIGNvbnN0IGxpbmtSZWdleCA9IC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZztcbiAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UobGlua1JlZ2V4LCAobWF0Y2gsIHByZWZpeCwgaHJlZiwgc3VmZml4KSA9PiB7XG4gICAgICAgICAgICAvLyBcdThERjNcdThGQzdcdTVERjJcdTY3MDlcdTcyNDhcdTY3MkNcdTUzRjdcdTc2ODRcdThENDRcdTZFOTBcdUZGMDhcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTZERkJcdTUyQTBcdUZGMDlcbiAgICAgICAgICAgIGlmIChocmVmLmluY2x1ZGVzKCc/dj0nKSB8fCBocmVmLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDlcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMENcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNERcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZEhyZWYgPSBocmVmLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZEhyZWYgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3VwZGF0ZWRIcmVmfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1M0VBXHU0RTNBIC9hc3NldHMvIFx1OERFRlx1NUY4NFx1NzY4NFx1OEQ0NFx1NkU5MFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1xuICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSB8fCBocmVmLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gaHJlZi5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7aHJlZn0ke3NlcGFyYXRvcn12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuc291cmNlID0gaHRtbENvbnRlbnQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2FkZC12ZXJzaW9uXSBcdTVERjJcdTRFM0EgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjc6IHY9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccHVibGljLWltYWdlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9wdWJsaWMtaW1hZ2VzLnRzXCI7LyoqXG4gKiBQdWJsaWMgXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XG4gKiBcdTVDMDYgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NjI1M1x1NTMwNVx1NTIzMCBhc3NldHMgXHU3NkVFXHU1RjU1XHU1RTc2XHU2REZCXHU1MkEwXHU1NEM4XHU1RTBDXHU1MDNDXG4gKiBcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDYgbG9nby5wbmdcdUZGMUFcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTY1ODdcdTRFRjZcdTU0MERcdTRFMERcdTUzRDhcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgam9pbiwgZXh0bmFtZSwgYmFzZW5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMsIHN0YXRTeW5jLCB3cml0ZUZpbGVTeW5jLCBta2RpclN5bmMgfSBmcm9tICdub2RlOmZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHB1YmxpY0ltYWdlc1RvQXNzZXRzUGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgY29uc3QgaW1hZ2VNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBlbWl0dGVkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBwdWJsaWNJbWFnZUZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgXG4gIC8vIFx1OTcwMFx1ODk4MVx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYxQVx1NjUzRVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwQ1x1NEUwRFx1NEY3Rlx1NzUyOCBoYXNoXHVGRjA4XHU0RUM1XHU3NTI4XHU0RThFIENTUyBcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcdUZGMDlcbiAgY29uc3Qgcm9vdEltYWdlRmlsZXMgPSBbJ2xvZ28ucG5nJywgJ2xvZ2luX2N1dF9kYXJrLnBuZycsICdsb2dpbl9jdXRfbGlnaHQucG5nJ107XG5cbiAgY29uc3QgaXNWaXJ0dWFsTW9kdWxlSWQgPSAoaWQ6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiBpZC5pbmNsdWRlcygnXFwwJykgfHwgaWQuaW5jbHVkZXMoJ3B1YmxpYy1pbWFnZTonKTtcbiAgfTtcblxuICBjb25zdCBleHRyYWN0T3JpZ2luYWxQYXRoID0gKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICBpZiAoIWlzVmlydHVhbE1vZHVsZUlkKGlkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IGlkLnJlcGxhY2UoL1xcMHB1YmxpYy1pbWFnZTovZywgJycpLnJlcGxhY2UoL1xcMC9nLCAnJyk7XG4gICAgaWYgKG9yaWdpbmFsUGF0aC5pbmNsdWRlcygnXFwwJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3JpZ2luYWxQYXRoO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMnKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW1hZ2VFeHRlbnNpb25zID0gWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmdpZicsICcud2VicCcsICcuc3ZnJywgJy5pY28nXTtcbiAgICAgIGNvbnN0IGZpbGVzID0gcmVhZGRpclN5bmMocHVibGljRGlyKTtcblxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGV4dCA9IGV4dG5hbWUoZmlsZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGltYWdlRXh0ZW5zaW9ucy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgLy8gXHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHU5NzAwXHU4OTgxXHU3Mjc5XHU2QjhBXHU1OTA0XHU3NDA2XHVGRjFBXHU0RkREXHU2MzAxXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjBDXHU2NTg3XHU0RUY2XHU1NDBEXHU0RTBEXHU1M0Q4XHVGRjBDXHU0RTBEXHU0RjdGXHU3NTI4XHU1NEM4XHU1RTBDXHU1MDNDXG4gICAgICAgICAgaWYgKHJvb3RJbWFnZUZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDRTYgXHU1OTA0XHU3NDA2ICR7ZmlsZX1cdUZGMENcdTVDMDZcdTU5MERcdTUyMzZcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTY1RTBcdTU0QzhcdTVFMENcdTUwM0NcdUZGMDlgKTtcbiAgICAgICAgICAgIC8vIFx1OEJCMFx1NUY1NVx1NjU4N1x1NEVGNlx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NTcyOCB3cml0ZUJ1bmRsZSBcdTk2MzZcdTZCQjVcdTU5MERcdTUyMzZcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgICAgIHB1YmxpY0ltYWdlRmlsZXMuc2V0KGZpbGUsIGpvaW4ocHVibGljRGlyLCBmaWxlKSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGpvaW4ocHVibGljRGlyLCBmaWxlKTtcbiAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIHB1YmxpY0ltYWdlRmlsZXMuc2V0KGAvJHtmaWxlfWAsIGZpbGVQYXRoKTtcbiAgICAgICAgICAgIHB1YmxpY0ltYWdlRmlsZXMuc2V0KGZpbGUsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBUm9sbHVwIFx1NzY4NCBlbWl0RmlsZSBcdTRGMUFcdTVDMDZcdTY1ODdcdTRFRjZcdTY1M0VcdTU3MjggYXNzZXRzRGlyXHVGRjA4XHU5RUQ4XHU4QkE0XHU2NjJGICdhc3NldHMnXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTYyMTFcdTRFRUNcdTRFMERcdTU3MjggZW1pdEZpbGUgXHU2NUY2XHU2MzA3XHU1QjlBIGZpbGVOYW1lXHVGRjBDXHU4QkE5IFJvbGx1cCBcdTgxRUFcdTUyQThcdTU5MDRcdTc0MDZcdUZGMENcdTcxMzZcdTU0MEVcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU4M0I3XHU1M0Q2XHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICBjb25zdCByZWZlcmVuY2VJZCA9ICh0aGlzIGFzIGFueSkuZW1pdEZpbGUoe1xuICAgICAgICAgICAgICB0eXBlOiAnYXNzZXQnLFxuICAgICAgICAgICAgICBuYW1lOiBmaWxlLCAvLyBcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkJcdThERUZcdTVGODRcdUZGMDlcdUZGMENSb2xsdXAgXHU0RjFBXHU4MUVBXHU1MkE4XHU2REZCXHU1MkEwXHU1NEM4XHU1RTBDXHU1MDNDXHU1RTc2XHU2NTNFXHU1NzI4IGFzc2V0c0RpclxuICAgICAgICAgICAgICBzb3VyY2U6IGZpbGVDb250ZW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbWl0dGVkRmlsZXMuc2V0KGZpbGUsIHJlZmVyZW5jZUlkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1RENFNiBcdTVDMDYgJHtmaWxlfSBcdTYyNTNcdTUzMDUgKHJlZmVyZW5jZUlkOiAke3JlZmVyZW5jZUlkfSlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nLCBfaW1wb3J0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB8IG51bGwgfCB7IGlkOiBzdHJpbmc7IGV4dGVybmFsPzogYm9vbGVhbiB9IHtcbiAgICAgIGlmIChpc1ZpcnR1YWxNb2R1bGVJZChpZCkpIHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ1xcMHB1YmxpYy1pbWFnZTonKSB8fCBpZC5pbmNsdWRlcygnXFwwcHVibGljLWltYWdlOicpKSB7XG4gICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5MDRcdTc0MDYgL2xvZ28ucG5nIFx1NzY4NFx1ODlFM1x1Njc5MFx1RkYwQ1x1OEJBOSBSb2xsdXAgXHU4MEZEXHU1OTFGXHU2MjdFXHU1MjMwXHU1QjgzXG4gICAgICAvLyBcdTUzNzNcdTRGN0YgcHVibGljRGlyIFx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1NjIxMVx1NEVFQ1x1NEVDRFx1NzEzNlx1OTcwMFx1ODk4MVx1OEJBOVx1Njc4NFx1NUVGQVx1NjVGNlx1ODBGRFx1NTkxRlx1ODlFM1x1Njc5MFx1OEZEOVx1NEUyQVx1OERFRlx1NUY4NFxuICAgICAgaWYgKGlkID09PSAnL2xvZ28ucG5nJyB8fCBpZCA9PT0gJ2xvZ28ucG5nJykge1xuICAgICAgICBjb25zdCBsb2dvUGF0aCA9IHB1YmxpY0ltYWdlRmlsZXMuZ2V0KCdsb2dvLnBuZycpO1xuICAgICAgICBpZiAobG9nb1BhdGggJiYgZXhpc3RzU3luYyhsb2dvUGF0aCkpIHtcbiAgICAgICAgICAvLyBcdThGRDRcdTU2REVcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdThCQTkgUm9sbHVwIFx1ODBGRFx1NTkxRlx1NTkwNFx1NzQwNlxuICAgICAgICAgIHJldHVybiBsb2dvUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTcgSURcbiAgICAgICAgcmV0dXJuIGBcXDBwdWJsaWMtaW1hZ2U6L2xvZ28ucG5nYDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJy8nKSAmJiBwdWJsaWNJbWFnZUZpbGVzLmhhcyhpZCkpIHtcbiAgICAgICAgcmV0dXJuIGBcXDBwdWJsaWMtaW1hZ2U6JHtpZH1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBsb2FkKGlkOiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTkwNFx1NzQwNlx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1NzY4NFx1NTJBMFx1OEY3RFxuICAgICAgLy8gXHU1OTgyXHU2NzlDIGlkIFx1NjYyRlx1NUI5RVx1OTY0NVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NEUwRFx1NjYyRlx1ODY1QVx1NjJERlx1NkEyMVx1NTc1N1x1RkYwOVx1RkYwQ1x1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgZm9yIChjb25zdCByb290RmlsZSBvZiByb290SW1hZ2VGaWxlcykge1xuICAgICAgICBpZiAoaWQuZW5kc1dpdGgocm9vdEZpbGUpICYmIGV4aXN0c1N5bmMoaWQpKSB7XG4gICAgICAgICAgLy8gXHU1QkY5XHU0RThFXHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU4RkQ0XHU1NkRFXHU0RTAwXHU0RTJBXHU1QkZDXHU1MUZBXHU4REVGXHU1Rjg0XHU3Njg0XHU2QTIxXHU1NzU3XG4gICAgICAgICAgLy8gXHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHVGRjBDXHU1NkZFXHU3MjQ3XHU0RjFBXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHVGRjBDXHU2MjQwXHU0RUU1XHU4RkQ0XHU1NkRFIFwiL1x1NjU4N1x1NEVGNlx1NTQwRFwiXG4gICAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke3Jvb3RGaWxlfVwiO2A7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFpc1ZpcnR1YWxNb2R1bGVJZChpZCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IGV4dHJhY3RPcmlnaW5hbFBhdGgoaWQpO1xuICAgICAgaWYgKCFvcmlnaW5hbFBhdGgpIHtcbiAgICAgICAgLy8gXHU3Mjc5XHU2QjhBXHU1OTA0XHU3NDA2XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XG4gICAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMocm9vdEZpbGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYGV4cG9ydCBkZWZhdWx0IFwiLyR7cm9vdEZpbGV9XCI7YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU2NUUwXHU2Q0Q1XHU2M0QwXHU1M0Q2XHU1MzlGXHU1OUNCXHU4REVGXHU1Rjg0XHVGRjBDXHU4REYzXHU4RkM3OiAke2lkfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShvcmlnaW5hbFBhdGgpO1xuXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdThERUZcdTVGODRcbiAgICAgIGlmIChyb290SW1hZ2VGaWxlcy5pbmNsdWRlcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke2ZpbGVOYW1lfVwiO2A7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlZmVyZW5jZUlkID0gZW1pdHRlZEZpbGVzLmdldChmaWxlTmFtZSk7XG4gICAgICBpZiAocmVmZXJlbmNlSWQpIHtcbiAgICAgICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCBcIi8ke2ZpbGVOYW1lfVwiO2A7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBidW5kbGVBc3NldHMgPSBPYmplY3QuZW50cmllcyhidW5kbGUpLmZpbHRlcigoW18sIGNodW5rXSkgPT4gY2h1bmsudHlwZSA9PT0gJ2Fzc2V0Jyk7XG4gICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDQ0IgYnVuZGxlIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NjU3MFx1OTFDRjogJHtidW5kbGVBc3NldHMubGVuZ3RofWApO1xuXG4gICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMEQgXHU1RjAwXHU1OUNCXHU1OTA0XHU3NDA2ICR7ZW1pdHRlZEZpbGVzLnNpemV9IFx1NEUyQVx1NURGMlx1NTNEMVx1NTFGQVx1NzY4NFx1NjU4N1x1NEVGNmApO1xuICAgICAgZm9yIChjb25zdCBbb3JpZ2luYWxGaWxlLCByZWZlcmVuY2VJZF0gb2YgZW1pdHRlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGFjdHVhbEZpbGVOYW1lID0gKHRoaXMgYXMgYW55KS5nZXRGaWxlTmFtZShyZWZlcmVuY2VJZCk7XG5cbiAgICAgICAgICBpZiAoIWFjdHVhbEZpbGVOYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDYgJHtvcmlnaW5hbEZpbGV9IFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRCAocmVmZXJlbmNlSWQ6ICR7cmVmZXJlbmNlSWR9KWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgYXNzZXRDaHVuayA9IGJ1bmRsZVthY3R1YWxGaWxlTmFtZV07XG4gICAgICAgICAgaWYgKCFhc3NldENodW5rIHx8IGFzc2V0Q2h1bmsudHlwZSAhPT0gJ2Fzc2V0Jykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU1NzI4IGJ1bmRsZSBcdTRFMkRcdTY3MkFcdTYyN0VcdTUyMzAgJHthY3R1YWxGaWxlTmFtZX0gKFx1NTM5Rlx1NTlDQlx1NjU4N1x1NEVGNjogJHtvcmlnaW5hbEZpbGV9KWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU2MzAxXHU1QjhDXHU2NTc0XHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU1MzA1XHU2MkVDIGFzc2V0cy8gXHU1MjREXHU3RjAwXHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gICAgICAgICAgLy8gUm9sbHVwIFx1NEYxQVx1NUMwNlx1NjU4N1x1NEVGNlx1NjUzRVx1NTcyOCBhc3NldHMgXHU3NkVFXHU1RjU1XHVGRjBDXHU2MjQwXHU0RUU1XHU4REVGXHU1Rjg0XHU1RTk0XHU4QkU1XHU2NjJGIGFzc2V0cy9maWxlbmFtZVxuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lV2l0aFBhdGggPSBhY3R1YWxGaWxlTmFtZTsgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU1OUNCXHU4REVGXHU1Rjg0XHVGRjBDXHU1MzA1XHU2MkVDIGFzc2V0cy8gXHU1MjREXHU3RjAwXG4gICAgICAgICAgaW1hZ2VNYXAuc2V0KG9yaWdpbmFsRmlsZSwgZmlsZU5hbWVXaXRoUGF0aCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNzA1ICR7b3JpZ2luYWxGaWxlfSAtPiAke2ZpbGVOYW1lV2l0aFBhdGh9IChSb2xsdXAgXHU3NTFGXHU2MjEwXHU3Njg0XHU2NTg3XHU0RUY2XHU1NDBEKWApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NTkwNFx1NzQwNiAke29yaWdpbmFsRmlsZX0gXHU2NUY2XHU1MUZBXHU5NTE5OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaW1hZ2VNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNkEwXHVGRTBGICBpbWFnZU1hcCBcdTRFM0FcdTdBN0FcdUZGMENcdTUzRUZcdTgwRkQgZW1pdEZpbGUgXHU2Q0ExXHU2NzA5XHU2MjEwXHU1MjlGXHU2MjY3XHU4ODRDYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDREQgaW1hZ2VNYXAgXHU1MTg1XHU1QkI5OmAsIEFycmF5LmZyb20oaW1hZ2VNYXAuZW50cmllcygpKS5tYXAoKFtrLCB2XSkgPT4gYCR7a30gLT4gJHt2fWApLmpvaW4oJywgJykpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmsuY29kZSkge1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICAgIGxldCBuZXdDb2RlID0gY2h1bmsuY29kZTtcblxuICAgICAgICAgIGZvciAoY29uc3QgW29yaWdpbmFsRmlsZSwgaGFzaGVkRmlsZV0gb2YgaW1hZ2VNYXAuZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBgLyR7b3JpZ2luYWxGaWxlfWA7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFoYXNoZWRGaWxlIFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTMwNVx1NTQyQiBhc3NldHMvIFx1NTI0RFx1N0YwMFx1RkYwQ1x1OTcwMFx1ODk4MVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGhhc2hlZEZpbGUuc3RhcnRzV2l0aCgnYXNzZXRzLycpID8gYC8ke2hhc2hlZEZpbGV9YCA6IGAvJHtoYXNoZWRGaWxlfWA7XG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkUGF0aCA9IG9yaWdpbmFsUGF0aC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuXG4gICAgICAgICAgICBjb25zdCBzdHJpbmdQYXR0ZXJuID0gbmV3IFJlZ0V4cChgKFtcIidcXGBdKSR7ZXNjYXBlZFBhdGh9KFtcIidcXGBdKWAsICdnJyk7XG4gICAgICAgICAgICBpZiAobmV3Q29kZS5pbmNsdWRlcyhvcmlnaW5hbFBhdGgpKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uoc3RyaW5nUGF0dGVybiwgYCQxJHtuZXdQYXRofSQyYCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGNodW5rLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVERDA0IFx1NjZGNFx1NjVCMCAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTU2RkVcdTcyNDdcdTVGMTVcdTc1MjhgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmsudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLmNzcycpICYmIGNodW5rLnNvdXJjZSkge1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICAgIGxldCBuZXdTb3VyY2UgPSB0eXBlb2YgY2h1bmsuc291cmNlID09PSAnc3RyaW5nJyA/IGNodW5rLnNvdXJjZSA6IEJ1ZmZlci5mcm9tKGNodW5rLnNvdXJjZSkudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgICAgICAgICAvLyBcdTk5OTZcdTUxNDhcdTU5MDRcdTc0MDZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMUFcdTY2RkZcdTYzNjJcdTRFM0FcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICAgICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCByb290UGF0aCA9IGAvJHtyb290RmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREIGFzc2V0cyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMDhWaXRlIFx1NTNFRlx1ODBGRFx1NURGMlx1N0VDRlx1NTkwNFx1NzQwNlx1OEZDN1x1RkYwQ1x1NkRGQlx1NTJBMFx1NEU4NiBoYXNoXHVGRjA5XG4gICAgICAgICAgICAvLyBcdTY4M0NcdTVGMEZcdTUzRUZcdTgwRkRcdTY2MkZcdUZGMUEvYXNzZXRzL2xvZ2luX2N1dF9kYXJrLUNoS0Q1VXBvLnBuZyBcdTYyMTYgdXJsKC9hc3NldHMvbG9naW5fY3V0X2RhcmstQ2hLRDVVcG8ucG5nKVxuICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU1MzM5XHU5MTREXHU2NTg3XHU0RUY2XHU1NDBEXHU5MEU4XHU1MjA2XHVGRjA4XHU0RTBEXHU1NDJCXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA5KyBoYXNoICsgXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhvdXRFeHQgPSByb290RmlsZS5yZXBsYWNlKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnx3ZWJwfHN2Z3xpY28pJC9pLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBmaWxlRXh0ID0gcm9vdEZpbGUubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfHdlYnB8c3ZnfGljbykkL2kpPy5bMF0gfHwgJy5wbmcnO1xuICAgICAgICAgICAgLy8gXHU4RjZDXHU0RTQ5XHU3Mjc5XHU2QjhBXHU1QjU3XHU3QjI2XHVGRjBDXHU0RjQ2XHU0RkREXHU3NTU5XHU0RTBCXHU1MjEyXHU3RUJGXG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkRmlsZU5hbWUgPSBmaWxlTmFtZVdpdGhvdXRFeHQucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvYXNzZXRzL1x1NjU4N1x1NEVGNlx1NTQwRC1oYXNoLlx1NjI2OVx1NUM1NVx1NTQwRCBcdTY4M0NcdTVGMEZcdUZGMDhcdTU3MjggdXJsKCkgXHU0RTJEXHU2MjE2XHU3NkY0XHU2M0E1XHU1RjE1XHU3NTI4XHVGRjA5XG4gICAgICAgICAgICBjb25zdCBhc3NldHNQYXR0ZXJuID0gbmV3IFJlZ0V4cChgL2Fzc2V0cy8ke2VzY2FwZWRGaWxlTmFtZX0tW0EtWmEtejAtOV17NCx9JHtmaWxlRXh0LnJlcGxhY2UoJy4nLCAnXFxcXC4nKX1gLCAnZycpO1xuICAgICAgICAgICAgaWYgKGFzc2V0c1BhdHRlcm4udGVzdChuZXdTb3VyY2UpKSB7XG4gICAgICAgICAgICAgIG5ld1NvdXJjZSA9IG5ld1NvdXJjZS5yZXBsYWNlKGFzc2V0c1BhdHRlcm4sIHJvb3RQYXRoKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwIENTUyAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTVGMTVcdTc1Mjg6IC9hc3NldHMvJHtyb290RmlsZX0gLT4gJHtyb290UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEU1Rlx1NTMzOVx1OTE0RFx1NzZGNFx1NjNBNVx1NzY4NFx1NjgzOVx1OERFRlx1NUY4NFx1NUYxNVx1NzUyOFx1RkYwOFx1NURGMlx1N0VDRlx1NjYyRlx1NjgzOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOVx1RkYwOVxuICAgICAgICAgICAgY29uc3Qgcm9vdFBhdHRlcm4gPSBuZXcgUmVnRXhwKGB1cmxcXFxcKFtcIiddPyR7cm9vdFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKX0oXFxcXD9bXlwiJyldKik/W1wiJ10/XFxcXClgLCAnZycpO1xuICAgICAgICAgICAgaWYgKHJvb3RQYXR0ZXJuLnRlc3QobmV3U291cmNlKSkge1xuICAgICAgICAgICAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkZcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTY1MzlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTcxMzZcdTU0MEVcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZcdTU2RkVcdTcyNDdcdUZGMDhcdTVFMjYgaGFzaCBcdTc2ODRcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHU0RTg2XG4gICAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMob3JpZ2luYWxGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzRUZcdTgwRkRcdTVERjJcdTdFQ0ZcdTUzMDVcdTU0MkIgYXNzZXRzLyBcdTUyNERcdTdGMDBcdUZGMENcdTk3MDBcdTg5ODFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IGAvJHtoYXNoZWRGaWxlfWAgOiBgLyR7aGFzaGVkRmlsZX1gO1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1OTFBXHU3OUNEIFVSTCBcdTY4M0NcdTVGMEZcdUZGMUFcbiAgICAgICAgICAgIC8vIDEuIHVybCgvcGF0aCkgLSBcdTY1RTBcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDIuIHVybChcIi9wYXRoXCIpIC0gXHU1M0NDXHU1RjE1XHU1M0Y3XG4gICAgICAgICAgICAvLyAzLiB1cmwoJy9wYXRoJykgLSBcdTUzNTVcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDQuIHVybCgvcGF0aD9xdWVyeSkgLSBcdTVFMjZcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgIGNvbnN0IHVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGB1cmxcXFxcKCR7ZXNjYXBlZFBhdGh9KFxcXFw/W14pXSopP1xcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXChbXCInXSR7ZXNjYXBlZFBhdGh9KFxcXFw/W15cIiddKik/W1wiJ11cXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdXJsUGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChuZXdTb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgbmV3U291cmNlID0gbmV3U291cmNlLnJlcGxhY2UocGF0dGVybiwgKG1hdGNoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaCA9IG1hdGNoLm1hdGNoKC8oXFw/W14pXSopLyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5TWF0Y2ggPyBxdWVyeU1hdGNoWzFdIDogJyc7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShvcmlnaW5hbFBhdGgsIG5ld1BhdGgpLnJlcGxhY2UoL1xcP1teKV0qLywgcXVlcnkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwIENTUyAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1Mjg6ICR7b3JpZ2luYWxQYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGNodW5rLnNvdXJjZSA9IG5ld1NvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKG9wdGlvbnM6IE91dHB1dE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG91dHB1dERpciA9IG9wdGlvbnMuZGlyIHx8IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcpO1xuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5MERcdTUyMzZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTRFMERcdTRGN0ZcdTc1MjhcdTU0QzhcdTVFMENcdTUwM0NcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDlcbiAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwdWJsaWNJbWFnZUZpbGVzLmdldChyb290RmlsZSk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAmJiBleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVEZXN0ID0gam9pbihvdXRwdXREaXIsIHJvb3RGaWxlKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlRGVzdCwgZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNzA1IFx1NURGMlx1NTkwRFx1NTIzNiAke3Jvb3RGaWxlfSBcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTU6ICR7ZmlsZURlc3R9YCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NTkwRFx1NTIzNiAke3Jvb3RGaWxlfSBcdTU5MzFcdThEMjU6YCwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaW1hZ2VNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFzc2V0c0RpclBhdGggPSBqb2luKG91dHB1dERpciwgJ2Fzc2V0cycpO1xuXG4gICAgICBpZiAoIWV4aXN0c1N5bmMoYXNzZXRzRGlyUGF0aCkpIHtcbiAgICAgICAgbWtkaXJTeW5jKGFzc2V0c0RpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmRleEh0bWxQYXRoID0gam9pbihvdXRwdXREaXIsICdpbmRleC5odG1sJyk7XG5cbiAgICAgIGlmIChleGlzdHNTeW5jKGluZGV4SHRtbFBhdGgpKSB7XG4gICAgICAgIGxldCBodG1sID0gcmVhZEZpbGVTeW5jKGluZGV4SHRtbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICAgIGlmIChyb290SW1hZ2VGaWxlcy5pbmNsdWRlcyhvcmlnaW5hbEZpbGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBgLyR7b3JpZ2luYWxGaWxlfWA7XG4gICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvJHtoYXNoZWRGaWxlfWA7XG5cbiAgICAgICAgICBpZiAoaHRtbC5pbmNsdWRlcyhvcmlnaW5hbFBhdGgpKSB7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG5ldyBSZWdFeHAob3JpZ2luYWxQYXRoLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyksICdnJyksIG5ld1BhdGgpO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVERDA0IFx1NjZGNFx1NjVCMCBIVE1MIFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyODogJHtvcmlnaW5hbFBhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICB3cml0ZUZpbGVTeW5jKGluZGV4SHRtbFBhdGgsIGh0bWwsICd1dGYtOCcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFzc2V0c0RpciA9IGpvaW4ob3V0cHV0RGlyLCAnYXNzZXRzJyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhhc3NldHNEaXIpKSB7XG4gICAgICAgIGNvbnN0IGpzRmlsZXMgPSByZWFkZGlyU3luYyhhc3NldHNEaXIpLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy5qcycpIHx8IGYuZW5kc1dpdGgoJy5tanMnKSk7XG4gICAgICAgIGNvbnN0IGNzc0ZpbGVzID0gcmVhZGRpclN5bmMoYXNzZXRzRGlyKS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuY3NzJykpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBbLi4uanNGaWxlcywgLi4uY3NzRmlsZXNdKSB7XG4gICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBqb2luKGFzc2V0c0RpciwgZmlsZSk7XG4gICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gXHU5OTk2XHU1MTQ4XHU1OTA0XHU3NDA2XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjFBXHU2NkZGXHU2MzYyXHU0RTNBXHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gICAgICAgICAgZm9yIChjb25zdCByb290RmlsZSBvZiByb290SW1hZ2VGaWxlcykge1xuICAgICAgICAgICAgY29uc3Qgcm9vdFBhdGggPSBgLyR7cm9vdEZpbGV9YDtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBhc3NldHMgXHU3NkVFXHU1RjU1XHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4XHVGRjA4Vml0ZSBcdTUzRUZcdTgwRkRcdTVERjJcdTdFQ0ZcdTU5MDRcdTc0MDZcdThGQzdcdUZGMENcdTZERkJcdTUyQTBcdTRFODYgaGFzaFx1RkYwOVxuICAgICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHU1M0VGXHU4MEZEXHU2NjJGXHVGRjFBL2Fzc2V0cy9sb2dpbl9jdXRfZGFyay1DaEtENVVwby5wbmdcbiAgICAgICAgICAgIC8vIFx1OTcwMFx1ODk4MVx1NTMzOVx1OTE0RFx1NjU4N1x1NEVGNlx1NTQwRFx1OTBFOFx1NTIwNlx1RkYwOFx1NEUwRFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOSsgaGFzaCArIFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWVXaXRob3V0RXh0ID0gcm9vdEZpbGUucmVwbGFjZSgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8d2VicHxzdmd8aWNvKSQvaSwgJycpO1xuICAgICAgICAgICAgY29uc3QgZmlsZUV4dCA9IHJvb3RGaWxlLm1hdGNoKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnx3ZWJwfHN2Z3xpY28pJC9pKT8uWzBdIHx8ICcucG5nJztcbiAgICAgICAgICAgIC8vIFx1OEY2Q1x1NEU0OVx1NzI3OVx1NkI4QVx1NUI1N1x1N0IyNlx1RkYwQ1x1NEY0Nlx1NEZERFx1NzU1OVx1NEUwQlx1NTIxMlx1N0VCRlxuICAgICAgICAgICAgY29uc3QgZXNjYXBlZEZpbGVOYW1lID0gZmlsZU5hbWVXaXRob3V0RXh0LnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgL2Fzc2V0cy9cdTY1ODdcdTRFRjZcdTU0MEQtaGFzaC5cdTYyNjlcdTVDNTVcdTU0MEQgXHU2ODNDXHU1RjBGXG4gICAgICAgICAgICBjb25zdCBhc3NldHNQYXR0ZXJuID0gbmV3IFJlZ0V4cChgL2Fzc2V0cy8ke2VzY2FwZWRGaWxlTmFtZX0tW0EtWmEtejAtOV17NCx9JHtmaWxlRXh0LnJlcGxhY2UoJy4nLCAnXFxcXC4nKX1gLCAnZycpO1xuICAgICAgICAgICAgaWYgKGFzc2V0c1BhdHRlcm4udGVzdChjb250ZW50KSkge1xuICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGFzc2V0c1BhdHRlcm4sIHJvb3RQYXRoKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwICR7ZmlsZX0gXHU0RTJEXHU3Njg0XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHU1RjE1XHU3NTI4OiAvYXNzZXRzLyR7cm9vdEZpbGV9IC0+ICR7cm9vdFBhdGh9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU3MTM2XHU1NDBFXHU1OTA0XHU3NDA2XHU1MTc2XHU0RUQ2XHU1NkZFXHU3MjQ3XHVGRjA4XHU1RTI2IGhhc2ggXHU3Njg0XHVGRjA5XG4gICAgICAgICAgZm9yIChjb25zdCBbb3JpZ2luYWxGaWxlLCBoYXNoZWRGaWxlXSBvZiBpbWFnZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYwQ1x1NURGMlx1N0VDRlx1NTkwNFx1NzQwNlx1OEZDN1x1NEU4NlxuICAgICAgICAgICAgaWYgKHJvb3RJbWFnZUZpbGVzLmluY2x1ZGVzKG9yaWdpbmFsRmlsZSkpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IGAvJHtvcmlnaW5hbEZpbGV9YDtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWhhc2hlZEZpbGUgXHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0XHU4REVGXHU1Rjg0XHVGRjA4XHU1OTgyIGFzc2V0cy9sb2dpbl9jdXRfZGFyay1DaEtENVVwby5wbmdcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1OTcwMFx1ODk4MVx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NEVFNSAvIFx1NUYwMFx1NTkzNFxuICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGhhc2hlZEZpbGUuc3RhcnRzV2l0aCgnYXNzZXRzLycpID8gYC8ke2hhc2hlZEZpbGV9YCA6IGAvJHtoYXNoZWRGaWxlfWA7XG5cbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRQYXRoID0gb3JpZ2luYWxQYXRoLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNERcdTU5MUFcdTc5Q0RcdTY4M0NcdTVGMEZcdUZGMENcdTUzMDVcdTYyRUNcdTVFMjZcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdTc2ODRcbiAgICAgICAgICAgIC8vIFx1NEY3Rlx1NzUyOFx1NUI1N1x1N0IyNlx1NEUzMlx1NjJGQ1x1NjNBNVx1OTA3Rlx1NTE0RFx1NkEyMVx1Njc3Rlx1NUI1N1x1N0IyNlx1NEUzMlx1NEUyRFx1NzY4NFx1NTNDRFx1NUYxNVx1NTNGN1x1OEY2Q1x1NEU0OVx1OTVFRVx1OTg5OFxuICAgICAgICAgICAgY29uc3QgYmFja3RpY2sgPSAnYCc7XG4gICAgICAgICAgICBjb25zdCBxdW90ZVBhdHRlcm4gPSAnW1wiXFwnJyArIGJhY2t0aWNrICsgJ10nO1xuICAgICAgICAgICAgY29uc3QgbmVnYXRlZFF1b3RlUGF0dGVybiA9ICdbXlwiJyArIFwiJ1wiICsgYmFja3RpY2sgKyAnXSc7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cCgnKCcgKyBxdW90ZVBhdHRlcm4gKyAnKScgKyBlc2NhcGVkUGF0aCArICcoXFxcXD8nICsgbmVnYXRlZFF1b3RlUGF0dGVybiArICcqKT8oJyArIHF1b3RlUGF0dGVybiArICcpJywgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXCgke2VzY2FwZWRQYXRofShcXFxcP1teKV0qKT9cXFxcKWAsICdnJyksXG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAoYHVybFxcXFwoWydcIl0ke2VzY2FwZWRQYXRofShcXFxcP1teXCInXSopP1snXCJdXFxcXClgLCAnZycpLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBpZiAocGF0dGVybi5zb3VyY2UuaW5jbHVkZXMoJ3VybCcpKSB7XG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKHBhdHRlcm4sIChtYXRjaCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdUZGMDhcdTU5ODJcdTY3OUNcdTY3MDlcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaCA9IG1hdGNoLm1hdGNoKC8oXFw/W14pXSopLyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlNYXRjaCA/IHF1ZXJ5TWF0Y2hbMV0gOiAnJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoLnJlcGxhY2Uob3JpZ2luYWxQYXRoLCBuZXdQYXRoKS5yZXBsYWNlKC9cXD9bXildKi8sIHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTVCRjlcdTRFOEVcdTVCNTdcdTdCMjZcdTRFMzJcdTVGMTVcdTc1MjhcdUZGMENcdTRFNUZcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTE6IHN0cmluZywgX3BhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcXVvdGUyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlMX0ke25ld1BhdGh9JHtxdWVyeSB8fCAnJ30ke3F1b3RlMn1gO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwICR7ZmlsZX0gXHU0RTJEXHU3Njg0XHU1RjE1XHU3NTI4OiAke29yaWdpbmFsUGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgaWYgKGltYWdlTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvdXRwdXREaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcblxuICAgICAgZm9yIChjb25zdCBbb3JpZ2luYWxGaWxlLCBoYXNoZWRGaWxlXSBvZiBpbWFnZU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1NzI4IGFzc2V0cyBcdTc2RUVcdTVGNTVcdTYyMTZcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gam9pbihvdXRwdXREaXIsIGhhc2hlZEZpbGUpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhleHBlY3RlZFBhdGgpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNzA1IFx1NjU4N1x1NEVGNlx1NURGMlx1NkI2M1x1Nzg2RVx1NzUxRlx1NjIxMDogJHtoYXNoZWRGaWxlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVx1RkYwOFx1NTk4Mlx1Njc5QyBoYXNoZWRGaWxlIFx1NEUwRFx1NTMwNVx1NTQyQiBhc3NldHMvXHVGRjA5XG4gICAgICAgICAgY29uc3Qgcm9vdFBhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKVxuICAgICAgICAgICAgPyBqb2luKG91dHB1dERpciwgaGFzaGVkRmlsZS5yZXBsYWNlKCdhc3NldHMvJywgJycpKVxuICAgICAgICAgICAgOiBqb2luKG91dHB1dERpciwgaGFzaGVkRmlsZSk7XG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMocm9vdFBhdGgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU2NTg3XHU0RUY2XHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1OiAke2hhc2hlZEZpbGUucmVwbGFjZSgnYXNzZXRzLycsICcnKX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4OiAke2hhc2hlZEZpbGV9IChcdTUzOUZcdTU5Q0JcdTY1ODdcdTRFRjY6ICR7b3JpZ2luYWxGaWxlfSlgKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSAgIFx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NDogJHtleHBlY3RlZFBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gICBcdTY4QzBcdTY3RTVcdThERUZcdTVGODQ6ICR7cm9vdFBhdGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvdXJjZS1wcmVsb2FkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc291cmNlLXByZWxvYWQudHNcIjsvKipcbiAqIFx1OEQ0NFx1NkU5MFx1OTg4NFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlxuICogXHU0RTNBXHU1MTczXHU5NTJFXHU4RDQ0XHU2RTkwXHVGRjA4aW5kZXguanNcdTMwMDFlcHMtc2VydmljZS5qc1x1MzAwMUNTU1x1RkYwOVx1NkRGQlx1NTJBMCBwcmVsb2FkL21vZHVsZXByZWxvYWQgXHU5NEZFXHU2M0E1XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc291cmNlUHJlbG9hZFBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjcml0aWNhbFJlc291cmNlczogQXJyYXk8eyBocmVmOiBzdHJpbmc7IGFzPzogc3RyaW5nOyByZWw6IHN0cmluZyB9PiA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Jlc291cmNlLXByZWxvYWQnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QganNDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpIHx8IGZpbGUuZW5kc1dpdGgoJy5tanMnKSk7XG4gICAgICBjb25zdCBjc3NDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgIGNvbnN0IGdldFJlc291cmNlSHJlZiA9IChjaHVua05hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgIGlmIChjaHVua05hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgcmV0dXJuIGAvJHtjaHVua05hbWV9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYC9hc3NldHMvJHtjaHVua05hbWV9YDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgaW5kZXhDaHVuayA9IGpzQ2h1bmtzLmZpbmQoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdpbmRleC0nKSk7XG4gICAgICBpZiAoaW5kZXhDaHVuaykge1xuICAgICAgICBjcml0aWNhbFJlc291cmNlcy5wdXNoKHtcbiAgICAgICAgICBocmVmOiBnZXRSZXNvdXJjZUhyZWYoaW5kZXhDaHVuayksXG4gICAgICAgICAgcmVsOiAnbW9kdWxlcHJlbG9hZCcsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlcHNTZXJ2aWNlQ2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnZXBzLXNlcnZpY2UtJykpO1xuICAgICAgaWYgKGVwc1NlcnZpY2VDaHVuaykge1xuICAgICAgICBjcml0aWNhbFJlc291cmNlcy5wdXNoKHtcbiAgICAgICAgICBocmVmOiBnZXRSZXNvdXJjZUhyZWYoZXBzU2VydmljZUNodW5rKSxcbiAgICAgICAgICByZWw6ICdtb2R1bGVwcmVsb2FkJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNzc0NodW5rcy5mb3JFYWNoKGNzc0NodW5rID0+IHtcbiAgICAgICAgY3JpdGljYWxSZXNvdXJjZXMucHVzaCh7XG4gICAgICAgICAgaHJlZjogZ2V0UmVzb3VyY2VIcmVmKGNzc0NodW5rKSxcbiAgICAgICAgICByZWw6ICdwcmVsb2FkJyxcbiAgICAgICAgICBhczogJ3N0eWxlJyxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICBpZiAoY3JpdGljYWxSZXNvdXJjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcmVsb2FkTGlua3MgPSBjcml0aWNhbFJlc291cmNlc1xuICAgICAgICAubWFwKHJlc291cmNlID0+IHtcbiAgICAgICAgICBpZiAocmVzb3VyY2UucmVsID09PSAnbW9kdWxlcHJlbG9hZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBgICAgIDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIiBocmVmPVwiJHtyZXNvdXJjZS5ocmVmfVwiIC8+YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAgICAgPGxpbmsgcmVsPVwicHJlbG9hZFwiIGhyZWY9XCIke3Jlc291cmNlLmhyZWZ9XCIgYXM9XCIke3Jlc291cmNlLmFzIHx8ICdzY3JpcHQnfVwiIC8+YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCdcXG4nKTtcblxuICAgICAgaWYgKGh0bWwuaW5jbHVkZXMoJzwvaGVhZD4nKSkge1xuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKCc8L2hlYWQ+JywgYCR7cHJlbG9hZExpbmtzfVxcbjwvaGVhZD5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdW5pZmllZC1lbnYtY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnLnRzXCI7LyoqXG4gKiBcdTdFREZcdTRFMDBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdTdDRkJcdTdFREZcbiAqIFx1NjUyRlx1NjMwMVx1OTAxQVx1OEZDNyAuZW52IFx1NTIwN1x1NjM2Mlx1OTE0RFx1N0Y2RVx1NjVCOVx1Njg0OFx1RkYwQ1x1NEY0Nlx1NTE4NVx1OTBFOFx1ODlDNFx1NTIxOVx1NEUwRFx1NTNEOFxuICovXG5cbmltcG9ydCB7IGdldEFsbEFwcHMsIGdldEFwcEJ5SWQgfSBmcm9tICcuL2FwcC1zY2FubmVyJztcbmltcG9ydCB7IGdldEFsbERldlBvcnRzLCBnZXRBbGxQcmVQb3J0cywgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi9hcHAtZW52LmNvbmZpZyc7XG5cbmV4cG9ydCB0eXBlIEVudmlyb25tZW50ID0gJ2RldmVsb3BtZW50JyB8ICdwcmV2aWV3JyB8ICdwcm9kdWN0aW9uJztcbmV4cG9ydCB0eXBlIENvbmZpZ1NjaGVtZSA9ICdkZWZhdWx0JyB8ICdjdXN0b20nOyAvLyBcdTUzRUZcdTRFRTVcdTkwMUFcdThGQzcgLmVudiBcdTUyMDdcdTYzNjJcblxuZXhwb3J0IGludGVyZmFjZSBFbnZpcm9ubWVudENvbmZpZyB7XG4gIC8vIEFQSSBcdTkxNERcdTdGNkVcbiAgYXBpOiB7XG4gICAgYmFzZVVSTDogc3RyaW5nO1xuICAgIHRpbWVvdXQ6IG51bWJlcjtcbiAgICBiYWNrZW5kVGFyZ2V0Pzogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFx1NUZBRVx1NTI0RFx1N0FFRlx1OTE0RFx1N0Y2RVxuICBtaWNyb0FwcDoge1xuICAgIGJhc2VVUkw6IHN0cmluZztcbiAgICBlbnRyeVByZWZpeDogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFx1NjU4N1x1Njg2M1x1OTE0RFx1N0Y2RVxuICBkb2NzOiB7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgcG9ydDogc3RyaW5nO1xuICB9O1xuXG4gIC8vIFdlYlNvY2tldCBcdTkxNERcdTdGNkVcbiAgd3M6IHtcbiAgICB1cmw6IHN0cmluZztcbiAgfTtcblxuICAvLyBcdTRFMEFcdTRGMjBcdTkxNERcdTdGNkVcbiAgdXBsb2FkOiB7XG4gICAgdXJsOiBzdHJpbmc7XG4gIH07XG59XG5cbi8vIFx1OTE0RFx1N0Y2RVx1NjVCOVx1Njg0OFx1RkYxQVx1N0M3Qlx1NEYzQyBFbGVtZW50IFBsdXMgXHU0RTNCXHU5ODk4XG5jb25zdCBjb25maWdTY2hlbWVzOiBSZWNvcmQ8Q29uZmlnU2NoZW1lLCBSZWNvcmQ8RW52aXJvbm1lbnQsIEVudmlyb25tZW50Q29uZmlnPj4gPSB7XG4gIGRlZmF1bHQ6IHtcbiAgICBkZXZlbG9wbWVudDoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICAgIGJhY2tlbmRUYXJnZXQ6ICdodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICAgIH0sXG4gICAgICBtaWNyb0FwcDoge1xuICAgICAgICBiYXNlVVJMOiAnLy8xMC44MC44LjE5OScsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJyxcbiAgICAgIH0sXG4gICAgICBkb2NzOiB7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE3MicsXG4gICAgICAgIHBvcnQ6ICc0MTcyJyxcbiAgICAgIH0sXG4gICAgICB3czoge1xuICAgICAgICB1cmw6ICd3czovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICB9LFxuICAgICAgdXBsb2FkOiB7XG4gICAgICAgIHVybDogJy9hcGkvdXBsb2FkJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBhcGk6IHtcbiAgICAgICAgYmFzZVVSTDogJy9hcGknLFxuICAgICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICAgIH0sXG4gICAgICBtaWNyb0FwcDoge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdCcsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnL2luZGV4Lmh0bWwnLFxuICAgICAgfSxcbiAgICAgIGRvY3M6IHtcbiAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo0MTczJyxcbiAgICAgICAgcG9ydDogJzQxNzMnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzOi8vbG9jYWxob3N0OjgxMTUnLFxuICAgICAgfSxcbiAgICAgIHVwbG9hZDoge1xuICAgICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHBzOi8vYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIHBvcnQ6ICcnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzczovL2FwaS5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBjdXN0b206IHtcbiAgICAvLyBcdTUzRUZcdTRFRTVcdTkwMUFcdThGQzcgLmVudiBcdTVCOUFcdTRFNDlcdTgxRUFcdTVCOUFcdTRFNDlcdTkxNERcdTdGNkVcdTY1QjlcdTY4NDhcbiAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUZcdTRFRTVcdTYyNjlcdTVDNTVcdTUxNzZcdTRFRDZcdTkxNERcdTdGNkVcdTY1QjlcdTY4NDhcbiAgICBkZXZlbG9wbWVudDoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICAgIGJhY2tlbmRUYXJnZXQ6ICdodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICAgIH0sXG4gICAgICBtaWNyb0FwcDoge1xuICAgICAgICBiYXNlVVJMOiAnLy8xMC44MC44LjE5OScsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJyxcbiAgICAgIH0sXG4gICAgICBkb2NzOiB7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE3MicsXG4gICAgICAgIHBvcnQ6ICc0MTcyJyxcbiAgICAgIH0sXG4gICAgICB3czoge1xuICAgICAgICB1cmw6ICd3czovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgICB9LFxuICAgICAgdXBsb2FkOiB7XG4gICAgICAgIHVybDogJy9hcGkvdXBsb2FkJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBhcGk6IHtcbiAgICAgICAgYmFzZVVSTDogJy9hcGknLFxuICAgICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICAgIH0sXG4gICAgICBtaWNyb0FwcDoge1xuICAgICAgICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdCcsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnL2luZGV4Lmh0bWwnLFxuICAgICAgfSxcbiAgICAgIGRvY3M6IHtcbiAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo0MTczJyxcbiAgICAgICAgcG9ydDogJzQxNzMnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzOi8vbG9jYWxob3N0OjgxMTUnLFxuICAgICAgfSxcbiAgICAgIHVwbG9hZDoge1xuICAgICAgICB1cmw6ICcvYXBpL3VwbG9hZCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgYXBpOiB7XG4gICAgICAgIGJhc2VVUkw6ICcvYXBpJyxcbiAgICAgICAgdGltZW91dDogMzAwMDAsXG4gICAgICB9LFxuICAgICAgbWljcm9BcHA6IHtcbiAgICAgICAgYmFzZVVSTDogJ2h0dHBzOi8vYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIGVudHJ5UHJlZml4OiAnJywgLy8gXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICB9LFxuICAgICAgZG9jczoge1xuICAgICAgICB1cmw6ICdodHRwczovL2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gICAgICAgIHBvcnQ6ICcnLFxuICAgICAgfSxcbiAgICAgIHdzOiB7XG4gICAgICAgIHVybDogJ3dzczovL2FwaS5iZWxsaXMuY29tLmNuJyxcbiAgICAgIH0sXG4gICAgICB1cGxvYWQ6IHtcbiAgICAgICAgdXJsOiAnL2FwaS91cGxvYWQnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTkxNERcdTdGNkVcdTY1QjlcdTY4NDhcdUZGMDhcdTRFQ0UgLmVudiBcdThCRkJcdTUzRDZcdUZGMENcdTlFRDhcdThCQTQgZGVmYXVsdFx1RkYwOVxuICovXG5mdW5jdGlvbiBnZXRDb25maWdTY2hlbWUoKTogQ29uZmlnU2NoZW1lIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU1NzI4IE5vZGUuanMgXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDaW1wb3J0Lm1ldGEuZW52IFx1NTNFRlx1ODBGRFx1NjcyQVx1NUI5QVx1NEU0OVxuICBpZiAodHlwZW9mIGltcG9ydC5tZXRhID09PSAndW5kZWZpbmVkJyB8fCAhaW1wb3J0Lm1ldGEuZW52KSB7XG4gICAgcmV0dXJuICdkZWZhdWx0JztcbiAgfVxuICByZXR1cm4gKGltcG9ydC5tZXRhLmVudi5WSVRFX0NPTkZJR19TQ0hFTUUgYXMgQ29uZmlnU2NoZW1lKSB8fCAnZGVmYXVsdCc7XG59XG5cbi8qKlxuICogXHU2OEMwXHU2RDRCXHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnZpcm9ubWVudCgpOiBFbnZpcm9ubWVudCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIFx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwOFx1NTk4MiBWaXRlIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwOVx1RkYwQ2ltcG9ydC5tZXRhLmVudiBcdTUzRUZcdTgwRkRcdTY3MkFcdTVCOUFcdTRFNDlcbiAgICAvLyBcdTRGN0ZcdTc1MjhcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMENcdTYzRDBcdTRGOUJcdTU0MEVcdTU5MDdcdTY1QjlcdTY4NDhcbiAgICBjb25zdCBwcm9kRmxhZyA9XG4gICAgICAodHlwZW9mIGltcG9ydC5tZXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbXBvcnQubWV0YS5lbnYgJiYgaW1wb3J0Lm1ldGEuZW52LlBST0QpID8/XG4gICAgICAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyk7XG4gICAgcmV0dXJuIHByb2RGbGFnID8gJ3Byb2R1Y3Rpb24nIDogJ2RldmVsb3BtZW50JztcbiAgfVxuXG4gIGNvbnN0IGhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lO1xuICBjb25zdCBwb3J0ID0gd2luZG93LmxvY2F0aW9uLnBvcnQgfHwgJyc7XG5cbiAgaWYgKGhvc3RuYW1lLmluY2x1ZGVzKCdiZWxsaXMuY29tLmNuJykpIHtcbiAgICByZXR1cm4gJ3Byb2R1Y3Rpb24nO1xuICB9XG5cbiAgaWYgKGdldEFsbFByZVBvcnRzKCkuaW5jbHVkZXMocG9ydCkpIHtcbiAgICByZXR1cm4gJ3ByZXZpZXcnO1xuICB9XG5cbiAgaWYgKGdldEFsbERldlBvcnRzKCkuaW5jbHVkZXMocG9ydCkpIHtcbiAgICByZXR1cm4gJ2RldmVsb3BtZW50JztcbiAgfVxuXG4gIC8vIFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1RkYxQVx1OTYzMlx1NUZBMVx1NjAyN1x1NTczMFx1OEJCRlx1OTVFRSBpbXBvcnQubWV0YS5lbnZcbiAgY29uc3QgcHJvZEZsYWcgPVxuICAgICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuUFJPRCkgPz9cbiAgICBmYWxzZTtcbiAgcmV0dXJuIHByb2RGbGFnID8gJ3Byb2R1Y3Rpb24nIDogJ2RldmVsb3BtZW50Jztcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTczQUZcdTU4ODNcdTc2ODRcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudkNvbmZpZygpOiBFbnZpcm9ubWVudENvbmZpZyB7XG4gIGNvbnN0IHNjaGVtZSA9IGdldENvbmZpZ1NjaGVtZSgpO1xuICBjb25zdCBlbnYgPSBnZXRFbnZpcm9ubWVudCgpO1xuICByZXR1cm4gY29uZmlnU2NoZW1lc1tzY2hlbWVdW2Vudl07XG59XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4XHU3RURGXHU0RTAwXHU4OUM0XHU1MjE5XHVGRjBDXHU1N0ZBXHU0RThFXHU1RTk0XHU3NTI4XHU4RUFCXHU0RUZEXHU5MTREXHU3RjZFXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01haW5BcHAoXG4gIHJvdXRlUGF0aD86IHN0cmluZyxcbiAgbG9jYXRpb25QYXRoPzogc3RyaW5nLFxuICBpc1N0YW5kYWxvbmU/OiBib29sZWFuXG4pOiBib29sZWFuIHtcbiAgLy8gXHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHU2NUY2XG4gIGlmIChpc1N0YW5kYWxvbmUgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ3dpbmRvdyBcdTY3MkFcdTVCOUFcdTRFNDlcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwOFx1NTk4MiBWaXRlIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwOVx1RkYwQ1x1OUVEOFx1OEJBNFx1OEZENFx1NTZERSB0cnVlXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA5XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgcWlhbmt1bldpbmRvdyA9ICh3aW5kb3cgYXMgYW55KS5fX1BPV0VSRURfQllfUUlBTktVTl9fO1xuICAgIGlzU3RhbmRhbG9uZSA9ICFxaWFua3VuV2luZG93O1xuICB9XG5cbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgLy8gXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IGxvY2F0aW9uUGF0aFx1RkYwOFx1NUI4Q1x1NjU3NFx1OERFRlx1NUY4NFx1RkYwOVx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEY3Rlx1NzUyOCByb3V0ZVBhdGhcdUZGMENcdTY3MDBcdTU0MEVcdTRGN0ZcdTc1Mjggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIGNvbnN0IHBhdGggPSBsb2NhdGlvblBhdGggfHwgcm91dGVQYXRoIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA6ICcnKTtcblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTUzNzNcdTRGN0YgaXNTdGFuZGFsb25lIFx1NEUzQSB0cnVlXHVGRjBDXHU0RTVGXHU4OTgxXHU2OEMwXHU2N0U1XHU4REVGXHU1Rjg0XHU2NjJGXHU1NDI2XHU1MzM5XHU5MTREXHU1QjUwXHU1RTk0XHU3NTI4XG4gIC8vIFx1NTZFMFx1NEUzQVx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NEY3Rlx1NzUyOFx1NTQwQ1x1NEUwMFx1NEUyQVx1N0FFRlx1NTNFM1x1RkYwODgwODBcdUZGMDlcdUZGMENcdTk3MDBcdTg5ODFcdTkwMUFcdThGQzdcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTUyMjRcdTY1QURcbiAgaWYgKGlzU3RhbmRhbG9uZSAmJiBlbnYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAvLyBcdTUxNDhcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY2MkZcdTc2N0JcdTVGNTVcdTdCNDlcdTUxNkNcdTVGMDBcdTk4NzVcdTk3NjJcbiAgICBpZiAocGF0aCA9PT0gJy9sb2dpbicgfHwgcGF0aCA9PT0gJy9mb3JnZXQtcGFzc3dvcmQnIHx8IHBhdGggPT09ICcvcmVnaXN0ZXInKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU4REVGXHU1Rjg0XHU2NjJGXHU1NDI2XHU1MzM5XHU5MTREXHU0RUZCXHU0RjU1XHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHBhdGhQcmVmaXhcbiAgICBjb25zdCBhcHBzID0gZ2V0QWxsQXBwcygpO1xuICAgIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpIHtcbiAgICAgIGlmIChhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLmVuYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGhQcmVmaXggPSBhcHAucGF0aFByZWZpeC5lbmRzV2l0aCgnLycpXG4gICAgICAgICAgPyBhcHAucGF0aFByZWZpeC5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGFwcC5wYXRoUHJlZml4O1xuICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHBhdGguZW5kc1dpdGgoJy8nKSAmJiBwYXRoICE9PSAnLydcbiAgICAgICAgICA/IHBhdGguc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBwYXRoO1xuXG4gICAgICAgIC8vIFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1NjIxNlx1OERFRlx1NUY4NFx1NTI0RFx1N0YwMFx1NTMzOVx1OTE0RFxuICAgICAgICBpZiAobm9ybWFsaXplZFBhdGggPT09IG5vcm1hbGl6ZWRQYXRoUHJlZml4IHx8IG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgobm9ybWFsaXplZFBhdGhQcmVmaXggKyAnLycpKSB7XG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1MjMwXHU1QjUwXHU1RTk0XHU3NTI4XHVGRjBDXHU0RTBEXHU2NjJGXHU0RTNCXHU1RTk0XHU3NTI4XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MzM5XHU5MTREXHU1MjMwXHU1QjUwXHU1RTk0XHU3NTI4XHVGRjBDXHU1MjI0XHU2NUFEXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBcdTk3NUVcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTc2ODRcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdTZBMjFcdTVGMEZcdUZGMDhcdTU5ODJcdTk4ODRcdTg5QzgvXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU3Njg0XHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHVGRjA5XG4gIGlmIChpc1N0YW5kYWxvbmUpIHtcbiAgICBpZiAocGF0aCA9PT0gJy9sb2dpbicgfHwgcGF0aCA9PT0gJy9mb3JnZXQtcGFzc3dvcmQnIHx8IHBhdGggPT09ICcvcmVnaXN0ZXInKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gcWlhbmt1biBcdTZBMjFcdTVGMEZcdTRFMEJcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTk3NUVcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdUZGMDlcbiAgY29uc3QgaG9zdG5hbWUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA6ICcnO1xuXG4gIGlmIChwYXRoID09PSAnL2xvZ2luJyB8fCBwYXRoID09PSAnL2ZvcmdldC1wYXNzd29yZCcgfHwgcGF0aCA9PT0gJy9yZWdpc3RlcicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTkwMUFcdThGQzdcdTVCNTBcdTU3REZcdTU0MERcdTUyMjRcdTY1QURcdUZGMDhcdTU3RkFcdTRFOEVcdTVFOTRcdTc1MjhcdThFQUJcdTRFRkRcdTkxNERcdTdGNkVcdUZGMDlcbiAgaWYgKGVudiA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgY29uc3QgYXBwID0gZ2V0QWxsQXBwcygpLmZpbmQoYSA9PiBhLnN1YmRvbWFpbiA9PT0gaG9zdG5hbWUpO1xuICAgIGlmIChhcHAgJiYgYXBwLnR5cGUgPT09ICdzdWInKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gXHU1RjAwXHU1M0QxL1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1RkYxQVx1OTAxQVx1OEZDN1x1OERFRlx1NUY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1NTdGQVx1NEU4RVx1NUU5NFx1NzUyOFx1OEVBQlx1NEVGRFx1OTE0RFx1N0Y2RVx1RkYwOVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTRFMkFcdTdBRUZcdTUzRTNcdUZGMDg4MDgwXHVGRjA5XHVGRjBDXHU2MjQwXHU0RUU1XHU1M0VBXHU4MEZEXHU5MDFBXHU4RkM3XHU4REVGXHU1Rjg0XHU1MjREXHU3RjAwXHU1MjI0XHU2NUFEXG4gIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1OERFRlx1NUY4NFx1RkYxQS9kYXRhLy4uLlx1MzAwMS9wcm9maWxlIFx1N0I0OVxuICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdThERUZcdTVGODRcdUZGMUEvbG9naXN0aWNzLy4uLlx1MzAwMS9hZG1pbi8uLi4gXHU3QjQ5XG4gIGNvbnN0IGFwcHMgPSBnZXRBbGxBcHBzKCk7XG5cbiAgLy8gXHU1MTQ4XHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XHU4REVGXHU1Rjg0XHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHBhdGhQcmVmaXggXHU0RjE4XHU1MTQ4XHU3RUE3XHU2NkY0XHU5QUQ4XHVGRjA5XG4gIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpIHtcbiAgICBpZiAoYXBwLnR5cGUgPT09ICdzdWInICYmIGFwcC5lbmFibGVkKSB7XG4gICAgICAvLyBcdTY1MkZcdTYzMDEgcGF0aFByZWZpeCBcdTVFMjZcdTYyMTZcdTRFMERcdTVFMjZcdTVDM0VcdTkwRThcdTY1OUNcdTY3NjBcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoUHJlZml4ID0gYXBwLnBhdGhQcmVmaXguZW5kc1dpdGgoJy8nKVxuICAgICAgICA/IGFwcC5wYXRoUHJlZml4LnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGFwcC5wYXRoUHJlZml4O1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICAgID8gcGF0aC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBwYXRoO1xuXG4gICAgICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdTYyMTZcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcbiAgICAgIC8vIFx1NEY4Qlx1NTk4Mlx1RkYxQS9sb2dpc3RpY3MgXHU2MjE2IC9sb2dpc3RpY3Mvd2FyZWhvdXNlL2ludmVudG9yeS9pbmZvIFx1OTBGRFx1NTMzOVx1OTE0RFx1NzI2OVx1NkQ0MVx1NUU5NFx1NzUyOFxuICAgICAgY29uc3QgaXNNYXRjaCA9IG5vcm1hbGl6ZWRQYXRoID09PSBub3JtYWxpemVkUGF0aFByZWZpeCB8fCBub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKG5vcm1hbGl6ZWRQYXRoUHJlZml4ICsgJy8nKTtcblxuICAgICAgaWYgKGlzTWF0Y2gpIHtcbiAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1MjMwXHU1QjUwXHU1RTk0XHU3NTI4XHVGRjBDXHU0RTBEXHU2NjJGXHU0RTNCXHU1RTk0XHU3NTI4XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggbGF5b3V0LWFwcCBcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTY2MkZcdTY4MzlcdThERUZcdTVGODQgJy8nXHVGRjBDXHU0RjQ2XHU1QjlFXHU5NjQ1IGxvY2F0aW9uUGF0aCBcdTY2MkZcdTVCNTBcdTVFOTRcdTc1MjhcdThERUZcdTVGODRcdUZGMENcbiAgLy8gXHU5NzAwXHU4OTgxXHU1MThEXHU2QjIxXHU2OEMwXHU2N0U1IGxvY2F0aW9uUGF0aFx1RkYwOFx1NTZFMFx1NEUzQSByb3V0ZS5wYXRoIFx1NTNFRlx1ODBGRFx1NjYyRiAnLydcdUZGMENcdTRGNDYgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lIFx1NjYyRlx1NUI1MFx1NUU5NFx1NzUyOFx1OERFRlx1NUY4NFx1RkYwOVxuICBpZiAocGF0aCA9PT0gJy8nICYmIGxvY2F0aW9uUGF0aCAmJiBsb2NhdGlvblBhdGggIT09ICcvJykge1xuICAgIC8vIFx1NEY3Rlx1NzUyOCBsb2NhdGlvblBhdGggXHU5MUNEXHU2NUIwXHU2OEMwXHU2N0U1XG4gICAgY29uc3Qgbm9ybWFsaXplZExvY2F0aW9uUGF0aCA9IGxvY2F0aW9uUGF0aC5lbmRzV2l0aCgnLycpICYmIGxvY2F0aW9uUGF0aCAhPT0gJy8nXG4gICAgICA/IGxvY2F0aW9uUGF0aC5zbGljZSgwLCAtMSlcbiAgICAgIDogbG9jYXRpb25QYXRoO1xuICAgIFxuICAgIGZvciAoY29uc3QgYXBwIG9mIGFwcHMpIHtcbiAgICAgIGlmIChhcHAudHlwZSA9PT0gJ3N1YicgJiYgYXBwLmVuYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGhQcmVmaXggPSBhcHAucGF0aFByZWZpeC5lbmRzV2l0aCgnLycpXG4gICAgICAgICAgPyBhcHAucGF0aFByZWZpeC5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGFwcC5wYXRoUHJlZml4O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaXNNYXRjaCA9IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGggPT09IG5vcm1hbGl6ZWRQYXRoUHJlZml4IHx8IG5vcm1hbGl6ZWRMb2NhdGlvblBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUGF0aFByZWZpeCArICcvJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTIzMFx1NUI1MFx1NUU5NFx1NzUyOFx1RkYwQ1x1NEUwRFx1NjYyRlx1NEUzQlx1NUU5NFx1NzUyOFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTMzOVx1OTE0RFx1NTIzMFx1NUI1MFx1NUU5NFx1NzUyOFx1RkYwQ1x1NTIyNFx1NjVBRFx1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFxuICAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdTc2ODQgcGF0aFByZWZpeCBcdTY2MkYgJy8nXHVGRjBDXHU2MjQwXHU0RUU1XHU2MjQwXHU2NzA5XHU0RTBEXHU1MzM5XHU5MTREXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0XHU4REVGXHU1Rjg0XHU5MEZEXHU2NjJGXHU0RTNCXHU1RTk0XHU3NTI4XHU4REVGXHU1Rjg0XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NkZDMFx1NkQzQlx1NzY4NFx1NUI1MFx1NUU5NFx1NzUyOFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFN1YkFwcCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgcGF0aCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lIDogJyc7XG4gIGNvbnN0IGhvc3RuYW1lID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgOiAnJztcblxuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTkwMUFcdThGQzdcdTVCNTBcdTU3REZcdTU0MERcdTUyMjRcdTY1QURcbiAgaWYgKGVudiA9PT0gJ3Byb2R1Y3Rpb24nICYmIGhvc3RuYW1lKSB7XG4gICAgY29uc3QgYXBwID0gZ2V0QWxsQXBwcygpLmZpbmQoYSA9PiBhLnN1YmRvbWFpbiA9PT0gaG9zdG5hbWUpO1xuICAgIHJldHVybiBhcHA/LmlkIHx8IG51bGw7XG4gIH1cblxuICAvLyBcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHVGRjFBXHU5MDFBXHU4RkM3XHU4REVGXHU1Rjg0XHU1MjI0XHU2NUFEXHVGRjA4XHU0RTBFIGlzTWFpbkFwcCBcdTRGN0ZcdTc1MjhcdTc2RjhcdTU0MENcdTc2ODRcdTUzMzlcdTkxNERcdTkwM0JcdThGOTFcdUZGMDlcbiAgY29uc3QgYXBwcyA9IGdldEFsbEFwcHMoKTtcblxuICBmb3IgKGNvbnN0IGFwcCBvZiBhcHBzKSB7XG4gICAgaWYgKGFwcC50eXBlID09PSAnc3ViJyAmJiBhcHAuZW5hYmxlZCkge1xuICAgICAgLy8gXHU2NTJGXHU2MzAxIHBhdGhQcmVmaXggXHU1RTI2XHU2MjE2XHU0RTBEXHU1RTI2XHU1QzNFXHU5MEU4XHU2NTlDXHU2NzYwXHVGRjA4XHU0RTBFIGlzTWFpbkFwcCBcdTRGN0ZcdTc1MjhcdTc2RjhcdTU0MENcdTc2ODRcdTUzMzlcdTkxNERcdTkwM0JcdThGOTFcdUZGMDlcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoUHJlZml4ID0gYXBwLnBhdGhQcmVmaXguZW5kc1dpdGgoJy8nKVxuICAgICAgICA/IGFwcC5wYXRoUHJlZml4LnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGFwcC5wYXRoUHJlZml4O1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aCAhPT0gJy8nXG4gICAgICAgID8gcGF0aC5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBwYXRoO1xuXG4gICAgICAvLyBcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcdTYyMTZcdThERUZcdTVGODRcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcbiAgICAgIGlmIChub3JtYWxpemVkUGF0aCA9PT0gbm9ybWFsaXplZFBhdGhQcmVmaXggfHwgbm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aChub3JtYWxpemVkUGF0aFByZWZpeCArICcvJykpIHtcbiAgICAgICAgcmV0dXJuIGFwcC5pZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODRcdTUxNjVcdTUzRTNcdTU3MzBcdTU3NDBcdUZGMDhcdTU3RkFcdTRFOEVcdTVFOTRcdTc1MjhcdThFQUJcdTRFRkRcdTkxNERcdTdGNkVcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN1YkFwcEVudHJ5KGFwcElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBhcHAgPSBnZXRBcHBCeUlkKGFwcElkKTtcbiAgaWYgKCFhcHApIHtcbiAgICBjb25zb2xlLndhcm4oYFt1bmlmaWVkLWVudi1jb25maWddIFx1NjcyQVx1NjI3RVx1NTIzMFx1NUU5NFx1NzUyODogJHthcHBJZH1gKTtcbiAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuICB9XG5cbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgZW52Q29uZmlnID0gZ2V0RW52Q29uZmlnKCk7XG4gIGNvbnN0IGFwcEVudkNvbmZpZyA9IGdldEFwcENvbmZpZyhgJHthcHBJZH0tYXBwYCk7XG5cbiAgaWYgKCFhcHBFbnZDb25maWcpIHtcbiAgICBjb25zb2xlLndhcm4oYFt1bmlmaWVkLWVudi1jb25maWddIFx1NjcyQVx1NjI3RVx1NTIzMFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RTogJHthcHBJZH0tYXBwYCk7XG4gICAgcmV0dXJuIGAvJHthcHBJZH0vYDtcbiAgfVxuXG4gIHN3aXRjaCAoZW52KSB7XG4gICAgY2FzZSAncHJvZHVjdGlvbic6XG4gICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2RjRcdTYzQTVcdTkwRThcdTdGNzJcdTUyMzBcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgIGlmIChhcHAuc3ViZG9tYWluICYmIGFwcEVudkNvbmZpZy5wcm9kSG9zdCkge1xuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgID8gd2luZG93LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgOiAnaHR0cHM6JztcbiAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfS8vJHthcHBFbnZDb25maWcucHJvZEhvc3R9L2A7XG4gICAgICB9XG4gICAgICByZXR1cm4gYC8ke2FwcElkfS9gO1xuXG4gICAgY2FzZSAncHJldmlldyc6XG4gICAgICByZXR1cm4gYGh0dHA6Ly8ke2FwcEVudkNvbmZpZy5wcmVIb3N0fToke2FwcEVudkNvbmZpZy5wcmVQb3J0fSR7ZW52Q29uZmlnLm1pY3JvQXBwLmVudHJ5UHJlZml4fWA7XG5cbiAgICBjYXNlICdkZXZlbG9wbWVudCc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgJHtlbnZDb25maWcubWljcm9BcHAuYmFzZVVSTH06JHthcHBFbnZDb25maWcuZGV2UG9ydH1gO1xuICB9XG59XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwIHFpYW5rdW4gYWN0aXZlUnVsZVx1RkYwOFx1NTdGQVx1NEU4RVx1NUU5NFx1NzUyOFx1OEVBQlx1NEVGRFx1OTE0RFx1N0Y2RVx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ViQXBwQWN0aXZlUnVsZShhcHBJZDogc3RyaW5nKTogc3RyaW5nIHwgKChsb2NhdGlvbjogTG9jYXRpb24pID0+IGJvb2xlYW4pIHtcbiAgY29uc3QgYXBwID0gZ2V0QXBwQnlJZChhcHBJZCk7XG4gIGlmICghYXBwKSB7XG4gICAgY29uc29sZS53YXJuKGBbdW5pZmllZC1lbnYtY29uZmlnXSBcdTY3MkFcdTYyN0VcdTUyMzBcdTVFOTRcdTc1Mjg6ICR7YXBwSWR9YCk7XG4gICAgcmV0dXJuIGAvJHthcHBJZH1gO1xuICB9XG5cbiAgY29uc3QgZW52ID0gZ2V0RW52aXJvbm1lbnQoKTtcblxuICBpZiAoZW52ID09PSAncHJvZHVjdGlvbicgJiYgYXBwLnN1YmRvbWFpbikge1xuICAgIHJldHVybiAobG9jYXRpb246IExvY2F0aW9uKSA9PiB7XG4gICAgICBpZiAobG9jYXRpb24uaG9zdG5hbWUgPT09IGFwcC5zdWJkb21haW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUuc3RhcnRzV2l0aChhcHAucGF0aFByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiAobG9jYXRpb246IExvY2F0aW9uKSA9PiB7XG4gICAgcmV0dXJuIGxvY2F0aW9uLnBhdGhuYW1lLnN0YXJ0c1dpdGgoYXBwLnBhdGhQcmVmaXgpO1xuICB9O1xufVxuXG4vLyBcdTVCRkNcdTUxRkFcdTUzNTVcdTRGOEJcbmV4cG9ydCBjb25zdCBjdXJyZW50RW52aXJvbm1lbnQgPSBnZXRFbnZpcm9ubWVudCgpO1xuZXhwb3J0IGNvbnN0IGVudkNvbmZpZyA9IGdldEVudkNvbmZpZygpO1xuXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTc5RkJcdTk2NjRcdTRFODYgY3VycmVudFN1YkFwcCBcdTU0OEMgaXNNYWluQXBwTm93IFx1NzY4NFx1OTg3Nlx1NUM0Mlx1NUJGQ1x1NTFGQVxuLy8gXHU1NkUwXHU0RTNBXHU1QjgzXHU0RUVDXHU0RjFBXHU1NzI4XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU2NUY2XHU4QzAzXHU3NTI4IGdldEN1cnJlbnRTdWJBcHAoKSBcdTU0OEMgaXNNYWluQXBwKClcbi8vIFx1OEZEOVx1NEU5Qlx1NTFGRFx1NjU3MFx1NEY5RFx1OEQ1NiBnZXRBbGxBcHBzKClcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThcbi8vIFx1OEJGN1x1NEY3Rlx1NzUyOCBnZXRDdXJyZW50U3ViQXBwKCkgXHU1NDhDIGlzTWFpbkFwcCgpIFx1NTFGRFx1NjU3MFx1Njc2NVx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NTAzQ1xuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9zeXN0ZW0tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjtpbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbi8vIFx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTZFMFx1NEUzQSBWaXRlIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1NTcyOCBOb2RlLmpzIFx1NzNBRlx1NTg4M1x1NEUyRFx1NjI2N1x1ODg0Q1x1RkYwQ1x1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFxuLy8gXHU0RUNFIGFwcHMvc3lzdGVtLWFwcC9zcmMvY29uZmlnLyBcdTUyMzAgY29uZmlncy8gXHU5NzAwXHU4OTgxXHU1NDExXHU0RTBBIDQgXHU3RUE3XG5pbXBvcnQgeyBlbnZDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9jb25maWdzL3VuaWZpZWQtZW52LWNvbmZpZyc7XG5cbi8vIFZpdGUgXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHU3QzdCXHU1NzhCXG5pbnRlcmZhY2UgUHJveHlPcHRpb25zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG4gIGNoYW5nZU9yaWdpbj86IGJvb2xlYW47XG4gIHNlY3VyZT86IGJvb2xlYW47XG4gIHNlbGZIYW5kbGVSZXNwb25zZT86IGJvb2xlYW47XG4gIGNvbmZpZ3VyZT86IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHZvaWQ7XG59XG5cbi8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEVFM1x1NzQwNlx1NzZFRVx1NjgwN1x1RkYxQVx1NEVDRVx1N0VERlx1NEUwMFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1ODNCN1x1NTNENlxuLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHVGRjFBVml0ZSBcdTRFRTNcdTc0MDYgL2FwaSBcdTUyMzBcdTkxNERcdTdGNkVcdTc2ODRcdTU0MEVcdTdBRUZcdTU3MzBcdTU3NDBcbi8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NzUzMSBOZ2lueCBcdTRFRTNcdTc0MDZcdUZGMENcdTRFMERcdTk3MDBcdTg5ODEgVml0ZSBcdTRFRTNcdTc0MDZcbmNvbnN0IGJhY2tlbmRUYXJnZXQgPSBlbnZDb25maWcuYXBpLmJhY2tlbmRUYXJnZXQgfHwgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnO1xuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUHJveHlPcHRpb25zPiA9IHtcbiAgJy9hcGknOiB7XG4gICAgdGFyZ2V0OiBiYWNrZW5kVGFyZ2V0LFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIC8vIFx1NEUwRFx1NTE4RFx1NjZGRlx1NjM2Mlx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEY2Q1x1NTNEMSAvYXBpIFx1NTIzMFx1NTQwRVx1N0FFRlx1RkYwOFx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXHVGRjA5XG4gICAgLy8gcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hZG1pbicpIC8vIFx1NURGMlx1NzlGQlx1OTY2NFx1RkYxQVx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXG4gICAgLy8gXHU1NDJGXHU3NTI4XHU2MjRCXHU1MkE4XHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHVGRjBDXHU0RUU1XHU0RkJGXHU0RkVFXHU2NTM5XHU1NENEXHU1RTk0XHU0RjUzXG4gICAgc2VsZkhhbmRsZVJlc3BvbnNlOiB0cnVlLFxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1NkRGQlx1NTJBMCBDT1JTIFx1NTkzNFxuICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnkpID0+IHtcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBjb25zdCBpc0xvZ2luUmVxdWVzdCA9IHJlcS51cmw/LmluY2x1ZGVzKCcvbG9naW4nKTtcbiAgICAgICAgbGV0IGV4dHJhY3RlZFRva2VuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBpZiAocHJveHlSZXMuaGVhZGVycykge1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddID0gb3JpZ2luIGFzIHN0cmluZztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyddID0gJ3RydWUnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUyc7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ10gfHwgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSByZXF1ZXN0SGVhZGVycyBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG5cbiAgICAgICAgICBpZiAoc2V0Q29va2llSGVhZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBjb29raWVzID0gQXJyYXkuaXNBcnJheShzZXRDb29raWVIZWFkZXIpID8gc2V0Q29va2llSGVhZGVyIDogW3NldENvb2tpZUhlYWRlcl07XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeGVkQ29va2llcyA9IGNvb2tpZXMubWFwKChjb29raWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDYgYWNjZXNzX3Rva2VuIFx1NzY4NFx1NTAzQ1x1RkYwOFx1NzUyOFx1NEU4RVx1NkRGQlx1NTJBMFx1NTIzMFx1NTRDRFx1NUU5NFx1NEY1M1x1RkYwOVxuICAgICAgICAgICAgICBpZiAoY29va2llLmluY2x1ZGVzKCdhY2Nlc3NfdG9rZW49JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbk1hdGNoID0gY29va2llLm1hdGNoKC9hY2Nlc3NfdG9rZW49KFteO10rKS8pO1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbk1hdGNoICYmIHRva2VuTWF0Y2hbMV0pIHtcbiAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFRva2VuID0gdG9rZW5NYXRjaFsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsZXQgZml4ZWRDb29raWUgPSBjb29raWU7XG5cbiAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OUZCXHU5NjY0IERvbWFpbiBcdThCQkVcdTdGNkVcdUZGMENcdTdBMERcdTU0MEVcdTRGMUFcdTY4MzlcdTYzNkVcdTczQUZcdTU4ODNcdTkxQ0RcdTY1QjBcdThCQkVcdTdGNkVcbiAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1NDBFXHU3QUVGXHU4QkJFXHU3RjZFXHU0RTg2IERvbWFpbj0xMC44MC44LjE5OSBcdTYyMTZcdTUxNzZcdTRFRDZcdTUwM0NcdUZGMENcdTRGMUFcdTVCRkNcdTgxRjQgSmF2YVNjcmlwdCBcdTY1RTBcdTZDRDVcdThCRkJcdTUzRDZcbiAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKkRvbWFpbj1bXjtdKy9naSwgJycpO1xuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBQYXRoPS9cdUZGMENcdThCQTkgY29va2llIFx1NTcyOFx1NjU3NFx1NEUyQVx1NTdERlx1NTQwRFx1NEUwQlx1NTNFRlx1NzUyOFxuICAgICAgICAgICAgICBpZiAoIWZpeGVkQ29va2llLmluY2x1ZGVzKCdQYXRoPScpKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgUGF0aD0vJztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDkgUGF0aFx1RkYwQ1x1Nzg2RVx1NEZERFx1NjYyRiAvXG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlBhdGg9W147XSsvZ2ksICc7IFBhdGg9LycpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEIFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdTUzM0FcdTUyMkJcdUZGMUFcbiAgICAgICAgICAgICAgLy8gLSBsb2NhbGhvc3Q6IFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NUMwNlx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1ODlDNlx1NEUzQVx1NTQwQ1x1NEUwMFx1N0FEOVx1NzBCOVx1RkYwQ1NhbWVTaXRlPUxheCBcdTUzRUZcdTgwRkRcdTUxNDFcdThCQjhcdThERThcdTdBRUZcdTUzRTMgY29va2llXG4gICAgICAgICAgICAgIC8vIC0gSVAgXHU1NzMwXHU1NzQwXHVGRjA4XHU1OTgyIDEwLjgwLjguMTk5XHVGRjA5OiBcdTZENEZcdTg5QzhcdTU2NjhcdTVDMDZcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdTg5QzZcdTRFM0FcdTRFMERcdTU0MENcdTdBRDlcdTcwQjlcdUZGMENTYW1lU2l0ZT1MYXggXHU0RTBEXHU1MTQxXHU4QkI4XHU4REU4XHU3QUQ5XHU3MEI5IGNvb2tpZVxuICAgICAgICAgICAgICAvLyBcdTYyNDBcdTRFRTVcdTU3MjggSVAgXHU1NzMwXHU1NzQwXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjBDXHU1MzczXHU0RjdGXHU0RjdGXHU3NTI4IFNhbWVTaXRlPUxheFx1RkYwQ1x1OERFOFx1N0FFRlx1NTNFMyBjb29raWUgXHU0RTVGXHU1M0VGXHU4MEZEXHU1OTMxXHU4RDI1XG4gICAgICAgICAgICAgIGNvbnN0IGZvcndhcmRlZFByb3RvID0gcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLXByb3RvJ107XG4gICAgICAgICAgICAgIGNvbnN0IGlzSHR0cHMgPSBmb3J3YXJkZWRQcm90byA9PT0gJ2h0dHBzJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVxIGFzIGFueSkuc29ja2V0Py5lbmNyeXB0ZWQgPT09IHRydWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlcSBhcyBhbnkpLmNvbm5lY3Rpb24/LmVuY3J5cHRlZCA9PT0gdHJ1ZTtcblxuICAgICAgICAgICAgICAvLyBcdTY4QzBcdTZENEJcdTY2MkZcdTU0MjZcdTY2MkYgbG9jYWxob3N0XHVGRjA4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHVGRjA5XHU4RkQ4XHU2NjJGIElQIFx1NTczMFx1NTc0MFx1RkYwOFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBob3N0ID0gcmVxLmhlYWRlcnMuaG9zdCB8fCAnJztcbiAgICAgICAgICAgICAgY29uc3QgaXNMb2NhbGhvc3QgPSBob3N0LmluY2x1ZGVzKCdsb2NhbGhvc3QnKSB8fCBob3N0LmluY2x1ZGVzKCcxMjcuMC4wLjEnKTtcbiAgICAgICAgICAgICAgY29uc3QgaXNJcEFkZHJlc3MgPSAvXlxcZCtcXC5cXGQrXFwuXFxkK1xcLlxcZCsvLnRlc3QoaG9zdC5zcGxpdCgnOicpWzBdKTtcblxuICAgICAgICAgICAgICAvLyBcdTY4QzBcdTZENEJcdTY2MkZcdTU0MjZcdTY2MkZcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDhiZWxsaXMuY29tLmNuIFx1NTdERlx1NTQwRFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBob3N0LmluY2x1ZGVzKCdiZWxsaXMuY29tLmNuJyk7XG5cbiAgICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU3M0IwXHU2NzA5XHU3Njg0IFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqU2FtZVNpdGU9KFN0cmljdHxMYXh8Tm9uZSkvZ2ksICcnKTtcblxuICAgICAgICAgICAgICBpZiAoaXNIdHRwcykge1xuICAgICAgICAgICAgICAgIC8vIEhUVFBTIFx1NzNBRlx1NTg4M1x1NEUwQlx1RkYxQVx1NEY3Rlx1NzUyOCBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcdUZGMDhcdTY1MkZcdTYzMDFcdThERThcdTU3REZcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9jYWxob3N0KSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWxob3N0ICsgSFRUUFx1RkYxQVx1NEUwRFx1OEJCRVx1N0Y2RSBTYW1lU2l0ZVx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NTAzQ1x1RkYwQ1x1OTAxQVx1NUUzOFx1NjYyRiBMYXhcdUZGMDlcbiAgICAgICAgICAgICAgICAvLyBsb2NhbGhvc3QgXHU0RTBBXHVGRjBDXHU2RDRGXHU4OUM4XHU1NjY4XHU1QkY5XHU4REU4XHU3QUVGXHU1M0UzIGNvb2tpZSBcdTY2RjRcdTVCQkRcdTY3N0VcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0lwQWRkcmVzcykge1xuICAgICAgICAgICAgICAgIC8vIElQIFx1NTczMFx1NTc0MCArIEhUVFBcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcdUZGMENcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTUwM0NcdUZGMDhcdTRFMEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTYwQzVcdTUxQjVcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBIdHRwT25seSBcdTg4QUJcdTc5RkJcdTk2NjRcdUZGMDhcdTU5ODJcdTY3OUNcdTU0MEVcdTdBRUZcdThCQkVcdTdGNkVcdTRFODYgSHR0cE9ubHk9ZmFsc2VcdUZGMENcdTRGNDZcdTUzRUZcdTgwRkRcdThGRDhcdTY3MDlcdTUxNzZcdTRFRDZcdThCQkVcdTdGNkVcdUZGMDlcbiAgICAgICAgICAgICAgaWYgKGZpeGVkQ29va2llLmluY2x1ZGVzKCdIdHRwT25seScpICYmICFjb29raWUuaW5jbHVkZXMoJ0h0dHBPbmx5PWZhbHNlJykpIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqSHR0cE9ubHkvZ2ksICcnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBTZWN1cmUgXHU4OEFCXHU3OUZCXHU5NjY0XHVGRjA4XHU1NzI4IEhUVFAgXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjA5XG4gICAgICAgICAgICAgIGlmICghaXNIdHRwcyAmJiBmaXhlZENvb2tpZS5pbmNsdWRlcygnU2VjdXJlJykpIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqU2VjdXJlL2dpLCAnJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdThCQkVcdTdGNkUgZG9tYWluIFx1NEUzQSAuYmVsbGlzLmNvbS5jbiBcdTRFRTVcdTY1MkZcdTYzMDFcdThERThcdTVCNTBcdTU3REZcdTU0MERcdTUxNzFcdTRFQUJcbiAgICAgICAgICAgICAgaWYgKGlzUHJvZHVjdGlvbikge1xuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llICs9ICc7IERvbWFpbj0uYmVsbGlzLmNvbS5jbic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU3M0FGXHU1ODgzXHVGRjFBXHU0RTBEXHU4QkJFXHU3RjZFIGRvbWFpblx1RkYwQ2Nvb2tpZSBcdTUzRUFcdTU3MjhcdTVGNTNcdTUyNERcdTU3REZcdTU0MERcdTRFMEJcdTY3MDlcdTY1NDhcblxuICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXSA9IGZpeGVkQ29va2llcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUNcdTY2MkZcdTc2N0JcdTVGNTVcdTYzQTVcdTUzRTNcdTc2ODRcdTU0Q0RcdTVFOTRcdUZGMENcdTRFMTRcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTZDQTFcdTY3MDkgdG9rZW5cdUZGMENcdTUyMTlcdTRFQ0UgU2V0LUNvb2tpZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTVFNzZcdTZERkJcdTUyQTBcdTUyMzBcdTU0Q0RcdTVFOTRcdTRGNTNcbiAgICAgICAgICAvLyBcdThGRDlcdTY4MzdcdTUyNERcdTdBRUZcdTVDMzFcdTUzRUZcdTRFRTVcdTRFQ0VcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTgzQjdcdTUzRDYgdG9rZW5cdUZGMENcdTUzNzNcdTRGN0YgY29va2llIFx1NjYyRiBIdHRwT25seSBcdTc2ODRcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRGN0ZcdTc1Mjggc2VsZkhhbmRsZVJlc3BvbnNlOiB0cnVlIFx1NjVGNlx1RkYwQ1x1OTcwMFx1ODk4MVx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1NjI0MFx1NjcwOVx1NTRDRFx1NUU5NFxuICAgICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcblxuICAgICAgICAgIHByb3h5UmVzLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNMb2dpblJlcXVlc3QgJiYgZXh0cmFjdGVkVG9rZW4pIHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ+ID0ge307XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHByb3h5UmVzLmhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb3dlcktleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChsb3dlcktleSAhPT0gJ2NvbnRlbnQtbGVuZ3RoJykge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWxIZWFkZXJzW2tleV0gPSBwcm94eVJlcy5oZWFkZXJzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VEYXRhOiBhbnk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NjYyRiBKU09OXHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XG4gICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBvcmlnaW5hbEhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTZDQTFcdTY3MDkgdG9rZW5cdUZGMENcdTZERkJcdTUyQTBcdTRFQ0UgY29va2llIFx1NEUyRFx1NjNEMFx1NTNENlx1NzY4NCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2VEYXRhLnRva2VuICYmICFyZXNwb25zZURhdGEuYWNjZXNzVG9rZW4gJiYgZXh0cmFjdGVkVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YS50b2tlbiA9IGV4dHJhY3RlZFRva2VuO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEYXRhLmFjY2Vzc1Rva2VuID0gZXh0cmFjdGVkVG9rZW47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU5MUNEXHU2NUIwXHU4QkJFXHU3RjZFIENvbnRlbnQtTGVuZ3RoXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm9keSA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlRGF0YSk7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxIZWFkZXJzWydjb250ZW50LWxlbmd0aCddID0gQnVmZmVyLmJ5dGVMZW5ndGgobmV3Qm9keSkudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NEZFRVx1NjUzOVx1NTQwRVx1NzY4NFx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIG9yaWdpbmFsSGVhZGVycyk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChuZXdCb2R5KTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIFx1MjcxNyBcdTU5MDRcdTc0MDZcdTc2N0JcdTVGNTVcdTU0Q0RcdTVFOTRcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIHByb3h5UmVzLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU5NzVFXHU3NjdCXHU1RjU1XHU4QkY3XHU2QzQyXHU2MjE2XHU2Q0ExXHU2NzA5IHRva2VuIFx1NjVGNlx1RkYwQ1x1NkI2M1x1NUUzOFx1OEY2Q1x1NTNEMVx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBwcm94eVJlcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcHJveHlSZXMub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQcm94eV0gXHUyNzE3IFx1OEJGQlx1NTNENlx1NTRDRFx1NUU5NFx1NkQ0MVx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIpO1xuICAgICAgICAgICAgaWYgKCFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBvcmlnaW4gYXMgc3RyaW5nLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnXHU0RUUzXHU3NDA2XHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHU2NUY2XHU1MUZBXHU5NTE5JyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgYmFja2VuZFRhcmdldCk7XG4gICAgICAgIGlmIChyZXMgJiYgIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKicsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgICAgICBtZXNzYWdlOiBgXHU0RUUzXHU3NDA2XHU5NTE5XHU4QkVGXHVGRjFBXHU2NUUwXHU2Q0Q1XHU4RkRFXHU2M0E1XHU1MjMwXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU1NjY4ICR7YmFja2VuZFRhcmdldH1gLFxuICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgfSxcbn07XG5cbmV4cG9ydCB7IHByb3h5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QSxRQUNSLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQSxNQUFNO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsSUFBSTtBQUFBLFFBQ0YsS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQSxNQUFNO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsSUFBSTtBQUFBLFFBQ0YsS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1YsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQSxRQUNMLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxJQUFJO0FBQUEsUUFDRixLQUFLO0FBQUEsTUFDUDtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sS0FBSztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUE7QUFBQSxJQUdOLGFBQWE7QUFBQSxNQUNYLEtBQUs7QUFBQSxRQUNILFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULGVBQWU7QUFBQSxNQUNqQjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLE1B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QUFDLElBQUksYUFBYTtBQUMzQixjQUFJLFVBQVUsS0FBSztBQUFBLFlBQ2pCLGdCQUFnQjtBQUFBLFlBQ2hCLCtCQUErQixJQUFJLFFBQVEsVUFBVTtBQUFBLFVBQ3ZELENBQUM7QUFDRCxjQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsWUFDckIsTUFBTTtBQUFBLFlBQ04sU0FBUyw4RkFBbUIsYUFBYTtBQUFBLFlBQ3pDLE9BQU8sSUFBSTtBQUFBLFVBQ2IsQ0FBQyxDQUFDO0FBQUEsUUFDSjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7OztBbkJ4TnFRLElBQU1DLDRDQUEyQztBQUt0VCxJQUFNLFNBQVNDLGVBQWMsSUFBSSxJQUFJLEtBQUtELHlDQUFlLENBQUM7QUFFMUQsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBaUI7QUFDNUQsUUFBTSxhQUFhLHdCQUF3QjtBQUFBLElBQ3pDLFNBQVM7QUFBQSxJQUNUO0FBQUE7QUFBQSxJQUVBLHNCQUFzQjtBQUFBO0FBQUEsSUFFdEIsdUJBQXVCO0FBQUEsSUFDdkIsY0FBYyxFQUFFLE1BQU07QUFBQSxJQUN0QjtBQUFBLEVBQ0YsQ0FBQztBQUtELE1BQUksWUFBWSxTQUFTO0FBRXZCLFdBQU87QUFBQSxFQUNULE9BQU87QUFFTCxVQUFNLGlCQUFpQixRQUFRLElBQUksaUJBQWlCO0FBQ3BELFFBQUksQ0FBQyxnQkFBZ0I7QUFDbkIsYUFBTztBQUFBLFFBQ0wsR0FBRztBQUFBLFFBQ0gsV0FBVztBQUFBO0FBQUEsTUFDYjtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImZpbGVVUkxUb1BhdGgiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAidGltZXN0YW1wIiwgIm9yaWdpbiIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJkaXJuYW1lIiwgImdldEJ1aWxkVGltZXN0YW1wIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ0aW1lc3RhbXAiLCAicmVhZEZpbGVTeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJqb2luIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlYWRkaXJTeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkZGlyU3luYyIsICJqb2luIiwgInJlYWRGaWxlU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgImFwcERpciIsICJwcm94eSIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJyZXNvbHZlIiwgInByb2RGbGFnIiwgInByb3h5IiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiZmlsZVVSTFRvUGF0aCJdCn0K
