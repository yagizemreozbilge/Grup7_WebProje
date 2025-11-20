// src/pages/SahaDetay.js

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Badge, Alert, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; 

function SahaDetay() {
  const { id: sahaId } = useParams();
  const navigate = useNavigate();

  const [saha, setSaha] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rezervasyon Form State'leri
  const [tarih, setTarih] = useState('');
  const [saat, setSaat] = useState('');
  const [rezervasyonDurumu, setRezervasyonDurumu] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchSahaDetay = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/fields/${sahaId}`);
        setLoading(false);
        
        if (data.data) {
            setSaha(data.data);
        } else {
            setSaha(data);
        }
      } catch (err) {
        setLoading(false);
        setError('Saha detayı yüklenirken hata: ' + err.message);
      }
    };
    fetchSahaDetay();
  }, [sahaId]);

  
  const rezervasyonYapHandler = async (e) => {
    e.preventDefault();
    
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
        alert("Rezervasyon yapmak için lütfen önce giriş yapın!");
        navigate('/giris-yap');
        return;
    }
    const userInfo = JSON.parse(userInfoString);
    const customerId = userInfo.user ? userInfo.user._id : userInfo._id;

    const baslangicSaati = saat.split('-')[0]; 
    const startDateTime = new Date(`${tarih}T${baslangicSaati}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1);

    setFormLoading(true);
    setRezervasyonDurumu(null);

    try {
        const payload = {
            tenant_id: saha.tenant_id || '690a455bd8be2c698c44152e',
            field_id: saha._id,
            customer_id: customerId,
            start: startDateTime,
            end: endDateTime,
            price: saha.price_per_hour,
            status: 'pending'
        };

        await axios.post(`${API_BASE_URL}/reservations/add`, payload);
        setRezervasyonDurumu('success');
        
        setTimeout(() => {
            navigate('/panel');
        }, 3000);

    } catch (err) {
        console.error("Rezervasyon Hatası:", err);
        setRezervasyonDurumu('error');
    } finally {
        setFormLoading(false);
    }
  };

  
  if (loading) {
      return (
          <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          </Container>
      );
  }

  
  if (error) {
      return (
          <Container className="my-5">
              <Alert variant="danger">{error}</Alert>
              <Link to="/sahalar" className="btn btn-outline-dark">Listeye Dön</Link>
          </Container>
      );
  }

  return (
    <Container className="my-5">
      {/* Üst Navigasyon */}
      <div className="mb-4">
        <Link to="/sahalar" className="text-decoration-none text-secondary">
          <i className="bi bi-arrow-left"></i> &larr; Tüm Sahalara Dön
        </Link>
      </div>

      <Row>
        {/* --- SOL TARAF: Görsel ve Detaylar --- */}
        <Col lg={8}>
          {/* Büyük Görsel */}
          <div className="position-relative mb-4 shadow rounded-4 overflow-hidden">
            <Image 
                src={saha.photos && saha.photos.length > 0 ? saha.photos[0] : 'https://via.placeholder.com/800x400?text=Gorsel+Yok'} 
                alt={saha.name} 
                fluid 
                style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
            />
            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <h1 className="text-white fw-bold mb-0">{saha.name}</h1>
                <p className="text-white-50 mb-0"><i className="bi bi-geo-alt-fill"></i> {saha.city ? `${saha.city}, ${saha.district}` : ''}</p>
            </div>
          </div>

          {/* Açıklama ve Özellikler */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">Saha Hakkında</h4>
                <p className="text-muted mb-4">
                    {saha.address} adresinde bulunan bu saha, kaliteli zemini ve sosyal imkanlarıyla maçlarınız için ideal bir ortam sunuyor.
                </p>

                <h5 className="fw-bold mb-3">Özellikler & İmkanlar</h5>
                <div className="d-flex flex-wrap gap-2">
                    {saha.features && saha.features.length > 0 ? (
                        saha.features.map((f, i) => (
                            <Badge key={i} bg="light" text="dark" className="border p-2 fs-6 fw-normal">
                                ✅ {f}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted">Özellik belirtilmemiş.</span>
                    )}
                </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* --- SAĞ TARAF: Rezervasyon Kartı (Sticky) --- */}
        <Col lg={4}>
          <div className="sticky-top" style={{ top: '100px', zIndex: 1 }}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="bg-success p-3 text-center text-white">
                    <h5 className="mb-0 fw-bold">Rezervasyon Yap</h5>
                </div>
                <Card.Body className="p-4">
                    {/* Fiyat Gösterimi */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <span className="text-muted">Saatlik Ücret</span>
                        <h3 className="text-success fw-bold mb-0">{saha.price_per_hour} ₺</h3>
                    </div>

                    {/* Durum Mesajları */}
                    {rezervasyonDurumu === 'success' ? (
                        <Alert variant="success" className="text-center">
                            🎉 <strong>İşlem Başarılı!</strong><br/>
                            Rezervasyonunuz alındı. Profilinize yönlendiriliyorsunuz...
                        </Alert>
                    ) : rezervasyonDurumu === 'error' ? (
                        <Alert variant="danger" className="text-center">
                            ❌ <strong>Hata!</strong><br/>
                            Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.
                        </Alert>
                    ) : (
                        /* Form Başlangıcı */
                        <Form onSubmit={rezervasyonYapHandler}>
                            <Form.Group className="mb-3" controlId="tarih">
                                <Form.Label className="fw-bold small text-muted">TARİH SEÇİN</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    required
                                    size="lg"
                                    className="bg-light border-0"
                                    value={tarih}
                                    onChange={(e) => setTarih(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="saat">
                                <Form.Label className="fw-bold small text-muted">SAAT ARALIĞI</Form.Label>
                                <Form.Select 
                                    required
                                    size="lg"
                                    className="bg-light border-0"
                                    value={saat}
                                    onChange={(e) => setSaat(e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="18:00-19:00">18:00 - 19:00</option>
                                    <option value="19:00-20:00">19:00 - 20:00</option>
                                    <option value="20:00-21:00">20:00 - 21:00</option>
                                    <option value="21:00-22:00">21:00 - 22:00</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <div className="d-grid">
                                <Button 
                                    type="submit" 
                                    variant="success" 
                                    size="lg"
                                    className="fw-bold py-3 shadow-sm"
                                    disabled={!saha.is_active || formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> İşleniyor...
                                        </>
                                    ) : 'Hemen Kirala'}
                                </Button>
                            </div>
                            
                            {!saha.is_active && (
                                <div className="text-center mt-2">
                                    <small className="text-danger fw-bold">Bu saha şu an aktif değil.</small>
                                </div>
                            )}
                        </Form>
                    )}
                </Card.Body>
                <Card.Footer className="bg-light text-center py-3">
                    <small className="text-muted">
                        <i className="bi bi-shield-check"></i> Güvenli Ödeme & İade Garantisi
                    </small>
                </Card.Footer>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default SahaDetay;