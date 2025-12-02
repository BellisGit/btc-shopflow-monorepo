# Safari iOS 无法建立安全连接 - 深度排查指南

## 问题现象

在 iOS Safari 浏览器访问 `https://mobile.bellis.com.cn` 时，出现"无法与服务器建立安全的连接"错误。

## 已完成的修复

1. ✅ 统一 SSL 配置（与其他子域名一致）
2. ✅ 证书链验证（通过 openssl s_client 验证，返回码 0）

## 深度排查步骤

### 步骤 1: 检查 bundle.pem 文件内容

**关键问题：** 虽然 `openssl s_client` 显示证书链完整，但实际的 `bundle.pem` 文件可能只包含服务器证书。nginx 可能从系统证书库中获取中间证书，但 Safari 需要 bundle.pem 文件本身包含完整的证书链。

```bash
# 检查 bundle.pem 文件中的证书数量
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 应该至少看到 2 个证书（服务器证书 + 中间证书）
# 如果只有 1 个，说明 bundle.pem 文件不完整
```

### 步骤 2: 验证证书链顺序

Safari 对证书链的顺序非常敏感。正确的顺序应该是：

1. **服务器证书**（第一个）
2. **中间证书**（第二个，直接签发服务器证书的 CA）
3. **其他中间证书**（如果有，按层级顺序）
4. **不要包含根证书**（Safari 不需要，且可能导致问题）

```bash
# 查看 bundle.pem 文件内容
cat /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 应该看到多个证书块，按顺序排列
```

### 步骤 3: 重新生成完整的 bundle.pem 文件

如果 bundle.pem 文件不完整，需要重新生成：

```bash
# 1. 备份当前文件
cp /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak

# 2. 从证书提供商获取中间证书
# 通常可以从以下位置获取：
# - 证书提供商的下载页面
# - 证书邮件附件
# - 证书管理平台

# 3. 合并证书（顺序很重要！）
# 假设你有以下文件：
# - bellis.com.cn.crt (服务器证书)
# - WoTrus-DV-Server-CA.crt (中间证书)

cat bellis.com.cn.crt WoTrus-DV-Server-CA.crt > \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 4. 验证合并后的文件
openssl verify -CAfile /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem \
               /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 5. 检查证书数量
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
# 应该至少是 2
```

### 步骤 4: 从实际连接中提取证书链

如果无法从证书提供商获取中间证书，可以从实际连接中提取：

```bash
# 提取完整的证书链
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts </dev/null 2>/dev/null | \
    sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > \
    /tmp/full_chain.pem

# 查看提取的证书
grep -c "BEGIN CERTIFICATE" /tmp/full_chain.pem

# 如果包含多个证书，可以手动分离：
# 第一个证书是服务器证书
# 第二个证书是中间证书
# 第三个证书是另一个中间证书（如果有）

# 提取服务器证书（第一个）
sed -n '1,/-----END CERTIFICATE-----/p' /tmp/full_chain.pem > /tmp/server.crt

# 提取第一个中间证书（第二个）
sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' /tmp/full_chain.pem | \
    sed -n '2,3p' > /tmp/intermediate1.crt

# 合并（只包含服务器证书和第一个中间证书，Safari 通常不需要根证书）
cat /tmp/server.crt /tmp/intermediate1.crt > \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
```

### 步骤 5: 重新加载 nginx

```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 或者重启 nginx（如果 reload 不生效）
systemctl restart nginx
```

### 步骤 6: 验证修复

```bash
# 1. 检查服务器端证书链
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts </dev/null 2>/dev/null | \
    grep -E "(depth=|verify return code)"

# 2. 使用在线工具测试
# - https://www.ssllabs.com/ssltest/analyze.html?d=mobile.bellis.com.cn
# - https://www.sslshopper.com/ssl-checker.html#hostname=mobile.bellis.com.cn

# 3. 在 iOS Safari 中测试
# - 清除 Safari 缓存（设置 → Safari → 清除历史记录与网站数据）
# - 重新访问 https://mobile.bellis.com.cn
```

## 其他可能的原因

### 1. 证书有效期问题

```bash
# 检查证书有效期
openssl x509 -in /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem -noout -dates

# 检查证书是否即将过期（30天内）
```

### 2. 证书的 Subject Alternative Name (SAN)

```bash
# 检查证书是否支持 mobile.bellis.com.cn
openssl x509 -in /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem -noout -text | \
    grep -A 5 "Subject Alternative Name"

# 应该看到 *.bellis.com.cn 或 mobile.bellis.com.cn
```

### 3. iOS 设备时间设置

确保 iOS 设备的系统时间正确：
- 设置 → 通用 → 日期与时间
- 启用"自动设置"

### 4. Safari 缓存问题

在 iOS 设备上：
1. 设置 → Safari
2. 清除历史记录与网站数据
3. 重新访问网站

### 5. 网络环境问题

- 尝试切换网络（WiFi ↔ 移动数据）
- 检查是否有代理或 VPN
- 尝试使用其他网络环境

## 使用诊断脚本

项目提供了诊断脚本，可以快速检查问题：

```bash
# 运行诊断脚本
bash scripts/check-ssl-bundle.sh
```

脚本会检查：
- bundle.pem 文件是否存在
- 证书数量
- 证书信息
- 证书链验证
- 服务器连接测试

## 参考资源

- [Nginx SSL 证书链配置](https://nginx.org/en/docs/http/configuring_https_servers.html#chains)
- [Safari SSL/TLS 要求](https://support.apple.com/zh-cn/HT210120)
- [SSL 证书链最佳实践](https://www.digicert.com/kb/ssl-support/openssl-quick-reference-guide.htm)

