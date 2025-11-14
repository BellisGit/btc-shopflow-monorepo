<template>
  <div class="user-role-assign-page">
    <BtcCrud ref="crudRef" :service="userRoleService">
      <BtcRow>
        <BtcBindTransferBtn @click="openDrawer">
          {{ t('common.button.authorize') }}
        </BtcBindTransferBtn>
        <BtcRefreshBtn />
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('org.user_role_assign.search_placeholder')" />
        <BtcCrudActions />
      </BtcRow>

      <BtcRow>
        <BtcTable
          :columns="roleColumns"
          border
          auto-height
          row-key="id"
          :toolbar="false"
        />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
    </BtcCrud>

    <BtcTransferDrawer
      ref="transferDrawerRef"
      v-model:visible="drawerVisible"
      :title="t('org.user_role_assign.drawer.title')"
      :subtitle="t('org.user_role_assign.drawer.subtitle')"
      :sections="drawerSections"
      :confirm-loading="submitting"
      :cancel-text="t('common.button.cancel')"
      :confirm-text="t('common.button.confirm')"
      @cancel="closeDrawer"
      @confirm="handleSubmit"
      @update:section-keys="handleSectionKeys"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { BtcMessage, BtcTransferDrawer, BtcBindTransferBtn } from '@btc/shared-components';
import type { TableColumn, TransferPanelColumn, TransferKey } from '@btc/shared-components';
import { service } from '@services/eps';
import { services as userServices } from '../users/config';
import { services as roleServices } from '../../../access/views/roles/config';

const { t } = useI18n();
const route = useRoute();
const crudRef = ref();
const transferDrawerRef = ref<any>(null);
const drawerVisible = ref(false);
const submitting = ref(false);

const userId = computed(() => route.params.id as string);

const userRoleService = {
  ...service.system?.iam?.role,
  list: async (params: any) =>
    service.system?.iam?.role?.list({
      ...params,
      userId: userId.value,
    }),
};

const roleColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'roleName', label: t('org.user_role_assign.columns.roleName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'description', label: t('org.user_role_assign.columns.description'), minWidth: 200, showOverflowTooltip: true },
]);

const userTransferColumns = computed<TransferPanelColumn[]>(() => [
  { prop: 'username', label: t('org.user_role_assign.user.username'), minWidth: 160 },
  { prop: 'realName', label: t('org.user_role_assign.user.realName'), minWidth: 160 },
]);

const roleTransferColumns = computed<TransferPanelColumn[]>(() => [
  { prop: 'roleName', label: t('org.user_role_assign.columns.roleName'), minWidth: 160 },
  { prop: 'description', label: t('org.user_role_assign.columns.description'), minWidth: 220 },
]);

const userService = userServices.sysuser;
const roleService = roleServices.sysrole;

const selectedUserKeys = ref<TransferKey[]>([]);
const selectedRoleKeys = ref<TransferKey[]>([]);

const drawerSections = computed(() => [
  {
    key: 'users',
    title: t('org.user_role_assign.drawer.subjectSectionTitle'),
    transferProps: {
      service: userService,
      columns: userTransferColumns.value,
      displayProp: 'username',
      descriptionProp: 'realName',
      rowKey: 'id',
      collapsible: false,
    },
    modelValue: selectedUserKeys.value,
  },
  {
    key: 'roles',
    title: t('org.user_role_assign.drawer.roleSectionTitle'),
    transferProps: {
      service: roleService,
      columns: roleTransferColumns.value,
      displayProp: 'roleName',
      descriptionProp: 'description',
      rowKey: 'id',
      collapsible: false,
    },
    modelValue: selectedRoleKeys.value,
  },
]);

function openDrawer() {
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
}

function handleSectionKeys(payload: { key: string; keys: TransferKey[] }) {
  if (payload.key === 'users') {
    selectedUserKeys.value = [...payload.keys];
  } else if (payload.key === 'roles') {
    selectedRoleKeys.value = [...payload.keys];
  }
}

async function handleSubmit() {
  submitting.value = true;
  try {
    // TODO: 调用实际的授权接口
    console.info('[UserRoleAssign] submit authorization', {
      users: selectedUserKeys.value,
      roles: selectedRoleKeys.value,
    });
    BtcMessage.success(t('org.user_role_assign.messages.submitSuccess'));
    closeDrawer();
    crudRef.value?.crud?.refresh?.();
  } catch (error) {
    console.error('[UserRoleAssign] submit error', error);
    BtcMessage.error(t('common.message.error'));
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.user-role-assign-page {
  height: 100%;
  box-sizing: border-box;
}

.user-role-assign__drawer-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.user-role-assign__transfer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.user-role-assign__section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-role-assign__transfer-panel {
  flex: 1;
  min-height: 0;
}

.user-role-assign__drawer-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-role-assign__drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-role-assign__drawer-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

</style>
