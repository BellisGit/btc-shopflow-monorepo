import { ref, computed } from 'vue';
import type { NodeType } from '@/types/strategy';
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
          type: 'START' as NodeType,
          name: '开始',
          description: '流程开始节点',
          icon: VideoPlay
        },
        {
          type: 'END' as NodeType,
          name: '结束',
          description: '流程结束节点',
          icon: VideoPause
        },
        {
          type: 'CONDITION' as NodeType,
          name: '条件',
          description: '条件判断节点',
          icon: QuestionFilled
        },
        {
          type: 'ACTION' as NodeType,
          name: '动作',
          description: '执行动作节点',
          icon: Lightning
        }
      ]
    },
    {
      name: 'advanced',
      title: '高级组件',
      components: [
        {
          type: 'DECISION' as NodeType,
          name: '决策',
          description: '多路决策节点',
          icon: Share
        },
        {
          type: 'GATEWAY' as NodeType,
          name: '网关',
          description: '流程网关节点',
          icon: Connection
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
      event.dataTransfer.effectAllowed = 'copy';

      // 创建自定义拖拽图像，避免浏览器生成可能包含label元素的默认图像
      const dragImage = document.createElement('div');
      dragImage.innerHTML = `
        <div style="
          padding: 8px 12px;
          background: #409eff;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          ${component.name}
        </div>
      `;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.pointerEvents = 'none';
      document.body.appendChild(dragImage);

      event.dataTransfer.setDragImage(dragImage, 0, 0);

      // 延迟清理临时元素，确保拖拽操作完成
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 100);
    }
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

  return {
    // 状态
    componentSearch,
    activeCategories,
    componentCategories,
    filteredComponentCategories,

    // 方法
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData
  };
}
