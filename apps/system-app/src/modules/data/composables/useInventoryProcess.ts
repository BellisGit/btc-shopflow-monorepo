import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { ProcessManagementItem } from '@btc/shared-components';
import { service } from '@/services/eps';

// 将 API 返回的数据映射到 ProcessManagementItem
interface CheckBaseItem {
  id?: number | string;
  checkNo?: string;
  domainId?: string;
  checkType?: string;
  checkStatus?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  checker?: string;
  remark?: string;
  remainingSeconds?: number;
  createdAt?: string | Date;
  updateAt?: string | Date;
  deletedAt?: string | Date;
}

// 状态映射：将后端状态映射到前端状态（仅用于参考，实际状态基于时间判断）
const mapCheckStatus = (checkStatus?: string): 'pending' | 'running' | 'paused' | 'completed' | null => {
  if (!checkStatus) return null;
  
  const statusMap: Record<string, 'pending' | 'running' | 'paused' | 'completed'> = {
    'pending': 'pending',
    '待开始': 'pending',
    'running': 'running',
    '进行中': 'running',
    'paused': 'paused',
    '已暂停': 'paused',
    '暂停': 'paused',
    'completed': 'completed',
    '已完成': 'completed',
    '已结束': 'completed',
    '结束': 'completed',
  };
  
  return statusMap[checkStatus] || null;
};

// 基于当前时间计算流程状态（时间优先原则）
const calculateStatus = (
  backendStatus: 'pending' | 'running' | 'paused' | 'completed' | null,
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  actualStartTime?: Date | null,
  actualEndTime?: Date | null
): 'pending' | 'running' | 'paused' | 'completed' => {
  const now = new Date();
  
  // 优先级1：如果当前时间还没到计划开始时间，始终是待开始（不管后端状态是什么）
  if (now < scheduledStartTime) {
    return 'pending';
  }
  
  // 优先级2：如果后端明确标记为暂停，且已实际开始，保持暂停状态
  if (backendStatus === 'paused' && actualStartTime) {
    // 但如果已经过了结束时间，显示已完成
    if (now >= scheduledEndTime) {
      return 'completed';
    }
    return 'paused';
  }
  
  // 优先级3：如果已经过了计划结束时间，且后端状态是 completed 或有实际结束时间，显示已完成
  if (now >= scheduledEndTime) {
    if (backendStatus === 'completed' || actualEndTime) {
      return 'completed';
    }
    // 如果时间已过，但后端状态不是 completed，且没有实际开始时间，可能是数据异常
    // 如果有实际开始时间，显示已完成
    return actualStartTime ? 'completed' : (backendStatus || 'pending');
  }
  
  // 优先级4：在时间范围内（已到开始时间，但还没到结束时间）
  if (actualStartTime) {
    // 如果实际已开始，根据后端状态判断
    if (backendStatus === 'paused') {
      return 'paused';
    }
    // 如果后端状态是 completed，但时间还没到结束时间，可能是提前完成，先显示 running
    // 或者后端状态异常，按时间判断应该显示 running
    if (backendStatus === 'completed') {
      // 如果有实际结束时间，显示已完成；否则显示运行中
      return actualEndTime ? 'completed' : 'running';
    }
    // 其他情况显示运行中
    return 'running';
  }
  
  // 优先级5：时间已到开始时间，但还没实际开始，应该是待开始（等待手动或自动开始）
  // 即使后端状态是 completed，如果时间还没到结束时间且没有实际开始时间，也应该显示待开始
  if (backendStatus === 'completed' && now < scheduledEndTime && !actualStartTime) {
    // 后端状态可能是错误的，优先显示待开始
    return 'pending';
  }
  
  // 默认情况：根据后端状态判断
  return backendStatus || 'pending';
};

// 将 API 数据转换为 ProcessManagementItem
const mapToProcessItem = (item: CheckBaseItem): ProcessManagementItem => {
  const scheduledStartTime = item.startTime ? new Date(item.startTime) : new Date();
  const scheduledEndTime = item.endTime ? new Date(item.endTime) : new Date();
  
  // 获取后端状态作为参考
  const backendStatus = mapCheckStatus(item.checkStatus);
  
  // 判断是否有实际开始/结束时间
  // 根据后端状态判断：如果状态不是 pending，则认为已开始
  // 如果状态是 completed，则认为已结束
  const hasActualStart = backendStatus && backendStatus !== 'pending' && backendStatus !== null;
  const hasActualEnd = backendStatus === 'completed';
  
  // 注意：如果后端有单独的 actualStartTime/actualEndTime 字段，应该优先使用
  // 目前假设 startTime/endTime 可能是计划时间，也可能是实际时间
  // 这里我们假设 startTime/endTime 是计划时间，实际时间需要根据状态判断
  // 如果后端状态表明已开始，且当前时间已过开始时间，则认为实际开始时间就是开始时间
  const now = new Date();
  const actualStartTime = hasActualStart && now >= scheduledStartTime ? scheduledStartTime : undefined;
  const actualEndTime = hasActualEnd && now >= scheduledEndTime ? scheduledEndTime : undefined;
  
  // 基于当前时间计算实际状态（时间优先）
  const status = calculateStatus(backendStatus, scheduledStartTime, scheduledEndTime, actualStartTime, actualEndTime);
  
  return {
    id: String(item.id || ''),
    name: item.remark || item.checkNo || `盘点-${item.id}`, // 优先使用 remark 作为流程标题
    status,
    scheduledStartTime,
    scheduledEndTime,
    actualStartTime,
    actualEndTime,
    description: item.remark,
  };
};

export function useInventoryProcess() {
  const { t } = useI18n();
  const message = useMessage();
  
  const processes = ref<ProcessManagementItem[]>([]);
  const loading = ref(false);
  const searchKeyword = ref('');
  const statusFilter = ref<string>('');
  
  // 正在自动处理的流程 ID 集合，用于避免重复触发
  const autoProcessingIds = ref<Set<string>>(new Set());

  // 过滤后的流程列表
  const filteredProcesses = computed(() => {
    let result = processes.value;

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(keyword)
      );
    }

    // 按状态筛选
    if (statusFilter.value) {
      result = result.filter((p) => p.status === statusFilter.value);
    }

    return result;
  });

  // 加载流程列表
  const loadProcesses = async () => {
    try {
      loading.value = true;
      
      // 构建查询参数
      // keyword 必须是一个对象，参考物流域盘点记录表的实现
      const params: any = {
        page: 1,
        size: 1000, // 获取所有数据，后续可以改为分页加载
        keyword: {}, // 始终传递 keyword 对象，即使为空
      };
      
      // 根据搜索关键词设置 keyword 对象
      // 根据 API 配置，keyword 对象可以包含搜索字段
      if (searchKeyword.value) {
        params.keyword.checkNo = searchKeyword.value; // 根据盘点编号搜索
      }
      
      // 添加状态筛选（如果需要通过 API 筛选）
      // 注意：如果后端不支持状态筛选，则在前端过滤
      if (statusFilter.value) {
        // 将前端状态映射回后端状态（如果需要）
        const statusMap: Record<string, string> = {
          'pending': 'pending',
          'running': 'running',
          'paused': 'paused',
          'completed': 'completed',
        };
        // 如果后端支持状态筛选，可以在这里添加
        // params.keyword.checkStatus = statusMap[statusFilter.value];
      }
      
      // 调用真实 API：分页查询盘点基础表
      const response = await service.logistics?.warehouse?.check?.page?.(params);
      
      // 转换数据格式
      const list = response?.list || response?.records || [];
      let mappedList = list.map(mapToProcessItem);
      
      // 如果后端不支持状态筛选，在前端过滤
      if (statusFilter.value) {
        mappedList = mappedList.filter((p) => p.status === statusFilter.value);
      }
      
      processes.value = mappedList;
    } catch (error) {
      console.error('[InventoryProcess] Load failed:', error);
      message.error(t('process.load.failed') || '加载流程列表失败');
    } finally {
      loading.value = false;
    }
  };
  
  // 监听搜索关键词变化，自动重新加载（防抖处理）
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  watch(searchKeyword, () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      loadProcesses();
    }, 500); // 500ms 防抖
  });
  
  // 监听状态筛选变化，自动重新加载
  watch(statusFilter, () => {
    loadProcesses();
  });

  // 自动开始/结束检查
  const checkProcessStatus = () => {
    const now = new Date();

    processes.value.forEach((process) => {
      // 自动开始：到达计划开始时间且状态为 pending，且未在处理中
      if (
        process.status === 'pending' &&
        new Date(process.scheduledStartTime) <= now &&
        !process.actualStartTime &&
        !autoProcessingIds.value.has(process.id)
      ) {
        handleAutoStart(process);
      }

      // 自动结束：到达计划结束时间且状态为 running，且未在处理中
      if (
        process.status === 'running' &&
        new Date(process.scheduledEndTime) <= now &&
        !process.actualEndTime &&
        !autoProcessingIds.value.has(process.id)
      ) {
        handleAutoEnd(process);
      }
    });
  };

  // 自动开始
  const handleAutoStart = async (process: ProcessManagementItem) => {
    // 标记为正在处理，避免重复触发
    autoProcessingIds.value.add(process.id);
    
    try {
      // 调用 API：开始盘点
      await service.logistics?.warehouse?.check?.start?.({ id: process.id });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.auto.start.success', { name: process.name }) || `流程 "${process.name}" 已自动开始`);
    } catch (error) {
      console.error('[InventoryProcess] Auto start failed:', error);
      // 如果失败，从处理集合中移除，允许重试
      autoProcessingIds.value.delete(process.id);
    }
    // 成功或失败后都移除标记，因为状态已更新
    setTimeout(() => {
      autoProcessingIds.value.delete(process.id);
    }, 1000);
  };

  // 自动结束
  const handleAutoEnd = async (process: ProcessManagementItem) => {
    // 标记为正在处理，避免重复触发
    autoProcessingIds.value.add(process.id);
    
    try {
      // 调用 API：结束盘点
      await service.logistics?.warehouse?.check?.finish?.({ id: process.id });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.auto.end.success', { name: process.name }) || `流程 "${process.name}" 已自动结束`);
    } catch (error) {
      console.error('[InventoryProcess] Auto end failed:', error);
      // 如果失败，从处理集合中移除，允许重试
      autoProcessingIds.value.delete(process.id);
    }
    // 成功或失败后都移除标记，因为状态已更新
    setTimeout(() => {
      autoProcessingIds.value.delete(process.id);
    }, 1000);
  };

  // 手动开始
  const startProcess = async (process: ProcessManagementItem) => {
    if (process.actualStartTime) {
      message.warning(t('process.start.already') || '流程已经开始，不能重复开始');
      return;
    }

    try {
      loading.value = true;
      
      // 调用 API：开始盘点
      await service.logistics?.warehouse?.check?.start?.({ id: process.id });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.start.success', { name: process.name }) || `流程 "${process.name}" 已开始`);
    } catch (error) {
      console.error('[InventoryProcess] Start failed:', error);
      message.error(t('process.start.failed') || '开始流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 暂停流程
  const pauseProcess = async (process: ProcessManagementItem, reason?: string) => {
    if (process.status !== 'running') {
      message.warning(t('process.pause.invalid') || '只有运行中的流程才能暂停');
      return;
    }

    try {
      loading.value = true;
      
      // 调用 API：暂停盘点
      await service.logistics?.warehouse?.check?.pause?.({ id: process.id, reason });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.pause.success', { name: process.name }) || `流程 "${process.name}" 已暂停`);
    } catch (error) {
      console.error('[InventoryProcess] Pause failed:', error);
      message.error(t('process.pause.failed') || '暂停流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 恢复流程
  const resumeProcess = async (process: ProcessManagementItem) => {
    if (process.status !== 'paused') {
      message.warning(t('process.resume.invalid') || '只有暂停的流程才能恢复');
      return;
    }

    try {
      loading.value = true;
      
      // 调用 API：继续盘点
      await service.logistics?.warehouse?.check?.recover?.({ id: process.id });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.resume.success', { name: process.name }) || `流程 "${process.name}" 已恢复`);
    } catch (error) {
      console.error('[InventoryProcess] Resume failed:', error);
      message.error(t('process.resume.failed') || '恢复流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 结束流程
  const endProcess = async (process: ProcessManagementItem) => {
    if (process.actualEndTime) {
      message.warning(t('process.end.already') || '流程已经结束，不能重复结束');
      return;
    }

    if (!process.actualStartTime) {
      message.warning(t('process.end.notStarted') || '流程尚未开始，不能结束');
      return;
    }

    try {
      loading.value = true;
      
      // 调用 API：结束盘点
      await service.logistics?.warehouse?.check?.finish?.({ id: process.id });
      
      // 重新加载数据以获取最新状态
      await loadProcesses();
      message.success(t('process.end.success', { name: process.name }) || `流程 "${process.name}" 已结束`);
    } catch (error) {
      console.error('[InventoryProcess] End failed:', error);
      message.error(t('process.end.failed') || '结束流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 详情相关状态
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<CheckBaseItem | null>(null);

  // 查看详情
  const viewProcessDetail = async (process: ProcessManagementItem) => {
    try {
      detailVisible.value = true;
      detailLoading.value = true;
      
      // 调用 info API 获取详情
      const response = await service.logistics?.warehouse?.check?.info?.({ id: process.id });
      // 处理响应数据，可能是在 data 字段中，也可能直接返回
      detailData.value = response?.data || response || null;
    } catch (error) {
      console.error('[InventoryProcess] Load detail failed:', error);
      message.error(t('process.detail.load.failed') || '加载详情失败');
      detailVisible.value = false;
    } finally {
      detailLoading.value = false;
    }
  };

  // 定时检查流程状态
  let statusCheckTimer: ReturnType<typeof setInterval> | null = null;

  const startStatusCheck = () => {
    if (statusCheckTimer) return;
    statusCheckTimer = setInterval(() => {
      checkProcessStatus();
    }, 1000); // 每秒检查一次
  };

  const stopStatusCheck = () => {
    if (statusCheckTimer) {
      clearInterval(statusCheckTimer);
      statusCheckTimer = null;
    }
  };

  onMounted(() => {
    loadProcesses();
    startStatusCheck();
  });

  onUnmounted(() => {
    stopStatusCheck();
  });

  return {
    processes,
    loading,
    searchKeyword,
    statusFilter,
    filteredProcesses,
    loadProcesses,
    startProcess,
    pauseProcess,
    resumeProcess,
    endProcess,
    viewProcessDetail,
    detailVisible,
    detailLoading,
    detailData,
  };
}

