/**
 * BTC Shop Flow 3.0 响应拦截器工具
 * 根据项目响应状态码文档实现统一的响应处理
 */

// messageManager 现在由外部提供，不再从本地导入

// 获取全局消息管理器的辅助函数
function getMessageManager() {
  return (window as any).messageManager;
}

// 消息显示接口，由外部实现
export interface MessageHandler {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// 确认对话框接口，由外部实现
export interface ConfirmHandler {
  confirm: (message: string, title?: string) => Promise<boolean>;
}

// 路由跳转接口，由外部实现
export interface RouterHandler {
  push: (path: string) => void;
}

// 响应数据结构
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  total?: number;
  token?: string;
}

// 状态码处理配置
interface StatusCodeConfig {
  code: number;
  message: string;
  action: 'show' | 'redirect' | 'silent' | 'confirm';
  redirectPath?: string;
  showType?: 'error' | 'warning' | 'success' | 'info';
}

// 状态码配置映射
const STATUS_CODE_CONFIG: Record<number, StatusCodeConfig> = {
  // 成功状态码
  200: {
    code: 200,
    message: '操作成功',
    action: 'silent',
    showType: 'success'
  },

  // 通用错误状态码
  400: {
    code: 400,
    message: '操作失败',
    action: 'show',
    showType: 'error'
  },
  500: {
    code: 500,
    message: '操作失败',
    action: 'show',
    showType: 'error'
  },
  501: {
    code: 501,
    message: '系统繁忙，请稍候再试',
    action: 'show',
    showType: 'error'
  },

  // 认证相关状态码
  401: {
    code: 401,
    message: '身份已过期，请重新登录',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning'
  },
  410: {
    code: 410,
    message: '该用户不存在,请先注册',
    action: 'show',
    showType: 'error'
  },
  511: {
    code: 511,
    message: '登录失败，未获取到令牌',
    action: 'show',
    showType: 'error'
  },
  517: {
    code: 517,
    message: '身份令牌已过期',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning'
  },
  518: {
    code: 518,
    message: '获取到的身份令牌为空',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning'
  },

  // 数据相关状态码
  510: {
    code: 510,
    message: '数据为空',
    action: 'show',
    showType: 'warning'
  },
  522: {
    code: 522,
    message: '参数不能为空',
    action: 'show',
    showType: 'error'
  },
  523: {
    code: 523,
    message: '数据错误',
    action: 'show',
    showType: 'error'
  },

  // 用户管理相关状态码
  520: {
    code: 520,
    message: '没有该工号',
    action: 'show',
    showType: 'error'
  },
  521: {
    code: 521,
    message: '初始密码错误',
    action: 'show',
    showType: 'error'
  },
  524: {
    code: 524,
    message: '账号已存在',
    action: 'show',
    showType: 'error'
  },
  526: {
    code: 526,
    message: '表单id过期',
    action: 'show',
    showType: 'error'
  },
  527: {
    code: 527,
    message: '手机号不存在',
    action: 'show',
    showType: 'error'
  },
  529: {
    code: 529,
    message: '邮箱不存在',
    action: 'show',
    showType: 'error'
  },

  // 验证码相关状态码
  528: {
    code: 528,
    message: '验证码已过期',
    action: 'show',
    showType: 'error'
  },

  // Keycloak相关状态码
  512: {
    code: 512,
    message: 'keycloak客户端地址错误',
    action: 'show',
    showType: 'error'
  },
  513: {
    code: 513,
    message: '获取领域失败',
    action: 'show',
    showType: 'error'
  },
  514: {
    code: 514,
    message: '获取客户端id失败',
    action: 'show',
    showType: 'error'
  },
  515: {
    code: 515,
    message: '获取客户端密钥失败',
    action: 'show',
    showType: 'error'
  },
  516: {
    code: 516,
    message: '连接keycloak失败',
    action: 'show',
    showType: 'error'
  }
};


/**
 * 响应拦截器类
 */
export class ResponseInterceptor {
  private messageHandler?: MessageHandler;
  private confirmHandler?: ConfirmHandler;
  private routerHandler?: RouterHandler;

  constructor() {
    // 延迟设置处理器，避免循环依赖
    this.messageHandler = undefined;
    this.confirmHandler = undefined;
    this.routerHandler = undefined;
  }

  /**
   * 设置消息处理器
   */
  setMessageHandler(handler: MessageHandler) {
    this.messageHandler = handler;
  }

  /**
   * 设置确认对话框处理器
   */
  setConfirmHandler(handler: ConfirmHandler) {
    this.confirmHandler = handler;
  }

  /**
   * 设置路由处理器
   */
  setRouterHandler(handler: RouterHandler) {
    this.routerHandler = handler;
  }

  /**
   * 处理成功响应
   */
  handleSuccess<T>(response: ApiResponse<T>): T | ApiResponse<T> | Promise<never> {
    const { code, data, msg } = response;

    // 如果没有 code 字段，直接返回原始数据
    if (code === undefined || code === null) {
      return response;
    }

    // 成功状态码
    if (code === 200 || code === 2000 || code === 1000) {
      return data;
    }

    // 其他状态码按错误处理
    return this.handleError({ code, message: msg || '未知错误' });
  }

  /**
   * 处理错误响应
   */
  handleError(error: { code: number; message: string }): Promise<never> {
    const { code, message } = error;

    // 获取状态码配置
    const config = STATUS_CODE_CONFIG[code];

    if (!config) {
      // 未知状态码，显示原始错误信息
      if (this.messageHandler) {
        this.messageHandler.error(message || '未知错误');
      }
      return Promise.reject(error);
    }

    // 使用配置中的消息或原始消息
    const errorMessage = config.message || message;

    // 根据配置执行相应操作
    switch (config.action) {
      case 'show':
        // 使用智能消息管理器处理消息
        const showType = config.showType || 'error';
        const messageManager = getMessageManager();
        if (messageManager) {
          switch (showType) {
            case 'success':
              messageManager.enqueue('success', errorMessage);
              break;
            case 'warning':
              messageManager.enqueue('warning', errorMessage);
              break;
            case 'info':
              messageManager.enqueue('info', errorMessage);
              break;
            default:
              messageManager.enqueue('error', errorMessage);
          }
        }

        // 兼容旧的消息处理器
        if (this.messageHandler) {
          switch (showType) {
            case 'success':
              this.messageHandler.success(errorMessage);
              break;
            case 'warning':
              this.messageHandler.warning(errorMessage);
              break;
            case 'info':
              this.messageHandler.info(errorMessage);
              break;
            default:
              this.messageHandler.error(errorMessage);
          }
        }
        break;

      case 'redirect':
        // 使用智能消息管理器处理消息
        const redirectShowType = config.showType || 'warning';
        const redirectMessageManager = getMessageManager();
        if (redirectMessageManager) {
          switch (redirectShowType) {
            case 'success':
              redirectMessageManager.enqueue('success', errorMessage);
              break;
            case 'warning':
              redirectMessageManager.enqueue('warning', errorMessage);
              break;
            case 'info':
              redirectMessageManager.enqueue('info', errorMessage);
              break;
            default:
              redirectMessageManager.enqueue('error', errorMessage);
          }
        }

        // 兼容旧的消息处理器
        if (this.messageHandler) {
          switch (redirectShowType) {
            case 'success':
              this.messageHandler.success(errorMessage);
              break;
            case 'warning':
              this.messageHandler.warning(errorMessage);
              break;
            case 'info':
              this.messageHandler.info(errorMessage);
              break;
            default:
              this.messageHandler.error(errorMessage);
          }
        }

        // 延迟跳转，让用户看到消息
        setTimeout(() => {
          if (this.routerHandler) {
            this.routerHandler.push(config.redirectPath || '/login');
          } else {
            // 如果没有 router 实例，使用 window.location
            window.location.href = config.redirectPath || '/login';
          }
        }, 1500);
        break;

      case 'confirm':
        if (this.confirmHandler) {
          this.confirmHandler.confirm(errorMessage, '确认').then(() => {
            if (config.redirectPath && this.routerHandler) {
              this.routerHandler.push(config.redirectPath);
            }
          });
        }
        break;

      case 'silent':
        // 静默处理，不显示消息
        break;
    }

    return Promise.reject(error);
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: any): Promise<never> {
    let message = '网络错误';

    if (error.response) {
      const { status, data } = error.response;

      // HTTP 状态码处理
      switch (status) {
        case 404:
          message = '请求的资源不存在';
          break;
        case 429:
          message = '请求过于频繁，请稍后重试';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = data?.msg || data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络设置';
    } else {
      message = error.message || '请求配置错误';
    }

    // 使用智能消息管理器处理网络错误
    const networkMessageManager = getMessageManager();
    if (networkMessageManager) {
      networkMessageManager.enqueue('error', message);
    }

    // 兼容旧的消息处理器
    if (this.messageHandler) {
      this.messageHandler.error(message);
    }
    return Promise.reject(error);
  }

  /**
   * 创建 axios 响应拦截器
   */
  createResponseInterceptor() {
    return {
      onFulfilled: (response: any) => {
        const { data } = response;

        if (!data) {
          return response;
        }

        return this.handleSuccess(data);
      },

      onRejected: (error: any) => {
        // 检查是否是业务错误
        if (error.code && typeof error.code === 'number') {
          return this.handleError(error);
        }

        // 网络错误
        return this.handleNetworkError(error);
      }
    };
  }
}

// 创建全局实例
export const responseInterceptor = new ResponseInterceptor();

// 便捷方法
export const handleApiResponse = <T>(response: ApiResponse<T>): T | ApiResponse<T> | Promise<never> => {
  return responseInterceptor.handleSuccess(response);
};

export const handleApiError = (error: { code: number; message: string }): Promise<never> => {
  return responseInterceptor.handleError(error);
};

export const handleNetworkError = (error: any): Promise<never> => {
  return responseInterceptor.handleNetworkError(error);
};
