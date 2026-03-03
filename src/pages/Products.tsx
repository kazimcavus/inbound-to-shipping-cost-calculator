import { useEffect, useState } from 'react';
import { getProducts, getPackagingProfiles } from '@/utils/storage';

export default function Products() {
  const [products, setProducts] = useState<{ id: number; sku: string; name: string; category: string; default_packaging_profile_id: number }[]>([]);
  const [profiles, setProfiles] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setProducts(getProducts());
    setProfiles(getPackagingProfiles());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Ürünler & Paket Profilleri</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
            <tr>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Ürün Adı</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Varsayılan Paket Profili</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const profile = profiles.find((p) => p.id === product.default_packaging_profile_id);
              return (
                <tr key={product.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-600">{product.sku}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{profile ? profile.name : '-'}</td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  Henüz ürün eklenmemiş. Girdiler & Ayarlar sayfasından varsayılanları yükleyebilirsiniz.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
