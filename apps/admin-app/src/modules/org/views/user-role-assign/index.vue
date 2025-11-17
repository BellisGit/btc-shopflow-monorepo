<template>
  <div class="user-role-assign-page">
    <BtcCrud ref="crudRef" :service="userRoleService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
        <BtcRefreshBtn />
          <BtcBindTransferBtn @click="openDrawer">
            {{ t('common.button.authorize') }}
          </BtcBindTransferBtn>
          <BtcMultiUnbindBtn @click="handleMultiUnbind" />
        </div>
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
import { useI18n } from '@btc/shared-core';
import { BtcMessage, BtcTransferDrawer, BtcBindTransferBtn, BtcMultiUnbindBtn, BtcConfirm } from '@btc/shared-components';
import type { TableColumn, TransferPanelColumn, TransferKey } from '@btc/shared-components';
import { service } from '@services/eps';
import { services as userServices } from '../users/config';
import { services as roleServices } from '@modules/access/views/roles/config';

const { t } = useI18n();
const crudRef = ref();
const transferDrawerRef = ref<any>(null);
const drawerVisible = ref(false);
const submitting = ref(false);

// 使用 EPS userRole 服务（参考用户列表的使用方式，直接传递服务对象）
const userRoleService = service.system?.iam?.userRole;

// 根据后端返回的数据格式定义表格列
const roleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'name', label: t('org.user_role_assign.columns.username'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'realName', label: t('org.user_role_assign.user.realName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'roleName', label: t('org.user_role_assign.columns.roleName'), minWidth: 180, showOverflowTooltip: true },
  {
    type: 'op',
    label: t('crud.table.operation'),
    width: 180,
    align: 'center',
    fixed: 'right' as const,
    buttons: [
      {
        label: t('org.user_role_assign.actions.modify_bind'),
        type: 'primary',
        icon: 'modify-bind',
        onClick: ({ scope }: { scope: any }) => handleModifyBind(scope.row),
      },
      {
        label: t('org.user_role_assign.actions.unbind'),
        type: 'danger',
        icon: 'unbind',
        onClick: ({ scope }: { scope: any }) => handleUnbind(scope.row),
      },
    ],
  },
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
const isModifyMode = ref(false);
const modifyBindRow = ref<any>(null);

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
  // 清空之前的选择
  selectedUserKeys.value = [];
  selectedRoleKeys.value = [];
  isModifyMode.value = false;
  modifyBindRow.value = null;
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
  // 延迟重置状态，确保抽屉关闭动画完成
  setTimeout(() => {
    selectedUserKeys.value = [];
    selectedRoleKeys.value = [];
    isModifyMode.value = false;
    modifyBindRow.value = null;
  }, 300);
}

function handleSectionKeys(payload: { key: string; keys: TransferKey[] }) {
  if (payload.key === 'users') {
    selectedUserKeys.value = [...payload.keys];
  } else if (payload.key === 'roles') {
    selectedRoleKeys.value = [...payload.keys];
  }
}

async function handleSubmit() {
  // 验证是否选择了用户和角色
  if (!selectedUserKeys.value || selectedUserKeys.value.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectUsers'));
    return;
  }

  if (!selectedRoleKeys.value || selectedRoleKeys.value.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectRoles'));
    return;
  }

  submitting.value = true;
  try {
    if (isModifyMode.value && modifyBindRow.value) {
      // 换绑模式：使用 modifyBind
      const newRoleId = selectedRoleKeys.value[0];
      if (newRoleId === modifyBindRow.value.roleId) {
        BtcMessage.warning(t('org.user_role_assign.messages.sameRole'));
        submitting.value = false;
        return;
      }

      await userRoleService?.modifyBind?.({
        userId: modifyBindRow.value.userId,
        roleId: newRoleId,
      });

      BtcMessage.success(t('org.user_role_assign.messages.modifyBindSuccess'));
    } else {
      // 批量绑定模式：使用 bind
      // 构建用户-角色绑定关系数组
      const bindRelations: Array<{ userId: string | number; roleId: string | number }> = [];
      
      selectedUserKeys.value.forEach((userId) => {
        selectedRoleKeys.value.forEach((roleId) => {
          bindRelations.push({
            userId,
            roleId,
          });
        });
      });

      await userRoleService?.bind?.({
        relations: bindRelations,
      });

      BtcMessage.success(t('org.user_role_assign.messages.submitSuccess'));
    }

    closeDrawer();
    crudRef.value?.crud?.refresh?.();
  } catch (error: any) {
    console.error('[UserRoleAssign] submit error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

function handleModifyBind(row: any) {
  // 设置为换绑模式
  isModifyMode.value = true;
  modifyBindRow.value = row;
  
  // 打开抽屉，预填充当前行的用户和角色
  selectedUserKeys.value = [row.userId];
  selectedRoleKeys.value = [row.roleId];
  drawerVisible.value = true;
  
  // 打开抽屉后刷新数据，确保选中项能正确显示
  setTimeout(() => {
    transferDrawerRef.value?.refreshAll?.();
  }, 100);
}

async function handleUnbind(row: any) {
  try {
    await BtcConfirm(
      t('org.user_role_assign.messages.unbindConfirm', { 
        username: row.name || row.username,
        roleName: row.roleName 
      }),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    await userRoleService?.unbind?.({
      userId: row.userId,
      roleId: row.roleId,
    });

    BtcMessage.success(t('org.user_role_assign.messages.unbindSuccess'));
    crudRef.value?.crud?.refresh?.();
  } catch (error: any) {
    // 用户取消操作时不显示错误
    if (error?.message === 'cancel' || error === 'cancel') {
      return;
    }
    console.error('[UserRoleAssign] unbind error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  }
}

async function handleMultiUnbind(rows: any[]) {
  if (!rows || rows.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectRows'));
    return;
  }

  try {
    await BtcConfirm(
      t('org.user_role_assign.messages.unbindBatchConfirm', { count: rows.length }),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    const ids = rows.map((row) => row.id);
    await userRoleService?.unbindBatch?.(ids);

    BtcMessage.success(t('org.user_role_assign.messages.unbindSuccess'));
    crudRef.value?.crud?.refresh?.();
  } catch (error: any) {
    // 用户取消操作时不显示错误
    if (error?.message === 'cancel' || error === 'cancel') {
      return;
    }
    console.error('[UserRoleAssign] multi unbind error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
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
