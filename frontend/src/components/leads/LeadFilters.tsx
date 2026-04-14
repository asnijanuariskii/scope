'use client';

import { PipelineStatus } from '@/types';
import type { LeadFilters as LF } from '@/hooks/useLeads';
import { IconSearch } from '@tabler/icons-react';

interface Props { filters: LF; onFilterChange: (f: LF) => void; tipeOptions?: { value: string; label: string }[]; }

const statusOpts = Object.values(PipelineStatus).map((s) => ({ value: s, label: s.replace(/_/g, ' ') }));

export default function LeadFilters({ filters, onFilterChange, tipeOptions = [] }: Props) {
  const update = (patch: Partial<LF>) => {
    const next = { ...filters, ...patch };
    onFilterChange(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== undefined)) as LF);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-card p-4 mb-4">
      <div className="relative">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-n-400" />
        <input placeholder="Cari Nama EO..." value={filters.search ?? ''} onChange={(e) => update({ search: e.target.value })}
          className="pl-9 pr-3 py-2 text-sm border border-n-200 rounded-full outline-none focus:border-b-400 focus:ring-2 focus:ring-b-100 w-52" />
      </div>
      <select value={filters.status ?? ''} onChange={(e) => update({ status: e.target.value })}
        className="text-sm border border-n-200 rounded-full px-3 py-2 outline-none focus:border-b-400 appearance-none bg-white pr-8">
        <option value="">Semua Status</option>
        {statusOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.tipe_id ?? ''} onChange={(e) => update({ tipe_id: e.target.value })}
        className="text-sm border border-n-200 rounded-full px-3 py-2 outline-none focus:border-b-400 appearance-none bg-white pr-8">
        <option value="">Semua Tipe</option>
        {tipeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
