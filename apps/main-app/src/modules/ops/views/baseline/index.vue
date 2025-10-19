<template>
  <div class="baseline-page">
    <BtcCrud
      ref="crudRef"
      :service="baselineService"
      :columns="columns"
      :search-form="searchForm"
      :upsert-form="upsertForm"
      :permission="permission"
    >
      <template #table-operation="{ row }">
        <el-button
          v-permission="permission.update"
          type="primary"
          size="small"
          @click="openUpsert(row)"
        >
          {{ t('crud.button.edit') }}
        </el-button>
        <el-button
          v-permission="permission.delete"
          type="danger"
          size="small"
          @click="remove(row)"
        >
          {{ t('crud.button.delete') }}
        </el-button>
        <el-button
          v-permission="permission.info"
          type="info"
          size="small"
          @click="viewDetails(row)"
        >
          {{ t('crud.button.info') }}
        </el-button>
      </template>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { service } from '../../../../services/eps';

defineOptions({
  name: 'OpsBaseline'
});

// ????
const permission = {
  list: 'ops:baseline:list',
  add: 'ops:baseline:add',
  update: 'ops:baseline:update',
  delete: 'ops:baseline:delete',
  info: 'ops:baseline:info'
};

// Mock??
const baselineService = createMockCrudService('btc_baselines', {
  
});

// ?????
const columns = [
  {
    label: '????',
    prop: 'baselineName',
    minWidth: 150
  },
  {
    label: '????',
    prop: 'permissionCount',
    width: 100
  },
  {
    label: '??',
    prop: 'description',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '????',
    prop: 'createTime',
    width: 160
  },
  {
    label: '????',
    prop: 'updateTime',
    width: 160
  }
];

// ??????
const searchForm = {
  items: [
    {
      label: '????',
      prop: 'baselineName',
      component: 'el-input',
      props: {
        placeholder: '???????'
      }
    },
    {
      label: '????',
      prop: 'permissionCount',
      component: 'el-input-number',
      props: {
        placeholder: '???????',
        min: 0
      }
    }
  ]
};

// ????
const upsertForm = {
  items: [
    {
      label: '????',
      prop: 'baselineName',
      component: 'el-input',
      required: true,
      props: {
        placeholder: '???????'
      }
    },
    {
      label: '????',
      prop: 'permissionCount',
      component: 'el-input-number',
      required: true,
      props: {
        placeholder: '???????',
        min: 0
      }
    },
    {
      label: '??',
      prop: 'description',
      component: 'el-input',
      props: {
        type: 'textarea',
        placeholder: '?????',
        rows: 3
      }
    }
  ]
};

const crudRef = ref();
const openUpsert = (row?: any) => {
  crudRef.value?.openUpsert(row);
};
const remove = (row: any) => {
  crudRef.value?.remove(row);
};
const viewDetails = (row: any) => {
  crudRef.value?.info(row);
};
</script>

<style lang="scss" scoped>
.baseline-page {
  height: 100%;
}
</style>
