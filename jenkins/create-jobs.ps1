# Jenkins 批量创建 Jobs 脚本
# 使用方法：
# 1. 确保 Jenkins 已启动并可以访问
# 2. 在 PowerShell 中运行：.\jenkins\create-jobs.ps1
# 3. 或者指定 Jenkins URL：.\jenkins\create-jobs.ps1 -JenkinsUrl "http://localhost:8080"

param(
    [string]$JenkinsUrl = "http://localhost:8080",
    [string]$GitRepoUrl = "https://github.com/BellisGit/btc-shopflow-monorepo.git",
    [string]$Branch = "develop"
)

# 颜色输出
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# 应用列表
$apps = @(
    "system-app",
    "admin-app",
    "logistics-app",
    "quality-app",
    "production-app",
    "engineering-app",
    "finance-app",
    "mobile-app"
)

Write-Info "开始创建 Jenkins Jobs..."
Write-Info "Jenkins URL: $JenkinsUrl"
Write-Info "Git 仓库: $GitRepoUrl"
Write-Info "分支: $Branch"
Write-Host ""

# 检查 Jenkins CLI
$jenkinsCliPath = "jenkins-cli.jar"
if (-not (Test-Path $jenkinsCliPath)) {
    Write-Info "下载 Jenkins CLI..."
    try {
        $cliUrl = "$JenkinsUrl/jnlpJars/jenkins-cli.jar"
        Invoke-WebRequest -Uri $cliUrl -OutFile $jenkinsCliPath
        Write-Success "Jenkins CLI 下载完成"
    } catch {
        Write-Error "下载 Jenkins CLI 失败: $_"
        exit 1
    }
}

# 创建单个应用 Job 的配置 XML
function Create-SingleAppJobConfig {
    param(
        [string]$AppName,
        [string]$RepoUrl,
        [string]$BranchName
    )
    
    $jobName = "btc-shopflow-deploy-$AppName"
    
    $xml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow - 部署 $AppName</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>APP_NAME</name>
          <description>应用名称（自动从 Job 名称获取）</description>
          <defaultValue>$AppName</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>服务器地址</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>服务器用户名</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH 端口</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH 私钥路径（在 Jenkins 服务器上的路径）</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>是否跳过测试（加快构建速度）</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>是否清理构建缓存（强制重新构建）</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>$RepoUrl</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/$BranchName</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>jenkins/Jenkinsfile.single-app</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@
    
    return $xml
}

# 创建全量部署 Job 的配置 XML
function Create-AllAppsJobConfig {
    param(
        [string]$RepoUrl,
        [string]$BranchName
    )
    
    $xml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow - 全量部署所有应用</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>服务器地址</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>服务器用户名</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH 端口</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH 私钥路径（在 Jenkins 服务器上的路径）</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>是否跳过测试（加快构建速度）</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>是否清理构建缓存（强制重新构建）</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>$RepoUrl</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/$BranchName</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>jenkins/Jenkinsfile.all-apps</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@
    
    return $xml
}

# 创建 Job
function Create-Job {
    param(
        [string]$JobName,
        [string]$JobConfig
    )
    
    Write-Info "创建 Job: $JobName"
    
    # 将配置保存到临时文件
    $tempFile = [System.IO.Path]::GetTempFileName()
    $JobConfig | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        # 使用 Jenkins CLI 创建 Job
        # 方法：使用 Get-Content 读取文件并通过管道传递给 Java 进程
        $jobConfigContent = Get-Content $tempFile -Raw
        
        # 创建进程启动信息
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "java"
        $psi.Arguments = "-jar `"$jenkinsCliPath`" -s `"$JenkinsUrl`" create-job `"$JobName`""
        $psi.UseShellExecute = $false
        $psi.RedirectStandardInput = $true
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $psi
        
        # 启动进程
        $process.Start() | Out-Null
        
        # 写入标准输入
        $process.StandardInput.Write($jobConfigContent)
        $process.StandardInput.Close()
        
        # 读取输出
        $output = $process.StandardOutput.ReadToEnd()
        $error = $process.StandardError.ReadToEnd()
        
        # 等待进程结束
        $process.WaitForExit()
        $exitCode = $process.ExitCode
        
        # 清理进程
        $process.Dispose()
        
        if ($exitCode -eq 0) {
            Write-Success "Job '$JobName' 创建成功"
            Write-Host "   访问: $JenkinsUrl/job/$JobName" -ForegroundColor Cyan
            return $true
        } else {
            Write-Error "Job '$JobName' 创建失败 (退出码: $exitCode)"
            if ($error) {
                Write-Host "错误信息: $error" -ForegroundColor Red
            }
            if ($output) {
                Write-Host "输出信息: $output" -ForegroundColor Yellow
            }
            return $false
        }
    } catch {
        Write-Error "创建 Job '$JobName' 时出错: $_"
        return $false
    } finally {
        # 清理临时文件
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

# 检查 Job 是否已存在
function Job-Exists {
    param([string]$JobName)
    
    $result = java -jar $jenkinsCliPath -s $JenkinsUrl get-job $JobName 2>&1
    return $LASTEXITCODE -eq 0
}

# 主流程
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Jobs 批量创建工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Jenkins 连接
Write-Info "检查 Jenkins 连接..."
try {
    $response = Invoke-WebRequest -Uri "$JenkinsUrl/api/json" -UseBasicParsing -TimeoutSec 5
    Write-Success "Jenkins 连接成功"
} catch {
    Write-Error "无法连接到 Jenkins: $_"
    Write-Warning "请确保 Jenkins 已启动，并且 URL 正确"
    exit 1
}

Write-Host ""

# 创建单个应用的 Jobs
$successCount = 0
$failCount = 0

foreach ($app in $apps) {
    $jobName = "btc-shopflow-deploy-$app"
    
    if (Job-Exists $jobName) {
        Write-Warning "Job '$jobName' 已存在，跳过"
        continue
    }
    
    $config = Create-SingleAppJobConfig -AppName $app -RepoUrl $GitRepoUrl -BranchName $Branch
    if (Create-Job -JobName $jobName -JobConfig $config) {
        $successCount++
    } else {
        $failCount++
    }
    Write-Host ""
}

# 创建全量部署 Job
Write-Host "----------------------------------------" -ForegroundColor Cyan
$allJobName = "btc-shopflow-deploy-all"

if (Job-Exists $allJobName) {
    Write-Warning "Job '$allJobName' 已存在，跳过"
} else {
    $config = Create-AllAppsJobConfig -RepoUrl $GitRepoUrl -BranchName $Branch
    if (Create-Job -JobName $allJobName -JobConfig $config) {
        $successCount++
    } else {
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "创建完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Success "成功创建: $successCount 个 Jobs"
if ($failCount -gt 0) {
    Write-Error "失败: $failCount 个 Jobs"
}
Write-Host ""
Write-Info "访问 Jenkins: $JenkinsUrl"
Write-Info "所有 Jobs 列表: $JenkinsUrl/view/all/"
