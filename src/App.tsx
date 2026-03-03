import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Package, Calculator, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Configuration from './pages/Configuration';
import Products from './pages/Products';
import CostCalculator from './pages/CostCalculator';
import Reports from './pages/Reports';

function Sidebar() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calculator', label: 'Maliyet Hesapla', icon: Calculator },
    { path: '/products', label: 'Ürünler', icon: Package },
    { path: '/config', label: 'Girdiler & Ayarlar', icon: Settings },
    { path: '/reports', label: 'Raporlar', icon: FileText },
  ];

  return (
    <div className="w-64 bg-zinc-900 text-zinc-300 min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold text-white mb-8 px-4">Mamul Kabul → Kargo</div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculator" element={<CostCalculator />} />
              <Route path="/products" element={<Products />} />
              <Route path="/config" element={<Configuration />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
