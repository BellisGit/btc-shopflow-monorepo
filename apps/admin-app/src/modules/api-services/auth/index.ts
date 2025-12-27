/**
 * 认证相关 API 服务
 * 提供登录、注册、密码重置等认证相关的 API 调用方法
 */

import { requestAdapter } from '@/utils/requestAdapter';
import type {
  LoginResponse,
  CaptchaResponse,
  UserCheckResponse,
  VerifyCodeRequest,
  LoginRequest,
  SmsLoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  LogoutBatchRequest
} from '../types';

/**
 * 认证 API 基础路径
 */
const baseUrl = '/system/auth';

/**
 * 认证 API 服务对象
 * 使用对象方法的形式，提供所有认证相关的 API 调用
 */
export const authApi = {
  /**
   * 获取验证码
   * @param params 验证码参数（高度、宽度、颜色等）
   * @returns 验证码信息（包含 captchaId 和图片数据）
   */
  getCaptcha(params?: { height?: number; width?: number; color?: string }): Promise<CaptchaResponse> {
    return requestAdapter.get(`${baseUrl}/captcha`, params);
  },

  /**
   * 发送邮箱验证码
   * @param data 邮箱和验证码类型
   * @returns Promise<void>
   */
  sendEmailCode(data: { email: string; type?: string }): Promise<void> {
    return requestAdapter.post(`${baseUrl}/code/email/send`, data, { notifySuccess: false });
  },

  /**
   * 发送手机号验证码
   * @param data 手机号和验证码类型
   * @returns Promise<void>
   */
  sendSmsCode(data: { phone: string; smsType?: string }): Promise<void> {
    return requestAdapter.post(`${baseUrl}/code/sms/send`, data, { notifySuccess: false });
  },

  /**
   * 用户检查（检查用户登录状态，不属于 EPS 请求）
   * @returns 用户状态信息
   */
  userCheck(): Promise<UserCheckResponse> {
    return requestAdapter.get(`${baseUrl}/user-check`);
  },

  /**
   * 登录（账号密码）
   * @param data 登录信息（用户名、密码、验证码等）
   * @returns 登录响应（包含 token 和用户信息）
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return requestAdapter.post(`${baseUrl}/login`, data, { notifySuccess: false });
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
   * 退出登录
   * @returns Promise<void>
   */
  logout(): Promise<void> {
    return requestAdapter.get(`${baseUrl}/logout`);
  },

  /**
   * 批量退出登录
   * @param data 用户ID列表
   * @returns Promise<void>
   */
  logoutBatch(data: LogoutBatchRequest): Promise<void> {
    return requestAdapter.post(`${baseUrl}/logout/batch`, data, { notifySuccess: false });
  },

  /**
   * 用户注册
   * @param data 注册信息（用户名、手机号、密码、验证码等）
   * @returns Promise<void>
   */
  register(data: RegisterRequest): Promise<void> {
    return requestAdapter.post(`${baseUrl}/register`, data, { notifySuccess: false });
  },

  /**
   * 重置密码
   * @param data 重置密码信息（手机号、验证码、新密码）
   * @returns Promise<void>
   */
  resetPassword(data: ResetPasswordRequest): Promise<void> {
    return requestAdapter.post(`${baseUrl}/reset/password`, data, { notifySuccess: false });
  },

  /**
   * 验证码校验
   * @param data 验证码ID和验证码值
   * @returns Promise<void>
   */
  verifyCode(data: VerifyCodeRequest): Promise<void> {
    return requestAdapter.post(`${baseUrl}/verify/code`, data, { notifySuccess: false });
  },

  /**
   * 验证短信验证码（用于身份验证，不登录）
   * @param data 手机号和短信验证码
   * @returns Promise<void>
   */
  verifySmsCode(data: { phone: string; smsCode: string; smsType?: string }): Promise<void> {
    return requestAdapter.post(`${baseUrl}/verify/sms`, data, { notifySuccess: false });
  },

  /**
   * 验证邮箱验证码（用于身份验证）
   * @param data 邮箱和验证码
   * @returns Promise<void>
   */
  verifyEmailCode(data: { email: string; emailCode: string; type?: string }): Promise<void> {
    return requestAdapter.post(`${baseUrl}/verify/email`, data, { notifySuccess: false });
  }
};

