// src/pages/KayitOl.js

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios'; // <--- 1. KURYEMİZİ (AXIOS) ÇAĞIRDIK


const API_BASE_URL = 'http://localhost:5000'; 


const MUSTERI_ROLE_ID = '691afa1e97ba5acd7a24deb9'; 
// -----------------------------------------------------------------


function KayitOl() {
  // Form verilerini tutan "state"ler
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // API'den gelen hata veya başarıyı tutan "state"ler
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Şifre uyuşmazlığı mesajı için

  // Form gönderildiğinde çalışacak fonksiyon
  const submitHandler = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    // 2. Basit form kontrolü
    if (password !== confirmPassword) {
      setMessage('Şifreler uyuşmuyor!');
      return;
    }

    // 3. Hata/Yükleniyor durumlarını sıfırla
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // 4. AXIOS İLE API İSTEĞİ (POST)
      // Bizim deşifre ettiğimiz link: /users/register

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Kuryemiz (axios) mektubu (veriyi) yolluyor
      const { data } = await axios.post(
        `${API_BASE_URL}/users/register`, // <-- Tam API linki
        { 
          email: email, 
          password: password,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          roles: [MUSTERI_ROLE_ID] // <-- İŞTE O "LANET" ID'NİN KULLANILDIĞI YER
        },
        config
      );

      // 5. BAŞARILI OLURSA
      setLoading(false);
      console.log('API CEVABI:', data); 
      alert('Kayıt Başarılı! Şimdi Giriş Yapabilirsiniz.');
      // (İleride otomatik Giriş Yap sayfasına yönlendirilebilir)

    } catch (err) {
      // 6. BAŞARISIZ OLURSA
      setLoading(false);
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
          <h1>Kayıt Ol</h1>

          {/* Hata veya Mesaj varsa Uyarı göster */}
          {message && <Alert variant="danger">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <h3>Yükleniyor...</h3>}

          <Form onSubmit={submitHandler}>

            <Form.Group controlId="firstName" className="my-3">
              <Form.Label>Ad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Adınızı girin"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="lastName" className="my-3">
              <Form.Label>Soyad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Soyadınızı girin"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="email" className="my-3">
              <Form.Label>Email Adresi</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="phoneNumber" className="my-3">
              <Form.Label>Telefon Numarası (Opsiyonel)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Telefon numaranızı girin"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="my-3">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Şifre (Tekrar)</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3" disabled={loading}>
              Kayıt Ol
            </Button>

          </Form>

          <Row className="py-3">
            <Col>
              Hesabın var mı?{' '}
              <Link to="/giris-yap">Giriş Yap</Link>
            </Col>
          </Row>

        </Col>
      </Row>
    </Container>
  );
}

export default KayitOl;