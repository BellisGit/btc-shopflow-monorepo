# Safari 证书部署指南

## 问题说明

即使替换了证书文件，Safari 仍然无法建立安全连接。可能的原因：

1. **证书文件路径不正确** - nginx 配置使用的是 `bundle.pem`，而不是 `bundle_safari.pem`
2. **证书文件未正确上传** - 文件可能没有上传到服务器
3. **nginx 未重新加载** - 配置更改后需要重新加载
4. **证书文件格式问题** - 证书链可能仍然不完整

## 完整部署步骤

### 步骤 1: 在本地生成 Safari 优化的证书

在 Windows 上运行：

```powershell
cd btc-shopflow-monorepo
.\scripts\merge-certs-for-safari.ps1
```

这会生成：`certs/bellis.com.cn_bundle_safari.pem`

### 步骤 2: 上传证书到服务器

将 `bellis.com.cn_bundle_safari.pem` 上传到服务器：

```bash
# 方法 1: 使用 SCP
scp certs/bellis.com.cn_bundle_safari.pem root@your-server:/home/ssl/bellis.com.cn_nginx/

# 方法 2: 使用 SFTP 或其他工具上传
```

### 步骤 3: 在服务器上部署证书

**重要：** nginx 配置使用的是 `bundle.pem`，需要将 `bundle_safari.pem` 复制或替换为 `bundle.pem`

```bash
# 进入证书目录
cd /home/ssl/bellis.com.cn_nginx

# 备份原文件
cp bellis.com.cn_bundle.pem bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)

# 方法 1: 直接替换（推荐）
cp bellis.com.cn_bundle_safari.pem bellis.com.cn_bundle.pem
chmod 644 bellis.com.cn_bundle.pem

# 方法 2: 使用部署脚本（如果已上传）
bash /path/to/deploy-safari-cert.sh
```

### 步骤 4: 验证证书文件

```bash
# 检查证书数量（应该是 2-3 个，不包含根证书）
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 应该返回 2 或 3

# 查看证书信息
openssl x509 -in /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem -noout -subject -issuer
```

### 步骤 5: 测试 nginx 配置并重新加载

```bash
# 测试配置
nginx -t

# 如果测试通过，重新加载
nginx -s reload

# 或者重启（如果 reload 不生效）
systemctl restart nginx
```

### 步骤 6: 验证部署

```bash
# 运行验证脚本
bash /path/to/verify-safari-cert.sh

# 或手动测试
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts </dev/null 2>/dev/null | \
    grep -E "(Verify return code|Protocol)"
```

## 快速部署脚本

如果脚本已上传到服务器，可以使用一键部署：

```bash
# 1. 确保 bundle_safari.pem 已上传到服务器
# 2. 运行部署脚本
bash scripts/deploy-safari-cert.sh

# 3. 验证
bash scripts/verify-safari-cert.sh
```

## 常见问题排查

### 问题 1: 证书文件不存在

```bash
# 检查文件是否存在
ls -lh /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle*.pem

# 如果 bundle_safari.pem 不存在，需要先上传
```

### 问题 2: nginx 配置未更新

```bash
# 检查 nginx 配置使用的证书路径
grep "ssl_certificate" /etc/nginx/sites-available/mobile.bellis.com.cn
# 或
grep "ssl_certificate" /www/server/nginx/conf/vhost/mobile.bellis.com.cn.conf

# 确保指向 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
```

### 问题 3: nginx 未重新加载

```bash
# 检查 nginx 进程
ps aux | grep nginx

# 强制重新加载
nginx -s reload

# 如果 reload 不生效，重启
systemctl restart nginx
```

### 问题 4: 证书数量不正确

```bash
# 检查证书数量
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 应该是 2 或 3（服务器证书 + 中间证书，不包含根证书）
# 如果是 4，说明根证书没有被排除
```

### 问题 5: 浏览器缓存

在 iOS Safari 中：
1. 设置 → Safari
2. 清除历史记录与网站数据
3. 重新访问网站

## 验证清单

部署完成后，检查以下项目：

- [ ] `bundle_safari.pem` 已上传到服务器
- [ ] `bundle.pem` 已被替换为优化后的版本
- [ ] 证书数量为 2-3 个（不包含根证书）
- [ ] nginx 配置测试通过
- [ ] nginx 已重新加载
- [ ] SSL 连接测试成功
- [ ] 浏览器缓存已清除

## 如果问题仍然存在

如果按照以上步骤操作后问题仍然存在，请：

1. 运行完整诊断：
   ```bash
   bash scripts/diagnose-ssl-connection.sh
   bash scripts/verify-safari-cert.sh
   ```

2. 检查 nginx 错误日志：
   ```bash
   tail -50 /var/log/nginx/error.log
   # 或
   tail -50 /www/server/nginx/logs/error.log
   ```

3. 使用在线工具测试：
   - https://www.ssllabs.com/ssltest/analyze.html?d=mobile.bellis.com.cn
   - https://www.sslshopper.com/ssl-checker.html#hostname=mobile.bellis.com.cn

4. 检查 iOS 设备时间设置是否正确

