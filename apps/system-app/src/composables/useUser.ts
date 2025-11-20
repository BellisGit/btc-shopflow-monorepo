import { ref, computed } from 'vue';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string | number;
  name?: string;
  username: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * 用户状态管理
 */
const userInfo = ref<UserInfo | null>(null);

/**
 * 用户相关的composable
 */
export function useUser() {
  /**
   * 获取用户信息（从统一的 btc_user 中读取，不创建 user key）
   */
  const getUserInfo = (): UserInfo | null => {
    try {
      // 优先从统一的 btc_user 中读取
      const userStr = localStorage.getItem('btc_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userInfo.value = user;
        return user;
      }
      // 向后兼容：如果 btc_user 不存在，尝试读取旧的 user key（但不创建新key）
      const oldUserStr = localStorage.getItem('user');
      if (oldUserStr) {
        const user = JSON.parse(oldUserStr);
        userInfo.value = user;
        // 迁移到统一存储（不创建新key）
        localStorage.setItem('btc_user', oldUserStr);
        return user;
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
    return null;
  };

  /**
   * 设置用户信息（存储到统一的 btc_user 中，不创建 user key）
   */
  const setUserInfo = (user: UserInfo) => {
    try {
      // 只存储在统一的 btc_user 中，不创建 user key
      localStorage.setItem('btc_user', JSON.stringify(user));
      userInfo.value = user;
    } catch (err) {
      console.error('设置用户信息失败:', err);
    }
  };

  /**
   * 清除用户信息（只清除统一的 btc_user，不清除旧的 user key）
   */
  const clearUserInfo = () => {
    // 只删除统一的 btc_user，不清除旧的 user key（用户自己清理）
    localStorage.removeItem('btc_user');
    userInfo.value = null;
  };

  /**
   * 获取用户ID
   */
  const getUserId = (): string | number | undefined => {
    const user = getUserInfo();
    return user?.id;
  };

  /**
   * 获取用户昵称
   */
  const getUserName = (): string | undefined => {
    const user = getUserInfo();
    return user?.name || user?.username;
  };

  /**
   * 检查是否已登录
   */
  const isLoggedIn = computed(() => {
    return !!userInfo.value?.id;
  });

  // 初始化时获取用户信息
  if (!userInfo.value) {
    getUserInfo();
  }

  return {
    userInfo: computed(() => userInfo.value),
    getUserInfo,
    setUserInfo,
    clearUserInfo,
    getUserId,
    getUserName,
    isLoggedIn,
  };
}
