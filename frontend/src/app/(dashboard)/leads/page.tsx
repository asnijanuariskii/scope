'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import LeadTable from '@/components/leads/LeadTable';
import LeadFilters from '@/components/leads/LeadFilters';
import Pagination from '@/components/shared/Pagination';
import { useLeads, type LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import api from '@/services/api';
import type { TipeLead } from '@/types';

export default function LeadsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<LeadFiltersType>({ page: 1, limit: 10 });
  const { data, isLoading, error } = useLeads(filters);

  const { data: tipeLeads } = useQuery<TipeLead[]>({
    queryKey: ['tipe-leads'],
    queryFn: async () => { const { data: res } = await api.get<{ success: boolean; data: TipeLead[] }>('/lead-types'); return res.data; },
  });

  const tipeOptions = (tipeLeads ?? []).map((t) => ({ value: t.id, label: t.nama }));
  const startIndex = ((filters.page ?? 1) - 1) * (filters.limit ?? 10);

  const handleFilterChange = useCallback((f: LeadFiltersType) => setFilters({ ...f, page: 1, limit: 10 }), []);
  const handlePageChange = useCallback((p: number) => setFilters((prev) => ({ ...prev, page: p })), []);
  const handleRowClick = useCallback((id: string) => router.push(`/leads/${id}`), [router]);

  return (
    <div className="ads-card">
      {/* Header: filters + add button */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-N-30">
        <LeadFilters filters={filters} onFilterChange={handleFilterChange} tipeOptions={tipeOptions} />
        <button className="ads-btn">
          <IconPlus size={16} stroke={2} /> Add Lead
        </button>
      </div>

      {/* Content */}
      {isLoading && <p className="text-center text-N-200 py-12">Memuat data...</p>}
      {error && <div className="ads-section-error m-4">Gagal memuat data Lead.</div>}

      {data && (
        <>
          <LeadTable leads={data.data} onRowClick={handleRowClick} startIndex={startIndex} />
          <div className="flex items-center justify-between pt-3 border-t border-N-30">
            <span className="text-body-sm text-N-200">
              {data.total > 0 ? `${startIndex + 1} to ${Math.min(startIndex + (filters.limit ?? 10), data.total)} of ${data.total} entries` : '0 entries'}
            </span>
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  );
}
