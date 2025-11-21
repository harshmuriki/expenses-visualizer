import React from 'react';

export type M3ButtonVariant = 'filled' | 'filled-tonal' | 'outlined' | 'text';
export type M3ButtonSize = 'small' | 'medium' | 'large';

export interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  size?: M3ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const sizeClasses = {
  small: 'px-4 py-1.5 text-xs',
  medium: 'px-6 py-2.5 text-sm',
  large: 'px-8 py-3 text-base',
};

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClass = variant === 'filled'
    ? 'm3-btn-filled'
    : variant === 'filled-tonal'
    ? 'm3-btn-filled-tonal'
    : variant === 'outlined'
    ? 'm3-btn-outlined'
    : 'm3-btn-text';

  return (
    <button
      className={`${baseClass} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default M3Button;
