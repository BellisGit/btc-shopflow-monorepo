<template>
  <div class="users-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="services.sysdepartment"
      :right-service="services.sysuser"
      :table-columns="userColumns"
      :form-items="formItems"
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
  userColumns,
  getUserFormItems,
  services
} from './config';

const tableGroupRef = ref();
const departmentOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

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
    const response = await services.sysrole.list();
    roleOptions.value = response.list || [];
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

    // 处理角色数据回填
    if (userDetail.roleIds && roleOptions.value.length > 0) {
      // 如果 roleIds 是字符串，转换为数组
      if (typeof userDetail.roleIds === 'string') {
        userDetail.roleIds = userDetail.roleIds.split(',');
      }

      // 转换角色ID为对应的值
      const roleIds = Array.isArray(userDetail.roleIds) ? userDetail.roleIds : [];
      userDetail.roleIds = roleIds.map((roleId: string) => {
        const role = roleOptions.value.find((r: any) => r.id === roleId);
        return role ? (role.value || role.id) : roleId;
      });
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
