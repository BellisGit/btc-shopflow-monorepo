# SSH密钥配置指南

## 问题诊断

当前SSH连接失败，错误信息：`Permission denied (publickey)`

这通常意味着SSH私钥没有在服务器上正确授权。

## 解决步骤

### 1. 生成SSH密钥对（如果还没有）

在你的本地机器上运行：

```bash
# 生成新的SSH密钥对
ssh-keygen -t rsa -b 4096 -C "btc-shopflow-deploy"

# 默认会保存到 ~/.ssh/id_rsa (私钥) 和 ~/.ssh/id_rsa.pub (公钥)
```

### 2. 将公钥添加到服务器

#### 方法1：使用ssh-copy-id（推荐）
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_SERVER_IP
```

#### 方法2：手动复制
```bash
# 1. 显示公钥内容
cat ~/.ssh/id_rsa.pub

# 2. 登录到服务器
ssh root@YOUR_SERVER_IP

# 3. 在服务器上创建authorized_keys文件
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 4. 将公钥内容添加到authorized_keys
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

#### SERVER_KEY
```bash
# 复制私钥内容（注意是私钥，不是公钥）
cat ~/.ssh/id_rsa
```

将完整的私钥内容（包括`-----BEGIN RSA PRIVATE KEY-----`和`-----END RSA PRIVATE KEY-----`）复制到GitHub Secrets中的`SERVER_KEY`。

#### 其他必需的Secrets
- `SERVER_HOST`: 服务器IP地址（如：123.456.789.0）
- `SERVER_USER`: SSH用户名（通常是root）
- `SERVER_PORT`: SSH端口（默认22）

### 4. 验证配置

在本地测试SSH连接：

```bash
ssh -i ~/.ssh/id_rsa root@YOUR_SERVER_IP
```

如果能成功连接，说明配置正确。

### 5. 服务器SSH配置检查

确保服务器的SSH配置允许密钥认证：

```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 确保以下配置项：
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# 重启SSH服务
sudo systemctl restart sshd
```

## 常见问题

### 问题1：权限错误
```bash
# 在服务器上设置正确权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R $USER:$USER ~/.ssh
```

### 问题2：SELinux问题（CentOS/RHEL）
```bash
# 恢复SELinux上下文
restorecon -R ~/.ssh
```

### 问题3：防火墙阻塞
```bash
# 检查SSH端口是否开放
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=22/tcp --permanent
sudo firewall-cmd --reload
```

## 测试工作流

配置完成后，推送代码到master分支，工作流会在第一步验证SSH连接。如果配置正确，你会看到：

```
[SUCCESS] SSH connection successful!
```

## 安全建议

1. **使用专用密钥**：为部署创建专门的SSH密钥对
2. **限制权限**：在服务器上为部署用户设置最小必要权限
3. **定期轮换**：定期更新SSH密钥
4. **监控访问**：监控SSH访问日志

## 获取帮助

如果仍然遇到问题，请检查：
1. 服务器SSH日志：`sudo tail -f /var/log/auth.log`
2. GitHub Actions日志中的详细错误信息
3. 确认所有Secrets都已正确设置
