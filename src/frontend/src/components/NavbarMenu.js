

import React from 'react';

import { Navbar, Nav, Container } from 'react-bootstrap';


import { LinkContainer } from 'react-router-bootstrap';



function NavbarMenu() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>

        {/* Marka/Logo Kısmı */}
        <LinkContainer to="/">
          <Navbar.Brand>HalıSahaMax</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          {/* Linkler (Sağ Taraf) */}
          <Nav className="ms-auto">

            <LinkContainer to="/">
              <Nav.Link>Ana Sayfa</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/sahalar">
              <Nav.Link>Sahalar</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/giris-yap">
              <Nav.Link>Giriş Yap</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/kayit-ol">
              <Nav.Link>Kayıt Ol</Nav.Link>
            </LinkContainer>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarMenu;