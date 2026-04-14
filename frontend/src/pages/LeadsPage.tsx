import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import { Pagination } from '../components/shared';
import { useLeads, type LeadFilters as LeadFiltersType } from '../hooks/useLeads';
import api from '../services/api';
import type { User, TipeLead } from '../types';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<LeadFiltersType>({ page: 1, limit: 20 });

  const { data, isLoading, error } = useLeads(filters);

  // Fetch PIC users for filter dropdown (only for Superior/Superadmin)
  const showPicFilter = user?.role === Role.SUPERADMIN || user?.role === Role.SUPERIOR;
  const { data: users } = useQuery<User[]>({
    queryKey: ['users-pic'],
    queryFn: async () => {
      const { data: res } = await api.get<{ success: boolean; data: { data: User[] } }>('/users', {
        params: { limit: 100 },
      });
      return res.data.data.filter((u) => u.role === Role.PIC && !u.isDeleted);
    },
    enabled: showPicFilter,
  });

  // Fetch tipe lead for filter dropdown
  const { data: tipeLeads } = useQuery<TipeLead[]>({
    queryKey: ['tipe-leads'],
    queryFn: async () => {
      const { data: res } = await api.get<{ success: boolean; data: TipeLead[] }>('/lead-types');
      return res.data;
    },
  });

  const picOptions = (users ?? []).map((u) => ({ value: u.id, label: u.nama }));
  const tipeOptions = (tipeLeads ?? []).map((t) => ({ value: t.id, label: t.nama }));

  const handleFilterChange = useCallback((newFilters: LeadFiltersType) => {
    setFilters({ ...newFilters, page: 1, limit: 20 });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleRowClick = useCallback(
    (leadId: string) => navigate(`/leads/${leadId}`),
    [navigate]
  );

  return (
    <MainLayout>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Daftar EO/Mitra
        </h1>
      </div>

      <LeadFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        picOptions={showPicFilter ? picOptions : []}
        tipeOptions={tipeOptions}
      />

      {isLoading && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
          Memuat data...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px' }}>
          Gagal memuat data Lead. Silakan coba lagi.
        </div>
      )}

      {data && (
        <>
          <LeadTable leads={data.data} onRowClick={handleRowClick} />
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </MainLayout>
  );
}
