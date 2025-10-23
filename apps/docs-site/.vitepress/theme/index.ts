import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import type { Theme } from 'vitepress';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

// 复用主应用的样式（CSS 变量会被继承）
import '../../../main-app/src/styles/theme.scss';
import '../../../main-app/src/styles/global.scss';

// 导入自定义样式（最后加载，确保覆盖优先级最高）
import './custom.css';

// 导入自定义组件
import DocumentMeta from './components/DocumentMeta.vue';
import Demo from './components/Demo.vue';
import ComponentOverview from './components/ComponentOverview.vue';
import CustomLayout from './components/CustomLayout.vue';

// 完全控制主题状态
let currentTheme: boolean | null = null;
let isApplyingTheme = false;
let lastAppliedTheme: boolean | null = null;

// 初始化主题状态（VitePress已禁用appearance，不会注入内联脚本）
if (typeof window !== 'undefined') {
  // 保存当前路由状态
  const currentPath = window.location.pathname;
  if (currentPath && currentPath !== '/') {
    localStorage.setItem('vitepress-last-path', currentPath);
  }

  // 只清理主题相关的localStorage，保留路由状态
  localStorage.removeItem('vitepress-theme-appearance');
  localStorage.removeItem('vitepress-theme');
  localStorage.removeItem('vitepress-theme-color-scheme');
  localStorage.removeItem('isDark');

  // 从localStorage读取主题状态
  const parentTheme = localStorage.getItem('parent-theme');
  const vueuseTheme = localStorage.getItem('vueuse-color-scheme');

  // 初始化主题

  let isDark = false;

  // 优先使用parent-theme
  if (parentTheme) {
    isDark = parentTheme === 'dark';
  } else if (vueuseTheme) {
    // 如果没有parent-theme，使用vueuse-color-scheme
    isDark = vueuseTheme === 'auto';
  } else {
    // 默认浅色主题
    isDark = false;
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
}

// 完全控制主题应用
function applyTheme(isDark: boolean) {
  // 如果正在应用主题，避免重入
  if (isApplyingTheme) {
    return;
  }

  // 如果主题没变，不重复应用
  if (lastAppliedTheme === isDark) {
    return;
  }

  isApplyingTheme = true;
  currentTheme = isDark;
  lastAppliedTheme = isDark;

  const html = document.documentElement;

  // 完全控制HTML元素的主题类和属性
  if (isDark) {
    html.classList.add('dark');
    html.classList.remove('light');
    html.setAttribute('data-theme', 'dark');
    html.style.setProperty('color-scheme', 'dark');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    html.setAttribute('data-theme', 'light');
    html.style.setProperty('color-scheme', 'light');
  }

  // 清理VitePress的存储，使用自定义key落盘，保留路由状态
  localStorage.removeItem('vitepress-theme-appearance');
  localStorage.removeItem('vitepress-theme');
  localStorage.removeItem('vitepress-theme-color-scheme');
  localStorage.removeItem('isDark');

  // 落盘到自定义key，为下次刷新做准备
  localStorage.setItem('parent-theme', isDark ? 'dark' : 'light'); // 确保iframe中没有isDark

  // 更新所有可能的主题相关元素
  setTimeout(() => {
    // 更新所有可能的主题相关元素
    const themeElements = document.querySelectorAll('[data-theme], .dark, .light, .dark-mode, .light-mode');
    themeElements.forEach(el => {
      if (isDark) {
        el.classList.add('dark');
        el.classList.remove('light', 'light-mode');
        el.setAttribute('data-theme', 'dark');
      } else {
        el.classList.add('light');
        el.classList.remove('dark', 'dark-mode');
        el.setAttribute('data-theme', 'light');
      }
    });

  }, 50);

  currentTheme = isDark;
  isApplyingTheme = false;
}

export default {
  extends: DefaultTheme,

  Layout: CustomLayout,

  enhanceApp({ app, router }) {
        // 完全控制主题初始化
        if (typeof window !== 'undefined') {
          try {
            // 监听 VitePress 路由变化，同步到主应用
            if (typeof window !== 'undefined') {
              let lastPath = window.location.pathname;

              // 使用 popstate 事件监听路由变化
              window.addEventListener('popstate', () => {
                const currentPath = window.location.pathname;
                if (currentPath !== lastPath) {
                  // 通知主应用路由已变化
                  if (window.parent !== window) {
                    window.parent.postMessage({
                      type: 'vitepress-route-change',
                      path: currentPath
                    }, '*');
                  }
                  lastPath = currentPath;
                }
              });

              // 使用 MutationObserver 监听 DOM 变化，检测路由变化
              const observer = new MutationObserver(() => {
                const currentPath = window.location.pathname;
                if (currentPath !== lastPath) {

                  // 更新侧边栏高亮
                  updateSidebarHighlight(currentPath);

                  // 通知主应用路由已变化
                  if (window.parent !== window) {
                    window.parent.postMessage({
                      type: 'vitepress-route-change',
                      path: currentPath
                    }, '*');
                  }
                  lastPath = currentPath;
                }
              });

              // 更新侧边栏高亮的函数
              function updateSidebarHighlight(path: string) {
                // 移除所有现有的高亮
                document.querySelectorAll('.sidebar-link.active').forEach(el => {
                  el.classList.remove('active');
                });

                // 查找并高亮当前路径对应的侧边栏项
                const sidebarLinks = document.querySelectorAll('.sidebar-link');
                let activeLink = null;

                sidebarLinks.forEach(link => {
                  const href = link.getAttribute('href');
                  if (href && path.startsWith(href)) {
                    if (!activeLink || href.length > (activeLink.getAttribute('href')?.length || 0)) {
                      activeLink = link;
                    }
                  }
                });

                if (activeLink) {
                  activeLink.classList.add('active');

                  // 确保父级菜单展开
                  let parent = activeLink.closest('.sidebar-group');
                  while (parent) {
                    const toggle = parent.querySelector('.sidebar-heading');
                    if (toggle && parent.classList.contains('collapsed')) {
                      toggle.click();
                    }
                    parent = parent.parentElement?.closest('.sidebar-group');
                  }
                }
              }

              // 开始观察 DOM 变化
              observer.observe(document.body, {
                childList: true,
                subtree: true
              });

              // 恢复侧边栏高亮状态
              setTimeout(() => {
                const currentPath = window.location.pathname;
                updateSidebarHighlight(currentPath);
              }, 500);
            }

            // 再次确保清理所有主题相关的localStorage，保留路由状态
            localStorage.removeItem('vitepress-theme-appearance');
            localStorage.removeItem('vitepress-theme');
            localStorage.removeItem('vitepress-theme-color-scheme');
            localStorage.removeItem('isDark');

            // 强制移除dark类，确保不是暗黑主题
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');


            // 等待主应用同步主题状态，默认浅色主题
            const isDark = false; // 默认浅色主题，等待主应用同步

            // 立即应用浅色主题
            currentTheme = null;
            applyTheme(isDark);

            // 注册 Element Plus
            app.use(ElementPlus);

        // 监听来自主应用的消息
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'host:theme') {
            const { value } = event.data;
            const isDark = value === 'dark';
            // 重置状态，强制应用
            currentTheme = null;
            applyTheme(isDark);
          } else if (event.data?.type === 'update-parent-theme') {
            // 接收主应用的parent-theme更新
            const { value } = event.data;
            localStorage.setItem('parent-theme', value);

            // 立即应用主题（不重复应用）
            const isDark = value === 'dark';
            if (lastAppliedTheme !== isDark) {
              applyTheme(isDark);
            }
          } else if (event.data?.type === 'update-vueuse-theme') {
            // 接收主应用的VueUse主题状态
            const { value } = event.data;
            localStorage.setItem('vueuse-color-scheme', value);

            // 只有在没有parent-theme时才根据VueUse主题应用
            const parentTheme = localStorage.getItem('parent-theme');
            if (!parentTheme) {
              const isDark = value === 'auto';
              if (lastAppliedTheme !== isDark) {
                applyTheme(isDark);
              }
            }
          } else if (event.data?.type === 'btc-navigate') {
            // 接收主应用的导航指令（保留但不使用，让 VitePress 自己处理路由）
            // VitePress 有完美的原生路由系统，我们不需要干扰它
          }
        });

            // 监听 storage 事件（跨标签页同步）
            window.addEventListener('storage', (e) => {
              if (e.key === 'isDark') {
                const isDark = e.newValue ? JSON.parse(e.newValue) : false;
                // 清理iframe的localStorage，确保不会干扰，保留路由状态
                localStorage.removeItem('isDark');
                currentTheme = null;
                applyTheme(isDark);
              }
            });

            // VitePress主题切换按钮已被禁用，不需要拦截

            // 页面加载完成后，清理localStorage并等待主应用同步
            setTimeout(() => {
              // 只清理主题相关的localStorage，保留路由状态
              localStorage.removeItem('isDark');
              localStorage.removeItem('vitepress-theme-appearance');
              localStorage.removeItem('vitepress-theme');
              localStorage.removeItem('vitepress-theme-color-scheme');

              // 通知主应用iframe已准备好，请求主题同步
              if (window.parent !== window) {
                window.parent.postMessage({
                  type: 'vitepress-iframe-ready'
                }, '*');
              }
            }, 1000);

        // 通知父页面：VitePress 已准备好
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'vitepress-ready'
          }, '*');
        }

        // 监听 VitePress 内部的点击事件，通知主应用（用于关闭抽屉等）
        document.addEventListener('click', (e) => {
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'vitepress-clicked'
            }, '*');
          }
        });

        // 手动更新 outline 高亮的辅助函数
        function updateOutlineHighlight(targetId: string) {
          // 移除所有 active 类
          document.querySelectorAll('.VPDocAsideOutline .outline-link').forEach(link => {
            link.classList.remove('active');
          });

          // 为对应的 outline 链接添加 active 类
          const outlineLink = document.querySelector(`.VPDocAsideOutline .outline-link[href="#${targetId}"]`) as HTMLElement;
          if (outlineLink) {
            outlineLink.classList.add('active');

            // 精确更新定位符位置
            const marker = document.querySelector('.VPDocAsideOutline .outline-marker') as HTMLElement;
            if (marker) {
              const linkRect = outlineLink.getBoundingClientRect();
              const outlineContainer = document.querySelector('.VPDocAsideOutline .content') as HTMLElement;
              if (outlineContainer) {
                const containerRect = outlineContainer.getBoundingClientRect();
                // 计算相对于容器的精确位置，考虑链接的垂直中心
                const linkCenter = linkRect.top + linkRect.height / 2;
                const containerTop = containerRect.top;
                const relativeTop = linkCenter - containerTop - 8; // 8px 是定位符高度的一半，实现垂直居中

                marker.style.top = `${Math.max(0, relativeTop)}px`;
                marker.style.opacity = '1';
                marker.style.display = 'block';
              }
            }
          }
        }

        // 使用 capture 阶段拦截锚点点击，优先于 VitePress 的默认处理
        document.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const link = target.closest('a');

          if (link && link.href && link.href.includes('#')) {
            const url = new URL(link.href);
            const currentUrl = new URL(window.location.href);

            // 如果是同页面的锚点跳转
            if (url.pathname === currentUrl.pathname && url.hash) {
              e.preventDefault();
              e.stopPropagation();

              // 解码 URL 编码的中文锚点（如 %E4%BD%BF%E7%94%A8%E7%A4%BA%E4%BE%8B → 使用示例）
              const targetId = decodeURIComponent(url.hash.slice(1));
              const targetElement = document.getElementById(targetId);

              if (targetElement) {
                // 找到滚动容器（.VPContent）
                const scrollContainer = document.querySelector('.VPContent') as HTMLElement;

                if (scrollContainer) {
                  // 获取目标元素的 offsetTop 并滚动
                  const targetTop = targetElement.offsetTop;
                  const scrollTop = targetTop - 80; // 80px 顶部偏移

                  scrollContainer.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                  });

                  // 滚动完成后，手动更新 outline 高亮
                  setTimeout(() => {
                    updateOutlineHighlight(targetId);
                  }, 300);
                } else {
                  // 降级方案：使用 scrollIntoView
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                  setTimeout(() => {
                    updateOutlineHighlight(targetId);
                  }, 300);
                }

                // 更新 URL hash（不触发导航）
                history.replaceState(null, '', url.hash);
              }
            }
          }
        }, true); // 使用 capture 阶段

        // 监听页面滚动，自动更新定位符位置（更精细的监听）
        let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

        function handleScroll() {
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }

          scrollTimeout = setTimeout(() => {
            // 获取当前视口中的所有标题元素
            const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
            let currentHeading = null;
            let minDistance = Infinity;

            // 检查是否在页面顶部（没有标题在视口中）
            const scrollTop = document.querySelector('.VPContent')?.scrollTop || 0;
            const isAtTop = scrollTop < 50;

            if (isAtTop && headings.length > 0) {
              // 如果在顶部，激活第一个标题
              currentHeading = headings[0];
            } else {
              // 找到距离视口顶部最近的标题
              headings.forEach((heading) => {
                const rect = heading.getBoundingClientRect();
                const distance = Math.abs(rect.top - 100); // 100px 偏移量

                // 如果标题在视口上方或接近视口顶部
                if (rect.top <= 200 && distance < minDistance) {
                  minDistance = distance;
                  currentHeading = heading;
                }
              });
            }

            // 如果有当前标题，更新定位符
            if (currentHeading && currentHeading.id) {
              updateOutlineHighlight(currentHeading.id);
            }
          }, 10); // 10ms 防抖
        }

        // 监听多个滚动事件
        const scrollContainer = document.querySelector('.VPContent');
        if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }

        // 也监听 window 的滚动事件（以防万一）
        window.addEventListener('scroll', handleScroll, { passive: true });

        // 监听鼠标滚轮事件
        document.addEventListener('wheel', handleScroll, { passive: true });

        // 监听触摸滚动事件（移动端）
        document.addEventListener('touchmove', handleScroll, { passive: true });

        // 页面加载完成后立即检查并显示定位符
        setTimeout(() => {
          handleScroll();
        }, 100);

        // 监听 DOM 变化，确保动态内容加载后也能正确显示
        const observer = new MutationObserver(() => {
          setTimeout(() => {
            handleScroll();
          }, 50);
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false
        });

      } catch (error) {
        console.error('[VitePress] Failed to sync theme:', error);
      }
    }

    // 注册全局组件
    app.component('DocumentMeta', DocumentMeta);
    app.component('Demo', Demo);
    app.component('ComponentOverview', ComponentOverview);
  }
} satisfies Theme;

