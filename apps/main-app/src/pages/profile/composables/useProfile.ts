/**
 * 个人信息页面业务逻辑
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { service } from '@services/eps';
import { http } from '@/utils/http';
import { appStorage } from '@/utils/app-storage';

/**
 * 个人信息 composable
 */
export function useProfile() {
  // 用户信息
  const userInfo = ref<any>({});
  const loading = ref(false);
  const showFullInfo = ref(false);

  /**
   * 加载用户信息
   * @param showFull 是否显示完整信息（true=明文，false=脱敏）
   */
  const loadUserInfo = async (showFull = false) => {
    // 优先从统一存储读取缓存
    const cachedAvatar = appStorage.user.getAvatar();
    const cachedName = appStorage.user.getName();
    if (cachedAvatar || cachedName) {
      userInfo.value = {
        ...userInfo.value,
        ...(cachedAvatar && { avatar: cachedAvatar }),
        ...(cachedName && { name: cachedName }),
      };
    }

    loading.value = true;
    try {
      // 根据 prefix: admin/system/base/profile，服务路径应该是 system.base.profile
      const profileService = service.system?.base?.profile;
      if (!profileService) {
        console.error('profileService 不存在，可用服务:', service.system?.base);
        ElMessage.warning('用户信息服务不可用');
        return;
      }

      let data: any;

      // 如果需要传递 showFull 参数，需要修改 URL
      if (showFull) {
        // 由于 EPS 生成的 info 方法通过闭包调用 request()，我们无法直接拦截 http.request
        // 方案：直接包装 profileService.info 方法，从函数代码中提取 URL，然后直接调用 http.request

        // 保存原始的 info 方法
        const originalInfo = profileService.info;

        // 从原始 info 的代码中提取 URL（动态获取，不硬编码）
        const infoCode = originalInfo.toString();
        const urlMatch = infoCode.match(/url:\s*["']([^"']+)["']/);
        let url = urlMatch ? urlMatch[1] : null;

        if (!url) {
          console.error('[Profile] 无法从 info 代码中提取 URL，代码:', infoCode);
          ElMessage.warning('无法加载完整信息');
          data = await profileService.info();
          userInfo.value = data || {};
          return;
        }

        // 添加 showFull 参数
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}showFull=true`;

        // 包装 info 方法，直接使用 http.request 调用
        profileService.info = async function(data?: any) {
          return http.request({
            url,
            method: 'GET'
          });
        };

        try {
          // 调用包装后的 info 方法
          data = await profileService.info();
          userInfo.value = data || {};
          
          // 更新统一存储（头像和用户名）
          if (data?.avatar) {
            appStorage.user.setAvatar(data.avatar);
          }
          if (data?.name) {
            appStorage.user.setName(data.name);
          }
          
          // 触发同步事件，通知顶栏更新
          window.dispatchEvent(new CustomEvent('userInfoUpdated', {
            detail: {
              avatar: data?.avatar,
              name: data?.name
            }
          }));
        } finally {
          // 恢复原始的 info 方法
          profileService.info = originalInfo;
        }
      } else {
        // 直接调用，不需要参数
        data = await profileService.info();
        userInfo.value = data || {};
        
        // 更新统一存储（头像和用户名）
        if (data?.avatar) {
          appStorage.user.setAvatar(data.avatar);
        }
        if (data?.name) {
          appStorage.user.setName(data.name);
        }
        
        // 触发同步事件，通知顶栏更新
        window.dispatchEvent(new CustomEvent('userInfoUpdated', {
          detail: {
            avatar: data?.avatar,
            name: data?.name
          }
        }));
      }
    } catch (error: any) {
      console.error('加载用户信息失败:', error);
      ElMessage.error(error?.message || '加载用户信息失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 切换显示完整信息
   */
  const handleToggleShowFull = () => {
    showFullInfo.value = !showFullInfo.value;
    loadUserInfo(showFullInfo.value);
  };

  return {
    userInfo,
    loading,
    showFullInfo,
    loadUserInfo,
    handleToggleShowFull
  };
}

