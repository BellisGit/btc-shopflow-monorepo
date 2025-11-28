<template>
  <div 
    class="scanner-page"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <div class="scanner-page__camera" ref="cameraRef">
      <video ref="videoRef" autoplay playsinline></video>
    </div>
    <div class="scanner-page__overlay">
      <!-- 关闭按钮 -->
      <button class="scanner-page__close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <!-- 绿色扫描线 -->
      <div class="scanner-page__scan-line" ref="scanLineRef"></div>
      <!-- 提示文字 -->
      <div class="scanner-page__hint">
        将二维码放入框内，即可自动扫描
      </div>
    </div>
    <!-- 手电筒控制 -->
    <div 
      v-if="showFlashlight" 
      class="scanner-page__flashlight"
      :class="{ 'scanner-page__flashlight--blinking': isBlinking }"
      @click="toggleFlashlight"
    >
      <img :src="flashlightIcon" class="scanner-page__flashlight-icon" alt="手电筒" />
      <span class="scanner-page__flashlight-text">轻触照亮</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import flashlightIcon from '@/assets/flashlight.svg';

defineOptions({
  name: 'BtcMobileInventoryScanner',
});

const router = useRouter();
const videoRef = ref<HTMLVideoElement>();
const cameraRef = ref<HTMLDivElement>();
const scanLineRef = ref<HTMLDivElement>();
let codeReader: BrowserMultiFormatReader | null = null;
let videoStream: MediaStream | null = null;
let videoTrack: MediaStreamTrack | null = null;
let scanAnimationId: number | null = null;
let autoZoomCheckInterval: number | null = null;
let lightCheckInterval: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let isScanning = false;
let lastScanTime = 0;
let consecutiveFailures = 0;

// 手电筒相关
const showFlashlight = ref(false);
const isFlashlightOn = ref(false);
const isBlinking = ref(false);
let flashlightBlinkTimeout: number | null = null;
const LIGHT_THRESHOLD = 50; // 光线阈值（0-255，低于此值显示手电筒）
const LIGHT_CHECK_INTERVAL = 1000; // 光线检测间隔（毫秒）

// 自动放大相关
let currentZoom = 1;
let maxZoom = 1;
let minZoom = 1;
const SCAN_AREA_WIDTH = 250; // 扫描区域宽度（像素）
const QRCODE_SIZE_THRESHOLD = SCAN_AREA_WIDTH / 4; // 二维码尺寸阈值（小于此值触发放大）
const AUTO_ZOOM_CHECK_INTERVAL = 3000; // 自动放大检查间隔（毫秒）

// 手势控制焦距相关
let initialDistance = 0;
let initialZoom = 1;
let isPinching = false;
let lastZoomUpdateTime = 0;
const ZOOM_UPDATE_THROTTLE = 50; // 变焦更新节流时间（毫秒）

onMounted(async () => {
  if (!videoRef.value) return;
  
  try {
    // 获取摄像头权限并启动视频流
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 后置摄像头
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      }
    });
    
    videoRef.value.srcObject = videoStream;
    videoTrack = videoStream.getVideoTracks()[0];
    
    // 获取摄像头能力
    const capabilities = videoTrack.getCapabilities();
    if (capabilities.zoom) {
      maxZoom = capabilities.zoom.max || 1;
      minZoom = capabilities.zoom.min || 1;
      currentZoom = capabilities.zoom.current || 1;
    }
    
    // 等待视频加载
    await new Promise((resolve) => {
      if (videoRef.value) {
        videoRef.value.onloadedmetadata = resolve;
      }
    });
    
    // 启动扫描动画
    startScanAnimation();
    
    // 初始化光线检测
    initLightDetection();
    
    // 初始化二维码扫描
    codeReader = new BrowserMultiFormatReader();
    
    // 开始定期检查自动放大（即使没有识别到二维码）
    startAutoZoomCheck();
    
    // 开始光线检测
    startLightCheck();
    
    // 开始扫描
    await codeReader.decodeFromVideoDevice(
      null, // 使用默认设备
      videoRef.value,
      async (result: Result | null, error: any) => {
        if (result && !isScanning) {
          // 重置失败计数
          consecutiveFailures = 0;
          
          // 检查二维码尺寸，决定是否需要放大
          await checkAndAutoZoom(result);
          
          isScanning = true;
          await handleScanResult(result);
        } else if (error) {
          // 记录连续失败次数
          consecutiveFailures++;
          lastScanTime = Date.now();
        }
      }
    );
  } catch (error) {
    console.error('[Scanner] Failed to initialize:', error);
  }
});

onUnmounted(() => {
  // 停止扫描动画
  if (scanAnimationId) {
    cancelAnimationFrame(scanAnimationId);
    scanAnimationId = null;
  }
  
  // 停止自动放大检查
  if (autoZoomCheckInterval) {
    clearInterval(autoZoomCheckInterval);
    autoZoomCheckInterval = null;
  }
  
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
  
  // 关闭手电筒
  if (isFlashlightOn.value) {
    toggleFlashlight();
  }
  
  // 停止二维码扫描
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  
  // 停止视频流
  if (videoTrack) {
    videoTrack.stop();
    videoTrack = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  
  // 清理 Canvas
  if (canvas) {
    canvas = null;
    canvasContext = null;
  }
  
  isScanning = false;
});

// 启动扫描线动画
function startScanAnimation() {
  if (!scanLineRef.value || !videoRef.value) return;
  
  let position = 0;
  const speed = 2; // 移动速度（像素/帧）
  
  const animate = () => {
    if (!scanLineRef.value || !videoRef.value) return;
    
    // 计算扫描范围：从关闭按钮下方到手电筒上方
    const closeBtnHeight = 28; // 关闭按钮高度
    const closeBtnMargin = 16; // 关闭按钮间距
    const flashlightHeight = 60; // 手电筒区域高度（图标32px + 文字 + 间距）
    const flashlightMargin = 120; // 手电筒底部间距（已提高）
    
    // 获取视口高度和安全区域
    const viewportHeight = window.innerHeight;
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0') || 0;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0') || 0;
    
    // 计算扫描起始位置（关闭按钮下方）
    const startY = closeBtnHeight + closeBtnMargin * 2 + safeAreaTop; // 28px按钮 + 32px间距
    
    // 计算扫描结束位置（手电筒上方）
    const endY = viewportHeight - flashlightHeight - flashlightMargin - safeAreaBottom;
    
    // 计算可扫描的高度范围
    const scanHeight = endY - startY;
    
    position += speed;
    
    // 如果超出扫描范围，重置到起始位置
    if (position > scanHeight) {
      position = 0;
    }
    
    // 设置扫描线位置（相对于起始位置）
    scanLineRef.value.style.transform = `translateY(${position}px)`;
    scanAnimationId = requestAnimationFrame(animate);
  };
  
  animate();
}

// 启动自动放大检查
function startAutoZoomCheck() {
  autoZoomCheckInterval = window.setInterval(() => {
    // 如果用户正在手动控制焦距，跳过自动调整
    if (isPinching) return;
    
    // 如果连续失败多次且当前变焦未达到最大，尝试逐步放大
    if (consecutiveFailures > 10 && currentZoom < maxZoom) {
      const newZoom = Math.min(currentZoom + 0.2, maxZoom);
      applyZoom(newZoom);
    }
    
    // 如果已经很久没有扫描成功，重置变焦
    if (Date.now() - lastScanTime > 10000 && currentZoom > minZoom + 0.5) {
      const newZoom = Math.max(currentZoom - 0.3, minZoom);
      applyZoom(newZoom);
    }
  }, AUTO_ZOOM_CHECK_INTERVAL);
}

// 检查二维码尺寸并自动放大
async function checkAndAutoZoom(result: Result) {
  if (!videoRef.value || !videoTrack || !result) return;
  
  try {
    // 获取二维码位置信息
    const points = result.getResultPoints();
    if (!points || points.length < 2) return;
    
    // 计算二维码在画面中的尺寸
    const videoWidth = videoRef.value.videoWidth;
    const videoHeight = videoRef.value.videoHeight;
    const displayWidth = videoRef.value.clientWidth;
    const displayHeight = videoRef.value.clientHeight;
    
    // 计算缩放比例
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;
    
    // 计算二维码的边界框
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    points.forEach(point => {
      const x = point.getX() * scaleX;
      const y = point.getY() * scaleY;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
    
    // 计算二维码宽度和高度
    const qrCodeWidth = maxX - minX;
    const qrCodeHeight = maxY - minY;
    const qrCodeSize = Math.max(qrCodeWidth, qrCodeHeight);
    
    // 如果二维码太小，触发自动放大
    if (qrCodeSize < QRCODE_SIZE_THRESHOLD && currentZoom < maxZoom) {
      // 计算需要的变焦系数
      const zoomRatio = QRCODE_SIZE_THRESHOLD / qrCodeSize;
      const targetZoom = Math.min(currentZoom * zoomRatio, maxZoom);
      
      // 限制变焦增量，避免过度放大
      const maxZoomIncrement = 0.3;
      const zoomIncrement = Math.min(targetZoom - currentZoom, maxZoomIncrement);
      const newZoom = Math.min(currentZoom + zoomIncrement, maxZoom);
      
      if (newZoom > currentZoom) {
        await applyZoom(newZoom);
      }
    }
    // 如果二维码太大，适当缩小（但不要缩得太小）
    else if (qrCodeSize > SCAN_AREA_WIDTH * 0.9 && currentZoom > minZoom + 0.1) {
      const targetZoom = Math.max(currentZoom - 0.2, minZoom);
      await applyZoom(targetZoom);
    }
  } catch (error) {
    // 忽略错误，继续扫描
  }
}

// 应用变焦
async function applyZoom(zoom: number) {
  if (!videoTrack) return;
  
  try {
    const capabilities = videoTrack.getCapabilities();
    if (!capabilities.zoom) return; // 不支持变焦
    
    await videoTrack.applyConstraints({
      advanced: [{ zoom } as any]
    });
    
    currentZoom = zoom;
  } catch (error) {
    // 变焦失败，忽略错误
  }
}

// 处理扫码结果
async function handleScanResult(result: Result) {
  const code = result.getText();
  
  // 短暂延迟后跳转，让用户看到扫描成功
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 跳转前重置扫描状态，以便用户返回后可以继续扫描
  isScanning = false;
  
  router.push({
    name: 'InventoryEntry',
    query: { code },
  });
}

// 初始化光线检测
function initLightDetection() {
  canvas = document.createElement('canvas');
  canvasContext = canvas.getContext('2d', { willReadFrequently: true });
}

// 开始光线检测
function startLightCheck() {
  lightCheckInterval = window.setInterval(() => {
    checkLightLevel();
  }, LIGHT_CHECK_INTERVAL);
}

// 检测光线亮度
function checkLightLevel() {
  if (!videoRef.value || !canvas || !canvasContext) return;
  
  try {
    const video = videoRef.value;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    // 设置 Canvas 尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制视频帧到 Canvas
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 获取图像数据（采样中心区域）
    const sampleSize = Math.min(canvas.width, canvas.height) * 0.3;
    const startX = (canvas.width - sampleSize) / 2;
    const startY = (canvas.height - sampleSize) / 2;
    const imageData = canvasContext.getImageData(
      startX,
      startY,
      sampleSize,
      sampleSize
    );
    
    // 计算平均亮度
    let totalBrightness = 0;
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // RGB 转亮度（使用加权平均）
      const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      totalBrightness += brightness;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    
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
  } catch (error) {
    // 忽略错误，继续检测
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
function handleClose() {
  router.back();
}

// 切换手电筒
async function toggleFlashlight() {
  if (!videoTrack) return;
  
  try {
    const capabilities = videoTrack.getCapabilities();
    if (!capabilities.torch) {
      // 不支持手电筒
      return;
    }
    
    const newState = !isFlashlightOn.value;
    
    await videoTrack.applyConstraints({
      advanced: [{ torch: newState } as any]
    });
    
    isFlashlightOn.value = newState;
    stopBlinking(); // 打开手电筒后停止闪烁
    
    // 如果关闭手电筒，重新检测光线
    if (!newState) {
      checkLightLevel();
    }
  } catch (error) {
    // 手电筒切换失败，忽略错误
  }
}

// 计算两点之间的距离
function getDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// 处理触摸开始
function handleTouchStart(event: TouchEvent) {
  // 双指手势开始
  if (event.touches.length === 2 && videoTrack) {
    // 阻止页面缩放和默认行为
    event.preventDefault();
    event.stopPropagation();
    
    isPinching = true;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
    initialZoom = currentZoom;
  }
}

// 处理触摸移动
function handleTouchMove(event: TouchEvent) {
  // 阻止页面缩放和默认行为
  if (event.touches.length > 1) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // 双指捏合/张开手势
  if (event.touches.length === 2 && isPinching && videoTrack) {
    const currentDistance = getDistance(event.touches[0], event.touches[1]);
    const distanceRatio = currentDistance / initialDistance;
    
    // 计算新的变焦值
    let newZoom = initialZoom * distanceRatio;
    
    // 限制在最小和最大变焦范围内
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    
    // 应用变焦（节流，避免过于频繁的更新）
    const now = Date.now();
    if (now - lastZoomUpdateTime > ZOOM_UPDATE_THROTTLE) {
      if (Math.abs(newZoom - currentZoom) > 0.02) {
        applyZoom(newZoom);
        lastZoomUpdateTime = now;
      }
    }
  }
}

// 处理触摸结束
function handleTouchEnd(event: TouchEvent) {
  if (event.touches.length < 2) {
    isPinching = false;
    initialDistance = 0;
  }
}
</script>


