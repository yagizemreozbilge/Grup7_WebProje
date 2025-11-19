// src/components/NavbarMenu.js

import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

// !!! BURAYA KENDİ SAHA SAHİBİ ID'Nİ YAPIŞTIR !!!
const TENANT_ROLE_ID = '691cb77d0669223adc742b83'; 

function NavbarMenu() {
    // Kullanıcı verisini çek ve ayrıştır
    const userInfoStorage = localStorage.getItem('userInfo'); 
    const userInfo = userInfoStorage ? JSON.parse(userInfoStorage) : null;
    
    // Kullanıcı objesine ulaş (Bazen user içinde, bazen direkt gelir)
    const user = userInfo ? (userInfo.user || userInfo) : null;
    const isAuthenticated = !!user;

    // Saha Sahibi mi kontrolü
    const isTenant = user && user.roles && user.roles.includes(TENANT_ROLE_ID);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/'; 
    };

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="shadow-lg sticky-top py-3">
                <Container>
                    {/* --- FATIMA'NIN GÜZEL LOGO TASARIMI --- */}
                    <LinkContainer to="/">
                        <Navbar.Brand 
                            className="d-flex align-items-center fw-bold fs-4" 
                            style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                        >
                            <span 
                                style={{
                                    border: '2px solid white',
                                    padding: '5px 10px',
                                    borderRadius: '3px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <span className="text-white">HalıSaha</span>
                                <span className="text-success ms-1">Max</span>
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
                                    {/* --- BİZİM EKLEDİĞİMİZ SAHA EKLE BUTONU (Geri Geldi!) --- */}
                                    {isTenant && (
                                        <LinkContainer to="/saha-ekle">
                                            <Nav.Link className="mx-2 fw-bold text-warning">
                                                + SAHA EKLE
                                            </Nav.Link>
                                        </LinkContainer>
                                    )}

                                    <LinkContainer to="/panel">
                                        <Nav.Link className="mx-2 fw-bold text-white border-end pe-3">
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