import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { btc } from '@btc/vite-plugin';
import UnoCSS from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'node:fs';
import { createAutoImportConfig, createComponentsConfig } from '../../configs/auto-import.config';
import { titleInjectPlugin } from './vite-plugin-title-inject';
import { proxy } from './src/config/proxy';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@services': resolve(__dirname, 'src/services'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@btc/shared-core': resolve(__dirname, '../../packages/shared-core/src'),
      '@btc/shared-components': resolve(__dirname, '../../packages/shared-components/src'),
      '@btc/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      // shared-components 内部别名
      '@btc-common': resolve(__dirname, '../../packages/shared-components/src/common'),
      '@btc-components': resolve(__dirname, '../../packages/shared-components/src/components'),
      '@btc-crud': resolve(__dirname, '../../packages/shared-components/src/crud'),
      '@btc-styles': resolve(__dirname, '../../packages/shared-components/src/styles'),
      '@btc-locales': resolve(__dirname, '../../packages/shared-components/src/locales'),
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
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue 核心库
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-vendor';
          }

          // Element Plus 按组件类型分块
          if (id.includes('node_modules/element-plus')) {
            // 基础组件
            if (id.includes('/button') || id.includes('/input') || id.includes('/form') || id.includes('/select') || id.includes('/checkbox') || id.includes('/radio')) {
              return 'element-basic';
            }
            // 布局组件
            if (id.includes('/layout') || id.includes('/container') || id.includes('/row') || id.includes('/col') || id.includes('/grid')) {
              return 'element-layout';
            }
            // 数据展示组件
            if (id.includes('/table') || id.includes('/pagination') || id.includes('/tree') || id.includes('/calendar') || id.includes('/tag')) {
              return 'element-data';
            }
            // 反馈组件
            if (id.includes('/dialog') || id.includes('/drawer') || id.includes('/message') || id.includes('/notification') || id.includes('/popover') || id.includes('/tooltip')) {
              return 'element-feedback';
            }
            // 导航组件
            if (id.includes('/menu') || id.includes('/breadcrumb') || id.includes('/tabs') || id.includes('/steps') || id.includes('/affix')) {
              return 'element-navigation';
            }
            // 其他 Element Plus 组件
            return 'element-others';
          }

          // Element Plus 图标
          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'element-icons';
          }

          // 工具库
          if (id.includes('node_modules/axios') || id.includes('node_modules/lodash') || id.includes('node_modules/dayjs') || id.includes('node_modules/@vueuse')) {
            return 'utils';
          }

          // BTC 共享包
          if (id.includes('@btc/shared-')) {
            return 'btc-shared';
          }

          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 设置 chunk 大小警告限制
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
