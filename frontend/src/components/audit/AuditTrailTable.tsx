import React from 'react';
import type { AuditTrail } from '../../types';

interface AuditTrailTableProps { auditTrails: AuditTrail[]; }

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatJsonValue(value: Record<string, unknown> | null): string {
  if (value === null || value === undefined) return '—';
  const entries = Object.entries(value);
  if (entries.length === 0) return '—';
  return entries.map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`).join('\n');
}

function renderDiff(prev: Record<string, unknown> | null, next: Record<string, unknown> | null): React.ReactNode {
  return (
    <div className="text-body-sm font-mono whitespace-pre-wrap break-words max-w-[400px]">
      <span className="text-danger">{formatJsonValue(prev)}</span>
      {prev && next ? <span className="text-N-200">{' → '}</span> : null}
      <span className="text-success-text">{formatJsonValue(next)}</span>
    </div>
  );
}

export default function AuditTrailTable({ auditTrails }: AuditTrailTableProps) {
  if (auditTrails.length === 0) return <div className="py-6 text-center text-N-200">Belum ada audit trail.</div>;

  return (
    <table className="ads-table">
      <thead><tr><th>Entity</th><th>Perubahan</th><th>Diubah Oleh</th><th>Waktu</th></tr></thead>
      <tbody>
        {auditTrails.map((trail) => (
          <tr key={trail.id}>
            <td><span className="ads-lozenge bg-discovery-subtle text-discovery-text">{trail.entityName}</span></td>
            <td>{renderDiff(trail.previousValue, trail.newValue)}</td>
            <td>{trail.changer?.nama ?? trail.changedBy}</td>
            <td>{formatDateTime(trail.changeTime)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
