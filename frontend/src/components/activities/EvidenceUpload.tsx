import React, { useState, useCallback } from 'react';
import FileUpload from '../shared/FileUpload';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface EvidenceUploadProps {
  onChange: (file: File | null) => void;
  label?: string;
  id?: string;
}

export default function EvidenceUpload({
  onChange,
  label = 'Evidence',
  id,
}: EvidenceUploadProps) {
  const [error, setError] = useState<string | undefined>();

  const handleChange = useCallback(
    (file: File | null) => {
      if (!file) {
        setError(undefined);
        onChange(null);
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('File harus berformat JPG atau PNG');
        onChange(null);
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError('Ukuran file maksimal adalah 5MB');
        onChange(null);
        return;
      }

      setError(undefined);
      onChange(file);
    },
    [onChange],
  );

  return (
    <FileUpload
      label={label}
      accept="image/jpeg,image/png"
      maxSizeMB={MAX_SIZE_MB}
      onChange={handleChange}
      error={error}
      id={id}
    />
  );
}
