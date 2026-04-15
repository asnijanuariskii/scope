import type { Lead } from '@/types';
import { PipelineStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { IconDots } from '@tabler/icons-react';

interface Props { leads: Lead[]; onRowClick: (id: string) => void; startIndex?: number; }

function latestStatus(l: Lead): PipelineStatus | null {
  if (!l.statuses?.length) return null;
  return [...l.statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].status;
}

export default function LeadTable({ leads, onRowClick, startIndex = 0 }: Props) {
  if (!leads.length) return <p className="text-center text-on-surface-variant py-12">Tidak ada data Lead ditemukan.</p>;

  return (
    <div className="m3-card overflow-hidden">
      <table className="m3-table">
        <thead><tr>
          <th className="text-center w-12">NO</th><th>TIPE</th><th>NAMA EO/MITRA</th><th>ALAMAT</th><th>PIC</th><th>STATUS</th><th className="w-12"></th>
        </tr></thead>
        <tbody>
          {leads.map((l, i) => {
            const s = latestStatus(l);
            const pic = l.assignments?.find((a) => a.isActive)?.pic;
            return (
              <tr key={l.id} onClick={() => onRowClick(l.id)} className="cursor-pointer">
                <td className="text-center text-on-surface-variant">{startIndex + i + 1}</td>
                <td>{l.tipe?.nama ?? '-'}</td>
                <td className="font-semibold">{l.namaEo}</td>
                <td className="max-w-[180px] truncate">{l.alamat}</td>
                <td>{pic ? <><div className="font-semibold">{pic.nama}</div>{pic.phoneNumber && <div className="text-body-sm text-on-surface-variant">{pic.phoneNumber}</div>}</> : '-'}</td>
                <td>{s ? <StatusBadge status={s} /> : '-'}</td>
                <td className="text-center">
                  <button onClick={(e) => { e.stopPropagation(); onRowClick(l.id); }}
                    className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-on-surface/8 transition-colors">
                    <IconDots size={18} stroke={1.5} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
