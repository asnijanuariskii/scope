import type { Lead } from '../../types';
import { PipelineStatus } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface LeadTableProps {
  leads: Lead[];
  onRowClick: (leadId: string) => void;
  startIndex?: number;
}

function getLatestStatus(lead: Lead): PipelineStatus | null {
  if (!lead.statuses || lead.statuses.length === 0) return null;
  return [...lead.statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].status;
}

function getActivePic(lead: Lead): { nama: string; phone: string } | null {
  const active = lead.assignments?.find((a) => a.isActive);
  if (!active?.pic) return null;
  return { nama: active.pic.nama, phone: active.pic.phoneNumber || '' };
}

function formatDate(d: string | null): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadTable({ leads, onRowClick, startIndex = 0 }: LeadTableProps) {
  if (leads.length === 0) return <div className="tds-table__empty">Tidak ada data Lead ditemukan.</div>;

  return (
    <div className="tds-table-card">
      <table className="tds-table">
        <thead>
          <tr>
            <th style={{ width: 48, textAlign: 'center' }}>NO</th>
            <th>TIPE</th>
            <th>NAMA EO/MITRA</th>
            <th>ALAMAT</th>
            <th>PIC</th>
            <th>STATUS</th>
            <th style={{ width: 48, textAlign: 'center' }}>⋯</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => {
            const status = getLatestStatus(lead);
            const pic = getActivePic(lead);
            return (
              <tr key={lead.id} className="tds-table__row--clickable" onClick={() => onRowClick(lead.id)}>
                <td className="tds-table__no">{startIndex + idx + 1}</td>
                <td>{lead.tipe?.nama ?? '-'}</td>
                <td style={{ fontWeight: 600 }}>{lead.namaEo}</td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.alamat}</td>
                <td>
                  {pic ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{pic.nama}</div>
                      {pic.phone && <div style={{ fontSize: 12, color: 'var(--text-low-emphasis)' }}>{pic.phone}</div>}
                    </div>
                  ) : '-'}
                </td>
                <td>{status ? <StatusBadge status={status} /> : '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="tds-table__action-btn" onClick={(e) => { e.stopPropagation(); onRowClick(lead.id); }}>⋯</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
