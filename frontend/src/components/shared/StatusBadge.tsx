import { PipelineStatus } from '@/types';

const config: Record<PipelineStatus, { label: string; cls: string }> = {
  [PipelineStatus.NEW_LEAD]: { label: 'New Lead', cls: 'bg-b-100 text-b-400' },
  [PipelineStatus.CONTACTED]: { label: 'Contacted', cls: 'bg-emerald-50 text-emerald-700' },
  [PipelineStatus.IN_DISCUSSION]: { label: 'In Discussion', cls: 'bg-y-100 text-amber-700' },
  [PipelineStatus.PITCHING]: { label: 'Pitching', cls: 'bg-violet-50 text-violet-700' },
  [PipelineStatus.NEGOTIATION]: { label: 'Negotiation', cls: 'bg-orange-50 text-orange-700' },
  [PipelineStatus.ON_HOLD]: { label: 'On Hold', cls: 'bg-n-100 text-n-600' },
  [PipelineStatus.DEAL]: { label: 'Deal', cls: 'bg-g-100 text-g-500' },
  [PipelineStatus.LOST]: { label: 'Lost', cls: 'bg-r-100 text-r-400' },
};

export default function StatusBadge({ status }: { status: PipelineStatus }) {
  const c = config[status];
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>;
}
