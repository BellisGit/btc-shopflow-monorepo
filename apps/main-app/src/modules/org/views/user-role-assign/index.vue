<template>
  <div class="user-role-assign-page">
    <BtcCrud ref="crudRef" :service="userRoleService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('org.user_role_assign.search_placeholder')" />
      </BtcRow>

      <BtcRow>
        <BtcTable ref="tableRef" :columns="roleColumns" border />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const route = useRoute();
const crudRef = ref();
const tableRef = ref();

// 获取用户ID
const userId = computed(() => route.params.id as string);

// 用户角色服务
const userRoleService = {
  ...service.base.userRole,
  // 重写查询方法，添加用户ID参数
  page: async (params: any) => {
    return service.base.userRole.page({
      ...params,
      userId: userId.value
    });
  }
};

// 角色表格列
const roleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'roleName', label: '角色名称', minWidth: 150 },
  { prop: 'roleCode', label: '角色编码', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100 },
  {
    type: 'op',
    label: '操作',
    width: 120,
    buttons: ['assign', 'unassign']
  },
]);
</script>

<style lang="scss" scoped>
.user-role-assign-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
