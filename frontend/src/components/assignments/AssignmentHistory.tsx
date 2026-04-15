import React from 'react';
import type { Assignment } from '../../types';

interface AssignmentHistoryProps {
  assignments: Assignment[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  if (assignments.length === 0) {
    return <div className="py-6 text-center text-on-surface-variant">Belum ada riwayat assignment.</div>;
  }

  return (
    <table className="m3-table">
      <thead>
        <tr><th>PIC</th><th>Status</th><th>Tanggal Assign</th><th>Catatan Reassign</th></tr>
      </thead>
      <tbody>
        {assignments.map((a) => (
          <tr key={a.id}>
            <td>{a.pic?.nama ?? a.picId}</td>
            <td>
              <span className={`m3-badge ${a.isActive ? 'bg-g-100 text-g-500' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {a.isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </td>
            <td>{formatDate(a.assignedAt)}</td>
            <td>{a.reassignedNotes ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
