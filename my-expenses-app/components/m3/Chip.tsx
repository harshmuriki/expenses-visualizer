import React from 'react';

export type M3ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';

export interface M3ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ChipVariant;
  icon?: React.ReactNode;
  selected?: boolean;
  children: React.ReactNode;
  onDelete?: () => void;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  variant = 'assist',
  icon,
  selected = false,
  children,
  onDelete,
  className = '',
  ...props
}) => {
  const baseClass = selected ? 'm3-chip-filled' : 'm3-chip';

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {icon && <span className="inline-flex text-lg">{icon}</span>}
      <span>{children}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="inline-flex ml-1 hover:opacity-70"
          aria-label="Remove"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
          </svg>
        </button>
      )}
    </button>
  );
};

export default M3Chip;
