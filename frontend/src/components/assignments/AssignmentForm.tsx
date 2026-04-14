import React, { useState } from 'react';
import { Select, Input, Button } from '../shared';

export interface AssignmentFormData {
  picId: string;
  reassignedNotes?: string;
}

interface PicOption {
  value: string;
  label: string;
}

interface AssignmentFormProps {
  picOptions: PicOption[];
  onSubmit: (data: AssignmentFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  /** When true, shows the reassign notes field */
  isReassign?: boolean;
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
};

export default function AssignmentForm({
  picOptions,
  onSubmit,
  onCancel,
  loading = false,
  isReassign = false,
}: AssignmentFormProps) {
  const [picId, setPicId] = useState('');
  const [reassignedNotes, setReassignedNotes] = useState('');
  const [errors, setErrors] = useState<{ picId?: string; reassignedNotes?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!picId) next.picId = 'PIC wajib dipilih';
    if (isReassign && !reassignedNotes.trim()) next.reassignedNotes = 'Catatan reassign wajib diisi';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        picId,
        ...(isReassign ? { reassignedNotes: reassignedNotes.trim() } : {}),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <Select
        label="PIC"
        options={picOptions}
        value={picId}
        onChange={(e) => {
          setPicId(e.target.value);
          if (errors.picId) setErrors((prev) => ({ ...prev, picId: undefined }));
        }}
        placeholder="— Pilih PIC —"
        error={errors.picId}
      />
      {isReassign && (
        <Input
          label="Catatan Reassign"
          value={reassignedNotes}
          onChange={(e) => {
            setReassignedNotes(e.target.value);
            if (errors.reassignedNotes) setErrors((prev) => ({ ...prev, reassignedNotes: undefined }));
          }}
          placeholder="Alasan reassign"
          error={errors.reassignedNotes}
        />
      )}
      <div style={actionsStyle}>
        <Button type="submit" loading={loading}>
          {isReassign ? 'Reassign' : 'Assign'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
