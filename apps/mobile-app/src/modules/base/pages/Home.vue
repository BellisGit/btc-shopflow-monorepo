<template>
  <div class="home-page">
    <Grid :column-num="2" :gutter="16">
      <GridItem
        icon="shopping-cart-o"
        text="盘点"
        @click="router.push({ name: 'InventorySessions' })"
      />
      <GridItem
        icon="exchange"
        text="数据同步"
        @click="router.push({ name: 'Sync' })"
      />
    </Grid>
  </div>
</template>

<script setup lang="ts">
import { Grid, GridItem } from 'vant';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'BtcMobileHome',
});

const router = useRouter();
</script>


