<template>
  <div class="menus-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions">
      <template #right>
        <el-tabs v-model="activeTab" class="menu-tabs" style="padding: 10px;">
          <!-- Tab 1: 菜单属性 -->
          <el-tab-pane label="菜单属性" name="props">
            <div v-if="selectedMenu" class="menu-detail" v-loading="detailLoading">
              <el-form :model="menuForm" label-width="100px" style="max-width: 600px; padding: 20px;">
                <el-form-item label="菜单名称">
                  <el-input v-model="menuForm.menuNameCn" />
                </el-form-item>
                <el-form-item label="菜单编码">
                  <el-input v-model="menuForm.menuCode" />
                </el-form-item>
                <el-form-item label="路径">
                  <el-input v-model="menuForm.menuPath" />
                </el-form-item>
                <el-form-item label="图标">
                  <el-input v-model="menuForm.icon" />
                </el-form-item>
                <el-form-item label="排序">
                  <el-input-number v-model="menuForm.sortOrder" :min="0" />
                </el-form-item>
                <el-form-item label="菜单类型">
                  <el-select v-model="menuForm.menuType">
                    <el-option label="目录" value="DIR" />
                    <el-option label="菜单" value="MENU" />
                    <el-option label="按钮" value="BUTTON" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSaveMenu" :loading="saving">保存</el-button>
                  <el-button @click="handleResetMenu">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-empty v-else description="请先选择菜单" />
          </el-tab-pane>

          <!-- Tab 2: 权限绑定 -->
          <el-tab-pane label="权限绑定" name="permissions">
            <div v-if="selectedMenu" class="permission-bind" style="padding: 20px;">
              <el-transfer
                v-model="menuPermissions"
                :data="allPermissions"
                :titles="['可用权限', '已绑定权限']"
                filterable
                filter-placeholder="搜索权限"
              />
              <div style="margin-top: 20px;">
                <el-button type="primary" @click="handleSavePermissions" :loading="savingPerms">保存权限</el-button>
              </div>
            </div>
            <el-empty v-else description="请先选择菜单" />
          </el-tab-pane>

          <!-- Tab 3: 预览 -->
          <el-tab-pane label="可见性预览" name="preview">
            <div v-if="selectedMenu" class="visibility-preview" style="padding: 20px;">
              <el-alert
                title="预览说明"
                description="该菜单在不同角色下的可见性"
                type="info"
                :closable="false"
                style="margin-bottom: 20px;"
              />
              <el-table :data="roleVisibility" border>
                <el-table-column prop="roleName" label="角色" width="150" />
                <el-table-column label="可见性" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.visible ? 'success' : 'info'">
                      {{ row.visible ? '可见' : '不可见' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="reason" label="原因" />
              </el-table>
            </div>
            <el-empty v-else description="请先选择菜单" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const viewGroupRef = ref();
const crudRef = ref();
const selectedMenu = ref<any>(null);
const activeTab = ref('props');
const menuForm = ref<any>({});
const saving = ref(false);
const detailLoading = ref(false);
const savingPerms = ref(false);
const menuPermissions = ref<number[]>([]);

// 菜单服务（左侧树）
const menuService = createMockCrudService('btc_menus', {

    },
  ]
});

// Mock 权限列表
const allPermissions = ref([
  { key: 1, label: '查看用户（user:view）' },
  { key: 2, label: '编辑用户（user:edit）' },
  { key: 3, label: '删除用户（user:delete）' },
  { key: 4, label: '查看角色（role:view）' },
  { key: 5, label: '分配角色（role:assign）' },
]);

// Mock 角色可见性
const roleVisibility = ref([
  { roleName: '系统管理员', visible: true, reason: '拥有完整权限' },
  { roleName: '部门经理', visible: true, reason: '拥有查看权限' },
  { roleName: '普通员工', visible: false, reason: '无访问权限' },
]);

// ViewGroup 配置
const viewGroupOptions = reactive({
  label: '菜单列表',
  title: '详情',
  leftWidth: '300px',
  service: menuService,
  enableRefresh: true,
  enableAdd: true,
  enableKeySearch: true,
  custom: true, // 右侧自定义内容
  tree: {
    visible: true,
    props: {
      label: 'name',
      children: 'children',
    }
  },
  onSelect(menu: any) {
    selectedMenu.value = menu;
    // 加载菜单详情
    menuForm.value = { ...menu };
    // 加载已绑定权限
    menuPermissions.value = [1, 2]; // Mock数据
  },
  onEdit(menu?: any) {
    message.info(menu ? `编辑菜单：${menu.name}` : '新增菜单');
  }
});

// 资源表格列（虽然Tab1主要用表单，但保留表格定义以备用）
const resourceColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'resourceNameCn', label: '资源名称', minWidth: 150 },
  { prop: 'resourceCode', label: '资源编码', minWidth: 150 },
  { prop: 'resourceType', label: '类型', width: 100 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const resourceFormItems = computed<FormItem[]>(() => [
  { prop: 'resourceNameCn', label: '资源名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'resourceCode', label: '资源编码', span: 12, required: true, component: { name: 'el-input' } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

// 保存菜单
const handleSaveMenu = async () => {
  saving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    await menuService.update(menuForm.value);
    message.success('保存成功');
    viewGroupRef.value?.refresh();
  } catch (error) {
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 重置菜单
const handleResetMenu = () => {
  if (selectedMenu.value) {
    menuForm.value = { ...selectedMenu.value };
  }
};

// 保存权限
const handleSavePermissions = async () => {
  savingPerms.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success('权限保存成功');
  } catch (error) {
    message.error('保存失败');
  } finally {
    savingPerms.value = false;
  }
};
</script>

<style lang="scss" scoped>
.menus-page {
  height: 100%;
  box-sizing: border-box;
}

.menu-tabs {
  height: 100%;

  :deep(.el-tabs__content) {
    height: calc(100% - 55px);
    overflow: auto;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}
</style>
