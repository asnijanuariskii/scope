import React from 'react';
import type { ContactPerson } from '../../types';

interface ContactListProps {
  contacts: ContactPerson[];
  onEdit?: (contact: ContactPerson) => void;
}

export default function ContactList({ contacts, onEdit }: ContactListProps) {
  if (contacts.length === 0) {
    return <div className="py-6 text-center text-on-surface-variant">Belum ada contact person.</div>;
  }

  return (
    <table className="m3-table">
      <thead>
        <tr>
          <th>Nama</th><th>Jabatan</th><th>No. Telp</th>
          {onEdit && <th>Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id}>
            <td>{contact.nama}</td>
            <td>{contact.jabatan}</td>
            <td>{contact.noTelp}</td>
            {onEdit && (
              <td>
                <button type="button" className="m3-btn-text h-8 px-2 text-label-md text-primary" onClick={() => onEdit(contact)}>Edit</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
