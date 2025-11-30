/**
 * 认证相关 API 服务
 * 提供登录、注册、密码重置等认证相关的 API 调用方法
 */

import { requestAdapter } from '@/utils/requestAdapter';
import type { NumberAuthConfigResponse, NumberAuthLoginRequest } from '@/types/numberAuth';

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
  access_token?: string; // 后端返回的字段名（下划线）
  accessToken?: string; // 驼峰命名
  token?: string; // 通用 token 字段
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
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  phone: string;
  smsCode: string;
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
   * @param data 手机号和验证码类型（'login' | 'register' | 'reset' 等）
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

  /**
   * 用户注册
   * @param data 用户名、手机号和短信验证码
   * @returns 注册响应（包含 token 和用户信息）
   */
  register(data: RegisterRequest): Promise<LoginResponse> {
    return requestAdapter.post(`${baseUrl}/register`, data, { notifySuccess: false });
  },

  /**
   * 退出登录
   * @returns Promise<void>
   */
  logout(): Promise<void> {
    return requestAdapter.get(`${baseUrl}/logout`);
  },

  /**
   * 获取号码认证 SDK 所需的初始化参数
   */
  getNumberAuthConfig(): Promise<NumberAuthConfigResponse> {
    return requestAdapter.get(`${baseUrl}/number-auth/config`, { notifySuccess: false });
  },

  /**
   * 号码认证登录
   */
  loginByNumberAuth(data: NumberAuthLoginRequest): Promise<LoginResponse> {
    return requestAdapter.post(`${baseUrl}/number-auth/login`, data, { notifySuccess: false });
  },
};

