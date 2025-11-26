// src/components/CustomModal.js

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function CustomModal({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'danger', 'confirm'
  confirmText = 'Tamam',
  cancelText = 'İptal',
  showCancel = false
}) {
  const getVariant = () => {
    switch(type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'confirm': return 'primary';
      default: return 'primary';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success': return '';
      case 'warning': return '';
      case 'danger': return '';
      case 'confirm': return '';
      default: return '';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header 
        closeButton 
        className={`border-0 pb-0 ${
          type === 'success' ? 'text-success' : 
          type === 'warning' ? 'text-warning' : 
          type === 'danger' ? 'text-danger' : 
          'text-primary'
        }`}
      >
        <Modal.Title className="d-flex align-items-center gap-2">
          <span 
            className="fs-3 fw-bold"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 
                type === 'success' ? 'rgba(25, 135, 84, 0.1)' :
                type === 'warning' ? 'rgba(255, 193, 7, 0.1)' :
                type === 'danger' ? 'rgba(220, 53, 69, 0.1)' :
                'rgba(13, 110, 253, 0.1)'
            }}
          >
            {getIcon()}
          </span>
          {title || 'Bilgilendirme'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <p className="mb-0" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        {showCancel && (
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className="px-4"
          >
            {cancelText}
          </Button>
        )}
        <Button 
          variant={getVariant()} 
          onClick={handleConfirm}
          className="px-4"
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;

