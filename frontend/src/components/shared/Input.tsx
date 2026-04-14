import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
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

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#dc2626',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#dc2626',
  margin: 0,
};

export default function Input({ label, error, id, style, ...rest }: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div style={wrapperStyle}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
      </label>
      <input
        id={inputId}
        style={{ ...(error ? inputErrorStyle : inputStyle), ...style }}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p id={errorId} style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
