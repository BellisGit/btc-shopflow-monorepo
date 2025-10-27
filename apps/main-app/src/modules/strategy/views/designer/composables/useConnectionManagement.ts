import { ref, computed, reactive, type Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
import { ConnectorType } from '@/types/strategy';

/**
 * 连接管理
 */
export function useConnectionManagement(nodes: Ref<StrategyNode[]>) {
  // 连接数据
  const connections = ref<StrategyConnection[]>([]);
  const selectedConnectionId = ref<string>('');

  // 连接状态
  const connectionState = reactive({
    isConnecting: false,
    fromNodeId: '',
    fromCondition: undefined as 'true' | 'false' | undefined,
    tempConnection: null as { path: string } | null
  });

  // 计算属性
  const selectedConnection = computed(() =>
    connections.value.find(conn => conn.id === selectedConnectionId.value)
  );

  // 工具函数
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // 连接操作
  const startConnection = (fromNodeId: string, event: MouseEvent, condition?: 'true' | 'false') => {
    connectionState.isConnecting = true;
    connectionState.fromNodeId = fromNodeId;
    connectionState.fromCondition = condition;
    updateTempConnection(event);
  };

  const updateTempConnection = (event: MouseEvent, canvasRef?: HTMLElement) => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId || !canvasRef) return;

    const fromNode = nodes.value.find(n => n.id === connectionState.fromNodeId);
    if (!fromNode) return;

    const rect = canvasRef.getBoundingClientRect();
    const toX = event.clientX - rect.left;
    const toY = event.clientY - rect.top;

    // 计算源节点连接点位置（与 getConnectionPath 保持一致）
    const nodeWidth = fromNode.style?.width || 120;
    const nodeHeight = fromNode.style?.height || 80;

    let fromX: number;
    let fromY: number;

    // 根据源节点类型和连接条件计算连接点位置
    if ((fromNode.type === 'CONDITION' || fromNode.type === 'DECISION') && connectionState.fromCondition) {
      fromY = fromNode.position.y + nodeHeight + 8; // 连接点中心位置
      if (connectionState.fromCondition === 'true') {
        // 绿色连接点：right: 15%, transform: translateX(50%) + 向右偏移
        fromX = fromNode.position.x + nodeWidth * 0.85 + 16 + 3;
      } else {
        // 红色连接点：left: 15%, transform: translateX(-50%) + 向右偏移
        fromX = fromNode.position.x + nodeWidth * 0.15 + 3;
      }
    } else {
      // 默认输出连接点：从连接点中心开始 + 向右偏移
      fromX = fromNode.position.x + nodeWidth / 2 + 3;
      fromY = fromNode.position.y + nodeHeight + 8;
    }

    connectionState.tempConnection = {
      path: `M ${fromX} ${fromY} L ${toX} ${toY}`
    };
  };

  const completeConnection = (toNodeId: string) => {
    if (!connectionState.isConnecting ||
        !connectionState.fromNodeId ||
        connectionState.fromNodeId === toNodeId) {
      return false;
    }

    // 检查是否已存在连接
    const existingConnection = connections.value.find(c =>
      c.sourceNodeId === connectionState.fromNodeId && c.targetNodeId === toNodeId
    );

    if (existingConnection) {
      ElMessage.warning('节点之间已存在连接');
      // 清理连接状态
      connectionState.isConnecting = false;
      connectionState.tempConnection = null;
      connectionState.fromNodeId = '';
      return false;
    }

    // 根据条件设置连接颜色
    let strokeColor = '#409eff'; // 默认蓝色
    if (connectionState.fromCondition === 'true') {
      strokeColor = '#67c23a'; // 绿色
    } else if (connectionState.fromCondition === 'false') {
      strokeColor = '#f56c6c'; // 红色
    }

    const newConnection: StrategyConnection = {
      id: generateId(),
      type: ConnectorType.SEQUENCE,
      sourceNodeId: connectionState.fromNodeId,
      targetNodeId: toNodeId,
      condition: connectionState.fromCondition,
      style: {
        strokeColor,
        strokeWidth: 2
      }
    };

    connections.value.push(newConnection);

    // 清理连接状态
    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = '';
    connectionState.fromCondition = undefined;

    ElMessage.success('连接创建成功');
    return true;
  };

  const cancelConnection = () => {
    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = '';
    connectionState.fromCondition = undefined;
  };

  const selectConnection = (connection: StrategyConnection) => {
    selectedConnectionId.value = connection.id;
  };

  const updateConnectionProperties = (connectionId: string, properties: Partial<StrategyConnection>) => {
    const connection = connections.value.find(c => c.id === connectionId);
    if (connection) {
      Object.assign(connection, properties);
    }
  };

  const deleteConnection = async (connectionId: string, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await ElMessageBox.confirm('确定要删除这个连接吗？', '确认删除', {
          type: 'warning'
        });
      }

      connections.value = connections.value.filter(c => c.id !== connectionId);

      if (selectedConnectionId.value === connectionId) {
        selectedConnectionId.value = '';
      }

      ElMessage.success('连接删除成功');
      return true;
    } catch {
      return false;
    }
  };

  const deleteNodeConnections = (nodeId: string) => {
    connections.value = connections.value.filter(c =>
      c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
  };

  const getConnectionPath = (connection: StrategyConnection): string => {
    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) return '';

    // 计算源节点连接点位置
    const nodeWidth = sourceNode.style?.width || 120;
    const nodeHeight = sourceNode.style?.height || 80;

    let sourceX: number;
    let sourceY: number;

    // 根据源节点类型和连接条件计算连接点位置
    if ((sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') && connection.condition) {
      // 源连接点：从连接点中心开始
      sourceY = sourceNode.position.y + nodeHeight + 8; // 连接点中心位置
      if (connection.condition === 'true') {
        // 绿色连接点：right: 15%, transform: translateX(50%) + 向右偏移
        sourceX = sourceNode.position.x + nodeWidth * 0.85 + 16 + 3;
      } else {
        // 红色连接点：left: 15%, transform: translateX(-50%) + 向右偏移
        sourceX = sourceNode.position.x + nodeWidth * 0.15 + 3;
      }
    } else {
      // 默认输出连接点：从连接点中心开始 + 向右偏移
      sourceX = sourceNode.position.x + nodeWidth / 2 + 3;
      sourceY = sourceNode.position.y + nodeHeight + 8; // 连接点中心位置
    }

    // 目标节点输入连接点：箭头精确指向连接点中心 + 向右偏移 + 向下偏移
    const targetNodeWidth = targetNode.style?.width || 120;
    const targetX = targetNode.position.x + targetNodeWidth / 2 + 3;
    const targetY = targetNode.position.y - 8 + 2; // 连接点中心位置 + 向下2px


    // 使用贝塞尔曲线创建平滑连接
    const controlPoint1Y = sourceY + (targetY - sourceY) * 0.5;
    const controlPoint2Y = targetY - (targetY - sourceY) * 0.5;

    return `M ${sourceX} ${sourceY} C ${sourceX} ${controlPoint1Y} ${targetX} ${controlPoint2Y} ${targetX} ${targetY}`;
  };

  const clearConnections = () => {
    connections.value = [];
    selectedConnectionId.value = '';
    cancelConnection();
  };

  return {
    // 状态
    connections,
    selectedConnectionId,
    selectedConnection,
    connectionState,

    // 方法
    startConnection,
    updateTempConnection,
    completeConnection,
    cancelConnection,
    selectConnection,
    updateConnectionProperties,
    deleteConnection,
    deleteNodeConnections,
    getConnectionPath,
    clearConnections
  };
}
