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
    // 优先检查子域名（生产环境的关键识别方式）
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port || '' : '';

    const subdomainMap: Record<string, string> = {
      'admin.bellis.com.cn': 'admin',
      'logistics.bellis.com.cn': 'logistics',
      'quality.bellis.com.cn': 'quality',
      'production.bellis.com.cn': 'production',
      'engineering.bellis.com.cn': 'engineering',
      'finance.bellis.com.cn': 'finance',
      'operations.bellis.com.cn': 'operations',
      'dashboard.bellis.com.cn': 'dashboard',
      'personnel.bellis.com.cn': 'personnel',
    };

    // 预览环境端口映射（根据 app-env.config.ts 中的配置）
    const portMap: Record<string, string> = {
      '4180': 'system',   // system-app 预览端口
      '4181': 'admin',    // admin-app 预览端口
      '4182': 'logistics', // logistics-app 预览端口
      '4183': 'quality',  // quality-app 预览端口
      '4184': 'production', // production-app 预览端口
      '4185': 'engineering', // engineering-app 预览端口
      '4186': 'finance',  // finance-app 预览端口
      '4189': 'operations',  // operations-app 预览端口
    };

    // 关键：优先通过子域名识别应用（生产环境的主要方式）
    // 在生产环境中，通过子域名访问时路径是 /，必须通过子域名识别
    if (hostname && subdomainMap[hostname]) {
      const detectedApp = subdomainMap[hostname];
      currentApp.value = detectedApp;
      return;
    }

    // 检查是否使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志）
    // 在使用 layout-app 时，也可能通过子域名访问
    if ((window as any).__USE_LAYOUT_APP__ && hostname && subdomainMap[hostname]) {
      const detectedApp = subdomainMap[hostname];
      currentApp.value = detectedApp;
      return;
    }

    // 关键：在预览环境中，通过端口识别应用（当路径为 / 且无法通过子域名识别时）
    // 这解决了预览环境中通过 IP + 端口访问时无法识别应用的问题
    if (port && portMap[port] && path === '/') {
      const detectedApp = portMap[port];
      currentApp.value = detectedApp;
      return;
    }

    // 回退到路径匹配（开发环境或主域名访问时）
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
    } else if (path.startsWith('/operations')) {
      currentApp.value = 'operations';
    } else if (path.startsWith('/dashboard')) {
      currentApp.value = 'dashboard';
    } else if (path.startsWith('/personnel')) {
      currentApp.value = 'personnel';
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

