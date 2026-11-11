import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'info' | 'brand';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-semibold rounded-md border select-none';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  const variantClasses = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-leaf-50 text-leaf-800 border-leaf-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-sky-50 text-sky-900 border-sky-200',
    brand: 'bg-ceylon-50 text-ceylon-900 border-ceylon-200',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
