import React from 'react';

export type M3FABVariant = 'primary' | 'secondary' | 'tertiary';
export type M3FABSize = 'small' | 'medium' | 'large';

export interface M3FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3FABVariant;
  size?: M3FABSize;
  icon: React.ReactNode;
  label?: string;
  extended?: boolean;
}

const sizeClasses = {
  small: 'w-10 h-10',
  medium: 'w-14 h-14',
  large: 'w-24 h-24',
};

export const M3FAB: React.FC<M3FABProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  label,
  extended = false,
  className = '',
  ...props
}) => {
  if (extended && label) {
    return (
      <button className={`m3-fab-extended ${className}`} {...props}>
        <span className="inline-flex text-xl">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      className={`m3-fab ${sizeClasses[size]} ${className}`}
      aria-label={label}
      {...props}
    >
      <span className="inline-flex text-2xl">{icon}</span>
    </button>
  );
};

export default M3FAB;
