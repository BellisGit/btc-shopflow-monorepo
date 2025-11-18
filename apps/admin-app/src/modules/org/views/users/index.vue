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
      :enable-key-search="true"
      :left-size="'middle'"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcTableGroup } from '@btc/shared-components';
import {
  getUserFormItems,
  services
} from './config';

const tableGroupRef = ref();
const departmentOptions = ref<any[]>([]);

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
const formItems = computed(() => getUserFormItems(departmentOptions.value));

// 处理左侧数据加载
function handleLoad(data: any[]) {
  // 左侧数据加载完成，更新部门选项
  departmentOptions.value = data;
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

    done(userDetail);
  } catch (error) {
    console.error('获取用户详情失败:', error);
    done(user);
  }
}
</script>

<style lang="scss" scoped>
.users-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
