<template>
  <div class="btc-message-panel">
    <!-- 头部 -->
    <div class="btc-message-panel__header">
      <span class="btc-message-panel__title">{{ t('message.title') }}</span>
    </div>

    <!-- 内容区域 -->
    <div class="btc-message-panel__content">
      <div class="btc-message-panel__scroll">
        <!-- 消息列表 -->
        <ul v-if="messageList.length > 0" class="btc-message-panel__message-list">
          <li v-for="(item, index) in messageList" :key="index" @click="handleMessageClick(item)">
            <div class="btc-message-panel__avatar">
              <img :src="item.avatar" alt="" />
            </div>
            <div class="btc-message-panel__content-text">
              <div class="btc-message-panel__content-header">
                <h4>{{ item.name }}</h4>
                <span class="btc-message-panel__time">{{ item.time }}</span>
              </div>
              <p class="btc-message-panel__preview">{{ item.preview }}</p>
            </div>
          </li>
        </ul>

        <!-- 空状态 -->
        <div v-else class="btc-message-panel__empty">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ t('message.empty') }}</p>
        </div>
      </div>

      <!-- 查看全部按钮 -->
      <div v-if="messageList.length > 0" class="btc-message-panel__btn-wrapper">
        <el-button class="btc-message-panel__view-all" @click="handleViewAll">
          {{ t('message.viewAll') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMessagePanel'
});

import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import { useRouter } from 'vue-router';
import '@btc-assets/icons/system/iconfont.css';

defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const router = useRouter();

// 消息数据
interface MessageItem {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

const messageList = ref<MessageItem[]>([
  {
    id: '1',
    name: '张三',
    avatar: '/logo.png',
    preview: '你好，请问这个功能如何使用？',
    time: '10:30',
    unread: true
  },
  {
    id: '2',
    name: '李四',
    avatar: '/logo.png',
    preview: '我已经完成了任务，请查看',
    time: '昨天',
    unread: true
  },
  {
    id: '3',
    name: '王五',
    avatar: '/logo.png',
    preview: '谢谢你的帮助！',
    time: '2024-01-15',
    unread: false
  },
  {
    id: '4',
    name: '系统消息',
    avatar: '/logo.png',
    preview: '您的订单已发货',
    time: '2024-01-14',
    unread: true
  }
]);

const handleMessageClick = (item: MessageItem) => {
  // 点击消息项的处理逻辑
  console.log('点击消息:', item);
  // 可以跳转到消息详情页
  // router.push(`/message/${item.id}`);
};

const handleViewAll = () => {
  // 查看全部消息
  console.log('查看全部消息');
  // 可以跳转到消息中心页面
  // router.push('/message-center');
};
</script>

<style lang="scss" scoped>
.btc-message-panel {
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
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__content {
    width: 100%;
    height: calc(500px - 61px);
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

  &__message-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      padding: 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      &:last-of-type {
        border-bottom: 0;
      }
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  &__content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .btc-message-panel__time {
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-left: 8px;
      flex-shrink: 0;
    }
  }

  &__preview {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
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

