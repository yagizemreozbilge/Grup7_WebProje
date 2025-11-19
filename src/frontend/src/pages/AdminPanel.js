// src/pages/AdminPanel.js

import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner, Alert } from 'react-bootstrap'; // Button çıkartıldı (Uyarıyı silmek için)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token; 

      if (!token) {
          setError('Yetkisiz erişim! Lütfen giriş yapın.');
          setLoading(false);
          return;
      }

      const config = {
          headers: {
              // DÜZELTME: Bearer eklendi
              Authorization: `Bearer ${token}` 
          }
      };

      const { data } = await axios.get(`${API_BASE_URL}/users`, config);
      
      if (data.data) {
        setUsers(data.data);
      } else {
        setUsers(data);
      }
      setLoading(false);

    } catch (err) {
      setLoading(false);
      const msg = err.response && err.response.data.error ? err.response.data.error.message : err.message;
      setError('Kullanıcılar yüklenirken hata: ' + msg);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">Admin Paneli - Kullanıcı Yönetimi</h2>
      
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
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
    </Container>
  );
}

export default AdminPanel;