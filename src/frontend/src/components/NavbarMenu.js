import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import {
    clearStoredAuth,
    getStoredAuth,
    hasPermission
} from '../utils/auth';

const TENANT_KEYWORDS = ['saha', 'tenant'];
const SUPER_ADMIN_KEYWORDS = ['süper', 'super', 'admin'];

const hasTenantBadge = (roleDetails = []) =>
    roleDetails.some((role) => {
        const name = role.name?.toLowerCase() || '';
        return TENANT_KEYWORDS.some((keyword) => name.includes(keyword));
    });

const isSuperAdminRole = (roleDetails = []) =>
    roleDetails.some((role) => {
        const name = role.name?.toLowerCase() || '';
        return SUPER_ADMIN_KEYWORDS.some((keyword) => name.includes(keyword));
    });

function NavbarMenu() {
    const auth = getStoredAuth();
    const user = auth?.user;
    const isAuthenticated = Boolean(user);

    const roleDetails = Array.isArray(user?.role_details) ? user.role_details : [];
    const isTenant = hasTenantBadge(roleDetails);
    const isSuperAdmin =
        hasPermission(user, ['superuser']) ||
        isSuperAdminRole(roleDetails);
    const canManageFields =
        hasPermission(user, ['fields_add']) ||
        isTenant ||
        isSuperAdmin;

    const logoutHandler = () => {
        clearStoredAuth();
        window.location.href = '/'; 
    };

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="shadow-lg sticky-top py-3">
                <Container>
                    
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
                                <Nav.Link className="mx-2 fw-medium text-white">SAHALAR</Nav.Link>
                            </LinkContainer>

                            {isAuthenticated ? (
                                <>
                                    {canManageFields && (
                                        <LinkContainer to="/saha-ekle">
                                            <Nav.Link className="mx-2 fw-bold text-white">
                                                SAHA EKLE
                                            </Nav.Link>
                                        </LinkContainer>
                                    )}

                                    <LinkContainer to="/panel">
                                        <Nav.Link className="mx-2 fw-bold text-white">
                                            PANELİM
                                        </Nav.Link>
                                    </LinkContainer>

                                    {isSuperAdmin && (
                                        <>
                                            <LinkContainer to="/saha-talepleri">
                                                <Nav.Link className="mx-2 fw-bold text-white">
                                                    SAHA TALEPLERİ
                                                </Nav.Link>
                                            </LinkContainer>
                                            <LinkContainer to="/admin">
                                                <Nav.Link className="mx-2 fw-bold text-white">
                                                    KULLANICI YÖNETİMİ
                                                </Nav.Link>
                                            </LinkContainer>
                                        </>
                                    )}
                                    
                                    <Nav.Link onClick={logoutHandler} className="mx-2 fw-bold text-white">
                                        ÇIKIŞ YAP
                                    </Nav.Link>
                                </>
                            ) : (
                                <>
                                    <LinkContainer to="/giris-yap">
                                        <Nav.Link className="mx-2 fw-medium text-white">GİRİŞ YAP</Nav.Link>
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