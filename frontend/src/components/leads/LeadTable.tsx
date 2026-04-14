import type { Lead } from '../../types';
import { PipelineStatus } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface LeadTableProps { leads: Lead[]; onRowClick: (leadId: string) => void; }

function getLatestStatus(lead: Lead): PipelineStatus | null {
  if (!lead.statuses || lead.statuses.length === 0) return null;
  return [...lead.statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].status;
}

function getActivePic(lead: Lead): string {
  return lead.assignments?.find((a) => a.isActive)?.pic?.nama ?? '-';
}

function formatDate(d: string | null): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadTable({ leads, onRowClick }: LeadTableProps) {
  if (leads.length === 0) return <div className="tds-table__empty">Tidak ada data Lead ditemukan.</div>;

  return (
    <table className="tds-table">
      <thead>
        <tr>
          <th>Nama EO/Mitra</th>
          <th>Tipe</th>
          <th>Status</th>
          <th>Last Activity</th>
          <th>PIC</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const status = getLatestStatus(lead);
          return (
            <tr key={lead.id} className="tds-table__row--clickable" onClick={() => onRowClick(lead.id)}>
              <td>{lead.namaEo}</td>
              <td>{lead.tipe?.nama ?? '-'}</td>
              <td>{status ? <StatusBadge status={status} /> : '-'}</td>
              <td>{formatDate(lead.lastActivityDate)}</td>
              <td>{getActivePic(lead)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
