# 36.5 - SSL 证书和 HTTPS 配置

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 36

## 🎯 任务目标

配置 SSL 证书，启用 HTTPS 加密访问。

## 📋 执行步骤

### 1. 获取 SSL 证书

**方式一：Let's Encrypt（免费）**:
```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d btc-shopflow.com.cn -d www.btc-shopflow.com.cn

# 自动续期
sudo certbot renew --dry-run
```

**方式二：购买商业证书**:
```bash
# 上传证书文件
/etc/nginx/ssl/
├── btc-shopflow.com.cn.crt
└── btc-shopflow.com.cn.key
```

### 2. 配置 Nginx HTTPS

**nginx/ssl.conf**:
```nginx
# HTTPS 主应用
server {
    listen 443 ssl http2;
    server_name btc-shopflow.com.cn www.btc-shopflow.com.cn;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/btc-shopflow.com.cn.crt;
    ssl_certificate_key /etc/nginx/ssl/btc-shopflow.com.cn.key;

    # SSL 协议
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # SSL Session 缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (可选)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 其他安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name btc-shopflow.com.cn www.btc-shopflow.com.cn;
    
    return 301 https://$server_name$request_uri;
}

# 子应用 HTTPS
server {
    listen 443 ssl http2;
    server_name logistics.btc-shopflow.com.cn;

    ssl_certificate /etc/nginx/ssl/logistics.btc-shopflow.com.cn.crt;
    ssl_certificate_key /etc/nginx/ssl/logistics.btc-shopflow.com.cn.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # CORS for 微前端
    add_header Access-Control-Allow-Origin "https://btc-shopflow.com.cn" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;

    root /var/www/logistics;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 重定向
server {
    listen 80;
    server_name logistics.btc-shopflow.com.cn;
    return 301 https://$server_name$request_uri;
}
```

### 3. 配置通配符证书（推荐）

**使用通配符证书覆盖所有子域名**:
```bash
# 申请通配符证书
sudo certbot certonly --manual --preferred-challenges=dns \
  -d btc-shopflow.com.cn -d *.btc-shopflow.com.cn

# Nginx 配置使用同一证书
ssl_certificate /etc/letsencrypt/live/btc-shopflow.com.cn/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/btc-shopflow.com.cn/privkey.pem;
```

### 4. 配置 SSL 优化

**nginx/ssl-params.conf**:
```nginx
# SSL 参数配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Session
ssl_session_cache shared:SSL:50m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# DH 参数
ssl_dhparam /etc/nginx/ssl/dhparam.pem;
```

### 5. 生成 DH 参数

```bash
sudo openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
```

### 6. 自动续期脚本

**scripts/renew-ssl.sh**:
```bash
#!/bin/bash

# 续期证书
certbot renew --quiet

# 重载 Nginx
nginx -s reload

# 记录日志
echo "$(date): SSL 证书已续期" >> /var/log/ssl-renew.log
```

**添加到 crontab**:
```bash
# 每月1号凌晨2点执行
0 2 1 * * /path/to/renew-ssl.sh
```

## ✅ 验收标准

### 检查 1: HTTPS 访问

```bash
# 访问 HTTPS
curl -I https://btc-shopflow.com.cn
# 预期: HTTP/2 200

# 检查证书
openssl s_client -connect btc-shopflow.com.cn:443 -servername btc-shopflow.com.cn
# 预期: 证书信息正确
```

### 检查 2: HTTP 重定向

```bash
curl -I http://btc-shopflow.com.cn
# 预期: 301 Moved Permanently
# Location: https://btc-shopflow.com.cn
```

### 检查 3: SSL 评级

```bash
# 使用 SSL Labs 测试
# https://www.ssllabs.com/ssltest/analyze.html?d=btc-shopflow.com.cn
# 预期: A 或 A+ 评级
```

### 检查 4: 安全头检查

```bash
curl -I https://btc-shopflow.com.cn

# 预期包含安全头:
# Strict-Transport-Security
# X-Frame-Options
# X-Content-Type-Options
# X-XSS-Protection
```

## 📝 检查清单

- [ ] SSL 证书获取
- [ ] Nginx HTTPS 配置
- [ ] HTTP 重定向配置
- [ ] SSL 参数优化
- [ ] 安全头配置
- [ ] 自动续期脚本
- [ ] HTTPS 访问正常
- [ ] SSL 评级 A+

## 🔒 安全最佳实践

### 1. 使用强加密套件
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
# 禁用 TLSv1.0 和 TLSv1.1
```

### 2. 启用 HSTS
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 3. 定期更新证书
```bash
# 设置自动续期
certbot renew --deploy-hook "nginx -s reload"
```

## 🔗 下一步

- [37 - GitHub Actions CI/CD](./37-github-actions.md)

---

**状态**: ✅ 就绪 | **预计时间**: 2小时

