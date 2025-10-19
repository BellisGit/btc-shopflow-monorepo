<template>
  <div class="menu-preview">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>菜单预览（按用户/角色�?/span>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <el-radio-group v-model="previewType" @change="handleTypeChange">
            <el-radio label="user">按用�?/el-radio>
            <el-radio label="role">按角�?/el-radio>
          </el-radio-group>
        </el-col>
        <el-col :span="16">
          <el-select
            v-model="selectedTarget"
            :placeholder="previewType === 'user' ? '选择用户' : '选择角色'"
            filterable
            @change="handleTargetChange"
            style="width: 100%;"
          >
            <el-option
              v-for="item in targetOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-col>
      </el-row>

      <el-divider>预览结果</el-divider>

      <el-tree
        :data="menuTree"
        :props="{ children: 'children', label: 'label' }"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
            <span>{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Setting, Lock, Grid, ChatDotRound } from '@element-plus/icons-vue';
import { service } from '../../../../services/eps';

const previewType = ref<'user' | 'role'>('user');
const selectedTarget = ref<number | null>(null);
const menuTree = ref<any[]>([]);

// Mock服务
const userService = service.base.department;
const roleService = service.base.department;

// 目标选项
const targetOptions = computed(() => {
  if (previewType.value === 'user') {
    return [];  // 用户列表从service加载
  } else {
    return [
      { id: 1, label: '系统管理�? },
      { id: 2, label: '部门经理' },
      { id: 3, label: '普通员�? },
    ];
  }
});

// 加载菜单树（根据选择的用�?角色�?const loadMenuTree = async () => {
  if (!selectedTarget.value) {
    menuTree.value = [];
    return;
  }

  // Mock：不同角色看到不同菜�?  if (previewType.value === 'role') {
    if (selectedTarget.value === 1) {
      // 管理员：看到所有菜�?      menuTree.value = [
        {
          label: '平台治理',
          icon: Setting,
          children: [
            { label: '�? },
            { label: '模块' },
            { label: '插件' },
          ]
        },
        {
          label: '组织与账�?,
          children: [
            { label: '租户' },
            { label: '部门' },
            { label: '用户' },
          ]
        },
        {
          label: '访问控制',
          icon: Lock,
          children: [
            { label: '资源' },
            { label: '行为' },
            { label: '权限' },
            { label: '角色' },
            { label: '策略' },
          ]
        },
      ];
    } else if (selectedTarget.value === 2) {
      // 经理：只看到组织相关
      menuTree.value = [
        {
          label: '组织与账�?,
          children: [
            { label: '部门' },
            { label: '用户' },
          ]
        },
      ];
    } else {
      // 员工：只看到基础菜单
      menuTree.value = [
        {
          label: '组织与账�?,
          children: [
            { label: '用户（只读）' },
          ]
        },
      ];
    }
  }
};

// 类型切换
const handleTypeChange = () => {
  selectedTarget.value = null;
  menuTree.value = [];
};

// 目标切换
const handleTargetChange = () => {
  loadMenuTree();
};

onMounted(() => {
  // 初始�?});
</script>

<style lang="scss" scoped>
.menu-preview {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.item-info {
  display: flex;
  flex-direction: column;

  .item-name {
    font-weight: 500;
  }

  .item-code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}

.formula {
  margin-top: 15px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

