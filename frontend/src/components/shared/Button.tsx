import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  loading?: boolean;
}

const variantClass: Record<string, string> = {
  primary: 'ads-btn',
  secondary: 'ads-btn-default',
  text: 'ads-btn-subtle',
  danger: 'ads-btn-danger',
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
