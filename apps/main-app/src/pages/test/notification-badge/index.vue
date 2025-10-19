<template>
  <div class="notification-badge-test">
    <div class="test-content">
      <!-- 基础通知测试 -->
      <div class="test-section">
        <h3>基础通知测试</h3>
        <div class="test-buttons">
          <el-button type="success" @click="testSuccess">成功通知</el-button>
          <el-button type="danger" @click="testError">错误通知</el-button>
          <el-button type="warning" @click="testWarning">警告通知</el-button>
          <el-button type="info" @click="testInfo">信息通知</el-button>
        </div>
      </div>

      <!-- 重复通知测试 -->
      <div class="test-section">
        <h3>重复通知测试</h3>
        <div class="test-buttons">
          <el-button @click="testDuplicateSuccess">重复成功通知</el-button>
          <el-button @click="testDuplicateError">重复错误通知</el-button>
          <el-button @click="testDuplicateWarning">重复警告通知</el-button>
        </div>
        <p class="test-description">
          连续点击相同按钮，前3次会显示通知，之后会使用徽标计数
        </p>
      </div>

      <!-- 混合通知测试 -->
      <div class="test-section">
        <h3>混合通知测试</h3>
        <div class="test-buttons">
          <el-button @click="testMixedNotifications">发送混合通知</el-button>
          <el-button @click="testRapidNotifications">快速发送通知</el-button>
        </div>
        <p class="test-description">
          测试不同类型通知的混合显示和快速连续通知的处理
        </p>
      </div>

      <!-- 队列和优先级测试 -->
      <div class="test-section">
        <h3>队列和优先级测试</h3>
        <div class="test-buttons">
          <el-button @click="testQueueLimit">队列限制测试</el-button>
          <el-button @click="testPriorityQueue">优先级测试</el-button>
          <el-button @click="testLongNotifications">长通知测试</el-button>
        </div>
        <p class="test-description">
          测试通知队列限制（最多3条）、错误通知优先级和智能时长计算
        </p>
      </div>

      <!-- 历史记录测试 -->
      <div class="test-section">
        <h3>历史记录测试</h3>
        <div class="test-buttons">
          <el-button @click="refreshHistory">刷新历史</el-button>
          <el-button @click="clearHistory">清空历史</el-button>
        </div>
        <div class="history-section">
          <h4>通知历史记录</h4>
          <div class="history-list">
            <div
              v-for="item in messageHistory"
              :key="item.id"
              class="history-item"
              :class="`history-item--${item.type}`"
            >
              <div class="history-icon">
                <el-icon>
                  <component :is="getNotificationIcon(item.type)" />
                </el-icon>
              </div>
              <div class="history-content">
                <div class="history-title">{{ item.title || getDefaultTitle(item.type) }}</div>
                <div class="history-message">{{ item.content }}</div>
                <div class="history-meta">
                  <span class="history-count">重复: {{ item.count }}次</span>
                  <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotification } from '@/utils/use-notification';
import {
  SuccessFilled,
  CircleCloseFilled,
  WarningFilled,
  InfoFilled
} from '@element-plus/icons-vue';

// 组件名称
defineOptions({
  name: 'NotificationBadgeTest'
});

// 使用通知管理器
const notification = useNotification();

// 历史记录
const messageHistory = ref<any[]>([]);

// 基础通知测试
const testSuccess = () => {
  if (notification && notification.success) {
    notification.success('操作成功！', '成功');
  }
};

const testError = () => {
  if (notification && notification.error) {
    notification.error('操作失败，请重试！', '错误');
  }
};

const testWarning = () => {
  if (notification && notification.warning) {
    notification.warning('请注意相关风险！', '警告');
  }
};

const testInfo = () => {
  if (notification && notification.info) {
    notification.info('这是一条信息提示！', '信息');
  }
};

// 重复通知测试
const testDuplicateSuccess = () => {
  if (notification && notification.success) {
    notification.success('重复的成功通知', '成功');
  }
};

const testDuplicateError = () => {
  if (notification && notification.error) {
    notification.error('重复的错误通知', '错误');
  }
};

const testDuplicateWarning = () => {
  if (notification && notification.warning) {
    notification.warning('重复的警告通知', '警告');
  }
};

// 混合通知测试
const testMixedNotifications = () => {
  const messages = [
    { type: 'success', message: '操作成功！', title: '成功' },
    { type: 'error', message: '操作失败！', title: '错误' },
    { type: 'warning', message: '请注意！', title: '警告' },
    { type: 'info', message: '提示信息', title: '信息' }
  ];

  messages.forEach((msg, i) => {
    setTimeout(() => {
      if (notification && notification[msg.type as keyof typeof notification]) {
        (notification as any)[msg.type](msg.message, msg.title);
      }
    }, i * 200);
  });
};

const testRapidNotifications = () => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (notification && notification.error) {
        notification.error('网络请求超时', '错误');
      }
    }, i * 100);
  }
};

// 队列和优先级测试
const testQueueLimit = () => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (notification && notification.info) {
        notification.info(`队列测试通知 ${i + 1}`, '信息');
      }
    }, i * 100);
  }
};

const testPriorityQueue = () => {
  if (notification) {
    notification.info('普通信息通知', '信息');
    notification.success('成功通知', '成功');
    notification.warning('警告通知', '警告');
    setTimeout(() => {
      if (notification && notification.error) {
        notification.error('错误通知（应该优先显示）', '错误');
      }
    }, 100);
  }
};

const testLongNotifications = () => {
  const longMessage = '这是一条非常长的通知消息，用来测试系统如何处理长文本内容的通知显示，包括自动换行、高度调整等功能。';
  const shortMessage = '短消息';

  if (notification) {
    notification.info(longMessage, '长通知');
    notification.success(shortMessage, '短通知');
  }
};

// 历史记录管理
const refreshHistory = () => {
  const notificationManager = (window as any).notificationManager;
  if (notificationManager && notificationManager.getNotificationHistory) {
    messageHistory.value = notificationManager.getNotificationHistory();
  } else {
    console.error('notificationManager not available or getNotificationHistory method missing');
    messageHistory.value = [];
  }
};

const clearHistory = () => {
  const notificationManager = (window as any).notificationManager;
  if (notificationManager && notificationManager.clearHistory) {
    notificationManager.clearHistory();
    messageHistory.value = [];
  }
};

// 辅助函数
const getNotificationIcon = (type: string) => {
  const iconMap = {
    success: SuccessFilled,
    error: CircleCloseFilled,
    warning: WarningFilled,
    info: InfoFilled
  };
  return iconMap[type as keyof typeof iconMap] || InfoFilled;
};

const getDefaultTitle = (type: string) => {
  const titleMap = {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息'
  };
  return titleMap[type as keyof typeof titleMap] || '通知';
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// 组件挂载时刷新历史记录
onMounted(() => {
  refreshHistory();
});
</script>

<style lang="scss" scoped>
.notification-badge-test {
  padding: 20px;
}

.test-header {
  margin-bottom: 30px;
  text-align: center;

  h2 {
    margin: 0 0 10px 0;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
  }
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.test-section {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);

  h3 {
    margin: 0 0 15px 0;
    color: var(--el-text-color-primary);
    font-size: 16px;
  }
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.test-description {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.history-section {
  margin-top: 20px;

  h4 {
    margin: 0 0 16px 0;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
  }

  .history-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    .history-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .history-icon {
        margin-right: 12px;
        margin-top: 2px;

        .el-icon {
          font-size: 18px;
        }
      }

      .history-content {
        flex: 1;

        .history-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .history-message {
          color: var(--el-text-color-regular);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .history-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .history-count {
            background: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            padding: 2px 6px;
            border-radius: 3px;
          }
        }
      }

      &.history-item--success {
        .history-icon .el-icon {
          color: var(--el-color-success);
        }
      }

      &.history-item--error {
        .history-icon .el-icon {
          color: var(--el-color-danger);
        }
      }

      &.history-item--warning {
        .history-icon .el-icon {
          color: var(--el-color-warning);
        }
      }

      &.history-item--info {
        .history-icon .el-icon {
          color: var(--el-color-info);
        }
      }
    }
  }
}
</style>
