<template>
  <div class="api-switch">
    <div class="api-switch__header">
      <h3>环境切换</h3>
      <el-tag :type="currentApiType === 'dev' ? 'success' : 'warning'" size="small">
        {{ currentApiType === 'dev' ? '开发环境' : '生产环境' }}
      </el-tag>
    </div>
    
    <div class="api-switch__content">
      <div 
        v-for="(item, index) in apiList" 
        :key="index"
        class="api-item"
        :class="{ 'is-active': item.value === currentApi }"
      >
        <div class="api-item__info">
          <div class="api-item__name">
            <el-tag 
              :type="item.type === 'dev' ? 'success' : 'warning'" 
              size="small"
              disable-transitions
            >
              {{ item.label }}
            </el-tag>
          </div>
          <div class="api-item__url">
            <el-link 
              :href="item.url" 
              target="_blank"
              type="primary"
              :underline="false"
              class="api-item__url-link"
            >
              {{ item.url }}
            </el-link>
          </div>
        </div>
        
        <el-switch
          v-model="item.enabled"
          :disabled="item.value === currentApi"
          @change="handleSwitch(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { http } from '@/utils/http';
import { config } from '@/config';

interface ApiItem {
  label: string;
  value: string;
  url: string;
  type: 'dev' | 'prod';
  enabled: boolean;
}

const reloading = ref(false);

// 开发环境后端地址
const DEV_BACKEND_URL = 'http://10.80.9.76:8115/api';
const PROD_BACKEND_URL = 'https://api.bellis.com.cn/api';

const apiList = ref<ApiItem[]>([
  {
    label: '开发环境',
    value: '/api',
    url: DEV_BACKEND_URL,
    type: 'dev',
    enabled: true,
  },
  {
    label: '生产环境',
    value: PROD_BACKEND_URL, // 使用完整 URL，直接请求生产环境
    url: PROD_BACKEND_URL,
    type: 'prod',
    enabled: false,
  },
]);

const currentApi = ref<string>('');

const currentApiType = computed(() => {
  const item = apiList.value.find(item => item.value === currentApi.value);
  return item?.type || 'dev';
});

// 从 localStorage 或 http 实例获取当前 API
function loadCurrentApi() {
  const stored = localStorage.getItem('dev_api_base_url');
  const httpBaseURL = http.getBaseURL();
  
  // 自动清理：将旧的 /api-prod 路径转换为完整 URL（兼容旧数据）
  let storedValue = stored;
  if (stored === '/api-prod') {
    storedValue = PROD_BACKEND_URL;
    localStorage.setItem('dev_api_base_url', PROD_BACKEND_URL);
  }
  
  currentApi.value = storedValue || httpBaseURL || config.api.baseURL;
  
  // 更新开关状态（根据值匹配，可能是 /api 或完整 URL）
  apiList.value.forEach(item => {
    item.enabled = item.value === currentApi.value;
  });
}

function handleSwitch(item: ApiItem) {
  // 只有当前项可以启用
  apiList.value.forEach(api => {
    api.enabled = api.value === item.value;
  });
  
  // 更新当前 API
  currentApi.value = item.value;
  
  // 保存到 localStorage
  localStorage.setItem('dev_api_base_url', item.value);
  
  // 更新 http 实例
  http.setBaseURL(item.value);
  
  // 检查是否是开发环境切换到生产环境
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(window.location.hostname);
  
  if (isDev && item.type === 'prod') {
    ElMessage.warning(`注意：在开发环境中切换到生产环境会有 CORS 限制。请确保生产环境服务器允许来自开发环境的请求，或使用代理。`);
  } else {
    ElMessage.success(`已切换到 ${item.label}，正在刷新页面...`);
  }
  
  // 自动刷新页面
  reloading.value = true;
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

function handleReload() {
  reloading.value = true;
  
  // 保存当前选择
  if (currentApi.value) {
    localStorage.setItem('dev_api_base_url', currentApi.value);
    http.setBaseURL(currentApi.value);
  }
  
  // 延迟刷新，给用户看到 loading 状态
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

// 清理旧的 localStorage 数据（将旧的 /api-prod 转换为完整 URL）
function cleanupOldStorage() {
  const stored = localStorage.getItem('dev_api_base_url');
  if (stored === '/api-prod') {
    localStorage.setItem('dev_api_base_url', PROD_BACKEND_URL);
  }
}

onMounted(() => {
  // 先清理旧的 localStorage 数据
  cleanupOldStorage();
  // 然后加载当前 API
  loadCurrentApi();
});
</script>

<style lang="scss" scoped>
.api-switch {
  padding: 10px;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  &__content {
    margin-bottom: 0;
  }
}

.api-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  
  &.is-active {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
  
  &__info {
    flex: 1;
    margin-right: 16px;
  }
  
  &__name {
    margin-bottom: 4px;
  }
  
  &__url {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }

  &__url-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__url-label {
    color: var(--el-text-color-secondary);
  }

  &__url-code {
    background-color: var(--el-fill-color);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    color: var(--el-color-primary);
  }

  &__url-separator {
    color: var(--el-text-color-placeholder);
  }

  &__url-link {
    word-break: break-all;
  }
}
</style>
