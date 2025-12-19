# Git UTF-8 编码测试结果

## 测试环境
- Windows 代码页：65001 (UTF-8) ✓
- Git 版本：需要检查
- Git 配置：`i18n.commitencoding=utf-8` ✓

## 测试结果

### 问题
即使系统代码页设置为 UTF-8 (65001)，git 在 Windows 上读取文件时仍然可能使用错误的编码，导致中文字符被存储为问号（`3F`）。

### 可能的原因
1. **Git for Windows 的编码处理**：Git for Windows 在读取文件时可能使用系统默认编码（ANSI），而不是 UTF-8
2. **PowerShell 编码问题**：PowerShell 在传递参数给 git 时可能进行了编码转换
3. **Git 配置问题**：`i18n.commitencoding` 只影响 git 如何解释提交信息，不影响 git 如何读取文件

### 解决方案

#### 方案 1：使用 Git Bash（推荐）
Git Bash 对 UTF-8 支持更好：

```bash
# 在 Git Bash 中执行
git commit -m "test: 测试UTF-8中文提交信息"
```

#### 方案 2：使用英文提交信息
避免编码问题：

```powershell
git commit -m "fix: fix health check and build dependency issues"
```

#### 方案 3：使用 Git Bash 提交，PowerShell 做其他操作
- 日常开发使用 PowerShell
- 提交时切换到 Git Bash

#### 方案 4：检查 Git for Windows 设置
1. 打开 Git Bash
2. 执行：`git config --global core.quotepath false`
3. 检查：`git config --global i18n.commitencoding utf-8`

### 验证方法

检查提交信息是否正确存储：

```powershell
# 查看提交信息（显示）
git log -1 --format="%s"

# 查看 git 对象中的原始字节（验证）
git cat-file commit HEAD | Format-Hex | Select-String -Pattern "test:"
```

如果看到正确的 UTF-8 字节序列（如 `E6 B5 8B E8 AF 95` 对应"测试"），说明存储正确。
如果看到问号（`3F`），说明编码有问题。

### 当前状态
- ✅ 系统代码页：65001 (UTF-8)
- ✅ Git 配置：`i18n.commitencoding=utf-8`
- ❌ Git 读取文件编码：可能仍使用 ANSI
- ❌ 中文提交信息：存储为问号

### 建议
1. **短期**：使用英文提交信息，避免编码问题
2. **长期**：使用 Git Bash 进行提交操作，或等待 Git for Windows 改进 UTF-8 支持
