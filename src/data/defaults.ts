export const DEFAULT_LABOR_RATES = [
  { id: 1, name: 'Depo Personeli', hourly_cost_try: 150 },
  { id: 2, name: 'Kalite Kontrol Uzmanı', hourly_cost_try: 200 },
];

export const DEFAULT_PROCESS_STEPS = [
  { id: 1, name: 'Picking (Toplama)', default_minutes: 3 },
  { id: 2, name: 'Kalite Kontrol', default_minutes: 2 },
  { id: 3, name: 'Paketleme', default_minutes: 4 },
  { id: 4, name: 'Çıkış/Teslim Hazırlığı', default_minutes: 1 },
];

export const DEFAULT_PACKAGING_ITEMS = [
  { id: 1, name: 'Koli (Orta)', unit_cost_try: 15 },
  { id: 2, name: 'Kargo Poşeti', unit_cost_try: 3 },
  { id: 3, name: 'Dolgu Malzemesi', unit_cost_try: 5 },
  { id: 4, name: 'Bant', unit_cost_try: 1 },
  { id: 5, name: 'Etiket', unit_cost_try: 0.5 },
];

export const DEFAULT_PACKAGING_PROFILES = [
  {
    id: 1,
    name: 'Standart Koli Profili',
    items_json: JSON.stringify([
      { itemId: 1, qty: 1 },
      { itemId: 3, qty: 1 },
      { itemId: 4, qty: 2 },
      { itemId: 5, qty: 1 },
    ]),
  },
  {
    id: 2,
    name: 'Poşet Profili',
    items_json: JSON.stringify([
      { itemId: 2, qty: 1 },
      { itemId: 5, qty: 1 },
    ]),
  },
];

export const DEFAULT_PRODUCTS = [
  { id: 1, sku: 'SKU-001', name: 'Tişört', category: 'Giyim', default_packaging_profile_id: 2 },
  { id: 2, sku: 'SKU-002', name: 'Kahve Makinesi', category: 'Elektronik', default_packaging_profile_id: 1 },
];

export const DEFAULT_OVERHEAD_MONTHLY = [
  {
    id: 1,
    month: '2023-10',
    rent_try: 50000,
    utilities_try: 10000,
    software_try: 5000,
    equipment_amort_try: 8000,
    other_try: 2000,
    order_count: 5000,
  },
];

export const DEFAULT_RISK_SETTINGS = {
  rework_rate_pct: 2,
  damage_rate_pct: 1,
};

export const DEFAULT_ORDERS = [
  {
    id: 1,
    order_no: 'ORD-1001',
    created_at: new Date().toISOString(),
    channel: 'Trendyol',
    payment_method: 'Kredi Kartı',
    items_json: JSON.stringify([{ sku: 'SKU-001', qty: 2 }]),
  },
];
