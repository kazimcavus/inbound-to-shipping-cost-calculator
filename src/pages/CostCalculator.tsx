import { useEffect, useState } from 'react';
import { Calculator, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  getLaborRates,
  getProcessSteps,
  getPackagingItems,
  getRiskSettings,
  getOverheadMonthly,
  getOrders,
  getProducts,
  getPackagingProfiles,
  getCalculations,
  saveCalculations,
} from '@/utils/storage';

type StepInput = { name: string; minutes: number };
type PackagingInput = { itemId: number; qty: number };

function calculateCostClient(params: {
  steps: StepInput[];
  packaging: PackagingInput[];
  overheadMonth: string;
  paymentCommission: number;
  orderGross: number;
  laborRates: { hourly_cost_try: number }[];
  packagingItems: { id: number; unit_cost_try: number }[];
  riskSettings: { rework_rate_pct: number; damage_rate_pct: number };
  overheadMonthly: { month: string; rent_try: number; utilities_try: number; software_try: number; equipment_amort_try: number; other_try: number; order_count: number }[];
}) {
  const { steps, packaging, overheadMonth, paymentCommission, orderGross, laborRates, packagingItems, riskSettings, overheadMonthly } = params;

  const avgLaborRate = laborRates.length > 0
    ? laborRates.reduce((s, r) => s + r.hourly_cost_try, 0) / laborRates.length
    : 0;

  let laborCost = 0;
  const laborBreakdown = steps.map((step) => {
    const cost = (step.minutes / 60) * avgLaborRate;
    laborCost += cost;
    return { name: step.name, minutes: step.minutes, cost };
  });

  let packagingCost = 0;
  const packagingBreakdown = packaging.map((p) => {
    const item = packagingItems.find((pi) => pi.id === p.itemId);
    const cost = item ? p.qty * item.unit_cost_try : 0;
    packagingCost += cost;
    return { name: item?.name ?? '-', qty: p.qty, unit_cost: item?.unit_cost_try ?? 0, cost };
  });

  let overheadPerOrder = 0;
  let overheadBreakdown: Record<string, unknown> = {};
  if (overheadMonth) {
    const overhead = overheadMonthly.find((o) => o.month === overheadMonth);
    if (overhead && overhead.order_count > 0) {
      const total =
        overhead.rent_try +
        overhead.utilities_try +
        overhead.software_try +
        overhead.equipment_amort_try +
        overhead.other_try;
      overheadPerOrder = total / overhead.order_count;
      overheadBreakdown = { month: overhead.month, totalOverhead: total, orderCount: overhead.order_count, perOrder: overheadPerOrder };
    }
  }

  const reworkCost = (laborCost + packagingCost) * (riskSettings.rework_rate_pct / 100);
  const damageCost = (laborCost + packagingCost) * (riskSettings.damage_rate_pct / 100);
  const riskCost = reworkCost + damageCost;

  const optionalCost = (paymentCommission / 100) * orderGross;

  const totalCost = laborCost + packagingCost + overheadPerOrder + riskCost + optionalCost;

  return {
    totalCost,
    breakdown: {
      labor: { total: laborCost, details: laborBreakdown },
      packaging: { total: packagingCost, details: packagingBreakdown },
      overhead: { total: overheadPerOrder, details: overheadBreakdown },
      risk: { total: riskCost, reworkCost, damageCost },
      optional: { total: optionalCost, payment_commission_pct: paymentCommission, order_gross: orderGross },
    },
  };
}

export default function CostCalculator() {
  const [orders, setOrders] = useState<{ id: number; order_no: string; channel: string; items_json: string }[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const [processSteps, setProcessSteps] = useState<{ id: number; name: string; default_minutes: number }[]>([]);
  const [packagingItems, setPackagingItems] = useState<{ id: number; name: string; unit_cost_try: number }[]>([]);
  const [overheadMonths, setOverheadMonths] = useState<{ id: number; month: string }[]>([]);

  const [steps, setSteps] = useState<StepInput[]>([]);
  const [packaging, setPackaging] = useState<PackagingInput[]>([]);
  const [overheadMonth, setOverheadMonth] = useState<string>('');
  const [paymentCommission, setPaymentCommission] = useState<number>(0);
  const [orderGross, setOrderGross] = useState<number>(0);

  const [result, setResult] = useState<ReturnType<typeof calculateCostClient> | null>(null);

  const [laborRates, setLaborRates] = useState<{ hourly_cost_try: number }[]>([]);
  const [riskSettings, setRiskSettings] = useState<{ rework_rate_pct: number; damage_rate_pct: number }>({ rework_rate_pct: 0, damage_rate_pct: 0 });
  const [overheadMonthlyFull, setOverheadMonthlyFull] = useState<
    { month: string; rent_try: number; utilities_try: number; software_try: number; equipment_amort_try: number; other_try: number; order_count: number }[]
  >([]);

  useEffect(() => {
    const labor = getLaborRates();
    const stepsData = getProcessSteps();
    const pkg = getPackagingItems();
    const risk = getRiskSettings();
    const overhead = getOverheadMonthly();
    const ords = getOrders();

    setLaborRates(labor);
    setProcessSteps(stepsData);
    setSteps(stepsData.map((s) => ({ name: s.name, minutes: s.default_minutes })));
    setPackagingItems(pkg);
    setRiskSettings(risk);
    setOverheadMonthlyFull(overhead);
    setOverheadMonths(overhead.map((o) => ({ id: o.id, month: o.month })));
    if (overhead.length > 0 && !overheadMonth) setOverheadMonth(overhead[0].month);
    setOrders(ords);
  }, []);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;

    const order = orders.find((o) => o.id === Number(orderId));
    if (!order) return;

    const products = getProducts();
    const profiles = getPackagingProfiles();
    const items = JSON.parse(order.items_json) as { sku: string; qty: number }[];
    const newPackaging: PackagingInput[] = [];

    items.forEach((item) => {
      const product = products.find((p: { sku: string }) => p.sku === item.sku);
      if (product && (product as { default_packaging_profile_id?: number }).default_packaging_profile_id) {
        const profile = profiles.find((p: { id: number }) => p.id === (product as { default_packaging_profile_id: number }).default_packaging_profile_id);
        if (profile) {
          const profileItems = JSON.parse(profile.items_json) as { itemId: number; qty: number }[];
          profileItems.forEach((pi) => {
            const existing = newPackaging.find((np) => np.itemId === pi.itemId);
            if (existing) {
              existing.qty += pi.qty * item.qty;
            } else {
              newPackaging.push({ itemId: pi.itemId, qty: pi.qty * item.qty });
            }
          });
        }
      }
    });

    setPackaging(newPackaging);
  };

  const calculateCost = () => {
    try {
      const computed = calculateCostClient({
        steps,
        packaging,
        overheadMonth,
        paymentCommission,
        orderGross,
        laborRates,
        packagingItems,
        riskSettings,
        overheadMonthly: overheadMonthlyFull,
      });
      setResult(computed);

      const order = orders.find((o) => o.id === Number(selectedOrderId));
      const orderNo = order?.order_no ?? 'Manuel';

      const calcs = getCalculations();
      const newCalc = {
        id: Date.now(),
        order_no: orderNo,
        created_at: new Date().toISOString(),
        breakdown_json: JSON.stringify(computed.breakdown),
        total_cost_try: computed.totalCost,
      };
      saveCalculations([newCalc, ...calcs]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Hesaplama hatası');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Maliyet Hesapla</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4">Sipariş Seçimi</h2>
            <select
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-zinc-50"
              value={selectedOrderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
            >
              <option value="">-- Manuel Hesaplama --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_no} ({o.channel})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4">İşlem Süreleri (Dakika)</h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <span className="w-1/3 font-medium text-zinc-700">{step.name}</span>
                  <input
                    type="number"
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={step.minutes}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[idx].minutes = Number(e.target.value);
                      setSteps(newSteps);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Paket Malzemeleri</h2>
              <button
                onClick={() =>
                  setPackaging([
                    ...packaging,
                    { itemId: packagingItems[0]?.id ?? 0, qty: 1 },
                  ])
                }
                className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Ekle
              </button>
            </div>
            <div className="space-y-4">
              {packaging.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <select
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={item.itemId}
                    onChange={(e) => {
                      const newPkg = [...packaging];
                      newPkg[idx].itemId = Number(e.target.value);
                      setPackaging(newPkg);
                    }}
                  >
                    {packagingItems.map((pi) => (
                      <option key={pi.id} value={pi.id}>
                        {pi.name} (₺{pi.unit_cost_try})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-24 px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={item.qty}
                    min="1"
                    onChange={(e) => {
                      const newPkg = [...packaging];
                      newPkg[idx].qty = Number(e.target.value);
                      setPackaging(newPkg);
                    }}
                  />
                  <button
                    onClick={() => setPackaging(packaging.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {packaging.length === 0 && (
                <p className="text-sm text-zinc-500 italic">Malzeme eklenmedi.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4">Ek Maliyetler & Dağıtım</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Overhead Ayı</label>
                <select
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={overheadMonth}
                  onChange={(e) => setOverheadMonth(e.target.value)}
                >
                  <option value="">-- Seçiniz --</option>
                  {overheadMonths.map((om) => (
                    <option key={om.id} value={om.month}>
                      {om.month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Sipariş Tutarı (₺)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={orderGross}
                  onChange={(e) => setOrderGross(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">POS/Pazaryeri Kom. (%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={paymentCommission}
                  onChange={(e) => setPaymentCommission(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button
            onClick={calculateCost}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center"
          >
            <Calculator className="w-6 h-6 mr-2" /> Maliyeti Hesapla
          </button>
        </div>

        <div className="lg:col-span-1">
          {result ? (
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <h2 className="text-2xl font-bold">Sonuç</h2>
              </div>

              <div className="space-y-6">
                <div className="pb-6 border-b border-zinc-800">
                  <p className="text-zinc-400 text-sm mb-1">Toplam Sipariş Maliyeti</p>
                  <p className="text-4xl font-bold text-emerald-400">₺{result.totalCost.toFixed(2)}</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">İşçilik Maliyeti</span>
                    <span className="font-medium">₺{result.breakdown.labor.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Paketleme Maliyeti</span>
                    <span className="font-medium">₺{result.breakdown.packaging.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Overhead (Sabit Gider)</span>
                    <span className="font-medium">₺{result.breakdown.overhead.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Risk & Fire Payı</span>
                    <span className="font-medium">₺{result.breakdown.risk.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Komisyon & Ek</span>
                    <span className="font-medium">₺{result.breakdown.optional.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-100 border-2 border-dashed border-zinc-200 p-8 rounded-2xl text-center text-zinc-500 h-full flex flex-col items-center justify-center">
              <Calculator className="w-12 h-12 mb-4 text-zinc-300" />
              <p>Hesaplama yapmak için sol taraftaki formu doldurun ve &quot;Maliyeti Hesapla&quot; butonuna tıklayın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
