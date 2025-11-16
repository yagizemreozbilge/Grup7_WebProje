import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function NavbarMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

            {isAuthenticated() ? (
              <>
                <LinkContainer to="/panel">
                  <Nav.Link>Panel</Nav.Link>
                </LinkContainer>
                
                <NavDropdown 
                  title={user ? `${user.first_name} ${user.last_name}` : 'Kullanıcı'} 
                  id="user-dropdown"
                >
                  <LinkContainer to="/panel">
                    <NavDropdown.Item>Kullanıcı Paneli</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Çıkış Yap
                  </NavDropdown.Item>
                </NavDropdown>
              </>
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