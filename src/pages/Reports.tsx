import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function Reports() {
  const [calculations, setCalculations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/calculations').then(r => r.json()).then(setCalculations);
  }, []);

  const downloadCSV = () => {
    if (calculations.length === 0) return;

    const headers = [
      'Tarih',
      'Sipariş No',
      'Toplam Maliyet (TRY)',
      'İşçilik (TRY)',
      'Paketleme (TRY)',
      'Overhead (TRY)',
      'Risk (TRY)',
      'Komisyon (TRY)'
    ];

    const rows = calculations.map(calc => {
      const breakdown = JSON.parse(calc.breakdown_json);
      return [
        new Date(calc.created_at).toLocaleString('tr-TR'),
        calc.order_no || 'Manuel',
        calc.total_cost_try.toFixed(2),
        breakdown.labor.total.toFixed(2),
        breakdown.packaging.total.toFixed(2),
        breakdown.overhead.total.toFixed(2),
        breakdown.risk.total.toFixed(2),
        breakdown.optional.total.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'maliyet_raporu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Raporlar & Geçmiş</h1>
        <button 
          onClick={downloadCSV}
          className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" /> CSV İndir
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
            <tr>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4">Sipariş No</th>
              <th className="px-6 py-4 text-right">Toplam Maliyet</th>
              <th className="px-6 py-4 text-right">İşçilik</th>
              <th className="px-6 py-4 text-right">Paketleme</th>
              <th className="px-6 py-4 text-right">Overhead</th>
              <th className="px-6 py-4 text-right">Risk</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map(calc => {
              const breakdown = JSON.parse(calc.breakdown_json);
              return (
                <tr key={calc.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(calc.created_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {calc.order_no || <span className="text-zinc-400 italic">Manuel</span>}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    ₺{calc.total_cost_try.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-600">₺{breakdown.labor.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-zinc-600">₺{breakdown.packaging.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-zinc-600">₺{breakdown.overhead.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-zinc-600">₺{breakdown.risk.total.toFixed(2)}</td>
                </tr>
              );
            })}
            {calculations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                  Henüz hesaplama yapılmamış.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
