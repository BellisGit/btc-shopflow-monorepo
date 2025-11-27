# Nginx 子域名直接代理配置

## 架构说明

通过 Nginx 直接将子域名代理到主应用的对应路径，而不是在路由层面处理子域名跳转。

## 配置方式

### admin.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  admin.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /admin 路径
    location / {
        proxy_pass http://127.0.0.1:30080/admin;
        # ... 其他代理配置 ...
    }
}
```

### logistics.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  logistics.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /logistics 路径
    location / {
        proxy_pass http://127.0.0.1:30080/logistics;
        # ... 其他代理配置 ...
    }
}
```

### quality.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  quality.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /quality 路径
    location / {
        proxy_pass http://127.0.0.1:30080/quality;
        # ... 其他代理配置 ...
    }
}
```

### production.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  production.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /production 路径
    location / {
        proxy_pass http://127.0.0.1:30080/production;
        # ... 其他代理配置 ...
    }
}
```

### engineering.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  engineering.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /engineering 路径
    location / {
        proxy_pass http://127.0.0.1:30080/engineering;
        # ... 其他代理配置 ...
    }
}
```

### finance.bellis.com.cn

```nginx
server {
    listen       443 ssl;
    server_name  finance.bellis.com.cn;

    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;

    # 允许请求大小
    client_max_body_size 10M;

    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... 其他 API 代理配置 ...
    }

    # 前端代理 - 直接代理到 /finance 路径
    location / {
        proxy_pass http://127.0.0.1:30080/finance;
        # ... 其他代理配置 ...
    }
}
```

## 关键配置点

1. **直接代理到路径**：`proxy_pass http://127.0.0.1:30080/admin;`（注意末尾有 `/admin`）
2. **保持 Host 头**：确保 `proxy_set_header Host $host;` 正确设置
3. **关闭代理缓冲**：`proxy_buffering off;` 确保静态资源正确传输

## 工作原理

1. 用户访问 `https://admin.bellis.com.cn/`
2. Nginx 将请求代理到 `http://127.0.0.1:30080/admin`
3. 主应用接收到 `/admin` 路径的请求
4. Vue Router 匹配到 `/admin` 路由
5. qiankun 加载 admin 子应用
6. 显示管理域的内容

## 优势

- 简单直接，不需要复杂的路由守卫逻辑
- 性能更好，减少客户端路由跳转
- 更容易调试，问题定位更清晰

