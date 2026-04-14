import { PipelineStatus } from '../../types';

interface StatusBadgeProps { status: PipelineStatus; }

const statusConfig: Record<PipelineStatus, { label: string; className: string }> = {
  [PipelineStatus.NEW_LEAD]: { label: 'New Lead', className: 'tds-status--new-lead' },
  [PipelineStatus.CONTACTED]: { label: 'Contacted', className: 'tds-status--contacted' },
  [PipelineStatus.IN_DISCUSSION]: { label: 'In Discussion', className: 'tds-status--in-discussion' },
  [PipelineStatus.PITCHING]: { label: 'Pitching', className: 'tds-status--pitching' },
  [PipelineStatus.NEGOTIATION]: { label: 'Negotiation', className: 'tds-status--negotiation' },
  [PipelineStatus.ON_HOLD]: { label: 'On Hold', className: 'tds-status--on-hold' },
  [PipelineStatus.DEAL]: { label: 'Deal', className: 'tds-status--deal' },
  [PipelineStatus.LOST]: { label: 'Lost', className: 'tds-status--lost' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span role="status" aria-label={`Status: ${config.label}`} className={`tds-status ${config.className}`}>
      {config.label}
    </span>
  );
}
