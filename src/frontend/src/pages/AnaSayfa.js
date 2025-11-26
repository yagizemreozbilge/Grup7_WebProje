// src/pages/AnaSayfa.js

import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { TURKISH_CITIES } from '../constants/locations';

// Arka plan görseli
const heroImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Astroturf_pitch.jpg/1280px-Astroturf_pitch.jpg';

function AnaSayfa() {
  const [il, setIl] = useState('');
  const [tarih, setTarih] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const navigate = useNavigate();

  const filteredCities = useMemo(() => {
    const value = il.trim().toLowerCase();
    if (!value) return TURKISH_CITIES;
    return TURKISH_CITIES.filter((city) =>
      city.toLowerCase().includes(value)
    );
  }, [il]);

  const handleIlInput = (e) => {
    setIl(e.target.value);
  };

  const handleCitySelect = (city) => {
    setIl(city);
    setShowCitySuggestions(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (il) params.append('city', il);
    if (tarih) params.append('date', tarih);

    // DÜZELTME: Tırnak işaretleri (backtick) düzeltildi
    navigate(`/sahalar?${params.toString()}`);
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <div
        style={{
          // DÜZELTME: CSS değeri tırnak içine alındı
          backgroundImage: `linear-gradient(to bottom, rgba(33, 37, 41, 0.8), rgba(33, 37, 41, 0.6)), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          paddingBottom: '50px'
        }}
      >
        <Container className="text-center text-white">
          <h1 className="display-3 fw-bold mb-3">HalıSahaMax</h1>
          <p className="lead fs-3 mb-5" style={{ maxWidth: '700px', margin: '0 auto', opacity: 0.9 }}>
            Şehrindeki en iyi sahaları keşfet, takımını kur ve maçın keyfini çıkar.
          </p>
        </Container>
      </div>

      {/* 2. ARAMA MODÜLÜ */}
      <Container style={{ marginTop: '-5rem', position: 'relative', zIndex: 10 }}>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="p-4 shadow-lg border-0 rounded-4">
              <Form onSubmit={submitHandler}>
                <Row className="g-3 align-items-end">
                  
                  {/* İL SEÇİMİ */}
                  <Col md={4}>
                    <Form.Group controlId="ilSelect" className="position-relative">
                      <Form.Label className="fw-bold text-muted small">ŞEHİR</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Şehir adı yazın..."
                        size="lg"
                        className="border-0 bg-light"
                        value={il}
                        onChange={handleIlInput}
                        onFocus={() => setShowCitySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                        autoComplete="off"
                      />
                      {showCitySuggestions && (
                        <Card className="position-absolute w-100 mt-1 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 20 }}>
                          <ListGroup variant="flush">
                            {filteredCities.length === 0 ? (
                              <ListGroup.Item className="text-muted small">Sonuç bulunamadı</ListGroup.Item>
                            ) : (
                              filteredCities.map((city) => (
                                <ListGroup.Item
                                  key={city}
                                  action
                                  onMouseDown={() => handleCitySelect(city)}
                                >
                                  {city}
                                </ListGroup.Item>
                              ))
                            )}
                          </ListGroup>
                        </Card>
                      )}
                    </Form.Group>
                  </Col>

                  {/* TARİH SEÇİMİ */}
                  <Col md={4}>
                    <Form.Group controlId="tarihInput">
                      <Form.Label className="fw-bold text-muted small">TARİH</Form.Label>
                      <Form.Control
                        type="date"
                        size="lg"
                        className="border-0 bg-light"
                        value={tarih}
                        onChange={(e) => setTarih(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  {/* BUTON */}
                  <Col md={3}>
                    <Button
                      variant="success"
                      type="submit"
                      size="lg"
                      className="w-100 fw-bold shadow-sm"
                      style={{ padding: '12px 0' }}
                    >
                      SAHA BUL
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 3. BİLGİLENDİRME (Tasarım Aynı) */}
      <Container className="my-5 py-5">
        <div className="text-center mb-5">
          <h6 className="text-success fw-bold text-uppercase">Süreç Nasıl İşler?</h6>
          <h2 className="fw-bold">3 Adımda Maç Keyfi</h2>
        </div>
        <Row className="text-center g-4">
          <Col md={4}>
            <div className="p-4 h-100">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3 shadow" style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>1</div>
              <h4 className="fw-bold mt-2">Konumunu Seç</h4>
              <p className="text-muted">Şehrini ve ilçeni seçerek sana en yakın sahaları listele.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 h-100">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3 shadow" style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>2</div>
              <h4 className="fw-bold mt-2">Sahayı İncele</h4>
              <p className="text-muted">Saha fotoğraflarına, özelliklerine ve saatlik ücretlerine göz at.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 h-100">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3 shadow" style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>3</div>
              <h4 className="fw-bold mt-2">Rezervasyon Yap</h4>
              <p className="text-muted">Boş saatleri görüntüle ve anında rezervasyonunu oluştur.</p>
            </div>
          </Col>
        </Row>
      </Container>

       {/* 4. AVANTAJLAR (Tasarım Aynı) */}
       <div className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="fw-bold mb-4">Neden HalıSahaMax?</h2>
              <div className="d-flex mb-3">
                 <div className="me-3"><span className="badge bg-primary rounded-pill p-2"></span></div>
                 <div><h5 className="fw-bold">Kolay ve Hızlı</h5><p className="text-muted">Hızlı arayüz ile saniyeler içinde saha bul.</p></div>
              </div>
            </Col>
            <Col md={6}>
               <Card className="border-0 shadow-lg">
                 <Card.Img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Football" className="rounded"/>
               </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default AnaSayfa;