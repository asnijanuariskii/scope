import React from 'react';
import type { Activity, ActivityType } from '../../types';

interface ActivityListProps {
  activities: Activity[];
  currentUserId: string;
  onEdit?: (activity: Activity) => void;
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 600,
  color: '#6b7280',
  background: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#111827',
  borderBottom: '1px solid #f3f4f6',
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontSize: '13px',
  fontWeight: 500,
  padding: 0,
};

const disabledLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: '#9ca3af',
  cursor: 'not-allowed',
};

const TYPE_LABELS: Record<ActivityType, string> = {
  CALL: 'Call',
  CHAT: 'Chat',
  VISIT: 'Visit',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ActivityList({ activities, currentUserId, onEdit }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        Belum ada activity.
      </div>
    );
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Tipe</th>
          <th style={thStyle}>Notes</th>
          <th style={thStyle}>Follow-up Date</th>
          <th style={thStyle}>Dibuat Oleh</th>
          <th style={thStyle}>Evidence</th>
          {onEdit && <th style={thStyle}>Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {activities.map((activity) => {
          const isOwner = activity.createdBy === currentUserId;
          return (
            <tr key={activity.id}>
              <td style={tdStyle}>{TYPE_LABELS[activity.activityType]}</td>
              <td style={{ ...tdStyle, maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                {activity.notes}
              </td>
              <td style={tdStyle}>{formatDate(activity.nextFollowUpDate)}</td>
              <td style={tdStyle}>{activity.creator?.nama ?? activity.createdBy}</td>
              <td style={tdStyle}>
                {activity.evidencePath ? (
                  <a
                    href={`/api/evidence/${activity.evidencePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    Lihat
                  </a>
                ) : (
                  <span style={{ color: '#9ca3af' }}>—</span>
                )}
              </td>
              {onEdit && (
                <td style={tdStyle}>
                  <button
                    type="button"
                    style={isOwner ? linkStyle : disabledLinkStyle}
                    disabled={!isOwner}
                    onClick={() => isOwner && onEdit(activity)}
                    title={isOwner ? 'Edit activity' : 'Hanya pemilik yang dapat mengedit'}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
