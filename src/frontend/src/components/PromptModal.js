// src/components/PromptModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function PromptModal({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  confirmText = 'Tamam',
  cancelText = 'İptal'
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (show) {
      setInputValue(defaultValue);
    }
  }, [show, defaultValue]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(inputValue);
    }
    onHide();
    setInputValue('');
  };

  const handleCancel = () => {
    onHide();
    setInputValue('');
  };

  return (
    <Modal 
      show={show} 
      onHide={handleCancel} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header 
        closeButton 
        className="border-0 pb-0 text-danger"
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
              backgroundColor: 'rgba(220, 53, 69, 0.1)'
            }}
          >
            
          </span>
          {title || 'Bilgi Girişi'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        {message && (
          <p className="mb-3" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {message}
          </p>
        )}
        <Form.Group>
          <Form.Control
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
            autoFocus
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          onClick={handleCancel}
          className="px-4"
        >
          {cancelText}
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirm}
          className="px-4"
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PromptModal;

