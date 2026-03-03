import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

export default function Configuration() {
  const [laborRates, setLaborRates] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [packagingItems, setPackagingItems] = useState<any[]>([]);
  const [riskSettings, setRiskSettings] = useState<any>({ rework_rate_pct: 0, damage_rate_pct: 0 });

  useEffect(() => {
    const loadData = async () => {
      const localLabor = localStorage.getItem('laborRates');
      const localSteps = localStorage.getItem('processSteps');
      const localPackaging = localStorage.getItem('packagingItems');
      const localRisk = localStorage.getItem('riskSettings');

      if (localLabor && localSteps && localPackaging && localRisk) {
        setLaborRates(JSON.parse(localLabor));
        setProcessSteps(JSON.parse(localSteps));
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
        const steps = await stepsRes.json();
        const pkg = await pkgRes.json();
        const risk = await riskRes.json();

        setLaborRates(labor);
        setProcessSteps(steps);
        setPackagingItems(pkg);
        setRiskSettings(risk);

        localStorage.setItem('laborRates', JSON.stringify(labor));
        localStorage.setItem('processSteps', JSON.stringify(steps));
        localStorage.setItem('packagingItems', JSON.stringify(pkg));
        localStorage.setItem('riskSettings', JSON.stringify(risk));
      }
    };
    loadData();
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('laborRates', JSON.stringify(laborRates));
    localStorage.setItem('processSteps', JSON.stringify(processSteps));
    localStorage.setItem('packagingItems', JSON.stringify(packagingItems));
    localStorage.setItem('riskSettings', JSON.stringify(riskSettings));
    alert('Tüm ayarlar tarayıcınıza (localStorage) kaydedildi.');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Girdiler & Ayarlar</h1>
        <button 
          onClick={saveToLocalStorage}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" /> Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* İşçilik Ücretleri */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold mb-4">İşçilik Ücretleri (Saatlik)</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Rol</th>
                <th className="px-4 py-3 rounded-tr-lg">Maliyet (₺)</th>
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
                      onChange={e => {
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
                        onChange={e => {
                          const newRates = [...laborRates];
                          newRates[idx].hourly_cost_try = Number(e.target.value);
                          setLaborRates(newRates);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Süre Varsayılanları */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold mb-4">Süre Varsayılanları (Adım)</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Adım</th>
                <th className="px-4 py-3 rounded-tr-lg">Varsayılan (Dk)</th>
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
                      onChange={e => {
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
                        onChange={e => {
                          const newSteps = [...processSteps];
                          newSteps[idx].default_minutes = Number(e.target.value);
                          setProcessSteps(newSteps);
                        }}
                      />
                      <span className="text-zinc-500">dk</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paket Malzemeleri */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold mb-4">Paket Malzemeleri</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Malzeme</th>
                <th className="px-4 py-3 rounded-tr-lg">Birim Fiyat (₺)</th>
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
                      onChange={e => {
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
                        onChange={e => {
                          const newItems = [...packagingItems];
                          newItems[idx].unit_cost_try = Number(e.target.value);
                          setPackagingItems(newItems);
                        }}
                      />
                    </div>
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
                onChange={e => setRiskSettings({...riskSettings, rework_rate_pct: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Hasar/Fire Oranı (%)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={riskSettings.damage_rate_pct}
                onChange={e => setRiskSettings({...riskSettings, damage_rate_pct: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
