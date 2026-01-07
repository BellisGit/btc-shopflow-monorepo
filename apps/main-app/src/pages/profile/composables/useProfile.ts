/**
 * 个人信息页面业务逻辑
 */

import { ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { appStorage } from '@/utils/app-storage';
import { service } from '@services/eps';

/**
 * 个人信息 composable
 */
export function useProfile() {
  // 用户信息
  const userInfo = ref<any>({});
  const loading = ref(false);
  const showFullInfo = ref(false);

  /**
   * 加载用户信息
   * @param showFull 是否显示完整信息（true=明文，false=脱敏）
   */
  const loadUserInfo = async (showFull = false) => {
    // 优先从统一存储读取缓存
    const cachedAvatar = appStorage.user.getAvatar();
    const cachedName = appStorage.user.getName();
    if (cachedAvatar || cachedName) {
      userInfo.value = {
        ...userInfo.value,
        ...(cachedAvatar && { avatar: cachedAvatar }),
        ...(cachedName && { name: cachedName }),
      };
    }

    // 关键：检查用户是否已登录（通过 btc_user cookie 判断），退出登录后不应该调用接口
    const user = appStorage.user.get();
    if (!user) {
      BtcMessage.warning('请先登录');
      return;
    }

    loading.value = true;
    try {
      // 获取 EPS service（支持动态获取和全局服务）
      const getEpsService = () => {
        // 优先使用全局服务
        if (typeof window !== 'undefined') {
          const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
          if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
            return globalService;
          }
        }
        // 检查静态导入的 service 是否有有效内容
        if (service && typeof service === 'object' && Object.keys(service).length > 0) {
          return service;
        }
        return null;
      };

      // 等待 EPS 服务可用（轮询方式，最多等待 3 秒）
      const waitForEpsService = async (
        maxWaitTime = 3000,
        interval = 100,
        predicate: (service: any) => boolean = (s) => !!s?.admin?.base?.profile?.info,
      ): Promise<any> => {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
          let currentService = getEpsService();

          // 如果 getEpsService 返回 null（静态导入的 service 是空对象），尝试动态导入
          if (!currentService) {
            try {
              const epsModule = await import('@services/eps');
              currentService = epsModule.service || epsModule.default;
              // 如果动态导入成功，更新全局服务
              if (currentService && typeof currentService === 'object' && Object.keys(currentService).length > 0) {
                if (typeof window !== 'undefined') {
                  (window as any).__APP_EPS_SERVICE__ = currentService;
                  (window as any).__BTC_SERVICE__ = currentService;
                  (window as any).service = currentService;
                }
              }
            } catch (error) {
              // 动态导入失败，继续轮询
            }
          }

          if (currentService && predicate(currentService)) {
            return currentService;
          }
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        return null;
      };

      // 等待 EPS 服务可用
      const currentService = await waitForEpsService();
      if (!currentService?.admin?.base?.profile?.info) {
        BtcMessage.warning('用户信息服务不可用');
        return;
      }

      const data = await currentService.admin.base.profile.info(showFull ? { showFull: true } : undefined);
      userInfo.value = data || {};

      // 更新统一存储（头像和用户名）
      if (data?.avatar) {
        appStorage.user.setAvatar(data.avatar);
      }
      if (data?.name) {
        appStorage.user.setName(data.name);
      }

      // 触发同步事件，通知顶栏更新
      window.dispatchEvent(new CustomEvent('userInfoUpdated', {
        detail: {
          avatar: data?.avatar,
          name: data?.name
        }
      }));
    } catch (error: any) {
      console.error('加载用户信息失败:', error);
      BtcMessage.error(error?.message || '加载用户信息失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 切换显示完整信息
   */
  const handleToggleShowFull = () => {
    showFullInfo.value = !showFullInfo.value;
    loadUserInfo(showFullInfo.value);
  };

  return {
    userInfo,
    loading,
    showFullInfo,
    loadUserInfo,
    handleToggleShowFull
  };
}

