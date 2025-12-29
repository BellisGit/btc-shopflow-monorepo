<template>
  <div class="dictionary-fields-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="resourceService"
      :right-service="wrappedFieldService"
      :table-columns="fieldColumns"
      :form-items="fieldFormItems"
      :op="{ buttons: ['custom'] }"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :left-title="t('menu.access.resources')"
      :right-title="t('data.dictionary.field.list')"
      :search-placeholder="t('data.dictionary.field.search_placeholder')"
      :show-unassigned="false"
      :enable-key-search="true"
      left-size="middle"
      id-field="id"
      label-field="resourceNameCn"
      @select="onResourceSelect"
      @form-submit="handleFormSubmit"
    >
      <template #slot-custom="{ scope }">
        <el-button
          link
          type="warning"
          @click="goToDictionaryValues(scope.row)"
        >
          <BtcSvg class="btc-crud-btn__icon" name="dict" />
          {{ t('data.dictionary.actions.manage_values') }}
        </el-button>
      </template>
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';
import { service } from '@services/eps';

defineOptions({
  name: 'AdminDictionaryFields'
});

const { t } = useI18n();
const message = useMessage();
const router = useRouter();
const tableGroupRef = ref();
const selectedResource = ref<any>(null);

// 资源服务配置
const resourceService = {
  list: (params?: any) => {
    const finalParams = params || {};
    return service.admin?.iam?.resource?.list(finalParams);
  }
};

// 字段服务（右侧表）
const fieldService = service.admin?.dict?.info;

const wrappedFieldService = {
  ...fieldService,
};

// 资源选择处理
const onResourceSelect = (resource: any) => {
  selectedResource.value = resource;
};

// 表单提交处理 - 自动填充 domainId
const handleFormSubmit = (data: any, event: any) => {
  // 如果有选中资源，自动填充 domainId
  if (selectedResource.value) {
    data.domainId = selectedResource.value.id;
  }

  // 继续默认提交流程
  if (!event.defaultPrevented && typeof event.next === 'function') {
    event.next(data);
  }
};

// 跳转到字典值管理页面
const goToDictionaryValues = (field: any) => {
  if (!field || !field.id) {
    message.warning(t('data.dictionary.field.select_required'));
    return;
  }

  router.push({
    path: '/governance/dictionary/values',
    query: {
      fieldId: field.id,
      fieldName: field.fieldName || field.dictName,
      dictCode: field.dictCode,
      // 传递上下文信息
      domainId: selectedResource.value?.id,
    }
  });
};

// 字段表格列
const fieldColumns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'dictCode', label: t('data.dictionary.field.code'), minWidth: 150 },
  { prop: 'dictName', label: t('data.dictionary.field.name'), minWidth: 150 },
  { prop: 'entityClass', label: t('data.dictionary.field.entity_class'), minWidth: 180 },
  { prop: 'fieldName', label: t('data.dictionary.field.field_name'), minWidth: 150 },
  { prop: 'remark', label: t('data.dictionary.field.remark'), minWidth: 200 },
]);

// 字段表单
const fieldFormItems = computed<FormItem[]>(() => {
  const currentResource = selectedResource.value ||
    (tableGroupRef.value?.viewGroupRef?.selectedItem);

  return [
    {
      prop: 'dictCode',
      label: t('data.dictionary.field.code'),
      span: 12,
      required: true,
      component: { name: 'el-input' }
    },
    {
      prop: 'dictName',
      label: t('data.dictionary.field.name'),
      span: 12,
      required: true,
      component: { name: 'el-input' }
    },
    {
      prop: 'entityClass',
      label: t('data.dictionary.field.entity_class'),
      span: 12,
      component: { name: 'el-input' }
    },
    {
      prop: 'fieldName',
      label: t('data.dictionary.field.field_name'),
      span: 12,
      component: { name: 'el-input' }
    },
    {
      prop: 'domainId',
      label: t('data.dictionary.field.domain_id'),
      span: 12,
      value: currentResource?.id,
      component: {
        name: 'el-input',
        props: {
          disabled: true,
          placeholder: currentResource?.id ? currentResource.id : t('data.dictionary.field.domain_select_required')
        }
      }
    },
    {
      prop: 'remark',
      label: t('data.dictionary.field.remark'),
      span: 24,
      component: { name: 'el-input', props: { type: 'textarea', rows: 3 } }
    },
  ];
});

</script>

<style lang="scss" scoped>
.dictionary-fields-page {
  height: 100%;
  box-sizing: border-box;
}
</style>

