<template>
  <div class="btc-notification-panel">
    <!-- 头部 -->
    <div class="btc-notification-panel__header">
      <span class="btc-notification-panel__title">{{ t('notice.title') }}</span>
      <span class="btc-notification-panel__btn-read" @click="handleReadAll">{{ t('notice.btnRead') }}</span>
    </div>

    <!-- Tab 标签栏 -->
    <ul class="btc-notification-panel__bar">
      <li
        v-for="(item, index) in barList"
        :key="index"
        :class="{ active: barActiveIndex === index }"
        @click="changeBar(index)"
      >
        {{ item.name }} ({{ item.num }})
      </li>
    </ul>

    <!-- 内容区域 -->
    <div class="btc-notification-panel__content">
      <div class="btc-notification-panel__scroll">
        <!-- 通知列表 -->
        <ul v-show="barActiveIndex === 0" class="btc-notification-panel__notice-list">
          <li v-for="(item, index) in noticeList" :key="index">
            <div
              class="btc-notification-panel__icon"
              :style="{ background: getNoticeStyle(item.type).backgroundColor + '!important' }"
            >
              <i
                class="iconfont-sys"
                :style="{ color: getNoticeStyle(item.type).iconColor + '!important' }"
                v-html="getNoticeStyle(item.type).icon"
              ></i>
            </div>
            <div class="btc-notification-panel__text">
              <h4>{{ item.title }}</h4>
              <p>{{ item.time }}</p>
            </div>
          </li>
        </ul>

        <!-- 消息列表 -->
        <ul v-show="barActiveIndex === 1" class="btc-notification-panel__message-list">
          <li v-for="(item, index) in msgList" :key="index">
            <div class="btc-notification-panel__avatar">
              <img :src="item.avatar" alt="" />
            </div>
            <div class="btc-notification-panel__text">
              <h4>{{ item.title }}</h4>
              <p>{{ item.time }}</p>
            </div>
          </li>
        </ul>

        <!-- 待办列表 -->
        <ul v-show="barActiveIndex === 2" class="btc-notification-panel__pending-list">
          <li v-for="(item, index) in pendingList" :key="index">
            <h4>{{ item.title }}</h4>
            <p>{{ item.time }}</p>
          </li>
        </ul>

        <!-- 空状态 -->
        <div v-show="currentTabIsEmpty" class="btc-notification-panel__empty">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ t('notice.text[0]') }}{{ barList[barActiveIndex].name }}</p>
        </div>
      </div>

      <!-- 查看全部按钮 -->
      <div class="btc-notification-panel__btn-wrapper">
        <el-button class="btc-notification-panel__view-all" @click="handleViewAll">
          {{ t('notice.viewAll') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcNotificationPanel'
});

import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import '@assets/icons/system/iconfont.css';

defineEmits<{
  close: [];
}>();

const { t } = useI18n();

// 通知数据
interface NoticeItem {
  title: string;
  time: string;
  type: 'email' | 'message' | 'collection' | 'user' | 'notice';
}

interface MessageItem {
  title: string;
  time: string;
  avatar: string;
}

interface PendingItem {
  title: string;
  time: string;
}

interface BarItem {
  name: string;
  num: number;
}

interface NoticeStyle {
  icon: string;
  iconColor: string;
  backgroundColor: string;
}

const barActiveIndex = ref(0);

const noticeList = ref<NoticeItem[]>([
  {
    title: '新增国际化',
    time: '2024-6-13 0:10',
    type: 'notice'
  },
  {
    title: '冷月呆呆给你发了一条消息',
    time: '2024-4-21 8:05',
    type: 'message'
  },
  {
    title: '小肥猪关注了你',
    time: '2020-3-17 21:12',
    type: 'collection'
  },
  {
    title: '新增使用文档',
    time: '2024-02-14 0:20',
    type: 'notice'
  },
  {
    title: '小肥猪给你发了一封邮件',
    time: '2024-1-20 0:15',
    type: 'email'
  },
  {
    title: '菜单mock本地真实数据',
    time: '2024-1-17 22:06',
    type: 'notice'
  }
]);

const msgList = ref<MessageItem[]>([
  {
    title: '池不胖 关注了你',
    time: '2021-2-26 23:50',
    avatar: '/logo.png'
  },
  {
    title: '唐不苦 关注了你',
    time: '2021-2-21 8:05',
    avatar: '/logo.png'
  },
  {
    title: '中小鱼 关注了你',
    time: '2020-1-17 21:12',
    avatar: '/logo.png'
  },
  {
    title: '何小荷 关注了你',
    time: '2021-01-14 0:20',
    avatar: '/logo.png'
  },
  {
    title: '誶誶淰 关注了你',
    time: '2020-12-20 0:15',
    avatar: '/logo.png'
  },
  {
    title: '冷月呆呆 关注了你',
    time: '2020-12-17 22:06',
    avatar: '/logo.png'
  }
]);

const pendingList = ref<PendingItem[]>([]);

const barList = computed<BarItem[]>(() => [
  {
    name: t('notice.bar[0]'),
    num: noticeList.value.length
  },
  {
    name: t('notice.bar[1]'),
    num: msgList.value.length
  },
  {
    name: t('notice.bar[2]'),
    num: pendingList.value.length
  }
]);

const currentTabIsEmpty = computed(() => {
  const tabDataMap = [noticeList.value, msgList.value, pendingList.value];
  const currentData = tabDataMap[barActiveIndex.value];
  return currentData && currentData.length === 0;
});

const getNoticeStyle = (type: NoticeItem['type']): NoticeStyle => {
  const noticeStyleMap: Record<NoticeItem['type'], NoticeStyle> = {
    email: {
      icon: '&#xe72e;',
      iconColor: 'rgb(230, 162, 60)',
      backgroundColor: 'rgba(230, 162, 60, 0.1)'
    },
    message: {
      icon: '&#xe747;',
      iconColor: 'rgb(103, 194, 58)',
      backgroundColor: 'rgba(103, 194, 58, 0.1)'
    },
    collection: {
      icon: '&#xe714;',
      iconColor: 'rgb(245, 108, 108)',
      backgroundColor: 'rgba(245, 108, 108, 0.1)'
    },
    user: {
      icon: '&#xe608;',
      iconColor: 'rgb(144, 147, 153)',
      backgroundColor: 'rgba(144, 147, 153, 0.1)'
    },
    notice: {
      icon: '&#xe6c2;',
      iconColor: 'rgb(64, 158, 255)',
      backgroundColor: 'rgba(64, 158, 255, 0.1)'
    }
  };

  return noticeStyleMap[type] || noticeStyleMap.notice;
};

const changeBar = (index: number) => {
  barActiveIndex.value = index;
};

const handleReadAll = () => {
  // 标记全部已读
  console.log('标记全部已读');
};

const handleViewAll = () => {
  // 查看全部
  console.log('查看全部', barList.value[barActiveIndex.value].name);
};
</script>

<style lang="scss" scoped>
.btc-notification-panel {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    margin-top: 0;
    border-bottom: 1px solid var(--el-border-color-light);

    .btc-notification-panel__title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .btc-notification-panel__btn-read {
      font-size: 12px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  &__bar {
    display: flex;
    width: 100%;
    height: 50px;
    padding: 0 15px;
    line-height: 50px;
    border-bottom: 1px solid var(--el-border-color-light);
    list-style: none;
    margin: 0;

    li {
      height: 48px;
      margin-right: 20px;
      overflow: hidden;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: color 0.3s;
      user-select: none;

      &:last-of-type {
        margin-right: 0;
      }

      &:hover {
        color: var(--el-text-color-primary);
      }

      &.active {
        color: var(--el-color-primary) !important;
        border-bottom: 2px solid var(--el-color-primary);
      }
    }
  }

  &__content {
    width: 100%;
    height: calc(500px - 95px);
    display: flex;
    flex-direction: column;
  }

  &__scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 5px !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color);
      border-radius: 5px;
    }
  }

  &__notice-list,
  &__message-list,
  &__pending-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 15px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      &:last-of-type {
        border-bottom: 0;
      }
    }
  }

  &__icon {
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 8px;
    flex-shrink: 0;

    i {
      font-size: 18px;
      background: transparent !important;
    }
  }

  &__avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__text {
    width: calc(100% - 45px);
    margin-left: 15px;
    overflow: hidden;

    h4 {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: var(--el-text-color-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin-top: 5px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
  }

  &__pending-list {
    li {
      flex-direction: column;
      align-items: flex-start;
      padding: 15px 20px;

      h4 {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: var(--el-text-color-primary);
        margin: 0;
      }

      p {
        margin-top: 5px;
        font-size: 12px;
        color: var(--el-text-color-regular);
        margin: 0;
      }
    }
  }

  &__empty {
    position: relative;
    top: 100px;
    height: 100%;
    color: var(--el-text-color-placeholder);
    text-align: center;
    background: transparent !important;

    i {
      font-size: 60px;
    }

    p {
      margin-top: 15px;
      font-size: 12px;
      background: transparent !important;
      margin: 0;
    }
  }

  &__btn-wrapper {
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    border-top: 1px solid var(--el-border-color-light);
  }

  &__view-all {
    width: 100%;
  }
}
</style>
