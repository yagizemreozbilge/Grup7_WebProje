// src/pages/KullaniciPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';

function KullaniciPanel() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Hafızadan kullanıcıyı oku
    const userInfoStorage = localStorage.getItem('userInfo');

    if (userInfoStorage) {
      const userInfo = JSON.parse(userInfoStorage);
      // Eğer Backend veriyi 'user' objesi içinde yolluyorsa:
      setUser(userInfo.user || userInfo); 
    } else {
      // Giriş yapmamışsa Ana Sayfaya at
      window.location.href = '/giris-yap';
    }
  }, []);

  if (!user) {
    return <Container className="mt-5">Yükleniyor...</Container>;
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Profilim</h1>
      <Row>
        <Col md={4}>
          <Card>
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

        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Rezervasyon Geçmişim</Card.Header>
            <Card.Body>
              {/* Şimdilik boş - İleride buraya rezervasyonlar gelecek */}
              <Alert variant="info">
                Henüz bir rezervasyonunuz bulunmamaktadır.
              </Alert>
              <Button variant="primary" href="/sahalar">
                Hemen Saha Kirala
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default KullaniciPanel;