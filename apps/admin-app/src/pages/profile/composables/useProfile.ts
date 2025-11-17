/**
 * 个人信息页面业务逻辑
 */

import { ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';
import { appStorage } from '@/utils/app-storage';

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

    loading.value = true;
    try {
      // 根据 prefix: admin/system/base/profile，服务路径应该是 system.base.profile
      const profileService = service.system?.base?.profile;
      if (!profileService?.info) {
        console.error('profileService 不存在，可用服务:', service.system?.base);
        BtcMessage.warning('用户信息服务不可用');
        return;
      }

      const data = await profileService.info(showFull ? { showFull: true } : undefined);
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

