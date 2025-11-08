<template>
  <el-table
    ref="tableRef"
    class="btc-table"
    :key="rebuildKey"
    :data="crud.tableData.value"
    :loading="crud.loading.value"
    :max-height="autoHeight ? autoMaxHeight : (maxHeight || undefined)"
    :row-key="rowKey || 'username'"
    :empty-text="translatedEmptyText"
    :default-sort="defaultSort"
    highlight-current-row
    fit
    :border="border"
    v-bind="$attrs"
    @selection-change="crud.handleSelectionChange"
    @sort-change="onSortChange"
    @row-contextmenu="onRowContextMenu"
    style="width: 100%"
  >
    <!-- 动态列渲染（支持多级表头） -->
    <table-column
      v-for="(column, index) in computedColumns"
      :key="column.prop || index"
      :column="column"
    >
      <!-- 自定义列插槽 -->
      <template v-for="slot in Object.keys($slots)" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

      <!-- 操作列插槽 -->
      <template #op-slot="{ scope, column }">
        <div class="btc-table-op">
          <slot name="op-buttons" v-bind="scope">
            <!-- 默认操作按钮 -->
            <template v-for="(btn, btnIndex) in getOpButtons(column, scope)" :key="btnIndex">
              <!-- 插槽按钮 -->
              <slot v-if="typeof btn === 'string' && btn.startsWith('slot-')" :name="btn" v-bind="scope" />

              <!-- 预定义按钮 -->
              <el-button
                v-else-if="typeof btn === 'string'"
                text
                :type="getButtonType(btn)"
                @click="handleOpClick(btn, scope.row)"
              >
                {{ getButtonText(btn) }}
              </el-button>

              <!-- 自定义按钮 -->
              <el-button
                v-else-if="typeof btn === 'object'"
                text
                :type="btn.type"
                @click="btn.onClick?.({ scope })"
              >
                {{ btn.label }}
              </el-button>
            </template>
          </slot>
        </div>
      </template>
    </table-column>

    <!-- 自定义空状态插槽 -->
    <template #empty>
      <div class="btc-table__empty">
        <slot name="empty">
          <el-empty :image-size="100" :description="translatedEmptyText" />
        </slot>
      </div>
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { ref, inject, toRefs, computed } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableInstance } from 'element-plus';
import type { TableProps } from './types';
import { useTableColumns, useTableOp, useTableHeight, useTableContextMenu, useTableSort } from './composables';
import TableColumn from './components/table-column.vue';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'BtcTable',
  components: {
    TableColumn,
  },
});

const props = withDefaults(defineProps<TableProps>(), {
  autoHeight: false,
  rowKey: 'id',
  sortRefresh: true,
  emptyText: 'common.table.empty',
  border: true,
  op: undefined,
  disableAutoCreatedAt: false,
});


const emit = defineEmits(['selection-change', 'sort-change']);

// 解构 props
const { autoHeight, height, maxHeight, rowKey, emptyText, border } = toRefs(props);

// 国际化
const { t } = useI18n();

// 计算翻译后的空状态文本
const translatedEmptyText = computed(() => {
  return t(emptyText.value);
});

// 注入 CRUD 上下文
const crud = inject<UseCrudReturn<any>>('btc-crud');
const tableRefContext = inject<any>('btc-table-ref');

if (!crud) {
  throw new Error('[BtcTable] Must be used inside <BtcCrud>');
}

// 表格实例
const tableRef = ref<TableInstance>();

// 列配置处理
const { computedColumns } = useTableColumns(props);

// 注册表格引用到上下文
if (tableRefContext) {
  tableRefContext.value = {
    tableRef,
    columns: computedColumns,
  };
}

// 操作列处理 + 列控制
const { getOpButtons, getButtonType, getButtonText, handleOpClick, showColumn, hideColumn, setColumns, reBuild, rebuildKey } = useTableOp(crud, props);

// 高度管理
const { maxHeight: autoMaxHeight, calcMaxHeight } = useTableHeight(props, tableRef);

// 排序管理
const { defaultSort, onSortChange, clearSort } = useTableSort(crud, props, emit);

// 右键菜单
const { onRowContextMenu } = useTableContextMenu(crud, props, tableRef);

// Element Plus 原生支持列宽调整，无需额外实现

// 暴露方法
defineExpose({
  tableRef,
  crud,
  maxHeight,
  calcMaxHeight,
  showColumn,
  hideColumn,
  setColumns,
  reBuild,
  clearSort,
  columns: computedColumns, // 暴露列配置
});
</script>

<style lang="scss" scoped>
// Element Plus 原生支持列宽调整，无需额外样式
</style>
