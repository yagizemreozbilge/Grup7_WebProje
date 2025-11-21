// src/pages/SahaListeleme.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';

function SahaListeleme() {
  const [sahalar, setSahalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, field: null });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  // URL'deki bilgileri okumak için (örn: ?city=Trabzon)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSahalar = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. URL'den aranan kriterleri çekiyoruz
        const searchParams = new URLSearchParams(location.search);
        const arananSehir = searchParams.get('city');
        const arananIlce = searchParams.get('district');

        // 2. Veritabanındaki TÜM sahaları çekiyoruz
        const auth = getStoredAuth();
        if (!auth?.token) {
          setError('Saha listesini görüntüleyebilmek için lütfen önce giriş yapın.');
          setLoading(false);
          return;
        }

        const { data } = await apiClient.get('/fields');
        
        // Backend bazen {data: [...]} bazen direkt [...] dönebilir, onu ayarlıyoruz
        let gelenVeri = data.data ? data.data : data;

        // --- 3. FİLTRELEME MANTIĞI (Kalbin Burası) ---
        
        if (arananSehir) {
          gelenVeri = gelenVeri.filter(saha => 
            // Sahanın şehir bilgisini kontrol et. Büyük/küçük harf duyarlılığını kaldır (toLowerCase)
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

        // Filtrelenmiş veriyi kaydet
        setSahalar(gelenVeri);
        setLoading(false);

      } catch (err) {
        setLoading(false);
        setError('Sahalar yüklenirken hata oluştu: ' + err.message);
      }
    };

    fetchSahalar();
  }, [location.search]); // URL her değiştiğinde bu kod tekrar çalışır

  // Yeni arama yapmak için temizleme fonksiyonu
  const filtreleriTemizle = () => {
    navigate('/sahalar');
  };

  const auth = getStoredAuth();
  const authUserId = auth?.user?._id ? String(auth.user._id) : null;
  const userRoleDetails = Array.isArray(auth?.user?.role_details) ? auth.user.role_details : [];
  const isTenant = userRoleDetails.some((role) => {
    const name = role.name?.toLowerCase() || '';
    return name.includes('saha') || name.includes('tenant');
  });

  const canDeleteField = (field) => {
    if (!auth?.user) return false;
    
    const userRoles = Array.isArray(auth.user.roles) ? auth.user.roles : [];
    const hasDeletePermission = 
      userRoles.includes('fields_delete') || 
      userRoles.includes('superuser') ||
      userRoleDetails.some((role) => {
        const name = role.name?.toLowerCase() || '';
        return name.includes('admin') || name.includes('super');
      });
    
    if (hasDeletePermission) return true;
    
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

  const handleDeleteField = (field) => {
    if (!canDeleteField(field)) return;
    setDeleteModal({ show: true, field });
  };

  const confirmDelete = async () => {
    if (!deleteModal.field) return;
    const field = deleteModal.field;

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
      setErrorModal({ show: true, message });
    } finally {
      setDeletingId(null);
      setDeleteModal({ show: false, field: null });
    }
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
          ))}
        </Row>
      )}

      {/* Silme Onay Modal */}
      <CustomModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, field: null })}
        onConfirm={confirmDelete}
        title="Sahayı Sil"
        message={`"${deleteModal.field?.name}" sahasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        type="confirm"
        confirmText="Evet, Sil"
        cancelText="İptal"
        showCancel={true}
      />

      {/* Hata Modal */}
      <CustomModal
        show={errorModal.show}
        onHide={() => setErrorModal({ show: false, message: '' })}
        title="Hata"
        message={errorModal.message}
        type="danger"
        confirmText="Tamam"
      />
    </Container>
  );
}

export default SahaListeleme;