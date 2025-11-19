import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function NavbarMenu() {
    const userInfo = localStorage.getItem('userInfo'); 
    const isAuthenticated = !!userInfo;

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/'; 
    };

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="shadow-lg sticky-top py-3">
                <Container>
                    {/* MARKA/LOGO ALANI - HALISAHA MAX YAZISI KALE İÇİNDE */}
                    <LinkContainer to="/">
                        <Navbar.Brand 
                            className="d-flex align-items-center fw-bold fs-4" 
                            style={{ letterSpacing: '1px', textTransform: 'uppercase' }} // Metni büyük harf yap
                        >
                            <span 
                                style={{
                                    border: '2px solid white', // Kale direkleri için kenarlık
                                    padding: '5px 10px',      // Metinle kenarlık arası boşluk
                                    borderRadius: '3px',      // Köşeleri hafif yuvarla
                                    display: 'inline-flex',   // İçindeki elemanları hizalamak için
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.1)' // Hafif şeffaf arka plan
                                }}
                            >
                                <span className="text-white">HalıSaha</span>
                                <span className="text-success ms-1">Max</span> {/* ms-1 ile hafif boşluk */}
                            </span>
                        </Navbar.Brand>
                    </LinkContainer>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            
                            <LinkContainer to="/sahalar">
                                <Nav.Link className="mx-2 fw-medium text-white-50">SAHALAR</Nav.Link>
                            </LinkContainer>

                            {isAuthenticated ? (
                                <>
                                    <LinkContainer to="/panel">
                                        <Nav.Link className="mx-2 fw-bold text-warning border-end pe-3">
                                            PANELİM
                                        </Nav.Link>
                                    </LinkContainer>
                                    <Nav.Link onClick={logoutHandler} className="mx-2 fw-bold text-danger">
                                        ÇIKIŞ YAP
                                    </Nav.Link>
                                </>
                            ) : (
                                <>
                                    <LinkContainer to="/giris-yap">
                                        <Nav.Link className="mx-2 fw-medium text-white-50">GİRİŞ YAP</Nav.Link>
                                    </LinkContainer>
                                    <LinkContainer to="/kayit-ol">
                                        <Nav.Link className="mx-2 fw-medium">
                                            <Button variant="success" size="sm" className="fw-bold px-3">
                                                KAYIT OL
                                            </Button>
                                        </Nav.Link>
                                    </LinkContainer>
                                </>
                            )}

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default NavbarMenu;