<template>
  <div class="users-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" style="height: 100%">
      <template #right>
        <BtcCrud ref="crudRef" :service="wrappedUserService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey placeholder="搜索用户" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="userColumns" border>
              <template #column-status="{ row }">
                <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
                  {{ row.status === 'ACTIVE' ? '激活' : '禁用' }}
                </el-tag>
              </template>
            </BtcTable>
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
          <BtcUpsert ref="upsertRef" :items="userFormItems" width="800px" :on-submit="handleFormSubmit" />
        </BtcCrud>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createMockCrudService } from '../../../utils/mock';
import { createCrudService } from '../../../utils/http';

const { t } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const selectedDept = ref<any>(null);

// 部门服务（左侧树）
// 先使用 mock 数据，等待后端提供部门树形 API
const departmentService = createMockCrudService('btc_departments_tree', {
  defaultData: [
    {
      id: 1,
      name: '物流部',
      deptNameCn: '物流部',
      deptCode: 'LOGISTICS',
      sortOrder: 1,
      children: [
        { id: 11, name: '仓储组', deptNameCn: '仓储组', deptCode: 'WAREHOUSE', sortOrder: 1, parentId: 1 },
        { id: 12, name: '运输组', deptNameCn: '运输组', deptCode: 'TRANSPORT', sortOrder: 2, parentId: 1 },
      ]
    },
    {
      id: 2,
      name: '生产部',
      deptNameCn: '生产部',
      deptCode: 'PRODUCTION',
      sortOrder: 2,
      children: [
        { id: 21, name: '生产一组', deptNameCn: '生产一组', deptCode: 'PROD1', sortOrder: 1, parentId: 2 },
        { id: 22, name: '生产二组', deptNameCn: '生产二组', deptCode: 'PROD2', sortOrder: 2, parentId: 2 },
      ]
    },
    {
      id: 3,
      name: '品质部',
      deptNameCn: '品质部',
      deptCode: 'QUALITY',
      sortOrder: 3,
      children: [
        { id: 31, name: '质检组', deptNameCn: '质检组', deptCode: 'QC', sortOrder: 1, parentId: 3 },
      ]
    },
    {
      id: 4,
      name: '财务部',
      deptNameCn: '财务部',
      deptCode: 'FINANCE',
      sortOrder: 4,
    },
    {
      id: 5,
      name: '工程部',
      deptNameCn: '工程部',
      deptCode: 'ENGINEERING',
      sortOrder: 5,
      children: [
        { id: 51, name: '施工组', deptNameCn: '施工组', deptCode: 'CONSTRUCTION', sortOrder: 1, parentId: 5 },
      ]
    },
  ]
});

// 使用真实用户 API 时，如果后端提供了部门树 API，可以这样替换：
// const departmentService = {
//   list: async () => {
//     const data = await http.get('/department/tree');
//     return data;
//   }
// };

// 用户服务（右侧表） - 使用真实 API
const baseUserService = createCrudService('user/profile');

const wrappedUserService = {
  ...baseUserService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baseUserService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
} as any;

// ViewGroup 配置
const viewGroupOptions = reactive({
  label: '部门列表',
  title: '用户列表',
  leftWidth: '300px',
  service: departmentService,
  enableRefresh: true,
  enableDrag: true,
  enableKeySearch: true,
  enableContextMenu: true, // ✅ 启用右键菜单
  enableEdit: true,
  enableDelete: true,
  tree: {
    visible: true,
    props: {
      label: 'name',
      children: 'children',
      id: 'id',
    },
    // ✅ 高级拖拽规则：不允许拖动一级部门（没有 parentId）
    allowDrag: (node: any) => {
      return node.data.parentId != null;
    },
    // ✅ 放置规则：只能放到有 parentId 的节点上
    allowDrop: (draggingNode: any, dropNode: any) => {
      return dropNode.data.parentId != null;
    }
  },
  onSelect(dept: any) {
    selectedDept.value = dept;
    // 根据部门刷新右侧用户列表
    crudRef.value?.crud.setParams({ deptId: dept.id });
    crudRef.value?.crud.handleRefresh();
  },
  onDragEnd(newList: any[]) {
    ElMessage.success('部门排序已更新');
    console.log('新的部门顺序:', newList);
    // 这里应该调用后端API保存新顺序
    // departmentService.updateOrder(newList);
  },
  // ✅ 自定义右键菜单（可选，不配置则使用默认）
  onContextMenu: (item: any) => {
    console.log('右键点击部门:', item.name);
    // 这里可以显示自定义右键菜单
    // 或者返回菜单配置项
  },
  // ✅ 删除部门时的特殊逻辑
  onDelete: (item: any, { next, done }: any) => {
    ElMessageBox.confirm(
      `删除"${item.name}"部门时，该部门的用户如何处理？`,
      '提示',
      {
        confirmButtonText: '直接删除用户',
        cancelButtonText: '转移到上级部门',
        distinguishCancelAndClose: true,
        type: 'warning'
      }
    )
      .then(() => {
        // 直接删除部门和用户
        next({ ids: [item.id], deleteUsers: true });
      })
      .catch((action: string) => {
        if (action === 'cancel') {
          // 保留用户，转移到上级
          next({ ids: [item.id], deleteUsers: false });
        } else {
          done(); // 点击关闭按钮
        }
      });
  }
});

// 用户表格列
const userColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'name', label: '姓名', minWidth: 100 },
  { prop: 'employeeId', label: '工号', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 150 },
  { prop: 'department', label: '部门', width: 120 },
  { prop: 'position', label: '职位', width: 100 },
  { prop: 'status', label: '状态', width: 100 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 用户表单
const userFormItems = computed<FormItem[]>(() => [
  { prop: 'name', label: '姓名', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'employeeId', label: '工号', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'email', label: '邮箱', span: 12, component: { name: 'el-input' } },
  { prop: 'position', label: '职位', span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: '状态',
    span: 12,
    value: 'ACTIVE',
    component: {
      name: 'el-radio-group',
      options: [
        { label: '激活', value: 'ACTIVE' },
        { label: '禁用', value: 'INACTIVE' },
      ]
    }
  },
]);

// 刷新前钩子：添加部门ID参数
const handleBeforeRefresh = (params: any) => {
  if (selectedDept.value) {
    return {
      ...params,
      deptId: selectedDept.value.id,
    };
  }
  return params;
};

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 自动添加部门ID和部门名称
    if (selectedDept.value) {
      data.deptId = selectedDept.value.id;
      data.department = selectedDept.value.name;
    }

    await next(data);
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};
</script>

<style lang="scss" scoped>
.users-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
