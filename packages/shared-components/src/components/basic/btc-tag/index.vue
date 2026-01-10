<template>
  <el-tag
    :type="computedType"
    :size="size"
    :effect="effect"
    :round="round"
    :closable="closable"
    :disable-transitions="disableTransitions"
    :hit="hit"
    :color="customColor"
    :class="tagClass"
    :style="customStyle"
    @click="(e: MouseEvent) => emit('click', e)"
    @close="(e: MouseEvent) => emit('close', e)"
  >
    <slot />
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'BtcTag'
});

export interface BtcTagProps {
  /**
   * 标签类型，支持17种颜色方案
   * 基础类型：primary, success, warning, danger, info（使用 el-tag 原生样式）
   * 扩展类型：purple, pink, cyan, teal, indigo, orange, brown, gray, lime, olive, navy, maroon（使用 color 属性）
   */
  type?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'pink'
    | 'cyan'
    | 'teal'
    | 'indigo'
    | 'orange'
    | 'brown'
    | 'gray'
    | 'lime'
    | 'olive'
    | 'navy'
    | 'maroon';
  /**
   * 尺寸
   */
  size?: 'large' | 'default' | 'small';
  /**
   * 主题（默认 light，更接近原生样式）
   */
  effect?: 'dark' | 'light' | 'plain';
  /**
   * 是否圆角
   */
  round?: boolean;
  /**
   * 是否可关闭
   */
  closable?: boolean;
  /**
   * 是否禁用过渡动画
   */
  disableTransitions?: boolean;
  /**
   * 是否有边框描边
   */
  hit?: boolean;
  /**
   * 自定义颜色（优先级高于 type 映射的颜色）
   */
  color?: string;
}

const props = withDefaults(defineProps<BtcTagProps>(), {
  type: 'primary',
  effect: 'light',
  round: false,
  closable: false,
  disableTransitions: false,
  hit: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  close: [event: MouseEvent];
}>();

// 扩展颜色方案配置（参考 el-tag light effect 的样式：浅色背景 + 深色文本）
const extendedColorMap: Record<string, { textColor: string; bgColor: string; borderColor: string }> = {
  purple: { textColor: '#9c27b0', bgColor: '#f3e5f5', borderColor: '#ce93d8' },
  pink: { textColor: '#e91e63', bgColor: '#fce4ec', borderColor: '#f48fb1' },
  cyan: { textColor: '#00bcd4', bgColor: '#e0f7fa', borderColor: '#80deea' },
  teal: { textColor: '#009688', bgColor: '#e0f2f1', borderColor: '#80cbc4' },
  indigo: { textColor: '#3f51b5', bgColor: '#e8eaf6', borderColor: '#9fa8da' },
  orange: { textColor: '#ff9800', bgColor: '#fff3e0', borderColor: '#ffb74d' },
  brown: { textColor: '#795548', bgColor: '#efebe9', borderColor: '#bcaaa4' },
  gray: { textColor: '#616161', bgColor: '#f5f5f5', borderColor: '#bdbdbd' },
  lime: { textColor: '#827717', bgColor: '#f9fbe7', borderColor: '#d4e157' },
  olive: { textColor: '#558b2f', bgColor: '#f1f8e9', borderColor: '#aed581' },
  navy: { textColor: '#1976d2', bgColor: '#e3f2fd', borderColor: '#90caf9' },
  maroon: { textColor: '#c2185b', bgColor: '#fce4ec', borderColor: '#f48fb1' },
};

// 基础类型（Element Plus 原生支持）
const baseTypes = ['primary', 'success', 'warning', 'danger', 'info'];

// 计算最终使用的 type（如果是扩展类型，返回 undefined，使用 color）
const computedType = computed(() => {
  if (props.type && baseTypes.includes(props.type)) {
    return props.type as 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }
  return undefined;
});

// 自定义颜色（扩展类型不传 color，使用 CSS 样式覆盖）
const customColor = computed(() => {
  // 如果明确指定了 color，优先使用
  if (props.color) {
    return props.color;
  }
  // 扩展类型不传 color，使用 CSS 样式
  return undefined;
});

// 自定义样式（通过 CSS 变量设置扩展颜色）
const customStyle = computed<Record<string, string>>(() => {
  // 如果是扩展类型且没有指定 color，使用 CSS 变量
  if (props.type && !baseTypes.includes(props.type) && !props.color) {
    const colors = extendedColorMap[props.type];
    if (colors) {
      return {
        '--el-tag-text-color': colors.textColor,
        '--el-tag-bg-color': colors.bgColor,
        '--el-tag-border-color': colors.borderColor,
      };
    }
  }
  return {};
});

// 标签类名（用于扩展颜色的样式覆盖，作为备用方案）
const tagClass = computed(() => {
  if (props.type && !baseTypes.includes(props.type) && !props.color) {
    return `btc-tag--${props.type}`;
  }
  return '';
});

</script>

<style lang="scss" scoped>
// 扩展颜色样式（参考 el-tag light effect 的样式方案）
// 使用浅色背景 + 深色文本 + 浅色边框，与原生 el-tag 样式保持一致

:deep(.btc-tag--purple) {
  --el-tag-text-color: #9c27b0;
  --el-tag-bg-color: #f3e5f5;
  --el-tag-border-color: #ce93d8;
}

:deep(.btc-tag--pink) {
  --el-tag-text-color: #e91e63;
  --el-tag-bg-color: #fce4ec;
  --el-tag-border-color: #f48fb1;
}

:deep(.btc-tag--cyan) {
  --el-tag-text-color: #00bcd4;
  --el-tag-bg-color: #e0f7fa;
  --el-tag-border-color: #80deea;
}

:deep(.btc-tag--teal) {
  --el-tag-text-color: #009688;
  --el-tag-bg-color: #e0f2f1;
  --el-tag-border-color: #80cbc4;
}

:deep(.btc-tag--indigo) {
  --el-tag-text-color: #3f51b5;
  --el-tag-bg-color: #e8eaf6;
  --el-tag-border-color: #9fa8da;
}

:deep(.btc-tag--orange) {
  --el-tag-text-color: #ff9800;
  --el-tag-bg-color: #fff3e0;
  --el-tag-border-color: #ffb74d;
}

:deep(.btc-tag--brown) {
  --el-tag-text-color: #795548;
  --el-tag-bg-color: #efebe9;
  --el-tag-border-color: #bcaaa4;
}

:deep(.btc-tag--gray) {
  --el-tag-text-color: #616161;
  --el-tag-bg-color: #f5f5f5;
  --el-tag-border-color: #bdbdbd;
}

:deep(.btc-tag--lime) {
  --el-tag-text-color: #827717;
  --el-tag-bg-color: #f9fbe7;
  --el-tag-border-color: #d4e157;
}

:deep(.btc-tag--olive) {
  --el-tag-text-color: #558b2f;
  --el-tag-bg-color: #f1f8e9;
  --el-tag-border-color: #aed581;
}

:deep(.btc-tag--navy) {
  --el-tag-text-color: #1976d2;
  --el-tag-bg-color: #e3f2fd;
  --el-tag-border-color: #90caf9;
}

:deep(.btc-tag--maroon) {
  --el-tag-text-color: #c2185b;
  --el-tag-bg-color: #fce4ec;
  --el-tag-border-color: #f48fb1;
}
</style>
