import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
  error?: string;
  id?: string;
}

const wrapperStyle: React.CSSProperties = {
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

const dropZoneStyle: React.CSSProperties = {
  border: '2px dashed #d1d5db',
  borderRadius: '6px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#f9fafb',
  transition: 'border-color 0.15s',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0 0',
};

const previewStyle: React.CSSProperties = {
  maxWidth: '200px',
  maxHeight: '150px',
  borderRadius: '4px',
  marginTop: '8px',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#dc2626',
  margin: 0,
};

const removeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer',
  marginTop: '8px',
  color: '#dc2626',
};

export default function FileUpload({
  label,
  accept = 'image/jpeg,image/png',
  maxSizeMB = 5,
  onChange,
  error,
  id,
}: FileUploadProps) {
  const inputId = id || `file-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setFileName(null);
      onChange(null);
      return;
    }

    setFileName(file.name);
    onChange(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const handleRemove = () => {
    if (fileRef.current) fileRef.current.value = '';
    handleFile(null);
  };

  return (
    <div style={wrapperStyle}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
      </label>
      <div
        style={dropZoneStyle}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
      >
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-describedby={errorId}
        />
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          {fileName || 'Klik untuk memilih file'}
        </p>
        <p style={hintStyle}>
          Maks {maxSizeMB}MB • {accept.replace(/image\//g, '').toUpperCase()}
        </p>
      </div>
      {preview && (
        <img src={preview} alt="Preview file" style={previewStyle} />
      )}
      {fileName && (
        <button
          type="button"
          onClick={handleRemove}
          style={removeBtnStyle}
          aria-label="Hapus file"
        >
          Hapus file
        </button>
      )}
      {error && (
        <p id={errorId} style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
