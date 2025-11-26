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
    :enable-key-search="enableKeySearch"
    :left-size="props.leftSize"
    :op="op"
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
          <div class="btc-crud-primary-actions">
            <BtcRefreshBtn />
            <slot name="add-btn">
              <BtcAddBtn v-if="props.showAddBtn" />
            </slot>
            <slot name="multi-delete-btn">
              <BtcMultiDeleteBtn v-if="props.showMultiDeleteBtn" />
            </slot>
          </div>
          <BtcFlex1 />
          <BtcSearchKey v-if="props.showSearchKey" :placeholder="searchPlaceholder" />
          <BtcCrudActions v-if="props.showToolbar" :show-toolbar="props.op !== undefined">
            <template #default>
              <slot
                name="actions"
                :selected="selected"
                :keyword="keyword"
                :left-data="leftData"
                :right-data="rightData"
              />
            </template>
          </BtcCrudActions>
        </BtcRow>
        <BtcRow>
          <BtcTable
            :columns="tableColumns"
            :op="op"
            :disable-auto-created-at="disableAutoCreatedAt"
            border
          />
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
import { globalMitt } from '@btc/shared-components/utils/mitt';
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
import BtcCrudActions from '@btc-crud/actions/index.vue';
import { useContentHeight } from '@btc/shared-components/composables/content-height';
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
    BtcUpsert,
    BtcCrudActions
  }
});

const props = withDefaults(defineProps<TableGroupProps>(), {
  leftTitle: '列表',
  rightTitle: '详情',
  showUnassigned: false,
  unassignedLabel: '未分配',
  enableDrag: false,
  enableKeySearch: false,
  leftWidth: undefined, // 如果未指定，将根据 leftSize 计算
  leftSize: 'default', // 默认类型
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  showCreateTime: true,  // 默认显示创建时间列
  showUpdateTime: false,  // 默认不显示更新时间列
  op: undefined, // 操作列配置，默认为 undefined
  showAddBtn: true, // 默认显示新增按钮
  showMultiDeleteBtn: true, // 默认显示批量删除按钮
  showSearchKey: true, // 默认显示搜索框
  showToolbar: true, // 默认显示右侧工具栏按钮
});


const emit = defineEmits<TableGroupEmits>();

// 组件引用
const viewGroupRef = ref<any>(null);
const crudRef = ref<any>(null);
const { emit: emitContentResize } = useContentHeight();

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

const disableAutoCreatedAt = computed(() => !props.showCreateTime);

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

  // 查找操作列的位置
  const opColumnIndex = filteredColumns.findIndex(col => col.type === 'op');
  const hasOpColumn = opColumnIndex !== -1;
  
  // 准备要插入的时间列
  const timeColumns: any[] = [];
  
  // 添加创建时间列（如果启用）
  if (props.showCreateTime) {
    timeColumns.push({
      prop: 'createdAt', // 固定使用后端字段名
      label: '创建时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 添加更新时间列（如果启用）
  if (props.showUpdateTime) {
    timeColumns.push({
      prop: 'updatedAt', // 固定使用后端字段名
      label: '更新时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 如果有操作列，在操作列之前插入时间列；否则在末尾添加
  if (hasOpColumn && timeColumns.length > 0) {
    filteredColumns.splice(opColumnIndex, 0, ...timeColumns);
  } else if (timeColumns.length > 0) {
    filteredColumns.push(...timeColumns);
  }

  // 检查是否已有操作列，并根据 op 配置决定是否添加 - 操作列始终在最后
  if (!hasOpColumn && props.op !== undefined) {
    const buttons = props.op.buttons || ['edit', 'delete'];
    const buttonCount = Array.isArray(buttons) ? buttons.length : 2;
    // 根据按钮数量动态设置宽度：1个按钮126px（116+10，保证工具栏宽度），2个按钮220px（默认），3个及以上按钮300px
    const opWidth = buttonCount === 1 ? 126 : buttonCount === 2 ? 220 : 300;
    const opMinWidth = buttonCount === 1 ? 126 : 200;
    
    filteredColumns.push({
      type: 'op',
      minWidth: opMinWidth, // 最小宽度，确保有足够空间显示按钮和间距
      width: opWidth, // 根据按钮数量动态设置宽度
      fixed: 'right',
      buttons
    });
  }

  return filteredColumns;
});

// 计算表单项（注入左侧数据到级联选择器）
const computedFormItems = computed(() => {
  if (!props.formItems || !Array.isArray(props.formItems)) {
    return [];
  }
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
      globalMitt.emit('resize');
      scheduleContentResize();
    }
  });
}

// 处理刷新前钩子 - 注入 keyword 参数，统一将 ids 处理为数组
function handleBeforeRefresh(params: Record<string, unknown>) {
  const viewGroup = viewGroupRef.value;
  const selectedKeyword = viewGroup?.selectedKeyword;

  // 只有当 selectedKeyword 有值时才注入 keyword 参数
  // 不传递 null 值
  if (selectedKeyword !== undefined && selectedKeyword !== null && selectedKeyword !== '') {
    // 统一封装：页面侧的 selectedKeyword（字符串/数组/对象）
    // - 对象：统一处理其中的 ids 字段为数组
    // - 其他：封装到 { ids: [...] }，统一为数组格式
    if (typeof selectedKeyword === 'object' && selectedKeyword !== null && !Array.isArray(selectedKeyword)) {
      // 如果是对象，统一处理其中的 ids 字段为数组
      if ('ids' in selectedKeyword) {
        const normalizedIds = Array.isArray(selectedKeyword.ids) 
          ? selectedKeyword.ids 
          : (selectedKeyword.ids !== undefined && selectedKeyword.ids !== null && selectedKeyword.ids !== '' ? [selectedKeyword.ids] : []);
        (params as any).keyword = { ...selectedKeyword, ids: normalizedIds };
      } else {
        (params as any).keyword = selectedKeyword;
      }
    } else {
      // 字符串或数组，统一转换为数组格式
      const normalizedIds = Array.isArray(selectedKeyword) 
        ? selectedKeyword 
        : (selectedKeyword !== undefined && selectedKeyword !== null && selectedKeyword !== '' ? [selectedKeyword] : []);
      (params as any).keyword = { ids: normalizedIds };
    }
  }

  return params;
}

// 处理左侧数据加载
function handleLeftDataLoaded(data: any[]) {
  leftListData.value = data;
  emit('load', data);
  scheduleContentResize();
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
  scheduleContentResize();
}

// 刷新方法
const refresh = async (params?: any) => {
  if (viewGroupRef.value) {
    await viewGroupRef.value.refresh(params);
  }
  emit('refresh', params);
  scheduleContentResize();
};

// 暴露
defineExpose<TableGroupExpose>({
  viewGroupRef,
  crudRef,
  refresh
});
</script>

<style lang="scss" scoped>
:deep(.btc-view-group) {
  height: 100%;
  width: 100%;
}
</style>
