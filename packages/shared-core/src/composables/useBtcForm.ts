import { reactive, ref, watch } from 'vue';

// Helper: deep clone
function cloneDeep(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(cloneDeep);
  const cloned = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = cloneDeep(obj[key]);
    }
  }
  return cloned;
}

export interface BtcFormConfig {
  title?: string;
  height?: string;
  width?: string;
  props?: Record<string, any>;
  on?: Record<string, any>;
  op?: {
    hidden?: boolean;
    saveButtonText?: string;
    closeButtonText?: string;
    justify?: string;
    buttons?: any[];
  };
  dialog?: Record<string, any>;
  items: any[];
  form?: Record<string, any>;
  _data?: Record<string, any>;
}

export function useBtcForm() {
  // 表单配置
  const config = reactive<BtcFormConfig>({
    title: '-',
    height: undefined,
    width: '50%',
    props: {
      labelWidth: '100px',
      labelPosition: 'top',
    },
    on: {},
    op: {
      hidden: false,
      saveButtonText: '保存',
      closeButtonText: '关闭',
      justify: 'flex-end',
      buttons: ['close', 'save'],
    },
    dialog: {
      appendToBody: true,
    },
    items: [],
    form: {},
    _data: {},
  });

  const Form = ref();

  // 表单数据
  const form = reactive<Record<string, any>>({});

  // 表单数据备份
  const oldForm = ref<Record<string, any>>({});

  // 表单是否可见
  const visible = ref(false);

  // 表单提交保存状态
  const saving = ref(false);

  // 表单加载状态
  const loading = ref(false);

  // 表单禁用状态
  const disabled = ref(false);

  // 监听表单变化
  watch(
    () => form,
    (val) => {
      if (config.on?.change) {
        for (const i in val) {
          if (form[i] !== oldForm.value[i]) {
            config.on?.change(val, i);
          }
        }
      }

      oldForm.value = cloneDeep(val);
    },
    {
      deep: true,
    }
  );

  return {
    Form,
    config,
    form,
    visible,
    saving,
    loading,
    disabled,
  };
}
