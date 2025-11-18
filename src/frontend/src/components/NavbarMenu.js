// src/components/NavbarMenu.js

import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

// !!! BURAYA KENDİ 'TENANT' (SAHA SAHİBİ) ID'Nİ YAPIŞTIR !!!
const TENANT_ROLE_ID = '691cb77d0669223adc742b83'; 

function NavbarMenu() {
  const userInfoStorage = localStorage.getItem('userInfo');
  const userInfo = userInfoStorage ? JSON.parse(userInfoStorage) : null;
  const user = userInfo ? (userInfo.user || userInfo) : null;

  // Kullanıcının Saha Sahibi olup olmadığını kontrol et
  // (Backend'den 'roles' dizisi gelince çalışır)
  const isTenant = user && user.roles && user.roles.includes(TENANT_ROLE_ID);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/giris-yap';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>HalıSahaMax</Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          <Nav className="ms-auto">
            
            <LinkContainer to="/sahalar">
              <Nav.Link>Sahalar</Nav.Link>
            </LinkContainer>

            {/* SAHA EKLE BUTONU (Sadece Saha Sahiplerine Özel) */}
            {isTenant && (
                <LinkContainer to="/saha-ekle">
                    <Nav.Link className="text-warning fw-bold">+ Saha Ekle</Nav.Link>
                </LinkContainer>
            )}

            {user ? (
              <NavDropdown title={`Merhaba, ${user.first_name || 'Kullanıcı'}`} id="username">
                
                <LinkContainer to="/panel">
                  <NavDropdown.Item>Profilim</NavDropdown.Item>
                </LinkContainer>

                {/* Dropdown içinde de gösterelim */}
                {isTenant && (
                    <LinkContainer to="/saha-ekle">
                        <NavDropdown.Item>Saha Ekle</NavDropdown.Item>
                    </LinkContainer>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler}>
                  Çıkış Yap
                </NavDropdown.Item>

              </NavDropdown>
            ) : (
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