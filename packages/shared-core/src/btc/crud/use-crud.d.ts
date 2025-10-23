/**
 * CRUD Composable
 * 灏佽 CRUD 閫氱敤閫昏緫锛氬垪琛ㄥ姞杞姐€佸垎椤点€佹悳绱€佸鍒犳敼绛? */
import type { CrudOptions, UseCrudReturn } from './types';
export declare function useCrud<T = Record<string, unknown>>(options: CrudOptions<T>): UseCrudReturn<T>;


