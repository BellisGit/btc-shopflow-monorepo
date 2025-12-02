# Safari 优化证书说明

## 📋 证书合并完成

已成功将证书链合并为 Safari/iOS 支持的格式。

## 📁 生成的文件

- **bellis.com.cn_bundle_safari.pem** - Safari 优化的证书链文件（已排除根证书）

## 🔍 证书链结构

### 原始证书链（4 个证书）
1. ✅ 服务器证书：`*.bellis.com.cn`
2. ✅ 中间证书 1：`WoTrus DV Server CA`
3. ✅ 中间证书 2：`USERTrust RSA Certification Authority`
4. ❌ 根证书：`AAA Certificate Services` （已排除）

### Safari 优化证书链（3 个证书）
1. ✅ 服务器证书：`*.bellis.com.cn`
2. ✅ 中间证书 1：`WoTrus DV Server CA`
3. ✅ 中间证书 2：`USERTrust RSA Certification Authority`

## ✅ 验证结果

- **证书数量**：3 个（正确，不包含根证书）
- **文件大小**：6266 字节（原始文件 7781 字节）
- **格式**：PEM 格式，符合 Safari 要求

## 🚀 使用方法

### 部署到服务器

1. **上传证书文件到服务器**
   ```bash
   # 使用 SCP 或其他工具上传
   scp bellis.com.cn_bundle_safari.pem root@your-server:/home/ssl/bellis.com.cn_nginx/
   ```

2. **备份原证书文件**
   ```bash
   cd /home/ssl/bellis.com.cn_nginx
   cp bellis.com.cn_bundle.pem bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)
   ```

3. **替换证书文件**
   ```bash
   cp bellis.com.cn_bundle_safari.pem bellis.com.cn_bundle.pem
   chmod 644 bellis.com.cn_bundle.pem
   ```

4. **验证证书**
   ```bash
   # 检查证书数量（应该是 3 个）
   grep -c "BEGIN CERTIFICATE" bellis.com.cn_bundle.pem
   
   # 验证 nginx 配置
   nginx -t
   ```

5. **重新加载 nginx**
   ```bash
   nginx -s reload
   ```

### 验证修复

1. **在 iOS Safari 中测试**
   - 清除 Safari 缓存（设置 → Safari → 清除历史记录与网站数据）
   - 访问 `https://mobile.bellis.com.cn`

2. **使用在线工具验证**
   - [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html?d=mobile.bellis.com.cn)
   - [SSL Checker](https://www.sslshopper.com/ssl-checker.html#hostname=mobile.bellis.com.cn)

## 📝 重要说明

### 为什么排除根证书？

- Safari 不需要根证书在证书链中
- 根证书应该已经在系统信任库中
- 包含根证书可能导致 Safari 验证失败

### 证书链顺序

证书链顺序非常重要，必须按照以下顺序：
1. 服务器证书（第一个）
2. 中间证书（按层级顺序）

## 🔄 如需重新生成

如果证书文件更新了，可以重新运行合并过程：

```powershell
cd C:\Users\mlu\Desktop\btc-shopflow\btc-shopflow-monorepo\certs\bellis.com.cn_nginx
$certPath = "bellis.com.cn_bundle.pem"
$outputPath = "bellis.com.cn_bundle_safari.pem"
$content = Get-Content $certPath -Raw
$certPattern = "(?s)-----BEGIN CERTIFICATE-----.+?-----END CERTIFICATE-----"
$matches = [regex]::Matches($content, $certPattern)
$certsToKeep = if ($matches.Count -ge 4) { 3 } else { $matches.Count }
$result = ""
for ($i = 0; $i -lt $certsToKeep; $i++) {
    $result += $matches[$i].Value + "`n`n"
}
$result.Trim() | Out-File -FilePath $outputPath -Encoding ASCII -NoNewline
Write-Host "✅ Safari 优化证书已生成: $outputPath"
```

## 📚 相关文档

- [Safari 问题解决指南](../../docs/SAFARI_问题解决指南.md)
- [SSL Safari 修复文档](../../docs/SSL_SAFARI_FIX.md)
- [证书 README](../README.md)

