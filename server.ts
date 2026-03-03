import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database("app.db");
db.pragma("journal_mode = WAL");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    name TEXT,
    category TEXT,
    default_packaging_profile_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    channel TEXT,
    payment_method TEXT,
    items_json TEXT
  );

  CREATE TABLE IF NOT EXISTS labor_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    hourly_cost_try REAL
  );

  CREATE TABLE IF NOT EXISTS process_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    default_minutes REAL
  );

  CREATE TABLE IF NOT EXISTS packaging_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    unit_cost_try REAL
  );

  CREATE TABLE IF NOT EXISTS packaging_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    items_json TEXT
  );

  CREATE TABLE IF NOT EXISTS overhead_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT UNIQUE,
    rent_try REAL,
    utilities_try REAL,
    software_try REAL,
    equipment_amort_try REAL,
    other_try REAL,
    order_count INTEGER
  );

  CREATE TABLE IF NOT EXISTS risk_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rework_rate_pct REAL,
    damage_rate_pct REAL
  );

  CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    breakdown_json TEXT,
    total_cost_try REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Initial Data
const seedData = () => {
  const laborCount = db.prepare("SELECT COUNT(*) as count FROM labor_rates").get() as { count: number };
  if (laborCount.count === 0) {
    db.prepare("INSERT INTO labor_rates (name, hourly_cost_try) VALUES (?, ?)").run("Depo Personeli", 150);
    db.prepare("INSERT INTO labor_rates (name, hourly_cost_try) VALUES (?, ?)").run("Kalite Kontrol Uzmanı", 200);
    
    db.prepare("INSERT INTO process_steps (name, default_minutes) VALUES (?, ?)").run("Picking (Toplama)", 3);
    db.prepare("INSERT INTO process_steps (name, default_minutes) VALUES (?, ?)").run("Kalite Kontrol", 2);
    db.prepare("INSERT INTO process_steps (name, default_minutes) VALUES (?, ?)").run("Paketleme", 4);
    db.prepare("INSERT INTO process_steps (name, default_minutes) VALUES (?, ?)").run("Çıkış/Teslim Hazırlığı", 1);

    db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run("Koli (Orta)", 15);
    db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run("Kargo Poşeti", 3);
    db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run("Dolgu Malzemesi", 5);
    db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run("Bant", 1);
    db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run("Etiket", 0.5);

    db.prepare("INSERT INTO packaging_profiles (name, items_json) VALUES (?, ?)").run(
      "Standart Koli Profili",
      JSON.stringify([{ itemId: 1, qty: 1 }, { itemId: 3, qty: 1 }, { itemId: 4, qty: 2 }, { itemId: 5, qty: 1 }])
    );
    db.prepare("INSERT INTO packaging_profiles (name, items_json) VALUES (?, ?)").run(
      "Poşet Profili",
      JSON.stringify([{ itemId: 2, qty: 1 }, { itemId: 5, qty: 1 }])
    );

    db.prepare("INSERT INTO products (sku, name, category, default_packaging_profile_id) VALUES (?, ?, ?, ?)").run("SKU-001", "Tişört", "Giyim", 2);
    db.prepare("INSERT INTO products (sku, name, category, default_packaging_profile_id) VALUES (?, ?, ?, ?)").run("SKU-002", "Kahve Makinesi", "Elektronik", 1);

    db.prepare("INSERT INTO overhead_monthly (month, rent_try, utilities_try, software_try, equipment_amort_try, other_try, order_count) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      "2023-10", 50000, 10000, 5000, 8000, 2000, 5000
    );

    db.prepare("INSERT INTO risk_settings (rework_rate_pct, damage_rate_pct) VALUES (?, ?)").run(2, 1);

    db.prepare("INSERT INTO orders (order_no, channel, payment_method, items_json) VALUES (?, ?, ?, ?)").run(
      "ORD-1001", "Trendyol", "Kredi Kartı", JSON.stringify([{ sku: "SKU-001", qty: 2 }])
    );
  }
};
seedData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard", (req, res) => {
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
    const avgCost = db.prepare("SELECT AVG(total_cost_try) as avg FROM calculations").get() as { avg: number };
    const channelCosts = db.prepare(`
      SELECT o.channel, AVG(c.total_cost_try) as avg_cost
      FROM calculations c
      JOIN orders o ON c.order_id = o.id
      GROUP BY o.channel
    `).all();
    
    res.json({
      totalOrders: totalOrders.count,
      avgCost: avgCost.avg || 0,
      channelCosts
    });
  });

  app.get("/api/labor_rates", (req, res) => res.json(db.prepare("SELECT * FROM labor_rates").all()));
  app.post("/api/labor_rates", (req, res) => {
    const { name, hourly_cost_try } = req.body;
    const info = db.prepare("INSERT INTO labor_rates (name, hourly_cost_try) VALUES (?, ?)").run(name, hourly_cost_try);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/process_steps", (req, res) => res.json(db.prepare("SELECT * FROM process_steps").all()));
  app.post("/api/process_steps", (req, res) => {
    const { name, default_minutes } = req.body;
    const info = db.prepare("INSERT INTO process_steps (name, default_minutes) VALUES (?, ?)").run(name, default_minutes);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/packaging_items", (req, res) => res.json(db.prepare("SELECT * FROM packaging_items").all()));
  app.post("/api/packaging_items", (req, res) => {
    const { name, unit_cost_try } = req.body;
    const info = db.prepare("INSERT INTO packaging_items (name, unit_cost_try) VALUES (?, ?)").run(name, unit_cost_try);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/packaging_profiles", (req, res) => res.json(db.prepare("SELECT * FROM packaging_profiles").all()));
  app.post("/api/packaging_profiles", (req, res) => {
    const { name, items_json } = req.body;
    const info = db.prepare("INSERT INTO packaging_profiles (name, items_json) VALUES (?, ?)").run(name, JSON.stringify(items_json));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/products", (req, res) => res.json(db.prepare("SELECT * FROM products").all()));
  app.post("/api/products", (req, res) => {
    const { sku, name, category, default_packaging_profile_id } = req.body;
    const info = db.prepare("INSERT INTO products (sku, name, category, default_packaging_profile_id) VALUES (?, ?, ?, ?)").run(sku, name, category, default_packaging_profile_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/orders", (req, res) => res.json(db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all()));
  app.post("/api/orders", (req, res) => {
    const { order_no, channel, payment_method, items_json } = req.body;
    const info = db.prepare("INSERT INTO orders (order_no, channel, payment_method, items_json) VALUES (?, ?, ?, ?)").run(order_no, channel, payment_method, JSON.stringify(items_json));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/overhead_monthly", (req, res) => res.json(db.prepare("SELECT * FROM overhead_monthly ORDER BY month DESC").all()));
  app.post("/api/overhead_monthly", (req, res) => {
    const { month, rent_try, utilities_try, software_try, equipment_amort_try, other_try, order_count } = req.body;
    const info = db.prepare("INSERT INTO overhead_monthly (month, rent_try, utilities_try, software_try, equipment_amort_try, other_try, order_count) VALUES (?, ?, ?, ?, ?, ?, ?)").run(month, rent_try, utilities_try, software_try, equipment_amort_try, other_try, order_count);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/risk_settings", (req, res) => res.json(db.prepare("SELECT * FROM risk_settings LIMIT 1").get() || { rework_rate_pct: 0, damage_rate_pct: 0 }));
  app.post("/api/risk_settings", (req, res) => {
    const { rework_rate_pct, damage_rate_pct } = req.body;
    db.prepare("DELETE FROM risk_settings").run();
    db.prepare("INSERT INTO risk_settings (rework_rate_pct, damage_rate_pct) VALUES (?, ?)").run(rework_rate_pct, damage_rate_pct);
    res.json({ success: true });
  });

  app.get("/api/calculations", (req, res) => {
    const calculations = db.prepare(`
      SELECT c.*, o.order_no 
      FROM calculations c 
      JOIN orders o ON c.order_id = o.id 
      ORDER BY c.created_at DESC
    `).all();
    res.json(calculations);
  });

  app.post("/api/calculate", (req, res) => {
    const { order_id, steps, packaging, overhead_month, payment_commission_pct, order_gross } = req.body;
    
    try {
      // Labor Cost
      let laborCost = 0;
      const laborBreakdown: any[] = [];
      const laborRates = req.body.laborRates || db.prepare("SELECT * FROM labor_rates").all() as any[];
      // Assume average labor rate for simplicity if not specified per step
      const avgLaborRate = laborRates.reduce((sum: any, r: any) => sum + r.hourly_cost_try, 0) / (laborRates.length || 1);
      
      for (const step of steps) {
        const cost = (step.minutes / 60) * avgLaborRate;
        laborCost += cost;
        laborBreakdown.push({ name: step.name, minutes: step.minutes, cost });
      }

      // Packaging Cost
      let packagingCost = 0;
      const packagingBreakdown: any[] = [];
      const packagingItems = req.body.packagingItems || db.prepare("SELECT * FROM packaging_items").all() as any[];
      
      for (const item of packaging) {
        const dbItem = packagingItems.find((p: any) => p.id === item.itemId);
        if (dbItem) {
          const cost = item.qty * dbItem.unit_cost_try;
          packagingCost += cost;
          packagingBreakdown.push({ name: dbItem.name, qty: item.qty, unit_cost: dbItem.unit_cost_try, cost });
        }
      }

      // Overhead Cost
      let overheadPerOrder = 0;
      let overheadBreakdown = {};
      if (overhead_month) {
        const overhead = db.prepare("SELECT * FROM overhead_monthly WHERE month = ?").get(overhead_month) as any;
        if (overhead && overhead.order_count > 0) {
          const totalOverhead = overhead.rent_try + overhead.utilities_try + overhead.software_try + overhead.equipment_amort_try + overhead.other_try;
          overheadPerOrder = totalOverhead / overhead.order_count;
          overheadBreakdown = { month: overhead.month, totalOverhead, orderCount: overhead.order_count, perOrder: overheadPerOrder };
        }
      }

      // Risk Cost
      const riskSettings = req.body.riskSettings || db.prepare("SELECT * FROM risk_settings LIMIT 1").get() as any || { rework_rate_pct: 0, damage_rate_pct: 0 };
      const reworkCost = (laborCost + packagingCost) * (riskSettings.rework_rate_pct / 100);
      const damageCost = (laborCost + packagingCost) * (riskSettings.damage_rate_pct / 100);
      const riskCost = reworkCost + damageCost;

      // Optional Cost
      const optionalCost = (payment_commission_pct || 0) / 100 * (order_gross || 0);

      const totalCost = laborCost + packagingCost + overheadPerOrder + riskCost + optionalCost;

      const breakdown = {
        labor: { total: laborCost, details: laborBreakdown },
        packaging: { total: packagingCost, details: packagingBreakdown },
        overhead: { total: overheadPerOrder, details: overheadBreakdown },
        risk: { total: riskCost, reworkCost, damageCost },
        optional: { total: optionalCost, payment_commission_pct, order_gross }
      };

      const info = db.prepare("INSERT INTO calculations (order_id, breakdown_json, total_cost_try) VALUES (?, ?, ?)").run(
        order_id, JSON.stringify(breakdown), totalCost
      );

      res.json({ id: info.lastInsertRowid, totalCost, breakdown });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/recommendations", (req, res) => {
    const calculations = db.prepare("SELECT breakdown_json FROM calculations ORDER BY created_at DESC LIMIT 30").all() as any[];
    
    if (calculations.length === 0) {
      return res.json({ message: "Not enough data" });
    }

    let totalMinutes = 0;
    let stepCounts: Record<string, { count: number, totalMins: number }> = {};
    
    calculations.forEach(calc => {
      const breakdown = JSON.parse(calc.breakdown_json);
      breakdown.labor.details.forEach((step: any) => {
        if (!stepCounts[step.name]) stepCounts[step.name] = { count: 0, totalMins: 0 };
        stepCounts[step.name].count++;
        stepCounts[step.name].totalMins += step.minutes;
      });
    });

    const avgSteps = Object.keys(stepCounts).map(name => ({
      name,
      avgMinutes: stepCounts[name].totalMins / stepCounts[name].count
    }));

    res.json({ avgSteps });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
