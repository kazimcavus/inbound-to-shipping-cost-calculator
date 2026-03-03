import {
  DEFAULT_LABOR_RATES,
  DEFAULT_PROCESS_STEPS,
  DEFAULT_PACKAGING_ITEMS,
  DEFAULT_RISK_SETTINGS,
  DEFAULT_OVERHEAD_MONTHLY,
  DEFAULT_PRODUCTS,
  DEFAULT_PACKAGING_PROFILES,
  DEFAULT_ORDERS,
} from '@/data/defaults';

const KEYS = {
  laborRates: 'laborRates',
  processSteps: 'processSteps',
  packagingItems: 'packagingItems',
  riskSettings: 'riskSettings',
  overheadMonthly: 'overheadMonthly',
  products: 'products',
  packagingProfiles: 'packagingProfiles',
  orders: 'orders',
  calculations: 'calculations',
} as const;

function get<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    return JSON.parse(raw) as T;
  } catch {
    return defaults;
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLaborRates() {
  return get(KEYS.laborRates, DEFAULT_LABOR_RATES);
}

export function getProcessSteps() {
  return get(KEYS.processSteps, DEFAULT_PROCESS_STEPS);
}

export function getPackagingItems() {
  return get(KEYS.packagingItems, DEFAULT_PACKAGING_ITEMS);
}

export function getRiskSettings() {
  return get(KEYS.riskSettings, DEFAULT_RISK_SETTINGS);
}

export function getOverheadMonthly() {
  return get(KEYS.overheadMonthly, DEFAULT_OVERHEAD_MONTHLY);
}

export function getProducts() {
  return get(KEYS.products, DEFAULT_PRODUCTS);
}

export function getPackagingProfiles() {
  return get(KEYS.packagingProfiles, DEFAULT_PACKAGING_PROFILES);
}

export function getOrders() {
  return get(KEYS.orders, DEFAULT_ORDERS);
}

export function getCalculations() {
  return get<Array<{ id: number; order_no?: string; created_at: string; breakdown_json: string; total_cost_try: number }>>(
    KEYS.calculations,
    []
  );
}

export function saveCalculations(calculations: Parameters<typeof getCalculations>[0]) {
  set(KEYS.calculations, calculations);
}

export function saveLaborRates(value: ReturnType<typeof getLaborRates>) {
  set(KEYS.laborRates, value);
}

export function saveProcessSteps(value: ReturnType<typeof getProcessSteps>) {
  set(KEYS.processSteps, value);
}

export function savePackagingItems(value: ReturnType<typeof getPackagingItems>) {
  set(KEYS.packagingItems, value);
}

export function saveRiskSettings(value: ReturnType<typeof getRiskSettings>) {
  set(KEYS.riskSettings, value);
}

export function saveOverheadMonthly(value: ReturnType<typeof getOverheadMonthly>) {
  set(KEYS.overheadMonthly, value);
}

export { KEYS };
