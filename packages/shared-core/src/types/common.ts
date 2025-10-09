/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 基础 API 响应
 */
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应
 */
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

/**
 * 分页参数
 */
export interface PageParams {
  page: number;
  size: number;
  [key: string]: any;
}

/**
 * 字典项
 */
export interface DictItem {
  label: string;
  value: string | number;
  type?: string;
  color?: string;
}
