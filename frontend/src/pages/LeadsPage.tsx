import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import MainLayout from '../components/layout/MainLayout';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import { Pagination, Button } from '../components/shared';
import { useLeads, type LeadFilters as LeadFiltersType } from '../hooks/useLeads';
import api from '../services/api';
import type { TipeLead } from '../types';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadFiltersType>({ page: 1, limit: 10 });
  const { data, isLoading, error } = useLeads(filters);

  const { data: tipeLeads } = useQuery<TipeLead[]>({
    queryKey: ['tipe-leads'],
    queryFn: async () => {
      const { data: res } = await api.get<{ success: boolean; data: TipeLead[] }>('/lead-types');
      return res.data;
    },
  });

  const tipeOptions = (tipeLeads ?? []).map((t) => ({ value: t.id, label: t.nama }));
  const startIndex = ((filters.page ?? 1) - 1) * (filters.limit ?? 10);

  const handleFilterChange = useCallback((f: LeadFiltersType) => {
    setFilters({ ...f, page: 1, limit: 10 });
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setFilters((prev) => ({ ...prev, page: p }));
  }, []);

  const handleRowClick = useCallback((id: string) => {
    navigate(`/leads/${id}`);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="tds-page-header">
        <div />
        <Button className="tds-btn--add" onClick={() => {}}><IconPlus size={16} stroke={2} /> Add Lead</Button>
      </div>

      <LeadFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        tipeOptions={tipeOptions}
      />

      {isLoading && <div className="tds-loading">Memuat data...</div>}
      {error && <div className="tds-error">Gagal memuat data Lead.</div>}

      {data && (
        <>
          <LeadTable leads={data.data} onRowClick={handleRowClick} startIndex={startIndex} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span className="tds-pagination__info">
              {data.total > 0 ? `${startIndex + 1} to ${Math.min(startIndex + (filters.limit ?? 10), data.total)} of ${data.total} entries` : '0 entries'}
            </span>
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </MainLayout>
  );
}
