import React, { useEffect, useState } from 'react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  const [visible, setVisible] = useState(open);
  const [fade, setFade] = useState('');

  useEffect(() => {
    if (open) {
      setVisible(true);
      setTimeout(() => setFade('modal-fade-in'), 10);
    } else if (visible) {
      setFade('modal-fade-out');
      const timeout = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [open, visible]);

  if (!visible) return null;
  return (
    <div className={`modal-overlay ${fade}`} onClick={onClose}>
      <div
        className={`modal animated ${fade}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
