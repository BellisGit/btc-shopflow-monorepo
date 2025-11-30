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
      if (existing.readyState === 'complete') {
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

export async function callNumberAuthSdk(payload: NumberAuthSdkPayload): Promise<NumberAuthSdkResult> {
  await ensureNumberAuthSdkLoaded();

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

