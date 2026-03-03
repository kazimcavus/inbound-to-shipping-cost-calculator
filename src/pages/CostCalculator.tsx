import { useEffect, useState } from 'react';
import { Calculator, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CostCalculator() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [packagingItems, setPackagingItems] = useState<any[]>([]);
  const [overheadMonths, setOverheadMonths] = useState<any[]>([]);
  
  const [steps, setSteps] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [overheadMonth, setOverheadMonth] = useState<string>('');
  const [paymentCommission, setPaymentCommission] = useState<number>(0);
  const [orderGross, setOrderGross] = useState<number>(0);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [laborRates, setLaborRates] = useState<any[]>([]);
  const [riskSettings, setRiskSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setOrders);
    fetch('/api/overhead_monthly').then(r => r.json()).then(data => {
      setOverheadMonths(data);
      if (data.length > 0) setOverheadMonth(data[0].month);
    });

    const loadSettings = async () => {
      const localLabor = localStorage.getItem('laborRates');
      const localSteps = localStorage.getItem('processSteps');
      const localPackaging = localStorage.getItem('packagingItems');
      const localRisk = localStorage.getItem('riskSettings');

      if (localLabor && localSteps && localPackaging && localRisk) {
        setLaborRates(JSON.parse(localLabor));
        const parsedSteps = JSON.parse(localSteps);
        setProcessSteps(parsedSteps);
        setSteps(parsedSteps.map((s: any) => ({ name: s.name, minutes: s.default_minutes })));
        setPackagingItems(JSON.parse(localPackaging));
        setRiskSettings(JSON.parse(localRisk));
      } else {
        const [laborRes, stepsRes, pkgRes, riskRes] = await Promise.all([
          fetch('/api/labor_rates'),
          fetch('/api/process_steps'),
          fetch('/api/packaging_items'),
          fetch('/api/risk_settings')
        ]);
        
        const labor = await laborRes.json();
        const stepsData = await stepsRes.json();
        const pkg = await pkgRes.json();
        const risk = await riskRes.json();

        setLaborRates(labor);
        setProcessSteps(stepsData);
        setSteps(stepsData.map((s: any) => ({ name: s.name, minutes: s.default_minutes })));
        setPackagingItems(pkg);
        setRiskSettings(risk);
      }
    };
    loadSettings();
  }, []);

  const handleOrderSelect = async (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;

    const order = orders.find(o => o.id === Number(orderId));
    if (!order) return;

    // Fetch products to get packaging profile
    const productsRes = await fetch('/api/products');
    const products = await productsRes.json();
    
    const profilesRes = await fetch('/api/packaging_profiles');
    const profiles = await profilesRes.json();

    const items = JSON.parse(order.items_json);
    let newPackaging: any[] = [];

    items.forEach((item: any) => {
      const product = products.find((p: any) => p.sku === item.sku);
      if (product && product.default_packaging_profile_id) {
        const profile = profiles.find((p: any) => p.id === product.default_packaging_profile_id);
        if (profile) {
          const profileItems = JSON.parse(profile.items_json);
          profileItems.forEach((pi: any) => {
            const existing = newPackaging.find(np => np.itemId === pi.itemId);
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

  const calculateCost = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderId ? Number(selectedOrderId) : null,
          steps,
          packaging,
          overhead_month: overheadMonth,
          payment_commission_pct: paymentCommission,
          order_gross: orderGross,
          laborRates,
          packagingItems,
          riskSettings
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Maliyet Hesapla</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Panel: Girdiler */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4">Sipariş Seçimi</h2>
            <select 
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-zinc-50"
              value={selectedOrderId}
              onChange={e => handleOrderSelect(e.target.value)}
            >
              <option value="">-- Manuel Hesaplama --</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>{o.order_no} ({o.channel})</option>
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
                    onChange={e => {
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
                onClick={() => setPackaging([...packaging, { itemId: packagingItems[0]?.id, qty: 1 }])}
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
                    onChange={e => {
                      const newPkg = [...packaging];
                      newPkg[idx].itemId = Number(e.target.value);
                      setPackaging(newPkg);
                    }}
                  >
                    {packagingItems.map(pi => (
                      <option key={pi.id} value={pi.id}>{pi.name} (₺{pi.unit_cost_try})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    className="w-24 px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={item.qty}
                    min="1"
                    onChange={e => {
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
              {packaging.length === 0 && <p className="text-sm text-zinc-500 italic">Malzeme eklenmedi.</p>}
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
                  onChange={e => setOverheadMonth(e.target.value)}
                >
                  <option value="">-- Seçiniz --</option>
                  {overheadMonths.map(om => (
                    <option key={om.id} value={om.month}>{om.month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Sipariş Tutarı (₺)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={orderGross}
                  onChange={e => setOrderGross(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">POS/Pazaryeri Kom. (%)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={paymentCommission}
                  onChange={e => setPaymentCommission(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={calculateCost}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? 'Hesaplanıyor...' : <><Calculator className="w-6 h-6 mr-2" /> Maliyeti Hesapla</>}
          </button>

        </div>

        {/* Sağ Panel: Sonuçlar */}
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
              <p>Hesaplama yapmak için sol taraftaki formu doldurun ve "Maliyeti Hesapla" butonuna tıklayın.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
