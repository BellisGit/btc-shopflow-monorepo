<template>
  <button class="btc-button" :class="typeClass" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger';
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const typeClass = computed(() => (props.type ? `btc-button--${props.type}` : ''));

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<style lang="scss" scoped>
.btc-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btc-button:hover {
  opacity: 0.8;
}

.btc-button--primary {
  background: #409eff;
  color: white;
}

.btc-button--success {
  background: #67c23a;
  color: white;
}

.btc-button--warning {
  background: #e6a23c;
  color: white;
}

.btc-button--danger {
  background: #f56c6c;
  color: white;
}
</style>

