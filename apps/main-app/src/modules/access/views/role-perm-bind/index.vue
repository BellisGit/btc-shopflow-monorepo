<template>
  <div class="role-perm-bind">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="角色名称">{{ roleInfo.roleName }}</el-descriptions-item>
        <el-descriptions-item label="角色编码">{{ roleInfo.roleCode }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ roleInfo.roleType }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ roleInfo.description }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="perms-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>权限绑定</span>
          <div>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          </div>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="{ children: 'children', label: 'label' }"
        :default-checked-keys="checkedPermissions"
        @check="handleCheck"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from '@/utils/use-message';
import { service } from '../../../../services/eps';

const route = useRoute();
const message = useMessage();
const router = useRouter();
const roleId = route.params.id;

const roleInfo = ref<any>({});
const permissionTree = ref<any[]>([]);
const checkedPermissions = ref<number[]>([]);
const saving = ref(false);
const treeRef = ref();

// Mock服务
const roleService = service.base.department;

// Mock权限树数据
const loadPermissionTree = () => {
  permissionTree.value = [
    {
      id: 'user',
      label: '用户管理',
      children: [
        { id: 1, label: '查看用户' },
        { id: 2, label: '编辑用户' },
        { id: 3, label: '删除用户' },
      ]
    },
    {
      id: 'role',
      label: '角色管理',
      children: [
        { id: 4, label: '查看角色' },
        { id: 5, label: '分配角色' },
      ]
    },
    {
      id: 'dept',
      label: '部门管理',
      children: [
        { id: 6, label: '查看部门' },
        { id: 7, label: '编辑部门' },
      ]
    }
  ];

  // 模拟选中一些权限
  checkedPermissions.value = [1, 4, 6];
};

// 加载角色信息
const loadRoleInfo = async () => {
  try {
    const data = await roleService.info({ id: roleId });
    roleInfo.value = data;
  } catch (error) {
    message.error('加载角色信息失败');
  }
};

// 处理选中变化
const handleCheck = () => {
  // 可以在这里添加额外的逻辑
};

// 保存
const handleSave = async () => {
  saving.value = true;
  try {
    const checkedKeys = treeRef.value?.getCheckedKeys() || [];

    await new Promise(resolve => setTimeout(resolve, 500));

    // 这里应该调用后端API
    // await http.post(`/roles/${roleId}/permissions`, { permissionIds: checkedKeys });

    message.success('保存成功');
    router.back();
  } catch (error) {
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
  loadRoleInfo();
  loadPermissionTree();
});
</script>

<style lang="scss" scoped>
.role-perm-bind {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
