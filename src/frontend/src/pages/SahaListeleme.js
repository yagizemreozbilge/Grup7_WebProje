// src/pages/SahaListeleme.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth, hasPermission } from '../utils/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1513171920216-2640d5b5f5c5?auto=format&fit=crop&w=1200&q=80';

const resolvePhotoUrl = (photo) => {
  if (typeof photo !== 'string') return FALLBACK_PHOTO;
  const trimmed = photo.trim();
  if (!trimmed) return FALLBACK_PHOTO;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return FALLBACK_PHOTO;
};

function SahaListeleme() {
  const [sahalar, setSahalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const auth = getStoredAuth();
  const authUserId = auth?.user?._id ? String(auth.user._id) : null;
  const userRoleDetails = Array.isArray(auth?.user?.role_details) ? auth.user.role_details : [];
  const isTenant = userRoleDetails.some((role) => {
    const name = role.name?.toLowerCase() || '';
    return name.includes('saha') || name.includes('tenant');
  });

  const canDeleteField = (field) => {
    if (!auth?.user) return false;
    
    // Admin/superuser kontrolü
    const userRoles = Array.isArray(auth.user.roles) ? auth.user.roles : [];
    const hasDeletePermission = 
      userRoles.includes('fields_delete') || 
      userRoles.includes('superuser') ||
      userRoleDetails.some((role) => {
        const name = role.name?.toLowerCase() || '';
        return name.includes('admin') || name.includes('super');
      });
    
    if (hasDeletePermission) return true;
    
    // Tenant ve sahibi kontrolü
    if (!isTenant) return false;
    
    const tenantId = 
      (field.tenant_id && typeof field.tenant_id === 'object' && field.tenant_id._id) 
        ? String(field.tenant_id._id)
        : field.tenant_id 
          ? String(field.tenant_id)
          : null;
    
    const isOwner = tenantId && authUserId && tenantId === authUserId;
    return isOwner;
  };

  const handleDeleteField = async (field) => {
    if (!canDeleteField(field)) return;
    const confirmed = window.confirm(`"${field.name}" sahasını silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    try {
      setDeletingId(field._id);
      await apiClient.post('/fields/delete', {
        _id: field._id,
        tenant_id:
          (field.tenant_id && field.tenant_id._id) ||
          field.tenant_id ||
          authUserId
      });
      setSahalar((prev) => prev.filter((s) => s._id !== field._id));
    } catch (err) {
      const message =
        err.response?.data?.error?.description ||
        err.message ||
        'Saha silme işlemi başarısız oldu.';
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchSahalar = async () => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams(location.search);
        const arananSehir = searchParams.get('city');
        const arananIlce = searchParams.get('district');

        // DÜZELTME: Backtick kullanıldı
        const auth = getStoredAuth();

        if (!auth?.token) {
          setError('Saha listesini görüntüleyebilmek için lütfen önce giriş yapın.');
          setLoading(false);
          return;
        }

        const { data } = await apiClient.get('/fields');
        
        let gelenVeri = data.data ? data.data : data;

        // FİLTRELEME
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
        if (err.response?.status === 401) {
          setError('Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
        } else if (err.response?.status === 403) {
          setError('Bu listeyi görüntülemek için hesabınıza "fields_view" yetkisi atanmalıdır. Lütfen yönetici ile iletişime geçin.');
        } else {
          setError('Sahalar yüklenirken hata oluştu: ' + err.message);
        }
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
        {location.search && (
          <Button variant="outline-secondary" onClick={filtreleriTemizle}>
            Filtreleri Temizle / Tümünü Göster
          </Button>
        )}
      </div>
      
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
          {sahalar.map((saha) => {
            const hasPhoto = Array.isArray(saha.photos) && saha.photos.length > 0 && saha.photos[0];
            return (
              <Col key={saha._id} sm={12} md={6} lg={4} xl={3}>
                <Card className="my-3 p-3 rounded h-100 shadow-sm border-0">
                  {hasPhoto && (
                    <Card.Img 
                      src={resolvePhotoUrl(saha.photos[0])} 
                      variant="top" 
                      style={{ height: '200px', objectFit: 'cover', borderRadius: '10px' }} 
                    />
                  )}
                  
                  <Card.Body className="d-flex flex-column px-0">
                    <Card.Title as="div" className="mb-2">
                      {/* DÜZELTME: Link backtick ile düzeltildi */}
                      <Link to={`/saha/${saha._id}`} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '1.1rem' }}>
                        <strong>{saha.name}</strong>
                      </Link>
                    </Card.Title>
                    
                    <Card.Text as="h4" className="text-success fw-bold">
                      {saha.price_per_hour} ₺ <small className="text-muted fs-6">/ Saat</small>
                    </Card.Text>
                    
                    <Card.Text as="div" className="mt-auto text-muted small">
                      {/* DÜZELTME: Backtick ile düzeltildi */}
                      📍 {saha.city || saha.address}
                    </Card.Text>

                    {/* DÜZELTME: Link backtick ile düzeltildi */}
                    <Link to={`/saha/${saha._id}`} className="btn btn-primary mt-3 w-100 fw-bold">
                      İncele & Kirala
                    </Link>

                    {canDeleteField(saha) && (
                      <Button
                        variant="outline-danger"
                        className="mt-2 w-100 fw-bold"
                        onClick={() => handleDeleteField(saha)}
                        disabled={deletingId === saha._id}
                      >
                        {deletingId === saha._id ? 'Siliniyor...' : 'Sahayı Sil'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default SahaListeleme;