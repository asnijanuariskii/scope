import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, error, options, placeholder, id, className, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={selectId} className="block text-label-md text-N-300 mb-2">{label}</label>
      )}
      <select
        id={selectId}
        className={`ads-select ${error ? 'border-danger focus:border-danger' : ''} ${className ?? ''}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p id={errorId} className="text-body-sm text-danger mt-1" role="alert">{error}</p>}
    </div>
  );
}
