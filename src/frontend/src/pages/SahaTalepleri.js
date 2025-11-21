// src/pages/SahaTalepleri.js

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';

function SahaTalepleri() {
  const [talepler, setTalepler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.user) {
      window.location.href = '/giris-yap';
      return;
    }

    // Super admin kontrolü
    const user = auth.user;
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const roleDetails = Array.isArray(user.role_details) ? user.role_details : [];
    const isSuperAdmin = userRoles.includes('superuser') ||
      roleDetails.some((role) => {
        const name = (role?.role_name || role?.name || '').toLowerCase();
        return name.includes('admin') || name.includes('super');
      });

    if (!isSuperAdmin) {
      navigate('/');
      return;
    }

    fetchTalepler();
  }, [navigate]);

  const fetchTalepler = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/fields/pending');
      let allFields = data.data ? data.data : data;
      setTalepler(Array.isArray(allFields) ? allFields : []);
      setError(null);
    } catch (err) {
      console.error("Hata:", err);
      setError(err.response?.data?.error?.description || 'Talepler yüklenemedi.');
      setTalepler([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (fieldId, status) => {
    try {
      setProcessing({ ...processing, [fieldId]: true });
      await apiClient.post('/fields/approve', {
        _id: fieldId,
        approval_status: status
      });
      // Başarılı oldu, listeyi yenile
      await fetchTalepler();
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message || 'İşlem başarısız oldu.';
      setErrorModal({ show: true, message });
    } finally {
      setProcessing({ ...processing, [fieldId]: false });
    }
  };

  const resolvePhotoUrl = (photos) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop';
    }
    return photos[0];
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Saha Ekleme Talepleri</h2>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {talepler.length === 0 ? (
            <Alert variant="info" className="text-center">
              <strong>Henüz bekleyen talep yok.</strong>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Fotoğraf</th>
                    <th>Saha Adı</th>
                    <th>Şehir</th>
                    <th>Saha Sahibi</th>
                    <th>Saatlik Ücret</th>
                    <th>Özellikler</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {talepler.map((talep) => (
                    <tr key={talep._id}>
                      <td>
                        <img
                          src={resolvePhotoUrl(talep.photos)}
                          alt={talep.name}
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td>
                        <strong>{talep.name}</strong>
                        {talep.address && (
                          <div className="text-muted small">{talep.address}</div>
                        )}
                      </td>
                      <td>{talep.city}</td>
                      <td>
                        {talep.tenant_id ? (
                          typeof talep.tenant_id === 'object' ? (
                            <>
                              {talep.tenant_id.first_name} {talep.tenant_id.last_name}
                              <div className="text-muted small">{talep.tenant_id.email}</div>
                            </>
                          ) : (
                            <span className="text-muted">Yükleniyor...</span>
                          )
                        ) : (
                          <span className="text-muted">Bilinmeyen</span>
                        )}
                      </td>
                      <td>
                        <Badge bg="success">{talep.price_per_hour} ₺</Badge>
                      </td>
                      <td>
                        {talep.features && talep.features.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {talep.features.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} bg="secondary" className="small">
                                {feature}
                              </Badge>
                            ))}
                            {talep.features.length > 3 && (
                              <Badge bg="light" text="dark" className="small">
                                +{talep.features.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(talep._id, 'approved')}
                            disabled={processing[talep._id]}
                          >
                            {processing[talep._id] ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              'Onayla'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleApprove(talep._id, 'rejected')}
                            disabled={processing[talep._id]}
                          >
                            {processing[talep._id] ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              'Reddet'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

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

export default SahaTalepleri;

