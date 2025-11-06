<template>
  <el-popover
    v-model:visible="popoverVisible"
    :placement="placement"
    :width="popoverWidth"
    trigger="click"
    :teleported="teleported"
    :popper-class="`btc-color-picker-popover ${popperClass || ''}`"
    @show="handlePopoverShow"
    @hide="handlePopoverHide"
  >
    <template #reference>
      <slot name="reference">
        <el-button :size="triggerSize" :type="triggerType">
          <span v-if="modelValue">{{ modelValue }}</span>
          <span v-else>{{ placeholder }}</span>
        </el-button>
      </slot>
    </template>
    <el-color-picker-panel
      v-model="localColor"
      :predefine="predefineColors"
      :show-alpha="showAlpha"
      @change="handleColorChange"
      @active-change="handleActiveColorChange"
    >
      <template #footer>
        <div class="btc-color-picker-footer">
          <el-input
            v-model="localColor"
            :size="inputSize"
            class="color-input"
            @blur="handleInputBlur"
          />
          <div class="color-footer-buttons">
            <el-button
              :size="buttonSize"
              text
              @click="handleClearColor"
            >
              {{ clearText }}
            </el-button>
            <el-button
              :size="buttonSize"
              type="primary"
              @click="handleConfirmColor"
            >
              {{ confirmText }}
            </el-button>
          </div>
        </div>
      </template>
    </el-color-picker-panel>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElPopover, ElColorPickerPanel, ElInput, ElButton } from 'element-plus';

defineOptions({
  name: 'BtcColorPicker'
});

interface BtcColorPickerProps {
  modelValue?: string | null;
  predefineColors?: string[];
  showAlpha?: boolean;
  placeholder?: string;
  popoverWidth?: number | string;
  placement?: string;
  teleported?: boolean;
  popperClass?: string;
  triggerSize?: 'large' | 'default' | 'small';
  triggerType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
  inputSize?: 'large' | 'default' | 'small';
  buttonSize?: 'large' | 'default' | 'small';
  clearText?: string;
  confirmText?: string;
  // 是否立即更新（不需要点击确认）
  immediate?: boolean;
}

const props = withDefaults(defineProps<BtcColorPickerProps>(), {
  modelValue: null,
  predefineColors: () => [
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'rgba(144, 240, 144, 0.5)',
    'hsl(181, 100%, 37%)',
    'rgba(31, 147, 255, 0.73)',
    'rgba(199, 21, 133, 0.47)',
  ],
  showAlpha: true,
  placeholder: '选择颜色',
  popoverWidth: 350,
  placement: 'bottom-start',
  teleported: false,
  popperClass: '',
  triggerSize: 'default',
  triggerType: 'default',
  inputSize: 'small',
  buttonSize: 'small',
  clearText: '清空',
  confirmText: '确认',
  immediate: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
  'change': [value: string | null];
  'confirm': [value: string | null];
  'clear': [];
  'active-change': [value: string | null];
  'show': [];
  'hide': [];
}>();

const popoverVisible = ref(false);
const localColor = ref<string | null>(props.modelValue || null);
const previewColor = ref<string | null>(null); // 用于预览，关闭时如果没有确认则作废

// 同步外部传入的值
watch(() => props.modelValue, (newValue) => {
  if (!popoverVisible.value) {
    localColor.value = newValue || null;
    previewColor.value = null;
  }
}, { immediate: true });

// 监听本地颜色变化，立即模式直接更新
watch(localColor, (newColor, oldColor) => {
  if (props.immediate && popoverVisible.value) {
    emit('update:modelValue', newColor);
    emit('change', newColor);
  } else if (!props.immediate && popoverVisible.value && newColor !== oldColor) {
    // 非立即模式：在拖拽过程中实时触发 active-change 事件
    // 这样可以确保即使 @active-change 事件没有触发，我们也能通过 watch 捕获变化
    previewColor.value = newColor || null;
    emit('active-change', newColor);
  }
});

function handlePopoverShow() {
  // 打开时，初始化预览颜色为当前值
  previewColor.value = localColor.value;
  emit('show');
}

function handlePopoverHide() {
  // 关闭时，如果没有确认，丢弃预览颜色
  if (!props.immediate && previewColor.value !== null) {
    localColor.value = props.modelValue || null;
    previewColor.value = null;
  }
  emit('hide');
}

function handleColorChange(color: string | null) {
  // 始终更新 localColor（确保确认时能获取到最新值）
  localColor.value = color || null;
  
  if (props.immediate) {
    emit('update:modelValue', color);
    emit('change', color);
  } else {
    // 非立即模式：更新预览颜色，同时触发 change 和 active-change 事件
    // change 事件：用于点击预设颜色等场景的实时预览
    // active-change 事件：用于拖拽场景的实时预览
    previewColor.value = color;
    emit('change', color);
    emit('active-change', color);
  }
}

function handleActiveColorChange(color: string | null) {
  // active-change 事件：拖拽或选择过程中的实时变化
  // 无论 color 是什么值，都要更新 localColor 和触发事件
  localColor.value = color || null;
  previewColor.value = color || null;
  
  if (props.immediate) {
    emit('update:modelValue', color);
    emit('change', color);
  } else {
    // 非立即模式：触发 active-change 事件（用于实时预览）
    emit('active-change', color);
  }
}

function handleInputBlur() {
  // 输入框失焦时，如果是立即模式则更新
  if (props.immediate) {
    emit('update:modelValue', localColor.value);
    emit('change', localColor.value);
  }
}

function handleClearColor() {
  localColor.value = null;
  if (props.immediate) {
    emit('update:modelValue', null);
    emit('change', null);
    emit('clear');
  } else {
    previewColor.value = null;
    emit('clear');
  }
}

function handleConfirmColor() {
  // 使用当前 localColor 的值（可能来自选择、输入框输入或预设颜色点击）
  const finalColor = localColor.value || null;
  
  // 确保 finalColor 是有效的字符串或 null
  // 如果是空字符串，保持为空字符串（允许清空颜色）
  emit('update:modelValue', finalColor === null ? null : finalColor);
  emit('change', finalColor === null ? null : finalColor);
  emit('confirm', finalColor === null ? null : finalColor);
  
  previewColor.value = null;
  if (!props.immediate) {
    popoverVisible.value = false;
  }
}
</script>

<style lang="scss">
// 颜色选择器弹窗样式
// 注意：不使用 scoped，因为弹窗是 teleported 到 body 的
.btc-color-picker-popover {
  width: 350px !important;
  max-width: 350px !important;
  box-sizing: border-box !important;

  // 颜色选择器面板样式
  .el-color-picker-panel {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding: 12px;
    background: var(--el-bg-color-overlay);

    // 设置透明度背景变量
    --el-color-picker-alpha-bg-a: #ccc;
    --el-color-picker-alpha-bg-b: transparent;

    .el-color-picker-panel__wrapper {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: row !important;
    }

    // 色相滑块应该在右侧
    .el-color-hue-slider {
      order: 2 !important;
      display: block !important;
      width: 12px !important;
      margin-left: 12px !important;
      flex-shrink: 0 !important;
    }

    // 颜色选择区域应该在左侧
    .el-color-svpanel {
      order: 1 !important;
      flex: 1 !important;
      display: block !important;
      min-height: 180px !important;
      width: 0;
    }

    // 透明度滑块
    .el-color-alpha-slider {
      margin-top: 12px;
      width: calc(100% - 24px) !important;
      box-sizing: border-box !important;
    }

    // 预定义颜色区域
    .el-color-predefine {
      display: block !important;
      width: 100% !important;
      margin-top: 12px !important;

      --el-color-picker-alpha-bg-a: #ccc;
      --el-color-picker-alpha-bg-b: transparent;
    }

    // 预定义颜色方块
    .el-color-predefine__color-selector {
      width: 20px !important;
      height: 20px !important;
      padding: 0 !important;
      border-radius: var(--el-border-radius-base) !important;
      border: none !important;
      outline: none !important;
      overflow: hidden !important;
      cursor: pointer !important;
      position: relative !important;

      // 为有透明度的颜色添加马赛克背景
      &.is-alpha {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==') !important;
        background-repeat: repeat !important;
        background-position: 0 0 !important;
      }

      // 选中状态：使用固定的 Element Plus 默认主题色边框（#409eff），使用 box-shadow 避免尺寸变化
      &.selected {
        box-shadow: 0 0 3px 2px #409eff !important;
      }

      > div {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
        display: block !important;
      }

      // 为每个透明颜色设置对应的透明度（基于默认 predefineColors 数组索引）
      // 索引 7: rgba(255, 69, 0, 0.68)
      &:nth-child(8).is-alpha > div {
        opacity: 0.68 !important;
      }

      // 索引 10: rgba(144, 240, 144, 0.5)
      &:nth-child(11).is-alpha > div {
        opacity: 0.5 !important;
      }

      // 索引 12: rgba(31, 147, 255, 0.73)
      &:nth-child(13).is-alpha > div {
        opacity: 0.73 !important;
      }

      // 索引 13: rgba(199, 21, 133, 0.47)
      &:nth-child(14).is-alpha > div {
        opacity: 0.47 !important;
      }
    }

    // Footer 样式
    .el-color-picker-panel__footer {
      display: flex !important;
      width: 100% !important;
      margin-top: 12px !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 8px !important;

      // 隐藏原生 footer 中的原生输入框（Element Plus 会自动添加一个输入框在 footer 中）
      // 使用更具体的选择器，确保只隐藏原生的，保留我们的自定义footer
      > .el-input {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
      }
      
      // 确保原生输入框的所有子元素也被隐藏
      > .el-input > * {
        display: none !important;
      }

      .btc-color-picker-footer {
        display: flex !important;
        width: 100% !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 8px !important;
        flex: 1 !important;

        .color-input {
          flex: 0 0 auto !important;
          width: auto !important;
          min-width: 120px !important;

          .el-input__prepend,
          .el-input__prepend-inner,
          .el-input__prefix,
          .el-input__wrapper > *:first-child:not(.el-input__inner) {
            display: none !important;
          }

          .el-input__wrapper {
            padding-left: 11px !important;
          }
        }

        .color-footer-buttons {
          display: flex !important;
          gap: 8px !important;
          flex-shrink: 0 !important;
        }
      }
    }
  }
}

// 暗色模式
html.dark .btc-color-picker-popover .el-color-picker-panel {
  --el-color-picker-alpha-bg-a: #333333;
}

html.dark .btc-color-picker-popover .el-color-predefine {
  --el-color-picker-alpha-bg-a: #333333;
}
</style>

