import React from 'react';
import type { ContactPerson } from '../../types';

interface ContactListProps {
  contacts: ContactPerson[];
  onEdit?: (contact: ContactPerson) => void;
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 600,
  color: '#6b7280',
  background: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#111827',
  borderBottom: '1px solid #f3f4f6',
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontSize: '13px',
  fontWeight: 500,
  padding: 0,
};

export default function ContactList({ contacts, onEdit }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        Belum ada contact person.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Nama</th>
          <th style={thStyle}>Jabatan</th>
          <th style={thStyle}>No. Telp</th>
          {onEdit && <th style={thStyle}>Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id}>
            <td style={tdStyle}>{contact.nama}</td>
            <td style={tdStyle}>{contact.jabatan}</td>
            <td style={tdStyle}>{contact.noTelp}</td>
            {onEdit && (
              <td style={tdStyle}>
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => onEdit(contact)}
                >
                  Edit
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
