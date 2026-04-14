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

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const textareaWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
};

const textareaStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
  resize: 'vertical',
  minHeight: '80px',
  fontFamily: 'inherit',
};

const textareaErrorStyle: React.CSSProperties = {
  ...textareaStyle,
  borderColor: '#dc2626',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#dc2626',
  margin: 0,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
};

const ACTIVITY_TYPE_OPTIONS = [
  { value: ActivityType.CALL, label: 'Call' },
  { value: ActivityType.CHAT, label: 'Chat' },
  { value: ActivityType.VISIT, label: 'Visit' },
];

const emptyForm: ActivityFormData = {
  activityType: '',
  notes: '',
  nextFollowUpDate: '',
};

export default function ActivityForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ActivityFormProps) {
  const [form, setForm] = useState<ActivityFormData>(initialData ?? emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ActivityFormData, string>>>({});

  useEffect(() => {
    setForm(initialData ?? emptyForm);
    setErrors({});
  }, [initialData]);

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
    if (validate()) {
      onSubmit({
        activityType: form.activityType,
        notes: form.notes.trim(),
        nextFollowUpDate: form.nextFollowUpDate,
      });
    }
  }

  const notesId = 'activity-notes';
  const notesErrorId = errors.notes ? `${notesId}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <Select
        label="Tipe Activity"
        options={ACTIVITY_TYPE_OPTIONS}
        value={form.activityType}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, activityType: e.target.value as ActivityType | '' }));
          if (errors.activityType) setErrors((prev) => ({ ...prev, activityType: undefined }));
        }}
        error={errors.activityType}
        placeholder="— Pilih tipe —"
      />

      <div style={textareaWrapperStyle}>
        <label htmlFor={notesId} style={labelStyle}>
          Notes
        </label>
        <textarea
          id={notesId}
          style={errors.notes ? textareaErrorStyle : textareaStyle}
          value={form.notes}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, notes: e.target.value }));
            if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
          }}
          placeholder="Catatan activity"
          aria-invalid={!!errors.notes}
          aria-describedby={notesErrorId}
        />
        {errors.notes && (
          <p id={notesErrorId} style={errorTextStyle} role="alert">
            {errors.notes}
          </p>
        )}
      </div>

      <Input
        label="Tanggal Follow-up"
        type="date"
        value={form.nextFollowUpDate}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, nextFollowUpDate: e.target.value }));
          if (errors.nextFollowUpDate) setErrors((prev) => ({ ...prev, nextFollowUpDate: undefined }));
        }}
        error={errors.nextFollowUpDate}
      />

      <div style={actionsStyle}>
        <Button type="submit" loading={loading}>
          {initialData ? 'Simpan' : 'Tambah Activity'}
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
