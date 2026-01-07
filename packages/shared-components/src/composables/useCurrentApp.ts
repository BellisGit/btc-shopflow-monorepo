import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentSubApp } from '@configs/unified-env-config';

/**
 * 获取当前应用名称
 * 使用统一的环境检测方案
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('system');

  const detectCurrentApp = () => {
    // 使用统一的环境检测函数
    const detectedApp = getCurrentSubApp();
    if (detectedApp) {
      currentApp.value = detectedApp;
      return;
    }

    // 如果没有检测到子应用，尝试通过路径前缀判断（开发环境的兜底逻辑）
    const path = route.path;

    // 回退到路径匹配（开发环境或主域名访问时）
    // 关键：主应用路由包括 /overview、/todo、/profile
    if (path === '/overview' || path === '/' || path === '/todo' || path.startsWith('/todo/') || path === '/profile') {
      currentApp.value = 'main';
    } else if (path.startsWith('/admin')) {
      currentApp.value = 'admin';
    } else if (path.startsWith('/logistics')) {
      currentApp.value = 'logistics';
    } else if (path.startsWith('/engineering')) {
      currentApp.value = 'engineering';
    } else if (path.startsWith('/quality')) {
      currentApp.value = 'quality';
    } else if (path.startsWith('/production')) {
      currentApp.value = 'production';
    } else if (path.startsWith('/finance')) {
      currentApp.value = 'finance';
    } else if (path.startsWith('/docs')) {
      currentApp.value = 'docs';
    } else if (path.startsWith('/operations')) {
      currentApp.value = 'operations';
    } else if (path.startsWith('/dashboard')) {
      currentApp.value = 'dashboard';
    } else if (path.startsWith('/personnel')) {
      currentApp.value = 'personnel';
    } else if (path.startsWith('/system')) {
      currentApp.value = 'system';
    } else {
      // 系统域是默认域，包括 /data/* 以及其他所有未匹配的路径
      currentApp.value = 'system';
    }
  };

  watch(
    () => route.path,
    () => {
      detectCurrentApp();
    },
    { immediate: true }
  );

  // 在生产环境子域名下，也需要监听 hostname 的变化
  // 因为路径可能是 /，必须通过子域名识别
  if (typeof window !== 'undefined') {
    // 立即执行一次检测
    detectCurrentApp();

    // 使用 MutationObserver 监听 location 变化（虽然不直接支持，但可以通过其他方式）
    // 或者使用 setInterval 定期检查（不推荐，但作为后备）
  }


  return {
    currentApp,
    detectCurrentApp,
  };
}

