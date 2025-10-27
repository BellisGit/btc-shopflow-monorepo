import { ref, computed } from 'vue';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  name: string;
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
   * 获取用户信息
   */
  const getUserInfo = (): UserInfo | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userInfo.value = user;
        return user;
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
    return null;
  };

  /**
   * 设置用户信息
   */
  const setUserInfo = (user: UserInfo) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      userInfo.value = user;
    } catch (err) {
      console.error('设置用户信息失败:', err);
    }
  };

  /**
   * 清除用户信息
   */
  const clearUserInfo = () => {
    localStorage.removeItem('user');
    userInfo.value = null;
  };

  /**
   * 获取用户ID
   */
  const getUserId = (): number | undefined => {
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
