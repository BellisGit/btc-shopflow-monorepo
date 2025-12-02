# SSL 证书文件说明

## 文件列表

1. **bellis.com.cn_bundle.pem** - 证书链文件（PEM 格式）
2. **bellis.com.cn_bundle.crt** - 证书链文件（CRT 格式，通常与 PEM 相同）
3. **bellis.com.cn.key** - 私钥文件
4. **bellis.com.cn.csr** - 证书签名请求文件

## Safari/iOS 优化

Safari 对证书链有特殊要求：
- ✅ 需要服务器证书
- ✅ 需要所有中间证书
- ❌ **不需要根证书**（根证书应该已经在系统信任库中）

### 合并为 Safari 格式

运行合并脚本：

```bash
# 在项目根目录执行
bash scripts/merge-certs-for-safari.sh
```

脚本会：
1. 分析证书链结构
2. 识别并排除根证书
3. 生成优化后的证书链文件：`bellis.com.cn_bundle_safari.pem`

### 手动合并（如果脚本不可用）

如果 bundle.pem 包含 4 个证书，通常结构是：
1. 服务器证书（*.bellis.com.cn）
2. 中间证书 1（WoTrus DV Server CA）
3. 中间证书 2（USERTrust RSA Certification Authority）
4. 根证书（AAA Certificate Services）

Safari 需要前 3 个，排除第 4 个根证书：

```bash
# 保留前 3 个证书
awk '/BEGIN CERTIFICATE/{i++} i<=3' bellis.com.cn_bundle.pem > bellis.com.cn_bundle_safari.pem
```

## 部署到服务器

1. 将优化后的 `bellis.com.cn_bundle_safari.pem` 上传到服务器
2. 替换服务器上的 bundle.pem：
   ```bash
   cp bellis.com.cn_bundle_safari.pem /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
   chmod 644 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem
   ```
3. 重新加载 nginx：
   ```bash
   nginx -t && nginx -s reload
   ```

## 验证

```bash
# 检查证书数量（应该是 2-3 个，不包含根证书）
grep -c "BEGIN CERTIFICATE" bellis.com.cn_bundle_safari.pem

# 验证证书链（可能会失败，因为缺少根证书，但这是正常的）
openssl verify -CAfile bellis.com.cn_bundle_safari.pem bellis.com.cn_bundle_safari.pem
```

