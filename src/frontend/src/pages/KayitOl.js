import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { rolesAPI } from '../services/api';

function KayitOl() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    roles: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Rolleri yükle (backend'den roles endpoint'i varsa)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesAPI.getAll();
        console.log('Roles API Response:', response); // Debug için
        
        // Backend response formatı: { code: 200, data: [...] } veya { success: true, data: [...] }
        const allRoles = response.data || (response.success ? response.data : null);
        
        if (allRoles && Array.isArray(allRoles) && allRoles.length > 0) {
          // ADMIN rolünü filtrele - kayıt olurken sadece USER ve CUSTOMER seçilebilir
          const availableRolesForRegistration = allRoles.filter(role => 
            role.role_name !== 'ADMIN' && role.is_active
          );
          
          if (availableRolesForRegistration.length > 0) {
            setAvailableRoles(availableRolesForRegistration);
            // Varsayılan olarak ilk rolü seç
            setFormData(prev => ({
              ...prev,
              roles: [availableRolesForRegistration[0]._id]
            }));
            setError(''); // Hata mesajını temizle
          } else {
            console.warn('Kayıt için uygun rol bulunamadı.');
            setError('Sistemde kayıt için uygun rol bulunamadı. Lütfen yönetici ile iletişime geçin.');
          }
        } else {
          // Roller yoksa veya boşsa bilgi mesajı göster
          console.warn('Backend\'de hiç rol bulunamadı. Lütfen backend\'de en az bir rol oluşturun.');
          setError('Sistemde henüz rol tanımlanmamış. Lütfen yönetici ile iletişime geçin.');
        }
      } catch (err) {
        console.error('Roller yüklenemedi:', err);
        setError('Roller yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya yönetici ile iletişime geçin.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      // Role seçimi için
      const roleId = value;
      setFormData(prev => ({
        ...prev,
        roles: e.target.checked
          ? [...prev.roles, roleId]
          : prev.roles.filter(id => id !== roleId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasyon
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    // Backend'de roles zorunlu
    if (formData.roles.length === 0) {
      setError('Lütfen en az bir rol seçin');
      setLoading(false);
      return;
    }

    const userData = {
      ...formData,
      roles: formData.roles
    };

    const result = await register(userData);

    if (result.success) {
      // Kayıt başarılı - giriş sayfasına yönlendir
      navigate('/giris-yap', { 
        state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } 
      });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h2>Kayıt Ol</h2>
              </Card.Title>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>Ad *</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        placeholder="Adınız"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Soyad *</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        placeholder="Soyadınız"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>E-posta *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Telefon Numarası</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    placeholder="05XX XXX XX XX"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Şifre *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Şifre en az 6 karakter olmalıdır.
                  </Form.Text>
                </Form.Group>

                {loadingRoles ? (
                  <Form.Group className="mb-3" controlId="formRoles">
                    <Form.Label>Rol Seçin *</Form.Label>
                    <div className="text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                      </div>
                      <small className="text-muted d-block mt-2">Roller yükleniyor...</small>
                    </div>
                  </Form.Group>
                ) : availableRoles.length > 0 ? (
                  <Form.Group className="mb-3" controlId="formRoles">
                    <Form.Label>Rol Seçin *</Form.Label>
                    {availableRoles.map((role) => {
                      // Rol isimlerini Türkçe'ye çevir ve açıklama ekle
                      const roleDisplayName = {
                        'USER': 'Oyuncu',
                        'CUSTOMER': 'Saha Sahibi',
                        'ADMIN': 'Yönetici'
                      }[role.role_name] || role.role_name;

                      const roleDescription = {
                        'USER': 'Rezervasyon yapabilir, top oynayabilir',
                        'CUSTOMER': 'Halı saha sahibi, saha ekleyip yönetebilir',
                        'ADMIN': 'Tüm yetkilere sahip yönetici'
                      }[role.role_name] || '';

                      return (
                        <div key={role._id} className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={`role-${role._id}`}
                            label={
                              <div>
                                <strong>{roleDisplayName}</strong>
                                {roleDescription && (
                                  <small className="text-muted d-block ms-4">
                                    {roleDescription}
                                  </small>
                                )}
                              </div>
                            }
                            value={role._id}
                            checked={formData.roles.includes(role._id)}
                            onChange={handleChange}
                          />
                        </div>
                      );
                    })}
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3" controlId="formRoles">
                    <Form.Label>Rol Seçin *</Form.Label>
                    <Alert variant="warning">
                      Sistemde henüz rol tanımlanmamış. Lütfen yönetici ile iletişime geçin veya backend'de bir rol oluşturun.
                    </Alert>
                  </Form.Group>
                )}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || loadingRoles}
                    size="lg"
                  >
                    {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3">
                <p>
                  Zaten hesabınız var mı?{' '}
                  <Link to="/giris-yap">Giriş Yap</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default KayitOl;