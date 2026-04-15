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
    <div className="mb-3">
      {label && <label htmlFor={inputId} className="block text-label-md text-N-300 mb-1">{label}</label>}
      <div
        onClick={() => ref.current?.click()}
        className="flex items-center gap-2.5 px-3 py-2.5 border-2 border-dashed border-N-40 rounded-sm cursor-pointer hover:bg-N-10 transition-colors"
      >
        <IconUpload size={18} className="text-N-200" />
        <span className="text-body-md text-N-200">Klik untuk upload file</span>
      </div>
      <input
        ref={ref} id={inputId} type="file" accept={accept} className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        aria-invalid={!!error} aria-describedby={errorId}
      />
      {error && <p id={errorId} className="text-body-sm text-danger mt-1" role="alert">{error}</p>}
    </div>
  );
}
