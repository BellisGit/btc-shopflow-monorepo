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

declare global {
  interface Window {
    // 阿里云统一SDK（优先使用）
    PhoneNumberServer?: {
      checkLoginAvailable?: (options: {
        success: (res: any) => void;
        fail: (err: any) => void;
      }) => void;
      GetAuthToken: (options: {
        Url: string;
        Origin: string;
        SceneCode: string;
        success: (res: { TokenInfo?: { AccessToken?: string; JwtToken?: string }; AccessToken?: string; JwtToken?: string; [key: string]: any }) => void;
        fail: (err: any) => void;
      }) => void;
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

/**
 * 使用阿里云统一SDK进行号码认证
 */
async function callAliyunSdk(): Promise<NumberAuthSdkResult> {
  const aliyunSdk = window.PhoneNumberServer;
  if (!aliyunSdk) {
    throw new Error('未检测到阿里云号码认证 SDK');
  }

  return new Promise((resolve, reject) => {
    // 检查 GetAuthToken 方法是否存在
    if (typeof aliyunSdk.GetAuthToken !== 'function') {
      reject(new Error('阿里云SDK未提供 GetAuthToken 方法，请检查SDK版本'));
      return;
    }

    // 获取当前页面的 URL 和 Origin
    const currentUrl = window.location.href;
    const currentOrigin = window.location.origin;
    
    // SceneCode 可以从环境变量获取，如果没有则使用默认值
    // 可以通过 VITE_NUMBER_AUTH_SCENE_CODE 环境变量配置
    const sceneCode = (import.meta.env.VITE_NUMBER_AUTH_SCENE_CODE as string) || 'FC220000012320102';

    // 构建 GetAuthToken 的参数
    const getAuthTokenParams: any = {
      Url: currentUrl,
      Origin: currentOrigin,
      SceneCode: sceneCode,
      success: (res: any) => {
        // 阿里云SDK返回AccessToken或JwtToken，需要映射为spToken
        // 优先使用AccessToken，如果没有则使用JwtToken
        // 处理嵌套的TokenInfo对象
        const tokenInfo = res.TokenInfo || res.tokenInfo || res;
        const spToken = res.spToken 
          || tokenInfo.AccessToken 
          || tokenInfo.accessToken 
          || res.AccessToken 
          || res.accessToken 
          || tokenInfo.JwtToken 
          || tokenInfo.jwtToken 
          || res.JwtToken 
          || res.jwtToken 
          || res.token;
        
        if (!spToken) {
          reject(new Error('未能从SDK响应中获取token，响应数据：' + JSON.stringify(res)));
          return;
        }
        
        resolve({
          vendor: 'CM', // 占位值，实际由后端通过阿里云SDK验证
          method: 'getTokenInfo', // 占位值
          payload: {
            spToken,
            ...res,
          },
        });
      },
      fail: (err: any) => {
        const message = err?.msg || err?.message || err?.errorMessage || '获取登录token失败';
        reject(new Error(message));
      },
    };

    // 如果存在 checkLoginAvailable 方法，先检查登录是否可用
    if (typeof aliyunSdk.checkLoginAvailable === 'function') {
      aliyunSdk.checkLoginAvailable({
        success: () => {
          // 获取登录token，传递必要的参数
          aliyunSdk.GetAuthToken(getAuthTokenParams);
        },
        fail: (err: any) => {
          const message = err?.msg || err?.message || err?.errorMessage || '号码认证不可用';
          reject(new Error(message));
        },
      });
    } else {
      // 如果不存在 checkLoginAvailable，直接调用 GetAuthToken
      aliyunSdk.GetAuthToken(getAuthTokenParams);
    }
  });
}

export async function callNumberAuthSdk(payload: NumberAuthSdkPayload): Promise<NumberAuthSdkResult> {
  await ensureNumberAuthSdkLoaded();

  // 优先使用阿里云统一SDK
  if (isAliyunSdkAvailable()) {
    return callAliyunSdk();
  }

  // 兼容旧版本：使用运营商SDK
  const { vendor, method, data, extraOptions } = payload;

  return new Promise((resolve, reject) => {
    const success = (res: any) => {
      resolve({ vendor, method, payload: res });
    };

    const error = (err: any) => {
      const message = err?.msg || err?.message || '号码认证失败';
      reject(new Error(message));
    };

    const baseOptions = {
      ...(extraOptions || {}),
      data,
      success,
      error,
    };

    try {
      if (vendor === 'CM') {
        const cmSdk = window.YDRZAuthLogin;
        if (!cmSdk) {
          throw new Error('未检测到中国移动一键登录 SDK');
        }
        if (method === 'authGetToken') {
          cmSdk.authGetToken(baseOptions);
        } else {
          cmSdk.getTokenInfo(baseOptions);
        }
        return;
      }

      if (vendor === 'CU') {
        const cuSdk = window.LTRZ;
        if (!cuSdk) {
          throw new Error('未检测到中国联通一键登录 SDK');
        }
        cuSdk.getTokenInfo(baseOptions);
        return;
      }

      if (vendor === 'CT') {
        const ctSdk = window.fjs;
        if (!ctSdk) {
          throw new Error('未检测到中国电信一键登录 SDK');
        }
        ctSdk.getAccessCode({
          ...(extraOptions || {}),
          ...data,
          success,
          error,
        });
        return;
      }

      throw new Error('不支持的运营商类型');
    } catch (err: any) {
      reject(err instanceof Error ? err : new Error(err?.message || '号码认证调用失败'));
    }
  });
}

