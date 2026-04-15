'use client';

import { PipelineStatus } from '@/types';
import type { LeadFilters as LF } from '@/hooks/useLeads';
import { IconSearch } from '@tabler/icons-react';
import Select from '@/components/shared/Select';

interface Props { filters: LF; onFilterChange: (f: LF) => void; tipeOptions?: { value: string; label: string }[]; }

const statusOpts = Object.values(PipelineStatus).map((s) => ({ value: s, label: s.replace(/_/g, ' ') }));

export default function LeadFilters({ filters, onFilterChange, tipeOptions = [] }: Props) {
  const update = (patch: Partial<LF>) => {
    const next = { ...filters, ...patch };
    onFilterChange(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== undefined)) as LF);
  };

  return (
    <div className="flex flex-wrap items-end gap-2 [&_.mb-3]:mb-0">
      <div className="relative">
        <IconSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-N-200" />
        <input placeholder="Cari Nama EO..." value={filters.search ?? ''} onChange={(e) => update({ search: e.target.value })}
          className="ads-input pl-8 w-52" />
      </div>
      <div className="w-48">
        <Select
          options={statusOpts}
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value })}
          placeholder="Semua Status"
        />
      </div>
      <div className="w-48">
        <Select
          options={tipeOptions}
          value={filters.tipe_id ?? ''}
          onChange={(e) => update({ tipe_id: e.target.value })}
          placeholder="Semua Tipe"
        />
      </div>
    </div>
  );
}
