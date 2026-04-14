import React from 'react';
import type { Lead } from '../../types';
import { PipelineStatus } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface LeadTableProps {
  leads: Lead[];
  onRowClick: (leadId: string) => void;
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

const rowStyle: React.CSSProperties = {
  cursor: 'pointer',
  transition: 'background 0.15s',
};

function getLatestStatus(lead: Lead): PipelineStatus | null {
  if (!lead.statuses || lead.statuses.length === 0) return null;
  const sorted = [...lead.statuses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return sorted[0].status;
}

function getActivePic(lead: Lead): string {
  if (!lead.assignments) return '-';
  const active = lead.assignments.find((a) => a.isActive);
  return active?.pic?.nama ?? '-';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function LeadTable({ leads, onRowClick }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        Tidak ada data Lead ditemukan.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Nama EO/Mitra</th>
          <th style={thStyle}>Tipe</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Last Activity</th>
          <th style={thStyle}>PIC</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const status = getLatestStatus(lead);
          return (
            <tr
              key={lead.id}
              style={rowStyle}
              onClick={() => onRowClick(lead.id)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <td style={tdStyle}>{lead.namaEo}</td>
              <td style={tdStyle}>{lead.tipe?.nama ?? '-'}</td>
              <td style={tdStyle}>
                {status ? <StatusBadge status={status} /> : '-'}
              </td>
              <td style={tdStyle}>{formatDate(lead.lastActivityDate)}</td>
              <td style={tdStyle}>{getActivePic(lead)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
