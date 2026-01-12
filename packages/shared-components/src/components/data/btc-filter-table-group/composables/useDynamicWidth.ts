/**
 * 动态宽度计算 composable
 * 
 * 功能：
 * 1. 根据实际渲染的列数计算左侧宽度
 * 2. 考虑列数、列宽、容器宽度等因素
 * 3. 支持最小/最大宽度限制
 */

import { ref, watch, nextTick, type Ref } from 'vue';

/**
 * 动态宽度计算选项
 */
export interface DynamicWidthOptions {
  /**
   * 最小宽度（像素）
   */
  minWidth: number;

  /**
   * 最大宽度（像素）
   */
  maxWidth: number;

  /**
   * 基准宽度配置
   */
  baseWidths: { small: number; default: number; large: number };

  /**
   * 是否启用自动宽度调整
   */
  enabled: boolean;
}

/**
 * 动态宽度计算
 * 
 * @param tableRef 表格组件引用
 * @param containerRef 容器引用
 * @param options 配置选项
 * @returns 动态宽度和计算函数
 */
export function useDynamicWidth(
  tableRef: Ref<any>,
  containerRef: Ref<HTMLElement | undefined>,
  options: DynamicWidthOptions
) {
  const dynamicWidth = ref<string>('');
  
  /**
   * 计算宽度
   */
  const calculateWidth = () => {
    if (!options.enabled || !tableRef.value || !containerRef.value) {
      return;
    }
    
    try {
      // 获取表格实际渲染的列数
      // BtcTable 暴露了 columns 属性，可以通过它获取列数
      const visibleColumns = tableRef.value?.columns || [];
      const columnCount = Array.isArray(visibleColumns) ? visibleColumns.length : 0;
      
      // 如果无法获取列数，使用默认宽度
      if (columnCount === 0) {
        dynamicWidth.value = `${options.baseWidths.default}px`;
        return;
      }
      
      // 获取容器宽度
      const containerWidth = containerRef.value.offsetWidth;
      
      // 如果容器宽度无效，使用默认宽度
      if (!containerWidth || containerWidth <= 0) {
        dynamicWidth.value = `${options.baseWidths.default}px`;
        return;
      }
      
      // 估算每列的平均宽度（可以根据实际列宽计算）
      const avgColumnWidth = 150; // 可以根据实际情况调整
      const estimatedTableWidth = columnCount * avgColumnWidth;
      
      // 计算可用宽度（容器宽度 - 右侧最小宽度）
      const minRightWidth = 400; // 右侧最小宽度
      const availableWidth = containerWidth - minRightWidth;
      
      // 根据列数计算左侧宽度
      // 注意：要明确区分 small (200px) 和 default (300px)
      // 列数越多，左侧宽度越小，以便为表格留出更多空间
      let calculatedWidth: number;
      
      if (columnCount <= 3) {
        // 列数很少（<= 3），可以突破 large（450px），但不超过 maxWidth
        calculatedWidth = Math.min(
          options.maxWidth,
          Math.max(options.baseWidths.large, availableWidth * 0.4)
        );
      } else if (columnCount <= 5) {
        // 列数中等（4-5），使用 large (450px)
        calculatedWidth = options.baseWidths.large;
      } else if (columnCount <= 6) {
        // 列数较多（6），使用 default (300px)
        calculatedWidth = options.baseWidths.default;
      } else if (columnCount <= 8) {
        // 列数很多（7-8），使用 small (200px)
        calculatedWidth = options.baseWidths.small;
      } else {
        // 列数非常多（>= 9），使用 small (200px)，但确保不小于 minWidth
        calculatedWidth = Math.max(options.baseWidths.small, options.minWidth);
      }
      
      // 确保在最小和最大宽度范围内
      calculatedWidth = Math.max(
        options.minWidth,
        Math.min(options.maxWidth, calculatedWidth)
      );
      
      dynamicWidth.value = `${calculatedWidth}px`;
    } catch (error) {
      console.warn('[BtcFilterTableGroup] 动态宽度计算失败:', error);
      // 计算失败时使用默认宽度
      dynamicWidth.value = `${options.baseWidths.default}px`;
    }
  };
  
  // 监听表格列变化、容器宽度变化等
  watch(
    [tableRef, containerRef],
    () => {
      nextTick(() => {
        // 使用 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
          calculateWidth();
        });
      });
    },
    { deep: true, immediate: true }
  );
  
  // 监听窗口大小变化
  let cleanup: (() => void) | undefined;
  
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      calculateWidth();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数（在组件卸载时调用）
    cleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
  }
  
  return {
    dynamicWidth,
    calculateWidth,
    cleanup
  };
}
