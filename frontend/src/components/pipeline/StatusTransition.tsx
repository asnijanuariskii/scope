import React from 'react';
import { PipelineStatus } from '../../types';
import { Select } from '../shared';

const STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.NEW_LEAD]: [PipelineStatus.CONTACTED],
  [PipelineStatus.CONTACTED]: [PipelineStatus.IN_DISCUSSION],
  [PipelineStatus.IN_DISCUSSION]: [PipelineStatus.PITCHING, PipelineStatus.ON_HOLD],
  [PipelineStatus.PITCHING]: [PipelineStatus.NEGOTIATION, PipelineStatus.LOST],
  [PipelineStatus.NEGOTIATION]: [PipelineStatus.DEAL, PipelineStatus.LOST],
  [PipelineStatus.ON_HOLD]: [PipelineStatus.IN_DISCUSSION],
  [PipelineStatus.DEAL]: [],
  [PipelineStatus.LOST]: [],
};

const STATUS_LABELS: Record<PipelineStatus, string> = {
  [PipelineStatus.NEW_LEAD]: 'New Lead',
  [PipelineStatus.CONTACTED]: 'Contacted',
  [PipelineStatus.IN_DISCUSSION]: 'In Discussion',
  [PipelineStatus.PITCHING]: 'Pitching',
  [PipelineStatus.NEGOTIATION]: 'Negotiation',
  [PipelineStatus.ON_HOLD]: 'On Hold',
  [PipelineStatus.DEAL]: 'Deal',
  [PipelineStatus.LOST]: 'Lost',
};

interface StatusTransitionProps {
  currentStatus: PipelineStatus;
  onStatusChange: (newStatus: PipelineStatus) => void;
  disabled?: boolean;
}

export default function StatusTransition({ currentStatus, onStatusChange, disabled = false }: StatusTransitionProps) {
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus] ?? [];
  const options = validNextStatuses.map((s) => ({ value: s, label: STATUS_LABELS[s] }));

  if (validNextStatuses.length === 0) return null;

  return (
    <Select label="Update Status" options={options} placeholder="— Pilih status —"
      onChange={(e) => { if (e.target.value) onStatusChange(e.target.value as PipelineStatus); }}
      disabled={disabled} value="" />
  );
}
