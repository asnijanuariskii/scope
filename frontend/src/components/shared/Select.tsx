import React from 'react';

interface SelectOption { value: string; label: string; }

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({ label, options, placeholder = '— Pilih —', error, id, className = '', ...rest }: SelectProps) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="tds-field">
      <label htmlFor={selectId} className="tds-field__label">{label}</label>
      <select
        id={selectId}
        className={`tds-field__select ${error ? 'tds-field__select--error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p id={errorId} className="tds-field__error" role="alert">{error}</p>}
    </div>
  );
}
