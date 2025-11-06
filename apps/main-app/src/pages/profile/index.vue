<template>
  <div class="profile-page">
    <btc-card v-loading="loading" class="profile-card">
      <template #title>
        <div class="profile-card__header-left">
          <el-tooltip content="摇滚风格">
            <el-switch
              v-model="rockStyleEnabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="handleRockStyleChange"
            />
          </el-tooltip>
        </div>
      </template>
      <template #extra>
        <el-tooltip :content="showFullInfo ? '隐藏完整信息' : '显示完整信息'">
          <el-icon class="profile-card__toggle-icon" @click="handleToggleShowFull">
            <View v-if="showFullInfo" />
            <Hide v-else />
          </el-icon>
        </el-tooltip>
      </template>

      <ProfileCard
        :user-info="userInfo"
        :show-full-info="showFullInfo"
        :rock-style="rockStyleEnabled"
        @edit-field="handleEditField"
        @avatar-change="handleAvatarChange"
      />
    </btc-card>

    <!-- 编辑表单 -->
    <BtcForm ref="Form" />

    <!-- 身份验证弹窗 -->
    <BtcIdentityVerify
      v-model="verifyVisible"
      :user-info="{
        phone: userInfo.phone,
        email: userInfo.email
      }"
      @success="handleVerifySuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import { settingsStorage, userStorage } from '@/utils/storage-manager';
import { useProfile } from './composables/useProfile';
import { useProfileForm } from './composables/useProfileForm';
import ProfileCard from './components/ProfileCard.vue';
import BtcIdentityVerify from './components/BtcIdentityVerify.vue';

defineOptions({
  name: 'Profile'
});

// 使用个人信息 composable
const { userInfo, loading, showFullInfo, loadUserInfo, handleToggleShowFull } = useProfile();

// 身份验证弹窗显示状态
const verifyVisible = ref(false);
// 验证成功后的回调函数
let verifySuccessCallback: (() => void) | null = null;

// 使用表单 composable
const { Form, handleEditField, handleEdit, handleEditAvatar } = useProfileForm(
  userInfo,
  showFullInfo,
  loadUserInfo,
  () => {
    // 打开验证弹窗
    verifyVisible.value = true;
  },
  (callback: () => void) => {
    // 保存验证成功后的回调
    verifySuccessCallback = callback;
  }
);

// 处理验证成功
const handleVerifySuccess = () => {
  // 关闭验证弹窗
  verifyVisible.value = false;
  
  // 执行验证成功后的回调（打开编辑表单）
  if (verifySuccessCallback) {
    verifySuccessCallback();
    verifySuccessCallback = null;
  }
};

// 摇滚风格开关（从统一存储读取，默认 false）
const getRockStyleEnabled = (): boolean => {
  const stored = settingsStorage.getItem('avatarRockStyle');
  return stored === true || stored === false ? stored : false;
};
const rockStyleEnabled = ref<boolean>(getRockStyleEnabled());

// 处理摇滚风格变化
const handleRockStyleChange = (value: boolean) => {
  settingsStorage.setItem('avatarRockStyle', value);
  // 触发自定义事件，通知其他组件更新
  window.dispatchEvent(new CustomEvent('avatarRockStyleChanged', { detail: value }));
};

// 处理头像变更
const handleAvatarChange = async (avatarUrl: string) => {
  try {
    const { service } = await import('@services/eps');
    const profileService = service.system?.base?.profile;
    if (!profileService) {
      ElMessage.warning('用户信息服务不可用');
      return;
    }

    // 调用更新接口
    await profileService.update({
      id: userInfo.value.id,
      avatar: avatarUrl
    });

    // 更新统一存储
    userStorage.setAvatar(avatarUrl);

    // 同时更新 useUser 中的信息
    const { useUser } = await import('@/composables/useUser');
    const { getUserInfo, setUserInfo } = useUser();
    const currentUser = getUserInfo();
    if (currentUser) {
      setUserInfo({
        ...currentUser,
        avatar: avatarUrl
      });
    }

    // 触发自定义事件，通知顶栏更新
    window.dispatchEvent(new CustomEvent('userInfoUpdated', {
      detail: {
        avatar: avatarUrl,
        name: userInfo.value.name
      }
    }));

    ElMessage.success('头像更新成功');
    
    // 重新加载用户信息
    await loadUserInfo(showFullInfo.value);
  } catch (error: any) {
    console.error('保存头像失败:', error);
    ElMessage.error(error?.message || '保存头像失败');
  }
};

// 组件挂载时加载数据（默认脱敏）
onMounted(() => {
  loadUserInfo(false);
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss' as *;

.profile-card {
  :deep(.btc-card__body) {
    padding: 0 !important;
    position: relative;
  }

  // 覆盖 is-no-header 时的 padding-top
  :deep(.btc-card.is-no-header .btc-card__body) {
    padding-top: 0 !important;
  }

  // 移除 header 和内容之间的分隔线
  :deep(.btc-card__header) {
    border-bottom: none !important;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  // 眼睛图标样式
  &__toggle-icon {
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
