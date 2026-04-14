import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
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

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const selectErrorStyle: React.CSSProperties = {
  ...selectStyle,
  borderColor: '#dc2626',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#dc2626',
  margin: 0,
};

export default function Select({
  label,
  options,
  placeholder = '— Pilih —',
  error,
  id,
  style,
  ...rest
}: SelectProps) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div style={wrapperStyle}>
      <label htmlFor={selectId} style={labelStyle}>
        {label}
      </label>
      <select
        id={selectId}
        style={{ ...(error ? selectErrorStyle : selectStyle), ...style }}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
