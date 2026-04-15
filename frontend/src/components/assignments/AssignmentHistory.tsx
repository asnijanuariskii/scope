import React from 'react';
import type { Assignment } from '../../types';

interface AssignmentHistoryProps { assignments: Assignment[]; }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  if (assignments.length === 0) return <div className="py-6 text-center text-N-200">Belum ada riwayat assignment.</div>;

  return (
    <table className="ads-table">
      <thead><tr><th>PIC</th><th>Status</th><th>Tanggal Assign</th><th>Catatan Reassign</th></tr></thead>
      <tbody>
        {assignments.map((a) => (
          <tr key={a.id}>
            <td>{a.pic?.nama ?? a.picId}</td>
            <td><span className={`ads-lozenge ${a.isActive ? 'bg-success-subtle text-success-text' : 'bg-N-30 text-N-400'}`}>{a.isActive ? 'Aktif' : 'Tidak Aktif'}</span></td>
            <td>{formatDate(a.assignedAt)}</td>
            <td>{a.reassignedNotes ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
