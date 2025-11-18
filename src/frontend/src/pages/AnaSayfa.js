// src/pages/AnaSayfa.js

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// 1. O "Efsane Halı Saha" fotoğrafını buraya alıyoruz (Adım 9'dan)
const heroImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Astroturf_pitch.jpg/1280px-Astroturf_pitch.jpg';

function AnaSayfa() {
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [tarih, setTarih] = useState(''); // <-- 2. Fatıma'nın tasarımındaki "Tarih" eklendi

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('Aranan:', { il, ilce, tarih });

    // Kullanıcıyı arama sonuçları sayfasına (SahaListeleme) yönlendir
    navigate('/sahalar');
  };

  return (
    <>
      {/* 3. "Hero" Alanı (Fatıma'nın Tasarımından Esinlenildi) */}
      <Container 
        fluid 
        className="p-5 text-center text-white" 
        style={{ 
          // 4. Arka plan resmini ve koyu efekti (gradient) ekliyoruz
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh', // Yükseklik ayarı
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        {/* 5. Fatıma'nın tasarımındaki başlıklar */}
        <h1 className="display-4 fw-bold">Bir Sonraki Maçınız Burada Başlıyor.</h1>
        <p className="lead mt-3 fs-4">
          Yakınınızdaki en kaliteli halı sahaları anında bulun ve rezerve edin.
        </p>
      </Container>

      {/* 6. Arama Modülü (Sayfanın Üstünde, "Hero"nun içinde değil) */}
      {/* Bizim Bootstrap <Card> bileşenimizle (Adım 10) */}
      <Container style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="p-4 shadow-lg"> {/* <-- Gölge eklendi */}
              <Form onSubmit={submitHandler}>
                <Row className="g-3 align-items-end">

                  {/* İl Seçimi */}
                  <Col md={4}>
                    <Form.Group controlId="ilSelect">
                      <Form.Label>İl</Form.Label>
                      <Form.Select 
                        value={il} 
                        onChange={(e) => setIl(e.target.value)}
                      >
                        <option value="">İl seçin</option>
                        <option value="Rize">Rize</option>
                        <option value="Trabzon">Trabzon</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* İlçe Seçimi */}
                  <Col md={4}>
                    <Form.Group controlId="ilceSelect">
                      <Form.Label>İlçe</Form.Label>
                      <Form.Select 
                        value={ilce} 
                        onChange={(e) => setIlce(e.target.value)}
                      >
                        <option value="">İlçe seçin</option>
                        <option value="Merkez">Merkez</option>
                        <option value="Çayeli">Çayeli</option>
                        <option value="Of" > Of</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* 7. Tarih (Fatıma'nın tasarımından eklendi) */}
                  <Col md={2}>
                    <Form.Group controlId="tarihInput">
                      <Form.Label>Tarih</Form.Label>
                      <Form.Control 
                        type="date"
                        value={tarih}
                        onChange={(e) => setTarih(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  {/* Arama Butonu */}
                  <Col md={2}>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100"
                    >
                      Saha Bul
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 8. Sayfanın geri kalanı (3 Adım, Popüler Sahalar vb.) */}
      {/* Cuma'ya (21 Kasım) yetişmek için buraları şimdilik boş bırakıyoruz */}
      <Container className="my-5 py-5">
         {/* (Buraya Fatıma'nın tasarımındaki "3 Adım" veya "Popüler Sahalar" eklenebilir) */}
      </Container>
    </>
  );
}

export default AnaSayfa;