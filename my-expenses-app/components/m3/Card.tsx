import React from 'react';

export type M3CardVariant = 'filled' | 'elevated' | 'outlined';

export interface M3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: M3CardVariant;
  children: React.ReactNode;
}

export const M3Card: React.FC<M3CardProps> = ({
  variant = 'filled',
  children,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'elevated' ? 'm3-card-elevated' :
    variant === 'outlined' ? 'm3-card-outlined' :
    'm3-card-filled';

  return (
    <div className={`${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default M3Card;
