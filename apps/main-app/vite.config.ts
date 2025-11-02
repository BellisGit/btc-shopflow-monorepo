import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'node:fs';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';

// 动态加载 vite-plugin（在顶层使用 await）
const { btc } = await import('@btc/vite-plugin');

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
      '@modules': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/modules'),
      '@services': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/services'),
      '@components': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/components'),
      '@utils': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/utils'),
      '@btc/shared-core': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-utils/src'),
      // shared-components 内部别名
      '@btc-common': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src/common'),
      '@btc-components': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src/crud'),
      '@btc-styles': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src/styles'),
      '@btc-locales': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared-components/src/locales'),
    },
  },
  plugins: [
    titleInjectPlugin(), // 服务端标题注入（必须在最前面）
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    createAutoImportConfig(),
    createComponentsConfig({ includeShared: true }),
    UnoCSS({
      configFile: '../../uno.config.ts',
    }),
    btc({
      type: 'admin',
      proxy,
      eps: {
        enable: true, // 启用 EPS 功能
        dict: false, // 暂时禁用字典功能，因为后端还没有实现
        dist: './build/eps', // 明确指定输出目录
      },
      svg: {
        skipNames: ['base'],
      },
    }),
    VueI18nPlugin({
      include: [
        fileURLToPath(new URL('./src/{modules,plugins}/**/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-components/src/locales/**', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN.ts', import.meta.url)),
        fileURLToPath(new URL('../../packages/shared-core/src/btc/plugins/i18n/locales/en-US.ts', import.meta.url))
      ],
      runtimeOnly: true, // 明确设置为 true，生成字符串而不是 AST 对象
    })
  ],
  // 移除 vue-i18n 相关的 define 配置，使用默认值
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 8080,
    host: '0.0.0.0', // 允许网络访问
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy,
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      '@vueuse/core',
      'axios',
      '@btc/shared-core',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 项目源码 - 更细致的分块
          if (id.includes('src/') && !id.includes('node_modules')) {
            // 模块按功能拆分
            if (id.includes('src/modules')) {
              const moduleName = id.match(/src\/modules\/([^\/]+)/)?.[1];
              if (moduleName && ['access', 'navigation', 'org'].includes(moduleName)) {
                return `module-${moduleName}`;
              }
              // 其他模块合并
              return 'module-others';
            }
            // 页面组件
            if (id.includes('src/pages')) {
              return 'app-pages';
            }
            // 通用组件
            if (id.includes('src/components')) {
              return 'app-components';
            }
            // 其他源码（utils, services 等）
            return 'app-src';
          }

          // BTC 共享包 - 放在最前面，避免循环依赖
          if (id.includes('@btc/shared-')) {
            // 进一步细分 shared-components
            if (id.includes('@btc/shared-components')) {
              return 'btc-components';
            }
            return 'btc-shared';
          }

          // Vue 核心库
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-vendor';
          }

          // Element Plus 按组件类型分块（更细致的分割）
          if (id.includes('node_modules/element-plus')) {
            // Element Plus 核心（样式和工具）
            if (id.includes('/theme') || id.includes('/utils') || id.includes('/locale') || id.includes('/directives')) {
              return 'element-core';
            }
            // 基础组件
            if (id.includes('/button') || id.includes('/input') || id.includes('/form') || id.includes('/select') || id.includes('/checkbox') || id.includes('/radio') || id.includes('/switch')) {
              return 'element-basic';
            }
            // 布局组件
            if (id.includes('/layout') || id.includes('/container') || id.includes('/row') || id.includes('/col') || id.includes('/grid') || id.includes('/divider')) {
              return 'element-layout';
            }
            // 数据展示组件
            if (id.includes('/table') || id.includes('/pagination') || id.includes('/tree') || id.includes('/calendar') || id.includes('/tag') || id.includes('/badge') || id.includes('/card')) {
              return 'element-data';
            }
            // 反馈组件
            if (id.includes('/dialog') || id.includes('/drawer') || id.includes('/message') || id.includes('/notification') || id.includes('/popover') || id.includes('/tooltip') || id.includes('/alert') || id.includes('/loading')) {
              return 'element-feedback';
            }
            // 导航组件
            if (id.includes('/menu') || id.includes('/breadcrumb') || id.includes('/tabs') || id.includes('/steps') || id.includes('/affix') || id.includes('/backtop')) {
              return 'element-navigation';
            }
            // 表单组件
            if (id.includes('/date-picker') || id.includes('/time-picker') || id.includes('/cascader') || id.includes('/upload') || id.includes('/rate') || id.includes('/slider') || id.includes('/color-picker')) {
              return 'element-form';
            }
            // 其他 Element Plus 组件
            return 'element-others';
          }

          // Element Plus 图标
          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'element-icons';
          }

          // 工具库 - 进一步细分
          if (id.includes('node_modules/axios')) {
            return 'utils-http';
          }
          if (id.includes('node_modules/@vueuse')) {
            return 'utils-vueuse';
          }
          if (id.includes('node_modules/dayjs') || id.includes('node_modules/moment')) {
            return 'utils-date';
          }
          if (id.includes('node_modules/lodash') || id.includes('node_modules/lodash-es')) {
            return 'utils-lodash';
          }

          // 大的第三方库单独分块
          if (id.includes('node_modules')) {
            // Vue I18n 单独分块
            if (id.includes('vue-i18n') || id.includes('@intlify')) {
              return 'vue-i18n';
            }
            // XLSX 和 file-saver 分开
            if (id.includes('xlsx')) {
              return 'file-xlsx';
            }
            if (id.includes('file-saver')) {
              return 'file-saver';
            }
            // qiankun 微前端框架
            if (id.includes('qiankun')) {
              return 'qiankun';
            }
            // 其他第三方库按大小分组
            // 大库单独分块（更细致）
            if (id.includes('echarts')) {
              return 'lib-echarts';
            }
            if (id.includes('monaco-editor')) {
              return 'lib-monaco';
            }
            if (id.includes('three')) {
              return 'lib-three';
            }
            // UnoCSS 相关
            if (id.includes('unocss') || id.includes('@unocss')) {
              return 'lib-unocss';
            }
            // Vite 相关（开发工具，不应该在生产构建中出现）
            if (id.includes('vite') && !id.includes('vite-plugin')) {
              return 'lib-vite';
            }
            // 其他小库合并（这些通常很小）
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 设置 chunk 大小警告限制（降低到 500 KB，鼓励更细粒度的代码分割）
    chunkSizeWarningLimit: 500,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
});
