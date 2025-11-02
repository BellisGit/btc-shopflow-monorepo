import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBase } from '/$/base';
import { ElMessage } from 'element-plus';
import { getTenantList } from '../../shared/composables/api';

export function useRegister() {
  const { app } = useBase();
  const { t } = useI18n();

  // 确保app对象有info属性
  const appInfo = app?.info || { name: 'BTC Admin', version: '1.0.0' };

  // 当前步骤状态
  const currentStep = ref<'tenant-select' | 'INERT' | 'UK-HEAD' | 'SUPPLIER'>('tenant-select');

  // 供应商列表状态
  const supplierList = ref<any[]>([]);
  const selectedSupplier = ref<any>(null);

  // 处理租户选择
  async function handleTenantSelected(tenant: string | any) {
    if (typeof tenant === 'string') {
      if (tenant === 'SUPPLIER') {
        // 如果是供应商，先获取供应商列表，然后直接进入注册流程第一步
        await loadSupplierList();
        currentStep.value = 'SUPPLIER';
      } else {
        // 其他租户类型直接进入注册流程
        currentStep.value = tenant as any;
      }
    } else {
      // 如果选择的是具体供应商，进入注册流程
      selectedSupplier.value = tenant;
      currentStep.value = 'SUPPLIER';
    }
  }

  // 加载供应商列表
  async function loadSupplierList() {
    try {
      const response = await getTenantList('SUPPLIER');

      if (response.code === 2000) {
        supplierList.value = response.data || [];
      } else {
        ElMessage.error(response.msg || '获取供应商列表失败');
        supplierList.value = [];
      }
    } catch (error: any) {
      console.error('获取供应商列表失败', error);
      ElMessage.error(error.message || '获取供应商列表失败');
      supplierList.value = [];
    }
  }

  // 返回租户选择
  function backToTenantSelect() {
    currentStep.value = 'tenant-select';
  }

  // 处理注册完成
  function handleRegistrationComplete(data: any) {
    ElMessage.success('注册成功！');

    // 跳转到登录页面
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }

  return {
    currentStep,
    supplierList,
    selectedSupplier,
    handleTenantSelected,
    handleRegistrationComplete,
    backToTenantSelect,
    app: { info: appInfo },
    t
  };
}
