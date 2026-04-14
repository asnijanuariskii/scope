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
  if (!leads.length) return <p className="text-center text-n-600 py-12">Tidak ada data Lead ditemukan.</p>;

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase tracking-wide">
          <th className="py-4 px-4 text-center w-12">NO</th><th className="py-4 px-4 text-left">TIPE</th><th className="py-4 px-4 text-left">NAMA EO/MITRA</th><th className="py-4 px-4 text-left">ALAMAT</th><th className="py-4 px-4 text-left">PIC</th><th className="py-4 px-4 text-left">STATUS</th><th className="py-4 px-4 w-12"></th>
        </tr></thead>
        <tbody>
          {leads.map((l, i) => {
            const s = latestStatus(l);
            const pic = l.assignments?.find((a) => a.isActive)?.pic;
            return (
              <tr key={l.id} onClick={() => onRowClick(l.id)} className="border-b border-n-100 cursor-pointer hover:bg-n-100 transition-colors">
                <td className="py-4 px-4 text-center text-n-600">{startIndex + i + 1}</td>
                <td className="py-4 px-4">{l.tipe?.nama ?? '-'}</td>
                <td className="py-4 px-4 font-semibold">{l.namaEo}</td>
                <td className="py-4 px-4 max-w-[180px] truncate">{l.alamat}</td>
                <td className="py-4 px-4">{pic ? <><div className="font-semibold">{pic.nama}</div>{pic.phoneNumber && <div className="text-xs text-n-600">{pic.phoneNumber}</div>}</> : '-'}</td>
                <td className="py-4 px-4">{s ? <StatusBadge status={s} /> : '-'}</td>
                <td className="py-4 px-4 text-center"><button onClick={(e) => { e.stopPropagation(); onRowClick(l.id); }} className="text-n-400 hover:text-n-800 p-1 rounded hover:bg-n-100"><IconDots size={18} stroke={1.5} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
