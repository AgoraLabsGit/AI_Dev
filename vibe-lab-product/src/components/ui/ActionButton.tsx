'use client';

import { ReactNode } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * PWA-compliant action button
 * - Minimum 44px touch target (size='md')
 * - Clear focus states
 * - Consistent styling
 */
export default function ActionButton({
  onClick,
  disabled = false,
  title,
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: ActionButtonProps) {
  const baseClasses = "rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161618] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "p-1.5 min-w-[36px] min-h-[36px]", // Below PWA standards, use sparingly
    md: "p-2.5 min-w-[44px] min-h-[44px]", // PWA standard minimum
    lg: "p-3 min-w-[48px] min-h-[48px]"
  };

  const variantClasses = {
    default: "bg-transparent hover:bg-[#1C1C1E] text-gray-400 hover:text-white focus:ring-blue-500",
    primary: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      type="button"
    >
      {children}
    </button>
  );
}