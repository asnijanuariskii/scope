import { PipelineStatus } from '../../types';
import type { LeadFilters as LeadFiltersType } from '../../hooks/useLeads';
import { Input, Select } from '../shared';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFilterChange: (filters: LeadFiltersType) => void;
  picOptions?: { value: string; label: string }[];
  tipeOptions?: { value: string; label: string }[];
}

const statusOptions = Object.values(PipelineStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' '),
}));

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  alignItems: 'flex-end',
  marginBottom: '16px',
  padding: '16px',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

export default function LeadFilters({ filters, onFilterChange, picOptions = [], tipeOptions = [] }: LeadFiltersProps) {
  const update = (patch: Partial<LeadFiltersType>) => {
    const next = { ...filters, ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== '' && v !== undefined)
    ) as LeadFiltersType;
    onFilterChange(cleaned);
  };

  return (
    <div style={containerStyle}>
      <Input
        label="Cari Nama EO"
        placeholder="Ketik nama EO..."
        value={filters.search ?? ''}
        onChange={(e) => update({ search: e.target.value })}
      />

      <Select
        label="Status"
        options={statusOptions}
        placeholder="Semua Status"
        value={filters.status ?? ''}
        onChange={(e) => update({ status: e.target.value })}
      />

      {picOptions.length > 0 && (
        <Select
          label="PIC"
          options={picOptions}
          placeholder="Semua PIC"
          value={filters.pic_id ?? ''}
          onChange={(e) => update({ pic_id: e.target.value })}
        />
      )}

      <Select
        label="Tipe"
        options={tipeOptions}
        placeholder="Semua Tipe"
        value={filters.tipe_id ?? ''}
        onChange={(e) => update({ tipe_id: e.target.value })}
      />
    </div>
  );
}
