// src/pages/AnaSayfa.js

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Arka plan görseli
const heroImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Astroturf_pitch.jpg/1280px-Astroturf_pitch.jpg';

function AnaSayfa() {
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [tarih, setTarih] = useState('');

  const navigate = useNavigate();

  // 1. İL VE İLÇE VERİLERİNİ TANIMLIYORUZ
  // Buraya istediğin kadar il ve ilçe ekleyebilirsin.
  const sehirVerileri = {
    "Rize": ["Merkez", "Çayeli", "Ardeşen"],
    "Trabzon": ["Merkez", "Of", "Akçaabat", "Yomra"]
  };

  // İl seçildiğinde çalışacak fonksiyon
  const handleIlChange = (e) => {
    setIl(e.target.value);
    setIlce(''); // İl değişirse, seçili ilçeyi sıfırla
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (il) params.append('city', il);
    if (ilce) params.append('district', ilce);
    if (tarih) params.append('date', tarih);

    navigate(`/sahalar?${params.toString()}`);
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <div
        style={{
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
                  <Col md={3}>
                    <Form.Group controlId="ilSelect">
                      <Form.Label className="fw-bold text-muted small">ŞEHİR</Form.Label>
                      <Form.Select
                        size="lg"
                        className="border-0 bg-light"
                        value={il}
                        onChange={handleIlChange}
                      >
                        <option value="">Seçiniz...</option>
                        {/* Object.keys ile şehir isimlerini alıp listeliyoruz */}
                        {Object.keys(sehirVerileri).map((sehirAdi) => (
                          <option key={sehirAdi} value={sehirAdi}>{sehirAdi}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* İLÇE SEÇİMİ (Dinamik) */}
                  <Col md={3}>
                    <Form.Group controlId="ilceSelect">
                      <Form.Label className="fw-bold text-muted small">İLÇE</Form.Label>
                      <Form.Select
                        size="lg"
                        className="border-0 bg-light"
                        value={ilce}
                        onChange={(e) => setIlce(e.target.value)}
                        disabled={!il} // İl seçilmeden ilçe seçilemez
                      >
                        <option value="">
                          {il ? "Tümü" : "Önce Şehir Seçin"}
                        </option>
                        
                        {/* Seçilen ile göre ilçeleri map ediyoruz */}
                        {il && sehirVerileri[il] && sehirVerileri[il].map((ilceAdi) => (
                          <option key={ilceAdi} value={ilceAdi}>{ilceAdi}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* TARİH SEÇİMİ */}
                  <Col md={3}>
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

      {/* 3. BİLGİLENDİRME */}
      <Container className="my-5 py-5">
        <div className="text-center mb-5">
          <h6 className="text-success fw-bold text-uppercase">Süreç Nasıl İşler?</h6>
          <h2 className="fw-bold">3 Adımda Maç Keyfi</h2>
        </div>
        {/* ... (Buralar aynı, değişmedi) ... */}
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

       {/* 4. AVANTAJLAR */}
       <div className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="fw-bold mb-4">Neden HalıSahaMax?</h2>
              <div className="d-flex mb-3">
                 <div className="me-3"><span className="badge bg-primary rounded-pill p-2">✓</span></div>
                 <div><h5 className="fw-bold">Kolay ve Hızlı</h5><p className="text-muted">Hızlı arayüz ile saniyeler içinde saha bul.</p></div>
              </div>
              {/* Diğer avantajlar aynı */}
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