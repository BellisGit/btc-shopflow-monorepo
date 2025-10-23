<template>
  <div class="btc-svg-example">
    <h2>btc-svg 缁勪欢绀轰緥</h2>

    <!-- 鍩虹鐢ㄦ硶 -->
    <section>
      <h3>鍩虹鐢ㄦ硶</h3>
      <div class="demo-row">
        <btc-svg name="home" />
        <btc-svg name="user" />
        <btc-svg name="search" />
        <btc-svg name="set" />
      </div>
    </section>

    <!-- 涓嶅悓澶у皬 -->
    <section>
      <h3>涓嶅悓澶у皬</h3>
      <div class="demo-row">
        <btc-svg name="home" :size="16" />
        <btc-svg name="home" :size="24" />
        <btc-svg name="home" :size="32" />
        <btc-svg name="home" :size="48" />
      </div>
    </section>

    <!-- 鑷畾涔夐鑹?-->
    <section>
      <h3>鑷畾涔夐鑹?/h3>
      <div class="demo-row">
        <btc-svg name="home" color="#409eff" :size="32" />
        <btc-svg name="home" color="#67c23a" :size="32" />
        <btc-svg name="home" color="#e6a23c" :size="32" />
        <btc-svg name="home" color="#f56c6c" :size="32" />
      </div>
    </section>

    <!-- 缁ф壙鐖跺厓绱犻鑹?-->
    <section>
      <h3>缁ф壙鐖跺厓绱犻鑹?/h3>
      <div class="demo-row">
        <div style="color: #409eff">
          <btc-svg name="home" :size="32" />
        </div>
        <div style="color: #67c23a">
          <btc-svg name="user" :size="32" />
        </div>
        <div style="color: #e6a23c">
          <btc-svg name="search" :size="32" />
        </div>
      </div>
    </section>

    <!-- 鍦ㄦ寜閽腑浣跨敤 -->
    <section>
      <h3>鍦ㄦ寜閽腑浣跨敤</h3>
      <div class="demo-row">
        <el-button type="primary">
          <btc-svg name="home" :size="16" />
          棣栭〉
        </el-button>
        <el-button type="success">
          <btc-svg name="user" :size="16" />
          鐢ㄦ埛
        </el-button>
        <el-button type="warning">
          <btc-svg name="search" :size="16" />
          鎼滅储
        </el-button>
      </div>
    </section>

    <!-- 鍥介檯鍖栧浘鏍?-->
    <section>
      <h3>鍥介檯鍖栧浘鏍?/h3>
      <div class="demo-row">
        <el-button @click="locale = 'zh-CN'">
          <btc-svg name="icon-zh" :size="16" />
          涓枃
        </el-button>
        <el-button @click="locale = 'en-US'">
          <btc-svg name="icon-en" :size="16" />
          English
        </el-button>
        <el-button @click="locale = 'ja-JP'">
          <btc-svg name="icon-ja" :size="16" />
          鏃ユ湰瑾?        </el-button>
        <div class="current-locale">
          褰撳墠璇█锛?          <btc-svg :name="getLocaleIcon()" :size="24" color="#409eff" />
          {{ locale }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const locale = ref('zh-CN');

function getLocaleIcon() {
  const map: Record<string, string> = {
    'zh-CN': 'icon-zh',
    'en-US': 'icon-en',
    'ja-JP': 'icon-ja'
  };
  return map[locale.value] || 'icon-zh';
}
</script>

<style scoped lang="scss">
.btc-svg-example {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    color: #303133;
  }

  section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      color: #606266;
    }
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .current-locale {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>


