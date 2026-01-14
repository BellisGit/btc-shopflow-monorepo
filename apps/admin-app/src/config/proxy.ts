import { logger } from '@btc/shared-core';
import type { IncomingMessage, ServerResponse } from 'http';

// Vite 代理配置类型
interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  configure?: (proxy: any, options: any) => void;
}

const proxy: Record<string, string | ProxyOptions> = {
  '/api': {
    target: 'http://10.80.9.76:8115',
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 处理响应头，添加 CORS 头
    configure: (proxy: any, options: any) => {
      // 处理代理响应
      proxy.on('proxyRes', (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
        const origin = req.headers.origin || '*';
        if (proxyRes.headers) {
          proxyRes.headers['Access-Control-Allow-Origin'] = origin as string;
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
          const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id';
          proxyRes.headers['Access-Control-Allow-Headers'] = requestHeaders as string;
          
          // 关键：修复 Set-Cookie 响应头，确保跨域请求时 cookie 能够正确设置
          // 在预览模式下（不同端口），需要设置 SameSite=None; Secure
          const setCookieHeader = proxyRes.headers['set-cookie'];
          if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            const fixedCookies = cookies.map((cookie: string) => {
              // 如果 cookie 不包含 SameSite，或者 SameSite 不是 None，需要修复
              if (!cookie.includes('SameSite=None')) {
                // 移除现有的 SameSite 设置（如果有）
                let fixedCookie = cookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, '');
                // 添加 SameSite=None; Secure（对于跨域请求）
                // 注意：Secure 需要 HTTPS，但在开发/预览环境中，我们仍然添加它
                // 浏览器会忽略 Secure（如果协议是 HTTP）
                fixedCookie += '; SameSite=None; Secure';
                return fixedCookie;
              }
              return cookie;
            });
            proxyRes.headers['set-cookie'] = fixedCookies;
          }
        }
        // 记录后端响应状态
        if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
          logger.error(`[Proxy] Backend returned ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        }
      });

      // 处理代理错误
      proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
        logger.error('[Proxy] Error:', err.message);
        logger.error('[Proxy] Request URL:', req.url);
        logger.error('[Proxy] Target:', 'http://10.80.9.76:8115');
        if (res && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': req.headers.origin || '*',
          });
          // 注意：这里在代理配置中，无法使用 i18n，所以保留原始错误消息
          // 实际错误消息应该在后端或前端错误处理中使用 i18n
          res.end(JSON.stringify({
            code: 500,
            message: 'Proxy error: Unable to connect to backend server http://10.80.9.76:8115',
            error: err.message,
          }));
        }
      });

      // 监听代理请求（用于调试）
      proxy.on('proxyReq', (proxyReq: any, req: IncomingMessage, res: ServerResponse) => {
        logger.info(`[Proxy] ${req.method} ${req.url} -> http://10.80.9.76:8115${req.url}`);
      });
    },
  }
};

export { proxy };
