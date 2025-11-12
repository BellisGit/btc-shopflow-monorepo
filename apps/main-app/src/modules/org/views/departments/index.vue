<template>
  <BtcCrud
    ref="crudRef"
    :service="wrappedDepartmentService"
  >
    <BtcRow>
      <div class="btc-crud-primary-actions">
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcImportBtn
          :template="'/templates/departments.xlsx'"
          :tips="t('org.departments.import_tips')"
          :on-submit="handleImport"
        />
      </div>
      <BtcFlex1 />
      <BtcSearchKey placeholder="搜索部门" />
      <BtcCrudActions>
        <BtcExportBtn :filename="t('org.departments.title')" />
      </BtcCrudActions>
    </BtcRow>

    <BtcRow>
      <BtcTable
        ref="tableRef"
        :columns="columns"
        :op="{ buttons: ['edit', 'delete'] }"
        :context-menu="['refresh']"
        border
      />
    </BtcRow>

    <BtcRow>
      <BtcFlex1 />
      <BtcPagination />
    </BtcRow>

    <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
  </BtcCrud>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { BtcConfirm } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { CommonColumns } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();
let detachCrudRefreshListener: (() => void) | null = null;

// 部门服务 - 使用EPS服务（注意路径：api/system/iam/department）
const departmentService = service.system?.iam?.department;

// 部门选项数据
const departmentOptions = ref<Array<{ label: string; value: string }>>([]);

// 加载部门选项数据
const loadDepartmentOptions = async () => {
  try {
    const res = await departmentService.list({});

    // 处理响应数据结构：res.list 或 res.data.list 或直接是数组
    let dataArray: any[] = [];
    if (res && res.list) {
      dataArray = res.list;
    } else if (res && res.data && res.data.list) {
      dataArray = res.data.list;
    } else if (Array.isArray(res)) {
      dataArray = res;
    }

    const processedData = dataArray
      .filter((dept: any) => dept.id != null && dept.name && dept.parentId === '0') // 只保留顶级部门
      .map((dept: any) => ({
        label: dept.name,
        value: dept.id
      }));

    departmentOptions.value = processedData;
  } catch (_error) {
    console.error('加载部门选项失败:', _error);
    // 出错时设置为空数组
    departmentOptions.value = [];
  }
};

const wrappedDepartmentService = {
  ...departmentService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await departmentService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await departmentService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

function resolveDepartmentImportFn() {
  const candidates = ['import', 'importBatch', 'importExcel'];
  for (const name of candidates) {
    const fn = (departmentService as Record<string, any>)?.[name];
    if (typeof fn === 'function') {
      return fn;
    }
  }
  return null;
}

const handleImport = async (
  payload: { list?: any[]; file?: File; filename?: string },
  helpers: { done?: (error?: unknown) => void; close?: () => void },
) => {
  const { done, close } = helpers ?? {};
  const rows = Array.isArray(payload?.list) ? payload.list.filter(Boolean) : [];

  if (rows.length === 0) {
    message.warning(t('org.departments.import_empty') || '导入数据为空，请检查模板内容');
    done?.();
    return;
  }

  const importFn = resolveDepartmentImportFn();
  if (!importFn) {
    message.warning(t('org.departments.import_unsupported') || '当前环境未配置部门导入接口');
    done?.();
    return;
  }

  try {
    await importFn(rows);
    message.success(t('org.departments.import_success') || '导入成功');
    done?.();
    close?.();
    crudRef.value?.crud?.refresh?.();
  } catch (error) {
    console.error('[Departments] 导入失败', error);
    message.error(t('org.departments.import_failed') || '导入失败，请检查文件格式或内容');
    done?.(error);
  }
};

// 部门表格列
const columns = computed<TableColumn[]>(() => [
  CommonColumns.selection(),
  CommonColumns.index(),
  { prop: 'name', label: '部门名称', minWidth: 150 },
  { prop: 'deptCode', label: '部门编码', width: 120 },
  {
    prop: 'parentId',
    label: '上级部门',
    width: 120,
    formatter: (row: any) => {
      if (!row.parentId || row.parentId === '0') return '';
      // 如果 parentId 是部门名称，直接返回
      if (typeof row.parentId === 'string' && isNaN(Number(row.parentId)) && !row.parentId.match(/^[A-Z0-9-]+$/)) {
        return row.parentId;
      }
      // 如果 parentId 是 ID，查找对应的部门名称
      const parentDept = departmentOptions.value.find(dept => dept.value === row.parentId);
      return parentDept ? parentDept.label : row.parentId;
    }
  },
  { prop: 'sort', label: '排序', width: 80 },
]);

// 部门表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'name', label: '部门名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'deptCode', label: '部门编码', span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'parentId',
    label: '上级部门',
    span: 12,
    component: {
      name: 'el-select',
      props: {
        placeholder: '请选择上级部门',
        clearable: true,
        filterable: true
      },
      options: departmentOptions.value
    },
    // 使用 hook 进行数据转换
    hook: {
      bind: (value: any) => {
        // 数据绑定到表单时：将部门名称转换为部门ID
        if (typeof value === 'string' && isNaN(Number(value)) && !value.match(/^[A-Z0-9-]+$/)) {
          const dept = departmentOptions.value.find(d => d.label === value);
          return dept ? dept.value : value;
        }
        return value;
      },
      submit: (value: any) => {
        // 提交时保持部门ID不变
        return value;
      }
    }
  },
  {
    prop: 'sort',
    label: '排序',
    span: 12,
    value: 0,
    component: {
      name: 'el-input-number',
      props: { min: 0, style: { width: '100%' } }
    }
  },
]);


// 组件挂载时加载部门选项
onMounted(async () => {
  await loadDepartmentOptions();
  const mitt = crudRef.value?.crud?.mitt;
  if (mitt) {
    const handleRefresh = () => {
      loadDepartmentOptions();
    };
    mitt.on('crud.refresh', handleRefresh);
    detachCrudRefreshListener = () => {
      mitt.off('crud.refresh', handleRefresh);
    };
  }
});

onBeforeUnmount(() => {
  detachCrudRefreshListener?.();
  detachCrudRefreshListener = null;
});
</script>

