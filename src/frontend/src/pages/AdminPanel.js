import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';
import apiClient from '../utils/apiClient';
import { getStoredAuth } from '../utils/auth';
import CustomModal from '../components/CustomModal';
import PromptModal from '../components/PromptModal';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ message: '', type: 'info', title: '' });
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptModalConfig, setPromptModalConfig] = useState({ message: '', onConfirm: null, title: '', placeholder: '' });

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.user) {
      setError('Yetkisiz erişim! Lütfen giriş yapın.');
      setLoading(false);
      return;
    }

    const user = auth.user;
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const roleDetails = Array.isArray(user.role_details) ? user.role_details : [];
    const isSuperAdmin = userRoles.some(r => r.key === 'superuser') ||
      roleDetails.some((role) => {
        const name = (role?.role_name || role?.name || '').toLowerCase();
        return name.includes('admin') || name.includes('super');
      });

    if (!isSuperAdmin) {
      setError('Bu sayfaya erişim yetkiniz yok.');
      setLoading(false);
      return;
    }

    fetchUsers();
    fetchCancellationRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const auth = getStoredAuth();
      if (!auth?.token) {
        setError('Yetkisiz erişim! Lütfen giriş yapın.');
        setLoading(false);
        return;
      }

      const { data } = await apiClient.get('/users');
      
      if (data.data) {
        setUsers(data.data);
      } else {
        setUsers(data);
      }
      setLoading(false);

    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error?.message || err.message;
      setError('Kullanıcılar yüklenirken hata: ' + msg);
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

  const showPrompt = (message, onConfirm, title = 'Bilgi Girişi', placeholder = '') => {
    setPromptModalConfig({ message, onConfirm, title, placeholder });
    setShowPromptModal(true);
  };

  const handleCancelReview = async (requestId, status, responseMessage = '') => {
    try {
      setCancelLoading(true);
      await apiClient.post('/cancellation-requests/review', {
        _id: requestId,
        status: status,
        response_message: responseMessage
      });
      showAlert(`İptal talebi ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`, 'success', 'Başarılı');
      fetchCancellationRequests();
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message || 'İşlem başarısız oldu.';
      showAlert(message, 'danger', 'Hata');
    } finally {
      setCancelLoading(false);
    }
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

  return (
    <Container className="my-5">
      <h2 className="mb-4">Admin Paneli</h2>
      
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="users" title="Kullanıcı Yönetimi">
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="bg-dark text-white">
                  <tr>
                    <th>ID</th>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td><small>{user._id}</small></td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || '-'}</td>
                      <td>
                          {user.is_active ? 
                              <Badge bg="success">Aktif</Badge> : 
                              <Badge bg="danger">Pasif</Badge>
                          }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
          
          <Tab eventKey="cancellation-requests" title="İptal Talepleri">
            {cancellationRequests.length === 0 ? (
              <Alert variant="light">Henüz iptal talebi yok.</Alert>
            ) : (
              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="bg-dark text-white">
                  <tr>
                    <th>Saha</th>
                    <th>Müşteri</th>
                    <th>Rezervasyon Tarihi</th>
                    <th>Talep Tarihi</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationRequests.map(req => (
                    <tr key={req._id}>
                      <td>{req.field_id?.name || 'Bilinmeyen'}</td>
                      <td>
                        {req.customer_id?.first_name && req.customer_id?.last_name
                          ? `${req.customer_id.first_name} ${req.customer_id.last_name}`
                          : req.customer_id?.email || 'Bilinmeyen'}
                      </td>
                      <td>
                        {req.reservation_id ? (
                          <>
                            {new Date(req.reservation_id.start).toLocaleDateString('tr-TR')} {' '}
                            {new Date(req.reservation_id.start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                          </>
                        ) : '-'}
                      </td>
                      <td>{new Date(req.created_at).toLocaleString('tr-TR')}</td>
                      <td>{getCancelRequestStatusBadge(req.status)}</td>
                      <td>
                        {req.status === 'pending' ? (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleCancelReview(req._id, 'approved')}
                              disabled={cancelLoading}
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
                              disabled={cancelLoading}
                            >
                              Reddet
                            </Button>
                          </div>
                        ) : (
                          <div>
                            {req.response_message && (
                              <small className="text-muted d-block">{req.response_message}</small>
                            )}
                            {req.reviewed_by && (
                              <small className="text-muted">
                                {req.status === 'approved' ? 'Onaylayan' : 'Reddeden'}: {' '}
                                {req.reviewed_by?.first_name} {req.reviewed_by?.last_name}
                              </small>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        </Tabs>
      )}

      <CustomModal
        show={showAlertModal}
        onHide={() => setShowAlertModal(false)}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        type={alertModalConfig.type}
        confirmText="Tamam"
      />

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

export default AdminPanel;