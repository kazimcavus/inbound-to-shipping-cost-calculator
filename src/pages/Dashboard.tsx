import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCalculations } from '@/utils/storage';

export default function Dashboard() {
  const [calculations, setCalculations] = useState<{ order_no?: string; total_cost_try: number }[]>([]);

  useEffect(() => {
    setCalculations(getCalculations());
  }, []);

  const totalOrders = calculations.length;
  const avgCost = totalOrders > 0 ? calculations.reduce((s, c) => s + c.total_cost_try, 0) / totalOrders : 0;

  const channelCosts = (() => {
    const byChannel: Record<string, { sum: number; count: number }> = {};
    calculations.forEach((c) => {
      const label = c.order_no ?? 'Manuel';
      if (!byChannel[label]) byChannel[label] = { sum: 0, count: 0 };
      byChannel[label].sum += c.total_cost_try;
      byChannel[label].count += 1;
    });
    return Object.entries(byChannel).map(([channel, { sum, count }]) => ({
      channel,
      avg_cost: sum / count,
    }));
  })();

  if (calculations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <div className="bg-zinc-100 border-2 border-dashed border-zinc-200 p-12 rounded-2xl text-center">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
          <p className="text-zinc-600 mb-2">Henüz hesaplama yapılmamış.</p>
          <p className="text-sm text-zinc-500 mb-6">Maliyet Hesapla sayfasından başlayın.</p>
          <Link
            to="/calculator"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Calculator className="w-5 h-5 mr-2" /> Maliyet Hesapla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Toplam Hesaplama</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">{totalOrders}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Ortalama Maliyet</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">₺{avgCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {channelCosts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mt-8">
          <h2 className="text-lg font-semibold mb-6">Kayıt Bazlı Ortalama Maliyet</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelCosts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="channel" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₺${value}`} />
                <Tooltip
                  cursor={{ fill: '#f4f4f5' }}
                  formatter={(value: number) => [`₺${value.toFixed(2)}`, 'Ort. Maliyet']}
                />
                <Bar dataKey="avg_cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
