import React from 'react';

export default function Input({ label, error, icon, type = 'text', placeholder, className = '', ...rest }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-dark">{label}</label>
      )}
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={[
            'rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full px-4 py-3 bg-white text-dark placeholder:text-muted transition-all',
            icon ? 'pl-10' : '',
            error ? 'border-error focus:border-error focus:ring-error/20' : '',
            className,
          ].join(' ')}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}
