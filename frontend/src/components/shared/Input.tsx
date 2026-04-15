import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="block text-label-md text-N-300 mb-2">
          {label}{props.required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${error ? 'ads-input-error' : 'ads-input'} ${className ?? ''}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && <p id={errorId} className="text-body-sm text-danger mt-1" role="alert">{error}</p>}
    </div>
  );
}
