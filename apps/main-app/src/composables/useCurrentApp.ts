import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

/**
 * 获取当前应用名称
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('main');

  const detectCurrentApp = () => {
    const path = route.path;
    if (path.startsWith('/logistics')) {
      currentApp.value = 'logistics';
    } else if (path.startsWith('/engineering')) {
      currentApp.value = 'engineering';
    } else if (path.startsWith('/quality')) {
      currentApp.value = 'quality';
    } else if (path.startsWith('/production')) {
      currentApp.value = 'production';
    } else {
      currentApp.value = 'main';
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

