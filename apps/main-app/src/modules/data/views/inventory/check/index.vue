<template>
  <BtcCrud ref="crudRef" :service="inventoryService">
    <BtcRow>
      <div class="btc-crud-primary-actions">
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
      </div>
      <BtcFlex1 />
      <BtcSearchKey />
      <BtcCrudActions>
        <BtcExportBtn :filename="t('menu.data.inventory')" />
      </BtcCrudActions>
    </BtcRow>

    <BtcRow>
      <BtcTable
        ref="tableRef"
        :columns="columns"
        :op="{ buttons: ['edit', 'delete'] }"
        border
      />
    </BtcRow>

    <BtcRow>
      <BtcFlex1 />
      <BtcPagination />
    </BtcRow>

    <BtcUpsert ref="upsertRef" :items="formItems" width="720px" />
  </BtcCrud>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcConfirm } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { service } from '@/services/eps';
import type { CrudService } from '@btc/shared-core';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'BtcDataInventoryCheck'
});

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const rawService = service.system?.base?.check;

if (!rawService) {
  console.warn('[DataInventoryCheck] 未找到 EPS 盘点数据服务，请确认已同步元数据');
}

const inventoryService: CrudService<any> = {
  ...(rawService || {}),
  async delete(id: string | number) {
    await BtcConfirm('确认删除该记录吗？', '提示', { type: 'warning' });
    if (!rawService?.delete) {
      throw new Error('未找到删除服务接口');
    }
    await rawService.delete(id);
    message.success('删除成功');
  },
  async deleteBatch(ids: (string | number)[]) {
    await BtcConfirm(`确认删除选中的 ${ids.length} 条记录吗？`, '提示', { type: 'warning' });
    if (rawService?.deleteBatch) {
      await rawService.deleteBatch(ids);
    } else if (rawService?.delete) {
      await Promise.all(ids.map(id => rawService.delete!(id)));
    } else {
      throw new Error('未找到删除服务接口');
    }
    message.success('删除成功');
  },
  async page(params?: Record<string, any>) {
    if (!rawService?.page) {
      throw new Error('未找到分页服务接口');
    }
    return rawService.page(params);
  },
  async add(data: any) {
    if (!rawService?.add) {
      throw new Error('未找到新增服务接口');
    }
    const result = await rawService.add(data);
    message.success('新增成功');
    return result;
  },
  async update(data: any) {
    if (!rawService?.update) {
      throw new Error('未找到更新服务接口');
    }
    const result = await rawService.update(data);
    message.success('更新成功');
    return result;
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'baseId', label: '盘点任务ID', minWidth: 160 },
  { prop: 'materialCode', label: '物料编码', minWidth: 140 },
  { prop: 'materialName', label: '物料名称', minWidth: 160 },
  { prop: 'specification', label: '物料规格', minWidth: 140 },
  { prop: 'unit', label: '计量单位', minWidth: 120 },
  { prop: 'batchNo', label: '批次号', minWidth: 140 },
  { prop: 'validity', label: '有效期', minWidth: 140 },
  { prop: 'bookQty', label: '账面数量', minWidth: 120 },
  { prop: 'actualQty', label: '实际数量', minWidth: 120 },
  { prop: 'storageLocation', label: '仓位', minWidth: 140 },
  { prop: 'diffQty', label: '差异数量', minWidth: 120 },
  { prop: 'diffRate', label: '差异率', minWidth: 120 },
  {
    prop: 'isDiff',
    label: '是否有差异',
    width: 120,
    dict: [
      { label: '是', value: 1, type: 'danger' },
      { label: '否', value: 0, type: 'success' },
    ],
    dictColor: true,
  },
  { prop: 'checkerId', label: '盘点人ID', minWidth: 140 },
  { prop: 'remark', label: '备注', minWidth: 160 },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'baseId', label: '盘点任务ID', span: 12, component: { name: 'el-input' } },
  { prop: 'materialCode', label: '物料编码', span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'materialName', label: '物料名称', span: 12, component: { name: 'el-input' }, required: true },
  { prop: 'specification', label: '物料规格', span: 12, component: { name: 'el-input' } },
  { prop: 'unit', label: '计量单位', span: 12, component: { name: 'el-input' } },
  { prop: 'batchNo', label: '批次号', span: 12, component: { name: 'el-input' } },
  { prop: 'validity', label: '有效期', span: 12, component: { name: 'el-input', props: { placeholder: 'YYYY-MM-DD' } } },
  { prop: 'bookQty', label: '账面数量', span: 12, component: { name: 'el-input' } },
  { prop: 'actualQty', label: '实际数量', span: 12, component: { name: 'el-input' } },
  { prop: 'storageLocation', label: '仓位', span: 12, component: { name: 'el-input' } },
  { prop: 'diffQty', label: '差异数量', span: 12, component: { name: 'el-input' } },
  { prop: 'diffRate', label: '差异率', span: 12, component: { name: 'el-input' } },
  {
    prop: 'isDiff',
    label: '是否有差异',
    span: 12,
    component: {
      name: 'el-select',
      props: {
        placeholder: '请选择差异状态',
      },
    },
    options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ],
  },
  { prop: 'checkerId', label: '盘点人ID', span: 12, component: { name: 'el-input' } },
  { prop: 'remark', label: '备注', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);
</script>


