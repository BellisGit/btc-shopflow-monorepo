/**
 * Qiankun 日志过滤 Composable
 * 用于过滤 qiankun 和 single-spa 产生的噪音日志
 */

/**
 * 检查是否应该过滤日志
 */
function shouldFilter(...args: any[]): boolean {
  // 检查所有参数中是否包含 qiankun sandbox 相关日志
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (
        arg.includes('[qiankun:sandbox]') ||
        arg.includes('modified global properties') ||
        arg.includes('restore...') ||
        arg.includes('[qiankun] globalState tools will be removed in 3.0')
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 初始化日志过滤
 * 关键：在模块加载时立即设置日志过滤，确保能拦截所有警告
 * 这必须在任何其他代码执行之前完成
 */
export function setupQiankunLogFilter(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 防止重复设置
  if ((window as any).__qiankun_logs_filtered__) {
    return;
  }
  (window as any).__qiankun_logs_filtered__ = true;

  // 保存原始方法（如果还没有保存的话）
  // 注意：setupGlobalErrorCapture() 可能已经替换了 console.warn，所以优先使用已保存的原始方法
  if (!(console as any).__originalLog) {
    (console as any).__originalLog = console.log;
  }
  if (!(console as any).__originalInfo) {
    (console as any).__originalInfo = console.info;
  }
  if (!(console as any).__originalWarn) {
    (console as any).__originalWarn = console.warn;
  }
  if (!(console as any).__originalError) {
    (console as any).__originalError = console.error;
  }

  // 使用已保存的原始方法，如果没有则使用当前的（可能是被其他代码替换过的）
  const originalLog = ((console as any).__originalLog || console.log).bind(console);
  const originalInfo = ((console as any).__originalInfo || console.info).bind(console);
  const originalWarn = ((console as any).__originalWarn || console.warn).bind(console);
  const originalError = ((console as any).__originalError || console.error).bind(console);

  // 检查是否是表单验证错误（不打印，但允许上报）
  const isFormValidationError = (...args: any[]): boolean => {
    // 检查参数是否是对象格式 {字段名: Array(...)}
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const obj = args[0];
      // 检查对象是否包含 Array 类型的值（表单验证错误格式）
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  // 过滤 console.log
  console.log = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    originalLog(...args);
  };

  // 过滤 console.info
  console.info = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    originalInfo(...args);
  };

  // 过滤 console.warn
  console.warn = (...args: any[]) => {
    // 过滤 qiankun sandbox 警告
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 qiankun globalState 警告（将在 3.0 移除，但目前仍在使用）
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('[qiankun] globalState tools will be removed in 3.0')) {
        return;
      }
    }
    // 检查所有参数中是否包含 globalState 警告
    for (const arg of args) {
      if (typeof arg === 'string' && arg.includes('[qiankun] globalState tools will be removed in 3.0')) {
        return;
      }
    }
    // 过滤 single-spa 的 warningMillis 警告（这是正常的，不是错误）
    // 检查多种可能的警告格式
    if (typeof firstArg === 'string') {
      if (
        firstArg.includes('single-spa minified message #31') ||
        firstArg.includes('single-spa.js.org/error/?code=31') ||
        (firstArg.includes('code=31') && firstArg.includes('bootstrap'))
      ) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 警告
    for (const arg of args) {
      if (
        typeof arg === 'string' &&
        (arg.includes('single-spa minified message #31') ||
          arg.includes('single-spa.js.org/error/?code=31') ||
          (arg.includes('code=31') && arg.includes('bootstrap')))
      ) {
        return;
      }
    }
    // 对于表单验证错误，不打印到控制台，但允许错误监控系统上报
    // 使用保存的原始方法，如果不存在则使用当前 console.warn（可能是被其他代码替换过的）
    const warnFn = originalWarn || (console as any).__originalWarn || console.warn;
    if (typeof warnFn === 'function') {
      // 如果是表单验证错误，不打印（跳过 warnFn.apply），但允许错误监控系统上报
      if (isFormValidationError(...args)) {
        // 直接调用 errorMonitor 的上报方法，不打印到控制台
        import('../../utils/errorMonitor').then(({ updateErrorList }) => {
          const message = args.map((arg) => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'string') return arg;
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
          updateErrorList({
            type: 'console-warn',
            message,
            source: 'main-app',
            isWarning: true,
          });
        }).catch(() => {
          // 如果导入失败，静默处理
        });
        return; // 不打印，直接返回
      }
      warnFn.apply(console, args);
    }
  };

  // 过滤 console.error（single-spa 错误代码 31 通过 error 输出）
  console.error = (...args: any[]) => {
    // 过滤 qiankun sandbox 错误
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 single-spa 的错误代码 31（bootstrap 相关错误）
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (
        firstArg.includes('single-spa minified message #31') ||
        firstArg.includes('single-spa.js.org/error/?code=31') ||
        (firstArg.includes('code=31') && firstArg.includes('bootstrap'))
      ) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 错误
    for (const arg of args) {
      if (
        typeof arg === 'string' &&
        (arg.includes('single-spa minified message #31') ||
          arg.includes('single-spa.js.org/error/?code=31') ||
          (arg.includes('code=31') && arg.includes('bootstrap')))
      ) {
        return;
      }
    }
    // 使用保存的原始方法，如果不存在则使用当前 console.error（可能是被其他代码替换过的）
    const errorFn = originalError || (console as any).__originalError || console.error;
    if (typeof errorFn === 'function') {
      errorFn.apply(console, args);
    }
  };
}

