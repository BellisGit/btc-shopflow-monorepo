# SSL 问题诊断与修复指南

## ⚠️ 错误：Failed to communicate with the secure server - No secure protocol supported

这个错误通常表示 SSL/TLS 握手失败，可能的原因包括：

### 1. 证书文件未在服务器上更新

**检查步骤：**

```bash
# SSH 登录服务器后执行

# 1. 检查证书文件是否存在
ls -la /home/ssl/bellis.com.cn_nginx/

# 2. 检查证书文件中的证书数量（应该是 3 个，不包含根证书）
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 应该返回 3

# 3. 检查证书文件的权限
ls -l /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
# 应该是 -rw-r--r-- (644)

ls -l /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key
# 应该是 -rw------- (600)
```

**如果证书数量不对：**

```bash
# 将本地生成的 Safari 优化证书上传到服务器
# 然后替换原证书文件

cd /home/ssl/bellis.com.cn_nginx

# 备份原文件
cp bellis.com.cn_bundle.pem bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)

# 替换为新证书（假设已上传到服务器）
cp bellis.com.cn_bundle_safari.pem bellis.com.cn_bundle.pem

# 设置正确权限
chmod 644 bellis.com.cn_bundle.pem
chmod 600 bellis.com.cn.key
chown root:root bellis.com.cn_bundle.pem bellis.com.cn.key
```

### 2. nginx 配置未正确加载或重启

**检查步骤：**

```bash
# 1. 检查 nginx 配置语法
nginx -t

# 2. 检查移动应用的配置文件是否被包含
grep -r "mobile.bellis.com.cn" /etc/nginx/
# 或
grep -r "mobile.bellis.com.cn" /www/server/nginx/conf/

# 3. 检查 nginx 是否运行
ps aux | grep nginx

# 4. 检查 443 端口是否监听
netstat -tlnp | grep 443
# 或
ss -tlnp | grep 443
```

**修复步骤：**

```bash
# 如果配置测试通过，重新加载 nginx
nginx -t && nginx -s reload

# 如果 reload 不生效，重启 nginx
systemctl restart nginx
# 或
service nginx restart

# 检查 nginx 状态
systemctl status nginx
```

### 3. SSL/TLS 协议配置问题

**检查 nginx 版本是否支持 TLS 1.3：**

```bash
nginx -V 2>&1 | grep -o with-openssl-[0-9.]
```

如果 nginx 版本较旧，可能需要：

**方案 A：如果 nginx 不支持 TLS 1.3，只启用 TLS 1.2**

在服务器上编辑 nginx 配置文件：

```nginx
ssl_protocols TLSv1.2;
```

**方案 B：使用更兼容的 SSL 配置**

更新移动应用的 nginx 配置，使用更兼容的 SSL 设置：

```nginx
server {
    listen       443 ssl;
    listen       [::]:443 ssl;
    server_name  mobile.bellis.com.cn;
    
    # SSL 证书
    ssl_certificate      /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem;
    ssl_certificate_key  /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key;
    
    # SSL 配置（更兼容的配置）
    ssl_session_cache    shared:SSL:10m;
    ssl_session_timeout  10m;
    ssl_session_tickets  off;
    
    # 根据 nginx 版本选择协议
    # 如果 nginx 版本较旧，只使用 TLSv1.2
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 更兼容的加密套件配置
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}
```

### 4. 防火墙或安全组问题

**检查防火墙：**

```bash
# CentOS/RHEL
firewall-cmd --list-ports
firewall-cmd --list-services

# 如果 443 端口未开放
firewall-cmd --add-service=https --permanent
firewall-cmd --reload

# Ubuntu/Debian
ufw status
ufw allow 443/tcp
```

**云服务器安全组：**
- 登录云服务商控制台
- 检查安全组规则
- 确保 443 端口已开放

### 5. 从服务器端测试 SSL 连接

**在服务器上测试：**

```bash
# 测试 SSL 连接
openssl s_client -connect mobile.bellis.com.cn:443 -servername mobile.bellis.com.cn < /dev/null

# 检查证书链
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts < /dev/null

# 检查特定 TLS 版本
openssl s_client -connect mobile.bellis.com.cn:443 -tls1_2 < /dev/null
openssl s_client -connect mobile.bellis.com.cn:443 -tls1_3 < /dev/null
```

**期望输出：**
- `Verify return code: 0 (ok)` - 证书验证成功
- 看到完整的证书链信息

### 6. 检查 nginx 错误日志

```bash
# 查看移动应用的错误日志
tail -f /var/log/nginx/mobile.bellis.com.cn.error.log

# 或查看 nginx 主错误日志
tail -f /var/log/nginx/error.log

# 尝试访问网站时观察日志输出
```

常见错误信息：
- `SSL_do_handshake() failed` - SSL 握手失败
- `certificate file not found` - 证书文件未找到
- `no valid SSL protocols configured` - SSL 协议配置无效

### 7. 完整的诊断脚本

在服务器上运行以下命令进行全面诊断：

```bash
#!/bin/bash

DOMAIN="mobile.bellis.com.cn"
CERT_PATH="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
KEY_PATH="/home/ssl/bellis.com.cn_nginx/bellis.com.cn.key"

echo "=========================================="
echo "SSL 连接诊断"
echo "=========================================="
echo ""

echo "1. 检查证书文件..."
if [ -f "$CERT_PATH" ]; then
    echo "   ✅ 证书文件存在"
    CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$CERT_PATH")
    echo "   ✅ 证书数量: $CERT_COUNT (应该是 3)"
    
    if [ "$CERT_COUNT" -ne 3 ]; then
        echo "   ⚠️  警告: 证书数量不正确，应该是 3 个"
    fi
else
    echo "   ❌ 证书文件不存在: $CERT_PATH"
    exit 1
fi

if [ -f "$KEY_PATH" ]; then
    echo "   ✅ 私钥文件存在"
    KEY_PERM=$(stat -c "%a" "$KEY_PATH")
    if [ "$KEY_PERM" != "600" ]; then
        echo "   ⚠️  警告: 私钥权限不正确 ($KEY_PERM)，应该是 600"
    fi
else
    echo "   ❌ 私钥文件不存在: $KEY_PATH"
    exit 1
fi

echo ""
echo "2. 检查 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置语法正确"
else
    echo "   ❌ nginx 配置有错误:"
    nginx -t
    exit 1
fi

echo ""
echo "3. 检查端口监听..."
if netstat -tlnp 2>/dev/null | grep -q ":443"; then
    echo "   ✅ 443 端口正在监听"
    netstat -tlnp | grep ":443"
else
    echo "   ❌ 443 端口未监听"
fi

echo ""
echo "4. 测试 SSL 连接..."
if timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "   ✅ SSL 连接成功，证书验证通过"
else
    echo "   ❌ SSL 连接失败或证书验证失败"
    echo "   详细输出:"
    timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>&1 | head -20
fi

echo ""
echo "5. 检查证书信息..."
openssl x509 -in "$CERT_PATH" -noout -subject -issuer -dates 2>/dev/null | head -4

echo ""
echo "=========================================="
echo "诊断完成"
echo "=========================================="
```

## 🔧 快速修复清单

按以下顺序检查：

- [ ] 1. 确认证书文件已上传到服务器
- [ ] 2. 确认证书文件包含 3 个证书（不包含根证书）
- [ ] 3. 确认证书文件权限正确（644）
- [ ] 4. 确认私钥文件权限正确（600）
- [ ] 5. 测试 nginx 配置：`nginx -t`
- [ ] 6. 重新加载 nginx：`nginx -s reload`
- [ ] 7. 检查 443 端口是否监听
- [ ] 8. 检查防火墙是否开放 443 端口
- [ ] 9. 在服务器上测试 SSL 连接
- [ ] 10. 查看 nginx 错误日志

## 📞 如果问题仍然存在

如果按照以上步骤检查后问题仍然存在，请收集以下信息：

1. **nginx 版本：** `nginx -V`
2. **OpenSSL 版本：** `openssl version`
3. **证书文件内容（前几行）：** `head -20 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem`
4. **nginx 错误日志：** `tail -50 /var/log/nginx/error.log`
5. **SSL 连接测试输出：** `openssl s_client -connect mobile.bellis.com.cn:443 -showcerts < /dev/null`
6. **端口监听状态：** `netstat -tlnp | grep 443`




