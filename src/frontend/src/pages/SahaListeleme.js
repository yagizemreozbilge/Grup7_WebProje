// src/pages/SahaListeleme.js

import React, { useState, useEffect } from 'react'; // <--- 1. "useEffect" kancasını import ettik
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

// 2. API_BASE_URL (Giriş/Kayıt ile aynı olmalı)
const API_BASE_URL = 'http://localhost:5000'; // <-- Backend'in adresi

function SahaListeleme() {
  // 3. "State" (Durum) tanımlamaları
  // Bu sefer, gelen veriyi (sahaları) tutmak için bir "dizi" (array) state'i ([]) kullanıyoruz.
  const [sahalar, setSahalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. "useEffect" KANCASI (HOOK)
  // Bu, "Sayfa ilk yüklendiğinde bir kez çalış" demektir.
  useEffect(() => {
    // "fetchSahalar" adında bir fonksiyon tanımlayıp onu çağırıyoruz.
    const fetchSahalar = async () => {
      try {
        setLoading(true);
        setError(null);

        // 5. AXIOS İLE API İSTEĞİ (GET)
        // Bizim deşifre ettiğimiz link: /fields
        const { data } = await axios.get(`${API_BASE_URL}/fields`);

        // 6. BAŞARIYLA GELİRSE
        setLoading(false);

        // Backend'den gelen "data" (içinde "data" katmanı daha olabilir)
        // Gelen veriyi (ki bu bir dizi olmalı) "sahalar" state'ine kaydediyoruz.
        if (data.data) {
            setSahalar(data.data);
        } else {
            setSahalar(data); // Bazen veri doğrudan gelir
        }

        console.log('Sahalar:', data);

      } catch (err) {
        // 7. HATA OLURSA
        setLoading(false);
        setError('Sahalar yüklenirken bir hata oluştu: ' + err.message);
      }
    };

    fetchSahalar();
  }, []); // <-- [] (boş dizi), bu fonksiyonun "sadece 1 kez" çalışmasını sağlar.

  // 8. GÖRSEL (JSX) KISMI
  return (
    <Container>
      <h1 className="my-4">Halı Sahalar</h1>

      {/* Duruma göre görsel belirleme */}
      {loading ? (
        // Yükleniyorsa "Spinner" (dönen çark) göster
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      ) : error ? (
        // Hata varsa "Alert" (uyarı) göster
        <Alert variant="danger">{error}</Alert>
      ) : (
        // Yüklenme bittiyse ve hata yoksa:
        <Row>
          {sahalar.map((saha) => (
            // "map" fonksiyonu, "sahalar" dizisindeki her bir saha için
            // bir "Col" (sütun) ve "Card" (kart) oluşturur.
            <Col key={saha._id} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded">
                {/* <Card.Img src={saha.photos[0]} variant="top" /> // Eğer fotoğraf varsa */}
                <Card.Body>
                  <Card.Title as="div">
                    {/* /saha/:id linkine yönlendirme */}
                    <Link to={`/saha/${saha._id}`}>
                      <strong>{saha.name}</strong>
                    </Link>
                  </Card.Title>
                  <Card.Text as="h3">
                    {saha.price_per_hour} TL / Saat
                  </Card.Text>
                  <Card.Text as="div">
                    {saha.address}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SahaListeleme;