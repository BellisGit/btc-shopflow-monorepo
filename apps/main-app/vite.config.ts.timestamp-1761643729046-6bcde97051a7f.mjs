// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.20_@types+node@24.7.0_sass@1.93.2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.20_vue@3.5.22/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { btc } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/vite-plugin/dist/index.mjs";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.2_postcss@8.5.6_vite@5.4.20/node_modules/unocss/dist/vite.mjs";
import VueI18nPlugin from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@intlify+unplugin-vue-i18n@1.6.0_vue-i18n@11.1.12/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "path";
import { existsSync, readFileSync } from "node:fs";

// ../../configs/auto-import.config.ts
import AutoImport from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-auto-import@20.2.0/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.1.0_vue@3.5.22/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.1.0_vue@3.5.22/node_modules/unplugin-vue-components/dist/resolvers.js";
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
    dirs.push("../../packages/shared-components/src/components");
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
  "/admin": {
    target: "http://10.80.9.76:8115",
    changeOrigin: true,
    rewrite: (path) => path
    // 不删除admin前缀，直接转发
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\mlu\\Desktop\\btc-shopflow\\btc-shopflow-monorepo\\apps\\main-app";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/main-app/vite.config.ts";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@modules": resolve(__vite_injected_original_dirname, "src/modules"),
      "@services": resolve(__vite_injected_original_dirname, "src/services"),
      "@components": resolve(__vite_injected_original_dirname, "src/components"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@btc/shared-core": resolve(__vite_injected_original_dirname, "../../packages/shared-core/src"),
      "@btc/shared-components": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src"),
      "@btc/shared-utils": resolve(__vite_injected_original_dirname, "../../packages/shared-utils/src"),
      // shared-components 内部别名
      "@btc-common": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/common"),
      "@btc-components": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/components"),
      "@btc-crud": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/crud"),
      "@btc-styles": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/styles"),
      "@btc-locales": resolve(__vite_injected_original_dirname, "../../packages/shared-components/src/locales")
    }
  },
  plugins: [
    titleInjectPlugin(),
    // 服务端标题注入（必须在最前面）
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
      configFile: "../../uno.config.ts"
    }),
    btc({
      type: "admin",
      proxy,
      eps: {
        enable: true,
        // 启用 EPS 功能
        dict: false,
        // 暂时禁用字典功能，因为后端还没有实现
        dist: "./build/eps"
        // 明确指定输出目录
      },
      svg: {
        skipNames: ["base"]
      }
    }),
    VueI18nPlugin({
      include: [
        fileURLToPath(new URL("./src/{modules,plugins}/**/locales/**", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-components/src/locales/**", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts", __vite_injected_original_import_meta_url)),
        fileURLToPath(new URL("../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts", __vite_injected_original_import_meta_url))
      ],
      runtimeOnly: true
      // 明确设置为 true，生成字符串而不是 AST 对象
    })
  ],
  // 移除 vue-i18n 相关的 define 配置，使用默认值
  esbuild: {
    charset: "utf8"
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    // 允许网络访问
    strictPort: false,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    proxy,
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      "@element-plus/icons-vue",
      "@vueuse/core",
      "axios"
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("src/") && !id.includes("node_modules")) {
            if (id.includes("src/components") || id.includes("src/modules") || id.includes("src/pages")) {
              return "app-components";
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
          if (id.includes("node_modules/element-plus")) {
            if (id.includes("/button") || id.includes("/input") || id.includes("/form") || id.includes("/select") || id.includes("/checkbox") || id.includes("/radio")) {
              return "element-basic";
            }
            if (id.includes("/layout") || id.includes("/container") || id.includes("/row") || id.includes("/col") || id.includes("/grid")) {
              return "element-layout";
            }
            if (id.includes("/table") || id.includes("/pagination") || id.includes("/tree") || id.includes("/calendar") || id.includes("/tag")) {
              return "element-data";
            }
            if (id.includes("/dialog") || id.includes("/drawer") || id.includes("/message") || id.includes("/notification") || id.includes("/popover") || id.includes("/tooltip")) {
              return "element-feedback";
            }
            if (id.includes("/menu") || id.includes("/breadcrumb") || id.includes("/tabs") || id.includes("/steps") || id.includes("/affix")) {
              return "element-navigation";
            }
            return "element-others";
          }
          if (id.includes("node_modules/@element-plus/icons-vue")) {
            return "element-icons";
          }
          if (id.includes("node_modules/axios") || id.includes("node_modules/lodash") || id.includes("node_modules/dayjs") || id.includes("node_modules/@vueuse")) {
            return "utils";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // 设置 chunk 大小警告限制（提升到 1000 KB）
    chunkSizeWarningLimit: 1e3
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAidml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0LnRzIiwgInNyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbWFpbi1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxtYWluLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL21haW4tYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBidGMgfSBmcm9tICdAYnRjL3ZpdGUtcGx1Z2luJztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IFZ1ZUkxOG5QbHVnaW4gZnJvbSAnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgdGl0bGVJbmplY3RQbHVnaW4gfSBmcm9tICcuL3ZpdGUtcGx1Z2luLXRpdGxlLWluamVjdCc7XG5pbXBvcnQgeyBwcm94eSB9IGZyb20gJy4vc3JjL2NvbmZpZy9wcm94eSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgICAgJ0Btb2R1bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbW9kdWxlcycpLFxuICAgICAgJ0BzZXJ2aWNlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NlcnZpY2VzJyksXG4gICAgICAnQGNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQHV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbHMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLXV0aWxzL3NyYycpLFxuICAgICAgLy8gc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXG4gICAgICAnQGJ0Yy1jb21tb24nOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24nKSxcbiAgICAgICdAYnRjLWNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGJ0Yy1jcnVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICAgJ0BidGMtc3R5bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXG4gICAgICAnQGJ0Yy1sb2NhbGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcycpLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICB0aXRsZUluamVjdFBsdWdpbigpLCAvLyBcdTY3MERcdTUyQTFcdTdBRUZcdTY4MDdcdTk4OThcdTZDRThcdTUxNjVcdUZGMDhcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMDlcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGZzOiB7XG4gICAgICAgICAgZmlsZUV4aXN0czogZXhpc3RzU3luYyxcbiAgICAgICAgICByZWFkRmlsZTogKGZpbGU6IHN0cmluZykgPT4gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgVW5vQ1NTKHtcbiAgICAgIGNvbmZpZ0ZpbGU6ICcuLi8uLi91bm8uY29uZmlnLnRzJyxcbiAgICB9KSxcbiAgICBidGMoe1xuICAgICAgdHlwZTogJ2FkbWluJyxcbiAgICAgIHByb3h5LFxuICAgICAgZXBzOiB7XG4gICAgICAgIGVuYWJsZTogdHJ1ZSwgLy8gXHU1NDJGXHU3NTI4IEVQUyBcdTUyOUZcdTgwRkRcbiAgICAgICAgZGljdDogZmFsc2UsIC8vIFx1NjY4Mlx1NjVGNlx1Nzk4MVx1NzUyOFx1NUI1N1x1NTE3OFx1NTI5Rlx1ODBGRFx1RkYwQ1x1NTZFMFx1NEUzQVx1NTQwRVx1N0FFRlx1OEZEOFx1NkNBMVx1NjcwOVx1NUI5RVx1NzNCMFxuICAgICAgICBkaXN0OiAnLi9idWlsZC9lcHMnLCAvLyBcdTY2MEVcdTc4NkVcdTYzMDdcdTVCOUFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcbiAgICAgIH0sXG4gICAgICBzdmc6IHtcbiAgICAgICAgc2tpcE5hbWVzOiBbJ2Jhc2UnXSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgVnVlSTE4blBsdWdpbih7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMve21vZHVsZXMscGx1Z2luc30vKiovbG9jYWxlcy8qKicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzLyoqJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTi50cycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMudHMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgICAgXSxcbiAgICAgIHJ1bnRpbWVPbmx5OiB0cnVlLCAvLyBcdTY2MEVcdTc4NkVcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1NzUxRlx1NjIxMFx1NUI1N1x1N0IyNlx1NEUzMlx1ODAwQ1x1NEUwRFx1NjYyRiBBU1QgXHU1QkY5XHU4QzYxXG4gICAgfSlcbiAgXSxcbiAgLy8gXHU3OUZCXHU5NjY0IHZ1ZS1pMThuIFx1NzZGOFx1NTE3M1x1NzY4NCBkZWZpbmUgXHU5MTREXHU3RjZFXHVGRjBDXHU0RjdGXHU3NTI4XHU5RUQ4XHU4QkE0XHU1MDNDXG4gIGVzYnVpbGQ6IHtcbiAgICBjaGFyc2V0OiAndXRmOCcsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDgwODAsXG4gICAgaG9zdDogJzAuMC4wLjAnLCAvLyBcdTUxNDFcdThCQjhcdTdGNTFcdTdFRENcdThCQkZcdTk1RUVcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgIH0sXG4gICAgcHJveHksXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAgJ2VsZW1lbnQtcGx1cycsXG4gICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLFxuICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAnYXhpb3MnLFxuICAgIF0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIC8vIFx1OTg3OVx1NzZFRVx1NkU5MFx1NzgwMSAtIFx1NTM1NVx1NzJFQ1x1NTIwNlx1NTc1N1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3JjLycpICYmICFpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIC8vIFx1NUMwNiBjb21wb25lbnRzIFx1NzZGOFx1NTE3M1x1NTM1NVx1NzJFQ1x1NTIwNlx1NTc1N1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvY29tcG9uZW50cycpIHx8IGlkLmluY2x1ZGVzKCdzcmMvbW9kdWxlcycpIHx8IGlkLmluY2x1ZGVzKCdzcmMvcGFnZXMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FwcC1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NkU5MFx1NzgwMVxuICAgICAgICAgICAgcmV0dXJuICdhcHAtc3JjJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBCVEMgXHU1MTcxXHU0RUFCXHU1MzA1IC0gXHU2NTNFXHU1NzI4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAYnRjL3NoYXJlZC0nKSkge1xuICAgICAgICAgICAgLy8gXHU4RkRCXHU0RTAwXHU2QjY1XHU3RUM2XHU1MjA2IHNoYXJlZC1jb21wb25lbnRzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2J0Yy1jb21wb25lbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYnRjLXNoYXJlZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVnVlIFx1NjgzOFx1NUZDM1x1NUU5M1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZScpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlLXJvdXRlcicpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcGluaWEnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2dWUtdmVuZG9yJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBFbGVtZW50IFBsdXMgXHU2MzA5XHU3RUM0XHU0RUY2XHU3QzdCXHU1NzhCXHU1MjA2XHU1NzU3XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzJykpIHtcbiAgICAgICAgICAgIC8vIFx1NTdGQVx1Nzg0MFx1N0VDNFx1NEVGNlxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvYnV0dG9uJykgfHwgaWQuaW5jbHVkZXMoJy9pbnB1dCcpIHx8IGlkLmluY2x1ZGVzKCcvZm9ybScpIHx8IGlkLmluY2x1ZGVzKCcvc2VsZWN0JykgfHwgaWQuaW5jbHVkZXMoJy9jaGVja2JveCcpIHx8IGlkLmluY2x1ZGVzKCcvcmFkaW8nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2VsZW1lbnQtYmFzaWMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1RTAzXHU1QzQwXHU3RUM0XHU0RUY2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9sYXlvdXQnKSB8fCBpZC5pbmNsdWRlcygnL2NvbnRhaW5lcicpIHx8IGlkLmluY2x1ZGVzKCcvcm93JykgfHwgaWQuaW5jbHVkZXMoJy9jb2wnKSB8fCBpZC5pbmNsdWRlcygnL2dyaWQnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2VsZW1lbnQtbGF5b3V0JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NjU3MFx1NjM2RVx1NUM1NVx1NzkzQVx1N0VDNFx1NEVGNlxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvdGFibGUnKSB8fCBpZC5pbmNsdWRlcygnL3BhZ2luYXRpb24nKSB8fCBpZC5pbmNsdWRlcygnL3RyZWUnKSB8fCBpZC5pbmNsdWRlcygnL2NhbGVuZGFyJykgfHwgaWQuaW5jbHVkZXMoJy90YWcnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2VsZW1lbnQtZGF0YSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTUzQ0RcdTk5ODhcdTdFQzRcdTRFRjZcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL2RpYWxvZycpIHx8IGlkLmluY2x1ZGVzKCcvZHJhd2VyJykgfHwgaWQuaW5jbHVkZXMoJy9tZXNzYWdlJykgfHwgaWQuaW5jbHVkZXMoJy9ub3RpZmljYXRpb24nKSB8fCBpZC5pbmNsdWRlcygnL3BvcG92ZXInKSB8fCBpZC5pbmNsdWRlcygnL3Rvb2x0aXAnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2VsZW1lbnQtZmVlZGJhY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU1QkZDXHU4MjJBXHU3RUM0XHU0RUY2XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9tZW51JykgfHwgaWQuaW5jbHVkZXMoJy9icmVhZGNydW1iJykgfHwgaWQuaW5jbHVkZXMoJy90YWJzJykgfHwgaWQuaW5jbHVkZXMoJy9zdGVwcycpIHx8IGlkLmluY2x1ZGVzKCcvYWZmaXgnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2VsZW1lbnQtbmF2aWdhdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDYgRWxlbWVudCBQbHVzIFx1N0VDNFx1NEVGNlxuICAgICAgICAgICAgcmV0dXJuICdlbGVtZW50LW90aGVycyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRWxlbWVudCBQbHVzIFx1NTZGRVx1NjgwN1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZWxlbWVudC1pY29ucyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1REU1XHU1MTc3XHU1RTkzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvYXhpb3MnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xvZGFzaCcpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZGF5anMnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd1dGlscyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBcdThCQkVcdTdGNkUgY2h1bmsgXHU1OTI3XHU1QzBGXHU4QjY2XHU1NDRBXHU5NjUwXHU1MjM2XHVGRjA4XHU2M0QwXHU1MzQ3XHU1MjMwIDEwMDAgS0JcdUZGMDlcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gIH0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFxhdXRvLWltcG9ydC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHNcIjsvKipcbiAqIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVx1NkEyMVx1Njc3RlxuICogXHU0RjlCXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHAsIGxvZ2lzdGljcy1hcHAgXHU3QjQ5XHVGRjA5XHU0RjdGXHU3NTI4XG4gKi9cbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQXV0byBJbXBvcnQgXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCkge1xuICByZXR1cm4gQXV0b0ltcG9ydCh7XG4gICAgaW1wb3J0czogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAge1xuICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IFtcbiAgICAgICAgICAndXNlQ3J1ZCcsXG4gICAgICAgICAgJ3VzZURpY3QnLFxuICAgICAgICAgICd1c2VQZXJtaXNzaW9uJyxcbiAgICAgICAgICAndXNlUmVxdWVzdCcsXG4gICAgICAgICAgJ2NyZWF0ZUkxOG5QbHVnaW4nLFxuICAgICAgICAgICd1c2VJMThuJyxcbiAgICAgICAgXSxcbiAgICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogW1xuICAgICAgICAgICdmb3JtYXREYXRlJyxcbiAgICAgICAgICAnZm9ybWF0RGF0ZVRpbWUnLFxuICAgICAgICAgICdmb3JtYXRNb25leScsXG4gICAgICAgICAgJ2Zvcm1hdE51bWJlcicsXG4gICAgICAgICAgJ2lzRW1haWwnLFxuICAgICAgICAgICdpc1Bob25lJyxcbiAgICAgICAgICAnc3RvcmFnZScsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVxuICAgICAgfSksXG4gICAgXSxcblxuICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXG5cbiAgICBlc2xpbnRyYzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZpbGVwYXRoOiAnLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvbicsXG4gICAgfSxcblxuICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTk4OURcdTU5MTZcdTc2ODRcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdUZGMDlcbiAgICovXG4gIGV4dHJhRGlycz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1XHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXG4gICAqL1xuICBpbmNsdWRlU2hhcmVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ29tcG9uZW50cyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50c0NvbmZpZyhvcHRpb25zOiBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgZXh0cmFEaXJzID0gW10sIGluY2x1ZGVTaGFyZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGRpcnMgPSBbXG4gICAgJ3NyYy9jb21wb25lbnRzJywgLy8gXHU1RTk0XHU3NTI4XHU3RUE3XHU3RUM0XHU0RUY2XG4gICAgLi4uZXh0cmFEaXJzLCAvLyBcdTk4OURcdTU5MTZcdTc2ODRcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgXTtcblxuICAvLyBcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkJcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdUZGMENcdTZERkJcdTUyQTBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgaWYgKGluY2x1ZGVTaGFyZWQpIHtcbiAgICBkaXJzLnB1c2goJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXG1haW4tYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbWFpbi1hcHBcXFxcdml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvbWFpbi1hcHAvdml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0LnRzXCI7LyoqXG4gKiBWaXRlIFx1NjNEMlx1NEVGNlx1RkYxQVx1NjcwRFx1NTJBMVx1N0FFRlx1NkNFOFx1NTE2NVx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFxuICpcbiAqIFx1NzZFRVx1NzY4NFx1RkYxQVx1NTcyOCBWaXRlIGRldiBzZXJ2ZXIgXHU4RkQ0XHU1NkRFIEhUTUwgXHU2NUY2XHVGRjBDXHU2ODM5XHU2MzZFXHU4QkY3XHU2QzQyXHU4REVGXHU1Rjg0XHU1NDhDXHU4QkVEXHU4QTAwXHU2NkZGXHU2MzYyIF9fUEFHRV9USVRMRV9fIFx1NTM2MFx1NEY0RFx1N0IyNlxuICogXHU2NTQ4XHU2NzlDXHVGRjFBXHU1MjM3XHU2NUIwXHU2NUY2XHU2RDRGXHU4OUM4XHU1NjY4XHU2ODA3XHU3QjdFXHU0RUNFXHU3QjJDXHU0RTAwXHU1RTI3XHU1QzMxXHU2NjNFXHU3OTNBXHU2QjYzXHU3ODZFXHU2ODA3XHU5ODk4XHVGRjBDXHU2NUUwXHU5NUVBXHU3MEMxXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5cbi8vIFx1NjgwN1x1OTg5OFx1NjYyMFx1NUMwNFx1ODg2OFx1RkYwOFx1NEVDRSBpMThuIFx1NTQwQ1x1NkI2NVx1RkYwOVxuY29uc3QgdGl0bGVzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHtcbiAgJ3poLUNOJzoge1xuICAgICcvJzogJ1x1OTk5Nlx1OTg3NScsXG4gICAgJy90ZXN0L2NydWQnOiAnQ1JVRFx1NkQ0Qlx1OEJENScsXG4gICAgJy90ZXN0L3N2Zy1wbHVnaW4nOiAnU1ZHXHU2M0QyXHU0RUY2XHU2RDRCXHU4QkQ1JyxcbiAgICAnL3Rlc3QvaTE4bic6ICdcdTU2RkRcdTk2NDVcdTUzMTZcdTZENEJcdThCRDUnLFxuICAgICcvdGVzdC9zZWxlY3QtYnV0dG9uJzogJ1x1NzJCNlx1NjAwMVx1NTIwN1x1NjM2Mlx1NjMwOVx1OTRBRScsXG4gICAgJy9wbGF0Zm9ybS9kb21haW5zJzogJ1x1NTdERlx1NTIxN1x1ODg2OCcsXG4gICAgJy9wbGF0Zm9ybS9tb2R1bGVzJzogJ1x1NkEyMVx1NTc1N1x1NTIxN1x1ODg2OCcsXG4gICAgJy9wbGF0Zm9ybS9wbHVnaW5zJzogJ1x1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OCcsXG4gICAgJy9vcmcvdGVuYW50cyc6ICdcdTc5REZcdTYyMzdcdTUyMTdcdTg4NjgnLFxuICAgICcvb3JnL2RlcGFydG1lbnRzJzogJ1x1OTBFOFx1OTVFOFx1NTIxN1x1ODg2OCcsXG4gICAgJy9vcmcvdXNlcnMnOiAnXHU3NTI4XHU2MjM3XHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9yZXNvdXJjZXMnOiAnXHU4RDQ0XHU2RTkwXHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9hY3Rpb25zJzogJ1x1ODg0Q1x1NEUzQVx1NTIxN1x1ODg2OCcsXG4gICAgJy9hY2Nlc3MvcGVybWlzc2lvbnMnOiAnXHU2NzQzXHU5NjUwXHU1MjE3XHU4ODY4JyxcbiAgICAnL2FjY2Vzcy9yb2xlcyc6ICdcdTg5RDJcdTgyNzJcdTUyMTdcdTg4NjgnLFxuICAgICcvYWNjZXNzL3BvbGljaWVzJzogJ1x1N0I1Nlx1NzU2NVx1NTIxN1x1ODg2OCcsXG4gICAgJy9hY2Nlc3MvcGVybS1jb21wb3NlJzogJ1x1Njc0M1x1OTY1MFx1N0VDNFx1NTQwOCcsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzJzogJ1x1ODNEQ1x1NTM1NVx1NTIxN1x1ODg2OCcsXG4gICAgJy9uYXZpZ2F0aW9uL21lbnVzL3ByZXZpZXcnOiAnXHU4M0RDXHU1MzU1XHU5ODg0XHU4OUM4JyxcbiAgICAnL29wcy9hdWRpdCc6ICdcdTY0Q0RcdTRGNUNcdTY1RTVcdTVGRDcnLFxuICAgICcvb3BzL2Jhc2VsaW5lJzogJ1x1Njc0M1x1OTY1MFx1NTdGQVx1N0VCRicsXG4gICAgJy9vcHMvc2ltdWxhdG9yJzogJ1x1N0I1Nlx1NzU2NVx1NkEyMVx1NjJERlx1NTY2OCcsXG4gIH0sXG4gICdlbi1VUyc6IHtcbiAgICAnLyc6ICdIb21lJyxcbiAgICAnL3Rlc3QvY3J1ZCc6ICdDUlVEIFRlc3QnLFxuICAgICcvdGVzdC9zdmctcGx1Z2luJzogJ1NWRyBQbHVnaW4gVGVzdCcsXG4gICAgJy90ZXN0L2kxOG4nOiAnaTE4biBUZXN0JyxcbiAgICAnL3Rlc3Qvc2VsZWN0LWJ1dHRvbic6ICdTZWxlY3QgQnV0dG9uJyxcbiAgICAnL3BsYXRmb3JtL2RvbWFpbnMnOiAnRG9tYWluIExpc3QnLFxuICAgICcvcGxhdGZvcm0vbW9kdWxlcyc6ICdNb2R1bGUgTGlzdCcsXG4gICAgJy9wbGF0Zm9ybS9wbHVnaW5zJzogJ1BsdWdpbiBMaXN0JyxcbiAgICAnL29yZy90ZW5hbnRzJzogJ1RlbmFudCBMaXN0JyxcbiAgICAnL29yZy9kZXBhcnRtZW50cyc6ICdEZXBhcnRtZW50IExpc3QnLFxuICAgICcvb3JnL3VzZXJzJzogJ1VzZXIgTGlzdCcsXG4gICAgJy9hY2Nlc3MvcmVzb3VyY2VzJzogJ1Jlc291cmNlIExpc3QnLFxuICAgICcvYWNjZXNzL2FjdGlvbnMnOiAnQWN0aW9uIExpc3QnLFxuICAgICcvYWNjZXNzL3Blcm1pc3Npb25zJzogJ1Blcm1pc3Npb24gTGlzdCcsXG4gICAgJy9hY2Nlc3Mvcm9sZXMnOiAnUm9sZSBMaXN0JyxcbiAgICAnL2FjY2Vzcy9wb2xpY2llcyc6ICdQb2xpY3kgTGlzdCcsXG4gICAgJy9hY2Nlc3MvcGVybS1jb21wb3NlJzogJ1Blcm1pc3Npb24gQ29tcG9zaXRpb24nLFxuICAgICcvbmF2aWdhdGlvbi9tZW51cyc6ICdNZW51IExpc3QnLFxuICAgICcvbmF2aWdhdGlvbi9tZW51cy9wcmV2aWV3JzogJ01lbnUgUHJldmlldycsXG4gICAgJy9vcHMvYXVkaXQnOiAnQXVkaXQgTG9ncycsXG4gICAgJy9vcHMvYmFzZWxpbmUnOiAnUGVybWlzc2lvbiBCYXNlbGluZScsXG4gICAgJy9vcHMvc2ltdWxhdG9yJzogJ1BvbGljeSBTaW11bGF0b3InLFxuICB9LFxufTtcblxuLyoqXG4gKiBcdTRFQ0UgY29va2llIFx1NEUyRFx1NjNEMFx1NTNENlx1OEJFRFx1OEEwMFxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGVGcm9tQ29va2llKGNvb2tpZUhlYWRlcj86IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghY29va2llSGVhZGVyKSByZXR1cm4gJ3poLUNOJztcblxuICBjb25zdCBtYXRjaCA9IGNvb2tpZUhlYWRlci5tYXRjaCgvKD86Xnw7XFxzKilsb2NhbGU9KFteO10rKS8pO1xuICBpZiAobWF0Y2gpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFsxXSkucmVwbGFjZSgvXCIvZywgJycpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuICd6aC1DTic7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICd6aC1DTic7XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU2ODA3XHU5ODk4XHU2Q0U4XHU1MTY1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aXRsZUluamVjdFBsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgcmVxdWVzdFBhdGggPSAnLyc7XG4gIGxldCByZXF1ZXN0Q29va2llID0gJyc7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tdGl0bGUtaW5qZWN0JyxcblxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1NTcyOCBWaXRlIFx1NTE4NVx1OTBFOFx1NEUyRFx1OTVGNFx1NEVGNlx1NEU0Qlx1NTI0RFx1NjJFNlx1NjIyQVx1OEJGN1x1NkM0Mlx1RkYwQ1x1NEZERFx1NUI1OFx1OERFRlx1NUY4NFx1NTQ4QyBjb29raWVcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIHJlcXVlc3RQYXRoID0gcmVxLnVybCB8fCAnLyc7XG4gICAgICAgIHJlcXVlc3RDb29raWUgPSByZXEuaGVhZGVycy5jb29raWUgfHwgJyc7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncHJlJyxcbiAgICAgIGhhbmRsZXIoaHRtbCkge1xuICAgICAgICAvLyBcdTRGN0ZcdTc1MjhcdTRGRERcdTVCNThcdTc2ODRcdThCRjdcdTZDNDJcdTRGRTFcdTYwNkZcbiAgICAgICAgY29uc3QgbG9jYWxlID0gZ2V0TG9jYWxlRnJvbUNvb2tpZShyZXF1ZXN0Q29va2llKTtcbiAgICAgICAgY29uc3QgdGl0bGVNYXAgPSB0aXRsZXNbbG9jYWxlXSB8fCB0aXRsZXNbJ3poLUNOJ107XG4gICAgICAgIGNvbnN0IHBhZ2VUaXRsZSA9IHRpdGxlTWFwW3JlcXVlc3RQYXRoXSB8fCAnQlRDIFx1OEY2Nlx1OTVGNFx1NkQ0MVx1N0EwQlx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERic7XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyXHU1MzYwXHU0RjREXHU3QjI2XG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoJ19fUEFHRV9USVRMRV9fJywgcGFnZVRpdGxlKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbWFpbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXG1haW4tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9tYWluLWFwcC9zcmMvY29uZmlnL3Byb3h5LnRzXCI7Y29uc3QgcHJveHkgPSB7XG4gICcvYWRtaW4nOiB7XG4gICAgdGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGggLy8gXHU0RTBEXHU1MjIwXHU5NjY0YWRtaW5cdTUyNERcdTdGMDBcdUZGMENcdTc2RjRcdTYzQTVcdThGNkNcdTUzRDFcbiAgfVxufTtcblxuZXhwb3J0IHsgcHJveHkgfTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVosU0FBUyxvQkFBb0I7QUFDOWEsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsV0FBVztBQUNwQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsWUFBWSxvQkFBb0I7OztBQ0h6QyxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQUs3QixTQUFTLHlCQUF5QjtBQUN2QyxTQUFPLFdBQVc7QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFD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
