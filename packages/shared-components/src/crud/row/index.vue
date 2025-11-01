<template>
  <el-row
    class="btc-crud-row"
    :justify="justify"
    :align="align"
    :gutter="gutter"
  >
    <slot />
  </el-row>
</template>

<script setup lang="ts">
import type { RowJustify, RowAlign } from 'element-plus';

interface BtcRowProps {
  justify?: typeof RowJustify[keyof typeof RowJustify];
  align?: typeof RowAlign[keyof typeof RowAlign];
  gutter?: number;
  gap?: number;
}

const props = withDefaults(defineProps<BtcRowProps>(), {
  justify: 'start',
  align: 'top',
  gutter: 0,
  gap: 10
});

// BtcRow - 基于 el-row，完全对齐 cool-admin 的 cl-row
</script>

<style lang="scss" scoped>
.btc-crud-row {
  display: flex;
  align-items: v-bind('props.align === "middle" ? "center" : props.align === "bottom" ? "flex-end" : "flex-start"');
  justify-content: v-bind('props.justify === "start" ? "flex-start" : props.justify === "end" ? "flex-end" : props.justify === "center" ? "center" : props.justify === "space-around" ? "space-around" : props.justify === "space-between" ? "space-between" : "flex-start"');
  flex-wrap: nowrap; /* 改为不换行 */
  width: 100%;
  min-height: 40px; /* 确保有足够的高度来垂直居中 */
  gap: v-bind('props.gap + "px"'); /* 使用 gap 属性 */
}
</style>


