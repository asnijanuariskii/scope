import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconArrowLeft } from '@tabler/icons-react';
import MainLayout from '../components/layout/MainLayout';
import { StatusBadge } from '../components/shared';
import api from '../services/api';
import type { Lead, ApiResponse, ContactPerson, LeadStatus, Activity, Assignment } from '../types';
import { PipelineStatus } from '../types';

type Tab = 'contacts' | 'status' | 'activities' | 'assignment';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');

  const { data: lead, isLoading, error } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => { const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`); return data.data; },
    enabled: !!id,
  });

  if (isLoading) return <MainLayout><div className="tds-loading">Loading lead detail...</div></MainLayout>;
  if (error || !lead) return <MainLayout><div className="tds-error">{error instanceof Error ? error.message : 'Lead tidak ditemukan.'}</div></MainLayout>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contacts', label: 'Contact Persons' },
    { key: 'status', label: 'Status History' },
    { key: 'activities', label: 'Activities' },
    { key: 'assignment', label: 'Assignment Info' },
  ];

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <Link to="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconArrowLeft size={16} stroke={1.5} /> Kembali ke daftar Lead</Link>
      </div>

      <div className="tds-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h1>{lead.namaEo}</h1>
          {lead.statuses && lead.statuses.length > 0 && (
            <StatusBadge status={[...lead.statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].status as PipelineStatus} />
          )}
        </div>
        <div className="tds-info-grid">
          <div><span className="tds-info-grid__label">Tipe: </span><span className="tds-info-grid__value">{lead.tipe?.nama ?? '-'}</span></div>
          <div><span className="tds-info-grid__label">Alamat: </span><span className="tds-info-grid__value">{lead.alamat}</span></div>
          <div><span className="tds-info-grid__label">Speciality: </span><span className="tds-info-grid__value">{lead.speciality ?? '-'}</span></div>
          <div><span className="tds-info-grid__label">Link Sosmed: </span><span className="tds-info-grid__value">{lead.linkSosmed ? <a href={lead.linkSosmed} target="_blank" rel="noopener noreferrer">{lead.linkSosmed}</a> : '-'}</span></div>
        </div>
      </div>

      <div className="tds-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`tds-tabs__item ${activeTab === tab.key ? 'tds-tabs__item--active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tds-card">
        {activeTab === 'contacts' && <ContactsSection contacts={lead.contacts ?? []} />}
        {activeTab === 'status' && <StatusSection statuses={lead.statuses ?? []} />}
        {activeTab === 'activities' && <ActivitiesSection activities={lead.activities ?? []} />}
        {activeTab === 'assignment' && <AssignmentSection assignments={lead.assignments ?? []} />}
      </div>
    </MainLayout>
  );
}

function ContactsSection({ contacts }: { contacts: ContactPerson[] }) {
  if (contacts.length === 0) return <div className="tds-table__empty">Belum ada contact person.</div>;
  return (
    <table className="tds-table">
      <thead><tr><th>Nama</th><th>Jabatan</th><th>No. Telp</th></tr></thead>
      <tbody>{contacts.map((c) => <tr key={c.id}><td>{c.nama}</td><td>{c.jabatan}</td><td>{c.noTelp}</td></tr>)}</tbody>
    </table>
  );
}

function StatusSection({ statuses }: { statuses: LeadStatus[] }) {
  if (statuses.length === 0) return <div className="tds-table__empty">Belum ada riwayat status.</div>;
  const sorted = [...statuses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return (
    <table className="tds-table">
      <thead><tr><th>Status</th><th>Diperbarui oleh</th><th>Tanggal</th></tr></thead>
      <tbody>{sorted.map((s) => <tr key={s.id}><td><StatusBadge status={s.status as PipelineStatus} /></td><td>{s.updater?.nama ?? s.updatedBy}</td><td>{new Date(s.updatedAt).toLocaleString('id-ID')}</td></tr>)}</tbody>
    </table>
  );
}

function ActivitiesSection({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return <div className="tds-table__empty">Belum ada activity.</div>;
  const sorted = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <table className="tds-table">
      <thead><tr><th>Tipe</th><th>Notes</th><th>Follow-up</th><th>Oleh</th><th>Tanggal</th></tr></thead>
      <tbody>{sorted.map((a) => (
        <tr key={a.id}>
          <td><span className="tds-badge tds-badge--blue">{a.activityType}</span></td>
          <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes}</td>
          <td>{new Date(a.nextFollowUpDate).toLocaleDateString('id-ID')}</td>
          <td>{a.creator?.nama ?? a.createdBy}</td>
          <td>{new Date(a.createdAt).toLocaleString('id-ID')}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function AssignmentSection({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) return <div className="tds-table__empty">Belum ada assignment.</div>;
  const sorted = [...assignments].sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  return (
    <table className="tds-table">
      <thead><tr><th>PIC</th><th>Status</th><th>Assigned</th><th>Notes</th></tr></thead>
      <tbody>{sorted.map((a) => (
        <tr key={a.id}>
          <td>{a.pic?.nama ?? a.picId}</td>
          <td><span className={`tds-badge ${a.isActive ? 'tds-badge--green' : 'tds-badge--neutral'}`}>{a.isActive ? 'Aktif' : 'Tidak Aktif'}</span></td>
          <td>{new Date(a.assignedAt).toLocaleString('id-ID')}</td>
          <td>{a.reassignedNotes ?? '—'}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
