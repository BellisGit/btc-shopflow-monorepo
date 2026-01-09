import { ref, onMounted } from 'vue';
import { storage } from '@btc/shared-utils';

const STORAGE_KEY = 'mobile_remembered_username';

export function useRememberMe() {
  const rememberMe = ref(false);
  const rememberedUsername = ref('');

  // 从本地存储恢复记住的用户名
  onMounted(() => {
    const stored = storage.get<string>(STORAGE_KEY);
    if (stored) {
      rememberedUsername.value = stored;
      rememberMe.value = true;
    }
  });

  // 保存用户名
  const saveUsername = (username: string) => {
    if (rememberMe.value) {
      storage.set(STORAGE_KEY, username);
    } else {
      storage.remove(STORAGE_KEY);
    }
  };

  return {
    rememberMe,
    rememberedUsername,
    saveUsername,
  };
}

