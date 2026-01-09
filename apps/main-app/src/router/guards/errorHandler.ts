import type { Router } from 'vue-router';

/**
 * 设置路由错误处理
 */
export function setupErrorHandler(router: Router) {
  router.onError((error: Error) => {
    // 如果是组件加载失败，尝试重新加载或重定向到登录页
    if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
      const currentRoute = router.currentRoute.value;
      if (currentRoute && currentRoute.matched.length > 0) {
        const route = currentRoute.matched[currentRoute.matched.length - 1];

        // 关键：如果是登录页组件加载失败，尝试重定向到登录页（使用 replace 避免历史记录）
        if (route && (route.path === '/login' || currentRoute.path === '/login')) {
          setTimeout(() => {
            try {
              const loginRoute = router.resolve('/login');
              if (loginRoute && loginRoute.matched.length > 0) {
                router.replace('/login').catch(() => {
                  window.location.href = '/login';
                });
              } else {
                window.location.href = '/login';
              }
            } catch (error) {
              window.location.href = '/login';
            } finally {
              const loadingEl = document.getElementById('Loading');
              if (loadingEl) {
                loadingEl.style.setProperty('display', 'none', 'important');
              }
            }
          }, 100);
          return;
        }
      }

      // 如果组件加载失败且不是登录页，尝试重定向到登录页
      if (currentRoute && currentRoute.path !== '/login') {
        setTimeout(() => {
          try {
            const loginRoute = router.resolve('/login');
            if (loginRoute && loginRoute.matched.length > 0) {
              router.replace({
                path: '/login',
                query: { oauth_callback: currentRoute.fullPath },
              }).catch(() => {
                window.location.href = `/login?oauth_callback=${encodeURIComponent(currentRoute.fullPath)}`;
              });
            } else {
              window.location.href = `/login?oauth_callback=${encodeURIComponent(currentRoute.fullPath)}`;
            }
          } catch (error) {
            window.location.href = `/login?oauth_callback=${encodeURIComponent(currentRoute.fullPath)}`;
          } finally {
            const loadingEl = document.getElementById('Loading');
            if (loadingEl) {
              loadingEl.style.setProperty('display', 'none', 'important');
            }
          }
        }, 100);
      }
      return;
    }

    // 处理 __vccOpts 错误（Vue 组件未正确加载）
    if (error.message && (error.message.includes('__vccOpts') || error.message.includes('Cannot read properties of undefined') || error.message.includes("Cannot use 'in' operator"))) {
      const currentRoute = router.currentRoute.value;

      // 关键：如果路由未匹配，说明是路由配置问题，不应该尝试重新加载组件
      if (currentRoute && currentRoute.matched.length === 0) {
        // 路由未匹配，可能是子应用路由或无效路由
        // 不要尝试重新加载，让应用正常显示（可能显示 Layout 或子应用挂载点）
        // 移除 Loading 元素
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
        }
        return;
      }

      // 如果是登录页组件错误，尝试重定向到登录页
      if (currentRoute && (currentRoute.path === '/login' || currentRoute.matched.some((m: import('vue-router').RouteRecordNormalized) => m.path === '/login'))) {
        setTimeout(() => {
          try {
            const loginRoute = router.resolve('/login');
            if (loginRoute && loginRoute.matched.length > 0) {
              router.replace('/login').catch(() => {
                window.location.href = '/login';
              });
            } else {
              window.location.href = '/login';
            }
          } catch (error) {
            window.location.href = '/login';
          } finally {
            const loadingEl = document.getElementById('Loading');
            if (loadingEl) {
              loadingEl.style.setProperty('display', 'none', 'important');
            }
          }
        }, 100);
        return;
      }

      // 对于根路径 `/`，检查是否是 Layout 或子路由组件加载问题
      if (currentRoute && currentRoute.path === '/') {
        setTimeout(() => {
          router.replace('/').catch(() => {
            const loadingEl = document.getElementById('Loading');
            if (loadingEl) {
              loadingEl.style.setProperty('display', 'none', 'important');
            }
          });
        }, 500);
        return;
      }

      // 尝试重新加载当前路由
      if (currentRoute && currentRoute.path) {
        setTimeout(() => {
          router.replace(currentRoute.fullPath).catch(() => {
            // 如果重新加载失败，重定向到登录页
            if (currentRoute.path !== '/login') {
              router.replace({
                path: '/login',
                query: { oauth_callback: currentRoute.fullPath },
              }).catch(() => {
                const loadingEl = document.getElementById('Loading');
                if (loadingEl) {
                  loadingEl.style.setProperty('display', 'none', 'important');
                }
              });
            }
          });
        }, 100);
      }
      return;
    }

    // 处理 single-spa 相关错误
    if (error.message && error.message.includes('single-spa')) {
      return;
    }
  });
}

