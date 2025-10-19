<template>
  <div class="message-notification-test">
    <div class="test-content">
      <!-- 基础消息测试 -->
      <div class="test-section">
        <h3>基础消息测试</h3>
        <div class="test-buttons">
          <el-button type="success" @click="testSuccess">成功消息</el-button>
          <el-button type="danger" @click="testError">错误消息</el-button>
          <el-button type="warning" @click="testWarning">警告消息</el-button>
          <el-button type="info" @click="testInfo">信息消息</el-button>
        </div>
      </div>

      <!-- 重复消息测试 -->
      <div class="test-section">
        <h3>重复消息测试</h3>
        <div class="test-buttons">
          <el-button @click="testDuplicateSuccess">重复成功消息</el-button>
          <el-button @click="testDuplicateError">重复错误消息</el-button>
          <el-button @click="testDuplicateWarning">重复警告消息</el-button>
        </div>
        <p class="test-description">
          连续点击相同按钮，前3次会显示弹窗，之后会使用徽标计数
        </p>
      </div>

      <!-- 混合消息测试 -->
      <div class="test-section">
        <h3>混合消息测试</h3>
        <div class="test-buttons">
          <el-button @click="testMixedMessages">发送混合消息</el-button>
          <el-button @click="testRapidMessages">快速发送消息</el-button>
        </div>
        <p class="test-description">
          测试不同类型消息的混合显示和快速连续消息的处理
        </p>
      </div>

      <!-- 队列和优先级测试 -->
      <div class="test-section">
        <h3>队列和优先级测试</h3>
        <div class="test-buttons">
          <el-button @click="testQueueLimit">队列限制测试</el-button>
          <el-button @click="testPriorityQueue">优先级测试</el-button>
          <el-button @click="testLongMessages">长消息测试</el-button>
        </div>
        <p class="test-description">
          测试消息队列限制（最多3条）、错误消息优先级和智能时长计算
        </p>
      </div>

      <!-- 消息合并测试 -->
      <div class="test-section">
        <h3>消息合并测试</h3>
        <div class="test-buttons">
          <el-button @click="testMessageMerge">消息合并测试</el-button>
          <el-button @click="testBadgeUpdate">徽标更新测试</el-button>
        </div>
        <p class="test-description">
          测试相同消息的合并显示和徽标计数更新
        </p>
      </div>

      <!-- 消息历史 -->
      <div class="test-section">
        <h3>消息历史</h3>
        <div class="message-history">
          <div v-if="messageHistory.length === 0" class="empty-history">
            暂无消息历史
          </div>
          <div v-else class="history-list">
            <div
              v-for="message in messageHistory"
              :key="message.id"
              class="history-item"
              :class="`history-item--${message.type}`"
            >
              <div class="history-icon">
                <el-icon>
                  <component :is="getMessageIcon(message.type)" />
                </el-icon>
              </div>
              <div class="history-content">
                <div class="history-message">{{ message.message }}</div>
                <div class="history-meta">
                  <span class="history-time">{{ formatTime(message.timestamp) }}</span>
                  <span v-if="message.count > 1" class="history-count">
                    ({{ message.count }}次)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="history-actions">
          <el-button size="small" @click="refreshHistory">刷新历史</el-button>
          <el-button size="small" @click="clearHistory">清空历史</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SuccessFilled, CircleCloseFilled, WarningFilled, InfoFilled } from '@element-plus/icons-vue';
// 从全局获取消息管理器
const messageManager = (window as any).messageManager;

// 消息项类型定义
interface MessageItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  count: number;
  timestamp: number;
  showBadge: boolean;
}

// 组件名称
defineOptions({
  name: 'MessageNotificationTest'
});

// 响应式数据
const messageHistory = ref<MessageItem[]>([]);

// 生命周期
onMounted(() => {
  // 初始化消息历史
  refreshHistory();
});

// 方法
const testSuccess = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('success', '操作成功！');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testError = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('error', '操作失败，请重试！');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testWarning = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('warning', '请注意相关风险！');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testInfo = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('info', '这是一条信息提示！');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testDuplicateSuccess = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('success', '重复的成功消息');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testDuplicateError = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('error', '重复的错误消息');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testDuplicateWarning = () => {
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('warning', '重复的警告消息');
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testMixedMessages = () => {
  const messages = [
    { type: 'success' as const, message: '用户登录成功' },
    { type: 'error' as const, message: '网络连接失败' },
    { type: 'warning' as const, message: '数据同步异常' },
    { type: 'info' as const, message: '系统维护通知' },
    { type: 'success' as const, message: '数据保存成功' }
  ];

  messages.forEach((msg, index) => {
    setTimeout(() => {
      if (messageManager && messageManager.enqueue) {
        messageManager.enqueue(msg.type, msg.message);
      } else {
        console.error('messageManager not available or enqueue method missing');
      }
    }, index * 500);
  });
};

const testRapidMessages = () => {
  // 快速发送相同的错误消息
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (messageManager && messageManager.enqueue) {
        messageManager.enqueue('error', '网络请求超时');
      } else {
        console.error('messageManager not available or enqueue method missing');
      }
    }, i * 200);
  }
};

const refreshHistory = () => {
  if (messageManager && messageManager.getMessageHistory) {
    messageHistory.value = messageManager.getMessageHistory();
  } else {
    console.error('messageManager not available or getMessageHistory method missing');
    messageHistory.value = [];
  }
};

const clearHistory = () => {
  messageManager.clearHistory();
  messageHistory.value = [];
};

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'success':
      return SuccessFilled;
    case 'error':
      return CircleCloseFilled;
    case 'warning':
      return WarningFilled;
    case 'info':
      return InfoFilled;
    default:
      return InfoFilled;
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// 新增测试方法
const testQueueLimit = () => {
  // 快速发送10条消息，测试队列限制
  for (let i = 1; i <= 10; i++) {
    setTimeout(() => {
      if (messageManager && messageManager.enqueue) {
        messageManager.enqueue('info', `队列测试消息 ${i}`);
      } else {
        console.error('messageManager not available or enqueue method missing');
      }
    }, i * 100);
  }
};

const testPriorityQueue = () => {
  // 先发送普通消息，再发送错误消息，测试优先级
  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('info', '普通信息消息');
    messageManager.enqueue('success', '成功消息');
    messageManager.enqueue('warning', '警告消息');

    setTimeout(() => {
      messageManager.enqueue('error', '错误消息（应该优先显示）');
    }, 500);
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testLongMessages = () => {
  // 测试长消息的智能时长计算
  const longMessage = '这是一条非常长的消息，用来测试智能时长计算功能。根据消息的长度和类型，系统会自动调整显示时间，确保用户有足够的时间阅读完整内容。';
  const shortMessage = '短消息';

  if (messageManager && messageManager.enqueue) {
    messageManager.enqueue('info', longMessage);
    messageManager.enqueue('success', shortMessage);
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};

const testMessageMerge = () => {
  // 测试消息合并功能
  const message = '合并测试消息';

  // 快速发送相同消息
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (messageManager && messageManager.enqueue) {
        messageManager.enqueue('success', message);
      } else {
        console.error('messageManager not available or enqueue method missing');
      }
    }, i * 200);
  }
};

const testBadgeUpdate = () => {
  // 测试徽标更新
  const message = '徽标更新测试';

  if (messageManager && messageManager.enqueue) {
    // 先发送一条消息
    messageManager.enqueue('warning', message);

    // 等待1秒后发送相同消息，应该更新徽标
    setTimeout(() => {
      messageManager.enqueue('warning', message);
    }, 1000);

    setTimeout(() => {
      messageManager.enqueue('warning', message);
    }, 2000);
  } else {
    console.error('messageManager not available or enqueue method missing');
  }
};
</script>

<style lang="scss" scoped>
.message-notification-test {
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

.message-history {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.empty-history {
  padding: 40px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.history-list {
  padding: 10px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--el-bg-color);
  border-radius: 6px;
  border-left: 4px solid transparent;

  &:last-child {
    margin-bottom: 0;
  }

  &--success {
    border-left-color: var(--el-color-success);
  }

  &--error {
    border-left-color: var(--el-color-error);
  }

  &--warning {
    border-left-color: var(--el-color-warning);
  }

  &--info {
    border-left-color: var(--el-color-info);
  }
}

.history-icon {
  font-size: 16px;
  margin-top: 2px;

  .history-item--success & {
    color: var(--el-color-success);
  }

  .history-item--error & {
    color: var(--el-color-error);
  }

  .history-item--warning & {
    color: var(--el-color-warning);
  }

  .history-item--info & {
    color: var(--el-color-info);
  }
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-message {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.history-time {
  flex: 1;
}

.history-count {
  color: var(--el-color-primary);
  font-weight: 500;
}

.history-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

// 滚动条样式
.message-history {
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-fill-color-darker);
  }
}
</style>
