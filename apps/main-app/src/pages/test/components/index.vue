<template>
  <div class="components-test-page">
    <div class="test-grid">
      <!-- BtcMessage 测试卡片 -->
      <BtcCard title="BtcMessage 消息组件" class="test-card">
        <template #extra>
          <el-tag type="success">消息</el-tag>
        </template>

        <div class="test-buttons">
          <el-button type="success" @click="testBtcMessageSuccess">成功消息</el-button>
          <el-button type="danger" @click="testBtcMessageError">错误消息</el-button>
          <el-button type="warning" @click="testBtcMessageWarning">警告消息</el-button>
          <el-button type="info" @click="testBtcMessageInfo">信息消息</el-button>
        </div>

        <div class="test-buttons">
          <el-button @click="testBtcMessageDuplicate">重复消息测试</el-button>
          <el-button type="warning" @click="testBtcMessageBatch">批量消息测试(100次)</el-button>
          <el-button @click="closeAllBtcMessages">关闭所有消息</el-button>
        </div>
      </BtcCard>

      <!-- BtcNotification 测试卡片 -->
      <BtcCard title="BtcNotification 通知组件" class="test-card">
        <template #extra>
          <el-tag type="warning">通知</el-tag>
        </template>

        <div class="test-buttons">
          <el-button type="success" @click="testBtcNotificationSuccess">成功通知</el-button>
          <el-button type="danger" @click="testBtcNotificationError">错误通知</el-button>
          <el-button type="warning" @click="testBtcNotificationWarning">警告通知</el-button>
          <el-button type="info" @click="testBtcNotificationInfo">信息通知</el-button>
        </div>

        <div class="test-buttons">
          <el-button @click="testBtcNotificationWithTitle">带标题通知</el-button>
          <el-button @click="testBtcNotificationCustom">自定义通知</el-button>
        </div>

        <div class="test-buttons">
          <el-button @click="testBtcNotificationDuplicate">重复通知测试</el-button>
          <el-button type="warning" @click="testBtcNotificationBatch"
            >批量通知测试(100次)</el-button
          >
          <el-button @click="closeAllBtcNotifications">关闭所有通知</el-button>
        </div>
      </BtcCard>

      <!-- BtcCard 测试卡片 -->
      <BtcCard title="BtcCard 卡片组件" class="test-card">
        <template #extra>
          <el-tag type="primary">卡片</el-tag>
        </template>

        <div class="test-buttons">
          <el-button @click="showCardDemo = !showCardDemo">
            {{ showCardDemo ? '隐藏' : '显示' }}卡片演示
          </el-button>
        </div>

        <div v-if="showCardDemo" class="card-demo">
          <BtcCard title="嵌套卡片示例" shadow="hover" border>
            <p>这是一个嵌套的卡片示例，展示了 BtcCard 组件的基本用法。</p>
            <template #extra>
              <el-button size="small" type="primary">操作</el-button>
            </template>
            <template #footer>
              <el-button size="small">取消</el-button>
              <el-button size="small" type="primary">确定</el-button>
            </template>
          </BtcCard>
        </div>
      </BtcCard>

      <!-- BtcForm 测试卡片 -->
      <BtcCard title="BtcForm 表单组件" class="test-card">
        <template #extra>
          <el-tag type="info">表单</el-tag>
        </template>

        <div class="test-buttons">
          <el-button type="primary" @click="testBtcForm">打开表单测试</el-button>
        </div>
      </BtcCard>

      <!-- BtcDialog 测试卡片 -->
      <BtcCard title="BtcDialog 对话框组件" class="test-card">
        <template #extra>
          <el-tag type="success">对话框</el-tag>
        </template>

        <div class="test-buttons">
          <el-button type="primary" @click="testBtcDialog">打开对话框测试</el-button>
        </div>
      </BtcCard>

      <!-- BtcSvg 测试卡片 -->
      <BtcCard title="BtcSvg 图标组件" class="test-card">
        <template #extra>
          <el-tag type="warning">图标</el-tag>
        </template>

        <div class="test-buttons">
          <el-button @click="showSvgDemo = !showSvgDemo">
            {{ showSvgDemo ? '隐藏' : '显示' }}图标演示
          </el-button>
        </div>

        <div v-if="showSvgDemo" class="svg-demo">
          <div class="svg-grid">
            <div class="svg-item">
              <BtcSvg name="home" size="24" />
              <span>home</span>
            </div>
            <div class="svg-item">
              <BtcSvg name="user" size="24" />
              <span>user</span>
            </div>
            <div class="svg-item">
              <BtcSvg name="setting" size="24" />
              <span>setting</span>
            </div>
            <div class="svg-item">
              <BtcSvg name="close" size="24" />
              <span>close</span>
            </div>
          </div>
        </div>
      </BtcCard>
    </div>

    <!-- 功能说明卡片 -->
    <BtcCard title="功能说明" class="info-card">
      <div class="info-content">
        <h4>组件特性</h4>
        <ul>
          <li><strong>BtcMessage</strong>：支持重复消息徽标计数，自动合并相同内容的消息</li>
          <li><strong>BtcNotification</strong>：支持重复通知徽标计数，自动合并相同内容的通知</li>
          <li><strong>BtcCard</strong>：通用卡片组件，支持标题、内容、底部插槽</li>
          <li><strong>BtcForm</strong>：动态表单组件，支持配置化表单生成</li>
          <li><strong>BtcDialog</strong>：对话框组件，支持全屏和最小化</li>
          <li><strong>BtcSvg</strong>：SVG图标组件，自动扫描项目中的SVG文件</li>
        </ul>

        <h4>使用说明</h4>
        <p>点击各个卡片中的按钮来测试对应组件的功能。所有组件都支持响应式设计和主题切换。</p>
      </div>
    </BtcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  BtcMessage,
  BtcNotification,
  BtcCard,
  BtcSvg,
  BtcForm,
  BtcDialog,
} from '@btc/shared-components';

defineOptions({
  name: 'ComponentsTestPage',
});

// 演示状态
const showCardDemo = ref(false);
const showSvgDemo = ref(false);

// BtcMessage 测试方法
const testBtcMessageSuccess = () => {
  BtcMessage.success('这是一条成功消息！');
};

const testBtcMessageError = () => {
  BtcMessage.error('这是一条错误消息！');
};

const testBtcMessageWarning = () => {
  BtcMessage.warning('这是一条警告消息！');
};

const testBtcMessageInfo = () => {
  BtcMessage.info('这是一条信息消息！');
};

const testBtcMessageDuplicate = () => {
  BtcMessage.success('重复消息测试 - 应该显示徽标计数');
  setTimeout(() => {
    BtcMessage.success('重复消息测试 - 应该显示徽标计数');
  }, 100);
  setTimeout(() => {
    BtcMessage.success('重复消息测试 - 应该显示徽标计数');
  }, 200);
};

const testBtcMessageBatch = () => {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      BtcMessage.success(`批量消息测试 - 应该显示99+, count: ${i + 1}`);
    }, i * 10);
  }
};

const closeAllBtcMessages = () => {
  BtcMessage.closeAll();
};

// BtcNotification 测试方法
const testBtcNotificationSuccess = () => {
  BtcNotification.success('这是一条成功通知！');
};

const testBtcNotificationError = () => {
  BtcNotification.error('这是一条错误通知！');
};

const testBtcNotificationWarning = () => {
  BtcNotification.warning('这是一条警告通知！');
};

const testBtcNotificationInfo = () => {
  BtcNotification.info('这是一条信息通知！');
};

const testBtcNotificationWithTitle = () => {
  BtcNotification.success({
    title: '操作成功',
    message: '数据已成功保存到服务器',
  });
};

const testBtcNotificationCustom = () => {
  BtcNotification.success({
    title: '自定义通知',
    message: '这是一个自定义的通知消息',
    duration: 0,
    showClose: true,
  });
};

const testBtcNotificationDuplicate = () => {
  BtcNotification.success('重复通知测试 - 应该显示徽标计数');
  setTimeout(() => {
    BtcNotification.success('重复通知测试 - 应该显示徽标计数');
  }, 100);
  setTimeout(() => {
    BtcNotification.success('重复通知测试 - 应该显示徽标计数');
  }, 200);
};

const testBtcNotificationBatch = () => {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      BtcNotification.success(`批量通知测试 - 应该显示99+, count: ${i + 1}`);
    }, i * 10);
  }
};

const closeAllBtcNotifications = () => {
  BtcNotification.closeAll();
};

// BtcForm 测试方法
const testBtcForm = () => {
  const { Form } = BtcForm();
  Form.value?.open({
    title: '表单测试',
    width: '600px',
    form: {
      name: '',
      email: '',
      age: 18,
    },
    items: [
      {
        prop: 'name',
        label: '姓名',
        required: true,
        component: { name: 'el-input' },
      },
      {
        prop: 'email',
        label: '邮箱',
        required: true,
        component: { name: 'el-input' },
      },
      {
        prop: 'age',
        label: '年龄',
        component: { name: 'el-input-number', props: { min: 1, max: 120 } },
      },
    ],
    on: {
      submit: (data: any, { close }: any) => {
        console.log('表单数据:', data);
        BtcMessage.success('表单提交成功！');
        close();
      },
    },
  });
};

// BtcDialog 测试方法
const testBtcDialog = () => {
  const { Dialog } = BtcDialog();
  Dialog.value?.open({
    title: '对话框测试',
    width: '500px',
    content: '这是一个测试对话框，用于验证 BtcDialog 组件的功能。',
    on: {
      confirm: () => {
        BtcMessage.success('确认操作');
      },
      cancel: () => {
        BtcMessage.info('取消操作');
      },
    },
  });
};
</script>

<style lang="scss" scoped>
.components-test-page {
  padding: 20px;
  width: 100%;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.test-card {
  .test-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.card-demo {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base);
}

.svg-demo {
  margin-top: 20px;

  .svg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
  }

  .svg-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 15px;
    background-color: var(--el-fill-color-light);
    border-radius: var(--el-border-radius-base);

    span {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}

.info-card {
  .info-content {
    h4 {
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
      margin-top: 20px;

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 10px 0;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.5;
        color: var(--el-text-color-regular);
      }
    }

    p {
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .test-grid {
    grid-template-columns: 1fr;
  }

  .test-buttons {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
