import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import { StatusBadge } from '../components/shared';
import api from '../services/api';
import type { Lead, ApiResponse, ContactPerson, LeadStatus, Activity, Assignment, PipelineStatus } from '../types';

type Tab = 'contacts' | 'status' | 'activities' | 'assignment';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');

  const { data: lead, isLoading, error } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          Loading lead detail...
        </div>
      </MainLayout>
    );
  }

  if (error || !lead) {
    return (
      <MainLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>
          {error instanceof Error ? error.message : 'Lead tidak ditemukan.'}
        </div>
      </MainLayout>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contacts', label: 'Contact Persons' },
    { key: 'status', label: 'Status History' },
    { key: 'activities', label: 'Activities' },
    { key: 'assignment', label: 'Assignment Info' },
  ];

  return (
    <MainLayout>
      <div style={{ marginBottom: 16 }}>
        <Link to="/leads" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
          ← Kembali ke daftar Lead
        </Link>
      </div>

      {/* Lead Info Header */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{lead.namaEo}</h1>
          {lead.statuses && lead.statuses.length > 0 && (
            <StatusBadge status={lead.statuses[lead.statuses.length - 1].status as PipelineStatus} />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <InfoRow label="Tipe" value={lead.tipe?.nama ?? '-'} />
          <InfoRow label="Alamat" value={lead.alamat} />
          <InfoRow label="Speciality" value={lead.speciality ?? '-'} />
          <InfoRow
            label="Link Sosmed"
            value={
              lead.linkSosmed ? (
                <a href={lead.linkSosmed} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                  {lead.linkSosmed}
                </a>
              ) : '-'
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#2563eb' : '#6b7280',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {activeTab === 'contacts' && <ContactsSection contacts={lead.contacts ?? []} />}
        {activeTab === 'status' && <StatusSection statuses={lead.statuses ?? []} />}
        {activeTab === 'activities' && <ActivitiesSection activities={lead.activities ?? []} />}
        {activeTab === 'assignment' && <AssignmentSection assignments={lead.assignments ?? []} />}
      </div>
    </MainLayout>
  );
}


/* ---- Helper Components ---- */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}: </span>
      <span style={{ color: '#111827' }}>{value}</span>
    </div>
  );
}

function ContactsSection({ contacts }: { contacts: ContactPerson[] }) {
  if (contacts.length === 0) {
    return <p style={{ color: '#6b7280' }}>Belum ada contact person.</p>;
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
          <th style={{ padding: '8px 12px' }}>Nama</th>
          <th style={{ padding: '8px 12px' }}>Jabatan</th>
          <th style={{ padding: '8px 12px' }}>No. Telp</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => (
          <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '8px 12px' }}>{c.nama}</td>
            <td style={{ padding: '8px 12px' }}>{c.jabatan}</td>
            <td style={{ padding: '8px 12px' }}>{c.noTelp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusSection({ statuses }: { statuses: LeadStatus[] }) {
  if (statuses.length === 0) {
    return <p style={{ color: '#6b7280' }}>Belum ada riwayat status.</p>;
  }
  const sorted = [...statuses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
          <th style={{ padding: '8px 12px' }}>Status</th>
          <th style={{ padding: '8px 12px' }}>Diperbarui oleh</th>
          <th style={{ padding: '8px 12px' }}>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((s) => (
          <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '8px 12px' }}>
              <StatusBadge status={s.status as PipelineStatus} />
            </td>
            <td style={{ padding: '8px 12px' }}>{s.updater?.nama ?? s.updatedBy}</td>
            <td style={{ padding: '8px 12px' }}>{new Date(s.updatedAt).toLocaleString('id-ID')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActivitiesSection({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p style={{ color: '#6b7280' }}>Belum ada activity.</p>;
  }
  const sorted = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
          <th style={{ padding: '8px 12px' }}>Tipe</th>
          <th style={{ padding: '8px 12px' }}>Notes</th>
          <th style={{ padding: '8px 12px' }}>Follow-up</th>
          <th style={{ padding: '8px 12px' }}>Oleh</th>
          <th style={{ padding: '8px 12px' }}>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((a) => (
          <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '8px 12px' }}>{a.activityType}</td>
            <td style={{ padding: '8px 12px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {a.notes}
            </td>
            <td style={{ padding: '8px 12px' }}>{new Date(a.nextFollowUpDate).toLocaleDateString('id-ID')}</td>
            <td style={{ padding: '8px 12px' }}>{a.creator?.nama ?? a.createdBy}</td>
            <td style={{ padding: '8px 12px' }}>{new Date(a.createdAt).toLocaleString('id-ID')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AssignmentSection({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) {
    return <p style={{ color: '#6b7280' }}>Belum ada assignment.</p>;
  }
  const sorted = [...assignments].sort(
    (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  );
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
          <th style={{ padding: '8px 12px' }}>PIC</th>
          <th style={{ padding: '8px 12px' }}>Status</th>
          <th style={{ padding: '8px 12px' }}>Assigned</th>
          <th style={{ padding: '8px 12px' }}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((a) => (
          <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '8px 12px' }}>{a.pic?.nama ?? a.picId}</td>
            <td style={{ padding: '8px 12px' }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: a.isActive ? '#d1fae5' : '#f3f4f6',
                color: a.isActive ? '#065f46' : '#6b7280',
              }}>
                {a.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style={{ padding: '8px 12px' }}>{new Date(a.assignedAt).toLocaleString('id-ID')}</td>
            <td style={{ padding: '8px 12px' }}>{a.reassignedNotes ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
