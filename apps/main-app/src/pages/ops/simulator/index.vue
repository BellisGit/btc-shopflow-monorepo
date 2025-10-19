<template>
  <div class="simulator">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>策略模拟器</span>
        </div>
      </template>

      <el-form :model="simulatorForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="用户">
              <el-select v-model="simulatorForm.userId" placeholder="选择用户" filterable style="width: 100%;">
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源">
              <el-select v-model="simulatorForm.resource" placeholder="选择资源" filterable style="width: 100%;">
                <el-option label="用户" value="user" />
                <el-option label="角色" value="role" />
                <el-option label="部门" value="department" />
                <el-option label="菜单" value="menu" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行为">
              <el-select v-model="simulatorForm.action" placeholder="选择行为" filterable style="width: 100%;">
                <el-option label="查看" value="view" />
                <el-option label="编辑" value="edit" />
                <el-option label="删除" value="delete" />
                <el-option label="新增" value="create" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="额外条件">
          <el-input
            v-model="simulatorForm.conditions"
            type="textarea"
            :rows="3"
            placeholder='可选，JSON格式。例：{"department": "研发部"}'
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSimulate" :loading="simulating" :disabled="!canSimulate">
            执行模拟
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider v-if="result">模拟结果</el-divider>

      <div v-if="result" class="result-container">
        <el-alert
          :type="result.decision === 'allow' ? 'success' : 'error'"
          :title="result.decision === 'allow' ? '允许访问' : '拒绝访问'"
          :description="result.reason"
          show-icon
          :closable="false"
        />

        <div class="matched-policies" v-if="result.matchedPolicies.length > 0">
          <h4>匹配的策略</h4>
          <el-table :data="result.matchedPolicies" border>
            <el-table-column prop="policyName" label="策略名称" min-width="150" />
            <el-table-column prop="policyType" label="类型" width="120" />
            <el-table-column prop="effect" label="效果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.effect === 'allow' ? 'success' : 'danger'">
                  {{ row.effect === 'allow' ? '允许' : '拒绝' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="100" />
          </el-table>
        </div>

        <div class="decision-path">
          <h4>决策路径</h4>
          <el-steps :active="result.steps.length" finish-status="success" align-center>
            <el-step v-for="(step, index) in result.steps" :key="index" :title="step" />
          </el-steps>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { service } from '../../../../services/eps';

const message = useMessage();
const simulatorForm = ref({
  userId: null,
  resource: '',
  action: '',
  conditions: '',
});

const users = ref<any[]>([]);
const result = ref<any>(null);
const simulating = ref(false);

// Mock服务
const userService = service.base.department;

// 是否可以模拟
const canSimulate = computed(() => {
  return simulatorForm.value.userId && simulatorForm.value.resource && simulatorForm.value.action;
});

// 加载用户列表
const loadUsers = async () => {
  const data = await userService.list();
  users.value = data.slice(0, 10); // 取前10个
};

// 执行模拟
const handleSimulate = async () => {
  simulating.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟计算时间

    // Mock模拟结果
    const decision = mockHelpers.randomBoolean() ? 'allow' : 'deny';

    result.value = {
      decision,
      reason: decision === 'allow'
        ? `用户拥有"${simulatorForm.value.action}"操作"${simulatorForm.value.resource}"资源的权限`
        : `用户无权"${simulatorForm.value.action}"操作"${simulatorForm.value.resource}"资源`,
      matchedPolicies: decision === 'allow' ? [
        { policyName: '用户管理员策略', policyType: 'RBAC', effect: 'allow', priority: 100 },
      ] : [
        { policyName: '禁止删除系统数据', policyType: 'RBAC', effect: 'deny', priority: 200 },
      ],
      steps: [
        '1. 解析用户角色',
        '2. 匹配策略',
        '3. 计算优先级',
        `4. ${decision === 'allow' ? '允许访问' : '拒绝访问'}`,
      ]
    };

    message.success('模拟完成');
  } catch (error) {
    message.error('模拟失败');
  } finally {
    simulating.value = false;
  }
};

// 重置
const handleReset = () => {
  simulatorForm.value = {
    userId: null,
    resource: '',
    action: '',
    conditions: '',
  };
  result.value = null;
};

onMounted(() => {
  loadUsers();
});
</script>

<style lang="scss" scoped>
.simulator {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-container {
  margin-top: 20px;
}

.matched-policies, .decision-path {
  margin-top: 30px;

  h4 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 500;
  }
}
</style>

