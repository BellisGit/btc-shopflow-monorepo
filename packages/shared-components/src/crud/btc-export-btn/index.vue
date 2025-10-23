<template>
        <el-button type="info" @click="open" :loading="loading">
          <BtcSvg name="export" class="mr-[5px]" />
          {{ text || t('ui.export') }}
        </el-button>

  <BtcForm ref="formRef" />
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n, exportTableToExcel } from '@btc/shared-core';
import BtcForm from '@btc-common/form/index.vue';
import BtcSvg from '@btc-common/svg/index.vue';
import type { TableColumn } from '../table/types';
import type { BtcFormItem } from '@btc-common/form/types';
import type { UseCrudReturn } from '@btc/shared-core';

interface Props {
  /** 表格列配置（可选，如果不提供则从 CRUD 上下文获取） */
  columns?: TableColumn[];
  /** 表格数据（可选，如果不提供则从 CRUD 上下文获取） */
  data?: any[];
  /** 文件名 */
  filename?: string;
  /** 是否自动列宽 */
  autoWidth?: boolean;
  /** 文件类型 */
  bookType?: 'xlsx' | 'xls';
  /** 最大导出条数 */
  maxExportLimit?: number;
  /** 按钮文本 */
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filename: 'export',
  autoWidth: true,
  bookType: 'xlsx',
});

const { t } = useI18n();
const loading = ref(false);
const formRef = ref();

// 从 CRUD 上下文获取数据
const crud = inject<UseCrudReturn<any>>('btc-crud');

// 获取列配置（优先使用 props）
const columns = computed(() => {
  return props.columns || [];
});

// 过滤可导出的列
const exportableColumns = computed(() => {
  return columns.value.filter((col: any) =>
    col.prop &&
    !['selection', 'index', 'expand', 'op'].includes(col.type || '') &&
    !col.hidden &&
    !col.filterExport &&
    !(col as any)['filter-export']
  );
});

  // 表单配置
  const formItems = computed<BtcFormItem[]>(() => [
    {
      label: t('platform.common.select_columns'),
      prop: 'checked',
      component: {
        name: 'el-checkbox-group',
        props: {
          options: exportableColumns.value.map((col: any) => ({
            label: col.label || col.prop!,
            value: col.prop!
          }))
        }
      }
    }
  ]);

  const open = () => {
    if (!columns.value || columns.value.length === 0) {
      ElMessage.error(t('platform.common.no_columns_to_export'));
      return;
    }

    // 默认选中所有可导出的列
    const defaultChecked = exportableColumns.value.map((col: any) => col.prop!);

    // 使用 BtcForm 的 open 方法
    formRef.value?.open({
      title: t('ui.export'),
      width: '600px',
      form: { checked: defaultChecked },
      items: formItems.value,
      on: {
        submit: handleSubmit
      }
    });
  };

  const handleSubmit = async (data: any, { done, close }: any) => {
    if (!data.checked || data.checked.length === 0) {
      ElMessage.warning(t('platform.common.please_select_at_least_one_column'));
      done();
      return;
    }

    loading.value = true;

    try {
      // 过滤选中的列
      const selectedColumns = exportableColumns.value.filter((col: any) =>
        data.checked.includes(col.prop!)
      );

      // 获取数据（优先使用 props，否则从 CRUD 上下文获取）
      let exportData = props.data;
      if (!exportData && crud?.service) {
        // 从 CRUD 服务获取数据
        const params = {
          ...crud.getParams(),
          maxExportLimit: props.maxExportLimit,
          isExport: true
        };
        const result = await crud.service.page(params);
        exportData = result.list;
      }

      if (!exportData || exportData.length === 0) {
        ElMessage.warning(t('platform.common.no_data_to_export'));
        done();
        return;
      }

      // 使用新的导出函数，自动处理时间格式化
      exportTableToExcel({
        columns: selectedColumns,
        data: exportData,
        filename: props.filename,
        autoWidth: props.autoWidth,
        bookType: props.bookType,
      });

      ElMessage.success(t('platform.common.export_success'));
      close();
    } catch (error) {
      console.error('导出失败:', error);
      ElMessage.error(t('platform.common.export_failed'));
    } finally {
      loading.value = false;
      done();
    }
  };
</script>
