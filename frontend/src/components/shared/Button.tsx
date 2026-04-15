import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
}

const variantClass: Record<string, string> = {
  primary: 'm3-btn-filled',
  secondary: 'm3-btn-outlined',
  text: 'm3-btn-text',
};

export default function Button({ variant = 'primary', loading, children, disabled, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${className ?? ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
