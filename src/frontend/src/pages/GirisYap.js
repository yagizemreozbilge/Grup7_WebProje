// src/pages/GirisYap.js

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient'; 
const loginImageUrl = 'https://images.unsplash.com/photo-1558237956-6219808e040c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';


function GirisYap() {
  // İş mantığı (logic) aynı kaldı
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useNavigate kaldırıldı çünkü window.location.href kullanılıyor

  const submitHandler = async (e) => {
    e.preventDefault(); 
    setError(null);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/users/auth', { email, password });

      // BAŞARILI OLURSA
      setLoading(false);

      // Gelen veriyi (token ve user) tarayıcı hafızasına (localStorage) kaydediyoruz.
      const finalData = data.data && data.data.token ? data.data : data;

      if (finalData.token) {
        localStorage.setItem('userInfo', JSON.stringify(finalData));
        // Başarılı girişten sonra Ana Sayfa'ya yönlendir. (Sayfa yenilenir)
        window.location.href = '/'; 
      } else {
        setError('Giriş başarılı, ancak sunucudan geçerli kullanıcı verisi alınamadı.');
      }
      
    } catch (err) {
      // BAŞARISIZ OLURSA
      setLoading(false);
      const message = err.response && err.response.data.message
          ? err.response.data.message
          : err.message;
      setError(message);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center shadow-lg rounded-4 overflow-hidden" style={{ minHeight: '80vh' }}>
        
        {/* SOL TARAF: Görsel / Branding */}
        <Col md={6} className="d-none d-md-flex p-0" >
          <div 
            className="w-100 h-100 d-flex align-items-center justify-content-center p-5"
            style={{ 
              backgroundImage: `linear-gradient(rgba(40, 167, 69, 0.7), rgba(40, 167, 69, 0.9)), url(${loginImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white'
            }}
          >
            <div>
              <h1 className="display-4 fw-bold mb-3">Tek Tıkla Maça!</h1>
              <p className="fs-5">Giriş yap ve yüzlerce saha arasından anında rezervasyonunu tamamla.</p>
            </div>
          </div>
        </Col>

        {/* SAĞ TARAF: Form */}
        <Col xs={12} md={6} className="bg-white p-5 d-flex align-items-center">
          <div className="w-100">
            <h2 className="fw-bold mb-4 text-center">Hesabına Giriş Yap</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Alert variant="info">Yükleniyor...</Alert>}

            <Form onSubmit={submitHandler}>
              <Form.Group controlId="email" className="mb-4">
                <Form.Label className="fw-bold small text-muted">Email Adresi</Form.Label>
                <Form.Control
                  type="email"
                  size="lg"
                  placeholder="Email adresinizi girin"
                  className="border-0 border-bottom bg-light rounded-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId="password" className="mb-4">
                <Form.Label className="fw-bold small text-muted">Şifre</Form.Label>
                <Form.Control
                  type="password"
                  size="lg"
                  placeholder="Şifrenizi girin"
                  className="border-0 border-bottom bg-light rounded-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 fw-bold py-3 mt-3" disabled={loading}>
                Giriş Yap
              </Button>
            </Form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted">Yeni Müşteri misin?</span>{' '}
              <Link to="/kayit-ol" className="fw-bold text-primary text-decoration-none">Hemen Kayıt Ol</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default GirisYap;