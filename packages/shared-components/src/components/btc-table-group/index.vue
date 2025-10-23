<template>
  <BtcViewGroup
    ref="viewGroupRef"
    :left-service="leftService"
    :right-service="rightService"
    :left-title="leftTitle"
    :right-title="rightTitle"
    :show-unassigned="showUnassigned"
    :unassigned-label="unassignedLabel"
    :enable-drag="enableDrag"
    :left-width="leftWidth"
    @select="handleSelect"
    @left-data-loaded="handleLeftDataLoaded"
  >
    <template #right="{ selected, keyword, leftData, rightData }">
      <BtcCrud
        ref="crudRef"
        :service="rightService"
        :auto-load="false"
        :on-before-refresh="handleBeforeRefresh"
        style="padding: 10px;"
      >
        <BtcRow>
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
          <BtcFlex1 />
          <BtcSearchKey :placeholder="searchPlaceholder" />
        </BtcRow>
        <BtcRow>
          <BtcTable :columns="tableColumns" border />
        </BtcRow>
        <BtcRow>
          <BtcFlex1 />
          <BtcPagination />
        </BtcRow>
        <BtcUpsert
          :items="computedFormItems"
          :width="upsertWidth"
          :on-submit="handleFormSubmit"
        />
      </BtcCrud>
    </template>
  </BtcViewGroup>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import BtcViewGroup from '@btc-common/view-group/index.vue';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcAddBtn from '@btc-crud/add-btn/index.vue';
import BtcRefreshBtn from '@btc-crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from '@btc-crud/multi-delete-btn/index.vue';
import BtcRow from '@btc-crud/row/index.vue';
import BtcFlex1 from '@btc-crud/flex1/index.vue';
import BtcSearchKey from '@btc-crud/search-key/index.vue';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import type { TableGroupProps, TableGroupEmits, TableGroupExpose } from './types';

defineOptions({
  name: 'BtcTableGroup',
  components: {
    BtcViewGroup,
    BtcCrud,
    BtcTable,
    BtcPagination,
    BtcAddBtn,
    BtcRefreshBtn,
    BtcMultiDeleteBtn,
    BtcRow,
    BtcFlex1,
    BtcSearchKey,
    BtcUpsert
  }
});

const props = withDefaults(defineProps<TableGroupProps>(), {
  leftTitle: '列表',
  rightTitle: '详情',
  showUnassigned: false,
  unassignedLabel: '未分配',
  enableDrag: false,
  leftWidth: '300px',
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  showCreateTime: true,  // 默认显示创建时间列
  showUpdateTime: false  // 默认不显示更新时间列
});

const emit = defineEmits<TableGroupEmits>();

// 组件引用
const viewGroupRef = ref<any>(null);
const crudRef = ref<any>(null);

// 左侧列表数据（用于表单中的级联选择）
const leftListData = ref<any[]>([]);

// 计算表格列（自动添加创建时间和操作列）
const tableColumns = computed(() => {
  const columns = [...(props.tableColumns || [])];

  // 移除手动添加的时间列，统一使用自动添加的
  const filteredColumns = columns.filter(col =>
    !(col.prop === 'createdAt' ||
      col.prop === 'updatedAt' ||
      col.prop === 'createTime' ||
      col.prop === 'updateTime' ||
      col.prop === 'create_time' ||
      col.prop === 'update_time')
  );

  // 添加创建时间列（如果启用）
  if (props.showCreateTime) {
    filteredColumns.push({
      prop: 'createdAt', // 固定使用后端字段名
      label: '创建时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 添加更新时间列（如果启用）
  if (props.showUpdateTime) {
    filteredColumns.push({
      prop: 'updatedAt', // 固定使用后端字段名
      label: '更新时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 检查是否已有操作列
  const hasOpColumn = filteredColumns.some(col => col.type === 'op');
  if (!hasOpColumn) {
    filteredColumns.push({
      type: 'op',
      label: '操作',
      width: 200,
      fixed: 'right',
      buttons: ['edit', 'delete']
    });
  }

  return filteredColumns;
});

// 计算表单项（注入左侧数据到级联选择器）
const computedFormItems = computed(() => {
  return props.formItems.map(item => {
    // 如果是级联选择器，注入左侧列表数据
    if (item.component?.name === 'btc-cascader') {
      return {
        ...item,
        component: {
          ...item.component,
          options: leftListData.value
        }
      };
    }
    return item;
  });
});

// 处理左侧选择 - 自动刷新右侧
function handleSelect(item: any, keyword: any) {
  // 触发事件
  emit('select', item, keyword);

  // 触发 BtcCrud 的刷新
  nextTick(() => {
    if (crudRef.value) {
      crudRef.value.refresh();
    }
  });
}

// 处理刷新前钩子 - 注入 keyword 参数
function handleBeforeRefresh(params: Record<string, unknown>) {
  const viewGroup = viewGroupRef.value;
  const selectedKeyword = viewGroup?.selectedKeyword;

  // 注入 keyword 参数
  if (selectedKeyword !== undefined) {
    params.keyword = selectedKeyword;
  }

  return params;
}

// 处理左侧数据加载
function handleLeftDataLoaded(data: any[]) {
  leftListData.value = data;
  emit('load', data);

  // 注意：这里不触发刷新，因为 BtcMasterList 会自动选择第一项
  // 选择第一项时会触发 handleSelect，从而触发刷新
}

// 表单提交 - 自动注入选中的 ID
async function handleFormSubmit(data: any, event: any) {
  const viewGroup = viewGroupRef.value;
  const selectedItem = viewGroup?.selectedItem;

  // 自动注入部门ID（如果有选中且不是未分配）
  if (selectedItem && !selectedItem.isUnassigned) {
    data.deptId = selectedItem.id;
  }

  // 触发事件
  emit('form-submit', data, event);

  // 如果没有自定义处理，使用默认逻辑
  if (!event.defaultPrevented) {
    // 按照 cool-admin 的方式，调用 next 方法
    if (typeof event.next === 'function') {
      await event.next(data);
    }
  }
}

// 刷新方法
const refresh = async (params?: any) => {
  if (viewGroupRef.value) {
    await viewGroupRef.value.refresh(params);
  }
  emit('refresh', params);
};

// 暴露
defineExpose<TableGroupExpose>({
  viewGroupRef,
  crudRef,
  refresh
});
</script>
