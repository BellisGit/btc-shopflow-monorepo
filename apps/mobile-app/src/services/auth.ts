/**
 * 认证相关 API 服务
 * 提供登录、注册、密码重置等认证相关的 API 调用方法
 */

import { requestAdapter } from '@/utils/requestAdapter';

/**
 * 登录响应类型
 */
export interface LoginResponse {
  user?: {
    id: string;
    username: string;
    phone?: string;
    email?: string;
    [key: string]: any;
  };
  token?: string;
  accessToken?: string;
  [key: string]: any;
}

/**
 * 短信登录请求参数
 */
export interface SmsLoginRequest {
  phone: string;
  smsCode: string;
  smsType?: string; // 'login' | 'reset' 等，用于区分验证码类型
}

/**
 * 认证 API 基础路径
 */
const baseUrl = '/system/auth';

/**
 * 认证 API 服务对象
 */
export const authApi = {
  /**
   * 发送手机号验证码
   * @param data 手机号和验证码类型
   * @returns Promise<void>
   */
  sendSmsCode(data: { phone: string; smsType?: string }): Promise<void> {
    return requestAdapter.post(`${baseUrl}/code/sms/send`, data, { notifySuccess: false });
  },

  /**
   * 手机号登录
   * @param data 手机号和短信验证码
   * @returns 登录响应（包含 token 和用户信息）
   */
  loginBySms(data: SmsLoginRequest): Promise<LoginResponse> {
    return requestAdapter.post(`${baseUrl}/login/sms`, data, { notifySuccess: false });
  },
};

