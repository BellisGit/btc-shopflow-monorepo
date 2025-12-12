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
    const subdomainMap: Record<string, string> = {
      'admin.bellis.com.cn': 'admin',
      'logistics.bellis.com.cn': 'logistics',
      'quality.bellis.com.cn': 'quality',
      'production.bellis.com.cn': 'production',
      'engineering.bellis.com.cn': 'engineering',
      'finance.bellis.com.cn': 'finance',
      'monitor.bellis.com.cn': 'monitor',
    };
    
    // 关键：优先通过子域名识别应用（生产环境的主要方式）
    // 在生产环境中，通过子域名访问时路径是 /，必须通过子域名识别
    if (hostname && subdomainMap[hostname]) {
      const detectedApp = subdomainMap[hostname];
      // 仅在开发环境输出日志
      if (import.meta.env.DEV) {
        console.log(`[useCurrentApp] 通过子域名识别应用: ${hostname} -> ${detectedApp}`);
      }
      currentApp.value = detectedApp;
      return;
    }
    
    // 检查是否使用了 layout-app（通过 __USE_LAYOUT_APP__ 标志）
    // 在使用 layout-app 时，也可能通过子域名访问
    if ((window as any).__USE_LAYOUT_APP__ && hostname && subdomainMap[hostname]) {
      const detectedApp = subdomainMap[hostname];
      // 仅在开发环境输出日志
      if (import.meta.env.DEV) {
        console.log(`[useCurrentApp] 通过 layout-app 子域名识别应用: ${hostname} -> ${detectedApp}`);
      }
      currentApp.value = detectedApp;
      return;
    }
    
    // 仅在开发环境输出日志
    if (import.meta.env.DEV) {
      console.log(`[useCurrentApp] 子域名未匹配，使用路径匹配: hostname=${hostname}, path=${path}`);
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

  // 在生产环境子域名下，也需要监听 hostname 的变化
  // 因为路径可能是 /，必须通过子域名识别
  if (typeof window !== 'undefined') {
    // 立即执行一次检测
    detectCurrentApp();
    
    // 监听 hostname 变化（虽然通常不会变化，但作为保险）
    const originalHostname = window.location.hostname;
    const checkHostname = () => {
      if (window.location.hostname !== originalHostname) {
        detectCurrentApp();
      }
    };
    // 使用 MutationObserver 监听 location 变化（虽然不直接支持，但可以通过其他方式）
    // 或者使用 setInterval 定期检查（不推荐，但作为后备）
  }

  // 生产环境也显示应用识别信息（仅在开发环境）
  if (import.meta.env.DEV) {
    watch(
      () => currentApp.value,
      (newApp) => {
        try {
          if (typeof document !== 'undefined') {
            const msg = `[应用识别] 当前应用: ${newApp}, 路径: ${route.path}, 域名: ${window.location.hostname}`;
            let debugEl = document.getElementById('__current-app-debug__');
            if (!debugEl) {
              debugEl = document.createElement('div');
              debugEl.id = '__current-app-debug__';
              debugEl.style.cssText = 'position:fixed;top:170px;right:10px;background:purple;color:white;padding:10px;z-index:99999;font-size:12px;max-width:400px;word-break:break-all;';
              document.body.appendChild(debugEl);
            }
            debugEl.textContent = msg;
            setTimeout(() => {
              if (debugEl && debugEl.parentNode) {
                debugEl.parentNode.removeChild(debugEl);
              }
            }, 5000);
          }
        } catch (e) {
          // 忽略错误
        }
      },
      { immediate: true }
    );
  }

  return {
    currentApp,
    detectCurrentApp,
  };
}

