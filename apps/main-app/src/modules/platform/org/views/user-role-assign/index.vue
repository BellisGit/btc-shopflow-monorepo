<template>
  <div class="user-role-assign">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ userInfo.employeeId }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ userInfo.department }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ userInfo.position }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ userInfo.id }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="roles-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>角色分配</span>
          <div>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          </div>
        </div>
      </template>

      <el-checkbox-group v-model="selectedRoles">
        <el-row :gutter="20">
          <el-col :span="8" v-for="role in allRoles" :key="role.id">
            <el-checkbox :label="role.id" border style="width: 100%; margin: 10px 0;">
              <div class="role-info">
                <div class="role-name">{{ role.roleName }}</div>
                <div class="role-code">{{ role.roleCode }}</div>
              </div>
            </el-checkbox>
          </el-col>
        </el-row>
      </el-checkbox-group>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from '@/utils/use-message';
import { service } from '@services/eps';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const userId = route.params.id;

const userInfo = ref<any>({});
const allRoles = ref<any[]>([]);
const selectedRoles = ref<number[]>([]);
const saving = ref(false);

// Mock服务
const userService = service.base.department;
const roleService = service.base.department;

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const data = await userService.info({ id: userId });
    userInfo.value = data;
  } catch (_error) {
    message.error('加载用户信息失败');
  }
};

// 加载角色列表
const loadRoles = async () => {
  try {
    allRoles.value = await roleService.list();

    // Mock：随机选择已分配的角色
    selectedRoles.value = [3]; // 默认分配员工角色
  } catch (_error) {
    message.error('加载角色列表失败');
  }
};

// 保存
const handleSave = async () => {
  saving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    // 这里应该调用后端API
    // await http.post(`/users/${userId}/roles`, { roleIds: selectedRoles.value });

    message.success('保存成功');
    router.back();
  } catch (_error) {
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

onMounted(() => {
  loadUserInfo();
  loadRoles();
});
</script>

<style lang="scss" scoped>
.user-role-assign {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-info {
  display: flex;
  flex-direction: column;

  .role-name {
    font-weight: 500;
  }

  .role-code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}
</style>

