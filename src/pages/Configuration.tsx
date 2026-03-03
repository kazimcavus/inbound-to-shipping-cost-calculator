import { useEffect, useState } from 'react';
import { Save, Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  getLaborRates,
  getProcessSteps,
  getPackagingItems,
  getRiskSettings,
  getOverheadMonthly,
  saveLaborRates,
  saveProcessSteps,
  savePackagingItems,
  saveRiskSettings,
  saveOverheadMonthly,
} from '@/utils/storage';
import {
  DEFAULT_LABOR_RATES,
  DEFAULT_PROCESS_STEPS,
  DEFAULT_PACKAGING_ITEMS,
  DEFAULT_RISK_SETTINGS,
  DEFAULT_OVERHEAD_MONTHLY,
} from '@/data/defaults';

type LaborRate = { id: number; name: string; hourly_cost_try: number };
type ProcessStep = { id: number; name: string; default_minutes: number };
type PackagingItem = { id: number; name: string; unit_cost_try: number };
type OverheadRow = {
  id: number;
  month: string;
  rent_try: number;
  utilities_try: number;
  software_try: number;
  equipment_amort_try: number;
  other_try: number;
  order_count: number;
};

export default function Configuration() {
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);
  const [overheadMonthly, setOverheadMonthly] = useState<OverheadRow[]>([]);
  const [riskSettings, setRiskSettings] = useState(DEFAULT_RISK_SETTINGS);

  useEffect(() => {
    setLaborRates(getLaborRates());
    setProcessSteps(getProcessSteps());
    setPackagingItems(getPackagingItems());
    setOverheadMonthly(getOverheadMonthly());
    setRiskSettings(getRiskSettings());
  }, []);

  const saveToLocalStorage = () => {
    saveLaborRates(laborRates);
    saveProcessSteps(processSteps);
    savePackagingItems(packagingItems);
    saveOverheadMonthly(overheadMonthly);
    saveRiskSettings(riskSettings);
    alert('Tüm ayarlar tarayıcınıza (localStorage) kaydedildi.');
  };

  const loadDefaults = () => {
    setLaborRates([...DEFAULT_LABOR_RATES]);
    setProcessSteps([...DEFAULT_PROCESS_STEPS]);
    setPackagingItems([...DEFAULT_PACKAGING_ITEMS]);
    setOverheadMonthly([...DEFAULT_OVERHEAD_MONTHLY]);
    setRiskSettings({ ...DEFAULT_RISK_SETTINGS });
  };

  const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map((x) => x.id)) + 1;

  const addLabor = () => setLaborRates([...laborRates, { id: nextId(laborRates), name: '', hourly_cost_try: 0 }]);
  const removeLabor = (idx: number) => setLaborRates(laborRates.filter((_, i) => i !== idx));

  const addStep = () => setProcessSteps([...processSteps, { id: nextId(processSteps), name: '', default_minutes: 0 }]);
  const removeStep = (idx: number) => setProcessSteps(processSteps.filter((_, i) => i !== idx));

  const addPackaging = () =>
    setPackagingItems([...packagingItems, { id: nextId(packagingItems), name: '', unit_cost_try: 0 }]);
  const removePackaging = (idx: number) => setPackagingItems(packagingItems.filter((_, i) => i !== idx));

  const addOverhead = () =>
    setOverheadMonthly([
      ...overheadMonthly,
      {
        id: nextId(overheadMonthly),
        month: new Date().toISOString().slice(0, 7),
        rent_try: 0,
        utilities_try: 0,
        software_try: 0,
        equipment_amort_try: 0,
        other_try: 0,
        order_count: 1,
      },
    ]);
  const removeOverhead = (idx: number) => setOverheadMonthly(overheadMonthly.filter((_, i) => i !== idx));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Girdiler & Ayarlar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDefaults}
            className="flex items-center px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Varsayılanları Yükle
          </button>
          <button
            onClick={saveToLocalStorage}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" /> Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* İşçilik Ücretleri */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">İşçilik Ücretleri (Saatlik)</h2>
            <button
              onClick={addLabor}
              className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Ekle
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Rol</th>
                <th className="px-4 py-3 rounded-tr-lg">Maliyet (₺)</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {laborRates.map((rate, idx) => (
                <tr key={rate.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3 font-medium">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1"
                      value={rate.name}
                      onChange={(e) => {
                        const newRates = [...laborRates];
                        newRates[idx].name = e.target.value;
                        setLaborRates(newRates);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="mr-1">₺</span>
                      <input
                        type="number"
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1"
                        value={rate.hourly_cost_try}
                        onChange={(e) => {
                          const newRates = [...laborRates];
                          newRates[idx].hourly_cost_try = Number(e.target.value);
                          setLaborRates(newRates);
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <button onClick={() => removeLabor(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Süre Varsayılanları */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Süre Varsayılanları (Adım)</h2>
            <button
              onClick={addStep}
              className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Ekle
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Adım</th>
                <th className="px-4 py-3 rounded-tr-lg">Varsayılan (Dk)</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {processSteps.map((step, idx) => (
                <tr key={step.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3 font-medium">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1"
                      value={step.name}
                      onChange={(e) => {
                        const newSteps = [...processSteps];
                        newSteps[idx].name = e.target.value;
                        setProcessSteps(newSteps);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="w-16 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1 text-right mr-1"
                        value={step.default_minutes}
                        onChange={(e) => {
                          const newSteps = [...processSteps];
                          newSteps[idx].default_minutes = Number(e.target.value);
                          setProcessSteps(newSteps);
                        }}
                      />
                      <span className="text-zinc-500">dk</span>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => removeStep(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paket Malzemeleri */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Paket Malzemeleri</h2>
            <button
              onClick={addPackaging}
              className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Ekle
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Malzeme</th>
                <th className="px-4 py-3 rounded-tr-lg">Birim Fiyat (₺)</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {packagingItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3 font-medium">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...packagingItems];
                        newItems[idx].name = e.target.value;
                        setPackagingItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="mr-1">₺</span>
                      <input
                        type="number"
                        className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none px-1"
                        value={item.unit_cost_try}
                        onChange={(e) => {
                          const newItems = [...packagingItems];
                          newItems[idx].unit_cost_try = Number(e.target.value);
                          setPackagingItems(newItems);
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <button onClick={() => removePackaging(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Ayarları */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold mb-4">Risk & Fire Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Yeniden İşleme (Rework) Oranı (%)</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={riskSettings.rework_rate_pct}
                onChange={(e) => setRiskSettings({ ...riskSettings, rework_rate_pct: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Hasar/Fire Oranı (%)</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={riskSettings.damage_rate_pct}
                onChange={(e) => setRiskSettings({ ...riskSettings, damage_rate_pct: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Overhead Ayı - full width */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Overhead Ayı (Aylık Sabit Gider Dağıtımı)</h2>
            <button
              onClick={addOverhead}
              className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Ay Ekle
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
                <tr>
                  <th className="px-3 py-3">Ay</th>
                  <th className="px-3 py-3">Kira (₺)</th>
                  <th className="px-3 py-3">Elektrik (₺)</th>
                  <th className="px-3 py-3">Yazılım (₺)</th>
                  <th className="px-3 py-3">Ekipman (₺)</th>
                  <th className="px-3 py-3">Diğer (₺)</th>
                  <th className="px-3 py-3">Sipariş Adedi</th>
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {overheadMonthly.map((row, idx) => (
                  <tr key={row.id} className="border-b border-zinc-50">
                    <td className="px-3 py-2">
                      <input
                        type="month"
                        className="w-32 px-2 py-1.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={row.month}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].month = e.target.value;
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.rent_try}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].rent_try = Number(e.target.value);
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.utilities_try}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].utilities_try = Number(e.target.value);
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.software_try}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].software_try = Number(e.target.value);
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.equipment_amort_try}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].equipment_amort_try = Number(e.target.value);
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.other_try}
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].other_try = Number(e.target.value);
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-24 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm"
                        value={row.order_count}
                        min="1"
                        onChange={(e) => {
                          const arr = [...overheadMonthly];
                          arr[idx].order_count = Math.max(1, Number(e.target.value));
                          setOverheadMonthly(arr);
                        }}
                      />
                    </td>
                    <td>
                      <button onClick={() => removeOverhead(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
