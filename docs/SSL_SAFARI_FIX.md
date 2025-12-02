# Safari iOS 无法建立安全连接问题修复

## 问题描述

在苹果设备（iPhone/iPad）的 Safari 浏览器访问 `https://mobile.bellis.com.cn` 时，出现"无法建立安全的连接"错误。

## 问题原因分析

Safari 对 SSL/TLS 证书验证比其他浏览器更严格，主要可能的原因包括：

### 1. **证书链不完整（最可能的原因）**

Safari 需要完整的证书链才能验证证书。如果 `bellis.com.cn_bundle.pem` 文件只包含服务器证书而没有中间证书，Safari 将无法验证证书的有效性。

**检查方法：**
```bash
# 在服务器上检查证书链
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts

# 检查 bundle 文件内容
cat /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
```

**正确的 bundle.pem 文件格式应该是：**
```
-----BEGIN CERTIFICATE-----
（服务器证书）
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
（中间证书 1）
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
（中间证书 2，如果有）
-----END CERTIFICATE-----
```

### 2. **SSL 配置不一致**

移动应用的 SSL 配置与其他子域名不一致，可能导致兼容性问题：
- `ssl_session_tickets` 设置为 `on`（其他子域名为 `off`）
- `ssl_prefer_server_ciphers` 设置为 `off`（其他子域名为 `on`）
- 使用了自定义的加密套件列表

### 3. **缺少 OCSP Stapling**

OCSP Stapling 可以提高证书验证的可靠性，特别是对 Safari 浏览器。

## 已实施的修复

### 1. 证书链验证结果 ✅

通过 `openssl s_client -connect mobile.bellis.com.cn:443 -showcerts` 验证，证书链完整：

- ✅ 服务器证书：`*.bellis.com.cn` (CN = *.bellis.com.cn)
- ✅ 中间证书 1：`WoTrus DV Server CA`
- ✅ 中间证书 2：`USERTrust RSA Certification Authority`
- ✅ 根证书：`AAA Certificate Services`
- ✅ 验证返回码：0 (ok) - 证书链验证成功

**结论：证书链完整，不是证书链问题。**

### 2. 统一 SSL 配置

已将移动应用的 SSL 配置调整为与其他子域名完全一致：

```nginx
ssl_session_tickets  off;  # 与其他子域名一致
ssl_prefer_server_ciphers  on;  # 与其他子域名一致
ssl_ciphers  HIGH:!aNULL:!MD5;  # 使用标准配置
```

### 3. 移除 OCSP Stapling（与其他子域名一致）

由于其他子域名都没有启用 OCSP Stapling，且它们工作正常，为了保持配置一致性并避免可能的兼容性问题，已移除 OCSP Stapling 配置。

## 证书链验证结果

### ✅ 证书链完整性已验证

通过服务器端检查，证书链完整且验证通过：

```bash
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts
# 验证返回码：0 (ok)
```

证书链包含：
1. 服务器证书：`*.bellis.com.cn`
2. 中间证书：`WoTrus DV Server CA`
3. 中间证书：`USERTrust RSA Certification Authority`
4. 根证书：`AAA Certificate Services`

**证书链完整，不是问题根源。**

## ⚠️ 关键问题：bundle.pem 文件可能包含根证书

**重要发现：** 诊断显示 bundle.pem 包含 4 个证书，这可能包含了根证书。**Safari 不需要根证书，只需要服务器证书和中间证书（通常 2 个证书即可）。**

### 诊断结果分析

根据诊断输出：
- ✅ bundle.pem 文件存在
- ✅ 包含 4 个证书（可能包含根证书）
- ✅ 证书链验证通过
- ✅ 证书有效期正常
- ✅ SAN 包含 `*.bellis.com.cn`

**问题：** 4 个证书可能包含了根证书，Safari 对包含根证书的证书链可能无法正确处理。

### 立即检查 bundle.pem 文件

在服务器上运行以下命令：

```bash
# 检查 bundle.pem 文件中的证书数量
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 如果返回 3 或更多，可能包含根证书
# Safari 最佳实践：只需要 2 个证书（服务器证书 + 中间证书）
```

### 快速修复方案

**方案 1：运行自动修复脚本（推荐）**

诊断脚本发现的问题可以通过自动修复脚本一次性解决：

```bash
# 运行自动修复脚本
bash scripts/fix-ssl-issues.sh

# 重新加载 nginx
nginx -s reload
```

修复脚本会自动：
- 修复 key 文件权限（644 → 600）
- 优化证书链（移除根证书，只保留服务器证书和中间证书）
- 检查并提示多个 nginx 进程问题
- 验证修复结果

**方案 2：使用专门的证书链修复脚本（如果方案 1 失败）**

如果自动修复脚本的证书链验证失败，使用专门的证书链修复脚本：

```bash
# 运行证书链修复脚本（智能识别并排除根证书）
bash scripts/fix-cert-chain.sh

# 重新加载 nginx
nginx -t && nginx -s reload
```

这个脚本会：
- 智能识别根证书（自签名证书）
- 保留所有中间证书
- 排除根证书
- 验证证书链完整性

**方案 3：手动优化证书链（如果 bundle.pem 包含 4 个证书）**

如果诊断显示 bundle.pem 包含 4 个证书，通常结构是：
1. 服务器证书
2. 中间证书 1
3. 中间证书 2
4. 根证书

Safari 需要前 3 个（服务器证书 + 所有中间证书），不需要根证书：

```bash
# 备份
cp /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak

# 保留前 3 个证书（排除根证书）
awk '/BEGIN CERTIFICATE/{i++} i<=3' /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem > \
   /tmp/optimized_bundle.pem

# 验证
grep -c "BEGIN CERTIFICATE" /tmp/optimized_bundle.pem
# 应该返回 3

# 替换
mv /tmp/optimized_bundle.pem /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
chmod 644 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 验证证书链
openssl verify -CAfile /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem \
               /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 重新加载 nginx
nginx -t && nginx -s reload
```

**方案 2：使用自动修复脚本**

```bash
# 运行修复脚本（会自动备份并重新生成 bundle.pem）
bash scripts/fix-ssl-bundle.sh

# 重新加载 nginx
nginx -s reload
```

**方案 2：手动修复**

```bash
# 1. 备份当前文件
cp /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak

# 2. 从实际连接中提取证书链
openssl s_client -connect mobile.bellis.com.cn:443 -showcerts </dev/null 2>/dev/null | \
    sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > /tmp/full_chain.pem

# 3. 检查提取的证书数量
grep -c "BEGIN CERTIFICATE" /tmp/full_chain.pem

# 4. 提取前两个证书（服务器证书 + 第一个中间证书）
# Safari 通常不需要根证书
awk '/BEGIN CERTIFICATE/{i++} i<=2' /tmp/full_chain.pem > \
   /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem

# 5. 验证新文件
grep -c "BEGIN CERTIFICATE" /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
# 应该返回 2

# 6. 重新加载 nginx
nginx -t && nginx -s reload
```

## 如果问题仍然存在，需要检查的事项

### 1. 验证 nginx 配置已更新

**步骤：**

1. **检查当前证书链：**
   ```bash
   openssl s_client -connect mobile.bellis.com.cn:443 -showcerts 2>/dev/null | openssl x509 -noout -text
   ```

2. **如果证书链不完整，需要重新生成 bundle.pem：**
   ```bash
   # 假设你有以下文件：
   # - bellis.com.cn.crt (服务器证书)
   # - intermediate.crt (中间证书)
   # - ca-bundle.crt (CA 证书，可选)
   
   # 合并证书链（顺序很重要：服务器证书在前，中间证书在后）
   cat bellis.com.cn.crt intermediate.crt > bellis.com.cn_bundle.pem
   
   # 或者如果还有根 CA 证书
   cat bellis.com.cn.crt intermediate.crt ca-bundle.crt > bellis.com.cn_bundle.pem
   ```

3. **验证合并后的证书链：**
   ```bash
   openssl verify -CAfile bellis.com.cn_bundle.pem bellis.com.cn_bundle.pem
   ```

4. **重新加载 nginx：**
   ```bash
   nginx -t  # 测试配置
   nginx -s reload  # 重新加载配置
   ```

### 2. 确保证书包含子域名

确保证书支持 `mobile.bellis.com.cn` 子域名。可以通过以下方式检查：

```bash
openssl x509 -in /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem -noout -text | grep -A 2 "Subject Alternative Name"
```

如果证书是通配符证书（`*.bellis.com.cn`）或包含 SAN（Subject Alternative Name）扩展，应该可以支持子域名。

### 3. 测试 SSL 配置

使用在线工具测试 SSL 配置：
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

## 部署步骤

1. **备份当前配置：**
   ```bash
   cp /etc/nginx/sites-available/mobile.bellis.com.cn.conf /etc/nginx/sites-available/mobile.bellis.com.cn.conf.bak
   ```

2. **更新配置文件：**
   将修复后的 `mobile.bellis.com.cn.conf` 部署到服务器

3. **检查证书链：**
   按照上述步骤验证证书链完整性

4. **测试 nginx 配置：**
   ```bash
   nginx -t
   ```

5. **重新加载 nginx：**
   ```bash
   nginx -s reload
   ```

6. **验证修复：**
   - 在 iPhone/iPad 的 Safari 浏览器中访问 `https://mobile.bellis.com.cn`
   - 检查是否仍然出现"无法建立安全的连接"错误

## ⚠️ SSL Labs 测试失败："No secure protocol supported"

如果 SSL Labs 测试显示 "Failed to communicate with the secure server - No secure protocol supported"，说明服务器可能没有正确提供 SSL/TLS 服务。

### 立即诊断

运行诊断脚本：

```bash
bash scripts/diagnose-ssl-connection.sh
```

### 常见原因和解决方案

#### 1. nginx 配置未正确加载

```bash
# 检查 nginx 配置
nginx -t

# 如果配置正确，重新加载
nginx -s reload

# 如果 reload 不生效，重启 nginx
systemctl restart nginx
# 或
service nginx restart
```

#### 2. 443 端口未监听

```bash
# 检查端口监听
netstat -tlnp | grep 443
# 或
ss -tlnp | grep 443

# 如果没有监听，检查 nginx 是否运行
ps aux | grep nginx

# 如果 nginx 未运行，启动它
systemctl start nginx
```

#### 3. 防火墙阻止 443 端口

```bash
# CentOS/RHEL
firewall-cmd --list-ports
firewall-cmd --add-service=https --permanent
firewall-cmd --reload

# Ubuntu/Debian
ufw status
ufw allow 443/tcp

# 云服务器安全组
# 需要在云服务商控制台开放 443 端口
```

#### 4. 证书文件权限问题

```bash
# 检查权限
ls -l /home/ssl/bellis.com.cn_nginx/

# 修复权限
chmod 644 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
chmod 600 /home/ssl/bellis.com.cn_nginx/bellis.com.cn.key

# 确保 nginx 用户可以读取
chown root:root /home/ssl/bellis.com.cn_nginx/*.pem
chown root:root /home/ssl/bellis.com.cn_nginx/*.key
```

#### 5. nginx 配置未包含移动应用配置

确保移动应用的配置文件被正确包含：

```bash
# 检查配置文件是否被包含
grep -r "mobile.bellis.com.cn" /etc/nginx/
# 或
grep -r "mobile.bellis.com.cn" /www/server/nginx/conf/

# 如果使用宝塔面板，检查：
# /www/server/panel/vhost/nginx/mobile.bellis.com.cn.conf
```

## 如果问题仍然存在

如果修复后问题仍然存在，请检查：

1. **证书是否过期：**
   ```bash
   openssl x509 -in /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem -noout -dates
   ```

2. **证书是否被吊销：**
   使用在线工具检查证书状态

3. **DNS 解析是否正确：**
   ```bash
   dig mobile.bellis.com.cn
   nslookup mobile.bellis.com.cn
   ```

4. **防火墙和网络配置：**
   确保 443 端口开放，没有中间设备干扰 SSL 握手

5. **iOS 设备时间设置：**
   确保设备时间正确，错误的系统时间会导致证书验证失败

## 参考资源

- [Nginx SSL 配置最佳实践](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Safari SSL/TLS 要求](https://support.apple.com/zh-cn/HT210120)
- [SSL 证书链验证](https://www.digicert.com/kb/ssl-support/openssl-quick-reference-guide.htm)

