// src/pages/GirisYap.js

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios'; // <--- 1. KURYEMİZİ (AXIOS) ÇAĞIRDIK


const API_BASE_URL = 'http://localhost:5000'; // <-- BU ŞİMDİLİK YANLIŞ, AMA KOD ÇALIŞSIN DİYE
// -----------------------------------------------------------------


function GirisYap() {
  // Form verilerini tutan "state"ler
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // API'den gelen hata veya başarıyı tutan "state"ler
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form gönderildiğinde çalışacak fonksiyon
  const submitHandler = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    // 2. Hata/Yükleniyor durumlarını sıfırla
    setError(null);
    setLoading(true);

    try {
      // 3. AXIOS İLE API İSTEĞİ (POST)
      // Bizim deşifre ettiğimiz linkler: /users/auth
      // Gökçe'den beklediğimiz link: API_BASE_URL
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Kuryemiz (axios) mektubu (veriyi) yolluyor
      const { data } = await axios.post(
        `${API_BASE_URL}/users/auth`, // <-- Tam API linki
        { email, password }, // <-- Yolladığımız veri (Menüye göre)
        config
      );

      // 4. BAŞARILI OLURSA
      setLoading(false);
      
      // Backend'den gelen cevabı (token ve user) konsola yazdıralım
      console.log('API CEVABI:', data); 
      
      // İleride: Gelen 'data.token' ve 'data.user' bilgilerini
      // tarayıcı hafızasına (localStorage) kaydedip ana sayfaya yönlendireceğiz.
      alert('Giriş Başarılı! Konsolu kontrol et.');
      
    } catch (err) {
      // 5. BAŞARISIZ OLURSA
      setLoading(false);
      
      // Backend'den gelen hata mesajını 'error' state'ine kaydet
      const message = err.response && err.response.data.message
          ? err.response.data.message
          : err.message;
      setError(message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h1>Giriş Yap</h1>
          
          {/* Hata varsa Alert (Uyarı) göster */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Yükleniyorsa 'Loading...' yazısı göster */}
          {loading && <h3>Yükleniyor...</h3>}

          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email" className="my-3">
              <Form.Label>Email Adresi</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3" disabled={loading}>
              Giriş Yap
            </Button>
          </Form>

          <Row className="py-3">
            <Col>
              Yeni Müşteri misin?{' '}
              <Link to="/kayit-ol">Hemen Kayıt Ol</Link>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default GirisYap;