<template>
  <div class="query-page">
    <!-- 顶栏 -->
    <div class="query-page__header">
      <h1 class="query-page__title">查询</h1>
      
      <!-- 搜索框 -->
      <div class="query-page__search">
        <van-field
          v-model="keyword"
          placeholder="物料编码/仓位/盘点人"
          :border="false"
          clearable
          @keyup.enter="onSearch"
        >
          <template #right-icon>
            <van-icon name="search" @click="onSearch" />
          </template>
        </van-field>
      </div>

      <div class="query-page__add-wrapper" ref="addBtnRef">
        <button class="query-page__add-btn" @click="toggleMenu">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <!-- 悬浮菜单 - 出现在加号按钮下方 -->
        <div 
          v-if="showMenu" 
          class="query-page__menu"
        >
          <div class="query-page__menu-content">
            <div 
              class="query-page__menu-item"
              @click.stop="handleScan"
            >
              <img :src="scanIcon" class="query-page__menu-icon" alt="扫一扫" />
              <span>扫一扫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 遮罩层 -->
    <div 
      v-if="showMenu" 
      class="query-page__overlay"
      @click="closeMenu"
    ></div>
    
    <!-- 内容区域 -->
    <div class="query-page__content">
      <van-list
        v-if="hasSearched && resultList.length > 0"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
      >
        <van-cell
          v-for="(item, index) in resultList"
          :key="index"
        >
          <template #title>
            <div class="result-item__header">
              <span class="result-item__code">{{ item.partName }}</span>
              <span class="result-item__qty">数量: {{ item.partQty }}</span>
            </div>
          </template>
          <template #label>
            <div class="result-item__info">
              <span class="result-item__position">仓位: {{ item.position }}</span>
              <span class="result-item__checker">盘点人: {{ item.checker }}</span>
            </div>
            <div class="result-item__time">{{ formatTime(item.createdAt) }}</div>
          </template>
        </van-cell>
      </van-list>
      
      <van-empty v-else-if="hasSearched && !loading" description="暂无数据" />
      
      <div v-else-if="!hasSearched" class="query-page__placeholder">
        <p>请输入关键词进行搜索</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Field, Icon, showToast, Empty, List, Cell } from 'vant';
import scanIcon from '@/assets/scan.svg';
import { inventoryApi } from '@/services/inventory';

defineOptions({
  name: 'BtcMobileQuery',
});

const router = useRouter();
const showMenu = ref(false);
const addBtnRef = ref<HTMLElement>();
const keyword = ref('');
const loading = ref(false);
const finished = ref(false); // 既然是搜索，可能不需要分页加载，或者根据 API 支持
const resultList = ref<any[]>([]);
const hasSearched = ref(false);

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}

function handleScan() {
  console.log('Scan clicked');
  router.push('/scanner').catch(err => {
    console.error('Navigation error:', err);
  });
  closeMenu();
}

async function onSearch() {
  if (!keyword.value.trim()) {
    showToast('请输入搜索关键词');
    return;
  }
  
  loading.value = true;
  hasSearched.value = true;
  finished.value = false;
  resultList.value = [];
  
  try {
    const res = await inventoryApi.list(keyword.value);
    // 假设返回结构是 { rows: [], total: 0 } 或直接数组
    const rows = Array.isArray(res) ? res : (res.rows || res.data || []);
    resultList.value = rows;
    finished.value = true; // 简单起见，一次性加载
  } catch (error) {
    console.error('Search failed:', error);
    showToast('搜索失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  try {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return timeStr;
  }
}
</script>

<style lang="scss" scoped>
.query-page {
  min-height: 100%;
  background: #f7f8fa;
  
  // 顶栏
  &__header {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between; // 改为 space-between，容纳搜索框和加号
    padding: 8px 16px; // 减少内边距，适应搜索框
    padding-top: calc(8px + env(safe-area-inset-top));
    background: #fff; // 恢复背景色，因为加了搜索框
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  &__title {
    display: none; // 隐藏标题
  }
  
  &__search {
    flex: 1;
    background: #f7f8fa;
    border-radius: 20px;
    overflow: hidden;
    margin-right: 12px;
    
    :deep(.van-field) {
      background: transparent;
      padding: 6px 12px;
    }
  }
  
  &__add-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0; // 防止被压缩
  }
  
  &__add-btn {
    width: 24px; // 减小尺寸
    height: 24px; // 减小尺寸
    border-radius: 50%;
    border: 1px solid #000;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:active {
      background: #f7f8fa;
      transform: scale(0.95);
    }
    
    svg {
      width: 12px; // 减小图标尺寸
      height: 12px; // 减小图标尺寸
      color: #000;
    }
  }
  
  // 悬浮菜单 - 出现在加号按钮下方（气泡样式）
  // 菜单容器可以自由定位，但小三角形顶点必须与加号按钮中心垂直对齐
  &__menu {
    position: absolute;
    top: calc(100% + 12px); // 增加间距 (原为 8px)
    // 菜单右对齐，并微调位置避免贴边，防止超出屏幕
    right: -6px;
    z-index: 200;
    animation: fadeInDown 0.2s ease;
  }
  
  &__menu-content {
    position: relative;
    background: #5a5a5a; // 降低颜色深度，使用更浅的灰色
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    min-width: 140px;
    
    // 气泡小三角形（顶点与加号按钮中心垂直对齐）
    &::before {
      content: '';
      position: absolute;
      top: -6px;
      // 加号按钮宽度 24px，中心点在 12px
      // 菜单右对齐偏移 -6px，所以加号中心相对于菜单右边缘是 12px + 6px = 18px
      // 小三角形宽度 12px (border 6px * 2)，中心点在 right: 18px - 6px = 12px
      right: 12px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid #5a5a5a; // 与菜单背景色一致
    }
  }
  
  &__menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
    user-select: none;
    
    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
    
    span {
      font-size: 16px;
      color: #fff !important;
      font-weight: 400;
    }
  }
  
  &__menu-icon {
    width: 20px;
    height: 20px;
    display: block;
    flex-shrink: 0;
    color: #fff; // 设置图标颜色为白色
  }
  
  // 遮罩层
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90; // 低于 header 的 100，确保不遮挡菜单
    background: transparent;
  }
  
  // 内容区域
  &__content {
    padding: 0;
    text-align: left;
    min-height: calc(100vh - 100px); // 占满剩余空间
  }
  
  &__placeholder {
    padding-top: 100px;
    text-align: center;
    
    p {
      font-size: 14px;
      color: #969799;
    }
  }
}

.result-item {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  &__code {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
  
  &__qty {
    font-size: 16px;
    font-weight: 600;
    color: #1989fa;
  }
  
  &__info {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #646566;
    margin-bottom: 4px;
  }
  
  &__time {
    font-size: 12px;
    color: #969799;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    transform: translateY(-8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

