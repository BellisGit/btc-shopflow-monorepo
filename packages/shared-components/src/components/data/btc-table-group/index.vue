<template>
  <div class="btc-table-group">
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
    :id-field="idField"
    :label-field="labelField"
    :parent-field="parentField"
    :op="op"
    @select="handleSelect"
    @left-data-loaded="handleLeftDataLoaded"
  >
    <template #right-op>
      <!-- 如果配置了 rightOpFields，则根据配置渲染搜索字段；否则使用插槽内容 -->
      <div v-if="rightOpFieldsList.length > 0" class="custom-search-fields" style="display: flex; align-items: center; gap: 10px;">
        <template v-for="(field, index) in rightOpFieldsList" :key="index">
            <el-input
              v-if="field.type === 'input'"
              :model-value="props.rightOpFieldsValue?.[field.prop]"
              @update:model-value="(val: any) => handleRightOpFieldChange(field.prop, val)"
              :placeholder="field.placeholder"
              clearable
              :style="{ width: field.width || '150px' }"
              @keyup.enter="handleRightOpSearch(field)"
              @clear="handleRightOpSearch(field)"
            />
            <el-select
              v-else-if="field.type === 'select'"
              :model-value="props.rightOpFieldsValue?.[field.prop]"
              @update:model-value="(val: any) => handleRightOpFieldChange(field.prop, val)"
              :placeholder="field.placeholder"
              clearable
              filterable
              :loading="field.loading"
              :style="{ width: field.width || '100px' }"
              @change="handleRightOpSearch(field)"
              @clear="handleRightOpSearch(field)"
            >
              <el-option
                v-for="option in field.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </div>
    </template>
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
          <slot name="search">
            <BtcSearchKey v-if="props.showSearchKey" :placeholder="searchPlaceholder" />
          </slot>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import { globalMitt } from '@btc/shared-components';
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
  inheritAttrs: false,
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
  rightOpFields: undefined, // 右侧操作栏搜索字段配置
  rightOpFieldsValue: undefined, // 右侧操作栏搜索字段的值
});

// 定义插槽类型
defineSlots<{
  actions?: (props: { selected?: any; keyword?: any; leftData?: any[]; rightData?: any }) => any;
  'add-btn'?: () => any;
  'multi-delete-btn'?: () => any;
  search?: () => any;
}>();

const emit = defineEmits<TableGroupEmits>();

// 国际化
const { t } = useI18n();

// 组件引用
const viewGroupRef = ref<any>(null);
const crudRef = ref<any>(null);

// 右侧操作栏搜索字段（从 props 中提取，确保响应式追踪）
// TypeScript 类型已限制最多3个，这里直接返回
const rightOpFieldsList = computed(() => {
  return props.rightOpFields || [];
});

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
      label: 'crud.table.created_at', // 使用国际化 key
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 添加更新时间列（如果启用）
  if (props.showUpdateTime) {
    timeColumns.push({
      prop: 'updatedAt', // 固定使用后端字段名
      label: 'crud.table.updated_at', // 使用国际化 key
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
  const selectedItem = viewGroup?.selectedItem;

  // 获取现有的 keyword 对象（可能包含用户输入的搜索内容）
  const existingKeyword = (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword))
    ? { ...(params.keyword as Record<string, unknown>) }
    : {};

  // 如果选中项有 checkNo 字段，将 checkNo 合并到 keyword 对象中
  if (selectedItem && !selectedItem.isUnassigned && selectedItem.checkNo) {
    (params as any).keyword = {
      ...existingKeyword,
      checkNo: selectedItem.checkNo
    };
    return params;
  }

  // 只有当 selectedKeyword 有值时才注入 keyword 参数
  // 不传递 null 值
  if (selectedKeyword !== undefined && selectedKeyword !== null && selectedKeyword !== '') {
    // 统一封装：页面侧的 selectedKeyword（字符串/数组/对象）
    // - 对象：统一处理其中的 ids 字段为数组
    // - 其他：封装到 { ids: [...] }，统一为数组格式
    if (typeof selectedKeyword === 'object' && selectedKeyword !== null && !Array.isArray(selectedKeyword)) {
      // 如果是对象，统一处理其中的 ids 字段为数组，并合并到现有 keyword
      if ('ids' in selectedKeyword) {
        const normalizedIds = Array.isArray(selectedKeyword.ids)
          ? selectedKeyword.ids
          : (selectedKeyword.ids !== undefined && selectedKeyword.ids !== null && selectedKeyword.ids !== '' ? [selectedKeyword.ids] : []);
        (params as any).keyword = { ...existingKeyword, ...selectedKeyword, ids: normalizedIds };
      } else {
        (params as any).keyword = { ...existingKeyword, ...selectedKeyword };
      }
    } else {
      // 字符串或数组，统一转换为数组格式，并合并到现有 keyword
      const normalizedIds = Array.isArray(selectedKeyword)
        ? selectedKeyword
        : (selectedKeyword !== undefined && selectedKeyword !== null && selectedKeyword !== '' ? [selectedKeyword] : []);
      (params as any).keyword = { ...existingKeyword, ids: normalizedIds };
    }
  } else {
    // 如果没有 selectedKeyword，但已有 keyword 对象，保留现有的 keyword
    if (Object.keys(existingKeyword).length > 0) {
      (params as any).keyword = existingKeyword;
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

// 处理右侧操作栏搜索字段值变化
function handleRightOpFieldChange(prop: string, value: any) {
  const newValue = { ...(props.rightOpFieldsValue || {}), [prop]: value };
  emit('update:rightOpFieldsValue', newValue);
}

// 处理右侧操作栏搜索
function handleRightOpSearch(field: any) {
  // 如果字段有自定义搜索回调，使用自定义回调；否则触发搜索事件，由父组件处理刷新
  if (field.onSearch) {
    field.onSearch();
  } else {
    emit('right-op-search', field);
    // 注意：不在这里默认刷新，让父组件通过监听 right-op-search 事件来决定是否刷新
    // 这样可以避免重复刷新（如果父组件在事件处理中已经调用了 refresh）
  }
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
.btc-table-group {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

:deep(.btc-view-group) {
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
