<template>
  <div class="policies-page">
    <BtcCrud
      ref="crudRef"
      :service="policyService"
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
      </template>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { service } from '../../../../services/eps';

defineOptions({
  name: 'AccessPolicies'
});

// ????
const permission = {
  list: 'access:policies:list',
  add: 'access:policies:add',
  update: 'access:policies:update',
  delete: 'access:policies:delete',
  info: 'access:policies:info'
};

// 策略服务 - 使用EPS服务
const policyService = service.base.policy;
// 表格列配置
const columns = [
  {
    label: '????',
    prop: 'policyName',
    minWidth: 150
  },
  {
    label: '????',
    prop: 'policyType',
    width: 100,
    dict: [
      { label: 'RBAC', value: 'RBAC' },
      { label: 'ABAC', value: 'ABAC' },
      { label: 'ACL', value: 'ACL' }
    ]
  },
  {
    label: '??',
    prop: 'effect',
    width: 80,
    dict: [
      { label: '??', value: 'allow' },
      { label: '??', value: 'deny' }
    ]
  },
  {
    label: '???',
    prop: 'priority',
    width: 80
  },
  {
    label: '??',
    prop: 'conditions',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '??',
    prop: 'description',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '??',
    prop: 'status',
    width: 80,
    dict: [
      { label: '??', value: 1 },
      { label: '??', value: 0 }
    ]
  },
  {
    label: '????',
    prop: 'createTime',
    width: 160
  }
];

// ??????
const searchForm = {
  items: [
    {
      label: '????',
      prop: 'policyName',
      component: 'el-input',
      props: {
        placeholder: '???????'
      }
    },
    {
      label: '????',
      prop: 'policyType',
      component: 'el-select',
      props: {
        placeholder: '???????',
        clearable: true
      },
      dict: [
        { label: 'RBAC', value: 'RBAC' },
        { label: 'ABAC', value: 'ABAC' },
        { label: 'ACL', value: 'ACL' }
      ]
    },
    {
      label: '??',
      prop: 'effect',
      component: 'el-select',
      props: {
        placeholder: '?????',
        clearable: true
      },
      dict: [
        { label: '??', value: 'allow' },
        { label: '??', value: 'deny' }
      ]
    },
    {
      label: '??',
      prop: 'status',
      component: 'el-select',
      props: {
        placeholder: '?????',
        clearable: true
      },
      dict: [
        { label: '??', value: 1 },
        { label: '??', value: 0 }
      ]
    }
  ]
};

// ????
const upsertForm = {
  items: [
    {
      label: '????',
      prop: 'policyName',
      component: 'el-input',
      required: true,
      props: {
        placeholder: '???????'
      }
    },
    {
      label: '????',
      prop: 'policyType',
      component: 'el-select',
      required: true,
      props: {
        placeholder: '???????'
      },
      dict: [
        { label: 'RBAC', value: 'RBAC' },
        { label: 'ABAC', value: 'ABAC' },
        { label: 'ACL', value: 'ACL' }
      ]
    },
    {
      label: '??',
      prop: 'effect',
      component: 'el-select',
      required: true,
      props: {
        placeholder: '?????'
      },
      dict: [
        { label: '??', value: 'allow' },
        { label: '??', value: 'deny' }
      ]
    },
    {
      label: '???',
      prop: 'priority',
      component: 'el-input-number',
      required: true,
      props: {
        placeholder: '??????',
        min: 1,
        max: 1000
      }
    },
    {
      label: '??',
      prop: 'conditions',
      component: 'el-input',
      required: true,
      props: {
        type: 'textarea',
        placeholder: '???JSON?????',
        rows: 4
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
    },
    {
      label: '??',
      prop: 'status',
      component: 'el-radio-group',
      required: true,
      dict: [
        { label: '??', value: 1 },
        { label: '??', value: 0 }
      ]
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
</script>

<style lang="scss" scoped>
.policies-page {
  height: 100%;
}
</style>
