

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const ROLE_IDS = {
  player: '691afa1e97ba5acd7a24deb9', 
  admin: '691afbc67f8ee4b7ed654dce',  
  tenant: '691cb77d0669223adc742b83' 
};

const API_BASE_URL = 'http://localhost:5000';

const registerImageUrl = 'https://images.unsplash.com/photo-1549477545-fb405362145b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';


function KayitOl() {
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('player'); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    
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

      
      const roleIdToSend = ROLE_IDS[selectedRole];

      if (!roleIdToSend || roleIdToSend.includes('691cb77d0669223adc742b83')) {
        setError('Lütfen ROLE_IDS kısmında geçerli bir Saha Sahibi ID\'si girildiğinden emin olun!');
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
          roles: [ roleIdToSend ]
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
    <Container className="my-5">
      <Row className="justify-content-center shadow-lg rounded-4 overflow-hidden" style={{ minHeight: '80vh' }}>
        
        {/* SOL TARAF: Görsel / Branding - RENGİ KIRMIZIDAN LACİVERTE ÇEVİRİLDİ */}
        <Col md={6} className="d-none d-md-flex p-0" >
          <div 
            className="w-100 h-100 d-flex align-items-center justify-content-center p-5"
            style={{ 
              
              backgroundImage: `linear-gradient(rgba(13, 110, 253, 0.8), rgba(13, 110, 253, 0.9)), url(${registerImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white'
            }}
          >
            <div>
              <h1 className="display-4 fw-bold mb-3">Sana Özel Hesap Oluştur!</h1>
              <p className="fs-5">
                {selectedRole === 'player' 
                    ? 'Müşteri hesabı ile hemen saha kiralamaya başlayabilirsin.' 
                    : 'Saha sahibi misin? Hemen kaydol, sahanı ekle ve rezervasyonları yönet.'}
              </p>
            </div>
          </div>
        </Col>

        {/* SAĞ TARAF: Form */}
        <Col xs={12} md={6} className="bg-white p-5 d-flex align-items-center">
          <div className="w-100">
            <h2 className="fw-bold mb-4 text-center">Yeni Hesap Oluştur</h2>
            
            {message && <Alert variant="warning">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Alert variant="info">Yükleniyor...</Alert>}

            <Form onSubmit={submitHandler}>
              
              {/* ROL SEÇİMİ - Rengi de info (mavi) olarak güncellendi */}
              <Card className="mb-4 shadow-sm border-primary"> {/* border-primary yapıldı */}
                 <Card.Body className="p-3 bg-light">
                    <Form.Group>
                      <Form.Label className="fw-bold text-primary small">Hesap Türü Seçin</Form.Label> {/* text-primary yapıldı */}
                      <Form.Select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-white border-primary"
                      >
                        <option value="player">Müşteri (Rezervasyon Yap)</option>
                        <option value="tenant">Saha Sahibi (Saha Yönet)</option>
                      </Form.Select>
                      <Form.Text className="text-muted small">
                          {selectedRole === 'player' ? 'Sahaları listeleyebilir ve rezervasyon yapabilirsiniz.' : 'Kendi halı sahalarınızı sisteme ekleyip yönetebilirsiniz.'}
                      </Form.Text>
                    </Form.Group>
                 </Card.Body>
              </Card>

              {/* ... Diğer Form Alanları (Görünüm aynı, mantık korundu) ... */}
              <Row>
                  <Col md={6}>
                      <Form.Group controlId="firstName" className="mb-3">
                          <Form.Label className="fw-bold small text-muted">Ad</Form.Label>
                          <Form.Control type="text" placeholder="Adınız" required value={firstName} onChange={(e) => setFirstName(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                      <Form.Group controlId="lastName" className="mb-3">
                          <Form.Label className="fw-bold small text-muted">Soyad</Form.Label>
                          <Form.Control type="text" placeholder="Soyadınız" required value={lastName} onChange={(e) => setLastName(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
                      </Form.Group>
                  </Col>
              </Row>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label className="fw-bold small text-muted">Email Adresi</Form.Label>
                <Form.Control type="email" placeholder="Email adresinizi girin" required value={email} onChange={(e) => setEmail(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
              </Form.Group>
              
              <Form.Group controlId="phoneNumber" className="mb-3">
                <Form.Label className="fw-bold small text-muted">Telefon Numarası (Opsiyonel)</Form.Label>
                <Form.Control type="text" placeholder="0555..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
              </Form.Group>

              <Form.Group controlId="password" className="mb-3">
                <Form.Label className="fw-bold small text-muted">Şifre</Form.Label>
                <Form.Control type="password" placeholder="Şifre belirleyin" required value={password} onChange={(e) => setPassword(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-4">
                <Form.Label className="fw-bold small text-muted">Şifre (Tekrar)</Form.Label>
                <Form.Control type="password" placeholder="Şifreyi tekrar girin" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} size="lg" className="border-0 border-bottom bg-light rounded-0" />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 fw-bold py-3" disabled={loading}>
                Kayıt Ol
              </Button>
            </Form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted">Zaten hesabın var mı?</span>{' '}
              <Link to="/giris-yap" className="fw-bold text-primary text-decoration-none">Giriş Yap</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default KayitOl;