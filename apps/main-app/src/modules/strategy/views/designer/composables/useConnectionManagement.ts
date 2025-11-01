import { ref, computed, reactive, watch, type Ref } from 'vue';
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
  // 每条连接的中段垂直偏移（用于正交路径），默认0，使用响应式对象以触发 watch
  const connectionOffsetY = reactive<Record<string, number>>({});

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

    // 计算源节点连接点位置（严格限制在四边中点）
    const nodeWidth = fromNode.style?.width || 120;
    const nodeHeight = fromNode.style?.height || 60;

    let fromX: number;
    let fromY: number;

    // 根据源节点类型和连接条件计算连接点位置（严格限制在四个边中点）
    if ((fromNode.type === 'CONDITION' || fromNode.type === 'DECISION') && connectionState.fromCondition) {
      // 条件节点：固定连接点（严格限制在边中点）
      if (connectionState.fromCondition === 'true') {
        // true条件：右侧中点
        fromX = fromNode.position.x + nodeWidth;
        fromY = fromNode.position.y + nodeHeight / 2;
      } else {
        // false条件：左侧中点
        fromX = fromNode.position.x;
        fromY = fromNode.position.y + nodeHeight / 2;
      }
    } else {
      // 普通节点：根据鼠标位置选择最近的边中点（严格限制在四个边中点）
      const nodeCenterX = fromNode.position.x + nodeWidth / 2;
      const nodeCenterY = fromNode.position.y + nodeHeight / 2;

      // 计算鼠标相对于节点中心的位置
      const deltaX = toX - nodeCenterX;
      const deltaY = toY - nodeCenterY;

      // 选择最近的边中点（只允许四个边中点：上、下、左、右）
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平距离更大，选择左右边中点
        if (deltaX > 0) {
          // 鼠标在右侧，选择右边中点
          fromX = fromNode.position.x + nodeWidth;
          fromY = fromNode.position.y + nodeHeight / 2;
        } else {
          // 鼠标在左侧，选择左边中点
          fromX = fromNode.position.x;
          fromY = fromNode.position.y + nodeHeight / 2;
        }
      } else {
        // 垂直距离更大，选择上下边中点
        if (deltaY > 0) {
          // 鼠标在下方，选择下边中点
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y + nodeHeight;
        } else {
          // 鼠标在上方，选择上边中点
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y;
        }
      }
    }

    // 临时连接线：使用简化的最小折角逻辑，起始点精确连接到源节点连接点
    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    const minGap = 20; // 最小间距
    let path: string;

    if (horizontalDistance < minGap || verticalDistance < minGap) {
      // 直连 - 起始点精确连接到源节点连接点
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      // 根据相对位置选择最优路径
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平距离更大：先水平再垂直（1个折角）
        const turnX = fromX + (toX - fromX) / 2;
        path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
      } else {
        // 垂直距离更大：先垂直再水平（1个折角）
        const turnY = fromY + (toY - fromY) / 2;
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

  // 基于垂直位置关系选择最优连接点（严格限制在四个边中点）
  const selectOptimalConnectionPoints = (
    sourceNode: StrategyNode,
    targetNode: StrategyNode,
    connection: StrategyConnection,
    sourceUsedHandles?: Set<string>,
    targetUsedHandles?: Set<string>
  ) => {
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    const targetWidth = targetNode.style?.width || 120;
    const targetHeight = targetNode.style?.height || 60;

    // 计算节点边界
    const sourceTop = sourceNode.position.y;
    const sourceBottom = sourceNode.position.y + sourceHeight;
    const sourceLeft = sourceNode.position.x;
    const sourceRight = sourceNode.position.x + sourceWidth;

    const targetTop = targetNode.position.y;
    const targetBottom = targetNode.position.y + targetHeight;
    const targetLeft = targetNode.position.x;
    const targetRight = targetNode.position.x + targetWidth;

    // 计算节点中心点
    const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
    const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
    const targetCenterX = targetNode.position.x + targetWidth / 2;
    const targetCenterY = targetNode.position.y + targetHeight / 2;

    // 计算相对位置
    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;

    let sourceX: number;
    let sourceY: number;
    let targetX: number;
    let targetY: number;
    let selectedSourceHandle: string;
    let selectedTargetHandle: string;

    // 策略改变：所有连接都动态选择连接点，不再区分连续连接和普通连接
    // 使用传入的已占用连接点集合（如果传入，说明这是按顺序处理，需要考虑已占用的连接点）
    // 如果没有传入，说明是第一次处理，不需要考虑占用情况
    const sourceNodeUsedHandles = sourceUsedHandles || new Set<string>();
    const targetNodeUsedHandles = targetUsedHandles || new Set<string>();

    // 所有节点都可能有多条连接，都需要考虑已占用的连接点
    const isSourceNodeHasOtherConnections = sourceNodeUsedHandles.size > 0;
    const isTargetNodeHasOtherConnections = targetNodeUsedHandles.size > 0;

    // 检查已保存的 handle 是否仍然符合当前节点位置关系（防止连线穿透节点）
    const validateHandleConsistency = (handle: string | undefined, isSource: boolean): boolean => {
      if (!handle) return true; // 如果没有保存的handle，允许自动选择

      // 计算节点边界
      const sourceTop = sourceNode.position.y;
      const sourceBottom = sourceNode.position.y + sourceHeight;
      const sourceLeft = sourceNode.position.x;
      const sourceRight = sourceNode.position.x + sourceWidth;

      const targetTop = targetNode.position.y;
      const targetBottom = targetNode.position.y + targetHeight;
      const targetLeft = targetNode.position.x;
      const targetRight = targetNode.position.x + targetWidth;

      // 计算节点中心点
      const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
      const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
      const targetCenterX = targetNode.position.x + targetWidth / 2;
      const targetCenterY = targetNode.position.y + targetHeight / 2;

      // 计算连接点坐标
      let handleX: number, handleY: number;
      if (isSource) {
        switch (handle) {
          case 'top': handleX = sourceCenterX; handleY = sourceTop; break;
          case 'bottom': handleX = sourceCenterX; handleY = sourceBottom; break;
          case 'left': handleX = sourceLeft; handleY = sourceCenterY; break;
          case 'right': handleX = sourceRight; handleY = sourceCenterY; break;
          default: return true;
        }
      } else {
        switch (handle) {
          case 'top': handleX = targetCenterX; handleY = targetTop; break;
          case 'bottom': handleX = targetCenterX; handleY = targetBottom; break;
          case 'left': handleX = targetLeft; handleY = targetCenterY; break;
          case 'right': handleX = targetRight; handleY = targetCenterY; break;
          default: return true;
        }
      }

      // 计算主导方向用于增强检查
      const deltaX = targetCenterX - sourceCenterX;
      const deltaY = targetCenterY - sourceCenterY;

      // 检查连接点是否会导致连线穿透节点
      // 核心逻辑：如果从该handle出发的连线方向"背离"了目标节点，则handle无效
      // 例如：源节点在上方，目标在下方，源节点的top连接点会导致连线背离目标（向上走）

      if (isSource) {
        // 检查源节点连接点：判断连接点的连线方向是否背离目标节点
        switch (handle) {
          case 'top':
            // top连接点向上，如果目标节点在源节点下方，top会导致背离
            if (targetTop > sourceTop) {
              return false; // 目标在源下方，源用top会背离
            }
            // 增强检查：如果主导方向是向下，源用top也不合理
            if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) {
              return false; // 目标主要在下方，源用top会背离主导方向
            }
            // 增强检查：如果主导方向是水平的（左右），源用垂直（上下）连接点不合理
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              return false; // 目标主要在水平方向，源用垂直连接点不合理
            }
            break;
          case 'bottom':
            // bottom连接点向下，如果目标节点在源节点上方，bottom会导致背离
            if (targetTop < sourceBottom) {
              return false; // 目标在源上方，源用bottom会背离
            }
            // 增强检查：如果主导方向是向上，源用bottom也不合理
            if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) {
              return false; // 目标主要在上方，源用bottom会背离主导方向
            }
            // 增强检查：如果主导方向是水平的（左右），源用垂直（上下）连接点不合理
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              return false; // 目标主要在水平方向，源用垂直连接点不合理
            }
            break;
          case 'left':
            // left连接点向左，如果目标节点在源节点右侧，left会导致背离
            if (targetLeft > sourceLeft) {
              return false; // 目标在源右侧，源用left会背离
            }
            // 增强检查：如果主导方向是向右，源用left也不合理
            if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) {
              return false; // 目标主要在右侧，源用left会背离主导方向
            }
            // 增强检查：如果主导方向是垂直的（上下），源用水平（左右）连接点不合理
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              return false; // 目标主要在垂直方向，源用水平连接点不合理
            }
            break;
          case 'right':
            // right连接点向右，如果目标节点在源节点左侧，right会导致背离
            if (targetRight < sourceRight) {
              return false; // 目标在源左侧，源用right会背离
            }
            // 增强检查：如果主导方向是向左，源用right也不合理
            if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) {
              return false; // 目标主要在左侧，源用right会背离主导方向
            }
            // 增强检查：如果主导方向是垂直的（上下），源用水平（左右）连接点不合理
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              return false; // 目标主要在垂直方向，源用水平连接点不合理
            }
            break;
        }
      } else {
        // 检查目标节点连接点：判断连接点的连线方向是否背离源节点
        switch (handle) {
          case 'top':
            // top连接点向上，如果源节点在目标节点下方，top会导致背离
            if (sourceTop > targetTop) {
              return false; // 源在目标下方，目标用top会背离
            }
            // 增强检查：如果主导方向是向下（源在下方），目标用top也不合理
            if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) {
              return false; // 源主要在下方，目标用top会背离主导方向
            }
            // 增强检查：如果主导方向是水平的（左右），目标用垂直（上下）连接点不合理
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              return false; // 源主要在水平方向，目标用垂直连接点不合理
            }
            break;
          case 'bottom':
            // bottom连接点向下，如果源节点在目标节点上方，bottom会导致背离
            if (sourceTop < targetBottom) {
              return false; // 源在目标上方，目标用bottom会背离
            }
            // 增强检查：如果主导方向是向上（源在上方），目标用bottom也不合理
            if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) {
              return false; // 源主要在上方，目标用bottom会背离主导方向
            }
            // 增强检查：如果主导方向是水平的（左右），目标用垂直（上下）连接点不合理
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              return false; // 源主要在水平方向，目标用垂直连接点不合理
            }
            break;
          case 'left':
            // left连接点向左，如果源节点在目标节点右侧，left会导致背离
            if (sourceLeft > targetLeft) {
              return false; // 源在目标右侧，目标用left会背离
            }
            // 增强检查：如果主导方向是向右（源在右侧），目标用left也不合理
            if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) {
              return false; // 源主要在右侧，目标用left会背离主导方向
            }
            // 增强检查：如果主导方向是垂直的（上下），目标用水平（左右）连接点不合理
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              return false; // 源主要在垂直方向，目标用水平连接点不合理
            }
            break;
          case 'right':
            // right连接点向右，如果源节点在目标节点左侧，right会导致背离
            if (sourceRight < targetRight) {
              return false; // 源在目标左侧，目标用right会背离
            }
            // 增强检查：如果主导方向是向左（源在左侧），目标用right也不合理
            if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) {
              return false; // 源主要在左侧，目标用right会背离主导方向
            }
            // 增强检查：如果主导方向是垂直的（上下），目标用水平（左右）连接点不合理
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              return false; // 源主要在垂直方向，目标用水平连接点不合理
            }
            break;
        }
      }

      return true; // handle仍然有效
    };

    // 策略改变：完全根据节点当前相对位置动态选择最优连接点
    // 这样在节点移动时，连接点会随位置变化而动态切换，所有四个连接点都可能被使用

    // 检查已保存的 handle 是否仍然有效，如果无效则清空，强制重新选择
    const savedSourceHandle = connection.sourceHandle;
    const savedTargetHandle = connection.targetHandle;

    // 验证源节点的handle是否仍然有效
    if (savedSourceHandle && !validateHandleConsistency(savedSourceHandle, true)) {
      // handle无效，清空并强制重新选择
      connection.sourceHandle = undefined;
    }

    // 验证目标节点的handle是否仍然有效
    if (savedTargetHandle && !validateHandleConsistency(savedTargetHandle, false)) {
      // handle无效，清空并强制重新选择
      connection.targetHandle = undefined;
    }

    // 判断投影重合情况（用于后续的连接点选择）
    const hasHorizontalOverlap = !(targetLeft >= sourceRight || targetRight <= sourceLeft);
    const hasVerticalOverlap = !(targetTop >= sourceBottom || targetBottom <= sourceTop);

    // 获取可用的连接点候选列表（排除已占用的连接点）
    // 所有连接都考虑已占用的连接点，优先使用理想连接点，如果被占用则选择备选
    const getAvailableHandles = (usedHandles: Set<string>) => {
      const allHandles = ['top', 'bottom', 'left', 'right'];
      return allHandles.filter(h => !usedHandles.has(h));
    };

    // 所有节点都考虑已占用的连接点，但优先使用理想连接点
    const sourceAvailableHandles = isSourceNodeHasOtherConnections
      ? getAvailableHandles(sourceNodeUsedHandles)
      : ['top', 'bottom', 'left', 'right'];
    const targetAvailableHandles = isTargetNodeHasOtherConnections
      ? getAvailableHandles(targetNodeUsedHandles)
      : ['top', 'bottom', 'left', 'right'];

    // 智能选择连接点：根据节点相对位置动态选择最优连接点
    // 辅助函数：根据位置关系选择最合适的连接点
    const selectBestAlternative = (
      idealHandles: string[],
      availableHandles: string[],
      nodePosition: 'source' | 'target',
      deltaX: number,
      deltaY: number
    ): string => {
      // 首先尝试使用理想连接点
      for (const ideal of idealHandles) {
        if (availableHandles.includes(ideal)) {
          return ideal;
        }
      }

      // 如果理想连接点不可用，根据位置关系选择最合适的备选
      if (availableHandles.length > 0) {
        // 根据deltaX和deltaY选择最合适的备选
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          // 水平主导
          if (deltaX > 0) {
            // 目标在右侧：源优先right，目标优先left
            const priority = nodePosition === 'source'
              ? ['right', 'top', 'bottom', 'left']
              : ['left', 'top', 'bottom', 'right'];
            for (const handle of priority) {
              if (availableHandles.includes(handle)) {
                return handle;
              }
            }
          } else {
            // 目标在左侧：源优先left，目标优先right
            const priority = nodePosition === 'source'
              ? ['left', 'top', 'bottom', 'right']
              : ['right', 'top', 'bottom', 'left'];
            for (const handle of priority) {
              if (availableHandles.includes(handle)) {
                return handle;
              }
            }
          }
        } else {
          // 垂直主导
          if (deltaY > 0) {
            // 目标在下方：源优先bottom，目标优先top
            const priority = nodePosition === 'source'
              ? ['bottom', 'right', 'left', 'top']
              : ['top', 'right', 'left', 'bottom'];
            for (const handle of priority) {
              if (availableHandles.includes(handle)) {
                return handle;
              }
            }
          } else {
            // 目标在上方：源优先top，目标优先bottom
            const priority = nodePosition === 'source'
              ? ['top', 'right', 'left', 'bottom']
              : ['bottom', 'right', 'left', 'top'];
            for (const handle of priority) {
              if (availableHandles.includes(handle)) {
                return handle;
              }
            }
          }
        }
      }

      // 如果所有逻辑都失败，使用第一个可用连接点
      return availableHandles.length > 0 ? availableHandles[0] : 'right';
    };

    // 根据节点相对位置动态选择连接点
    // 条件节点特殊处理：源节点连接点固定（true=right, false=left），目标节点动态选择
    if ((sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') && connection.condition) {
      // 条件节点的源连接点是固定的
      selectedSourceHandle = connection.condition === 'true' ? 'right' : 'left';

      // 根据条件节点的固定连接点计算坐标
      if (selectedSourceHandle === 'right') {
        sourceX = sourceRight;
        sourceY = sourceCenterY;
      } else {
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
      }

      // 目标节点根据位置动态选择（使用selectBestAlternative）
      if (hasVerticalOverlap) {
        // 垂直投影有重合：使用左右边中点（水平L型连接）
        if (deltaX > 0) {
          // 目标在右侧：源右侧/左侧中点 → 目标左侧中点
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          // 目标在左侧：源右侧/左侧中点 → 目标右侧中点
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else if (hasHorizontalOverlap) {
        // 水平投影有重合：使用上下边中点（垂直L型连接）
        if (deltaY > 0) {
          // 目标在下方：源右侧/左侧中点 → 目标上方中点
          selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          // 目标在上方：源右侧/左侧中点 → 目标下方中点
          selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else {
        // 完全无重合：使用对角连接
        if (deltaY > 0) {
          // 目标在下方：优先选择top
          selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          // 目标在上方：优先选择bottom
          selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      }

      // 根据选择的targetHandle计算坐标
      switch (selectedTargetHandle) {
        case 'top':
          targetX = targetCenterX;
          targetY = targetTop;
          break;
        case 'bottom':
          targetX = targetCenterX;
          targetY = targetBottom;
          break;
        case 'left':
          targetX = targetLeft;
          targetY = targetCenterY;
          break;
        case 'right':
          targetX = targetRight;
          targetY = targetCenterY;
          break;
        default:
          targetX = targetCenterX;
          targetY = targetCenterY;
      }

      return {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceHandle: selectedSourceHandle,
        targetHandle: selectedTargetHandle
      };
    }

    // 普通节点：完全根据节点相对位置动态选择连接点
    if (hasVerticalOverlap) {
      // 垂直投影有重合：使用左右边中点（水平L型连接）
      if (deltaX > 0) {
        // 目标在右侧：源右边 → 目标左边
        selectedSourceHandle = selectBestAlternative(['right'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
      } else {
        // 目标在左侧：源左边 → 目标右边
        selectedSourceHandle = selectBestAlternative(['left'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
      }
    } else if (hasHorizontalOverlap) {
      // 水平投影有重合：使用上下边中点（垂直L型连接）
      if (deltaY > 0) {
        // 目标在下方：源下边 → 目标上边
        selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
      } else {
        // 目标在上方：源上边 → 目标下边
        selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
      }
    } else {
      // 完全无重合：使用对角连接
      if (deltaY > 0) {
        // 目标在下方
        if (deltaX > 0) {
          // 目标在右下角：源下边 → 目标左边
          selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          // 目标在左下角：源下边 → 目标右边
          selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else {
        // 目标在上方
        if (deltaX > 0) {
          // 目标在右上角：源上边 → 目标左边
          selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          // 目标在左上角：源上边 → 目标右边
          selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      }
    }

    // 根据选择的 handle 计算坐标
    switch (selectedSourceHandle) {
      case 'top':
        sourceX = sourceCenterX;
        sourceY = sourceTop;
        break;
      case 'bottom':
        sourceX = sourceCenterX;
        sourceY = sourceBottom;
        break;
      case 'left':
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
        break;
      case 'right':
        sourceX = sourceRight;
        sourceY = sourceCenterY;
        break;
      default:
        sourceX = sourceCenterX;
        sourceY = sourceCenterY;
    }

    switch (selectedTargetHandle) {
      case 'top':
        targetX = targetCenterX;
        targetY = targetTop;
        break;
      case 'bottom':
        targetX = targetCenterX;
        targetY = targetBottom;
        break;
      case 'left':
        targetX = targetLeft;
        targetY = targetCenterY;
        break;
      case 'right':
        targetX = targetRight;
        targetY = targetCenterY;
        break;
      default:
        targetX = targetCenterX;
        targetY = targetCenterY;
    }

    // 所有连接都保存选择的 handle（支持动态切换和避免冲突）
    // 即使handle已存在，如果新选择的handle不同，也要更新（支持动态切换）
    // 不再在这里设置 isUpdatingHandles，由调用方控制
    if (!connection.sourceHandle || connection.sourceHandle !== selectedSourceHandle) {
      connection.sourceHandle = selectedSourceHandle;
    }
    if (!connection.targetHandle || connection.targetHandle !== selectedTargetHandle) {
      connection.targetHandle = selectedTargetHandle;
    }

    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceHandle: selectedSourceHandle,
      targetHandle: selectedTargetHandle
    };
  };

  // 直接更新连线路径 - 操作SVG DOM
  const updateConnectionPaths = () => {
    // 设置标志位防止触发watch
    isUpdatingHandles = true;
    try {
      // 第一步：收集所有连续连接的中间节点及其连接点占用情况
      const nodeHandleUsage = new Map<string, Set<string>>(); // nodeId -> Set of used handles

      // 初始化所有节点的handle使用情况
      connections.value.forEach(connection => {
        const sourceId = connection.sourceNodeId;
        const targetId = connection.targetNodeId;

        if (!nodeHandleUsage.has(sourceId)) {
          nodeHandleUsage.set(sourceId, new Set<string>());
        }
        if (!nodeHandleUsage.has(targetId)) {
          nodeHandleUsage.set(targetId, new Set<string>());
        }

        // 如果已有保存的handle，记录为已占用
        if (connection.sourceHandle) {
          nodeHandleUsage.get(sourceId)!.add(connection.sourceHandle);
        }
        if (connection.targetHandle) {
          nodeHandleUsage.get(targetId)!.add(connection.targetHandle);
        }
      });

      // 第二步：按顺序处理每个连接，对于连续连接中的节点，智能分配连接点
      connections.value.forEach(connection => {
        // 直接从 SVG DOM 读取节点位置和尺寸
        const sourceElement = document.querySelector(`[data-node-id="${connection.sourceNodeId}"]`) as SVGGElement;
        const targetElement = document.querySelector(`[data-node-id="${connection.targetNodeId}"]`) as SVGGElement;

        if (!sourceElement || !targetElement) return;

        // 从 transform 属性读取位置
        const getNodePosition = (element: SVGGElement) => {
          const transform = element.style.transform || element.getAttribute('transform') || '';
          const match = transform.match(/translate\(([^,]+)(?:px)?,\s*([^)]+)(?:px)?\)/);
          if (match) {
            return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
          }
          return { x: 0, y: 0 };
        };

        // 从 rect 元素读取尺寸
        const getNodeSize = (element: SVGGElement) => {
          // 首先尝试从 rect 元素读取
          const rectElement = element.querySelector('.node-rect') as SVGRectElement;
          if (rectElement) {
            return {
              width: parseFloat(rectElement.getAttribute('width') || '120'),
              height: parseFloat(rectElement.getAttribute('height') || '60')
            };
          }
          // 如果没有找到 rect，尝试从 circle 元素读取
          const circleElement = element.querySelector('circle') as SVGCircleElement;
          if (circleElement) {
            const radius = parseFloat(circleElement.getAttribute('r') || '28');
            return {
              width: (radius + 2) * 2, // 半径 * 2 + 边框
              height: (radius + 2) * 2
            };
          }
          // 默认值
          return { width: 120, height: 60 };
        };

        const sourcePos = getNodePosition(sourceElement);
        const targetPos = getNodePosition(targetElement);

        // 使用 nodes.value 中的实际节点数据，确保使用正确的尺寸
        const sourceNodeTemplate = nodes.value.find(n => n.id === connection.sourceNodeId);
        const targetNodeTemplate = nodes.value.find(n => n.id === connection.targetNodeId);

        const sourceNode = {
          id: connection.sourceNodeId,
          position: sourcePos,
          style: sourceNodeTemplate?.style || { width: 120, height: 60 },
          type: sourceNodeTemplate?.type,
          name: sourceNodeTemplate?.name || '',
          data: sourceNodeTemplate?.data || {}
        } as StrategyNode;

        const targetNode = {
          id: connection.targetNodeId,
          position: targetPos,
          style: targetNodeTemplate?.style || { width: 120, height: 60 },
          type: targetNodeTemplate?.type,
          name: targetNodeTemplate?.name || '',
          data: targetNodeTemplate?.data || {}
        } as StrategyNode;

        // 获取节点尺寸用于后续计算
        const sourceSize = { width: sourceNode.style?.width || 120, height: sourceNode.style?.height || 60 };
        const targetSize = { width: targetNode.style?.width || 120, height: targetNode.style?.height || 60 };

        // 使用现有的连接点选择逻辑（基于实时 DOM 数据）
        // 传入节点handle使用情况，确保连续连接使用不同的连接点
        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );

        // 更新handle使用情况（用于后续连接的分配）
        if (sourceHandle && !sourceUsedHandles.has(sourceHandle)) {
          sourceUsedHandles.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsedHandles);
        }
        if (targetHandle && !targetUsedHandles.has(targetHandle)) {
          targetUsedHandles.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsedHandles);
        }

        // 生成直角连线路径
        let path: string;

        // 判断连接点位置关系 - 使用实时 DOM 数据
        const sourceIsRight = sourceX === sourcePos.x + sourceSize.width;
        const sourceIsLeft = sourceX === sourcePos.x;
        const sourceIsTop = sourceY === sourcePos.y;
        const sourceIsBottom = sourceY === sourcePos.y + sourceSize.height;

        const targetIsRight = targetX === targetPos.x + targetSize.width;
        const targetIsLeft = targetX === targetPos.x;
        const targetIsTop = targetY === targetPos.y;
        const targetIsBottom = targetY === targetPos.y + targetSize.height;

        // 检查是否可以直连（完全水平或垂直对齐）
        const isHorizontalAligned = Math.abs(sourceY - targetY) < 5;
        const isVerticalAligned = Math.abs(sourceX - targetX) < 5;

        if (isHorizontalAligned && (sourceIsRight && targetIsLeft || sourceIsLeft && targetIsRight)) {
          // 水平直连（0个折角）- 起始点精确连接到源节点连接点
          path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        } else if (isVerticalAligned && (sourceIsTop && targetIsBottom || sourceIsBottom && targetIsTop)) {
          // 垂直直连（0个折角）- 起始点精确连接到源节点连接点
          path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        } else if (sourceIsRight && (targetIsBottom || targetIsTop)) {
          // 源右侧 → 目标下方/上方：先水平再垂直（1个折角）
          const turnX = targetX;
          path = `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
        } else if (sourceIsLeft && (targetIsBottom || targetIsTop)) {
          // 源左侧 → 目标下方/上方：先水平再垂直（1个折角）
          const turnX = targetX;
          path = `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
        } else if (sourceIsTop && (targetIsRight || targetIsLeft)) {
          // 源上方 → 目标右侧/左侧：先垂直再水平（1个折角）
          const turnY = targetY;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
        } else if (sourceIsBottom && (targetIsRight || targetIsLeft)) {
          // 源下方 → 目标右侧/左侧：先垂直再水平（1个折角）
          const turnY = targetY;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
        } else if (sourceIsRight && targetIsLeft) {
          // 源右侧 → 目标左侧：L型连接（2个折角）
          const midX = sourceX + (targetX - sourceX) / 2;
          path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else if (sourceIsLeft && targetIsRight) {
          // 源左侧 → 目标右侧：L型连接（2个折角）
          const midX = sourceX + (targetX - sourceX) / 2;
          path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else if (sourceIsTop && targetIsBottom) {
          // 源上方 → 目标下方：L型连接（2个折角）
          const midY = sourceY + (targetY - sourceY) / 2;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        } else if (sourceIsBottom && targetIsTop) {
          // 源下方 → 目标上方：L型连接（2个折角）
          const midY = sourceY + (targetY - sourceY) / 2;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        } else {
          // 默认情况：L型连接（2个折角）
          const horizontalDistance = Math.abs(targetX - sourceX);
          const verticalDistance = Math.abs(targetY - sourceY);

          if (horizontalDistance > verticalDistance) {
            // 水平距离更大：先水平再垂直
            const midX = sourceX + (targetX - sourceX) / 2;
            path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
          } else {
            // 垂直距离更大：先垂直再水平
            const midY = sourceY + (targetY - sourceY) / 2;
            path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
          }
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

        // 直接操作SVG DOM - 更新连线路径
        const connectionElement = document.querySelector(`[data-connection-id="${connection.id}"]`) as SVGPathElement;
        if (connectionElement) {
          connectionElement.setAttribute('d', path);
          connectionElement.setAttribute('stroke', color);
          connectionElement.setAttribute('marker-end', marker);
        }
      });
    } finally {
      // 延迟重置标志位，确保当前更新完全执行完成
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  };

  // 计算所有连接线的路径 - 用于初始渲染（使用 watch 确保响应式）
  const connectionPaths = ref<Array<{ id: string; path: string; color: string; marker: string; direction?: 'horizontal' | 'vertical'; isOrphaned?: boolean }>>([]);

  // 根据 handle 类型计算连接点坐标
  const getConnectionPoint = (node: StrategyNode, handle: string | undefined, defaultHandle: string) => {
    const w = node.style?.width || 120;
    const h = node.style?.height || 60;
    const handleType = handle || defaultHandle;

    switch (handleType) {
      case 'top':
        return { x: node.position.x + w / 2, y: node.position.y };
      case 'bottom':
        return { x: node.position.x + w / 2, y: node.position.y + h };
      case 'left':
        return { x: node.position.x, y: node.position.y + h / 2 };
      case 'right':
        return { x: node.position.x + w, y: node.position.y + h / 2 };
      default:
        return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
    }
  };

  // 计算单个连接路径
  const getConnectionPath = (connection: StrategyConnection): string => {
    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      console.warn('getConnectionPath: 找不到节点', connection.sourceNodeId, connection.targetNodeId);
      return '';
    }

    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;

    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;

    // 根据 sourceHandle 和 targetHandle 确定连接点，如果没有则根据默认逻辑
    const defaultSourceHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'right' : 'left')
      : (dy >= 0 ? 'bottom' : 'top');
    const defaultTargetHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'left' : 'right')
      : (dy >= 0 ? 'top' : 'bottom');

    const sourcePoint = getConnectionPoint(sourceNode, connection.sourceHandle, defaultSourceHandle);
    const targetPoint = getConnectionPoint(targetNode, connection.targetHandle, defaultTargetHandle);

    const sourceX = sourcePoint.x;
    const sourceY = sourcePoint.y;
    const targetX = targetPoint.x;
    const targetY = targetPoint.y;

    // 检查连接点是否有效
    if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
      console.error('getConnectionPath: 连接点坐标无效', { sourcePoint, targetPoint, connection });
      return '';
    }

    const offset = connectionOffsetY[connection.id] || 0;

    // 根据 sourceHandle 和 targetHandle 的类型来确定路径生成策略
    const sourceHandle = connection.sourceHandle || defaultSourceHandle;
    const targetHandle = connection.targetHandle || defaultTargetHandle;

    // 判断连接点的类型组合
    const isSourceVertical = sourceHandle === 'top' || sourceHandle === 'bottom';
    const isTargetVertical = targetHandle === 'top' || targetHandle === 'bottom';
    const isSourceHorizontal = sourceHandle === 'left' || sourceHandle === 'right';
    const isTargetHorizontal = targetHandle === 'left' || targetHandle === 'right';

    // 根据实际连接点位置判断主导方向
    const actualDx = targetX - sourceX;
    const actualDy = targetY - sourceY;

    // 如果两个连接点都是垂直的（top/bottom），使用垂直双L连接
    if (isSourceVertical && isTargetVertical) {
      const midY = ((sourceY + targetY) / 2) + offset;
      const midX = (sourceX + targetX) / 2;

      // 如果 sourceX === targetX 且 offset === 0，是直线（无折角）
      if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
        // 直线：起点 -> 终点（2个点，0个折角，1个中点手柄）
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, connection });
          return '';
        }
        return path;
      } else {
        // 垂直双L：起点 -> (sourceX, midY) -> (targetX, midY) -> 终点（4个点，2个折角，3个中点手柄）
        const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, midY, connection });
          return '';
        }
        return path;
      }
    }
    // 如果两个连接点都是水平的（left/right），使用水平双L连接
    else if (isSourceHorizontal && isTargetHorizontal) {
      // 如果 sourceY === targetY 且 offset === 0，是直线（无折角）
      if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
        // 直线：起点 -> 终点（2个点，0个折角，1个中点手柄）
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, connection });
          return '';
        }
        return path;
      } else {
        const midX = sourceX + (targetX - sourceX) / 2;
        // 水平双L：起点 -> (midX, sourceY) -> (midX, targetY) -> 终点（4个点，2个折角，3个中点手柄）
        const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, midX, connection });
          return '';
        }
        return path;
      }
    }
    // 混合类型（一个垂直，一个水平），根据主导方向决定
    else {
      if (Math.abs(actualDx) >= Math.abs(actualDy)) {
        // 水平主导
        const midX = sourceX + (targetX - sourceX) / 2;
        const midY = ((sourceY + targetY) / 2) + offset;

        // 如果是直线（sourceY === targetY 且 offset === 0），无折角
        if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
          // 直线：起点 -> 终点（2个点，0个折角，1个中点手柄）
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, connection });
            return '';
          }
          return path;
        } else {
          // 水平双L角：起点 -> (midX, sourceY) -> (midX, targetY) -> 终点（4个点，2个折角，3个中点手柄）
          const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, midX, connection });
            return '';
          }
          return path;
        }
      } else {
        // 垂直主导
        const midY = ((sourceY + targetY) / 2) + offset;
        const midX = (sourceX + targetX) / 2;

        // 如果是直线（sourceX === targetX 且 offset === 0），无折角
        if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
          // 直线：起点 -> 终点（2个点，0个折角，1个中点手柄）
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, connection });
            return '';
          }
          return path;
        } else {
          // 垂直双L角：起点 -> (sourceX, midY) -> (targetX, midY) -> 终点（4个点，2个折角，3个中点手柄）
          const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            console.error('getConnectionPath: 路径无效', { sourceX, sourceY, targetX, targetY, midY, connection });
            return '';
          }
          return path;
        }
      }
    }
  };

  // 辅助函数：计算单个连接路径的颜色和标记
  const computeConnectionStyle = (connection: StrategyConnection) => {
    // 计算颜色 - 动态获取主题颜色
    const getThemeColor = (cssVar: string) => {
      if (typeof window !== 'undefined') {
        const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return color || '#ffffff';
      }
      return '#ffffff';
    };

    const isDarkTheme = getThemeColor('--el-color-white') === '#ffffff' &&
                       getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').includes('dark');

    // 优先使用连接样式中的颜色，否则使用主题主色（更明显）
    const color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-color-primary'));

    // 计算箭头标记
    let marker = 'url(#arrowhead-default)';
    if (connection.condition === 'true') {
      marker = 'url(#arrowhead-true)';
    } else if (connection.condition === 'false') {
      marker = 'url(#arrowhead-false)';
    }

    return { color, marker };
  };

  // 计算连线方向（用于动态设置光标）
  // 根据实际路径的主要线段方向判断，而不是起点到终点的总方向
  const getConnectionDirection = (connection: StrategyConnection, pathString?: string): 'horizontal' | 'vertical' => {
    // 优先使用传入的路径字符串，如果没有则生成
    let path = pathString;
    if (!path) {
      path = getConnectionPath(connection);
    }

    if (path) {
      // 解析路径的所有线段
      const firstMove = path.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
      if (firstMove) {
        const allLines = path.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
        const lines = Array.from(allLines);

        if (lines.length > 0) {
          // 计算所有线段的水平和垂直长度
          let totalHorizontalLength = 0;
          let totalVerticalLength = 0;

          let prevX = parseFloat(firstMove[1]);
          let prevY = parseFloat(firstMove[2]);

          for (const line of lines) {
            const x = parseFloat(line[1]);
            const y = parseFloat(line[2]);

            const dx = Math.abs(x - prevX);
            const dy = Math.abs(y - prevY);

            totalHorizontalLength += dx;
            totalVerticalLength += dy;

            prevX = x;
            prevY = y;
          }

          // 根据主要线段方向判断
          const direction = totalHorizontalLength >= totalVerticalLength ? 'horizontal' : 'vertical';
          return direction;
        }
      }
    }

    // 回退：根据节点位置判断
    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);
    if (!sourceNode || !targetNode) return 'horizontal';

    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;

    const dx = Math.abs(txCenter - sxCenter);
    const dy = Math.abs(tyCenter - syCenter);

    const direction = dx >= dy ? 'horizontal' : 'vertical';
    return direction;
  };

  // 标志位：防止在 watch 回调中修改 connections 导致递归更新
  let isUpdatingHandles = false;

  // 用于延迟重置标志位的定时器
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  // 处理悬空连线（一端节点缺失的情况）
  const handleOrphanedConnection = (
    connection: StrategyConnection,
    sourceNode: StrategyNode | undefined,
    targetNode: StrategyNode | undefined,
    connectionOffsetY: Record<string, number>
  ): { id: string; path: string; color: string; marker: string; direction: 'horizontal' | 'vertical'; isOrphaned: boolean } => {
    const offset = connectionOffsetY[connection.id] || 0;
    let fromX: number, fromY: number, toX: number, toY: number;

    if (sourceNode && !targetNode) {
      // 仅有源节点，需要计算当前源节点连接点，并使用保存的目标位置
      if (!connection.lastTargetX || !connection.lastTargetY) {
        // 如果没有保存的目标位置信息，返回空路径
        return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
      }

      // 计算源节点的当前连接点位置
      const sourceWidth = sourceNode.style?.width || 120;
      const sourceHeight = sourceNode.style?.height || 60;

      // 直接使用sourceHandle计算当前源节点连接点
      const handle = connection.sourceHandle || 'bottom';
      switch (handle) {
        case 'top':
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y;
          break;
        case 'bottom':
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
          break;
        case 'left':
          fromX = sourceNode.position.x;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        case 'right':
          fromX = sourceNode.position.x + sourceWidth;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        default:
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
      }

      toX = connection.lastTargetX;
      toY = connection.lastTargetY;
    } else if (!sourceNode && targetNode) {
      // 仅有目标节点，使用保存的源位置，计算目标节点当前连接点
      if (!connection.lastSourceX || !connection.lastSourceY) {
        // 如果没有保存的源位置信息，返回空路径
        return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
      }

      fromX = connection.lastSourceX;
      fromY = connection.lastSourceY;

      // 计算目标节点的当前连接点位置
      const targetWidth = targetNode.style?.width || 120;
      const targetHeight = targetNode.style?.height || 60;

      // 直接使用targetHandle计算当前目标节点连接点
      const handle = connection.targetHandle || 'top';
      switch (handle) {
        case 'top':
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
          break;
        case 'bottom':
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y + targetHeight;
          break;
        case 'left':
          toX = targetNode.position.x;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        case 'right':
          toX = targetNode.position.x + targetWidth;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        default:
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
      }
    } else {
      // 两端都不存在
      return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
    }

    // 优先使用保存的路径结构（保持原形状），否则使用简化逻辑生成路径
    let path: string;
    if (connection.lastPath) {
      // 如果有保存的路径，先解析出原始起点和终点的坐标
      // 然后根据新的fromX/Y和toX/Y，应用相同的路径结构
      const pathMatch = connection.lastPath.match(/^M\s+([\d.]+)\s+([\d.]+)(.*)/);
      if (pathMatch) {
        const oldStartX = parseFloat(pathMatch[1]);
        const oldStartY = parseFloat(pathMatch[2]);
        const oldPathRest = pathMatch[3];

        // 计算缩放和平移的偏移量
        const deltaX = fromX - oldStartX;
        const deltaY = fromY - oldStartY;

        // 解析保存的路径中最后一点的坐标
        const pathPoints = oldPathRest.match(/L\s+([\d.]+)\s+([\d.]+)/g);
        if (pathPoints && pathPoints.length > 0) {
          const lastPoint = pathPoints[pathPoints.length - 1];
          const lastPointMatch = lastPoint.match(/L\s+([\d.]+)\s+([\d.]+)/);
          if (lastPointMatch) {
            const oldEndX = parseFloat(lastPointMatch[1]);
            const oldEndY = parseFloat(lastPointMatch[2]);

            // 计算终点相对于起点的偏移量
            const oldRelEndX = oldEndX - oldStartX;
            const oldRelEndY = oldEndY - oldStartY;

            // 计算实际的终点偏移量
            const newRelEndX = toX - fromX;
            const newRelEndY = toY - fromY;

            // 计算缩放比例（如果原始路径不是直线）
            const scaleX = oldRelEndX !== 0 ? newRelEndX / oldRelEndX : 1;
            const scaleY = oldRelEndY !== 0 ? newRelEndY / oldRelEndY : 1;

            // 重新构建路径，应用新的起点和变换后的中间点
            let newPath = `M ${fromX} ${fromY}`;
            pathPoints.forEach((point, index) => {
              const pointMatch = point.match(/L\s+([\d.]+)\s+([\d.]+)/);
              if (pointMatch) {
                let x = parseFloat(pointMatch[1]);
                let y = parseFloat(pointMatch[2]);

                // 转换相对坐标
                const relX = x - oldStartX;
                const relY = y - oldStartY;

                // 应用缩放和平移
                x = fromX + relX * scaleX;
                y = fromY + relY * scaleY;

                newPath += ` L ${x} ${y}`;
              }
            });

            path = newPath;
          } else {
            // 无法解析，回退到简化逻辑
            const horizontalDistance = Math.abs(toX - fromX);
            const verticalDistance = Math.abs(toY - fromY);
            const minGap = 20;

            if (horizontalDistance < minGap || verticalDistance < minGap) {
              path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
            } else {
              const deltaX = toX - fromX;
              const deltaY = toY - fromY;

              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                const turnX = fromX + (toX - fromX) / 2;
                path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
              } else {
                const turnY = fromY + (toY - fromY) / 2;
                path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
              }
            }
          }
        } else {
          // 无法解析，回退到简化逻辑
          const horizontalDistance = Math.abs(toX - fromX);
          const verticalDistance = Math.abs(toY - fromY);
          const minGap = 20;

          if (horizontalDistance < minGap || verticalDistance < minGap) {
            path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
          } else {
            const deltaX = toX - fromX;
            const deltaY = toY - fromY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              const turnX = fromX + (toX - fromX) / 2;
              path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
            } else {
              const turnY = fromY + (toY - fromY) / 2;
              path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
            }
          }
        }
      } else {
        // 无法解析，回退到简化逻辑
        const horizontalDistance = Math.abs(toX - fromX);
        const verticalDistance = Math.abs(toY - fromY);
        const minGap = 20;

        if (horizontalDistance < minGap || verticalDistance < minGap) {
          path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
          const deltaX = toX - fromX;
          const deltaY = toY - fromY;

          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const turnX = fromX + (toX - fromX) / 2;
            path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
          } else {
            const turnY = fromY + (toY - fromY) / 2;
            path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
          }
        }
      }
    } else {
      // 如果没有保存的路径，使用简化逻辑生成
      const horizontalDistance = Math.abs(toX - fromX);
      const verticalDistance = Math.abs(toY - fromY);
      const minGap = 20; // 最小间距

      if (horizontalDistance < minGap || verticalDistance < minGap) {
        // 直连
        path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      } else {
        // 根据相对位置选择最优路径
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 水平距离更大：先水平再垂直（1个折角）
          const turnX = fromX + (toX - fromX) / 2;
          path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
        } else {
          // 垂直距离更大：先垂直再水平（1个折角）
          const turnY = fromY + (toY - fromY) / 2;
          path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
        }
      }
    }

    const color = getConnectionColor(connection);
    const marker = getConnectionMarker(connection);
    const direction: 'horizontal' | 'vertical' = Math.abs(toX - fromX) >= Math.abs(toY - fromY) ? 'horizontal' : 'vertical';

    return { id: connection.id, path, color, marker, direction, isOrphaned: true };
  };

  // watch connections、nodes 和 connectionOffsetY 变化，重新计算连接路径
  watch([connections, nodes, connectionOffsetY], () => {
    // 如果正在更新 handles，跳过本次 watch 以避免递归
    if (isUpdatingHandles) {
      return;
    }
    // 第一步：初始化所有节点的handle使用情况映射
    // 这次不预先记录已保存的handle，因为我们要完全动态选择
    // 所有的连接点选择都基于节点当前相对位置动态选择
    const nodeHandleUsage = new Map<string, Set<string>>(); // nodeId -> Set of used handles

    // 初始化所有节点的handle使用情况（初始为空，在按顺序处理时逐步填充）
    connections.value.forEach(connection => {
      const sourceId = connection.sourceNodeId;
      const targetId = connection.targetNodeId;

      if (!nodeHandleUsage.has(sourceId)) {
        nodeHandleUsage.set(sourceId, new Set<string>());
      }
      if (!nodeHandleUsage.has(targetId)) {
        nodeHandleUsage.set(targetId, new Set<string>());
      }
    });

    // 统一设置标志位，避免在map内部多次设置导致混乱
    isUpdatingHandles = true;
    try {
      // 第二步：按连接在数组中的顺序（index）处理每个连接，智能分配连接点
      // 先处理的连接（index较小的）优先选择理想连接点（基于位置动态选择）
      // 后处理的连接需要考虑已占用的连接点，但仍然根据位置动态选择最优的可用连接点
      // 这样确保了优先级：先处理的连接优先选择理想连接点，后处理的连接避免冲突
      connectionPaths.value = connections.value.map((connection, connectionIndex) => {
        const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
        const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

        // 处理悬空连线（一端或两端节点缺失）
        if (!sourceNode && !targetNode) {
          // 两端都不存在，返回空路径
          return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
        } else if (!sourceNode) {
          // 仅源节点缺失，从最后已知的源位置到目标节点
          return handleOrphanedConnection(connection, undefined, targetNode, connectionOffsetY);
        } else if (!targetNode) {
          // 仅目标节点缺失，从源节点到最后已知的目标位置
          return handleOrphanedConnection(connection, sourceNode, undefined, connectionOffsetY);
        }

        // 获取当前节点的已占用连接点（基于之前已处理的连接，即index < connectionIndex的连接）
        // 这确保了按index顺序处理，先处理的连接优先选择理想连接点
        // 对于第一个连接（connectionIndex === 0），sourceUsedHandles和targetUsedHandles都是空Set
        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();

        // 使用智能连接点分配逻辑
        // 传入已占用的连接点，让selectOptimalConnectionPoints在选择时考虑这些占用
        // selectOptimalConnectionPoints会根据位置动态选择最优连接点，如果理想连接点被占用，会选择最合适的备选
        const connectionPoints = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = connectionPoints;

        // 更新handle使用情况（用于后续连接的分配）
        // 这样后续连接的index较大，会看到当前连接占用的连接点
        // 这确保了优先级：先处理的连接优先选择理想连接点，后处理的连接避免冲突
        if (sourceHandle) {
          const sourceUsed = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
          sourceUsed.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsed);
        }
        if (targetHandle) {
          const targetUsed = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();
          targetUsed.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsed);
        }

        // 保存分配的handle（仅在值实际改变时更新，避免触发递归）
        // 不在map内部设置标志位，而是在watch外层统一设置
        if (sourceHandle !== undefined && connection.sourceHandle !== sourceHandle) {
          connection.sourceHandle = sourceHandle;
        }
        if (targetHandle !== undefined && connection.targetHandle !== targetHandle) {
          connection.targetHandle = targetHandle;
        }

        // 使用分配的连接点坐标直接生成路径（避免getConnectionPath的重复计算）
        const offset = connectionOffsetY[connection.id] || 0;

        // 判断连接点的位置关系
        const sourceIsRight = sourceX === sourceNode.position.x + (sourceNode.style?.width || 120);
        const sourceIsLeft = sourceX === sourceNode.position.x;
        const sourceIsTop = sourceY === sourceNode.position.y;
        const sourceIsBottom = sourceY === sourceNode.position.y + (sourceNode.style?.height || 60);

        const targetIsRight = targetX === targetNode.position.x + (targetNode.style?.width || 120);
        const targetIsLeft = targetX === targetNode.position.x;
        const targetIsTop = targetY === targetNode.position.y;
        const targetIsBottom = targetY === targetNode.position.y + (targetNode.style?.height || 60);

        // 生成路径（使用与updateConnectionPaths相同的逻辑）
        let path: string;
        const isHorizontalAligned = Math.abs(sourceY - targetY) < 5;
        const isVerticalAligned = Math.abs(sourceX - targetX) < 5;

        if (isHorizontalAligned && (sourceIsRight && targetIsLeft || sourceIsLeft && targetIsRight)) {
          path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        } else if (isVerticalAligned && (sourceIsTop && targetIsBottom || sourceIsBottom && targetIsTop)) {
          path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        } else if (sourceIsRight && (targetIsBottom || targetIsTop)) {
          const turnX = targetX;
          path = `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
        } else if (sourceIsLeft && (targetIsBottom || targetIsTop)) {
          const turnX = targetX;
          path = `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
        } else if (sourceIsTop && (targetIsRight || targetIsLeft)) {
          const turnY = targetY;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
        } else if (sourceIsBottom && (targetIsRight || targetIsLeft)) {
          const turnY = targetY;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
        } else if (sourceIsRight && targetIsLeft) {
          const midX = sourceX + (targetX - sourceX) / 2;
          path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else if (sourceIsLeft && targetIsRight) {
          const midX = sourceX + (targetX - sourceX) / 2;
          path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        } else if (sourceIsTop && targetIsBottom) {
          const midY = sourceY + (targetY - sourceY) / 2;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        } else if (sourceIsBottom && targetIsTop) {
          const midY = sourceY + (targetY - sourceY) / 2;
          path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        } else {
          const horizontalDistance = Math.abs(targetX - sourceX);
          const verticalDistance = Math.abs(targetY - sourceY);
          if (horizontalDistance > verticalDistance) {
            const midX = sourceX + (targetX - sourceX) / 2;
            path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
          } else {
            const midY = sourceY + (targetY - sourceY) / 2;
            path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
          }
        }

        if (!path || !path.trim()) {
          return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const };
        }

        // 保存连接点坐标和路径（用于悬空连线渲染）
        connection.lastSourceX = sourceX;
        connection.lastSourceY = sourceY;
        connection.lastTargetX = targetX;
        connection.lastTargetY = targetY;
        connection.lastPath = path; // 保存完整的路径字符串

        const { color, marker } = computeConnectionStyle(connection);
        const direction = getConnectionDirection(connection, path);
        const result = { id: connection.id, path: path || '', color, marker, direction };
        return result;
      });
    } finally {
      // 延迟重置标志位，确保当前 watch 回调完全执行完成
      // 清除之前的定时器（如果有）
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      // 使用 setTimeout 0 确保在下一个事件循环中重置
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  }, { deep: true, immediate: true, flush: 'post' });

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
    connectionOffsetY,
    getConnectionColor,
    getConnectionMarker,
    handleConnectionStart,
    clearConnections,
    updateConnectionPaths
  };
}
