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

      // 跳转到登录页
      router.push('/login');
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 强制清除所有缓存
      deleteCookie('access_token');
      appStorage.auth.clear();
      appStorage.user.clear();
      clearUserInfo();
      // 清除标签页（Process Store）
      getProcessStore().then(store => store.clear()).catch(() => {
        // 忽略错误
      });

      // 跳转到登录页
      router.push('/login');
    }
  };

  return {
    logout
  };
}

