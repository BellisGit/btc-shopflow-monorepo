import { computed, Ref } from 'vue';
import { useMessage } from '@/utils/use-message';

/**
 * 组合模式逻辑
 */
export function useComposeMode(
  actions: Ref<any[]>,
  selectedResources: Ref<number[]>,
  selectedActions: Ref<number[]>,
  resourceTreeRef: Ref<any>,
  composedPermissions: Ref<any[]>
) {
  const message = useMessage();
  
  const composeCount = computed(() => {
    if (selectedResources.value.length === 0 || selectedActions.value.length === 0) {
      return 0;
    }
    
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    let count = 0;
    
    checkedNodes.forEach((resource: any) => {
      selectedActions.value.forEach(actionId => {
        if (!resource.supportedActions || resource.supportedActions.includes(actionId)) {
          count++;
        }
      });
    });
    
    return count;
  });
  
  const canCompose = computed(() => {
    return composeCount.value > 0;
  });
  
  const handleCompose = async (composing: Ref<boolean>) => {
    if (!canCompose.value) {
      message.warning('请至少选择一个资源和操作');
      return;
    }
    
    composing.value = true;
    try {
      const newPermissions: any[] = [];
      const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
      
      const existingKeys = new Set(composedPermissions.value.map((p: any) => p.key));
      
      checkedNodes.forEach((resource: any) => {
        selectedActions.value.forEach(actionId => {
          const action = actions.value.find((a: any) => a.id === actionId);
          if (!action) return;
          
          if (resource.supportedActions && !resource.supportedActions.includes(actionId)) {
            return;
          }
          
          const key = `${resource.id}-${actionId}`;
          
          if (existingKeys.has(key)) return;
          
          newPermissions.push({
            key,
            permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
            permissionCode: `${resource.resourceCode}:${action.actionCode}`,
            resourceId: resource.id,
            resourceName: resource.resourceNameCn,
            actionId: action.id,
            actionName: action.actionNameCn,
            description: `${action.actionNameCn}${resource.resourceNameCn}的权限`,
          });
        });
      });
      
      if (newPermissions.length === 0) {
        message.warning('没有可添加的权限');
        return;
      }
      
      composedPermissions.value.push(...newPermissions);
      message.success(`已添加 ${newPermissions.length} 个权限`);
      
      resourceTreeRef.value?.setCheckedKeys([]);
      selectedResources.value.length = 0;
      selectedActions.value.length = 0;
    } catch (_error) {
      message.error('生成失败');
    } finally {
      composing.value = false;
    }
  };
  
  return {
    composeCount,
    canCompose,
    handleCompose,
  };
}

