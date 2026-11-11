import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ceylon-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-ceylon-700 hover:bg-ceylon-800 text-white shadow-xs active:bg-ceylon-900',
    secondary:
      'bg-ink-900 hover:bg-black text-white shadow-xs active:bg-ink-950',
    outline:
      'bg-white hover:bg-stone-50 text-ink-900 border border-stone-300 shadow-xs active:bg-stone-100',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-700 hover:text-ink-950 active:bg-stone-200',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white shadow-xs active:bg-rose-900',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
