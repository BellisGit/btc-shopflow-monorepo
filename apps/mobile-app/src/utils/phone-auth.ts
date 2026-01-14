import { logger } from '@btc/shared-core';
import { requestAdapter } from './requestAdapter';
import { showToast, showLoadingToast, closeToast } from 'vant';
import axios from 'axios';

/**
 * 获取动态 baseURL（与 http.ts 中的逻辑保持一致）
 */
function getDynamicBaseURL(): string {
  // 优先使用环境变量（使用 try-catch 避免生产环境 import.meta 问题）
  try {
    const env = (import.meta as any).env;
    if (env?.VITE_API_BASE_URL) {
      return env.VITE_API_BASE_URL;
    }
    // 允许通过 VITE_DIRECT_API_BASE_URL 指向特定调试地址（需自行信任证书）
    if (env?.VITE_DIRECT_API_BASE_URL) {
      return env.VITE_DIRECT_API_BASE_URL;
    }
  } catch (e) {
    // 运行时无法访问 import.meta 时（如真机 WebView），统一走 /api（由 Nginx 代理）
    return '/api';
  }

  // 默认：全部走 /api，让 Nginx 处理真正的后端地址，避免浏览器证书错误
  return '/api';
}

/**
 * 创建独立的 axios 实例用于一键登录接口
 * 此实例不携带任何 cookie 和 Authorization header
 * 使用根路径作为 baseURL，路径中包含完整的 /api 前缀
 */
const numberAuthAxios = axios.create({
  baseURL: '/', // 使用根路径，路径中包含完整的 /api 前缀
  timeout: 120000,
  withCredentials: false, // 明确不携带 cookie
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
});

// 请求拦截器：确保不添加任何认证信息
numberAuthAxios.interceptors.request.use(
  (config: any) => {
    // 确保 baseURL 是根路径
    config.baseURL = '/';
    numberAuthAxios.defaults.baseURL = '/';

    // 删除可能存在的 Authorization header
    delete config.headers['Authorization'];
    // 确保不携带 cookie
    config.withCredentials = false;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：只处理基本错误
numberAuthAxios.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 动态导入SDK模块
let phoneNumberServerModule: any = null;

// 创建 SDK 实例（全局单例）
let phoneNumberServerInstance: any = null;

/**
 * 动态加载SDK模块（优先使用本地文件）
 */
const loadSDK = async (): Promise<void> => {
  if (phoneNumberServerModule) {
    return;
  }

  try {
    // 优先使用本地文件（通过script标签在index.html中引入）
    if (typeof window !== 'undefined') {
      // 检查全局对象中是否有SDK导出
      // 通常压缩后的SDK会在window对象上暴露
      const globalSDK = (window as any).PhoneNumberServer ||
        (window as any).aliyun_numberauthsdk_web ||
        (window as any).default;

      if (globalSDK) {
        // 如果直接是类，包装成模块格式
        if (typeof globalSDK === 'function') {
          phoneNumberServerModule = { PhoneNumberServer: globalSDK };
          return;
        }
        // 如果是对象且包含PhoneNumberServer
        if (globalSDK.PhoneNumberServer) {
          phoneNumberServerModule = globalSDK;
          return;
        }
      }
    }

    // 如果本地文件未加载，抛出错误（不使用npm包，因为使用本地SDK文件）
    throw new Error('本地SDK未找到，请确认已正确加载SDK文件');
  } catch (error) {
    logger.error('SDK加载失败:', error);
    throw new Error('阿里云号码认证SDK加载失败，请检查SDK文件是否存在');
  }
};

/**
 * 获取 SDK 实例
 */
export const getPhoneNumberServer = async (): Promise<any> => {
  await loadSDK();

  if (!phoneNumberServerInstance && phoneNumberServerModule) {
    const PhoneNumberServerClass = phoneNumberServerModule.PhoneNumberServer;
    phoneNumberServerInstance = new PhoneNumberServerClass();
  }

  if (!phoneNumberServerInstance) {
    throw new Error('无法创建PhoneNumberServer实例');
  }

  return phoneNumberServerInstance;
};

/**
 * AuthToken 响应数据
 */
export interface AuthTokenResponse {
  accessToken: string;
  jwtToken: string;
}

/**
 * 从后端获取 accessToken 和 jwtToken
 * 后端需要调用阿里云的 GetAuthToken 接口
 */
export const getAuthTokens = async (): Promise<AuthTokenResponse> => {
  try {
    // 使用独立的 axios 实例，确保不携带 cookie
    // 注意：响应拦截器返回 response.data，所以这里的 response 已经是响应体数据
    // 使用类型断言，因为响应拦截器已经返回了 response.data
    const response = (await numberAuthAxios.post<{
      code: number;
      msg: string;
      data: AuthTokenResponse;
    }>('/api/system/auth/getAuthToken', {})) as unknown as {
      code: number;
      msg: string;
      data: AuthTokenResponse;
    };

    if (response.code === 200 && response.data) {
      // 验证返回的数据是否有效
      if (!response.data.accessToken || !response.data.jwtToken) {
        throw new Error('服务器返回的Token数据不完整');
      }

      return {
        accessToken: response.data.accessToken,
        jwtToken: response.data.jwtToken,
      };
    } else {
      throw new Error(response.msg || '获取认证Token失败');
    }
  } catch (error: any) {
    logger.error('获取AuthToken失败:', error);

    // 处理编码相关错误
    if (error.message && error.message.includes('Malformed UTF-8')) {
      throw new Error('服务器返回的数据编码错误，请检查后端接口配置');
    } else if (error.message && error.message.includes('encoding')) {
      throw new Error('数据编码错误，请联系后端开发人员');
    } else if (error.message && error.message.includes('JSON')) {
      throw new Error('服务器返回的数据格式错误，请检查后端接口');
    }

    // 重新抛出原始错误或包装错误
    if (error.message) {
      throw error;
    } else {
      throw new Error('获取认证Token失败，请稍后重试');
    }
  }
};

/**
 * 通过 spToken 获取手机号并完成登录（使用独立的 axios 实例，不携带 cookie）
 */
export const getPhoneWithToken = async (spToken: string): Promise<any> => {
  try {
    const response = await numberAuthAxios.post<{
      code: number;
      msg: string;
      data: any;
    }>('/api/system/auth/getPhoneWithToken', { spToken });

    return response;
  } catch (error: any) {
    logger.error('获取手机号失败:', error);
    throw error;
  }
};

