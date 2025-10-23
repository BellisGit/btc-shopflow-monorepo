﻿/**
 * 閫氱敤琛ㄦ牸鍒楅厤缃伐鍏? * 缁熶竴澶勭悊甯歌鐨勮〃鏍煎垪锛屽鍒涘缓鏃堕棿銆佹洿鏂版椂闂寸瓑
 */

import type { TableColumn, OpButton } from '../types';
import { formatDateTimeFriendly } from '@btc/shared-utils';

/**
 * 鍒涘缓鏃堕棿鍒楅厤缃? * 浣跨敤鍚庣鏍囧噯鐨?createdAt 瀛楁
 */
export function createCreatedAtColumn(): TableColumn {
  return {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    formatter: (_row: any, _column: any, cellValue: any) => {
      return formatDateTimeFriendly(cellValue);
    },
  };
}

/**
 * 鏇存柊鏃堕棿鍒楅厤缃? * 浣跨敤鍚庣鏍囧噯鐨?updatedAt 瀛楁
 */
export function createUpdatedAtColumn(): TableColumn {
  return {
    prop: 'updatedAt',
    label: '更新时间',
    width: 180,
    formatter: (_row: any, _column: any, cellValue: any) => {
      return formatDateTimeFriendly(cellValue);
    },
  };
}

/**
 * 鎿嶄綔鍒楅厤缃? * 鏍囧噯鐨勭紪杈戙€佸垹闄ゆ搷浣滄寜閽? */
export function createOperationColumn(buttons: OpButton[] = ['edit', 'delete']): TableColumn {
  return {
    type: 'op',
    label: '操作',
    width: 200,
    buttons,
  };
}

/**
 * 閫夋嫨鍒楅厤缃? */
export function createSelectionColumn(): TableColumn {
  return {
    type: 'selection',
    width: 60,
  };
}

/**
 * 搴忓彿鍒楅厤缃? */
export function createIndexColumn(): TableColumn {
  return {
    type: 'index',
    label: '序号',
    width: 60,
  };
}

/**
 * 甯哥敤鐨勮〃鏍煎垪缁勫悎
 */
export const CommonColumns = {
  selection: createSelectionColumn,
  index: createIndexColumn,
  createdAt: createCreatedAtColumn,
  updatedAt: createUpdatedAtColumn,
  operation: createOperationColumn,
} as const;

