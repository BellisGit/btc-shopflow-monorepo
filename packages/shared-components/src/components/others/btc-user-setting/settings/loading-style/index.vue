<template>
  <div class="loading-style-settings">
    <SectionTitle :title="t('theme.loadingStyles.title') || 'Loading Style'" :style="{ marginTop: '40px' }" />
    <div class="setting-box-wrap">
      <button
        v-for="item in loadingStyleOptions"
        :key="item.value"
        class="setting-item"
        :class="{ 'is-active': item.value === currentLoadingStyle }"
        type="button"
        :aria-pressed="item.value === currentLoadingStyle"
        @click="handleLoadingStyleClick(item.value)"
      >
        <div
          class="box loading-style-preview"
          :class="`loading-style-${item.value}`"
        >
          <div class="loading-preview__inner">
            <div v-if="item.value === 'circle'" class="loading-preview-circle"></div>
            <div v-else-if="item.value === 'dots'" class="loading-preview-dots">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <g class="spinner">
                  <circle class="dot dot-1" cx="20" cy="8" r="4"/>
                  <circle class="dot dot-2" cx="32" cy="20" r="4"/>
                  <circle class="dot dot-3" cx="20" cy="32" r="4"/>
                  <circle class="dot dot-4" cx="8" cy="20" r="4"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
        <p class="name">{{ item.label }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsHandlers, useSettingsState } from '../../composables';
import './styles/index.scss';

type LoadingStyle = 'circle' | 'dots';

const { t } = useI18n();
const settingsState = useSettingsState();
const { loadingStyleHandlers } = useSettingsHandlers();

const currentLoadingStyle = computed<LoadingStyle>(() => settingsState.loadingStyle?.value || 'circle');

const loadingStyleOptions = computed(() => [
  {
    value: 'circle' as LoadingStyle,
    label: t('theme.loadingStyles.circle'),
  },
  {
    value: 'dots' as LoadingStyle,
    label: t('theme.loadingStyles.dots'),
  },
]);

const handleLoadingStyleClick = (style: LoadingStyle) => {
  if (style === currentLoadingStyle.value) return;
  loadingStyleHandlers?.setStyle(style);
};
</script>

