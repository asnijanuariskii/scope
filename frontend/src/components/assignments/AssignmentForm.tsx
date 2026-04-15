import React, { useState } from 'react';
import { Select, Input, Button } from '../shared';

export interface AssignmentFormData { picId: string; reassignedNotes?: string; }
interface PicOption { value: string; label: string; }
interface AssignmentFormProps { picOptions: PicOption[]; onSubmit: (data: AssignmentFormData) => void; onCancel?: () => void; loading?: boolean; isReassign?: boolean; }

export default function AssignmentForm({ picOptions, onSubmit, onCancel, loading = false, isReassign = false }: AssignmentFormProps) {
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
    if (validate()) onSubmit({ picId, ...(isReassign ? { reassignedNotes: reassignedNotes.trim() } : {}) });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Select label="PIC" options={picOptions} value={picId}
        onChange={(e) => { setPicId(e.target.value); if (errors.picId) setErrors((p) => ({ ...p, picId: undefined })); }}
        placeholder="— Pilih PIC —" error={errors.picId} />
      {isReassign && (
        <Input label="Catatan Reassign" value={reassignedNotes}
          onChange={(e) => { setReassignedNotes(e.target.value); if (errors.reassignedNotes) setErrors((p) => ({ ...p, reassignedNotes: undefined })); }}
          placeholder="Alasan reassign" error={errors.reassignedNotes} />
      )}
      <div className="flex gap-2 mt-3">
        <Button type="submit" loading={loading}>{isReassign ? 'Reassign' : 'Assign'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>}
      </div>
    </form>
  );
}
