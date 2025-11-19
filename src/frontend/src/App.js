// src/App.js

import React from 'react';
// Adım 2'de kurduğumuz "react-router-dom" kütüphanesinden
// ana yönlendirici bileşenlerini "import" ediyoruz.
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Bootstrap'in genel kapsayıcı bileşeni
import { Container } from 'react-bootstrap';

// 1. KENDİ BİLEŞENLERİMİZİ "İMPORT" EDİYORUZ
// Menümüz:
import NavbarMenu from './components/NavbarMenu';

// Sayfalarımız:
import AnaSayfa from './pages/AnaSayfa';
import GirisYap from './pages/GirisYap';
import KayitOl from './pages/KayitOl';
import SahaListeleme from './pages/SahaListeleme';
import SahaDetay from './pages/SahaDetay';
import KullaniciPanel from './pages/KullaniciPanel';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import SahaEkle from './pages/SahaEkle';


// 2. ANA UYGULAMA FONKSİYONU
function App() {
  return (
    // BrowserRouter, tüm uygulamayı sarar ve "sayfa geçişi" özelliklerini aktif eder.
    <BrowserRouter>

      {/* NavbarMenu'yü buraya koyduk. "Routes"un DIŞINDA. */}
      {/* Bu sayede sayfa değişse bile Navbar hep sabit kalır. */}
      <NavbarMenu />

      <main className="py-3">
        <Container>
          {/* Routes, hangi URL'de hangi sayfanın yükleneceğine karar veren "harita"dır. */}
          <Routes>

            {/* Route, haritadaki tek bir yoldur.
              path="/" (ana yol) -> element={<AnaSayfa />} (AnaSayfa bileşenini göster)
            */}
            <Route path="/" element={<AnaSayfa />} />
            <Route path="/giris-yap" element={<GirisYap />} />
            <Route path="/kayit-ol" element={<KayitOl />} />
            <Route path="/sahalar" element={<SahaListeleme />} />
            <Route path="/saha-ekle" element={<SahaEkle />} />
            <Route path="/admin" element={<AdminPanel />} />

            {/* Bu özel bir yoldur. :id demek "değişken" demektir. */}
            {/* /saha/1 veya /saha/abc gibi linklere tıklandığında SahaDetay sayfasını açar. */}
            <Route path="/saha/:id" element={<SahaDetay />} />

            <Route path="/panel" element={
  <ProtectedRoute>
    <KullaniciPanel />
  </ProtectedRoute>
} />
            <Route path="/admin" element={<AdminPanel />} />

          </Routes>
        </Container>
      </main>

      {/* Buraya da ileride bir <Footer /> bileşeni ekleyebiliriz. */}

    </BrowserRouter>
  );
}

// 3. App bileşenini projenin kullanabilmesi için "export" ediyoruz.
export default App;