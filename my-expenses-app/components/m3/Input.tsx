import React, { forwardRef } from 'react';

export type M3InputVariant = 'filled' | 'outlined';

export interface M3InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: M3InputVariant;
  label?: string;
  helperText?: string;
  error?: boolean;
}

export const M3Input = forwardRef<HTMLInputElement, M3InputProps>(({
  variant = 'filled',
  label,
  helperText,
  error = false,
  className = '',
  ...props
}, ref) => {
  const variantClass = variant === 'outlined' ? 'm3-input-outlined' : 'm3-input-filled';

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium" style={{
          color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'
        }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`${variantClass} ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {helperText && (
        <p className="mt-2 text-xs" style={{
          color: error ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'
        }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

M3Input.displayName = 'M3Input';

export default M3Input;
