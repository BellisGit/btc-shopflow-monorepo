// @ts-expect-error - 类型声明文件可能未构建，但运行时可用
import { BtcMessage, useProcessStore } from '@btc/shared-components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
// import { authApi } from '@/modules/api-services'; // Removed direct import
import { deleteCookie } from '@/utils/cookie';
import { appStorage } from '@/utils/app-storage';

// Declare global interface for authApi
declare global {
  interface Window {
    __APP_AUTH_API__?: {
      logout: () => Promise<void>;
    };
  }
}

/**
 * 退出登录 composable
 */
export function useLogout() {
  const router = useRouter();
  const { t } = useI18n();
  const processStore = useProcessStore();

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 调用后端 logout API (通过全局函数获取，如果存在)
      try {
        const authApi = (window as any).__APP_AUTH_API__;
        if (authApi?.logout) {
          await authApi.logout();
        } else {
          console.warn('[useLogout] Auth API logout function not available globally.');
        }
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

      // 清除标签页（Process Store）
      processStore.clear();

      // 清除其他可能的缓存
      // 如果有使用 IndexedDB，也需要清除
      // 如果有使用其他缓存库，也需要清除

      // 显示退出成功提示
      BtcMessage.success(t('common.logoutSuccess'));

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
      
      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用路由跳转，添加 logout=1 参数
        router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      console.error('Logout error:', error);

      // 强制清除所有缓存
      deleteCookie('access_token');
      appStorage.auth.clear();
      appStorage.user.clear();
      processStore.clear();

      // 跳转到登录页，添加 logout=1 参数，让路由守卫知道这是退出登录，不要重定向
      // 判断是否在生产环境的子域名下
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
      
      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用路由跳转，添加 logout=1 参数
        router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    }
  };

  return {
    logout
  };
}

