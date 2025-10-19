<template>
  <div class="test-eps">
    <h2>EPS Service 测试</h2>

    <div class="test-section">
      <h3>1. 测试 Service 导入</h3>
      <el-button @click="testServiceImport" type="primary">测试 Service 导入</el-button>
      <div v-if="serviceResult" class="result">
        <pre>{{ JSON.stringify(serviceResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>2. 测试 EPS JSON 数据</h3>
      <el-button @click="testEpsJson" type="primary">测试 EPS JSON</el-button>
      <div v-if="epsJsonResult" class="result">
        <pre>{{ JSON.stringify(epsJsonResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>3. 测试用户服务</h3>
      <el-button @click="testUserService" type="primary" :loading="userLoading">测试用户服务</el-button>
      <div v-if="userResult" class="result">
        <pre>{{ JSON.stringify(userResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>4. 测试部门服务</h3>
      <el-button @click="testDepartmentService" type="primary" :loading="deptLoading">测试部门服务</el-button>
      <div v-if="deptResult" class="result">
        <pre>{{ JSON.stringify(deptResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from '@/utils/use-message';

// 测试结果
const serviceResult = ref(null);
const message = useMessage();
const epsJsonResult = ref(null);
const userResult = ref(null);
const deptResult = ref(null);
const userLoading = ref(false);
const deptLoading = ref(false);

// 测试 Service 导入
const testServiceImport = async () => {
  try {
    // 动态导入 service
    const service = await import('virtual:eps');
    serviceResult.value = {
      success: true,
      hasService: !!service.default,
      serviceKeys: service.default ? Object.keys(service.default) : [],
      message: 'Service 导入成功'
    };
    message.success('Service 导入成功');
  } catch (error) {
    serviceResult.value = {
      success: false,
      error: error.message,
      message: 'Service 导入失败'
    };
    message.error(`Service 导入失败: ${error.message}`);
  }
};

// 测试 EPS JSON 数据
const testEpsJson = async () => {
  try {
    // 动态导入 eps.json
    const epsData = await import('virtual:eps-json');
    epsJsonResult.value = {
      success: true,
      data: epsData.default,
      count: Array.isArray(epsData.default) ? epsData.default.length : 0,
      message: 'EPS JSON 导入成功'
    };
    message.success('EPS JSON 导入成功');
  } catch (error) {
    epsJsonResult.value = {
      success: false,
      error: error.message,
      message: 'EPS JSON 导入失败'
    };
    message.error(`EPS JSON 导入失败: ${error.message}`);
  }
};

// 测试用户服务
const testUserService = async () => {
  userLoading.value = true;
  try {
    const service = await import('virtual:eps');
    const userService = service.default?.base?.sys?.user;

    if (!userService) {
      throw new Error('用户服务不存在');
    }

    // 测试权限信息
    const permissionInfo = {
      permissions: userService.permission,
      _permissions: userService._permission,
      search: userService.search
    };

    userResult.value = {
      success: true,
      hasUserService: !!userService,
      hasPageMethod: typeof userService.page === 'function',
      hasListMethod: typeof userService.list === 'function',
      hasInfoMethod: typeof userService.info === 'function',
      hasAddMethod: typeof userService.add === 'function',
      hasUpdateMethod: typeof userService.update === 'function',
      hasDeleteMethod: typeof userService.delete === 'function',
      permissionInfo,
      message: '用户服务测试成功'
    };
    message.success('用户服务测试成功');
  } catch (error) {
    userResult.value = {
      success: false,
      error: error.message,
      message: '用户服务测试失败'
    };
    message.error(`用户服务测试失败: ${error.message}`);
  } finally {
    userLoading.value = false;
  }
};

// 测试部门服务
const testDepartmentService = async () => {
  deptLoading.value = true;
  try {
    const service = await import('virtual:eps');
    const deptService = service.default?.base?.sys?.department;

    if (!deptService) {
      throw new Error('部门服务不存在');
    }

    // 测试权限信息
    const permissionInfo = {
      permissions: deptService.permission,
      _permissions: deptService._permission,
      search: deptService.search
    };

    deptResult.value = {
      success: true,
      hasDeptService: !!deptService,
      hasPageMethod: typeof deptService.page === 'function',
      hasListMethod: typeof deptService.list === 'function',
      hasInfoMethod: typeof deptService.info === 'function',
      hasAddMethod: typeof deptService.add === 'function',
      hasUpdateMethod: typeof deptService.update === 'function',
      hasDeleteMethod: typeof deptService.delete === 'function',
      permissionInfo,
      message: '部门服务测试成功'
    };
    message.success('部门服务测试成功');
  } catch (error) {
    deptResult.value = {
      success: false,
      error: error.message,
      message: '部门服务测试失败'
    };
    message.error(`部门服务测试失败: ${error.message}`);
  } finally {
    deptLoading.value = false;
  }
};
</script>

<style scoped>
.test-eps {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: #409eff;
}

.result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.result pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}
</style>
