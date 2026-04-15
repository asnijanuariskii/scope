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
  if (!leads.length) return <p className="text-center text-N-200 py-12">Tidak ada data Lead ditemukan.</p>;

  return (
      <div className="ads-table-wrapper">
      <table className="ads-table">
        <thead><tr>
          <th className="text-center w-12">NO</th><th>TIPE</th><th>NAMA EO/MITRA</th><th>ALAMAT</th><th>PIC</th><th>STATUS</th><th className="w-10"></th>
        </tr></thead>
        <tbody>
          {leads.map((l, i) => {
            const s = latestStatus(l);
            const pic = l.assignments?.find((a) => a.isActive)?.pic;
            return (
              <tr key={l.id} onClick={() => onRowClick(l.id)} className="cursor-pointer">
                <td className="text-center text-N-200">{startIndex + i + 1}</td>
                <td>{l.tipe?.nama ?? '-'}</td>
                <td className="font-medium">{l.namaEo}</td>
                <td className="max-w-[180px] truncate text-N-300">{l.alamat}</td>
                <td>{pic ? <><div className="font-medium">{pic.nama}</div>{pic.phoneNumber && <div className="text-body-sm text-N-200">{pic.phoneNumber}</div>}</> : '-'}</td>
                <td>{s ? <StatusBadge status={s} /> : '-'}</td>
                <td className="text-center">
                  <button onClick={(e) => { e.stopPropagation(); onRowClick(l.id); }}
                    className="text-N-200 hover:text-N-800 p-1 rounded-sm hover:bg-N-20 transition-colors">
                    <IconDots size={16} stroke={1.5} />
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
