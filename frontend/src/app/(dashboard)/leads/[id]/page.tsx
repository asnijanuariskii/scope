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

  if (isLoading) return <p className="text-center text-N-200 py-12">Loading...</p>;
  if (error || !lead) return <div className="ads-section-error">Lead tidak ditemukan.</div>;

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
      <Link href="/leads" className="ads-btn-link text-body-sm mb-4 inline-flex">
        <IconArrowLeft size={16} stroke={1.5} /> Kembali
      </Link>

      <div className="ads-card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-heading-lg text-N-800">{lead.namaEo}</h1>
          {latestStatus && <StatusBadge status={latestStatus} />}
        </div>
        <div className="grid grid-cols-2 gap-3 text-body-md">
          <div><span className="text-N-200 font-medium text-body-sm">Tipe: </span>{lead.tipe?.nama ?? '-'}</div>
          <div><span className="text-N-200 font-medium text-body-sm">Alamat: </span>{lead.alamat}</div>
          <div><span className="text-N-200 font-medium text-body-sm">Speciality: </span>{lead.speciality ?? '-'}</div>
          <div><span className="text-N-200 font-medium text-body-sm">Sosmed: </span>{lead.linkSosmed ? <a href={lead.linkSosmed} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{lead.linkSosmed}</a> : '-'}</div>
        </div>
      </div>

      {/* ADS Tabs */}
      <div className="flex border-b-2 border-N-40 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-body-md -mb-[2px] border-b-2 transition-colors ${
              activeTab === t.key
                ? 'font-semibold text-brand border-brand'
                : 'text-N-300 border-transparent hover:text-N-800 hover:border-N-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ads-card p-5">
        {activeTab === 'contacts' && <ContactsTab contacts={lead.contacts ?? []} />}
        {activeTab === 'status' && <StatusTab statuses={lead.statuses ?? []} />}
        {activeTab === 'activities' && <ActivitiesTab activities={lead.activities ?? []} />}
        {activeTab === 'assignment' && <AssignmentTab assignments={lead.assignments ?? []} />}
      </div>
    </>
  );
}


function ContactsTab({ contacts }: { contacts: ContactPerson[] }) {
  if (!contacts.length) return <p className="text-N-200 text-center py-8">Belum ada contact person.</p>;
  return (
    <table className="ads-table">
      <thead><tr><th>Nama</th><th>Jabatan</th><th>No. Telp</th></tr></thead>
      <tbody>{contacts.map((c) => <tr key={c.id}><td>{c.nama}</td><td>{c.jabatan}</td><td>{c.noTelp}</td></tr>)}</tbody>
    </table>
  );
}

function StatusTab({ statuses }: { statuses: LeadStatus[] }) {
  if (!statuses.length) return <p className="text-N-200 text-center py-8">Belum ada riwayat status.</p>;
  const sorted = [...statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return (
    <table className="ads-table">
      <thead><tr><th>Status</th><th>Oleh</th><th>Tanggal</th></tr></thead>
      <tbody>{sorted.map((s) => <tr key={s.id}><td><StatusBadge status={s.status as PipelineStatus} /></td><td>{s.updater?.nama ?? s.updatedBy}</td><td>{new Date(s.updatedAt).toLocaleString('id-ID')}</td></tr>)}</tbody>
    </table>
  );
}

function ActivitiesTab({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="text-N-200 text-center py-8">Belum ada activity.</p>;
  const sorted = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <table className="ads-table">
      <thead><tr><th>Tipe</th><th>Notes</th><th>Follow-up</th><th>Oleh</th></tr></thead>
      <tbody>{sorted.map((a) => <tr key={a.id}><td><span className="ads-lozenge bg-information-subtle text-information-text">{a.activityType}</span></td><td className="max-w-[300px] truncate">{a.notes}</td><td>{new Date(a.nextFollowUpDate).toLocaleDateString('id-ID')}</td><td>{a.creator?.nama ?? a.createdBy}</td></tr>)}</tbody>
    </table>
  );
}

function AssignmentTab({ assignments }: { assignments: Assignment[] }) {
  if (!assignments.length) return <p className="text-N-200 text-center py-8">Belum ada assignment.</p>;
  const sorted = [...assignments].sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  return (
    <table className="ads-table">
      <thead><tr><th>PIC</th><th>Status</th><th>Assigned</th><th>Notes</th></tr></thead>
      <tbody>{sorted.map((a) => <tr key={a.id}><td className="font-medium">{a.pic?.nama ?? a.picId}</td><td><span className={`ads-lozenge ${a.isActive ? 'bg-success-subtle text-success-text' : 'bg-N-30 text-N-400'}`}>{a.isActive ? 'Aktif' : 'Tidak Aktif'}</span></td><td>{new Date(a.assignedAt).toLocaleString('id-ID')}</td><td>{a.reassignedNotes ?? '—'}</td></tr>)}</tbody>
    </table>
  );
}
