import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="animate-pulse flex space-x-4">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">{data.totalOrders}</p>
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
              <p className="text-3xl font-bold text-zinc-900 mt-2">₺{data.avgCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mt-8">
        <h2 className="text-lg font-semibold mb-6">Kanal Bazlı Ortalama Maliyet</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.channelCosts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="channel" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₺${value}`} />
              <Tooltip cursor={{fill: '#f4f4f5'}} formatter={(value: number) => [`₺${value.toFixed(2)}`, 'Ort. Maliyet']} />
              <Bar dataKey="avg_cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
