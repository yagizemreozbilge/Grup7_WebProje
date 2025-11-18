// src/pages/KayitOl.js

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. ROLLERİN KİMLİK KARTLARI (ID'LER)
// DİKKAT: Buradaki 'tenant' ID'sini senin MongoDB'den kopyaladığın ile değiştir!
const ROLE_IDS = {
    player: '691afa1e97ba5acd7a24deb9', // Senin resimdeki PLAYER ID
    admin: '691afbc67f8ee4b7ed654dce',  // Senin resimdeki ADMIN ID
    tenant: '691cb77d0669223adc742b83' 
};

const API_BASE_URL = 'http://localhost:5000';

function KayitOl() {
  // State Tanımlamaları
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Rol Seçimi (Varsayılan: Oyuncu)
  const [selectedRole, setSelectedRole] = useState('player'); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    // Şifre Kontrolü
    if (password !== confirmPassword) {
      setMessage('Şifreler uyuşmuyor!');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Seçilen rolün ID'sini alıyoruz
      const roleIdToSend = ROLE_IDS[selectedRole];

      // Eğer ID bulunamazsa hata vermesin diye kontrol
      if (!roleIdToSend || roleIdToSend.includes('BURAYA')) {
         setError('Lütfen kodun içindeki ROLE_IDS kısmına geçerli bir ID girin!');
         setLoading(false);
         return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/users/register`,
        { 
          email: email, 
          password: password,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          roles: [ roleIdToSend ] // <-- Seçilen Rolün ID'si Gidiyor
        },
        config
      );

      setLoading(false);
      console.log('Kayıt Başarılı:', data); 
      navigate('/giris-yap');
      
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response && err.response.data.error 
          ? err.response.data.error.description 
          : err.message;
      setError('Kayıt Hatası: ' + errorMsg);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h1 className="mb-4">Kayıt Ol</h1>
          
          {message && <Alert variant="warning">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <h3>Yükleniyor...</h3>}

          <Form onSubmit={submitHandler}>
            
            {/* ROL SEÇİMİ */}
            <Form.Group className="mb-3 p-3 border rounded bg-light">
                <Form.Label className="fw-bold">Hesap Türü Seçin</Form.Label>
                <Form.Select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="player">Müşteri</option>
                    <option value="tenant">Saha Sahibi</option>
                </Form.Select>
                <Form.Text className="text-muted">
                    {selectedRole === 'player' 
                        ? 'Sahaları listeleyebilir ve rezervasyon yapabilirsiniz.' 
                        : 'Kendi halı sahalarınızı sisteme ekleyip yönetebilirsiniz.'}
                </Form.Text>
            </Form.Group>

            <Row>
                <Col>
                    <Form.Group controlId="firstName" className="mb-3">
                    <Form.Label>Ad</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Adınız"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="lastName" className="mb-3">
                    <Form.Label>Soyad</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Soyadınız"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    ></Form.Control>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email Adresi</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email adresinizi girin"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>
            
            <Form.Group controlId="phoneNumber" className="mb-3">
              <Form.Label>Telefon Numarası</Form.Label>
              <Form.Control
                type="text"
                placeholder="0555..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifre belirleyin"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Şifre (Tekrar)</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifreyi tekrar girin"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-4 w-100" disabled={loading}>
              Kayıt Ol
            </Button>
          
          </Form>

          <Row className="py-3 text-center">
            <Col>
              Zaten hesabın var mı?{' '}
              <Link to="/giris-yap" className="fw-bold">Giriş Yap</Link>
            </Col>
          </Row>

        </Col>
      </Row>
    </Container>
  );
}

export default KayitOl;