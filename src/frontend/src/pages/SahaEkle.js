// src/pages/SahaEkle.js

import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function SahaEkle() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [features, setFeatures] = useState(''); // Virgülle ayrılmış özellikler
  const [photoUrl, setPhotoUrl] = useState(''); // Tek bir fotoğraf linki şimdilik
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Giriş yapmış kullanıcıyı al
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
        window.location.href = '/giris-yap';
        return;
    }
    const userInfo = JSON.parse(userInfoString);
    const activeUser = userInfo.user || userInfo; // Kullanıcı objesi

    // 2. Backend'e gönderilecek paketi hazırla
    const payload = {
        tenant_id: activeUser._id, // SAHA SAHİBİNİN ID'Sİ (Çok Önemli!)
        name: name,
        price_per_hour: price,
        address: address,
        // Özellikleri virgülle ayırıp dizi yapıyoruz: "Duş, Otopark" -> ["Duş", "Otopark"]
        features: features.split(',').map(f => f.trim()), 
        photos: [photoUrl || 'https://via.placeholder.com/800x400'], // Boşsa varsayılan resim
        latitude: 0, // Şimdilik 0 (Harita sonra)
        longitude: 0, // Şimdilik 0
        is_active: true
    };

    try {
        // 3. İsteği Yolla (POST /fields/add)
        await axios.post(`${API_BASE_URL}/fields/add`, payload);
        
        alert('✅ Saha Başarıyla Eklendi!');
        navigate('/sahalar'); // Listeye yönlendir
        
    } catch (err) {
        setLoading(false);
        const msg = err.response && err.response.data.error ? err.response.data.error.message : err.message;
        setError('Ekleme Başarısız: ' + msg);
    }
  };

  return (
    <Container className="my-5">
        <Card className="p-4 shadow-sm">
            <h2 className="mb-4">Yeni Saha Ekle</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                    <Form.Label>Saha Adı</Form.Label>
                    <Form.Control type="text" placeholder="Örn: Yıldız Halı Saha" required value={name} onChange={e => setName(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Saatlik Ücret (TL)</Form.Label>
                    <Form.Control type="number" placeholder="Örn: 500" required value={price} onChange={e => setPrice(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Adres</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Tam adres..." required value={address} onChange={e => setAddress(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Özellikler (Virgül ile ayırın)</Form.Label>
                    <Form.Control type="text" placeholder="Duş, Kafeterya, Otopark, Servis" value={features} onChange={e => setFeatures(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fotoğraf Linki (URL)</Form.Label>
                    <Form.Control type="text" placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
                    <Form.Text className="text-muted">
                        Şimdilik internetten bir resim linki yapıştırın.
                    </Form.Text>
                </Form.Group>

                <Button variant="success" type="submit" disabled={loading} className="w-100">
                    {loading ? 'Ekleniyor...' : 'Sahayı Kaydet'}
                </Button>
            </Form>
        </Card>
    </Container>
  );
}

export default SahaEkle;