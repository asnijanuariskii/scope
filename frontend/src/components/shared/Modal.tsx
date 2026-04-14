import React, { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => { if (open) dialogRef.current?.focus(); }, [open]);

  if (!open) return null;

  return (
    <div className="tds-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="tds-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tds-modal__header">
          <h2 id="modal-title" className="tds-modal__title">{title}</h2>
          <button onClick={onClose} className="tds-modal__close" aria-label="Tutup modal">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
