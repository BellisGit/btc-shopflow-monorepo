<template>
  <van-tabbar v-model="active" fixed placeholder>
    <van-tabbar-item icon="search" to="/query">查询</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/home">我</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Tabbar, TabbarItem } from 'vant';

defineOptions({
  name: 'BtcMobileTabbar',
});

const route = useRoute();

// 当前激活的标签
const active = ref(1); // 默认主页

// 根据当前路由设置激活的标签
const updateActiveIndex = () => {
  const path = route.path;
  const name = route.name;
  
  if (path.startsWith('/query') || name === 'Query') {
    active.value = 0;
  } else if (path === '/home' || path === '/' || name === 'Home') {
    active.value = 1;
  }
};

// 监听路由变化
watch(() => route.path, updateActiveIndex, { immediate: true });
watch(() => route.name, updateActiveIndex, { immediate: true });
</script>

<style lang="scss" scoped>
// Tabbar 样式
:deep(.van-tabbar) {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.van-tabbar-item) {
  color: #646566;
  font-size: 12px;
  
  .van-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

:deep(.van-tabbar-item--active) {
  color: #1989fa;
}
</style>

