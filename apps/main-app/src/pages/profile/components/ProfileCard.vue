<template>
  <div class="profile-card">
    <div class="profile-card__content">
      <!-- 左侧：头像区域 -->
      <div class="profile-card__avatar-section">
        <BtcAvatar
          :src="avatarUrl"
          :size="78"
          :editable="true"
          :upload-service="service"
          :rock-style="rockStyle ?? true"
          :on-upload="handleAvatarChange"
        />
      </div>

      <!-- 右侧：信息区域 -->
      <div class="profile-card__info-section">
        <el-row :gutter="16">
          <!-- 第一列 -->
          <el-col :span="12">
            <ProfileInfoItem
              label="姓名"
              :value="userInfo.realName || userInfo.name || '-'"
              :editable="false"
            />
            <ProfileInfoItem
              label="英文名"
              :value="userInfo.name || '-'"
              :editable="false"
            />
            <ProfileInfoItem
              label="工号"
              :value="userInfo.employeeId || '-'"
              :editable="false"
              :copyable="!!userInfo.employeeId"
            />
            <ProfileInfoItem
              label="职位"
              :value="userInfo.position || '-'"
              :editable="false"
            />
          </el-col>

          <!-- 第二列 -->
          <el-col :span="12">
            <ProfileInfoItem
              label="邮箱"
              :value="userInfo.email || '-'"
              editable
              @edit="$emit('edit-field', 'email')"
            />
            <ProfileInfoItem
              label="手机号"
              :value="userInfo.phone || '-'"
              editable
              @edit="$emit('edit-field', 'phone')"
            />
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { service } from '@services/eps';
import { BtcAvatar } from '@btc/shared-components';
import ProfileInfoItem from './ProfileInfoItem.vue';

defineOptions({
  name: 'ProfileCard'
});

const props = defineProps<{
  userInfo: any;
  showFullInfo: boolean;
  rockStyle?: boolean;
}>();

const emit = defineEmits<{
  'edit-field': [field: string];
  'avatar-change': [avatarUrl: string];
}>();

// 头像 URL
const avatarUrl = computed(() => {
  return props.userInfo?.avatar || '/logo.png';
});

// 处理头像变更
const handleAvatarChange = async (url: string) => {
  emit('avatar-change', url);
};
</script>

<style lang="scss" scoped>
@use '../styles/profile-card.scss' as *;
</style>

