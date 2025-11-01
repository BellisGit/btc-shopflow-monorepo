import { ref, watch } from 'vue';

/**
 * 权限组合数据管理
 */
export function usePermComposeData() {
  const resourceTree = ref<any[]>([]);
  const actions = ref<any[]>([]);
  const composedPermissions = ref<any[]>([]);
  
  const resourceTreeRef = ref();
  const resourceFilterText = ref('');
  const applyToChildren = ref(false);
  
  const treeProps = {
    children: 'children',
    label: 'resourceNameCn',
  };
  
  const selectedResources = ref<number[]>([]);
  const selectedActions = ref<number[]>([]);
  
  const matrixSelections = ref<Set<string>>(new Set());
  
  const filterResourceNode = (value: string, data: any) => {
    if (!value) return true;
    return data.resourceNameCn.toLowerCase().includes(value.toLowerCase()) ||
           data.resourceCode.toLowerCase().includes(value.toLowerCase());
  };
  
  watch(resourceFilterText, (val) => {
    resourceTreeRef.value?.filter(val);
  });
  
  const loadData = async () => {
    const resourcesRaw = localStorage.getItem('btc_mock_btc_resources');
    const actionsRaw = localStorage.getItem('btc_mock_btc_actions');
    
    if (resourcesRaw) {
      resourceTree.value = JSON.parse(resourcesRaw);
    } else {
      resourceTree.value = [
        {
          id: 1,
          resourceNameCn: '用户管理',
          resourceCode: 'user',
          resourceType: '菜单',
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 11, resourceNameCn: '用户列表', resourceCode: 'user.list', resourceType: '菜单', supportedActions: [1, 2, 3, 4] },
            { id: 12, resourceNameCn: '用户详情', resourceCode: 'user.detail', resourceType: '菜单', supportedActions: [1] },
          ]
        },
        {
          id: 2,
          resourceNameCn: '角色管理',
          resourceCode: 'role',
          resourceType: '菜单',
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 21, resourceNameCn: '角色列表', resourceCode: 'role.list', resourceType: '菜单', supportedActions: [1, 2, 3, 4] },
            { id: 22, resourceNameCn: '角色分配', resourceCode: 'role.assign', resourceType: '菜单', supportedActions: [1, 4] },
          ]
        },
        {
          id: 3,
          resourceNameCn: '部门管理',
          resourceCode: 'department',
          resourceType: '菜单',
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 31, resourceNameCn: '部门列表', resourceCode: 'dept.list', resourceType: '菜单', supportedActions: [1, 2, 3, 4] },
          ]
        },
        {
          id: 4,
          resourceNameCn: '系统设置',
          resourceCode: 'system',
          resourceType: '菜单',
          supportedActions: [1, 2],
          children: [
            { id: 41, resourceNameCn: '系统配置', resourceCode: 'system.config', resourceType: '菜单', supportedActions: [1, 2] },
          ]
        },
      ];
      localStorage.setItem('btc_mock_btc_resources', JSON.stringify(resourceTree.value));
    }
    
    if (actionsRaw) {
      actions.value = JSON.parse(actionsRaw);
    } else {
      actions.value = [
        { id: 1, actionNameCn: '查看', actionCode: 'view', httpMethod: 'GET' },
        { id: 2, actionNameCn: '编辑', actionCode: 'edit', httpMethod: 'PUT' },
        { id: 3, actionNameCn: '删除', actionCode: 'delete', httpMethod: 'DELETE' },
        { id: 4, actionNameCn: '新增', actionCode: 'create', httpMethod: 'POST' },
      ];
      localStorage.setItem('btc_mock_btc_actions', JSON.stringify(actions.value));
    }
  };
  
  const handleResourceCheck = (_data: any, _checked: boolean) => {
    const checkedKeys = resourceTreeRef.value?.getCheckedKeys() || [];
    selectedResources.value = checkedKeys;
  };
  
  return {
    resourceTree,
    actions,
    composedPermissions,
    resourceTreeRef,
    resourceFilterText,
    applyToChildren,
    treeProps,
    selectedResources,
    selectedActions,
    matrixSelections,
    filterResourceNode,
    loadData,
    handleResourceCheck,
  };
}

