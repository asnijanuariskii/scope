'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import StatusBadge from '@/components/shared/StatusBadge';
import api from '@/services/api';
import type { Lead, ApiResponse, ContactPerson, LeadStatus, Activity, Assignment } from '@/types';
import { PipelineStatus } from '@/types';

type Tab = 'contacts' | 'status' | 'activities' | 'assignment';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');

  const { data: lead, isLoading, error } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`); return data.data; },
    enabled: !!id,
  });

  if (isLoading) return <p className="text-center text-n-600 py-12">Loading...</p>;
  if (error || !lead) return <p className="text-r-400 bg-r-100 p-4 rounded-lg">Lead tidak ditemukan.</p>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contacts', label: 'Contact Persons' },
    { key: 'status', label: 'Status History' },
    { key: 'activities', label: 'Activities' },
    { key: 'assignment', label: 'Assignment' },
  ];

  const latestStatus = lead.statuses?.length
    ? [...lead.statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].status as PipelineStatus
    : null;

  return (
    <>
      <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-b-400 hover:underline mb-4">
        <IconArrowLeft size={16} stroke={1.5} /> Kembali
      </Link>

      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{lead.namaEo}</h1>
          {latestStatus && <StatusBadge status={latestStatus} />}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-n-600 font-semibold text-xs">Tipe: </span>{lead.tipe?.nama ?? '-'}</div>
          <div><span className="text-n-600 font-semibold text-xs">Alamat: </span>{lead.alamat}</div>
          <div><span className="text-n-600 font-semibold text-xs">Speciality: </span>{lead.speciality ?? '-'}</div>
          <div><span className="text-n-600 font-semibold text-xs">Sosmed: </span>{lead.linkSosmed ? <a href={lead.linkSosmed} target="_blank" rel="noopener noreferrer" className="text-b-400">{lead.linkSosmed}</a> : '-'}</div>
        </div>
      </div>

      <div className="flex border-b-2 border-n-200 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm -mb-[2px] border-b-2 transition-colors ${activeTab === t.key ? 'font-semibold text-brand border-brand' : 'text-n-600 border-transparent hover:text-n-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        {activeTab === 'contacts' && <ContactsTab contacts={lead.contacts ?? []} />}
        {activeTab === 'status' && <StatusTab statuses={lead.statuses ?? []} />}
        {activeTab === 'activities' && <ActivitiesTab activities={lead.activities ?? []} />}
        {activeTab === 'assignment' && <AssignmentTab assignments={lead.assignments ?? []} />}
      </div>
    </>
  );
}

function ContactsTab({ contacts }: { contacts: ContactPerson[] }) {
  if (!contacts.length) return <p className="text-n-600 text-center py-8">Belum ada contact person.</p>;
  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase"><th className="py-3 px-4 text-left">Nama</th><th className="py-3 px-4 text-left">Jabatan</th><th className="py-3 px-4 text-left">No. Telp</th></tr></thead>
      <tbody>{contacts.map((c) => <tr key={c.id} className="border-b border-n-100"><td className="py-3 px-4">{c.nama}</td><td className="py-3 px-4">{c.jabatan}</td><td className="py-3 px-4">{c.noTelp}</td></tr>)}</tbody>
    </table>
  );
}

function StatusTab({ statuses }: { statuses: LeadStatus[] }) {
  if (!statuses.length) return <p className="text-n-600 text-center py-8">Belum ada riwayat status.</p>;
  const sorted = [...statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase"><th className="py-3 px-4 text-left">Status</th><th className="py-3 px-4 text-left">Oleh</th><th className="py-3 px-4 text-left">Tanggal</th></tr></thead>
      <tbody>{sorted.map((s) => <tr key={s.id} className="border-b border-n-100"><td className="py-3 px-4"><StatusBadge status={s.status as PipelineStatus} /></td><td className="py-3 px-4">{s.updater?.nama ?? s.updatedBy}</td><td className="py-3 px-4">{new Date(s.updatedAt).toLocaleString('id-ID')}</td></tr>)}</tbody>
    </table>
  );
}

function ActivitiesTab({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="text-n-600 text-center py-8">Belum ada activity.</p>;
  const sorted = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase"><th className="py-3 px-4 text-left">Tipe</th><th className="py-3 px-4 text-left">Notes</th><th className="py-3 px-4 text-left">Follow-up</th><th className="py-3 px-4 text-left">Oleh</th></tr></thead>
      <tbody>{sorted.map((a) => <tr key={a.id} className="border-b border-n-100"><td className="py-3 px-4"><span className="bg-b-100 text-b-400 text-xs font-semibold px-2.5 py-0.5 rounded">{a.activityType}</span></td><td className="py-3 px-4 max-w-[300px] truncate">{a.notes}</td><td className="py-3 px-4">{new Date(a.nextFollowUpDate).toLocaleDateString('id-ID')}</td><td className="py-3 px-4">{a.creator?.nama ?? a.createdBy}</td></tr>)}</tbody>
    </table>
  );
}

function AssignmentTab({ assignments }: { assignments: Assignment[] }) {
  if (!assignments.length) return <p className="text-n-600 text-center py-8">Belum ada assignment.</p>;
  const sorted = [...assignments].sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase"><th className="py-3 px-4 text-left">PIC</th><th className="py-3 px-4 text-left">Status</th><th className="py-3 px-4 text-left">Assigned</th><th className="py-3 px-4 text-left">Notes</th></tr></thead>
      <tbody>{sorted.map((a) => <tr key={a.id} className="border-b border-n-100"><td className="py-3 px-4 font-semibold">{a.pic?.nama ?? a.picId}</td><td className="py-3 px-4"><span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${a.isActive ? 'bg-g-100 text-g-500' : 'bg-n-100 text-n-600'}`}>{a.isActive ? 'Aktif' : 'Tidak Aktif'}</span></td><td className="py-3 px-4">{new Date(a.assignedAt).toLocaleString('id-ID')}</td><td className="py-3 px-4">{a.reassignedNotes ?? '—'}</td></tr>)}</tbody>
    </table>
  );
}
