<template>
  <div class="page">
    <btc-card>
      <template #title>表单标题</template>
      
      <BtcForm ref="Form" />
      
      <template #footer>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="handleReset">重置</el-button>
      </template>
    </btc-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBtcForm } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { FormItem } from '@btc/shared-components';

defineOptions({
  name: 'PageName'
});

const { Form } = useBtcForm();

// 打开表单（新增）
function openAddForm() {
  Form.value?.open({
    title: '新增',
    width: '800px',
    items: getFormItems(),
    on: {
      submit: async (formData: any, { close, done }: any) => {
        try {
          // TODO: 替换为实际的 API 调用
          // await api.add(formData);
          BtcMessage.success('保存成功');
          close();
        } catch (error: any) {
          done();
          BtcMessage.error(error?.message || '保存失败');
        }
      }
    }
  });
}

// 打开表单（编辑）
function openEditForm(data: any) {
  Form.value?.open({
    title: '编辑',
    width: '800px',
    form: data,
    items: getFormItems(),
    on: {
      submit: async (formData: any, { close, done }: any) => {
        try {
          // TODO: 替换为实际的 API 调用
          // await api.update(formData);
          BtcMessage.success('保存成功');
          close();
        } catch (error: any) {
          done();
          BtcMessage.error(error?.message || '保存失败');
        }
      }
    }
  });
}

// 获取表单项配置
function getFormItems(): FormItem[] {
  return [
    {
      prop: 'name',
      label: '名称',
      span: 12,
      required: true,
      component: { name: 'el-input' }
    },
    // 添加更多表单项...
  ];
}

// 提交处理
function handleSubmit() {
  Form.value?.submit();
}

// 重置处理
function handleReset() {
  Form.value?.reset();
}

// 组件挂载时打开表单（可选）
onMounted(() => {
  // openAddForm();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20px;
}
</style>
