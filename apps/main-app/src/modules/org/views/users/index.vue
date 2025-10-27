<template>
  <div class="users-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="services.sysdepartment"
      :right-service="services.sysuser"
      :table-columns="userColumns"
      :form-items="formItems"
      :op="{ buttons: ['edit', 'delete'] }"
      :on-info="handleUserInfo"
      left-title="部门列表"
      right-title="用户列表"
      :show-unassigned="true"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcTableGroup } from '@btc/shared-components';
import {
  getUserFormItems,
  services
} from './config';

const tableGroupRef = ref();
const departmentOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

// 动态表格列配置，角色列会根据角色选项格式化显示
const userColumns = computed(() => {
  const baseColumns = [
    { type: 'selection', width: 60 },
    { prop: 'username', label: '用户名', width: 120 },
    { prop: 'realName', label: '中文名', minWidth: 100 },
    { prop: 'position', label: '职位', minWidth: 100 },
    {
      prop: 'name',
      label: '部门',
      width: 120,
    },
    {
      prop: 'roleId',
      label: '角色',
      width: 120,
      formatter: (row: any) => {
        if (!row.roleId || roleOptions.value.length === 0) {
          return row.roleId; // Element Plus 会自动将空值显示为 '-'
        }
        const role = roleOptions.value.find((r: any) => r.id === row.roleId);
        return role ? role.roleName : row.roleId;
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      dict: [
        { label: '激活', value: 'ACTIVE', type: 'success' },
        { label: '禁用', value: 'INACTIVE', type: 'danger' }
      ],
      dictColor: true
    },
  ];
  return baseColumns;
});

// 动态表单配置
const formItems = computed(() => getUserFormItems(departmentOptions.value, roleOptions.value));

// 处理左侧数据加载
function handleLoad(data: any[]) {
  // 左侧数据加载完成，更新部门选项
  departmentOptions.value = data;
}

// 加载角色数据
async function loadRoleOptions() {
  try {
    const response = await services.sysrole.list({});
    roleOptions.value = response.list || [];

    // 角色数据加载完成后，刷新表格以更新角色名称显示
    if (tableGroupRef.value && tableGroupRef.value.refresh) {
      tableGroupRef.value.refresh();
    }
  } catch (error) {
    console.error('加载角色数据失败:', error);
  }
}

// 处理用户信息获取（编辑时）
async function handleUserInfo(user: any, { next, done }: any) {
  try {
    // 调用 service.info 获取用户详情
    const userDetail = await next(user);

    // 处理部门数据回填
    if (userDetail.deptId && departmentOptions.value.length > 0) {
      // 查找对应的部门对象
      const findDepartment = (options: any[], id: string): any => {
        for (const option of options) {
          if (option.value === id || option.id === id) {
            return option;
          }
          if (option.children && option.children.length > 0) {
            const found = findDepartment(option.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const department = findDepartment(departmentOptions.value, userDetail.deptId);
      if (department) {
        userDetail.deptId = department.value || department.id;
      }
    }

    // 确保角色选项已加载
    if (roleOptions.value.length === 0) {
      await loadRoleOptions();
    }

    // 处理角色数据回填
    if (userDetail.roleId && roleOptions.value.length > 0) {
      // 查找匹配的角色（主要匹配 id 字段）
      const role = roleOptions.value.find((r: any) => r.id === userDetail.roleId);

      if (role) {
        // btc-cascader 会自动处理 id -> value 的转换
        // 保持 roleId 不变，让组件自动匹配
      }
    }

    done(userDetail);
  } catch (error) {
    console.error('获取用户详情失败:', error);
    done(user);
  }
}

onMounted(() => {
  loadRoleOptions();
});
</script>

<style lang="scss" scoped>
.users-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
