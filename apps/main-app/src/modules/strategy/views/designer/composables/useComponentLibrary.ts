import { ref, computed, markRaw } from 'vue';
import type { NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';
import {
  VideoPlay,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection
} from '@element-plus/icons-vue';

/**
 * 组件库管理
 */
export function useComponentLibrary() {
  // 搜索状态
  const componentSearch = ref('');
  const activeCategories = ref(['basic']);

  // 组件库配置
  const componentCategories = [
    {
      name: 'basic',
      title: '基础组件',
      components: [
        {
          type: NodeTypeEnum.START,
          name: '开始',
          description: '流程开始节点',
          icon: markRaw(VideoPlay)
        },
        {
          type: NodeTypeEnum.END,
          name: '结束',
          description: '流程结束节点',
          icon: markRaw(VideoPause)
        },
        {
          type: NodeTypeEnum.CONDITION,
          name: '条件',
          description: '条件判断节点',
          icon: markRaw(QuestionFilled)
        },
        {
          type: NodeTypeEnum.ACTION,
          name: '动作',
          description: '执行动作节点',
          icon: markRaw(Lightning)
        }
      ]
    },
    {
      name: 'advanced',
      title: '高级组件',
      components: [
        {
          type: NodeTypeEnum.DECISION,
          name: '决策',
          description: '多路决策节点',
          icon: markRaw(Share)
        },
        {
          type: NodeTypeEnum.GATEWAY,
          name: '网关',
          description: '流程网关节点',
          icon: markRaw(Connection)
        }
      ]
    }
  ];

  // 过滤后的组件分类
  const filteredComponentCategories = computed(() => {
    if (!componentSearch.value) return componentCategories;

    return componentCategories.map(category => ({
      ...category,
      components: category.components.filter(comp =>
        comp.name.includes(componentSearch.value) ||
        comp.description.includes(componentSearch.value)
      )
    })).filter(category => category.components.length > 0);
  });

  // 拖拽处理
  const handleComponentDragStart = (event: DragEvent, component: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(component));
      event.dataTransfer.setData('component-type', component.type);
      event.dataTransfer.effectAllowed = 'copy';

      // 创建自定义拖拽图像 - 使用实际组件大小
      const dragImage = document.createElement('canvas');
      dragImage.width = 120;
      dragImage.height = 60;
      const ctx = dragImage.getContext('2d');

      if (ctx) {
        // 绘制组件背景
        const fillColor = getNodeFillColor(component.type);
        const strokeColor = getNodeStrokeColor(component.type);
        const textColor = getNodeTextColor(component.type);

        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, 120, 60);

        // 绘制边框
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 118, 58);

        // 绘制文本
        ctx.fillStyle = textColor;
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getNodeText(component.type), 60, 30);
      }

      event.dataTransfer.setDragImage(dragImage, 60, 30); // 使用组件中心作为拖拽点
    }
  };

  // 获取节点填充颜色
  const getNodeFillColor = (type: NodeType): string => {
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

  // 获取节点边框颜色
  const getNodeStrokeColor = (type: NodeType): string => {
    return getNodeFillColor(type);
  };

  // 获取节点文本颜色
  const getNodeTextColor = (type: NodeType): string => {
    return '#ffffff';
  };

  // 获取节点文本
  const getNodeText = (type: NodeType): string => {
    const textMap = {
      [NodeTypeEnum.START]: '开始',
      [NodeTypeEnum.END]: '结束',
      [NodeTypeEnum.CONDITION]: '条件',
      [NodeTypeEnum.ACTION]: '动作',
      [NodeTypeEnum.DECISION]: '决策',
      [NodeTypeEnum.GATEWAY]: '网关'
    };
    return textMap[type] || '节点';
  };

  const handleCanvasDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const parseDropData = (event: DragEvent) => {
    if (!event.dataTransfer) return null;

    try {
      return JSON.parse(event.dataTransfer.getData('application/json'));
    } catch (error) {
      console.error('Failed to parse drop data:', error);
      return null;
    }
  };

  // 扁平化的组件库（用于弹窗选择）
  const componentLibrary = computed(() => {
    return componentCategories.flatMap(category => category.components);
  });

  return {
    // 状态
    componentSearch,
    activeCategories,
    componentCategories,
    filteredComponentCategories,
    componentLibrary,

    // 方法
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData
  };
}
