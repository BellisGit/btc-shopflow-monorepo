/**
 * 统一的存储管理工具
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

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // 忽略存储错误
  }
};

// 获取所有设置
const getAllSettings = (): Record<string, any> => {
  const settingsStr = getItem('btc_settings');
  if (settingsStr) {
    try {
      return JSON.parse(settingsStr);
    } catch {
      return {};
    }
  }
  return {};
};

// 保存所有设置
const setAllSettings = (settings: Record<string, any>): void => {
  setItem('btc_settings', JSON.stringify(settings));
};

export const appStorage = {
  /**
   * 初始化存储管理器
   */
  init(version?: string): void {
    // 初始化逻辑（如果需要）
  },
  auth: {
    getToken: () => getItem('token') || getItem('access_token'),
    setToken: (token: string) => {
      setItem('token', token);
      setItem('access_token', token);
    },
    removeToken: () => {
      removeItem('token');
      removeItem('access_token');
    },
    clear: () => {
      removeItem('token');
      removeItem('access_token');
      removeItem('refreshToken');
    },
  },
  user: {
    get: () => {
      // 只从统一的 btc_user 中读取，不创建 user key
      const userStr = getItem('btc_user');
      // 向后兼容：如果 btc_user 不存在，尝试读取旧的 user key（但不创建新key）
      if (!userStr) {
        const oldUserStr = getItem('user');
        if (oldUserStr) {
          // 迁移到统一存储（不创建新key）
          try {
            const oldUser = JSON.parse(oldUserStr);
            setItem('btc_user', oldUserStr);
            return oldUser;
          } catch {
            return null;
          }
        }
      }
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
      return null;
    },
    set: (user: any) => {
      // 只存储在统一的 btc_user 中，不创建 user key
      setItem('btc_user', JSON.stringify(user));
    },
    remove: () => {
      // 只删除统一的 btc_user，不清除旧的 user key（用户自己清理）
      removeItem('btc_user');
    },
    clear: () => {
      // 只删除统一的 btc_user，不清除旧的 user key（用户自己清理）
      removeItem('btc_user');
    },
    /**
     * 获取头像（从统一的 btc_user 存储中获取）
     */
    getAvatar() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取
      if (user?.avatar) {
        return user.avatar;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldAvatar = getItem('user_avatar');
      if (oldAvatar) {
        // 迁移到统一存储（不创建新key）
        const currentUser = user || {};
        this.set({ ...currentUser, avatar: oldAvatar });
        return oldAvatar;
      }
      return null;
    },
    /**
     * 设置头像（存储到统一的 btc_user 中，不创建独立的 user_avatar key）
     */
    setAvatar(avatar: string) {
      const user = this.get() || {};
      this.set({ ...user, avatar });
      // 只存储在 btc_user 中，不创建独立的 user_avatar key
    },
    /**
     * 获取用户名（从统一的 btc_user 存储中获取）
     */
    getName() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取
      if (user?.name) {
        return user.name;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldName = getItem('user_name');
      if (oldName) {
        // 迁移到统一存储（不创建新key）
        const currentUser = user || {};
        this.set({ ...currentUser, name: oldName });
        return oldName;
      }
      return null;
    },
    /**
     * 设置用户名（存储到统一的 btc_user 中，不创建独立的 user_name key）
     */
    setName(name: string) {
      const user = this.get() || {};
      this.set({ ...user, name });
      // 只存储在 btc_user 中，不创建独立的 user_name key
    },
    /**
     * 获取用户名（登录用）
     */
    getUsername() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取
      if (user?.username) {
        return user.username;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldUsername = getItem('username');
      if (oldUsername) {
        // 迁移到统一存储（不创建新key）
        const currentUser = user || {};
        this.set({ ...currentUser, username: oldUsername });
        return oldUsername;
      }
      return null;
    },
    /**
     * 设置用户名（登录用，存储到统一的 btc_user 中，不创建独立的 username key）
     */
    setUsername(username: string) {
      const user = this.get() || {};
      this.set({ ...user, username });
      // 只存储在 btc_user 中，不创建独立的 username key
    },
  },
  settings: {
    get: (): Record<string, any> => {
      return getAllSettings();
    },
    set: (data: Record<string, any>): void => {
      const current = getAllSettings();
      setAllSettings({ ...current, ...data });
    },
    getItem: (key: string): any => {
      const settings = getAllSettings();
      return settings[key] ?? null;
    },
    setItem: (key: string, value: any): void => {
      const settings = getAllSettings();
      settings[key] = value;
      setAllSettings(settings);
    },
    removeItem: (key: string): void => {
      const settings = getAllSettings();
      delete settings[key];
      setAllSettings(settings);
    },
  },
};

