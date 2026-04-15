import React, { useRef } from 'react';
import { IconUpload } from '@tabler/icons-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
  error?: string;
  id?: string;
}

export default function FileUpload({ label, accept, onChange, error, id }: FileUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const inputId = id || 'file-upload';
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="mb-4">
      {label && <label htmlFor={inputId} className="block text-label-md text-on-surface-variant mb-1.5">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        className="flex items-center gap-3 px-4 py-3 border border-dashed border-outline rounded-md cursor-pointer hover:bg-on-surface/4 transition-colors"
      >
        <IconUpload size={20} className="text-on-surface-variant" />
        <span className="text-body-md text-on-surface-variant">Klik untuk upload file</span>
      </div>
      <input
        ref={ref}
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      {error && <p id={errorId} className="text-body-sm text-error mt-1" role="alert">{error}</p>}
    </div>
  );
}
