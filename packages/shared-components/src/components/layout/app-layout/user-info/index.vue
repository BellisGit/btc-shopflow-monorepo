<template>
  <el-dropdown
    class="user-info"
    placement="bottom-end"
    popper-class="user-info__popper"
    @command="handleCommand"
  >
    <div class="user-info__trigger">
      <span
        class="user-info__name"
        :data-full-name="userInfo.name"
        @mouseenter="handleNameHover"
        @mouseleave="handleNameLeave"
      >
        <span class="user-info__name-text" :class="{ 'is-dark': isDark }">{{ displayedName }}</span>
        <span
          class="user-info__name-cursor"
          v-if="isTyping"
          :style="{ transform: `translateX(${cursorPosition * 0.6}em)` }"
        >|</span>
      </span>
      <div class="user-info__avatar-box user-info__avatar-box--small">
        <img 
          :src="avatarUrl"
          :alt="userInfo.name || '用户头像'"
          class="user-info__avatar-img-small"
          @error="handleAvatarError"
        />
      </div>
    </div>

    <template #dropdown>
      <div class="user-info__header">
        <div class="user-info__avatar-box user-info__avatar-box--large">
          <el-image
            :src="userInfo.avatar || getDefaultLogoUrl()"
            :preview-src-list="[userInfo.avatar || getDefaultLogoUrl()]"
            fit="cover"
            class="user-info__avatar-img"
          >
            <template #error>
              <el-avatar :size="50">
                <el-icon><User /></el-icon>
              </el-avatar>
            </template>
          </el-image>
        </div>
        <div class="user-info__details">
          <el-text size="default" tag="p">{{ userInfo.name }}</el-text>
          <el-text size="small" type="info">{{ userInfo.position || '' }}</el-text>
        </div>
      </div>

      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <btc-svg name="my" :size="16" />
          <span>{{ t('common.profile') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <btc-svg name="set" :size="16" />
          <span>{{ t('common.settings') }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <btc-svg name="exit" :size="16" />
          <span>{{ t('common.logout') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
// useMessage 不再需要，直接使用 BtcMessage
import { useSettingsState } from '@btc/shared-components/components/others/btc-user-setting/composables';
import { MenuThemeEnum } from '@btc/shared-components/components/others/btc-user-setting/config/enums';
import { useUser } from '@btc/shared-components/composables/useUser';

// 通过全局函数获取应用特定的依赖
declare global {
  interface Window {
    __APP_LOGOUT__?: () => Promise<void>;
  }
}

// 获取退出登录函数（从全局或应用提供）
function getLogoutFunction() {
  return (window as any).__APP_LOGOUT__ || (() => {
    console.warn('[user-info] Logout function not available');
  });
}
import { User } from '@element-plus/icons-vue';
import { useUserInfo } from './index';

defineOptions({
  name: 'UserInfo'
});

const { t } = useI18n();
const router = useRouter();

// 获取退出登录函数（从全局或应用提供）
const logout = getLogoutFunction();

// 获取设置状态
const { menuThemeType, isDark: isDarkTheme } = useSettingsState();

// 判断是否为深色菜单风格
const isDark = computed(() => {
  return isDarkTheme?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 用户相关
const { userInfo: userInfoComputed, getUserInfo, setUserInfo } = useUser();

// 使用 composable
const {
  profileUserInfo,
  displayedName,
  isTyping,
  cursorPosition,
  userInfo,
  loadProfileInfo,
  handleNameHover,
  handleNameLeave
} = useUserInfo();

// 获取默认 Logo URL
const getDefaultLogoUrl = () => {
  const getLogoUrl = (window as any).__APP_GET_LOGO_URL__;
  if (getLogoUrl) {
    return getLogoUrl();
  }
  return '/logo.png';
};

// 记录头像加载失败状态，避免无限循环
// 使用 ref 确保是响应式的
const avatarLoadError = ref(false);
const errorHandled = ref(false); // 防止重复处理错误

// 头像 URL（确保始终有值，避免空白）
const avatarUrl = computed(() => {
  const url = userInfo.value?.avatar;
  const defaultLogo = getDefaultLogoUrl();
  
  // 如果头像加载失败，强制使用默认 Logo
  if (avatarLoadError.value) {
    return defaultLogo;
  }
  
  return url && url !== defaultLogo && url !== '' ? url : defaultLogo;
});

// 头像加载失败处理 - 关键：阻止无限循环
const handleAvatarError = (event: Event) => {
  // 防止重复处理同一个错误
  if (errorHandled.value) {
    return;
  }
  
  const img = event.target as HTMLImageElement;
  const failedUrl = img.src;
  
  console.warn('[UserInfo] ❌ 头像加载失败:', failedUrl);
  
  // 标记已处理，防止重复触发
  errorHandled.value = true;
  
  // 如果失败的是 logo.png，说明默认图片也不存在
  if (failedUrl.includes('logo.png')) {
    console.error('[UserInfo] ❌❌❌ CRITICAL: logo.png 文件加载失败！');
    console.error('[UserInfo] 请检查文件是否存在于: public/logo.png');
    console.error('[UserInfo] 当前完整 URL:', failedUrl);
    console.error('[UserInfo] 当前域名:', window.location.origin);
    // logo.png 失败就不再尝试了
    return;
  }
  
  // 标记头像加载失败，这会触发 computed 重新计算，切换到默认 Logo
  avatarLoadError.value = true;
  
  console.log('[UserInfo] 已切换到默认 Logo');
};

// 监听头像 URL 变化，重置错误状态
watch(() => userInfo.value?.avatar, (newAvatar, oldAvatar) => {
  // 当头像 URL 变化时（例如用户上传了新头像），重置错误状态
  if (newAvatar !== oldAvatar && newAvatar) {
    avatarLoadError.value = false;
    errorHandled.value = false;
    console.log('[UserInfo] 头像 URL 已更新，重置错误状态:', newAvatar);
  }
});

// 初始化
onMounted(async () => {
  await loadProfileInfo();
});

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 个人信息页面属于系统域（主应用），直接使用 router.push
      router.push('/profile');
      break;
    case 'settings':
      // 关键：在 layout-app 环境下，通过事件触发偏好设置抽屉
      // 否则使用路由跳转（如果子应用有 /settings 路由）
      const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
      if (isUsingLayoutApp) {
        // 通过全局事件触发 layout-app 的偏好设置抽屉
        const triggerPreferencesDrawer = () => {
          const emitter = (window as any).__APP_EMITTER__;
          if (emitter && typeof emitter.emit === 'function') {
            emitter.emit('open-preferences-drawer');
            if (import.meta.env.DEV || import.meta.env.PROD) {
              console.log('[UserInfo] 已通过事件总线触发 open-preferences-drawer 事件');
            }
          } else {
            // 如果没有事件总线，尝试通过 window 事件
            window.dispatchEvent(new CustomEvent('open-preferences-drawer'));
            if (import.meta.env.DEV || import.meta.env.PROD) {
              console.log('[UserInfo] 事件总线不可用，已通过 window 事件触发 open-preferences-drawer');
            }
          }
        };

        // 立即尝试触发
        triggerPreferencesDrawer();

        // 关键：添加重试机制，如果事件总线在初始化时不存在，等待一段时间后重试
        // 这可以解决生产环境中 layout-app 和子应用初始化时序问题
        if (!(window as any).__APP_EMITTER__) {
          let retryCount = 0;
          const maxRetries = 5;
          const retryInterval = 100; // 100ms

          const retryTimer = setInterval(() => {
            retryCount++;
            if ((window as any).__APP_EMITTER__) {
              clearInterval(retryTimer);
              triggerPreferencesDrawer();
              if (import.meta.env.DEV || import.meta.env.PROD) {
                console.log(`[UserInfo] 重试成功（${retryCount}次），已触发 open-preferences-drawer 事件`);
              }
            } else if (retryCount >= maxRetries) {
              clearInterval(retryTimer);
              // 最后一次尝试使用 window 事件
              window.dispatchEvent(new CustomEvent('open-preferences-drawer'));
              if (import.meta.env.DEV || import.meta.env.PROD) {
                console.warn(`[UserInfo] 重试 ${maxRetries} 次后事件总线仍不可用，已使用 window 事件作为兜底方案`);
              }
            }
          }, retryInterval);
        }
      } else {
        // 独立运行时，使用路由跳转
        router.push('/settings');
      }
      break;
    case 'logout':
      BtcConfirm(t('common.logoutConfirm'), t('common.warning'), {
        confirmButtonText: t('common.button.confirm'),
        cancelButtonText: t('common.button.cancel'),
        type: 'warning'
      })
        .then(() => {
          logout();
        })
        .catch(() => {
          // 取消操作
        });
      break;
  }
};
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>

<style lang="scss">
@use './popper.scss';
</style>

