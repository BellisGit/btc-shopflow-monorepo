<template>
  <!-- 主题设置按钮 -->
  <div class="btc-comm__icon" @click="openDrawer">
    <btc-svg name="theme" />
  </div>

  <!-- 暗黑模式切换 -->
  <div class="btc-comm__icon ml-[10px]" @click="handleDarkToggle">
    <btc-svg :name="theme.isDark.value ? 'light' : 'dark'" />
  </div>

  <!-- 主题设置抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="t('theme.title')"
      size="350px"
      append-to-body
    >
      <div class="theme-drawer">
        <el-form label-position="top">
          <!-- 预设主题 -->
          <el-form-item :label="t('theme.presets')">
            <ul class="theme-presets">
              <li
                v-for="themePreset in theme.THEME_PRESETS"
                :key="themePreset.name"
                @click="selectTheme(themePreset)"
              >
                <div
                  class="color-box"
                  :style="{ backgroundColor: themePreset.color }"
                >
                  <el-icon v-if="themePreset.color === theme.currentTheme.value.color">
                    <Check />
                  </el-icon>
                </div>
                <span>{{ themePreset.label }}</span>
              </li>
            </ul>
          </el-form-item>

          <!-- 自定义颜色 -->
          <el-form-item :label="t('theme.custom_color')">
            <el-color-picker v-model="customColor" @change="handleColorChange" />
            <el-text size="small" class="ml-2">{{ customColor }}</el-text>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutThemeSwitcher'
});

import { ref, watch } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import { Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const theme = useThemePlugin();

const drawerVisible = ref(false);
const customColor = ref(theme.currentTheme.value.color);

// 监听主题变化，同步自定义颜色
watch(() => theme.currentTheme.value.color, (newColor) => {
  customColor.value = newColor;
});

function openDrawer() {
  drawerVisible.value = true;
  customColor.value = theme.currentTheme.value.color;
}

function selectTheme(themeConfig: any) {
  theme.switchTheme(themeConfig);
  customColor.value = themeConfig.color;
  ElMessage.success(`${t('theme.switched')}: ${themeConfig.label}`);
}

function handleColorChange(color: string) {
  if (color) {
    theme.updateThemeColor(color);
  }
}

function handleDarkToggle(event: MouseEvent) {
  theme.toggleDark(event);
}
</script>

<style lang="scss" scoped>
.theme-drawer {
  padding: 0 10px;
}

.theme-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }

    .color-box {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      box-shadow: 0 2px 8px var(--el-box-shadow-light);

      .el-icon {
        color: #fff;
        font-size: 20px;
      }
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>

