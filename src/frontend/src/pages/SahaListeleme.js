

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

const API_BASE_URL = 'http://localhost:5000';

function SahaListeleme() {
  const [sahalar, setSahalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSahalar = async () => {
      try {
        setLoading(true);
        setError(null);

        
        const searchParams = new URLSearchParams(location.search);
        const arananSehir = searchParams.get('city');
        const arananIlce = searchParams.get('district');

        
        const { data } = await axios.get(`${API_BASE_URL}/fields`);
        
        
        let gelenVeri = data.data ? data.data : data;

        
        
        if (arananSehir) {
          gelenVeri = gelenVeri.filter(saha => 
            
            (saha.city && saha.city.toLowerCase() === arananSehir.toLowerCase()) ||
            (saha.address && saha.address.toLowerCase().includes(arananSehir.toLowerCase()))
          );
        }

        if (arananIlce) {
          gelenVeri = gelenVeri.filter(saha => 
            (saha.district && saha.district.toLowerCase() === arananIlce.toLowerCase()) ||
            (saha.address && saha.address.toLowerCase().includes(arananIlce.toLowerCase()))
          );
        }

        
        setSahalar(gelenVeri);
        setLoading(false);

      } catch (err) {
        setLoading(false);
        setError('Sahalar yüklenirken hata oluştu: ' + err.message);
      }
    };

    fetchSahalar();
  }, [location.search]); 

  
  const filtreleriTemizle = () => {
    navigate('/sahalar');
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Halı Sahalar</h1>
        {/* Eğer filtre varsa "Tümünü Göster" butonu çıkar */}
        {location.search && (
          <Button variant="outline-secondary" onClick={filtreleriTemizle}>
            Filtreleri Temizle / Tümünü Göster
          </Button>
        )}
      </div>
      
      {/* --- SONUÇ YOKSA UYARI VEREN KISIM --- */}
      {!loading && sahalar.length === 0 && (
         <Alert variant="warning" className="text-center p-5">
            <h4><i className="bi bi-exclamation-triangle"></i> Üzgünüz, aradığınız kriterlere uygun saha bulunamadı.</h4>
            <p>Farklı bir il/ilçe seçmeyi deneyebilir veya tüm sahaları inceleyebilirsiniz.</p>
            <Button variant="warning" onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
         </Alert>
      )}

      {loading ? (
        <div className="text-center mt-5">
            <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Yükleniyor...</span>
            </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          {sahalar.map((saha) => (
            <Col key={saha._id} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded h-100 shadow-sm border-0">
                {saha.photos && saha.photos.length > 0 ? (
                     <Card.Img 
                       src={saha.photos[0]} 
                       variant="top" 
                       style={{ height: '200px', objectFit: 'cover', borderRadius: '10px' }} 
                     />
                ) : (
                    <div style={{ height: '200px', backgroundColor: '#eee', borderRadius: '10px', display: 'flex', alignItems:'center', justifyContent:'center', color: '#888' }}>
                        Görsel Yok
                    </div>
                )}
                
                <Card.Body className="d-flex flex-column px-0">
                  <Card.Title as="div" className="mb-2">
                    <Link to={`/saha/${saha._id}`} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '1.1rem' }}>
                      <strong>{saha.name}</strong>
                    </Link>
                  </Card.Title>
                  
                  <Card.Text as="h4" className="text-success fw-bold">
                    {saha.price_per_hour} ₺ <small className="text-muted fs-6">/ Saat</small>
                  </Card.Text>
                  
                  <Card.Text as="div" className="mt-auto text-muted small">
                    📍 {saha.city ? `${saha.city} / ${saha.district}` : saha.address}
                  </Card.Text>

                  <Link to={`/saha/${saha._id}`} className="btn btn-primary mt-3 w-100 fw-bold">
                    İncele & Kirala
                  </Link>
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