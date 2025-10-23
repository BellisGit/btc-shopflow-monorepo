<template>
  <div class="profile-page">
    <btc-card>
      <template #title>
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="80" :src="appConfig.logo" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <h2 class="profile-title">{{ t(appConfig.company.sloganKey) }}</h2>
        </div>
      </template>

      <div class="profile-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            Admin
          </el-descriptions-item>
          <el-descriptions-item label="姓名">
            系统管理员
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            admin@btc.com
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            138****8888
          </el-descriptions-item>
          <el-descriptions-item label="部门">
            技术部
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            系统管理员
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            超级管理员
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="success">正常</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            2024-01-15 14:30:25
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            2024-01-01 09:00:00
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            系统超级管理员，拥有所有权限
          </el-descriptions-item>
          <el-descriptions-item label="创建者">
            系统
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { appConfig } from '@/config/app';

defineOptions({
  name: 'Profile'
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.profile-page {
  height: 100%; // 增加面包屑高度（39px）
  width: 100%;
  padding: 10px;
  padding-top: 49px; // 增加顶部 padding，确保卡片上边框可见
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

:deep(.btc-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.btc-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  width: 100%;
  text-align: center;

  .avatar-section {
    .user-avatar {
      border: 3px solid var(--el-border-color-light);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .profile-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-align: center;
    line-height: 1.4;
  }
}

.profile-content {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

// 覆盖 btc-card 的 header 样式，确保标题内容居中
:deep(.btc-card__header) {
  justify-content: center !important;
}

:deep(.btc-card__title) {
  width: 100%;
  text-align: center;
}

// 响应式设计
@media (max-width: 768px) {
  .profile-page {
    padding: 5px;
  }

  .profile-header {
    gap: 12px;
    padding: 15px 0;

    .avatar-section {
      .user-avatar {
        width: 60px !important;
        height: 60px !important;
      }
    }

    .profile-title {
      font-size: 18px;
    }
  }
}

@media (max-width: 480px) {
  .profile-header {
    gap: 10px;
    padding: 10px 0;

    .avatar-section {
      .user-avatar {
        width: 50px !important;
        height: 50px !important;
      }
    }

    .profile-title {
      font-size: 16px;
    }
  }
}
</style>
