# Docker Hub 登录指南

## 问题
构建 Docker 镜像时需要使用 `docker/dockerfile:1.7` 语法解析器，这需要从 Docker Hub 拉取，但现在 Docker Hub 要求登录并验证邮箱。

## 解决方法

### 步骤 1：登录 Docker Hub

在 PowerShell 或命令行中运行：

```powershell
docker login
```

然后输入您的：
- **用户名**：您的 Docker Hub 用户名
- **密码**：您的 Docker Hub 密码（或访问令牌）

### 步骤 2：验证邮箱

如果提示 "email must be verified"：
1. 访问 https://hub.docker.com/
2. 登录您的账号
3. 检查邮箱验证状态
4. 如果未验证，点击邮箱中的验证链接

### 步骤 3：重新运行构建

登录成功后，重新运行构建脚本：

```bash
npm run build-deploy:system
```

## 好处

登录 Docker Hub 后：
- ✅ 可以拉取 `docker/dockerfile:1.7` 语法解析器
- ✅ 可以使用 `RUN --mount=type=cache` 构建缓存功能
- ✅ 大幅加速后续构建（缓存依赖安装）

## 创建 Docker Hub 账号

如果您还没有 Docker Hub 账号：
1. 访问 https://hub.docker.com/signup
2. 注册账号
3. 验证邮箱
4. 然后按照上面的步骤登录


