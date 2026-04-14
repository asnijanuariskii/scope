import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { PaginatedResult, Lead } from '../types';

export interface LeadFilters {
  status?: string;
  pic_id?: string;
  tipe_id?: string;
  last_activity_from?: string;
  last_activity_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery<PaginatedResult<Lead>>({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.status) params.status = filters.status;
      if (filters.pic_id) params.pic_id = filters.pic_id;
      if (filters.tipe_id) params.tipe_id = filters.tipe_id;
      if (filters.last_activity_from) params.last_activity_from = filters.last_activity_from;
      if (filters.last_activity_to) params.last_activity_to = filters.last_activity_to;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const { data } = await api.get<{ success: boolean; data: PaginatedResult<Lead> }>('/leads', { params });
      return data.data;
    },
  });
}
