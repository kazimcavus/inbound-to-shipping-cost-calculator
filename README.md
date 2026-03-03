# Mamul Kabul → Kargoya Teslim Maliyet Hesaplama

Bu proje, bir ürünün mamul kabule girmesinden kargoya teslim edilmesine kadar geçen süreçteki tüm maliyetleri (işçilik, paketleme, overhead, risk ve komisyonlar) sipariş bazında hesaplayan bir web uygulamasıdır.

## Özellikler

- **Dashboard**: Toplam sipariş sayısı, ortalama maliyet ve kanal bazlı maliyet analizleri.
- **Maliyet Hesaplama**: Sipariş bazlı veya manuel olarak işçilik, paketleme, overhead, risk ve komisyon maliyetlerini hesaplama.
- **Girdiler & Ayarlar**: İşçilik ücretleri, işlem süreleri, paket malzemeleri ve risk ayarlarını yapılandırma.
- **Ürünler**: Ürünleri ve varsayılan paket profillerini görüntüleme.
- **Raporlar**: Geçmiş hesaplamaları görüntüleme ve CSV olarak dışa aktarma.

## Teknoloji Yığını

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide React, React Router
- **Backend**: Node.js, Express
- **Veritabanı**: SQLite (better-sqlite3)

## Kurulum ve Çalıştırma

Proje, tek bir komutla hem frontend hem de backend'i çalıştıracak şekilde yapılandırılmıştır.

1. Bağımlılıkları yükleyin:
   \`\`\`bash
   npm install
   \`\`\`

2. Geliştirme sunucusunu başlatın:
   \`\`\`bash
   npm run dev
   \`\`\`

Uygulama varsayılan olarak \`http://localhost:3000\` adresinde çalışacaktır.

## Veritabanı ve Seed Data

Uygulama ilk çalıştığında \`app.db\` adında bir SQLite veritabanı dosyası oluşturur ve içerisine örnek veriler (seed data) ekler. Bu veriler arasında örnek işçilik ücretleri, işlem adımları, paket malzemeleri, ürünler ve bir örnek sipariş bulunmaktadır.

## Proje Yapısı

- \`/server.ts\`: Express backend sunucusu ve SQLite veritabanı işlemleri.
- \`/src/App.tsx\`: React uygulaması ana bileşeni ve yönlendirme (routing).
- \`/src/pages/\`: Uygulamanın sayfaları (Dashboard, Configuration, Products, CostCalculator, Reports).
- \`/src/index.css\`: Tailwind CSS yapılandırması.
