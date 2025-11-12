import { ref, computed, watch } from 'vue';

type TableSize = 'small' | 'default' | 'large';

export interface TablePreferenceOptions {
  storageKey?: string;
  defaultSize?: TableSize;
  defaultStripe?: boolean;
  defaultBorder?: boolean;
  defaultHeaderBackground?: boolean;
  defaultHiddenColumns?: string[];
}

interface PersistedPreferences {
  size?: TableSize;
  stripe?: boolean;
  border?: boolean;
  headerBackground?: boolean;
  hiddenColumns?: string[];
}

const DEFAULT_STORAGE_KEY = 'btc-table-preferences';

function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadPreferences(key: string): PersistedPreferences {
  if (!isClient()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (error) {
    console.warn('[BtcTable] Failed to parse table preferences:', error);
    return {};
  }
}

function persistPreferences(key: string, value: PersistedPreferences) {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[BtcTable] Failed to save table preferences:', error);
  }
}

export function useTablePreferences(options: TablePreferenceOptions = {}) {
  const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
  const stored = loadPreferences(storageKey);

  const size = ref<TableSize>(stored.size ?? options.defaultSize ?? 'default');
  const stripe = ref<boolean>(stored.stripe ?? options.defaultStripe ?? false);
  const border = ref<boolean>(stored.border ?? options.defaultBorder ?? true);
  const headerBackground = ref<boolean>(
    stored.headerBackground ?? options.defaultHeaderBackground ?? true,
  );
  const hiddenColumns = ref<string[]>(
    stored.hiddenColumns ?? options.defaultHiddenColumns ?? [],
  );

  const hiddenColumnSet = computed(() => new Set(hiddenColumns.value));

  const persist = () => {
    persistPreferences(storageKey, {
      size: size.value,
      stripe: stripe.value,
      border: border.value,
      headerBackground: headerBackground.value,
      hiddenColumns: hiddenColumns.value,
    });
  };

  watch([size, stripe, border, headerBackground, hiddenColumns], persist, {
    deep: true,
  });

  const isColumnHidden = (key?: string | null) => {
    if (!key) return false;
    return hiddenColumnSet.value.has(key);
  };

  const setColumnVisibility = (key: string, visible: boolean) => {
    if (!key) return;
    const set = new Set(hiddenColumns.value);
    if (visible) {
      set.delete(key);
    } else {
      set.add(key);
    }
    hiddenColumns.value = Array.from(set);
  };

  const resetPreferences = () => {
    size.value = options.defaultSize ?? 'default';
    stripe.value = options.defaultStripe ?? false;
    border.value = options.defaultBorder ?? true;
    headerBackground.value = options.defaultHeaderBackground ?? true;
    hiddenColumns.value = options.defaultHiddenColumns ?? [];
  };

  return {
    size,
    stripe,
    border,
    headerBackground,
    hiddenColumns,
    isColumnHidden,
    setColumnVisibility,
    resetPreferences,
  };
}


