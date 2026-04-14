import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import { Pagination } from '../components/shared';
import { useLeads, type LeadFilters as LeadFiltersType } from '../hooks/useLeads';
import api from '../services/api';
import type { TipeLead } from '../types';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadFiltersType>({ page: 1, limit: 20 });
  const { data, isLoading, error } = useLeads(filters);

  const { data: tipeLeads } = useQuery<TipeLead[]>({
    queryKey: ['tipe-leads'],
    queryFn: async () => { const { data: res } = await api.get<{ success: boolean; data: TipeLead[] }>('/lead-types'); return res.data; },
  });

  const tipeOptions = (tipeLeads ?? []).map((t) => ({ value: t.id, label: t.nama }));

  return (
    <MainLayout>
      <div className="tds-page-header">
        <h1 className="tds-page-header__title">Daftar EO/Mitra</h1>
      </div>
      <LeadFilters filters={filters} onFilterChange={useCallback((f: LeadFiltersType) => setFilters({ ...f, page: 1, limit: 20 }), [])} tipeOptions={tipeOptions} />
      {isLoading && <div className="tds-loading">Memuat data...</div>}
      {error && <div className="tds-error">Gagal memuat data Lead. Silakan coba lagi.</div>}
      {data && (
        <>
          <LeadTable leads={data.data} onRowClick={useCallback((id: string) => navigate(`/leads/${id}`), [navigate])} />
          <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={useCallback((p: number) => setFilters((prev) => ({ ...prev, page: p })), [])} />
        </>
      )}
    </MainLayout>
  );
}
