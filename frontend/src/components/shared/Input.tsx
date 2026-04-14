import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="tds-field">
      <label htmlFor={inputId} className="tds-field__label">{label}</label>
      <input
        id={inputId}
        className={`tds-field__input ${error ? 'tds-field__input--error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...rest}
      />
      {error && <p id={errorId} className="tds-field__error" role="alert">{error}</p>}
    </div>
  );
}
