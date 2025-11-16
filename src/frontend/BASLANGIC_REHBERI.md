# Frontend Başlangıç Rehberi

## 🎉 Hoş Geldiniz!

Frontend için temel altyapı hazırlandı. Bu rehber size nereden başlayacağınızı gösterecek.

## ✅ Yapılanlar

### 1. **API Servis Katmanı** (`src/services/api.js`)
- Backend API'ye bağlanmak için axios instance oluşturuldu
- Tüm API endpoint'leri için hazır fonksiyonlar eklendi:
  - `authAPI`: Giriş ve kayıt işlemleri
  - `fieldsAPI`: Saha işlemleri
  - `reservationsAPI`: Rezervasyon işlemleri
  - `rolesAPI`: Rol işlemleri
- Token otomatik olarak header'a ekleniyor
- 401 hatası durumunda otomatik logout

### 2. **Authentication Context** (`src/context/AuthContext.js`)
- Kullanıcı giriş durumunu yönetir
- Token ve kullanıcı bilgilerini localStorage'da saklar
- `useAuth()` hook'u ile tüm sayfalarda kullanılabilir

### 3. **Protected Route** (`src/components/ProtectedRoute.js`)
- Giriş yapmamış kullanıcıları korur
- `/panel` ve `/admin` sayfaları için kullanılıyor

### 4. **Giriş ve Kayıt Sayfaları**
- ✅ `GirisYap.js` - Tam fonksiyonel giriş sayfası
- ✅ `KayitOl.js` - Tam fonksiyonel kayıt sayfası (rolleri backend'den çekiyor)

### 5. **Navbar Güncellemesi**
- Giriş yapmış kullanıcılar için kullanıcı adı ve çıkış butonu gösteriliyor
- Giriş yapmamış kullanıcılar için giriş/kayıt linkleri gösteriliyor

## 🚀 Nasıl Başlarım?

### Adım 1: Backend'i Çalıştırın
```bash
cd src/backend/api
npm install  # Eğer daha önce yapmadıysanız
npm start    # Backend port 3000'de çalışacak
```

### Adım 2: Frontend'i Çalıştırın
```bash
cd src/frontend
npm install  # Eğer daha önce yapmadıysanız
npm start    # Frontend port 3001'de çalışacak (3000 backend için kullanılıyor)
```

### Adım 3: Tarayıcıda Açın
- Frontend genellikle `http://localhost:3001` adresinde açılır
- Eğer port çakışması olursa, React otomatik olarak bir sonraki portu kullanır

## 📝 Şimdi Ne Yapmalıyım?

### Öncelik 1: Ana Sayfa (`AnaSayfa.js`)
- Hoş geldin mesajı
- Popüler sahalar
- Hızlı rezervasyon butonu
- Genel bilgiler

### Öncelik 2: Saha Listeleme (`SahaListeleme.js`)
- Backend'den sahaları çek (`fieldsAPI.getAll()`)
- Kartlar halinde göster
- Filtreleme ve arama özelliği ekle
- Her saha kartına tıklanınca `/saha/:id` sayfasına yönlendir

### Öncelik 3: Saha Detay (`SahaDetay.js`)
- Saha bilgilerini göster
- Fotoğraflar
- Fiyat bilgisi
- Rezervasyon formu
- Harita (latitude/longitude varsa)

### Öncelik 4: Kullanıcı Paneli (`KullaniciPanel.js`)
- Kullanıcı bilgileri
- Rezervasyon geçmişi
- Aktif rezervasyonlar
- Profil düzenleme

### Öncelik 5: Admin Paneli (`AdminPanel.js`)
- Kullanıcı yönetimi
- Saha yönetimi
- Rezervasyon yönetimi
- İstatistikler

## 🔧 Kullanım Örnekleri

### API Kullanımı
```javascript
import { fieldsAPI } from '../services/api';

// Sahaları getir
const response = await fieldsAPI.getAll();
if (response.success) {
  const fields = response.data;
  // Sahaları kullan
}
```

### Authentication Kullanımı
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (isAuthenticated()) {
    return <div>Hoş geldin, {user.first_name}!</div>;
  }
  
  return <div>Lütfen giriş yapın</div>;
}
```

### Protected Route Kullanımı
```javascript
<Route 
  path="/ozel-sayfa" 
  element={
    <ProtectedRoute>
      <OzelSayfa />
    </ProtectedRoute>
  } 
/>
```

## ⚠️ Önemli Notlar

1. **Backend Port**: Backend `http://localhost:3000` adresinde çalışıyor
2. **CORS**: Backend'de CORS ayarlarının yapıldığından emin olun
3. **Token**: Token localStorage'da saklanıyor, sayfa yenilendiğinde korunuyor
4. **Hata Yönetimi**: API hataları otomatik olarak yakalanıyor ve kullanıcıya gösteriliyor

## 🐛 Bilinen Sorunlar

Backend'de bazı küçük hatalar var (bunları backend ekibi düzeltmeli):
- `users.js` line 108: `user_id` yerine `user._id` olmalı
- `users.js` line 112: `jwt.encode` yerine `jwt.sign` olmalı
- `users.js` line 75: `user._id` yerine `createdUser._id` olmalı

## 📚 Sonraki Adımlar

1. Ana sayfayı tasarla ve implement et
2. Saha listeleme sayfasını yap
3. Saha detay sayfasını yap
4. Rezervasyon akışını tamamla
5. Kullanıcı ve admin panellerini geliştir

## 💡 İpuçları

- Bootstrap kullanılıyor, hazır component'lerden faydalanın
- `react-bootstrap` component'leri kullanabilirsiniz
- API çağrılarında her zaman `try-catch` kullanın
- Loading state'leri eklemeyi unutmayın
- Form validasyonlarını frontend'de de yapın

Başarılar! 🚀

