const proxy = {
  '/api': {
    target: 'http://10.80.9.76:8115',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 将 /api 前缀替换为 /admin 转发到后端
  }
};

export { proxy };
