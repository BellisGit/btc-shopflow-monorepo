const proxy = {
  '/admin': {
    target: 'http://10.80.9.76:8115',
    changeOrigin: true,
    rewrite: (path: string) => path // 不删除admin前缀，直接转发
  }
};

export { proxy };
