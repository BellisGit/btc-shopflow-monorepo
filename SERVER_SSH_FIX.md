# 🔧 修复服务器 SSH 配置

## 问题发现

在服务器上检查 `authorized_keys` 文件时发现：

1. **文件所有者错误**：文件所有者是 `www www`，应该是 `root root`
2. **公钥格式问题**：两个公钥连在一起，没有换行符分隔

## 快速修复命令

在服务器上运行以下命令：

```bash
# 1. 修复文件所有者
chown root:root /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 2. 修复公钥格式（确保每行一个公钥）
# 备份原文件
cp /root/.ssh/authorized_keys /root/.ssh/authorized_keys.backup

# 手动编辑文件，确保每个公钥独占一行
nano /root/.ssh/authorized_keys

# 或者使用以下命令自动修复（删除重复的公钥）
cat /root/.ssh/authorized_keys | sort -u > /root/.ssh/authorized_keys.tmp
mv /root/.ssh/authorized_keys.tmp /root/.ssh/authorized_keys
chown root:root /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 3. 验证修复结果
ls -la /root/.ssh/authorized_keys
cat /root/.ssh/authorized_keys
```

## 正确的 authorized_keys 格式

每行应该是一个完整的公钥，格式如下：

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCiuGpYIBtTy2Z2o7t95puMcidVvToEPFmakIMYNdroDCfJEEDO1cpbK7GA22tnrqwtJh3nZsgAgO/YotNINZggox2Ts0zT96j2FwbqfA8usx2s7ZyobNA38HxeKED2RgMc88wYoin/dGPd3RpHdWjR1YX7rjzxYR+8NL0mPUILqdfpFWXN21wZGFCFM1Pj1x1CYmmzngpyL67C+kaqalKScTYoQdUnvk9ZbwtzUskEZVHhC4l33d+uz2HEV3Vwwqf3xkUnLGzfrnW/DM4WCwBgLSmks0ww4GwLRTTh8l+GqujB7Pnw9B1Hv4ckSQdRUl/bZskFT1GMxyzgE1wcJa4ZkEbU5y1a/MeLAN5ZU18u03pW7HYOttGdxyQ3u3cKojGb5dE0XfUt4eqe6/BePUIKy7kEnnGwO2N7eQB+y2D4x6uigjA9nQ7o0oDgJgWce+4IiZX0dvDeRX5XK5G8Lfv2aByWhsa5lyT1cZLO8lJqP9p/tHKI27xIE0Gpo/b8TnfxaAH8ttQlcNpInRI1dpPLCQKxM/laqtDhALXWdXkA0Z4HI9oN2Mt0LNlgQNxT23VCd9Vu/A9j84UF8rX58wCCUoW8BU2hx87qUa/qpMV3vfdvpqdG+kEL9WYSNvrv19leckUlXcUAnfxYMm5HhJPj/2FB6gjFN0HQEk9OrZRIzw== github-actions-deploy
```

## 修复后的验证

修复后，应该看到：

```bash
ls -la /root/.ssh/authorized_keys
# 应该显示: -rw------- 1 root root ... authorized_keys
#          ^^^^^^^^^   ^^^^ ^^^^
#          权限 600   所有者 root
```

## 测试 SSH 连接

修复后，在本地测试连接：

```bash
ssh -i /mnt/c/Users/mlu/.ssh/github_actions_key -p 22 root@47.112.31.96
```

如果连接成功，应该能直接登录而不需要密码。

