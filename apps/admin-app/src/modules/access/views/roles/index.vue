<template>
  <div class="roles-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="services.sysdomain"
      :right-service="services.sysrole"
      :table-columns="roleColumns"
      :form-items="formItems"
      :op="{ buttons: ['edit', 'delete'] }"
      :on-info="handleRoleInfo"
      left-title="域列表"
      right-title="角色列表"
      :show-unassigned="true"
      :enable-key-search="true"
      @load="handleLoad"
    >
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue';
import { BtcTableGroup } from '@btc/shared-components';
import {
  getRoleFormItems,
  services
} from './config';

const tableGroupRef = ref();
const domainOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

// 动态表格列配置，父级角色和域列会根据选项格式化显示
const roleColumns = computed(() => {
  const baseColumns = [
    { type: 'selection', width: 60 },
    { type: 'index', label: '序号', width: 60 },
    {
      prop: 'roleName',
      label: '角色名称',
      minWidth: 150
    },
    { prop: 'roleCode', label: '角色编码', width: 180 },
    {
      prop: 'roleType',
      label: '角色类型',
      width: 100,
      dict: [
        { label: '管理员', value: 'ADMIN', type: 'danger' },
        { label: '业务员', value: 'BUSINESS', type: 'success' },
        { label: '访客', value: 'GUEST', type: 'info' }
      ],
      dictColor: true
    },
    {
      prop: 'parentId',
      label: '父级角色',
      width: 100,
      formatter: (row: any) => {
        if (!row.parentId || row.parentId === '0' || roleOptions.value.length === 0) {
          return '无';
        }
        const parentRole = roleOptions.value.find((r: any) => r.id === row.parentId);
        return parentRole ? parentRole.roleName : row.parentId;
      }
    },
    {
      prop: 'domainId',
      label: '所属域',
      width: 100,
      formatter: (row: any) => {
        if (!row.domainId || domainOptions.value.length === 0) {
          return '未分配';
        }
        const domain = domainOptions.value.find((d: any) => d.id === row.domainId);
        return domain ? domain.name : row.domainId;
      }
    },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createdAt', label: '创建时间', width: 160, sortable: true }
  ];
  return baseColumns;
});

// 动态表单配置
const formItems = computed(() => getRoleFormItems(domainOptions.value, roleOptions.value));

// 获取角色标签类型
function getRoleTagType(roleType: string): 'danger' | 'success' | 'info' | 'primary' | 'warning' {
  const typeMap: Record<string, 'danger' | 'success' | 'info' | 'primary' | 'warning'> = {
    'ADMIN': 'danger',
    'BUSINESS': 'success',
    'GUEST': 'info'
  };
  return typeMap[roleType] || 'info';
}

// 加载角色数据
async function loadRoleOptions() {
  try {
    const response = await services.sysrole.list({});
    roleOptions.value = response.list || [];
    // 注意：不需要手动刷新表格，因为：
    // 1. roleOptions 是响应式的，更新后会自动触发表格列的 formatter 重新计算
    // 2. 表格会在左侧选择时自动刷新，避免重复调用
  } catch (error) {
    console.error('加载角色数据失败:', error);
  }
}

// 处理左侧数据加载
function handleLoad(data: any[]) {
  // 左侧数据加载完成，更新域选项
  domainOptions.value = data;
  
  // 延迟加载角色选项，避免在页面初始化时立即调用
  // 等待左侧列表加载完成后再加载角色选项
  if (roleOptions.value.length === 0) {
    // 使用 nextTick 延迟执行，避免阻塞左侧列表的初始化
    nextTick(() => {
      loadRoleOptions();
    });
  }
}

// 处理角色信息获取（编辑时）
async function handleRoleInfo(role: any, { next, done }: any) {
  try {
    // 确保角色选项已加载
    if (roleOptions.value.length === 0) {
      await loadRoleOptions();
    }

    // 调用 service.info 获取角色详情
    const roleDetail = await next(role);

    // 处理域数据回填
    if (roleDetail.domainId && domainOptions.value.length > 0) {
      // 查找对应的域对象
      const findDomain = (options: any[], id: string): any => {
        for (const option of options) {
          if (option.value === id || option.id === id) {
            return option;
          }
          if (option.children && option.children.length > 0) {
            const found = findDomain(option.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const domain = findDomain(domainOptions.value, roleDetail.domainId);
      if (domain) {
        roleDetail.domainId = domain.value || domain.id;
      }
    }

    // 处理父级角色数据回填
    if (roleDetail.parentId && roleDetail.parentId !== '0' && roleOptions.value.length > 0) {
      const parentRole = roleOptions.value.find((r: any) => r.id === roleDetail.parentId);
      if (parentRole) {
        roleDetail.parentId = parentRole.id;
      }
    }

    done(roleDetail);
  } catch (error) {
    console.error('获取角色详情失败:', error);
    done(role);
  }
}

onMounted(() => {
  // 注意：不再在 onMounted 时立即加载角色选项
  // 改为在 handleLoad 中延迟加载，避免重复调用
  // loadRoleOptions();
});
</script>

<style lang="scss" scoped>
.roles-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
