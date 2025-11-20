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
      proxy.on('proxyRes', (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
        const origin = req.headers.origin || '*';
        if (proxyRes.headers) {
          proxyRes.headers['Access-Control-Allow-Origin'] = origin as string;
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
          const requestHeaders = req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
          proxyRes.headers['Access-Control-Allow-Headers'] = requestHeaders as string;
        }
      });

      // 处理错误
      proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
        console.error('[Proxy] Error:', err);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': req.headers.origin || '*',
          });
          res.end('Proxy error');
        }
      });
    },
  }
};

export { proxy };
