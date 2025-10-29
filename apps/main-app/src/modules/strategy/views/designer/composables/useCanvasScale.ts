import { ref, computed } from 'vue';

/**
 * 画布缩放管理
 */
export function useCanvasScale() {
  // 缩放状态
  const canvasScale = ref(1);
  const minScale = ref(0.1);
  const maxScale = ref(3);
  const scaleStep = ref(0.1);

  // 计算属性
  const scalePercentage = computed(() => {
    return Math.round(canvasScale.value * 100) + '%';
  });

  // 缩放方法
  const handleZoomIn = () => {
    if (canvasScale.value < maxScale.value) {
      canvasScale.value = Math.min(
        canvasScale.value + scaleStep.value,
        maxScale.value
      );
    }
  };

  const handleZoomOut = () => {
    if (canvasScale.value > minScale.value) {
      canvasScale.value = Math.max(
        canvasScale.value - scaleStep.value,
        minScale.value
      );
    }
  };

  const handleFitToScreen = () => {
    // 适应屏幕逻辑
    canvasScale.value = 1;
  };

  const setScale = (scale: number) => {
    canvasScale.value = Math.max(
      minScale.value,
      Math.min(scale, maxScale.value)
    );
  };

  const resetScale = () => {
    canvasScale.value = 1;
  };

  return {
    // 状态
    canvasScale,
    minScale,
    maxScale,
    scaleStep,

    // 计算属性
    scalePercentage,

    // 方法
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    setScale,
    resetScale
  };
}
