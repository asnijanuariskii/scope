import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
  error?: string;
  id?: string;
}

export default function FileUpload({ label, accept = 'image/jpeg,image/png', maxSizeMB = 5, onChange, error, id }: FileUploadProps) {
  const inputId = id || `file-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) { setPreview(null); setFileName(null); onChange(null); return; }
    setFileName(file.name);
    onChange(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else { setPreview(null); }
  };

  return (
    <div className="tds-upload">
      <label htmlFor={inputId} className="tds-field__label">{label}</label>
      <div
        className="tds-upload__dropzone"
        onClick={() => fileRef.current?.click()}
        role="button" tabIndex={0} aria-label={`Upload ${label}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
      >
        <input ref={fileRef} id={inputId} type="file" accept={accept} onChange={(e) => handleFile(e.target.files?.[0] || null)} style={{ display: 'none' }} aria-describedby={errorId} />
        <p style={{ margin: 0, color: 'var(--text-low-emphasis)' }}>{fileName || 'Klik untuk memilih file'}</p>
        <p className="tds-upload__hint">Maks {maxSizeMB}MB • {accept.replace(/image\//g, '').toUpperCase()}</p>
      </div>
      {preview && <img src={preview} alt="Preview file" className="tds-upload__preview" />}
      {fileName && <button type="button" onClick={() => { if (fileRef.current) fileRef.current.value = ''; handleFile(null); }} className="tds-upload__remove" aria-label="Hapus file">Hapus file</button>}
      {error && <p id={errorId} className="tds-field__error" role="alert">{error}</p>}
    </div>
  );
}
