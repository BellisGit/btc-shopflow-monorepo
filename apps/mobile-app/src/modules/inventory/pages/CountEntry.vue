<template>
  <div class="count-entry-page">
    <Form @submit="handleSubmit">
      <CellGroup inset>
        <Field
          v-model="form.materialCode"
          name="materialCode"
          label="物料编码"
          placeholder="扫码或手动输入"
          :rules="[{ required: true, message: '请填写物料编码' }]"
        />
        <Field
          v-model="form.materialName"
          name="materialName"
          label="物料名称"
          placeholder="自动填充"
          readonly
        />
        <Field
          v-model="form.actualQty"
          name="actualQty"
          label="实际数量"
          type="number"
          placeholder="请输入实际数量"
          :rules="[{ required: true, message: '请填写实际数量' }]"
        />
        <Field
          v-model="form.storageLocation"
          name="storageLocation"
          label="仓位"
          placeholder="请输入仓位"
        />
        <Field
          v-model="form.remark"
          name="remark"
          label="备注"
          type="textarea"
          placeholder="请输入备注"
          rows="3"
        />
      </CellGroup>
      <div style="margin: 16px">
        <Button round block type="primary" native-type="submit">
          提交
        </Button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Form,
  CellGroup,
  Field,
  Button,
} from 'vant';
import { db } from '@/db';
import { useInventoryStore } from '@/stores/inventory';

defineOptions({
  name: 'BtcMobileInventoryEntry',
});

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();

const form = ref({
  materialCode: '',
  materialName: '',
  actualQty: '',
  storageLocation: '',
  remark: '',
});

onMounted(() => {
  const code = route.query.code as string;
  if (code) {
    form.value.materialCode = code;
    loadMaterialInfo(code);
  }
});

async function loadMaterialInfo(code: string) {
  // TODO: 从本地数据库或 API 加载物料信息
  const item = await db.items.where('materialCode').equals(code).first();
  if (item) {
    form.value.materialName = item.materialName;
  }
}

async function handleSubmit() {
  try {
    const session = inventoryStore.currentSession;
    if (!session) {
      // TODO: 提示选择或创建会话
      return;
    }

    const count = {
      sessionId: session.id!,
      materialCode: form.value.materialCode,
      materialName: form.value.materialName,
      actualQty: Number(form.value.actualQty),
      storageLocation: form.value.storageLocation,
      remark: form.value.remark,
      ts: Date.now(),
      synced: false,
    };

    await db.counts.add(count);
    
    // TODO: 添加到待同步队列
    await db.pending_ops.add({
      type: 'count',
      payload: count,
      ts: Date.now(),
      retries: 0,
    });

    router.back();
  } catch (error) {
    console.error('[CountEntry] Failed to submit:', error);
  }
}
</script>


