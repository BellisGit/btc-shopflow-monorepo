<template>
  <el-row class="btc-crud-row">
    <slot />
  </el-row>
</template>

<script setup lang="ts">
// BtcRow - 基于 el-row，完全对齐 cool-admin 的 cl-row
</script>

<style lang="scss" scoped>
.btc-crud-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  min-height: 40px; /* 确保有足够的高度来垂直居中 */
  gap: 10px; /* 默认间距，类似 cool-admin 的 cl-row */
}
</style>


