<template>
  <div class="news-page" ref="newsPageRef">
    <!-- 主内容区 -->
    <section class="main-content">
      <!-- SVG几何背景（自动提供内容区域） -->
      <GeometricBackground ref="geometricBackgroundRef">
        <div class="content">
          <div class="container">
            <!-- 照片墙标题 -->
            <div class="gallery-header">
              <h2 class="gallery-title">新闻动态</h2>
              <p class="gallery-subtitle">News & Updates</p>
            </div>
            <!-- 瀑布流照片墙 -->
            <div class="gallery-section">
              <BtcMasonryGallery
                :items="galleryItems"
                :columns="'auto'"
                :gap="16"
                @item-click="handleGalleryItemClick"
              />
            </div>
          </div>
        </div>
      </GeometricBackground>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GeometricBackground from '@/components/GeometricBackground.vue';
import BtcMasonryGallery from '@/components/BtcMasonryGallery.vue';
import type { MasonryItem } from '@/components/BtcMasonryGallery.vue';

// 导入 WebP 版本（优先使用，体积更小）
import img1WebP from '@/assets/webp/1.webp';
import img2WebP from '@/assets/webp/2.webp';
import img3WebP from '@/assets/webp/3.webp';
import img5WebP from '@/assets/webp/5.webp';
import img6WebP from '@/assets/webp/6.webp';
import img7WebP from '@/assets/webp/7.webp';
import img8WebP from '@/assets/webp/8.webp';
import img9WebP from '@/assets/webp/9.webp';
import img10WebP from '@/assets/webp/10.webp';
import img11WebP from '@/assets/webp/11.webp';
import img12WebP from '@/assets/webp/12.webp';
import img13WebP from '@/assets/webp/13.webp';
import img14WebP from '@/assets/webp/14.webp';
import img15WebP from '@/assets/webp/15.webp';
import img16WebP from '@/assets/webp/16.webp';
import img17WebP from '@/assets/webp/17.webp';
import img18WebP from '@/assets/webp/18.webp';
import img19WebP from '@/assets/webp/19.webp';
import img20WebP from '@/assets/webp/20.webp';
import img21WebP from '@/assets/webp/21.webp';
import img22WebP from '@/assets/webp/22.webp';
import img23WebP from '@/assets/webp/23.webp';

// 导入 JPG/PNG 版本（作为降级方案）
import img1Jpg from '@/assets/images/1.jpg';
import img2Jpg from '@/assets/images/2.jpg';
import img3Png from '@/assets/images/3.png';
import img5Jpg from '@/assets/images/5.jpg';
import img6Png from '@/assets/images/6.png';
import img7Jpg from '@/assets/images/7.jpg';
import img8Jpg from '@/assets/images/8.jpg';
import img9Jpg from '@/assets/images/9.jpg';
import img10Jpg from '@/assets/images/10.jpg';
import img11Png from '@/assets/images/11.png';
import img12Png from '@/assets/images/12.png';
import img13Jpg from '@/assets/images/13.jpg';
import img14Png from '@/assets/images/14.png';
import img15Png from '@/assets/images/15.png';
import img16Jpg from '@/assets/images/16.jpg';
import img17Jpg from '@/assets/images/17.jpg';
import img18Jpg from '@/assets/images/18.jpg';
import img19Jpg from '@/assets/images/19.jpg';
import img20Jpg from '@/assets/images/20.jpg';
import img21Jpg from '@/assets/images/21.jpg';
import img22Png from '@/assets/images/22.png';
import img23Jpg from '@/assets/images/23.jpg';

// 图片加载策略：优先使用 WebP（体积更小），失败后降级到 JPG/PNG，最后降级到 CDN

defineOptions({
  name: 'NewsPage',
});

// 照片数据（优先使用 WebP，降级到 JPG/PNG，最后降级到 CDN）
const galleryItems = ref<MasonryItem[]>([
  { id: 1, src: img1WebP, alt: '图片1', fallback: img1Jpg },
  { id: 2, src: img2WebP, alt: '图片2', fallback: img2Jpg },
  { id: 3, src: img3WebP, alt: '图片3', fallback: img3Png },
  { id: 5, src: img5WebP, alt: '图片5', fallback: img5Jpg },
  { id: 6, src: img6WebP, alt: '图片6', fallback: img6Png },
  { id: 7, src: img7WebP, alt: '图片7', fallback: img7Jpg },
  { id: 8, src: img8WebP, alt: '图片8', fallback: img8Jpg },
  { id: 9, src: img9WebP, alt: '图片9', fallback: img9Jpg },
  { id: 10, src: img10WebP, alt: '图片10', fallback: img10Jpg },
  { id: 11, src: img11WebP, alt: '图片11', fallback: img11Png },
  { id: 12, src: img12WebP, alt: '图片12', fallback: img12Png },
  { id: 13, src: img13WebP, alt: '图片13', fallback: img13Jpg },
  { id: 14, src: img14WebP, alt: '图片14', fallback: img14Png },
  { id: 15, src: img15WebP, alt: '图片15', fallback: img15Png },
  { id: 16, src: img16WebP, alt: '图片16', fallback: img16Jpg },
  { id: 17, src: img17WebP, alt: '图片17', fallback: img17Jpg },
  { id: 18, src: img18WebP, alt: '图片18', fallback: img18Jpg },
  { id: 19, src: img19WebP, alt: '图片19', fallback: img19Jpg },
  { id: 20, src: img20WebP, alt: '图片20', fallback: img20Jpg },
  { id: 21, src: img21WebP, alt: '图片21', fallback: img21Jpg },
  { id: 22, src: img22WebP, alt: '图片22', fallback: img22Png },
  { id: 23, src: img23WebP, alt: '图片23', fallback: img23Jpg },
]);

const handleGalleryItemClick = () => {
  // 图片预览功能由组件内部处理
};
</script>

<style scoped lang="scss">
@use '../styles/index.scss' as *;
</style>

