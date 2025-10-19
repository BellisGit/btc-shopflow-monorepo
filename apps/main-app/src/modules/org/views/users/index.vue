<template>
  <div class="users-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" style="height: 100%">
      <template #right>
        <BtcCrud ref="crudRef" :service="service.sysuser" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey :placeholder="t('org.user.search_placeholder')" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="userColumns" :row-key="'id'" border>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t, locale } = useI18n();
const message = useMessage();
const viewGroupRef = ref();
const crudRef = ref();
const selectedDept = ref<any>(null);
const isInitializing = ref(true); // 标记是否正在初始化

// 监听语言变化，强制刷新左侧树状菜单
watch(locale, async () => {
  await nextTick();
  // 强制刷新 ViewGroup 组件
  if (viewGroupRef.value) {
    viewGroupRef.value.refresh();
  }
});

// 不再需要动态构建部门数据，直接使用部门 API

// 树形转换函数（参考 cool-admin 的 deepTree）
function deepTree(list: any[], sort?: 'desc' | 'asc'): any[] {
  const newList: any[] = [];
  const map: any = {};

  // 按 orderNum 排序
  list
    .sort((a, b) => (sort === 'desc' ? b.orderNum - a.orderNum : a.orderNum - b.orderNum))
    .forEach(e => {
      map[e.id] = e;
    });

  list.forEach(e => {
    const parent = map[e.parentId];

    if (parent) {
      (parent.children || (parent.children = [])).push(e);
    } else {
      newList.push(e);
    }
  });

  return newList;
}

// 使用 EPS 部门服务，包装为 ViewGroup 兼容格式
const wrappedDepartmentService = {
  async list(params?: any) {
    try {
      // 调用真实的部门 list API（获取所有部门数据）
      const response = await service.sysdepartment.list(params);

      // 转换为树形结构（使用 parentId 关系）
      const treeData = deepTree(response.list || []);

      // 添加默认的"未分配"部门到树形数据
      const result = [{
        id: 'UNASSIGNED',
        name: t('org.dept.unassigned'),
        deptNameCn: t('org.dept.unassigned'),
        deptCode: 'UNASSIGNED',
        parentId: null,
        orderNum: 999,
        userCount: 0
      }, ...treeData];

      return result;
    } catch (error) {
      console.error('Failed to load departments:', error);
      // 返回默认的"未分配"部门
      return [{
        id: 'UNASSIGNED',
        name: t('org.dept.unassigned'),
        deptNameCn: t('org.dept.unassigned'),
        deptCode: 'UNASSIGNED',
        parentId: null,
        orderNum: 999,
        userCount: 0
      }];
    }
  }
};

// 使用 EPS 用户服务

// 刷新前检查部门ID
const handleBeforeRefresh = (params: any) => {

  // 按照 cool-admin 的模式，添加部门ID参数
  if (selectedDept.value) {
    if (selectedDept.value.id === 'UNASSIGNED') {
      // 未分配部门的用户
      params.departmentId = null;
      params.departmentIds = null;
    } else {
      // 指定部门的用户
      params.departmentId = selectedDept.value.id;
      params.departmentIds = [selectedDept.value.id];
    }
  }

  return params;
};

// 移除 useCrud 实例，只使用 BtcCrud 组件

// ViewGroup 配置
const viewGroupOptions = computed(() => ({
  label: t('org.dept.list'),
  title: t('org.user.list'),
  leftWidth: '300px',
    service: wrappedDepartmentService,
  autoRefresh: true, // 启用自动刷新，让组件自己处理初始化
  enableRefresh: true,
  enableDrag: false, // 禁用拖拽，因为部门是动态生成的
  enableKeySearch: true,
  enableContextMenu: false, // 禁用右键菜单，因为部门是动态生成的
  enableEdit: false, // 禁用编辑，因为部门是动态生成的
  enableDelete: false, // 禁用删除，因为部门是动态生成的
  tree: {
    visible: true, // 启用树形显示
    lazy: false, // 非懒加载
    props: {
      label: 'name',
      children: 'children',
      disabled: 'disabled',
      isLeaf: 'isLeaf',
      id: 'id'
    }
  },
  onSelect(dept: any) {
    selectedDept.value = dept;

    // 按照 cool-admin 的模式，传递部门ID参数刷新用户列表

    // 构建部门ID数组（包括子部门）
    let departmentIds: any[] | null = [];
    if (dept.id === 'UNASSIGNED') {
      departmentIds = null; // 未分配部门
    } else {
      departmentIds = [dept.id];
      // 如果有子部门，也要包含子部门
      if (dept.children) {
        departmentIds = departmentIds.concat(dept.children.map((child: any) => child.id));
      }
    }

    // 刷新用户列表，传递部门ID参数
    crudRef.value?.crud.handleRefresh();
  }
}));

// 手动初始化部门数据
onMounted(async () => {
  // 等待组件完全挂载
  await nextTick();

  // 设置初始化完成标志
  isInitializing.value = false;

  // 移除手动刷新调用，让 autoRefresh 自动处理
  // 避免重复调用导致2次弹窗
});

// 用户列表列配置
const userColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'name', label: t('org.user.name'), minWidth: 100 },
  { prop: 'employeeId', label: t('org.user.employee_id'), width: 120 },
  { prop: 'email', label: t('org.user.email'), minWidth: 150 },
  { prop: 'nameEn', label: '英文名', width: 120 },
  { prop: 'position', label: t('org.user.position'), width: 100 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 用户表单配置
const userFormItems = computed<FormItem[]>(() => [
  { prop: 'name', label: t('org.user.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'employeeId', label: t('org.user.employee_id'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'email', label: t('org.user.email'), span: 12, component: { name: 'el-input' } },
  { prop: 'position', label: t('org.user.position'), span: 12, component: { name: 'el-input' } },
  { prop: 'nameEn', label: '英文名', span: 12, component: { name: 'el-input' } },
  {
    prop: 'department',
    label: t('org.dept.name'),
    span: 12,
    component: {
      name: 'el-input',
      placeholder: t('org.dept.unassigned')
    }
  },
]);


const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 如果用户在表单中没有填写部门，设置为未分配
    if (!data.department) {
      data.department = t('org.dept.unassigned');
    }

    // 调用 next 函数，它会处理数据提交和刷新
    await next(data);

    // 显示成功消息
    message.success(t('crud.message.save_success'));

    // 关闭弹窗（数据已经刷新完成）
    close();
  } catch (error) {
    console.error('Form submit error:', error);
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
