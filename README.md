# Grup7 Web Projesi - Halı Saha Rezervasyon Sistemi

Halı saha rezervasyonu yapabileceğiniz full-stack web uygulaması.

## Canlı Site

- **Frontend:** https://halisahamax-9d97d.web.app
- **Backend API:** https://grup7-api-404670274592.europe-west1.run.app

## Proje Yapısı

```
Grup7_WebProje/
├── src/
│   ├── backend/          # Node.js/Express API
│   │   └── api/
│   └── frontend/         # React uygulaması
│       └── src/
└── README.md
```

## Teknolojiler

### Backend
- **Node.js** + **Express**
- **MongoDB** (MongoDB Atlas)
- **JWT** Authentication
- **Docker** (Containerization)

### Frontend
- **React** 19
- **React Router**
- **Bootstrap** 5
- **Axios** (API Client)

### Deployment
- **Google Cloud Run** (Backend)
- **Firebase Hosting** (Frontend)
- **MongoDB Atlas** (Database)

## Lokal Geliştirme

### Backend

```bash
cd src/backend/api
npm install
npm run dev
```

Backend `http://localhost:5000` adresinde çalışacak.

### Frontend

```bash
cd src/frontend
npm install
npm start
```

Frontend `http://localhost:3000` adresinde çalışacak.

## Production Build

### Backend

```bash
cd src/backend/api
docker build -t grup7-api .
```

### Frontend

```bash
cd src/frontend
npm run build
```

Build dosyaları `build/` klasörüne oluşturulur.

## Deployment

### Backend (Cloud Run)

```bash
# Docker imajını build et
docker build -t europe-west1-docker.pkg.dev/halisahamax/grup7-api/backend:latest .

# Artifact Registry'ye push et
docker push europe-west1-docker.pkg.dev/halisahamax/grup7-api/backend:latest

# Cloud Run'a deploy et
gcloud run deploy grup7-api \
  --image europe-west1-docker.pkg.dev/halisahamax/grup7-api/backend:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "MONGO_URI=...,JWT_SECRET=...,NODE_ENV=production"
```

### Frontend (Firebase Hosting)

```bash
cd src/frontend
npm run build
firebase deploy --only hosting
```

## Ortam Değişkenleri

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
NODE_ENV=production
```

### Frontend

Build sırasında `REACT_APP_API_BASE_URL` ortam değişkeni kullanılabilir.

## Özellikler

- Kullanıcı kayıt/giriş sistemi
- Halı saha listeleme ve detay görüntüleme
- Rezervasyon yapma
- Admin paneli
- Saha ekleme/onaylama sistemi
- Rol bazlı yetkilendirme

## Geliştiriciler

Grup 7 - Web Projesi

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
