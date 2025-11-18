// src/pages/KullaniciPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

// Backend Adresi (Emin ol: 5000)
const API_BASE_URL = 'http://localhost:5000'; 

function KullaniciPanel() {
  const [user, setUser] = useState(null);
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Hafızadan kullanıcıyı oku
    const userInfoStorage = localStorage.getItem('userInfo');
    
    if (userInfoStorage) {
      const userInfo = JSON.parse(userInfoStorage);
      const activeUser = userInfo.user || userInfo;
      setUser(activeUser);

      // 2. Kullanıcı varsa, onun rezervasyonlarını çek
      fetchRezervasyonlar(activeUser._id);
    } else {
      window.location.href = '/giris-yap';
    }
  }, []);

  const fetchRezervasyonlar = async (userId) => {
    try {
      setLoading(true);
      // Backend'den TÜM rezervasyonları çekiyoruz
      const { data } = await axios.get(`${API_BASE_URL}/reservations`);
      
      let allReservations = [];
      if (data.data) {
        allReservations = data.data;
      } else {
        allReservations = data;
      }

      // 3. Sadece BU kullanıcıya ait olanları filtrele
      // (Backend'de özel filtreleme olmadığı için frontend'de yapıyoruz - Ödev için OK)
      const myReservations = allReservations.filter(res => res.customer_id === userId);
      
      setRezervasyonlar(myReservations);
      setLoading(false);

    } catch (err) {
      console.error("Rezervasyonları çekerken hata:", err);
      setLoading(false);
    }
  };

  if (!user) {
    return <Container className="mt-5">Yükleniyor...</Container>;
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Profilim</h1>
      <Row>
        {/* SOL TARA: Kullanıcı Bilgileri */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>Kullanıcı Bilgileri</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Ad:</strong> {user.first_name} {user.last_name}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Email:</strong> {user.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Telefon:</strong> {user.phone_number || 'Belirtilmemiş'}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        
        {/* SAĞ TARA: Rezervasyon Geçmişi */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Rezervasyon Geçmişim</span>
                <Button variant="sm btn-outline-primary" onClick={() => fetchRezervasyonlar(user._id)}> Yenile </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                 <div className="text-center"><Spinner animation="border" /></div>
              ) : rezervasyonlar.length === 0 ? (
                <div className="text-center">
                    <Alert variant="info">
                        Henüz bir rezervasyonunuz bulunmamaktadır.
                    </Alert>
                    <Button variant="primary" href="/sahalar">
                        Hemen Saha Kirala
                    </Button>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Saat</th>
                      <th>Fiyat</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rezervasyonlar.map((rez) => {
                        // Tarihi güzel formatlamak için
                        const startDate = new Date(rez.start);
                        const endDate = new Date(rez.end);
                        
                        return (
                            <tr key={rez._id}>
                                <td>{startDate.toLocaleDateString('tr-TR')}</td>
                                <td>
                                    {startDate.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - 
                                    {endDate.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td>{rez.price} TL</td>
                                <td>
                                    <Badge bg={rez.status === 'approved' ? 'success' : 'warning'}>
                                        {rez.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
                                    </Badge>
                                </td>
                            </tr>
                        );
                    })}
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