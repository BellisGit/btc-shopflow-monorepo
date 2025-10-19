import { defineConfig } from 'vitepress';
import { exportSearchIndexPlugin } from './plugins/exportSearchIndex';
import { fileURLToPath, URL } from 'node:url';
import { generateNav } from './utils/auto-nav';
import { generateSidebar } from './utils/auto-sidebar';

export default defineConfig({
  title: '拜里斯文档库',
  description: 'BTC 车间管理系统开发文档库',

  base: process.env.NODE_ENV === 'production' ? '/internal/archive/' : '/',
  lang: 'zh-CN',

  lastUpdated: true,

  // 路由配置
  cleanUrls: true, // 生成干净的 URL，不包含 .html 后缀

  // 确保路由状态保持
  ignoreDeadLinks: true, // 忽略死链接，避免路由错误

  // 外观设置 - 嵌入模式禁用外观切换，避免内联脚本注入
  appearance: false, // 完全禁用VitePress的外观切换，避免内联脚本"秒变黑"

  // 添加超早期脚本，在首屏前执行主题设置
  head: [
    ['script', {},
`(function(){
  try {
    // 优先读取parent-theme，如果没有则默认浅色主题
    var parentTheme = localStorage.getItem('parent-theme');
    var vueuseTheme = localStorage.getItem('vueuse-color-scheme');

    var isDark = false;

    // 如果有parent-theme，直接使用
    if (parentTheme) {
      isDark = parentTheme === 'dark';
    } else if (vueuseTheme) {
      // 如果没有parent-theme，但有vueuse-color-scheme，则根据它判断
      // vueuse-color-scheme为'auto'时表示暗色主题，'light'时表示浅色主题
      isDark = vueuseTheme === 'auto';
    }

    // 应用主题
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
  } catch(e) {
    console.error('[Early Script] Error:', e);
  }
})();`
    ]
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: '拜里斯文档库', // 显示站点标题

    // 自动生成导航栏（根据文件夹）
    nav: generateNav(),

    // 自动生成侧边栏（根据 frontmatter）
    sidebar: generateSidebar(),

    // 本地搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          'zh-CN': {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-org/btc-shopflow/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    // 最后更新文本
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // 分页导航文本
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 社交媒体链接（可选）
    socialLinks: [
      // 可以添加GitHub等链接
    ],

    // 返回顶部按钮配置
    returnToTopLabel: '返回顶部'
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,

    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  },

  // Vite 配置
  vite: {
    plugins: [
      exportSearchIndexPlugin() // 导出搜索索引给主应用
    ],

    resolve: {
      alias: {
        '@btc/shared-components': fileURLToPath(new URL('../../../packages/shared-components/src', import.meta.url)),
        '@btc/shared-core': fileURLToPath(new URL('../../../packages/shared-core/src', import.meta.url)),
        '@btc/shared-utils': fileURLToPath(new URL('../../../packages/shared-utils/src', import.meta.url)),
      }
    },

    // CSS 配置 - 解决 Sass 弃用警告
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用现代编译器 API
          silenceDeprecations: ['legacy-js-api'] // 抑制弃用警告
        }
      }
    },

    // SSR 配置
    ssr: {
      noExternal: ['element-plus', '@btc/shared-components', '@btc/shared-core']
    },

    // 构建配置
    build: {
      chunkSizeWarningLimit: 1000, // 文档站点允许更大的 chunk
    },

    // 服务器配置
    server: {
      port: 8085,
      host: '0.0.0.0',
      strictPort: true, // 端口被占用时报错而不是自动换端口
      cors: true, // 允许跨域（iframe 嵌入需要）
        hmr: {
          port: 8086, // 使用不同的端口避免冲突
          host: 'localhost' // 改为 localhost，避免 0.0.0.0 的问题
        }
    }
  }
});
