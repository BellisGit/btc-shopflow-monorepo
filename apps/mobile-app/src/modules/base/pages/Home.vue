<template>
  <div class="page">
    <div class="home__header">
      <div class="home__avatar">
        <img :src="avatarUrl" alt="头像" @error="handleAvatarError" />
      </div>
    </div>
    
    <div class="home__content">
      <van-cell-group inset>
        <van-cell title="用户名" :value="userInfo?.username || '未设置'" />
        <van-cell title="手机号" :value="userInfo?.phone || '未绑定'" />
        <van-cell v-if="userInfo?.email" title="邮箱" :value="userInfo.email" />
      </van-cell-group>
      
      <div class="home__actions">
        <van-button block round type="danger" :loading="loading" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CellGroup, Cell, Button, showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/services/auth';
import type { UserProfile } from '@/services/auth';
import logoUrl from '@/assets/images/logo.png';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcMobileHome',
});

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const loadingProfile = ref(false);
const userInfo = ref<UserProfile | null>(null);
const avatarError = ref(false); // 头像加载错误标志

// 从 store 获取初始用户信息
const initialUserInfo = computed(() => authStore.user);

// 计算头像URL，优先使用用户头像，失败时回退到默认logo
const avatarUrl = computed(() => {
  if (avatarError.value || !userInfo.value?.avatar) {
    return logoUrl;
  }
  return userInfo.value.avatar;
});

// 处理头像加载错误
function handleAvatarError() {
  avatarError.value = true;
}

// 加载用户信息
async function loadUserProfile() {
  if (!authStore.isAuthenticated) {
    return;
  }

  loadingProfile.value = true;
  avatarError.value = false; // 重置头像错误状态
  try {
    const profile = await authApi.getProfile();
    userInfo.value = profile;
    // 更新 store 中的用户信息
    authStore.setUser(profile);
  } catch (error) {
    logger.error('Failed to load user profile:', error);
    // 如果获取失败，使用 store 中的用户信息
    userInfo.value = initialUserInfo.value;
  } finally {
    loadingProfile.value = false;
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  // 先使用 store 中的用户信息
  userInfo.value = initialUserInfo.value;
  // 然后从服务器获取最新信息
  loadUserProfile();
});

async function handleLogout() {
  loading.value = true;
  try {
    await authApi.logout();
    authStore.logout(); // 清除本地状态
    showToast('已退出登录');
    router.replace({ name: 'Login' });
  } catch (error) {
    logger.error('Logout failed:', error);
    // 即使 API 失败，也清除本地状态并跳转
    authStore.logout();
    router.replace({ name: 'Login' });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>

    }
  }
  
  &__content {
    padding: 16px 0;
  }
  
  &__actions {
    padding: 32px 16px;
  }
}
</style>


