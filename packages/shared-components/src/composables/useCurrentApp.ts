import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

/**
 * 获取当前应用名称
 * 注意：这个函数需要由使用共享布局的应用提供 getActiveApp 函数
 * 可以通过全局函数或 provide/inject 传递
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('system');

  const detectCurrentApp = () => {
    const path = route.path;
    // 优先检查子域名
    const hostname = window.location.hostname;
    const subdomainMap: Record<string, string> = {
      'admin.bellis.com.cn': 'admin',
      'logistics.bellis.com.cn': 'logistics',
      'quality.bellis.com.cn': 'quality',
      'production.bellis.com.cn': 'production',
      'engineering.bellis.com.cn': 'engineering',
      'finance.bellis.com.cn': 'finance',
    };
    
    if (subdomainMap[hostname]) {
      currentApp.value = subdomainMap[hostname];
      return;
    }
    
    // 回退到路径匹配
    if (path.startsWith('/admin')) {
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
    } else if (path.startsWith('/monitor')) {
      currentApp.value = 'monitor';
    } else {
      // 系统域是默认域，包括 /、/data/* 以及其他所有未匹配的路径
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

  return {
    currentApp,
    detectCurrentApp,
  };
}

