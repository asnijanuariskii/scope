import { PipelineStatus } from '../../types';
import type { LeadFilters as LeadFiltersType } from '../../hooks/useLeads';
import { Input, Select } from '../shared';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFilterChange: (filters: LeadFiltersType) => void;
  tipeOptions?: { value: string; label: string }[];
}

const statusOptions = Object.values(PipelineStatus).map((s) => ({ value: s, label: s.replace(/_/g, ' ') }));

export default function LeadFilters({ filters, onFilterChange, tipeOptions = [] }: LeadFiltersProps) {
  const update = (patch: Partial<LeadFiltersType>) => {
    const next = { ...filters, ...patch };
    onFilterChange(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v !== undefined)) as LeadFiltersType);
  };

  return (
    <div className="tds-filters">
      <Input label="Cari Nama EO" placeholder="Ketik nama EO..." value={filters.search ?? ''} onChange={(e) => update({ search: e.target.value })} />
      <Select label="Status" options={statusOptions} placeholder="Semua Status" value={filters.status ?? ''} onChange={(e) => update({ status: e.target.value })} />
      <Select label="Tipe" options={tipeOptions} placeholder="Semua Tipe" value={filters.tipe_id ?? ''} onChange={(e) => update({ tipe_id: e.target.value })} />
    </div>
  );
}
