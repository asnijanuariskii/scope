import { PipelineStatus } from '@/types';

const config: Record<PipelineStatus, { label: string; cls: string }> = {
  [PipelineStatus.NEW_LEAD]: { label: 'New Lead', cls: 'bg-information-subtle text-information-text' },
  [PipelineStatus.CONTACTED]: { label: 'Contacted', cls: 'bg-success-subtle text-success-text' },
  [PipelineStatus.IN_DISCUSSION]: { label: 'In Discussion', cls: 'bg-warning-subtle text-warning-text' },
  [PipelineStatus.PITCHING]: { label: 'Pitching', cls: 'bg-discovery-subtle text-discovery-text' },
  [PipelineStatus.NEGOTIATION]: { label: 'Negotiation', cls: 'bg-brand-subtlest text-brand-boldest' },
  [PipelineStatus.ON_HOLD]: { label: 'On Hold', cls: 'bg-N-30 text-N-400' },
  [PipelineStatus.DEAL]: { label: 'Deal', cls: 'bg-success-subtle text-success-text' },
  [PipelineStatus.LOST]: { label: 'Lost', cls: 'bg-danger-subtle text-danger-text' },
};

export default function StatusBadge({ status }: { status: PipelineStatus }) {
  const c = config[status];
  return <span className={`ads-lozenge ${c.cls}`}>{c.label}</span>;
}
