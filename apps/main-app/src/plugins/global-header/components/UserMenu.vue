<template>
  <el-dropdown @command="handleCommand">
    <div class="user-menu">
      <el-avatar :size="32" :src="userAvatar" />
      <span class="user-name">{{ userName }}</span>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <el-icon><User /></el-icon>
          个人中心
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <el-icon><Setting /></el-icon>
          设置
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User, Setting, SwitchButton } from '@element-plus/icons-vue';

defineOptions({
  name: 'UserMenu',
});

const userName = ref('管理员');
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

const handleCommand = (command: string) => {
  console.log('执行命令:', command);

  switch (command) {
    case 'profile':
      // 跳转到个人中心
      break;
    case 'settings':
      // 打开设置
      break;
    case 'logout':
      // 退出登录
      break;
  }
};
</script>

<style scoped lang="scss">
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .user-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}
</style>

