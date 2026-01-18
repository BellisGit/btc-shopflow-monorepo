<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="count-entry__header">
      <button class="count-entry__back-btn" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="count-entry__title">录入盘点</h1>
      <div class="count-entry__placeholder"></div>
    </div>
    
    <Form @submit="handleSubmit">
      <CellGroup inset>
        <Field
          v-model="form.materialCode"
          name="materialCode"
          label="物料编码"
          readonly
        />
        <Field
          v-model="form.storageLocation"
          name="storageLocation"
          label="仓位"
          readonly
        />
        <Field
          v-model="form.actualQty"
          name="actualQty"
          label="实际数量"
          type="number"
          placeholder="请输入实际数量"
          :rules="[{ required: true, message: '请填写实际数量' }]"
          ref="qtyInputRef"
        />
      </CellGroup>
      <div style="margin: 16px">
        <Button round block type="primary" native-type="submit" :loading="loading">
          提交
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import {
  Form,
  CellGroup,
  Field,
  Button,
  showToast,
} from 'vant';
import { db } from '@/db';
import { useInventoryStore } from '@/stores/inventory';
import { inventoryApi } from '@/services/inventory';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcMobileInventoryEntry',
});

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();
const qtyInputRef = ref();
const loading = ref(false);

const form = ref({
  materialCode: '',
  actualQty: '',
  storageLocation: '',
});

onMounted(() => {
  const code = route.query.code as string;
  if (code) {
    try {
      const data = JSON.parse(code);
      if (data.partName) {
        form.value.materialCode = data.partName;
      }
      if (data.position) {
        form.value.storageLocation = data.position;
      }
      // 聚焦到数量输入框
      nextTick(() => {
        qtyInputRef.value?.focus();
      });
    } catch (e) {
      showToast('二维码格式错误');
      logger.error('Failed to parse QR code:', e);
    }
  }
});

function handleBack() {
  router.back();
}

async function handleSubmit() {
  if (loading.value) return;
  loading.value = true;

  try {
    // 验证并转换数量值
    const qtyValue = form.value.actualQty;
    if (!qtyValue || qtyValue === '') {
      showToast({
        type: 'fail',
        message: '请填写实际数量',
        duration: 2000,
      });
      loading.value = false;
      return;
    }

    const partQty = Number(qtyValue);
    if (isNaN(partQty) || partQty <= 0) {
      showToast({
        type: 'fail',
        message: '请输入有效的数量（大于0）',
        duration: 2000,
      });
      loading.value = false;
      return;
    }

    // 调用后端接口提交（使用 partQty 字段名，与后端API保持一致）
    await inventoryApi.scan({
      partName: form.value.materialCode,
      position: form.value.storageLocation,
      partQty: partQty,
    });

    // 保存到本地数据库（可选，用于离线记录或历史记录）
    const session = inventoryStore.currentSession;
    const count = {
      sessionId: session?.id || 'temp-session',
      materialCode: form.value.materialCode,
      actualQty: partQty, // 本地数据库使用 actualQty 字段
      storageLocation: form.value.storageLocation,
      ts: Date.now(),
      synced: true, // 既然已经 API 提交成功，标记为已同步
    };

    await db.counts.add(count);

    showToast({
      type: 'success',
      message: '提交成功',
      duration: 1000,
    });

    // 提交成功后返回扫码页面
    setTimeout(() => {
      router.replace({ name: 'Scanner' });
    }, 500);
  } catch (error: any) {
    logger.error('[CountEntry] Failed to submit:', error);
    const message = error?.message || '提交失败';
    showToast({
      type: 'fail',
      message: message,
      duration: 2000,
    });
  } finally {
    loading.value = false;
  }
}
</script>


