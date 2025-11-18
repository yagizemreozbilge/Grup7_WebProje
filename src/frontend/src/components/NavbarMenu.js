// src/components/NavbarMenu.js

import React from 'react';
// 1. YENİ: Dropdown (Açılır Menü) bileşenini ekledik
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function NavbarMenu() {
  // 2. HAFIZAYI OKU: Tarayıcı hafızasındaki 'userInfo'yu çek
  const userInfoStorage = localStorage.getItem('userInfo');
  // Hafızadaki yazı (string), JSON objesine çevrilir
  const userInfo = userInfoStorage ? JSON.parse(userInfoStorage) : null;

  // 3. ÇIKIŞ YAP (Logout) Fonksiyonu
  const logoutHandler = () => {
    localStorage.removeItem('userInfo'); // Hafızayı temizle
    window.location.href = '/giris-yap'; // Giriş sayfasına yolla
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>HalıSahaMax</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          {/* Linkler (Sağ Taraf) */}
          <Nav className="ms-auto">

            <LinkContainer to="/sahalar">
              <Nav.Link>Sahalar</Nav.Link>
            </LinkContainer>

            {/* 4. "AKILLI" BÖLÜM (Koşullu Render) */}
            {userInfo ? (
              // EĞER KULLANICI GİRİŞ YAPMIŞSA (userInfo varsa):
              <NavDropdown title={`Merhaba, ${userInfo.user?.first_name || 'Kullanıcı'}`} id="username">

                <LinkContainer to="/panel">
                  <NavDropdown.Item>Profilim</NavDropdown.Item>
                </LinkContainer>

                <NavDropdown.Item onClick={logoutHandler}>
                  Çıkış Yap
                </NavDropdown.Item>

              </NavDropdown>
            ) : (
              // EĞER GİRİŞ YAPMAMIŞSA (userInfo null ise):
              <>
                <LinkContainer to="/giris-yap">
                  <Nav.Link>Giriş Yap</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/kayit-ol">
                  <Nav.Link>Kayıt Ol</Nav.Link>
                </LinkContainer>
              </>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarMenu;