<template>
  <div class="user-role-assign-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedUserRoleService"
      :table-columns="roleColumns"
      :form-items="[]"
      left-title="业务域"
      right-title="角色绑定列表"
      search-placeholder="搜索用户或角色..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      :op="undefined"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :left-size="'small'"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <el-button type="primary" class="btc-crud-btn" @click="openDrawer">
          <BtcSvg class="btc-crud-btn__icon" name="authorize" />
          <span class="btc-crud-btn__text">{{ t('common.button.authorize') }}</span>
        </el-button>
      </template>
      <template #multi-delete-btn>
        <BtcMultiUnbindBtn @click="handleMultiUnbind" />
      </template>
    </BtcTableGroup>

    <BtcTransferDrawer
      ref="transferDrawerRef"
      v-model:visible="drawerVisible"
      :title="t('org.user_role_assign.drawer.title')"
      :subtitle="t('org.user_role_assign.drawer.subtitle')"
      :sections="drawerSectionsComputed"
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
import { ref, computed, watch, shallowRef, markRaw } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage, BtcTransferDrawer, BtcMultiUnbindBtn, BtcConfirm, BtcTableGroup, BtcSvg } from '@btc/shared-components';
import type { TableColumn, TransferPanelColumn, TransferKey } from '@btc/shared-components';
import { service } from '@services/eps';
import { services as userServices } from '../users/config';
import { services as roleServices } from '@modules/access/views/roles/config';

const { t } = useI18n();
const tableGroupRef = ref();
const transferDrawerRef = ref<any>(null);
const drawerVisible = ref(false);
const submitting = ref(false);
const selectedDomain = ref<any>(null);

// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 使用 EPS userRole 服务
const userRoleService = service.system?.iam?.userRole;

// 包装 userRoleService，处理 domainId 参数
const wrappedUserRoleService = {
  ...userRoleService,
  page: async (params: any) => {
    // BtcTableGroup 会将左侧选中的域 ID 作为 keyword 传递，格式为 { ids: [...] }
    // 需要将其转换为 domainId 参数
    const finalParams = { ...params };

    // 处理 keyword 参数
    if (finalParams.keyword !== undefined && finalParams.keyword !== null) {
      const keyword = finalParams.keyword;

      // 如果 keyword 是对象且包含 ids 字段（BtcTableGroup 的标准格式）
      if (typeof keyword === 'object' && !Array.isArray(keyword) && keyword.ids) {
        const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
        // 取第一个 ID 作为 domainId
        if (ids.length > 0 && ids[0] !== undefined && ids[0] !== null && ids[0] !== '') {
          finalParams.domainId = ids[0];
        }
        // 清除 keyword，避免影响搜索
        delete finalParams.keyword;
      } else if (typeof keyword === 'number' || (typeof keyword === 'string' && !isNaN(Number(keyword)) && keyword !== '')) {
        // 如果 keyword 直接是数字或可转换为数字的字符串
        finalParams.domainId = typeof keyword === 'number' ? keyword : Number(keyword);
        delete finalParams.keyword;
      }
    }

    return userRoleService?.page?.(finalParams);
  }
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

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
    minWidth: 126, // 单个按钮的最小宽度（116+10），保证工具栏宽度
    width: 126, // 单个按钮的宽度（116+10）
    align: 'center',
    fixed: 'right' as const,
    buttons: [
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

// 提取稳定的函数引用，避免每次 computed 重新计算时创建新函数
const handleUserBeforeRefresh = (params: Record<string, unknown>) => {
  // 确保搜索关键字只传递到 search 对象中的正确字段，不影响外源性 ids
  if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
    const keyword = params.keyword as Record<string, unknown>;
    // 如果 keyword 中有 ids 字段且是字符串或字符串数组（搜索关键字被错误映射），
    // 将其移到 username，但保留外源性的 ids（数字或数字数组）
    if (keyword.ids !== undefined) {
      const idsValue = keyword.ids;
      // 判断是否是搜索关键字（字符串类型）
      if (typeof idsValue === 'string' && idsValue !== '') {
        // 字符串类型的 ids 是搜索关键字，移到 username
        keyword.username = idsValue;
        delete keyword.ids;
      } else if (Array.isArray(idsValue) && idsValue.length > 0) {
        // 判断数组中的元素类型
        const firstElement = idsValue[0];
        if (typeof firstElement === 'string') {
          // 字符串数组是搜索关键字，移到 username
          keyword.username = firstElement;
          delete keyword.ids;
        }
        // 数字数组是外源性参数，保留不变
      }
      // 其他情况（数字、空数组等）保留不变，因为可能是外源性参数
    }
  }
  return params;
};

const handleRoleBeforeRefresh = (params: Record<string, unknown>) => {
  // 确保搜索关键字只传递到 search 对象中的正确字段，不影响外源性 ids
  if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
    const keyword = params.keyword as Record<string, unknown>;
    // 如果 keyword 中有 ids 字段且是字符串或字符串数组（搜索关键字被错误映射），
    // 将其移到 roleName，但保留外源性的 ids（数字或数字数组）
    if (keyword.ids !== undefined) {
      const idsValue = keyword.ids;
      // 判断是否是搜索关键字（字符串类型）
      if (typeof idsValue === 'string' && idsValue !== '') {
        // 字符串类型的 ids 是搜索关键字，移到 roleName
        keyword.roleName = idsValue;
        delete keyword.ids;
      } else if (Array.isArray(idsValue) && idsValue.length > 0) {
        // 判断数组中的元素类型
        const firstElement = idsValue[0];
        if (typeof firstElement === 'string') {
          // 字符串数组是搜索关键字，移到 roleName
          keyword.roleName = firstElement;
          delete keyword.ids;
        }
        // 数字数组是外源性参数，保留不变
      }
      // 其他情况（数字、空数组等）保留不变，因为可能是外源性参数
    }
  }
  return params;
};

// 提取静态配置对象，避免每次 computed 重新计算时创建新对象
const userOptions = {
  search: {
    keyWordLikeFields: ['username'],
  },
  onBeforeRefresh: handleUserBeforeRefresh,
};

const roleOptions = {
  search: {
    keyWordLikeFields: ['roleName'],
  },
  onBeforeRefresh: handleRoleBeforeRefresh,
};

// 使用 shallowRef 存储 sections，减少深度响应式
const drawerSections = shallowRef<any[]>([]);

// 更新 sections 的函数
function updateDrawerSections() {
  const sections: any[] = [];

  const userSection = {
    key: 'users',
    title: t('org.user_role_assign.drawer.subjectSectionTitle'),
    transferProps: markRaw({
      service: userService,
      columns: userTransferColumns.value,
      displayProp: 'username',
      descriptionProp: 'realName',
      rowKey: 'id',
      collapsible: false,
      options: userOptions,
      // 不设置 maxHeight，让表格根据数据动态计算高度，但不超过穿梭框的可用空间
    }),
    modelValue: [...selectedUserKeys.value],
  };
  sections.push(userSection);

  const roleSection = {
    key: 'roles',
    title: t('org.user_role_assign.drawer.roleSectionTitle'),
      transferProps: markRaw({
        service: roleService,
        columns: roleTransferColumns.value,
        displayProp: 'roleName',
        descriptionProp: 'description',
        rowKey: 'id',
        collapsible: false,
        options: roleOptions,
        // 不设置 maxHeight，让表格根据数据动态计算高度，但不超过穿梭框的可用空间
      }),
    modelValue: [...selectedRoleKeys.value],
  };
  sections.push(roleSection);

  drawerSections.value = sections;
}

// 使用 computed 来响应式返回 sections
const drawerSectionsComputed = computed(() => {
  // 只在抽屉可见时返回 sections，避免不必要的计算
  if (!drawerVisible.value) {
    return [];
  }

  // 如果 sections 为空，则初始化
  if (drawerSections.value.length === 0) {
    updateDrawerSections();
  }

  return drawerSections.value;
});

// 监听选择变化，只更新 modelValue，不重新创建对象
watch([selectedUserKeys, selectedRoleKeys], () => {
  if (drawerVisible.value && drawerSections.value.length > 0) {
    const userSection = drawerSections.value.find(s => s.key === 'users');
    const roleSection = drawerSections.value.find(s => s.key === 'roles');
    if (userSection) {
      userSection.modelValue = [...selectedUserKeys.value];
    }
    if (roleSection) {
      roleSection.modelValue = [...selectedRoleKeys.value];
    }
  }
}, { flush: 'post' });

function openDrawer() {
  // 清空之前的选择
  selectedUserKeys.value = [];
  selectedRoleKeys.value = [];
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
  // 延迟重置状态，确保抽屉关闭动画完成
  setTimeout(() => {
    selectedUserKeys.value = [];
    selectedRoleKeys.value = [];
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
    // 批量绑定模式：使用 bind
    // 后端要求 roleId 和 userId 都为数组格式
    await userRoleService?.bind?.({
      userId: selectedUserKeys.value,
      roleId: selectedRoleKeys.value,
    });

    BtcMessage.success(t('org.user_role_assign.messages.bindSuccess'));
    closeDrawer();
    tableGroupRef.value?.refresh?.();
  } catch (error: any) {
    console.error('[UserRoleAssign] submit error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
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
    tableGroupRef.value?.refresh?.();
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

    const unbindList = rows.map((row) => ({
      userId: row.userId,
      roleId: row.roleId,
    }));

    await userRoleService?.unbindBatch?.(unbindList);

    BtcMessage.success(t('org.user_role_assign.messages.unbindSuccess'));
    tableGroupRef.value?.refresh?.();
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

// 修改穿梭框布局，禁用容器滚动条，让内部组件自己滚动
:deep(.btc-transfer-drawer__content) {
  overflow: hidden;
}

:deep(.btc-transfer-drawer__splitter) {
  height: 100%;

  .el-splitter__panel {
    overflow: hidden;
  }

  // 限制 panel-header 的高度
  .btc-transfer-drawer__panel-header {
    flex-shrink: 0;
    height: auto;
  }

  // 限制 panel-body 的高度，减去 header 高度，不产生滚动条，让内部组件自己滚动
  .btc-transfer-drawer__panel-body {
    height: calc(100% - 48px) !important;
    max-height: calc(100% - 48px) !important;
    overflow: hidden;
  }

  // 限制 BtcTransferPanel 的高度，使用 flex 布局
  .btc-transfer-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 限制内部主内容区域的高度，使用 flex 布局
  .btc-transfer-panel__main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 限制 toolbar 高度
  .btc-transfer-panel__toolbar {
    flex-shrink: 0;
    height: auto;
    min-height: 40px;
  }

  // 限制 pagination 高度
  .btc-transfer-panel__pagination-row {
    flex-shrink: 0;
    height: auto;
    min-height: 40px;
  }

  // 限制表格行的高度，使用 flex 布局，让表格内部滚动
  .btc-transfer-panel__table-row {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-col) {
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    :deep(.btc-table) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    :deep(.el-table) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    :deep(.el-table__inner-wrapper) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    :deep(.el-table__header-wrapper) {
      flex-shrink: 0;
    }

    :deep(.el-table__body-wrapper) {
      flex: 1;
      min-height: 0;
      overflow-y: auto !important;
    }
  }
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
