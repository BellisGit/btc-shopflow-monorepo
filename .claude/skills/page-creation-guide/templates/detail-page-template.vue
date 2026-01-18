<template>
  <div class="page">
    <btc-card v-loading="loading">
      <template #title>详情标题</template>
      
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="字段1">
            {{ data.field1 }}
          </el-descriptions-item>
          <el-descriptions-item label="字段2">
            {{ data.field2 }}
          </el-descriptions-item>
          <!-- 添加更多字段... -->
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button @click="handleBack">返回</el-button>
      </template>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'PageName'
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const data = ref<any>({});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    // TODO: 替换为实际的 API 调用
    // const res = await api.info({ id: route.params.id });
    // data.value = res;
  } catch (error: any) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 编辑
function handleEdit() {
  router.push(`/edit/${route.params.id}`);
}

// 返回
function handleBack() {
  router.back();
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20px;
}

.detail-content {
  padding: 20px 0;
}
</style>
