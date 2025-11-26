import React, { useMemo, useState } from 'react';
import { Container, Form, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { TURKISH_CITIES } from '../constants/locations';

function SahaEkle() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [features, setFeatures] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const isSuperAdmin = (user) => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const roleDetails = Array.isArray(user.role_details) ? user.role_details : [];
    
    return userRoles.includes('superuser') ||
           roleDetails.some((role) => {
             const name = (role?.role_name || role?.name || '').toLowerCase();
             return name.includes('admin') || name.includes('super');
           });
  };

  const filteredCities = useMemo(() => {
    const value = city.trim().toLowerCase();
    if (!value) return TURKISH_CITIES;
    return TURKISH_CITIES.filter((cityName) =>
      cityName.toLowerCase().includes(value)
    );
  }, [city]);

  const handleCityInput = (e) => {
    setCity(e.target.value);
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setShowCitySuggestions(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!city) {
      setLoading(false);
      setError('Lütfen bir şehir seçin.');
      return;
    }

    const auth = getStoredAuth();
    if (!auth?.user) {
        window.location.href = '/giris-yap';
        return;
    }
    const activeUser = auth.user;

    const payload = {
        tenant_id: activeUser._id,
        name: name.trim(),
        price_per_hour: Number(price) || 0,
        city: city.trim(),
        address: address?.trim() ? address.trim() : city.trim(),
        features: features
          .split(',')
          .map(f => f.trim())
          .filter(Boolean),
        photos: photoUrl && photoUrl.trim() ? [photoUrl.trim()] : [],
        latitude: 0,
        longitude: 0,
        is_active: true
    };

    try {
        await apiClient.post('/fields/add', payload);
        
        if (!isSuperAdmin(activeUser)) {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                navigate('/sahalar');
            }, 3000);
        } else {
            navigate('/sahalar');
        }
        
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
            {success && (
                <Alert variant="info" className="text-center">
                    <strong>Saha ekleme isteğiniz super admin'e iletildi!</strong><br/>
                    Talebiniz onaylandıktan sonra saha yayınlanacaktır. Sayfa yönlendiriliyor...
                </Alert>
            )}
            
            {!success && (
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
                    <Form.Label>Adres (Detaylı)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Mahalle, cadde, sokak ve numara..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                        Şehrin yanı sıra daha detaylı bir lokasyon belirtmek için isteğe bağlıdır.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                    <Form.Label>Şehir</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Şehir adı yazın..."
                        required
                        autoComplete="off"
                        value={city}
                        onChange={handleCityInput}
                        onFocus={() => setShowCitySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                    />
                    {showCitySuggestions && (
                        <Card className="position-absolute w-100 mt-1 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 20 }}>
                            <ListGroup variant="flush">
                                {filteredCities.length === 0 ? (
                                    <ListGroup.Item className="text-muted small">Sonuç bulunamadı</ListGroup.Item>
                                ) : (
                                    filteredCities.map((cityName) => (
                                        <ListGroup.Item
                                            key={cityName}
                                            action
                                            onMouseDown={() => handleCitySelect(cityName)}
                                        >
                                            {cityName}
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                        </Card>
                    )}
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
            )}
        </Card>
    </Container>
  );
}

export default SahaEkle;