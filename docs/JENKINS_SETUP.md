# Jenkins 部署配置指南

## 概述

本文档介绍如何配置 Jenkins 来自动化构建和部署 BTC ShopFlow 项目。

## Jenkins 的优势

相比手动部署，使用 Jenkins 可以带来以下好处：

- ✅ **自动化构建和部署**：一键完成从代码到生产的全流程
- ✅ **构建历史记录**：保留所有构建日志和历史
- ✅ **并行构建**：可以同时构建多个应用
- ✅ **回滚功能**：可以快速回滚到之前的版本
- ✅ **通知机制**：构建失败时自动通知
- ✅ **权限控制**：控制谁可以触发部署
- ✅ **统一的部署入口**：团队统一使用 Jenkins 部署

## 前置要求

### 1. Jenkins 服务器环境

- **Jenkins 2.x** 已安装
- **Node.js 20+** 已安装（或使用 nvm）
- **pnpm 8.15.0+** 已安装
- **Git** 已安装
- **SSH 客户端** 已安装

### 2. 必需插件

在 Jenkins 管理界面安装以下插件：

- **Git Plugin**：Git 代码管理
- **Credentials Binding Plugin**：凭证管理
- **Pipeline**：Pipeline 支持
- **SSH Pipeline Steps**（可选）：SSH 操作支持
- **Email Extension Plugin**（可选）：邮件通知
- **Blue Ocean**（可选）：更好的 UI 界面

### 3. 服务器访问配置

确保 Jenkins 服务器可以：
- 访问 Git 仓库（如 GitHub）
- 通过 SSH 连接到部署服务器

## 配置步骤

### 步骤 1: 配置 Jenkins Credentials

在 Jenkins 管理界面添加以下凭证：

#### 1.1 SSH 私钥

1. 进入 **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. 点击 **Add Credentials**
3. 配置如下：
   - **Kind**: SSH Username with private key
   - **ID**: `ssh-deploy-key`
   - **Username**: 部署服务器的用户名（如 `root`）
   - **Private Key**: 选择 **Enter directly**，粘贴 SSH 私钥内容
   - **Description**: `SSH 部署密钥`

#### 1.2 服务器配置（使用 Secret Text）

为以下配置添加 Secret Text 类型的凭证：

| ID | 说明 | 示例值 |
|---|---|---|
| `deploy-server-host` | 服务器地址 | `192.168.1.100` 或 `your-server.com` |
| `deploy-server-user` | 服务器用户名 | `root` |
| `deploy-server-port` | SSH 端口 | `22` |

**注意**：每个 Secret Text 只保存一个值（如服务器地址），不是 JSON 格式。

### 步骤 2: 创建 Jenkins Pipeline

#### 方式一：使用 Jenkinsfile（推荐）

项目根目录已经包含 `Jenkinsfile`，直接创建 Pipeline Job：

1. 在 Jenkins 首页点击 **New Item**
2. 输入任务名称（如 `btc-shopflow-deploy`）
3. 选择 **Pipeline**
4. 点击 **OK**

5. 配置 Pipeline：
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: 你的 Git 仓库地址
   - **Credentials**: 如果有私有仓库，选择 Git 凭证
   - **Branch Specifier**: `*/develop`（或你使用的主要分支）
   - **Script Path**: `Jenkinsfile`
   - 点击 **Save**

#### 方式二：直接在 Jenkins 中配置

如果不想使用 Jenkinsfile，可以在 Jenkins 中直接配置 Pipeline：

1. 创建 Pipeline Job
2. 在 Pipeline 配置中选择 **Pipeline script**
3. 将 `Jenkinsfile` 的内容粘贴到脚本框中

### 步骤 3: 配置部署配置

确保项目中有 `deploy.config.json` 文件（或复制 `deploy.config.example.json`）：

```json
{
  "apps": {
    "system-app": {
      "deployPath": "/www/wwwroot/bellis.com.cn",
      "domain": "bellis.com.cn"
    },
    "admin-app": {
      "deployPath": "/www/wwwroot/admin.bellis.com.cn",
      "domain": "admin.bellis.com.cn"
    }
    // ... 其他应用
  }
}
```

### 步骤 4: 首次运行

1. 点击 Pipeline Job 的 **Build with Parameters**
2. 选择要部署的应用（或选择 `all` 部署所有应用）
3. 配置其他参数：
   - **SKIP_TESTS**: 首次构建建议设为 `false`，确保代码质量
   - **CLEAN_BUILD**: 设为 `true` 强制重新构建
4. 点击 **Build**

## 使用说明

### 手动触发构建

1. 进入 Jenkins Pipeline Job
2. 点击 **Build with Parameters**
3. 选择要部署的应用
4. 点击 **Build**

### 自动触发构建（可选）

如果需要代码推送后自动构建，可以在 Jenkinsfile 中添加：

```groovy
triggers {
    // 每 5 分钟检查一次是否有新的提交
    pollSCM('H/5 * * * *')
    
    // 或使用 GitHub Webhook（需要安装 GitHub Plugin）
    // githubPush()
}
```

### 构建参数说明

| 参数 | 说明 | 选项 |
|---|---|---|
| `APP_NAME` | 要部署的应用 | `system-app`, `admin-app`, ..., `all` |
| `SKIP_TESTS` | 是否跳过测试 | `true` / `false` |
| `CLEAN_BUILD` | 是否清理缓存 | `true` / `false` |

## 构建流程说明

Jenkins Pipeline 会执行以下步骤：

1. **Checkout**：检出代码
2. **Setup Environment**：安装 Node.js 和 pnpm
3. **Install Dependencies**：安装项目依赖
4. **Lint & Type Check**：代码检查和类型检查
5. **Test**：运行测试（可选）
6. **Build**：构建应用
7. **Verify Build Artifacts**：验证构建产物
8. **Deploy**：部署到服务器
9. **Post-Deploy Verification**：部署后验证

## 高级配置

### 并行构建多个应用

如果需要并行构建多个应用，可以修改 Jenkinsfile 的 Build 阶段：

```groovy
stage('Build') {
    parallel {
        stage('Build system-app') {
            steps {
                sh 'pnpm --filter system-app run build'
            }
        }
        stage('Build admin-app') {
            steps {
                sh 'pnpm --filter admin-app run build'
            }
        }
        // ... 其他应用
    }
}
```

### 添加通知

#### 邮件通知

在 `post` 部分添加：

```groovy
post {
    failure {
        emailext(
            subject: "构建失败: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "构建失败，请查看日志：${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
}
```

#### 企业微信/钉钉通知

可以使用对应的 Jenkins 插件或调用 Webhook API。

### 添加构建后操作

可以在 Jenkins Job 配置中添加构建后操作：

- **Archive artifacts**：归档构建产物
- **Publish test results**：发布测试结果
- **Build other projects**：触发其他构建

## 故障排查

### 常见问题

#### 1. Node.js 版本不匹配

**问题**：构建时提示 Node.js 版本错误

**解决**：
- 在 Jenkins 服务器上安装正确的 Node.js 版本
- 或使用 nvm 在 Pipeline 中切换版本

#### 2. SSH 连接失败

**问题**：部署时无法连接到服务器

**解决**：
- 检查 SSH 私钥是否正确
- 检查服务器地址和端口是否正确
- 检查 Jenkins 服务器是否可以访问部署服务器

#### 3. 构建产物不存在

**问题**：部署阶段找不到构建产物

**解决**：
- 检查构建阶段是否成功
- 检查构建脚本是否正确执行
- 查看构建日志确认 dist 目录是否生成

#### 4. 权限问题

**问题**：部署时提示权限不足

**解决**：
- 检查 SSH 用户是否有权限写入部署目录
- 检查部署目录的权限设置

## 最佳实践

1. **使用 Jenkinsfile**：将 Pipeline 配置版本化，便于管理和协作
2. **定期清理**：配置构建历史保留策略，避免占用过多磁盘空间
3. **分离环境**：为开发、测试、生产环境创建不同的 Pipeline
4. **权限控制**：限制生产环境部署权限
5. **备份配置**：定期备份 Jenkins 配置和凭证

## 参考资源

- [Jenkins Pipeline 文档](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkinsfile 语法参考](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins 插件市场](https://plugins.jenkins.io/)
