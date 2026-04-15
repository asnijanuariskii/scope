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
    <div className="flex flex-wrap items-center gap-3 m3-card p-4 mb-4">
      <div className="relative">
        <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input placeholder="Cari Nama EO..." value={filters.search ?? ''} onChange={(e) => update({ search: e.target.value })}
          className="pl-10 pr-4 py-2.5 text-body-md border border-outline rounded-full outline-none focus:border-primary focus:border-2 w-56 bg-transparent text-on-surface placeholder:text-on-surface-variant" />
      </div>
      <select value={filters.status ?? ''} onChange={(e) => update({ status: e.target.value })}
        className="text-body-md border border-outline rounded-full px-4 py-2.5 outline-none focus:border-primary appearance-none bg-transparent text-on-surface pr-8 cursor-pointer">
        <option value="">Semua Status</option>
        {statusOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.tipe_id ?? ''} onChange={(e) => update({ tipe_id: e.target.value })}
        className="text-body-md border border-outline rounded-full px-4 py-2.5 outline-none focus:border-primary appearance-none bg-transparent text-on-surface pr-8 cursor-pointer">
        <option value="">Semua Tipe</option>
        {tipeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
