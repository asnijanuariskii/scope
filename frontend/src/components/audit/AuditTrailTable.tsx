import React from 'react';
import type { AuditTrail } from '../../types';

interface AuditTrailTableProps {
  auditTrails: AuditTrail[];
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
  verticalAlign: 'top',
};

const entityBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#e0e7ff',
  color: '#3730a3',
};

const diffStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxWidth: '400px',
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatJsonValue(value: Record<string, unknown> | null): string {
  if (value === null || value === undefined) return '—';
  const entries = Object.entries(value);
  if (entries.length === 0) return '—';
  return entries
    .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`)
    .join('\n');
}

function renderDiff(
  prev: Record<string, unknown> | null,
  next: Record<string, unknown> | null,
): React.ReactNode {
  const prevStr = formatJsonValue(prev);
  const nextStr = formatJsonValue(next);
  return (
    <div style={diffStyle}>
      <span style={{ color: '#991b1b' }}>{prevStr}</span>
      {prev && next ? <span style={{ color: '#6b7280' }}>{' → '}</span> : null}
      <span style={{ color: '#166534' }}>{nextStr}</span>
    </div>
  );
}

export default function AuditTrailTable({ auditTrails }: AuditTrailTableProps) {
  if (auditTrails.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        Belum ada audit trail.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Entity</th>
          <th style={thStyle}>Perubahan</th>
          <th style={thStyle}>Diubah Oleh</th>
          <th style={thStyle}>Waktu</th>
        </tr>
      </thead>
      <tbody>
        {auditTrails.map((trail) => (
          <tr key={trail.id}>
            <td style={tdStyle}>
              <span style={entityBadge}>{trail.entityName}</span>
            </td>
            <td style={tdStyle}>
              {renderDiff(trail.previousValue, trail.newValue)}
            </td>
            <td style={tdStyle}>{trail.changer?.nama ?? trail.changedBy}</td>
            <td style={tdStyle}>{formatDateTime(trail.changeTime)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
