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
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-label-md text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`m3-select ${error ? 'border-error focus:border-error' : ''} ${className ?? ''}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && (
        <p id={errorId} className="text-body-sm text-error mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}
