<template>
  <div class="simulator-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('ops.simulator.title') }}</span>
          <el-button type="primary" @click="handleSimulate" :loading="simulating">
            <el-icon><VideoPlay /></el-icon>
            {{ t('ops.simulator.start') }}
          </el-button>
        </div>
      </template>

      <div class="simulator-container">
        <!-- 模拟器表单 -->
        <div class="simulator-form">
          <el-form
            ref="formRef"
            :model="simulatorForm"
            :rules="formRules"
            label-width="100px"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :label="t('ops.simulator.user')" prop="user">
                  <el-select v-model="simulatorForm.user" :placeholder="t('ops.simulator.select_user')">
                    <el-option :label="t('ops.simulator.admin')" value="admin" />
                    <el-option :label="t('ops.simulator.manager')" value="manager" />
                    <el-option :label="t('ops.simulator.employee')" value="employee" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="t('ops.simulator.resource')" prop="resource">
                  <el-select v-model="simulatorForm.resource" :placeholder="t('ops.simulator.select_resource')">
                    <el-option :label="t('ops.simulator.user_resource')" value="user" />
                    <el-option :label="t('ops.simulator.role_resource')" value="role" />
                    <el-option :label="t('ops.simulator.system_resource')" value="system" />
                    <el-option :label="t('ops.simulator.order_resource')" value="order" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="t('ops.simulator.action')" prop="action">
                  <el-select v-model="simulatorForm.action" :placeholder="t('ops.simulator.select_action')">
                    <el-option :label="t('ops.simulator.view')" value="view" />
                    <el-option :label="t('ops.simulator.edit')" value="edit" />
                    <el-option :label="t('ops.simulator.delete')" value="delete" />
                    <el-option :label="t('ops.simulator.create')" value="create" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- ???? -->
        <div class="simulator-result" v-if="simulationResult">
          <el-alert
            :title="simulationResult.decision === 'allow' ? '????' : '????'"
            :type="simulationResult.decision === 'allow' ? 'success' : 'error'"
            :description="simulationResult.reason"
            show-icon
            :closable="false"
          />

          <!-- ????? -->
          <div class="matched-policies" v-if="simulationResult.matchedPolicies.length > 0">
            <h4>??????</h4>
            <el-table :data="simulationResult.matchedPolicies" border>
              <el-table-column prop="policyName" label="????" />
              <el-table-column prop="policyType" label="????" />
              <el-table-column prop="effect" label="??">
                <template #default="{ row }">
                  <el-tag :type="row.effect === 'allow' ? 'success' : 'danger'">
                    {{ row.effect === 'allow' ? '??' : '??' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="???" />
            </el-table>
          </div>

          <!-- ???? -->
          <div class="execution-steps" v-if="simulationResult.steps.length > 0">
            <h4>?????</h4>
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useMessage } from '@/utils/use-message';
import { VideoPlay } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'OpsSimulator'
});

const { t } = useI18n();
const message = useMessage();

// ????
const formRef = ref();
const simulatorForm = reactive({
  user: '',
  resource: '',
  action: ''
});

const formRules = {
  user: [{ required: true, message: '?????', trigger: 'change' }],
  resource: [{ required: true, message: '?????', trigger: 'change' }],
  action: [{ required: true, message: '?????', trigger: 'change' }]
};

// ????
const simulationResult = ref<any>(null);
const simulating = ref(false);

// ??????
const simulatePermission = (user: string, resource: string, action: string) => {
  // ????????
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
      ? `????"${action}"??"${resource}"?????`
      : `????"${action}"??"${resource}"??`,
    matchedPolicies: hasPermission ? [
      { policyName: '???????', policyType: 'RBAC', effect: 'allow', priority: 100 },
    ] : [
      { policyName: '????????', policyType: 'RBAC', effect: 'deny', priority: 200 },
    ],
    steps: [
      {
        description: `???? ${user} ???`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'primary'
      },
      {
        description: `???? ${resource} ?????`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info'
      },
      {
        description: `???? ${action} ?????`,
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      },
      {
        description: hasPermission ? '??????' : '??????',
        timestamp: new Date().toLocaleTimeString(),
        type: hasPermission ? 'success' : 'danger'
      }
    ]
  };
};

// ????
const handleSimulate = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    simulating.value = true;

    // ??????
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = simulatePermission(
      simulatorForm.user,
      simulatorForm.resource,
      simulatorForm.action
    );

    simulationResult.value = result;

    message.success('????');
  } catch (_error) {
    message.error('??????????');
  } finally {
    simulating.value = false;
  }
};
</script>

<style lang="scss" scoped>
.simulator-page {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.simulator-container {
  .simulator-form {
    margin-bottom: 30px;
    padding: 20px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

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
