<template>
  <div class="scanner-page">
    <div class="scanner-page__camera" ref="cameraRef">
      <video ref="videoRef" autoplay playsinline></video>
    </div>
    <div class="scanner-page__overlay">
      <div class="scanner-page__frame"></div>
    </div>
    <div class="scanner-page__actions">
      <Button type="primary" block @click="handleManualInput">
        手动输入
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from 'vant';
import { BrowserMultiFormatReader } from '@zxing/library';

defineOptions({
  name: 'BtcMobileInventoryScanner',
});

const router = useRouter();
const videoRef = ref<HTMLVideoElement>();
const cameraRef = ref<HTMLDivElement>();
let codeReader: BrowserMultiFormatReader | null = null;

onMounted(async () => {
  if (!videoRef.value) return;
  
  try {
    codeReader = new BrowserMultiFormatReader();
    const devices = await codeReader.listVideoInputDevices();
    
    if (devices.length > 0) {
      await codeReader.decodeFromVideoDevice(
        devices[0].deviceId,
        videoRef.value,
        (result, error) => {
          if (result) {
            handleScanResult(result.getText());
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('[Scanner] Error:', error);
          }
        }
      );
    }
  } catch (error) {
    console.error('[Scanner] Failed to initialize:', error);
  }
});

onUnmounted(() => {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
});

function handleScanResult(code: string) {
  console.log('[Scanner] Scanned code:', code);
  // TODO: 处理扫码结果，跳转到录入页面
  router.push({
    name: 'InventoryEntry',
    query: { code },
  });
}

function handleManualInput() {
  router.push({ name: 'InventoryEntry' });
}
</script>


