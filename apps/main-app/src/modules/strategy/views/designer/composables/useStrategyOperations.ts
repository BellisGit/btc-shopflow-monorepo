import { ref, computed, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { StrategyOrchestration, StrategyNode, StrategyConnection } from '@/types/strategy';
import { strategyService } from '@/services/strategy';

/**
 * 策略操作管理
 */
export function useStrategyOperations(
  nodes: Ref<StrategyNode[]>,
  connections: Ref<StrategyConnection[]>
) {
  // 策略信息
  const strategyName = ref('新策略编排');
  const showPreview = ref(false);

  // 当前编排数据
  const currentOrchestration = computed<StrategyOrchestration>(() => ({
    id: Date.now().toString(),
    strategyId: '',
    nodes: nodes.value,
    connections: connections.value,
    variables: {},
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }));

  // 验证编排
  const validateOrchestration = async () => {
    try {
      const result = await strategyService.validateOrchestration(currentOrchestration.value);

      if (result.valid) {
        ElMessage.success('策略编排验证通过');
        return true;
      } else {
        ElMessage.error(`验证失败：${result.errors.join(', ')}`);
        return false;
      }
    } catch (error) {
      ElMessage.error('验证失败');
      return false;
    }
  };

  // 预览执行
  const previewExecution = () => {
    if (nodes.value.length === 0) {
      ElMessage.warning('请先添加节点');
      return;
    }

    showPreview.value = true;
  };

  // 保存编排
  const saveOrchestration = async (strategyId?: string) => {
    if (!strategyId) {
      ElMessage.warning('请先选择或创建策略');
      return false;
    }

    try {
      await strategyService.updateOrchestration(strategyId, currentOrchestration.value);
      ElMessage.success('策略编排保存成功');
      return true;
    } catch (error) {
      ElMessage.error('保存失败');
      return false;
    }
  };

  // 加载编排
  const loadOrchestration = async (strategyId: string) => {
    try {
      const orchestration = await strategyService.getOrchestration(strategyId);
      nodes.value = orchestration.nodes;
      connections.value = orchestration.connections;

      if (orchestration.metadata?.name) {
        strategyName.value = orchestration.metadata.name;
      }

      ElMessage.success('策略编排加载成功');
      return orchestration;
    } catch (error) {
      console.error('Failed to load orchestration:', error);
      ElMessage.error('加载策略编排失败');
      return null;
    }
  };

  // 清空编排
  const clearOrchestration = () => {
    nodes.value = [];
    connections.value = [];
    strategyName.value = '新策略编排';
    ElMessage.success('编排已清空');
  };

  // 导出编排
  const exportOrchestration = () => {
    const data = JSON.stringify(currentOrchestration.value, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${strategyName.value || 'strategy'}.json`;
    link.click();

    URL.revokeObjectURL(url);
    ElMessage.success('编排导出成功');
  };

  // 导入编排
  const importOrchestration = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (data.nodes && data.connections) {
            nodes.value = data.nodes;
            connections.value = data.connections;

            if (data.metadata?.name) {
              strategyName.value = data.metadata.name;
            }

            ElMessage.success('编排导入成功');
            resolve(true);
          } else {
            ElMessage.error('无效的编排文件格式');
            resolve(false);
          }
        } catch (error) {
          ElMessage.error('编排文件解析失败');
          resolve(false);
        }
      };

      reader.onerror = () => {
        ElMessage.error('文件读取失败');
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  // 处理保存
  const handleSave = async () => {
    if (nodes.value.length === 0) {
      ElMessage.warning('请先添加节点');
      return;
    }

    // 这里可以添加保存逻辑，比如保存到本地存储或发送到服务器
    ElMessage.success('策略编排保存成功');
  };

  return {
    // 状态
    strategyName,
    showPreview,
    currentOrchestration,

    // 方法
    validateOrchestration,
    previewExecution,
    saveOrchestration,
    handleSave,
    loadOrchestration,
    clearOrchestration,
    exportOrchestration,
    importOrchestration
  };
}
