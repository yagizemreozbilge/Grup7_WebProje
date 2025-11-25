// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import NavbarMenu from './components/NavbarMenu';

import AnaSayfa from './pages/AnaSayfa';
import GirisYap from './pages/GirisYap';
import KayitOl from './pages/KayitOl';
import SahaListeleme from './pages/SahaListeleme';
import SahaDetay from './pages/SahaDetay';
import KullaniciPanel from './pages/KullaniciPanel';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import SahaEkle from './pages/SahaEkle';
import SahaTalepleri from './pages/SahaTalepleri';

function App() {
  return (
    <BrowserRouter>
      <NavbarMenu />

      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<AnaSayfa />} />
            <Route path="/giris-yap" element={<GirisYap />} />
            <Route path="/kayit-ol" element={<KayitOl />} />
            <Route path="/sahalar" element={<SahaListeleme />} />
            <Route path="/saha-ekle" element={
              <ProtectedRoute
                requiredPermissions={['fields_add']}
                allowedRoleKeywords={['saha', 'tenant']}
              >
                <SahaEkle />
              </ProtectedRoute>
            } />
            
            {/* DÜZELTME: Tek Admin Rotası */}
            <Route path="/admin" element={
              <ProtectedRoute requiredPermissions={['users_view']}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Saha Talepleri - Sadece Super Admin */}
            <Route path="/saha-talepleri" element={
              <ProtectedRoute>
                <SahaTalepleri />
              </ProtectedRoute>
            } />

            <Route path="/saha/:id" element={<SahaDetay />} />

            <Route path="/panel" element={
              <ProtectedRoute>
                <KullaniciPanel />
              </ProtectedRoute>
            } />

          </Routes>
        </Container>
      </main>
    </BrowserRouter>
  );
}

export default App;