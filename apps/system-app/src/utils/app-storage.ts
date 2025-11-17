/**
 * 简化的存储管理工具
 */

const getItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 忽略存储错误
  }
};

export const appStorage = {
  auth: {
    getToken: () => getItem('token') || getItem('access_token'),
    setToken: (token: string) => {
      setItem('token', token);
      setItem('access_token', token);
    },
  },
  user: {
    get: () => {
      const userStr = getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
      return null;
    },
  },
};

