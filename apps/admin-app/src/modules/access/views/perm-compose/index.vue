<template>
  <div class="perm-compose perm-compose-page">
    <!-- 权限组合页面头部 -->
    <div class="perm-compose-header">
      <div class="header-left">
        <BtcSelectButton v-model="mode" :options="modeOptions" @change="handleModeChange" />
      </div>
      <div class="header-right">
        <el-button @click="handleClearAll" :disabled="composedPermissions.length === 0">
          <el-icon><Delete /></el-icon>
          清空全部
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" :disabled="composedPermissions.length === 0">
          <el-icon><Select /></el-icon>
          保存权限
        </el-button>
      </div>
    </div>

    <!-- 权限组合页面内容 -->
    <div class="perm-compose-content">
      <div class="perm-compose-wrap">
        <!-- 左侧资源树 -->
        <div class="perm-compose-left">
          <BtcResourceTree
            :resource-tree="resourceTree"
            :model-value="{ resourceFilterText, applyToChildren }"
            :tree-props="treeProps"
            :filter-resource-node="filterResourceNode"
            @resource-check="handleResourceCheck"
            ref="resourceTreeRef"
          />
        </div>

        <!-- 中间操作列表 -->
        <div class="perm-compose-middle">
          <div class="scope">
            <!-- 操作标题 -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? '权限矩阵' : '操作列表' }}</el-text>
              <div class="head-actions" v-if="mode === 'compose'">
                <el-button size="small" text @click="handleSelectAllActions">全选</el-button>
                <el-divider direction="vertical" />
                <el-dropdown trigger="click" @command="handleActionTemplate">
                  <el-button size="small" text>
                    快速选择<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="readonly">只读权限</el-dropdown-item>
                      <el-dropdown-item command="editor">编辑权限</el-dropdown-item>
                      <el-dropdown-item command="full">完整CRUD</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 操作表格 -->
            <BtcActionTable
              :mode="mode"
              :filtered-actions="filteredActions"
              :matrix-data="matrixData"
              :actions="actions"
              :selected-resources="selectedResources"
              :is-action-supported="isActionSupported"
              :get-action-support-count="getActionSupportCount"
              :is-permission-checked="isPermissionChecked"
              :is-action-supported-by-resource="isActionSupportedByResource"
              :get-method-type="getMethodType"
              :handle-matrix-toggle="handleMatrixToggle"
              @action-selection-change="handleActionSelectionChange"
              ref="actionTableRef"
            />
          </div>
        </div>

        <!-- 右侧权限预览 -->
        <div class="perm-compose-right">
          <div class="scope">
            <!-- 预览标题 -->
            <div class="head">
              <el-text class="label">{{ mode === 'matrix' ? '已选权限' : '权限预览' }}</el-text>
              <div class="head-stat">
                <el-statistic
                  :value="composedPermissions.length"
                  suffix="个"
                  :value-style="{ fontSize: '16px', fontWeight: 600, color: 'var(--el-color-primary)' }"
                />
              </div>
            </div>

            <!-- 组合按钮 -->
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
                    生成权限 {{ composeCount }} 个
              </el-button>
            </div>

            <!-- 预览数据 -->
            <div class="data" :style="{ height: mode === 'compose' ? 'calc(100% - 110px)' : 'calc(100% - 40px)' }">
              <el-scrollbar>
                <BtcPermissionList
                  :composed-permissions="composedPermissions"
                  @remove-permission="handleRemovePermission"
                />
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { Delete, Select, ArrowDown, Connection } from '@element-plus/icons-vue';
import { service } from '@services/eps';
import { usePermComposeData } from './composables/usePermComposeData';
import { useActionFilter } from './composables/useActionFilter';
import { useMatrixMode } from './composables/useMatrixMode';
import { useComposeMode } from './composables/useComposeMode';
import BtcResourceTree from './components/BtcResourceTree.vue';
import BtcActionTable from './components/BtcActionTable.vue';
import BtcPermissionList from './components/BtcPermissionList.vue';
import './styles/perm-compose.scss';

// 初始化
const message = useMessage();
const mode = ref<'matrix' | 'compose'>('matrix');
const modeOptions = [
  { label: '矩阵模式', value: 'matrix' },
  { label: '组合模式', value: 'compose' },
];

// 权限服务
const permissionService = service.system?.iam?.permission;

// 数据管理
const {
  resourceTree,
  actions,
  composedPermissions,
  resourceTreeRef,
  resourceFilterText,
  applyToChildren,
  treeProps,
  selectedResources,
  selectedActions,
  matrixSelections,
  filterResourceNode,
  loadData,
  handleResourceCheck,
} = usePermComposeData();

// 操作过滤
const {
  filteredActions,
  isActionSupported,
  getActionSupportCount,
  isActionSupportedByResource,
} = useActionFilter(actions, selectedResources, resourceTreeRef, resourceTree);

// 矩阵模式
const {
  matrixData,
  isPermissionChecked,
  handleMatrixToggle,
} = useMatrixMode(resourceTree, actions, selectedResources, matrixSelections, composedPermissions, resourceTreeRef);

// 组合模式
const {
  composeCount,
  canCompose,
  handleCompose: handleComposeBase,
} = useComposeMode(actions, selectedResources, selectedActions, resourceTreeRef, composedPermissions);

// 状态
const composing = ref(false);
const saving = ref(false);

// 切换模式
const handleModeChange = (val: 'matrix' | 'compose') => {
  message.info(`已切换到${val === 'matrix' ? '矩阵' : '组合'}模式`);

  if (val === 'matrix') {
    selectedResources.value = [];
    selectedActions.value = [];
  } else {
    matrixSelections.value.clear();
  }
};

// 操作表格引用和方法
const actionTableRef = ref();
const handleActionSelectionChange = (selection: any[]) => {
  selectedActions.value = selection.map((a: any) => a.id);
};

const handleSelectAllActions = () => {
  if (selectedActions.value.length === filteredActions.value.length) {
    selectedActions.value = [];
    actionTableRef.value?.clearSelection();
    message.info('已取消全选');
  } else {
    selectedActions.value = filteredActions.value.map((a: any) => a.id);
    filteredActions.value.forEach((row: any) => {
      actionTableRef.value?.toggleRowSelection(row, true);
    });
    message.success('已选择全部');
  }
};

const handleActionTemplate = (command: string) => {
  actionTableRef.value?.clearSelection();

  let targetActions: any[] = [];

  switch (command) {
    case 'readonly':
      targetActions = actions.value.filter((a: any) => a.actionCode === 'view');
      message.success('已选择只读权限');
      break;
    case 'editor':
      targetActions = actions.value.filter((a: any) => ['view', 'edit'].includes(a.actionCode));
      message.success('已选择编辑权限');
      break;
    case 'full':
      targetActions = actions.value;
      message.success('已选择完整CRUD');
      break;
  }

  selectedActions.value = targetActions.map((a: any) => a.id);

  targetActions.forEach((action: any) => {
    actionTableRef.value?.toggleRowSelection(action, true);
  });
};

const getMethodType = (method: string) => {
  const typeMap: Record<string, any> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
  };
  return typeMap[method] || 'info';
};

// 生成权限
const handleCompose = () => handleComposeBase(composing);

// 移除权限
const handleRemovePermission = (index: number) => {
  const perm = composedPermissions.value[index];
  composedPermissions.value.splice(index, 1);

  if (mode.value === 'matrix') {
    matrixSelections.value.delete(perm.key);
  }

  message.success('已移除');
};

// 清空全部
const handleClearAll = () => {
  composedPermissions.value = [];
  matrixSelections.value.clear();
  message.success('已清空全部');
};

// 保存权限
const handleSave = async () => {
  saving.value = true;
  try {
    for (const perm of composedPermissions.value) {
      await permissionService.add(perm);
    }
    message.success(`已保存 ${composedPermissions.value.length} 个权限`);
    composedPermissions.value = [];
    matrixSelections.value.clear();
  } catch (_error) {
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 加载数据
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.perm-compose .data {
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
