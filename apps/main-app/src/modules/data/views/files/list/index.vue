<template>
  <div class="files-page">
    <btc-crud ref="crudRef" class="files-page" :service="fileService">
      <btc-row>
        <!-- 刷新按钮 -->
        <btc-refresh-btn />
        <el-button
          type="primary"
          :loading="loading"
          @click="handleUpload"
        >
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
        <el-button
          type="danger"
          :disabled="tableSelection.length === 0 || loading"
          :loading="loading"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          删除文件
        </el-button>

        <btc-flex1 />
        <!-- 关键字搜索 -->
        <btc-search-key />
      </btc-row>

      <btc-row>
        <!-- 数据表格 -->
        <btc-table
          ref="tableRef"
          :columns="columns"
          :autoHeight="true"
          border
          rowKey="id"
        >
          <template #op="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">
              下载
            </el-button>
            <el-button link type="danger" @click="handleDeleteSingle(row)">
              删除
            </el-button>
          </template>
        </btc-table>
      </btc-row>

      <btc-row>
        <btc-flex1 />
        <!-- 分页控件 -->
        <btc-pagination />
      </btc-row>
    </btc-crud>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="uploadVisible" title="上传文件" width="500px">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持单个或批量上传，单个文件不超过50MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadVisible = false">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="handleConfirmUpload">
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox, ElButton, ElDialog, ElUpload, ElIcon } from 'element-plus';
import { Upload, Delete, UploadFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'DataFilesList'
});

const { t } = useI18n();

// 加载状态
const loading = ref(false);
const uploading = ref(false);

// 获取crud实例
const crudRef = ref();
const tableRef = ref();
const uploadRef = ref();

// 上传对话框
const uploadVisible = ref(false);
const fileList = ref<any[]>([]);

// 从crud中获取选择状态
const tableSelection = computed(() => {
  return crudRef.value?.selection || [];
});

// 表格列配置
const columns = computed(() => [
  {
    type: 'selection'
  },
  {
    type: 'index',
    label: '序号',
    width: 60
  },
  {
    label: '文件名',
    prop: 'fileName',
    minWidth: 200
  },
  {
    label: '文件类型',
    prop: 'fileType',
    width: 120
  },
  {
    label: '文件大小',
    prop: 'fileSize',
    width: 120,
    formatter: (row: any) => {
      const size = row.fileSize || 0;
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  },
  {
    label: '上传人',
    prop: 'uploader',
    width: 120
  },
  {
    label: '上传时间',
    prop: 'uploadTime',
    width: 180
  },
  {
    label: '操作',
    prop: 'op',
    width: 200,
    fixed: 'right'
  }
]);

// 文件服务（模拟）
const fileService = {
  page: async (params: any) => {
    // TODO: 连接真实的后端服务
    // return http.post('/upload/file/list', params);
    
    // 模拟数据
    return {
      list: [],
      pagination: {
        page: 1,
        size: 20,
        total: 0
      }
    };
  },
  delete: async (id: string | number) => {
    await ElMessageBox.confirm('确定要删除该文件吗？', '提示', { type: 'warning' });
    // TODO: 连接真实的后端服务
    // return http.delete(`/upload/file/${id}`);
    return {};
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 个文件吗？`, '提示', { type: 'warning' });
    // TODO: 连接真实的后端服务
    // return http.delete('/upload/file/batch', { ids });
    return {};
  }
};

// 上传文件
const handleUpload = () => {
  uploadVisible.value = true;
  fileList.value = [];
};

// 文件选择变化
const handleFileChange = (file: any) => {
  // 文件已添加到文件列表
};

// 确认上传
const handleConfirmUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  uploading.value = true;
  try {
    // TODO: 连接真实的后端服务
    // const formData = new FormData();
    // fileList.value.forEach((file: any) => {
    //   formData.append('files', file.raw);
    // });
    // await http.post('/upload/files', formData);
    
    ElMessage.success('上传成功');
    uploadVisible.value = false;
    fileList.value = [];
    crudRef.value?.refresh();
  } catch (error) {
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

// 批量删除
const handleDelete = async () => {
  if (tableSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的文件');
    return;
  }

  loading.value = true;
  try {
    const ids = tableSelection.value.map((item: any) => item.id);
    await fileService.deleteBatch(ids);
    ElMessage.success('删除成功');
    crudRef.value?.refresh();
  } catch (error) {
    ElMessage.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 单个删除
const handleDeleteSingle = async (row: any) => {
  loading.value = true;
  try {
    await fileService.delete(row.id);
    ElMessage.success('删除成功');
    crudRef.value?.refresh();
  } catch (error) {
    ElMessage.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 下载文件
const handleDownload = (row: any) => {
  // TODO: 连接真实的后端服务
  // const link = document.createElement('a');
  // link.href = `/api/upload/file/${row.id}/download`;
  // link.download = row.fileName;
  // link.click();
  
  ElMessage.info('下载功能待实现');
};

</script>

<style lang="scss" scoped>
.files-page {
  height: 100%;
  box-sizing: border-box;

  .upload-demo {
    :deep(.el-upload) {
      width: 100%;
    }
  }
}
</style>

