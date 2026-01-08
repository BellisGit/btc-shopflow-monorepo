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
      :left-title="t('access.roles.fields.domain_id')"
      :right-title="t('access.roles.fields.role_name')"
      :show-unassigned="true"
      :enable-key-search="true"
      :left-size="'small'"
      @load="handleLoad"
    >
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { BtcTableGroup } from '@btc/shared-components';
import { usePageColumns, usePageForms, getPageConfigFull, usePageService, useI18n } from '@btc/shared-core';

const { t } = useI18n();
const tableGroupRef = ref();
const domainOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('access.roles');
const { formItems: baseFormItems } = usePageForms('access.roles');
const pageConfig = getPageConfigFull('access.roles');

// 使用 config.ts 中定义的服务
const services = {
  sysdomain: pageConfig?.service?.sysdomain,
  sysrole: usePageService('access.roles', 'sysrole'),
};

// 动态表格列配置 - 扩展以支持动态 formatter
const roleColumns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是 parentId，添加动态 formatter
    if (col.prop === 'parentId') {
      return {
        ...col,
        formatter: (row: any) => {
          if (!row.parentId || row.parentId === '0' || roleOptions.value.length === 0) {
            return t('common.access.none');
          }
          const parentRole = roleOptions.value.find((r: any) => r.id === row.parentId);
          return parentRole ? parentRole.roleName : row.parentId;
        }
      };
    }
    // 如果列是 domainId，添加动态 formatter
    if (col.prop === 'domainId') {
      return {
        ...col,
        formatter: (row: any) => {
          if (!row.domainId || domainOptions.value.length === 0) {
            return t('common.access.unassigned');
          }
          const domain = domainOptions.value.find((d: any) => d.id === row.domainId);
          return domain ? domain.name : row.domainId;
        }
      };
    }
    return col;
  });
});

// 动态表单配置 - 扩展以支持动态 options
const formItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 如果表单项是 parentId，添加动态 options
    if (item.prop === 'parentId') {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            options: roleOptions.value,
          },
        },
      };
    }
    // 如果表单项是 domainId，添加动态 options
    if (item.prop === 'domainId') {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            options: domainOptions.value,
          },
        },
      };
    }
    return item;
  });
});

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
    const response = await services.sysrole?.list({});
    roleOptions.value = response?.list || [];
    // 注意：不需要手动刷新表格，因为：
    // 1. roleOptions 是响应式的，更新后会自动触发表格列的 formatter 重新计算
    // 2. 表格会在左侧选择时自动刷新，避免重复调用
  } catch (error) {
    console.error('Failed to load role data:', error);
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
    console.error('Failed to get role details:', error);
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
