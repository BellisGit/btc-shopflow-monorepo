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

    // 获取画布引用
    const canvasRef = document.querySelector('.strategy-canvas') as HTMLElement;
    if (canvasRef) {
      updateTempConnection(event, canvasRef);
    } else {
      console.error('找不到画布元素');
    }
  };

  const updateTempConnection = (event: MouseEvent, canvasRef?: HTMLElement) => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId || !canvasRef) {
      return;
    }

    const fromNode = nodes.value.find(n => n.id === connectionState.fromNodeId);
    if (!fromNode) {
      return;
    }

    const rect = canvasRef.getBoundingClientRect();
    const toX = event.clientX - rect.left;
    const toY = event.clientY - rect.top;

    // 计算源节点连接点位置（与 getConnectionPath 保持一致）
    const nodeWidth = fromNode.style?.width || 120;
    const nodeHeight = fromNode.style?.height || 60;

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

    // draw.io 风格的临时连接线：智能路径计算
    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    let path: string;

    if (horizontalDistance < 30) {
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      const minGap = 20; // 最小间距
      const midY = fromY + (toY - fromY) / 2;

      // 如果垂直距离很小，使用水平连接
      if (verticalDistance < 40) {
        path = `M ${fromX} ${fromY} L ${toX} ${fromY}`;
      } else {
        // 使用90度折角，确保转折点有足够的间距
        const turnY = Math.max(fromY + minGap, Math.min(toY - minGap, midY));
        path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
      }
    }

    connectionState.tempConnection = { path };
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

  // 计算所有连接线的路径
  const connectionPaths = computed(() => {
    // 强制依赖 nodes 的位置变化，确保拖拽时连接线实时更新
    // 使用 JSON.stringify 确保深度响应式更新
    const nodesPositions = JSON.stringify(nodes.value.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      width: n.style?.width || 120,
      height: n.style?.height || 60
    })));

    const result = connections.value.map(connection => {
      const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
      const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

      if (!sourceNode || !targetNode) {
        return {
          id: connection.id,
          path: '',
          color: '#409eff',
          marker: 'url(#arrowhead-default)'
        };
      }

      // 计算源节点连接点位置
      const sourceWidth = sourceNode.style?.width || 120;
      const sourceHeight = sourceNode.style?.height || 60;
      const targetWidth = targetNode.style?.width || 120;
      const targetHeight = targetNode.style?.height || 60;

      let sourceX: number;
      let sourceY: number;
      let targetX: number;
      let targetY: number;

      // 根据源节点类型和连接条件计算连接点位置
      if ((sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') && connection.condition) {
        // 条件节点的特殊连接点 - 直接接触节点边缘
        sourceY = sourceNode.position.y + sourceHeight;
        if (connection.condition === 'true') {
          sourceX = sourceNode.position.x + sourceWidth * 0.85;
        } else {
          sourceX = sourceNode.position.x + sourceWidth * 0.15;
        }
      } else {
        // 默认输出连接点：节点底部中心 - 直接接触节点边缘
        sourceX = sourceNode.position.x + sourceWidth / 2;
        sourceY = sourceNode.position.y + sourceHeight;
      }

      // 目标节点输入连接点：节点顶部中心 - 直接接触节点边缘
      targetX = targetNode.position.x + targetWidth / 2;
      targetY = targetNode.position.y;

      // draw.io 风格的连接线：强制使用90度折角
      const horizontalDistance = Math.abs(targetX - sourceX);
      const verticalDistance = Math.abs(targetY - sourceY);
      const minGap = 20; // 最小间距

      let path: string;

      // 强制使用90度折角，不允许倾斜直线
      if (horizontalDistance < minGap && verticalDistance < minGap) {
        // 如果距离很近，使用简单的L形折角
        const turnY = sourceY + (targetY - sourceY) / 2;
        path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY} L ${targetX} ${targetY}`;
      } else if (horizontalDistance < minGap) {
        // 水平距离很小，使用垂直-水平-垂直的折角
        const turnY = sourceY + (targetY - sourceY) / 2;
        path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY} L ${targetX} ${targetY}`;
      } else if (verticalDistance < minGap) {
        // 垂直距离很小，使用水平-垂直-水平的折角
        const turnX = sourceX + (targetX - sourceX) / 2;
        path = `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY} L ${targetX} ${targetY}`;
      } else {
        // 一般情况：使用90度折角
        const turnY = sourceY + (targetY - sourceY) / 2;
        path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY} L ${targetX} ${targetY}`;
      }

      // 计算颜色 - 动态获取主题颜色
      const getThemeColor = (cssVar: string) => {
        if (typeof window !== 'undefined') {
          const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
          return color || '#ffffff'; // 如果获取不到，使用白色作为默认值
        }
        return '#ffffff'; // 默认白色
      };

      // 根据主题动态选择连接线颜色
      // 在深色主题下使用白色，在浅色主题下使用深色
      const isDarkTheme = getThemeColor('--el-color-white') === '#ffffff' &&
                         getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').includes('dark');

      let color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');

      if (connection.condition === 'true') {
        color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
      } else if (connection.condition === 'false') {
        color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
      } else {
        color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary'));
      }

      // 计算箭头标记
      let marker = 'url(#arrowhead-default)';
      if (connection.condition === 'true') {
        marker = 'url(#arrowhead-true)';
      } else if (connection.condition === 'false') {
        marker = 'url(#arrowhead-false)';
      }

      return {
        id: connection.id,
        path,
        color,
        marker
      };
    });

    return result;
  });

  const getConnectionPath = (connection: StrategyConnection): string => {
    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      return '';
    }

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

    const path = `M ${sourceX} ${sourceY} C ${sourceX} ${controlPoint1Y} ${targetX} ${controlPoint2Y} ${targetX} ${targetY}`;
    return path;
  };

  const clearConnections = () => {
    connections.value = [];
    selectedConnectionId.value = '';
    cancelConnection();
  };

  // 添加连接
  const addConnection = (connection: StrategyConnection) => {
    connections.value.push(connection);
  };

  // 更新连接
  const updateConnection = (connectionId: string, updates: Partial<StrategyConnection>) => {
    const connection = connections.value.find(c => c.id === connectionId);
    if (connection) {
      Object.assign(connection, updates);
    }
  };

  // 获取连接颜色
  const getConnectionColor = (connection: StrategyConnection): string => {
    if (connection.condition === 'true') {
      return '#67c23a'; // 绿色
    } else if (connection.condition === 'false') {
      return '#f56c6c'; // 红色
    }
    return connection.style?.strokeColor || '#409eff'; // 默认蓝色
  };

  // 获取连接箭头标记
  const getConnectionMarker = (connection: StrategyConnection): string => {
    if (connection.condition === 'true') {
      return 'url(#arrowhead-true)';
    } else if (connection.condition === 'false') {
      return 'url(#arrowhead-false)';
    }
    return 'url(#arrowhead-default)';
  };

  // 处理连接开始
  const handleConnectionStart = (event: MouseEvent, node: StrategyNode, type: 'input' | 'output' | 'output-true' | 'output-false') => {
    event.stopPropagation();

    if (type === 'input') {
      // 如果是输入连接点，完成连接
      completeConnection(node.id);
    } else {
      // 如果是输出连接点，开始连接
      const condition = type === 'output-true' ? 'true' : type === 'output-false' ? 'false' : undefined;
      startConnection(node.id, event, condition);
    }
  };

  // 临时连接
  const tempConnection = computed(() => connectionState.tempConnection);

  return {
    // 状态
    connections,
    selectedConnectionId,
    selectedConnection,
    connectionState,
    tempConnection,
    connectionPaths,

    // 方法
    startConnection,
    updateTempConnection,
    completeConnection,
    cancelConnection,
    selectConnection,
    updateConnectionProperties,
    updateConnection,
    addConnection,
    deleteConnection,
    deleteNodeConnections,
    getConnectionPath,
    getConnectionColor,
    getConnectionMarker,
    handleConnectionStart,
    clearConnections
  };
}
