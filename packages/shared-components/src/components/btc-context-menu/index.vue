<template>
  <Teleport to="body" :disabled="false">
    <Transition name="btc-context-menu">
      <div
        v-if="state.visible"
        ref="menuRef"
        class="btc-context-menu"
        :class="[
          customClass,
          {
            'btc-context-menu--right': state.position.right,
            'btc-context-menu--bottom': state.position.bottom
          }
        ]"
        :style="menuStyle"
        @contextmenu.prevent
        @click.stop
      >
        <div class="btc-context-menu__content">
          <div
            v-for="(item, index) in state.menuList"
            :key="index"
            class="btc-context-menu__item"
            :class="[
              {
                'btc-context-menu__item--disabled': item.disabled,
                'btc-context-menu__item--divider': item.divider,
                'btc-context-menu__item--hidden': item.hidden
              },
              item.customClass
            ]"
            @click="handleItemClick(item)"
            @mouseenter="item.children ? handleSubMenuShow(index) : null"
            @mouseleave="handleSubMenuHide"
          >
            <!-- 分割线 -->
            <div v-if="item.divider" class="btc-context-menu__divider" />

            <!-- 菜单项内容 -->
            <template v-else>
              <!-- 前置图标 -->
              <div v-if="item.prefixIcon" class="btc-context-menu__prefix-icon">
                <el-icon>
                  <component :is="item.prefixIcon" />
                </el-icon>
              </div>

              <!-- 标签文本 -->
              <span
                class="btc-context-menu__label"
                :class="{ 'btc-context-menu__label--ellipsis': item.ellipsis }"
              >
                {{ item.label }}
              </span>

              <!-- 后置图标 -->
              <div v-if="item.suffixIcon" class="btc-context-menu__suffix-icon">
                <el-icon>
                  <component :is="item.suffixIcon" />
                </el-icon>
              </div>

              <!-- 子菜单箭头 -->
              <div v-if="item.children && item.children.length > 0" class="btc-context-menu__arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </template>

            <!-- 子菜单 -->
            <Transition name="btc-context-menu__sub">
              <div
                v-if="item.children && item.children.length > 0 && state.activeSubMenuIndex === index"
                ref="subMenuRefs"
                class="btc-context-menu__sub-menu"
                :style="getSubMenuStyle(index)"
                @mouseenter="handleSubMenuShow(index)"
                @mouseleave="handleSubMenuHide"
              >
                <div class="btc-context-menu__sub-content">
                  <div
                    v-for="(childItem, childIndex) in item.children"
                    :key="childIndex"
                    class="btc-context-menu__sub-item"
                    :class="[
                      {
                        'btc-context-menu__sub-item--disabled': childItem.disabled,
                        'btc-context-menu__sub-item--divider': childItem.divider,
                        'btc-context-menu__sub-item--hidden': childItem.hidden
                      },
                      childItem.customClass
                    ]"
                    @click="handleItemClick(childItem)"
                  >
                    <!-- 子菜单分割线 -->
                    <div v-if="childItem.divider" class="btc-context-menu__divider" />

                    <!-- 子菜单项内容 -->
                    <template v-else>
                      <!-- 前置图标 -->
                      <div v-if="childItem.prefixIcon" class="btc-context-menu__prefix-icon">
                        <el-icon>
                          <component :is="childItem.prefixIcon" />
                        </el-icon>
                      </div>

                      <!-- 标签文本 -->
                      <span
                        class="btc-context-menu__label"
                        :class="{ 'btc-context-menu__label--ellipsis': childItem.ellipsis }"
                      >
                        {{ childItem.label }}
                      </span>

                      <!-- 后置图标 -->
                      <div v-if="childItem.suffixIcon" class="btc-context-menu__suffix-icon">
                        <el-icon>
                          <component :is="childItem.suffixIcon" />
                        </el-icon>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { useContextMenu } from './composables/useContextMenu';
import type { ContextMenuOptions, ContextMenuItem } from './types';

// Props
interface Props {
  /** 自定义类名 */
  customClass?: string;
  /** 菜单宽度 */
  width?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 菜单项列表 */
  list?: ContextMenuItem[];
  /** 鼠标事件 */
  event?: MouseEvent;
}

const props = withDefaults(defineProps<Props>(), {
  customClass: '',
  width: 200,
  maxHeight: 400,
  list: () => [],
  event: undefined
});

// Emits
const emit = defineEmits<{
  close: [];
}>();

// 使用组合式函数
const {
  state,
  menuRef,
  subMenuRefs,
  handleItemClick,
  handleSubMenuShow,
  handleSubMenuHide,
  open,
  close
} = useContextMenu();

// 计算样式
const menuStyle = computed(() => ({
  left: `${state.position.x}px`,
  top: `${state.position.y}px`,
  width: `${props.width}px`,
  maxHeight: `${props.maxHeight}px`
}));

// 获取子菜单样式
const getSubMenuStyle = (index: number) => {
  const position = state.subMenuPositions[index];
  if (!position) return {};

  return {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: position.right ? 'translateX(-100%)' : 'none'
  };
};

// 暴露方法
defineExpose({
  open: (event: MouseEvent, options: ContextMenuOptions) => {
    open(event, options);
  },
  close: () => {
    close();
  }
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss';
</style>
