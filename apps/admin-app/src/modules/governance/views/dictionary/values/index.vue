<template>
  <div class="dictionary-values-page">
    <BtcCrud
      ref="crudRef"
      :service="dictionaryValueService"
    >
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('data.dictionary.value.search_placeholder')" />
        <BtcCrudActions />
      </BtcRow>
      <BtcRow>
        <BtcTable
          :columns="dictionaryValueColumns"
          :op="{ buttons: ['edit', 'delete'] }"
          border
        />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert
        :items="dictionaryValueFormItems"
        width="800px"
      />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import {
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
  BtcCrudActions,
} from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'AdminDictionaryValues'
});

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// 字典值服务
const dictionaryValueService = {
  ...service.admin?.dict?.dictData,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.admin?.dict?.dictData?.delete(id);
    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.admin?.dict?.dictData?.deleteBatch(ids);
    message.success(t('crud.message.delete_success'));
  },
};

// 字典值表格列
const dictionaryValueColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'dictTypeCode', label: t('data.dictionary.value.type_code'), minWidth: 150 },
  { prop: 'dictValue', label: t('data.dictionary.value.value'), minWidth: 150 },
  { prop: 'dictLabel', label: t('data.dictionary.value.label'), minWidth: 150 },
  { prop: 'sortOrder', label: t('data.dictionary.value.sort'), width: 100 },
]);

// 字典值表单
const dictionaryValueFormItems = computed<FormItem[]>(() => [
  { 
    prop: 'dictTypeCode', 
    label: t('data.dictionary.value.type_code'), 
    span: 12, 
    required: true,
    component: { 
      name: 'el-input',
      props: { 
        placeholder: t('data.dictionary.value.type_code_placeholder')
      } 
    } 
  },
  { 
    prop: 'dictValue', 
    label: t('data.dictionary.value.value'), 
    span: 12, 
    required: true, 
    component: { name: 'el-input' } 
  },
  { 
    prop: 'dictLabel', 
    label: t('data.dictionary.value.label'), 
    span: 12, 
    required: true, 
    component: { name: 'el-input' } 
  },
  { 
    prop: 'sortOrder', 
    label: t('data.dictionary.value.sort'), 
    span: 12, 
    component: { 
      name: 'el-input-number', 
      props: { min: 0, precision: 0 } 
    } 
  },
]);

</script>

<style lang="scss" scoped>
.dictionary-values-page {
  height: 100%;
  box-sizing: border-box;
}
</style>

