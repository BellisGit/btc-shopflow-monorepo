<template>
  <div class="perm-compose perm-compose-page">
    <!-- ????? -->
    <div class="perm-compose-header">
      <div class="header-left">
        <BtcSelectButton v-model="mode" :options="modeOptions" @change="handleModeChange" />
      </div>
      <div class="header-right">
        <el-button @click="handleClearAll" :disabled="composedPermissions.length === 0">
          <el-icon><Delete /></el-icon>
          ????
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" :disabled="composedPermissions.length === 0">
          <el-icon><Select /></el-icon>
          ????
        </el-button>
      </div>
    </div>

    <!-- ????? -->
    <div class="perm-compose-content">
      <div class="perm-compose-wrap">
        <!-- ?????? -->
        <div class="perm-compose-left">
          <div class="scope">
            <!-- ?? -->
            <div class="head">
              <el-text class="label">????</el-text>
              <el-switch
                v-model="applyToChildren"
                active-text="?????"
                inactive-text=""
                size="small"
              />
            </div>

            <!-- ??? -->
            <div class="search">
              <el-input
                v-model="resourceFilterText"
                placeholder="????"
                clearable
                :prefix-icon="Search"
              />
            </div>

            <!-- ??? -->
            <div class="data">
              <el-scrollbar>
                <el-tree
                  ref="resourceTreeRef"
                  class="tree"
                  :data="resourceTree"
                  :props="treeProps"
                  :filter-node-method="filterResourceNode"
                  show-checkbox
                  :check-strictly="!applyToChildren"
                  node-key="id"
                  default-expand-all
                  highlight-current
                  @check-change="handleResourceCheck"
                >
                  <template #default="{ data }">
                  <div class="item">
                    <el-icon><FolderOpened /></el-icon>
                    <el-text truncated class="item-label">
                      {{ data.resourceNameCn }}
                    </el-text>
                    <el-tag v-if="data.supportedActions" size="small" type="info" class="item-tag">
                      {{ data.supportedActions.length }}
                    </el-tag>
                  </div>
                  </template>
                </el-tree>
              </el-scrollbar>
            </div>
          </div>
        </div>

        <!-- ?????????????? ?????????? -->
        <div class="perm-compose-middle">
          <div class="scope">
            <!-- ?? -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? '????' : '????' }}</el-text>
              <div class="head-actions" v-if="mode === 'compose'">
                <el-button size="small" text @click="handleSelectAllActions">??</el-button>
                <el-divider direction="vertical" />
                <el-dropdown trigger="click" @command="handleActionTemplate">
                  <el-button size="small" text>
                    ????<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="readonly">??????</el-dropdown-item>
                      <el-dropdown-item command="editor">?????+???</el-dropdown-item>
                      <el-dropdown-item command="full">???CRUD?</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- ??? -->
            <div class="data">
              <el-scrollbar>
                <!-- ????????? -->
                <el-table
                  v-if="mode === 'compose'"
                  ref="actionTableRef"
                  :data="filteredActions"
                  border
                  stripe
                  @selection-change="handleActionSelectionChange"
                  style="width: 100%;"
                >
                  <el-table-column type="selection" width="50" :selectable="(row) => isActionSupported(row.id)" />
                  <el-table-column label="??" width="60" align="center">
                    <template #default="{ row }">
                      <el-icon v-if="row.actionCode === 'view'" :size="18" color="var(--el-color-success)"><View /></el-icon>
                      <el-icon v-else-if="row.actionCode === 'create'" :size="18" color="var(--el-color-primary)"><Plus /></el-icon>
                      <el-icon v-else-if="row.actionCode === 'edit'" :size="18" color="var(--el-color-warning)"><Edit /></el-icon>
                      <el-icon v-else-if="row.actionCode === 'delete'" :size="18" color="var(--el-color-danger)"><Delete /></el-icon>
                      <el-icon v-else :size="18"><Operation /></el-icon>
                    </template>
                  </el-table-column>
                  <el-table-column prop="actionNameCn" label="??" width="80" />
                  <el-table-column prop="actionCode" label="??" min-width="100">
                    <template #default="{ row }">
                      <code class="action-code">{{ row.actionCode }}</code>
                    </template>
                  </el-table-column>
                  <el-table-column label="??" width="90" align="center">
                    <template #default="{ row }">
                      <el-tag size="small" :type="getMethodType(row.httpMethod)" effect="plain">
                        {{ row.httpMethod }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="???" width="90" align="center" v-if="selectedResources.length > 1">
                    <template #default="{ row }">
                      <el-tooltip :content="`${getActionSupportCount(row.id)} / ${selectedResources.length} ????????`" placement="top">
                        <el-tag
                          size="small"
                          :type="getActionSupportCount(row.id) === selectedResources.length ? 'success' : 'warning'"
                          effect="plain"
                        >
                          {{ getActionSupportCount(row.id) }}/{{ selectedResources.length }}
                        </el-tag>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>

                <!-- ??????????? -->
                <div v-if="matrixData.length === 0 && mode === 'matrix'" class="matrix-empty">
                  <el-empty description="????????">
                    <template #image>
                      <el-icon :size="60" color="var(--el-text-color-placeholder)">
                        <FolderOpened />
                      </el-icon>
                    </template>
                  </el-empty>
                </div>
                <el-table
                  v-else-if="mode === 'matrix'"
                  :data="matrixData"
                  border
                  stripe
                  highlight-current-row
                  style="width: 100%;"
                >
                  <el-table-column prop="resourceNameCn" label="??" width="220" fixed align="center" header-align="center">
                    <template #default="{ row }">
                      <div class="matrix-resource">
                        <el-icon :size="16"><FolderOpened /></el-icon>
                        <span>{{ row.resourceNameCn }}</span>
                        <el-tag v-if="row.resourceCode" size="small" type="info">
                          {{ row.resourceCode }}
                        </el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    v-for="action in actions"
                    :key="action.id"
                    :prop="`action_${action.id}`"
                    min-width="100"
                    align="center"
                  >
                    <template #header>
                      <div class="matrix-action-header">
                        <el-icon v-if="action.actionCode === 'view'" :size="16" color="var(--el-color-success)"><View /></el-icon>
                        <el-icon v-else-if="action.actionCode === 'create'" :size="16" color="var(--el-color-primary)"><Plus /></el-icon>
                        <el-icon v-else-if="action.actionCode === 'edit'" :size="16" color="var(--el-color-warning)"><Edit /></el-icon>
                        <el-icon v-else-if="action.actionCode === 'delete'" :size="16" color="var(--el-color-danger)"><Delete /></el-icon>
                        <span>{{ action.actionNameCn }}</span>
                      </div>
                    </template>
                    <template #default="{ row }">
                      <el-checkbox
                        :model-value="isPermissionChecked(row.id, action.id)"
                        @change="handleMatrixToggle(row.id, action.id, $event)"
                        :disabled="!isActionSupportedByResource(row.id, action.id)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-scrollbar>
            </div>
          </div>
        </div>

        <!-- ??????? -->
        <div class="perm-compose-right">
          <div class="scope">
            <!-- ?? -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? '????' : '????' }}</el-text>
              <div class="head-stat">
                <el-statistic
                  :value="composedPermissions.length"
                  suffix="?"
                  :value-style="{ fontSize: '16px', fontWeight: 600, color: 'var(--el-color-primary)' }"
                />
              </div>
            </div>

            <!-- ????????? -->
            <div v-if="mode === 'compose'" class="compose-action">
              <el-button
                type="primary"
                @click="handleCompose"
                :disabled="!canCompose"
                :loading="composing"
                style="width: 100%;"
                size="large"
              >
                <el-icon><Connection /></el-icon>
                    ?????????? {{ composeCount }} ??
              </el-button>
            </div>

            <!-- ??? -->
            <div class="data" :style="{ height: mode === 'compose' ? 'calc(100% - 110px)' : 'calc(100% - 40px)' }">
              <el-scrollbar>
                <div class="permission-list">
                  <transition-group name="list">
                    <div
                      v-for="(perm, index) in composedPermissions"
                      :key="perm.key"
                      class="permission-item"
                    >
                      <div class="permission-item__index">{{ index + 1 }}</div>
                      <div class="permission-item__content">
                        <div class="permission-item__name">{{ perm.permissionName }}</div>
                        <div class="permission-item__code">{{ perm.permissionCode }}</div>
                      </div>
                      <div class="icon" @click="handleRemovePermission(index)">
                        <el-icon><Close /></el-icon>
                      </div>
                    </div>
                  </transition-group>

                  <el-empty v-if="composedPermissions.length === 0" description="???????" :image-size="80">
                    <template #image>
                      <el-icon :size="60" color="var(--el-text-color-placeholder)">
                        <Document />
                      </el-icon>
                    </template>
                  </el-empty>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMessage } from '@/utils/use-message';
import {
  Delete,
  Select,
  FolderOpened,
  View,
  Plus,
  Edit,
  Operation,
  Connection,
  Document,
  ArrowDown,
  Search,
  Close,
} from '@element-plus/icons-vue';
import { service } from '@services/eps';

// ????
const message = useMessage();
const mode = ref<'matrix' | 'compose'>('matrix');
const modeOptions = [
  { label: '????', value: 'matrix' },
  { label: '????', value: 'compose' },
];

// Mock??
const _resourceService = service.system?.iam?.sys.resource;

const _actionService = service.system?.iam?.sys.action;

const permissionService = service.system?.iam?.sys.permission;

// ?????
const resourceTree = ref<any[]>([]);
const actions = ref<any[]>([]);
const composedPermissions = ref<any[]>([]);

// ?????
const resourceTreeRef = ref();
const resourceFilterText = ref('');
const applyToChildren = ref(false);
const treeProps = {
  children: 'children',
  label: 'resourceNameCn',
};

// ????
const selectedResources = ref<number[]>([]);
const selectedActions = ref<number[]>([]);
const currentResource = ref<any>(null);

// ??????
const matrixSelections = ref<Set<string>>(new Set());

// ????
const composing = ref(false);
const saving = ref(false);

// ??????
const filterResourceNode = (value: string, data: any) => {
  if (!value) return true;
  return data.resourceNameCn.toLowerCase().includes(value.toLowerCase()) ||
         data.resourceCode.toLowerCase().includes(value.toLowerCase());
};

// ????
watch(resourceFilterText, (val) => {
  resourceTreeRef.value?.filter(val);
});

// ????
const handleModeChange = (val: 'matrix' | 'compose') => {
  message.info(`???${val === 'matrix' ? '??' : '??'}??`);

  // ??????
  if (val === 'matrix') {
    selectedResources.value = [];
    selectedActions.value = [];
  } else {
    matrixSelections.value.clear();
    currentResource.value = null;
  }
};

// ????????????????????????
const composeCount = computed(() => {
  if (selectedResources.value.length === 0 || selectedActions.value.length === 0) {
    return 0;
  }

  const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
  let count = 0;

  checkedNodes.forEach((resource: any) => {
    selectedActions.value.forEach(actionId => {
      // ???????????
      if (!resource.supportedActions || resource.supportedActions.includes(actionId)) {
        count++;
      }
    });
  });

  return count;
});

const canCompose = computed(() => {
  return composeCount.value > 0;
});

// ???????????????
const handleResourceCheck = (_data: any, _checked: boolean) => {
  const checkedKeys = resourceTreeRef.value?.getCheckedKeys() || [];
  selectedResources.value = checkedKeys;
};

// ?????????????????? + ?????
const filteredActions = computed(() => {
  // ???????????????
  if (selectedResources.value.length === 0) {
    return actions.value;
  }

  // ???????????
  const filtered = actions.value.filter(action => {
    // ???????????????
    return selectedResources.value.every(resourceId => {
      const resource = resourceTreeRef.value?.find(r => r.id === resourceId);
      return resource && resource.supportedActions && resource.supportedActions.includes(action.id);
    });
  });

  // ??????????????
  if (filtered.length === 0) {
    message.warning('??????????????????????????');
  }

  return filtered;
});

// ???????????????????????
const isActionSupported = (actionId: number) => {
  if (selectedResources.value.length === 0) return true;

  const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
  if (checkedNodes.length === 0) return true;

  // ???????????????
  const supportedCount = checkedNodes.filter((node: any) =>
    !node.supportedActions || node.supportedActions.includes(actionId)
  ).length;

  // ?????????????????
  return supportedCount < selectedResources.value.length;
};

// ?????????????????
const getActionSupportCount = (actionId: number) => {
  if (selectedResources.value.length === 0) return 0;

  const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
  return checkedNodes.filter((node: any) =>
    !node.supportedActions || node.supportedActions.includes(actionId)
  ).length;
};

// ?????????????????
const isActionSupportedByResource = (resourceId: number, actionId: number) => {
  const findResource = (tree: any[], id: number): any => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findResource(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const resource = findResource(resourceTree.value, resourceId);
  if (!resource || !resource.supportedActions) return true;
  return resource.supportedActions.includes(actionId);
};

// ??????????????
const actionTableRef = ref();
const handleActionSelectionChange = (selection: any[]) => {
  selectedActions.value = selection.map(a => a.id);
};

// ????
const handleSelectAllActions = () => {
  if (selectedActions.value.length === filteredActions.value.length) {
    selectedActions.value = [];
    actionTableRef.value?.clearSelection();
    message.info('?????');
  } else {
    selectedActions.value = filteredActions.value.map(a => a.id);
    filteredActions.value.forEach((row: any) => {
      actionTableRef.value?.toggleRowSelection(row, true);
    });
    message.success('???????');
  }
};

// ????
const handleActionTemplate = (command: string) => {
  actionTableRef.value?.clearSelection();

  let targetActions: any[] = [];

  switch (command) {
    case 'readonly':
      targetActions = actions.value.filter(a => a.actionCode === 'view');
      message.success('?????????');
      break;
    case 'editor':
      targetActions = actions.value.filter(a => ['view', 'edit'].includes(a.actionCode));
      message.success('?????????');
      break;
    case 'full':
      targetActions = actions.value;
      message.success('?????????');
      break;
  }

  selectedActions.value = targetActions.map(a => a.id);

  targetActions.forEach(action => {
    actionTableRef.value?.toggleRowSelection(action, true);
  });
};

// HTTP????
const getMethodType = (method: string) => {
  const typeMap: Record<string, any> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
  };
  return typeMap[method] || 'info';
};

// ???????????
const handleCompose = async () => {
  if (!canCompose.value) {
    message.warning('?????????');
    return;
  }

  composing.value = true;
  try {
    const newPermissions: any[] = [];
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];

    const existingKeys = new Set(composedPermissions.value.map(p => p.key));

    checkedNodes.forEach((resource: any) => {
      selectedActions.value.forEach(actionId => {
        const action = actions.value.find(a => a.id === actionId);
        if (!action) return;

        if (resource.supportedActions && !resource.supportedActions.includes(actionId)) {
          return;
        }

        const key = `${resource.id}-${actionId}`;

        if (existingKeys.has(key)) return;

        newPermissions.push({
          key,
          permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
          permissionCode: `${resource.resourceCode}:${action.actionCode}`,
          resourceId: resource.id,
          resourceName: resource.resourceNameCn,
          actionId: action.id,
          actionName: action.actionNameCn,
          description: `${action.actionNameCn}${resource.resourceNameCn}???`,
        });
      });
    });

    if (newPermissions.length === 0) {
      message.warning('?????????');
      return;
    }

    composedPermissions.value.push(...newPermissions);
    message.success(`???? ${newPermissions.length} ???`);

    resourceTreeRef.value?.setCheckedKeys([]);
    selectedResources.value = [];
    selectedActions.value = [];
  } catch (_error) {
    message.error('??????');
  } finally {
    composing.value = false;
  }
};

// ???????????????
const matrixData = computed(() => {
  if (mode.value !== 'matrix' || selectedResources.value.length === 0) {
    return [];
  }

  const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
  return checkedNodes;
});

// ??????????????
const isPermissionChecked = (resourceId: number, actionId: number) => {
  return matrixSelections.value.has(`${resourceId}-${actionId}`);
};

// ???????????????
const handleMatrixToggle = (resourceId: number, actionId: number, checked: boolean) => {
  const key = `${resourceId}-${actionId}`;

  if (checked) {
    matrixSelections.value.add(key);

    const resource = matrixData.value.find(r => r.id === resourceId);
    const action = actions.value.find(a => a.id === actionId);

    if (resource && action) {
      const existingKeys = new Set(composedPermissions.value.map(p => p.key));
      if (!existingKeys.has(key)) {
        composedPermissions.value.push({
          key,
          permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
          permissionCode: `${resource.resourceCode}:${action.actionCode}`,
          resourceId: resource.id,
          resourceName: resource.resourceNameCn,
          actionId: action.id,
          actionName: action.actionNameCn,
          description: `${action.actionNameCn}${resource.resourceNameCn}???`,
        });
        message.success(`????${action.actionNameCn}${resource.resourceNameCn}`);
      }
    }
  } else {
    matrixSelections.value.delete(key);

    const index = composedPermissions.value.findIndex(p => p.key === key);
    if (index > -1) {
      const perm = composedPermissions.value[index];
      composedPermissions.value.splice(index, 1);
      message.info(`????${perm.permissionName}`);
    }
  }
};

// ??????
const handleRemovePermission = (index: number) => {
  const perm = composedPermissions.value[index];
  composedPermissions.value.splice(index, 1);

  if (mode.value === 'matrix') {
    matrixSelections.value.delete(perm.key);
  }

  message.success('???');
};

// ??????
const handleClearAll = () => {
  composedPermissions.value = [];
  matrixSelections.value.clear();
  message.success('???????');
};

// ????
const handleSave = async () => {
  saving.value = true;
  try {
    for (const perm of composedPermissions.value) {
      await permissionService.add(perm);
    }
    message.success(`???? ${composedPermissions.value.length} ???`);
    composedPermissions.value = [];
    matrixSelections.value.clear();
  } catch (_error) {
    message.error('????');
  } finally {
    saving.value = false;
  }
};

// ????
const loadData = async () => {
  // ???localStorage ??????????????
  const resourcesRaw = localStorage.getItem('btc_mock_btc_resources');
  const actionsRaw = localStorage.getItem('btc_mock_btc_actions');

  if (resourcesRaw) {
    resourceTree.value = JSON.parse(resourcesRaw);
  } else {
    // ????????????????
    resourceTree.value = [
      {
        id: 1,
        resourceNameCn: '????',
        resourceCode: 'user',
        resourceType: '??',
        supportedActions: [1, 2, 3, 4],
        children: [
          { id: 11, resourceNameCn: '????', resourceCode: 'user.list', resourceType: '??', supportedActions: [1, 2, 3, 4] },
          { id: 12, resourceNameCn: '????', resourceCode: 'user.detail', resourceType: '??', supportedActions: [1] },
        ]
      },
      {
        id: 2,
        resourceNameCn: '????',
        resourceCode: 'role',
        resourceType: '??',
        supportedActions: [1, 2, 3, 4],
        children: [
          { id: 21, resourceNameCn: '????', resourceCode: 'role.list', resourceType: '??', supportedActions: [1, 2, 3, 4] },
          { id: 22, resourceNameCn: '????', resourceCode: 'role.assign', resourceType: '??', supportedActions: [1, 4] },
        ]
      },
      {
        id: 3,
        resourceNameCn: '????',
        resourceCode: 'department',
        resourceType: '??',
        supportedActions: [1, 2, 3, 4],
        children: [
          { id: 31, resourceNameCn: '????', resourceCode: 'dept.list', resourceType: '??', supportedActions: [1, 2, 3, 4] },
        ]
      },
      {
        id: 4,
        resourceNameCn: '????',
        resourceCode: 'system',
        resourceType: '??',
        supportedActions: [1, 2],
        children: [
          { id: 41, resourceNameCn: '????', resourceCode: 'system.config', resourceType: '??', supportedActions: [1, 2] },
        ]
      },
    ];
    localStorage.setItem('btc_mock_btc_resources', JSON.stringify(resourceTree.value));
  }

  if (actionsRaw) {
    actions.value = JSON.parse(actionsRaw);
  } else {
    actions.value = [
      { id: 1, actionNameCn: '??', actionCode: 'view', httpMethod: 'GET' },
      { id: 2, actionNameCn: '??', actionCode: 'edit', httpMethod: 'PUT' },
      { id: 3, actionNameCn: '??', actionCode: 'delete', httpMethod: 'DELETE' },
      { id: 4, actionNameCn: '??', actionCode: 'create', httpMethod: 'POST' },
    ];
    localStorage.setItem('btc_mock_btc_actions', JSON.stringify(actions.value));
  }
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.perm-compose {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.perm-compose-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    gap: 10px;
  }
}

.perm-compose-content {
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.perm-compose-wrap {
  display: flex;
  height: 100%;
  width: 100%;
  gap: 10px;
}

// ??????
.perm-compose-left {
  width: 300px;
  height: 100%;
  background-color: var(--el-bg-color);
  flex-shrink: 0;
}

// ?????????????? ??????????
.perm-compose-middle {
  flex: 1;
  height: 100%;
  background-color: var(--el-bg-color);
  min-width: 0;
}

// ???????
.perm-compose-right {
  width: 360px;
  height: 100%;
  background-color: var(--el-bg-color);
  flex-shrink: 0;
}

// ????
.perm-compose-header .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  font-size: 14px;
  padding: 0 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  .label {
    flex: 1;
    font-weight: 500;
  }

  .head-actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .head-stat {
    :deep(.el-statistic) {
      .el-statistic__head {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// ?????
.perm-compose-header .search {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }
}

// ?????
.perm-compose-content .data {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;

  .tree {
    :deep(.el-tree-node__content) {
      height: 38px;
      margin: 0 5px;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;

      .el-icon {
        flex-shrink: 0;
        color: var(--el-color-primary);
      }

      .item-label {
        flex: 1;
        min-width: 0;
      }

      .item-tag {
        flex-shrink: 0;
        font-size: 11px;
      }

      &.is-active {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

// ?????????
.compose-action {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;
}

// ??????
.action-code {
  font-size: 12px;
  color: var(--el-color-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  background: var(--el-color-primary-light-9);
  padding: 2px 6px;
  border-radius: 3px;
}

// ?????????
.matrix-resource {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .el-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }

  .el-tag {
    font-size: 11px;
    flex-shrink: 0;
  }
}

// ??????????
.matrix-action-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .el-icon {
    flex-shrink: 0;
  }

  span {
    font-size: 12px;
    font-weight: 500;
  }
}

// ????????
.permission-list {
  padding: 10px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--el-fill-color-light);
    transform: translateX(2px);

    .icon {
      color: var(--el-color-danger);
    }
  }

  &__index {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;

    .permission-item__name {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .permission-item__code {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 24px;
    width: 24px;
    font-size: 14px;
    border-radius: 4px;
    color: var(--el-text-color-regular);
    flex-shrink: 0;

    &:hover {
      background-color: var(--el-fill-color);
      color: var(--el-color-danger);
    }
  }
}

// ??????????
.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s;
}

// ????
:deep(.el-table) {
  font-size: 13px;

  .el-checkbox {
    display: flex;
    justify-content: center;
  }

  .el-table__cell {
    padding: 10px 0;
  }

  th.el-table__cell {
    background-color: var(--el-fill-color-lighter);
  }
}

// ??????????
.matrix-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

:deep(.el-empty) {
  padding: 40px 0;
}
</style>

