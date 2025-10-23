<template>
  <div class="menu-preview-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('navigation.preview.title') }}</span>
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            {{ t('navigation.preview.refresh') }}
          </el-button>
        </div>
      </template>

      <div class="preview-container">
        <!-- 角色选择器 -->
        <div class="role-selector">
          <el-select
            v-model="selectedRole"
            :placeholder="t('navigation.preview.select_role')"
            @change="handleRoleChange"
            style="width: 200px;"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </div>

        <!-- 菜单预览 -->
        <div class="menu-preview" v-if="selectedRole">
          <el-menu
            :default-active="activeMenu"
            class="preview-menu"
            mode="vertical"
            @select="handleMenuSelect"
          >
            <template v-for="menu in filteredMenus" :key="menu.id">
              <el-sub-menu
                v-if="menu.children && menu.children.length > 0"
                :index="menu.id.toString()"
              >
                <template #title>
                  <el-icon v-if="menu.icon">
                    <component :is="menu.icon" />
                  </el-icon>
                  <span>{{ menu.label }}</span>
                </template>
                <el-menu-item
                  v-for="child in menu.children"
                  :key="child.id"
                  :index="child.id.toString()"
                >
                  <el-icon v-if="child.icon">
                    <component :is="child.icon" />
                  </el-icon>
                  <span>{{ child.label }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="menu.id.toString()">
                <el-icon v-if="menu.icon">
                  <component :is="menu.icon" />
                </el-icon>
                <span>{{ menu.label }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>

        <!-- 空状态 -->
        <div v-else class="no-permission">
          <el-empty description="请先选择角色查看菜单">
            <template #image>
              <el-icon :size="60" color="var(--el-text-color-placeholder)">
                <User />
              </el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import { Refresh, User } from '@element-plus/icons-vue';
import { service } from '@services/eps';

const { t } = useI18n();

defineOptions({
  name: 'NavigationMenuPreview'
});

// Mock服务
const message = useMessage();
const _userService = service.sysuser;
const _roleService = service.sysrole;

const menuService = service.sysmenu;

// 响应式数据
const roles = ref<any[]>([]);
const menus = ref<any[]>([]);
const selectedRole = ref<number | null>(null);
const activeMenu = ref('');

// 角色变更处理
const filteredMenus = computed(() => {
  if (!selectedRole.value) return [];

  const filterMenus = (menuList: any[]): any[] => {
    return menuList
      .filter(menu => menu.roles.includes(selectedRole.value))
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenus(menu.children) : []
      }))
      .sort((a, b) => a.sort - b.sort);
  };

  return filterMenus(menus.value);
});

// 角色变更处理
const handleRoleChange = (roleId: number) => {
  selectedRole.value = roleId;
  activeMenu.value = '';
  message.success(`已切换到角色: ${roles.value.find(r => r.id === roleId)?.roleName}`);
};

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
  const menu = menus.value.find(m => m.id.toString() === index);
  if (menu) {
    message.info(`已选择菜单: ${menu.label}`);
  }
};

const handleRefresh = () => {
  loadData();
  message.success('刷新成功');
};

// 构建树形结构
const buildTree = (data: any[], parentId: any = null): any[] => {
  // 确保 data 是数组
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(data, item.id)
    }));
};

// 加载数据
const loadData = async () => {
  const [rolesData, menusData] = await Promise.all([
    _roleService.list(),
    menuService.list()
  ]);

  // 确保 rolesData 是数组
  roles.value = Array.isArray(rolesData) ? rolesData : (rolesData?.list || []);
  // 确保 menusData 是数组，如果不是则使用空数组
  const menuList = Array.isArray(menusData) ? menusData : (menusData?.list || []);
  menus.value = buildTree(menuList);
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.menu-preview-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  min-height: 400px;
}

.role-selector {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color);
}

.menu-preview {
  .preview-menu {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    width: 300px;
  }
}

.no-permission {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
