<template>
  <div class="profile-page">
    <btc-card v-loading="loading">
      <template #title>
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userInfo.avatar || appConfig.logo" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <h2 class="profile-title">{{ userInfo.name || t(appConfig.company.sloganKey) }}</h2>
          <div class="profile-actions">
            <el-tooltip content="编辑个人信息">
              <el-icon class="action-icon" @click="handleEdit">
                <Edit />
              </el-icon>
            </el-tooltip>
            <el-tooltip :content="showFullInfo ? '点击隐藏完整信息' : '点击显示完整信息'">
              <el-icon class="toggle-icon" @click="handleToggleShowFull">
                <View v-if="showFullInfo" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div class="profile-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.realName || userInfo.name || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="英文名" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.name || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="工号" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.employeeId || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="职位" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.position || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.email || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="手机号" label-class-name="profile-label">
            <span class="profile-value">{{ userInfo.phone || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </btc-card>

    <!-- 编辑表单 -->
    <BtcForm ref="Form" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { User, View, Hide, Edit } from '@element-plus/icons-vue';
import { useI18n, useBtcForm } from '@btc/shared-core';
import { ElMessage } from 'element-plus';
import { appConfig } from '@/config/app';
import { service } from '@services/eps';

defineOptions({
  name: 'Profile'
});

const { t } = useI18n();
const { Form } = useBtcForm();

// 用户信息
const userInfo = ref<any>({});
const loading = ref(false);
const showFullInfo = ref(false);

// 加载用户信息
const loadUserInfo = async (showFull = false) => {
  loading.value = true;
  try {
    // 根据 prefix: admin/system/base/profile，服务路径应该是 system.base.profile
    const profileService = service.system?.base?.profile;
    if (!profileService) {
      console.error('profileService 不存在，可用服务:', service.system?.base);
      ElMessage.warning('用户信息服务不可用');
      return;
    }

    // 根据 showFull 参数决定是否在 URL 中拼接参数
    // 由于 info 是 GET 请求，需要通过 params 传递查询参数
    const params: any = {};
    if (showFull) {
      params.showFull = true;
    }

    const data = await profileService.info(params);
    userInfo.value = data || {};
  } catch (error: any) {
    console.error('加载用户信息失败:', error);
    ElMessage.error(error?.message || '加载用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 处理显示完整信息切换
const handleToggleShowFull = () => {
  showFullInfo.value = !showFullInfo.value;
  loadUserInfo(showFullInfo.value);
};

// 表单配置
const formItems = computed(() => [
  {
    prop: 'avatar',
    label: '头像',
    span: 24,
    component: {
      name: 'btc-upload',
      props: {
        type: 'image',
        uploadType: 'avatar',
        text: '选择头像',
        size: [100, 100],
        limitSize: 5
      }
    }
  },
  {
    prop: 'realName',
    label: '姓名',
    span: 12,
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入姓名'
      }
    }
  },
  {
    prop: 'name',
    label: '英文名',
    span: 12,
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入英文名'
      }
    }
  },
  {
    prop: 'employeeId',
    label: '工号',
    span: 12,
    component: {
      name: 'el-input',
      props: {
        placeholder: '工号',
        disabled: true
      }
    }
  },
  {
    prop: 'position',
    label: '职位',
    span: 12,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入职位'
      }
    }
  },
  {
    prop: 'email',
    label: '邮箱',
    span: 12,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入邮箱'
      }
    },
    rules: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ]
  },
  {
    prop: 'phone',
    label: '手机号',
    span: 12,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入手机号'
      }
    },
    rules: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ]
  }
]);


// 打开编辑表单
const handleEdit = async () => {
  // 需要先加载完整信息才能编辑
  if (!showFullInfo.value) {
    try {
      await loadUserInfo(true);
      showFullInfo.value = true;
    } catch (error) {
      ElMessage.error('无法加载完整信息，请稍后重试');
      return;
    }
  }

  Form.value?.open({
    title: '编辑个人信息',
    width: '800px',
    form: {
      id: userInfo.value.id || '',
      realName: userInfo.value.realName || '',
      name: userInfo.value.name || '',
      employeeId: userInfo.value.employeeId || '',
      position: userInfo.value.position || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      avatar: userInfo.value.avatar || ''
    },
    items: formItems.value,
    props: {
      labelWidth: '100px',
      labelPosition: 'top'
    },
    on: {
      submit: async (data, { close, done }) => {
        try {
          const profileService = service.system?.base?.profile;
          if (!profileService) {
            ElMessage.warning('用户信息服务不可用');
            done();
            return;
          }

          // 调用更新接口
          await profileService.update(data);

          ElMessage.success('保存成功');
          close();

          // 重新加载用户信息
          await loadUserInfo(showFullInfo.value);
        } catch (error: any) {
          console.error('保存用户信息失败:', error);
          ElMessage.error(error?.message || '保存失败');
          done();
        }
      }
    }
  });
};

// 组件挂载时加载数据（默认脱敏）
onMounted(() => {
  loadUserInfo(false);
});
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

  .profile-actions {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;

    .action-icon,
    .toggle-icon {
      font-size: 20px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.profile-content {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  :deep(.el-descriptions) {
    .el-descriptions__table {
      table-layout: fixed;
      width: 100%;

      .el-descriptions__cell {
        &.profile-label {
          width: 120px;
          min-width: 120px;
          max-width: 120px;
          text-align: right;
          padding-right: 16px;
          font-weight: 500;
        }

        &.el-descriptions__content {
          min-width: 0;
          word-break: break-all;
          overflow-wrap: break-word;
        }
      }
    }
  }

  .profile-value {
    display: inline-block;
    min-width: 0;
    word-break: break-all;
    overflow-wrap: break-word;
  }
}

.avatar-form-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
