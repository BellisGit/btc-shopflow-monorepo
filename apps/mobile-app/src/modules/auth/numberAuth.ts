import type { NumberAuthMethod, NumberAuthVendor } from '@/types/numberAuth';

export interface NumberAuthSdkPayload {
  vendor: NumberAuthVendor;
  method: NumberAuthMethod;
  data: Record<string, any>;
  extraOptions?: Record<string, any>;
}

export interface NumberAuthSdkResult {
  vendor: NumberAuthVendor;
  method: NumberAuthMethod;
  /** 原始的 SDK 返回数据，交由后端做校验 */
  payload: any;
}

/**
 * 授权页配置选项
 */
export interface AuthPageOption {
  style?: {
    zIndex?: number;
  };
  logoImg?: string;
  title?: string;
  loginBtnText?: string;
  protocolList?: Array<{
    name: string;
    url: string;
  }>;
  [key: string]: any;
}

declare global {
  interface Window {
    // 阿里云统一SDK（优先使用）
    PhoneNumberServer?: {
      checkLoginAvailable?: (options: {
        accessToken: string;
        jwtToken: string;
        success: (res: any) => void;
        fail: (err: any) => void;
      }) => void;
      getLoginToken?: (options: {
        authPageOption?: AuthPageOption;
        timeout?: number;
        success: (res: { spToken?: string; pToken?: string; [key: string]: any }) => void;
        error: (err: any) => void;
        watch?: (status: any, data: any) => void;
        protocolPageWatch?: (status: any, data: any) => void;
        previewPrivacyWatch?: (status: any, data: any) => void;
        privacyAlertWatch?: (status: any, data: any) => void;
      }) => void;
      GetAuthToken: (options: {
        Url: string;
        Origin: string;
        SceneCode: string;
        success: (res: { TokenInfo?: { AccessToken?: string; JwtToken?: string }; AccessToken?: string; JwtToken?: string; [key: string]: any }) => void;
        fail: (err: any) => void;
      }) => void;
      closeLoginPage?: () => void;
      [key: string]: any; // 允许其他方法
    };
    // 运营商SDK（兼容旧版本）
    YDRZAuthLogin?: {
      getTokenInfo(options: Record<string, any>): void;
      authGetToken(options: Record<string, any>): void;
    };
    LTRZ?: {
      getTokenInfo(options: Record<string, any>): void;
    };
    fjs?: {
      getAccessCode(options: Record<string, any>): void;
      setSign?(sign: string): void;
    };
  }
}

const SDK_SRC = '/libs/number-auth/numberAuth-web-sdk.js';
let sdkPromise: Promise<void> | null = null;

function injectScript(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('号码认证 SDK 仅支持在浏览器环境加载'));
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-number-auth-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('号码认证 SDK 脚本加载失败')));
      if ((existing as HTMLScriptElement & { readyState?: string }).readyState === 'complete') {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.dataset.numberAuthSdk = 'true';
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('号码认证 SDK 脚本加载失败')));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export async function ensureNumberAuthSdkLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('号码认证 SDK 仅支持浏览器环境');
  }
  if (window.location?.protocol !== 'https:' && !import.meta.env.DEV) {
    throw new Error('号码认证需要 HTTPS 环境');
  }
  await injectScript();
}

/**
 * 检测是否使用阿里云统一SDK
 */
export function isAliyunSdkAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!window.PhoneNumberServer;
}

/**
 * 自动检测可用的运营商SDK
 * 优先使用阿里云统一SDK，否则检测各运营商SDK
 */
export function detectAvailableVendor(): NumberAuthVendor | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // 如果使用阿里云SDK，返回一个默认值（后端会根据实际情况处理）
  if (window.PhoneNumberServer) {
    // 阿里云SDK会自动处理运营商，这里返回一个占位值
    // 实际使用时，后端会通过阿里云SDK验证
    return 'CM'; // 占位值，实际由阿里云SDK处理
  }

  // 检测中国移动
  if (window.YDRZAuthLogin) {
    return 'CM';
  }

  // 检测中国联通
  if (window.LTRZ) {
    return 'CU';
  }

  // 检测中国电信
  if (window.fjs) {
    return 'CT';
  }

  return null;
}

/**
 * 获取默认的SDK调用方法
 */
export function getDefaultMethod(vendor: NumberAuthVendor): NumberAuthMethod {
  if (vendor === 'CM') {
    return 'getTokenInfo';
  }
  if (vendor === 'CU') {
    return 'getTokenInfo';
  }
  if (vendor === 'CT') {
    return 'getAccessCode';
  }
  return 'getTokenInfo';
}

// 注意：旧的错误实现逻辑已删除
// 现在应该使用 utils/phone-auth.ts 中的实现（getPhoneNumberServer + getAuthTokens + checkLoginAvailable + getLoginToken）
// 该文件仅保留一些基础工具函数和类型定义

/**
 * 检测是否使用阿里云统一SDK（工具函数，供其他模块使用）
 */
export function isAliyunSdkAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!window.PhoneNumberServer;
}

