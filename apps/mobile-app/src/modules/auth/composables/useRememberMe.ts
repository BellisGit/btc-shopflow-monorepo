import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'mobile_remembered_username';

export function useRememberMe() {
  const rememberMe = ref(false);
  const rememberedUsername = ref('');

  // 从本地存储恢复记住的用户名
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      rememberedUsername.value = stored;
      rememberMe.value = true;
    }
  });

  // 保存用户名
  const saveUsername = (username: string) => {
    if (rememberMe.value) {
      localStorage.setItem(STORAGE_KEY, username);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    rememberMe,
    rememberedUsername,
    saveUsername,
  };
}

