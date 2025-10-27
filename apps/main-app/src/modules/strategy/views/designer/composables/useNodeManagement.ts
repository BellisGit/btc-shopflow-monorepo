import { ref, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { StrategyNode, NodeType } from '@/types/strategy';

/**
 * 节点管理
 */
export function useNodeManagement() {
  // 节点数据
  const nodes = ref<StrategyNode[]>([]);
  const selectedNodeId = ref<string>('');

  // 计算属性
  const selectedNode = computed(() =>
    nodes.value.find(node => node.id === selectedNodeId.value)
  );

  // 工具函数
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const getNodeColor = (type: NodeType): string => {
    const colorMap = {
      'START': '#67c23a',
      'END': '#f56c6c',
      'CONDITION': '#e6a23c',
      'ACTION': '#409eff',
      'DECISION': '#909399',
      'GATEWAY': '#9c27b0'
    };
    return colorMap[type] || '#409eff';
  };

  // 节点操作
  const addNode = async (component: any, position: { x: number; y: number }) => {
    const newNode: StrategyNode = {
      id: generateId(),
      type: component.type,
      name: component.name,
      position,
      data: {
        conditions: [],
        actions: [],
        rules: [],
        config: {}
      },
      style: {
        width: 120,
        height: 80,
        backgroundColor: getNodeColor(component.type),
        borderColor: '#409eff'
      }
    };

    nodes.value.push(newNode);

    // Delay selection to ensure DOM is ready and all components are fully rendered
    await nextTick();
    // Add additional delay to ensure all form elements are properly initialized
    // and Element Plus components have completed their internal setup
    setTimeout(() => {
      selectNode(newNode.id);
    }, 200);

    return newNode;
  };

  const selectNode = (nodeId: string) => {
    selectedNodeId.value = nodeId;
  };

  const moveNode = (nodeId: string, position: { x: number; y: number }) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  };

  const updateNodeProperties = (nodeId: string, properties: Partial<StrategyNode>) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, properties);
    }
  };

  const deleteNode = async (nodeId: string, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await ElMessageBox.confirm('确定要删除这个节点吗？', '确认删除', {
          type: 'warning'
        });
      }

      nodes.value = nodes.value.filter(n => n.id !== nodeId);

      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = '';
      }

      ElMessage.success('节点删除成功');
      return true;
    } catch {
      return false;
    }
  };

  const clearNodes = () => {
    nodes.value = [];
    selectedNodeId.value = '';
  };

  return {
    // 状态
    nodes,
    selectedNodeId,
    selectedNode,

    // 方法
    addNode,
    selectNode,
    moveNode,
    updateNodeProperties,
    deleteNode,
    clearNodes,
    generateId,
    getNodeColor
  };
}
