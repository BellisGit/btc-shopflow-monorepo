<template>
  <div class="simulator-page">
    <BtcRow>
      <BtcFlex1 />
      <el-form
        ref="formRef"
        :model="simulatorForm"
        :rules="formRules"
        inline
        class="simulator-form"
      >
        <el-form-item prop="user">
          <el-select v-model="simulatorForm.user" :placeholder="t('ops.simulator.select_user')" style="width: 120px" size="default">
            <el-option :label="t('ops.simulator.admin')" value="admin" />
            <el-option :label="t('ops.simulator.manager')" value="manager" />
            <el-option :label="t('ops.simulator.employee')" value="employee" />
          </el-select>
        </el-form-item>
        <el-form-item prop="resource">
          <el-select v-model="simulatorForm.resource" :placeholder="t('ops.simulator.select_resource')" style="width: 120px" size="default">
            <el-option :label="t('ops.simulator.user_resource')" value="user" />
            <el-option :label="t('ops.simulator.role_resource')" value="role" />
            <el-option :label="t('ops.simulator.system_resource')" value="system" />
            <el-option :label="t('ops.simulator.order_resource')" value="order" />
          </el-select>
        </el-form-item>
        <el-form-item prop="action">
          <el-select v-model="simulatorForm.action" :placeholder="t('ops.simulator.select_action')" style="width: 120px" size="default">
            <el-option :label="t('ops.simulator.view')" value="view" />
            <el-option :label="t('ops.simulator.edit')" value="edit" />
            <el-option :label="t('ops.simulator.delete')" value="delete" />
            <el-option :label="t('ops.simulator.create')" value="create" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleSimulate" :loading="simulating" size="default">
        <el-icon><VideoPlay /></el-icon>
        {{ t('ops.simulator.start') }}
      </el-button>
    </BtcRow>

    <div class="simulator-container">

        <!-- 模拟结果 -->
        <div class="simulator-result" v-if="simulationResult">
          <el-alert
            :title="simulationResult.decision === 'allow' ? '允许访问' : '拒绝访问'"
            :type="simulationResult.decision === 'allow' ? 'success' : 'error'"
            :description="simulationResult.reason"
            show-icon
            :closable="false"
          />

          <!-- 匹配策略 -->
          <div class="matched-policies" v-if="simulationResult.matchedPolicies.length > 0">
            <h4>匹配策略</h4>
            <el-table :data="simulationResult.matchedPolicies" border>
              <el-table-column prop="policyName" label="策略名称" />
              <el-table-column prop="policyType" label="策略类型" />
              <el-table-column prop="effect" label="效果">
                <template #default="{ row }">
                  <el-tag :type="row.effect === 'allow' ? 'success' : 'danger'">
                    {{ row.effect === 'allow' ? '允许' : '拒绝' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" />
            </el-table>
          </div>

          <!-- 执行步骤 -->
          <div class="execution-steps" v-if="simulationResult.steps.length > 0">
            <h4>执行步骤</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(step, index) in simulationResult.steps"
                :key="index"
                :timestamp="step.timestamp"
                :type="step.type"
              >
                {{ step.description }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { BtcRow, BtcFlex1, BtcMessage, ExcelPlugin } from '@btc/shared-components';

defineOptions({
  name: 'OpsSimulator'
});

const { t } = useI18n();

// 表单引用
const formRef = ref();
const simulatorForm = reactive({
  user: '',
  resource: '',
  action: ''
});

const formRules = {
  user: [{ required: true, message: '请选择用户', trigger: 'change' }],
  resource: [{ required: true, message: '请选择资源', trigger: 'change' }],
  action: [{ required: true, message: '请选择操作', trigger: 'change' }]
};

// 模拟结果
const simulationResult = ref<any>(null);
const simulating = ref(false);

// 模拟权限检查
const simulatePermission = (user: string, resource: string, action: string) => {
  // 权限配置
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      user: ['view', 'edit', 'delete', 'create'],
      role: ['view', 'edit', 'delete', 'create'],
      system: ['view', 'edit'],
      order: ['view', 'edit', 'delete', 'create']
    },
    manager: {
      user: ['view'],
      role: ['view'],
      system: ['view'],
      order: ['view', 'edit', 'create']
    },
    employee: {
      user: ['view'],
      role: [],
      system: [],
      order: ['view']
    }
  };

  const userPermissions = permissions[user] || {};
  const resourcePermissions = userPermissions[resource] || [];
  const hasPermission = resourcePermissions.includes(action);

  return {
    decision: hasPermission ? 'allow' : 'deny',
    reason: hasPermission
      ? `用户"${user}"对"${resource}"资源有"${action}"权限`
      : `用户"${user}"对"${resource}"资源没有"${action}"权限`,
    matchedPolicies: hasPermission ? [
      { policyName: '管理员策略', policyType: 'RBAC', effect: 'allow', priority: 100 },
    ] : [
      { policyName: '默认拒绝策略', policyType: 'RBAC', effect: 'deny', priority: 200 },
    ],
    steps: [
      {
        description: `检查用户 ${user} 权限`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'primary'
      },
      {
        description: `验证资源 ${resource} 访问权限`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info'
      },
      {
        description: `执行操作 ${action} 权限检查`,
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      },
      {
        description: hasPermission ? '权限验证通过' : '权限验证失败',
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      }
    ]
  };
};

// 处理模拟
const handleSimulate = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    simulating.value = true;

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = simulatePermission(
      simulatorForm.user,
      simulatorForm.resource,
      simulatorForm.action
    );

    simulationResult.value = result;

    BtcMessage.success('模拟完成');
  } catch (_error) {
    BtcMessage.error('表单验证失败，请检查输入');
  } finally {
    simulating.value = false;
  }
};
</script>

<style lang="scss" scoped>
.simulator-page {
  height: 100%;
  padding: 20px;
}

.simulator-form {
  display: inline-flex;
  align-items: center;
  gap: 10px; /* 表单项之间的间距 */

  .el-form-item {
    margin-bottom: 0;
    margin-right: 0; /* 移除默认的右边距，让 gap 生效 */
  }
}

.simulator-container {

  .simulator-result {
    .matched-policies,
    .execution-steps {
      margin-top: 20px;

      h4 {
        margin-bottom: 15px;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
