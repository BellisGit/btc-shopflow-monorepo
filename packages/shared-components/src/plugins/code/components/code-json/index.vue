<template>
  <div class="btc-code-json">
    <!-- 弹窗模式 -->
    <el-popover
      v-if="popover"
      :width="popoverWidth"
      :trigger="popoverTrigger"
      placement="top"
      :persistent="false"
      :show-arrow="true"
      v-bind="filteredAttrs"
    >
      <template #reference>
        <el-button
          type="primary"
          text
          size="small"
          class="json-trigger"
        >
          <BtcSvg name="view" :size="14" />
          查看JSON
        </el-button>
      </template>

      <div class="json-content">
        <pre class="json-text">{{ formattedJson }}</pre>
      </div>
    </el-popover>

    <!-- 直接显示模式 -->
    <div v-else class="json-display">
      <pre class="json-text">{{ formattedJson }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import BtcSvg from '@btc-common/svg/index.vue';

defineOptions({
  name: 'BtcCodeJson',
  inheritAttrs: false
});

// 获取所有传入的属性
const attrs = useAttrs();

interface Props {
  /** JSON 数据 */
  modelValue?: any;
  /** 是否使用弹窗模式 */
  popover?: boolean;
  /** 弹窗宽度 */
  popoverWidth?: string | number;
  /** 弹窗触发方式 */
  popoverTrigger?: 'click' | 'hover';
  /** 是否格式化显示 */
  format?: boolean;
  /** 最大显示长度（超出显示省略号） */
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  popover: false,
  popoverWidth: 400,
  popoverTrigger: 'click',
  format: true,
  maxLength: 200
});

// 过滤掉不应该传递给 el-popover 的属性
const filteredAttrs = computed(() => {
  const { popover, popoverWidth, popoverTrigger, format, maxLength, modelValue, ...rest } = attrs;
  return rest;
});

// 格式化 JSON 数据
const formattedJson = computed(() => {
  if (!props.modelValue) {
    return '{}';
  }

  let jsonStr: string;

  if (typeof props.modelValue === 'string') {
    try {
      // 尝试解析字符串为 JSON
      const parsed = JSON.parse(props.modelValue);
      jsonStr = props.format ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    } catch {
      // 如果解析失败，直接使用原字符串
      jsonStr = props.modelValue;
    }
  } else {
    // 对象直接序列化
    jsonStr = props.format ? JSON.stringify(props.modelValue, null, 2) : JSON.stringify(props.modelValue);
  }

  // 如果设置了最大长度，超出部分显示省略号
  if (props.maxLength && jsonStr.length > props.maxLength) {
    return jsonStr.substring(0, props.maxLength) + '...';
  }

  return jsonStr;
});
</script>

<style lang="scss" scoped>
.btc-code-json {
  .json-trigger {
    padding: 4px 8px;
    font-size: 12px;
  }

  .json-content {
    max-height: 300px;
    overflow-y: auto;
  }

  .json-display {
    max-height: 200px;
    overflow-y: auto;
  }

  .json-text {
    margin: 0;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
    word-break: break-all;
    border: 1px solid var(--el-border-color-light);
  }
}
</style>
