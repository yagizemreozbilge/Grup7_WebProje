// src/pages/KullaniciPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 

// !!! DİKKAT !!!
// Buraya senin MongoDB'deki 'tenant' (Saha Sahibi) Rol ID'ni yazmalısın.
// (KayitOl.js dosyasında kullandığın ID ile AYNI olmalı)
const TENANT_ROLE_ID = 'BURAYA-TENANT-ID-YAZ'; 

function KullaniciPanel() {
  const [user, setUser] = useState(null);
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfoStorage = localStorage.getItem('userInfo');
    
    if (userInfoStorage) {
      const userInfo = JSON.parse(userInfoStorage);
      const activeUser = userInfo.user || userInfo;
      setUser(activeUser);
      fetchRezervasyonlar(activeUser._id);
    } else {
      window.location.href = '/giris-yap';
    }
  }, []);

  const fetchRezervasyonlar = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/reservations`);
      
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

  // Kullanıcının Saha Sahibi olup olmadığını kontrol et
  // (Roller backend'den bazen dizi, bazen string gelebilir, kontrol ediyoruz)
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