# Jenkins Credentials 配置指南

## 概述

本文档说明如何在 Jenkins 中配置部署所需的凭证（Credentials）。

## 必需凭证列表

| ID | 类型 | 说明 | 示例值 |
|---|---|---|---|
| `ssh-deploy-key` | Secret file 或 SSH Username with private key | SSH 私钥文件 | ~/.ssh/id_rsa 的内容 |
| `deploy-server-host` | Secret text | 服务器地址 | `47.112.31.96` 或 `your-server.com` |
| `deploy-server-user` | Secret text | 服务器用户名 | `root` |
| `deploy-server-port` | Secret text | SSH 端口 | `22` |

## 配置步骤

### 1. 进入 Credentials 管理

1. 登录 Jenkins
2. 点击 **Manage Jenkins**（管理 Jenkins）
3. 点击 **Credentials**（凭证）
4. 点击 **System** → **Global credentials (unrestricted)**（全局凭证）

### 2. 配置 SSH 私钥

有两种方式配置 SSH 私钥：

#### 方式一：Secret file（推荐，简单）

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret file`
   - **File**（文件）: 选择或上传你的 SSH 私钥文件（如 `~/.ssh/id_rsa`）
   - **ID**: `ssh-deploy-key`
   - **Description**: `SSH 部署密钥`
3. 点击 **OK**

#### 方式二：SSH Username with private key（更灵活）

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `SSH Username with private key`
   - **ID**: `ssh-deploy-key`
   - **Description**: `SSH 部署密钥`
   - **Username**: 服务器用户名（如 `root`）
   - **Private Key**: 选择 **Enter directly**，然后粘贴私钥内容
   - 或者选择 **From the Jenkins master ~/.ssh** 使用服务器上的密钥
3. 点击 **OK**

**注意**：如果使用方式二，可能需要调整 Jenkinsfile 中的环境变量引用方式。

### 3. 配置服务器地址

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入服务器地址（如 `47.112.31.96`）
   - **ID**: `deploy-server-host`
   - **Description**: `部署服务器地址`
3. 点击 **OK**

### 4. 配置服务器用户名

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入服务器用户名（如 `root`）
   - **ID**: `deploy-server-user`
   - **Description**: `部署服务器用户名`
3. 点击 **OK**

### 5. 配置 SSH 端口

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入 SSH 端口（如 `22`）
   - **ID**: `deploy-server-port`
   - **Description**: `SSH 端口`
3. 点击 **OK**

## 验证配置

配置完成后，可以通过以下方式验证：

1. 在 Pipeline Job 配置中，查看环境变量部分是否正确识别了这些凭证
2. 运行一次构建，检查是否能够正确读取凭证

## 安全建议

1. **最小权限原则**：SSH 私钥应该只具有部署目录的访问权限
2. **定期轮换**：定期更换 SSH 密钥
3. **不要提交密钥**：确保 SSH 私钥不会被提交到 Git 仓库
4. **使用专用密钥**：为 Jenkins 部署创建专用的 SSH 密钥对，不要使用个人密钥

## 常见问题

### Q: 如果我的服务器配置是固定的，可以硬编码吗？

A: 不推荐硬编码。使用 Credentials 的好处：
- 安全性：敏感信息不会出现在日志中
- 灵活性：不同环境可以使用不同的凭证
- 可维护性：修改配置不需要修改代码

### Q: 可以使用环境变量吗？

A: 可以，但需要确保 Jenkins 节点上有这些环境变量。推荐使用 Jenkins Credentials，因为：
- 集中管理
- 更好的安全性
- 可以在不同节点间共享

### Q: SSH 连接失败怎么办？

A: 检查以下几点：
1. SSH 私钥是否正确配置
2. 私钥是否有正确的权限（600）
3. 服务器地址、用户名、端口是否正确
4. Jenkins 服务器是否可以访问部署服务器（网络连通性）
5. 服务器上是否允许该用户通过 SSH 登录
