// src/pages/SahaDetay.js

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate eklendi
import { Container, Row, Col, Card, Image, ListGroup, Alert, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; 

function SahaDetay() {
  const { id: sahaId } = useParams();
  const navigate = useNavigate(); // Yönlendirme için

  const [saha, setSaha] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rezervasyon Form State'leri
  const [tarih, setTarih] = useState('');
  const [saat, setSaat] = useState('');
  const [rezervasyonDurumu, setRezervasyonDurumu] = useState(null); // null, 'success', 'error'
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

  // --- GERÇEK REZERVASYON FONKSİYONU ---
  const rezervasyonYapHandler = async (e) => {
    e.preventDefault();
    
    // 1. Kullanıcı Giriş Kontrolü
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
        alert("Rezervasyon yapmak için lütfen önce giriş yapın!");
        navigate('/giris-yap');
        return;
    }
    const userInfo = JSON.parse(userInfoString);
    // Kullanıcı ID'sini buluyoruz (User objesinin içinde mi yoksa direkt mi?)
    const customerId = userInfo.user ? userInfo.user._id : userInfo._id;

    // 2. Tarih ve Saat Formatlama (Backend'in Anlayacağı Dile Çeviri)
    // Seçilen Saat: "18:00-19:00" -> Başlangıç: "18:00"
    const baslangicSaati = saat.split('-')[0]; 
    
    // "2025-11-21" + "T" + "18:00" -> "2025-11-21T18:00:00" (ISO Formatı)
    const startDateTime = new Date(`${tarih}T${baslangicSaati}:00`);
    
    // Bitiş saati: Başlangıçtan 1 saat sonra
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 1);

    // 3. İstek Hazırlığı
    setFormLoading(true);
    setRezervasyonDurumu(null);

    try {
        const payload = {
            tenant_id: saha.tenant_id || '690a455bd8be2c698c44152e', // Eğer sahada ID yoksa, senin ID'ni yedek olarak kullandım
            field_id: saha._id,
            customer_id: customerId,
            start: startDateTime,
            end: endDateTime,
            price: saha.price_per_hour,
            status: 'pending' // Beklemede
        };

        console.log("Giden Veri:", payload); // Konsoldan kontrol et

        // 4. AXIOS POST İSTEĞİ
        const { data } = await axios.post(`${API_BASE_URL}/reservations/add`, payload);

        console.log("Rezervasyon Cevabı:", data);
        setRezervasyonDurumu('success');
        
        // 3 saniye sonra Profil sayfasına yönlendir
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

  return (
    <Container className="my-4">
      <Link className="btn btn-light my-3" to="/sahalar">
        ← Listeye Geri Dön
      </Link>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          {/* SOL: Saha Bilgileri */}
          <Col md={8}>
            <Image src={saha.photos ? saha.photos[0] : ''} alt={saha.name} fluid rounded className="mb-3" />
            <Card className="mb-3">
                <ListGroup variant="flush">
                    <ListGroup.Item><h3>{saha.name}</h3></ListGroup.Item>
                    <ListGroup.Item><strong>Adres:</strong> {saha.address}</ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Özellikler:</strong>
                        {saha.features && saha.features.length > 0 ? (
                            <ul>{saha.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                        ) : ' Belirtilmemiş'}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
          </Col>
          
          {/* SAĞ: Rezervasyon Formu */}
          <Col md={4}>
            <Card>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Row>
                            <Col>Fiyat:</Col>
                            <Col><strong>{saha.price_per_hour} TL / Saat</strong></Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {rezervasyonDurumu === 'success' ? (
                            <Alert variant="success">
                                ✅ Rezervasyon Başarılı! Profilinize yönlendiriliyorsunuz...
                            </Alert>
                        ) : rezervasyonDurumu === 'error' ? (
                            <Alert variant="danger">
                                ❌ Bir hata oluştu. Lütfen tekrar deneyin.
                            </Alert>
                        ) : (
                            <Form onSubmit={rezervasyonYapHandler}>
                                <Form.Group className="mb-3" controlId="tarih">
                                    <Form.Label>Tarih Seç</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        required
                                        value={tarih}
                                        onChange={(e) => setTarih(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="saat">
                                    <Form.Label>Saat Seç</Form.Label>
                                    <Form.Select 
                                        required
                                        value={saat}
                                        onChange={(e) => setSaat(e.target.value)}
                                    >
                                        <option value="">Saat Seçin...</option>
                                        <option value="18:00-19:00">18:00 - 19:00</option>
                                        <option value="19:00-20:00">19:00 - 20:00</option>
                                        <option value="20:00-21:00">20:00 - 21:00</option>
                                        <option value="21:00-22:00">21:00 - 22:00</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Button 
                                    className="w-100" 
                                    type="submit" 
                                    variant="primary"
                                    disabled={!saha.is_active || formLoading}
                                >
                                    {formLoading ? 'İşleniyor...' : 'Rezervasyon Yap'}
                                </Button>
                            </Form>
                        )}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default SahaDetay;