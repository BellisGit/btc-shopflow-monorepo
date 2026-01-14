<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="scanner__header">
      <button class="scanner__close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="scanner__title">扫一扫</h1>
      <div class="scanner__placeholder"></div>
    </div>

    <!-- 摄像头画面区域 -->
    <div class="scanner__content">
      <div ref="scanContainerRef" id="html5-qrcode-container" class="scanner__camera"></div>

      <!-- 扫描框 -->
      <div class="scanner__scan-frame">
        <div class="scanner__scan-corner scanner__scan-corner--top-left"></div>
        <div class="scanner__scan-corner scanner__scan-corner--top-right"></div>
        <div class="scanner__scan-corner scanner__scan-corner--bottom-left"></div>
        <div class="scanner__scan-corner scanner__scan-corner--bottom-right"></div>
        <div class="scanner__scan-line"></div>
      </div>

      <!-- 提示文字 -->
      <div class="scanner__hint">
        将二维码放入框内，即可自动扫描
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="scanner__footer">
      <!-- 始终显示手电筒按钮，让用户可以手动控制 -->
      <div
        class="scanner__flashlight"
        @click="toggleFlashlight"
      >
        <img :src="flashlightIcon" class="scanner__flashlight-icon" alt="手电筒" />
        <span class="scanner__flashlight-text">{{ isFlashlightOn ? '关闭闪光灯' : '打开闪光灯' }}</span>
      </div>
    </div>

    <!-- 加载提示 -->
    <van-loading v-if="loading" class="scanner__loading" type="spinner" color="#ffffff">
      正在启动摄像头...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
/* eslint-env browser */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog, Loading } from 'vant';
import flashlightIcon from '@/assets/flashlight.svg';
import { logger } from '@btc/shared-core';


defineOptions({
  name: 'BtcMobileInventoryScanner',
});

const router = useRouter();
const scanContainerRef = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const scanning = ref(false);
const isFlashlightOn = ref(false);
let html5QrCode: any = null;
let stream: MediaStream | null = null;

// 尽量在不影响兼容性的前提下，优化相机轨道（安卓收益更明显）
const tryOptimizeVideoTrack = async () => {
  try {
    const videoElement = scanContainerRef.value?.querySelector('video') as HTMLVideoElement | null;
    const mediaStream = (videoElement?.srcObject as MediaStream | null) ?? null;

    // 保存下来，便于 stopScan 正确 stop tracks
    stream = mediaStream;

    const videoTrack = mediaStream?.getVideoTracks?.()?.[0];
    if (!videoTrack || typeof videoTrack.getCapabilities !== 'function') return;

    // eslint-disable-next-line no-undef
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

    // eslint-disable-next-line no-undef
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
    // @ts-expect-error - html5-qrcode 库的类型定义可能不完整
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

    // 创建 Html5Qrcode 实例 - 指定支持的格式以提升性能
    // @ts-expect-error - 忽略类型检查，因为 formatsToSupport 是有效的配置选项
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

    // 禁用光线检测，避免 Canvas 操作导致的内存累积和卡顿
    // Canvas 操作会抢占主线程资源，导致解码延迟
    // 用户可以通过手动点击手电筒按钮来开启闪光灯
    // startLightCheck();

    scanning.value = true;
    loading.value = false;
  } catch (error: any) {
    loading.value = false;
    scanning.value = false;
    logger.error('启动摄像头失败:', error);
    logger.error('错误详情:', {
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
      logger.error('停止扫码失败:', error);
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
    // eslint-disable-next-line no-undef
    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
    if (capabilities.torch) {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashlightOn.value } as any]
      });
      isFlashlightOn.value = !isFlashlightOn.value;
    } else {
      showToast('当前设备不支持闪光灯');
    }
  } catch (error) {
    logger.error('切换闪光灯失败:', error);
    showToast('切换闪光灯失败');
  }
};

// 光线检测已完全禁用，避免 Canvas 操作导致的内存累积和卡顿
// Canvas 操作会抢占主线程资源，导致解码延迟
// 用户可以通过手动点击手电筒按钮来开启闪光灯

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
  // 关闭手电筒
  if (isFlashlightOn.value) {
    toggleFlashlight();
  }

  stopScan();
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;



.scanner__header {
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

.scanner__close-btn {
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

.scanner__title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.scanner__placeholder {
  width: 40px;
}

.scanner__content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scanner__camera {
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

.scanner__scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.scanner__scan-corner {
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

.scanner__scan-line {
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

.scanner__hint {
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

.scanner__footer {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
  display: flex;
  justify-content: center;
}

.scanner__flashlight {
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
}

.scanner__flashlight-icon {
  width: 32px;
  height: 32px;
}

.scanner__flashlight-text {
  font-size: 12px;
}

.scanner__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  color: #ffffff;
}
</style>
