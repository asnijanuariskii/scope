import { PipelineStatus } from '@/types';

const config: Record<PipelineStatus, { label: string; cls: string }> = {
  [PipelineStatus.NEW_LEAD]: { label: 'New Lead', cls: 'bg-primary-container text-primary-on-container' },
  [PipelineStatus.CONTACTED]: { label: 'Contacted', cls: 'bg-tertiary-container text-tertiary-on-container' },
  [PipelineStatus.IN_DISCUSSION]: { label: 'In Discussion', cls: 'bg-y-100 text-tertiary-on-container' },
  [PipelineStatus.PITCHING]: { label: 'Pitching', cls: 'bg-violet-50 text-violet-700' },
  [PipelineStatus.NEGOTIATION]: { label: 'Negotiation', cls: 'bg-orange-50 text-orange-700' },
  [PipelineStatus.ON_HOLD]: { label: 'On Hold', cls: 'bg-surface-container-highest text-on-surface-variant' },
  [PipelineStatus.DEAL]: { label: 'Deal', cls: 'bg-g-100 text-g-500' },
  [PipelineStatus.LOST]: { label: 'Lost', cls: 'bg-error-container text-error' },
};

export default function StatusBadge({ status }: { status: PipelineStatus }) {
  const c = config[status];
  return <span className={`m3-badge ${c.cls}`}>{c.label}</span>;
}
