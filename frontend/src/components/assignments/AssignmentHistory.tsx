import React from 'react';
import type { Assignment } from '../../types';

interface AssignmentHistoryProps {
  assignments: Assignment[];
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

const activeBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#dcfce7',
  color: '#166534',
};

const inactiveBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#f3f4f6',
  color: '#6b7280',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  if (assignments.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        Belum ada riwayat assignment.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>PIC</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Tanggal Assign</th>
          <th style={thStyle}>Catatan Reassign</th>
        </tr>
      </thead>
      <tbody>
        {assignments.map((a) => (
          <tr key={a.id}>
            <td style={tdStyle}>{a.pic?.nama ?? a.picId}</td>
            <td style={tdStyle}>
              <span style={a.isActive ? activeBadge : inactiveBadge}>
                {a.isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </td>
            <td style={tdStyle}>{formatDate(a.assignedAt)}</td>
            <td style={tdStyle}>{a.reassignedNotes ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
