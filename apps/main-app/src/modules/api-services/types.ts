/**
 * API 服务类型定义
 * 定义通用的请求和响应类型接口
 */

/**
 * 登录响应类型
 * 注意：token 实际存储在 cookie 中（字段名：access_token），不在响应体中
 */
export interface LoginResponse {
  user?: {
    id: string;
    username: string;
    phone?: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any; // 允许其他字段，但 token 在 cookie 中
}

/**
 * 验证码响应类型
 */
export interface CaptchaResponse {
  captchaId: string;
  data: string; // base64 或 svg 格式的验证码图片数据
}

/**
 * 健康检查响应类型
 */
export interface HealthCheckResponse {
  status: string;
  timestamp?: number;
  [key: string]: any;
}

/**
 * 刷新 Token 响应类型
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * 验证码校验请求参数
 */
export interface VerifyCodeRequest {
  captchaId: string;
  captcha: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captcha?: string;
}

/**
 * 短信登录请求参数
 */
export interface SmsLoginRequest {
  phone: string;
  smsCode: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  emailCode?: string;
  smsCode?: string;
}

/**
 * 重置密码请求参数
 */
export interface ResetPasswordRequest {
  phone: string;
  smsCode: string;
  newPassword: string;
}

/**
 * 发送验证码请求参数
 */
export interface SendCodeRequest {
  phone?: string;
  email?: string;
  type?: string; // 'login' | 'register' | 'reset-password' | 'forgot' 等
}

/**
 * 批量退出登录请求参数
 */
export interface LogoutBatchRequest {
  userIds: string[];
}

