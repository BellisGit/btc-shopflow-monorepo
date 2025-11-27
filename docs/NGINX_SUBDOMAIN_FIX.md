# Nginx 子域名配置修复指南

## 🚨 问题描述

访问 `admin.bellis.com.cn` 时，所有 JavaScript 和 CSS 文件返回 `text/html` MIME 类型，导致：
- `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`
- `Refused to apply style from '<URL>' because its MIME type ('text/html') is not a supported stylesheet MIME type`

## 🔍 问题分析

### 根本原因

当前 Nginx 配置将子域名的所有请求都代理到了带路径的后端：
```nginx
location / {
    proxy_pass http://127.0.0.1:30080/admin;  # ❌ 错误：添加了 /admin 路径
}
```

这导致：
1. 静态资源请求 `/assets/vendor-CpB4AgL5.js` 被代理到 `http://127.0.0.1:30080/admin/assets/vendor-CpB4AgL5.js`
2. 主应用的路由可能将所有路径都匹配到 HTML 页面
3. 返回 HTML 而不是静态资源文件

### 正确的架构

根据 `SUBDOMAIN_LAYOUT_INTEGRATION.md` 的架构设计：
- **所有子域名都应该代理到主应用的根路径**（`http://127.0.0.1:30080/`）
- **主应用根据子域名自动跳转到对应路径**（如 `admin.bellis.com.cn` → `/admin`）
- **静态资源从主应用加载**，而不是从子应用路径加载

## 🛠️ 修复方案

### 修复后的配置

将所有子域名的 `proxy_pass` 改为代理到主应用的根路径：

```nginx
# ========== admin.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  admin.bellis.com.cn;
    
    # ... SSL 配置 ...
    
    # 代理到后端接口
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... API 代理配置 ...
    }
    
    # 前端代理 - 修复：代理到主应用根路径，不要添加 /admin
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /admin 路径
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering off;  # ✅ 修复：关闭缓冲，确保静态资源正确传输
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}

# ========== logistics.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  logistics.bellis.com.cn;
    
    # ... SSL 配置 ...
    
    location /api/ {
        proxy_pass http://10.0.0.168:8115/api/;
        # ... API 代理配置 ...
    }
    
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /logistics 路径
        # ... 其他配置相同 ...
        proxy_buffering off;  # ✅ 修复：关闭缓冲
    }
}

# ========== quality.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  quality.bellis.com.cn;
    
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /quality 路径
        proxy_buffering off;  # ✅ 修复：关闭缓冲
    }
}

# ========== production.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  production.bellis.com.cn;
    
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /production 路径
        proxy_buffering off;  # ✅ 修复：关闭缓冲
    }
}

# ========== engineering.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  engineering.bellis.com.cn;
    
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /engineering 路径
        proxy_buffering off;  # ✅ 修复：关闭缓冲
    }
}

# ========== finance.bellis.com.cn ==========
server {
    listen       443 ssl;
    server_name  finance.bellis.com.cn;
    
    location / {
        proxy_pass http://127.0.0.1:30080/;  # ✅ 修复：移除 /finance 路径
        proxy_buffering off;  # ✅ 修复：关闭缓冲
    }
}
```

## 🔑 关键修复点

1. **移除路径后缀**：将 `proxy_pass http://127.0.0.1:30080/admin;` 改为 `proxy_pass http://127.0.0.1:30080/;`
2. **关闭代理缓冲**：添加 `proxy_buffering off;` 确保静态资源正确传输
3. **保持 Host 头**：确保 `proxy_set_header Host $host;` 正确设置，让主应用识别子域名

## 📋 修复步骤

1. **备份当前配置**
   ```bash
   sudo cp /etc/nginx/conf.d/your-config.conf /etc/nginx/conf.d/your-config.conf.backup
   ```

2. **修改配置**
   - 将所有子域名的 `proxy_pass http://127.0.0.1:30080/xxx;` 改为 `proxy_pass http://127.0.0.1:30080/;`
   - 添加 `proxy_buffering off;` 到每个 `location /` 块

3. **测试配置**
   ```bash
   sudo nginx -t
   ```

4. **重新加载 Nginx**
   ```bash
   sudo nginx -s reload
   ```

5. **清除浏览器缓存并测试**
   - 访问 `https://admin.bellis.com.cn`
   - 检查浏览器开发者工具的网络面板
   - 确认静态资源返回正确的 MIME 类型

## ✅ 预期效果

修复后：
1. 访问 `admin.bellis.com.cn` 时，所有请求代理到 `http://127.0.0.1:30080/`
2. 主应用检测到子域名 `admin.bellis.com.cn`，自动跳转到 `/admin` 路径
3. 静态资源（`/assets/*.js`, `/assets/*.css`）从主应用正确加载
4. qiankun 根据子域名加载对应的子应用
5. 显示完整的 Layout（顶部栏、侧边栏、标签栏、面包屑）

## 🔍 验证

修复后，检查以下内容：

1. **静态资源 MIME 类型**
   ```bash
   curl -I https://admin.bellis.com.cn/assets/vendor-CpB4AgL5.js
   # 应该返回 Content-Type: application/javascript
   ```

2. **页面加载**
   - 打开浏览器开发者工具
   - 访问 `https://admin.bellis.com.cn`
   - 检查网络面板，确认所有资源返回 200 状态码
   - 确认没有 MIME 类型错误

3. **路由跳转**
   - 访问 `https://admin.bellis.com.cn`
   - URL 应该自动跳转到 `https://admin.bellis.com.cn/admin`
   - 显示完整的 Layout

