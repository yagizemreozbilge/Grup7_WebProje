// src/pages/SahaDetay.js

import React, { useState, useEffect } from 'react';
// 1. YENİ: "useParams" (Adres çubuğundan ID okumak için)
// 1. YENİ: "Link" (Listeye geri dönmek için)
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Image, ListGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

// 2. API_BASE_URL (Giriş/Kayıt ile aynı olmalı)
const API_BASE_URL = 'http://localhost:5000'; // <-- Backend'in adresi

function SahaDetay() {
  // 3. YENİ: "useParams" kancasını çağırıyoruz
  // Bu, App.js'teki /saha/:id yolundaki "id"yi bize verir
  const { id: sahaId } = useParams();

  // 4. "State" (Durum) tanımlamaları
  // Bu sefer tek bir "obje" ({}) state'i tutuyoruz
  const [saha, setSaha] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 5. "useEffect" KANCASI (HOOK)
  // Bu, "Sayfa ilk yüklendiğinde" veya "sahaId değiştiğinde" çalışır
  useEffect(() => {
    const fetchSahaDetay = async () => {
      try {
        setLoading(true);
        setError(null);

        // 6. AXIOS İLE API İSTEĞİ (GET)
        // Gökçe'nin eklemesi gereken link: /fields/:id
        const { data } = await axios.get(`${API_BASE_URL}/fields/${sahaId}`);

        setLoading(false);

        // Gelen veriyi (data.data veya data) "saha" state'ine kaydediyoruz
        if (data.data) {
            setSaha(data.data);
        } else {
            setSaha(data);
        }

        console.log('Saha Detayı:', data);

      } catch (err) {
        setLoading(false);
        setError('Saha detayı yüklenirken bir hata oluştu: ' + err.message);
      }
    };

    fetchSahaDetay();
  }, [sahaId]); // <-- [sahaId] = "sahaId değişirse bu fonksiyonu tekrar çalıştır"

  // 7. GÖRSEL (JSX) KISMI
  return (
    <Container className="my-4">
      {/* Geri Dön Linki */}
      <Link className="btn btn-light my-3" to="/sahalar">
        Listeye Geri Dön
      </Link>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        // Yüklenme bittiyse ve hata yoksa:
        <Row>
          <Col md={6}>
            {/* 8. Fotoğraf (Eğer varsa) */}
            <Image src={saha.photos ? saha.photos[0] : ''} alt={saha.name} fluid rounded />
          </Col>

          <Col md={6}>
            {/* 9. Detaylar */}
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h1>{saha.name}</h1>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Adres:</strong> {saha.address}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Fiyat:</strong> {saha.price_per_hour} TL / Saat
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Özellikler:</strong>
                  {/* Özellikler bir dizi (array) ise: */}
                  {saha.features && saha.features.length > 0 ? (
                    <ul>
                      {saha.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    'Özellik bilgisi yok'
                  )}
                </ListGroup.Item>
                {/* TODO: Buraya Rezervasyon Takvimi/Butonu gelecek */}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default SahaDetay;