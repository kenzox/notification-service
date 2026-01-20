# Notification Service

Calibre Tour için bağımsız e-mail bildirim servisi.

## Özellikler

| Özellik | Teknoloji |
|---------|-----------|
| Framework | Express.js (Node.js) |
| E-mail | Nodemailer (SMTP) |
| Template | Handlebars |
| Validation | Zod |
| Logging | Pino |
| Dokümantasyon | Swagger/OpenAPI |
| Deployment | Docker |

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
```

## API Endpoints

Tüm e-mail endpointleri `Authorization: Bearer <API_KEY>` header'ı gerektirir.

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/email/reservation-confirmation` | Rezervasyon onayı |
| `POST /api/email/flight-ticket` | Uçak e-bileti |
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

## Template Yapısı

```
templates/
├── tr/
│   ├── reservation-confirmation.hbs
│   ├── flight-ticket.hbs
│   ├── hotel-reservation.hbs
│   ├── package-reservation.hbs
│   ├── transfer-reservation.hbs
│   ├── welcome.hbs
│   └── password-reset.hbs
└── en/
    └── (fallback templates)
```

### Handlebars Helpers

| Helper | Kullanım | Açıklama |
|--------|----------|----------|
| `formatDate` | `{{formatDate tarih}}` | Tarihi tr-TR formatında gösterir |
| `formatCurrency` | `{{formatCurrency tutar para_birimi}}` | Para birimini formatlar |
| `ifEquals` | `{{#ifEquals a b}}...{{/ifEquals}}` | Eşitlik kontrolü |
| `safe` | `{{safe deger "alan_adi"}}` | Eksik alanları loglar |

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
| 400 | Validation hatası |
| 401 | Yetkisiz (API Key eksik/hatalı) |
| 500 | Sunucu hatası |
