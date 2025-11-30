export interface ProcessPauseRecord {
  pauseTime: Date | string | number;
  resumeTime?: Date | string | number;
  reason?: string;
}

export interface ProcessManagementItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed';
  scheduledStartTime: Date | string | number;
  scheduledEndTime: Date | string | number;
  actualStartTime?: Date | string | number;
  actualEndTime?: Date | string | number;
  pauseHistory?: ProcessPauseRecord[];
  description?: string;
}

