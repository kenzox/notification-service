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

# Template ve i18n doğrulama
npm run check:templates

# Production readiness test paketi
npm run test:prod
```

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

```
templates/
├── flight-ticket.hbs
├── flight-details.hbs
├── hotel-reservation.hbs
├── reservation-confirmation.hbs
├── package-reservation.hbs
├── transfer-reservation.hbs
├── welcome.hbs
├── password-reset.hbs
└── partials/

locales/
├── tr.json
├── en.json
├── ar.json
└── he.json
```

### Handlebars Helpers

| Helper | Kullanım | Açıklama |
|--------|----------|----------|
| `t` | `{{t "welcome.title"}}` | Çeviri anahtarından locale'e göre metin |
| `ifRTL` | `{{#ifRTL}}...{{else}}...{{/ifRTL}}` | RTL koşullu blok |
| `now` | `{{formatDate (now)}}` | Geçerli tarih üretir |
| `formatDate` | `{{formatDate tarih}}` | Locale'e göre tarih formatı |
| `formatCurrency` | `{{formatCurrency tutar para}}` | Locale'e göre para formatı |
| `ifEquals` | `{{#ifEquals a b}}...{{/ifEquals}}` | Eşitlik kontrolü |
| `add` | `{{add a b}}` | Sayısal toplama |
| `or` | `{{or a b "fallback"}}` | İlk dolu değeri döndürür |
| `concat` | `{{concat a "-" b}}` | String birleştirir |
| `safe` | `{{safe deger "alan"}}` | Eksik alanları loglar |

## Kalite Kontrolleri

| Komut | Amaç |
|-------|------|
| `npm run lint` | TypeScript lint kontrolü |
| `npm run build` | TypeScript derleme kontrolü |
| `npm run check:templates` | Template derleme + i18n key doğrulama |
| `npm run generate-previews` | Tüm template preview HTML üretimi |
| `npm run test:prod` | Lint + build + template check + preview (tek komut) |

## Docker

```bash
cd infrastructure
docker-compose up -d
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
