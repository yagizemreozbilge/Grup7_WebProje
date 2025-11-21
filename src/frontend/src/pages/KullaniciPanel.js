// src/pages/KullaniciPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom'; 


const TENANT_ROLE_ID = '691cb77d0669223adc742b83'; 

function KullaniciPanel() {
  const [user, setUser] = useState(null);
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getStoredAuth();
    
    if (auth?.user) {
      setUser(auth.user);
      fetchRezervasyonlar(auth.user._id);
    } else {
      window.location.href = '/giris-yap';
    }
  }, []);

  const fetchRezervasyonlar = async (userId) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/reservations');
      
      let allReservations = data.data ? data.data : data;
      const myReservations = allReservations.filter(res => res.customer_id === userId);
      
      setRezervasyonlar(myReservations);
      setLoading(false);
    } catch (err) {
      console.error("Hata:", err);
      setLoading(false);
    }
  };

  if (!user) return <Container className="mt-5">Yükleniyor...</Container>;

  // --- AJAN KOD BAŞLANGICI ---
  console.log("--- PROFİL DEBUG ---");
  console.log("Kullanıcı Bilgisi:", user);
  console.log("Kullanıcının Rolleri:", user.roles);
  console.log("Beklenen Tenant ID:", TENANT_ROLE_ID);
  
  const rolVarMi = user.roles && user.roles.includes(TENANT_ROLE_ID);
  console.log("Rol Eşleşmesi Sonucu:", rolVarMi);
  // --- AJAN KOD BİTİŞİ ---
  const isTenant = user.roles && user.roles.includes(TENANT_ROLE_ID);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Profilim</h1>
      <Row>
        {/* SOL: Kullanıcı Bilgileri */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">Kullanıcı Bilgileri</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Ad:</strong> {user.first_name} {user.last_name}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
              <ListGroup.Item>
                <strong>Rol:</strong> {isTenant ? <Badge bg="info">Saha Sahibi</Badge> : <Badge bg="secondary">Oyuncu</Badge>}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* --- YENİ: SAHA SAHİBİ MENÜSÜ --- */}
          {/* Sadece 'tenant' rolüne sahipse görünür */}
          {isTenant && (
             <Card className="mb-4 shadow-sm border-info">
                <Card.Header className="bg-info text-white">Saha Yönetimi</Card.Header>
                <Card.Body>
                    <p className="small">Yeni bir halı saha ekleyerek kiralamaya başlayın.</p>
                    <Button variant="outline-primary" className="w-100" onClick={() => navigate('/saha-ekle')}>
                        + Yeni Saha Ekle
                    </Button>
                </Card.Body>
             </Card>
          )}
        </Col>
        
        {/* SAĞ: Rezervasyonlar */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>Rezervasyon Geçmişim</Card.Header>
            <Card.Body>
              {loading ? <Spinner animation="border" /> : rezervasyonlar.length === 0 ? (
                <Alert variant="light">Henüz rezervasyonunuz yok.</Alert>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr><th>Tarih</th><th>Saat</th><th>Durum</th></tr>
                  </thead>
                  <tbody>
                    {rezervasyonlar.map(rez => (
                        <tr key={rez._id}>
                            <td>{new Date(rez.start).toLocaleDateString('tr-TR')}</td>
                            <td>{new Date(rez.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td><Badge bg="warning">Beklemede</Badge></td>
                        </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default KullaniciPanel;