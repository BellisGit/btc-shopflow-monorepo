import { ref, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { StrategyNode, NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';

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
      [NodeTypeEnum.START]: '#67c23a',
      [NodeTypeEnum.END]: '#f56c6c',
      [NodeTypeEnum.CONDITION]: '#e6a23c',
      [NodeTypeEnum.ACTION]: '#409eff',
      [NodeTypeEnum.DECISION]: '#909399',
      [NodeTypeEnum.GATEWAY]: '#9c27b0'
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
        height: 60,
        backgroundColor: getNodeColor(component.type),
        borderColor: getNodeColor(component.type)
      },
      textConfig: {
        fontSize: 16,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal'
      }
    };

    nodes.value.push(newNode);

    // Delay to ensure DOM is ready and all components are fully rendered
    await nextTick();

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

  // 更新节点
  const updateNode = (nodeId: string, updates: Partial<StrategyNode>) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  };

  // 获取节点样式（SVG 版本）
  const getNodeStyle = (node: StrategyNode) => {
    // SVG 节点不需要返回样式，位置通过 transform 属性处理
    return {};
  };

  // 获取节点图标
  const getNodeIcon = (type: NodeType): string => {
    const iconMap: Record<NodeType, string> = {
      [NodeTypeEnum.START]: 'VideoPlay',
      [NodeTypeEnum.END]: 'VideoPause',
      [NodeTypeEnum.CONDITION]: 'QuestionFilled',
      [NodeTypeEnum.ACTION]: 'Lightning',
      [NodeTypeEnum.DECISION]: 'Share',
      [NodeTypeEnum.GATEWAY]: 'Connection'
    };
    return iconMap[type] || 'Lightning';
  };

  // 获取输出连接点样式类
  const getOutputConnectionClass = (node: StrategyNode) => {
    if (node.type === 'CONDITION') {
      return 'conditional';
    }
    return '';
  };

  // 拖拽状态
  const isDragging = ref(false);
  const draggingNodeId = ref<string | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const dragStartPosition = ref({ x: 0, y: 0 });

  // 处理节点鼠标按下
  const handleNodeMouseDown = (event: MouseEvent, node: StrategyNode, isEditingText = false) => {
    // 如果正在编辑文本，不启动拖拽
    if (isEditingText) {
      return;
    }

    // 检查点击的是否是连接点
    const target = event.target as HTMLElement;
    if (target.classList.contains('connection-point')) {
      // 如果是连接点，不阻止事件冒泡，让连接点处理
      return;
    }

    event.stopPropagation();
    selectNode(node.id);

    // 设置拖拽状态
    isDragging.value = true;
    draggingNodeId.value = node.id;
    dragStartPosition.value = { x: node.position.x, y: node.position.y };

    // 开始拖拽移动
    const startX = event.clientX;
    const startY = event.clientY;
    const startNodeX = node.position.x;
    const startNodeY = node.position.y;

    let animationFrameId: number | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 取消之前的动画帧
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // 使用 requestAnimationFrame 确保流畅的更新
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        // 直接更新节点位置（SVG 版本）
        const newPosition = {
          x: Math.max(0, startNodeX + deltaX),
          y: Math.max(0, startNodeY + deltaY)
        };

        // 使用 moveNode 方法确保响应式更新
        moveNode(node.id, newPosition);

        animationFrameId = null;
      });
    };

    const handleMouseUp = () => {
      // 取消动画帧
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // 清除拖拽状态
      isDragging.value = false;
      draggingNodeId.value = null;
      dragOffset.value = { x: 0, y: 0 };
      dragStartPosition.value = { x: 0, y: 0 };

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    // 状态
    nodes,
    selectedNodeId,
    selectedNode,
    isDragging,
    draggingNodeId,
    dragOffset,
    dragStartPosition,

    // 方法
    addNode,
    selectNode,
    moveNode,
    updateNodeProperties,
    updateNode,
    deleteNode,
    clearNodes,
    generateId,
    getNodeColor,
    getNodeStyle,
    getNodeIcon,
    getOutputConnectionClass,
    handleNodeMouseDown
  };
}
