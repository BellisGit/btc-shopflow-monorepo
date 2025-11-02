import { ElMessage } from 'element-plus';
import type { UploadOptions, UploadResponse } from '../types';

/**
 * 文件上传 composable
 */
export function useUpload(service?: any) {
  /**
   * 上传文件
   */
  async function toUpload(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const { uploadType = 'file', onProgress } = options;

    if (!service) {
      throw new Error('上传服务未提供，请确保 service 已正确注入');
    }

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      let response;

      // 根据上传类型选择服务
      if (uploadType === 'avatar') {
        // 头像上传：使用 service.system.file.avatar（prefix: "admin/system/file/avatar"）
        // 根据 EPS 配置，路径为 system.file.avatar，方法名为 avatar
        const avatarService = service.system?.file?.avatar;
        if (!avatarService) {
          throw new Error('头像上传服务不可用，请检查 service.system.file.avatar 是否存在');
        }
        if (typeof avatarService.avatar !== 'function') {
          throw new Error('头像上传方法不可用，请检查 service.system.file.avatar.avatar 是否存在');
        }
        // 调用 avatar 服务的 avatar 方法（根据 API 配置，方法名为 avatar）
        response = await avatarService.avatar(formData);
      } else {
        // 普通文件上传：使用 service.system.file.upload
        const fileService = service.system?.file?.upload;
        if (!fileService) {
          throw new Error('文件上传服务不可用，请检查 service.system.file.SysFileAssetEntity 是否存在');
        }
        response = await fileService.upload(formData);
      }

      // 处理响应，获取 URL
      // 根据实际 API 响应结构调整
      let url = '';
      if (typeof response === 'string') {
        url = response;
      } else if (response?.url) {
        url = response.url;
      } else if (response?.data?.url) {
        url = response.data.url;
      } else if (response?.data) {
        url = response.data;
      }

      if (!url) {
        throw new Error('上传成功，但未获取到文件地址');
      }

      // 模拟进度完成
      onProgress?.(100);

      return {
        url,
        fileId: Date.now().toString()
      };
    } catch (error: any) {
      const errorMessage = error?.message || '文件上传失败';
      ElMessage.error(errorMessage);
      throw error;
    }
  }

  return {
    toUpload
  };
}
