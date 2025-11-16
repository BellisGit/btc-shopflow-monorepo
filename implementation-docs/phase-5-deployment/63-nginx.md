# 36 - Nginx 配置

> **阶段**: Phase 5 | **时间**: 3小时 | **前置**: 35

## 🎯 任务目标

配置 Nginx 反向代理、HTTPS 和 CORS。

## 📋 执行步骤

### 1. 创建主 Nginx 配置

**nginx/nginx.conf**:
```nginx
# 主应用
server {
    listen 80;
    server_name btc-shopflow.com.cn;

    root /var/www/base;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}

# 物流子应用
server {
    listen 80;
    server_name logistics.btc-shopflow.com.cn;

    root /var/www/logistics;
    index index.html;

    # CORS 配置
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 生产子应用
server {
    listen 80;
    server_name production.btc-shopflow.com.cn;

    root /var/www/production;
    index index.html;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# CDN 静态资源
server {
    listen 80;
    server_name cdn.btc-shopflow.com.cn;

    root /var/www/cdn;

    location / {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. HTTPS 配置（可选）

**nginx/ssl.conf**:
```nginx
server {
    listen 443 ssl http2;
    server_name btc-shopflow.com.cn;

    ssl_certificate /etc/nginx/ssl/btc-shopflow.crt;
    ssl_certificate_key /etc/nginx/ssl/btc-shopflow.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/base;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name btc-shopflow.com.cn;
    return 301 https://$server_name$request_uri;
}
```

## ✅ 验收标准

### 检查：Nginx 配置

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 访问测试
curl -I http://btc-shopflow.com.cn
# 预期: 返回 200

# 测试 CORS
curl -I http://logistics.btc-shopflow.com.cn
# 预期: 包含 Access-Control-Allow-Origin
```

## 📝 检查清单

- [ ] Nginx 配置创建
- [ ] 反向代理配置
- [ ] CORS 配置
- [ ] Gzip 压缩
- [ ] HTTPS 配置（可选）
- [ ] 配置测试通过

## 🔗 下一步

- [37 - GitHub Actions CI/CD](./37-github-actions.md)

