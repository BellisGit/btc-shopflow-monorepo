import type { TransferKey, TransferPanelProps, SelectedItemDisplay } from '../btc-transfer-panel/types';

export interface TransferDrawerSection {
  key: string;
  title: string;
  subtitle?: string;
  transferProps: Omit<TransferPanelProps<any>, 'modelValue'>;
  modelValue: TransferKey[];
}

export interface TransferDrawerChangePayload<T = any> {
  key: string;
  keys: TransferKey[];
  items: T[];
}

export interface TransferDrawerRemovePayload<T = any> {
  sectionKey: string;
  key: TransferKey;
  item: T | undefined;
}
