import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  size?: 'default' | 'sm';
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  size = 'default',
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = [
    'tds-btn',
    `tds-btn--${variant}`,
    size === 'sm' && 'tds-btn--sm',
    fullWidth && 'tds-btn--full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span aria-hidden="true">⏳</span>}
      {children}
    </button>
  );
}
