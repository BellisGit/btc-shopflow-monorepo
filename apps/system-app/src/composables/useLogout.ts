import { BtcMessage } from '@btc/shared-components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authApi } from '@/modules/api-services';
import { useUser } from './useUser';
// 使用动态导入避免循环依赖
// import { useProcessStore } from '@/store/process';
import { deleteCookie } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

/**
 * 退出登录 composable
 */
export function useLogout() {
  const router = useRouter();
  const { t } = useI18n();
  const { clearUserInfo } = useUser();
  // 延迟获取 processStore，避免循环依赖
  let processStore: ReturnType<typeof import('@/store/process').useProcessStore> | null = null;

  const getProcessStore = async () => {
    if (!processStore) {
      const { useProcessStore } = await import('@/store/process');
      processStore = useProcessStore();
    }
    return processStore;
  };

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 关键：停止 user-check 轮询，清除 sessionStorage 中的状态
      // 使用动态导入避免循环依赖
      try {
        const { stopDynamicPolling } = await import('@/utils/domain-cache');
        stopDynamicPolling(true);
      } catch (error) {
        // 如果导入失败，静默处理（可能 domain-cache 还未加载）
        if (import.meta.env.DEV) {
          console.warn('Failed to stop user-check polling on logout:', error);
        }
      }

      // 停止全局用户检查轮询
      try {
        const { stopUserCheckPolling } = await import('@btc/shared-core/composables/user-check');
        stopUserCheckPolling();
      } catch (error) {
        // 如果导入失败，静默处理
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      }

      // 调用后端 logout API
      // 注意：即使后端 API 失败，前端也要执行清理操作
      try {
        await authApi.logout();
      } catch (error: any) {
        // 后端 API 失败不影响前端清理
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }

      // 清除 cookie 中的 token
      deleteCookie('access_token');

      // 清除登录状态标记（从统一的 settings 存储中移除）
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      if (currentSettings.is_logged_in) {
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }

      // 清除所有认证相关数据（使用统一存储管理器）
      appStorage.auth.clear();
      appStorage.user.clear();

      // 清除所有 sessionStorage（可选，根据需求决定）
      // sessionStorage.clear();

      // 清除用户状态
      clearUserInfo();

      // 清除标签页（Process Store）
      const store = await getProcessStore();
      store.clear();

      // 清除其他可能的缓存
      // 如果有使用 IndexedDB，也需要清除
      // 如果有使用其他缓存库，也需要清除

      // 显示退出成功提示
      BtcMessage.success(t('common.logoutSuccess'));

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 使用 replace 而不是 push，避免在历史记录中留下退出前的页面
      router.replace({
        path: '/login',
        query: { logout: '1' }
      });
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 关键：停止 user-check 轮询，清除 sessionStorage 中的状态
      try {
        const { stopDynamicPolling } = await import('@/utils/domain-cache');
        stopDynamicPolling(true);
      } catch (importError) {
        // 如果导入失败，静默处理
      }

      // 强制清除所有缓存
      deleteCookie('access_token');
      // 清除登录状态标记（从统一的 settings 存储中移除）
      const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
      if (currentSettings.is_logged_in) {
        delete currentSettings.is_logged_in;
        appStorage.settings.set(currentSettings);
      }
      appStorage.auth.clear();
      appStorage.user.clear();
      clearUserInfo();
      // 清除标签页（Process Store）
      getProcessStore().then(store => store.clear()).catch(() => {
        // 忽略错误
      });

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      router.replace({
        path: '/login',
        query: { logout: '1' }
      });
    }
  };

  return {
    logout
  };
}

