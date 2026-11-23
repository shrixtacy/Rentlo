import React from 'react';
import Spinner from './Spinner';

const variantClasses = {
  primary: 'bg-primary text-dark font-semibold hover:bg-primary/90',
  secondary: 'bg-white border border-gray-200 text-dark hover:bg-gray-50',
  danger: 'bg-error text-white hover:bg-error/90',
  ghost: 'text-dark hover:bg-gray-100',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'rounded-full inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
