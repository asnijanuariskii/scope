import React, { useState, useEffect } from 'react';
import { Select, Input, Button } from '../shared';
import { ActivityType } from '../../types';

export interface ActivityFormData {
  activityType: ActivityType | '';
  notes: string;
  nextFollowUpDate: string;
}

interface ActivityFormProps {
  initialData?: ActivityFormData;
  onSubmit: (data: ActivityFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const ACTIVITY_TYPE_OPTIONS = [
  { value: ActivityType.CALL, label: 'Call' },
  { value: ActivityType.CHAT, label: 'Chat' },
  { value: ActivityType.VISIT, label: 'Visit' },
];

const emptyForm: ActivityFormData = { activityType: '', notes: '', nextFollowUpDate: '' };

export default function ActivityForm({ initialData, onSubmit, onCancel, loading = false }: ActivityFormProps) {
  const [form, setForm] = useState<ActivityFormData>(initialData ?? emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ActivityFormData, string>>>({});

  useEffect(() => { setForm(initialData ?? emptyForm); setErrors({}); }, [initialData]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.activityType) next.activityType = 'Tipe activity wajib dipilih';
    if (!form.notes.trim()) next.notes = 'Notes wajib diisi';
    if (!form.nextFollowUpDate) next.nextFollowUpDate = 'Tanggal follow-up wajib diisi';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit({ activityType: form.activityType, notes: form.notes.trim(), nextFollowUpDate: form.nextFollowUpDate });
  }

  const notesId = 'activity-notes';
  const notesErrorId = errors.notes ? `${notesId}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
      <Select label="Tipe Activity" options={ACTIVITY_TYPE_OPTIONS} value={form.activityType}
        onChange={(e) => { setForm((p) => ({ ...p, activityType: e.target.value as ActivityType | '' })); if (errors.activityType) setErrors((p) => ({ ...p, activityType: undefined })); }}
        error={errors.activityType} placeholder="— Pilih tipe —" />

      <div className="mb-4">
        <label htmlFor={notesId} className="block text-label-md text-on-surface-variant mb-1.5">Notes</label>
        <textarea id={notesId}
          className={`m3-input min-h-[80px] resize-y ${errors.notes ? 'border-error focus:border-error' : ''}`}
          value={form.notes}
          onChange={(e) => { setForm((p) => ({ ...p, notes: e.target.value })); if (errors.notes) setErrors((p) => ({ ...p, notes: undefined })); }}
          placeholder="Catatan activity" aria-invalid={!!errors.notes} aria-describedby={notesErrorId} />
        {errors.notes && <p id={notesErrorId} className="text-body-sm text-error mt-1" role="alert">{errors.notes}</p>}
      </div>

      <Input label="Tanggal Follow-up" type="date" value={form.nextFollowUpDate}
        onChange={(e) => { setForm((p) => ({ ...p, nextFollowUpDate: e.target.value })); if (errors.nextFollowUpDate) setErrors((p) => ({ ...p, nextFollowUpDate: undefined })); }}
        error={errors.nextFollowUpDate} />

      <div className="flex gap-2 mt-2">
        <Button type="submit" loading={loading}>{initialData ? 'Simpan' : 'Tambah Activity'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>}
      </div>
    </form>
  );
}
