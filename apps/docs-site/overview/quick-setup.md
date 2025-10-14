---
title: 快速设置指南 - 局域网访问文档中心
type: overview
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- setup
- network
sidebar_label: 快速设置
sidebar_order: 2
sidebar_group: overview
---

# 快速设置指南 - 局域网访问文档中心

## 问题
默认情况下，文档中心运行在 `localhost:8085`，只有本机能访问其他PC无法访问

## 解决方案
使用环境变量配置，支持通过IP地址访问

## 快速设置步骤

### 1. 获取您的IP地址

**Windows:**
```powershell
ipconfig
```
查找"IPv4 地址"，例如：`10.80.8.199`

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### 2. 配置文档中心地址

**方法 A：创建配置文件（推荐）**

在 `apps/main-app/` 目录下创建 `.env.development.local` 文件：

```bash
# 文档中心地址（局域网访问）
VITE_DOCS_URL=http://10.80.8.199:8085
```

**方法 B：修改现有配置**

编辑 `apps/main-app/.env.development` 文件：

```bash
# 将 localhost 改为您的 IP 地址
VITE_DOCS_URL=http://10.80.8.199:8085
```

### 3. 重启应用

```bash
# 停止当前运行的应用
Ctrl + C

# 重新启动
pnpm dev:main
```

### 4. 验证访问

1. 本机访问：http://localhost:8080
2. 其他PC访问：http://10.80.8.199:8080
3. 点击"文档中心"菜单，应该能正常访问文档

## 防火墙配置

如果其他PC仍无法访问，请检查防火墙设置：

### Windows 防火墙

1. 打开"Windows Defender 防火墙"
2. 点击"允许应用或功能通过 Windows Defender 防火墙"
3. 找到"Node.js JavaScript Runtime"，确保"专用"和"公用"都勾选

### 临时关闭防火墙（测试用）

```powershell
# 管理员权限运行
netsh advfirewall set allprofiles state off
```

** 注意：测试完成后请重新开启防火墙**

## 网络故障排除

### 检查端口占用

```bash
# 检查端口是否被占用
netstat -ano | findstr :8085
netstat -ano | findstr :8080
```

### 检查网络连通性

```bash
# 从其他PC ping 您的机器
ping 10.80.8.199

# 检查端口是否开放
telnet 10.80.8.199 8085
```

### 常见问题

1. **端口被占用**
- 解决方案：更换端口或终止占用进程

2. **防火墙阻止**
- 解决方案：配置防火墙规则

3. **网络不通**
- 解决方案：检查IP地址和网络配置

4. **VitePress 配置问题**
- 解决方案：确保 `host: '0.0.0.0'` 配置正确

## 生产环境配置

生产环境不需要特殊配置，因为：
- 使用反向代理（如 Nginx）
- 通过域名访问
- 防火墙规则已配置

## 相关文档

- [部署指南](/guides/deployment)
- [网络配置](/guides/network)
- [故障排除](/guides/troubleshooting)
