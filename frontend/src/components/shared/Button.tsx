import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: '1px solid #2563eb',
  },
  secondary: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  danger: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: '1px solid #dc2626',
  },
};

const baseStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  transition: 'opacity 0.15s',
};

const disabledStyle: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...(isDisabled ? disabledStyle : {}),
        ...style,
      }}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span aria-hidden="true">⏳</span>}
      {children}
    </button>
  );
}
