<template>
  <div class="scanner-page">
    <!-- 顶部导航栏 -->
    <div class="scanner-page__header">
      <button class="scanner-page__close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="scanner-page__title">扫一扫</h1>
      <div class="scanner-page__placeholder"></div>
    </div>

    <!-- 摄像头画面区域 -->
    <div class="scanner-page__content">
      <div ref="scanContainerRef" id="html5-qrcode-container" class="scanner-page__camera"></div>
      
      <!-- 扫描框 -->
      <div class="scanner-page__scan-frame">
        <div class="scanner-page__scan-corner scanner-page__scan-corner--top-left"></div>
        <div class="scanner-page__scan-corner scanner-page__scan-corner--top-right"></div>
        <div class="scanner-page__scan-corner scanner-page__scan-corner--bottom-left"></div>
        <div class="scanner-page__scan-corner scanner-page__scan-corner--bottom-right"></div>
        <div class="scanner-page__scan-line"></div>
      </div>

      <!-- 提示文字 -->
      <div class="scanner-page__hint">
        将二维码放入框内，即可自动扫描
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="scanner-page__footer">
      <div 
        v-if="showFlashlight" 
        class="scanner-page__flashlight"
        :class="{ 'scanner-page__flashlight--blinking': isBlinking }"
        @click="toggleFlashlight"
      >
        <img :src="flashlightIcon" class="scanner-page__flashlight-icon" alt="手电筒" />
        <span class="scanner-page__flashlight-text">{{ isFlashlightOn ? '关闭闪光灯' : '打开闪光灯' }}</span>
      </div>
    </div>

    <!-- 加载提示 -->
    <van-loading v-if="loading" class="scanner-page__loading" type="spinner" color="#ffffff">
      正在启动摄像头...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog, Loading } from 'vant';
import flashlightIcon from '@/assets/flashlight.svg';

defineOptions({
  name: 'BtcMobileInventoryScanner',
});

const router = useRouter();
const scanContainerRef = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const scanning = ref(false);
const showFlashlight = ref(false);
const isFlashlightOn = ref(false);
const isBlinking = ref(false);
let html5QrCode: any = null;
let stream: MediaStream | null = null;
let flashlightBlinkTimeout: number | null = null;
const LIGHT_THRESHOLD = 50; // 光线阈值（0-255，低于此值显示手电筒）
const LIGHT_CHECK_INTERVAL = 5000; // 光线检测间隔（毫秒）- 增加到5秒，减少内存累积

// 尽量在不影响兼容性的前提下，优化相机轨道（安卓收益更明显）
const tryOptimizeVideoTrack = async () => {
  try {
    const videoElement = scanContainerRef.value?.querySelector('video') as HTMLVideoElement | null;
    const mediaStream = (videoElement?.srcObject as MediaStream | null) ?? null;

    // 保存下来，便于 stopScan 正确 stop tracks
    stream = mediaStream;

    const videoTrack = mediaStream?.getVideoTracks?.()?.[0];
    if (!videoTrack || typeof videoTrack.getCapabilities !== 'function') return;

    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
      focusMode?: string[];
      exposureMode?: string[];
      whiteBalanceMode?: string[];
    };

    const advanced: any[] = [];

    // 连续对焦：对安卓提升识别速度/成功率很明显（iOS 多数不支持/不暴露该能力）
    if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
      advanced.push({ focusMode: 'continuous' });
    }
    // 连续曝光/白平衡：减少抖动、暗光下提升识别稳定性
    if (Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('continuous')) {
      advanced.push({ exposureMode: 'continuous' });
    }
    if (Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes('continuous')) {
      advanced.push({ whiteBalanceMode: 'continuous' });
    }

    const constraints: MediaTrackConstraints = {
      // 分辨率提高一点能提升识别度；用 ideal 避免强制失败
      width: { ideal: 1280 },
      height: { ideal: 720 },
    };
    if (advanced.length) {
      (constraints as any).advanced = advanced;
    }

    await videoTrack.applyConstraints(constraints);
  } catch {
    // 静默失败：不同机型/浏览器支持差异很大
  }
};

// 启动摄像头和扫码功能
const startCamera = async () => {
  loading.value = true;
  
  try {
    if (!scanContainerRef.value) {
      throw new Error('扫描容器未找到');
    }

    // 动态导入 html5-qrcode 库
    // @ts-ignore
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
    
    // 创建 Html5Qrcode 实例 - 指定支持的格式以提升性能
    // @ts-ignore - 忽略类型检查，因为 formatsToSupport 是有效的配置选项
    html5QrCode = new Html5Qrcode(scanContainerRef.value.id, {
      // 指定支持的格式：减少解码器工作量（安卓端尤其明显）
      // 只支持二维码，提升性能
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE, // 只扫描二维码
      ]
    });
    
    // 配置扫码选项 - 优化识别度和CPU占用，避免长时间运行后卡顿
    const config = {
      fps: 8, // 进一步降低到 8 fps，减少CPU占用和内存累积
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        // 关键：扫描区域越大，解码器工作量越大（安卓端更容易掉帧/变慢）
        // 这里让扫描区域尽量贴近 UI 扫描框（280px），并做上限/下限保护
        const maxSize = Math.min(viewfinderWidth, viewfinderHeight) * 0.9;
        const targetSize = 280;
        const size = Math.max(200, Math.min(targetSize, maxSize));
        return {
          width: size,
          height: size
        };
      },
      aspectRatio: 1.0,
      // 后置摄像头通常不需要镜像翻转；关闭可减少计算量，提升安卓识别速度
      disableFlip: true,
      supportedScanTypes: [0], // 只支持二维码
      verbose: false, // 关闭详细日志，减少性能开销
      rememberLastUsedCamera: true, // 记住上次使用的摄像头
      showTorchButtonIfSupported: false, // 不显示内置闪光灯按钮（我们有自己的）
      useBarCodeDetectorIfSupported: true, // 如果浏览器支持，使用原生条码检测器（更快更准确）
      // 添加实验性选项，减少内存占用
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    // 开始扫码（使用后置摄像头）
    // 注意：html5-qrcode 的 start 方法第一个参数如果是对象，只能有一个键（例如仅传 facingMode）
    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      onScanSuccess, // 扫码成功回调
      onScanFailure // 扫码失败回调
    );

    // 启动后再做轨道优化（避免破坏 html5-qrcode 的入参兼容性）
    // 不 await，避免影响首帧速度
    tryOptimizeVideoTrack();

    // 开始光线检测（降低频率，避免内存累积）
    // 延迟启动，避免影响首帧性能
    setTimeout(() => {
      startLightCheck();
    }, 2000); // 2秒后启动光线检测

    scanning.value = true;
    loading.value = false;
  } catch (error: any) {
    loading.value = false;
    scanning.value = false;
    console.error('启动摄像头失败:', error);
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    let errorMessage = '无法访问摄像头';
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = '摄像头权限被拒绝，请在浏览器设置中允许访问摄像头';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = '未找到摄像头设备';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = '摄像头被其他应用占用';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showDialog({
      title: '摄像头启动失败',
      message: errorMessage,
      confirmButtonText: '确定'
    }).then(() => {
      handleClose();
    });
  }
};

// 扫码成功回调 - 优化为快速自动捕捉
const onScanSuccess = (decodedText: string, decodedResult: any) => {
  // 防止重复触发
  if (!scanning.value) {
    return;
  }
  
  // 验证识别结果的有效性
  if (!decodedText || decodedText.trim().length === 0) {
    // 如果识别结果为空，继续扫描
    return;
  }
  
  // 立即停止扫描，避免重复识别
  scanning.value = false;
  
  // 异步停止扫描，不阻塞页面跳转
  stopScan().catch(() => {
    // 忽略停止扫描的错误，确保页面跳转不受影响
  });
  
  // 立即跳转，实现自动捕捉效果
  router.push({
    name: 'InventoryEntry',
    query: {
      code: decodedText
    }
  });
};

// 扫码失败回调（持续扫描时的错误，不需要处理）
// 优化：完全静默处理，不进行任何操作，最大化性能
const onScanFailure = () => {
  // 完全静默处理，不进行任何操作
  // 这是正常的扫描过程，未识别到二维码时持续调用
  // 不做任何处理可以最大化性能，让识别速度更快
};

// 停止扫码
const stopScan = async () => {
  if (html5QrCode && scanning.value) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
      scanning.value = false;
    } catch (error) {
      console.error('停止扫码失败:', error);
    }
  }
  
  html5QrCode = null;
  
  // 停止所有媒体流
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    stream = null;
  }
};

// 切换闪光灯
const toggleFlashlight = async () => {
  if (!html5QrCode || !scanning.value) {
    showToast('摄像头未启动');
    return;
  }

  try {
    // html5-qrcode 库不直接支持闪光灯控制
    // 需要从 html5QrCode 实例中获取视频流
    const videoElement = scanContainerRef.value?.querySelector('video') as HTMLVideoElement;
    if (!videoElement || !videoElement.srcObject) {
      showToast('未找到视频流');
      return;
    }

    const mediaStream = videoElement.srcObject as MediaStream;
    const videoTrack = mediaStream.getVideoTracks()[0];
    
    if (!videoTrack) {
      showToast('未找到视频轨道');
      return;
    }

    // 检查是否支持闪光灯
    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
    if (capabilities.torch) {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashlightOn.value } as any]
      });
      isFlashlightOn.value = !isFlashlightOn.value;
      stopBlinking(); // 打开手电筒后停止闪烁
      
      // 如果关闭手电筒，重新检测光线
      if (!isFlashlightOn.value) {
        checkLightLevel();
      }
    } else {
      showToast('当前设备不支持闪光灯');
    }
  } catch (error) {
    console.error('切换闪光灯失败:', error);
    showToast('切换闪光灯失败');
  }
};

// 开始光线检测 - 优化为更低的频率，避免内存累积
let lightCheckInterval: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let isCheckingLight = false; // 防止重复执行

function initLightDetection() {
  canvas = document.createElement('canvas');
  canvasContext = canvas.getContext('2d', { 
    willReadFrequently: false, // 改为 false，减少内存占用
    alpha: false, // 不需要透明度，可以提升性能
    desynchronized: true // 启用异步渲染，减少阻塞
  });
}

function startLightCheck() {
  initLightDetection();
  // 增加检测间隔，减少 Canvas 操作频率，避免内存累积
  lightCheckInterval = window.setInterval(() => {
    if (!isCheckingLight) {
      checkLightLevel();
    }
  }, LIGHT_CHECK_INTERVAL * 2); // 增加到6秒一次
}

// 检测光线亮度（优化版本，减少性能消耗和内存累积）
function checkLightLevel() {
  const videoElement = scanContainerRef.value?.querySelector('video') as HTMLVideoElement;
  if (!videoElement || !canvas || !canvasContext || isCheckingLight) return;
  
  isCheckingLight = true;
  
  try {
    if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      isCheckingLight = false;
      return;
    }
    
    // 使用较小的采样尺寸以提升性能（移动端优化）
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const sampleScale = isMobile ? 0.15 : 0.2; // 进一步减小采样区域
    
    // 设置 Canvas 尺寸（使用较小的尺寸以减少内存和计算）
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    if (videoWidth === 0 || videoHeight === 0) {
      isCheckingLight = false;
      return;
    }
    
    const maxCanvasSize = isMobile ? 150 : 300; // 进一步减小 canvas 尺寸
    const scale = Math.min(maxCanvasSize / videoWidth, maxCanvasSize / videoHeight, 1);
    
    // 只在尺寸变化时重置 canvas，避免频繁创建
    if (canvas.width !== Math.floor(videoWidth * scale) || canvas.height !== Math.floor(videoHeight * scale)) {
      canvas.width = Math.floor(videoWidth * scale);
      canvas.height = Math.floor(videoHeight * scale);
    }
    
    // 绘制视频帧到 Canvas（缩小的尺寸）
    canvasContext.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // 获取图像数据（采样中心区域，使用更小的采样尺寸）
    const sampleSize = Math.min(canvas.width, canvas.height) * sampleScale;
    const startX = Math.floor((canvas.width - sampleSize) / 2);
    const startY = Math.floor((canvas.height - sampleSize) / 2);
    const sampleWidth = Math.floor(sampleSize);
    const sampleHeight = Math.floor(sampleSize);
    
    const imageData = canvasContext.getImageData(
      startX,
      startY,
      sampleWidth,
      sampleHeight
    );
    
    // 计算平均亮度（使用更大的步进，减少计算量）
    let totalBrightness = 0;
    const data = imageData.data;
    const step = isMobile ? 32 : 16; // 进一步增大步进，跳过更多像素
    let pixelCount = 0;
    
    // 同步处理，但使用较小的计算量
    for (let i = 0; i < data.length; i += step * 4) {
      // RGB 转亮度（使用加权平均）
      const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      totalBrightness += brightness;
      pixelCount++;
    }
    
    if (pixelCount > 0) {
      const avgBrightness = totalBrightness / pixelCount;
      
      // 根据亮度决定是否显示手电筒
      if (avgBrightness < LIGHT_THRESHOLD) {
        if (!showFlashlight.value) {
          showFlashlight.value = true;
          // 开始闪烁动画（2秒）
          startBlinking();
        }
      } else {
        if (showFlashlight.value && !isFlashlightOn.value) {
          showFlashlight.value = false;
          stopBlinking();
        }
      }
    }
    
    // 释放标志
    isCheckingLight = false;
  } catch (error) {
    // 忽略错误，继续检测
    isCheckingLight = false;
  }
}

// 开始闪烁动画
function startBlinking() {
  isBlinking.value = true;
  
  // 2秒后停止闪烁
  if (flashlightBlinkTimeout) {
    clearTimeout(flashlightBlinkTimeout);
  }
  flashlightBlinkTimeout = window.setTimeout(() => {
    isBlinking.value = false;
    flashlightBlinkTimeout = null;
  }, 2000);
}

// 停止闪烁动画
function stopBlinking() {
  isBlinking.value = false;
  if (flashlightBlinkTimeout) {
    clearTimeout(flashlightBlinkTimeout);
    flashlightBlinkTimeout = null;
  }
}

// 关闭扫码页面
const handleClose = () => {
  stopScan();
  router.back();
};

// 组件挂载时启动摄像头
onMounted(() => {
  // 检查浏览器是否支持 getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showDialog({
      title: '不支持',
      message: '您的浏览器不支持摄像头功能，请使用现代浏览器访问',
      confirmButtonText: '确定'
    }).then(() => {
      handleClose();
    });
    return;
  }

  startCamera();
});

// 组件卸载时停止摄像头
onBeforeUnmount(() => {
  // 停止光线检测
  if (lightCheckInterval) {
    clearInterval(lightCheckInterval);
    lightCheckInterval = null;
  }
  
  // 停止闪烁动画
  if (flashlightBlinkTimeout) {
    clearTimeout(flashlightBlinkTimeout);
    flashlightBlinkTimeout = null;
  }
  
  // 清理 Canvas，释放内存
  if (canvasContext) {
    canvasContext.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    canvasContext = null;
  }
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
    canvas = null;
  }
  
  // 重置检测标志
  isCheckingLight = false;
  
  // 关闭手电筒
  if (isFlashlightOn.value) {
    toggleFlashlight();
  }
  
  stopScan();
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.scanner-page {
  width: 100vw;
  height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.scanner-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
}

.scanner-page__close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  padding: 0;
  color: #ffffff;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.scanner-page__title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.scanner-page__placeholder {
  width: 40px;
}

.scanner-page__content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scanner-page__camera {
  width: 100%;
  height: 100%;
  position: relative;
  
  :deep(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000000;
  }
  
  // html5-qrcode 会在容器内创建自己的元素，我们需要保留它们用于扫描
  // 但是可以隐藏默认的扫描框，使用我们自定义的扫描框
  :deep(#qr-shaded-region) {
    display: none !important;
  }
  
  // 确保扫描区域可见
  :deep(#html5-qrcode-container__dashboard) {
    display: none !important;
  }
}

.scanner-page__scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.scanner-page__scan-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #1976d2;
  
  &--top-left {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
  }
  
  &--top-right {
    top: -3px;
    right: -3px;
    border-left: none;
    border-bottom: none;
  }
  
  &--bottom-left {
    bottom: -3px;
    left: -3px;
    border-right: none;
    border-top: none;
  }
  
  &--bottom-right {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
  }
}

.scanner-page__scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    #1976d2 50%,
    transparent 100%
  );
  animation: scan-line 2s linear infinite;
}

@keyframes scan-line {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.scanner-page__hint {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  z-index: 3;
}

.scanner-page__footer {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
  display: flex;
  justify-content: center;
}

.scanner-page__flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  &--blinking {
    animation: flashlight-blink 1s ease-in-out infinite;
  }
}

@keyframes flashlight-blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.scanner-page__flashlight-icon {
  width: 32px;
  height: 32px;
}

.scanner-page__flashlight-text {
  font-size: 12px;
}

.scanner-page__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  color: #ffffff;
}
</style>
