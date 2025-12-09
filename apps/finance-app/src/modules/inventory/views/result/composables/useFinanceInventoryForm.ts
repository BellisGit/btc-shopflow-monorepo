import { computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { FormItem } from '@btc/shared-components';

/**
 * 表单项配置
 */
export function useFinanceInventoryForm() {
  const { t } = useI18n();

  const formItems = computed<FormItem[]>(() => [
    {
      label: t('finance.inventory.result.fields.materialCode'),
      prop: 'materialCode',
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: t('finance.inventory.result.fields.materialCode'),
          maxlength: 50
        }
      },
    },
    {
      label: t('finance.inventory.result.fields.position'),
      prop: 'position',
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: t('finance.inventory.result.fields.position'),
          maxlength: 10
        }
      },
    },
    {
      label: t('finance.inventory.result.fields.unitCost'),
      prop: 'unitCost',
      required: true,
      component: {
        name: 'el-input-number',
        props: {
          placeholder: t('finance.inventory.result.fields.unitCost'),
          precision: 5,
          min: 0,
          step: 0.01,
          controlsPosition: 'right'
        }
      },
    },
    {
      label: t('finance.inventory.result.fields.bookQty'),
      prop: 'bookQty',
      required: true,
      component: {
        name: 'el-input-number',
        props: {
          placeholder: t('finance.inventory.result.fields.bookQty'),
          precision: 0,
          min: 0,
          step: 1,
          controlsPosition: 'right'
        }
      },
    },
    {
      label: t('finance.inventory.result.fields.actualQty'),
      prop: 'actualQty',
      required: true,
      component: {
        name: 'el-input-number',
        props: {
          placeholder: t('finance.inventory.result.fields.actualQty'),
          precision: 0,
          min: 0,
          step: 1,
          controlsPosition: 'right'
        }
      },
    },
  ]);

  return {
    formItems,
  };
}

