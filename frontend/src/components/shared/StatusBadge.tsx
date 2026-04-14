import React from 'react';
import { PipelineStatus } from '../../types';

interface StatusBadgeProps {
  status: PipelineStatus;
}

const statusConfig: Record<PipelineStatus, { label: string; bg: string; color: string }> = {
  [PipelineStatus.NEW_LEAD]: { label: 'New Lead', bg: '#dbeafe', color: '#1e40af' },
  [PipelineStatus.CONTACTED]: { label: 'Contacted', bg: '#e0e7ff', color: '#3730a3' },
  [PipelineStatus.IN_DISCUSSION]: { label: 'In Discussion', bg: '#fef3c7', color: '#92400e' },
  [PipelineStatus.PITCHING]: { label: 'Pitching', bg: '#ede9fe', color: '#5b21b6' },
  [PipelineStatus.NEGOTIATION]: { label: 'Negotiation', bg: '#fce7f3', color: '#9d174d' },
  [PipelineStatus.ON_HOLD]: { label: 'On Hold', bg: '#f3f4f6', color: '#4b5563' },
  [PipelineStatus.DEAL]: { label: 'Deal', bg: '#d1fae5', color: '#065f46' },
  [PipelineStatus.LOST]: { label: 'Lost', bg: '#fee2e2', color: '#991b1b' },
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      style={{
        ...badgeStyle,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
