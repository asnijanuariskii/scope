import React from 'react';
import type { Activity, ActivityType } from '../../types';

interface ActivityListProps {
  activities: Activity[];
  currentUserId: string;
  onEdit?: (activity: Activity) => void;
}

const TYPE_LABELS: Record<ActivityType, string> = { CALL: 'Call', CHAT: 'Chat', VISIT: 'Visit' };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ActivityList({ activities, currentUserId, onEdit }: ActivityListProps) {
  if (activities.length === 0) return <div className="py-6 text-center text-N-200">Belum ada activity.</div>;

  return (
    <table className="ads-table">
      <thead><tr><th>Tipe</th><th>Notes</th><th>Follow-up Date</th><th>Dibuat Oleh</th><th>Evidence</th>{onEdit && <th>Aksi</th>}</tr></thead>
      <tbody>
        {activities.map((activity) => {
          const isOwner = activity.createdBy === currentUserId;
          return (
            <tr key={activity.id}>
              <td><span className="ads-lozenge bg-information-subtle text-information-text">{TYPE_LABELS[activity.activityType]}</span></td>
              <td className="max-w-[300px] whitespace-pre-wrap">{activity.notes}</td>
              <td>{formatDate(activity.nextFollowUpDate)}</td>
              <td>{activity.creator?.nama ?? activity.createdBy}</td>
              <td>{activity.evidencePath ? <a href={`/api/evidence/${activity.evidencePath}`} target="_blank" rel="noopener noreferrer" className="ads-btn-link text-body-sm">Lihat</a> : <span className="text-N-200">—</span>}</td>
              {onEdit && <td><button type="button" className={`ads-btn-link text-body-sm ${!isOwner ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={!isOwner} onClick={() => isOwner && onEdit(activity)} title={isOwner ? 'Edit activity' : 'Hanya pemilik yang dapat mengedit'}>Edit</button></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
