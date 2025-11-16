# 13.7 - 文件上传插件

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 13.6

## 🎯 任务目标

开发文件上传插件，支持图片、文件上传和管理。

## 📋 执行步骤

### 1. 创建插件

**packages/main-app/src/plugins/upload/index.ts**:
```typescript
import type { Plugin } from '@btc/shared-core';
import axios from 'axios';

export interface UploadOptions {
  url?: string;
  maxSize?: number; // MB
  accept?: string[];
  onProgress?: (percent: number) => void;
}

export const UploadPlugin: Plugin = {
  name: 'upload',
  version: '1.0.0',

  install(app, options) {
    const defaultOptions = {
      url: '/api/upload',
      maxSize: 10,
      ...options,
    };

    app.config.globalProperties.$upload = (file: File, opts?: UploadOptions) =>
      uploadFile(file, { ...defaultOptions, ...opts });
    
    app.provide('uploadConfig', defaultOptions);
  },

  composables: {
    useUpload: () => ({
      uploadFile,
      uploadImage,
      uploadFiles,
    }),
  },
};

// 上传单个文件
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const {
    url = '/api/upload',
    maxSize = 10,
    accept = [],
    onProgress,
  } = options;

  // 文件大小验证
  if (file.size > maxSize * 1024 * 1024) {
    throw new Error(`文件大小不能超过 ${maxSize}MB`);
  }

  // 文件类型验证
  if (accept.length > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !accept.includes(ext)) {
      throw new Error(`只支持 ${accept.join(', ')} 格式`);
    }
  }

  // 创建 FormData
  const formData = new FormData();
  formData.append('file', file);

  // 上传
  const response = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });

  return response.data.url;
}

// 上传图片（带压缩）
export async function uploadImage(
  file: File,
  options: UploadOptions & { compress?: boolean; quality?: number } = {}
): Promise<string> {
  let uploadFile = file;

  // 图片压缩
  if (options.compress !== false) {
    uploadFile = await compressImage(file, options.quality || 0.8);
  }

  return uploadFile(uploadFile, {
    ...options,
    accept: options.accept || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  });
}

// 批量上传
export async function uploadFiles(
  files: FileList | File[],
  options: UploadOptions = {}
): Promise<string[]> {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => uploadFile(file, options));
  return Promise.all(promises);
}

// 图片压缩
async function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
    };
    
    reader.readAsDataURL(file);
  });
}
```

### 2. 注册插件

**src/main.ts**:
```typescript
import { UploadPlugin } from './plugins/upload';

pluginManager.register(UploadPlugin, {
  url: '/api/upload',
  maxSize: 10,
});
```

### 3. 创建上传组件

**packages/shared-components/src/plugins/upload/index.vue**:
```vue
<template>
  <div class="upload-component">
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :file-list="fileList"
      :limit="limit"
      :accept="accept"
      :list-type="listType"
    >
      <el-button v-if="listType === 'text'" type="primary">
        <el-icon><Upload /></el-icon>
        选择文件
      </el-button>
      <el-icon v-else class="upload-icon"><Plus /></el-icon>
      
      <template #tip>
        <div class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile, UploadFiles } from 'element-plus';

const props = defineProps<{
  modelValue?: string | string[];
  uploadUrl?: string;
  maxSize?: number;
  accept?: string;
  limit?: number;
  listType?: 'text' | 'picture' | 'picture-card';
}>();

const emit = defineEmits(['update:modelValue', 'success', 'error']);

const fileList = ref<UploadFile[]>([]);

const tip = computed(() => {
  const size = props.maxSize || 10;
  return `支持 ${props.accept || '所有格式'}，大小不超过 ${size}MB`;
});

const handleBeforeUpload = (file: File) => {
  const maxSize = props.maxSize || 10;
  
  if (file.size > maxSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${maxSize}MB`);
    return false;
  }
  
  return true;
};

const handleSuccess = (response: any, file: UploadFile) => {
  const url = response.data.url;
  
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [...props.modelValue, url]);
  } else {
    emit('update:modelValue', url);
  }
  
  emit('success', url);
  ElMessage.success('上传成功');
};

const handleError = (error: Error) => {
  emit('error', error);
  ElMessage.error('上传失败');
};

const handleProgress = (event: any) => {
  // 上传进度
};
</script>

<style scoped>
.upload-component {
  width: 100%;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 4. 在表单中使用

**在 CRUD 配置中**:
```typescript
export default {
  upsert: {
    items: [
      {
        prop: 'avatar',
        label: '头像',
        component: 'BtcUpload',
        componentProps: {
          listType: 'picture-card',
          accept: '.jpg,.png',
          maxSize: 2,
        },
      },
      {
        prop: 'attachments',
        label: '附件',
        component: 'BtcUpload',
        componentProps: {
          limit: 5,
          multiple: true,
        },
      },
    ],
  },
} as CrudConfig;
```

### 5. 使用 Composable

```vue
<script setup lang="ts">
import { useUpload } from '@/plugins/upload';

const { uploadFile, uploadImage } = useUpload();

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const url = await uploadImage(file, {
      compress: true,
      quality: 0.8,
      onProgress: (percent) => {
        console.log('上传进度:', percent);
      },
    });
    
    console.log('上传成功:', url);
  } catch (error) {
    console.error('上传失败:', error);
  }
};
</script>
```

## ✅ 验收标准

### 检查 1: 单文件上传

```vue
<template>
  <BtcUpload
    v-model="avatar"
    :maxSize="2"
    accept=".jpg,.png"
  />
</template>

<script setup lang="ts">
const avatar = ref('');
// 预期: 上传成功后 avatar 为文件URL
</script>
```

### 检查 2: 多文件上传

```vue
<template>
  <BtcUpload
    v-model="files"
    :limit="5"
    multiple
  />
</template>

<script setup lang="ts">
const files = ref<string[]>([]);
// 预期: 上传成功后 files 为 URL 数组
</script>
```

## 📝 检查清单

- [ ] 插件创建
- [ ] 单文件上传
- [ ] 批量上传
- [ ] 图片压缩
- [ ] 文件验证
- [ ] 进度显示
- [ ] 组件封装
- [ ] CRUD 集成
- [ ] 功能正常

## 🔗 下一步

- [14 - 数据字典系统](./14-dict-system.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

