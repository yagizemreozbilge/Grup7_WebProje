// src/pages/KullaniciPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';
import PromptModal from '../components/PromptModal';

const TENANT_KEYWORDS = ['saha', 'tenant'];

const isTenantRole = (name = '') => {
  const normalized = name.toLowerCase();
  return TENANT_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

function KullaniciPanel() {
  const [user, setUser] = useState(null);
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' veya 'cancellation-requests'
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ message: '', type: 'info', title: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ message: '', onConfirm: null, title: '' });
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptModalConfig, setPromptModalConfig] = useState({ message: '', onConfirm: null, title: '', placeholder: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getStoredAuth();
    
    if (auth?.user) {
      setUser(auth.user);
      fetchRezervasyonlar(auth.user._id);
      fetchCancellationRequests();
    } else {
      window.location.href = '/giris-yap';
    }
  }, []);

  const fetchRezervasyonlar = async (userId) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/reservations');
      
      let allReservations = data.data ? data.data : data;
      setRezervasyonlar(allReservations);
      setLoading(false);
    } catch (err) {
      console.error("Hata:", err);
      if (err.response?.status === 403) {
        setRezervasyonlar([]);
      }
      setLoading(false);
    }
  };

  const fetchCancellationRequests = async () => {
    try {
      const { data } = await apiClient.get('/cancellation-requests');
      let requests = data.data ? data.data : data;
      setCancellationRequests(requests);
    } catch (err) {
      console.error("İptal talepleri yüklenirken hata:", err);
      setCancellationRequests([]);
    }
  };

  const showAlert = (message, type = 'info', title = 'Bilgilendirme') => {
    setAlertModalConfig({ message, type, title });
    setShowAlertModal(true);
  };

  const showConfirm = (message, onConfirm, title = 'Onay') => {
    setConfirmModalConfig({ message, onConfirm, title });
    setShowConfirmModal(true);
  };

  const showPrompt = (message, onConfirm, title = 'Bilgi Girişi', placeholder = '') => {
    setPromptModalConfig({ message, onConfirm, title, placeholder });
    setShowPromptModal(true);
  };

  const handleReservationApprove = async (reservationId, status) => {
    try {
      await apiClient.post('/reservations/approve', {
        _id: reservationId,
        status: status // 'confirmed' veya 'cancelled'
      });
      fetchRezervasyonlar(user._id);
      fetchCancellationRequests();
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message || 'İşlem başarısız oldu.';
      showAlert(message, 'danger', 'Hata');
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedReservation) return;

    setCancelLoading(true);
    try {
      await apiClient.post('/cancellation-requests/create', {
        reservation_id: selectedReservation._id,
        reason: cancelReason
      });
      showAlert('İptal talebi başarıyla oluşturuldu. Saha sahibi ve yönetici onayına gönderildi.', 'success', 'Başarılı');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedReservation(null);
      fetchRezervasyonlar(user._id);
      fetchCancellationRequests();
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message || 'İptal talebi oluşturulamadı.';
      showAlert(message, 'danger', 'Hata');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelReview = async (requestId, status, responseMessage = '') => {
    try {
      await apiClient.post('/cancellation-requests/review', {
        _id: requestId,
        status: status,
        response_message: responseMessage
      });
      showAlert(`İptal talebi ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`, 'success', 'Başarılı');
      fetchCancellationRequests();
      fetchRezervasyonlar(user._id);
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message || 'İşlem başarısız oldu.';
      showAlert(message, 'danger', 'Hata');
    }
  };

  const handleWithdrawRequest = (requestId) => {
    showConfirm(
      'İptal talebini geri çekmek istediğinize emin misiniz?',
      async () => {
        try {
          await apiClient.post('/cancellation-requests/withdraw', {
            _id: requestId
          });
          showAlert('İptal talebi başarıyla geri çekildi.', 'success', 'Başarılı');
          fetchCancellationRequests();
          fetchRezervasyonlar(user._id);
        } catch (err) {
          const message = err.response?.data?.error?.description || err.message || 'İşlem başarısız oldu.';
          showAlert(message, 'danger', 'Hata');
        }
      },
      'Onay Gerekli'
    );
  };

  const openCancelModal = (reservation) => {
    const now = new Date();
    const reservationStart = new Date(reservation.start);
    const hoursUntilReservation = (reservationStart - now) / (1000 * 60 * 60);

    if (hoursUntilReservation < 3) {
      showAlert(
        `Rezervasyon saatine 3 saatten az kaldığı için iptal edilemez. Kalan süre: ${Math.round(hoursUntilReservation * 10) / 10} saat`,
        'warning',
        'Uyarı'
      );
      return;
    }

    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'warning', text: 'Beklemede' },
      'confirmed': { bg: 'success', text: 'Onaylandı' },
      'cancelled': { bg: 'danger', text: 'İptal Edildi' },
      'completed': { bg: 'info', text: 'Tamamlandı' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const getCancelRequestStatusBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'warning', text: 'Beklemede' },
      'approved': { bg: 'success', text: 'Onaylandı' },
      'rejected': { bg: 'danger', text: 'Reddedildi' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const canCancelReservation = (reservation) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }
    const now = new Date();
    const reservationStart = new Date(reservation.start);
    const hoursUntilReservation = (reservationStart - now) / (1000 * 60 * 60);
    return hoursUntilReservation >= 3;
  };

  const hasPendingCancelRequest = (reservationId) => {
    return cancellationRequests.some(
      req => String(req.reservation_id?._id || req.reservation_id) === String(reservationId) && req.status === 'pending'
    );
  };

  if (!user) return <Container className="mt-5">Yükleniyor...</Container>;

  const roleDetails = Array.isArray(user.role_details) ? user.role_details : [];
  const isTenant = roleDetails.some((role) => isTenantRole(role.name || ''));

  return (
    <Container className="my-5">
      <h1 className="mb-4">Profilim</h1>
      <Row>
        {/* SOL: Kullanıcı Bilgileri */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">Kullanıcı Bilgileri</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Ad:</strong> {user.first_name} {user.last_name}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
              <ListGroup.Item>
                <strong>Roller:</strong>{' '}
                {roleDetails.length > 0 ? (
                  roleDetails.map((role) => (
                    <Badge
                      key={role.id}
                      bg={isTenantRole(role.name || '') ? 'info' : 'secondary'}
                      className="me-1"
                    >
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <Badge bg={isTenant ? 'info' : 'secondary'}>
                    {isTenant ? 'Saha Sahibi' : 'Oyuncu'}
                  </Badge>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* --- YENİ: SAHA SAHİBİ MENÜSÜ --- */}
          {/* Sadece 'tenant' rolüne sahipse görünür */}
          {isTenant && (
             <Card className="mb-4 shadow-sm border-info">
                <Card.Header className="bg-info text-white">Saha Yönetimi</Card.Header>
                <Card.Body>
                    <p className="small">Yeni bir halı saha ekleyerek kiralamaya başlayın.</p>
                    <Button variant="outline-primary" className="w-100" onClick={() => navigate('/saha-ekle')}>
                        + Yeni Saha Ekle
                    </Button>
                </Card.Body>
             </Card>
          )}
        </Col>
        
        {/* SAĞ: Rezervasyonlar */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>{isTenant ? 'Saha Rezervasyonları' : 'Rezervasyon Geçmişim'}</span>
                <div className="btn-group" role="group">
                  <Button
                    variant={activeTab === 'reservations' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setActiveTab('reservations')}
                  >
                    Rezervasyonlar
                  </Button>
                  <Button
                    variant={activeTab === 'cancellation-requests' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setActiveTab('cancellation-requests')}
                  >
                    İptal Talepleri
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {activeTab === 'reservations' ? (
                loading ? (
                  <Spinner animation="border" />
                ) : rezervasyonlar.length === 0 ? (
                  <Alert variant="light">
                    {isTenant ? 'Henüz sahalarınız için rezervasyon yok.' : 'Henüz rezervasyonunuz yok.'}
                  </Alert>
                ) : (
                  <Table hover responsive>
                  <thead>
                    <tr>
                      {isTenant && <th>Saha</th>}
                      {isTenant && <th>Müşteri</th>}
                      {!isTenant && <th>Saha</th>}
                      <th>Tarih</th>
                      <th>Saat</th>
                      <th>Durum</th>
                      {isTenant && <th>İşlem</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rezervasyonlar.map(rez => {
                      const isMyReservation = String(rez.customer_id?._id || rez.customer_id) === String(user._id);
                      const isMyFieldReservation = isTenant && String(rez.tenant_id) === String(user._id);
                      const canManage = isTenant && isMyFieldReservation && rez.status === 'pending';
                      
                      return (
                        <tr key={rez._id}>
                          {isTenant && (
                            <td>{rez.field_id?.name || 'Bilinmeyen Saha'}</td>
                          )}
                          {isTenant && (
                            <td>
                              {rez.customer_id?.first_name && rez.customer_id?.last_name
                                ? `${rez.customer_id.first_name} ${rez.customer_id.last_name}`
                                : rez.customer_id?.email || 'Bilinmeyen'}
                            </td>
                          )}
                          {!isTenant && (
                            <td>{rez.field_id?.name || 'Bilinmeyen Saha'}</td>
                          )}
                          <td>{new Date(rez.start).toLocaleDateString('tr-TR')}</td>
                          <td>
                            {new Date(rez.start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(rez.end).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td>{getStatusBadge(rez.status)}</td>
                          {isTenant ? (
                            <td>
                              {canManage ? (
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleReservationApprove(rez._id, 'confirmed')}
                                  >
                                    Onayla
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleReservationApprove(rez._id, 'cancelled')}
                                  >
                                    Reddet
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          ) : (
                            <td>
                              {isMyReservation && canCancelReservation(rez) && !hasPendingCancelRequest(rez._id) && (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => openCancelModal(rez)}
                                >
                                  İptal Talebi Oluştur
                                </Button>
                              )}
                              {hasPendingCancelRequest(rez._id) && (
                                <Badge bg="warning">İptal Talebi Beklemede</Badge>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  </Table>
                )
              ) : (
                <div>
                  <h5 className="mb-3">İptal Talepleri</h5>
                  {cancellationRequests.length === 0 ? (
                    <Alert variant="light">Henüz iptal talebi yok.</Alert>
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Saha</th>
                          {isTenant && <th>Müşteri</th>}
                          {!isTenant && <th>Rezervasyon Tarihi</th>}
                          <th>Talep Tarihi</th>
                          <th>Durum</th>
                          {isTenant && <th>İşlem</th>}
                          {!isTenant && <th>Yanıt</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {cancellationRequests.map(req => (
                          <tr key={req._id}>
                            <td>{req.field_id?.name || 'Bilinmeyen'}</td>
                            {isTenant && (
                              <td>
                                {req.customer_id?.first_name && req.customer_id?.last_name
                                  ? `${req.customer_id.first_name} ${req.customer_id.last_name}`
                                  : req.customer_id?.email || 'Bilinmeyen'}
                              </td>
                            )}
                            {!isTenant && req.reservation_id && (
                              <td>
                                {new Date(req.reservation_id.start).toLocaleDateString('tr-TR')} {' '}
                                {new Date(req.reservation_id.start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                              </td>
                            )}
                            <td>{new Date(req.created_at).toLocaleString('tr-TR')}</td>
                            <td>{getCancelRequestStatusBadge(req.status)}</td>
                            {isTenant && req.status === 'pending' ? (
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleCancelReview(req._id, 'approved')}
                                  >
                                    Onayla
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
                                      showPrompt(
                                        'Red nedeni (opsiyonel):',
                                        (message) => {
                                          handleCancelReview(req._id, 'rejected', message || '');
                                        },
                                        'Red Nedeni',
                                        'Red nedeni giriniz...'
                                      );
                                    }}
                                  >
                                    Reddet
                                  </Button>
                                </div>
                              </td>
                            ) : (
                              <td>
                                {!isTenant && req.status === 'pending' && String(req.customer_id?._id || req.customer_id) === String(user._id) ? (
                                  <Button
                                    size="sm"
                                    variant="outline-warning"
                                    onClick={() => handleWithdrawRequest(req._id)}
                                  >
                                    Geri Çek
                                  </Button>
                                ) : (
                                  <>
                                    {req.response_message && (
                                      <small className="text-muted d-block">{req.response_message}</small>
                                    )}
                                    {req.reviewed_by && (
                                      <div>
                                        <small className="text-muted">
                                          {req.status === 'approved' ? 'Onaylayan' : 'Reddeden'}: {' '}
                                          {req.reviewed_by?.first_name} {req.reviewed_by?.last_name}
                                        </small>
                                      </div>
                                    )}
                                  </>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* İptal Talebi Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>İptal Talebi Oluştur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <div className="mb-3">
              <p><strong>Saha:</strong> {selectedReservation.field_id?.name || 'Bilinmeyen'}</p>
              <p><strong>Tarih:</strong> {new Date(selectedReservation.start).toLocaleDateString('tr-TR')}</p>
              <p><strong>Saat:</strong> {new Date(selectedReservation.start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})} - {new Date(selectedReservation.end).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}</p>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>İptal Nedeni (Opsiyonel)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="İptal nedeninizi belirtin..."
            />
          </Form.Group>
          <Alert variant="info" className="small">
            İptal talebiniz saha sahibi ve yönetici onayına gönderilecektir.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleCancelRequest} disabled={cancelLoading}>
            {cancelLoading ? 'Gönderiliyor...' : 'İptal Talebi Oluştur'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Alert Modal */}
      <CustomModal
        show={showAlertModal}
        onHide={() => setShowAlertModal(false)}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        type={alertModalConfig.type}
        confirmText="Tamam"
      />

      {/* Confirm Modal */}
      <CustomModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        type="confirm"
        confirmText="Evet"
        cancelText="Hayır"
        showCancel={true}
      />

      {/* Prompt Modal */}
      <PromptModal
        show={showPromptModal}
        onHide={() => setShowPromptModal(false)}
        onConfirm={promptModalConfig.onConfirm}
        title={promptModalConfig.title}
        message={promptModalConfig.message}
        placeholder={promptModalConfig.placeholder}
        confirmText="Gönder"
        cancelText="İptal"
      />
    </Container>
  );
}

export default KullaniciPanel;