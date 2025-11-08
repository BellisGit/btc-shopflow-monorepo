<template>
  <!-- Popover 模式（消息、通知） -->
  <el-popover
    v-if="config.popover"
    v-model:visible="popoverVisible"
    :placement="config.popover.placement || 'bottom-end'"
    :width="config.popover.width || 360"
    :offset="10"
    :popper-class="config.popover.popperClass"
    trigger="click"
  >
    <template #reference>
      <IconButtonInner :config="config" />
    </template>
    <component
      :is="config.popover.component"
      v-if="popoverVisible"
      @close="handlePopoverClose"
    />
  </el-popover>

  <!-- Dropdown 模式（关闭其他标签页） -->
  <el-dropdown
    v-else-if="config.dropdown"
    trigger="click"
    @command="handleDropdownCommand"
  >
    <template #default>
      <IconButtonInner :config="config" />
    </template>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in config.dropdown.items"
          :key="item.command"
          :command="item.command"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 普通模式 -->
  <IconButtonInner v-else :config="config" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcIconButton'
});

import { ref } from 'vue';
import type { IconButtonConfig } from './types';
import IconButtonInner from './icon-button-inner.vue';

const props = defineProps<{
  config: IconButtonConfig;
}>();

const popoverVisible = ref(false);

const handlePopoverClose = () => {
  popoverVisible.value = false;
};

const handleDropdownCommand = (command: string) => {
  props.config.dropdown?.onCommand(command);
};
</script>

<style lang="scss" scoped>
// 样式由 IconButtonInner 组件提供
</style>

