# Notification Service

Calibre Tour için bağımsız, çok dilli e-mail bildirim servisi.

## Özellikler

| Özellik | Teknoloji |
|---------|-----------|
| Framework | Express.js (Node.js) |
| E-mail | Nodemailer (SMTP) |
| Template | Handlebars |
| i18n | 4 dil (tr, en, ar, he) + RTL |
| Validation | Zod |
| Logging | Pino |
| Rate Limiting | In-memory token bucket |
| Dokümantasyon | Swagger/OpenAPI |
| Deployment | Docker |

## Desteklenen Diller

| Dil | Kod | Yön |
|-----|-----|-----|
| Türkçe | `tr` | LTR |
| İngilizce | `en` | LTR |
| Arapça | `ar` | RTL |
| İbranice | `he` | RTL |

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur ve düzenle
cp .env.example .env

# Geliştirme modunda çalıştır
npm run dev

# Prodüksiyon build
npm run build
npm start

# (Opsiyonel) sık yapılan yazım hatası için alias
npm run sart

# Template ve i18n doğrulama
npm run check:templates

# Preview üretimi (varsayılan: tr,en,ar,he)
npm run generate-previews

# Toplu template gönderimi (varsayılan: dry-run, mail atmaz)
npm run send-all-templates

# Toplu template gönderimi (gerçek SMTP gönderimi)
SEND_LIVE=1 npm run send-all-templates

# Production readiness test paketi
npm run test:prod
```

`npm start` komutu derlenmiş çıktıdan çalışır. Bu yüzden önce `npm run build` çalıştırılmalıdır.

## API Endpoints

Tüm e-mail endpointleri `Authorization: Bearer <API_KEY>` header'ı gerektirir.

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/email/reservation-confirmation` | Rezervasyon onayı |
| `POST /api/email/flight-ticket` | Uçak e-bileti |
| `POST /api/email/flight-details` | Uçuş detayları |
| `POST /api/email/hotel-reservation` | Otel rezervasyonu |
| `POST /api/email/package-reservation` | Paket tur rezervasyonu |
| `POST /api/email/transfer-reservation` | Transfer rezervasyonu |
| `POST /api/email/welcome` | Hoş geldin e-postası |
| `POST /api/email/password-reset` | Şifre sıfırlama |
| `GET /health` | Health check (auth gereksiz) |

## Request Yapısı

```json
{
  "to": ["user@example.com"],
  "locale": "tr",
  "subject": "Opsiyonel başlık",
  "data": {
    "customerName": "Ahmet Yılmaz"
  },
  "meta": {
    "reply_to": "support@calibretour.com",
    "cc": ["manager@example.com"],
    "bcc": ["archive@example.com"]
  }
}
```

## Örnek Kullanım

### Türkçe (LTR)
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["user@example.com"],
    "locale": "tr",
    "data": {
      "customerName": "Ahmet Yılmaz"
    }
  }'
```

### English (LTR)
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["user@example.com"],
    "locale": "en",
    "data": {
      "customerName": "John Doe"
    }
  }'
```

### Arabic (RTL)
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["user@example.com"],
    "locale": "ar",
    "data": {
      "customerName": "أحمد محمد"
    }
  }'
```

### Hebrew (RTL)
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["user@example.com"],
    "locale": "he",
    "data": {
      "customerName": "דוד כהן"
    }
  }'
```

## Template Yapısı
Tüm şablonlar `templates/partials/` altındaki ortak bileşenleri (header, footer, styles, button) kullanır. Bu sayede tasarım bütünlüğü sağlanır.

Not:
- `package-reservation.hbs`, `hotel-reservation.hbs` ile aynı ana iskeleti kullanır.
- Paket şablonunda otel detaylarının üstünde ek olarak uçuş özeti ve (veri varsa) transfer özeti bulunur.
- Reservation template ailesinde başlık standardı korunur:
  - Kişiselleştirilmiş `greeting` başlığı (`Thanks/Teşekkürler ...`).
  - Başlık altında standart başarı paragrafı (`Your reservation has been successfully completed.` / locale karşılığı).
  - `reservation-confirmation` özet kartı arka planlı PNR benzeri görünüm kullanır.
- Ortak footer adresi: `🌐 www.calibretour.com` (`templates/partials/footer.hbs`).

```
templates/
├── assets/
│   └── logo.png
├── flight-ticket.hbs
├── flight-details.hbs
├── hotel-reservation.hbs
├── reservation-confirmation.hbs
├── package-reservation.hbs
├── transfer-reservation.hbs
├── welcome.hbs
├── password-reset.hbs
└── partials/
    ├── styles.hbs
    ├── header.hbs
    ├── footer.hbs
    ├── button.hbs
    └── payment-info.hbs

locales/
├── tr.json
├── en.json
├── ar.json
└── he.json
```

## Preview ve Toplu Gönderim Scriptleri

### Preview Üretimi
- Komut: `npm run generate-previews`
- Varsayılan locale seti: `tr,en,ar,he`
- Üretilen dosya formatı:
  - Locale bazlı: `templates/preview/<template>.<locale>.html`
  - Geriye uyumluluk: varsayılan locale için `templates/preview/<template>.html`
- Locale filtreleme:
  - `PREVIEW_LOCALES=tr,en npm run generate-previews`

### Tüm Template'leri Gönderme
- Komut: `npm run send-all-templates`
- Varsayılan davranış:
  - Tüm template anahtarlarını işler
  - Varsayılan locale: `en`
- Güvenli mod (default, mail göndermez):
  - `npm run send-all-templates`
- Gerçek SMTP gönderimi:
  - `SEND_LIVE=1 npm run send-all-templates`
- Zorunlu dry-run (SEND_LIVE açık olsa bile):
  - `SEND_LIVE=1 SEND_DRY_RUN=1 npm run send-all-templates`
- Locale/template filtreleme:
  - `SEND_LIVE=1 SEND_LOCALES=tr,en SEND_TEMPLATES=welcome,password-reset npm run send-all-templates`
- Hedef adres override:
  - `SEND_LIVE=1 TEST_TARGET_EMAIL=you@example.com npm run send-all-templates`

### Handlebars Helpers

| Helper | Kullanım | Açıklama |
|--------|----------|----------|
| `t` | `{{t "welcome.title"}}` | Çeviri anahtarından locale'e göre metin |
| `ifRTL` | `{{#ifRTL}}...{{else}}...{{/ifRTL}}` | RTL koşullu blok |
| `now` | `{{formatDate (now)}}` | Geçerli tarih üretir |
| `formatDate` | `{{formatDate tarih}}` | Locale'e göre tarih formatı |
| `formatCurrency` | `{{formatCurrency tutar para}}` | Locale'e göre para formatı |
| `ifEquals` | `{{#ifEquals a b}}...{{/ifEquals}}` | Eşitlik kontrolü |
| `equalsIgnoreCase` | `{{#if (equalsIgnoreCase a b)}}...{{/if}}` | Büyük/küçük harf duyarsız eşitlik |
| `add` | `{{add a b}}` | Sayısal toplama |
| `or` | `{{or a b "fallback"}}` | İlk dolu değeri döndürür |
| `firstValid` | `{{firstValid a b c}}` | Placeholder (`-`, `--`, `N/A`) olmayan ilk değeri döndürür |
| `concat` | `{{concat a "-" b}}` | String birleştirir |
| `guestPrefix` | `{{guestPrefix guest}}` | İsim başına `Mr/Mrs/Chd` prefix üretir |
| `safe` | `{{safe deger "alan"}}` | Eksik alanları loglar |

## Kalite Kontrolleri

| Komut | Amaç |
|-------|------|
| `npm run lint` | TypeScript lint kontrolü |
| `npm run build` | TypeScript derleme kontrolü |
| `npm run check:templates` | Template derleme + i18n key doğrulama |
| `npm run generate-previews` | Tüm template preview HTML üretimi |
| `npm run send-all-templates` | Tüm template'leri (locale kombinasyonlarıyla) test amaçlı gönderim |
| `npm run test:prod` | Lint + build + template check + preview (tek komut) |

## Docker

```bash
# İlk kurulum / yeniden build
cd infrastructure
docker compose up --build -d

# Servis durumunu kontrol et
docker compose ps

# Logları izle
docker compose logs -f notification-service

# Servisi durdur
docker compose down
```

## Swagger Dokümantasyonu

API dokümantasyonuna `/docs` adresinden erişebilirsiniz.

## Environment Variables

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `PORT` | Hayır | Sunucu portu (default: 3000) |
| `NODE_ENV` | Hayır | development/production |
| `API_KEY` | **Evet** | API anahtarı |
| `SMTP_HOST` | **Evet** | SMTP sunucu adresi |
| `SMTP_PORT` | Hayır | SMTP portu (default: 587) |
| `SMTP_USER` | **Evet** | SMTP kullanıcı adı |
| `SMTP_PASS` | **Evet** | SMTP şifresi |
| `SMTP_SECURE` | Hayır | TLS kullanımı (default: false) |
| `SMTP_FROM` | **Evet** | Gönderen e-posta adresi |
| `LOG_LEVEL` | Hayır | debug/info/warn/error |
| `PREVIEW_LOCALES` | Hayır | Preview locale listesi (örn: `tr,en`) |
| `SEND_LOCALES` | Hayır | Toplu gönderimde kullanılacak locale listesi (default: `en`) |
| `SEND_TEMPLATES` | Hayır | Toplu gönderimde kullanılacak template listesi (örn: `welcome,password-reset`) |
| `SEND_LIVE` | Hayır | `1/true` ise gerçek SMTP gönderimi yapar (default: kapalı) |
| `SEND_DRY_RUN` | Hayır | `1/true` ise mail göndermez, sadece render kontrolü yapar |
| `TEST_TARGET_EMAIL` | Hayır | Toplu gönderim hedef e-posta adresi override |

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 400 | Validation hatası (geçersiz locale dahil) |
| 401 | Yetkisiz (API Key eksik/hatalı) |
| 429 | Rate limit aşıldı (30 req/min) |
| 500 | Sunucu hatası |

## Response Headers

| Header | Açıklama |
|--------|----------|
| `X-Request-Id` | İstek takip ID'si |
| `X-RateLimit-Limit` | Maksimum istek sayısı |
| `X-RateLimit-Remaining` | Kalan istek sayısı |
| `X-RateLimit-Reset` | Reset zamanı (Unix timestamp) |
